Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

Nhiệm vụ: Hoàn thiện chức năng **User gửi yêu cầu trở thành Recruiter** dựa trên API document:

* `docs/ai-fe/modules/test_api_recruiter_requirement.md`

Trước khi code, bắt buộc đọc kỹ các file tài liệu trong `docs/ai-fe`, đặc biệt:

* `docs/ai-fe/ui-rules.md`
* `docs/ai-fe/architecture.md`
* `docs/ai-fe/conventions.md`
* `docs/ai-fe/modules/test_api_recruiter_requirement.md`
* Các module FE đã làm trước đó để hiểu style, structure, API service pattern, component pattern, route pattern và cách xử lý auth.

Nếu tên file thực tế hơi khác, hãy tự tìm trong `docs/ai-fe` bằng keyword:
`recruiter`, `requirement`, `request`, `user`, `auth`, `profile`.

## Mục tiêu chức năng

Hoàn thiện flow để user/candidate có thể gửi yêu cầu nâng cấp tài khoản lên **Recruiter**.

Flow mong muốn:

1. User đăng nhập vào hệ thống.
2. User vào trang profile hoặc account setting.
3. Có nút/entry rõ ràng: **Trở thành nhà tuyển dụng** / **Become a Recruiter**.
4. Khi bấm vào, user được chuyển tới trang/form gửi yêu cầu.
5. Form phải bám sát các field trong `test_api_recruiter_requirement.md`.
6. Submit form gọi đúng API.
7. Hiển thị trạng thái yêu cầu nếu user đã gửi request trước đó.
8. Nếu request đang pending/approved/rejected thì UI phải xử lý hợp lý.
9. Không cho spam gửi nhiều request nếu API/document có quy định.
10. Admin hoặc role phù hợp nếu có API duyệt/từ chối thì implement đúng theo API doc.

## Yêu cầu bắt buộc về UI/UX

Thiết kế phải theo phong cách website tuyển dụng hiện đại giống ITviec, không làm UI generic.

Bắt buộc tuân thủ:

* Không dùng gradient màu mè.
* Không dùng spacing quá lớn.
* Layout compact, chuyên nghiệp, rõ hierarchy.
* Màu chủ đạo nên đồng bộ với toàn bộ WorkHub.
* Form phải sạch, dễ đọc, có label rõ ràng.
* Có loading state khi submit/fetch data.
* Có error state khi API lỗi.
* Có empty state nếu chưa có request.
* Có success feedback sau khi gửi yêu cầu.
* Có validation rõ ràng trước khi submit.
* Responsive tốt trên desktop/tablet/mobile.
* Không để text linh tinh kiểu demo/test.
* Không hard-code dữ liệu fake nếu API đã có thật.

## Gợi ý UI

Tạo trang riêng cho flow này, ví dụ:

* `/user/become-recruiter`
* hoặc route phù hợp với convention hiện tại của project.

Trang nên có layout dạng:

1. Header section:

   * Title: “Trở thành nhà tuyển dụng”
   * Subtitle ngắn giải thích quyền lợi khi trở thành recruiter.

2. Info card:

   * Giải thích recruiter có thể đăng tin tuyển dụng, quản lý ứng viên, xem CV, screening ATS nếu hệ thống hỗ trợ.

3. Request form:

   * Render đúng field theo API doc.
   * Field nào required thì validate required.
   * Field email/phone/url nếu có thì validate đúng format.
   * Nếu có companyId/companyName/companyWebsite/businessEmail/... thì đặt label chuyên nghiệp.

4. Status card:

   * Nếu đã gửi request, hiển thị trạng thái:

     * PENDING: Đang chờ duyệt
     * APPROVED: Đã được duyệt
     * REJECTED: Bị từ chối
   * Nếu rejected có reason/reviewNote thì hiển thị rõ.
   * Nếu approved thì có CTA chuyển tới recruiter dashboard nếu route đã tồn tại.

## Yêu cầu về code structure

Không tự tạo kiến trúc mới. Phải follow đúng cấu trúc FE hiện tại.

Trước khi code phải inspect project để xác định:

* Cách tổ chức routes/pages hiện tại.
* Cách gọi API service hiện tại.
* Cách lưu token/auth hiện tại.
* Cách handle response base format hiện tại.
* Cách dùng component UI/form hiện tại.
* Cách đặt tên file/folder hiện tại.
* Cách phân quyền route hiện tại.

Nếu project đang có cấu trúc kiểu:

* `src/pages`
* `src/components`
* `src/services`
* `src/apis`
* `src/hooks`
* `src/types`
* `src/routes`

thì đặt file theo đúng convention đó, không tự phát minh folder mới nếu không cần.

## API Integration

Đọc kỹ `docs/ai-fe/modules/test_api_recruiter_requirement.md` và implement đúng:

* Endpoint.
* HTTP method.
* Request body.
* Query/path params nếu có.
* Response format.
* Error response.
* Auth header.
* Role requirement.
* Status enum.
* Pagination/filter nếu có API danh sách.
* API gửi request.
* API lấy request hiện tại của user nếu có.
* API admin duyệt/từ chối nếu có trong tài liệu.

Tất cả request phải tự động gắn:

```ts
Authorization: Bearer <access_token>
```

theo cơ chế auth hiện tại của dự án.

Không hard-code base URL nếu project đã có config/env.

## Các phần cần implement

Tùy vào API doc, hoàn thiện đầy đủ các phần sau nếu có endpoint tương ứng:

### User side

* Trang gửi yêu cầu trở thành recruiter.
* API service gửi request.
* API service lấy request hiện tại của user.
* Form validation.
* Loading/error/success state.
* Status badge theo trạng thái request.
* Disable submit nếu request đang pending hoặc approved.
* Cho phép gửi lại nếu request rejected chỉ khi API cho phép.

### Admin side nếu API doc có endpoint quản lý

* Trang danh sách yêu cầu recruiter.
* Table/list request compact, chuyên nghiệp.
* Filter theo status nếu API hỗ trợ.
* Search nếu API hỗ trợ.
* Pagination nếu API hỗ trợ.
* Detail drawer/modal/page nếu cần.
* Button approve.
* Button reject.
* Reject form có reason nếu API yêu cầu.
* Confirm dialog trước khi approve/reject.
* Sau khi approve/reject phải refetch hoặc update state đúng.

## Validation

Implement validation thực tế:

* Required fields không được để trống.
* Phone number nếu có phải hợp lệ.
* Website URL nếu có phải hợp lệ.
* Business email nếu có phải đúng email format.
* Textarea reason/description nếu có nên giới hạn min/max length theo API doc nếu có.
* Không cho submit khi form invalid.
* Hiển thị lỗi gần field, không chỉ toast chung chung.

## Auth & Role Guard

Kiểm tra cách project đang guard route.

Yêu cầu:

* User chưa đăng nhập thì chuyển login hoặc hiện message phù hợp theo convention.
* Candidate/user thường được gửi request nếu API cho phép.
* Recruiter đã được duyệt không cần gửi request nữa.
* Admin page chỉ admin truy cập.
* Không để user thường thấy action approve/reject.

## Style yêu cầu

Style phải đồng bộ với các trang đã làm:

* Button rõ ràng, không quá to.
* Card border nhẹ, shadow nhẹ nếu project đang dùng.
* Status badge màu rõ:

  * Pending: vàng/cam nhẹ
  * Approved: xanh
  * Rejected: đỏ
* Form width hợp lý, không kéo full màn hình quá rộng.
* Page layout giống một website tuyển dụng thật, không giống dashboard template generic.

## Error handling

Phải xử lý các case:

* 401/403: hết phiên hoặc không có quyền.
* 400: validation backend trả về.
* 404: không tìm thấy request nếu API có get current request.
* 409: đã tồn tại request pending/approved.
* 500: lỗi server.
* Network error.

Không được crash UI nếu response thiếu field.

## Documentation update

Sau khi code xong, cập nhật lại tài liệu trong `docs/ai-fe/modules/test_api_recruiter_requirement.md` hoặc tạo/cập nhật file module tương ứng nếu convention yêu cầu.

Nội dung update gồm:

* Các page/route đã implement.
* Các component đã tạo/sửa.
* Các service/API function đã tạo/sửa.
* Các trạng thái UI đã xử lý.
* Các role guard đã áp dụng.
* Các lưu ý cho AI/dev sau tiếp tục maintain.

Không viết lan man, chỉ ghi phần thay đổi thực tế.

## Verification

Sau khi implement xong, bắt buộc chạy kiểm tra:

* `npm install` nếu thiếu dependency.
* `npm run lint` nếu project có.
* `npm run build` nếu project có.
* `npm run dev` để kiểm tra UI nếu cần.

Nếu command fail, phải đọc lỗi và sửa. Không được bỏ qua lỗi build/lint.

## Nguyên tắc làm việc

* Search trước, đọc file liên quan trước, không sửa mò.
* Patch nhỏ, đúng phạm vi.
* Không refactor lớn ngoài module này.
* Không đổi design system toàn cục nếu không cần.
* Không đổi cấu trúc auth/api hiện tại.
* Không làm mock nếu API thật đã có document.
* Không xóa code cũ nếu không chắc.
* Không tạo duplicate service/component nếu đã có cái tương tự.
* Sau khi làm xong phải tóm tắt rõ đã sửa những file nào và vì sao.
