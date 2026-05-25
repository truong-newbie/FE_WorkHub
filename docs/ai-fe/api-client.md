# API Client

## Current Implementation

- Shared axios instance: `src/lib/apiClient.js`.
- Env config: `src/config/env.js`.
- Token storage helper: `src/lib/tokenStorage.js`.
- Auth endpoints: `src/services/authApi.js`.
- User/profile/search endpoints: `src/services/userApi.js`.

## Request Flow

1. Page/component calls a service function.
2. Service calls `apiClient`.
3. Request interceptor reads token from `tokenStorage`.
4. Backend receives `Authorization: Bearer <token>` when authenticated.

## Response Flow

- `unwrapResult(response)` returns `response.data.result` when present, otherwise `response.data`.
- Errors are normalized to `{ message, status, details, originalError }`.
- `401` clears the stored access token.

## Rules

- Do not call `fetch` or raw `axios` from components.
- Do not hard-code backend URLs in UI files.
- Add new endpoints to the nearest service file, then move to feature services when modules grow.
- Do not add generic retries for mutating requests.

## Future Service Shape

```txt
src/features/jobs/jobsApi.js
src/features/company/companyApi.js
src/features/resume/resumeApi.js
src/features/assessment/assessmentApi.js
```

