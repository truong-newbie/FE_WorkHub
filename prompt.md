Bạn là Senior Frontend Engineer.

Tôi đang xây dựng frontend cho dự án WorkHub bằng React + Vite.

Frontend đã có:
- Foundation architecture
- Routing
- Auth flow
- Axios client
- Zustand auth store
- Protected routes
- Reusable UI components
- docs/ai-fe AI context system

==================================================
BẮT BUỘC ĐỌC CONTEXT TRƯỚC KHI CODE
==================================================

Đọc các file sau trước khi implement:

GLOBAL CONTEXT:
- docs/ai-fe/architecture.md
- docs/ai-fe/conventions.md
- docs/ai-fe/routing.md
- docs/ai-fe/auth.md
- docs/ai-fe/api-client.md
- docs/ai-fe/state-management.md
- docs/ai-fe/ui-system.md
- docs/ai-fe/styling.md nếu có

MODULE/API CONTEXT:
- docs/ai-fe/modules/test_api_user.txt

Nếu đã có:
- docs/ai-fe/modules/user.md
- docs/ai-fe/modules/auth.md

==================================================
MỤC TIÊU
==================================================

Implement User module end-to-end theo API document.

Phạm vi:
1. Current user profile
2. Update profile
3. Avatar upload/update nếu API có
4. Change password nếu API có
5. User detail/profile page
6. Authenticated user data integration
7. Form validation
8. Loading/error handling
9. Update docs/ai-fe/modules/user.md sau khi hoàn thành

Không làm lan sang module khác.

==================================================
RẤT QUAN TRỌNG
==================================================

Trước khi code:
1. Analyze existing frontend implementation.
2. Search existing files first.
3. Reuse existing:
   - axiosClient
   - authStore
   - layouts
   - reusable UI components
   - error handler
   - loading states
4. DO NOT create duplicate:
   - axios instances
   - user services
   - auth stores
   - layouts
   - avatar upload components
5. DO NOT refactor ngoài phạm vi User module.
6. DO NOT hardcode API URLs.
7. DO NOT create fake backend/mock APIs.

==================================================
OUTPUT BẮT BUỘC TRƯỚC KHI CODE
==================================================

Trước khi implement, hãy trả lời:

1. Những docs đã đọc.
2. Nội dung User APIs/flow theo file test_api_user.txt.
3. Existing user/auth related files đã tìm thấy.
4. Existing reusable components/services sẽ reuse.
5. Files sẽ tạo mới.
6. Files sẽ sửa.
7. Routes sẽ thêm hoặc cập nhật.
8. APIs sẽ integrate.
9. State management strategy.
10. Rủi ro duplicate/conflict nếu có.

Chỉ sau đó mới code.

==================================================
USER MODULE REQUIREMENTS
==================================================

Implement đúng theo:
docs/ai-fe/modules/test_api_user.txt

Không tự đoán API nếu docs đã mô tả.

Các chức năng có thể gồm:
- Get current profile
- Update profile
- Upload/change avatar
- Change password
- Get user detail
- Update personal info

Chỉ implement những API có trong document.

==================================================
USER SERVICE
==================================================

Tạo hoặc cập nhật:

src/features/user/services/userService.js

Methods tùy API doc:
- getCurrentUser()
- updateProfile(payload)
- uploadAvatar(formData)
- changePassword(payload)
- getUserById(id) nếu API có

Yêu cầu:
- Dùng axiosClient có sẵn.
- Không tạo axios instance mới.
- Handle multipart/form-data đúng nếu upload avatar.
- Normalize errors.
- Unwrap response theo convention project.

==================================================
ROUTES
==================================================

Tạo hoặc cập nhật routes:

Candidate:
- /candidate/profile

Optional:
- /candidate/settings
- /profile
- /users/:id nếu API/business flow cần

Không phá routing hiện có.

==================================================
PAGES
==================================================

Tạo hoặc cập nhật:

src/features/user/pages/

Ví dụ:
- UserProfilePage.jsx
- EditProfilePage.jsx nếu tách riêng
- ChangePasswordPage.jsx nếu API có

==================================================
PROFILE PAGE REQUIREMENTS
==================================================

Hiển thị:
- avatar
- full name
- email
- phone
- role
- address nếu có
- bio nếu có
- created date nếu có

Features:
- loading state
- error state
- empty fallback
- update profile form
- avatar preview nếu upload ảnh
- toast success/error

==================================================
AVATAR UPLOAD
==================================================

Nếu API hỗ trợ upload avatar:

Yêu cầu:
- file preview
- validate image type
- validate max size nếu API/business rule có
- multipart/form-data
- loading upload
- optimistic UI optional
- update authStore user avatar nếu cần

Không tạo upload service trùng nếu project đã có media/upload foundation.

==================================================
CHANGE PASSWORD
==================================================

Nếu API có:

Implement:
- currentPassword
- newPassword
- confirmPassword

Validation:
- required
- confirmPassword match
- password policy nếu docs có

Security:
- không log password
- clear form sau success
- show success toast

==================================================
AUTH STORE INTEGRATION
==================================================

Nếu profile update ảnh hưởng current user:
- update authStore user data
- sync avatar/name UI

Không tạo auth store mới.

==================================================
FORM VALIDATION
==================================================

Dùng:
- react-hook-form
- zod nếu foundation đã setup

Validate theo API doc/business rules.

==================================================
UI/UX
==================================================

Reuse:
- Button
- Input
- Modal
- LoadingState
- ErrorState
- EmptyState
- Auth layouts
- toast system

Yêu cầu:
- responsive basic
- clean UI
- no inline giant JSX
- reusable forms/components nếu hợp lý

==================================================
ERROR HANDLING
==================================================

Use existing:
- axios interceptor
- errorHandler
- toast system

Show:
- validation errors
- API errors
- upload errors
- unauthorized errors

==================================================
STATE/CACHING
==================================================

Nếu project đã dùng React Query/TanStack Query:
- useQuery cho profile fetch
- useMutation cho update

Invalidate/refetch profile query sau update nếu cần.

Không duplicate fetching logic.

==================================================
DOCS UPDATE
==================================================

Sau khi implement, cập nhật:

docs/ai-fe/modules/user.md

Bao gồm:
1. Routes
2. Pages
3. Services
4. APIs integrated
5. Avatar upload flow
6. Change password flow
7. State management integration
8. Validation rules
9. Known TODOs

Nếu auth module liên quan:
- update docs/ai-fe/modules/auth.md

==================================================
TEST CHECKLIST
==================================================

Tạo hoặc cập nhật:

docs/ai-fe/modules/user-test-checklist.md

Checklist:
1. Mở profile page không lỗi.
2. Load current user thành công.
3. Update profile thành công.
4. Avatar upload hoạt động nếu API có.
5. Avatar preview hoạt động.
6. Change password hoạt động nếu API có.
7. Validation hiển thị đúng.
8. API error hiển thị đúng.
9. AuthStore sync đúng sau update.
10. npm run build pass.

==================================================
ACCEPTANCE CRITERIA
==================================================

Hoàn thành khi:

1. User profile APIs hoạt động đúng.
2. Update profile hoạt động đúng.
3. Avatar upload hoạt động nếu API có.
4. Change password hoạt động nếu API có.
5. Không tạo duplicate services/components/stores.
6. UI reuse foundation components.
7. Error/loading handling hoạt động.
8. docs/ai-fe/modules/user.md được cập nhật.
9. npm run build không lỗi.

==================================================
OUTPUT SAU KHI CODE
==================================================

Sau khi implement, trả về:

1. Files created.
2. Files modified.
3. Routes added/updated.
4. APIs integrated.
5. Profile flow summary.
6. Avatar upload flow summary.
7. Change password flow summary.
8. State management summary.
9. Testing steps.
10. Build result.