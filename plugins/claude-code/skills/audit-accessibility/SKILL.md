---
name: audit-accessibility
description: Audit React components for accessibility compliance with UI Kit conventions. Use when the user asks to "check accessibility", "audit a11y", "review for screen readers", or "test keyboard navigation". Checks ARIA, contrast, touch targets, motion, and keyboard patterns.
---

# UI Kit Accessibility Audit

Audit the following code for accessibility: $ARGUMENTS

## Checklist

### Semantic HTML
- [ ] Uses native HTML elements where possible (`<button>`, `<dialog>`, `<details>`, `<select>`)
- [ ] Headings follow logical hierarchy (h1 > h2 > h3)
- [ ] Lists use `<ul>`/`<ol>` for groups of items
- [ ] Forms use `<label>` with `htmlFor` association

### ARIA
- [ ] Interactive elements have accessible names (`aria-label`, `aria-labelledby`, visible text)
- [ ] Dynamic content uses `aria-live` regions
- [ ] Custom widgets follow WAI-ARIA APG keyboard patterns
- [ ] `aria-expanded`, `aria-selected`, `aria-checked` used correctly
- [ ] Decorative elements have `aria-hidden="true"`

### Keyboard
- [ ] All interactive elements are focusable
- [ ] Tab order follows visual order
- [ ] Escape closes overlays (Dialog, Drawer, Popover)
- [ ] Arrow keys navigate within composite widgets (Tabs, Select, RadioGroup)
- [ ] Enter/Space activates buttons and toggles

### Visual
- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] UI element contrast ≥ 3:1
- [ ] Focus indicators visible (2px solid outline, offset)
- [ ] No information conveyed by color alone
- [ ] `@media (forced-colors: active)` support

### Motion
- [ ] `prefers-reduced-motion` respected
- [ ] Motion level cascade: OS > prop > CSS > provider > default
- [ ] No auto-playing animations without user control
- [ ] `motion={0}` disables all animation

### Touch
- [ ] Touch targets ≥ 44px (`@media (pointer: coarse)`)
- [ ] No hover-only interactions
- [ ] `-webkit-tap-highlight-color: transparent` set

Report findings with severity (Critical/Warning/Info) and specific fix recommendations using UI Kit components and conventions.
