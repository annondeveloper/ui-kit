# Plan: Every Component to 110/110

## Current State (2026-04-05)

| Category | Count | Description |
|----------|-------|-------------|
| Full pattern | 22 | Premium import, 5 framework tabs, tier cards, motion control |
| Partial | 105 | Some elements present, various gaps |
| Stubs | 25 | < 400 lines, minimal content, no framework tabs |
| **Total** | **152** | |

## Scoring Rubric (11 categories × 10 points = 110)

1. **Source quality** — No bugs, clean types, proper CSS architecture
2. **Lite tier** — Exists, works, visually distinct from standard
3. **Premium tier** — Exists, imported in demo, visually distinct (not "= Standard")
4. **Demo playground** — Controls for ALL documented props including motion
5. **Props accuracy** — PropsTable matches source interface exactly (auto-verified by check-prop-drift.ts)
6. **Code generators** — ALL 5 tabs (React/HTML/Vue/Angular/Svelte) pass ALL playground-controlled props
7. **Accessibility** — Complete WCAG coverage, proper ARIA, keyboard nav
8. **Visual design** — Aurora Fluid aesthetic, proper tier differentiation
9. **Responsive** — Container queries + media queries, mobile-friendly
10. **Performance** — Accurate bundle sizes, no memory leaks
11. **DX** — Clear docs, no misleading content, correct source links

## GitHub Issues to Address

### Issue #14: Page Layout Primitives
Create 8 composition components: PageHeader, StatsGrid, Toolbar, CardGrid, ListLayout, SectionHeader, EmptyState, PageShell. These are NEW components, not fixes.

### Issue #15: CSS Import DX
4 changes needed:
1. UIProvider runtime warning when styles not loaded
2. MCP responses include CSS import instructions
3. README setup section more prominent
4. CLI `init` command auto-adds CSS imports

## Systematic Execution Plan

### Phase 0: Infrastructure (enables all other phases)
**Goal**: Build automated tooling so fixes are systematic, not ad-hoc.

Tasks:
- [ ] P0-1: Create `scripts/audit-page.ts` — automated page auditor that scores any demo page against the 11 rubric categories and outputs specific issues
- [ ] P0-2: Create `scripts/fix-props-drift.ts` — auto-generates PropsTable entries from component-meta.json
- [ ] P0-3: Create `scripts/generate-premium.ts` — template-based premium component generator
- [ ] P0-4: Create `scripts/upgrade-stub-page.ts` — converts stub pages to full pattern pages using the ButtonPage template

### Phase 1: Fix 22 Full Pattern Pages to 110/110
**Goal**: Get the best pages to perfect scores first.

These pages already have the structure — they just need targeted fixes:
- Missing premium imports in some
- Code generators missing props
- PropsTable drift
- A11y gaps

Batch approach:
- [ ] P1-1: Run `check-prop-drift.ts` on all 22 pages, auto-fix PropsTable entries
- [ ] P1-2: Ensure all 22 pages import and render REAL premium components (not "= Standard")
- [ ] P1-3: Add motion control to all 22 playgrounds
- [ ] P1-4: Fix all 5 code generators to pass ALL playground-controlled props
- [ ] P1-5: Run axe audit on all 22 component sources, fix critical a11y issues
- [ ] P1-6: Verify source links point to `main` branch (not `v2`)

### Phase 2: Upgrade 105 Partial Pages
**Goal**: Fill gaps in partial pages to match the full pattern.

Group by gap type:
- [ ] P2-1: Pages missing premium import (create premium component if needed, add import)
- [ ] P2-2: Pages missing motion control in playground
- [ ] P2-3: Pages missing Vue/Angular/Svelte code generators
- [ ] P2-4: Pages with incomplete tier cards

### Phase 3: Convert 25 Stub Pages
**Goal**: Replace stubs with full pattern pages.

Stubs to convert (alphabetical):
ActionIcon, Affix, AvatarUpload, BackToTop, ButtonGroup, Calendar, Carousel, Chip, ConfirmDialog, CopyButton, DateRangePicker, MultiSelect, NativeTooltip, NumberInput, PasswordInput, PinInput, SegmentedControl, Spoiler, Spotlight, Stepper, TableOfContents, Textarea, Timeline, TimePicker, Tour

### Phase 4: Issue #15 — CSS Import DX
- [ ] P4-1: UIProvider runtime warning
- [ ] P4-2: MCP CSS import instructions
- [ ] P4-3: README setup section
- [ ] P4-4: CLI `init` auto-import

### Phase 5: Issue #14 — Layout Primitives
- [ ] P5-1: Design layout component APIs
- [ ] P5-2: Implement PageHeader, PageShell, SectionHeader
- [ ] P5-3: Implement StatsGrid, CardGrid, ListLayout
- [ ] P5-4: Implement Toolbar, EmptyState
- [ ] P5-5: Create demo pages for all 8 layout components

## Execution Rules

1. **One phase at a time** — complete Phase N before starting Phase N+1
2. **Batch by 4** — process 4 components per agent run for parallelism
3. **Test after every batch** — `npx tsc --noEmit` + `npx vitest run` must pass
4. **Commit after every batch** — small, atomic commits with audit scores in message
5. **No shortcuts** — every premium component must have real visual differences (not just a wrapper with no CSS)
6. **Auto-verify** — run `check-prop-drift.ts` after every batch to confirm zero drift
7. **Resumable** — each task has a clear completion criteria and can be picked up in a new session

## Session Management

Each session should:
1. Read this plan
2. Check task list for next uncompleted task
3. Work on that task
4. Commit and push
5. Update task status
6. Note any blockers or scope changes
