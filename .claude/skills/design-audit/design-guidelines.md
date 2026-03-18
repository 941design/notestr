# Design Guidelines Reference

Standards for evaluating notestr as a hybrid web + PWA task management app. Compiled from Material Design 3, Apple HIG, WCAG/ARIA APG, Chakra UI, and web.dev PWA guidance.

## 1. Responsive Layout

### Breakpoints (Mobile-First)

| Class | Width | Layout Behavior |
|-------|-------|-----------------|
| Compact | < 600px | Single-column board, sidebar as overlay drawer with hamburger, bottom nav optional |
| Medium | 600-992px | Navigation rail (~56-72px) or toggleable sidebar, board columns with horizontal scroll, min-width per column |
| Expanded | > 992px | Persistent sidebar (240-320px), full board with all columns visible |

### Key Rules
- Content determines breakpoints, not device names
- Max readable line length: 70-80 characters
- Spacing scale: 4px base unit (0.25rem increments)
- Sidebar must never push board off-screen on narrow viewports
- Board columns need `min-w-[240px]` with horizontal scroll fallback, or stack vertically on mobile

## 2. Touch & Interaction Targets

| Guideline | Value |
|-----------|-------|
| Google/Android minimum | 48x48dp |
| Apple/iOS minimum | 44x44pt |
| Universal recommendation | 48x48px minimum |
| Spacing between targets | >= 8px |

### Detection
- Use `@media (any-pointer: coarse)` to detect touch devices
- Increase padding on touch, don't guess from viewport width
- Even if visual element is smaller, clickable area must meet minimum

### Common Violations to Check
- Button `size="xs"` (h-6 = 24px) — always too small
- Button `size="sm"` (h-8 = 32px) — borderline, fails on touch
- List items with `py-1` or `py-1.5` — too tight for finger taps
- Icon-only buttons without sufficient padding

## 3. Color Contrast (WCAG 2.1)

| Level | Normal Text (<24px) | Large Text (>=24px regular, >=18.5px bold) |
|-------|--------------------|--------------------------------------------|
| AA (minimum) | 4.5:1 | 3:1 |
| AAA (enhanced) | 7:1 | 4.5:1 |

### notestr-specific checks
- Light theme: `foreground (#1f2328)` on `background (#ffffff)` — verify ratio
- Dark theme: `foreground (#e6edf3)` on `background (#0d1117)` — verify ratio
- `muted-foreground` on `card` background — often fails AA
- Status badge colors on their background tints (e.g., `warning/15` text on card)
- Primary blue text/buttons on both light and dark backgrounds

### Color Token System
Colors should use semantic tokens (success, warning, destructive) rather than raw values. Check that:
- All status colors have sufficient contrast in both themes
- Disabled states are distinguishable from enabled
- Focus rings are visible against adjacent backgrounds (3:1 minimum)

## 4. ARIA & Accessibility

### Landmarks
- Header: `<header>` or `role="banner"`
- Sidebar: `<nav aria-label="Groups">` or `role="navigation"`
- Main content: `<main>` (already present)
- Board: `role="region" aria-label="Task board"` or `role="grid"`

### Board/Kanban Pattern (ARIA Grid)
- Container: `role="grid"` or `role="region"` with label
- Columns: `role="group"` with `aria-label` (e.g., "Open tasks")
- Column headers: `role="columnheader"` or heading elements
- Cards: `role="gridcell"` or standard interactive elements

### Keyboard Navigation
- Arrow keys between cards/columns
- Enter/Space to interact with a card
- Tab moves between major sections (sidebar, header, board)
- Escape closes modals/dialogs
- Focus must be visible (min 2px outline, 3:1 contrast)

### Required Attributes
- Selected group: `aria-current="page"` or `aria-selected="true"`
- Expandable sections: `aria-expanded` on trigger button
- Status changes: `aria-live="polite"` region for announcements
- Dialogs: `aria-modal="true"`, `aria-labelledby`, focus trap

### Focus Management
- Modal open: focus moves to first focusable element inside
- Modal close: focus returns to trigger element
- Group switch: focus moves to main content heading
- Logical tab order: sidebar -> header -> board

## 5. PWA Patterns

### Safe Areas
- Viewport meta must include `viewport-fit=cover`
- Use `env(safe-area-inset-*)` CSS variables for:
  - Header top padding
  - Sidebar left/right padding
  - Bottom action areas
- Always provide fallback: `env(safe-area-inset-bottom, 0px)`

### Standalone Mode
- `display: standalone` in manifest
- `theme_color` for title bar/status bar
- `background_color` for splash screen
- Dynamic `<title>` updates (appears in task switchers)

### Native Feel
- `user-select: none` on UI chrome (buttons, nav), not on content
- `overscroll-behavior: contain` on scrollable panels (sidebar, board columns)
- System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, sans-serif`
- Respect `prefers-reduced-motion` for animations
- `display-mode` media query for PWA-specific styles

### Offline & Loading
- App shell pattern for instant load
- Skeleton loading states (not "Loading..." text)
- Clear offline indicator
- IndexedDB for local data persistence

## 6. Typography

| Element | Size | Weight |
|---------|------|--------|
| Body | 1rem (16px) | 400 |
| Small/metadata | 0.875rem (14px) | 400 |
| Card titles | 0.875-1rem | 600 |
| Section headings | 1.25rem (20px) | 600 |
| Page headings | 1.5-2rem | 700 |

### Rules
- Never go below 12px for any visible text
- Line height: 1.4-1.6 for body, 1.2-1.3 for headings
- Use CSS `line-clamp` for text truncation, not JS `slice()`
- Monospace font for pubkeys, hashes, technical identifiers

## 7. Dark Mode

### Contrast Checks
- Card surfaces must be visually distinct from page background (>5% luminance difference)
- Border colors must be visible against both card and background
- Primary accent (blue) must pass AA on dark card background
- Status colors (success green, warning amber) may need different values in dark mode

### Common Dark Mode Failures
- Cards blending into background (insufficient surface differentiation)
- Borders disappearing
- Blue primary on dark background — check it's bright enough
- Form inputs indistinguishable from surrounding card

## 8. Component-Specific Checks

### Sidebar
- Width: 240-320px (expanded), 56-72px (rail), overlay (mobile)
- Group items: min 44px tap height, clear active state
- Scrollable with `overflow-y: auto` and `overscroll-behavior: contain`
- Create/invite forms: inputs and buttons meet touch target sizes

### Board Columns
- Min width per column: 240px
- Column headers: sticky, with task count badge
- Empty state: centered italic text, no "No tasks" that looks like an error
- Card spacing: 8px gap minimum

### Task Cards
- Title: font-semibold, truncate with ellipsis for long titles
- Description: line-clamp-2, not JS truncation
- Action buttons: minimum 32px height (44px preferred on touch)
- Status badge: readable at small sizes, proper contrast

### Modals/Dialogs
- Max width: 500-600px, responsive on mobile (full-width with padding)
- Focus trap active
- Escape to close
- Proper heading hierarchy
- Submit on Enter for single-field forms

### Auth Screen
- Centered card layout, responsive width (max-w-md)
- Clear hierarchy: heading > method cards > actions
- Loading/connecting state: meaningful, not just a spinner
- Error states: visible, associated with the trigger action
