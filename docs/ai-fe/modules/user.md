# WorkHub User Module

## API Source

Current source of truth: `user-api.md`.

Important correction: backend uses `/api/v1/user` singular, not `/api/v1/users`.

## Routes

- `/profile` -> current authenticated user profile for any logged-in role.
- `/candidate/profile` -> candidate profile route guarded by `RoleBasedRoute`.
- `/admin/users` -> admin user management route guarded by `RoleBasedRoute`.

## Pages

- `src/features/user/pages/UserProfilePage.jsx`
- `src/features/user/pages/AdminUserManagementPage.jsx`

The page loads the current authenticated profile, displays profile summary, and provides separate forms for profile update, avatar image upload, and password change.
The admin page lists users, filters users, creates users, edits users, soft deletes users, locks/unlocks users, changes roles, and displays user statistics.

## Services

- `src/features/user/services/userService.js`

Implemented methods:

- `getCurrentUserProfile()` -> `GET /user/me/profile`
- `updateCurrentUserProfile(payload)` -> `PUT /user/me/profile`
- `updateCurrentUserAvatar(file)` -> `PUT /user/me/avatar`
- `changeCurrentUserPassword(payload)` -> `PUT /user/me/password`
- `createUser(payload)` -> `POST /user`
- `getUsers(params)` -> `GET /user`
- `getUserById(id)` -> `GET /user/{id}`
- `updateUserById(id, payload)` -> `PUT /user/{id}`
- `deleteUser(id)` -> `DELETE /user/{id}`
- `lockUser(id, payload)` -> `PUT /user/{id}/lock`
- `unlockUser(id, payload)` -> `PUT /user/{id}/unlock`
- `changeUserRole(id, payload)` -> `PUT /user/{id}/role`
- `getUserStatistics()` -> `GET /user/statistics`

The legacy `src/services/userApi.js` still exists for older `/user` search/follow endpoints. Do not create another axios client.

## APIs Integrated

Current-profile APIs:

- `GET /api/v1/user/me/profile`
- `PUT /api/v1/user/me/profile`
- `PUT /api/v1/user/me/avatar`
- `PUT /api/v1/user/me/password`

Admin APIs:

- `POST /api/v1/user`
- `GET /api/v1/user`
- `GET /api/v1/user/{userId}`
- `PUT /api/v1/user/{userId}`
- `DELETE /api/v1/user/{userId}`
- `PUT /api/v1/user/{userId}/lock`
- `PUT /api/v1/user/{userId}/unlock`
- `PUT /api/v1/user/{userId}/role`
- `GET /api/v1/user/statistics`

## Profile Flow

1. Page calls `GET /user/me/profile`.
2. Page displays avatar, username, email, roleName, phone, headline, location, address, company, created date.
3. User edits profile fields allowed by `/user/me/profile`.
4. Page calls `PUT /user/me/profile`.
5. On success, page updates local state and calls `authStore.updateCurrentUser`.

Profile update payload:

- `username`
- `age`
- `gender`
- `dob`
- `address`
- `phone`
- `headline`
- `bio`
- `experienceYears`
- `location`
- `website`
- `linkedinUrl`
- `githubUrl`

Email, role, and company are not sent by current-profile update because `user-api.md` says `/user/me/profile` does not allow changing them.
Avatar is not sent by current-profile update; it is handled only by `PUT /user/me/avatar`.

## Admin User Management Flow

1. Admin logs in and opens `/admin/users`.
2. Page calls `GET /user/statistics`.
3. Page calls `GET /user?page=0&size=10&includeDeleted=false&sortBy=createdDate&sortDir=DESC`.
4. Admin can apply filters: keyword, role, gender, age range, companyId, enabled, includeDeleted, page size.
5. `New user` submits `POST /user`.
6. `Edit` loads `GET /user/{userId}`, then save submits `PUT /user/{userId}`.
7. `Delete` submits `DELETE /user/{userId}`.
8. `Lock` and `Unlock` submit `/lock` or `/unlock` with `{ reason }`.
9. `Role` submits `PUT /user/{userId}/role` with `{ newRole, reason }`.

## Avatar Flow

Avatar update uses local image upload:

- `PUT /user/me/avatar`
- `Content-Type: multipart/form-data`
- Form key: `avatar`
- Backend also accepts key `file` for manual Postman tests.

The UI validates that the selected file is an image, shows a local preview, uploads the file, then uses the returned Cloudinary/avatar URL in the profile summary.

## Change Password Flow

Password change uses:

- `PUT /user/me/password`
- Body: `{ currentPassword, newPassword, confirmPassword }`

Validation:

- all fields required
- new password minimum 8 characters
- new password must contain uppercase, lowercase, and number
- confirm password must match

Passwords remain in local component state only and are cleared after success.

## State Management Integration

- Local component state handles forms/loading/errors.
- Auth context supplies current user metadata.
- `updateCurrentUser` syncs profile fields and roleName into auth context.

## Known TODOs

- Add stricter URL validation for website/social/avatar fields if backend enforces it.
- Add React Query if profile/server state grows.
