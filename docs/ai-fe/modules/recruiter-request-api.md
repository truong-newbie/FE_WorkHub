# Recruiter Request API Documentation

## 1. Purpose

This module lets a candidate request an upgrade to recruiter. An admin must approve the
request before the user's role changes to `ROLE_RECRUITER`.

Base URL:

```text
http://localhost:8080/api/v1
```

Protected requests require:

```http
Authorization: Bearer <accessToken>
```

## 2. Endpoint Summary

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/recruiter-requests` | `ROLE_CANDIDATE` | Submit request |
| `GET` | `/api/v1/recruiter-requests/me` | Authenticated | Get current user's requests |
| `GET` | `/api/v1/recruiter-requests` | `ROLE_ADMIN` | Admin lists requests |
| `PATCH` | `/api/v1/recruiter-requests/{requestId}/approve` | `ROLE_ADMIN` | Approve and change role |
| `PATCH` | `/api/v1/recruiter-requests/{requestId}/reject` | `ROLE_ADMIN` | Reject request |

## 3. Candidate Submits Request

```http
POST /api/v1/recruiter-requests
Authorization: Bearer <candidateAccessToken>
Content-Type: application/json
```

Body is optional:

```json
{
  "message": "I want to use WorkHub as a recruiter."
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `message` | `string` | No | Maximum `1000` characters; whitespace-only values become `null` |

An empty object is valid:

```json
{}
```

Success: HTTP `201`

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "status": "PENDING",
    "message": "I want to use WorkHub as a recruiter.",
    "createdDate": "2026-05-31T14:30:00",
    "user": {
      "id": "candidate-uuid",
      "username": "candidate01",
      "email": "candidate@example.com",
      "roleName": "ROLE_CANDIDATE"
    }
  }
}
```

## 4. Current User Gets Request History

```http
GET /api/v1/recruiter-requests/me?page=0&size=10
Authorization: Bearer <accessToken>
```

This remains available after approval so FE can show the final result.

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | `integer` | `0` | Zero-based; negative values become `0` |
| `size` | `integer` | `10` | Maximum `100`; values below `1` become `10` |

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
      "sortBy": "createdDate",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

## 5. Admin Lists Requests

```http
GET /api/v1/recruiter-requests?status=PENDING&page=0&size=10
Authorization: Bearer <adminAccessToken>
```

| Name | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `status` | `string` | No | | `PENDING`, `APPROVED`, or `REJECTED` |
| `page` | `integer` | No | `0` | Zero-based |
| `size` | `integer` | No | `10` | Maximum `100` |

Response uses the pagination schema from section 4 and returns full request items.

## 6. Admin Approves Request

```http
PATCH /api/v1/recruiter-requests/{requestId}/approve
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

Optional body:

```json
{
  "reviewNote": "Recruiter request approved."
}
```

Approval changes the user's database role to `ROLE_RECRUITER`.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 1,
    "status": "APPROVED",
    "message": "I want to use WorkHub as a recruiter.",
    "reviewNote": "Recruiter request approved.",
    "reviewedAt": "2026-05-31T15:00:00",
    "createdDate": "2026-05-31T14:30:00",
    "user": {
      "id": "candidate-uuid",
      "username": "candidate01",
      "email": "candidate@example.com",
      "roleName": "ROLE_RECRUITER"
    },
    "reviewedBy": {
      "id": "admin-uuid",
      "username": "admin01",
      "email": "admin@example.com"
    }
  }
}
```

After approval, the user must log in again so a newly issued JWT contains
`ROLE_RECRUITER`.

## 7. Admin Rejects Request

```http
PATCH /api/v1/recruiter-requests/{requestId}/reject
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

Optional body:

```json
{
  "reviewNote": "Unable to verify recruiter information."
}
```

The response uses the same schema as approval with `status: "REJECTED"`. The user's role
remains `ROLE_CANDIDATE`.

## 8. Error Cases

| HTTP status | Condition |
| --- | --- |
| `400` | Message or review note exceeds `1000` characters |
| `400` | Admin tries to review an already reviewed request |
| `400` | Applicant is already recruiter or is no longer an eligible candidate |
| `401` | Missing or invalid access token |
| `403` | Non-candidate submits a request or non-admin reviews/lists requests |
| `404` | Request, user, or recruiter role does not exist |
| `409` | Candidate already has a `PENDING` recruiter request |

## 9. Suggested FE Flow

1. Candidate calls `GET /api/v1/recruiter-requests/me`.
2. If a pending item exists, show a waiting-for-approval state.
3. Otherwise show a button that calls `POST /api/v1/recruiter-requests`.
4. Admin lists pending items with `GET /api/v1/recruiter-requests?status=PENDING`.
5. Admin approves or rejects the request.
6. After approval, prompt the user to log in again.

