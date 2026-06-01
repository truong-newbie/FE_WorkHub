# Candidate Chatbot - Tai lieu tich hop FE

## Pham vi

Chatbot MVP chi danh cho user dang nhap co role `CANDIDATE`.

- Chatbot chi doc du lieu.
- FE khong duoc goi Gemini truc tiep.
- FE khong duoc goi `ai-worker:8000`.
- FE khong can va khong duoc nhan `GEMINI_API_KEY`.
- Chatbot khong tu apply job, luu job, sua CV hoac huy application.

Moi request phai gui:

```http
Authorization: Bearer <accessToken>
```

## 1. Gui tin nhan

```http
POST /api/v1/chat/messages
Content-Type: application/json
```

Tao conversation moi:

```json
{
  "message": "Tim giup toi job Java backend tai Ha Noi"
}
```

Gui tiep vao conversation hien tai:

```json
{
  "conversationId": 15,
  "message": "Cho toi xem job phu hop nhat"
}
```

Response:

```json
{
  "status": "SUCCESS",
  "data": {
    "conversationId": 15,
    "answer": "Toi tim thay 3 viec lam phu hop.",
    "intent": "SEARCH_JOBS",
    "outOfScope": false,
    "responseMode": "AI",
    "sources": [
      {
        "type": "JOB",
        "id": "12",
        "title": "Java Backend Developer",
        "subtitle": "Example Company - Ha Noi",
        "url": "/jobs/12"
      }
    ],
    "suggestedActions": [
      {
        "type": "OPEN_JOB_SEARCH",
        "label": "Open job search",
        "url": "/jobs/search"
      }
    ],
    "createdAt": "2026-06-01T21:00:00"
  }
}
```

FE hien thi loading trong luc cho response. Endpoint nay la synchronous, khong
can WebSocket va khong can polling.

## 2. Lay danh sach conversation

```http
GET /api/v1/chat/conversations?page=0&size=20
```

- `page`: zero-based.
- `size`: toi da `50`.
- Sap xep conversation moi hoat dong gan nhat truoc.

Response item:

```json
{
  "id": 15,
  "title": "Tim giup toi job Java backend tai Ha Noi",
  "lastMessagePreview": "Toi tim thay 3 viec lam phu hop.",
  "lastMessageAt": "2026-06-01T21:00:00",
  "createdAt": "2026-06-01T20:59:00"
}
```

## 3. Lay lich su tin nhan

```http
GET /api/v1/chat/conversations/{conversationId}/messages?page=0&size=30
```

- `page`: zero-based.
- `size`: toi da `100`.
- Tin nhan tra ve theo thu tu thoi gian tang dan de render truc tiep.

Response item:

```json
{
  "id": 101,
  "senderType": "ASSISTANT",
  "content": "Toi tim thay 3 viec lam phu hop.",
  "intent": "SEARCH_JOBS",
  "responseMode": "AI",
  "outOfScope": false,
  "sources": [],
  "suggestedActions": [],
  "createdAt": "2026-06-01T21:00:00"
}
```

## 4. Xoa conversation

```http
DELETE /api/v1/chat/conversations/{conversationId}
```

Backend soft-delete conversation. Sau khi xoa, FE bo conversation khoi danh
sach hien tai.

## Intent

```text
SEARCH_JOBS
RECOMMEND_JOBS
JOB_DETAIL
SAVED_JOBS
APPLICATION_STATUS
MY_RESUMES
COMPANY_INFO
PLATFORM_HELP
OUT_OF_SCOPE
```

FE khong can tu phan loai intent. Backend tu xu ly.

## responseMode

| Gia tri | Y nghia |
|---|---|
| `AI` | Gemini da dien dat cau tra loi tu context WorkHub |
| `FALLBACK` | AI tam thoi loi, backend tra noi dung an toan co dinh |
| `REFUSAL` | Cau hoi ngoai pham vi hoac co dau hieu khong an toan |

FE van hien thi `answer` binh thuong voi ca ba truong hop.

## Source type

```text
JOB
COMPANY
APPLICATION
RESUME
HELP
```

Khi co `url`, FE co the render source card click duoc. FE nen map URL BE tra ve
vao route tuong ung cua ung dung neu route frontend thuc te khac.

## Suggested action type

```text
VIEW_JOB
VIEW_COMPANY
VIEW_APPLICATIONS
VIEW_SAVED_JOBS
VIEW_RESUMES
VIEW_RECOMMENDATIONS
OPEN_JOB_SEARCH
```

Day chi la link dieu huong. Khong co mutation action trong MVP.

## Xu ly loi

| HTTP status | Cach FE xu ly |
|---|---|
| `400` | Hien loi validation, vi du tin nhan rong hoac qua dai |
| `401` | Access token thieu hoac het han; chay flow refresh token/login hien co |
| `403` | User khong phai candidate; an chatbot widget |
| `404` | Conversation khong ton tai hoac khong thuoc user; reload danh sach |
| `429` | Hien thong bao gui qua nhieu tin nhan, cho mot luc roi thu lai |
| `5xx` | Hien thong bao tam thoi khong kha dung, cho phep retry |

Khi Gemini loi nhung backend van co the fallback, API van tra `200` voi
`responseMode=FALLBACK`.

## Goi y UI

- Chi render nut chatbot khi user da dang nhap va co role `CANDIDATE`.
- Widget dat goc duoi ben phai.
- Khi mo widget, load danh sach conversation hoac tao conversation khi gui tin
  dau tien.
- Render source cards ben duoi answer.
- Disable nut gui trong luc request dang xu ly.
- Gioi han FE toi da `1000` ky tu moi tin nhan.

