# Adaptive Tier Rendering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make UIProvider automatically detect bandwidth and render optimal component tiers by default — across all 159 components, the demo site, the MCP, and developer tools.

**Architecture:** Phase 1 (motion-based) is complete. This plan covers: making adaptive the default, fixing 3 structurally incompatible components, building a CSS adaptive layer, adding a dev debug overlay, updating the MCP, and making the demo site itself adaptive.

**Tech Stack:** React 19, TypeScript, CSS @layer/@scope, Navigator.connection API, Performance API, IntersectionObserver

---

## File Map

### Core Adaptive Engine (Phase 1 — DONE)
- `src/core/adaptive/use-adaptive-tier.ts` ✅
- `src/core/adaptive/adaptive-context.tsx` ✅
- `src/core/adaptive/index.ts` ✅

### Phase 2: Default + Structural Parity
- Modify: `src/components/ui-provider.tsx` — make adaptive default
- Modify: `src/lite/select.tsx` — rebuild for DOM parity
- Modify: `src/lite/tooltip.tsx` — rebuild for DOM parity
- Modify: `src/premium/dialog.tsx` — CSS-only particles
- Create: `src/core/adaptive/adaptive-css.ts` — CSS adaptive layer injection

### Phase 3: Dev Tools
- Create: `src/core/adaptive/dev-overlay.tsx` — floating debug badge
- Create: `src/core/adaptive/dev-overlay-styles.ts` — overlay CSS

### Phase 4: MCP + Demo Integration
- Modify: `src/mcp/server.ts` — add `get_adaptive_info` tool + update responses
- Modify: `demo/src/App.tsx` — enable adaptive on demo site
- Modify: `workers/mcp/src/worker.ts` — sync new tool

---

## Task 1: Make Adaptive the Default in UIProvider

**Files:**
- Modify: `src/components/ui-provider.tsx`
- Modify: `src/__tests__/core/adaptive/use-adaptive-tier.test.ts`

- [ ] **Step 1: Update UIProvider default**

In `src/components/ui-provider.tsx`, change the default value of `adaptive`:

```tsx
// Before:
adaptive = false,

// After:
adaptive = true,
```

- [ ] **Step 2: Update the JSDoc**

```tsx
/**
 * Enable adaptive tier rendering based on network bandwidth.
 * - `true` (default): auto-detect tier per page
 * - `false`: use fixed `motion` prop instead
 * - `'lite' | 'standard' | 'premium'`: force a specific tier
 */
adaptive?: boolean | AdaptiveTier
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run src/__tests__/core/adaptive/`
Expected: All 10 tests pass (detection logic unchanged)

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: All ~5650 tests pass (existing components unaffected — adaptive just sets motion level)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui-provider.tsx
git commit -m "feat: make adaptive tier detection the default in UIProvider"
```

---

## Task 2: CSS Adaptive Layer

**Files:**
- Create: `src/core/adaptive/adaptive-css.ts`
- Modify: `src/components/ui-provider.tsx`

- [ ] **Step 1: Create the adaptive CSS**

Create `src/core/adaptive/adaptive-css.ts`:

```ts
import { css } from '../styles/css-tag'

/**
 * CSS rules that optimize component appearance based on adaptive tier.
 * Injected by UIProvider when adaptive is enabled.
 *
 * - lite: removes shadows, simplifies borders, disables backdrop-filter
 * - standard: default appearance
 * - premium: enhances glows, adds aurora effects
 */
export const adaptiveStyles = css`
  /* ── Lite tier: optimize for speed ──────────────────── */
  [data-adaptive-tier="lite"] {
    --motion: 0;

    /* Remove expensive visual effects */
    & *::before,
    & *::after {
      animation: none !important;
      transition: none !important;
    }

    /* Simplify shadows and blurs */
    & [class*="ui-"] {
      box-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    /* Disable scroll animations */
    & [class*="__section"] {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
  }

  /* ── Premium tier: enhance visuals ─────────────────── */
  [data-adaptive-tier="premium"] {
    --motion: 3;

    /* Enable premium glow on interactive elements */
    & .ui-button:hover,
    & .ui-card:hover {
      box-shadow:
        0 0 0 1px var(--brand, oklch(65% 0.2 270) / 0.3),
        0 4px 16px var(--brand, oklch(65% 0.2 270) / 0.15);
      transition: box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  /* ── Premium tier fade-in for effects ──────────────── */
  [data-adaptive-tier="premium"] [class*="ui-premium"] {
    animation: adaptive-premium-reveal 0.15s ease-in both;
  }

  @keyframes adaptive-premium-reveal {
    from { opacity: 0.95; }
    to { opacity: 1; }
  }

  /* ── Respect user preferences always ───────────────── */
  @media (prefers-reduced-motion: reduce) {
    [data-adaptive-tier] {
      --motion: 0;
    }
    [data-adaptive-tier] *::before,
    [data-adaptive-tier] *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`

export const ADAPTIVE_CSS_ID = 'ui-kit-adaptive'
```

- [ ] **Step 2: Inject adaptive CSS in UIProvider**

In `src/components/ui-provider.tsx`, add after the OKLCH fallback injection:

```tsx
import { adaptiveStyles, ADAPTIVE_CSS_ID } from '../core/adaptive/adaptive-css'

// Inside UIProvider, add useEffect:
useEffect(() => {
  if (isAdaptive) {
    injectCSS(ADAPTIVE_CSS_ID, adaptiveStyles.css)
  }
}, [isAdaptive])
```

- [ ] **Step 3: Verify build**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 4: Commit**

```bash
git add src/core/adaptive/adaptive-css.ts src/components/ui-provider.tsx
git commit -m "feat: CSS adaptive layer — lite removes effects, premium enhances"
```

---

## Task 3: Fix Select Lite for Structural Parity

**Files:**
- Modify: `src/lite/select.tsx`
- Test: `src/__tests__/lite/lite.test.tsx`

The Lite Select currently uses native `<select>`. It needs to produce the same DOM structure as the Standard Select (custom combobox with `role="combobox"`), but without search, multi-select, or portal positioning — just a simple styled dropdown.

- [ ] **Step 1: Read the Standard Select DOM structure**

Read `src/components/select.tsx` and note the root element structure:
- Root: `<div class="ui-select" data-size data-variant>`
- Trigger: `<button role="combobox" aria-expanded>`
- Dropdown: `<div class="ui-select__dropdown" role="listbox">`
- Options: `<div role="option">`

- [ ] **Step 2: Rebuild Lite Select to match**

Rewrite `src/lite/select.tsx` to produce the same DOM tree with inline styles, no portal, simple click-to-toggle dropdown using useState. No search, no multi-select, no keyboard navigation beyond Escape to close. Keep it under 80 lines.

- [ ] **Step 3: Run lite tests**

Run: `npx vitest run src/__tests__/lite/lite.test.tsx`
Expected: Pass (update Select tests if needed)

- [ ] **Step 4: Commit**

```bash
git add src/lite/select.tsx src/__tests__/lite/lite.test.tsx
git commit -m "fix: rebuild Lite Select for structural parity with Standard"
```

---

## Task 4: Fix Tooltip Lite for Structural Parity

**Files:**
- Modify: `src/lite/tooltip.tsx`

The Lite Tooltip currently uses native `title` attribute. It needs to produce the same DOM structure as Standard (custom positioned tooltip with `role="tooltip"`).

- [ ] **Step 1: Rebuild Lite Tooltip**

Rewrite `src/lite/tooltip.tsx` to produce:
- Wrapper: `<span class="ui-lite-tooltip">`
- Trigger: `<span>` wrapping children with onMouseEnter/onMouseLeave
- Tooltip panel: `<span role="tooltip" class="ui-lite-tooltip__panel">` with inline styles for positioning (absolute, no portal)

Keep under 60 lines. No animation, just show/hide via state.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 3: Commit**

```bash
git add src/lite/tooltip.tsx
git commit -m "fix: rebuild Lite Tooltip for structural parity with Standard"
```

---

## Task 5: Fix Dialog Premium — CSS-Only Particles

**Files:**
- Modify: `src/premium/dialog.tsx`

Premium Dialog currently creates dynamic DOM elements for backdrop particles. Convert to CSS-only pseudo-elements.

- [ ] **Step 1: Replace particle DOM with CSS pseudo-elements**

In `src/premium/dialog.tsx`, remove the dynamic particle creation logic. Add CSS using `::before` and `::after` on the backdrop for a shimmer/particle effect using CSS animations + gradients. This keeps the DOM identical to Standard.

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 3: Commit**

```bash
git add src/premium/dialog.tsx
git commit -m "fix: Dialog Premium uses CSS-only particles — no extra DOM elements"
```

---

## Task 6: Developer Debug Overlay

**Files:**
- Create: `src/core/adaptive/dev-overlay.tsx`
- Modify: `src/components/ui-provider.tsx`

- [ ] **Step 1: Create the debug overlay component**

Create `src/core/adaptive/dev-overlay.tsx`:

A floating badge (bottom-right) showing adaptive tier info. Only renders when `process.env.NODE_ENV === 'development'`. Features:
- Shows tier badge (lite/standard/premium) with color
- Click to expand: shows bandwidth, connection type, confidence, reason
- Manual override buttons: click lite/standard/premium to force tier
- Keyboard toggle: Ctrl+Shift+A
- Collapse/expand state persisted in sessionStorage

```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdaptiveContext } from './adaptive-context'
import { css } from '../styles/css-tag'
import { useStyles } from '../styles/use-styles'
// ... component implementation
```

- [ ] **Step 2: Conditionally render in UIProvider**

In `src/components/ui-provider.tsx`, add inside the return JSX (only in dev):

```tsx
{isAdaptive && process.env.NODE_ENV === 'development' && (
  <AdaptiveDevOverlay />
)}
```

Use `React.lazy` to avoid bundling in production.

- [ ] **Step 3: Verify it tree-shakes in production**

Run: `npm run build`
Check that `dev-overlay` does NOT appear in production bundle.

- [ ] **Step 4: Commit**

```bash
git add src/core/adaptive/dev-overlay.tsx src/components/ui-provider.tsx
git commit -m "feat: adaptive dev overlay — floating debug badge with tier info"
```

---

## Task 7: MCP Integration

**Files:**
- Modify: `src/mcp/server.ts`
- Modify: `src/__tests__/mcp/server.test.ts`

- [ ] **Step 1: Add `get_adaptive_info` tool**

New MCP tool that returns documentation about the adaptive system:

```ts
server.tool('get_adaptive_info', 'Learn about the automatic bandwidth-adaptive tier system', {}, async () => {
  const text = `# Adaptive Tier Rendering

UIProvider automatically detects your users' network bandwidth and adjusts
component visual richness. No configuration needed — it's on by default.

## How It Works
1. On page load, UIProvider detects bandwidth (<50ms, non-blocking)
2. Maps connection speed to tier: premium / standard / lite
3. All components automatically adjust their visual effects

## What Changes Between Tiers
| Aspect | Lite (slow) | Standard (moderate) | Premium (fast) |
|--------|-------------|---------------------|----------------|
| Animations | None | CSS transitions | Spring physics |
| Shadows | None | Subtle | Aurora glow |
| Hover effects | Basic | Standard | Shimmer + ripple |
| Entrance | Instant | Fade | Spring + blur-in |
| Layout | Identical | Identical | Identical |

## Developer Testing
- Chrome DevTools → Network → Throttle to "Slow 3G" → Reload
- Or use the debug overlay: Ctrl+Shift+A in development mode
- Or force a tier: \`<UIProvider adaptive="lite">\`

## Opting Out
\`\`\`tsx
<UIProvider adaptive={false} motion={3}>
  {/* Fixed premium experience */}
</UIProvider>
\`\`\`
`
  return { content: [{ type: 'text' as const, text }] }
})
```

- [ ] **Step 2: Update `get_component` responses**

Add to every `get_component` response:

```
## Adaptive Behavior
This component automatically adjusts based on network bandwidth:
- **Premium** (fast): spring animations, aurora glow, shimmer effects
- **Standard** (moderate): CSS transitions, subtle shadows
- **Lite** (slow): instant render, no animations, minimal effects
Layout is identical across all tiers — zero layout shift.
```

- [ ] **Step 3: Update `get_started` response**

Add section:

```
## Automatic Performance (built-in)
UIProvider detects your users' bandwidth and adjusts visual richness automatically.
Fast connections → premium animations. Slow connections → instant, lightweight rendering.
No configuration needed. Override with: \`<UIProvider adaptive={false} motion={3}>\`
```

- [ ] **Step 4: Update test — 9 tools now**

```ts
it('registers all 9 tools', () => {
  expect(srv._registeredTools.size).toBe(9)
  // ... add get_adaptive_info
})
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/mcp/server.test.ts`
Expected: Pass

- [ ] **Step 6: Commit**

```bash
git add src/mcp/server.ts src/__tests__/mcp/server.test.ts
git commit -m "feat: MCP get_adaptive_info tool + adaptive notes in all responses"
```

---

## Task 8: Make Demo Site Adaptive

**Files:**
- Modify: `demo/src/App.tsx`

- [ ] **Step 1: Enable adaptive on the demo site**

In `demo/src/App.tsx`, the UIProvider already wraps everything. Just ensure `adaptive` is not set to `false` (it's now default `true`). If there's an explicit `adaptive={false}`, remove it.

The demo site itself now adapts to visitor bandwidth — visitors on slow connections get a fast lite experience.

- [ ] **Step 2: Verify demo builds**

Run: `cd demo && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add demo/src/App.tsx
git commit -m "feat: demo site runs on adaptive tier — adapts to visitor bandwidth"
```

---

## Task 9: Sync Cloudflare Worker

**Files:**
- Modify: `workers/mcp/src/worker.ts`

- [ ] **Step 1: Add `get_adaptive_info` tool to worker**

Copy the tool definition from Task 7 into the worker's `createMcpServer()` function.

- [ ] **Step 2: Update adaptive notes in worker responses**

Mirror the `get_component` and `get_started` changes from Task 7.

- [ ] **Step 3: Commit**

```bash
git add workers/mcp/src/worker.ts
git commit -m "feat: sync Cloudflare worker with adaptive info tool"
```

---

## Task 10: Final Verification + Release

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Audit all demo pages**

Run: `npx tsx scripts/audit-page.ts`
Expected: 159+ pages at 110/110

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: Clean

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: Success

- [ ] **Step 5: Version bump + release**

```bash
npm version minor --no-git-tag-version
# Sync jsr.json manually
git add package.json jsr.json package-lock.json
git commit -m "chore: bump to v2.9.0 — adaptive tier rendering"
git tag v2.9.0
git push origin main && git push origin --tags
```

- [ ] **Step 6: Verify CI publishes**

```bash
gh run list --repo annondeveloper/ui-kit --limit 3
# Wait for Publish workflow to complete
```
