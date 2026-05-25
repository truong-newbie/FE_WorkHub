# Bugfix Prompt

Use this when asking AI to debug without broad refactoring.

```md
Fix a bug in this React + Vite frontend.

Before coding:
1. Reproduce or inspect the bug path.
2. Read the relevant docs/ai-fe files and module doc.
3. Search for related code paths.
4. Identify the smallest safe fix.
5. List files to modify before editing.

Bug:
- Current behavior:
- Expected behavior:
- Route/page:
- User role:
- Relevant API call:
- Error message/log:

Rules:
- Do not refactor unrelated code.
- Do not rename files unless required.
- Preserve existing user behavior outside the bug.
- Add or update loading/error handling only where relevant.
- Update docs only if the bug reveals a changed convention or architecture rule.

After coding:
- Explain root cause.
- Summarize fix.
- Run lint/build or explain why not.
```

