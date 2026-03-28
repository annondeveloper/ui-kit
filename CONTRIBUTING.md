# Contributing to @annondeveloper/ui-kit

Thank you for your interest in contributing! This guide covers setup, development workflow, and guidelines for submitting pull requests.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Setup

```bash
git clone https://github.com/annondeveloper/ui-kit.git
cd ui-kit
npm install
```

### Development Commands

```bash
npm run build          # Build library (tsup ESM + CSS)
npm run typecheck      # TypeScript strict check
npm test               # Run Vitest + jest-axe a11y tests
npm run test:a11y      # Accessibility audit
npm run test:bundle-size  # Enforce per-component size budgets
```

### Running the Demo Site

```bash
cd demo
npm install
npm run dev            # Starts Vite dev server at localhost:5173
```

## Development Workflow

1. **Fork and branch** -- Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Write tests first** -- We follow TDD. Write failing tests, verify they fail, then implement:
   ```bash
   npm test -- --watch src/components/my-component
   ```

3. **Implement the component** -- Follow the architecture patterns below.

4. **Verify everything passes**:
   ```bash
   npm run build && npm run typecheck && npm test
   ```

5. **Create a demo page** -- Add a page in `demo/src/pages/components/` demonstrating all variants.

6. **Submit a PR** -- Fill in the PR template and request review.

## Component Structure

Every component follows this structure:

```
src/components/my-component/
  index.ts              # Public exports
  my-component.tsx      # Main component implementation
  my-component.css.ts   # Styles using css`` tag
  my-component.test.tsx # Vitest + jest-axe tests
```

### Style Conventions

- Use `css` tag from `@ui/core/styles/css-tag` with `useStyles(name, styles)`
- All styles wrapped in `@layer components`
- Class prefix: `ui-` (e.g., `.ui-button`, `.ui-card`)
- Colors: OKLCH only via CSS custom properties (never hardcoded)
- Spacing: `clamp()` fluid values, `rem`/`em` units
- Logical properties only (`margin-inline-start`, not `margin-left`)

### Weight Tiers

Each component exists in 3 tiers:

| Tier | Location | Description |
|------|----------|-------------|
| Lite | `src/lite/` | Minimal wrapper, no motion, ~20-30 lines |
| Standard | `src/components/` or `src/domain/` | Full features |
| Premium | `src/premium/` | Aurora glow, spring animations, shimmer |

### Accessibility Requirements

- Use native HTML elements first (`<dialog>`, `popover`, `<details>`)
- Implement WAI-ARIA APG keyboard patterns for composite widgets
- Minimum 44px touch targets
- WCAG AA contrast (4.5:1 text, 3:1 UI)
- Support `@media (forced-colors: active)`
- Test with screen readers

### Performance Budgets

- Core primitive: < 2KB JS gzip
- Medium component: < 5KB JS gzip
- Complex domain: < 8KB JS gzip

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for all new functionality
- Update the demo site with new component pages
- Ensure `npm run build && npm run typecheck && npm test` all pass
- Fill in the PR template completely
- Reference any related issues

## Code of Conduct

Be respectful, constructive, and collaborative. We are building something ambitious together.

## Questions?

Open an issue or start a discussion on GitHub. We are happy to help!
