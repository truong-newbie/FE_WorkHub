# Page Implementation Prompt

Use this when asking AI to add a new page.

```md
Add a new page to the React + Vite frontend.

Before coding:
1. Read docs/ai-fe/routing.md, ui-system.md, styling.md, and the relevant module doc.
2. Search for existing pages with similar layout or behavior.
3. Confirm whether the route is public, candidate, recruiter, or admin.
4. List files to create/modify and explain the page flow.

Page details:
- Page name:
- Route:
- Role access:
- Layout:
- API data needed:
- Empty/loading/error states:
- Navigation after main actions:

Rules:
- Reuse existing layout and UI conventions.
- Add route protection if needed.
- Keep page orchestration in the page and reusable UI in components.
- Do not add global state unless the page needs cross-screen state.
- Do not modify unrelated routes.

After coding:
- Run lint/build if available.
- Update docs/ai-fe/routing.md and module docs if routes or flows changed.
```

