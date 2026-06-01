# Realtime Notification - Backend Contract for Frontend

## 1. Muc dich

Module notification co hai kenh hoat dong song song:

1. REST API de lay lich su notification da luu trong database va cap nhat trang thai read.
2. WebSocket STOMP + SockJS de push notification moi theo thoi gian thuc cho dung user dang
   online.

FE can tich hop ca hai kenh:

- WebSocket giup badge va dropdown cap nhat ngay lap tuc.
- REST API giup load lich su, phan trang va bu notification bi bo lo khi user offline hoac
  socket bi mat ket noi.

Khong co API public de FE tu tao notification. Backend tu tao notification khi business
event thanh cong.

Tai lieu nay duoc viet theo code backend hien tai va doi chieu voi:

```text
test_api_notification_realtime.txt
```

## 2. Base URL va authentication

REST base URL local:

```text
http://localhost:8080/api/v1
```

WebSocket SockJS endpoint:

```text
http://localhost:8080/ws
```

Tat ca REST notification API can JWT:

```http
Authorization: Bearer <accessToken>
```

Tat ca role authenticated deu co the dung notification:

- Candidate
- Recruiter
- Admin

## 3. Response REST va payload realtime khac nhau

### REST success wrapper

REST API tra:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

REST error:

```json
{
  "status": "ERROR",
  "message": "Notification not found with id: 123"
}
```

### WebSocket payload

WebSocket push truc tiep mot `NotificationResponse`, khong co wrapper `status` hoac `data`:

```json
{
  "id": 123,
  "type": "JOB_APPLICATION_CREATED",
  "title": "New job application",
  "content": "candidate01 has applied for Java Backend Engineer",
  "targetType": "APPLICATION",
  "targetId": "9001",
  "read": false,
  "createdAt": "2026-06-01T16:00:00",
  "readAt": null,
  "senderId": "candidate-user-id",
  "senderName": "candidate01",
  "recipientId": "recruiter-user-id"
}
```

## 4. NotificationResponse schema

| Field | Type | Nullable | Y nghia |
| --- | --- | --- | --- |
| `id` | `number` | No | Notification ID dung cho mark read va delete |
| `type` | `NotificationType` | No | Loai business notification |
| `title` | `string` | No | Tieu de hien thi |
| `content` | `string` | No | Noi dung hien thi |
| `targetType` | `NotificationTargetType` | No | Loai resource de FE dieu huong |
| `targetId` | `string` | Yes | ID resource lien quan |
| `read` | `boolean` | No | Da doc hay chua |
| `createdAt` | `string` | No | Local date time tao notification |
| `readAt` | `string` | Yes | Local date time danh dau read |
| `senderId` | `string` | Yes | User tao ra business action; ATS system co the khong co sender |
| `senderName` | `string` | Yes | Username cua sender |
| `recipientId` | `string` | No | User nhan notification |

TypeScript interface:

```ts
export type NotificationType =
  | "JOB_APPLICATION_CREATED"
  | "JOB_APPLICATION_STATUS_UPDATED"
  | "ASSESSMENT_ASSIGNED"
  | "ASSESSMENT_SUBMITTED"
  | "COMPANY_APPROVED"
  | "COMPANY_REJECTED"
  | "ATS_SCREENING_COMPLETED"
  | "SYSTEM";

export type NotificationTargetType =
  | "JOB"
  | "APPLICATION"
  | "ASSESSMENT"
  | "COMPANY"
  | "SCREENING_RESULT"
  | "USER"
  | "NONE";

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  targetType: NotificationTargetType;
  targetId?: string | null;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
  senderId?: string | null;
  senderName?: string | null;
  recipientId: string;
}
```

## 5. Notification enums

### NotificationType

| Type | Nguoi nhan | Khi nao tao |
| --- | --- | --- |
| `JOB_APPLICATION_CREATED` | Recruiter hoac company owner | Candidate apply job |
| `JOB_APPLICATION_STATUS_UPDATED` | Candidate | Recruiter/admin cap nhat application status |
| `ASSESSMENT_ASSIGNED` | Candidate | Recruiter assign assessment |
| `ASSESSMENT_SUBMITTED` | Recruiter | Candidate submit assessment |
| `COMPANY_APPROVED` | Company owner va recruiter lien quan | Admin approve company |
| `COMPANY_REJECTED` | Company owner va recruiter lien quan | Admin reject company |
| `ATS_SCREENING_COMPLETED` | Recruiter hoac company owner | ATS screening hoan tat |
| `SYSTEM` | Tuy message backend | Notification he thong hoac queue message mac dinh |

### NotificationTargetType

| Target type | `targetId` dai dien cho | Dieu huong FE de xuat |
| --- | --- | --- |
| `APPLICATION` | Application ID | Trang chi tiet application |
| `ASSESSMENT` | Candidate test assignment ID | Trang assessment assignment/detail |
| `COMPANY` | Company ID | Trang chi tiet company |
| `SCREENING_RESULT` | Screening result ID | Trang ket qua ATS; luu y day khong phai application ID |
| `JOB` | Job ID | Trang chi tiet job neu sau nay backend phat event |
| `USER` | User ID | Trang user neu UI co route tuong ung |
| `NONE` | Khong co resource | Khong dieu huong |

FE nen dieu huong theo `targetType`, khong suy luan tu `type`.

## 6. REST APIs

### 6.1 Lay danh sach notification cua current user

```http
GET /api/v1/notifications
Authorization: Bearer <accessToken>
```

Vi du day du:

```http
GET /api/v1/notifications?keyword=java&type=JOB_APPLICATION_CREATED&read=false&fromDate=2026-05-01T00:00:00&toDate=2026-06-01T23:59:59&pageNum=1&pageSize=10&sortBy=createdAt&isAscending=false
```

Query params:

| Param | Type | Default | Ghi chu |
| --- | --- | --- | --- |
| `keyword` | `string` | empty | Search case-insensitive trong `title` hoac `content` |
| `type` | `NotificationType` | none | Filter theo notification type |
| `read` | `boolean` | none | `false` de lay unread, `true` de lay da doc |
| `fromDate` | local datetime | none | Filter `createdAt >= fromDate` |
| `toDate` | local datetime | none | Filter `createdAt <= toDate` |
| `pageNum` | `number` | `1` | 1-based |
| `pageSize` | `number` | `10` | So notification moi page |
| `sortBy` | `string` | `createdAt` | Xem danh sach ben duoi |
| `isAscending` | `boolean` | `false` | Mac dinh moi nhat truoc |

Date time gui dang:

```text
YYYY-MM-DDTHH:mm:ss
```

`sortBy` hop le:

```text
title
type
read
readAt
createdAt
```

Gia tri `sortBy` khac se fallback thanh `createdAt`.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "meta": {
      "totalElements": 25,
      "totalPages": 3,
      "pageNum": 1,
      "pageSize": 10,
      "sortBy": "createdAt",
      "sortType": "DESC"
    },
    "items": [
      {
        "id": 123,
        "type": "JOB_APPLICATION_CREATED",
        "title": "New job application",
        "content": "candidate01 has applied for Java Backend Engineer",
        "targetType": "APPLICATION",
        "targetId": "9001",
        "read": false,
        "createdAt": "2026-06-01T16:00:00",
        "readAt": null,
        "senderId": "candidate-user-id",
        "senderName": "candidate01",
        "recipientId": "recruiter-user-id"
      }
    ]
  }
}
```

Backend luon chi tra notification cua current user va bo qua row `deleted = true`.

### 6.2 Lay unread count

```http
GET /api/v1/notifications/unread-count
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "unreadCount": 5
  }
}
```

Dung cho badge tren notification bell.

### 6.3 Danh dau mot notification da doc

```http
PUT /api/v1/notifications/{id}/read
Authorization: Bearer <accessToken>
```

Khong co request body.

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "id": 123,
    "type": "JOB_APPLICATION_CREATED",
    "title": "New job application",
    "content": "candidate01 has applied for Java Backend Engineer",
    "targetType": "APPLICATION",
    "targetId": "9001",
    "read": true,
    "createdAt": "2026-06-01T16:00:00",
    "readAt": "2026-06-01T16:05:00",
    "recipientId": "recruiter-user-id"
  }
}
```

Rule:

- Chi recipient cua notification moi thao tac duoc.
- Goi lai notification da read van thanh cong, khong thay doi `readAt`.

### 6.4 Danh dau tat ca notification da doc

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <accessToken>
```

Khong co request body.

Response:

```json
{
  "status": "SUCCESS"
}
```

Backend chi update unread notification chua deleted cua current user.

### 6.5 Xoa hoac an mot notification

```http
DELETE /api/v1/notifications/{id}
Authorization: Bearer <accessToken>
```

Khong co request body.

Response:

```json
{
  "status": "SUCCESS"
}
```

Backend soft-delete notification cua current user. Notification khong con xuat hien trong
history va unread count.

## 7. WebSocket STOMP + SockJS

### 7.1 Endpoint va destination

SockJS endpoint:

```text
/ws
```

Subscribe destination:

```text
/user/queue/notifications
```

Backend gui theo recipient ID:

```text
convertAndSendToUser(recipientId, "/queue/notifications", payload)
```

FE chi subscribe `/user/queue/notifications`. Khong tu chen user ID vao destination.

### 7.2 JWT authentication

Backend validate JWT ngay tai SockJS handshake. Cach on dinh nhat cho browser la truyen
access token trong query param:

```text
http://localhost:8080/ws?token=<accessToken>
```

Backend cung ho tro token trong STOMP `CONNECT` header:

```text
Authorization: Bearer <accessToken>
```

hoac:

```text
token: <accessToken>
```

Tuy nhien, browser SockJS khong dam bao gui custom HTTP Authorization header tai handshake.
Vi backend bat buoc token ngay tu handshake, FE nen dat token trong URL. Co the gui them
`connectHeaders.Authorization` de ro rang va de phong.

Khong ghi access token ra console, analytics hoac error reporting.

### 7.3 Cai package FE

Voi React/Vite:

```bash
npm install @stomp/stompjs sockjs-client
```

### 7.4 Vi du TypeScript client

```ts
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { NotificationResponse } from "./notification.types";

const API_ORIGIN = "http://localhost:8080";

export function createNotificationClient(
  accessToken: string,
  onNotification: (notification: NotificationResponse) => void,
  onReconnectSync: () => void,
) {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${API_ORIGIN}/ws?token=${encodeURIComponent(accessToken)}`),
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {
      // Keep tokens and STOMP frames out of production logs.
    },
  });

  client.onConnect = () => {
    client.subscribe("/user/queue/notifications", (message: IMessage) => {
      const notification = JSON.parse(message.body) as NotificationResponse;
      onNotification(notification);
    });

    // Recover DB-backed notifications missed while offline.
    onReconnectSync();
  };

  client.onStompError = (frame) => {
    console.error("Notification STOMP error", frame.headers.message);
  };

  client.onWebSocketError = () => {
    console.error("Notification WebSocket error");
  };

  return client;
}
```

Mount/unmount vi du:

```ts
useEffect(() => {
  if (!accessToken) return;

  const client = createNotificationClient(
    accessToken,
    (notification) => {
      prependNotification(notification);
      refreshUnreadCount();
    },
    () => {
      refreshUnreadCount();
      refreshFirstNotificationPage();
    },
  );

  client.activate();
  return () => {
    void client.deactivate();
  };
}, [accessToken]);
```

Neu access token thay doi sau refresh token, FE nen deactivate client cu va tao lai client
moi voi token moi.

## 8. Luong dong bo FE de xuat

### Sau login

1. Goi `GET /notifications/unread-count`.
2. Goi `GET /notifications?pageNum=1&pageSize=10`.
3. Mo SockJS connection voi JWT.
4. Subscribe `/user/queue/notifications`.

### Khi nhan realtime payload

1. Parse truc tiep body thanh `NotificationResponse`.
2. Them notification moi len dau dropdown/list neu chua co cung `id`.
3. Refresh unread count hoac tang badge neu chac chan local state dang dong bo.
4. Co the hien toast.

De tranh sai badge khi co nhieu tab hoac reconnect, cach an toan la refetch unread count.

### Khi user click notification

1. Neu `read === false`, goi `PUT /notifications/{id}/read`.
2. Cap nhat local state va unread badge.
3. Dieu huong theo `targetType` va `targetId`.

### Khi socket reconnect

1. Subscribe lai destination.
2. Refetch unread count.
3. Refetch page notification dau tien.

WebSocket chi push message moi luc online. REST history la nguon du lieu de phuc hoi message
bi bo lo.

### Khi logout

1. Deactivate STOMP client.
2. Xoa notification state va unread count local.
3. Xoa access token theo auth flow hien co.

## 9. Business flows tu dong tao notification

FE khong goi API create notification. Notification duoc tao sau khi business transaction
thanh cong.

### Candidate apply job

```http
POST /api/v1/job/{jobId}/apply
```

Nguoi nhan: recruiter cua job; neu job khong co recruiter thi company owner.

Realtime payload:

```json
{
  "type": "JOB_APPLICATION_CREATED",
  "targetType": "APPLICATION",
  "targetId": "<applicationId>"
}
```

### Recruiter cap nhat application status

```http
PUT /api/v1/applications/{applicationId}/status
```

Nguoi nhan: candidate.

Realtime payload:

```json
{
  "type": "JOB_APPLICATION_STATUS_UPDATED",
  "targetType": "APPLICATION",
  "targetId": "<applicationId>"
}
```

### Recruiter assign assessment

```http
POST /api/v1/recruiter/tests/{testId}/assign
```

Nguoi nhan: candidate.

Realtime payload:

```json
{
  "type": "ASSESSMENT_ASSIGNED",
  "targetType": "ASSESSMENT",
  "targetId": "<assignmentId>"
}
```

### Candidate submit assessment

```http
POST /api/v1/candidate/test-assignments/{assignmentId}/submit
```

Nguoi nhan: recruiter tao test.

Realtime payload:

```json
{
  "type": "ASSESSMENT_SUBMITTED",
  "targetType": "ASSESSMENT",
  "targetId": "<assignmentId>"
}
```

### Admin approve hoac reject company

```http
PATCH /api/v1/companies/{companyId}/approve
PATCH /api/v1/companies/{companyId}/reject
```

Nguoi nhan: company owner va recruiter lien quan, backend tu bo recipient trung nhau.

Realtime payload:

```json
{
  "type": "COMPANY_APPROVED",
  "targetType": "COMPANY",
  "targetId": "<companyId>"
}
```

hoac:

```json
{
  "type": "COMPANY_REJECTED",
  "targetType": "COMPANY",
  "targetId": "<companyId>"
}
```

### ATS screening hoan tat

ATS notification da duoc noi vao code backend hien tai. Sau khi screening result duoc luu,
backend publish event va gui notification.

Nguoi nhan: recruiter cua job; neu job khong co recruiter thi company owner.

Realtime payload:

```json
{
  "type": "ATS_SCREENING_COMPLETED",
  "targetType": "SCREENING_RESULT",
  "targetId": "<screeningResultId>"
}
```

Luu y: `targetId` la screening result ID, khong phai application ID.

### RabbitMQ notification job

Backend cung co notification queue consumer. Notification tu queue van duoc luu DB va push
qua cung WebSocket destination. FE khong can tich hop RabbitMQ.

## 10. Dieu huong FE de xuat

Vi route FE cu the tuy ung dung, FE nen viet mot ham tap trung:

```ts
export function getNotificationRoute(notification: NotificationResponse) {
  const id = notification.targetId;
  if (!id) return null;

  switch (notification.targetType) {
    case "APPLICATION":
      return `/applications/${id}`;
    case "ASSESSMENT":
      return `/assessments/assignments/${id}`;
    case "COMPANY":
      return `/companies/${id}`;
    case "SCREENING_RESULT":
      return `/ats/screening-results/${id}`;
    case "JOB":
      return `/jobs/${id}`;
    case "USER":
      return `/users/${id}`;
    case "NONE":
      return null;
  }
}
```

Hay doi path cho khop router hien co cua FE.

## 11. Loi can xu ly

| Tinh huong | Ket qua |
| --- | --- |
| REST request khong co JWT hoac JWT het han | Request bi tu choi |
| WebSocket handshake thieu token hoac token invalid | HTTP `401`, socket khong connect |
| User A mark read notification cua user B | HTTP `404` do backend query theo recipient |
| User A delete notification cua user B | HTTP `404` |
| Notification da delete | Khong con xuat hien trong list va unread count |
| Socket mat ket noi | STOMP client reconnect, sau do refetch REST |

Message backend lien quan:

```text
Notification not found with id: {id}
You do not have permission to access this notification
```

## 12. Frontend implementation checklist

- Cai `@stomp/stompjs` va `sockjs-client`.
- Mo mot STOMP client sau khi user login.
- Ket noi SockJS bang `/ws?token=<encodedAccessToken>`.
- Subscribe dung `/user/queue/notifications`.
- Parse realtime body truc tiep, khong doc `body.data`.
- Load unread count sau login va sau reconnect.
- Load REST notification history cho dropdown hoac notification page.
- Prepend realtime payload va deduplicate theo `id`.
- Mark read khi user click notification.
- Them nut mark all as read.
- Them nut delete/hide neu UI can.
- Dieu huong theo `targetType` va `targetId`.
- Tao lai socket khi access token thay doi.
- Dong socket va clear state khi logout.
- Khong ghi access token vao console hoac analytics.

## 13. Khac biet voi file test cu

| Noi dung | File test cu | Code hien tai |
| --- | --- | --- |
| ATS notification | Ghi chua noi event vao ATS service | Da publish `AtsScreeningCompletedEvent` sau khi save result |
| WebSocket auth | Chu yeu ghi `/ws?token=...` | Query token dung; backend cung ho tro STOMP `Authorization` hoac `token` header |
| Realtime payload | Vi du ngan gon | Payload day du la `NotificationResponse`, khong co REST wrapper |
| Notification ownership error | Co the `404` hoac `403` | Mark read va delete user khac thuc te thuong tra `404` |
| REST pagination | Co query params | Backend dung `pageNum` 1-based va `pageSize`, mac dinh `1`, `10` |

## 14. Gioi han backend hien tai FE can biet

1. WebSocket dung simple in-memory broker. Khi scale nhieu backend instances, can cau hinh
   broker relay hoac shared messaging infrastructure.
2. WebSocket chi push notification moi. Thay doi read/delete khong push realtime sang cac tab
   browser khac. FE co the refetch khi tab focus hoac dung BroadcastChannel neu can multi-tab.
3. Token nam trong SockJS URL vi handshake bat buoc JWT. Production can dung HTTPS/WSS va
   tranh log full query string tai reverse proxy.
4. Backend chua co REST endpoint lay mot notification theo ID.
5. Backend chua co bulk delete notification.
6. Title va content notification hien dang la tieng Anh tu backend.
7. `SCREENING_RESULT` target dung result ID, trong khi ATS REST detail hien tai chu yeu doc
   theo application ID. FE co the can map route hoac backend bo sung result-by-id neu muon
   click notification mo thang ATS report.

## 15. Backend source tham chieu

- `src/main/java/org/example/workhub/controller/NotificationController.java`
- `src/main/java/org/example/workhub/service/impl/NotificationServiceImpl.java`
- `src/main/java/org/example/workhub/config/WebSocketConfig.java`
- `src/main/java/org/example/workhub/security/websocket/JwtHandshakeInterceptor.java`
- `src/main/java/org/example/workhub/security/websocket/WebSocketAuthChannelInterceptor.java`
- `src/main/java/org/example/workhub/security/websocket/UserHandshakeHandler.java`
- `src/main/java/org/example/workhub/listener/NotificationEventListener.java`
- `src/main/java/org/example/workhub/domain/dto/response/NotificationResponse.java`
- `src/main/java/org/example/workhub/domain/specification/NotificationSpecification.java`
- `src/main/java/org/example/workhub/queue/consumer/NotificationQueueConsumer.java`

## 16. FE implementation da them

Dependency:

```text
@stomp/stompjs
sockjs-client
```

Vite dev server proxy them `/ws` toi `http://localhost:8080`. Vite cung map bien Node
`global` cua `sockjs-client` sang browser `globalThis` trong ca production build va
`optimizeDeps` dev prebundle. Bien moi:

```text
VITE_WEBSOCKET_URL
```

Neu khong cau hinh, FE dung `/ws`. Production reverse proxy can route `/ws` toi backend va
dung HTTPS/WSS.

Provider va service:

```text
src/features/notification/NotificationProvider.jsx
src/features/notification/services/notificationService.js
src/features/notification/services/notificationSocket.js
src/features/notification/notificationRoutes.js
```

REST da tich hop:

```text
GET    /notifications
GET    /notifications/unread-count
PUT    /notifications/{id}/read
PUT    /notifications/read-all
DELETE /notifications/{id}
```

Realtime flow:

1. `NotificationProvider` nam duoi `AuthProvider`, chi activate socket khi co access token.
2. SockJS ket noi `/ws?token=<encodedAccessToken>`, STOMP gui them
   `Authorization: Bearer <accessToken>`.
3. FE subscribe `/user/queue/notifications`.
4. Payload duoc parse truc tiep thanh notification, deduplicate theo `id`, prepend vao
   dropdown, refetch unread count va hien toast.
5. Khi reconnect, browser focus hoac moi 15 giay, FE refetch unread count va danh sach gan
   day. Polling nhe nay la fallback cho notification bi lo khi socket gian doan va giup dong
   bo khi co nhieu browser tab.
6. Khi logout, 401 hoac token thay doi, effect cleanup deactivate socket cu, clear interval
   polling va clear state.

UI:

```text
src/features/notification/components/NotificationBell.jsx
src/features/notification/components/NotificationItem.jsx
src/features/notification/pages/NotificationsPage.jsx
```

Route:

```text
/notifications
```

Bell hien cho moi user da login, ke ca admin layout. Dropdown hien 8 notification moi nhat,
badge unread, loading/error/empty state, mark read, mark all read, delete va link toi full
page. Full page co keyword, status, type filter va pagination.

Navigation mapping chi dung route FE that dang co:

- `JOB` -> `/jobs/{id}`
- `COMPANY` -> `/companies/{id}`
- `JOB_APPLICATION_STATUS_UPDATED` + `APPLICATION` -> `/applications`
- `JOB_APPLICATION_CREATED` + `APPLICATION` -> `/recruiter/jobs`
- `ASSESSMENT_ASSIGNED` + `ASSESSMENT` -> `/candidate/assessments/{id}/take`
- `ASSESSMENT_SUBMITTED` + `ASSESSMENT` ->
  `/recruiter/assessments/assignments/{id}/answers`
- `ATS_SCREENING_COMPLETED` + `SCREENING_RESULT` -> `/recruiter/jobs`

`JOB_APPLICATION_CREATED` va `ATS_SCREENING_COMPLETED` chi dieu huong toi recruiter job
workspace vi payload hien tai khong co `jobId`, con `SCREENING_RESULT.targetId` la result ID
nhung ATS detail route hien tai can application ID. FE khong tao link chi tiet sai.
`USER` va `NONE` van hien thi va co the mark read/delete binh thuong nhung khong dieu huong.
