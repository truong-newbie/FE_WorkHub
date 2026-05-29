Bạn là senior frontend engineer. Hãy tiếp tục refactor module User/Profile trong dự án WorkHub React + Vite theo chuẩn UI/UX của một website tìm kiếm việc làm hiện đại, chuyên nghiệp, tham khảo phong cách ITviec.

Bối cảnh hiện tại:

* Dự án là FE React + Vite cho nền tảng tuyển dụng WorkHub.
* Backend API đã có sẵn.
* Các chức năng auth/user cơ bản đã làm.
* Profile hiện tại nhìn tạm ổn nhưng chưa thật sự giống một trang tuyển dụng chuyên nghiệp.
* Navbar/taskbar hiện tại còn chưa ổn, có chữ “instagram”, các menu như Home/Profile/User đang chưa đúng logic của job portal.
* Phần User của Admin cũng cần thiết kế lại cho chuẩn, không nên gom tất cả vào một trang rối.
* Trong dự án có thư mục `docs/ai-fe`, đây là tài liệu bắt buộc phải đọc trước khi sửa code.

Yêu cầu bắt buộc trước khi code:

1. Đọc kỹ toàn bộ thư mục:

   * `docs/ai-fe`
   * `docs/ai-fe/ui-rules.md`
   * các file architecture/convention/styling nếu có
   * các file API document liên quan đến user/profile/admin user/change password/upload avatar
2. Không được tự tạo architecture mới nếu project đã có convention.
3. Không được sửa backend.
4. Không được đổi endpoint API nếu không có lý do rõ ràng.
5. Không được hardcode dữ liệu nếu đã có API.
6. Không được code UI generic kiểu admin dashboard/template.
7. Không được dùng style social network như Instagram/Facebook.
8. UI phải theo chuẩn website tuyển dụng/job portal.

Mục tiêu chính:
Refactor lại toàn bộ UI/UX và routing logic cho:

* Candidate/Recruiter User Profile
* Edit Profile
* Upload Avatar
* Change Password
* Admin User Management
* Navbar/Header/Taskbar/Menu

Phong cách thiết kế bắt buộc:

* Thiết kế theo chuẩn website tìm kiếm việc làm hiện đại.
* Tham khảo ITviec:

  * layout rõ ràng
  * header chuyên nghiệp
  * menu đúng ngữ cảnh tuyển dụng
  * card thông tin gọn gàng
  * màu sắc nghiêm túc
  * spacing vừa phải
  * CTA rõ ràng
  * không gradient màu mè
  * không animation thừa
  * không style mạng xã hội
* Giao diện phải tạo cảm giác đây là một job portal thật, không phải project demo.

Yêu cầu refactor Navbar/Header:

1. Xóa hoặc thay thế các item không phù hợp như “instagram”.
2. Thiết kế navbar theo chuẩn job portal:

   * Logo: WorkHub
   * Menu public: Việc làm, Công ty, Cẩm nang nghề nghiệp nếu có route
   * Nếu user chưa đăng nhập: Đăng nhập, Đăng ký, Đăng tuyển nếu phù hợp
   * Nếu user đã đăng nhập:

     * Candidate: Việc làm, Việc đã ứng tuyển, Việc đã lưu, Hồ sơ của tôi
     * Recruiter: Dashboard, Tin tuyển dụng, Ứng viên, Công ty của tôi
     * Admin: Dashboard, Quản lý người dùng, Quản lý công ty, Quản lý việc làm
3. Dropdown user menu nên gồm:

   * Thông tin cá nhân
   * Đổi ảnh đại diện
   * Đổi mật khẩu
   * Đăng xuất
4. Header phải responsive tốt trên mobile.
5. Không để các menu sai ngữ cảnh như Home/Profile/User chung chung.

Yêu cầu tách trang logic:
Không gom tất cả profile/avatar/password vào một màn hình.

Cần tách thành các route/page riêng, ví dụ:

* `/profile` hoặc `/me/profile`: Xem thông tin cá nhân
* `/profile/edit`: Cập nhật thông tin cá nhân
* `/profile/avatar`: Upload/thay đổi ảnh đại diện
* `/profile/change-password`: Đổi mật khẩu
* `/admin/users`: Danh sách user cho Admin
* `/admin/users/:id`: Chi tiết user
* `/admin/users/:id/edit`: Cập nhật user nếu API hỗ trợ

Lưu ý:

* Route cụ thể phải bám theo routing convention hiện tại của project.
* Nếu project đã có tên route khác, hãy giữ convention hiện tại và chỉ refactor cho logic hơn.

Yêu cầu Profile Page:

1. Trang profile chỉ nên tập trung hiển thị thông tin cá nhân.
2. Layout nên giống trang tài khoản trong job portal:

   * Avatar
   * Họ tên
   * Email
   * Role
   * Số điện thoại
   * Địa chỉ/location nếu có
   * Trạng thái tài khoản nếu API có
   * Ngày tạo/cập nhật nếu phù hợp
3. Có các CTA rõ ràng:

   * Chỉnh sửa thông tin
   * Đổi ảnh đại diện
   * Đổi mật khẩu
4. Không nhồi form upload avatar hoặc đổi mật khẩu trực tiếp vào profile chính.
5. Có loading state, error state, empty state.
6. Data hiển thị phải lấy từ API hiện tại.

Yêu cầu Edit Profile Page:

1. Tách thành trang riêng.
2. Form chỉnh sửa thông tin cá nhân rõ ràng.
3. Validate frontend theo API document.
4. Hiển thị lỗi API đúng vị trí.
5. Có nút Lưu thay đổi và Hủy.
6. Sau khi lưu thành công, redirect hoặc show success theo UX hợp lý.
7. Không thêm field không tồn tại trong API.

Yêu cầu Upload Avatar Page:

1. Tách thành trang riêng.
2. UI upload avatar chuyên nghiệp:

   * Preview ảnh hiện tại
   * Chọn ảnh mới
   * Preview trước khi upload
   * Validate định dạng file nếu API/document có yêu cầu
   * Validate dung lượng nếu API/document có yêu cầu
3. Có loading state khi upload.
4. Có success/error message.
5. Sau upload thành công, cập nhật lại avatar hiển thị ở header/profile nếu project có state quản lý user.
6. Không để upload avatar lẫn trong trang profile chính.

Yêu cầu Change Password Page:

1. Tách thành trang riêng.
2. Form gồm các field theo đúng API document, ví dụ:

   * Mật khẩu hiện tại
   * Mật khẩu mới
   * Xác nhận mật khẩu mới
3. Validate:

   * Không để trống
   * Mật khẩu mới đủ điều kiện nếu API có rule
   * Confirm password phải trùng
4. Có show/hide password.
5. Có loading, success, error state.
6. Sau khi đổi mật khẩu thành công, có thể:

   * thông báo thành công
   * yêu cầu đăng nhập lại nếu flow API yêu cầu
7. Không hardcode flow nếu API document nói khác.

Yêu cầu Admin User Management:

1. Refactor phần quản lý user của Admin theo chuẩn admin trong job portal.
2. Không thiết kế như trang profile cá nhân.
3. Tách logic thành nhiều màn hình nếu cần:

   * Danh sách user
   * Chi tiết user
   * Cập nhật user/trạng thái nếu API hỗ trợ
4. Trang danh sách user cần có:

   * table rõ ràng
   * search/filter nếu API hỗ trợ
   * phân trang nếu API hỗ trợ
   * role badge
   * status badge nếu có
   * action menu: xem chi tiết, chỉnh sửa, khóa/mở khóa nếu API hỗ trợ
5. Trang chi tiết user cần hiển thị:

   * thông tin cơ bản
   * role
   * trạng thái
   * email/phone
   * ngày tạo/cập nhật nếu API trả về
   * các action hợp lệ theo API
6. Không để Admin User trộn lẫn với Profile của user đang đăng nhập.

Yêu cầu component:
Có thể tạo/refactor các component chung nếu phù hợp:

* AppHeader
* UserDropdown
* RoleBasedNav
* ProfileCard
* ProfileInfoSection
* AvatarUploader
* ChangePasswordForm
* AdminUserTable
* AdminUserFilter
* AdminUserDetailCard
* EmptyState
* LoadingState
* ErrorState

Yêu cầu kỹ thuật:

* Giữ đúng architecture hiện tại.
* Nếu project có service/api layer, tất cả API call phải đi qua service.
* Không gọi API trực tiếp lung tung trong JSX.
* Không phá auth flow hiện tại.
* Không phá role-based routing hiện tại.
* Nếu có ProtectedRoute/PrivateRoute thì dùng lại đúng cách.
* Nếu có state quản lý current user/auth, cập nhật lại sau khi edit profile hoặc upload avatar.
* Không thêm thư viện mới nếu không cần thiết.
* Nếu cần thêm thư viện, phải giải thích lý do trong summary.

Yêu cầu responsive:

* Desktop: layout rộng, rõ hierarchy.
* Tablet/mobile: navbar chuyển hợp lý, form không vỡ layout, table admin có thể scroll ngang hoặc chuyển layout phù hợp.
* Không để UI bị tràn, lệch, hoặc spacing quá lớn.

Yêu cầu cập nhật tài liệu:
Sau khi sửa code, bắt buộc cập nhật `docs/ai-fe`:

1. Nếu thay đổi UI rules, cập nhật `docs/ai-fe/ui-rules.md`.
2. Nếu thay đổi route/page structure, cập nhật tài liệu architecture hoặc tạo/cập nhật file module user tương ứng.
3. Nếu phát hiện API document thiếu hoặc lệch với code thực tế, bổ sung phần `Implementation Notes`.
4. Ghi rõ quy ước mới:

   * Profile page chỉ xem thông tin
   * Upload avatar là page riêng
   * Change password là page riêng
   * Admin user management tách khỏi user profile
   * Navbar phải role-based, không dùng menu generic

Yêu cầu kiểm tra:
Sau khi hoàn thành, chạy:

* `npm run build`
* `npm run lint` nếu project có
* `npm test` nếu project có

Test thủ công các flow:

1. User xem profile.
2. User vào edit profile và cập nhật thông tin.
3. User vào upload avatar và upload ảnh.
4. User vào change password và đổi mật khẩu.
5. Header/navbar hiển thị đúng theo trạng thái login/logout.
6. Header/navbar hiển thị đúng theo role Candidate/Recruiter/Admin.
7. Admin vào danh sách user.
8. Admin xem chi tiết user.
9. Admin thao tác update user nếu API hỗ trợ.
10. Logout vẫn hoạt động đúng.

Kết quả cuối cùng cần báo cáo:

1. Đã đọc những file nào trong `docs/ai-fe`.
2. Đã sửa những file nào.
3. Đã tạo/refactor route nào.
4. Đã tạo/refactor component nào.
5. Đã chỉnh navbar/header/taskbar như thế nào.
6. Đã tách profile/avatar/change password/admin user ra sao.
7. Đã cập nhật tài liệu nào trong `docs/ai-fe`.
8. Đã chạy lệnh build/lint/test nào và kết quả.
9. Còn vấn đề gì cần tôi kiểm tra thêm.
