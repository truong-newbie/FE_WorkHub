# Frontend Conventions

## Naming

- Components: `PascalCase`, for example `ProfilePage`, `JobCard`.
- Hooks: `useCamelCase`, for example `useCurrentUser`.
- API functions: verb + resource, for example `getUserById`, `updateProfile`.
- CSS classes in CSS Modules: current code uses `snake_case`; keep it consistent until a wider style migration is planned.
- Files: prefer `kebab-case` or `camelCase` consistently for new files. Avoid adding more mixed names like `Edit_Profile`.

## Components

- Keep route-level pages in `pages/` or `features/<module>/pages/`.
- Keep generic reusable UI in `components/ui/`.
- Keep feature-specific components inside the feature folder.
- Do not duplicate existing components. Search before creating a file.
- Avoid giant components. If a component passes about 250 lines or mixes API calls, modals, forms, and list rendering, split it.

## API Logic

- Do not add new direct `fetch("http://localhost:8080/...")` calls.
- Prefer a shared API client and feature API modules.
- Keep token/header logic out of components.
- Normalize backend response shapes at the API boundary where possible.

## Loading And Error States

- Every async page should handle loading, error, empty, and success states.
- User-facing failures should show a visible message or toast, not only `console.error`.
- Preserve inline form errors near the field when validation is field-specific.

## Toast And Error Handling

- Use a single toast provider/library once introduced.
- API errors should be normalized to `{ message, status, details }`.
- Unauthorized errors should trigger logout/session cleanup through auth infrastructure.

## Responsive UI

- Keep responsive behavior in CSS Modules or the chosen styling system.
- Use stable layout constraints for nav/sidebar/page content.
- Do not hard-code backend or viewport assumptions inside reusable UI.

## File Size

- Pages: target below 250-300 lines.
- Components: target below 150-200 lines.
- API files: group by feature, not by every endpoint.
- Split only when it reduces real complexity.

## No Duplicate Rules

- No duplicate API calls across pages.
- No duplicate token parsing helpers.
- No duplicate layout/sidebar implementations.
- No duplicate form field components once shared form UI exists.

