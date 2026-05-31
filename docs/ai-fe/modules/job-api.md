# Job API Documentation for Frontend

Tai lieu nay mo ta contract backend hien tai cua module Job de FE hoac AI co the
trien khai cac man hinh danh sach viec lam, chi tiet viec lam, quan ly tin tuyen
dung, search, favorite va apply job.

## 1. Base URL va authentication

- Base URL: `/api/v1`
- Header cho API can dang nhap:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Backend boc response thanh cong theo format:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Response loi thuong co format:

```json
{
  "status": "ERROR",
  "message": "Error message"
}
```

Loi validate body co the tra `message` la object theo field:

```json
{
  "status": "ERROR",
  "message": {
    "title": "This field is required"
  }
}
```

Response co phan trang dung format:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 25,
      "totalPages": 3,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "createdDate",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

## 2. API nen dung theo man hinh

| Man hinh FE | API nen dung |
| --- | --- |
| Landing page, khong can login | `GET /api/v1/jobs/latest` |
| Search job cho user da login | `GET /api/v1/jobs/search` |
| Goi y o search box | `GET /api/v1/jobs/search/autocomplete` |
| Danh sach job co filter don gian | `GET /api/v1/job` |
| Chi tiet job | `GET /api/v1/job/{id}` |
| Job cua mot company | `GET /api/v1/companies/{id}/jobs` |
| Recruiter tao va quan ly tin | `POST /api/v1/job`, `PUT /api/v1/job/{id}` |
| Candidate luu job | `/api/v1/job/{jobId}/favorite` |
| Candidate apply job | `/api/v1/job/{jobId}/apply` |
| Candidate xem job goi y | `GET /api/v1/candidate/jobs/recommended` |

## 3. Job model

Job response day du duoc tra ve boi CRUD, detail va favorite:

```json
{
  "id": 101,
  "title": "Senior Java Developer",
  "slug": "senior-java-developer",
  "description": "Build backend services",
  "requirement": "Java and Spring Boot experience",
  "benefit": "Insurance and annual bonus",
  "location": "Ho Chi Minh City",
  "salaryMin": "1500",
  "salaryMax": "3000",
  "negotiableSalary": true,
  "level": "SENIOR",
  "employmentType": "FULL_TIME",
  "experienceYears": 3,
  "quantity": 2,
  "expiredAt": "2026-12-31",
  "startDate": "2026-06-15",
  "published": true,
  "expired": false,
  "deleted": false,
  "company": {
    "id": 10,
    "name": "WorkHub",
    "logo": "https://example.com/logo.png",
    "address": "Ho Chi Minh City"
  },
  "recruiter": {
    "id": "user-uuid",
    "username": "recruiter01",
    "email": "recruiter@example.com",
    "avatar": "https://example.com/avatar.png"
  },
  "skills": [
    {
      "id": 1,
      "name": "Java",
      "level": "ADVANCED"
    }
  ],
  "applicationCount": 5,
  "createdDate": "2026-05-31T10:30:00",
  "lastModifiedDate": "2026-05-31T10:45:00",
  "createdBy": "recruiter@example.com"
}
```

### Enum

`level` chi nhan mot trong cac gia tri:

```text
INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR
```

`employmentType` hien la string tu do. FE nen thong nhat cac gia tri nhu
`FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP` de tranh du lieu khong dong
nhat.

### Luu y kieu du lieu

- `salaryMin`, `salaryMax` trong Job CRUD la string, vi du `"1500"`.
- `expiredAt`, `startDate` trong CRUD dung format `YYYY-MM-DD`.
- `slug` do backend tu sinh, FE khong gui field nay.
- `company`, `recruiter`, `applicationCount`, audit fields do backend tu sinh.

## 4. Core Job CRUD APIs

### 4.1. Tao job

```http
POST /api/v1/job
Authorization: Bearer <access_token>
```

Quyen: `RECRUITER` hoac `ADMIN`. User tao job phai dang thuoc mot company.

Request body:

```json
{
  "title": "Senior Java Developer",
  "description": "Build backend services",
  "requirement": "Java and Spring Boot experience",
  "benefit": "Insurance and annual bonus",
  "location": "Ho Chi Minh City",
  "salaryMin": "1500",
  "salaryMax": "3000",
  "negotiableSalary": true,
  "level": "SENIOR",
  "employmentType": "FULL_TIME",
  "experienceYears": 3,
  "quantity": 2,
  "expiredAt": "2026-12-31",
  "startDate": "2026-06-15",
  "skillIds": [1, 2, 3],
  "published": false
}
```

| Field | Required | Validation |
| --- | --- | --- |
| `title` | Yes | Khong rong, toi da 255 ky tu |
| `description` | Yes | Khong rong |
| `requirement` | No | String |
| `benefit` | No | String |
| `location` | Yes | Khong rong |
| `salaryMin` | No | String |
| `salaryMax` | No | String |
| `negotiableSalary` | No | Boolean, mac dinh `false` |
| `level` | Yes | Enum level |
| `employmentType` | No | String |
| `experienceYears` | No | Integer >= 0 |
| `quantity` | No | Integer >= 1, mac dinh `1` |
| `expiredAt` | No | Ngay trong tuong lai |
| `startDate` | No | Date `YYYY-MM-DD` |
| `skillIds` | No | Array ID skill |
| `published` | No | Boolean, mac dinh `false` |

Response: HTTP `201`, `data` la Job model day du.

### 4.2. Cap nhat job

```http
PUT /api/v1/job/{id}
Authorization: Bearer <access_token>
```

Quyen: recruiter tao job do hoac `ADMIN`.

Body dung cac field giong create, nhung tat ca deu optional. Backend chi cap
nhat field duoc gui len.

```json
{
  "title": "Lead Java Developer",
  "salaryMax": "3500",
  "skillIds": [1, 4],
  "published": true
}
```

Gui `"skillIds": []` de xoa tat ca skill cua job. Khong gui `skillIds` neu muon
giu nguyen danh sach skill hien tai.

Response: HTTP `200`, `data` la Job model day du.

### 4.3. Lay chi tiet job

```http
GET /api/v1/job/{id}
Authorization: Bearer <access_token>
```

Quyen: user da dang nhap.

Response: HTTP `200`, `data` la Job model day du.

### 4.4. Danh sach job co filter

```http
GET /api/v1/job?page=0&size=10&keyword=java&location=Ho%20Chi%20Minh&published=true
Authorization: Bearer <access_token>
```

Quyen: user da dang nhap.

| Query param | Type | Default | Mo ta |
| --- | --- | --- | --- |
| `keyword` | string | null | Search trong title, location, description |
| `companyId` | long | null | Loc theo company |
| `salaryMin` | string | null | Loc luong toi thieu |
| `salaryMax` | string | null | Loc luong toi da |
| `location` | string | null | Loc gan dung theo location |
| `level` | string | null | Enum level |
| `employmentType` | string | null | Loc chinh xac |
| `skills` | string | null | Danh sach ID cach nhau boi dau phay, vi du `1,2,3` |
| `experienceYearsMin` | integer | null | So nam kinh nghiem toi thieu |
| `experienceYearsMax` | integer | null | So nam kinh nghiem toi da |
| `published` | boolean | `true` | `true`: tin dang public, `false`: draft |
| `includeExpired` | boolean | `false` | Co lay tin het han hay khong |
| `page` | integer | `0` | 0-based |
| `size` | integer | `10` | So phan tu moi trang |
| `sortBy` | string | `createdDate` | Field sort |
| `sortDir` | string | `DESC` | `ASC` hoac `DESC` |

Response: paginated Job model.

### 4.5. Publish job

```http
PUT /api/v1/job/{id}/publish
Authorization: Bearer <access_token>
```

Quyen: recruiter tao job do hoac `ADMIN`.

Body: khong co.

Response: HTTP `200`, `data` la Job model voi `published: true`.

### 4.6. Unpublish job

```http
PUT /api/v1/job/{id}/unpublish
Authorization: Bearer <access_token>
```

Quyen: recruiter tao job do hoac `ADMIN`.

Body: khong co.

Response: HTTP `200`, `data` la Job model voi `published: false`.

### 4.7. Xoa job

```http
DELETE /api/v1/job/{id}
Authorization: Bearer <access_token>
```

Quyen: recruiter tao job do hoac `ADMIN`. Backend soft-delete job.

Response:

```json
{
  "status": "SUCCESS",
  "data": "Job deleted successfully"
}
```

### 4.8. Thong ke job toan he thong

```http
GET /api/v1/job/statistics
Authorization: Bearer <access_token>
```

Quyen: chi `ADMIN`.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "totalJobs": 150,
    "publishedJobs": 120,
    "draftJobs": 30,
    "expiredJobs": null,
    "totalApplications": 500,
    "pendingApplications": 100,
    "approvedApplications": 50,
    "rejectedApplications": 40,
    "jobsByLevel": {
      "JUNIOR": 20,
      "SENIOR": 30
    },
    "jobsByLocation": {
      "Ho Chi Minh City": 80
    },
    "newJobsThisMonth": null,
    "newJobsToday": null
  }
}
```

`expiredJobs`, `newJobsThisMonth`, `newJobsToday` hien co trong DTO nhung service
chua set gia tri, nen co the bi bo khoi JSON do response loai field null.

## 5. Public latest jobs

Landing page nen dung API nay vi khong can login va chi tra job hop le:

```http
GET /api/v1/jobs/latest?page=0&size=10&sortBy=createdDate&sortDir=DESC
```

Quyen: public.

Backend chi lay job:

- `published = true`
- `deleted = false`
- chua het han
- company dang active

`size` duoc gioi han toi da `100`. `sortBy` hop le:

```text
id, title, location, salaryMin, salaryMax, experienceYears, createdDate,
lastModifiedDate
```

Response item:

```json
{
  "jobId": 101,
  "id": 101,
  "title": "Senior Java Developer",
  "slug": "senior-java-developer",
  "companyId": 10,
  "companyName": "WorkHub",
  "companyLogo": "https://example.com/logo.png",
  "location": "Ho Chi Minh City",
  "salaryMin": "1500",
  "salaryMax": "3000",
  "negotiableSalary": true,
  "level": "SENIOR",
  "experienceYears": 3,
  "employmentType": "FULL_TIME",
  "skillNames": ["Java", "Spring Boot"],
  "expiredAt": "2026-12-31T00:00:00Z",
  "createdDate": "2026-05-31T10:30:00"
}
```

Response tong the la paginated response.

## 6. Job search

### 6.1. Search

```http
GET /api/v1/jobs/search?keyword=java&location=Ho%20Chi%20Minh&skillIds=1,2&pageNum=1&pageSize=10
Authorization: Bearer <access_token>
```

Quyen: user da dang nhap.

| Query param | Type | Default | Mo ta |
| --- | --- | --- | --- |
| `keyword` | string | null | Search full text |
| `location` | string | null | Search location |
| `skillIds` | array | null | Vi du `skillIds=1,2` |
| `skillNames` | array | null | Vi du `skillNames=Java,Spring` |
| `level` | string | null | Enum level |
| `companyId` | long | null | Company ID |
| `salaryMin` | decimal | null | Salary mong muon toi thieu |
| `salaryMax` | decimal | null | Salary mong muon toi da |
| `workMode` | string | null | Hien backend nhan param nhung chua ap dung filter |
| `employmentType` | string | null | Loc chinh xac |
| `pageNum` | integer | `1` | 1-based |
| `pageSize` | integer | `10` | So phan tu moi trang |
| `sortBy` | string | `_score` | `_score`, `createdDate`, `expiredAt`, `salaryMin`, `salaryMax`, `experienceYears`, `title` |
| `isAscending` | boolean | `false` | Chieu sort neu khong sort theo `_score` |

Search uu tien Elasticsearch; neu search engine loi, backend fallback ve JPA voi
mot tap filter rut gon.

Response item:

```json
{
  "id": 101,
  "title": "Senior Java Developer",
  "slug": "senior-java-developer",
  "location": "Ho Chi Minh City",
  "companyId": 10,
  "companyName": "WorkHub",
  "companyLogo": "https://example.com/logo.png",
  "salaryMin": 1500,
  "salaryMax": 3000,
  "negotiableSalary": true,
  "experienceYears": 3,
  "level": "SENIOR",
  "workMode": null,
  "employmentType": "FULL_TIME",
  "skillNames": ["Java", "Spring Boot"],
  "expiredAt": "2026-12-31T00:00:00Z",
  "createdDate": "2026-05-31T10:30:00",
  "matchScore": 8.7,
  "highlightTitle": "Senior <em>Java</em> Developer",
  "highlightDescription": null,
  "highlights": {
    "title": ["Senior <em>Java</em> Developer"]
  }
}
```

Luu y: salary cua search response la number, khac voi Job CRUD response la
string.

### 6.2. Autocomplete

```http
GET /api/v1/jobs/search/autocomplete?keyword=jav&limit=10
Authorization: Bearer <access_token>
```

Quyen: user da dang nhap. `limit` toi da `50`.

Response:

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "text": "Java Developer",
      "type": "JOB_TITLE",
      "jobId": 101,
      "skillId": null,
      "companyId": 10
    },
    {
      "text": "Java",
      "type": "SKILL",
      "jobId": null,
      "skillId": 1,
      "companyId": null
    }
  ]
}
```

`type` co the la `JOB_TITLE`, `SKILL`, `COMPANY`.

### 6.3. Reindex search

```http
POST /api/v1/jobs/search/reindex
Authorization: Bearer <access_token>
```

Quyen: chi `ADMIN`.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "indexedCount": 150,
    "startedAt": "2026-05-31T10:00:00",
    "finishedAt": "2026-05-31T10:00:01",
    "durationMs": 950
  }
}
```

## 7. Recommended jobs

```http
GET /api/v1/candidate/jobs/recommended?page=0&size=10&location=Ho%20Chi%20Minh&refresh=false&explain=true
Authorization: Bearer <access_token>
```

Quyen: user da dang nhap. Candidate can tao job preference truoc khi goi API.

Backend chap nhan hai kieu pagination:

- `page`, `size`: `page` 0-based.
- `pageNum`, `pageSize`: `pageNum` 1-based.

FE nen uu tien `page`, `size` de dong nhat voi cac list screen khac.

Response la paginated response. Item co cac field cua latest job va them diem:

```json
{
  "jobId": 101,
  "id": 101,
  "title": "Senior Java Developer",
  "companyId": 10,
  "companyName": "WorkHub",
  "matchScore": 85.5,
  "contentScore": 80.0,
  "behaviorScore": 90.0,
  "collaborativeScore": 75.0,
  "hybridScore": 85.5,
  "matchedSkills": ["Java"],
  "missingSkills": ["Spring Boot"],
  "reasonCodes": ["MATCHED_SKILL", "MATCHED_LOCATION"],
  "reasons": [
    {
      "code": "MATCHED_SKILL",
      "text": "..."
    }
  ],
  "reasonText": "..."
}
```

Khi `explain=false`, mot so field giai thich co the khong xuat hien.

## 8. Company jobs

```http
GET /api/v1/companies/{companyId}/jobs?pageNum=1&pageSize=10&sortBy=createdDate&isAscending=false
```

Quyen: public.

- Public user chi nhin thay job published va chua het han.
- Recruiter co quyen quan ly company hoac admin co the nhin thay ca draft.
- Pagination cua endpoint nay dung `pageNum` 1-based.

Response: paginated Job model day du.

## 9. Favorite job APIs

Tat ca API favorite can dang nhap.

| Method | URL | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/api/v1/job/{jobId}/favorite` | Khong co | HTTP `201`, FavoriteJobResponse |
| `DELETE` | `/api/v1/job/{jobId}/favorite` | Khong co | `"Job removed from favorites"` |
| `GET` | `/api/v1/jobs/favorites?page=0&size=10` | Khong co | Paginated FavoriteJobResponse |

FavoriteJobResponse:

```json
{
  "id": 30,
  "job": {
    "id": 101,
    "title": "Senior Java Developer"
  },
  "savedAt": "2026-05-31T10:30:00Z",
  "createdDate": "2026-05-31T10:30:00"
}
```

Field `job` thuc te la Job model day du.

## 10. Job application APIs

### Candidate

#### Apply job

```http
POST /api/v1/job/{jobId}/apply
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "coverLetter": "I am interested in this position."
}
```

`coverLetter` la bat buoc. Candidate chi apply duoc job da publish, chua xoa,
chua het han va chua apply truoc do.

#### Withdraw application

```http
DELETE /api/v1/job/{jobId}/apply
Authorization: Bearer <access_token>
```

Chi withdraw duoc application dang `PENDING`.

#### Lay application cua user hien tai

```http
GET /api/v1/applications/me?page=0&size=10
Authorization: Bearer <access_token>
```

### Recruiter va admin

| Method | URL | Mo ta |
| --- | --- | --- |
| `GET` | `/api/v1/job/{jobId}/applications?page=0&size=10` | Danh sach candidate apply job |
| `PUT` | `/api/v1/applications/{applicationId}/status` | Cap nhat trang thai |
| `POST` | `/api/v1/recruiter/applications/{applicationId}/screen` | Dua application vao ATS screening queue |

Body cap nhat status:

```json
{
  "status": "REVIEWING",
  "reviewNote": "Good candidate"
}
```

Status recruiter duoc phep gui: `REVIEWING`, `APPROVED`, `REJECTED`.

JobApplicationResponse:

```json
{
  "id": 500,
  "status": "PENDING",
  "coverLetter": "I am interested in this position.",
  "appliedAt": "2026-05-31T10:30:00Z",
  "reviewedAt": null,
  "reviewNote": null,
  "job": {
    "id": 101,
    "title": "Senior Java Developer",
    "location": "Ho Chi Minh City",
    "companyName": "WorkHub"
  },
  "candidate": {
    "id": "user-uuid",
    "username": "candidate01",
    "email": "candidate@example.com",
    "phone": "0900000000",
    "avatar": "https://example.com/avatar.png",
    "headline": "Backend Developer"
  },
  "createdDate": "2026-05-31T10:30:00"
}
```

Application status trong response co the la:

```text
PENDING, REVIEWING, SCREENED, APPROVED, REJECTED
```

## 11. Cac diem FE can luu y

1. API CRUD `/api/v1/job` can login. Landing page public phai dung
   `/api/v1/jobs/latest`.
2. Backend chua expose endpoint `/api/v1/job/me` du hang so da ton tai. Hien
   recruiter chua co API rieng de lay "my jobs".
3. `GET /api/v1/job/{id}` chi kiem tra job chua bi xoa; user da login co the xem
   draft neu biet ID. Khong nen dua endpoint nay ra public truoc khi backend bo
   sung rule phan quyen.
4. `GET /api/v1/job` cho phep user da login gui `published=false` de xem draft.
   FE candidate khong nen gui tham so nay; backend nen harden neu can bao mat
   draft.
5. Filter salary trong CRUD list dang so sanh string. Search API dung numeric
   salary va phu hop hon cho man hinh search.
6. Create va update job khong bao loi neu mot `skillId` khong ton tai; backend
   se bo qua skill ID do.
7. Search nhan `workMode` nhung Job entity hien chua co field work mode; filter
   nay chua co tac dung va response search thuong tra `workMode: null`.
8. `applicationCount` cua Job model hien duoc map tu resume list, khong phai
   application list. FE khong nen coi day la so application chinh xac neu chua
   duoc backend chinh sua.

## 12. Source files doi chieu

- `src/main/java/org/example/workhub/controller/JobController.java`
- `src/main/java/org/example/workhub/controller/JobSearchController.java`
- `src/main/java/org/example/workhub/controller/JobRecommendationController.java`
- `src/main/java/org/example/workhub/controller/FavoriteJobController.java`
- `src/main/java/org/example/workhub/controller/JobApplicationController.java`
- `src/main/java/org/example/workhub/domain/dto/request/JobCreateRequest.java`
- `src/main/java/org/example/workhub/domain/dto/request/JobUpdateRequest.java`
- `src/main/java/org/example/workhub/domain/dto/request/JobFilterRequest.java`
- `src/main/java/org/example/workhub/domain/dto/response/JobResponse.java`

## 13. Frontend Implementation

Routes:

```text
/jobs
/jobs/:id
/saved-jobs
/applications
/candidate/jobs/recommended
/recruiter/jobs
/recruiter/jobs/create
/recruiter/jobs/:id/edit
/recruiter/jobs/:jobId/applications
/admin/jobs
/admin/jobs/:jobId/applications
```

Service:

```text
src/features/job/services/jobService.js
```

Reusable UI:

```text
src/features/job/components/JobCard.jsx
src/features/job/components/JobForm.jsx
src/features/job/components/JobStatusBadge.jsx
src/features/job/components/ApplicationStatusBadge.jsx
```

Implemented flows:

- Public `/jobs` uses `/jobs/latest`; signed-in users use `/jobs/search` with autocomplete,
  salary, location, level, employment type, skill, sorting, and pagination controls.
- Job detail is protected because backend `GET /job/{id}` requires authentication.
- Candidate flow supports save/remove favorite, saved-job list, apply with required cover
  letter, withdraw pending application, application history, and recommended jobs.
- Recruiter flow resolves the current company first, then uses company jobs because the
  backend does not expose `/job/me`. It supports create, update, publish, unpublish,
  soft-delete, application review, and ATS screening.
- Admin flow supports full list filters, statistics, publish, unpublish, soft-delete,
  application review, candidate resume access, and Elasticsearch reindex.

UI states and guards:

- Async screens handle loading, error, empty result, submit loading, pagination, and
  refetch after mutations.
- Candidate, recruiter, and admin pages are protected with existing role guards.
- Public users see latest jobs and are sent to login before protected detail/search flows.
- `workMode` is not exposed as an active filter because backend currently ignores it.
- Recruiter list does not display an inaccurate application total from `applicationCount`.
- Admin publication filtering intentionally switches between published and draft jobs.
  Core `GET /job` does not expose an all-publication-state option because omitting
  `published` defaults to `true`.
