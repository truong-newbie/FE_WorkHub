# Recruiter Assessment - Backend Contract for Frontend

## 1. Muc dich

Module assessment cho phep recruiter:

1. Tao bai test cho mot job.
2. Them cau hoi trac nghiem hoac tu luan.
3. Publish bai test.
4. Assign bai test cho cac application cua job.
5. Xem assignment, ket qua va cau tra loi cua candidate.
6. Cham diem va ghi feedback cho cau tu luan.

Candidate co the:

1. Xem danh sach bai test duoc giao.
2. Xem de bai cua assignment thuoc ve minh.
3. Bat dau lam bai.
4. Submit mot lan.
5. Xem ket qua.

Tai lieu nay duoc viet theo code backend hien tai. File `test_api_recruiter_requirement.txt`
chi duoc dung de doi chieu prerequisite role recruiter. Mot so API trong file test do da cu
va khong con trung voi code backend hien tai.

## 2. Base URL va authentication

Base URL local:

```text
http://localhost:8080/api/v1
```

Tat ca endpoint trong tai lieu nay deu can JWT:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Neu user vua duoc admin approve thanh recruiter, FE nen login lai hoac refresh token theo
flow auth hien co de JWT moi chua role recruiter.

## 3. Response wrapper chung

Backend hien tai khong tra wrapper `success`, `meta`, `error`, `timestamp` nhu mot so tai
lieu cu. FE phai doc wrapper thuc te sau.

Thanh cong:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Loi:

```json
{
  "status": "ERROR",
  "message": "Assessment test is not published"
}
```

Voi API xoa thanh cong, `data` co the bi omit vi gia tri la `null`:

```json
{
  "status": "SUCCESS"
}
```

Validation error co the tra object theo field:

```json
{
  "status": "ERROR",
  "message": {
    "title": "This field is required"
  }
}
```

## 4. Enum FE can su dung

### AssessmentStatus

| Gia tri | Y nghia |
| --- | --- |
| `DRAFT` | Bai test moi tao, dang chinh sua |
| `PUBLISHED` | Bai test da publish, co the assign va candidate co the lam trong time window |
| `CLOSED` | Bai test da dong |

### AssignmentStatus

| Gia tri | Y nghia |
| --- | --- |
| `ASSIGNED` | Da giao bai, candidate chua bam start |
| `IN_PROGRESS` | Candidate da bat dau lam bai |
| `SUBMITTED` | Candidate da nop bai |
| `EXPIRED` | Assignment het han khi backend phat hien candidate submit qua thoi gian |

### QuestionType

| Gia tri | Y nghia |
| --- | --- |
| `MULTIPLE_CHOICE` | Cau trac nghiem |
| `ESSAY` | Cau tu luan, recruiter cham diem thu cong |

## 5. Data model response

### AssessmentTestResponse

Recruiter nhan `correct` trong option. Candidate khong nhan field `correct`.

```json
{
  "id": 101,
  "title": "Java Backend Assessment",
  "description": "Basic Java and API design",
  "durationMinutes": 45,
  "startAt": "2026-06-10T09:00:00",
  "endAt": "2026-06-20T18:00:00",
  "status": "DRAFT",
  "jobId": 12,
  "jobTitle": "Java Backend Engineer",
  "recruiterId": "recruiter-user-id",
  "recruiterName": "recruiter01",
  "createdDate": "2026-06-01T14:00:00",
  "lastModifiedDate": "2026-06-01T14:00:00",
  "questions": [
    {
      "id": 1001,
      "content": "Which collection does not allow duplicate values?",
      "type": "MULTIPLE_CHOICE",
      "score": 2.0,
      "orderIndex": 1,
      "options": [
        {
          "id": 5001,
          "content": "Set",
          "correct": true
        },
        {
          "id": 5002,
          "content": "List",
          "correct": false
        }
      ]
    }
  ]
}
```

### CandidateTestAssignmentResponse

```json
{
  "id": 301,
  "testId": 101,
  "testTitle": "Java Backend Assessment",
  "testDescription": "Basic Java and API design",
  "applicationId": 9001,
  "candidateId": "candidate-user-id",
  "candidateName": "candidate01",
  "candidateEmail": "candidate01@example.com",
  "status": "ASSIGNED",
  "durationMinutes": 45,
  "testStartAt": "2026-06-10T09:00:00",
  "testEndAt": "2026-06-20T18:00:00",
  "startedAt": null,
  "submittedAt": null,
  "totalScore": 0.0,
  "maxScore": 12.0,
  "recruiterFeedback": null
}
```

### CandidateAnswerResponse

```json
{
  "id": 8001,
  "questionId": 1001,
  "questionContent": "Which collection does not allow duplicate values?",
  "selectedOptionId": 5001,
  "selectedOptionContent": "Set",
  "essayAnswer": null,
  "score": 2.0,
  "maxScore": 2.0,
  "feedback": null
}
```

### CandidateTestResultResponse

```json
{
  "assignmentId": 301,
  "testId": 101,
  "testTitle": "Java Backend Assessment",
  "status": "SUBMITTED",
  "totalScore": 7.0,
  "maxScore": 12.0,
  "submittedAt": "2026-06-11T10:30:00",
  "recruiterFeedback": null,
  "answers": []
}
```

### RecruiterTestResultResponse

```json
{
  "assignmentId": 301,
  "candidateId": "candidate-user-id",
  "candidateName": "candidate01",
  "candidateEmail": "candidate01@example.com",
  "applicationId": 9001,
  "status": "SUBMITTED",
  "totalScore": 7.0,
  "maxScore": 12.0,
  "submittedAt": "2026-06-11T10:30:00"
}
```

## 6. Recruiter APIs

Tat ca recruiter endpoint yeu cau:

```text
ROLE_RECRUITER hoac ROLE_ADMIN
```

Admin luon co quyen. Voi recruiter, backend cho phep truy cap khi:

1. Recruiter la `job.recruiter`; hoac
2. Recruiter dang thuoc cung company voi job.

### 6.1 Tao bai test cho job

```http
POST /api/v1/recruiter/jobs/{jobId}/tests
```

Request:

```json
{
  "title": "Java Backend Assessment",
  "description": "Basic Java and API design",
  "durationMinutes": 45,
  "startAt": "2026-06-10T09:00:00",
  "endAt": "2026-06-20T18:00:00"
}
```

Rule:

- `title` bat buoc.
- `durationMinutes` la so duong.
- `startAt`, `endAt` bat buoc va phai la hien tai hoac tuong lai.
- `endAt` phai sau `startAt`.
- Date time la `LocalDateTime`, gui dang `YYYY-MM-DDTHH:mm:ss`, khong them `Z`.
- Status ban dau luon la `DRAFT`.

Response: HTTP `201`, `data` la `AssessmentTestResponse`.

### 6.2 Cap nhat bai test

```http
PUT /api/v1/recruiter/tests/{testId}
```

Tat ca field deu optional:

```json
{
  "title": "Java Backend Assessment v2",
  "description": "Updated description",
  "durationMinutes": 60,
  "startAt": "2026-06-10T10:00:00",
  "endAt": "2026-06-21T18:00:00"
}
```

Rule:

- Neu da co bat ky assignment `SUBMITTED`, backend chi cho sua `description`.
- Neu da co submission ma gui `title`, `durationMinutes`, `startAt` hoac `endAt`, backend tra loi.

Response: HTTP `200`, `data` la `AssessmentTestResponse`.

### 6.3 Xoa bai test

```http
DELETE /api/v1/recruiter/tests/{testId}
```

Khong co request body. Backend soft-delete bai test.

Response:

```json
{
  "status": "SUCCESS"
}
```

### 6.4 Publish bai test

```http
PUT /api/v1/recruiter/tests/{testId}/publish
```

Khong co request body.

Rule:

- Bai test phai co it nhat mot cau hoi.
- Moi cau `MULTIPLE_CHOICE` phai co it nhat hai options.
- Moi cau `MULTIPLE_CHOICE` phai co it nhat mot option `correct: true`.

Response: HTTP `200`, `data` la `AssessmentTestResponse`, status la `PUBLISHED`.

### 6.5 Dong bai test

```http
PUT /api/v1/recruiter/tests/{testId}/close
```

Khong co request body.

Response: HTTP `200`, `data` la `AssessmentTestResponse`, status la `CLOSED`.

### 6.6 Them cau hoi

```http
POST /api/v1/recruiter/tests/{testId}/questions
```

Trac nghiem:

```json
{
  "type": "MULTIPLE_CHOICE",
  "content": "Which collection does not allow duplicate values?",
  "score": 2.0,
  "orderIndex": 1,
  "options": [
    {
      "content": "Set",
      "correct": true
    },
    {
      "content": "List",
      "correct": false
    }
  ]
}
```

Tu luan:

```json
{
  "type": "ESSAY",
  "content": "Explain dependency injection.",
  "score": 5.0,
  "orderIndex": 2
}
```

Rule:

- `type`, `content`, `score` bat buoc.
- `score` la so duong.
- Voi `MULTIPLE_CHOICE`, can it nhat hai options va it nhat mot dap an dung.
- Voi `ESSAY`, FE khong can gui `options`. Neu gui, backend cung bo qua.

Response: HTTP `201`, `data` la `AssessmentQuestionResponse`. Recruiter thay field
`correct`.

### 6.7 Cap nhat cau hoi

```http
PUT /api/v1/recruiter/questions/{questionId}
```

Tat ca field deu optional:

```json
{
  "content": "Updated question",
  "score": 3.0,
  "orderIndex": 1,
  "options": [
    {
      "content": "Set",
      "correct": true
    },
    {
      "content": "List",
      "correct": false
    }
  ]
}
```

Luu y: neu FE gui `options`, backend thay the toan bo options cu cua cau hoi.

Response: HTTP `200`, `data` la `AssessmentQuestionResponse`.

### 6.8 Xoa cau hoi

```http
DELETE /api/v1/recruiter/questions/{questionId}
```

Khong co request body. Backend soft-delete cau hoi.

Response:

```json
{
  "status": "SUCCESS"
}
```

### 6.9 Assign bai test cho candidate applications

```http
POST /api/v1/recruiter/tests/{testId}/assign
```

Request:

```json
{
  "applicationIds": [9001, 9002]
}
```

Rule:

- Test phai co status `PUBLISHED`.
- `applicationIds` khong duoc rong.
- Moi application phai ton tai, khong bi xoa va thuoc dung job cua test.
- Khong assign cho application co status `REJECTED`.
- Khong assign trung mot application cho cung test.

Response: HTTP `201`, `data` la danh sach `CandidateTestAssignmentResponse`.

Sau khi transaction thanh cong, candidate nhan notification:

```text
type: ASSESSMENT_ASSIGNED
targetType: ASSESSMENT
targetId: <assignmentId>
```

FE co the dieu huong notification sang trang candidate assessment detail theo
`assignmentId`.

### 6.10 Lay danh sach assignment cua test

```http
GET /api/v1/recruiter/tests/{testId}/assignments
```

Response: HTTP `200`, `data` la mang `CandidateTestAssignmentResponse`.

Khong co pagination, filter hoac sorting param.

### 6.11 Lay bang ket qua cua test

```http
GET /api/v1/recruiter/tests/{testId}/results
```

Response: HTTP `200`, `data` la mang `RecruiterTestResultResponse`.

Khong co pagination, filter hoac sorting param. Endpoint tra ca assignment chua submit,
khong chi rieng bai da nop.

### 6.12 Lay cau tra loi cua mot assignment

```http
GET /api/v1/recruiter/test-assignments/{assignmentId}/answers
```

Response: HTTP `200`, `data` la mang `CandidateAnswerResponse`.

FE dung endpoint nay khi recruiter mo chi tiet ket qua cua mot candidate.

### 6.13 Cham diem cau tu luan

```http
PUT /api/v1/recruiter/answers/{answerId}/score
```

Request:

```json
{
  "score": 4.0,
  "feedback": "Good explanation, but missing one example."
}
```

Rule:

- Chi cham duoc cau `ESSAY`.
- `score` bat buoc, lon hon hoac bang `0`.
- `score` khong duoc lon hon diem toi da cua cau hoi.
- Sau khi cham, backend tu tinh lai `totalScore` cua assignment.

Response: HTTP `200`, `data` la `CandidateAnswerResponse`.

## 7. Candidate APIs

Candidate endpoint dung:

```text
isAuthenticated()
```

Backend van kiem tra ownership: user chi doc va thao tac assignment cua chinh minh.

### 7.1 Lay danh sach bai test cua candidate hien tai

```http
GET /api/v1/candidate/tests
```

Response: HTTP `200`, `data` la mang `CandidateTestAssignmentResponse`.

Khong co pagination, filter hoac sorting param.

### 7.2 Lay de bai theo assignment

```http
GET /api/v1/candidate/test-assignments/{assignmentId}
```

Response: HTTP `200`, `data` la `AssessmentTestResponse`.

Vi ly do bao mat, option candidate nhan duoc khong co field `correct`:

```json
{
  "id": 5001,
  "content": "Set"
}
```

### 7.3 Bat dau lam bai

```http
POST /api/v1/candidate/test-assignments/{assignmentId}/start
```

Khong co request body.

Rule:

- Test phai `PUBLISHED`.
- Thoi diem hien tai phai nam trong khoang `startAt` den `endAt`.
- Assignment chua `SUBMITTED` hoac `EXPIRED`.
- Lan start dau tien backend set `startedAt` va status `IN_PROGRESS`.
- Goi start lai khi dang `IN_PROGRESS` khong reset dong ho.

Response: HTTP `200`, `data` la `CandidateTestAssignmentResponse`.

FE nen lay `startedAt`, `durationMinutes`, `testEndAt` tu response de tinh countdown.
Deadline thuc te la thoi diem som hon giua:

```text
startedAt + durationMinutes
testEndAt
```

### 7.4 Nop bai

```http
POST /api/v1/candidate/test-assignments/{assignmentId}/submit
```

Request:

```json
{
  "answers": [
    {
      "questionId": 1001,
      "selectedOptionId": 5001
    },
    {
      "questionId": 1002,
      "essayAnswer": "Dependency injection separates construction from usage..."
    }
  ]
}
```

Rule:

- `answers` khong duoc rong.
- Khong gui trung `questionId`.
- Cau hoi phai thuoc test cua assignment.
- Voi `MULTIPLE_CHOICE`, `selectedOptionId` bat buoc va phai thuoc dung cau hoi.
- Voi `ESSAY`, gui `essayAnswer`, toi da `10000` ky tu.
- Backend auto-score cau trac nghiem.
- Cau tu luan co `score: null` cho den khi recruiter cham.
- Moi assignment chi submit duoc mot lan.
- Neu FE submit ma chua goi start, backend tu set `startedAt` tai thoi diem submit.

Response: HTTP `200`, `data` la `CandidateTestResultResponse`.

Sau khi transaction thanh cong, recruiter nhan notification:

```text
type: ASSESSMENT_SUBMITTED
targetType: ASSESSMENT
targetId: <assignmentId>
```

### 7.5 Xem ket qua cua candidate

```http
GET /api/v1/candidate/test-assignments/{assignmentId}/result
```

Response: HTTP `200`, `data` la `CandidateTestResultResponse`.

FE nen hien thi ro:

- Diem trac nghiem co ngay sau submit.
- Diem tu luan co the chua co.
- `totalScore` thay doi sau khi recruiter cham tu luan.
- `feedback` trong tung answer la feedback cho cau tu luan.
- `recruiterFeedback` la field tong quan cua assignment, nhung backend hien chua co API de
  recruiter cap nhat field nay.

## 8. Flow FE de xuat

### Recruiter

1. User co JWT role recruiter.
2. Tu trang quan ly job, tao test bang `POST /recruiter/jobs/{jobId}/tests`.
3. Luu `testId` tu response trong state hoac route.
4. Them va sua cau hoi.
5. Publish test.
6. Lay danh sach applicants cua job tu module job application.
7. Chon application hop le va assign test.
8. Mo danh sach assignment hoac results cua test.
9. Khi candidate submit, mo answers theo `assignmentId`.
10. Cham tung cau tu luan qua `PUT /recruiter/answers/{answerId}/score`.

### Candidate

1. Lay danh sach assignment bang `GET /candidate/tests`.
2. Mo detail bang `GET /candidate/test-assignments/{assignmentId}`.
3. Bam start.
4. FE countdown theo response start.
5. Submit toan bo answer mot lan.
6. Xem ket qua bang endpoint result.

## 9. Error handling quan trong

FE nen xu ly theo HTTP status va hien thi `message`.

| HTTP | Truong hop |
| --- | --- |
| `400` | Test chua publish, test het han, question/option/score khong hop le, application khong du dieu kien assign, vuot qua duration |
| `403` | Khong co JWT hop le, sai role, recruiter khong co quyen tren job/test, candidate truy cap assignment khong thuoc ve minh |
| `404` | Khong tim thay test, question, assignment, answer, job hoac application |
| `409` | Assign trung application, candidate submit lai, gui duplicate answer |

Message assessment backend dang co:

```text
Assessment test not found
Assessment question not found
Assessment assignment not found
Candidate answer not found
You do not have permission to access this assessment
Assessment test is not published
Assessment test is not open or has expired
This assignment has already been submitted
This application is already assigned to the assessment test
Invalid assessment question
Invalid assessment option
Invalid assessment score
Assessment test must have at least one question
Multiple choice questions must have at least two options
Multiple choice questions must have at least one correct option
Assessment duration has been exceeded
Application is not eligible for this assessment
Assignment status is invalid for this action
Duplicate answer for the same question is not allowed
```

## 10. Prerequisite recruiter va khac biet voi file test cu

File `test_api_recruiter_requirement.txt` mo ta flow recruiter request cu. Code backend hien
tai da thay doi. FE khong dung cac field `type`, `companyId`, `reason` cho recruiter upgrade
request.

API candidate gui yeu cau len admin:

```http
POST /api/v1/recruiter-requests
Authorization: Bearer <candidateAccessToken>
Content-Type: application/json
```

Request body optional:

```json
{
  "message": "I want to use WorkHub as a recruiter."
}
```

Admin approve:

```http
PATCH /api/v1/recruiter-requests/{requestId}/approve
```

Sau approve, user duoc doi role thanh recruiter. Assessment module khong tu tao company va
khong xu ly company join request.

## 11. Gioi han backend hien tai FE can biet

Day la han che cua code hien tai, khong phai API FE bi bo sot:

1. Chua co API recruiter lay danh sach test theo job hoac theo recruiter.
2. Chua co API recruiter lay chi tiet test bang `testId`.
3. Chua co pagination, filter, sorting cho assignment, result hoac candidate test list.
4. Chua co API autosave draft answer. Candidate submit mot lan.
5. Backend hien cho phep candidate submit danh sach answer khong day du. FE nen validate da
   tra loi het cac cau bat buoc truoc khi submit neu UI yeu cau.
6. Backend chua chan recruiter them, sua, xoa cau hoi sau khi publish hoac sau khi co
   submission. FE nen khoa editor sau publish de tranh thay doi de thi dang duoc lam.
7. Backend cho phep xoa test o moi status. FE nen confirm ky truoc khi xoa.
8. Endpoint candidate detail hien co the doc de bai truoc `startAt` neu assignment thuoc ve
   candidate. Endpoint start va submit van enforce time window.
9. `EXPIRED` khong tu cap nhat theo scheduler. Backend chi set khi candidate submit qua han.
10. Chua co API cap nhat `recruiterFeedback` tong quan cho assignment.
11. Chua co API re-open test hoac re-assign mot application da duoc assign cung test.

Neu FE can man hinh recruiter assessment hoan chinh sau reload trang, backend can bo sung toi
thieu:

```http
GET /api/v1/recruiter/jobs/{jobId}/tests
GET /api/v1/recruiter/tests/{testId}
```

## 12. Frontend implementation checklist

- Gan bearer token cho toan bo assessment requests.
- Sau khi approve recruiter, refresh auth state hoac login lai de nhan role moi.
- Dung ISO local date time khong co `Z`.
- An field dap an dung khoi candidate UI; backend cung da khong tra `correct`.
- Luu `testId` ngay sau create do recruiter chua co API fetch detail lai.
- Dung `applicationId`, khong dung `candidateId`, khi assign bai.
- Countdown theo deadline nho hon giua duration va `testEndAt`.
- Chan double submit tren UI.
- Hien thi trang thai pending manual review neu bai co cau essay chua co diem.
- Refresh result sau khi recruiter cham diem essay.
- Xu ly HTTP `409` rieng cho duplicate assignment va duplicate submit.

## 13. Backend source tham chieu

- `src/main/java/org/example/workhub/controller/RecruiterAssessmentController.java`
- `src/main/java/org/example/workhub/controller/CandidateAssessmentController.java`
- `src/main/java/org/example/workhub/service/impl/AssessmentTestServiceImpl.java`
- `src/main/java/org/example/workhub/service/impl/CandidateAssessmentServiceImpl.java`
- `src/main/java/org/example/workhub/domain/mapper/AssessmentTestMapper.java`
- `src/main/java/org/example/workhub/domain/mapper/AssessmentQuestionMapper.java`
- `src/main/java/org/example/workhub/domain/mapper/CandidateTestAssignmentMapper.java`
- `src/main/java/org/example/workhub/domain/mapper/CandidateAnswerMapper.java`
- `src/main/java/org/example/workhub/controller/RecruiterRequestController.java`

## 14. FE implementation da them

Assessment FE duoc dat tai:

```text
src/features/assessment/
```

Service goi dung cac endpoint trong tai lieu:

```text
src/features/assessment/services/assessmentService.js
```

Route recruiter va admin:

```text
/recruiter/assessments
/recruiter/jobs/:jobId/assessments/create
/recruiter/assessments/:testId
/recruiter/assessments/:testId/edit
/recruiter/assessments/:testId/assign
/recruiter/assessments/:testId/results
/recruiter/assessments/assignments/:assignmentId/answers

/admin/assessments
/admin/jobs/:jobId/assessments/create
/admin/assessments/:testId
/admin/assessments/:testId/edit
/admin/assessments/:testId/assign
/admin/assessments/:testId/results
/admin/assessments/assignments/:assignmentId/answers
```

Route candidate:

```text
/candidate/assessments
/candidate/assessments/:assignmentId/take
/candidate/assessments/:assignmentId/result
```

Recruiter workspace luu snapshot response that tu backend trong `localStorage` theo `userId`
sau create, update, question mutation, publish va close. Day chi la workaround cho gioi han backend:
chua co recruiter list API va recruiter detail API. FE khong sinh test gia. Khi backend bo
sung hai GET endpoint o muc 11, thay registry snapshot bang du lieu fetch tu server.

Candidate take page validate da tra loi tat ca cau hoi, khoa submit khi countdown het han va
tinh countdown theo deadline nho hon giua `startedAt + durationMinutes` va `testEndAt`.
Recruiter question editor duoc khoa sau publish de tranh thay doi de thi dang duoc lam.
