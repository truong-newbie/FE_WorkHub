Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

Nhiệm vụ: Hoàn thiện toàn bộ chức năng FE cho **Job module** dựa trên flow và API document:

* `docs/ai-fe/modules/job-api.md`

Trước khi code, bắt buộc đọc kỹ các tài liệu trong `docs/ai-fe`, đặc biệt:

* `docs/ai-fe/ui-rules.md`
* `docs/ai-fe/architecture.md`
* `docs/ai-fe/conventions.md`
* `docs/ai-fe/modules/job-api.md`
* Các module đã làm trước đó như company, resume, skill, subscriber, user, recruiter requirement để hiểu style, folder structure, API service pattern, route pattern, auth handling và cách update docs.

Nếu tên file tài liệu hơi khác, hãy tự search trong `docs/ai-fe` bằng keyword:

```text
job
jobs
recruiter
candidate
apply
favorite
publish
unpublish
search
filter
```

## Mục tiêu

Implement end-to-end FE cho module Job của WorkHub.

Job module cần phục vụ cả 3 nhóm người dùng:

1. Public / Candidate:

   * Xem danh sách việc làm.
   * Tìm kiếm/filter việc làm.
   * Xem chi tiết việc làm.
   * Lưu job yêu thích nếu API hỗ trợ.
   * Apply job nếu API flow có liên quan.

2. Recruiter:

   * Quản lý job của công ty mình.
   * Tạo job.
   * Cập nhật job.
   * Xóa/soft delete job nếu API hỗ trợ.
   * Publish/unpublish job nếu API hỗ trợ.
   * Xem danh sách ứng viên apply nếu API có trong job-api.md.

3. Admin:

   * Xem/quản lý toàn bộ job nếu API hỗ trợ.
   * Kiểm duyệt hoặc thao tác trạng thái job nếu API có.

Không tự bịa chức năng ngoài API. Chỉ implement những gì có trong `job-api.md`, nhưng phải thiết kế flow UI đầy đủ và chuyên nghiệp dựa trên tài liệu.

## Yêu cầu bắt buộc trước khi sửa code

Trước khi code phải inspect project để xác định:

* Project dùng framework gì: React/Vite/Next hoặc setup hiện tại.
* Folder pages/routes hiện tại.
* API client đang dùng axios/fetch hay wrapper custom.
* Cách gắn `Authorization: Bearer <token>`.
* Cách xử lý base response.
* Cách xử lý pagination/filter.
* Cách dùng toast/modal/loading/error.
* Cách guard route theo role.
* Cách đặt tên component/service/type.
* Style system hiện tại: CSS module, Tailwind, SCSS, UI lib hoặc custom component.

Không được tạo kiến trúc mới nếu project đã có convention.

## Các file tài liệu cần đọc để hiểu style

Bắt buộc đọc:

```text
docs/ai-fe/ui-rules.md
docs/ai-fe/architecture.md
docs/ai-fe/conventions.md
docs/ai-fe/modules/job-api.md
```

Nên đọc thêm một vài module đã hoàn thiện để bắt chước pattern:

```text
docs/ai-fe/modules/company-api.md
docs/ai-fe/modules/resume-api.md
docs/ai-fe/modules/skill-api.md
docs/ai-fe/modules/basic-modules-api.md
```

Nếu có screenshot/style reference trong docs hoặc project, phải bám theo. UI cần giống website tuyển dụng hiện đại kiểu ITviec, không làm dashboard generic.

## Phạm vi implement

Tùy theo endpoint trong `job-api.md`, implement các phần sau.

### 1. Public/Candidate Job Listing

Tạo/cập nhật trang danh sách việc làm, ví dụ route:

```text
/jobs
```

hoặc route phù hợp với convention hiện tại.

UI cần có:

* Search input theo keyword/title/company/skill nếu API hỗ trợ.
* Filter theo location.
* Filter theo salary nếu API hỗ trợ.
* Filter theo level nếu API hỗ trợ.
* Filter theo job type/employment type nếu API hỗ trợ.
* Filter theo work mode nếu API hỗ trợ.
* Filter theo skill nếu API hỗ trợ.
* Sort nếu API hỗ trợ.
* Pagination đúng theo API.
* Loading skeleton.
* Empty state khi không có job.
* Error state khi API lỗi.
* Job card compact, chuyên nghiệp.

Job card nên hiển thị:

* Job title.
* Company name/logo nếu response có.
* Location.
* Salary range hoặc “Thương lượng” nếu không public.
* Skills/tags.
* Work mode.
* Job type.
* Level.
* Posted date/updated date nếu có.
* Status chỉ hiển thị nếu phù hợp.
* CTA xem chi tiết.
* Nút save/favorite nếu API hỗ trợ và user đã login.

### 2. Job Detail Page

Tạo/cập nhật trang chi tiết job, ví dụ:

```text
/jobs/:id
```

UI cần giống trang tuyển dụng thật, gồm:

* Header job detail:

  * Title.
  * Company.
  * Location.
  * Salary.
  * Work mode.
  * Job type.
  * Level.
  * Posted date.
  * Apply button.
  * Save/Favorite button nếu API hỗ trợ.

* Main content:

  * Description.
  * Requirements.
  * Benefits.
  * Responsibilities nếu API có.
  * Skills.
  * Experience.
  * Deadline nếu API có.
  * Quantity nếu API có.

* Company sidebar:

  * Company logo.
  * Company name.
  * Website/location/size nếu response có.
  * Link tới company detail nếu route có.

* Sticky apply card trên desktop nếu phù hợp.

* Responsive tốt trên mobile.

Apply button:

* Nếu chưa login: chuyển login hoặc hiện modal yêu cầu đăng nhập.
* Nếu role không phải candidate: disable hoặc hiện message hợp lý.
* Nếu API apply nằm trong job-api.md thì implement flow apply đúng tài liệu.
* Nếu apply thuộc resume module khác thì chỉ điều hướng tới flow apply đã có, không tự bịa API.

### 3. Favorite/Save Job nếu API hỗ trợ

Nếu `job-api.md` có API favorite/save job:

Implement:

* Save job từ job card.
* Save job từ job detail.
* Unsave job.
* Trang/list saved jobs nếu API có endpoint.
* Optimistic UI chỉ dùng nếu project đã có pattern; nếu không thì refetch sau action.
* Xử lý user chưa login.
* Không để UI crash nếu API trả lỗi 409 hoặc job đã được lưu.

### 4. Recruiter Job Management

Tạo/cập nhật trang quản lý job cho recruiter, ví dụ:

```text
/recruiter/jobs
```

hoặc route đúng convention hiện tại.

UI cần có:

* Danh sách job của recruiter/company.
* Search/filter theo status nếu API hỗ trợ.
* Pagination.
* Button tạo job mới.
* Action menu:

  * View detail.
  * Edit.
  * Publish.
  * Unpublish.
  * Delete/soft delete.
* Status badge:

  * DRAFT
  * PUBLISHED
  * CLOSED
  * DELETED
  * hoặc enum đúng theo API doc.
* Confirm dialog trước khi delete/publish/unpublish.
* Loading/error/empty state.

Không cho candidate/user thường truy cập trang recruiter.

### 5. Create/Update Job Form

Tạo/cập nhật form tạo/sửa job.

Form phải bám sát request body trong `job-api.md`.

Các field thường gặp cần map đúng nếu API có:

* title
* description
* requirements
* benefits
* responsibilities
* location
* salaryMin
* salaryMax
* salaryCurrency
* salaryNegotiable
* employmentType
* workMode
* level
* experience
* quantity
* deadline
* skillIds
* companyId nếu cần
* status nếu API cho phép

Yêu cầu form:

* Validate required field.
* Validate salaryMin <= salaryMax.
* Validate deadline không ở quá khứ nếu nghiệp vụ yêu cầu.
* Validate title length.
* Validate description/requirements không rỗng.
* Skill selector phải lấy từ API skill nếu project đã có service.
* Company selector chỉ dùng nếu API cần và role phù hợp.
* Không hard-code enum nếu API/doc đã có enum rõ ràng thì tạo constant/type tương ứng.
* Nếu enum đã có trong project thì reuse.

UX form:

* Chia section rõ:

  * Thông tin cơ bản.
  * Mức lương & hình thức làm việc.
  * Kỹ năng & yêu cầu.
  * Mô tả công việc.
  * Cài đặt đăng tuyển.
* Có save draft nếu API hỗ trợ.
* Có create/publish nếu API hỗ trợ.
* Có cancel/back.
* Có loading khi submit.
* Hiển thị lỗi backend gần field nếu có thể.

### 6. Publish / Unpublish Job

Nếu API có:

* Implement action publish.
* Implement action unpublish.
* Confirm trước khi thao tác.
* Update lại status trên UI sau khi thành công.
* Disable action nếu trạng thái không hợp lệ.
* Xử lý 403 nếu recruiter không sở hữu company/job.
* Xử lý 409 nếu job không thể publish do thiếu dữ liệu.

### 7. Delete / Soft Delete Job

Nếu API có:

* Implement delete/soft delete.
* Confirm dialog.
* Sau khi delete thì remove khỏi list hoặc refetch.
* Không hard delete ở UI wording nếu backend là soft delete; dùng wording “Ẩn/Xóa tin tuyển dụng” tùy docs.
* Xử lý job đã publish nếu API không cho xóa.

### 8. Admin Job Management nếu API có

Nếu `job-api.md` có endpoint admin:

Implement page phù hợp, ví dụ:

```text
/admin/jobs
```

Yêu cầu:

* Admin xem toàn bộ job.
* Filter theo company/status/recruiter nếu API hỗ trợ.
* View detail.
* Action nếu API hỗ trợ.
* Không duplicate quá nhiều component; reuse JobCard/JobTable/StatusBadge nếu phù hợp.
* Guard role ADMIN.

## API Integration

Đọc kỹ `docs/ai-fe/modules/job-api.md` và implement đúng:

* Endpoint.
* HTTP method.
* Path params.
* Query params.
* Request body.
* Response body.
* Pagination response.
* Error response.
* Auth requirement.
* Role requirement.

Tạo/cập nhật service theo convention hiện tại, ví dụ:

```text
jobService.ts
jobApi.ts
jobs.api.ts
```

Không tự đặt nếu project đã có naming rule.

Các function gợi ý, chỉ tạo nếu API doc có endpoint tương ứng:

```ts
getJobs(params)
getJobById(id)
createJob(payload)
updateJob(id, payload)
deleteJob(id)
publishJob(id)
unpublishJob(id)
getRecruiterJobs(params)
getAdminJobs(params)
saveJob(id)
unsaveJob(id)
getSavedJobs(params)
```

## TypeScript types / DTO

Nếu project dùng TypeScript, tạo/cập nhật type rõ ràng:

```ts
Job
JobListItem
JobDetail
JobCreateRequest
JobUpdateRequest
JobSearchParams
JobStatus
EmploymentType
WorkMode
JobLevel
SalaryCurrency
```

Tên type phải follow convention hiện tại.

Không dùng `any` tràn lan. Chỉ dùng tạm nếu response chưa rõ, và phải ghi TODO ngắn.

## Auth Header

Tất cả API cần login phải gửi:

```text
Authorization: Bearer <access_token>
```

theo cơ chế auth hiện tại.

Không tự viết token logic mới nếu project đã có axios interceptor/auth client.

## Routing & Navigation

Tạo route theo convention hiện tại.

Gợi ý route nếu chưa có:

```text
/jobs
/jobs/:id
/recruiter/jobs
/recruiter/jobs/create
/recruiter/jobs/:id/edit
/admin/jobs
/saved-jobs
```

Chỉ tạo route thật sự cần theo API và flow hiện có.

Navbar/sidebar/profile menu nên thêm entry hợp lý nếu project đang có layout tương ứng:

* Candidate/Public: “Việc làm”
* Candidate: “Việc làm đã lưu” nếu có
* Recruiter: “Quản lý việc làm”
* Admin: “Quản lý job” nếu có admin module

Không làm menu lộn xộn, không đặt tên kiểu demo.

## UI Style bắt buộc

Thiết kế theo phong cách website tìm việc chuyên nghiệp giống ITviec:

* Compact.
* Clean.
* Nhiều khoảng trắng vừa phải, không quá rộng.
* Card/list dễ scan.
* Text hierarchy rõ.
* Màu chính đồng bộ WorkHub.
* Không gradient màu mè.
* Không emoji lạm dụng.
* Không component dashboard generic nếu trang public job.
* Button CTA rõ: “Ứng tuyển ngay”, “Lưu việc làm”, “Đăng tuyển”, “Xuất bản”.
* Salary/location/skills phải dễ nhìn.
* Badge status rõ nhưng không chói.

## State Handling

Bắt buộc xử lý:

* Initial loading.
* Submit loading.
* Empty result.
* API error.
* Validation error.
* Unauthorized.
* Forbidden.
* Not found.
* Conflict.
* Network error.
* Pagination state.
* Filter state.
* Reset filter.
* Refetch sau mutation.

## Testing / Verification

Sau khi code xong, chạy các command phù hợp với project:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Nếu project dùng pnpm/yarn thì dùng đúng package manager hiện tại.

Nếu command fail:

* Đọc lỗi.
* Sửa lỗi.
* Chạy lại.
* Không được bỏ qua lỗi TypeScript/build/lint.

## Documentation Update

Sau khi implement xong, update tài liệu module:

```text
docs/ai-fe/modules/job-api.md
```

hoặc file docs liên quan theo convention hiện tại.

Nội dung cần cập nhật:

* Route/page đã implement.
* Component đã tạo/sửa.
* API service đã tạo/sửa.
* Type/interface đã tạo/sửa.
* Flow candidate/public.
* Flow recruiter.
* Flow admin nếu có.
* Các trạng thái UI đã xử lý.
* Các role guard đã áp dụng.
* Các lỗi/edge cases đã xử lý.
* Ghi chú cho dev/AI agent sau tiếp tục maintain.

Không viết chung chung. Chỉ ghi những thay đổi thực tế.

## Nguyên tắc làm việc

* Search trước, đọc file trước, rồi mới sửa.
* Không sửa mò.
* Không refactor ngoài phạm vi Job module.
* Không đổi architecture toàn project.
* Không đổi design system toàn cục.
* Không duplicate component/service nếu đã có.
* Reuse component/pattern có sẵn.
* Không dùng mock data nếu API thật đã có.
* Không hard-code dữ liệu nếu có endpoint.
* Không làm vỡ các module đã có.
* Sau khi hoàn thành, báo cáo rõ:

  * File đã sửa/tạo.
  * Chức năng đã hoàn thành.
  * Command đã chạy.
  * Lỗi còn tồn tại nếu có.
