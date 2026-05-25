# Routing

## Current Routes

Public:

- `/login`
- `/register`
- `/unauthorized`

Protected inside `MainLayout`:

- `/`
- `/profile`
- `/profile/:idFromAnother`
- `/edit_profile`

Foundation:

- `ProtectedRoute` guards authenticated routes.
- `RoleBasedRoute` guards role-specific routes.
- `CandidateLayout`, `RecruiterLayout`, and `AdminLayout` exist as placeholders.

## Future Route Groups

Candidate:

- `/resume`
- `/applications`
- `/recommendations`
- `/assessments`
- `/notifications`

Recruiter:

- `/recruiter/jobs`
- `/recruiter/jobs/new`
- `/recruiter/jobs/:jobId/edit`
- `/recruiter/applicants`
- `/recruiter/company`

Admin:

- `/admin`
- `/admin/users`
- `/admin/jobs`
- `/admin/companies`
- `/admin/reports`

## Unauthorized Handling

Use `/unauthorized` for authenticated users without the required role. Do not silently hide route failures.

