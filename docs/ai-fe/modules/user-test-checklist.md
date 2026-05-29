# User Module Test Checklist

1. Open `/profile` while authenticated and verify no runtime error.
2. Open `/candidate/profile` with a candidate account and verify no runtime error.
3. Open `/candidate/profile` with a non-candidate role and verify redirect to `/unauthorized`.
4. Verify profile calls `GET /api/v1/user/me/profile`.
5. Verify loaded profile displays username, email, phone, role, address, company, and created date when available.
6. Submit valid profile changes and verify `PUT /api/v1/user/me/profile` is called.
7. Verify profile data updates after successful save.
8. Enter negative age and verify validation error appears before API call.
9. Enter mismatched password confirmation and verify validation error appears before API call.
10. Choose a local image file and verify `PUT /api/v1/user/me/avatar` is called with `multipart/form-data` key `avatar`.
11. Choose a non-image file and verify frontend validation appears before API call.
12. Enter current password, valid new password, and confirm password, then verify `PUT /api/v1/user/me/password` is called.
13. Verify password values are not stored in localStorage/sessionStorage.
14. Log in as admin and open `/admin/users`.
15. Verify `/admin/users` calls `GET /api/v1/user/statistics` and `GET /api/v1/user`.
16. Apply user filters and verify query params use `/api/v1/user`, not `/api/v1/users`.
17. Create a user and verify `POST /api/v1/user` is called.
18. Click Edit and verify `GET /api/v1/user/{userId}` loads details.
19. Save an edited user and verify `PUT /api/v1/user/{userId}` is called.
20. Lock and unlock a user and verify `/lock` and `/unlock` are called with a reason.
21. Change a user role and verify `PUT /api/v1/user/{userId}/role` is called with `newRole` and `reason`.
22. Delete a user and verify `DELETE /api/v1/user/{userId}` is called.
23. Verify API errors are shown through visible error/toast.
24. Verify `npm.cmd run build` passes.
