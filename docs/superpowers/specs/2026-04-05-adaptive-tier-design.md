# Adaptive Tier Rendering — Design Spec

**Date:** 2026-04-05
**Status:** Phase 1 complete, Phases 2-4 approved for implementation
**Author:** Claude + annondeveloper

## Vision

UI Kit automatically detects client network bandwidth and renders the optimal component tier — **by default, with zero configuration**. Fast connections get Premium (spring physics, aurora glow). Slow connections get Lite (CSS-only, instant). Every single component adapts seamlessly. No developer action needed.

This is a world-first: no production React component library does automatic bandwidth-adaptive tier rendering.

---

## Phase 1: Motion-Based Adaptive (COMPLETE)

**How it works:**
1. UIProvider **always** detects bandwidth (default behavior, not opt-in)
2. `useAdaptiveTier()` runs on page mount (<50ms, non-blocking, synchronous)
3. Detects via `navigator.connection` API → fallback to Performance API (TTFB)
4. Maps bandwidth to motion level: premium(3), standard(2/1), lite(0)
5. Sets `MotionContext` — all components read via `useMotionLevel()`
6. Premium effects only activate on fast connections
7. No component swap, no layout shift — motion intensity changes only
8. Developer can override with `<UIProvider adaptive={false} motion={3}>` for fixed tier

**Detection mapping:**

| Network Condition | Tier | Motion | Confidence |
|---|---|---|---|
| 4G + >5Mbps + !saveData | premium | 3 | high |
| 4G + 1.5-5Mbps | standard | 2 | medium |
| 4G + <1.5Mbps | standard | 1 | low |
| 3G | standard | 1 | medium |
| 2G / slow-2g | lite | 0 | high |
| Save-Data header | lite | 0 | high |
| prefers-reduced-motion | lite | 0 | high |
| No API available | standard | 2 | low |
| SSR | standard | 2 | low |

**Files:**
- `src/core/adaptive/use-adaptive-tier.ts` — detection hook
- `src/core/adaptive/adaptive-context.tsx` — React context
- `src/core/adaptive/index.ts` — barrel export
- `src/__tests__/core/adaptive/use-adaptive-tier.test.ts` — 10 tests

---

## Phase 2: Weight Tier Switching

**Goal:** Actually load lighter component code on slow connections, not just reduce motion.

### 2a. Structural Parity Fix

ALL 159 components must have identical DOM structure across Lite/Standard/Premium tiers. Currently 3 components have structural mismatches that must be fixed:

| Component | Current Issue | Fix |
|---|---|---|
| **Select** | Lite uses native `<select>`, Standard uses custom combobox | Rebuild Lite Select as simplified custom combobox (same DOM, no search/multi-select, minimal JS) |
| **Tooltip** | Lite uses native `title` attribute, Standard uses custom positioned tooltip | Rebuild Lite Tooltip as minimal positioned tooltip (same DOM, no animation, CSS-only positioning) |
| **Dialog** | Premium adds dynamic particle elements | Remove particles from base DOM; make them CSS-only (pseudo-elements) or overlay layer that doesn't affect structure |

**Structural parity contract (every component must follow):**
1. Same root element type across all 3 tiers
2. Same child element structure (same nesting, same roles)
3. Same CSS class names on equivalent elements
4. Same dimensions and box model (zero layout shift on swap)
5. Props interface identical — Lite accepts all Standard props (ignores what it doesn't support)
6. `data-tier="lite|standard|premium"` attribute on root for CSS targeting

### 2b. Adaptive Entry Point

**New entry:** `@annondeveloper/ui-kit/adaptive`

```tsx
// Developer imports from /adaptive — gets auto-switching components
import { Button, Card, Dialog } from '@annondeveloper/ui-kit/adaptive'
```

Under the hood, each adaptive component:
1. Renders Standard immediately (already bundled with CSS)
2. Reads `AdaptiveContext` for detected tier
3. If tier is `lite`: stays at Standard with motion=0 (lightest behavior, same code)
4. If tier is `premium`: lazy-loads Premium module via `React.lazy()` + `startTransition`
5. Premium effects fade in over 150ms ease-in once loaded — feels like page "coming alive"
6. If lazy-load fails (network error): stays at Standard gracefully

**Bundle impact:**
- Standard code: always loaded (part of main bundle)
- Premium code: lazy-loaded only on fast connections (~3KB per component)
- Lite behavior: Standard code with motion=0 (no extra bundle)

### 2c. CSS Adaptive Layer

Add CSS that responds to `data-adaptive-tier` attribute:

```css
/* Premium enhancements only load on fast connections */
[data-adaptive-tier="premium"] .ui-button { /* aurora glow, spring shadows */ }
[data-adaptive-tier="lite"] .ui-card { /* remove shadows, simplify borders */ }
```

This allows CSS-only optimizations without any JS component swap.

---

## Phase 3: Advanced Adaptive Features

### 3a. Predictive Pre-loading

Detect navigation patterns and preload Premium modules before user navigates:
- Track which pages the user visits most
- On fast connections, prefetch Premium bundles for likely next pages
- Use `<link rel="modulepreload">` for predicted routes
- Use `requestIdleCallback` to avoid interfering with current page

### 3b. Per-Component Adaptive

Different tiers for above-fold vs below-fold content:
- Components in the initial viewport: render at detected tier immediately
- Components below fold: always start at Lite, upgrade to detected tier on scroll into view
- Use `IntersectionObserver` to trigger tier upgrades as components become visible
- Reduces initial JS execution for long pages

### 3c. Server-Side Hints

Use HTTP headers for faster initial tier selection:
- Read `Save-Data` header on the server → set `data-adaptive-tier` in HTML
- Read `Downlink` / `ECT` client hints if available
- Server renders with correct tier from the first byte — no hydration flash
- Requires `Accept-CH: Downlink, ECT, Save-Data` header from server

---

## Phase 4: Developer Tools & MCP Integration

### 4a. Developer Debug Overlay

In development mode (`process.env.NODE_ENV === 'development'`):
- Floating debug badge (bottom-right corner) showing:
  - Current adaptive tier (lite/standard/premium)
  - Motion level (0-3)
  - Detected bandwidth (Mbps)
  - Connection type (4g/3g/2g)
  - Confidence level
  - Reason for tier selection
- Click to expand detailed panel with:
  - Manual tier override buttons (test any tier)
  - Network simulation (simulate slow/fast without DevTools)
  - Component-level tier breakdown (which components are at which tier)
  - Performance metrics (time to detect, lazy-load times)
- Toggle with keyboard shortcut: `Ctrl+Shift+A`
- Auto-hidden in production builds (tree-shaken)

### 4b. MCP Integration

Update all MCP tools to be adaptive-aware:

**`get_page_template`** — scaffolds now include `adaptive` by default:
```tsx
<UIProvider> {/* adaptive is default — no prop needed */}
  <PageShell>...</PageShell>
</UIProvider>
```

**`get_component`** — responses include adaptive notes:
```
## Adaptive Behavior
This component automatically adjusts its visual tier based on network bandwidth:
- Premium (fast): spring entrance animation, aurora glow, hover shimmer
- Standard (moderate): CSS transitions, subtle shadows
- Lite (slow): instant render, no animations, minimal visual effects
```

**`get_started`** — mentions adaptive as a built-in feature:
```
## Automatic Performance Optimization
UIProvider automatically detects your users' network speed and adjusts
component visual richness. No configuration needed — it just works.
```

**New tool: `get_adaptive_info`** — explains the adaptive system:
```
Returns documentation about the adaptive tier system:
- How detection works
- What changes between tiers
- How to override for testing
- Performance characteristics
```

---

## Key Constraints

1. **Default behavior** — adaptive is ON by default in UIProvider. Opt-out with `adaptive={false}`
2. **No initial render delay** — detection is synchronous, <50ms
3. **No layout shift** — all tiers MUST share identical box model (enforced by structural parity contract)
4. **Per-page detection** — re-checks on each client-side navigation
5. **Graceful fallback** — if APIs unavailable, defaults to standard (motion 2)
6. **SSR safe** ��� returns 'standard' on server, detects on client hydration
7. **All 159 components** — every single component must be adaptive (no exceptions)
8. **Beautiful at every tier** — Lite must still look polished, just without animations

## Implementation Order

1. ~~Phase 1: Motion-based adaptive~~ ✅ COMPLETE
2. Phase 2a: Fix structural parity for Select, Tooltip, Dialog
3. Phase 2b: Build adaptive entry point with lazy-loading
4. Phase 2c: CSS adaptive layer
5. Phase 3a: Predictive pre-loading
6. Phase 3b: Per-component adaptive (IntersectionObserver)
7. Phase 3c: Server-side hints
8. Phase 4a: Developer debug overlay
9. Phase 4b: MCP integration updates
10. Make adaptive the UIProvider default (breaking change → v3.0 or feature flag)

## Testing

- Unit: `npx vitest run src/__tests__/core/adaptive/` — detection logic
- Visual: `/adaptive` demo page with Chrome DevTools network throttling
- Integration: test all 159 components render identically across tiers
- Performance: measure detection time (<50ms), lazy-load time (<200ms on 4G)
- E2E: Playwright tests simulating different network conditions
