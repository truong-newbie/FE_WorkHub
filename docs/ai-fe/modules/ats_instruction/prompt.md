Bạn là Senior Backend/AI Engineer. Hãy nâng cấp chức năng ATS Resume Screening trong dự án WorkHub để AI Worker tính được `semantic_score` thật bằng embedding, thay vì luôn trả `0.0`.

TRƯỚC KHI CODE, BẮT BUỘC ĐỌC KỸ:

1. Toàn bộ luật/tài liệu trong thư mục:
   - `docs/ai`
   - `docs/ai-fe`
   - nếu có: `AI_Context.md`, `CLAUDE.md`, `README.md`

2. Các tài liệu liên quan đến:
   - project architecture
   - coding convention
   - backend convention
   - AI worker convention
   - API contract
   - error handling convention
   - environment/setup
   - Docker/docker-compose
   - testing convention

3. Các file hiện có của AI worker:
   - `ai-worker/app/main.py`
   - `ai-worker/app/services/skill_service.py`
   - `ai-worker/app/services/document_parsing_service.py` nếu có
   - `ai-worker/app/services/*`
   - `ai-worker/app/models/*`
   - `ai-worker/app/schemas/*`
   - `ai-worker/requirements.txt`
   - `.env` hoặc config liên quan nếu có

4. Các file backend gọi sang AI worker:
   - service/client gọi AI worker trong Spring Boot hoặc Quarkus
   - DTO request/response của ATS screening
   - controller/service liên quan đến ATS Resume Screening
   - entity lưu kết quả screening nếu có

QUY TẮC BẮT BUỘC:
- Không tạo architecture mới nếu project đã có convention.
- Không đổi endpoint hiện có nếu không bắt buộc.
- Không phá response contract cũ.
- Không dùng mock cho scoring.
- Không hardcode dữ liệu test.
- Không xóa keyword scoring hiện tại.
- Phải giữ keyword scoring và bổ sung semantic scoring.
- `semantic_score` phải được tính thật bằng embedding.
- Nếu embedding model lỗi hoặc chưa load được, phải fail rõ ràng hoặc fallback có kiểm soát, không âm thầm trả điểm giả.
- Code phải dễ test, dễ maintain, tách service rõ ràng.
- Cập nhật tài liệu sau khi làm xong.

MỤC TIÊU:
Hiện tại AI worker đã parse CV thật và match skill thật trong:
`ai-worker/app/services/skill_service.py`

Nhưng:
`semantic_score = 0.0`

Cần nâng cấp thành:

1. Parse CV text.
2. Lấy job description / job requirements / required skills từ request.
3. Tính keyword_score như hiện tại.
4. Tính semantic_score bằng embedding.
5. Tính final_score từ nhiều thành phần.
6. Trả response đầy đủ cho backend.
7. Backend lưu/hiển thị được điểm mới nếu đã có field.

CÁCH LÀM ĐỀ XUẤT:

A. Thêm Embedding Service trong AI Worker

Tạo service mới, ví dụ:

`ai-worker/app/services/embedding_service.py`

Service này chịu trách nhiệm:
- Load embedding model một lần khi app chạy hoặc lazy load.
- Convert text thành vector.
- Tính cosine similarity.
- Convert similarity thành score từ 0 đến 100.

Model đề xuất:
- Ưu tiên local model:
  `sentence-transformers/all-MiniLM-L6-v2`

Cài thư viện:
- Cập nhật `ai-worker/requirements.txt`:

```txt
sentence-transformers
scikit-learn
numpy

Hoặc nếu project đã có thư viện tương đương thì dùng convention hiện tại.

Embedding logic mẫu:

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    def calculate_similarity_score(self, resume_text: str, job_text: str) -> float:
        if not resume_text or not job_text:
            return 0.0

        vectors = self.model.encode([resume_text, job_text])
        similarity = cosine_similarity([vectors[0]], [vectors[1]])[0][0]

        score = max(0.0, min(float(similarity) * 100, 100.0))
        return round(score, 2)

Tuy nhiên khi code thật, phải follow style hiện có của AI worker.

B. Chuẩn hóa text đầu vào

Trước khi embedding, tạo hoặc dùng util hiện có để normalize text:

lowercase nếu cần
remove extra spaces
remove broken unicode nếu có
giới hạn độ dài text nếu quá dài
không làm mất nội dung quan trọng

Job text nên ghép từ:

job title
job description
job requirements
required skills
experience level

Resume text lấy từ CV parsed text.

Ví dụ:

job_text = f"""
Title: {job_title}
Description: {job_description}
Requirements: {requirements}
Skills: {', '.join(required_skills)}
Experience: {experience_level}
"""

Nếu request hiện tại chưa có đủ job fields thì:

Đọc DTO/schema hiện có.
Chỉ dùng những field thật sự tồn tại.
Không tự bịa field.
Nếu thiếu job description, dùng required skills làm job text.

C. Tính semantic_score

Semantic score là điểm so khớp ý nghĩa giữa CV và job.

Công thức:

semantic_score = cosine_similarity(resume_embedding, job_embedding) * 100

Giới hạn:

0 <= semantic_score <= 100

D. Kết hợp điểm

Không xóa keyword score hiện có.

Công thức đề xuất:

final_score = keyword_score * 0.6 + semantic_score * 0.4

Nếu project đã có overall_score, match_score, ats_score thì dùng đúng tên field hiện có.

Nếu có thêm experience score thì có thể dùng:

final_score = keyword_score * 0.5 + semantic_score * 0.35 + experience_score * 0.15

Nhưng chỉ thêm experience_score nếu code hiện tại đã có logic đó hoặc tài liệu yêu cầu.

E. Response cần có

Response AI worker nên trả các field như:

{
  "keywordScore": 72.5,
  "semanticScore": 81.2,
  "finalScore": 76.0,
  "matchedSkills": ["Java", "Spring Boot", "MySQL"],
  "missingSkills": ["Docker", "Redis"],
  "recommendation": "CONSIDER",
  "summary": "Candidate matches most backend requirements but lacks Docker and Redis."
}

Lưu ý:

Dùng đúng naming convention hiện tại: camelCase hoặc snake_case theo project.
Nếu response cũ đang dùng keyword_score, semantic_score, final_score thì giữ nguyên.
Không đổi field khiến backend bị lỗi.

F. Backend Integration

Kiểm tra backend đang gọi AI worker ở đâu.

Cần đảm bảo:

Request gửi sang AI worker có đủ CV text hoặc file URL.
Request có đủ job description / required skills.
Response mapping nhận được semantic_score.
Entity/DTO lưu được semantic score nếu đã có field.
Nếu chưa có field trong DB, cân nhắc:
nếu đã có semanticScore trong DTO/entity thì map vào
nếu chưa có, thêm migration/schema update theo convention project
không tự thêm field DB nếu project chưa cần hoặc chưa có guideline

G. Error Handling

Các lỗi cần xử lý:

CV không parse được text.
Job text rỗng.
Embedding model load fail.
Input quá dài.
AI worker timeout.
Backend gọi AI worker fail.

Không được trả điểm giả kiểu:

semantic_score = 0.0

trừ khi thật sự không có text đầu vào và phải có reason rõ ràng.

Có thể response thêm:

{
  "semanticScore": 0.0,
  "semanticStatus": "SKIPPED",
  "semanticReason": "Job description is empty"
}

Chỉ thêm field này nếu không phá contract hoặc backend cho phép.

H. Performance

Yêu cầu:

Model không được load lại mỗi request.
Load model singleton/global/lazy singleton.
Với CV dài, cần truncate hợp lý.
Không encode từng skill riêng lẻ nếu chưa cần.
Log thời gian xử lý nếu project có logging convention.

Gợi ý:

Giới hạn resume text khoảng 4000–8000 ký tự đầu tiên hoặc chunking nếu muốn tốt hơn.
Nếu dùng chunking:
chia CV thành nhiều chunk
tính similarity từng chunk với job
lấy max hoặc average top-k
Bản đầu tiên có thể dùng full normalized text nếu đơn giản.

I. Testing

Cần test ít nhất:

CV có skill trùng keyword:
keyword_score cao
semantic_score cũng hợp lý

CV không trùng keyword nhưng gần nghĩa:
Job:
Spring Security, JWT, REST API

CV:
Implemented secure backend authentication and token-based authorization for web services

Kỳ vọng:

keyword_score có thể thấp
semantic_score phải cao hơn keyword_score

CV không liên quan:
Job backend Java
CV marketing/sales

Kỳ vọng:

semantic_score thấp
final_score thấp
Missing job description:
Không crash
Có fallback sang required skills nếu có
Empty CV text:
Không crash
Trả lỗi hoặc semantic score skipped rõ ràng

J. API Test

Sau khi code, chạy AI worker:

cd ai-worker
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Test endpoint hiện có của AI worker, ví dụ:

POST http://localhost:8000/api/v1/ai/resume/analyze

Body theo schema thật trong project.

Sau đó test từ backend:

POST /api/v1/recruiter/screenings

hoặc endpoint ATS hiện có trong backend.

K. Documentation Update

Sau khi hoàn thành, cập nhật tài liệu trong:

docs/ai
docs/ai-fe nếu FE cần hiển thị semantic score
AI_Context.md nếu project đang dùng file này

Nội dung cần cập nhật:

AI Worker đã dùng embedding thật.
Model đang dùng: sentence-transformers/all-MiniLM-L6-v2.
semantic_score không còn cố định 0.0.
Công thức final score.
Cách chạy AI worker.
Các dependency mới.
Các lỗi/fallback có thể xảy ra.
API response field liên quan.

L. Definition of Done

Chỉ coi là xong khi:

semantic_score được tính thật bằng embedding.
Không còn hardcode semantic_score = 0.0.
Keyword scoring cũ vẫn hoạt động.
Final score kết hợp keyword + semantic.
AI worker chạy được bằng uvicorn.
Backend nhận được semantic score.
Test được ít nhất 3 case:
CV match mạnh.
CV gần nghĩa nhưng ít trùng keyword.
CV không liên quan.
Không phá API contract cũ.
Đã update docs.
Đã ghi rõ file nào đã thay đổi.