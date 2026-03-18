---
name: design-audit
description: Audit the UI/UX design of the app against web/PWA best practices, accessibility guidelines, and responsive design standards. Use when the user asks to review, evaluate, or improve the design, layout, accessibility, or responsiveness of the application.
argument-hint: "[component-or-area]"
---

# Design Audit

Perform a critical design audit of the notestr app (or a specific component/area if provided via `$ARGUMENTS`). Evaluate against the standards in [design-guidelines.md](design-guidelines.md).

## Process

1. **Read the code** — Read all relevant component files. Understand the layout structure, Tailwind classes, and component hierarchy before making judgments.

2. **Visual inspection** — Use the `playwright-browser` agent to examine the app at multiple viewports:
   - Desktop: 1440x900
   - Tablet: 768x1024
   - Mobile: 375x812
   - Small mobile: 320x568
   - Also test dark mode (add `dark` class to `<html>`)
   - Take screenshots at each viewport for evidence

3. **Evaluate against guidelines** — Score each area using the criteria in [design-guidelines.md](design-guidelines.md):
   - Responsive layout (breakpoints, sidebar behavior, board columns)
   - Touch targets (minimum 44-48px, 8px spacing)
   - Color contrast (WCAG AA: 4.5:1 normal text, 3:1 large text)
   - ARIA/accessibility (landmarks, roles, keyboard navigation, focus management)
   - PWA patterns (safe areas, overscroll, standalone mode)
   - Typography and spacing consistency
   - Dark mode quality

4. **Produce a structured report** — Output findings as:

   ### What's Working
   List things that meet or exceed guidelines.

   ### Critical Issues (P0)
   Violations that make the app unusable for a class of users or devices.

   ### Important Issues (P1)
   Violations of accessibility standards or significant UX problems.

   ### Moderate Issues (P2)
   Polish items that affect perceived quality.

   ### Minor Issues (P3)
   Nitpicks and nice-to-haves.

   ### Priority Table
   Summarize all issues with severity, effort estimate, and specific file:line references.

5. **Be critical** — This audit should find real problems. Don't praise things that merely work as expected. Focus on what fails, what's missing, and what doesn't meet the standards.

## Scope

If `$ARGUMENTS` specifies a component or area (e.g., "sidebar", "auth screen", "task cards"), focus the audit on that area only. Otherwise, audit the entire application.
