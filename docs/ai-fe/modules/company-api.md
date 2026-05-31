# Company Module API Documentation

## 1. Purpose

The company module provides public company discovery, recruiter-owned company management,
admin moderation, logo/cover uploads, company jobs, statistics, and recruiter join
requests.

Base path:

```text
/api/v1/companies
```

The recruiter onboarding join-request flow is included in section 12.

## 2. Endpoint Summary

### Company CRUD And Moderation

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/companies` | Public | Search companies |
| `GET` | `/api/v1/companies/{id}` | Public for visible companies | Get detail |
| `GET` | `/api/v1/companies/me` | `ROLE_RECRUITER` or `ROLE_ADMIN` | Get current user's company |
| `POST` | `/api/v1/companies` | `ROLE_RECRUITER` or `ROLE_ADMIN` | Create company |
| `PUT` | `/api/v1/companies/{id}` | Company manager or admin | Update company |
| `PUT` | `/api/v1/companies/me` | `ROLE_RECRUITER` or `ROLE_ADMIN` with linked company | Update current company |
| `POST` | `/api/v1/companies/{id}/logo` | Company manager or admin | Upload logo |
| `POST` | `/api/v1/companies/{id}/cover` | Company manager or admin | Upload cover |
| `PATCH` | `/api/v1/companies/{id}/enable` | `ROLE_ADMIN` | Enable company |
| `PATCH` | `/api/v1/companies/{id}/disable` | `ROLE_ADMIN` | Disable company |
| `PATCH` | `/api/v1/companies/{id}/approve` | `ROLE_ADMIN` | Verify company |
| `PATCH` | `/api/v1/companies/{id}/reject` | `ROLE_ADMIN` | Reject verification |
| `GET` | `/api/v1/companies/{id}/jobs` | Public for visible companies | Get company jobs |
| `GET` | `/api/v1/companies/{id}/statistics` | Company manager or admin | Get statistics |
| `DELETE` | `/api/v1/companies/{id}` | Company manager or admin | Soft-delete company |

Company manager means admin, company owner, or recruiter already linked to the company.

### Company Join Requests

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/companies/{companyId}/join-requests` | `ROLE_RECRUITER` | Request to join company |
| `GET` | `/api/v1/companies/join-requests/me` | `ROLE_RECRUITER` | Get my requests |
| `GET` | `/api/v1/companies/{companyId}/join-requests` | Company owner or `ROLE_ADMIN` | Review list |
| `PATCH` | `/api/v1/companies/join-requests/{requestId}/approve` | Company owner or `ROLE_ADMIN` | Approve request |
| `PATCH` | `/api/v1/companies/join-requests/{requestId}/reject` | Company owner or `ROLE_ADMIN` | Reject request |

## 3. Company Response Schema

```json
{
  "id": 12,
  "name": "WorkHub Technologies",
  "slug": "workhub-technologies",
  "description": "Software company",
  "website": "https://workhub.vn",
  "email": "hr@workhub.vn",
  "phone": "+84901234567",
  "address": "District 1",
  "city": "Ho Chi Minh City",
  "country": "Vietnam",
  "companySize": "51-200",
  "industry": "Software",
  "taxCode": "0312345678",
  "active": true,
  "verified": true,
  "deleted": false,
  "logo": "https://example.com/logo.png",
  "coverImage": "https://example.com/cover.png",
  "owner": {
    "id": "owner-uuid",
    "username": "owner01",
    "email": "owner@example.com"
  }
}
```

Nullable fields may be omitted.

## 4. Search Companies

```http
GET /api/v1/companies?keyword=software&pageNum=1&pageSize=10
```

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `pageNum` | `integer` | `1` | One-based page |
| `pageSize` | `integer` | `10` | Items per page |
| `sortBy` | `string` | `createdDate` | Supported: `name`, `address`, `city`, `country`, `industry`, `companySize`, `active`, `verified`, `createdDate`, `lastModifiedDate` |
| `isAscending` | `boolean` | `false` | Ascending sort when `true` |
| `keyword` | `string` | `""` | Searches name, description, city, country, industry |
| `name` | `string` | | Partial name match |
| `city` | `string` | | Partial city match |
| `country` | `string` | | Partial country match |
| `industry` | `string` | | Partial industry match |
| `companySize` | `string` | | Exact company-size match |
| `active` | `boolean` | | Active filter |
| `verified` | `boolean` | | Verification filter |
| `createdFrom` | `string` | | ISO local date-time |
| `createdTo` | `string` | | ISO local date-time |

Response is paginated:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 1,
      "totalPages": 1,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "createdDate",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

Public and candidate users only see active, verified, non-deleted companies. Authenticated
recruiters and admins can search all non-deleted companies.

## 5. Get Company Detail Or Current Company

Public detail:

```http
GET /api/v1/companies/{id}
```

Current recruiter company:

```http
GET /api/v1/companies/me
Authorization: Bearer <accessToken>
```

Detail returns the company schema. A public caller receives `404` for an unverified,
disabled, or deleted company. Managers can view their managed company regardless of public
visibility.

## 6. Create Or Update Company

Create:

```http
POST /api/v1/companies
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Update by ID:

```http
PUT /api/v1/companies/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Update current company:

```http
PUT /api/v1/companies/me
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body:

```json
{
  "name": "WorkHub Technologies",
  "description": "Software company",
  "website": "https://workhub.vn",
  "email": "hr@workhub.vn",
  "phone": "+84901234567",
  "address": "District 1",
  "city": "Ho Chi Minh City",
  "country": "Vietnam",
  "companySize": "51-200",
  "industry": "Software",
  "taxCode": "0312345678",
  "logo": "https://example.com/logo.png",
  "coverImage": "https://example.com/cover.png",
  "active": true
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Non-blank, maximum `255`, unique ignoring case |
| `description` | `string` | No | |
| `website` | `string` | No | Must start with `http://` or `https://` |
| `email` | `string` | No | Valid email |
| `phone` | `string` | No | `8..20` characters: digits, spaces, `+`, `(`, `)`, `-` |
| `address` | `string` | No | |
| `city` | `string` | No | |
| `country` | `string` | No | |
| `companySize` | `string` | No | |
| `industry` | `string` | No | |
| `taxCode` | `string` | No | |
| `logo` | `string` | No | URL; file-upload endpoint is preferred |
| `coverImage` | `string` | No | URL; file-upload endpoint is preferred |
| `active` | `boolean` | No | Honored on create; only admin may change it with update-by-ID |

Create and update return the company schema with HTTP `200`.

When a recruiter creates a company:

1. The recruiter becomes owner and is linked to the company.
2. `verified` starts as `false`.
3. Admin approval is required for public visibility.

## 7. Upload Logo Or Cover

```http
POST /api/v1/companies/{id}/logo
POST /api/v1/companies/{id}/cover
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

file=<image file>
```

The part name is `file`. It must not be empty and its content type must start with
`image/`. Both endpoints return the updated company schema.

## 8. Admin Moderation

```http
PATCH /api/v1/companies/{id}/enable
PATCH /api/v1/companies/{id}/disable
PATCH /api/v1/companies/{id}/approve
PATCH /api/v1/companies/{id}/reject
Authorization: Bearer <adminAccessToken>
```

No request body is required. All APIs return the updated company schema. Approve sets
`verified: true` and `active: true`. Reject sets `verified: false`.

## 9. Get Company Jobs

```http
GET /api/v1/companies/{id}/jobs?pageNum=1&pageSize=10
```

This endpoint reuses the company pagination request class. For FE integration, use:

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `pageNum` | `integer` | `1` | One-based page |
| `pageSize` | `integer` | `10` | Items per page |
| `sortBy` | `string` | `createdDate` | Use only `createdDate` or `lastModifiedDate` for this endpoint |
| `isAscending` | `boolean` | `false` | Ascending sort when `true` |

Do not send company-only sort fields such as `name`, `city`, or `verified` to this jobs
endpoint. The current backend applies the resulting sort directly to the `Job` entity.

Public callers receive only published, non-deleted, non-expired jobs from a visible
company. Company managers receive all non-deleted jobs.

Each item uses:

```json
{
  "id": 20,
  "title": "Senior Java Developer",
  "slug": "senior-java-developer",
  "description": "Job description",
  "requirement": "Job requirements",
  "benefit": "Benefits",
  "location": "Ho Chi Minh City",
  "salaryMin": "1000",
  "salaryMax": "3000",
  "negotiableSalary": false,
  "level": "MIDDLE",
  "employmentType": "FULL_TIME",
  "experienceYears": 3,
  "quantity": 2,
  "expiredAt": "2026-12-31",
  "startDate": "2026-06-01",
  "published": true,
  "expired": false,
  "deleted": false,
  "company": {
    "id": 12,
    "name": "WorkHub Technologies",
    "logo": "https://example.com/logo.png",
    "address": "District 1"
  },
  "recruiter": {
    "id": "recruiter-uuid",
    "username": "recruiter01",
    "email": "recruiter@example.com",
    "avatar": "https://example.com/avatar.png"
  },
  "skills": [
    {
      "id": 1,
      "name": "Java",
      "level": "BACKEND"
    }
  ],
  "applicationCount": 4,
  "createdDate": "2026-05-31T14:30:00",
  "lastModifiedDate": "2026-05-31T14:30:00",
  "createdBy": "user-uuid"
}
```

## 10. Company Statistics

```http
GET /api/v1/companies/{id}/statistics
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "companyId": 12,
    "totalJobs": 10,
    "activeJobs": 6,
    "inactiveJobs": 4,
    "totalApplications": 100,
    "pendingApplications": 30,
    "acceptedApplications": 20,
    "rejectedApplications": 50
  }
}
```

## 11. Delete Company

```http
DELETE /api/v1/companies/{id}
Authorization: Bearer <accessToken>
```

Delete is soft-delete and also sets `active: false`.

Response:

```json
{
  "status": "SUCCESS",
  "data": "company.delete.success"
}
```

## 12. Company Join Requests

Submit:

```http
POST /api/v1/companies/{companyId}/join-requests
Authorization: Bearer <recruiterAccessToken>
Content-Type: application/json

{
  "message": "I am HR at this company and want to manage jobs."
}
```

Get current recruiter's requests:

```http
GET /api/v1/companies/join-requests/me?page=0&size=10
Authorization: Bearer <recruiterAccessToken>
```

Get requests for company review:

```http
GET /api/v1/companies/{companyId}/join-requests?page=0&size=10
Authorization: Bearer <accessToken>
```

Approve or reject:

```http
PATCH /api/v1/companies/join-requests/{requestId}/approve
PATCH /api/v1/companies/join-requests/{requestId}/reject
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reviewNote": "Verified recruiter information."
}
```

`message` and `reviewNote` are optional with maximum length `1000`. Review bodies are
optional. Review access is restricted to admin or the requested company's owner.

Join-request response:

```json
{
  "id": 101,
  "status": "PENDING",
  "message": "I am HR at this company and want to manage jobs.",
  "reviewNote": "Verified recruiter information.",
  "reviewedAt": "2026-05-31T15:00:00",
  "createdDate": "2026-05-31T14:30:00",
  "recruiter": {
    "id": "recruiter-uuid",
    "username": "recruiter01",
    "email": "recruiter@example.com"
  },
  "company": {
    "id": 12,
    "name": "WorkHub Technologies",
    "active": true,
    "verified": true
  },
  "reviewedBy": {
    "id": "owner-uuid",
    "username": "owner01",
    "email": "owner@example.com"
  }
}
```

Relevant statuses:

```text
PENDING
APPROVED
REJECTED
```

## 13. Important Rules And Errors

| HTTP status | Condition |
| --- | --- |
| `400` | Invalid company body, duplicate company name, invalid image, or invalid moderation state |
| `400` | Recruiter already belongs to a company or target company cannot receive join requests |
| `401` | Missing or invalid token on protected APIs |
| `403` | Caller cannot manage company or review join request |
| `404` | Company or join request does not exist; public company is hidden |
| `409` | Pending join request already exists for recruiter and company |

Approving a join request links the recruiter to the company and automatically rejects the
same recruiter's other pending join requests.

Current backend limitation: company creation does not reject a recruiter who is already
linked to a company. FE should hide the create-company action when the current profile
already has `companyId`.
