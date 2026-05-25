# Feature Implementation Prompt

Use this when asking AI to implement a new frontend feature.

```md
You are working in this React + Vite frontend.

Before coding:
1. Read docs/ai-fe/architecture.md, conventions.md, routing.md, api-client.md, state-management.md, ui-system.md, styling.md, and the relevant docs/ai-fe/modules/<module>.md.
2. Search existing files first. Do not duplicate components, API calls, hooks, or styles.
3. Identify the current route, component, API, and state patterns.
4. List files you will create or modify.
5. Explain the user flow and data flow before writing code.

Feature to implement:
- Module:
- User role:
- Route(s):
- API endpoint(s):
- UI behavior:
- Loading/error/empty states:

Implementation rules:
- Prefer existing project patterns.
- Keep API logic out of components when adding new API surface.
- Do not refactor unrelated files.
- Keep components small and focused.
- Update docs/ai-fe if architecture or module behavior changes.

After coding:
- Run lint/build if available.
- Summarize changed files and verification.
```

