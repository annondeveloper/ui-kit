# UI Kit v2.0 — Zero-Dependency Architecture Plan

> **Goal**: Rebuild every component from scratch with zero external dependencies.
> Full control over behavior, animations, accessibility, and styling.
> Next-generation UX that doesn't exist in any current library.

---

## Part 1: Core Architecture & Design Philosophy

### 1.1 What We're Replacing

| Current Dependency | Used In | Replacement Strategy |
|---|---|---|
| Framer Motion | 40+ components | Custom animation engine (WAAPI + spring solver + CSS `@starting-style`) |
| Lucide React | 58 components | Built-in SVG icon system with tree-shaking |
| Radix UI (5 packages) | 7 components | Custom WAI-ARIA primitives with state machines |
| TanStack React Table | 2 components | Custom table engine with virtual scrolling |
| Sonner | 1 component | Custom notification system |
| react-hook-form | 4 wrappers | Custom form validation engine |
| clsx + tailwind-merge | All components | Custom `cx()` utility (~20 lines) |
| isomorphic-dompurify | 1 utility | Built-in sanitizer using browser DOMParser |
| Tailwind CSS | All components | CSS custom properties + vanilla CSS (no build tool dependency) |

**Only peer dependency**: `react` + `react-dom` (^19.0.0)

### 1.2 Architecture Pattern: State Machines + Compound Components

Every interactive component follows a **three-layer architecture** (inspired by Zag.js and React Aria):

```
┌─────────────────────────────────────────┐
│  Layer 3: Component (JSX + Styling)     │  ← What users import
│  Compound components with dot notation  │
│  e.g. Select.Root, Select.Trigger       │
├─────────────────────────────────────────┤
│  Layer 2: Behavior Hook                 │  ← ARIA, keyboard, focus, animation
│  useSelect(), useDialog(), useMenu()    │
│  Returns props to spread on elements    │
├─────────────────────────────────────────┤
│  Layer 1: State Machine                 │  ← Pure logic, no DOM
│  createSelectMachine(), transitions     │
│  Testable without React                 │
└─────────────────────────────────────────┘
```

**Why this pattern:**
- State machines are testable without React — pure functions with defined transitions
- Behavior hooks handle the messy DOM reality (focus, ARIA, keyboard) in one place
- Components are thin wrappers — easy to restyle or extend
- Each layer can be used independently (power users can use just the hook)

### 1.3 Composition: `asChild` + Slot

Every component that renders a DOM element supports `asChild`:

```tsx
// Renders as <button>
<Button>Click me</Button>

// Renders as <a> with all Button behavior merged
<Button asChild>
  <a href="/page">Click me</a>
</Button>
```

Implementation: A `Slot` component uses `cloneElement` to merge props, event handlers, refs, and classNames onto the child. A `Slottable` sub-component resolves ambiguity with multiple children.

### 1.4 Styling Architecture: Zero-Build CSS

**No Tailwind. No CSS-in-JS. No build step for styles.**

Three-tier design token system using CSS custom properties:

```
Tier 1 — Primitives (raw values, never used directly in components)
  --ui-blue-50: oklch(0.97 0.01 250)
  --ui-blue-500: oklch(0.55 0.15 250)
  --ui-radius-md: 8px
  --ui-space-3: 12px

Tier 2 — Semantic (intent-based, remapped per theme)
  --ui-color-primary: var(--ui-blue-500)
  --ui-color-surface: var(--ui-gray-900)
  --ui-color-danger: var(--ui-red-500)

Tier 3 — Component (scoped to each component)
  --button-bg: var(--ui-color-primary)
  --button-text: var(--ui-color-on-primary)
  --button-radius: var(--ui-radius-md)
```

**Color space: OKLCH** (perceptually uniform, wide gamut, dark mode by inverting L)

**Styling delivery:**
- Ship a single `theme.css` with all tokens + component styles
- Components use `data-*` attributes for state: `data-state="open"`, `data-pressed`, `data-disabled`
- Users can override any token at any tier
- No className collision — all component classes use `ui-` prefix
- Container queries for responsive components (no media queries inside components)

### 1.5 Animation Engine (Custom, ~200 lines total)

Three animation subsystems, zero dependencies:

#### A. Web Animations API (WAAPI) — Standard transitions
```ts
function animate(el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  // Runs on compositor thread for transform/opacity
  // Returns Animation object for cancel/finish/pause
}
```
Used for: fade in/out, slide, scale, color transitions

#### B. Spring Solver — Physics animations (~50 lines)
Closed-form damped harmonic oscillator (no rAF loop needed):
```ts
function spring(config: { stiffness: number; damping: number; mass: number }) {
  // Returns position as pure function of time t
  // Generates WAAPI keyframes from the spring curve
  // Interruptible — can recalculate from current position
}
```
Used for: bouncy entries, tab indicators, drag release, toggle switches

#### C. CSS `@starting-style` — Enter/exit animations (zero JS)
```css
.ui-popover[data-state="open"] {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms, transform 200ms, display 200ms allow-discrete;
}
@starting-style {
  .ui-popover[data-state="open"] {
    opacity: 0;
    transform: translateY(-4px);
  }
}
```
Used for: popover, tooltip, dropdown, dialog, notification enter/exit

**All animations respect `prefers-reduced-motion` automatically.**

### 1.6 Accessibility Architecture

Every interactive component follows WAI-ARIA APG patterns exactly:

- **Focus management**: Roving tabindex for composite widgets (tabs, radio, menu, toolbar)
- **Keyboard**: Full keyboard support per APG spec (Arrow keys, Home/End, Escape, Enter/Space, type-ahead)
- **Screen readers**: Persistent live region container mounted once, populated via `announce()` utility
- **Focus trapping**: Custom trap for dialogs/modals using native `<dialog>` where possible
- **Focus visible**: `data-focus-visible` attribute (keyboard-only focus rings, no mouse)
- **Touch**: `usePress` hook that normalizes click/touch/keyboard activation

### 1.7 Icon System

Built-in SVG icons — no Lucide dependency:

```tsx
// Tree-shakeable named exports
import { IconCheck, IconChevronDown, IconSearch } from '@annondeveloper/ui-kit/icons'

// Each icon is a tiny React component (~200 bytes each)
// Consistent 24x24 viewBox, currentColor fill, customizable size/strokeWidth
```

Ship ~40 essential icons covering all component needs. Users can add custom icons via the same interface.

### 1.8 File Structure

```
src/
├── core/                    # Framework primitives
│   ├── animation/
│   │   ├── spring.ts        # Closed-form spring solver
│   │   ├── waapi.ts         # WAAPI wrapper with lifecycle
│   │   └── transition.ts    # CSS transition helpers
│   ├── a11y/
│   │   ├── focus-trap.ts    # Focus trapping
│   │   ├── roving-focus.ts  # Roving tabindex
│   │   ├── announce.ts      # Live region announcements
│   │   └── use-press.ts     # Unified press handler
│   ├── dom/
│   │   ├── slot.tsx         # asChild / Slot implementation
│   │   ├── portal.tsx       # Portal rendering
│   │   ├── scroll-lock.ts   # Body scroll locking
│   │   ├── click-outside.ts # Click outside detection
│   │   └── position.ts      # Floating element positioning
│   ├── form/
│   │   ├── validation.ts    # Validation engine
│   │   └── form-context.tsx # Form state management
│   └── utils/
│       ├── cx.ts            # Class merging (~20 lines)
│       ├── format.ts        # Number/date/duration formatters
│       ├── sanitize.ts      # HTML sanitizer (DOMParser)
│       └── color.ts         # OKLCH utilities
│
├── machines/                # State machines (pure logic, no React)
│   ├── select.ts
│   ├── combobox.ts
│   ├── dialog.ts
│   ├── menu.ts
│   ├── tabs.ts
│   ├── accordion.ts
│   ├── tooltip.ts
│   ├── slider.ts
│   └── table.ts
│
├── hooks/                   # Behavior hooks (React + DOM)
│   ├── use-select.ts
│   ├── use-combobox.ts
│   ├── use-dialog.ts
│   ├── use-menu.ts
│   ├── use-tabs.ts
│   ├── use-tooltip.ts
│   ├── use-slider.ts
│   ├── use-table.ts
│   ├── use-virtual-scroll.ts
│   └── use-sortable.ts
│
├── components/              # UI components (compound, styled)
│   ├── button/
│   │   ├── button.tsx
│   │   └── button.css
│   ├── select/
│   │   ├── select.tsx       # Select.Root, Select.Trigger, Select.Content, Select.Item
│   │   └── select.css
│   ├── dialog/
│   │   ├── dialog.tsx       # Uses native <dialog> + showModal()
│   │   └── dialog.css
│   ├── popover/
│   │   ├── popover.tsx      # Uses Popover API + CSS Anchor Positioning
│   │   └── popover.css
│   ├── ... (all 62+ components)
│   └── data-table/
│       ├── data-table.tsx   # Custom table engine
│       ├── virtual-scroll.tsx
│       └── data-table.css
│
├── icons/                   # Built-in SVG icons
│   ├── index.ts             # Named exports
│   ├── check.tsx
│   ├── chevron-down.tsx
│   ├── ... (~40 icons)
│   └── create-icon.tsx      # Icon factory for custom icons
│
├── theme.css                # All design tokens + component styles
├── index.ts                 # Main barrel export
└── form.ts                  # Form-specific exports
```

---

*Continued in Part 2: Component Inventory & Implementation Details*
*Continued in Part 3: Animation System Deep Dive*
*Continued in Part 4: Next-Generation Features*
*Continued in Part 5: Migration Strategy & Phasing*
