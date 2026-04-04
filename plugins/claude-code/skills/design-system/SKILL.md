---
name: design-system
description: Explains the Aurora Fluid design system — OKLCH colors, physics animations, motion levels, weight tiers, CSS architecture, and theming. Use when the user asks about design tokens, colors, animations, theming, or how the design system works.
user-invocable: true
---

# Aurora Fluid Design System

@annondeveloper/ui-kit uses the Aurora Fluid design identity. Here are the key principles:

## OKLCH Color System

All colors use OKLCH — perceptually uniform, with relative color syntax for theming:

```css
/* Base color */
--brand: oklch(65% 0.2 270);

/* Derived with relative syntax */
--brand-light: oklch(from var(--brand) calc(l + 0.15) c h);
--brand-dark: oklch(from var(--brand) calc(l - 0.15) c h);
--brand-subtle: oklch(from var(--brand) l c h / 0.1);
```

**Never use hex or rgb.** Always OKLCH.

## Motion Levels (0-3)

| Level | Name | Behavior |
|-------|------|----------|
| 0 | None | Instant transitions, no animation |
| 1 | Subtle | CSS transitions only, no springs |
| 2 | Expressive | Conservative spring (no overshoot) |
| 3 | Cinematic | Full physics — spring, bounce, particles |

Cascade: OS `prefers-reduced-motion` > component `motion` prop > CSS `--motion` > `UIProvider` > default (3)

## Weight Tiers

- **Lite** (~0.3-1.2 KB/component) — CSS-only, native HTML elements, no JS animation
- **Standard** (~2-5 KB/component) — Full features, `useStyles()` CSS injection, motion engine
- **Premium** (~3-6 KB/component) — Aurora glow, spring entrance, shimmer, particles

## CSS Architecture

- `@layer components` for all component styles
- `@scope (.ui-component)` for isolation
- Class prefix: `ui-` (e.g., `.ui-button`, `.ui-card`)
- Logical properties only (`margin-inline-start`, not `margin-left`)
- `text-wrap: balance` for headings, `text-wrap: pretty` for body
- Fluid sizing: `clamp()` values, `rem`/`em` units (never `px` for font-size)

## Theme Generation

```tsx
import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'

// Generate from any brand color
const theme = generateTheme('#6366f1', 'dark')
applyTheme(theme) // Sets CSS custom properties on :root
```

## Accessibility Requirements

- WCAG AA contrast (4.5:1 text, 3:1 UI)
- 44px minimum touch targets
- WAI-ARIA patterns for all composite widgets
- `@media (forced-colors: active)` support
- `prefers-reduced-motion` always respected
