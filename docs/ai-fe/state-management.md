# State Management

## Current State

- Local UI state uses `useState`.
- Auth state uses React Context:
  - `src/stores/authStore.jsx`
  - `src/stores/useAuth.js`
  - `src/stores/authContext.js`
- Server state is fetched directly through service functions.
- Zustand, Redux, and React Query are not installed.

## Global State Rules

Use global state for:

- Auth token/session.
- Current decoded user.
- Roles.
- App-wide toast notifications.

Keep local:

- Form fields.
- Modal open state.
- Debounced search input.
- One-page loading flags.

## Caching Strategy

No server-state cache exists yet. Add React Query before building job search, recommendation feeds, notification lists, or admin tables.

## Future Upgrade

React Context is enough for the current app. Consider Zustand only if cross-screen app state grows. Do not add Redux unless the project needs strict event/history tooling.

