# Adaptive Tier Rendering — Design Spec

**Date:** 2026-04-05
**Status:** Phase 1 MVP complete, Phase 2 planned
**Author:** Claude + annondeveloper

## Vision

UI Kit automatically detects client network bandwidth and renders the optimal component tier. Fast connections get Premium (spring physics, aurora glow). Slow connections get Lite (CSS-only, instant). No developer configuration needed.

## Architecture

### Phase 1: Motion-Based Adaptive (COMPLETE)

**How it works:**
1. `<UIProvider adaptive>` enables auto-detection
2. `useAdaptiveTier()` runs on page mount (<50ms, non-blocking)
3. Detects bandwidth via `navigator.connection` API + Performance API fallback
4. Maps bandwidth to motion level: premium(3), standard(2/1), lite(0)
5. Sets `MotionContext` — all components read this via `useMotionLevel()`
6. Premium effects (spring animations, aurora glow) only activate on fast connections
7. No component swap, no layout shift — just motion intensity changes

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

**Files:**
- `src/core/adaptive/use-adaptive-tier.ts` — detection hook
- `src/core/adaptive/adaptive-context.tsx` — React context
- `src/core/adaptive/index.ts` — barrel export
- `src/__tests__/core/adaptive/use-adaptive-tier.test.ts` — 10 tests, all passing

### Phase 2: Weight Tier Switching (PLANNED)

**Concept:** Actually load lighter component code on slow connections.

**New entry point:** `@annondeveloper/ui-kit/adaptive`
- Exports wrapper components that dynamically import the right tier
- Always renders Standard immediately (it's already loaded with the CSS)
- On slow connections: components stay at Standard (motion 0-1)
- On fast connections: lazy-loads Premium module, swaps seamlessly

**Structural parity audit results (10 components sampled):**

| Component | Structural Match | Notes |
|---|---|---|
| Button | PARTIAL | Premium adds outer wrapper div |
| Card | PARTIAL | Premium adds outer wrapper div |
| Badge | PARTIAL | Same DOM, animation layer only |
| FormInput | PARTIAL | Premium adds effects wrapper |
| Select | **NO** | Lite=native `<select>`, Standard=custom combobox |
| Tabs | PARTIAL | Same structure, Premium adds indicator |
| Dialog | **NO** | Premium adds dynamic particles |
| MetricCard | PARTIAL | Inner DOM identical |
| Tooltip | **NO** | Lite=native title, Standard=custom positioned |
| Accordion | PARTIAL | DOM identical, CSS-only enhancements |

**Conclusion:** 7/10 have sufficient parity. 3 need work before weight tier switching.

**Phase 2 approach for incompatible components (Select, Tooltip, Dialog):**
- Option A: Fix Lite variants to match Standard DOM structure
- Option B: Exclude from weight tier switching (use motion-only for these 3)
- Recommended: Option A for Select/Tooltip (small components), Option B for Dialog (complex)

### Phase 3: Future Enhancements (NOT PLANNED)

- Predictive pre-loading: detect patterns and preload Premium before user navigates
- Per-component adaptive: different tiers for above-fold vs below-fold
- Server-side hints: `Save-Data` header → server renders Lite HTML

## Key Constraints

1. **Zero developer config** — `<UIProvider adaptive>` is the only change needed
2. **No initial render delay** — detection is synchronous, <50ms
3. **No layout shift** — all tiers share same box model
4. **Per-page detection** — re-checks on each navigation
5. **Graceful fallback** — if APIs unavailable, defaults to standard
6. **SSR safe** — returns 'standard' on server, detects on hydration

## Testing

Run `npx vitest run src/__tests__/core/adaptive/` — 10 tests cover all detection paths.
Demo page at `/adaptive` for visual testing with Chrome DevTools network throttling.
