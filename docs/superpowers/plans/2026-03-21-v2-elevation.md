# UI Kit v2 Elevation Plan — Weight Tiers, Effects, Interactive Docs, Theme Playground

> Resumable plan. On session restart: read this file, find first unchecked `- [ ]`, read memory/project_v2_progress.md for context.

**Goal:** Elevate from "built" to "best-in-class" — weight tiers, Aceternity-style effects, interactive documentation, theme playground.

---

## Phase A: Weight Tiers Architecture

### Task A.1: Lite tier — CSS-only components
- [ ] Create `src/lite/` directory structure
- [ ] Create `src/lite/button.tsx` — CSS-only Button (no useStyles, no hooks, just className + CSS)
- [ ] Create `src/lite/badge.tsx` — CSS-only Badge
- [ ] Create `src/lite/card.tsx` — CSS-only Card
- [ ] Create `src/lite/progress.tsx` — CSS-only Progress
- [ ] Create `src/lite/checkbox.tsx` — CSS-only Checkbox
- [ ] Create `src/lite/toggle-switch.tsx` — CSS-only ToggleSwitch
- [ ] Create `src/lite/skeleton.tsx` — CSS-only Skeleton
- [ ] Create `src/lite/alert.tsx` — CSS-only Alert
- [ ] Create `src/lite/divider.tsx` — CSS-only Divider
- [ ] Create `src/lite/avatar.tsx` — CSS-only Avatar
- [ ] Create `src/lite/index.ts` + `src/lite/theme.css` — barrel + standalone CSS
- [ ] Add `./lite` entry point to tsup config + package.json exports
- [ ] Tests for lite components (render, className, no JS dependencies)
- [ ] Verify lite bundle < 10KB gzip total
- [ ] Commit: `feat(v2): lite tier — 10 CSS-only components, <10KB total`

### Task A.2: Premium tier — enhanced animations
- [ ] Create `src/premium/` directory structure
- [ ] Create `src/premium/button.tsx` — Button with entrance animation, cursor glow, particle burst on click
- [ ] Create `src/premium/card.tsx` — Card with cursor-tracking glow, tilt on hover, entrance animation
- [ ] Create `src/premium/dialog.tsx` — Dialog with spring scale entrance, backdrop blur animation
- [ ] Create `src/premium/tabs.tsx` — Tabs with morphing underline, content crossfade
- [ ] Create `src/premium/metric-card.tsx` — MetricCard with number counting, sparkline draw animation
- [ ] Create `src/premium/index.ts` — barrel export
- [ ] Add `./premium` entry to tsup config + package.json exports
- [ ] Tests for premium components
- [ ] Commit: `feat(v2): premium tier — 5 enhanced animated components`

### Task A.3: Update documentation for weight tiers
- [ ] Update README.md with weight tier section
- [ ] Update docs/migration-v2.md
- [ ] Demo page section showing lite vs standard vs premium side-by-side
- [ ] Commit: `docs(v2): weight tier documentation and demo`

---

## Phase B: Aceternity-Style Visual Effects (10 components)

### Task B.1: Background effects
- [ ] BackgroundBeams — animated light beams from a point
- [ ] WavyBackground — undulating wave lines
- [ ] BackgroundBoxes — grid of glowing boxes
- [ ] Tests for all 3
- [ ] Commit: `feat(v2): background effects — beams, wavy, boxes`

### Task B.2: Card effects
- [ ] SpotlightCard — card with spotlight following cursor
- [ ] 3DCard — card with perspective tilt on hover
- [ ] EvervaultCard — card with encrypted/matrix text effect
- [ ] Tests for all 3
- [ ] Commit: `feat(v2): card effects — spotlight, 3D tilt, evervault`

### Task B.3: Text effects
- [ ] FlipWords — words that flip/rotate to change
- [ ] EncryptedText — text that scrambles then resolves
- [ ] HeroHighlight — text with gradient highlight that follows cursor
- [ ] Tests for all 3
- [ ] Commit: `feat(v2): text effects — flip words, encrypted, hero highlight`

### Task B.4: Scroll effects
- [ ] TracingBeam — beam that follows scroll position along a vertical line
- [ ] Tests
- [ ] Commit: `feat(v2): TracingBeam — scroll-following beam effect`

---

## Phase C: Interactive Documentation (Demo as Docs)

### Task C.1: Create PropsTable component
- [ ] Build a reusable PropsTable component that displays prop name, type, default, description
- [ ] Build a ComponentShowcase wrapper with: title, description, live preview, code, props table, a11y notes
- [ ] Commit: `feat(v2): PropsTable + ComponentShowcase for interactive docs`

### Task C.2: Rebuild CorePage as interactive docs
- [ ] Each of the 14 primitives gets a ComponentShowcase section
- [ ] All 5 sizes shown side-by-side
- [ ] All variants shown
- [ ] All states (default, hover, focus, disabled, loading, error)
- [ ] Code snippet for each example
- [ ] Commit: `feat(v2): CorePage rebuilt as interactive documentation`

### Task C.3: Rebuild FormsPage as interactive docs
- [ ] Same treatment for all 13 form components
- [ ] Commit: `feat(v2): FormsPage rebuilt as interactive documentation`

### Task C.4: Rebuild remaining pages as interactive docs
- [ ] OverlaysPage, DataPage, MonitorPage, AIPage
- [ ] Commit per page

---

## Phase D: Theme Playground

### Task D.1: Build ThemePlayground page
- [ ] Color picker for brand color (using our ColorInput)
- [ ] Live preview of all components updating in real-time
- [ ] All 10 preset themes as quick-select buttons
- [ ] Dark/light mode toggle
- [ ] Generated CSS export (copy to clipboard)
- [ ] Generated JS export (copy generateTheme() call)
- [ ] Commit: `feat(v2): theme playground — interactive brand color picker with live preview`

### Task D.2: Add theme page to demo router
- [ ] Route: /themes
- [ ] Sidebar link
- [ ] Commit: `feat(v2): theme playground page in demo site`

---

## Phase E: Final Polish & Release

### Task E.1: Verify all design principles
- [ ] Check every component against design_principles.md rules
- [ ] Fix any violations
- [ ] Run full test suite
- [ ] Commit fixes

### Task E.2: Release v2.2.0
- [ ] Bump version to 2.2.0
- [ ] Push and verify automated publish
- [ ] Verify npm, GitHub Packages, JSR all receive v2.2.0
- [ ] Update memory with completion status
