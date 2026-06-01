Bạn là AI Frontend Engineer đang làm trong dự án WorkHub.

Nhiệm vụ: Xây dựng/hoàn thiện FE cho tính năng **Realtime Notification** dựa trên tài liệu:

* `docs/ai-fe/modules/realtime-notification.md`

## 1. File bắt buộc phải đọc trước khi code

Trước khi sửa code, bắt buộc đọc kỹ:

```text
docs/ai-fe/ui-rules.md
docs/ai-fe/architecture.md
docs/ai-fe/conventions.md
docs/ai-fe/modules/realtime-notification.md
```

Nên đọc thêm các module liên quan nếu notification có điều hướng tới các nghiệp vụ khác:

```text
docs/ai-fe/modules/job-api.md
docs/ai-fe/modules/resume-api.md
docs/ai-fe/modules/ats-resume-screening-api.md
docs/ai-fe/modules/recruiter-assessment.md
docs/ai-fe/modules/job-recommendation.md
docs/ai-fe/modules/user-api.md
```

Nếu tên file khác thực tế, hãy tự search trong `docs/ai-fe` bằng keyword:

```text
notification
realtime
websocket
stomp
socket
unread
read
read all
recipient
```

## 2. Mục tiêu chức năng

Implement end-to-end FE cho **Realtime Notification**.

Flow tổng quát:

1. User đăng nhập vào hệ thống.
2. FE kết nối realtime tới server theo đúng tài liệu.
3. User nhận notification realtime khi có sự kiện mới.
4. Header/navbar hiển thị icon chuông + unread count.
5. User mở notification dropdown để xem danh sách notification gần đây.
6. User có thể đánh dấu một notification là đã đọc.
7. User có thể đánh dấu tất cả là đã đọc nếu API hỗ trợ.
8. User có thể xóa/ẩn notification nếu API hỗ trợ.
9. User có thể vào trang danh sách notification đầy đủ.
10. Khi notification có targetUrl/type/entityId, click sẽ điều hướng đúng trang liên quan.
11. Khi logout hoặc token hết hạn, FE phải disconnect websocket.

Không tự bịa API hoặc mock data nếu API thật đã có trong docs.

## 3. Nguyên tắc bắt buộc

* Search trước, đọc docs trước, rồi mới code.
* Không sửa mò.
* Không tạo architecture mới.
* Không refactor lớn ngoài phạm vi notification.
* Không đổi design system toàn cục.
* Không duplicate API client/socket client nếu đã có.
* Không hard-code fake notification.
* Không làm vỡ auth/layout hiện có.
* Tất cả endpoint, socket URL, topic, destination phải lấy từ `realtime-notification.md`.
* Nếu docs có STOMP/WebSocket config cụ thể thì phải dùng đúng.

## 4. Kiểm tra cấu trúc project trước khi làm

Trước khi code, inspect project để xác định:

* Framework: React/Vite/Next hoặc setup thực tế.
* Folder pages/routes hiện tại.
* API client hiện tại: axios/fetch/custom wrapper.
* Auth state/current user pattern.
* Token storage pattern.
* Route guard pattern.
* Layout/header/navbar hiện tại.
* Toast/notification UI pattern.
* State management hiện tại: Context, Redux, Zustand, React Query, SWR hoặc local state.
* Package manager: npm/yarn/pnpm.
* Đã có dependency websocket/stomp chưa.

Không tự thêm dependency nếu project đã có package phù hợp. Nếu cần thêm package, phải chọn hợp lý và giải thích trong báo cáo cuối.

## 5. API Integration

Đọc kỹ `docs/ai-fe/modules/realtime-notification.md` và implement đúng:

* Endpoint lấy danh sách notification.
* Endpoint lấy unread count.
* Endpoint mark read.
* Endpoint mark all as read.
* Endpoint delete/soft delete nếu có.
* Query params/pagination/filter.
* Response body.
* Error response.
* Auth requirement.
* WebSocket endpoint.
* STOMP endpoint nếu có.
* Subscribe topic/queue.
* Message payload realtime.
* Reconnect policy nếu docs có.
* Heartbeat nếu docs có.

Tất cả REST API cần login phải gắn:

```text
Authorization: Bearer <access_token>
```

theo cơ chế auth hiện tại, không tự viết token logic mới nếu đã có interceptor.

## 6. WebSocket/STOMP Integration

Nếu backend dùng WebSocket/STOMP, implement socket client đúng theo docs.

Yêu cầu:

* Chỉ connect khi user đã authenticated.
* Gắn token khi connect nếu docs yêu cầu.
* Subscribe đúng destination, ví dụ dạng:

  * `/user/queue/notifications`
  * `/topic/notifications`
  * hoặc destination đúng trong docs.
* Khi nhận message:

  * Parse payload an toàn.
  * Add notification vào state.
  * Tăng unread count.
  * Hiển thị toast nếu phù hợp.
  * Không duplicate notification nếu message trùng id.
* Khi logout:

  * Disconnect socket.
  * Clear notification state nếu cần.
* Khi token hết hạn/401:

  * Disconnect hoặc reconnect sau khi refresh token nếu project đã có flow refresh token.
* Có cleanup trong component/hook để tránh memory leak.
* Không tạo nhiều connection song song khi user navigate nhiều trang.
* Nếu dùng React Strict Mode, phải tránh connect duplicate.

Gợi ý tạo hook/service nếu project chưa có:

```text
notificationSocket.ts
useNotificationSocket.ts
NotificationProvider.tsx
```

Nhưng phải follow convention hiện tại.

## 7. Service/API functions

Tạo/cập nhật service theo convention hiện tại, ví dụ:

```text
notificationService.ts
notificationApi.ts
realtimeNotification.service.ts
```

Chỉ tạo function nếu API docs có endpoint tương ứng.

Gợi ý functions:

```ts
getNotifications(params)
getUnreadNotificationCount()
markNotificationAsRead(notificationId)
markAllNotificationsAsRead()
deleteNotification(notificationId)
```

Socket functions/hook:

```ts
connectNotificationSocket(token)
disconnectNotificationSocket()
subscribeNotificationChannel(callback)
useNotificationSocket()
```

Tên function phải follow convention hiện tại của project.

## 8. TypeScript types / DTO

Nếu project dùng TypeScript, tạo/cập nhật type rõ ràng:

```ts
Notification
NotificationListItem
NotificationType
NotificationStatus
NotificationPayload
NotificationSearchParams
UnreadNotificationCountResponse
MarkNotificationReadResponse
RealtimeNotificationMessage
```

Field thường có, chỉ dùng đúng theo docs:

```ts
id
recipientId
title
content
message
type
read
deleted
targetUrl
entityType
entityId
createdAt
updatedAt
```

Không dùng `any` tràn lan. Field nào có thể null thì khai báo optional/null đúng.

## 9. UI cần implement

### 9.1 Notification Bell ở Header/Navbar

Thêm hoặc cập nhật icon chuông trong layout hiện tại.

Yêu cầu:

* Hiển thị unread count badge.
* Nếu unread count = 0 thì không hiển thị badge hoặc hiển thị nhẹ theo style hiện tại.
* Click mở dropdown/popover.
* Chỉ hiển thị khi user đã login.
* Không hiển thị cho guest nếu docs không yêu cầu.

Dropdown hiển thị:

* 5–10 notification gần nhất.
* Title/content ngắn gọn.
* Created time.
* Read/unread state.
* Action mark read nếu có.
* Link “Xem tất cả”.
* Empty state: “Bạn chưa có thông báo nào”.
* Loading state khi fetch.
* Error state nếu fetch lỗi.

### 9.2 Notification Dropdown Behavior

Yêu cầu:

* Notification unread nổi bật hơn read.
* Click notification:

  * Mark read nếu chưa đọc.
  * Điều hướng theo `targetUrl` nếu có.
  * Nếu không có targetUrl thì chỉ mở detail hoặc mark read.
* Không crash nếu notification thiếu targetUrl.
* Khi mark read thành công:

  * Update item state.
  * Giảm unread count.
* Khi nhận realtime notification:

  * Đưa item mới lên đầu list.
  * Tăng badge.
  * Có thể hiển thị toast ngắn.

### 9.3 Full Notification Page

Route gợi ý:

```text
/notifications
```

UI cần có:

* Header: “Thông báo”
* Tabs/filter nếu API hỗ trợ:

  * Tất cả
  * Chưa đọc
  * Đã đọc
* Pagination nếu API hỗ trợ.
* Button “Đánh dấu tất cả đã đọc” nếu API có.
* List notification đầy đủ.
* Delete/soft delete nếu API hỗ trợ.
* Loading skeleton.
* Empty state.
* Error state.
* Responsive tốt.

### 9.4 Toast Realtime Notification

Khi nhận message realtime:

* Hiển thị toast nhỏ gọn nếu user đang online.
* Toast gồm title + content ngắn.
* Click toast nếu có targetUrl thì điều hướng.
* Không spam toast nếu nhận nhiều message nhanh; nếu project có throttle/debounce pattern thì áp dụng.
* Không hiển thị toast cho notification đang ở chính trang liên quan nếu project có pattern, không bắt buộc.

## 10. Notification Navigation Mapping

Nếu notification payload có `targetUrl`, ưu tiên dùng `targetUrl`.

Nếu chỉ có `type/entityType/entityId`, map điều hướng theo docs nếu có.

Ví dụ, chỉ áp dụng nếu phù hợp với docs/project:

```text
JOB_APPLICATION -> /recruiter/applications/:id
ATS_SCREENING -> /recruiter/ats-screenings/:id
ASSESSMENT_ASSIGNED -> /candidate/assessments/:id
ASSESSMENT_SUBMITTED -> /recruiter/assessment-submissions/:id
JOB_RECOMMENDATION -> /candidate/recommended-jobs
COMPANY_JOIN_REQUEST -> /admin/company-join-requests
```

Không tự bịa mapping nếu docs đã có mapping khác. Nếu không đủ dữ liệu để điều hướng, vẫn hiển thị notification bình thường.

## 11. State Management

Chọn cách quản lý state theo project hiện tại.

Yêu cầu:

* Notification list state.
* Unread count state.
* Socket connected state nếu cần.
* Loading/error state.
* Reconnect state nếu cần.
* Clear state khi logout.
* Refetch unread count khi user login.
* Refetch list khi mở dropdown/page nếu cần.
* Tránh duplicate message realtime.

Nếu project dùng React Query/SWR:

* Dùng query/mutation đúng pattern.
* Invalidate/refetch sau mark read/delete.
* Update cache hợp lý khi nhận realtime message.

Nếu project dùng Context/Zustand/Redux:

* Follow store pattern hiện có.
* Không tạo store mới nếu notification state có thể nằm trong layout/provider hiện tại.

## 12. Error Handling

Bắt buộc xử lý:

* 401 unauthorized.
* 403 forbidden.
* 404 notification not found.
* 409 conflict nếu đã read/deleted.
* 500 server error.
* Network error.
* WebSocket disconnected.
* WebSocket connect failed.
* Invalid realtime payload.
* Token missing/expired.
* Pagination empty.

Không để UI crash khi socket lỗi.

## 13. UI Style bắt buộc

Bám theo `docs/ai-fe/ui-rules.md` và style WorkHub hiện tại.

Yêu cầu:

* Clean, compact, chuyên nghiệp.
* Không gradient màu mè.
* Không spacing quá lớn.
* Không dashboard generic.
* Notification dropdown phải gọn, dễ scan.
* Badge unread rõ nhưng không quá chói.
* Full page list phải dễ đọc.
* Empty state có hướng xử lý.
* Không text demo/fake.
* Responsive tốt.

## 14. Dependency

Nếu cần WebSocket/STOMP package, kiểm tra `package.json` trước.

Có thể dùng nếu project chưa có và backend là Spring STOMP:

```bash
npm install @stomp/stompjs sockjs-client
```

Nhưng chỉ thêm nếu tài liệu `realtime-notification.md` xác nhận backend dùng SockJS/STOMP hoặc project chưa có dependency tương ứng.

Không tự thêm thư viện nặng khi không cần.

## 15. Documentation Update

Sau khi code xong, cập nhật:

```text
docs/ai-fe/modules/realtime-notification.md
```

Nội dung update gồm:

* Route/page đã implement.
* Component đã tạo/sửa.
* Service/API function đã tạo/sửa.
* Socket client/hook/provider đã tạo/sửa.
* Types/interfaces đã tạo/sửa.
* Flow realtime connect/subscribe/disconnect.
* Flow notification dropdown.
* Flow full notification page.
* Flow mark read/mark all/delete.
* State/loading/error đã xử lý.
* Role/auth guard đã áp dụng.
* Dependency đã thêm nếu có.
* Edge cases còn lưu ý.

Không viết lan man. Chỉ ghi thay đổi thực tế.

## 16. Verification

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

Nếu test realtime được:

* Login bằng user có token.
* Mở app.
* Kiểm tra websocket connected.
* Kiểm tra subscribe đúng channel.
* Tạo event ở BE/Postman để phát notification.
* Xác nhận chuông tăng unread count.
* Xác nhận dropdown có notification mới.
* Xác nhận mark read hoạt động.
* Xác nhận logout thì socket disconnect.

## 17. Báo cáo cuối cùng

Sau khi hoàn thành, báo cáo rõ:

* Đã đọc những file docs nào.
* Đã tạo/sửa những file nào.
* Đã implement route nào.
* Đã tích hợp REST API nào.
* Đã tích hợp WebSocket/STOMP như thế nào.
* Đã xử lý auth/role guard nào.
* Đã thêm dependency nào nếu có.
* Đã chạy command nào.
* Lỗi còn tồn tại nếu có.
