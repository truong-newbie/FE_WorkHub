`
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

