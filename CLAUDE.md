# UI Kit — Claude Code Project Guide

## Project Overview

`@annondeveloper/ui-kit` — A zero-dependency React component library with 62 components, physics-based animations, OKLCH color system, and Aurora Fluid design identity.

**Repository:** https://github.com/annondeveloper/ui-kit
**Current stable:** v0.4.1 on `main` branch
**Next-gen rebuild:** v2.0.0 on `v2` branch

## Development Philosophy

**Quality over speed. Always.** Take as many turns, tokens, and time as needed to implement things properly. Never rush. This is a revolutionary library — every component must be built with care:

- Full TDD: write failing tests first, verify they fail, then implement
- Run spec compliance review AND code quality review after each task
- One task at a time — don't combine phases to save time
- Verify thoroughly: tests, build, typecheck, visual inspection
- Fix issues before moving on — never leave known problems for later
- Write comprehensive tests including edge cases, not just happy-path
- Build demo pages and Storybook stories alongside components, not deferred
- Visually inspect every component in browser after implementation

## Key Architecture Decisions (v2)

- **Zero external dependencies** — only peer deps are `react` ^19 and `react-dom` ^19
- **Embedded scoped CSS** — `useStyles()` hook auto-injects CSS via `adoptedStyleSheets`
- **Dual-mode CSS** — auto-inject for React users, standalone `.css` files for others
- **OKLCH color system** — perceptually uniform, with relative color syntax for theme generation
- **Aurora Fluid design** — deep atmospheric surfaces, ambient glows, ethereal color washes
- **Physics-based animations** — real spring solver (differential equation), not approximations
- **Motion intensity** — `--motion` CSS property (0=none, 1=subtle, 2=expressive, 3=cinematic)
- **Progressive enhancement** — modern CSS features with `@supports` fallbacks
- **Built-in form engine** — `createForm()`, `useForm()`, validators, zero external deps
- **Container-first responsive** — components adapt to container, not viewport

## Branch Strategy

- `main` — current stable v0.4.x (do not modify during v2 development)
- `v2` — next-gen rebuild branch (all v2 work happens here)

## Build & Test

```bash
npm run build          # tsup ESM + CSS extraction + CLI
npm run typecheck      # TypeScript strict check
npm test               # Vitest + jest-axe a11y tests
npm run test:a11y      # Accessibility audit
npm run test:bundle-size  # Enforce size budgets per component
```

## Publishing

Automated via GitHub Actions on `v*` tag push:
1. `npm version <major|minor|patch>` — bumps package.json + jsr.json + creates git tag
2. `git push && git push --tags` — triggers CI → npm + GitHub Packages + JSR publish

## Component Organization

```
src/core/          # Foundation: styles, motion, tokens, a11y, icons, forms, utils
src/components/    # General-purpose (~25): Button, Card, Dialog, Tabs, etc.
src/domain/        # Specialized (~37): MetricCard, LogViewer, StreamingText, etc.
```

## Style Conventions

- All styles use `@scope`, `@layer components`, CSS nesting
- Class prefix: `ui-` (e.g., `.ui-button`, `.ui-card`)
- Colors: OKLCH only (`oklch(65% 0.2 270)`)
- Spacing/sizing: `clamp()` fluid values, `rem`/`em` units (never `px` for font-size)
- Logical properties only (`margin-inline-start`, not `margin-left`)
- `text-wrap: balance` for headings, `text-wrap: pretty` for body

## Entry Points

- `.` — Main barrel: all components, utils, theme generator, providers
- `./form` — Form engine: `createForm`, `useForm`, validators, `<Form>`, `<FieldArray>`
- `./theme` — Theme utilities: `generateTheme()`, `applyTheme()`, `themeToCSS()`, `validateContrast()`
- `./css/theme.css` — Standalone Aurora Fluid theme CSS
- `./css/all.css` — All component CSS bundled
- `./css/components/*` — Per-component standalone CSS

## Animation Conventions

- Motion level cascade: OS `prefers-reduced-motion` > component prop > CSS `--motion` > UIProvider > default (3)
- CSS fallback for `@container style()`: components also check `[data-motion]` attribute set by UIProvider
- CSS-first: `@starting-style` for entry, `transition-behavior: allow-discrete` for exit, `animation-timeline: view()` for scroll
- JS when needed: WAAPI via internal `animate()` utility, real spring solver for physics
- Spring degradation: level 0=instant, level 1=CSS transitions, level 2=conservative spring (no overshoot), level 3=full physics
- Always respect `prefers-reduced-motion`

## Browser Fallback Strategy

- CSS Anchor Positioning: JS fallback via `useAnchorPosition()` (~0.8KB) using `getBoundingClientRect()`
- `@scope`: BEM-style `.ui-` prefix scoping as baseline (always present)
- `@starting-style`: graceful degradation to instant show/hide
- `@container style()`: `[data-motion]` attribute selector fallback
- `animation-timeline: view()`: `IntersectionObserver` fallback via scroll observer

## CLI Tool

```bash
npx @annondeveloper/ui-kit init          # Copy theme + utils
npx @annondeveloper/ui-kit add <name>    # Copy component source
npx @annondeveloper/ui-kit list          # List components
npx @annondeveloper/ui-kit theme         # Generate theme from brand color
```

## Accessibility Requirements

- Native HTML elements first (`<dialog>`, `popover`, `<details>`)
- WAI-ARIA APG keyboard patterns for all composite widgets
- 44px minimum touch targets
- WCAG AA contrast (4.5:1 text, 3:1 UI)
- `@media (forced-colors: active)` support
- Screen reader tested live regions

## Core Engine Modules

- `core/styles/` — useStyles(), css tag, adoptedStyleSheets, SSR StyleCollector
- `core/motion/` — Spring solver, WAAPI, timeline, stagger, scroll, FLIP, morph, TextSplitter, controller (~3.5KB)
- `core/input/` — Unified pointer, gestures, focus, gamepad, multitouch, haptics (~2.4KB)
- `core/tokens/` — OKLCH theme, generateTheme(), applyTheme(), validateContrast()
- `core/a11y/` — useFocusTrap, useRovingTabindex, useLiveRegion, useStableId
- `core/icons/` — ~50 built-in SVG icons, all overridable
- `core/forms/` — createForm, useForm, validators, Form, FieldArray
- `core/utils/` — cn(), formatting, sanitize, clamp

## Performance Budgets

- Core primitive: < 2KB JS gzip, < 0.5KB CSS gzip
- Medium component: < 5KB JS gzip, < 1.5KB CSS gzip
- Complex domain: < 8KB JS gzip, < 2KB CSS gzip
- Full library: < 85KB JS gzip, < 20KB CSS gzip
- Motion engine: ~3.5KB gzip
- Input engine: ~2.4KB gzip
- Style engine + a11y: ~2.5KB gzip

## Design Spec

Full design document: `docs/superpowers/specs/2026-03-20-ui-kit-v2-design.md`
