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
- Protected requests attach the stored access token by default.
- Public endpoint calls can opt out with `skipAuth: true`.
- A `401` clears stored tokens only when the failed request used the current access token.
  Public requests, auth requests, and stale responses from a previous token do not clear a
  newer session. The user is redirected to `/login` after cleanup.
- `400`, `403`, `404`, and `409` responses are returned to the calling screen without
  clearing tokens or redirecting the user.
- Auxiliary requests that must not interrupt the current page can use
  `skipAuthCleanup: true`, for example job-view tracking.

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
