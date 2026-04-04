# Component Quality Audit Ruleset

## Purpose
Every component in @annondeveloper/ui-kit must be world-class. This audit framework ensures each component meets the highest standards across 7 dimensions. Each component is audited independently — no shortcuts, no pattern matching, full code review.

## Audit Dimensions

### 1. SOURCE CODE QUALITY (Score: /25)

#### 1.1 Architecture (0-5)
- [ ] `'use client'` directive present
- [ ] Correct imports (no circular deps, no unused imports)
- [ ] `forwardRef` used where appropriate (wraps native HTML element)
- [ ] Props interface is exported with JSDoc on each prop
- [ ] Default prop values are sensible and documented
- [ ] Component uses composition (children) not just configuration (props)

#### 1.2 CSS (0-5)
- [ ] Uses `@layer components` with `@scope(.ui-component-name)`
- [ ] Class prefix: `ui-` (e.g., `.ui-button`)
- [ ] OKLCH colors only (no hex/rgb in component CSS)
- [ ] Logical properties (`margin-inline-start`, not `margin-left`)
- [ ] `clamp()` for fluid sizing, `rem`/`em` units (no `px` for font-size)
- [ ] `text-wrap: balance` for headings, `text-wrap: pretty` for body

#### 1.3 Motion (0-5)
- [ ] Accepts `motion` prop (0-3)
- [ ] Uses `useMotionLevel()` hook
- [ ] Level 0 = instant (no transition/animation)
- [ ] Level 1 = CSS transitions only
- [ ] Level 2 = conservative spring (no overshoot)
- [ ] Level 3 = full physics (spring, bounce, particles)
- [ ] `@media (prefers-reduced-motion: reduce)` respected
- [ ] `@starting-style` for entry animations where applicable

#### 1.4 Accessibility (0-5)
- [ ] Native HTML element used where possible (`<button>`, `<dialog>`, `<details>`)
- [ ] ARIA attributes correct (roles, states, labels)
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter, Escape)
- [ ] Focus indicators visible (2px solid outline)
- [ ] Touch targets ≥ 44px on `@media (pointer: coarse)`
- [ ] `@media (forced-colors: active)` rules present
- [ ] Screen reader tested (aria-live for dynamic content)

#### 1.5 SSR Safety (0-5)
- [ ] No module-level DOM access
- [ ] No render-phase DOM access (outside useEffect)
- [ ] `typeof document !== 'undefined'` guards on portals
- [ ] No `window`/`navigator`/`localStorage` without guards
- [ ] Works with Next.js App Router SSR/SSG

### 2. LITE VARIANT (Score: /10)

- [ ] File exists at `src/lite/component-name.tsx`
- [ ] Uses native HTML elements (no React hooks for animation)
- [ ] CSS class: `.ui-lite-component-name`
- [ ] CSS in `src/lite/lite.css`
- [ ] Props interface exported (LiteComponentNameProps)
- [ ] Subset of standard props (no motion, no advanced features)
- [ ] Size < 1.5 KB (component) + < 0.5 KB (CSS)
- [ ] Works without JavaScript (CSS-only where possible)
- [ ] No `useStyles()` hook (styles in lite.css)
- [ ] `displayName` set

### 3. PREMIUM VARIANT (Score: /10)

- [ ] File exists at `src/premium/component-name.tsx`
- [ ] Wraps standard component (import as BaseComponent)
- [ ] Uses `@layer premium` with `@scope(.ui-premium-component-name)`
- [ ] Spring-scale entrance animation (motion 2+)
- [ ] Aurora glow / ambient effect (motion 3)
- [ ] `useMotionLevel()` respected
- [ ] `prefers-reduced-motion` kills all premium effects
- [ ] Exported from `src/premium/index.ts`
- [ ] Size overhead < 2 KB over standard
- [ ] `displayName` set

### 4. DEMO PAGE (Score: /20)

#### 4.1 Structure (0-10)
- [ ] Aurora hero with gradient title
- [ ] Tier-aware import string with copy button
- [ ] Interactive playground with controls panel
- [ ] All props controllable in playground
- [ ] 5 framework code tabs (React, HTML+CSS, Vue, Angular, Svelte)
- [ ] Code generators are tier-aware
- [ ] Variant gallery (all visual variants shown)
- [ ] Size scale (all sizes shown)
- [ ] States gallery (all interactive states)
- [ ] Weight Tiers section with 3 clickable cards
- [ ] Brand Color picker with presets
- [ ] Props API table (PropsTable with all props)
- [ ] Accessibility section
- [ ] Source links

#### 4.2 Quality (0-10)
- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] `useTier()` from global context
- [ ] `effectiveTier` maps tiers correctly
- [ ] Scroll-reveal animations on sections
- [ ] IntersectionObserver fallback
- [ ] Responsive at mobile (< 640px)
- [ ] Responsive at ultrawide (> 3000px)
- [ ] Playground preview updates in real-time
- [ ] Copy button works on all code blocks

### 5. CODE GENERATORS (Score: /10)

- [ ] React code is correct (imports, props, JSX)
- [ ] HTML+CSS code is standalone (no React dependency)
- [ ] Vue code uses Composition API
- [ ] Angular code uses standalone components
- [ ] Svelte code uses Svelte 5 syntax
- [ ] All generators are tier-aware (lite/standard/premium imports)
- [ ] Generated code is copy-pasteable and runs without modification
- [ ] Props match the current playground state
- [ ] Code updates when playground controls change

### 6. MCP REGISTRY (Score: /10)

- [ ] Component listed in `dist/mcp/registry.json`
- [ ] Name matches component export
- [ ] Description is accurate and useful (not auto-generated boilerplate)
- [ ] Category is correct
- [ ] Tier array is complete [standard, lite, premium]
- [ ] Import statement is correct
- [ ] Props array matches actual exported interface
- [ ] Each prop has: name, type, required, default, description
- [ ] Examples are working code (not pseudo-code)
- [ ] At least 2 meaningful examples
- [ ] relatedComponents list is relevant
- [ ] Accessibility notes are present

### 7. DOCUMENTATION (Score: /15)

- [ ] Component has JSDoc on the exported function/const
- [ ] Props interface has JSDoc on each property
- [ ] `displayName` is set
- [ ] Explicit return type (`: ReactElement`)
- [ ] Stories file exists (`component-name.stories.tsx`)
- [ ] Stories cover: default, variants, sizes, states, edge cases
- [ ] Stories work in Storybook
- [ ] CLAUDE.md mentions the component (if it's a key component)

## Scoring

| Score | Grade | Action |
|-------|-------|--------|
| 90-100 | A | Ship-ready |
| 75-89 | B | Minor fixes needed |
| 60-74 | C | Significant gaps — fix before next release |
| 40-59 | D | Major rework needed |
| < 40 | F | Rebuild required |

## Audit Process

1. **Read the source code** — full file, line by line
2. **Read the lite variant** — if exists
3. **Read the premium variant** — if exists
4. **Read the demo page** — full file
5. **Test code generators** — verify each framework output
6. **Check MCP registry** — verify entry accuracy
7. **Check documentation** — JSDoc, stories, types
8. **Score each dimension** — using the checklist above
9. **Write findings** — specific file:line references
10. **Implement fixes** — for any score < 90

## Priority Order

Audit components in this order (highest user impact first):

### Tier 1 — Core Primitives (audit first)
Button, Card, Badge, Dialog, Select, Tabs, Accordion, Alert, Checkbox, ToggleSwitch, Progress, Tooltip, Drawer

### Tier 2 — Forms
FormInput, DatePicker, TimePicker, SearchInput, OtpInput, TagInput, Combobox, FileUpload, ColorInput, RadioGroup, Slider, Rating

### Tier 3 — Layout & Navigation
AppShell, Navbar, Sidebar, Breadcrumbs, Pagination, Stepper, Divider

### Tier 4 — Data & Domain
DataTable, MetricCard, TimeSeriesChart, TreeView, LogViewer, CodeEditor, DiffViewer

### Tier 5 — Visual Effects
BackgroundBeams, MeteorShower, ShimmerButton, TextReveal, EncryptedText, FlipWords

### Tier 6 — Everything Else
Remaining components
