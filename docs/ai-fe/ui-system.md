# UI System

## Current UI Foundation

Shared UI lives in `src/components/ui`:

- `Button`
- `Input`
- `Select`
- `ErrorMessage`
- `LoadingState`
- `Pagination`
- `Table`
- `FormActions`
- `ToastProvider`

The app also uses `react-icons` and CSS Modules.

## Philosophy

- Use shared UI primitives for repeated generic controls.
- Keep feature-specific UI inside the feature/page folder.
- Do not create another button/input/table/toast implementation.
- Build abstractions only after they reduce duplication or enforce consistency.

## Layout System

- `MainLayout`: authenticated shell with sidebar.
- `CandidateLayout`: placeholder.
- `RecruiterLayout`: placeholder.
- `AdminLayout`: placeholder.

Add `PublicLayout` only when login/register/public pages need shared chrome.

## Modal Strategy

Profile follow list still uses local modal markup. Add a generic `Modal` before building more modal flows.

## Form Strategy

Current forms are controlled inputs. Larger forms should use shared inputs, visible error messages, and a validation helper/library chosen intentionally.

## Tables And Pagination

`Table` and `Pagination` exist as foundation primitives. Use them for jobs, applicants, notifications, and admin lists unless a module needs a more specialized table.

