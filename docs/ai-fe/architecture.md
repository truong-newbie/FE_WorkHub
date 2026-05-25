# Frontend Architecture

## Detected Stack

- React `^19.0.0`, Vite `^6.3.3`, JavaScript + JSX.
- npm package manager (`package-lock.json` exists).
- Routing: `react-router-dom ^7.5.3`.
- HTTP: centralized axios client in `src/lib/apiClient.js`.
- Auth state: React Context in `src/stores/authStore.jsx`.
- Styling: CSS Modules plus static assets in `public/`.
- UI foundation: `src/components/ui`.

## Current Structure

```txt
src/
  App.jsx
  config/env.js
  lib/apiClient.js
  lib/tokenStorage.js
  main.jsx
  components/
    sidebar.jsx
    ui/
    auth/
  layouts/
    MainLayout.jsx
    CandidateLayout.jsx
    RecruiterLayout.jsx
    AdminLayout.jsx
  pages/
    home/
    profile/
    unauthorized/
  routes/
    ProtectedRoute.jsx
    RoleBasedRoute.jsx
  services/
    authApi.js
    userApi.js
  stores/
    authStore.jsx
    authContext.js
    useAuth.js
```

## Runtime Layout

`main.jsx` wraps the app with `ToastProvider` and `AuthProvider`. `App.jsx` defines public routes and protected authenticated routes. Authenticated pages render inside `MainLayout`, which owns the sidebar plus main content spacing.

## Separation Of Concerns

- Pages compose screens and route behavior.
- Layouts own shell structure.
- Services own backend endpoints.
- `apiClient` owns base URL, auth header injection, and error normalization.
- Stores/context own cross-screen auth state.
- `components/ui` owns reusable, domain-neutral UI primitives.

## Route Protection

- `ProtectedRoute` redirects unauthenticated users to `/login`.
- `RoleBasedRoute` redirects unauthorized roles to `/unauthorized`.
- Candidate/recruiter/admin layouts exist as foundation placeholders. Add real route groups when those modules are implemented.

## Missing Pieces

- Refresh token flow.
- React Query or equivalent server-state cache.
- Feature folders for large WorkHub domains.
- Form validation strategy.
- Automated tests.

## Scaling Direction

Build foundation first, then implement modules one at a time: auth, user profile, jobs, resume/apply/favorite, recruiter jobs/applications, ATS, assessment, recommendation, notification, admin. After each module, update its `docs/ai-fe/modules/*.md` file.

