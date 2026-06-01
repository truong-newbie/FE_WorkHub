# Huong dan nang cap ATS Resume Screening bang embedding

Tai lieu nay tong hop nhung thay doi da duoc trien khai de ATS Resume Screening
chay bang AI worker that, thay vi tra ve semantic score gia lap. Muc tieu la giup
ban hieu luong xu ly, vi sao tung thay doi can thiet, cach chay he thong va cach
debug khi co loi.

## 1. Bai toan can giai quyet

Truoc khi nang cap, AI worker da co endpoint phan tich CV va tach keyword ky
nang. Tuy nhien semantic score dang la gia tri hard-code `0.0`.

Dieu nay dan den hai van de:

- He thong chi danh gia duoc ky nang trung khop truc tiep.
- Hai van ban co cung y nghia nhung dung tu khac nhau khong duoc danh gia dung.

Vi du:

- CV: `Built REST APIs using Spring Boot and relational databases`
- Job: `Looking for a backend engineer experienced in Java web services and SQL`

Neu chi so keyword, diem co the thap. Neu dung sentence embedding, hai van ban
van duoc nhan dien la co lien quan.

## 2. Kien truc sau khi nang cap

Luong day du khi recruiter bam nut screen ATS:

```text
FE
 |
 | POST /api/v1/recruiter/applications/{applicationId}/screen
 v
Spring Boot Backend
 |
 | publish AtsScreeningJobMessage
 v
RabbitMQ
 |
 | consume message
 v
ScreeningServiceImpl
 |
 | HTTP multipart request
 v
AI Worker: POST /api/v1/ai/resume/analyze
 |
 | parse resume + extract skills + calculate embedding similarity
 v
ScreeningResult saved to MySQL
 |
 v
FE reads detail or ranking API
```

AI worker chi phu trach tinh toan AI. Backend van la noi:

- xac thuc recruiter;
- kiem tra quyen truy cap job;
- day message vao RabbitMQ;
- luu ket qua ATS;
- cung cap API cho FE.

## 3. Cong thuc cham diem

Ket qua cuoi cung ket hop hai thanh phan:

```text
final_score = skill_score * 0.6 + semantic_score * 0.4
```

Trong do:

- `skill_score`: ty le ky nang bat buoc cua job xuat hien trong CV.
- `semantic_score`: do tuong dong ngu nghia giua noi dung CV va mo ta job.
- `final_score`: diem ATS cuoi cung tu `0` den `100`.

Vi du:

```text
skill_score    = 75.0
semantic_score = 77.7

final_score = 75.0 * 0.6 + 77.7 * 0.4 = 76.08
```

Backend uu tien `final_score` do AI worker tra ve. Neu phai ket noi voi AI worker
cu chua co field nay, backend van co fallback tinh diem theo cong thuc cu de tranh
lam hong luong dang chay.

## 4. Cac lop moi trong AI worker

### 4.1 Embedding service

File: `ai-worker/app/services/embedding_service.py`

Day la lop quan trong nhat. Lop nay:

- tai model `sentence-transformers/all-MiniLM-L6-v2`;
- chuan hoa Unicode va khoang trang;
- cat bot van ban qua dai;
- encode resume va job description thanh vector;
- tinh cosine similarity;
- chuyen similarity thanh thang diem `0..100`;
- tai model mot lan cho moi process bang cache singleton.

Y tuong cosine similarity:

```python
similarity = dot(resume_vector, job_vector) / (
    norm(resume_vector) * norm(job_vector)
)
score = similarity * 100
```

Model chi duoc load khi request dau tien can cham diem. Request dau tien co the
cham hon vi worker can tai model tu Hugging Face neu cache dang trong.

Bien moi truong:

```text
AI_WORKER_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
AI_WORKER_MAX_TEXT_LENGTH=8000
```

### 4.2 Semantic service

File: `ai-worker/app/services/semantic_service.py`

Service nay thay semantic score gia lap bang loi goi den embedding service:

```python
def calculate_semantic_score(resume_text: str, job_text: str) -> float:
    return get_embedding_service().calculate_similarity_score(
        resume_text,
        job_text,
    )
```

Viec tach lop giup business logic khong phu thuoc truc tiep vao thu vien
`sentence-transformers`.

### 4.3 Skill service

File: `ai-worker/app/services/skill_service.py`

Skill service van dung dictionary co san, nhung da duoc mo rong de nhan them danh
sach ky nang bat buoc tu job.

Vi du backend gui:

```text
required_skills=Java,Spring Boot,Docker,Kafka
```

Worker dung danh sach nay de:

- tim ky nang trong resume;
- tim ky nang trong job;
- tinh `matched_skills`;
- tinh `missing_skills`;
- tinh `extra_skills`.

Dieu nay quan trong vi job co the yeu cau mot cong nghe chua nam trong dictionary
mac dinh.

### 4.4 Analysis service

File: `ai-worker/app/services/analysis_service.py`

Service nay gom cac buoc phan tich vao mot noi:

```text
raw resume text
  -> extract resume skills
  -> build job text
  -> extract job skills
  -> compare skills
  -> calculate skill score
  -> calculate semantic score
  -> calculate final score
  -> build ATS summary
```

Ket qua worker tra ve gom:

```json
{
  "raw_text": "Backend engineer experienced with Java...",
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

### 4.5 FastAPI endpoint

File: `ai-worker/app/main.py`

Endpoint noi bo giua backend va AI worker:

```http
POST /api/v1/ai/resume/analyze
Content-Type: multipart/form-data
```

Form data:

| Field | Bat buoc | Mo ta |
| --- | --- | --- |
| `file` | Co | File resume can phan tich |
| `job_description` | Co | Noi dung job da duoc backend tong hop |
| `required_skills` | Khong | Danh sach ky nang job, cach nhau bang dau phay |

Day khong phai endpoint FE can goi truc tiep. FE chi lam viec voi backend.

## 5. Thay doi trong backend

### 5.1 Gui du thong tin job cho worker

File: `src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java`

Backend tong hop noi dung job truoc khi gui sang AI worker:

```text
Title:
Description:
Requirements:
Benefits:
Experience level:
Experience years:
```

Danh sach skill duoc gui rieng trong field `required_skills`.

### 5.2 HTTP client goi AI worker

File: `src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java`

Client da duoc bo sung:

- connect timeout `10` giay;
- read timeout `90` giay;
- dong input stream sau khi doc resume;
- gui `required_skills`;
- bao loi ro rang neu AI worker khong tra response body.

Read timeout can dai hon connect timeout vi lan cham diem dau tien co the phai
load model vao bo nho.

### 5.3 Doc final score tu worker

Files:

- `src/main/java/org/example/workhub/domain/dto/response/AiResumeAnalysisResponse.java`
- `src/main/java/org/example/workhub/service/impl/ScoreCalculatorServiceImpl.java`

DTO backend da doc them:

```text
final_score
semantic_status
semantic_reason
```

`ScoreCalculatorServiceImpl` uu tien diem `final_score` tu worker, nhung van giu
fallback de tuong thich nguoc.

### 5.4 Luu ket qua

Khong can migration database moi. Entity screening result da co cac field:

```text
skillScore
semanticScore
totalScore
```

Sau khi worker tinh xong, backend luu ket qua vao MySQL de FE doc lai ma khong
can cham diem moi moi lan mo report.

## 6. Docker va dependency

### 6.1 Python dependencies

File: `ai-worker/requirements.txt`

Da them:

```text
sentence-transformers
scikit-learn
numpy
```

### 6.2 PyTorch CPU-only

File: `ai-worker/Dockerfile`

Dockerfile cai PyTorch CPU-only truoc:

```dockerfile
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
```

Ly do: neu cai PyTorch mac dinh, image co the tai them CUDA dependencies rat lon
du worker khong dung GPU. CPU-only du cho model MiniLM va giup image nhe hon.

### 6.3 Cache model

File: `docker-compose.yml`

AI worker mount cache Hugging Face:

```yaml
volumes:
  - ai_worker_model_cache:/root/.cache/huggingface
```

Volume:

```yaml
volumes:
  ai_worker_model_cache:
```

Nho volume nay, model khong bi tai lai moi khi container duoc tao lai.

## 7. Cach chay AI worker that

### 7.1 Chay worker bang Docker Compose

Tai thu muc goc project:

```powershell
docker compose up -d --build ai-worker
docker compose ps ai-worker
```

Kiem tra health:

```powershell
curl.exe http://localhost:8000/health
```

Worker phai chay tai:

```text
http://localhost:8000
```

### 7.2 Chay backend ket noi worker that

Neu backend chay local:

```powershell
$env:AI_WORKER_BASE_URL='http://localhost:8000'
$env:AI_WORKER_MOCK_ENABLED='false'
.\mvnw.cmd spring-boot:run
```

Neu backend chay trong Docker Compose, backend su dung:

```text
AI_WORKER_BASE_URL=http://ai-worker:8000
AI_WORKER_MOCK_ENABLED=false
```

### 7.3 Luu y lan chay dau

Lan request dau tien can internet de tai model:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Sau khi tai xong, model nam trong Docker volume cache.

## 8. Cach test truc tiep AI worker

Tao file resume mau hoac dung file co san:

```text
ai-worker/tests/fixtures/sample_resume.txt
```

Goi endpoint noi bo:

```powershell
curl.exe -X POST http://localhost:8000/api/v1/ai/resume/analyze `
  -F "file=@ai-worker/tests/fixtures/sample_resume.txt" `
  -F "job_description=Backend Java engineer using Spring Boot, Docker and Kafka" `
  -F "required_skills=Java,Spring Boot,Docker,Kafka"
```

Ket qua can co:

```text
skill_score
semantic_score
final_score
matched_skills
missing_skills
extra_skills
ai_summary
```

## 9. Automated tests

### 9.1 Python unit tests

```powershell
cd ai-worker
python -m unittest discover -s tests -v
```

Test gom cac tinh huong:

- van ban lien quan cho semantic score cao;
- van ban khong lien quan cho semantic score thap;
- resume trong bao loi ro rang;
- van ban duoc normalize va truncate;
- keyword tot tao final score tot;
- cung y nghia nhung it keyword van co semantic score;
- required skill van duoc su dung khi description trong.

### 9.2 Python real-model integration test

Test nay tai va chay model that:

```powershell
cd ai-worker
$env:RUN_EMBEDDING_INTEGRATION_TESTS='true'
python -m unittest tests.test_embedding_service.RealEmbeddingIntegrationTest -v
```

### 9.3 Java tests

Tai thu muc goc project:

```powershell
.\mvnw.cmd test
```

Test moi cua backend kiem tra:

- worker co `final_score`: backend dung diem cua worker;
- worker cu khong co `final_score`: backend tinh fallback.

## 10. API contract FE can dung

FE khong goi `/api/v1/ai/resume/analyze`. Day la API noi bo.

FE chi can ba API ATS:

### Queue hoac re-screen mot application

```http
POST /api/v1/recruiter/applications/{applicationId}/screen
Authorization: Bearer <access-token>
```

Re-screen su dung lai endpoint nay, khong co API retry rieng.

### Xem ket qua cua application

```http
GET /api/v1/recruiter/applications/{applicationId}/screening-result
Authorization: Bearer <access-token>
```

### Xem ranking cua mot job

```http
GET /api/v1/recruiter/jobs/{jobId}/screening-ranking
Authorization: Bearer <access-token>
```

FE nen hien thi:

```text
totalScore
skillScore
semanticScore
matchedSkills
missingSkills
extraSkills
aiSummary
screeningStatus
```

Contract chi duoc bo sung ket qua ATS that. URL FE dang dung khong bi thay doi.

## 11. Xu ly loi

| Tinh huong | Ket qua |
| --- | --- |
| `job_description` khong duoc gui | FastAPI validation tra `422` |
| Resume parse ra noi dung trong | Worker tra `422` voi thong bao input khong hop le |
| Model khong load hoac encode duoc | Worker tra `503` |
| AI worker khong ket noi duoc | Backend bao AI worker unavailable |
| Van ban qua dai | Worker cat theo `AI_WORKER_MAX_TEXT_LENGTH` |
| Worker xu ly lau o request dau | Kiem tra model cache va read timeout |

Khi debug Docker:

```powershell
docker compose ps ai-worker
docker compose logs --tail 200 ai-worker
```

Khi kiem tra RabbitMQ:

```text
http://localhost:15672
```

## 12. Danh sach file da thay doi

AI worker:

```text
ai-worker/app/main.py
ai-worker/app/services/analysis_service.py
ai-worker/app/services/embedding_service.py
ai-worker/app/services/scoring_service.py
ai-worker/app/services/semantic_service.py
ai-worker/app/services/skill_service.py
ai-worker/Dockerfile
ai-worker/requirements.txt
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

Docker va tai lieu:

```text
docker-compose.yml
docs/ai/architecture.md
docs/ai/modules/ats.md
docs/ai-fe/ats-resume-screening.md
docs/ats-embedding-implementation-guide.md
```

## 13. Thu tu nen doc code

De hoc nhanh hon, nen doc theo thu tu:

1. `ai-worker/app/services/scoring_service.py`
2. `ai-worker/app/services/skill_service.py`
3. `ai-worker/app/services/embedding_service.py`
4. `ai-worker/app/services/analysis_service.py`
5. `ai-worker/app/main.py`
6. `src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java`
7. `src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java`
8. `src/main/java/org/example/workhub/service/impl/ScoreCalculatorServiceImpl.java`

Thu tu nay di tu cong thuc nho nhat den luong tich hop day du.

