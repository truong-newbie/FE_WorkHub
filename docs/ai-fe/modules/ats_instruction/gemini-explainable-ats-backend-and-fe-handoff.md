# Gemini Explainable ATS: Tai lieu backend va ban giao frontend

Tai lieu nay mo ta phan nang cap ATS Resume Screening bang Gemini 2.5 Flash.
Muc tieu la giup hoc lai nhung gi da thay doi trong backend va cung cap contract
de frontend cap nhat giao dien recruiter.

## 1. Ket qua sau khi nang cap

ATS van cham diem theo logic cu:

```text
Resume
  -> Keyword skill matching
  -> Embedding semantic matching
  -> Final ATS score
```

Da bo sung them lop giai thich:

```text
Final ATS score
  -> Gemini 2.5 Flash explanation
  -> Recruiter-readable report
```

Gemini khong thay the logic cham diem. Cong thuc diem van la:

```text
totalScore = skillScore * 0.60 + semanticScore * 0.40
```

## 2. Luong backend day du

Khi recruiter bam nut screen:

```text
FE
  -> POST /api/v1/recruiter/applications/{applicationId}/screen
  -> Spring Boot validate recruiter va quyen truy cap job
  -> RabbitMQ ats.screening.queue
  -> AtsScreeningQueueConsumer
  -> ScreeningServiceImpl
  -> Kiem tra cache MySQL theo resumeId + jobId
  -> Goi FastAPI AI worker neu chua co Gemini report cached
  -> AI worker parse resume
  -> Skill matching
  -> Embedding semantic score
  -> Goi Gemini 2.5 Flash neu LLM_ENABLED=true
  -> Luu ScreeningResult vao MySQL
  -> FE doc report
```

Spring Boot khong goi Gemini truc tiep. Toan bo AI logic nam trong AI worker:

```text
Spring Boot -> AI Worker -> Gemini
```

## 3. Gemini service trong AI worker

File moi:

```text
ai-worker/app/core/config.py
ai-worker/app/services/gemini_service.py
```

`config.py` doc cac bien moi truong:

```text
LLM_ENABLED=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_SECONDS=30
GEMINI_MAX_TEXT_LENGTH=12000
```

`gemini_service.py` chiu trach nhiem:

- tao prompt cho Gemini;
- gui parsed resume text thay vi gui file PDF;
- yeu cau Gemini tra ve JSON co schema ro rang;
- parse va validate JSON;
- chi chap nhan recommendation `PASS`, `CONSIDER`, `REJECT`;
- retry mot lan neu request hoac JSON bi loi;
- fallback neu Gemini van loi;
- cache ket qua trong worker theo `resumeId + jobId`.

Prompt gui cho Gemini gom:

```text
Job title
Job description
Required skills
Parsed resume text
Keyword score
Semantic score
Final ATS score
Matched skills
Missing skills
```

## 4. Fallback khi Gemini khong chay

ATS khong bi crash khi:

- `LLM_ENABLED=false`;
- chua dien `GEMINI_API_KEY`;
- Gemini timeout;
- Gemini tra JSON sai;
- Gemini tam thoi khong kha dung.

Worker van tao explanation co ban dua tren diem ATS deterministic.

Gia tri `explanationStatus` co the la:

| Gia tri | Y nghia |
| --- | --- |
| `CALCULATED` | Gemini da tra explanation hop le |
| `SKIPPED_DISABLED` | Gemini bi tat bang config |
| `SKIPPED_MISSING_API_KEY` | Chua cau hinh API key |
| `SKIPPED_MOCK` | Backend dang dung AI worker mock |
| `FALLBACK_ERROR` | Gemini loi sau khi retry |

Recommendation fallback:

| Diem ATS | Recommendation |
| --- | --- |
| `>= 80` | `PASS` |
| `>= 60` va `< 80` | `CONSIDER` |
| `< 60` | `REJECT` |

## 5. Cache de giam chi phi

Co hai lop cache:

1. AI worker cache Gemini response trong bo nho theo `resumeId + jobId`.
2. Spring Boot tim report Gemini da `CALCULATED` trong MySQL theo
   `resumeId + jobId` truoc khi goi AI worker.

Neu report cu chi la fallback, backend van cho phep chay lai de enrich report sau
khi Gemini duoc bat hoac phuc hoi.

## 6. Database

Entity:

```text
src/main/java/org/example/workhub/domain/entity/ScreeningResult.java
```

Bang `tbl_screening_results` duoc bo sung cac cot nullable:

```text
strengths
weaknesses
recommendation
confidence
explanation_status
explanation_reason
```

`strengths` va `weaknesses` luu JSON array trong cot `TEXT`.

Cot `ai_summary` cu duoc giu lai de backward compatibility. Field `summary` moi
trong response FE co cung noi dung voi `aiSummary`.

Project dang dung:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Vi vay Hibernate se them cot khi backend dev khoi dong. Neu deploy production co
migration tool rieng, can tao migration SQL tuong ung.

## 7. File backend da thay doi

AI worker:

```text
ai-worker/app/core/__init__.py
ai-worker/app/core/config.py
ai-worker/app/main.py
ai-worker/app/services/analysis_service.py
ai-worker/app/services/gemini_service.py
ai-worker/tests/test_gemini_service.py
```

Spring Boot:

```text
src/main/java/org/example/workhub/domain/dto/response/AiResumeAnalysisResponse.java
src/main/java/org/example/workhub/domain/dto/response/ScreeningResultResponse.java
src/main/java/org/example/workhub/domain/entity/ScreeningResult.java
src/main/java/org/example/workhub/domain/mapper/ScreeningResultMapper.java
src/main/java/org/example/workhub/repository/ScreeningResultRepository.java
src/main/java/org/example/workhub/service/AiWorkerClient.java
src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java
src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java
src/test/java/org/example/workhub/service/impl/ScreeningServiceImplTest.java
```

Config va tai lieu:

```text
docker-compose.yml
AI_Context.md
docs/ai/architecture.md
docs/ai/database.md
docs/ai/modules/ats.md
docs/ai-fe/ats-resume-screening.md
```

## 8. Cach chay Gemini that

Tai thu muc goc project, tao `.env`:

```env
GEMINI_API_KEY=<your-api-key>
LLM_ENABLED=true
```

Khong commit `.env`. File nay da nam trong `.gitignore`.

Khoi dong lai AI worker:

```powershell
docker compose up -d --build ai-worker
docker compose ps ai-worker
```

Theo doi log:

```powershell
docker compose logs -f ai-worker
```

## 9. API frontend can dung

Khong co URL moi cho FE. FE tiep tuc su dung ba API ATS hien tai.

### 9.1 Queue hoac re-screen application

```http
POST /api/v1/recruiter/applications/{applicationId}/screen
Authorization: Bearer <accessToken>
```

Request body:

```text
Khong co
```

Response mau:

```json
{
  "status": "SUCCESS",
  "data": {
    "applicationId": 10,
    "resumeId": 3,
    "jobId": 5,
    "screeningStatus": "PROCESSING",
    "message": "ATS screening job has been queued",
    "eventId": "uuid"
  }
}
```

Luu y:

- endpoint nay chay async;
- thanh cong chi co nghia la job da vao queue;
- re-screen dung lai endpoint nay;
- khong co API retry rieng.

### 9.2 Doc ket qua theo application

```http
GET /api/v1/recruiter/applications/{applicationId}/screening-result
Authorization: Bearer <accessToken>
```

Response mau:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 25,
    "applicationId": 10,
    "candidateId": "candidate-uuid",
    "candidateName": "candidate",
    "jobId": 5,
    "jobTitle": "Backend Java Developer",
    "totalScore": 78.4,
    "skillScore": 72.0,
    "semanticScore": 88.0,
    "matchedSkills": ["Java", "Spring Boot"],
    "missingSkills": ["Kafka"],
    "extraSkills": ["Redis"],
    "strengths": ["Strong Java and Spring Boot experience"],
    "weaknesses": ["Kafka is not shown in the resume"],
    "recommendation": "CONSIDER",
    "confidence": 86.0,
    "summary": "The candidate matches the core backend requirements.",
    "explanationStatus": "CALCULATED",
    "explanationReason": null,
    "aiSummary": "The candidate matches the core backend requirements.",
    "screenedAt": "2026-06-01T01:30:00"
  }
}
```

### 9.3 Doc ranking theo job

```http
GET /api/v1/recruiter/jobs/{jobId}/screening-results
Authorization: Bearer <accessToken>
```

Response `data` la array cua cung object screening result:

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "applicationId": 10,
      "candidateName": "candidate",
      "totalScore": 78.4,
      "recommendation": "CONSIDER",
      "summary": "The candidate matches the core backend requirements."
    }
  ]
}
```

Danh sach duoc sap xep theo `totalScore` giam dan.

## 10. Frontend can sua gi

### 10.1 Khong sua URL

Giu nguyen ba API:

```text
POST /api/v1/recruiter/applications/{applicationId}/screen
GET  /api/v1/recruiter/applications/{applicationId}/screening-result
GET  /api/v1/recruiter/jobs/{jobId}/screening-results
```

### 10.2 Cap nhat TypeScript type

Them cac field:

```typescript
type AtsRecommendation = 'PASS' | 'CONSIDER' | 'REJECT';

interface ScreeningResult {
  id: number;
  applicationId: number;
  candidateId?: string;
  candidateName?: string;
  jobId: number;
  jobTitle?: string;
  totalScore: number;
  skillScore: number;
  semanticScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: AtsRecommendation;
  confidence: number;
  summary: string;
  explanationStatus: string;
  explanationReason?: string | null;
  aiSummary?: string;
  screenedAt?: string;
}
```

Nen de cac field explanation optional trong giai doan rollout neu database con
report cu chua duoc screen lai:

```typescript
strengths?: string[];
weaknesses?: string[];
recommendation?: AtsRecommendation;
confidence?: number;
summary?: string;
explanationStatus?: string;
```

### 10.3 Cap nhat trang report detail

Hien thi:

```text
ATS Score
Keyword Score
Semantic Score
Matched Skills
Missing Skills
Extra Skills
Strengths
Weaknesses
Recommendation
Confidence
Summary
```

Mau goi y:

| Recommendation | Mau |
| --- | --- |
| `PASS` | Xanh la |
| `CONSIDER` | Vang hoac cam |
| `REJECT` | Do |

### 10.4 Cap nhat ranking table

Nen them:

```text
Recommendation
Total score
Confidence
Summary preview
```

Khi recruiter bam vao mot candidate, mo detail report de xem strengths va
weaknesses.

### 10.5 Xu ly trang thai async

Sau khi goi API queue:

1. Hien thi trang thai processing.
2. Cho notification ATS completion neu FE da ket noi WebSocket.
3. Hoac polling endpoint detail sau vai giay.
4. Neu detail API tra `404`, tiep tuc cho hoac hien thi `Processing`.
5. Khi co report, render cac field moi.

### 10.6 Xu ly fallback

FE van hien report neu:

```text
explanationStatus != CALCULATED
```

Khong coi day la loi blocking. Summary, strengths, weaknesses va recommendation
fallback van hop le.

Co the hien thi badge phu:

| Status | Label goi y |
| --- | --- |
| `CALCULATED` | `AI explanation` |
| `SKIPPED_DISABLED` | `Rule-based explanation` |
| `SKIPPED_MISSING_API_KEY` | `Rule-based explanation` |
| `FALLBACK_ERROR` | `Rule-based explanation` |

Khong hien `explanationReason` cho user cuoi neu noi dung mang tinh ky thuat.
Co the ghi log hoac chi hien cho admin.

## 11. API FE khong duoc goi

Endpoint sau chi la noi bo giua Spring Boot va AI worker:

```http
POST /api/v1/ai/resume/analyze
```

FE khong upload resume truc tiep vao endpoint nay va khong can gui Gemini API
key. Key chi ton tai o server.

## 12. Verification da chay

```text
python -m unittest discover -s tests -v
18 tests passed, 1 optional real embedding integration test skipped

.\mvnw.cmd test
6 tests passed

.\mvnw.cmd clean package -DskipTests
BUILD SUCCESS

docker compose config
OK

Docker AI worker smoke test with LLM_ENABLED=false
HTTP 200 with deterministic fallback explanation
```
# Gemini Explainable ATS: Backend va FE handoff

## 1. Muc tieu

ATS van dung diem deterministic:

```text
totalScore = skillScore * 0.60 + semanticScore * 0.40
```

Gemini 2.5 Flash chi bo sung lop giai thich cho recruiter:

```text
Resume
  -> keyword matching
  -> embedding semantic score
  -> final ATS score
  -> Gemini explanation
  -> persisted ScreeningResult
```

## 2. Backend flow

```text
POST /api/v1/recruiter/applications/{applicationId}/screen
  -> Spring Boot validate recruiter/job ownership
  -> RabbitMQ ats.screening.queue
  -> AtsScreeningQueueConsumer
  -> ScreeningServiceImpl
  -> AI worker POST /api/v1/ai/resume/analyze
  -> Gemini 2.5 Flash if LLM_ENABLED=true
  -> tbl_screening_results
```

Spring Boot khong goi Gemini truc tiep. Gemini API key chi nam trong AI worker.

## 3. AI worker

Config:

```text
LLM_ENABLED=true
GEMINI_API_KEY=<server-secret>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_SECONDS=30
GEMINI_MAX_TEXT_LENGTH=12000
```

Gemini service:

```text
ai-worker/app/core/config.py
ai-worker/app/services/gemini_service.py
```

Gemini service:

- gui parsed resume text, khong gui PDF truc tiep;
- parse structured JSON;
- chi chap nhan `PASS`, `CONSIDER`, `REJECT`;
- retry mot lan neu Gemini loi;
- fallback neu Gemini van loi;
- cache explanation theo `resumeId + jobId`.

ATS van hoat dong neu Gemini tat hoac loi.

## 4. Resume parser

Backend cho upload `PDF`, `DOCX`, `DOC`. AI worker da co parser tuong ung:

| Format | Parser |
| --- | --- |
| PDF | `pdfplumber` |
| DOCX | ZIP/XML parser |
| DOC | `antiword` trong Docker image |
| TXT | UTF-8 decode |

Resume document moi duoc upload len Cloudinary voi:

```text
resource_type=raw
```

Ly do: AI worker can tai file tu URL persisted. PDF cu da upload duoi
`image/upload` co the bi Cloudinary tra `401 deny or ACL failure`; file cu nhu
vay can upload lai.

## 5. Database

Bang `tbl_screening_results` duoc bo sung cac cot nullable:

```text
strengths
weaknesses
recommendation
confidence
explanation_status
explanation_reason
```

Backend reuse Gemini report da `CALCULATED` theo `resumeId + jobId` de giam chi
phi. Report fallback van co the enrich lai sau khi Gemini phuc hoi.

## 6. API FE can dung

URL khong thay doi:

```text
POST /api/v1/recruiter/applications/{applicationId}/screen
GET  /api/v1/recruiter/applications/{applicationId}/screening-result
GET  /api/v1/recruiter/jobs/{jobId}/screening-results
```

Queue hoac re-screen:

```http
POST /api/v1/recruiter/applications/{applicationId}/screen
Authorization: Bearer <accessToken>
```

Khong co request body. Endpoint nay async.

Detail:

```http
GET /api/v1/recruiter/applications/{applicationId}/screening-result
Authorization: Bearer <accessToken>
```

Ranking:

```http
GET /api/v1/recruiter/jobs/{jobId}/screening-results
Authorization: Bearer <accessToken>
```

## 7. Response FE

Response detail va tung item ranking:

```json
{
  "id": 1,
  "applicationId": 3,
  "candidateId": "candidate-uuid",
  "candidateName": "candidate",
  "jobId": 4,
  "jobTitle": "Senior Java Developer",
  "totalScore": 66.82,
  "skillScore": 75.0,
  "semanticScore": 54.55,
  "matchedSkills": ["Java", "Spring Boot", "Docker"],
  "missingSkills": ["Kafka"],
  "extraSkills": ["MySQL", "PostgreSQL"],
  "strengths": ["Strong Java and Spring Boot foundation"],
  "weaknesses": ["Kafka is not shown in the resume"],
  "recommendation": "CONSIDER",
  "confidence": 70.0,
  "summary": "Recruiter-readable Gemini summary",
  "explanationStatus": "CALCULATED",
  "explanationReason": null,
  "aiSummary": "Backward-compatible alias of summary",
  "screenedAt": "2026-06-01T12:00:00"
}
```

## 8. FE can sua gi

Them type:

```typescript
type AtsRecommendation = 'PASS' | 'CONSIDER' | 'REJECT';

interface ScreeningResult {
  id: number;
  applicationId: number;
  candidateId?: string;
  candidateName?: string;
  jobId: number;
  jobTitle?: string;
  totalScore: number;
  skillScore: number;
  semanticScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: AtsRecommendation;
  confidence?: number;
  summary?: string;
  explanationStatus?: string;
  explanationReason?: string | null;
  aiSummary?: string;
  screenedAt?: string;
}
```

Detail page nen hien:

```text
ATS score
Keyword score
Semantic score
Matched skills
Missing skills
Extra skills
Strengths
Weaknesses
Recommendation
Confidence
Summary
```

Ranking table nen them:

```text
Recommendation
Total score
Confidence
Summary preview
```

Badge goi y:

| Recommendation | Mau |
| --- | --- |
| `PASS` | Xanh |
| `CONSIDER` | Vang hoac cam |
| `REJECT` | Do |

## 9. Async va fallback

Sau khi queue:

1. Hien thi `Processing`.
2. Cho WebSocket ATS completion notification hoac polling detail API.
3. Neu detail API tra `404`, tiep tuc hien `Processing`.
4. Khi co report, render explanation.

`explanationStatus`:

| Value | Y nghia |
| --- | --- |
| `CALCULATED` | Gemini report |
| `SKIPPED_DISABLED` | Gemini tat, dung rule-based fallback |
| `SKIPPED_MISSING_API_KEY` | Thieu API key, dung fallback |
| `SKIPPED_MOCK` | Backend mock |
| `FALLBACK_ERROR` | Gemini loi sau retry, dung fallback |

FE van hien report khi status khong phai `CALCULATED`. Day khong phai loi
blocking.

## 10. API noi bo FE khong goi

```text
POST /api/v1/ai/resume/analyze
```

FE khong gui Gemini API key va khong goi AI worker truc tiep.

## 11. File thay doi

AI worker:

```text
ai-worker/Dockerfile
ai-worker/app/core/config.py
ai-worker/app/main.py
ai-worker/app/services/analysis_service.py
ai-worker/app/services/gemini_service.py
ai-worker/app/services/parser_service.py
ai-worker/tests/test_gemini_service.py
ai-worker/tests/test_parser_service.py
```

Spring Boot:

```text
src/main/java/org/example/workhub/domain/dto/response/AiResumeAnalysisResponse.java
src/main/java/org/example/workhub/domain/dto/response/ScreeningResultResponse.java
src/main/java/org/example/workhub/domain/entity/ScreeningResult.java
src/main/java/org/example/workhub/domain/mapper/ScreeningResultMapper.java
src/main/java/org/example/workhub/repository/ScreeningResultRepository.java
src/main/java/org/example/workhub/service/AiWorkerClient.java
src/main/java/org/example/workhub/service/impl/AiWorkerClientImpl.java
src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java
src/main/java/org/example/workhub/util/UploadFileUtil.java
```


