# WorkHub Auth Module

## Pages And Routes

Public:

- `/login` -> `src/pages/auth/LoginPage.jsx`
- `/register` -> `src/pages/auth/RegisterPage.jsx`
- `/forgot-password` -> `src/pages/auth/ForgotPasswordPage.jsx`
- `/verify-otp` -> `src/pages/auth/VerifyOtpPage.jsx`
- `/reset-password` -> `src/pages/auth/ResetPasswordPage.jsx`
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
- `POST /forgot-password/email-verification/{email}`
- `POST /forgot-password/otp-verification`
- `POST /forgot-password/password-update/{email}`

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

## Forgot Password Flow

Pages:

- `src/pages/auth/ForgotPasswordPage.jsx`
- `src/pages/auth/VerifyOtpPage.jsx`
- `src/pages/auth/ResetPasswordPage.jsx`

Service methods:

- `forgotPassword(payload)`
- `verifyForgotPasswordOtp(payload)`
- `resetPassword(payload)`

Flow:

1. User opens `/forgot-password` and submits email.
2. Frontend calls `POST /forgot-password/email-verification/{email}` with no request body.
3. On success, frontend stores email in `sessionStorage.forgotPasswordEmail` and navigates to `/verify-otp`.
4. User submits 6-digit OTP.
5. Frontend calls `POST /forgot-password/otp-verification` with `{ email, otp }`, where `otp` is sent as a number.
6. On success, frontend navigates to `/reset-password` with `{ email, otp }` in router location state.
7. User submits `newPassword` and `confirmPassword`.
8. Frontend calls `POST /forgot-password/password-update/{email}` with `{ password, repeatPassword }`.
9. On success, temporary email state is cleared and user is redirected to `/login`.

State transfer strategy:

- Email is stored in sessionStorage so `/verify-otp` can survive refresh.
- OTP is only passed through router location state to require the user to complete the verify page before reset. The current backend password update endpoint does not require OTP in the reset request.
- Passwords are never stored.

Validation:

- Email is required and must be valid.
- OTP is required and must be 6 digits.
- New password is required and must be at least 6 characters.
- Confirm password must match new password.

Known TODOs:

- Add backend-driven password pattern if backend exposes stricter rules.
- Add countdown UI for `expiresInSeconds` if needed.
- Backend currently does not enforce verified OTP in `password-update/{email}`; fix backend before production.

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
- `updateCurrentUser`

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

## UI/UX Implementation

All auth pages have been refactored to follow ITviec-style professional job portal design:

### Design System

- **Color scheme**: WorkHub red (#ed1b2f) as primary accent, clean white backgrounds, professional gray tones
- **Layout**: Two-column desktop layout (branding left, form right) for Login/Register; single-column for password reset flow
- **Typography**: Clear hierarchy with professional font sizes (28px headers, 15-16px body)
- **Spacing**: Consistent 8px-based spacing system, proper padding (40px panels)
- **Components**: Professional form inputs (44px height), prominent CTAs (48px height)

### Login Page

- Two-column layout with WorkHub branding and value proposition on the left
- Features section highlighting platform benefits with icons
- Clean form with email/password fields
- Social login buttons with Google/Facebook icons
- Links to register and forgot password

### Register Page

- Two-column layout with onboarding messaging
- Form fields: email, password, username, date of birth, gender
- Client-side validation before API call
- Success redirect to login page

### Forgot Password Flow

- Three-step process with visual step indicators
- Step 1: Email input to request OTP
- Step 2: OTP verification with resend functionality
- Step 3: New password creation with confirmation
- Single-column centered layout for focused experience
- Clear navigation between steps

### Responsive Design

- Desktop: Two-column layout for login/register, centered single-column for password reset
- Mobile: Single-column layout, branding section hidden, optimized form spacing
- Breakpoint: 768px

## TODOs

- Add real dashboard pages for candidate, recruiter, and admin.
- Add refresh-token endpoint support when backend exposes it.
- Replace legacy profile token decoding with auth-store selectors in a later profile-module cleanup.
- Consider adding password strength indicator for register/reset password forms.
- Add countdown timer for OTP expiration (70 seconds).
