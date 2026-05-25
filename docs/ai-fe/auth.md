# Auth

## Current Flow

1. `Login` calls `login()` from `useAuth`.
2. `AuthProvider` calls `loginApi`.
3. Token from `result.token` is stored under `localStorage.token`.
4. `apiClient` attaches the token to authenticated requests.
5. Logout clears token and auth context state.

## Files

- `src/stores/authStore.jsx`
- `src/stores/useAuth.js`
- `src/stores/authContext.js`
- `src/services/authApi.js`
- `src/lib/tokenStorage.js`
- `src/routes/ProtectedRoute.jsx`
- `src/routes/RoleBasedRoute.jsx`

## Token Strategy

Current storage is localStorage. Production should prefer httpOnly refresh-token cookie support if the backend provides it. Until then, all token reads/writes must stay inside `tokenStorage` and auth infrastructure.

## Refresh Placeholder

No refresh strategy exists. When backend supports it:

- Add `/auth/refresh`.
- Queue requests during refresh.
- Retry only after refresh succeeds.
- Logout on refresh failure.

## Protected Routes

Unauthenticated users go to `/login`. Unauthorized roles go to `/unauthorized`.

## Role-Based UI

Route-level role checks exist through `RoleBasedRoute`. For component-level permission checks, add a small `CanAccess` helper instead of scattering role logic.

