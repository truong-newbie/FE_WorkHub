# Component Implementation Prompt

Use this when asking AI to create a React component.

```md
Create a React component for this frontend.

Before coding:
1. Read docs/ai-fe/conventions.md, ui-system.md, and styling.md.
2. Search existing components first.
3. Decide whether this is generic UI or feature-specific UI.
4. List files to create/modify.

Component details:
- Component name:
- Location:
- Props:
- States:
- Events/callbacks:
- Accessibility requirements:
- Responsive behavior:

Rules:
- Use PascalCase for component names.
- Use CSS Modules unless the project has fully adopted another styling system.
- Keep business API calls out of generic components.
- Do not create duplicate button/input/modal/card components.
- Keep text fitting and responsive.

After coding:
- Show example usage.
- Run lint/build if available.
```

