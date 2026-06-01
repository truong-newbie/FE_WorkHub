# Huong Dan Nang Cap ATS Semantic Scoring Bang Embedding

Tai lieu nay giai thich nhung thay doi da duoc thuc hien de WorkHub ATS Resume
Screening tinh `semantic_score` that bang embedding thay vi luon tra `0.0`.

## 1. Muc tieu

ATS can danh gia CV theo hai thanh phan:

1. `skill_score`: so khop keyword ky nang.
2. `semantic_score`: so khop y nghia giua noi dung CV va mo ta cong viec.

Diem tong:

```text
final_score = skill_score * 0.60 + semantic_score * 0.40
```

Vi du:

```text
skill_score    = 75.0
semantic_score = 77.7
final_score    = 75.0 * 0.60 + 77.7 * 0.40 = 76.08
```

## 2. Luong Xu Ly Hoan Chinh

Luot xu ly ATS bat dau khi recruiter queue screening:

```http
POST /api/v1/recruiter/applications/{applicationId}/screen
Authorization: Bearer <recruiter_access_token>
```

Luong backend:

```text
Recruiter request
  -> JobApplicationController
  -> JobApplicationServiceImpl
  -> publish AtsScreeningJobMessage vao RabbitMQ
  -> AtsScreeningQueueConsumer
  -> ScreeningServiceImpl
  -> AiWorkerClientImpl
  -> POST /api/v1/ai/resume/analyze
  -> FastAPI AI worker
  -> ScreeningResult duoc luu vao MySQL
  -> application status = SCREENED
  -> gui notification ATS_SCREENING_COMPLETED
```

FE doc ket qua:

```http
GET /api/v1/recruiter/applications/{applicationId}/screening-result
GET /api/v1/recruiter/jobs/{jobId}/screening-results
```

## 3. AI Worker Truoc Khi Nang Cap

Truoc day AI worker da:

- Doc file PDF bang `pdfplumber`.
- Decode file text khong phai PDF.
- Tim keyword ky nang.
- Tinh `skill_score`.

Nhung semantic scoring chi la placeholder:

```python
def calculate_semantic_score(_: str, __: str) -> float:
    return 0.0
```

Vi vay ATS chua the danh gia cac CV dung tu khac nhau nhung co cung y nghia.

## 4. Embedding La Gi?

Embedding model chuyen mot doan van thanh vector so:

```text
"Java Spring Boot backend developer"
  -> [0.13, -0.42, 0.81, ...]
```

Hai doan van co y nghia gan nhau se co vector gan nhau.

WorkHub dung model local:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Model nay chay local, khong can goi OpenAI API.

Do tuong dong duoc tinh bang cosine similarity:

```text
similarity = dot(resumeVector, jobVector)
             / (norm(resumeVector) * norm(jobVector))
```

Sau do doi thanh diem:

```text
semantic_score = clamp(similarity * 100, 0, 100)
```

## 5. Cac Service Moi Trong AI Worker

### 5.1. `embedding_service.py`

File:

```text
ai-worker/app/services/embedding_service.py
```

Nhiem vu:

- Lazy-load embedding model mot lan.
- Normalize Unicode va whitespace.
- Truncate text qua dai.
- Encode resume text va job text.
- Tinh cosine similarity.
- Tra loi ro rang khi model khong load duoc.

Model khong duoc load lai moi request:

```python
@lru_cache(maxsize=1)
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
```

Do dai text mac dinh:

```text
8000 characters
```

Co the override bang env:

```text
AI_WORKER_EMBEDDING_MODEL
AI_WORKER_MAX_TEXT_LENGTH
```

### 5.2. `scoring_service.py`

File:

```text
ai-worker/app/services/scoring_service.py
```

Nhiem vu:

- Tinh keyword skill score.
- Tinh final score.
- Giu weight tap trung o mot noi de de thay doi sau nay.

```python
SKILL_WEIGHT = 0.6
SEMANTIC_WEIGHT = 0.4
```

### 5.3. `analysis_service.py`

File:

```text
ai-worker/app/services/analysis_service.py
```

Nhiem vu:

- Ghep job text.
- Tim matched, missing va extra skills.
- Tinh `skill_score`.
- Goi semantic calculator.
- Tinh `final_score`.
- Tao summary.

Tach service nhu vay giup `main.py` chi phu trach HTTP request/response.

## 6. Input Cua AI Worker

Endpoint noi bo:

```http
POST /api/v1/ai/resume/analyze
Content-Type: multipart/form-data
```

Form fields:

| Field | Required | Mo ta |
| --- | --- | --- |
| `file` | Yes | File CV |
| `job_description` | Yes | Text cong viec da ghep tu backend |
| `required_skills` | No | Danh sach skill cach nhau boi dau phay |

Backend tao job text tu cac field co that trong entity `Job`:

```text
Title
Description
Requirements
Benefits
Experience level
Experience years
```

Neu job description ngan, `required_skills` van duoc dua vao job text lam
fallback.

## 7. Output Cua AI Worker

AI worker giu field cu va them field moi:

```json
{
  "raw_text": "Backend engineer...",
  "resume_skills": ["Java", "Spring Boot", "Docker", "MySQL"],
  "job_skills": ["Java", "Spring Boot", "Docker", "Kafka"],
  "matched_skills": ["Java", "Spring Boot", "Docker"],
  "missing_skills": ["Kafka"],
  "extra_skills": ["MySQL"],
  "skill_score": 75.0,
  "semantic_score": 77.7,
  "final_score": 76.08,
  "semantic_status": "CALCULATED",
  "semantic_reason": null,
  "ai_summary": "ATS score 76.08. Matched skills: Java, Spring Boot, Docker. Missing skills: Kafka."
}
```

`final_score`, `semantic_status` va `semantic_reason` la field bo sung. Backend
cu van co the tiep tuc doc cac field cu.

## 8. Backend Integration

### 8.1. Gui Skill Sang AI Worker

File:

```text
src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java
```

Backend gui:

```java
body.add("job_description", jobDescription);
body.add("required_skills", String.join(",", jobSkills));
body.add("file", resumeFile);
```

### 8.2. Timeout

Backend khong doi vo han neu AI worker gap van de:

```text
connect timeout = 10 seconds
read timeout    = 90 seconds
```

### 8.3. Mapping Response

DTO Java nhan them:

```text
finalScore
semanticStatus
semanticReason
```

Entity `ScreeningResult` da co san:

```text
skillScore
semanticScore
totalScore
```

Khong can migration database.

### 8.4. Backward Compatibility

Neu AI worker moi tra `final_score`, backend uu tien dung gia tri nay.

Neu backend ket noi worker cu chua co `final_score`, backend van tu tinh:

```text
skillScore * 0.60 + semanticScore * 0.40
```

## 9. Error Handling

AI worker khong am tham tra diem gia khi co loi.

| Truong hop | HTTP status |
| --- | --- |
| Parsed CV text rong | `422` |
| Job text rong | `422` |
| File CV parse loi | `422` |
| Embedding model load hoac encode loi | `503` |

Backend map loi AI worker thanh business error:

```text
exception.ai.worker.unavailable
```

RabbitMQ consumer se throw exception de retry va dua message vao DLQ neu het
so lan retry.

## 10. Docker

AI inference chi can CPU. Dockerfile cai PyTorch CPU-only:

```dockerfile
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
```

Docker Compose cache model Hugging Face:

```yaml
volumes:
  - ai_worker_model_cache:/root/.cache/huggingface
```

Lan dau model se duoc tai. Cac lan recreate container sau dung lai cache.

## 11. Cach Chay

Build va chay AI worker:

```powershell
docker compose build ai-worker
docker compose up -d ai-worker
docker compose ps ai-worker
```

Xem log:

```powershell
docker compose logs -f ai-worker
```

Test endpoint worker:

```powershell
curl.exe -X POST "http://localhost:8000/api/v1/ai/resume/analyze" `
  -F "file=@C:\duong-dan\cv.pdf" `
  -F "job_description=Backend engineer building secure REST APIs" `
  -F "required_skills=Java,Spring Boot,Docker,Kafka"
```

Chay worker truc tiep khong qua Docker:

```powershell
cd ai-worker
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 12. Cach Test

Python unit tests:

```powershell
cd ai-worker
python -m unittest discover -s tests -v
```

Integration test tai va chay model that:

```powershell
$env:RUN_EMBEDDING_INTEGRATION_TESTS="true"
python -m unittest tests.test_embedding_service.RealEmbeddingIntegrationTest -v
```

Java tests:

```powershell
.\mvnw.cmd test
```

Build backend:

```powershell
.\mvnw.cmd clean package -DskipTests
```

## 13. Test Case Da Co

Python test gom:

- CV match manh keyword.
- CV it trung keyword nhung gan nghia.
- CV marketing khong lien quan den backend.
- Job description rong fallback sang required skills.
- CV rong tra loi ro rang.
- Normalize va truncate input.
- Integration test dung model that.

Java test gom:

- Backend uu tien `final_score` cua worker moi.
- Backend van tinh duoc diem voi response worker cu.

## 14. Cac File Da Thay Doi

AI worker:

```text
ai-worker/Dockerfile
ai-worker/requirements.txt
ai-worker/app/main.py
ai-worker/app/services/semantic_service.py
ai-worker/app/services/skill_service.py
ai-worker/app/services/embedding_service.py
ai-worker/app/services/scoring_service.py
ai-worker/app/services/analysis_service.py
ai-worker/tests/test_embedding_service.py
ai-worker/tests/fixtures/sample_resume.txt
```

Backend:

```text
src/main/java/org/example/workhub/domain/dto/response/AiResumeAnalysisResponse.java
src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java
src/main/java/org/example/workhub/service/impl/ScoreCalculatorServiceImpl.java
src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java
src/test/java/org/example/workhub/service/impl/ScoreCalculatorServiceImplTest.java
```

Config va docs:

```text
docker-compose.yml
docs/ai/architecture.md
docs/ai/modules/ats.md
docs/ai-fe/ats-resume-screening.md
docs/ats-semantic-embedding-implementation-guide.md
```

## 15. Gioi Han Hien Tai

- Skill dictionary van con danh sach co dinh. Co the nang cap thanh dictionary
  tu database hoac taxonomy rieng.
- CV PDF scan hinh anh chua co OCR.
- Chua chunk CV dai thanh nhieu phan; ban hien tai truncate sau `8000` ky tu.
- Model chay CPU nen lan dau load se cham hon cac request sau.
- Chua co progress API rieng cho ATS async.

Day la cac huong nang cap tiep theo, khong anh huong tinh nang embedding hien
tai.
