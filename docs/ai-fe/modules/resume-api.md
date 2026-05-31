# Resume Module API Documentation

## 1. Purpose

The resume module manages candidate CV files, metadata, skills, default/public flags,
download metadata, admin search, recruiter access after job application, and asynchronous
resume parsing.

Base path:

```text
/api/v1/resume
```

## 2. Endpoint Summary

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/resume` | `ROLE_CANDIDATE` or `ROLE_ADMIN` | Upload resume |
| `PUT` | `/api/v1/resume/{id}` | Owner or `ROLE_ADMIN` | Update metadata |
| `PUT` | `/api/v1/resume/{id}/file` | Owner or `ROLE_ADMIN` | Replace file |
| `DELETE` | `/api/v1/resume/{id}` | Owner or `ROLE_ADMIN` | Soft-delete resume |
| `GET` | `/api/v1/resume/{id}` | Authenticated; owner, admin, or public resume | Get detail |
| `GET` | `/api/v1/resume/me` | Authenticated | Get current user's resumes |
| `GET` | `/api/v1/resume/admin` | `ROLE_ADMIN` | Search all resumes |
| `PUT` | `/api/v1/resume/{id}/default` | Owner or `ROLE_ADMIN` | Set default resume |
| `GET` | `/api/v1/resume/{id}/download` | Authenticated; owner, admin, or public resume | Get download metadata |
| `GET` | `/api/v1/job/{jobId}/candidates/{candidateId}/resume` | Recruiter owning job or `ROLE_ADMIN` | View candidate resume after application |
| `GET` | `/api/v1/job/{jobId}/candidates/{candidateId}/resume/download` | Recruiter owning job or `ROLE_ADMIN` | Get candidate download metadata |

## 3. Resume Response Schema

Resume detail and mutation APIs return:

```json
{
  "id": 11,
  "title": "Senior Java Backend Resume",
  "fileName": "resume.pdf",
  "fileUrl": "https://example.com/resume.pdf",
  "fileType": "pdf",
  "fileSize": 120000,
  "isDefault": true,
  "isPublic": false,
  "deleted": false,
  "summary": "Java backend engineer with Spring Boot experience",
  "atsScore": 86,
  "parsedContent": "Parsed CV text",
  "status": "PENDING",
  "uploadedAt": "2026-05-31T14:30:00",
  "candidate": {
    "id": "candidate-uuid",
    "username": "candidate01",
    "email": "candidate@example.com",
    "phone": "0912345678",
    "headline": "Java Developer",
    "avatar": "https://example.com/avatar.png"
  },
  "job": {
    "id": 20,
    "title": "Senior Java Developer",
    "companyName": "WorkHub Technologies"
  },
  "skills": [
    {
      "id": 1,
      "name": "Java",
      "level": "BACKEND"
    }
  ],
  "createdDate": "2026-05-31T14:30:00",
  "lastModifiedDate": "2026-05-31T14:30:00"
}
```

Nullable fields, including `atsScore`, `parsedContent`, `status`, and `job`, may be omitted.

## 4. Upload Resume

```http
POST /api/v1/resume
Authorization: Bearer <candidateAccessToken>
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `title` | `string` | Yes | Non-blank, maximum `150` characters; unique per user ignoring case |
| `summary` | `string` | No | Maximum `2000` characters |
| `isDefault` | `boolean` | No | Defaults to `false` |
| `isPublic` | `boolean` | No | Defaults to `false` |
| `skillIds` | `long[]` | No | Existing skill IDs; send repeated form values when needed |
| `file` | `file` | Yes | PDF, DOC, or DOCX; maximum `10 MiB` |

Example curl:

```bash
curl -X POST "http://localhost:8080/api/v1/resume" \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Senior Java Backend Resume" \
  -F "summary=Java backend engineer" \
  -F "isDefault=true" \
  -F "skillIds=1" \
  -F "skillIds=2" \
  -F "file=@resume.pdf"
```

Success: HTTP `201`, with the resume response schema.

After upload, parsing is queued asynchronously. FE should not expect `atsScore` or
`parsedContent` to be available immediately.

## 5. Update Resume Metadata

```http
PUT /api/v1/resume/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body:

```json
{
  "title": "Senior Java Backend Resume 2026",
  "summary": "Updated summary",
  "isPublic": true,
  "isDefault": true,
  "skillIds": [1, 2]
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | `string` | No | Maximum `150` characters; blank values are ignored |
| `summary` | `string` | No | Maximum `2000` characters |
| `isPublic` | `boolean` | No | |
| `isDefault` | `boolean` | No | Setting `true` clears other defaults |
| `skillIds` | `long[]` | No | Existing skill IDs |
| `atsScore` | `integer` | Admin only | Range `0..100` |
| `parsedContent` | `string` | Admin only | ATS/parser content |

Owner or admin can call this API. If `atsScore` or `parsedContent` is supplied, the caller
must be admin.

## 6. Replace Resume File

```http
PUT /api/v1/resume/{id}/file
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

file=<resume file>
```

The replacement file follows the same validation rules as upload. The API resets
`atsScore` and `parsedContent`, updates file metadata, and queues parsing again.

## 7. Delete And Set Default

Soft-delete:

```http
DELETE /api/v1/resume/{id}
Authorization: Bearer <accessToken>
```

Set default:

```http
PUT /api/v1/resume/{id}/default
Authorization: Bearer <accessToken>
```

Both APIs return the updated resume response. Deleting a resume sets `deleted: true` and
`isDefault: false`. Setting one default resume clears the previous defaults for that user.

## 8. Get Resume Detail And Download Metadata

Detail:

```http
GET /api/v1/resume/{id}
Authorization: Bearer <accessToken>
```

Download metadata:

```http
GET /api/v1/resume/{id}/download
Authorization: Bearer <accessToken>
```

Authenticated users may read a resume when they are the owner, an admin, or the resume is
public.

Download response:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 11,
    "title": "Senior Java Backend Resume",
    "fileName": "resume.pdf",
    "fileUrl": "https://example.com/resume.pdf",
    "fileType": "pdf",
    "fileSize": 120000
  }
}
```

The API returns metadata and a URL, not binary file content.

## 9. Search My Resumes Or Admin Resumes

Current user:

```http
GET /api/v1/resume/me?page=0&size=10
Authorization: Bearer <accessToken>
```

Admin:

```http
GET /api/v1/resume/admin?page=0&size=10
Authorization: Bearer <adminAccessToken>
```

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | | Partial title match |
| `atsScoreMin` | `integer` | | Minimum ATS score |
| `atsScoreMax` | `integer` | | Maximum ATS score |
| `skillId` | `long` | | Skill filter |
| `uploadedFrom` | `date` | | Inclusive `yyyy-MM-dd` |
| `uploadedTo` | `date` | | Inclusive `yyyy-MM-dd` |
| `isDefault` | `boolean` | | Default flag |
| `isPublic` | `boolean` | | Public flag |
| `filter` | `string` | | Optional advanced expression for `title`, `atsScore`, `isDefault`, `isPublic` |
| `page` | `integer` | `0` | Zero-based page |
| `size` | `integer` | `10` | Maximum `100` |
| `sortBy` | `string` | `uploadedAt` | Supported: `id`, `title`, `atsScore`, `uploadedAt`, `isDefault`, `isPublic`, `createdDate`, `lastModifiedDate` |
| `sortDir` | `string` | `DESC` | `ASC` or descending fallback |

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 1,
      "totalPages": 1,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "uploadedAt",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

## 10. Recruiter Access After Application

View candidate resume:

```http
GET /api/v1/job/{jobId}/candidates/{candidateId}/resume
Authorization: Bearer <recruiterAccessToken>
```

Download metadata:

```http
GET /api/v1/job/{jobId}/candidates/{candidateId}/resume/download
Authorization: Bearer <recruiterAccessToken>
```

Required rules:

1. Caller is `ROLE_RECRUITER` or `ROLE_ADMIN`.
2. Non-admin recruiter owns the job.
3. Candidate has applied to that job.
4. Candidate has a shareable resume: default or public.

The backend selects a default resume first, then the most recently uploaded shareable
resume.

## 11. Important Errors

| HTTP status | Condition |
| --- | --- |
| `400` | File missing, over `10 MiB`, or not PDF/DOC/DOCX |
| `400` | Invalid request validation |
| `401` | Missing or invalid token |
| `403` | Caller cannot read/manage resume, recruiter does not own job, or candidate has not applied |
| `404` | Resume, skill, user, or shareable candidate resume does not exist |
| `409` | Current user already has a resume with the same title |

