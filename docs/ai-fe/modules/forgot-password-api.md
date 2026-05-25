# WorkHub Forgot Password API

Tài liệu này mô tả chính xác API forgot password theo code hiện tại.

Base URL local:

```text
http://localhost:8080/api/v1
```

Controller:

```text
src/main/java/org/example/workhub/controller/ForgotPasswordController.java
```

Service:

```text
src/main/java/org/example/workhub/service/impl/ForgotPasswordServiceImpl.java
```

## 1. Tổng Quan Flow

Forgot password hiện có 3 bước:

```text
1. Verify email -> backend gửi OTP qua email
2. Verify OTP -> backend kiểm tra OTP hợp lệ và chưa hết hạn
3. Reset password -> backend đổi password mới
```

Các endpoint:

```text
POST /api/v1/forgot-password/email-verification/{email}
POST /api/v1/forgot-password/otp-verification
POST /api/v1/forgot-password/password-update/{email}
```

## 2. Send OTP To Email

### URL

```http
POST http://localhost:8080/api/v1/forgot-password/email-verification/{email}
```

Ví dụ:

```http
POST http://localhost:8080/api/v1/forgot-password/email-verification/user@example.com
```

### Headers

Không cần `Authorization`.

### Request Body

Không có body.

### Logic Backend

Backend sẽ:

1. Tìm user theo email.
2. Generate OTP 6 chữ số.
3. Tạo email:

   ```text
   Subject: OTP for Forgot Password request
   Text: This is OTP for your Forgot Password request :<otp>
   ```

4. Lưu OTP vào bảng `forgot_password`.
5. OTP hết hạn sau khoảng `70` giây.
6. Gửi email bằng `EmailService.sendSimpleMessage(...)`.

### Response Thành Công Mong Đợi

```json
{
  "status": "SUCCESS",
  "data": {
    "status": true,
    "message": "Email sent for verification"
  }
}
```

### Response Lỗi

Email không tồn tại:

```json
{
  "status": "ERROR",
  "message": "User not found with email"
}
```

Message thực tế phụ thuộc i18n key:

```text
exception.user.not.found.email
```

## 3. Verify OTP

### URL

```http
POST http://localhost:8080/api/v1/forgot-password/otp-verification
```

### Headers

```text
Content-Type: application/json
```

Không cần `Authorization`.

### Request Body

```json
{
  "email": "user@example.com",
  "otp": 123456
}
```

DTO:

```text
VerifyOtpRequestDto
```

Fields:

```java
Integer otp;
String email;
```

### Logic Backend

Backend sẽ:

1. Tìm user theo email.
2. Tìm record `ForgotPassword` theo `otp` và `user`.
3. Nếu không tìm thấy -> OTP invalid.
4. Nếu OTP hết hạn -> xóa record OTP và trả lỗi expired.
5. Nếu hợp lệ -> return success.

### Response Thành Công Mong Đợi

```json
{
  "status": "SUCCESS",
  "data": "OTP verified successfully"
}
```

### Response Lỗi

OTP sai hoặc không tồn tại:

```json
{
  "status": "ERROR",
  "message": "OTP is invalid"
}
```

OTP hết hạn:

```json
{
  "status": "ERROR",
  "message": "OTP is expired"
}
```

Email không tồn tại:

```json
{
  "status": "ERROR",
  "message": "User not found with email"
}
```

## 4. Reset Password

### URL

```http
POST http://localhost:8080/api/v1/forgot-password/password-update/{email}
```

Ví dụ:

```http
POST http://localhost:8080/api/v1/forgot-password/password-update/user@example.com
```

### Headers

```text
Content-Type: application/json
```

Không cần `Authorization`.

### Request Body

```json
{
  "password": "NewPassword@123",
  "repeatPassword": "NewPassword@123"
}
```

DTO:

```text
ChangePassword
```

Fields:

```java
String password;
String repeatPassword;
```

### Logic Backend

Backend sẽ:

1. So sánh `password` và `repeatPassword`.
2. Nếu khác nhau -> lỗi.
3. Nếu giống nhau -> encode password bằng `PasswordEncoder`.
4. Update password user theo email.

Code chính:

```java
if (!Objects.equals(changePassword.password(), changePassword.repeatPassword())) {
    throw new BadRequestException(ErrorMessage.INVALID_REPEAT_PASSWORD);
}
userRepository.updatePassword(email, passwordEncoder.encode(changePassword.password()));
```

### Response Thành Công Mong Đợi

```json
{
  "status": "SUCCESS",
  "data": "Password changed successfully"
}
```

### Response Lỗi

Password nhập lại không khớp:

```json
{
  "status": "ERROR",
  "message": "Please enter the password again"
}
```

## 5. Bảng Database Liên Quan

Entity:

```text
ForgotPassword
```

Table mặc định theo JPA:

```text
forgot_password
```

Fields:

```java
Long id;
Integer otp;
Date expirationTime;
User user;
```

Khi gọi verify email, backend tạo record mới:

```text
otp = 6 digits
expiration_time = now + 70 seconds
user_id = user id
```

## 6. Postman Test Checklist

### Bước 1: Gửi OTP

```http
POST http://localhost:8080/api/v1/forgot-password/email-verification/user@example.com
```

Expected:

```json
{
  "status": "SUCCESS",
  "data": {
    "status": true,
    "message": "Email sent for verification"
  }
}
```

Sau đó kiểm tra email để lấy OTP.

### Bước 2: Verify OTP

```http
POST http://localhost:8080/api/v1/forgot-password/otp-verification
Content-Type: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "otp": 123456
}
```

Expected:

```json
{
  "status": "SUCCESS",
  "data": "OTP verified successfully"
}
```

### Bước 3: Đổi Password

```http
POST http://localhost:8080/api/v1/forgot-password/password-update/user@example.com
Content-Type: application/json
```

Body:

```json
{
  "password": "NewPassword@123",
  "repeatPassword": "NewPassword@123"
}
```

Expected:

```json
{
  "status": "SUCCESS",
  "data": "Password changed successfully"
}
```

### Bước 4: Login Lại

```http
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "password": "NewPassword@123"
}
```

## 7. Lưu Ý Quan Trọng Theo Code Hiện Tại

### OTP chỉ có hạn 70 giây

Code:

```java
new Date(System.currentTimeMillis() + 70 * 1000)
```

Nên khi test cần nhập OTP nhanh.

### Reset password hiện chưa bắt buộc verify OTP trong cùng request

Endpoint đổi password:

```text
POST /forgot-password/password-update/{email}
```

hiện chỉ kiểm tra `password == repeatPassword`, rồi update password. Nó không kiểm tra trạng thái "OTP đã verify" trước khi đổi password.

Nếu muốn production-ready hơn, nên cải thiện:

- thêm flag `verified` vào `ForgotPassword`, hoặc
- yêu cầu reset password request truyền `otp`, hoặc
- tạo reset token ngắn hạn sau khi verify OTP.

### Có thể có nhiều OTP cho cùng user

Mỗi lần gửi OTP sẽ save thêm một `ForgotPassword` record mới. Code hiện chưa xóa OTP cũ trước khi tạo OTP mới.

Nếu muốn sạch hơn, nên xóa OTP cũ của user trước khi tạo OTP mới.

### Email gửi trực tiếp, chưa qua RabbitMQ

Forgot password đang dùng:

```java
emailService.sendSimpleMessage(mailBody);
```

Không đi qua RabbitMQ queue.
