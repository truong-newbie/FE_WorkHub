Bạn là senior frontend engineer. Hãy refactor lại FE React + Vite của dự án WorkHub theo chuẩn UI/UX của một website tìm kiếm việc làm chuyên nghiệp, lấy phong cách tham khảo từ ITviec.

Bối cảnh:

* Backend API đã hoàn thành.
* Frontend đã làm xong các chức năng: User, Register, Login, Logout, Google/Facebook Login, Forgot Password.
* Nhưng giao diện hiện tại còn xấu, chưa đúng logic và trải nghiệm của một job portal thực tế.
* Trong dự án có thư mục `docs/ai-fe`, đây là tài liệu bắt buộc phải đọc trước khi code.

Yêu cầu bắt buộc trước khi code:

1. Đọc kỹ toàn bộ thư mục:

   * `docs/ai-fe`
   * `docs/ai-fe/ui-rules.md`
   * các file architecture/convention/styling nếu có
   * các file API document liên quan đến auth, user, forgot password
2. Không được tự tạo architecture mới.
3. Không được sửa bừa flow API.
4. Không được code UI generic kiểu admin dashboard/template.
5. Phải giữ đúng convention hiện tại của project.

Mục tiêu chính:
Refactor UI/UX các chức năng:

* Login
* Register
* Logout
* Google Login
* Facebook Login
* Forgot Password
* User/Profile

Phong cách thiết kế bắt buộc:

* Thiết kế theo chuẩn website tuyển dụng/tìm kiếm việc làm.
* Lấy style tham khảo từ ITviec:

  * layout sạch, chuyên nghiệp
  * màu sắc nghiêm túc, hiện đại
  * CTA rõ ràng
  * form compact, dễ dùng
  * spacing vừa phải, không quá rộng
  * hierarchy rõ
  * không gradient màu mè
  * không animation thừa
  * không thiết kế kiểu landing page chung chung
* Giao diện phải tạo cảm giác đây là nền tảng tuyển dụng thật, không phải project demo sinh viên.

Yêu cầu UI cụ thể:

1. Login Page

* Thiết kế lại trang login chuẩn job portal.
* Có branding WorkHub rõ ràng.
* Có câu value proposition kiểu:
  “Tìm việc IT phù hợp, kết nối với nhà tuyển dụng uy tín.”
* Form login chuyên nghiệp, compact.
* Có email/password validation.
* Có loading state khi submit.
* Có error message rõ ràng.
* Có link Forgot Password.
* Có link Register.
* Có Google/Facebook login button nếu flow hiện tại hỗ trợ.
* Sau login redirect đúng theo logic hiện tại.

2. Register Page

* Thiết kế form đăng ký rõ ràng, dễ nhập.
* Nếu có chọn role Candidate/Recruiter thì phải làm đúng theo API document.
* Không tự bịa field không có trong API.
* Validate dữ liệu trước khi gọi API.
* Hiển thị lỗi API đúng vị trí.
* Có link chuyển sang Login.
* UX phải phù hợp với website tuyển dụng.

3. Forgot Password

* Làm đúng flow theo API document.
* Nếu flow gồm nhiều bước thì UI phải chia bước rõ ràng.
* Có success state, error state, loading state.
* User phải hiểu sau khi nhập email thì cần làm gì tiếp theo.
* Không hardcode text sai flow BE.

4. Logout

* Kiểm tra logic logout hiện tại.
* Xóa token/session đúng cách.
* Gọi API logout nếu document yêu cầu.
* Redirect hợp lý về login/home.
* Không để user vẫn truy cập màn hình cần auth sau logout.

5. User/Profile

* Refactor UI profile/user theo chuẩn job portal.
* Thông tin user phải hiển thị rõ ràng.
* Form edit profile phải chuyên nghiệp.
* Có loading, empty, error state.
* Không hardcode data nếu đã có API.
* Nếu có avatar, role, email, phone, location thì trình bày gọn, dễ đọc.

6. Google/Facebook Login

* Kiểm tra lại flow OAuth hiện tại.
* Button phải đúng kiểu social login chuyên nghiệp.
* Không phá callback/token handling đang có.
* Nếu flow chưa hoàn chỉnh, ghi chú rõ trong summary.

Yêu cầu kỹ thuật:

* React + Vite.
* Giữ nguyên routing hiện tại nếu không bắt buộc đổi.
* Giữ nguyên service/api layer hiện tại.
* Không gọi API trực tiếp lung tung trong component nếu project đã có service.
* Tách component hợp lý.
* Reuse component nếu đã có.
* Có thể tạo component chung như:

  * AuthLayout
  * AuthCard
  * FormInput
  * LoadingButton
  * ErrorMessage
  * SocialLoginButton
* Không đổi endpoint API.
* Không sửa backend.
* Không fake data.
* Không phá chức năng hiện có.

Yêu cầu responsive:

* Desktop: layout chuyên nghiệp, có thể chia 2 cột: branding/job portal message bên trái, form bên phải.
* Mobile: form gọn, dễ nhập, không vỡ layout.
* Tablet: layout cân đối.

Yêu cầu kiểm tra sau khi code:

1. Chạy build:

   * `npm run build`
2. Nếu có lint/test thì chạy thêm:

   * `npm run lint`
   * `npm test`
3. Test thủ công các flow:

   * Register
   * Login
   * Logout
   * Forgot Password
   * Google Login
   * Facebook Login
   * User/Profile
4. Sửa toàn bộ lỗi build, lỗi import, lỗi route, lỗi API call nếu phát sinh.

Yêu cầu cập nhật tài liệu:
Sau khi hoàn thành, cập nhật lại `docs/ai-fe` nếu có thay đổi:

* Nếu thay đổi UI convention, cập nhật `ui-rules.md`.
* Nếu thay đổi component structure, cập nhật architecture/convention document.
* Nếu phát hiện API document thiếu hoặc lệch với code thực tế, bổ sung phần `Implementation Notes`.
* Không xóa tài liệu cũ nếu chưa chắc.

Kết quả cuối cùng cần báo cáo:
Sau khi làm xong, hãy trả về summary gồm:

1. Đã đọc những file nào trong `docs/ai-fe`.
2. Đã sửa những file nào.
3. Đã tạo/refactor component nào.
4. UI đã được chỉnh theo phong cách job portal/ITviec như thế nào.
5. Các flow đã test.
6. Lệnh build/lint/test đã chạy và kết quả.
7. Những vấn đề còn lại nếu có.
