Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

Nhiệm vụ: Xây dựng/hoàn thiện FE cho tính năng **Recruiter Assessment** dựa trên toàn bộ thông tin trong file:

* `docs/ai-fe/modules/recruiter-assessment.md`

Trước khi code, bắt buộc đọc kỹ các file trong `docs/ai-fe`, đặc biệt:

* `docs/ai-fe/ui-rules.md`
* `docs/ai-fe/architecture.md`
* `docs/ai-fe/conventions.md`
* `docs/ai-fe/modules/recruiter-assessment.md`
* `docs/ai-fe/modules/job-api.md`
* `docs/ai-fe/modules/resume-api.md`
* `docs/ai-fe/modules/ats-resume-screening-api.md` nếu assessment có liên quan tới candidate/application flow.

Nếu tên file hơi khác, hãy tự search trong `docs/ai-fe` bằng keyword:

```text
assessment
recruiter assessment
test
quiz
question
answer
submission
candidate
application
job
```

## Mục tiêu

Implement end-to-end FE cho tính năng **Recruiter Assessment**.

Flow tổng quát cần hỗ trợ theo đúng API doc:

1. Recruiter tạo bài assessment/test cho job hoặc candidate/application nếu API hỗ trợ.
2. Recruiter quản lý danh sách assessment.
3. Recruiter thêm/sửa/xóa câu hỏi nếu API có.
4. Recruiter gửi/gán assessment cho candidate/application nếu API có.
5. Candidate nhận và làm assessment nếu API cho phép.
6. Candidate submit bài làm.
7. Recruiter xem kết quả/chấm điểm nếu API có.
8. Admin chỉ được can thiệp nếu API doc có endpoint admin.

Không tự bịa chức năng ngoài tài liệu. Nếu API doc không có endpoint nào thì không implement phần đó.

## Nguyên tắc bắt buộc

* Search trước, đọc tài liệu trước, rồi mới code.
* Không sửa mò.
* Không tạo architecture mới.
* Không refactor lớn ngoài phạm vi assessment module.
* Không đổi design system toàn cục.
* Không hard-code fake data nếu API thật đã có.
* Không duplicate service/component nếu đã có pattern tương tự.
* Tất cả UI/flow/API phải bám sát `recruiter-assessment.md`.
* Nếu response field khác với dự đoán, ưu tiên API document.

## Yêu cầu đọc cấu trúc project trước khi code

Trước khi sửa file, inspect project để xác định:

* Framework đang dùng: React/Vite/Next hoặc setup thực tế.
* Folder pages/routes hiện tại.
* API client hiện tại: axios/fetch/custom wrapper.
* Cách gắn JWT token.
* Base response format.
* Error response format.
* Pagination/filter pattern.
* Toast/modal/loading/skeleton pattern.
* Form validation pattern.
* Role guard hiện tại.
* Component style hiện tại.
* Naming convention cho service/type/component/page.

Không tự tạo folder hoặc pattern mới nếu project đã có convention.

## Role & Permission

Phải xử lý role đúng:

### Recruiter

Recruiter có thể làm các phần nếu API hỗ trợ:

* Tạo assessment.
* Cập nhật assessment.
* Xóa assessment.
* Publish/close assessment nếu có.
* Thêm/sửa/xóa câu hỏi.
* Gán assessment cho candidate/application/job.
* Xem submissions/kết quả.
* Chấm điểm essay/manual nếu có.

### Candidate

Candidate có thể làm các phần nếu API hỗ trợ:

* Xem assessment được giao.
* Bắt đầu làm bài.
* Trả lời câu hỏi.
* Submit bài.
* Xem kết quả nếu API cho phép.

### Admin

Admin chỉ có quyền nếu `recruiter-assessment.md` ghi rõ.

Yêu cầu:

* User chưa đăng nhập thì redirect login hoặc xử lý theo convention hiện tại.
* Candidate không được thấy trang quản lý assessment của recruiter.
* Recruiter không được làm bài thay candidate.
* Không hiển thị action mà role hiện tại không có quyền.
* Nếu API trả 403 thì UI hiển thị lỗi không có quyền, không crash.

## API Integration

Đọc kỹ `docs/ai-fe/modules/recruiter-assessment.md` và implement đúng:

* Endpoint.
* HTTP method.
* Path params.
* Query params.
* Request body.
* Response body.
* Auth requirement.
* Role requirement.
* Status enum.
* Question type enum.
* Error response.
* Pagination response nếu có.
* Flow tạo assessment.
* Flow thêm câu hỏi.
* Flow assign/gửi assessment.
* Flow candidate submit.
* Flow recruiter xem kết quả/chấm điểm.

Tất cả request cần login phải gắn:

```text
Authorization: Bearer <access_token>
```

theo cơ chế auth hiện tại của project. Không tự viết token logic mới nếu đã có interceptor.

## Service/API functions

Tạo/cập nhật service theo convention hiện tại, ví dụ:

```text
recruiterAssessmentService.ts
assessmentApi.ts
assessment.service.ts
```

Chỉ tạo function nếu API doc có endpoint tương ứng.

Gợi ý function, tùy tài liệu có gì thì implement cái đó:

```ts
getRecruiterAssessments(params)
getAssessmentById(id)
createAssessment(payload)
updateAssessment(id, payload)
deleteAssessment(id)
publishAssessment(id)
closeAssessment(id)

getAssessmentQuestions(assessmentId)
createQuestion(assessmentId, payload)
updateQuestion(questionId, payload)
deleteQuestion(questionId)

assignAssessment(payload)
getCandidateAssessments(params)
getCandidateAssessmentDetail(assessmentId)
startAssessment(assessmentId)
submitAssessment(assessmentId, payload)

getAssessmentSubmissions(assessmentId, params)
getSubmissionDetail(submissionId)
gradeSubmission(submissionId, payload)
```

Tên function phải follow naming convention hiện tại.

## TypeScript types / DTO

Nếu project dùng TypeScript, tạo/cập nhật type rõ ràng.

Gợi ý types:

```ts
Assessment
AssessmentListItem
AssessmentDetail
AssessmentCreateRequest
AssessmentUpdateRequest
AssessmentStatus
AssessmentQuestion
AssessmentQuestionType
AssessmentQuestionCreateRequest
AssessmentQuestionUpdateRequest
AssessmentOption
AssessmentAssignRequest
CandidateAssessment
CandidateAssessmentDetail
AssessmentSubmission
AssessmentSubmissionDetail
AssessmentSubmitRequest
AssessmentAnswerRequest
AssessmentGradeRequest
AssessmentResult
AssessmentSearchParams
```

Không dùng `any` tràn lan. Dữ liệu nào optional thì đánh dấu optional đúng theo response trong docs.

## UI Pages cần implement

Tùy route convention hiện tại, tạo/cập nhật các page sau nếu API hỗ trợ.

### 1. Recruiter Assessment List

Route gợi ý:

```text
/recruiter/assessments
```

UI cần có:

* Header: “Quản lý bài đánh giá”
* Button tạo assessment.
* Search/filter nếu API hỗ trợ.
* Filter theo status nếu API hỗ trợ.
* Filter theo job nếu API hỗ trợ.
* Pagination nếu API hỗ trợ.
* Loading skeleton.
* Empty state.
* Error state.
* Table hoặc card list compact.

Mỗi item hiển thị:

* Assessment title.
* Job liên quan nếu có.
* Question count nếu có.
* Time limit nếu có.
* Status badge.
* Created at/updated at.
* Số candidate đã làm nếu có.
* Action:

  * View detail.
  * Edit.
  * Manage questions.
  * Assign to candidate/application.
  * View submissions.
  * Publish/close.
  * Delete.

Chỉ hiển thị action nếu API và trạng thái cho phép.

### 2. Create / Update Assessment Form

Route gợi ý:

```text
/recruiter/assessments/create
/recruiter/assessments/:id/edit
```

Form phải map đúng request body trong docs.

Các field thường có, chỉ dùng nếu API doc có:

* title
* description
* jobId
* durationMinutes/timeLimit
* passingScore
* maxAttempts
* startAt
* endAt/deadline
* status
* instruction
* questionIds nếu API yêu cầu

Validation:

* Title required.
* Job required nếu API yêu cầu.
* Time limit > 0 nếu có.
* Passing score trong khoảng hợp lệ nếu có.
* Deadline không được trước start time nếu có.
* Description/instruction không vượt quá max length nếu docs có.

UI form nên chia section:

* Thông tin bài đánh giá.
* Cấu hình thời gian.
* Liên kết job/candidate.
* Hướng dẫn làm bài.
* Cài đặt trạng thái.

### 3. Manage Questions

Route gợi ý:

```text
/recruiter/assessments/:id/questions
```

UI cần có:

* Danh sách câu hỏi.
* Button thêm câu hỏi.
* Edit/delete question.
* Reorder nếu API hỗ trợ.
* Preview câu hỏi.
* Confirm trước khi xóa.
* Empty state nếu chưa có câu hỏi.

Question type nếu API có:

* MULTIPLE_CHOICE
* SINGLE_CHOICE
* ESSAY
* TRUE_FALSE
* CODING
* hoặc enum đúng trong `recruiter-assessment.md`.

Form tạo/sửa question:

* questionText/content required.
* type required.
* score/point required nếu API có.
* options required với multiple choice/single choice.
* correctAnswer required nếu auto grading.
* explanation nếu API có.
* coding language/test cases nếu API có.
* validation không cho tạo MCQ thiếu options.
* validation không cho submit nếu không có correct answer trong auto-score question.

### 4. Assign Assessment

Nếu API có assign/gửi assessment:

Route/modal gợi ý:

```text
/recruiter/assessments/:id/assign
```

hoặc modal từ list/detail.

UI cần:

* Chọn job/application/candidate theo API yêu cầu.
* Hiển thị candidate info nếu assign theo application.
* Deadline nếu API yêu cầu.
* Message/instruction nếu API có.
* Confirm trước khi gửi.
* Loading khi submit.
* Success feedback sau khi assign.
* Không cho assign assessment chưa publish nếu nghiệp vụ yêu cầu hoặc API trả lỗi.

### 5. Recruiter Assessment Detail

Route gợi ý:

```text
/recruiter/assessments/:id
```

UI hiển thị:

* Title.
* Description.
* Job liên quan.
* Status.
* Time limit.
* Passing score.
* Question count.
* Created at/updated at.
* Action buttons phù hợp trạng thái.
* Danh sách câu hỏi preview.
* Danh sách candidate/submission summary nếu API có.

### 6. Recruiter Submissions / Results

Nếu API có submissions:

Route gợi ý:

```text
/recruiter/assessments/:id/submissions
/recruiter/assessment-submissions/:submissionId
```

UI list:

* Candidate name/email.
* Job/application nếu có.
* Status.
* Score.
* Passed/failed.
* Submitted at.
* Duration used nếu có.
* Action view detail/grade.

UI detail:

* Candidate info.
* Assessment info.
* Total score.
* Passing score.
* Result badge.
* Answers by question.
* Correct/incorrect indication nếu API có.
* Essay answer nếu có.
* Manual grading form nếu API hỗ trợ.
* Recruiter note/feedback nếu API hỗ trợ.

### 7. Candidate Assessment List

Nếu API có candidate side:

Route gợi ý:

```text
/candidate/assessments
```

UI:

* Danh sách bài được giao.
* Status:

  * NOT_STARTED
  * IN_PROGRESS
  * SUBMITTED
  * EXPIRED
  * PASSED
  * FAILED
  * hoặc enum đúng docs.
* Job liên quan.
* Deadline.
* Time limit.
* Button:

  * Start
  * Continue
  * View result nếu API cho phép.

### 8. Candidate Take Assessment Page

Nếu API có làm bài:

Route gợi ý:

```text
/candidate/assessments/:id/take
```

Yêu cầu UX:

* Hiển thị instruction trước khi bắt đầu nếu API có start endpoint.
* Timer nếu có timeLimit.
* Question navigation.
* Save local state tạm thời nếu project cho phép, nhưng không gửi API ngoài docs.
* Không tự auto-submit nếu API không hỗ trợ hoặc chưa chắc.
* Confirm trước khi submit.
* Disable submit khi thiếu required answers nếu nghiệp vụ yêu cầu.
* Sau submit hiển thị success/result theo API.
* Xử lý hết hạn/expired.
* Cảnh báo rời trang nếu đang làm bài nếu project có pattern.

Question UI:

* Single choice: radio.
* Multiple choice: checkbox.
* Essay: textarea.
* True/False: radio.
* Coding nếu có: editor đơn giản hoặc textarea nếu project chưa có code editor.
* Không render question type chưa hỗ trợ một cách crash; hiển thị fallback rõ.

## UI Style bắt buộc

Bám theo `docs/ai-fe/ui-rules.md` và phong cách WorkHub/ITviec:

* Clean, compact, chuyên nghiệp.
* Không gradient màu mè.
* Không spacing quá lớn.
* Không dashboard generic rối mắt.
* Card/table rõ hierarchy.
* Form dễ đọc.
* Button CTA rõ.
* Badge status dễ nhận biết.
* Assessment-taking UI phải tập trung, ít nhiễu.
* Không dùng emoji lạm dụng.
* Không text demo/test.

Gợi ý status badge:

* Draft: xám.
* Published/Active: xanh.
* Closed/Expired: xám đậm.
* Pending/In progress: vàng/cam.
* Submitted/Completed: xanh.
* Failed/Rejected: đỏ.

Chỉ dùng nếu API không có label/color sẵn.

## State Handling

Bắt buộc xử lý:

* Initial loading.
* Submit loading.
* Mutation loading.
* Empty state.
* API error.
* Validation error.
* Unauthorized 401.
* Forbidden 403.
* Not found 404.
* Conflict 409.
* Expired/closed assessment.
* Network error.
* Pagination state.
* Filter state.
* Refetch sau create/update/delete/assign/submit/grade.

Không để UI crash nếu field null/undefined.

## Integration với module khác

Assessment có thể liên quan đến:

* Job module.
* Candidate application module.
* Resume module.
* Notification module nếu có.
* ATS screening nếu assessment được tạo sau ATS.

Yêu cầu:

* Reuse job selector/service nếu đã có.
* Reuse candidate/application data nếu đã có.
* Không tạo duplicate page nếu application/job page đã tồn tại.
* Có thể thêm CTA “Create Assessment” hoặc “Send Assessment” ở job/application detail nếu phù hợp và API hỗ trợ.
* Không làm vỡ flow apply/job/resume hiện có.

## Routing/Menu

Thêm entry menu hợp lý nếu project có sidebar/navbar:

Recruiter:

```text
Assessments
Bài đánh giá
```

Candidate nếu API có:

```text
My Assessments
Bài đánh giá của tôi
```

Admin nếu API có:

```text
Assessment Management
```

Không thêm menu nếu role không có quyền.

## Documentation Update

Sau khi code xong, cập nhật:

```text
docs/ai-fe/modules/recruiter-assessment.md
```

Nội dung update gồm:

* Route/page đã implement.
* Component đã tạo/sửa.
* Service/API function đã tạo/sửa.
* Types/interfaces đã tạo/sửa.
* Flow recruiter tạo/quản lý assessment.
* Flow quản lý câu hỏi.
* Flow assign assessment.
* Flow candidate làm bài nếu có.
* Flow recruiter xem/chấm submissions nếu có.
* State/loading/error đã xử lý.
* Role guard đã áp dụng.
* Edge cases còn lưu ý.

Không viết lan man. Chỉ ghi thay đổi thực tế để dev/AI agent sau maintain được.

## Verification

Sau khi implement xong, chạy đúng package manager hiện tại.

Ví dụ nếu dùng npm:

```bash
npm install
npm run lint
npm run build
npm run dev
```

Nếu dùng pnpm/yarn thì dùng đúng command tương ứng.

Nếu lỗi:

* Đọc lỗi.
* Sửa lỗi.
* Chạy lại.
* Không bỏ qua lỗi TypeScript/build/lint.

## Báo cáo cuối cùng

Sau khi hoàn thành, báo cáo rõ:

* Đã đọc những file docs nào.
* Đã tạo/sửa những file nào.
* Đã implement những route nào.
* Đã tích hợp API nào.
* Đã xử lý role guard nào.
* Đã chạy command nào.
* Lỗi còn tồn tại nếu có.
