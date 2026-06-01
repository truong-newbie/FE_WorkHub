# ATS Resume Screening API Documentation for Frontend

Tai lieu nay mo ta luong ATS resume screening hien tai cua WorkHub de FE co the
trien khai man hinh recruiter.

## 1. Tong quan

Backend da co luong async hoan chinh:

1. Recruiter/admin queue screening cho mot job application.
2. Backend publish message qua RabbitMQ.
3. Consumer goi AI worker de parse CV va cham diem.
4. Backend luu hoac cap nhat `tbl_screening_results`.
5. Backend chuyen application sang `SCREENED`.
6. Backend gui notification realtime va luu notification trong database.
7. FE goi result API de doc bao cao.

AI worker van cham diem deterministic theo cong thuc:

```text
totalScore = skillScore * 0.60 + semanticScore * 0.40
```

Gemini 2.5 Flash bo sung explanation de recruiter doc report de hon. Gemini
khong thay the logic cham diem. Neu Gemini bi tat, thieu API key, timeout hoac
tra JSON loi, backend van tra explanation rule-based hop le.

## 2. Base URL va authentication

- Base URL: `/api/v1`
- REST header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Response thanh cong co wrapper:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Actor hop le:

- `RECRUITER`
- `ADMIN`

Recruiter chi duoc thao tac neu la recruiter cua job hoac thuoc company so huu
job. Admin duoc phep thao tac moi job.

## 3. Luong FE

1. Lay danh sach applicants cua job.
2. Hien thi nut `Screen resume` tren tung application.
3. Khi recruiter bam nut, goi API queue va doi trang thai UI sang `PROCESSING`.
4. Subscribe notification WebSocket hoac polling notification REST API.
5. Khi nhan notification `ATS_SCREENING_COMPLETED`, goi result API theo
   `applicationId` dang theo doi hoac refresh danh sach result cua job.
6. Hien thi score, skills matched/missing/extra, strengths, weaknesses,
   recommendation, confidence va summary.

## 4. Queue ATS screening

```http
POST /api/v1/recruiter/applications/{applicationId}/screen
Authorization: Bearer <access_token>
```

Request body: khong co.

Response HTTP `200`:

```json
{
  "status": "SUCCESS",
  "data": {
    "applicationId": 501,
    "resumeId": 30,
    "jobId": 101,
    "screeningStatus": "PROCESSING",
    "message": "ATS screening job has been queued",
    "eventId": "5bf72c07-9db3-47a3-92f0-60f2ddb47ad6"
  }
}
```

FE khong gui `resumeId`. Backend uu tien CV da gan voi application. Duong
fallback CV shareable chi dung cho du lieu cu.

Error cases:

| HTTP status | Truong hop |
| --- | --- |
| `401` | Token khong hop le |
| `403` | Khong phai recruiter/admin hoac khong co quyen tren job |
| `404` | Application hoac CV khong ton tai |
| `500` | RabbitMQ hoac backend gap loi |

## 5. Lay applicants

Co hai URL tuong duong:

```http
GET /api/v1/job/{jobId}/applications?page=0&size=10
GET /api/v1/recruiter/jobs/{jobId}/applications?page=0&size=10
Authorization: Bearer <access_token>
```

FE dung `items[].id` lam `applicationId`.

Application status lien quan:

```text
APPLIED, PENDING, REVIEWING, SCREENED, APPROVED, REJECTED
```

## 6. Lay ket qua cua application

```http
GET /api/v1/recruiter/applications/{applicationId}/screening-result
Authorization: Bearer <access_token>
```

Response HTTP `200`:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 900,
    "applicationId": 501,
    "candidateId": "candidate-uuid",
    "candidateName": "candidate01",
    "jobId": 101,
    "jobTitle": "Senior Java Developer",
    "totalScore": 75.0,
    "skillScore": 75.0,
    "semanticScore": 0.0,
    "experienceScore": null,
    "educationScore": null,
    "matchedSkills": ["Java", "Spring Boot", "Docker"],
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

Neu consumer chua xu ly xong hoac chua tung screen, backend tra `404`.

Field explanation moi co the thieu tren report cu chua duoc screen lai. FE can
render fallback an toan. `summary` va `aiSummary` co cung noi dung; FE uu tien
`summary` va dung `aiSummary` de backward compatibility.

`explanationStatus`:

| Gia tri | Cach hien thi FE |
| --- | --- |
| `CALCULATED` | `AI explanation` |
| `SKIPPED_DISABLED` | `Rule-based explanation` |
| `SKIPPED_MISSING_API_KEY` | `Rule-based explanation` |
| `SKIPPED_MOCK` | `Rule-based explanation` |
| `FALLBACK_ERROR` | `Rule-based explanation` |

Khong hien `explanationReason` ky thuat cho end user.

## 7. Lay bang xep hang cua job

```http
GET /api/v1/recruiter/jobs/{jobId}/screening-results
Authorization: Bearer <access_token>
```

Response `data` la array `ScreeningResultResponse`, sap xep giam dan theo
`totalScore`.

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 900,
      "applicationId": 501,
      "candidateId": "candidate-uuid",
      "candidateName": "candidate01",
      "jobId": 101,
      "jobTitle": "Senior Java Developer",
      "totalScore": 75.0,
      "skillScore": 75.0,
      "semanticScore": 0.0,
      "matchedSkills": ["Java", "Spring Boot", "Docker"],
      "missingSkills": ["Kafka"],
      "extraSkills": ["Redis"],
      "recommendation": "CONSIDER",
      "confidence": 86.0,
      "summary": "The candidate matches the core backend requirements.",
      "screenedAt": "2026-06-01T01:30:00"
    }
  ]
}
```

## 8. Notification

Sau khi scoring va luu database thanh cong, backend phat notification:

```json
{
  "type": "ATS_SCREENING_COMPLETED",
  "title": "ATS screening completed",
  "content": "Screening result for candidate01 is ready",
  "targetType": "SCREENING_RESULT",
  "targetId": "900"
}
```

`targetId` la screening result ID, khong phai application ID.

WebSocket topic cua user:

```text
/user/queue/notifications
```

## 9. AI worker va queue

Day la thong tin backend/DevOps. FE khong goi truc tiep.

- AI worker endpoint: `POST http://ai-worker:8000/api/v1/ai/resume/analyze`
- RabbitMQ exchange: `workhub.exchange`
- Queue: `ats.screening.queue`
- Routing key: `ats.screening.request`
- Dead-letter queue: `ats.screening.dlq`
- Retry mac dinh: `3`

## 10. File backend chinh

- `src/main/java/org/example/workhub/controller/JobApplicationController.java`
- `src/main/java/org/example/workhub/controller/ScreeningController.java`
- `src/main/java/org/example/workhub/service/impl/JobApplicationServiceImpl.java`
- `src/main/java/org/example/workhub/service/impl/ScreeningServiceImpl.java`
- `src/main/java/org/example/workhub/queue/consumer/AtsScreeningQueueConsumer.java`
- `src/main/java/org/example/workhub/domain/entity/ScreeningResult.java`
- `ai-worker/app/main.py`

## 11. Frontend Implementation

Routes:

```text
/recruiter/jobs/:jobId/applications
/recruiter/jobs/:jobId/screenings
/recruiter/jobs/applications/:applicationId/screening-result
/admin/jobs/:jobId/applications
/admin/jobs/:jobId/screenings
/admin/jobs/applications/:applicationId/screening-result
```

Service:

```text
src/features/ats/services/atsScreeningService.js
```

Reusable UI:

```text
src/features/ats/components/AtsScoreBadge.jsx
src/features/ats/components/AtsRecommendationBadge.jsx
src/features/ats/components/AtsExplanationBadge.jsx
src/features/ats/components/AtsScreeningReport.jsx
```

Implemented recruiter/admin flow:

- Existing job application list loads the ATS result list for the current job and maps
  results by `applicationId`.
- Each application displays `Screen resume`, `Analyzing resume...`, `View ATS result`,
  `Re-screen`, or `Retry ATS screening` according to current UI/result state.
- Queueing uses `POST /recruiter/applications/{applicationId}/screen` without sending
  `resumeId`, because backend selects the application resume.
- After queueing, FE polls
  `GET /recruiter/applications/{applicationId}/screening-result` every `4` seconds and
  stops after completion, non-404 failure, or a `2` minute timeout.
- Ranking page reads `GET /recruiter/jobs/{jobId}/screening-results`; backend returns an
  already score-sorted array, so FE does not invent filters or pagination.
- Result detail shows overall match, keyword/semantic score breakdown,
  matched/missing/extra skills, strengths, weaknesses, recommendation, confidence,
  explanation source, summary, candidate, job, and screened time.
- Ranking page shows recommendation, total score, confidence, and summary preview.
- Explanation fields are optional for backward compatibility with old reports.
- `CALCULATED` renders as `AI explanation`. Disabled, missing-key, mock, and error
  fallback statuses render as `Rule-based explanation`; fallback is not a blocking error.

Role guards and edge cases:

- ATS routes exist only inside existing `RECRUITER` and `ADMIN` route groups.
- `404` during polling means processing is not finished yet. The standalone detail
  page also polls every `4` seconds and stops after a `2` minute timeout.
- Nullable rollout fields render as `Pending`, an empty-state message, or a backward
  compatible `aiSummary` fallback.
- Backend currently exposes no result-by-screening-ID endpoint, retry endpoint, bulk
  screening endpoint, ranking filters, or ranking pagination. Re-screen reuses the queue
  endpoint and FE does not expose unsupported controls.
- Backend screening result currently does not return candidate email or resume file
  metadata, so the report links back to the existing resume view instead of inventing
  fields.
- `PROCESSING` is returned only by the queue response. Backend does not expose task status,
  so polling state is maintained while the application page remains open; after reload,
  FE can only check for a completed result or allow the recruiter to queue again.
