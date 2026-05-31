Bạn là Senior Frontend Developer. Hãy triển khai frontend cho các module Company, Resume, Skill, Subscriber của dự án WorkHub.

Trước khi code, BẮT BUỘC đọc kỹ toàn bộ tài liệu nền trong `docs/ai-fe`, đặc biệt các file về:

- environment/setup
- project architecture
- folder structure
- routing convention
- apiClient convention
- authentication/authorization guard
- UI rules/style guide
- component convention
- coding convention
- error/loading/empty-state convention
- form validation convention
- role-based UI convention

Sau đó đọc các API document module:

- `docs/ai-fe/modules/subscriber-api.md`
- `docs/ai-fe/modules/skill-api.md`
- `docs/ai-fe/modules/resume-api.md`
- `docs/ai-fe/modules/company-api.md`
- `docs/ai-fe/modules/basic-modules-api.md`

Yêu cầu quan trọng:
- Không được code ngay khi chưa đọc tài liệu trong `docs/ai-fe`.
- Không tự tạo architecture mới.
- Không tự đổi naming convention.
- Không tự đổi route convention nếu project đã có.
- Không tự đổi endpoint, method, request body, response mapping.
- Phải follow style UI hiện có của WorkHub.
- UI phải giống một website tuyển dụng hiện đại, compact, rõ hierarchy, gần style ITviec.
- Không dùng UI generic sơ sài.
- Không dùng gradient màu mè.
- Không spacing quá lớn.
- Dùng shared `apiClient` hiện có.
- Không tự viết lại logic attach Bearer token nếu `apiClient` đã xử lý.
- Phải kiểm tra các feature/page đã làm trước đó để học style code và UI.

Nhiệm vụ:
Implement đầy đủ frontend end-to-end cho các module:

1. Company
- List/search company.
- View company detail.
- Create/update company nếu API hỗ trợ.
- Upload logo/cover nếu API hỗ trợ.
- Enable/disable company nếu API hỗ trợ.
- Admin approve/reject company nếu API hỗ trợ.
- Hiển thị rõ `active`, `verified`.
- Phân quyền UI theo role ADMIN / RECRUITER / CANDIDATE.

2. Resume
- Candidate xem danh sách resume của mình.
- Upload/create resume.
- Update resume.
- Delete/soft delete resume nếu API hỗ trợ.
- Set default resume nếu API hỗ trợ.
- Download/view resume file nếu API hỗ trợ.
- Recruiter xem/download resume ứng viên theo job nếu API hỗ trợ.
- File upload phải đúng field backend yêu cầu.

3. Skill
- List/search skills.
- Create skill.
- Update skill.
- Enable/disable skill.
- Popular skills/suggestions nếu API hỗ trợ.
- Admin quản lý skill.
- Có thể tái sử dụng skill search cho các form khác nếu project đang cần.

4. Subscriber
- User xem subscriber/subscription của mình nếu API hỗ trợ.
- Create/update subscriber nếu API hỗ trợ.
- Enable/disable subscriber.
- Admin list/manage subscribers nếu API hỗ trợ.
- Send mail/process queue nếu API hỗ trợ, chỉ hiển thị cho ADMIN.
- Unsubscribe flow nếu API document có public token endpoint.

Routing:
- Route phải theo convention hiện có trong project.
- Nếu chưa có convention rõ ràng, có thể dùng:
  - `/companies`
  - `/companies/:id`
  - `/admin/companies`
  - `/admin/skills`
  - `/candidate/resumes`
  - `/settings/subscription`
  - `/admin/subscribers`

Service layer:
- Tạo/cập nhật service theo convention hiện có:
  - `companyService`
  - `resumeService`
  - `skillService`
  - `subscriberService`
- Service chỉ chứa API call.
- Không để logic UI trong service.
- Chuẩn hóa pagination params theo đúng API docs.
- Không hardcode `/api/v1` nếu `apiClient` đã cấu hình baseURL.

UI/UX:
- Có loading state.
- Có error state.
- Có empty state.
- Có pagination nếu API hỗ trợ.
- Có form validation.
- Có confirm dialog cho delete/disable/reject.
- Có toast/alert theo convention project.
- Badge status phải rõ ràng.
- Layout phải thực tế như một job platform.

Sau khi code:
- Chạy lint/build/test nếu project có script.
- Kiểm tra không phá route cũ.
- Kiểm tra role-based UI.
- Test các flow chính:
  - Company list/search/detail/create/update/approve/reject.
  - Resume upload/list/default/download.
  - Skill CRUD/search/enable/disable.
  - Subscriber create/list/enable/disable/send mail.
- Update lại docs trong `docs/ai-fe/modules` hoặc tài liệu liên quan nếu có thay đổi.
- Ghi rõ:
  - Route đã thêm.
  - Service đã thêm.
  - Page/component đã thêm.
  - API đã mapping.
  - API nào backend chưa có nên chưa implement.