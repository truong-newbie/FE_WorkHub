# Hybrid Job Recommendation - Backend Contract for Frontend

## 1. Ket luan nhanh

FE can lam phan tich hop recommendation.

Backend da tu tinh diem, xep hang va loai job khong hop le. FE khong can tu viet scoring
logic. Tuy nhien, FE van phai:

1. Lam onboarding job preference cho candidate.
2. Hien thi latest jobs va recommended jobs.
3. Gui behavior tracking khi candidate view job, click job va search.
4. Tiep tuc dung API save favorite va apply job hien co. Backend tu doc hai signal nay.
5. Hien thi match score va ly do recommendation neu UI can explainable recommendation.

Neu FE chi goi API recommended jobs ma khong gui behavior tracking, engine van chay nhung
phan behavior score se thieu du lieu va ket qua ca nhan hoa kem hon.

Tai lieu nay duoc viet theo code backend hien tai. Hai file:

```text
test_api_hybrid_recommendation.txt
test_api_job_recommendation.txt
```

chi duoc dung de doi chieu flow. Mot so field, pagination va response wrapper trong cac file
test cu khong con trung voi code.

## 2. Engine dang chay nhu the nao

Khi FE goi:

```http
GET /api/v1/candidate/jobs/recommended
```

backend tinh hybrid score theo cong thuc:

```text
hybridScore = contentScore * 0.50
            + behaviorScore * 0.30
            + collaborativeScore * 0.20
```

### Content score

Tinh tu job preference cua candidate:

```text
skill match            40%
title match            20%
location + work mode   15%
experience match       15%
salary match           10%
```

### Behavior score

Tinh tu lich su 30 ngay gan nhat:

| Signal | Trong so |
| --- | ---: |
| View job | `1` |
| Click job | `3` |
| Search keyword | `2` |
| Save favorite | `5` |
| Apply job | `10` |

### Collaborative score

Tinh tu hanh vi cua cac user co profile tuong tu:

- Skill overlap.
- Job da apply trung nhau.
- Job da save trung nhau.
- Job da view hoac click trung nhau.

Backend chon toi da `20` similar users co similarity tu `0.25` tro len.

### Job bi loai khoi recommendation

Backend khong recommend:

- Job da deleted.
- Job chua publish.
- Job da expired.
- Job cua company inactive hoac unverified.
- Job candidate da apply va application chua bi soft-delete.

FE khong can loc lai nhung dieu kien nay.

## 3. Base URL va authentication

Base URL local:

```text
http://localhost:8080/api/v1
```

API latest jobs la public. Cac API `/candidate/**` can JWT:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Code hien tai dung `isAuthenticated()` thay vi bat buoc `ROLE_CANDIDATE` cho cac API
recommendation. FE van chi nen hien thi tinh nang nay cho candidate.

## 4. Response wrapper thuc te

Backend hien tai tra:

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
  "message": "Candidate job preference not found"
}
```

Hai file test cu co wrapper `success`, `meta`, `error`, `timestamp`. Wrapper do khong phai
contract backend hien tai.

Pagination response:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 20,
      "totalPages": 2,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "hybridScore",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

Luu y: `meta.pageNum` trong response la 1-based.

## 5. Enum FE can su dung

### WorkMode

```text
ONSITE
REMOTE
HYBRID
```

### EmploymentType

```text
FULL_TIME
PART_TIME
INTERNSHIP
FREELANCE
CONTRACT
```

### CandidateLevel

```text
STUDENT
INTERN
FRESHER
JUNIOR
MIDDLE
SENIOR
```

### RecommendationReasonCode

```text
MATCHED_SKILL
MATCHED_TITLE
MATCHED_LOCATION
MATCHED_WORK_MODE
MATCHED_EMPLOYMENT_TYPE
MATCHED_EXPERIENCE
MATCHED_SALARY
BASED_ON_VIEW_HISTORY
BASED_ON_CLICK_HISTORY
BASED_ON_SAVED_JOBS
BASED_ON_APPLIED_JOBS
BASED_ON_SEARCH_KEYWORD
USERS_LIKE_YOU_APPLIED
USERS_LIKE_YOU_SAVED
```

## 6. Job preference APIs

### 6.1 Kiem tra candidate da onboarding chua

```http
GET /api/v1/candidate/onboarding-status
```

Auth: authenticated user.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "hasJobPreference": false,
    "requiredPreference": true
  }
}
```

FE nen goi API nay sau khi candidate login:

- Neu `requiredPreference: true`, hien onboarding form.
- Neu `hasJobPreference: true`, co the goi recommended jobs.

### 6.2 Tao job preference

```http
POST /api/v1/candidate/job-preference
```

Request:

```json
{
  "desiredJobTitle": "Java Backend Developer",
  "preferredLocation": "Ha Noi",
  "workMode": "HYBRID",
  "employmentType": "FULL_TIME",
  "candidateLevel": "JUNIOR",
  "experienceYears": 2,
  "expectedSalaryMin": 1000,
  "expectedSalaryMax": 2500,
  "skillIds": [1, 2, 3]
}
```

Rule:

- `desiredJobTitle`, `preferredLocation` bat buoc.
- `workMode`, `employmentType`, `candidateLevel` bat buoc.
- `experienceYears` optional nhung neu gui phai lon hon hoac bang `0`.
- `expectedSalaryMin`, `expectedSalaryMax` optional nhung neu gui phai lon hon hoac bang `0`.
- Neu gui ca min va max, `expectedSalaryMax >= expectedSalaryMin`.
- `skillIds` bat buoc va khong duoc rong.
- Moi skill phai ton tai, active va chua deleted.
- Mot candidate chi tao preference mot lan. Lan sau dung API update.

FE lay `skillIds` tu module skills hien co, vi du:

```http
GET /api/v1/skills
GET /api/v1/skills/search
GET /api/v1/skills/suggestions
```

Response: HTTP `201`.

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "candidateId": "candidate-user-id",
    "desiredJobTitle": "Java Backend Developer",
    "preferredLocation": "Ha Noi",
    "workMode": "HYBRID",
    "employmentType": "FULL_TIME",
    "candidateLevel": "JUNIOR",
    "experienceYears": 2,
    "expectedSalaryMin": 1000,
    "expectedSalaryMax": 2500,
    "skills": [
      {
        "id": 1,
        "name": "Java",
        "slug": "java"
      }
    ],
    "createdDate": "2026-06-01T15:00:00",
    "lastModifiedDate": "2026-06-01T15:00:00"
  }
}
```

### 6.3 Lay preference hien tai

```http
GET /api/v1/candidate/job-preference
```

Response: HTTP `200`, `data` giong response create.

Neu candidate chua co preference, backend tra loi.

### 6.4 Cap nhat preference

```http
PUT /api/v1/candidate/job-preference
```

Request body giong create preference.

Tat ca field van bat buoc khi update. Day khong phai partial update.

Response: HTTP `200`, `data` la preference sau update.

## 7. Latest jobs API

```http
GET /api/v1/jobs/latest?page=0&size=10&sortBy=createdDate&sortDir=DESC
```

Auth: public, khong can JWT.

Query params:

| Param | Default | Ghi chu |
| --- | --- | --- |
| `page` | `0` | 0-based |
| `size` | `10` | Toi da `100` |
| `sortBy` | `createdDate` | Xem danh sach field hop le ben duoi |
| `sortDir` | `DESC` | `ASC` hoac `DESC`; gia tri khac se thanh `DESC` |

`sortBy` hop le:

```text
id
title
location
salaryMin
salaryMax
experienceYears
createdDate
lastModifiedDate
```

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 20,
      "totalPages": 2,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "createdDate",
      "sortType": "DESC"
    },
    "items": [
      {
        "jobId": 12,
        "id": 12,
        "title": "Java Backend Developer",
        "slug": "java-backend-developer",
        "companyId": 2,
        "companyName": "WorkHub Labs",
        "companyLogo": "https://example.com/logo.png",
        "location": "Ha Noi",
        "salaryMin": "1000",
        "salaryMax": "2500",
        "negotiableSalary": false,
        "level": "JUNIOR",
        "experienceYears": 2,
        "employmentType": "FULL_TIME",
        "skillNames": ["Java", "Spring Boot"],
        "expiredAt": "2026-07-01T00:00:00Z",
        "createdDate": "2026-06-01T12:00:00"
      }
    ]
  }
}
```

Latest jobs khong co personalized scores.

## 8. Recommended jobs API

```http
GET /api/v1/candidate/jobs/recommended?pageNum=1&pageSize=10&location=Ha%20Noi&explain=true
```

Auth: authenticated user. Candidate phai co job preference truoc.

Query params nen dung:

| Param | Default | Ghi chu |
| --- | --- | --- |
| `pageNum` | `1` | 1-based |
| `pageSize` | `10` | Toi da `100` |
| `location` | none | Optional; filter theo location |
| `explain` | `true` | Neu `true`, backend tra `reasons` va `reasonText` |
| `refresh` | `false` | Backend hien nhan param nhung chua dung |

Backend cung ho tro alias cu:

| Param | Ghi chu |
| --- | --- |
| `page` | 0-based; neu gui thi uu tien hon `pageNum` |
| `size` | Neu co `pageSize`, backend uu tien `pageSize` |

De tranh nham lan, FE nen thong nhat chi gui `pageNum` va `pageSize`.

Response voi `explain=true`:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 5,
      "totalPages": 1,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "hybridScore",
      "sortType": "DESC"
    },
    "items": [
      {
        "jobId": 12,
        "id": 12,
        "title": "Java Backend Developer",
        "slug": "java-backend-developer",
        "companyId": 2,
        "companyName": "WorkHub Labs",
        "companyLogo": "https://example.com/logo.png",
        "location": "Ha Noi",
        "salaryMin": "1000",
        "salaryMax": "2500",
        "negotiableSalary": false,
        "level": "JUNIOR",
        "experienceYears": 2,
        "employmentType": "FULL_TIME",
        "matchScore": 71.9,
        "contentScore": 84.5,
        "behaviorScore": 72.0,
        "collaborativeScore": 40.0,
        "hybridScore": 71.9,
        "skillNames": ["Java", "Spring Boot", "MySQL"],
        "expiredAt": "2026-07-01T00:00:00Z",
        "matchedSkills": ["Java", "Spring Boot"],
        "missingSkills": ["MySQL"],
        "matchReasons": [
          "recommendation.reason.skill.match",
          "recommendation.reason.title.match"
        ],
        "reasonCodes": [
          "MATCHED_SKILL",
          "MATCHED_TITLE",
          "MATCHED_LOCATION",
          "BASED_ON_CLICK_HISTORY",
          "BASED_ON_SEARCH_KEYWORD"
        ],
        "reasons": [
          {
            "code": "MATCHED_SKILL",
            "text": "Job skills overlap with your preference skills"
          },
          {
            "code": "BASED_ON_SEARCH_KEYWORD",
            "text": "Matches your recent search keywords"
          }
        ],
        "reasonText": "Recommended because you match 2 required skill(s), and your recent behavior points to similar jobs.",
        "createdDate": "2026-06-01T12:00:00"
      }
    ]
  }
}
```

Luu y:

- `matchScore` hien bang `hybridScore`.
- `reasonCodes` van duoc tra khi `explain=false`.
- `reasons` va `reasonText` chi duoc tra khi `explain=true`.
- Cac field nullable hoac danh sach rong co the bi omit khoi JSON.
- Backend sap xep theo `hybridScore DESC`, neu bang diem thi `createdDate DESC`.
- Backend luu recommendation log moi lan tra items cho candidate.

## 9. Behavior tracking APIs

FE phai goi cac endpoint nay. API doc khong tu dong co nghia la tracking da duoc nhung vao
API view job, click card hoac search hien co.

### 9.1 Track view job

```http
POST /api/v1/candidate/jobs/{jobId}/view
```

Thoi diem goi de xuat:

- Khi candidate mo trang detail job.
- Chi goi khi user da login.
- Co the debounce hoac chi goi mot lan moi lan mo detail de tranh tao nhieu record do render
  lai.

Request body optional:

```json
{
  "source": "HOME_RECOMMENDATION",
  "sessionId": "session-abc-123"
}
```

Response:

```json
{
  "status": "SUCCESS"
}
```

### 9.2 Track click job

```http
POST /api/v1/candidate/jobs/{jobId}/click
```

Thoi diem goi de xuat:

- Khi candidate click vao job card.
- Nen goi truoc hoac song song voi viec dieu huong sang detail.
- Loi tracking khong nen chan navigation.

Request body optional:

```json
{
  "source": "RECOMMENDATION",
  "sessionId": "session-abc-123",
  "position": 3
}
```

`position` nen la thu tu item tren list recommendation de phuc vu analytics.

Response:

```json
{
  "status": "SUCCESS"
}
```

### 9.3 Track search keyword

```http
POST /api/v1/candidate/jobs/search-track
```

Thoi diem goi de xuat:

- Khi candidate submit search form.
- Khong goi moi lan user go mot ky tu.

Request:

```json
{
  "keyword": "java developer",
  "filtersJson": "{\"location\":\"Ha Noi\",\"workMode\":\"ONSITE\"}"
}
```

Rule:

- `keyword` bat buoc, khong duoc blank.
- `filtersJson` optional.
- `filtersJson` la JSON stringify, khong phai nested object.

Response:

```json
{
  "status": "SUCCESS"
}
```

### 9.4 Lay behavior summary

```http
GET /api/v1/candidate/recommendation/behavior-summary
```

Endpoint nay optional cho FE. Engine khong can FE goi no de hoat dong.

Chi can dung neu FE muon hien thi analytics hoac trang debug preference:

```json
{
  "status": "SUCCESS",
  "data": {
    "totalViewed": 5,
    "totalClicked": 3,
    "totalSaved": 2,
    "totalApplied": 1,
    "topSkillInterests": ["Java", "Spring Boot", "React"],
    "topTitleKeywords": ["java", "developer", "backend"],
    "topLocations": ["Ha Noi", "Remote"]
  }
}
```

Summary dung du lieu 30 ngay gan nhat.

## 10. Signal save va apply da duoc nhung vao API cu

FE khong can goi behavior tracking rieng cho save va apply.

### Save favorite

Dung API hien co:

```http
POST /api/v1/job/{jobId}/favorite
```

Bo favorite:

```http
DELETE /api/v1/job/{jobId}/favorite
```

Backend recommendation doc truc tiep favorite records active trong 30 ngay gan nhat.

### Apply job

Dung API hien co:

```http
POST /api/v1/job/{jobId}/apply
```

Hoac endpoint ATS candidate:

```http
POST /api/v1/candidate/jobs/{jobId}/apply
```

Request:

```json
{
  "resumeId": 1,
  "coverLetter": "I am interested in this position."
}
```

Backend recommendation doc truc tiep application records active trong 30 ngay gan nhat.
Job da apply se bi loai khoi recommended jobs.

## 11. Flow FE de xuat

### Candidate onboarding

1. Candidate login.
2. Goi `GET /candidate/onboarding-status`.
3. Neu thieu preference, mo onboarding form.
4. Lay skill list tu module skills.
5. Submit `POST /candidate/job-preference`.
6. Dieu huong sang personalized job feed.

### Home page

1. Neu chua login, goi `GET /jobs/latest`.
2. Neu candidate da login va da onboarding, goi `GET /candidate/jobs/recommended`.
3. Hien thi job cards theo thu tu backend tra ve.
4. Hien thi `matchScore` va `reasonText` neu UI can explainability.
5. Khi click card, gui track click.
6. Khi detail page mo, gui track view.

### Search page

1. User submit keyword va filter.
2. FE goi search API hien co.
3. Neu user da login, gui them `POST /candidate/jobs/search-track`.
4. Loi tracking khong chan ket qua search.

### Save va apply

1. FE dung save favorite va apply API hien co.
2. Sau khi apply thanh cong, refresh recommended list neu dang o recommendation feed.
3. FE khong tu ghi SAVE hoac APPLY tracking record rieng.

## 12. FE implementation checklist

- Tao onboarding preference form cho candidate.
- Dung multi-select skill va gui `skillIds`.
- Dung `pageNum`, `pageSize` cho recommended jobs.
- Dung `page`, `size` cho latest jobs.
- Tao personalized job feed bang `GET /candidate/jobs/recommended`.
- Hien thi `matchScore` hoac `hybridScore`.
- Hien thi `reasonText` hoac `reasons` neu can explainable UI.
- Track click khi candidate click job card.
- Track view khi candidate mo detail job.
- Track search khi candidate submit search.
- Khong chan UX chinh neu request tracking loi.
- Sau save, unsave, apply hoac update preference, refresh recommended feed.
- Khong tu tinh ranking, score hoac filter job da apply o FE.

## 13. Khac biet voi hai file test cu

### Khac biet quan trong

| Noi dung | File test cu | Code hien tai |
| --- | --- | --- |
| Response wrapper | `success`, `meta`, `error`, `timestamp` | `status`, `data`, `message` |
| Latest jobs `page` | Tai lieu cu mo ta 1-based | Backend dung 0-based |
| Recommended pagination | Co file dung `page`, `size`; co file dung `pageNum`, `pageSize` | Backend ho tro ca hai; nen dung `pageNum`, `pageSize` |
| Recommended sort | File cu co the ghi `matchScore` | Backend meta tra `hybridScore` |
| Matched skills | Co file cu mo ta object skill | Backend tra danh sach ten skill: `["Java"]` |
| Reason code | Co file dung `matchReasonCodes` | Backend tra `reasonCodes`; van co `matchReasons` legacy |
| `refresh` | File hybrid co param | Backend nhan param nhung chua dung |
| `explain` | File hybrid co param | Backend dung that; mac dinh `true` |

## 14. Gioi han backend hien tai FE can biet

1. `refresh` hien khong thay doi logic. FE co the bo qua.
2. Tracking endpoint cho phep moi authenticated user goi, khong gioi han role candidate.
3. Preference endpoint cung chi check authenticated user. FE nen an UI voi recruiter/admin.
4. Backend tao mot history row moi moi lan FE goi track view hoac click. FE nen debounce.
5. Backend chua co endpoint xoa preference.
6. Backend chua co API doc recommendation history cho FE.
7. Behavior summary chi la optional debug/analytics UI.
8. Latest jobs filter company active nhung repository latest khong enforce verified; personalized
   recommendation co enforce active va verified.
9. `reasonText` tu backend dang la tieng Anh. Neu UI can tieng Viet, FE co the map
   `reasonCodes` sang i18n text.
10. `matchReasons` la danh sach key legacy. FE moi nen uu tien `reasonCodes`, `reasons` va
    `reasonText`.

## 15. Backend source tham chieu

- `src/main/java/org/example/workhub/controller/CandidateJobPreferenceController.java`
- `src/main/java/org/example/workhub/controller/JobRecommendationController.java`
- `src/main/java/org/example/workhub/controller/JobBehaviorController.java`
- `src/main/java/org/example/workhub/service/impl/CandidateJobPreferenceServiceImpl.java`
- `src/main/java/org/example/workhub/service/impl/JobRecommendationServiceImpl.java`
- `src/main/java/org/example/workhub/service/impl/JobBehaviorServiceImpl.java`
- `src/main/java/org/example/workhub/config/RecommendationProperties.java`
- `src/main/java/org/example/workhub/domain/dto/response/RecommendedJobResponse.java`
- `src/main/java/org/example/workhub/domain/dto/response/JobBehaviorSummaryResponse.java`
- `src/main/java/org/example/workhub/domain/dto/response/CandidateJobPreferenceResponse.java`

## 16. FE implementation da them

Route candidate:

```text
/candidate/jobs/recommended
/candidate/job-preference
```

Hai route deu nam trong candidate role guard hien co. Sau login thuong hoac OAuth, FE goi
`GET /candidate/onboarding-status` cho candidate neu khong co route quay lai cu the. Neu
candidate chua co preference, FE dieu huong toi `/candidate/job-preference`.

Service recommendation:

```text
src/features/recommendation/services/recommendationService.js
```

Service da tich hop:

```text
GET  /candidate/onboarding-status
GET  /candidate/job-preference
POST /candidate/job-preference
PUT  /candidate/job-preference
GET  /candidate/jobs/recommended
POST /candidate/jobs/{jobId}/view
POST /candidate/jobs/{jobId}/click
POST /candidate/jobs/search-track
```

UI da implement:

- Form onboarding va update preference dung dung request DTO, reuse `SkillSelector` va
  validate required field, salary range, experience khong am, it nhat mot skill.
- Recommended feed dung `pageNum`, `pageSize`, `location`, `explain=true`; hien thi
  `matchScore`, `reasonText`, matched skills va missing skills.
- Feed co CTA setup/update preference, loading, empty va error state.
- Feed reuse favorite API hien co va link detail `/jobs/:id`. Apply tiep tuc dung form tren
  job detail hien co.
- Click card recommendation gui tracking best-effort kem `source=RECOMMENDATION` va
  `position`.
- Job detail gui view tracking best-effort. Search page chi gui search tracking khi
  candidate submit keyword khong rong. Loi tracking khong chan UX chinh va khong cleanup
  session.

Backend hien chua co feedback endpoint interested, not-interested hoac hide. FE khong hien
thi cac action do. Param `refresh` cung chua thay doi logic backend nen FE khong tao nut
refresh gia.
