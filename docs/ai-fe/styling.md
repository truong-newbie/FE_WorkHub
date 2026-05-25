# Styling

## Current Styling

- CSS Modules are the active styling solution.
- Tailwind CSS `^4.1.4`, PostCSS, and Autoprefixer are installed, but no Tailwind config or global Tailwind entry is visible in the current structure.
- Static images live in `public/`.

## Strategy

Continue with CSS Modules until the team intentionally migrates. Do not mix Tailwind utilities into isolated files unless Tailwind is fully configured and adopted.

## CSS Modules

- Import styles as `styles` from `*.module.css`.
- Keep class names descriptive.
- Keep layout CSS with page/layout components.
- Keep reusable component CSS next to the component.

## Spacing

Use a consistent spacing scale:

- 4px for tiny gaps.
- 8px for compact controls.
- 16px for common spacing.
- 24px and 32px for page sections.

## Responsive Breakpoints

Current sidebar switches behavior at `1250px`. Keep this value documented until a design system defines breakpoints.

Recommended future breakpoints:

- Mobile: `< 768px`
- Tablet: `768px - 1023px`
- Desktop: `>= 1024px`
- Wide: `>= 1280px`

## Dark Mode

No dark mode exists. Do not add dark-mode code casually. If required, introduce CSS variables first.

## Typography

No typography system exists. Before scaling, define:

- base font family
- heading sizes
- body text sizes
- line heights
- form label styles

## Utility Conventions

Avoid global utility classes until there is a shared style layer. Prefer component-local CSS Modules for now.

