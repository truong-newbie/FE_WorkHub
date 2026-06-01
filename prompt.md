Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

BE đã gửi tài liệu API/flow cho tính năng **Job Recommendation** tại:

* `docs/ai-fe/modules/job-recommendation.md`

Nhiệm vụ: Đọc kỹ tài liệu này và xây dựng/hoàn thiện FE cho tính năng **gợi ý việc làm cá nhân hóa**.

## 1. File bắt buộc phải đọc trước khi code

Trước khi sửa code, bắt buộc đọc kỹ:

```text
docs/ai-fe/ui-rules.md
docs/ai-fe/architecture.md
docs/ai-fe/conventions.md
docs/ai-fe/modules/job-recommendation.md
docs/ai-fe/modules/job-api.md
docs/ai-fe/modules/user-api.md
```

Nên đọc thêm các module liên quan nếu có:

```text
docs/ai-fe/modules/resume-api.md
docs/ai-fe/modules/ats-resume-screening-api.md
docs/ai-fe/modules/recruiter-assessment.md
```

Nếu tên file khác thực tế, hãy tự search trong `docs/ai-fe` bằng keyword:

```text
recommendation
job recommendation
recommended jobs
personalized jobs
preference
candidate preference
job
candidate
```

## 2. Mục tiêu chức năng

Implement end-to-end FE cho tính năng **Job Recommendation**.

Flow tổng quát:

1. Candidate đăng nhập vào hệ thống.
2. Candidate có thể xem danh sách job được gợi ý cá nhân hóa.
3. Nếu hệ thống cần profile/preference để gợi ý, FE phải hiển thị onboarding/preference form theo đúng API doc.
4. Candidate có thể cập nhật preference nếu API hỗ trợ.
5. Candidate có thể xem lý do vì sao job được recommend nếu API trả về reason/matched skills/score.
6. Candidate có thể click vào job detail.
7. Candidate có thể save/favorite job nếu job module đã hỗ trợ.
8. Candidate có thể apply job nếu flow apply đã có.
9. Nếu API có feedback recommendation như interested/not interested/hide, implement đúng theo tài liệu.
10. Không tự bịa API hoặc mock data nếu API thật đã có trong docs.

## 3. Nguyên tắc bắt buộc

* Search trước, đọc docs trước, rồi mới code.
* Không sửa mò.
* Không tạo architecture mới.
* Không refactor lớn ngoài phạm vi job recommendation.
* Không đổi design system toàn cục.
* Không duplicate service/component nếu đã có.
* Không hard-code fake data.
* Không làm vỡ job/user/resume module hiện có.
* Tất cả UI/API/route phải bám sát `job-recommendation.md`.
* Nếu response thực tế khác dự đoán, ưu tiên tài liệu API.

## 4. Kiểm tra cấu trúc project trước khi làm

Trước khi code, inspect project để xác định:

* Framework: React/Vite/Next hoặc setup thực tế.
* Folder pages/routes hiện tại.
* API client hiện tại: axios/fetch/custom wrapper.
* Cách attach JWT token.
* Base response format.
* Error response format.
* Pagination pattern.
* Filter/search pattern.
* Toast/loading/skeleton/modal pattern.
* Auth state/current user pattern.
* Role guard hiện tại.
* Style convention hiện tại.
* Component có sẵn: JobCard, JobList, EmptyState, Loading, Pagination, Badge, Button, Form Input.

Không tạo pattern mới nếu project đã có pattern tương ứng.

## 5. Role & Permission

Tính năng này chủ yếu dành cho:

```text
CANDIDATE
```

Yêu cầu:

* User chưa đăng nhập thì redirect login hoặc hiển thị login prompt theo convention.
* Recruiter/Admin không cần thấy trang recommendation dành cho candidate, trừ khi docs có quy định.
* Candidate chưa hoàn thiện preference/profile thì hiển thị màn hình setup preference.
* Nếu API trả 401/403 thì UI xử lý rõ ràng, không crash.
* Không hiển thị action không đúng role.

## 6. API Integration

Đọc kỹ `docs/ai-fe/modules/job-recommendation.md` và implement đúng:

* Endpoint.
* HTTP method.
* Path params.
* Query params.
* Request body.
* Response body.
* Pagination response.
* Recommendation score.
* Recommendation reason.
* Matched skills.
* Missing skills nếu có.
* Preference API nếu có.
* Feedback API nếu có.
* Auth requirement.
* Role requirement.
* Error response.

Tất cả API cần login phải dùng cơ chế auth hiện tại để gắn:

```text
Authorization: Bearer <access_token>
```

Không tự viết token logic mới nếu project đã có axios interceptor/auth client.

## 7. Service/API functions

Tạo/cập nhật service theo convention hiện tại, ví dụ:

```text
jobRecommendationService.ts
jobRecommendationApi.ts
recommendation.service.ts
```

Chỉ tạo function nếu API document có endpoint tương ứng.

Gợi ý function, tùy tài liệu có gì thì implement cái đó:

```ts
getRecommendedJobs(params)
getRecommendedJobDetail(jobId)
getCandidatePreferences()
createCandidatePreferences(payload)
updateCandidatePreferences(payload)
submitRecommendationFeedback(payload)
hideRecommendedJob(jobId)
refreshRecommendations(params)
```

Tên function phải follow convention hiện tại của project.

## 8. TypeScript types / DTO

Nếu project dùng TypeScript, tạo/cập nhật type rõ ràng.

Gợi ý types:

```ts
RecommendedJob
RecommendedJobListItem
RecommendedJobDetail
JobRecommendationReason
JobRecommendationScore
CandidateJobPreference
CandidateJobPreferenceRequest
CandidatePreferenceStatus
RecommendationFeedbackRequest
RecommendationFeedbackType
JobRecommendationSearchParams
```

Không dùng `any` tràn lan. Field nào optional phải theo đúng docs.

## 9. UI Pages cần implement

Tùy theo route convention hiện tại, tạo/cập nhật các page sau nếu API hỗ trợ.

### 9.1 Candidate Recommended Jobs Page

Route gợi ý:

```text
/candidate/recommended-jobs
```

hoặc route phù hợp với convention hiện tại.

UI cần có:

* Header: “Việc làm phù hợp với bạn”
* Subtitle ngắn: dựa trên kỹ năng, vị trí, kinh nghiệm, mong muốn làm việc.
* Danh sách recommended jobs.
* Filter/sort nếu API hỗ trợ.
* Pagination nếu API hỗ trợ.
* Loading skeleton.
* Empty state.
* Error state.
* CTA cập nhật preference nếu chưa có dữ liệu gợi ý.
* CTA refresh recommendation nếu API hỗ trợ.

Mỗi job card nên hiển thị:

* Job title.
* Company name/logo.
* Location.
* Salary.
* Skills/tags.
* Work mode.
* Employment type.
* Level.
* Recommendation score nếu API có.
* Reason/matched skills nếu API có.
* Button xem chi tiết.
* Button lưu job nếu job module có.
* Button apply nếu flow apply có.

### 9.2 Recommendation Reason UI

Nếu API trả về lý do gợi ý, hiển thị rõ:

* “Phù hợp vì bạn có kỹ năng: Java, Spring Boot, MySQL”
* “Phù hợp với địa điểm mong muốn: Hà Nội”
* “Phù hợp với hình thức làm việc: Remote/Hybrid/Onsite”
* “Mức độ phù hợp: 86%”

Không hiển thị JSON raw.

Score UI:

* > = 80: Rất phù hợp
* 60–79: Phù hợp
* 40–59: Có thể cân nhắc
* < 40: Ít phù hợp

Chỉ dùng mapping này nếu API không trả label sẵn. Nếu API trả label/recommendationLevel thì ưu tiên dùng API.

### 9.3 Candidate Preference Setup Page/Form

Nếu API yêu cầu preference:

Route gợi ý:

```text
/candidate/job-preferences
```

Form cần map đúng request body trong docs.

Các field thường có, chỉ dùng nếu docs có:

* desiredJobTitles
* preferredLocations
* preferredSkills
* workMode
* employmentType
* candidateLevel
* minSalary
* maxSalary
* salaryCurrency
* experienceYears
* industry
* companySize
* remotePreference
* openToRelocation

Validation:

* Required fields theo docs.
* Salary min <= salary max.
* Experience >= 0.
* Ít nhất một skill/job title/location nếu nghiệp vụ yêu cầu.
* Không cho submit form invalid.
* Hiển thị lỗi gần field.

UX:

* Form compact, chia section:

  * Vai trò mong muốn.
  * Kỹ năng.
  * Địa điểm & hình thức làm việc.
  * Mức lương.
  * Kinh nghiệm.
* Có save/update button.
* Có loading khi submit.
* Success feedback sau khi lưu.
* Sau khi lưu có thể redirect về recommended jobs nếu hợp lý.

### 9.4 First Login / Onboarding Preference

Nếu docs có flow first login/preference:

* Khi candidate chưa có preference, hiển thị onboarding card.
* Không ép flow nếu API không yêu cầu.
* Nếu hệ thống có flag `hasCompletedPreference` hoặc tương tự, dùng đúng field đó.
* Có CTA “Thiết lập gợi ý việc làm”.
* Sau khi hoàn tất, đưa candidate tới trang recommended jobs.

### 9.5 Feedback cho recommendation

Nếu API hỗ trợ feedback:

Implement action:

* Interested.
* Not interested.
* Hide this job.
* Not relevant.
* Save preference signal.

UI:

* Không làm rối job card.
* Dùng menu nhỏ hoặc button gọn.
* Sau feedback, update UI/refetch.
* Xử lý lỗi 409/404/403.
* Không xóa job khỏi UI nếu API không xác nhận thành công.

## 10. Integration với Job module

Tính năng recommendation phải reuse Job module nếu đã có:

* Reuse JobCard nếu phù hợp.
* Reuse JobDetail route.
* Reuse save/favorite API nếu có.
* Reuse apply job flow nếu đã có.
* Reuse skill badge/status badge/pagination nếu đã có.
* Không tạo job detail page mới riêng nếu `/jobs/:id` đã tồn tại.
* Click recommended job phải đi tới job detail chuẩn.

## 11. Routing/Menu

Thêm menu/entry hợp lý nếu project có navbar/sidebar/profile menu.

Candidate:

```text
Việc làm gợi ý
Gợi ý cho bạn
Recommended Jobs
```

Preference:

```text
Cài đặt gợi ý việc làm
Job Preferences
```

Không thêm menu cho recruiter/admin nếu docs không yêu cầu.

## 12. UI Style bắt buộc

Bám theo `docs/ai-fe/ui-rules.md` và style WorkHub hiện tại.

Yêu cầu:

* Phong cách website tìm việc chuyên nghiệp giống ITviec.
* Clean, compact, thực tế.
* Không gradient màu mè.
* Không spacing quá lớn.
* Không dashboard generic.
* Không text demo/fake.
* Card job dễ scan.
* Score/reason hiển thị rõ nhưng không lấn át job info.
* CTA rõ: “Xem chi tiết”, “Ứng tuyển”, “Lưu việc”.
* Empty state phải có hướng xử lý: cập nhật preference/tìm job khác.
* Responsive tốt desktop/tablet/mobile.

## 13. State Handling

Bắt buộc xử lý:

* Initial loading.
* Submit loading.
* Empty recommendation.
* Empty preference.
* API error.
* Validation error.
* 401 unauthorized.
* 403 forbidden.
* 404 not found.
* 409 conflict.
* Network error.
* Pagination state.
* Filter state.
* Refetch sau update preference/feedback.
* Null/undefined field từ API.

Không để UI crash nếu response thiếu field.

## 14. Documentation Update

Sau khi code xong, cập nhật:

```text
docs/ai-fe/modules/job-recommendation.md
```

Nội dung update gồm:

* Route/page đã implement.
* Component đã tạo/sửa.
* Service/API function đã tạo/sửa.
* Types/interfaces đã tạo/sửa.
* Flow candidate xem job recommendation.
* Flow setup/update preference.
* Flow feedback nếu có.
* Integration với job detail/save/apply.
* State/loading/error đã xử lý.
* Role guard đã áp dụng.
* Edge cases còn lưu ý.

Không viết lan man. Chỉ ghi thay đổi thực tế để dev/AI agent sau maintain được.

## 15. Verification

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

## 16. Báo cáo cuối cùng

Sau khi hoàn thành, báo cáo rõ:

* Đã đọc những file docs nào.
* Đã tạo/sửa những file nào.
* Đã implement route nào.
* Đã tích hợp API nào.
* Đã xử lý role guard nào.
* Đã chạy command nào.
* Lỗi còn tồn tại nếu có.
