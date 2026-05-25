# WorkHub Auth Module

## Pages And Routes

Public:

- `/login` -> `src/pages/auth/LoginPage.jsx`
- `/register` -> `src/pages/auth/RegisterPage.jsx`
- `/auth/oauth/callback` -> `src/pages/auth/OAuthCallbackPage.jsx`
- `/unauthorized` -> `src/pages/unauthorized/UnauthorizedPage.jsx`

Protected role redirects:

- `ADMIN` -> `/admin/dashboard`
- `RECRUITER` -> `/recruiter/dashboard`
- `CANDIDATE` -> `/candidate/dashboard`

Dashboard placeholders:

- `src/pages/dashboard/RoleDashboard.jsx`

## Services

Auth service:

- `src/services/authApi.js`

Implemented endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/oauth2/authorize?login_type=google`
- `GET /auth/oauth2/authorize?login_type=facebook`
- Backend-owned callback: `GET /auth/oauth2/callback?code=...&state=google|facebook`

The app base URL is `VITE_API_BASE_URL`, with local fallback `/api/v1`.

## Login Flow

1. User submits `{ email, password }`.
2. `LoginPage` calls `useAuth().login`.
3. `AuthProvider` calls `loginApi`.
4. API response data must contain `accessToken`, optional `refreshToken`, `id`, and `authorities`.
5. Store persists tokens and decodes role.
6. User is redirected by role:
   - `ADMIN` -> `/admin/dashboard`
   - `RECRUITER` -> `/recruiter/dashboard`
   - `CANDIDATE` -> `/candidate/dashboard`

## Register Flow

Register sends the documented request body:

```json
{
  "email": "candidate@example.com",
  "password": "Password@123",
  "username": "Nguyen Van A",
  "dob": "2000-01-15",
  "gender": "MALE"
}
```

On success, the user is redirected to `/login`.

## Logout Flow

1. Sidebar logout calls `useAuth().logout`.
2. Auth store calls `POST /auth/logout` if an access token exists.
3. Local tokens and auth context state are cleared in `finally`.
4. Sidebar link routes user to `/login`.

## Store Structure

Files:

- `src/stores/authStore.jsx`
- `src/stores/authContext.js`
- `src/stores/useAuth.js`
- `src/lib/tokenStorage.js`

State:

- `user`
- `accessToken`
- `refreshToken`
- `role`
- `roles`
- `isAuthenticated`
- `isLoading`

Actions:

- `login`
- `loginSuccess`
- `completeOAuthLogin`
- `logout`
- `clearSession`
- `hydrateAuthFromStorage`

## Token Strategy

- `accessToken` is stored as `localStorage.accessToken` and mirrored to legacy `localStorage.token`.
- `refreshToken` is stored as `localStorage.refreshToken`.
- OAuth `userId` is stored as `localStorage.userId`.
- `apiClient` automatically attaches `Authorization: Bearer <accessToken>`.
- `apiClient` normalizes errors.
- `401` clears local tokens and dispatches an auth cleanup event.
- Refresh token is persisted but not used for auto-refresh because no refresh endpoint is documented.

## OAuth Flow

The frontend does not guess provider URLs.

Google:

1. User clicks "Continue with Google".
2. Frontend calls `GET /auth/oauth2/authorize?login_type=google`.
3. Backend returns a plain-text Google URL.
4. Browser navigates to that URL.
5. Google redirects to backend callback: `http://localhost:8080/api/v1/auth/oauth2/callback`.
6. Backend handles `code/state`, creates WorkHub JWT, then redirects to frontend:

```txt
http://localhost:5173/auth/oauth/callback?accessToken=...&refreshToken=...&userId=...&role=ROLE_CANDIDATE
```

Facebook:

1. User clicks "Continue with Facebook".
2. Frontend calls `GET /auth/oauth2/authorize?login_type=facebook`.
3. Backend returns a plain-text Facebook URL.
4. Browser navigates to that URL.
5. Facebook redirects to backend callback: `http://localhost:8080/api/v1/auth/oauth2/callback`.
6. Backend handles `code/state`, creates WorkHub JWT, then redirects to frontend:

```txt
http://localhost:5173/auth/oauth/callback?accessToken=...&refreshToken=...&userId=...&role=ROLE_CANDIDATE
```

Frontend callback reads:

- `accessToken`
- `refreshToken`
- `userId`
- `role`
- `error`

If `error` exists, frontend redirects to `/login?error=<error>`. If tokens are missing, frontend redirects to `/login?error=oauth_missing_token`. Otherwise, frontend stores auth data and redirects by role.

## Role Rules

Roles are normalized by removing `ROLE_` and uppercasing:

- `ROLE_ADMIN` -> `ADMIN`
- `ROLE_RECRUITER` -> `RECRUITER`
- `ROLE_CANDIDATE` -> `CANDIDATE`

Unauthorized role access redirects to `/unauthorized`.

## TODOs

- Add real dashboard pages for candidate, recruiter, and admin.
- Add refresh-token endpoint support when backend exposes it.
- Add forgot/reset password routes when API docs are available.
- Replace legacy profile token decoding with auth-store selectors in a later profile-module cleanup.
