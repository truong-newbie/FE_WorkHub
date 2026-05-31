# Basic Modules API Documentation

This index links the frontend-ready API documents for the basic WorkHub modules.

## Shared Conventions

Local development base URL:

```text
http://localhost:8080/api/v1
```

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

Successful response:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Error response:

```json
{
  "status": "ERROR",
  "message": "Error message"
}
```

Validation errors return field messages:

```json
{
  "status": "ERROR",
  "message": {
    "fieldName": "Validation message"
  }
}
```

Nullable response fields may be omitted. Date-time values use ISO local date-time format,
for example `2026-05-31T14:30:00`.

## Module Documents

| Module | Document |
| --- | --- |
| Skill | [skill-api.md](skill-api.md) |
| Resume | [resume-api.md](resume-api.md) |
| Company | [company-api.md](company-api.md) |
| Subscriber | [subscriber-api.md](subscriber-api.md) |
| Job | [job-api.md](job-api.md) |

## Role Names

```text
ROLE_ADMIN
ROLE_RECRUITER
ROLE_CANDIDATE
```
