# Subscriber Module API Documentation

## 1. Purpose

The subscriber module lets authenticated users subscribe to job-email notifications by
skill. It also provides owner management, recruiter/admin search, unsubscribe links, and
operational APIs for matching and queued emails.

Base path:

```text
/api/v1/subscribers
```

## 2. Endpoint Summary

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/subscribers` | Authenticated | Create current user's subscription |
| `GET` | `/api/v1/subscribers/me` | Authenticated | Get current user's subscription |
| `GET` | `/api/v1/subscribers/{id}` | Owner, recruiter, or admin | Get detail |
| `PUT` | `/api/v1/subscribers/{id}` | Owner or admin | Update subscription |
| `DELETE` | `/api/v1/subscribers/{id}` | Owner or admin | Soft-delete subscription |
| `PUT` | `/api/v1/subscribers/{id}/enable` | Owner or admin | Enable emails |
| `PUT` | `/api/v1/subscribers/{id}/disable` | Owner or admin | Disable emails |
| `GET` | `/api/v1/subscribers` | `ROLE_RECRUITER` or `ROLE_ADMIN` | Search subscriptions |
| `POST` | `/api/v1/subscribers/mail/send` | `ROLE_RECRUITER` or `ROLE_ADMIN` | Match jobs and queue emails |
| `POST` | `/api/v1/subscribers/mail/queue/process` | `ROLE_RECRUITER` or `ROLE_ADMIN` | Re-publish ready email queue items |
| `GET` | `/api/v1/subscribers/unsubscribe?token=...` | Public | Disable emails from email link |

## 3. Subscriber Response Schema

```json
{
  "id": 5,
  "name": "Nguyen Van A",
  "email": "candidate@gmail.com",
  "enabled": true,
  "deleted": false,
  "subscribedAt": "2026-05-31T14:30:00",
  "lastEmailSentAt": "2026-05-31T16:00:00",
  "unsubscribedAt": "2026-05-31T17:00:00",
  "user": {
    "id": "candidate-uuid",
    "username": "candidate01",
    "email": "candidate@gmail.com"
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

Nullable date fields may be omitted.

## 4. Create Subscriber

```http
POST /api/v1/subscribers
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body:

```json
{
  "email": "candidate@gmail.com",
  "name": "Nguyen Van A",
  "skillIds": [1, 2],
  "enabled": true
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | `string` | Yes | Non-blank, valid email, unique among non-deleted subscribers |
| `name` | `string` | No | Defaults to current username when absent or blank |
| `skillIds` | `long[]` | Yes | Must not be empty; all IDs must exist |
| `enabled` | `boolean` | No | Defaults to `true` |

Success: HTTP `201`, with the subscriber response schema.

Each user may have only one non-deleted subscriber record.

## 5. Get Current User Subscriber

```http
GET /api/v1/subscribers/me
Authorization: Bearer <accessToken>
```

Returns the subscriber schema or `404` when the current user has no active subscriber
record.

## 6. Get Detail

```http
GET /api/v1/subscribers/{id}
Authorization: Bearer <accessToken>
```

Allowed callers:

```text
Owner
ROLE_RECRUITER
ROLE_ADMIN
```

## 7. Update Subscriber

```http
PUT /api/v1/subscribers/{id}
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Body:

```json
{
  "email": "candidate@gmail.com",
  "name": "Nguyen Van A",
  "skillIds": [1, 2, 3],
  "enabled": true
}
```

All fields are optional. When `skillIds` is supplied, it must not be empty and every ID
must exist. Setting `enabled: true` clears `unsubscribedAt`.

Allowed callers:

```text
Owner
ROLE_ADMIN
```

## 8. Delete, Enable, Disable

```http
DELETE /api/v1/subscribers/{id}
PUT /api/v1/subscribers/{id}/enable
PUT /api/v1/subscribers/{id}/disable
Authorization: Bearer <accessToken>
```

All three APIs return the updated subscriber response.

Delete is soft-delete and sets `enabled: false`. Enable clears `unsubscribedAt`. Disable
keeps the record and sets `enabled: false`.

Allowed callers:

```text
Owner
ROLE_ADMIN
```

## 9. Search Subscribers

```http
GET /api/v1/subscribers?email=gmail&enabled=true&page=0&size=10
Authorization: Bearer <accessToken>
```

Required role:

```text
ROLE_RECRUITER or ROLE_ADMIN
```

Query parameters:

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `email` | `string` | | Partial email match |
| `enabled` | `boolean` | | Enabled filter |
| `skillId` | `long` | | Skill filter |
| `subscribedFrom` | `date` | | Inclusive `yyyy-MM-dd` |
| `subscribedTo` | `date` | | Inclusive `yyyy-MM-dd` |
| `filter` | `string` | | Optional advanced expression for `email` and `enabled` |
| `page` | `integer` | `0` | Zero-based page |
| `size` | `integer` | `10` | Maximum `100` |
| `sortBy` | `string` | `subscribedAt` | Supported: `id`, `email`, `enabled`, `subscribedAt`, `lastEmailSentAt`, `createdDate`, `lastModifiedDate` |
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
      "sortBy": "subscribedAt",
      "sortType": "DESC"
    },
    "items": []
  }
}
```

## 10. Public Unsubscribe Link

```http
GET /api/v1/subscribers/unsubscribe?token=<unsubscribeToken>
```

Authentication is not required. Email templates generate this backend URL automatically.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "email": "candidate@gmail.com",
    "enabled": false,
    "unsubscribedAt": "2026-05-31T17:00:00",
    "message": "Unsubscribed successfully"
  }
}
```

## 11. Match Jobs And Queue Emails

```http
POST /api/v1/subscribers/mail/send
Authorization: Bearer <accessToken>
```

Required role:

```text
ROLE_RECRUITER or ROLE_ADMIN
```

No body is required.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "checkedSubscribers": 10,
    "sentEmails": 0,
    "queuedEmails": 3,
    "matchedJobs": 8
  }
}
```

This endpoint queues email work. `sentEmails` is `0` at this stage because delivery is
asynchronous.

Matched jobs must be published, non-deleted, non-expired, share at least one subscriber
skill, and not already be sent or pending for the same subscriber.

## 12. Process Ready Email Queue Items

```http
POST /api/v1/subscribers/mail/queue/process
Authorization: Bearer <accessToken>
```

Required role:

```text
ROLE_RECRUITER or ROLE_ADMIN
```

No body is required.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "checkedEmails": 20,
    "sentEmails": 0,
    "retriedEmails": 18,
    "failedEmails": 2
  }
}
```

This operational endpoint re-publishes ready queue items. Email delivery remains
asynchronous through RabbitMQ.

## 13. Important Errors

| HTTP status | Condition |
| --- | --- |
| `400` | Missing subscriber skills or invalid body |
| `401` | Missing or invalid token on protected APIs |
| `403` | Caller cannot read/manage subscriber or lacks recruiter/admin role |
| `404` | Subscriber, skill, user, or unsubscribe token does not exist |
| `409` | Email is already used by a non-deleted subscriber |
| `409` | Current user already has a non-deleted subscriber |

## 14. Frontend Implementation

Routes:

- `/settings/subscription`
- `/admin/subscribers`
- `/unsubscribe?token=...`

Service:

```text
src/features/subscriber/services/subscriberService.js
```

Implemented UI:

- Authenticated user create/update subscription, select skills, enable, disable, and
  soft delete.
- Admin search, enable, disable, delete, queue matching emails, and process ready queue
  items.
- Public unsubscribe token flow.
- Operational mail buttons are intentionally exposed only on the admin page.
