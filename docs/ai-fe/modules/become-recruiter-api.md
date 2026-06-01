# Become Recruiter API Documentation

This document describes the backend APIs currently available for the "Become Recruiter"
frontend flow.

## 1. Important Backend Limitation

The current backend does **not** provide an API for a candidate to request or perform a
self-service role upgrade from `ROLE_CANDIDATE` to `ROLE_RECRUITER`.

The only existing role-change API is admin-only:

```text
PUT /api/v1/user/{userId}/role
```

After a user already has `ROLE_RECRUITER`, the recruiter can:

1. Search for an existing company.
2. Create a new company and become its owner.
3. Request to join an existing active and verified company.
4. View the status of their company join requests.

A company owner or admin can approve or reject an existing join request.

## 2. Base URL And Authentication

Local development base URL:

```text
http://localhost:8080/api/v1
```

Protected APIs require:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Role names use the `ROLE_` prefix:

```text
ROLE_ADMIN
ROLE_RECRUITER
ROLE_CANDIDATE
```

## 3. Shared Response Format

Successful APIs use:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Error APIs usually use:

```json
{
  "status": "ERROR",
  "message": "Error message"
}
```

Validation errors use an object in `message`:

```json
{
  "status": "ERROR",
  "message": {
    "message": "Invalid value"
  }
}
```

Nullable response fields may be omitted. Date-time values are local ISO date-time strings
without an explicit timezone, for example:

```text
2026-05-31T14:30:00
```

## 4. Recommended Frontend Flow

### 4.1 Candidate Wants To Become A Recruiter

The frontend cannot complete this step using the current backend. It can display a CTA or
an informational state, but a backend endpoint must be added if the product requires a
candidate-facing upgrade request.

For internal testing, an admin can change the user's role using the API in section 5.
After the role change, the user should log in again so the JWT contains the updated
authority.

### 4.2 Recruiter Company Onboarding

Once the user has `ROLE_RECRUITER`:

1. Call `GET /user/me/profile`.
2. If `companyId` exists, the recruiter is already linked to a company.
3. If `companyId` is missing, show two choices:
   - Create a new company with `POST /companies`.
   - Join an existing company by searching with `GET /companies`, then submit
     `POST /companies/{companyId}/join-requests`.
4. For the join-existing-company branch, show request statuses from
   `GET /companies/join-requests/me`.

## 5. Admin Changes User Role To Recruiter

### Request

```http
PUT /api/v1/user/{userId}/role
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

Required role:

```text
ROLE_ADMIN
```

Path parameters:

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `userId` | `string` | Yes | User UUID/string ID |

Body:

```json
{
  "reason": "Approved recruiter onboarding request",
  "newRole": "ROLE_RECRUITER"
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `reason` | `string` | Yes | Must not be blank |
| `newRole` | `string` | Yes for role change | Must match an existing DB role, normally `ROLE_RECRUITER` |

### Success Response

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "user-uuid",
    "username": "recruiter01",
    "email": "recruiter@example.com",
    "roleName": "ROLE_RECRUITER",
    "roleId": 2,
    "enabled": true,
    "deleted": false,
    "createdDate": "2026-05-31T10:00:00",
    "lastModifiedDate": "2026-05-31T14:30:00"
  }
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | `reason` is blank, or `newRole` is blank |
| `401` | Missing or invalid access token |
| `403` | Current user is not admin |
| `404` | User or role does not exist |

## 6. Get Current User Profile

Use this API after login and after recruiter onboarding to determine the current role and
linked company.

### Request

```http
GET /api/v1/user/me/profile
Authorization: Bearer <accessToken>
```

Required role:

```text
Any authenticated user
```

### Success Response

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "user-uuid",
    "username": "recruiter01",
    "email": "recruiter@example.com",
    "roleName": "ROLE_RECRUITER",
    "roleId": 2,
    "companyId": 12,
    "companyName": "WorkHub Technologies",
    "enabled": true,
    "deleted": false,
    "createdDate": "2026-05-31T10:00:00",
    "lastModifiedDate": "2026-05-31T14:30:00"
  }
}
```

If the recruiter is not linked to a company yet, `companyId` and `companyName` are
omitted.

## 7. Search Companies

Use this API when a recruiter wants to join an existing company. Send the recruiter JWT:
authenticated recruiters can see non-deleted companies, while public users only see
active and verified companies.

### Request

```http
GET /api/v1/companies?pageNum=1&pageSize=10&name=WorkHub&city=Ho%20Chi%20Minh%20City
Authorization: Bearer <recruiterAccessToken>
```

Authentication:

```text
Optional, but recommended for recruiter onboarding
```

Query parameters:

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `pageNum` | `integer` | No | `1` | One-based page number |
| `pageSize` | `integer` | No | `10` | Items per page |
| `sortBy` | `string` | No | `createdDate` | Supported values: `name`, `address`, `city`, `country`, `industry`, `companySize`, `active`, `verified`, `createdDate`, `lastModifiedDate` |
| `isAscending` | `boolean` | No | `false` | Sort ascending when `true` |
| `keyword` | `string` | No | `""` | Searches name, description, city, country, and industry |
| `name` | `string` | No | | Filter by company name |
| `city` | `string` | No | | Filter by city |
| `country` | `string` | No | | Filter by country |
| `industry` | `string` | No | | Filter by industry |
| `companySize` | `string` | No | | Filter by company size |
| `active` | `boolean` | No | | Filter by active flag |
| `verified` | `boolean` | No | | Filter by verified flag |
| `createdFrom` | `string` | No | | ISO local date-time |
| `createdTo` | `string` | No | | ISO local date-time |

### Success Response

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
    "items": [
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
    ]
  }
}
```

Only companies with both `active: true` and `verified: true` can receive a join request.

## 8. Create A New Company

Use this branch if the recruiter cannot find their company. When a recruiter creates a
company, the backend immediately links that recruiter to the new company as owner. The
company is initially unverified until admin approval.

### Request

```http
POST /api/v1/companies
Authorization: Bearer <recruiterAccessToken>
Content-Type: application/json
```

Required role:

```text
ROLE_RECRUITER or ROLE_ADMIN
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
| `name` | `string` | Yes | Non-blank, maximum `255` characters, unique ignoring case |
| `description` | `string` | No | |
| `website` | `string` | No | Must start with `http://` or `https://` |
| `email` | `string` | No | Valid email |
| `phone` | `string` | No | `8..20` characters; digits, spaces, `+`, `(`, `)`, `-` |
| `address` | `string` | No | |
| `city` | `string` | No | |
| `country` | `string` | No | |
| `companySize` | `string` | No | |
| `industry` | `string` | No | |
| `taxCode` | `string` | No | |
| `logo` | `string` | No | URL; file upload API is preferred |
| `coverImage` | `string` | No | URL; file upload API is preferred |
| `active` | `boolean` | No | Defaults to `true` |

### Success Response

HTTP status: `200`

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 12,
    "name": "WorkHub Technologies",
    "slug": "workhub-technologies",
    "active": true,
    "verified": false,
    "deleted": false,
    "owner": {
      "id": "recruiter-uuid",
      "username": "recruiter01",
      "email": "recruiter@example.com"
    }
  }
}
```

## 8.1 Admin Moderates A Newly Created Company

Use this API after a recruiter creates a company. Until admin approval, the company keeps
`verified: false`.

### Approve Company Request

```http
PATCH /api/v1/companies/{id}/approve
Authorization: Bearer <adminAccessToken>
```

Required role:

```text
ROLE_ADMIN
```

The request has no body. The response uses the company schema from section 8 with:

```json
{
  "active": true,
  "verified": true
}
```

### Reject Company Request

```http
PATCH /api/v1/companies/{id}/reject
Authorization: Bearer <adminAccessToken>
```

Required role:

```text
ROLE_ADMIN
```

The request has no body. The response uses the company schema from section 8 with:

```json
{
  "verified": false
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | Approval requested for an already approved company |
| `401` | Missing or invalid access token |
| `403` | Current user is not admin |
| `404` | Company does not exist or was soft-deleted |

## 9. Submit Existing Company Join Request

### Request

```http
POST /api/v1/companies/{companyId}/join-requests
Authorization: Bearer <recruiterAccessToken>
Content-Type: application/json
```

Required role:

```text
ROLE_RECRUITER
```

Path parameters:

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `companyId` | `long` | Yes | Existing company ID |

Body:

```json
{
  "message": "I am HR at this company and want to manage jobs."
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `message` | `string` | No | Maximum `1000` characters; whitespace-only values become `null` |

An empty object is valid:

```json
{}
```

### Success Response

HTTP status: `201`

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 101,
    "status": "PENDING",
    "message": "I am HR at this company and want to manage jobs.",
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
    }
  }
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | Recruiter already belongs to a company |
| `400` | Company is not active or not verified |
| `400` | `message` exceeds `1000` characters |
| `401` | Missing or invalid access token |
| `403` | Current user is not a recruiter |
| `404` | Company does not exist or was soft-deleted |
| `409` | A `PENDING` request already exists for this recruiter and company |

## 10. Get Current Recruiter Join Requests

### Request

```http
GET /api/v1/companies/join-requests/me?page=0&size=10
Authorization: Bearer <recruiterAccessToken>
```

Required role:

```text
ROLE_RECRUITER
```

Query parameters:

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `page` | `integer` | No | `0` | Zero-based page index; negative values become `0` |
| `size` | `integer` | No | `10` | Items per page; maximum `100`; values below `1` become `10` |

### Success Response

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
    "items": [
      {
        "id": 101,
        "status": "PENDING",
        "message": "I am HR at this company and want to manage jobs.",
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
        }
      }
    ]
  }
}
```

Join request status values relevant to this flow:

```text
PENDING
APPROVED
REJECTED
```

## 11. Get Company Join Requests For Review

Use this API on the company-owner/admin review screen.

### Request

```http
GET /api/v1/companies/{companyId}/join-requests?page=0&size=10
Authorization: Bearer <accessToken>
```

Allowed users:

```text
ROLE_ADMIN, or the owner of the requested company
```

The controller permits `ROLE_RECRUITER` and `ROLE_ADMIN`, but the service additionally
requires a recruiter to be the company owner.

Path and query parameters:

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `companyId` | `long` | Yes | | Company ID |
| `page` | `integer` | No | `0` | Zero-based page index |
| `size` | `integer` | No | `10` | Items per page, maximum `100` |

### Success Response

The response uses the same pagination and join-request item schema as section 10.

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `401` | Missing or invalid access token |
| `403` | Current user is neither admin nor company owner |
| `404` | Company does not exist or was soft-deleted |

## 12. Approve Join Request

Approval links the recruiter to the company. It also automatically rejects that
recruiter's other pending company join requests.

### Request

```http
PATCH /api/v1/companies/join-requests/{requestId}/approve
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Allowed users:

```text
ROLE_ADMIN, or the owner of the requested company
```

Body is optional:

```json
{
  "reviewNote": "Verified recruiter email and company ownership."
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `reviewNote` | `string` | No | Maximum `1000` characters; whitespace-only values become `null` |

### Success Response

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 101,
    "status": "APPROVED",
    "message": "I am HR at this company and want to manage jobs.",
    "reviewNote": "Verified recruiter email and company ownership.",
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
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | Request has already been reviewed |
| `400` | Recruiter already belongs to a company |
| `400` | `reviewNote` exceeds `1000` characters |
| `401` | Missing or invalid access token |
| `403` | Current user is neither admin nor company owner |
| `404` | Join request does not exist |

## 13. Reject Join Request

### Request

```http
PATCH /api/v1/companies/join-requests/{requestId}/reject
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Allowed users:

```text
ROLE_ADMIN, or the owner of the requested company
```

Optional body:

```json
{
  "reviewNote": "Unable to verify the recruiter."
}
```

### Success Response

The response uses the same schema as section 12 with:

```json
{
  "status": "REJECTED"
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | Request has already been reviewed |
| `400` | `reviewNote` exceeds `1000` characters |
| `401` | Missing or invalid access token |
| `403` | Current user is neither admin nor company owner |
| `404` | Join request does not exist |

## 14. Get Current Recruiter Company

Call this after creating a company or after an existing-company join request is approved.

### Request

```http
GET /api/v1/companies/me
Authorization: Bearer <recruiterAccessToken>
```

Required role:

```text
ROLE_RECRUITER or ROLE_ADMIN
```

### Success Response

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 12,
    "name": "WorkHub Technologies",
    "slug": "workhub-technologies",
    "active": true,
    "verified": true,
    "deleted": false,
    "owner": {
      "id": "owner-uuid",
      "username": "owner01",
      "email": "owner@example.com"
    }
  }
}
```

### Error Cases

| HTTP status | Condition |
| --- | --- |
| `401` | Missing or invalid access token |
| `403` | Current user does not have recruiter/admin role |
| `404` | Current user does not own or belong to a company |

## 15. Optional Company Image Upload APIs

These APIs are useful in the create-company branch after the company has been created.

### Upload Logo

```http
POST /api/v1/companies/{id}/logo
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

file=<image file>
```

### Upload Cover Image

```http
POST /api/v1/companies/{id}/cover
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

file=<image file>
```

Allowed users:

```text
ROLE_ADMIN, company owner, or a recruiter already linked to the company
```

The uploaded part must be named `file`, must not be empty, and its content type must start
with `image/`. Both APIs return the updated company response.

## 16. Frontend State Model

Suggested UI states:

| State | Detection |
| --- | --- |
| `NOT_RECRUITER` | Profile `roleName !== "ROLE_RECRUITER"` |
| `RECRUITER_WITH_COMPANY` | Profile has `companyId` |
| `RECRUITER_NEEDS_COMPANY` | Recruiter profile has no `companyId` and no pending request |
| `WAITING_FOR_COMPANY_APPROVAL` | My join requests contains a `PENDING` item |
| `COMPANY_JOIN_REJECTED` | Latest relevant request is `REJECTED` |
| `COMPANY_JOIN_APPROVED` | Latest relevant request is `APPROVED`; refresh profile/company |
| `NEW_COMPANY_WAITING_FOR_ADMIN_VERIFICATION` | Created company has `verified: false` |

## 17. Known Gaps And Integration Notes

1. A candidate-facing "Become Recruiter" request API is missing. The current admin role
   endpoint is not suitable for a public CTA.
2. The JWT authority is generated at login. After an admin changes a user's role, the user
   should log out and log in again before calling recruiter-only APIs.
3. Join-request pagination uses `page` and `size`, with a zero-based `page`. Company search
   pagination uses `pageNum` and `pageSize`, with a one-based `pageNum`.
4. A recruiter can create a new company and is linked to it immediately, even while the
   company is still unverified.
5. Only active and verified existing companies accept join requests.
6. A recruiter cannot submit a new join request after already being linked to any company.
7. Approving one request automatically rejects the same recruiter's other pending requests.
