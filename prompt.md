Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

Nhiệm vụ: Hoàn thiện chức năng FE cho **ATS Resume Screening** dựa trên tài liệu:

* `docs/ai-fe/modules/ats-resume-screening-api.md`

Trước khi code, bắt buộc đọc kỹ các file trong `docs/ai-fe`, đặc biệt:

* `docs/ai-fe/ui-rules.md`
* `docs/ai-fe/architecture.md`
* `docs/ai-fe/conventions.md`
* `docs/ai-fe/modules/ats-resume-screening-api.md`
* `docs/ai-fe/modules/job-api.md`
* `docs/ai-fe/modules/resume-api.md`
* Các module đã làm trước đó như job, resume, company, user, recruiter requirement để hiểu style, routing, API service pattern, auth handling và role guard.

Nếu tên file thực tế hơi khác, hãy tự search trong `docs/ai-fe` bằng keyword:

```text
ats
screening
resume screening
resume
candidate
job application
recruiter
score
ranking
match
```

## Mục tiêu

Implement end-to-end FE cho chức năng **ATS Resume Screening**.

Flow chính:

1. Candidate apply job bằng resume/CV.
2. Recruiter vào danh sách ứng viên/applications của một job.
3. Recruiter bấm **Screen Resume** cho một ứng viên hoặc nhiều ứng viên nếu API hỗ trợ.
4. FE gọi API screening theo đúng `ats-resume-screening-api.md`.
5. Hiển thị kết quả ATS:

   * Điểm match tổng.
   * Danh sách skill match.
   * Danh sách skill missing.
   * Đánh giá kinh nghiệm.
   * Đánh giá education/certification nếu API có.
   * Recommendation/summary nếu API có.
   * Ranking nếu API có.
6. Recruiter có thể xem lại kết quả screening đã chạy.
7. Nếu API hỗ trợ danh sách screening theo job, hiển thị bảng ranking candidates theo ATS score.
8. Nếu API có trạng thái processing/pending thì UI phải xử lý đúng.

Không tự bịa API. Chỉ implement theo tài liệu `ats-resume-screening-api.md`.

## Yêu cầu bắt buộc trước khi code

Trước khi sửa code phải inspect project để xác định:

* Framework hiện tại: React/Vite/Next hoặc setup thực tế.
* Folder pages/routes hiện tại.
* Cách gọi API hiện tại: axios/fetch/custom client.
* Cách attach JWT token.
* Base response format.
* Error response format.
* Pagination pattern.
* Toast/modal/loading/skeleton pattern.
* Role guard hiện tại.
* Component design system hiện tại.
* Style convention hiện tại.

Không được tạo architecture mới.

## Role & Permission

Chức năng ATS chủ yếu dành cho:

* RECRUITER
* ADMIN nếu API cho phép

Yêu cầu:

* Candidate không được thấy action screening.
* User chưa đăng nhập thì redirect login hoặc xử lý theo convention hiện tại.
* Recruiter chỉ được screen resume/application thuộc job/company mình quản lý nếu backend enforce.
* Nếu API trả 403 thì UI phải hiển thị message rõ: không có quyền thao tác.
* Admin page/action chỉ hiển thị nếu tài liệu API có role ADMIN.

## API Integration

Đọc kỹ `docs/ai-fe/modules/ats-resume-screening-api.md` và implement đúng:

* Endpoint.
* HTTP method.
* Request body.
* Path params.
* Query params.
* Response body.
* Status enum.
* Error response.
* Auth requirement.
* Role requirement.
* API trigger screening.
* API lấy kết quả screening.
* API danh sách screening theo job/application nếu có.
* API ranking candidates nếu có.
* API retry/rescreen nếu có.

Tất cả API cần auth phải gửi:

```text
Authorization: Bearer <access_token>
```

theo cơ chế auth hiện tại. Không tự viết token logic mới nếu project đã có interceptor.

## Service functions

Tạo/cập nhật service theo convention hiện tại, ví dụ:

```text
atsResumeScreeningService.ts
atsScreeningApi.ts
screening.service.ts
```

Chỉ tạo function nếu API doc có endpoint tương ứng.

Gợi ý function:

```ts
triggerResumeScreening(payload)
getScreeningById(id)
getScreeningByResumeAndJob(resumeId, jobId)
getScreeningsByJob(jobId, params)
getScreeningsByApplication(applicationId)
rescreenResume(payload)
getCandidateRankingByJob(jobId, params)
```

Tên function phải follow convention hiện tại của project.

## TypeScript types / DTO

Nếu project dùng TypeScript, tạo/cập nhật type rõ ràng:

```ts
AtsScreeningRequest
AtsScreeningResult
AtsScreeningDetail
AtsSkillMatch
AtsMissingSkill
AtsScreeningStatus
AtsCandidateRankingItem
AtsScoreBreakdown
AtsRecommendation
AtsScreeningSearchParams
```

Không dùng `any` tràn lan. Nếu field chưa rõ thì đọc API doc kỹ trước. Chỉ dùng optional field khi response thực sự có thể thiếu.

## UI Pages cần implement

Tùy theo route convention hiện tại, tạo/cập nhật các page sau nếu API hỗ trợ.

### 1. Recruiter Application List có action ATS

Ở trang danh sách ứng viên apply job, thêm action:

```text
Screen Resume
View ATS Result
Re-screen
```

Logic:

* Nếu chưa có screening result: hiện “Screen Resume”.
* Nếu đã có result: hiện “View ATS Result”.
* Nếu API cho phép chạy lại: hiện “Re-screen”.
* Nếu screening đang processing: hiện loading/progress state.
* Nếu screening failed: hiện failed badge và nút retry nếu API hỗ trợ.

Không phá layout application list hiện tại.

### 2. ATS Result Detail Page/Modal

Tạo trang hoặc modal xem chi tiết kết quả ATS, ví dụ:

```text
/recruiter/ats-screenings/:id
```

hoặc dùng modal/drawer nếu project đang dùng pattern đó.

UI cần hiển thị:

* Candidate info:

  * Name.
  * Email.
  * Resume title/file name nếu có.
  * Job title.
  * Company.
* Overall ATS score:

  * Điểm tổng dạng phần trăm hoặc số.
  * Badge đánh giá: Strong match / Good match / Weak match tùy score.
* Score breakdown nếu API có:

  * Skills score.
  * Experience score.
  * Education score.
  * Keyword score.
  * Culture/other score nếu có.
* Matched skills:

  * Danh sách skill match.
  * Có thể hiển thị level/confidence nếu response có.
* Missing skills:

  * Danh sách skill còn thiếu.
  * Ưu tiên hiển thị rõ để recruiter ra quyết định.
* Resume summary / AI summary nếu API có.
* Recommendation:

  * Recommend interview.
  * Consider.
  * Not recommended.
  * hoặc enum đúng trong API doc.
* Raw notes/reason nếu API có.
* Created at / screened at.

Thiết kế phải gọn, dễ scan, giống tool tuyển dụng thật.

### 3. Candidate Ranking by Job

Nếu API hỗ trợ danh sách/ranking theo job:

Tạo/cập nhật page:

```text
/recruiter/jobs/:jobId/screenings
```

UI:

* Header: job title + tổng số candidates đã screen.
* Table/list ranking:

  * Rank.
  * Candidate.
  * Resume.
  * ATS score.
  * Matched skills count.
  * Missing skills count.
  * Recommendation.
  * Screening status.
  * Screened at.
  * Action view detail.
* Filter theo status/recommendation nếu API hỗ trợ.
* Sort theo score nếu API hỗ trợ.
* Pagination nếu API hỗ trợ.
* Empty state nếu chưa có screening.
* CTA chạy screening nếu API hỗ trợ.

### 4. Screening Trigger UX

Khi recruiter bấm screen:

* Hiển thị confirm dialog trước khi chạy nếu API tốn thời gian.
* Disable button trong lúc gọi API.
* Hiển thị loading text: “Đang phân tích CV...”
* Nếu API trả kết quả ngay: điều hướng/hiển thị result ngay.
* Nếu API trả job/task id hoặc status PROCESSING:

  * Hiển thị trạng thái đang xử lý.
  * Polling nếu project/API có hướng dẫn.
  * Không tự polling quá dày; dùng interval hợp lý nếu cần.
  * Có timeout/fallback message nếu quá lâu.
* Nếu API fail:

  * Hiển thị lỗi rõ.
  * Cho retry nếu API có.

## UI Style bắt buộc

Bám theo `docs/ai-fe/ui-rules.md` và style WorkHub hiện tại.

Yêu cầu:

* Phong cách chuyên nghiệp như nền tảng tuyển dụng hiện đại.
* Không dùng gradient màu mè.
* Không làm dashboard generic rối mắt.
* Layout compact, rõ hierarchy.
* Card border nhẹ.
* Badge rõ màu nhưng không chói.
* Score hiển thị nổi bật nhưng không quá lố.
* Kết quả ATS phải dễ scan trong 5–10 giây.
* Không dùng text demo/fake.
* Không hard-code candidate/job data.

Gợi ý badge màu:

* Score >= 80: Strong match.
* Score 60–79: Good match.
* Score 40–59: Partial match.
* Score < 40: Weak match.

Chỉ dùng logic này nếu API không trả label sẵn. Nếu API trả recommendation/label thì ưu tiên dùng dữ liệu API.

## State Handling

Bắt buộc xử lý:

* Initial loading.
* Submit/screening loading.
* Empty state.
* Error state.
* 401 unauthorized.
* 403 forbidden.
* 404 not found.
* 409 conflict nếu screening đã tồn tại.
* 422/400 validation error.
* 500 server error.
* Network error.
* Processing state.
* Failed state.
* Completed state.

Không để UI crash nếu field null/undefined.

## Integration với Job/Resume/Application module

Chức năng ATS không đứng riêng lẻ hoàn toàn. Phải kiểm tra và tích hợp với:

* `job-api.md`
* `resume-api.md`
* application/apply flow nếu có
* recruiter job management page nếu đã làm
* candidate application list nếu đã làm

Yêu cầu:

* Không duplicate application list nếu đã có.
* Không tạo flow apply mới nếu resume/job module đã có.
* Chỉ thêm action ATS vào đúng vị trí phù hợp.
* Reuse existing JobCard, ApplicationTable, CandidateInfo, StatusBadge nếu có.
* Nếu chưa có application page, tạo page tối thiểu nhưng đúng API và đúng style.

## Validation

Khi gọi trigger screening:

* Đảm bảo có `resumeId`.
* Đảm bảo có `jobId`.
* Đảm bảo có `applicationId` nếu API yêu cầu.
* Không gọi API nếu thiếu dữ liệu.
* Nếu request body chỉ gồm `{ resumeId, jobId }` thì gửi đúng như docs, không thêm field thừa.
* Nếu API yêu cầu path param thì dùng đúng path param.

## Documentation Update

Sau khi code xong, cập nhật:

```text
docs/ai-fe/modules/ats-resume-screening-api.md
```

hoặc file docs liên quan theo convention hiện tại.

Nội dung update gồm:

* Route/page đã implement.
* Component đã tạo/sửa.
* Service/API function đã tạo/sửa.
* Types/interfaces đã tạo/sửa.
* Flow recruiter screen resume.
* Flow view result.
* Flow ranking by job nếu có.
* State/loading/error đã xử lý.
* Role guard đã áp dụng.
* Edge cases còn lưu ý.

Không viết lan man, chỉ ghi thay đổi thực tế để AI/dev sau đọc tiếp được.

## Verification

Sau khi implement xong, chạy command phù hợp với project:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Nếu project dùng pnpm/yarn thì dùng đúng package manager hiện tại.

Nếu lỗi:

* Đọc lỗi.
* Sửa lỗi.
* Chạy lại.
* Không được bỏ qua lỗi TypeScript/build/lint.

## Nguyên tắc làm việc

* Search trước, đọc tài liệu trước, rồi mới sửa.
* Không sửa mò.
* Không tạo architecture mới.
* Không refactor lớn ngoài phạm vi ATS module.
* Không đổi design system toàn cục.
* Không duplicate service/component nếu đã có.
* Không hard-code data.
* Không dùng mock nếu API thật đã có document.
* Không làm vỡ module job/resume/application hiện có.
* Patch nhỏ, verify kỹ.
* Sau khi hoàn thành, báo cáo rõ:

  * File đã tạo/sửa.
  * Chức năng đã hoàn thành.
  * API đã tích hợp.
  * Command đã chạy.
  * Lỗi còn tồn tại nếu có.
