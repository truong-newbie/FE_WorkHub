# WorkHub User API Document

Tai lieu nay dung de test module User tren local backend.

## Loi ban vua gap

Ban dang goi:

```http
GET http://localhost:8080/api/v1/users/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654
```

Endpoint nay sai vi backend khong co `/users` so nhieu. Backend dang khai bao prefix la `/user` so it.

Dung endpoint nay:

```http
GET http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654
```

## Thong tin chung

Base URL:

```http
http://localhost:8080/api/v1
```

Header cho cac API can dang nhap:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Response thanh cong luon co dang:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Role dang dung trong code:

```text
ROLE_ADMIN
ROLE_RECRUITER
ROLE_CANDIDATE
```

Luu y: field `roleName` va `newRole` phai khop dung gia tri trong bang `tbl_roles.name`. Theo code hien tai nen test voi `ROLE_ADMIN`, `ROLE_RECRUITER`, `ROLE_CANDIDATE`.

## Flow test nhanh

1. Dang nhap bang API auth de lay access token.
2. Gan token vao header `Authorization: Bearer <accessToken>`.
3. Neu test API admin, token phai thuoc user co role `ROLE_ADMIN`.
4. Goi dung endpoint `/api/v1/user`, khong dung `/api/v1/users`.
5. Voi API self profile, dung `/api/v1/user/me/profile`.

## Frontend mapping

- User tu sua profile: mo `/profile`.
- Candidate profile route: mo `/candidate/profile`.
- Admin CRUD user: dang nhap bang tai khoan `ROLE_ADMIN`, mo `/admin/users`.
- Menu sidebar chi hien muc `Users` khi token co role admin.

Tai `/admin/users`, FE dang map cac thao tac nhu sau:

- Load bang user: `GET /api/v1/user`
- Thong ke: `GET /api/v1/user/statistics`
- Tao user: `POST /api/v1/user`
- Bam `Edit`: `GET /api/v1/user/{userId}`
- Luu form edit: `PUT /api/v1/user/{userId}`
- Bam `Delete`: `DELETE /api/v1/user/{userId}`
- Bam `Lock`: `PUT /api/v1/user/{userId}/lock`
- Bam `Unlock`: `PUT /api/v1/user/{userId}/unlock`
- Bam `Role`: `PUT /api/v1/user/{userId}/role`

## Mau UserResponse

Cac API tra ve user thuong co body mau nhu sau:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johndoe",
    "email": "john@example.com",
    "age": 25,
    "gender": "MALE",
    "dob": "1995-05-15",
    "address": "123 Nguyen Hue, District 1, HCMC",
    "phone": "0912345678",
    "headline": "Senior Java Developer",
    "bio": "Experienced developer with 5+ years",
    "experienceYears": 5,
    "location": "Ho Chi Minh City",
    "website": "https://johndoe.dev",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "roleName": "ROLE_CANDIDATE",
    "roleId": 3,
    "companyId": null,
    "companyName": null,
    "enabled": true,
    "deleted": false,
    "provider": null,
    "createdDate": "2026-05-25T14:00:00",
    "lastModifiedDate": "2026-05-25T14:10:00"
  }
}
```

## 1. Create User

Tao user moi. Chi `ROLE_ADMIN` duoc goi.

```http
POST http://localhost:8080/api/v1/user
```

Request body:

```json
{
  "username": "candidate01",
  "email": "candidate01@example.com",
  "password": "Password123",
  "age": 25,
  "gender": "MALE",
  "dob": "1999-05-15",
  "address": "123 Nguyen Hue, District 1, HCMC",
  "phone": "0912345678",
  "headline": "Java Developer",
  "bio": "Backend developer",
  "experienceYears": 3,
  "location": "Ho Chi Minh City",
  "website": "https://candidate01.dev",
  "linkedinUrl": "https://linkedin.com/in/candidate01",
  "githubUrl": "https://github.com/candidate01",
  "roleName": "ROLE_CANDIDATE",
  "companyId": null
}
```

Response mong doi: `201 Created`

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "candidate01",
    "email": "candidate01@example.com",
    "roleName": "ROLE_CANDIDATE",
    "enabled": true,
    "deleted": false
  }
}
```

Loi hay gap:

- `403 Forbidden`: token khong phai admin.
- `409 Conflict`: email hoac username da ton tai.
- `404 Not Found`: `roleName` khong ton tai trong bang `tbl_roles`.

## 2. Get All Users

Lay danh sach user co phan trang va filter. Chi `ROLE_ADMIN` duoc goi.

```http
GET http://localhost:8080/api/v1/user
```

Query params:

```text
keyword=john
role=ROLE_CANDIDATE
gender=MALE
minAge=20
maxAge=40
companyId=1
enabled=true
includeDeleted=false
page=0
size=10
sortBy=createdDate
sortDir=DESC
```

URL test day du:

```http
GET http://localhost:8080/api/v1/user?keyword=john&role=ROLE_CANDIDATE&gender=MALE&page=0&size=10&sortBy=createdDate&sortDir=DESC
```

Request body: khong co.

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 1,
      "totalPages": 1,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "createdDate",
      "sortType": "DESC"
    },
    "items": [
      {
        "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
        "username": "johndoe",
        "email": "john@example.com",
        "roleName": "ROLE_CANDIDATE",
        "enabled": true,
        "deleted": false
      }
    ]
  }
}
```

## 3. Get User By ID

Lay chi tiet user theo ID. `ROLE_ADMIN` duoc xem moi user. `ROLE_RECRUITER` va `ROLE_CANDIDATE` chi duoc xem chinh minh.

```http
GET http://localhost:8080/api/v1/user/{userId}
```

URL test:

```http
GET http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654
```

Request body: khong co.

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johndoe",
    "email": "john@example.com",
    "roleName": "ROLE_CANDIDATE",
    "enabled": true,
    "deleted": false
  }
}
```

## 4. Update User By ID

Cap nhat user theo ID. `ROLE_ADMIN` duoc update moi user. User thuong chi duoc update chinh minh.

```http
PUT http://localhost:8080/api/v1/user/{userId}
```

URL test:

```http
PUT http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654
```

Request body:

```json
{
  "username": "johnupdated",
  "email": "john.updated@example.com",
  "age": 26,
  "gender": "MALE",
  "dob": "1998-05-15",
  "address": "456 Le Loi, District 1, HCMC",
  "phone": "0987654321",
  "headline": "Senior Java Developer",
  "bio": "Updated bio",
  "experienceYears": 5,
  "location": "Ho Chi Minh City",
  "website": "https://johnupdated.dev",
  "linkedinUrl": "https://linkedin.com/in/johnupdated",
  "githubUrl": "https://github.com/johnupdated",
  "avatar": "https://example.com/avatar.jpg",
  "enabled": true,
  "companyId": ""
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johnupdated",
    "email": "john.updated@example.com",
    "headline": "Senior Java Developer",
    "enabled": true
  }
}
```

Luu y: chi admin moi duoc gan/xoa `companyId` truc tiep. Neu user thuong gui `companyId`, backend se tra `403`.

## 5. Delete User

Xoa mem user. Chi `ROLE_ADMIN` duoc goi.

```http
DELETE http://localhost:8080/api/v1/user/{userId}
```

URL test:

```http
DELETE http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654
```

Request body: khong co.

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": "User deleted successfully"
}
```

Sau khi xoa mem, user se co `deleted=true` va `enabled=false`.

## 6. Get Current User Profile

Lay profile cua user dang dang nhap.

```http
GET http://localhost:8080/api/v1/user/me/profile
```

Request body: khong co.

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johndoe",
    "email": "john@example.com",
    "roleName": "ROLE_CANDIDATE",
    "enabled": true,
    "deleted": false
  }
}
```

## 7. Update Current User Profile

Cap nhat profile cua user dang dang nhap. API nay khong cho doi email, role, company.

```http
PUT http://localhost:8080/api/v1/user/me/profile
```

Request body:

```json
{
  "username": "johnprofile",
  "age": 27,
  "gender": "MALE",
  "dob": "1997-05-15",
  "address": "789 Pasteur, District 3, HCMC",
  "phone": "0911111111",
  "headline": "Backend Engineer",
  "bio": "I build backend services",
  "experienceYears": 4,
  "location": "Ho Chi Minh City",
  "website": "https://johnprofile.dev",
  "linkedinUrl": "https://linkedin.com/in/johnprofile",
  "githubUrl": "https://github.com/johnprofile",
  "avatar": "https://example.com/avatar-profile.jpg"
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johnprofile",
    "headline": "Backend Engineer",
    "avatar": "https://example.com/avatar-profile.jpg"
  }
}
```

## 8. Change Current User Password

Doi mat khau cua user dang dang nhap.

```http
PUT http://localhost:8080/api/v1/user/me/password
```

Request body:

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": "Password changed successfully"
}
```

Loi hay gap:

- Current password sai.
- `newPassword` va `confirmPassword` khong khop.
- Password moi khong du format: toi thieu 8 ky tu, co chu hoa, chu thuong va so.

## 9. Upload Avatar File

Cap nhat avatar cua user dang dang nhap bang file anh tu may local.

```http
PUT http://localhost:8080/api/v1/user/me/avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Body trong Postman:

```text
Body -> form-data
Key: avatar
Type: File
Value: chon anh tu may
```

Backend cung chap nhan key `file` neu can test thu cong:

```text
Key: file
Type: File
Value: chon anh tu may
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/dgsvytpbt/image/upload/v.../workhub/avatars/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654.jpg",
    "roleName": "ROLE_CANDIDATE",
    "enabled": true,
    "deleted": false
  }
}
```

Loi hay gap:

Khong gui file:

```json
{
  "status": "ERROR",
  "message": "Company image file is empty"
}
```

File khong phai anh:

```json
{
  "status": "ERROR",
  "message": "Company image file is invalid"
}
```

## 10. Lock User

Khoa tai khoan user. Chi `ROLE_ADMIN` duoc goi.

```http
PUT http://localhost:8080/api/v1/user/{userId}/lock
```

URL test:

```http
PUT http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654/lock
```

Request body:

```json
{
  "reason": "Violation of terms"
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": "User locked successfully"
}
```

Sau khi lock, user se co `enabled=false`.

## 11. Unlock User

Mo khoa tai khoan user. Chi `ROLE_ADMIN` duoc goi.

```http
PUT http://localhost:8080/api/v1/user/{userId}/unlock
```

URL test:

```http
PUT http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654/unlock
```

Request body:

```json
{
  "reason": "Account verified"
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": "User unlocked successfully"
}
```

Sau khi unlock, user se co `enabled=true`.

## 12. Change User Role

Doi role cua user. Chi `ROLE_ADMIN` duoc goi.

```http
PUT http://localhost:8080/api/v1/user/{userId}/role
```

URL test:

```http
PUT http://localhost:8080/api/v1/user/0666c2bc-5bf6-42f3-9a72-a85fc8d4a654/role
```

Request body:

```json
{
  "reason": "Promote user to recruiter",
  "newRole": "ROLE_RECRUITER"
}
```

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": "0666c2bc-5bf6-42f3-9a72-a85fc8d4a654",
    "username": "johndoe",
    "email": "john@example.com",
    "roleName": "ROLE_RECRUITER"
  }
}
```

## 13. Get User Statistics

Lay thong ke user. Chi `ROLE_ADMIN` duoc goi.

```http
GET http://localhost:8080/api/v1/user/statistics
```

Request body: khong co.

Response mong doi:

```json
{
  "status": "SUCCESS",
  "data": {
    "totalUsers": 150,
    "activeUsers": 140,
    "lockedUsers": 5,
    "deletedUsers": 5,
    "usersByRole": {
      "ROLE_ADMIN": 1,
      "ROLE_RECRUITER": 20,
      "ROLE_CANDIDATE": 129
    },
    "usersByGender": {
      "MALE": 80,
      "FEMALE": 60,
      "OTHER": 5,
      "UNKNOWN": 5
    },
    "newUsersThisMonth": 12,
    "newUsersToday": 2
  }
}
```

## Checklist Postman

Tao environment:

```text
baseUrl = http://localhost:8080/api/v1
accessToken = token lay tu api login
userId = id user can test
```

Dung URL trong Postman:

```text
{{baseUrl}}/user
{{baseUrl}}/user/{{userId}}
{{baseUrl}}/user/me/profile
{{baseUrl}}/user/me/password
{{baseUrl}}/user/me/avatar
{{baseUrl}}/user/{{userId}}/lock
{{baseUrl}}/user/{{userId}}/unlock
{{baseUrl}}/user/{{userId}}/role
{{baseUrl}}/user/statistics
```

Header:

```text
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

Neu gap loi `No static resource api/v1/users/...`, sua URL tu `/users` thanh `/user`.
