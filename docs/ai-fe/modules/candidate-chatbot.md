# Candidate Chatbot

## Scope

The candidate chatbot is a fixed widget rendered from `AppHeader` only when the current user has the `CANDIDATE` role. It is read-only: suggested actions navigate to existing frontend pages and never mutate candidate data.

## API

- `POST /api/v1/chat/messages`
- `GET /api/v1/chat/conversations?page=0&size=20`
- `GET /api/v1/chat/conversations/{conversationId}/messages?page=0&size=100`
- `DELETE /api/v1/chat/conversations/{conversationId}`

The send endpoint is synchronous. The message composer enforces the backend limit of 1000 characters.

## Frontend Files

- `src/features/chatbot/services/chatbotService.js`
- `src/features/chatbot/chatbotRoutes.js`
- `src/features/chatbot/components/CandidateChatbotWidget.jsx`
- `src/features/chatbot/components/ChatMessage.jsx`
- `src/features/chatbot/components/CandidateChatbot.module.css`

## Route Mapping

Backend chatbot links are mapped to existing frontend routes before navigation:

| Backend URL | Frontend route |
| --- | --- |
| `/jobs/search` | `/jobs` |
| `/jobs/favorites` | `/saved-jobs` |
| `/applications/me` | `/applications` |
| `/resumes` | `/candidate/resumes` |
| `/resumes/{id}` | `/candidate/resumes` |

## Error Handling

- `401`: handled by the shared authenticated API flow.
- `403`: hides the chatbot widget.
- `404`: clears stale conversation state and refreshes the conversation list.
- `429`: shows a rate-limit message.
- `5xx`: shows a temporary availability message.
- `FALLBACK` and `REFUSAL` responses are successful messages and remain visible with a response-mode badge.
