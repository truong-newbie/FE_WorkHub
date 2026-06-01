# Skill Module API Documentation

## 1. Purpose

The skill module provides public skill discovery APIs and admin-only management APIs.
Skills are reused by jobs, resumes, and job-email subscribers.

Base path:

```text
/api/v1/skills
```

## 2. Endpoint Summary

| Method | URL | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/skills` | Public | Search skills |
| `GET` | `/api/v1/skills/search` | Public | Alias for skill search |
| `GET` | `/api/v1/skills/{id}` | Public | Get skill detail |
| `GET` | `/api/v1/skills/suggestions` | Public | Autocomplete active skills |
| `GET` | `/api/v1/skills/popular` | Public | Get popular active skills |
| `POST` | `/api/v1/skills` | `ROLE_ADMIN` | Create skill |
| `PUT` | `/api/v1/skills/{id}` | `ROLE_ADMIN` | Update skill |
| `PATCH` | `/api/v1/skills/{id}/enable` | `ROLE_ADMIN` | Enable skill |
| `PATCH` | `/api/v1/skills/{id}/disable` | `ROLE_ADMIN` | Disable skill |
| `DELETE` | `/api/v1/skills/{id}` | `ROLE_ADMIN` | Soft-delete skill |

## 3. Shared Skill Response

Standard skill APIs return:

```json
{
  "id": 1,
  "name": "Java",
  "slug": "java",
  "description": "Java backend programming skill",
  "level": "BACKEND",
  "active": true,
  "deleted": false
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `long` | Skill ID |
| `name` | `string` | Normalized display name |
| `slug` | `string` | Generated unique slug |
| `description` | `string` | Nullable |
| `level` | `string` | Nullable free-text category |
| `active` | `boolean` | Disabled skills are hidden from public reads |
| `deleted` | `boolean` | Soft-delete flag |
| `usageCount` | `long` | Nullable; populated by popular-skill response instead of standard CRUD responses |

## 4. Search Skills

Both URLs behave identically:

```http
GET /api/v1/skills
GET /api/v1/skills/search
```

Query parameters:

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `pageNum` | `integer` | No | `1` | One-based page number |
| `pageSize` | `integer` | No | `10` | Items per page |
| `sortBy` | `string` | No | `createdDate` | Supported: `id`, `name`, `slug`, `level`, `active`, `deleted`, `createdDate`, `lastModifiedDate` |
| `isAscending` | `boolean` | No | `false` | Ascending sort when `true` |
| `keyword` | `string` | No | `""` | Searches name, slug, description, and level |
| `name` | `string` | No | | Partial name match |
| `slug` | `string` | No | | Partial slug match |
| `level` | `string` | No | | Partial level match |
| `active` | `boolean` | No | | Filter active status |
| `deleted` | `boolean` | No | | Applied only for admin users |
| `createdFrom` | `string` | No | | ISO local date-time |
| `createdTo` | `string` | No | | ISO local date-time |

Example:

```http
GET /api/v1/skills?keyword=java&pageNum=1&pageSize=10&sortBy=name&isAscending=true
```

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
      "sortBy": "name",
      "sortType": "ASC"
    },
    "items": [
      {
        "id": 1,
        "name": "Java",
        "slug": "java",
        "description": "Java backend programming skill",
        "level": "BACKEND",
        "active": true,
        "deleted": false
      }
    ]
  }
}
```

Public users see only active, non-deleted skills. Admin users can inspect disabled skills
and use the `deleted` filter.

## 5. Get Skill Detail

```http
GET /api/v1/skills/{id}
```

Response uses the shared skill schema. Non-admin users receive `404` for disabled or
deleted skills.

## 6. Suggestions

Use this endpoint for autocomplete inputs:

```http
GET /api/v1/skills/suggestions?keyword=jav&limit=10
```

| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `keyword` | `string` | `""` | Partial skill-name match |
| `limit` | `integer` | `10` | Values below `1` become `10`; maximum `50` |

Response:

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "Java",
      "slug": "java",
      "level": "BACKEND"
    }
  ]
}
```

## 7. Popular Skills

```http
GET /api/v1/skills/popular?limit=10
```

`limit` follows the same rules as suggestions. Popularity is calculated from published,
non-deleted jobs.

Response:

```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "name": "Java",
      "slug": "java",
      "level": "BACKEND",
      "usageCount": 25
    }
  ]
}
```

## 8. Create Or Update Skill

Create:

```http
POST /api/v1/skills
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

Update:

```http
PUT /api/v1/skills/{id}
Authorization: Bearer <adminAccessToken>
Content-Type: application/json
```

Body:

```json
{
  "name": "Java",
  "level": "BACKEND",
  "description": "Java backend programming skill",
  "active": true
}
```

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Non-blank, maximum `255` characters, unique ignoring case |
| `level` | `string` | No | Whitespace-only values become `null` |
| `description` | `string` | No | Whitespace-only values become `null` |
| `active` | `boolean` | No | Create defaults to `true` |

Both APIs return the shared skill response with HTTP `200`.

## 9. Enable, Disable, Delete

```http
PATCH /api/v1/skills/{id}/enable
PATCH /api/v1/skills/{id}/disable
DELETE /api/v1/skills/{id}
Authorization: Bearer <adminAccessToken>
```

Enable and disable return the shared skill response. Delete returns:

```json
{
  "status": "SUCCESS",
  "data": "skill.delete.success"
}
```

## 10. Important Rules And Errors

| HTTP status | Condition |
| --- | --- |
| `400` | Blank or invalid name |
| `400` | Enable requested for an already enabled skill |
| `400` | Disable requested for an already disabled skill |
| `401` | Missing or invalid token on admin APIs |
| `403` | Non-admin calls a management API |
| `404` | Skill does not exist, is deleted, or is hidden from a public detail request |
| `409` | Another non-deleted skill already has the same name |
| `409` | Delete requested while skill is used by a job, resume, or subscriber |

## 11. Frontend Implementation

Routes:

- `/skills`
- `/admin/skills`

Service:

```text
src/features/skill/services/skillService.js
```

Implemented UI:

- Public search and popular skills.
- Admin create, update, enable, disable, and soft delete.
- Reusable `SkillSelector` based on `/skills/suggestions`, used by Resume and Subscriber
  forms.
