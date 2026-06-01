# UI Rules for WorkHub Frontend

## Goal

Build a modern, realistic, professional recruitment platform UI similar to ITviec.

The UI must:
- feel like a real production HR-tech platform
- have strong UX logic
- have clean information hierarchy
- be compact and readable
- prioritize usability over flashy visuals
- look modern but practical
- feel similar to ITviec, LinkedIn Jobs, TopCV, Indeed

This is NOT a startup landing page.
This is NOT a Dribbble showcase.
This is NOT a crypto dashboard.

The application is a serious recruitment platform.

---

# Core UI Philosophy

- Functional over decorative
- Dense but readable
- Compact but not cramped
- Modern but professional
- Realistic enterprise UI
- Clear hierarchy
- Fast scanning experience
- Recruiter-friendly
- Candidate-friendly

---

# Mandatory Design Rules

## DO

- Use clean white/light gray backgrounds
- Use subtle borders
- Use soft shadows only
- Use consistent spacing
- Use clear typography hierarchy
- Make layouts practical and production-ready
- Keep job cards compact and scannable
- Highlight salary properly
- Make CTA buttons obvious
- Use sticky search/filter when useful
- Use responsive layout
- Use realistic spacing
- Prioritize UX clarity

---

## DO NOT

- Do NOT create generic SaaS dashboard UI
- Do NOT create oversized hero sections
- Do NOT use giant padding everywhere
- Do NOT use colorful gradients
- Do NOT use random animations
- Do NOT use glassmorphism
- Do NOT create Dribbble-style fake UI
- Do NOT make cards excessively large
- Do NOT use huge typography
- Do NOT create unrealistic spacing
- Do NOT generate startup marketing layouts
- Do NOT over-design the UI

---

# Layout Rules

## Global Layout

- Desktop-first
- Max container width: 1200px
- Use centered layout
- Use realistic production spacing
- Use 8px spacing system

Example:
- gap-2
- gap-4
- gap-6
- p-4
- p-6

Avoid:
- excessive whitespace
- giant empty areas

---

## Job Listing Page

Must follow ITviec-like structure:

### Left Side
- Filter sidebar
- Sticky filters
- Compact filter groups

### Right Side
- Job search result list
- Compact job cards
- Pagination or infinite scroll

---

## Job Detail Page

Must include:

1. Job header
2. Salary highlight
3. Company information
4. Skills/tags
5. Job description
6. Requirements
7. Benefits
8. Apply CTA
9. Similar jobs section

Important:
- Keep reading flow smooth
- Avoid giant text blocks
- Use proper section spacing

---

# Typography Rules

## Heading Hierarchy

### H1
- text-3xl
- font-bold

### H2
- text-2xl
- font-semibold

### H3
- text-lg
- font-semibold

### Body
- text-sm
- text-gray-700

### Secondary Text
- text-xs
- text-gray-500

Avoid:
- giant typography
- inconsistent font sizes

---

# Color Rules

## Main Color
Use ITviec-like orange/red tone.

Example:
- orange-500
- orange-600
- red-orange tone

---

## Background

- white
- gray-50
- gray-100

---

## Border

- gray-200
- subtle borders only

---

## Text

- gray-900
- gray-700
- gray-500

Avoid:
- neon colors
- strong gradients
- random color palettes

---

# Component Rules

## Cards

- rounded-xl
- border
- bg-white
- shadow-sm

Avoid:
- huge shadows
- floating glass effect

---

## Buttons

### Primary Button
- orange/red tone
- clear CTA
- rounded-lg
- height around 40px

### Secondary Button
- subtle border
- white background

---

## Inputs

- clean
- readable
- rounded-lg
- realistic height
- easy to scan

---

## Job Cards

Job cards must:
- be compact
- have clear hierarchy
- emphasize salary
- show tags cleanly
- show company clearly
- have hover state
- not waste vertical space

---

# UX Rules

## Search Experience

- Search bar must be obvious
- Filters must be easy to use
- Results must be scannable
- Important info visible immediately

---

## Forms

Forms must:
- be simple
- easy to scan
- have proper validation
- show clear error messages
- avoid unnecessary fields

---

## Loading States

Always implement:
- loading state
- empty state
- error state
- skeleton loading when reasonable

---

# Frontend Architecture Rules

## Tech Stack

- React + Vite
- JavaScript (JSX)
- CSS Modules
- React Router DOM
- Axios
- React Icons

---

# Code Structure Rules

Separate code by:

- pages
- features
- components
- services
- stores
- layouts
- routes

Avoid:
- massive components
- API calls directly inside JSX
- duplicated UI logic

---

# API Integration Rules

- Use centralized Axios instance
- Use interceptors for JWT
- Handle refresh token properly
- Handle loading/error correctly

---

# Auth Pages Implementation

All auth pages follow ITviec-style professional design:

## Color Palette

- Primary: `#ed1b2f` (WorkHub red)
- Background: `#f5f5f5` (light gray)
- Panel: `white` with subtle border `#dee2e6`
- Text: `#212529` (dark), `#6c757d` (secondary)
- Border: `#ced4da`
- Focus: `#ed1b2f` with 10% opacity shadow

## Layout Patterns

### Two-Column Auth Layout (Login/Register)
- Left: Branding section with logo, tagline, value proposition, feature list
- Right: Form panel with white background
- Max width: 1000px
- Gap: 48px
- Mobile: Single column, hide branding

### Single-Column Auth Layout (Password Reset Flow)
- Centered panel
- Max width: 440px
- Step indicators for multi-step flows
- Clean, focused experience

## Component Specifications

### Form Inputs
- Height: 44px
- Border: 1px solid #ced4da
- Border radius: 6px
- Padding: 10px 14px
- Font size: 15px
- Focus: red border with shadow

### Primary Buttons
- Height: 48px
- Background: #ed1b2f
- Color: white
- Border radius: 6px
- Font size: 16px
- Font weight: 600
- Hover: #d91828

### Secondary Buttons
- Height: 48px
- Background: white
- Border: 1px solid #ced4da
- Color: #212529
- Hover: #f8f9fa background

### Social Login Buttons
- Same as secondary buttons
- Include brand icons (Google, Facebook)
- Centered icon + text layout

## Spacing System

- Panel padding: 40px (32px mobile)
- Form gap: 20px
- Field gap: 8px
- Section margin: 24px-32px
- Header margin bottom: 32px

## Typography

- Page title (h1): 28px, bold, #212529
- Subtitle: 15px, #6c757d
- Logo: 32px, bold, #ed1b2f
- Tagline: 24px, semibold, #212529
- Body: 15-16px, #495057
- Labels: 14px, semibold, #212529

---

# Final Important Rule

Every UI must feel:

- realistic
- modern
- production-ready
- recruiter-oriented
- candidate-friendly
- similar to ITviec structure and UX

The UI should look like a real hiring platform used by thousands of users daily.