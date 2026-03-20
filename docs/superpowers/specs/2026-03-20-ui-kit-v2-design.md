# UI Kit v2.0 — Zero-Dependency Aurora Fluid Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Branch:** `v2` (separate from `main`)

---

## 1. Vision

Rebuild `@annondeveloper/ui-kit` from scratch as a **zero-external-dependency** React component library with 62 components, a physics-based animation engine, OKLCH color system, and the "Aurora Fluid" design identity. The result should be something that does not exist today — a library that is self-sustaining, cinematic, accessible, and works flawlessly from smartwatches to video walls.

## 2. Decisions

| Decision | Choice |
|---|---|
| Audience | Hybrid — general-purpose core + domain layer (monitoring/AI/real-time) |
| Browser support | Progressive enhancement with `@supports` fallbacks |
| Styling architecture | Dual-mode — embedded scoped CSS (auto-inject) + extracted standalone CSS |
| Animation philosophy | Cinematic with configurable `--motion` intensity (0–3) |
| Animation physics | Real spring solver (differential equation), not curve approximations |
| Icons | Built-in 40-60 SVG icons, all slots overridable by consumers |
| Color system | OKLCH with relative color syntax |
| Design identity | Aurora Fluid — deep atmospheric surfaces, ambient glows, ethereal color washes |
| Component scope | Full parity — all 62 components rebuilt from scratch |
| Form handling | Built-in lightweight form engine (createForm, useForm, validators) |
| Dependencies | Zero external. Only peer deps: `react` ^19, `react-dom` ^19 |

## 3. Foundation Architecture

### 3.1 Package Structure

```
@annondeveloper/ui-kit v2.0.0
├── src/
│   ├── core/
│   │   ├── styles/        # useStyles(), css tag, adoptedStyleSheets, SSR collector
│   │   ├── motion/        # Spring solver, WAAPI wrapper, scroll observer, --motion system
│   │   ├── tokens/        # OKLCH theme tokens, generateTheme(), applyTheme(), validateContrast()
│   │   ├── icons/         # 40-60 built-in SVG icon components
│   │   ├── a11y/          # useFocusTrap, useRovingTabindex, useLiveRegion, useStableId
│   │   ├── forms/         # createForm, useForm, validators, <Form>, <FieldArray>
│   │   └── utils/         # cn(), formatting, sanitize, clamp
│   ├── components/        # General-purpose components (~25)
│   ├── domain/            # Specialized components (~37)
│   ├── index.ts           # Main barrel export
│   └── form.ts            # Form engine barrel export
├── dist/
│   ├── esm/               # Tree-shakeable JS + .d.ts
│   ├── css/
│   │   ├── theme.css      # OKLCH tokens + Aurora Fluid theme
│   │   ├── components/    # Per-component extracted CSS
│   │   └── all.css        # Bundled CSS (single import)
│   └── cli/               # Node.js scaffolding CLI
├── package.json
├── jsr.json
├── tsup.config.ts
└── tsconfig.json
```

### 3.2 Export Map

```json
{
  ".": { "import": { "types": "./dist/esm/index.d.ts", "default": "./dist/esm/index.js" } },
  "./form": { "import": { "types": "./dist/esm/form.d.ts", "default": "./dist/esm/form.js" } },
  "./theme": { "import": { "types": "./dist/esm/theme.d.ts", "default": "./dist/esm/theme.js" } },
  "./css/theme.css": "./dist/css/theme.css",
  "./css/all.css": "./dist/css/all.css",
  "./css/components/*": "./dist/css/components/*"
}
```

### 3.3 Zero-Dependency Contract

- **Peer dependencies:** `react` ^19.0.0, `react-dom` ^19.0.0
- **Production dependencies:** None
- **Replaced externals:**
  - Radix UI (5 packages) → native `<dialog>`, `popover` API, anchor positioning, built-in a11y primitives
  - Framer Motion → CSS `@starting-style`, `linear()` easing, WAAPI, real spring solver, scroll-driven animations
  - sonner → native `popover="manual"` toasts
  - lucide-react → built-in SVG icon components
  - clsx + tailwind-merge → internal `cn()` utility
  - isomorphic-dompurify → built-in sanitizer

## 4. Style Engine

### 4.1 `useStyles()` Hook

Every component uses `useStyles()` which auto-injects scoped CSS on first mount:

1. First mount → creates `CSSStyleSheet`, calls `sheet.replaceSync(css)`, adds to `document.adoptedStyleSheets`
2. Subsequent mounts → reuses existing sheet (reference-counted)
3. Last unmount → optionally removes sheet (configurable)
4. Fallback → `<style>` tag in `<head>` for browsers without `adoptedStyleSheets`
5. SSR → `StyleCollector` gathers CSS during server render for `<head>` injection

### 4.2 Scoping Strategy

- `@scope (.ui-component-name)` for true CSS scoping without Shadow DOM
- `@layer components` wraps all component styles — Tailwind `@layer utilities` overrides naturally
- CSS nesting for maintainability
- Stable class names (`.ui-button`, `.ui-card`) — no hash suffixes, inspectable in DevTools
- `ui-` prefix prevents collisions with consumer classes

### 4.3 Dual-Mode Output

- **React users:** Import component → styles auto-inject → zero config
- **Non-React users:** Import standalone CSS files → use class names directly
- **Tailwind users:** Component styles in `@layer components` → utility overrides work naturally

Build-time CSS extraction script scans `css` tagged templates and writes per-component `.css` files.

## 5. Motion Engine

### 5.1 Three-Tier Motion Intensity

CSS custom property `--motion` (0–3) controls animation level globally:

| Level | Name | What's Active |
|---|---|---|
| 0 | None | Respects `prefers-reduced-motion`. Instant state changes, opacity-only fades |
| 1 | Subtle | Micro-interactions: hover lifts, button presses, focus rings (150-250ms) |
| 2 | Expressive | +Staggered lists, scroll reveals, spring easing, skeleton morphing, counting |
| 3 | Cinematic | +Parallax, cursor-tracking glows, particle celebrations, 3D tilts, page choreography |

`prefers-reduced-motion: reduce` forces `--motion: 0` via media query override.

Low-end device detection: `navigator.hardwareConcurrency < 4` auto-caps to level 1.

### 5.2 Physics-Based Spring Solver

Real differential equation solver (`mx'' + cx' + kx = 0`):

```typescript
spring(element, {
  to: { transform: 'translateY(0)', opacity: 1 },
  stiffness: 120, damping: 14, mass: 1
})

physics(element, {
  type: 'decay',
  velocity: 800,      // px/s from gesture
  deceleration: 0.998
})
```

- Solves per-frame, generates real keyframes, feeds to WAAPI
- Real overshoot and settling — not curve approximations
- Velocity-aware — drag releases transfer real momentum
- Interruptible — grab mid-flight, responds from current position/velocity
- CSS `linear()` curves pre-computed from spring solver for CSS-only contexts

### 5.3 Animation Primitives

1. **CSS-native (zero JS):** `@starting-style` entry/exit, `linear()` easing, `animation-timeline: view()`, View Transitions API
2. **WAAPI wrapper (~1KB):** `animate()` utility for dynamic animations, stagger, cursor-tracking
3. **Scroll observer (~0.5KB):** CSS scroll-driven with `IntersectionObserver` fallback

### 5.4 Consumer API

```tsx
<UIProvider motion={2}>          {/* Global setting */}
<div style={{ '--motion': '1' }}> {/* Section override via CSS */}
<Card motion={3}>                 {/* Per-component override */}
```

## 6. OKLCH Color System & Aurora Fluid Theme

### 6.1 Token Architecture

Minimal semantic tokens using OKLCH color space:

- **Brand:** Derived from single input color via relative color syntax
- **Surfaces:** Deep space with faint color wash (Aurora Fluid signature)
- **Borders:** Barely visible atmospheric borders (white at 4-14% opacity)
- **Text:** Four levels (primary 97%, secondary 70%, tertiary 45%, disabled 30%)
- **Status:** Perceptually balanced — ok (green), warning (amber), critical (red), info (blue)
- **Aurora:** Two ambient glow tokens for the signature atmospheric effect
- **Shadows:** Colored, layered, with glow variant

### 6.2 Light Mode

Carefully tuned warm-light Aurora — not just "inverted." Separate surface, border, shadow, and aurora values.

### 6.3 Theme Generator

```typescript
const theme = generateTheme('#6366f1')  // From single brand hex
applyTheme(theme)                        // Sets CSS custom properties
const css = themeToCSS(theme)            // Static CSS output
validateContrast(theme)                  // WCAG AA compliance check
```

OKLCH math: derive tints/shades by adjusting L, derive glows by adjusting alpha. Contrast validation adjusts lightness automatically if ratio fails.

### 6.4 Aurora Fluid Signature Effects

- Ambient glow on cards via `::before` with radial gradients using aurora tokens
- Glow border on focus/hover via `box-shadow` with brand color
- Optional grain texture for analog depth (motion level 3)
- Wide gamut enhancement: higher chroma on P3 displays via `@media (color-gamut: p3)`

## 7. Accessibility Layer

### 7.1 Native Element Foundation

| Component | Native Foundation | Enhancement |
|---|---|---|
| Dialog/Sheet | `<dialog>` + `showModal()` | Entry/exit animation, nested focus trap, scroll lock |
| Tooltip/Popover | `popover` + anchor positioning | Delay, arrow, touch support |
| Select | `popover` + `role="listbox"` | Typeahead, multi-select, virtual scroll |
| Combobox | `<input>` + `role="combobox"` | Async filtering, highlighting, sections |
| DropdownMenu | `popover` + `role="menu"` | Keyboard nav, submenus, shortcut display |
| Tabs | `role="tablist"` + `role="tab"` | Arrow key roving tabindex, lazy panels |
| Toast | `popover="manual"` + `role="status"` | Queue, stacking, swipe dismiss |
| Accordion | `<details>` + `<summary>` | Smooth height animation, exclusive mode |

### 7.2 Core A11y Primitives (~2KB)

- `useFocusTrap` — for dialogs, sheets, command bar
- `useRovingTabindex` — for tabs, menus, radio groups, toolbars
- `useLiveRegion` — for toasts, search results count, loading states
- `useStableId` — SSR-safe ID generation

### 7.3 Keyboard Patterns

All composite widgets implement WAI-ARIA APG keyboard patterns: arrow navigation, Home/End, Escape, Enter/Space, typeahead character search.

### 7.4 Color Contrast

OKLCH-based contrast checking built into theme generator. Auto-adjusts lightness if contrast ratio fails. All default tokens validated for WCAG AA (4.5:1 text, 3:1 UI).

### 7.5 Touch Targets

All interactive elements enforce 44x44px minimum via CSS `min-width`/`min-height`.

### 7.6 High Contrast & Forced Colors

`@media (forced-colors: active)` fallback ensures components work with system colors. Decorative aurora effects stripped in forced-colors mode.

## 8. Responsive Architecture

### 8.1 Container-First

Components adapt to container, not viewport. All layout components use `container-type: inline-size` with `@container` queries.

### 8.2 Fluid Everything

Typography, spacing, radii, and icons all use `clamp()` for smooth scaling. No fixed breakpoints for sizing.

### 8.3 Screen Class Adaptations

| Screen | Viewport | Behavior |
|---|---|---|
| Watch/Tiny | < 300px | Single column, icon-only, no aurora, motion capped at 1 |
| Phone | 300–599px | Stacked layouts, bottom sheets, 48px touch targets, swipe gestures |
| Foldable | 600–839px | Two-pane via `env(viewport-segment-*)`, fold spanning |
| Tablet | 840–1199px | Side-by-side, hoverable popovers, standard touch targets |
| Laptop | 1200–1799px | Full feature set, hover states, density options |
| Desktop/Ultra | 1800–2999px | Expanded dashboards, larger aurora, increased density |
| Video wall | 3000px+ | Maximum density, scaled-up type, amplified glow effects |

### 8.4 Input Adaptation

`@media (pointer: coarse)` enlarges touch targets, converts popovers to bottom sheets. `@media (hover: none)` prevents sticky hover states.

### 8.5 Density Provider

```tsx
<UIProvider density="compact">       {/* Tight: dashboards */}
<UIProvider density="default">       {/* Balanced */}
<UIProvider density="comfortable">   {/* Spacious: reading */}
<UIProvider density="auto">          {/* Adapts to viewport */}
```

## 9. Real-World Resilience

### 9.1 Network Conditions

- Every data component has built-in `loading`, `error`, `empty`, `offline` states
- Minimum skeleton display time (300ms) prevents flash
- `StreamingText` and `LiveFeed` auto-reconnect with exponential backoff
- Buttons auto-debounce clicks, auto-disable during form submission

### 9.2 Display & Resolution

- All borders minimum `1px` for low DPI
- OKLCH prevents gradient banding + noise texture overlay on large surfaces
- `max-width` constraints prevent ultra-wide stretching
- `100dvh` (dynamic viewport units) for mobile browser chrome handling
- Wide gamut P3 enhancement via `@media (color-gamut: p3)`

### 9.3 Text & Content

- All text containers: `overflow-wrap: anywhere` baseline
- RTL: logical properties throughout (`margin-inline-start`, `padding-block`)
- CJK: `word-break: auto-phrase`, adjusted line-height via `:lang()` selectors
- Headings: `text-wrap: balance`. Body: `text-wrap: pretty`
- Numbers: locale-aware via `Intl.NumberFormat`, auto-compact
- Dates: locale-aware via `Intl.DateTimeFormat`, relative formatting

### 9.4 End User Resilience

- Rage-click protection (debounce + visual feedback)
- Touch scroll passthrough (correct `touch-action` per component)
- Low-end device detection caps motion level
- 200% and 400% zoom tested (all sizing in rem/em)
- `@media print` strips aurora, ensures black-on-white, expands truncated text
- `@media (prefers-reduced-data: reduce)` strips decorative GPU effects

### 9.5 Developer Experience

- 2 peer deps instead of 13
- No CSS setup required — import component, it works
- Discriminated union types for all variants — full autocompletion
- Every visual property is a CSS custom property — override with one line
- Per-component bundle size documented, enforced in CI
- SSR mode with `StyleCollector` for server-rendered CSS
- No version conflicts (no Radix, no Framer Motion)
- Theme changes at runtime via CSS — no rebuild

### 9.6 Error Boundaries

Every domain component wraps with error boundary. Graceful error state with retry button. Consumer can customize via `fallback` and `onError` props.

### 9.7 Performance Budgets (CI-Enforced)

| Category | JS Budget | CSS Budget |
|---|---|---|
| Core primitive (Button, Badge) | < 2KB gzip | < 0.5KB gzip |
| Medium (DataTable, Select) | < 5KB gzip | < 1.5KB gzip |
| Complex domain (LogViewer, HeatmapCalendar) | < 8KB gzip | < 2KB gzip |
| Full library | < 80KB gzip | < 20KB gzip |
| Style engine + motion + a11y | < 4KB gzip | — |

## 10. Form Engine

### 10.1 Core API (~3KB)

```typescript
const form = createForm({
  fields: {
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    password: { initial: '', validate: v.pipe(v.required(), v.minLength(8)) }
  },
  onSubmit: async (values) => { ... },
  validateOn: 'blur',
  revalidateOn: 'change'
})

function LoginPage() {
  const form = useForm(formConfig)
  return (
    <Form form={form}>
      <FormInput name="email" label="Email" />
      <Button type="submit" loading={form.submitting}>Sign In</Button>
    </Form>
  )
}
```

### 10.2 Built-in Validators

`v.required()`, `v.email()`, `v.url()`, `v.minLength()`, `v.maxLength()`, `v.min()`, `v.max()`, `v.pattern()`, `v.match()`, `v.oneOf()`, `v.custom()`, `v.async()` (debounced).

Composable via `v.pipe()`.

### 10.3 Field Arrays

`<FieldArray>` render prop with `fields`, `append`, `remove`, `move` for dynamic forms.

### 10.4 Escape Hatch

Components work as controlled components without the form engine. Compatible with any external form library via standard `value`/`onChange`/`error` props.

## 11. Build System & CI/CD

### 11.1 Build Pipeline

```
src/ → tsup (ESM) → dist/esm/ (JS + .d.ts)
     → CSS extraction → dist/css/ (standalone CSS)
     → tsup (CLI) → dist/cli/ (Node.js)
```

Only 2 externals: `react`, `react-dom`.

### 11.2 CI Workflows

- **ci.yml:** typecheck → build → test → a11y audit → bundle size check → visual regression (Playwright)
- **publish.yml:** Triggered by `v*` tags. Auto-creates GitHub Release. Publishes to npm (with provenance), GitHub Packages, and JSR simultaneously.
- **deploy-demo.yml:** Auto-deploys demo site to GitHub Pages on push to `v2` branch.

### 11.3 Version Sync

`preversion` hook syncs `package.json` version to `jsr.json` automatically. `postversion` pushes with tags.

### 11.4 Release Process

```bash
npm version minor    # Bumps package.json + jsr.json + creates git tag
git push && git push --tags  # Triggers automated publish to all 3 registries
```

## 12. Phased Build Plan

| Phase | Scope | Timeline |
|---|---|---|
| 1. Core Foundation | Style engine, motion engine, tokens, a11y, icons, forms, utils | Week 1-2 |
| 2. Primitives | Button, Badge, Avatar, Card, Skeleton, Progress, Checkbox, Radio, Toggle, Slider, Status components, AnimatedCounter (14) | Week 2-3 |
| 3. Form Components | FormInput, Select, Combobox, ColorInput, FileUpload, InlineEdit, FilterPill (7) | Week 3-4 |
| 4. Overlays | Tooltip, Popover, Dialog, ConfirmDialog, Sheet, DropdownMenu, Toast, CommandBar, NotificationStack (10) | Week 4-5 |
| 5. Layout & Navigation | Tabs, StepWizard, ScrollReveal, InfiniteScroll, ViewTransitionLink, ResponsiveCard (6) | Week 5-6 |
| 6. Data Components | DataTable, SmartTable, TreeView, SortableList, KanbanColumn, TruncatedText, CopyBlock, DiffViewer, EmptyState (9) | Week 6-8 |
| 7. Domain: Monitoring | MetricCard, Sparkline, ThresholdGauge, UtilizationBar, SeverityTimeline, LogViewer, PortStatusGrid, PipelineStage, UptimeTracker, TimeRangeSelector, HeatmapCalendar (11) | Week 8-10 |
| 8. Domain: AI & Real-Time | StreamingText, TypingIndicator, ConfidenceBar, LiveFeed, RealtimeValue (5) | Week 10-11 |
| 9. Integration & Polish | UIProvider, DensityProvider, SSR, CLI v2, Demo Site, Storybook, Docs, Migration Guide | Week 11-12 |

## 13. Browser Support Matrix & Fallback Strategy

### 13.1 Minimum Browser Versions

| Browser | Minimum | Notes |
|---|---|---|
| Chrome/Edge | 118+ | Full feature support |
| Safari | 17.4+ | `@scope` supported, anchor positioning needs fallback |
| Firefox | 128+ | `@scope` supported, anchor positioning needs fallback |

### 13.2 Feature-by-Feature Fallback Matrix

| CSS Feature | Chrome | Firefox | Safari | Fallback Strategy |
|---|---|---|---|---|
| `@scope` | 118+ | 128+ | 17.4+ | `@supports` check → BEM-style `.ui-` prefix scoping (already present as baseline) |
| `@starting-style` | 117+ | 129+ | 17.5+ | `@supports` → instant show (no entry animation), opacity-only fade |
| `transition-behavior: allow-discrete` | 117+ | 129+ | 17.5+ | Elements hide instantly on close instead of animating out |
| CSS Anchor Positioning | 125+ | Not yet | Not yet | **JS fallback required.** Built-in `useAnchorPosition()` hook (~0.8KB) using `getBoundingClientRect()` + `ResizeObserver` + scroll listeners. Components detect support via `CSS.supports('anchor-name', '--a')` and switch strategy |
| `@container style()` | 111+ | Not yet | Not yet | **JS fallback.** Motion level read from CSS custom property via `getComputedStyle()`. Components use `data-motion` attribute set by `UIProvider` as CSS selector fallback: `[data-motion="3"]` |
| `animation-timeline: view()` | 115+ | Not yet | Not yet | `@supports` → `IntersectionObserver` fallback via built-in scroll observer |
| OKLCH + relative color syntax | 111+ | 113+ | 15.4+/17+ | OKLCH colors: 95%+ support, safe as baseline. Relative color syntax (`oklch(from ...)`): Chrome 119+, Safari 18+, Firefox 128+. Fallback: pre-computed static color values in theme CSS |
| `popover` attribute | 114+ | 125+ | 17+ | Broad support. No fallback needed for target browsers |
| CSS Nesting | 120+ | 117+ | 17.2+ | Broad support. No fallback needed |
| `@layer` | 99+ | 97+ | 15.4+ | Broad support. No fallback needed |
| Container Queries (size) | 105+ | 110+ | 16+ | Broad support. No fallback needed |

### 13.3 Fallback Architecture

The `@supports` strategy is layered:

```css
/* Baseline: always works — BEM scoping, standard transitions */
.ui-popover {
  position: fixed;
  /* Position set by JS fallback hook */
  top: var(--popover-y, 50%);
  left: var(--popover-x, 50%);
}

/* Enhancement: anchor positioning when supported */
@supports (anchor-name: --a) {
  .ui-popover {
    position: fixed;
    position-anchor: --trigger;
    inset-area: block-end;
    position-try-fallbacks: flip-block, flip-inline;
  }
}
```

For anchor positioning (the biggest fallback), `useAnchorPosition()` is a ~0.8KB hook that:
1. Checks `CSS.supports('anchor-name', '--a')`
2. If unsupported: uses `getBoundingClientRect()` on trigger, `ResizeObserver` on container, scroll listener for repositioning
3. Sets `--popover-x` / `--popover-y` CSS custom properties
4. Handles flip detection (viewport collision) with the same logic Floating UI uses, but minimal

## 14. SSR Implementation

### 14.1 StyleCollector Architecture

```typescript
import { StyleCollector, renderWithStyles } from '@annondeveloper/ui-kit'

// Option A: Wrapper function
const { html, css } = renderWithStyles(<App />)
// → css is a string of all component CSS used during render
// → Inject as <style id="ui-kit-ssr">{css}</style> in <head>

// Option B: Streaming (for Next.js App Router / Remix)
const collector = new StyleCollector()
// During render, components register their CSS with the collector
// via React context (no adoptedStyleSheets on server)
const stream = renderToReadableStream(<StyleProvider collector={collector}><App /></StyleProvider>)
```

### 14.2 How It Works

1. **Server:** Components detect server environment (`typeof document === 'undefined'`). Instead of `adoptedStyleSheets`, they register their CSS string with `StyleCollector` via context.
2. **StyleCollector** deduplicates by component name (each CSS registered only once).
3. **Output:** Concatenated CSS string injected into `<head>` as a `<style>` tag.
4. **Client hydration:** On hydration, `useStyles()` detects existing `<style id="ui-kit-ssr">` tag. It adopts those styles into `adoptedStyleSheets` and removes the `<style>` tag (swap from blocking to adopted). No FOUC because the SSR `<style>` tag is present before hydration runs.
5. **No FOUC guarantee:** The SSR CSS is in `<head>` before any content renders. The client swap to `adoptedStyleSheets` is invisible because the same CSS is already applied.

### 14.3 Next.js Integration

```tsx
// app/layout.tsx
import { UIProvider } from '@annondeveloper/ui-kit'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  )
}
// Components auto-detect SSR/CSR and use appropriate style injection
```

## 15. Testing Strategy

### 15.1 Test Stack

- **Unit/Component tests:** Vitest + jsdom + @testing-library/react
- **Accessibility tests:** jest-axe for ARIA violations, custom keyboard interaction tests
- **Visual regression:** Playwright + screenshot comparison against baselines
- **Bundle size:** Custom script checking gzip sizes against budgets per component
- **Type tests:** `tsd` or `expect-type` for verifying public API types

### 15.2 Coverage Requirements

| Category | Target |
|---|---|
| Core foundation (style engine, motion, a11y, forms) | 95%+ line coverage |
| Components (render, props, variants) | 90%+ |
| Keyboard interactions (composite widgets) | 100% of WAI-ARIA APG patterns |
| Accessibility (jest-axe) | Every component, zero violations |
| Visual regression | Every component × {dark, light} × {default, compact} density |

### 15.3 Test Pattern Per Component

```typescript
describe('Button', () => {
  // Render tests
  it('renders with default props')
  it('renders all variants: primary, secondary, ghost, danger')
  it('renders all sizes: sm, md, lg')
  it('renders with icon slot')
  it('renders loading state with spinner')

  // Interaction tests
  it('calls onClick on click')
  it('debounces rapid clicks')
  it('does not fire when disabled')
  it('shows press animation (motion >= 1)')

  // Accessibility tests
  it('has no axe violations')
  it('is focusable via keyboard')
  it('activates on Enter and Space')
  it('announces loading state to screen readers')

  // Form integration
  it('submits parent form on type="submit"')
  it('auto-disables during form submission')
})
```

## 16. TypeScript Architecture

### 16.1 Component Prop Patterns

```typescript
// Base props — all components extend this
interface UIComponentProps {
  className?: string
  style?: React.CSSProperties
  motion?: 0 | 1 | 2 | 3  // Per-component motion override
}

// Discriminated unions for variants
interface ButtonProps extends UIComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode      // Icon slot — overridable
  iconEnd?: React.ReactNode   // Trailing icon slot
}

// Generic components
interface DataTableProps<T extends Record<string, unknown>> extends UIComponentProps {
  data: T[]
  columns: ColumnDef<T>[]
  // ...
}

// Polymorphic as prop for composability
interface CardProps extends UIComponentProps {
  as?: React.ElementType  // default 'div', can be 'a', 'article', etc.
}
```

### 16.2 Ref Forwarding

All components use `forwardRef` with correctly typed refs:

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => { ... })
const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => { ... })
```

### 16.3 Exported Types

Every component exports its props interface for consumer extension:

```typescript
export type { ButtonProps, CardProps, DataTableProps, ... }
```

## 17. Sanitizer Strategy

### 17.1 Approach

Replace `isomorphic-dompurify` with a **narrowly scoped** built-in sanitizer focused only on the library's own use cases:

- `StreamingText` — sanitizes markdown-rendered HTML output
- `CopyBlock` — sanitizes code block content
- `DiffViewer` — sanitizes diff content

### 17.2 Implementation

```typescript
function sanitizeHTML(html: string, allowedTags?: string[]): string {
  // Uses the browser Sanitizer API where available
  if (typeof Sanitizer !== 'undefined') {
    const sanitizer = new Sanitizer({ allowElements: allowedTags })
    const div = document.createElement('div')
    div.setHTML(html, { sanitizer })
    return div.innerHTML
  }

  // Fallback: DOMParser-based strip
  // Only allows: p, span, strong, em, code, pre, a, br, ul, ol, li, h1-h6
  // Strips all attributes except href (validated as http/https)
  // Strips all event handlers, javascript: URLs, data: URLs
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return walkAndSanitize(doc.body, ALLOWED_TAGS, ALLOWED_ATTRS)
}
```

### 17.3 Scope Limitation

This is NOT a general-purpose sanitizer. It covers:
- Stripping script injection from rendered markdown/code content
- Whitelisting safe HTML tags for rich text display
- Validating URLs (href attributes)

For consumers with richer sanitization needs, components accept pre-sanitized content or a `sanitize` prop to bring their own sanitizer.

## 18. Component Directory Mapping

### 18.1 `src/components/` — General Purpose (25)

Button, Badge, Avatar, Card, Skeleton, Progress, Checkbox, RadioGroup, ToggleSwitch, Slider, FormInput, Select, Combobox, ColorInput, FileUpload, InlineEdit, FilterPill, Tooltip, NativeTooltip, Popover, Dialog, ConfirmDialog, Sheet, DropdownMenu, Tabs

### 18.2 `src/domain/` — Specialized (37)

Toast, CommandBar, NotificationStack, StepWizard, ScrollReveal, InfiniteScroll, ViewTransitionLink, ResponsiveCard, DataTable, SmartTable, TreeView, SortableList, KanbanColumn, TruncatedText, CopyBlock, DiffViewer, EmptyState, MetricCard, Sparkline, ThresholdGauge, UtilizationBar, SeverityTimeline, LogViewer, PortStatusGrid, PipelineStage, UptimeTracker, TimeRangeSelector, HeatmapCalendar, StreamingText, TypingIndicator, ConfidenceBar, LiveFeed, RealtimeValue, StatusBadge, StatusPulse, SuccessCheckmark, AnimatedCounter

## 19. Side Effects & Tree-Shaking

### 19.1 The sideEffects Problem

Auto-injecting CSS is a side effect. Setting `"sideEffects": false` would let bundlers tree-shake away the CSS injection.

### 19.2 Solution

```json
{
  "sideEffects": false
}
```

We keep `sideEffects: false` because the CSS injection is **not** a top-level side effect — it runs inside `useStyles()` which only executes when a component mounts. Bundlers tree-shake based on module-level side effects (top-level code), not runtime effects inside functions. The component import is kept alive by the consumer using it in JSX, so the CSS injection inside its render path is never eliminated.

This is the same pattern used by Vanilla Extract and other CSS-in-JS libraries that claim `sideEffects: false` while injecting styles at runtime.

## 20. Context Architecture & Motion Cascade

### 20.1 Context Split

Three separate contexts to minimize re-renders:

```typescript
// ThemeContext — rarely changes (brand color, light/dark mode)
// MotionContext — rarely changes (motion level 0-3)
// DensityContext — rarely changes (compact/default/comfortable)
// FormContext — per-form instance (values, errors, touched)

// UIProvider composes all three:
function UIProvider({ theme, motion, density, children }) {
  return (
    <ThemeContext.Provider value={theme}>
      <MotionContext.Provider value={motion}>
        <DensityContext.Provider value={density}>
          {children}
        </DensityContext.Provider>
      </MotionContext.Provider>
    </ThemeContext.Provider>
  )
}
```

### 20.2 Motion Override Cascade (Precedence)

From lowest to highest priority:

1. **OS preference:** `prefers-reduced-motion: reduce` → forces `--motion: 0` (cannot be overridden)
2. **UIProvider prop:** `<UIProvider motion={2}>` → sets `--motion` on wrapper div + context value
3. **CSS custom property:** `style={{ '--motion': '1' }}` → scoped override via CSS cascade
4. **Component prop:** `<Card motion={3}>` → highest specificity, overrides everything except OS preference

```typescript
// Inside a component:
function useMotionLevel(propMotion?: number): number {
  const contextMotion = useContext(MotionContext)
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (reducedMotion) return 0  // OS always wins
  if (propMotion !== undefined) return propMotion  // Prop override
  return contextMotion ?? 3  // Context or default (cinematic)
}
```

### 20.3 Spring Degradation by Motion Level

| Level | Spring behavior |
|---|---|
| 0 (none) | No animation. Values change instantly. |
| 1 (subtle) | CSS transitions only (150-250ms ease-out). No spring physics. |
| 2 (expressive) | Spring physics with conservative params (low stiffness, high damping — no overshoot) |
| 3 (cinematic) | Full spring physics with overshoot, bounce, and expressive parameters |

## 21. Icon Catalog (Built-in ~50 Icons)

### 21.1 Component Internal Icons

chevron-down, chevron-up, chevron-left, chevron-right, check, x, plus, minus, search, filter, sort-asc, sort-desc, arrow-up, arrow-down, arrow-left, arrow-right, external-link, copy, clipboard-check, eye, eye-off, calendar, clock, refresh, loader, alert-triangle, alert-circle, info, check-circle, x-circle, trash, edit, settings, menu, more-horizontal, more-vertical, grip-vertical, upload, download, file, folder, image, link, code, terminal, git-branch, git-commit, activity, bar-chart, zap

### 21.2 Icon Component API

```typescript
import { Icon, icons } from '@annondeveloper/ui-kit'

<Icon name="check" size="md" />           // Built-in icon
<Button icon={<Icon name="plus" />}>Add</Button>  // Default slot usage
<Button icon={<MyCustomIcon />}>Add</Button>       // Override with custom

// All icon slots accept ReactNode — any SVG/component works
```

## 22. CLI Scaffolding Tool (v2)

### 22.1 Commands

```bash
npx @annondeveloper/ui-kit init          # Copy theme.css + utils to project
npx @annondeveloper/ui-kit add button    # Copy Button source to project
npx @annondeveloper/ui-kit list          # List available components
npx @annondeveloper/ui-kit theme         # Generate theme from brand color
```

### 22.2 Scaffold Mode

For consumers who prefer the shadcn/ui "own your components" pattern, the CLI copies component source files into their project. Components are self-contained (embedded styles), so copied files work without the library installed.

## 23. Animation Orchestration Engine (GSAP Replacement)

### 23.1 Timeline — Sequencing & Orchestration

```typescript
import { timeline, spring, animate, stagger } from '@annondeveloper/ui-kit'

const tl = timeline()
  .add(animate(heading, { opacity: [0, 1], y: [20, 0] }, { duration: 400 }))
  .add(animate(subtitle, { opacity: [0, 1], y: [12, 0] }, { duration: 300 }), '-100ms')
  .add(spring(card, { scale: [0.9, 1] }, { stiffness: 120, damping: 14 }), '-50ms')
  .add(stagger('.metric-card', { opacity: [0, 1], y: [24, 0] }, { each: 60, from: 'center', easing: 'spring' }))

tl.play() / tl.pause() / tl.reverse() / tl.seek(500) / tl.playbackRate = 0.5
```

Orchestrates WAAPI `Animation` objects — compositor-thread performance, unlike GSAP's main-thread RAF loop.

### 23.2 Stagger Patterns

```typescript
stagger('.grid-item', { scale: [0, 1] }, {
  each: 40,
  from: 'center',    // 'start' | 'end' | 'center' | 'edges' | 'random' | number
  grid: [4, 3],      // 2D distance calculation
  easing: 'spring'
})
```

### 23.3 ScrollScene (ScrollTrigger Replacement)

```typescript
scrollScene({
  trigger: sectionRef,
  pin: heroRef,
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  snap: { snapTo: [0, 0.25, 0.5, 0.75, 1], ease: 'spring' },
  animation: timeline().add(...)
})
```

Progressive: CSS `animation-timeline: scroll()` where supported, JS fallback via IntersectionObserver + scroll listener.

### 23.4 FLIP Layout Transitions

```typescript
const state = flip.capture('.card')
setLayout('list')  // React re-renders
flip.play(state, { duration: 500, easing: 'spring' })

// Or as hook: const flipRef = useFlip(deps)
```

Progressive: View Transitions API where supported, manual FLIP calculation where not.

### 23.5 TextSplitter

```tsx
<TextSplitter
  text="Hello World"
  splitBy="chars"
  animation={{ from: { opacity: 0, y: 20, rotateX: -90 }, stagger: { each: 30 }, easing: 'spring' }}
  trigger="inView"
/>
```

Accessible: `aria-label` on parent reads full text, individual spans are `aria-hidden`.

### 23.6 SVG Path Morphing

```typescript
morphPath(pathElement, { from: path1, to: path2, duration: 600, easing: 'spring' })
```

Auto-normalizes point count between paths. Used by ThresholdGauge, Sparkline, SuccessCheckmark.

### 23.7 MotionController — Global Control

```typescript
motion.pause() / motion.resume() / motion.clear()
motion.playbackRate = 0.25  // Slow-mo for debugging
// Auto-pauses on document.visibilitychange (no battery drain in background)
```

### 23.8 Animation Engine Size Budget

| Module | Budget |
|---|---|
| spring.ts — Spring solver | ~0.6KB |
| animate.ts — WAAPI wrapper | ~0.4KB |
| timeline.ts — Orchestration | ~0.5KB |
| stagger.ts — Stagger patterns | ~0.3KB |
| scroll.ts — ScrollScene | ~0.5KB |
| flip.ts — Layout transitions | ~0.4KB |
| text.ts — TextSplitter | ~0.3KB |
| morph.ts — SVG path morphing | ~0.3KB |
| controller.ts — Global control | ~0.2KB |
| **Total** | **~3.5KB gzip** |

## 24. Universal Input & Form Factor Engine

### 24.1 Unified Pointer System

All input handled via `PointerEvent` — single abstraction for mouse, touch, pen, spatial controllers:

```typescript
interface PointerContext {
  x: number; y: number
  pressure: number               // 0-1, pen/touch force
  pointerType: 'mouse' | 'touch' | 'pen'
  velocity: { x: number; y: number }  // For momentum/physics
}

usePointer(ref, { onPress, onMove, onRelease, onLongPress, onHover, onDrag })
```

### 24.2 Gesture Recognition

```typescript
useGesture(ref, { onSwipe, onPinch, onRotate, onLongPress, onDoubleTap })
```

| Gesture | Components |
|---|---|
| Swipe | Sheet dismiss, Toast dismiss, KanbanColumn, Tab switch |
| Pinch | HeatmapCalendar zoom, Sparkline zoom, image preview |
| Long press | Context menu (touch), InlineEdit activation |
| Double tap | Zoom toggle on charts |

### 24.3 Gamepad / TV Remote Support

```typescript
useGamepadNavigation()
// D-pad → Arrow key navigation, A → Enter, B → Escape
// Start → CommandBar, Shoulders → Tab sections, Triggers → Scroll
```

### 24.4 Haptic Feedback

```typescript
haptic('light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error')
// Via navigator.vibrate — used by ToggleSwitch, SortableList, Slider, Button
```

### 24.5 Form Factor Matrix

| Form Factor | Viewport | Adaptations |
|---|---|---|
| Smartwatch | < 250px | Icon-only, no overlays, no aurora, single column, motion capped |
| Phone | 300–599px | Bottom sheets, swipe nav, 48px targets, stacked layouts |
| Foldable | 600–850px | Dual-pane via `env(viewport-segment-*)`, fold-aware |
| Tablet | 840–1366px | Sidebar nav, floating panels, hover available |
| Laptop | 1200–1800px | Full features, keyboard shortcuts prominent |
| Desktop | 1800–3000px | Multi-column dashboards, increased density |
| TV/Console | 1920px+, 10ft | Scaled text, giant focus areas, D-pad nav, no hover |
| Video wall | 3000px+ | Amplified typography/glows, multi-touch zones |
| Car/Kiosk | 800px+, touch only | 64px targets, no scroll (paginated), high contrast |

### 24.6 Input Adaptation Per Component

Every component declares interactions once via the unified pointer/gesture/keyboard system. The input engine adapts to hardware capabilities — no `isMobile` checks, no device sniffing. Adaptation is purely capability-based via CSS media queries (`pointer`, `hover`, `prefers-contrast`, `forced-colors`) and runtime feature detection.

### 24.7 Scroll Behavior

- `pointer: fine` → `scroll-behavior: smooth`
- `pointer: coarse` → native momentum, `overscroll-behavior: contain`
- Scroll snap on swipeable components (tabs, carousels)

### 24.8 Focus Strategy

- `:focus-visible` for keyboard — visible focus rings with glow
- `:focus:not(:focus-visible)` for pointer — no outline
- `@media (prefers-contrast: more)` — enlarged focus indicators
- Logical tab order matching visual order in all layouts

### 24.9 Input Engine Size Budget

| Module | Budget |
|---|---|
| pointer.ts | ~0.5KB |
| gestures.ts | ~0.6KB |
| focus.ts | ~0.4KB |
| gamepad.ts | ~0.4KB |
| multitouch.ts | ~0.3KB |
| haptics.ts | ~0.2KB |
| **Total** | **~2.4KB gzip** |

## 25. Migration Path from v1

- v2 ships as the same package (`@annondeveloper/ui-kit`) with a major version bump
- Component API remains as similar as possible (same prop names, same behavior)
- Breaking changes documented in migration guide:
  - Remove all peer deps except react/react-dom
  - Replace `import '@annondeveloper/ui-kit/theme.css'` with auto-injected styles (or `import '@annondeveloper/ui-kit/css/theme.css'` for explicit)
  - Replace RHF wrappers with built-in form engine (or use escape hatch)
  - Theme tokens renamed from HSL to OKLCH values
