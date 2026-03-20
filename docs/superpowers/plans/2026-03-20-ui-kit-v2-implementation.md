# UI Kit v2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild @annondeveloper/ui-kit from scratch as a zero-dependency React component library with 62 components, physics-based animations, OKLCH color system, and Aurora Fluid design identity.

**Architecture:** Embedded scoped CSS via `useStyles()` + `adoptedStyleSheets`, real spring solver for physics animations, OKLCH tokens with relative color syntax, native HTML elements (`<dialog>`, `popover`, anchor positioning) replacing Radix UI, built-in form engine, unified input system supporting every form factor from smartwatch to video wall.

**Tech Stack:** React 19, TypeScript (strict), tsup (ESM bundler), Vitest + Testing Library + jest-axe (testing), Playwright (visual regression), CSS `@scope` + `@layer` + nesting + anchor positioning + `@starting-style`

**Spec:** `docs/superpowers/specs/2026-03-20-ui-kit-v2-design.md`
**Branch:** `v2`
**Memory:** Update `/root/.claude/projects/-var-opt-data-ui-kit/memory/` after each task and on any failure/insight.

---

## Resumability Protocol

This plan is designed to survive session interruptions. After every task completion:

1. The task checkbox is marked `[x]` in this file
2. A git commit is created with the task number in the message
3. Memory file `project_v2_progress.md` is updated with current task, any insights, any failures
4. On session resume: read this plan file → find first unchecked `- [ ]` → read memory file → continue

**Markers:**
- `- [ ]` = not started
- `- [~]` = partially complete (session interrupted mid-step — read memory for context)
- `- [x]` = complete

**To resume:** Read this plan file → find first `- [ ]` or `- [~]` → read the memory file for context → continue.

---

## Cross-Cutting Requirements (Apply to ALL component tasks)

Every component implementation MUST include:

1. **`@scope` wrapping** — Components write `@scope (.ui-component-name)` manually in their `css` template literals. The style engine injects as-is.
2. **`@layer components`** — All component CSS wrapped in `@layer components { ... }`
3. **Logical properties** — `margin-inline-start` not `margin-left`, `padding-block` not `padding-top/bottom`
4. **RTL/CJK** — Test with `dir="rtl"` and `:lang(ja)` for any text-heavy component
5. **Forced colors** — `@media (forced-colors: active)` fallback in component CSS
6. **Print** — `@media print` rules stripping aurora effects, ensuring readable output
7. **Reduced data** — `@media (prefers-reduced-data: reduce)` stripping GPU-heavy decorative effects
8. **Error boundary** — Domain components (Phase 7-8) use `<ComponentErrorBoundary>` wrapper
9. **SSR** — Test `renderToString()` does not throw, `StyleCollector` captures CSS
10. **Bundle size** — Check gzip size after implementation against budget (primitives <2KB, medium <5KB, complex <8KB)
11. **Documentation** — Update README.md with component API after each component completion
12. **Memory update** — Update progress memory file after each task

---

## Phase 0: Project Scaffolding & Build System

### Task 0.1: Clean v2 branch and scaffold directory structure

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `tsup.config.ts`
- Modify: `jsr.json`
- Create: `src/core/styles/index.ts`
- Create: `src/core/motion/index.ts`
- Create: `src/core/tokens/index.ts`
- Create: `src/core/icons/index.ts`
- Create: `src/core/a11y/index.ts`
- Create: `src/core/forms/index.ts`
- Create: `src/core/input/index.ts`
- Create: `src/core/utils/index.ts`
- Create: `src/components/.gitkeep`
- Create: `src/domain/.gitkeep`
- Create: `src/index.ts` (new v2 barrel)
- Create: `src/form.ts` (new v2 barrel)
- Create: `src/theme.ts` (new v2 barrel)
- Create: `scripts/extract-css.ts`
- Create: `scripts/check-bundle-size.ts`
- Create: `scripts/sync-versions.ts`

- [ ] **Step 1: Update package.json for v2**

Remove all dependencies except devDependencies needed for build/test. Set peer deps to only react/react-dom. Update exports map, version to 2.0.0-alpha.0, add new scripts.

```json
{
  "name": "@annondeveloper/ui-kit",
  "version": "2.0.0-alpha.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": { "import": { "types": "./dist/esm/index.d.ts", "default": "./dist/esm/index.js" } },
    "./form": { "import": { "types": "./dist/esm/form.d.ts", "default": "./dist/esm/form.js" } },
    "./theme": { "import": { "types": "./dist/esm/theme.d.ts", "default": "./dist/esm/theme.js" } },
    "./css/theme.css": "./dist/css/theme.css",
    "./css/all.css": "./dist/css/all.css",
    "./css/components/*": "./dist/css/components/*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "scripts": {
    "build": "tsup && node scripts/extract-css.ts || true",
    "build:cli": "tsup --config tsup.cli.config.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:a11y": "vitest run --grep a11y",
    "test:bundle-size": "node scripts/check-bundle-size.ts",
    "preversion": "node scripts/sync-versions.ts",
    "postversion": "git push && git push --tags"
  }
}
```

- [ ] **Step 2: Update tsconfig.json for v2 source structure**

Ensure paths include `src/core/*`, strict mode, ES2022 target.

- [ ] **Step 3: Update tsup.config.ts with three entry points**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    form: 'src/form.ts',
    theme: 'src/theme.ts',
  },
  outDir: 'dist/esm',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = { js: '"use client";' }
  }
})
```

- [ ] **Step 4: Create directory structure with placeholder barrel exports**

Create all `src/core/*/index.ts` files with empty exports. Create `src/index.ts`, `src/form.ts`, `src/theme.ts` barrel files that re-export from core modules. Create `src/components/` and `src/domain/` directories.

- [ ] **Step 5: Create no-op placeholder scripts**

Create `scripts/extract-css.ts` as: `console.log('CSS extraction: skipped (not yet implemented)')`. Create `scripts/check-bundle-size.ts` as: `console.log('Bundle size check: skipped (not yet implemented)')`. These prevent build failures until Phase 9 implements them fully.

- [ ] **Step 6: Create scripts/sync-versions.ts**

Reads version from package.json, writes to jsr.json. Simple Node script.

- [ ] **Step 6: Update jsr.json for v2**

```json
{
  "name": "@annondeveloper/ui-kit",
  "version": "2.0.0-alpha.0",
  "exports": {
    ".": "./src/index.ts",
    "./form": "./src/form.ts",
    "./theme": "./src/theme.ts"
  },
  "publish": {
    "include": ["src/", "LICENSE", "README.md"],
    "exclude": ["src/__tests__/", "src/cli/", "**/*.stories.tsx", "**/*.test.tsx"]
  },
  "imports": {
    "react": "npm:react@^19",
    "react-dom": "npm:react-dom@^19"
  }
}
```

- [ ] **Step 7: Verify build passes with empty exports**

Run: `npm run build`
Expected: Clean build with dist/esm/index.js, dist/esm/form.js, dist/esm/theme.js

- [ ] **Step 8: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 9: Commit scaffolding**

```bash
git add -A
git commit -m "feat(v2): scaffold v2 directory structure and build system"
```

- [ ] **Step 10: Update memory and docs**

Update `memory/project_v2_progress.md` with: Phase 0 complete, build system working.
Update CLAUDE.md if any build changes were needed.

---

## Phase 1: Core Foundation — Style Engine

### Task 1.1: `css` tagged template literal and style registry

**Files:**
- Create: `src/core/styles/css-tag.ts`
- Create: `src/core/styles/registry.ts`
- Test: `src/__tests__/core/styles/css-tag.test.ts`
- Test: `src/__tests__/core/styles/registry.test.ts`

- [ ] **Step 1: Write failing test for `css` tagged template**

```typescript
// src/__tests__/core/styles/css-tag.test.ts
import { describe, it, expect } from 'vitest'
import { css } from '../../core/styles/css-tag'

describe('css tagged template', () => {
  it('returns a CSSDefinition with the raw CSS string', () => {
    const result = css`
      .ui-button { color: red; }
    `
    expect(result.id).toBeDefined()
    expect(result.css).toContain('.ui-button')
    expect(result.css).toContain('color: red')
  })

  it('generates unique IDs for different templates', () => {
    const a = css`.a { color: red; }`
    const b = css`.b { color: blue; }`
    expect(a.id).not.toBe(b.id)
  })

  it('returns same ID for same template (referential stability)', () => {
    const tmpl = css`.x { color: red; }`
    expect(tmpl.id).toBe(tmpl.id)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/core/styles/css-tag.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `css` tag and `CSSDefinition` type**

```typescript
// src/core/styles/css-tag.ts
export interface CSSDefinition {
  readonly id: string
  readonly css: string
}

let counter = 0

export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSDefinition {
  const cssText = strings.reduce((acc, str, i) =>
    acc + str + (values[i] ?? ''), '')
  const id = `ui-${counter++}`
  return { id, css: cssText.trim() }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/core/styles/css-tag.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing test for style registry**

```typescript
// src/__tests__/core/styles/registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { StyleRegistry } from '../../core/styles/registry'

describe('StyleRegistry', () => {
  let registry: StyleRegistry

  beforeEach(() => {
    registry = new StyleRegistry()
  })

  it('registers a style and increments ref count', () => {
    registry.add('test-1', '.a { color: red; }')
    expect(registry.has('test-1')).toBe(true)
    expect(registry.refCount('test-1')).toBe(1)
  })

  it('increments ref count on duplicate add', () => {
    registry.add('test-1', '.a { color: red; }')
    registry.add('test-1', '.a { color: red; }')
    expect(registry.refCount('test-1')).toBe(2)
  })

  it('decrements ref count on remove', () => {
    registry.add('test-1', '.a { color: red; }')
    registry.add('test-1', '.a { color: red; }')
    registry.remove('test-1')
    expect(registry.refCount('test-1')).toBe(1)
    expect(registry.has('test-1')).toBe(true)
  })

  it('removes style when ref count reaches zero', () => {
    registry.add('test-1', '.a { color: red; }')
    registry.remove('test-1')
    expect(registry.has('test-1')).toBe(false)
  })

  it('collects all registered CSS strings', () => {
    registry.add('a', '.a { color: red; }')
    registry.add('b', '.b { color: blue; }')
    const all = registry.collectCSS()
    expect(all).toContain('.a { color: red; }')
    expect(all).toContain('.b { color: blue; }')
  })
})
```

- [ ] **Step 6: Implement StyleRegistry**

```typescript
// src/core/styles/registry.ts
interface StyleEntry {
  css: string
  refCount: number
  sheet?: CSSStyleSheet
}

export class StyleRegistry {
  private entries = new Map<string, StyleEntry>()

  add(id: string, css: string): void {
    const existing = this.entries.get(id)
    if (existing) {
      existing.refCount++
      return
    }
    this.entries.set(id, { css, refCount: 1 })
  }

  remove(id: string): void {
    const entry = this.entries.get(id)
    if (!entry) return
    entry.refCount--
    if (entry.refCount <= 0) {
      this.entries.delete(id)
    }
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }

  refCount(id: string): number {
    return this.entries.get(id)?.refCount ?? 0
  }

  collectCSS(): string {
    return Array.from(this.entries.values()).map(e => e.css).join('\n')
  }
}
```

- [ ] **Step 7: Run all style tests**

Run: `npx vitest run src/__tests__/core/styles/`
Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add src/core/styles/ src/__tests__/core/styles/
git commit -m "feat(v2): css tagged template and style registry with ref counting"
```

### Task 1.2: `useStyles()` hook with adoptedStyleSheets

**Files:**
- Create: `src/core/styles/use-styles.ts`
- Create: `src/core/styles/dom-injector.ts`
- Test: `src/__tests__/core/styles/use-styles.test.tsx`
- Modify: `src/core/styles/index.ts`

- [ ] **Step 1: Write failing test for useStyles**

```typescript
// src/__tests__/core/styles/use-styles.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStyles } from '../../core/styles/use-styles'
import { css } from '../../core/styles/css-tag'

const testStyles = css`
  .ui-test { color: red; }
`

describe('useStyles', () => {
  it('returns a className builder function', () => {
    const { result } = renderHook(() => useStyles('test', testStyles))
    expect(typeof result.current).toBe('function')
  })

  it('className builder joins class names with ui- prefix', () => {
    const { result } = renderHook(() => useStyles('test', testStyles))
    const cls = result.current
    expect(cls('root')).toContain('ui-test')
  })

  it('className builder handles conditional classes', () => {
    const { result } = renderHook(() => useStyles('test', testStyles))
    const cls = result.current
    expect(cls('root', 'active')).toContain('ui-test')
    expect(cls('root', 'active')).toContain('ui-test--active')
  })

  it('className builder filters falsy values', () => {
    const { result } = renderHook(() => useStyles('test', testStyles))
    const cls = result.current
    expect(cls('root', false && 'active', undefined, null)).toBe('ui-test')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/core/styles/use-styles.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement DOM injector (adoptedStyleSheets + fallback)**

```typescript
// src/core/styles/dom-injector.ts
const supportsAdopted = typeof document !== 'undefined' &&
  'adoptedStyleSheets' in Document.prototype

export function injectCSS(id: string, cssText: string): void {
  if (typeof document === 'undefined') return // SSR

  if (supportsAdopted) {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(cssText)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
    sheetMap.set(id, sheet)
  } else {
    const style = document.createElement('style')
    style.setAttribute('data-ui-style', id)
    style.textContent = cssText
    document.head.appendChild(style)
  }
}

export function removeCSS(id: string): void {
  if (typeof document === 'undefined') return

  if (supportsAdopted) {
    const sheet = sheetMap.get(id)
    if (sheet) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== sheet)
      sheetMap.delete(id)
    }
  } else {
    const style = document.querySelector(`style[data-ui-style="${id}"]`)
    style?.remove()
  }
}

const sheetMap = new Map<string, CSSStyleSheet>()
```

- [ ] **Step 4: Implement useStyles hook**

```typescript
// src/core/styles/use-styles.ts
import { useEffect } from 'react'
import type { CSSDefinition } from './css-tag'
import { StyleRegistry } from './registry'
import { injectCSS, removeCSS } from './dom-injector'

const globalRegistry = new StyleRegistry()

export function useStyles(name: string, def: CSSDefinition) {
  useEffect(() => {
    if (!globalRegistry.has(def.id)) {
      injectCSS(def.id, def.css)
    }
    globalRegistry.add(def.id, def.css)

    return () => {
      globalRegistry.remove(def.id)
      if (!globalRegistry.has(def.id)) {
        removeCSS(def.id)
      }
    }
  }, [def.id, def.css])

  return (...modifiers: (string | false | null | undefined)[]) => {
    const base = `ui-${name}`
    const classes = [base]
    for (const mod of modifiers) {
      if (mod) classes.push(`${base}--${mod}`)
    }
    return classes.join(' ')
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run src/__tests__/core/styles/`
Expected: All PASS

- [ ] **Step 6: Update barrel export**

```typescript
// src/core/styles/index.ts
export { css, type CSSDefinition } from './css-tag'
export { useStyles } from './use-styles'
export { StyleRegistry } from './registry'
export { injectCSS, removeCSS } from './dom-injector'
```

- [ ] **Step 7: Commit**

```bash
git add src/core/styles/ src/__tests__/core/styles/
git commit -m "feat(v2): useStyles hook with adoptedStyleSheets and fallback injection"
```

### Task 1.3: SSR StyleCollector

**Files:**
- Create: `src/core/styles/ssr.ts`
- Create: `src/core/styles/style-context.tsx`
- Test: `src/__tests__/core/styles/ssr.test.tsx`

- [ ] **Step 1: Write failing test for StyleCollector**

Test that StyleCollector gathers CSS strings during render, deduplicates by ID, and outputs concatenated CSS.

- [ ] **Step 2: Implement StyleCollector and StyleProvider context**

`StyleCollector` class with `add(id, css)` and `collect()` methods. `StyleProvider` React context that components check during SSR. `useStyles` updated to detect SSR and register with collector instead of DOM injection.

- [ ] **Step 3: Run tests and verify**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): SSR StyleCollector with React context for server rendering"
```

- [ ] **Step 5: Update memory with Phase 1 progress**

---

## Phase 1B: Core Foundation — Utilities

### Task 1.4: `cn()` utility (replaces clsx + tailwind-merge)

**Files:**
- Create: `src/core/utils/cn.ts`
- Test: `src/__tests__/core/utils/cn.test.ts`

- [ ] **Step 1: Write failing test**

Test conditional class joining: `cn('a', false && 'b', 'c')` → `'a c'`. Test object syntax: `cn('a', { b: true, c: false })` → `'a b'`. Test arrays: `cn('a', ['b', 'c'])` → `'a b c'`.

- [ ] **Step 2: Implement cn()**

Lightweight class name joiner. No Tailwind merge logic (not needed with `@layer` approach — cascade handles specificity).

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): cn() utility replacing clsx + tailwind-merge"
```

### Task 1.5: Formatting utilities

**Files:**
- Create: `src/core/utils/format.ts`
- Test: `src/__tests__/core/utils/format.test.ts`

- [ ] **Step 1: Write failing tests for all formatters**

`fmtBytes(1024)` → `'1 KB'`, `fmtDuration(90)` → `'1m 30s'`, `fmtCompact(1234567)` → `'1.23M'`, `fmtPct(0.874)` → `'87.4%'`, `fmtRelative(Date.now() - 60000)` → `'1 minute ago'`, `fmtUptime(0.9995)` → `'99.95%'`.

All using `Intl.NumberFormat` / `Intl.RelativeTimeFormat` — locale-aware, zero dependencies.

- [ ] **Step 2: Implement all formatters**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): locale-aware formatting utilities (bytes, duration, compact, relative)"
```

### Task 1.6: Sanitizer utility

**Files:**
- Create: `src/core/utils/sanitize.ts`
- Test: `src/__tests__/core/utils/sanitize.test.ts`

- [ ] **Step 1: Write failing tests**

Test: strips `<script>` tags, strips `onerror` attributes, strips `javascript:` URLs, allows whitelisted tags (p, span, strong, em, code, a), preserves `href` with http/https only.

- [ ] **Step 2: Implement DOMParser-based sanitizer with Sanitizer API progressive enhancement**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): built-in HTML sanitizer replacing isomorphic-dompurify"
```

### Task 1.7: Color math utilities

**Files:**
- Create: `src/core/utils/color.ts`
- Test: `src/__tests__/core/utils/color.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `hexToOklch('#6366f1')` returns `{ l, c, h }`. `oklchToHex({ l: 0.65, c: 0.2, h: 270 })` round-trips. `getContrastRatio(color1, color2)` returns correct WCAG ratio. `adjustLightness(color, +0.1)` returns lighter color.

- [ ] **Step 2: Implement hex ↔ OKLCH conversion, contrast ratio, lightness adjustment**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): OKLCH color math utilities for theme generation"
```

### Task 1.7b: Clamp and misc utilities

**Files:**
- Create: `src/core/utils/clamp.ts`
- Test: `src/__tests__/core/utils/clamp.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `clamp(5, 0, 10)` → `5`. `clamp(-1, 0, 10)` → `0`. `clamp(15, 0, 10)` → `10`. Also `stripCidr('10.0.0.1/24')` → `'10.0.0.1'`.

- [ ] **Step 2: Implement clamp and misc utilities**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): clamp and misc utilities"
```

### Task 1.8: Barrel exports for utils

- [ ] **Step 1: Update `src/core/utils/index.ts` to re-export all utilities**
- [ ] **Step 2: Update `src/index.ts` to re-export from `core/utils`**
- [ ] **Step 3: Run full build and typecheck**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): wire up utils barrel exports"
```

---

## Phase 1C: Core Foundation — OKLCH Tokens & Theme

### Task 1.9: Aurora Fluid theme tokens (CSS)

**Files:**
- Create: `src/core/tokens/theme.css`
- Create: `src/core/tokens/tokens.ts` (TypeScript token type definitions)
- Test: `src/__tests__/core/tokens/tokens.test.ts`

- [ ] **Step 1: Write the Aurora Fluid theme CSS with all OKLCH tokens**

Dark mode (`:root`), light mode (`html.light`), status colors, aurora glows, shadows, radii, fluid spacing, fluid typography, motion easing. As defined in spec section 6.

- [ ] **Step 2: Write TypeScript token interface and default values**
- [ ] **Step 3: Write test verifying token completeness (all required keys present)**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): Aurora Fluid OKLCH theme tokens — dark and light modes"
```

### Task 1.10: Theme generator

**Files:**
- Create: `src/core/tokens/generator.ts`
- Test: `src/__tests__/core/tokens/generator.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `generateTheme('#6366f1')` returns all required token keys. `generateTheme('#ef4444', 'light')` returns light mode tokens. `validateContrast(theme)` returns true for default theme. `themeToCSS(theme)` returns valid CSS string with `:root { ... }`.

- [ ] **Step 2: Implement generateTheme, themeToCSS, validateContrast, applyTheme**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): OKLCH theme generator — single brand color to full palette"
```

### Task 1.10b: ThemeContext and useTheme hook

**Files:**
- Create: `src/core/tokens/theme-context.tsx`
- Test: `src/__tests__/core/tokens/theme-context.test.tsx`

- [ ] **Step 1: Write failing tests**

Test: `useTheme()` returns default theme. Test: `<ThemeProvider theme={customTheme}>` overrides. Test: `applyTheme()` sets CSS custom properties on `:root`.

- [ ] **Step 2: Implement ThemeContext, ThemeProvider, useTheme**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): ThemeContext and useTheme hook"
```

### Task 1.11: Theme barrel export

- [ ] **Step 1: Wire up `src/theme.ts` to export: generateTheme, applyTheme, themeToCSS, validateContrast, ThemeProvider, useTheme, token types**
- [ ] **Step 2: Build and verify `dist/esm/theme.js` is produced**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(v2): theme barrel export"
```

---

## Phase 1D: Core Foundation — Motion Engine

### Task 1.12: Spring solver

**Files:**
- Create: `src/core/motion/spring.ts`
- Test: `src/__tests__/core/motion/spring.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `solveSpring({ stiffness: 100, damping: 10, mass: 1 })` returns array of values from 0 to ~1 that oscillates and settles. Test that overshoot occurs with low damping. Test that critically damped spring doesn't overshoot. Test that `springToLinearEasing()` returns a valid CSS `linear()` string.

- [ ] **Step 2: Implement spring differential equation solver**

Solve `mx'' + cx' + kx = 0` using RK4 (Runge-Kutta 4th order) at 60fps. Generate keyframe values. Include `springToLinearEasing()` that pre-computes to CSS `linear()` function (max 40 control points for size).

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): real physics spring solver (RK4 differential equation)"
```

### Task 1.13: WAAPI `animate()` wrapper

**Files:**
- Create: `src/core/motion/animate.ts`
- Test: `src/__tests__/core/motion/animate.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `animate(el, keyframes, options)` returns an `Animation` object. Test that it applies keyframes. Test cancellation. Test `finished` promise resolves.

- [ ] **Step 2: Implement animate() wrapper**

Thin wrapper over `Element.animate()` with: easing presets (spring, bounce from pre-computed `linear()`), auto-commit of final styles, `finished` promise, `cancel()`.

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): WAAPI animate() wrapper with spring easing presets"
```

### Task 1.13b: Physics decay solver

**Files:**
- Create: `src/core/motion/physics.ts`
- Test: `src/__tests__/core/motion/physics.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `decay({ velocity: 800, deceleration: 0.998 })` returns decreasing values approaching rest. Test: `gravity({ velocity: -500 })` follows parabolic arc. Test that decay respects momentum from gesture release.

- [ ] **Step 2: Implement physics() solver (decay, gravity, momentum)**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): physics decay/gravity solver for gesture momentum"
```

### Task 1.14: Timeline orchestration

**Files:**
- Create: `src/core/motion/timeline.ts`
- Test: `src/__tests__/core/motion/timeline.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `timeline().add(anim1).add(anim2, '-100ms')` creates sequential animations with overlap. Test `play()`, `pause()`, `reverse()`, `seek()`. Test `playbackRate` adjustment. Test `label()` and label-relative offsets.

- [ ] **Step 2: Implement Timeline class**

Manages an array of WAAPI `Animation` objects with calculated `startTime` offsets. Supports relative offsets (`'-100ms'`, `'+=50ms'`), labels, and playback control.

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): animation timeline orchestration (GSAP timeline replacement)"
```

### Task 1.15: Stagger utility

**Files:**
- Create: `src/core/motion/stagger.ts`
- Test: `src/__tests__/core/motion/stagger.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `computeStaggerDelays(10, { each: 50, from: 'start' })` returns `[0, 50, 100, ...]`. Test `from: 'center'` distributes from middle outward. Test `from: 'edges'`. Test `grid: [4, 3]` calculates 2D distances.

- [ ] **Step 2: Implement stagger delay calculator and `stagger()` animation function**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): stagger animation with grid, center, edges, random patterns"
```

### Task 1.16: Scroll observer

**Files:**
- Create: `src/core/motion/scroll.ts`
- Test: `src/__tests__/core/motion/scroll.test.ts`

- [ ] **Step 1: Write failing tests**

Test: `useScrollReveal(ref)` creates observer. Test `scrollScene()` config parsing. Test that CSS `animation-timeline` feature detection works.

- [ ] **Step 2: Implement scroll observer with CSS scroll-driven fallback**

Check `CSS.supports('animation-timeline', 'view()')`. If supported, apply CSS classes. If not, use `IntersectionObserver` to trigger animations.

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): scroll observer with CSS animation-timeline progressive enhancement"
```

### Task 1.17: FLIP, TextSplitter, morphPath, MotionController

**Files:**
- Create: `src/core/motion/flip.ts`
- Create: `src/core/motion/text-splitter.tsx`
- Create: `src/core/motion/morph.ts`
- Create: `src/core/motion/controller.ts`
- Test: `src/__tests__/core/motion/flip.test.ts`
- Test: `src/__tests__/core/motion/text-splitter.test.tsx`
- Test: `src/__tests__/core/motion/morph.test.ts`
- Test: `src/__tests__/core/motion/controller.test.ts`

- [ ] **Step 1: Write failing tests for FLIP**

Test: `flip.capture(elements)` stores bounding rects. `flip.play(state, options)` creates animations.

- [ ] **Step 2: Implement FLIP with View Transitions progressive enhancement**
- [ ] **Step 3: Write failing tests for TextSplitter**

Test: `<TextSplitter text="Hello" splitBy="chars" />` renders 5 spans. Test `aria-label` on wrapper.

- [ ] **Step 4: Implement TextSplitter component**
- [ ] **Step 5: Write failing tests for morphPath**

Test: normalizes point count between two paths. Generates interpolated intermediate path.

- [ ] **Step 6: Implement morphPath**
- [ ] **Step 7: Write failing tests for MotionController**

Test: `motion.pause()` pauses all tracked animations. `motion.playbackRate = 0.5` affects all.

- [ ] **Step 8: Implement MotionController**
- [ ] **Step 9: Run all motion tests**

Run: `npx vitest run src/__tests__/core/motion/`
Expected: All PASS

- [ ] **Step 10: Commit**

```bash
git commit -m "feat(v2): FLIP, TextSplitter, morphPath, MotionController — complete motion engine"
```

### Task 1.18: `useMotionLevel()` hook

**Files:**
- Create: `src/core/motion/use-motion-level.ts`
- Create: `src/core/motion/motion-context.tsx`
- Test: `src/__tests__/core/motion/use-motion-level.test.tsx`

- [ ] **Step 1: Write failing test for motion cascade**

Test: default returns 3. Test with provider `<MotionContext.Provider value={1}>` returns 1. Test prop override returns prop value. Test `prefers-reduced-motion` returns 0.

- [ ] **Step 2: Implement MotionContext and useMotionLevel**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): motion level context with OS/provider/prop cascade"
```

### Task 1.19: Motion barrel export

- [ ] **Step 1: Update `src/core/motion/index.ts` with all exports**
- [ ] **Step 2: Update `src/index.ts` barrel**
- [ ] **Step 3: Run full build**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): wire up motion engine barrel exports"
```

- [ ] **Step 5: Update memory with Phase 1D progress**

---

## Phase 1E: Core Foundation — Input Engine

### Task 1.20: Unified pointer system

**Files:**
- Create: `src/core/input/pointer.ts`
- Test: `src/__tests__/core/input/pointer.test.ts`

- [ ] **Step 1: Write failing tests for usePointer**
- [ ] **Step 2: Implement usePointer hook (PointerEvent-based, mouse/touch/pen unified)**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): unified pointer system (mouse/touch/pen via PointerEvent)"
```

### Task 1.21: Gesture recognition

**Files:**
- Create: `src/core/input/gestures.ts`
- Test: `src/__tests__/core/input/gestures.test.ts`

- [ ] **Step 1: Write failing tests for swipe, pinch, long-press detection**
- [ ] **Step 2: Implement useGesture hook**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): gesture recognition (swipe, pinch, rotate, long-press, double-tap)"
```

### Task 1.22: Focus management, gamepad, haptics

**Files:**
- Create: `src/core/input/focus.ts`
- Create: `src/core/input/gamepad.ts`
- Create: `src/core/input/haptics.ts`
- Test: `src/__tests__/core/input/focus.test.ts`
- Test: `src/__tests__/core/input/gamepad.test.ts`
- Test: `src/__tests__/core/input/haptics.test.ts`

- [ ] **Step 1: Implement and test focus method detection (keyboard vs pointer vs programmatic)**
- [ ] **Step 2: Implement and test gamepad navigation hook**
- [ ] **Step 3: Implement and test haptic feedback utility**
- [ ] **Step 4: Implement and test multitouch zone support (src/core/input/multitouch.ts)**
- [ ] **Step 5: Wire up input barrel export**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat(v2): focus management, gamepad navigation, haptic feedback, multitouch"
```

---

## Phase 1F: Core Foundation — Accessibility Primitives

### Task 1.23: useFocusTrap

**Files:**
- Create: `src/core/a11y/focus-trap.ts`
- Test: `src/__tests__/core/a11y/focus-trap.test.tsx`

- [ ] **Step 1: Write failing tests**

Test: Tab key cycles within container. Test: Shift+Tab reverse cycles. Test: focus returns to trigger on deactivate. Test: initial focus on first focusable element.

- [ ] **Step 2: Implement useFocusTrap**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): useFocusTrap — keyboard focus cycling for dialogs and sheets"
```

### Task 1.24: useRovingTabindex

**Files:**
- Create: `src/core/a11y/roving-tabindex.ts`
- Test: `src/__tests__/core/a11y/roving-tabindex.test.tsx`

- [ ] **Step 1: Write failing tests**

Test: Arrow keys move focus between items. Test: Home/End jump to first/last. Test: loop wraps around. Test: horizontal vs vertical orientation.

- [ ] **Step 2: Implement useRovingTabindex**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): useRovingTabindex — arrow key navigation for menus, tabs, radios"
```

### Task 1.25: useLiveRegion, useStableId, useAnchorPosition

**Files:**
- Create: `src/core/a11y/live-region.ts`
- Create: `src/core/a11y/stable-id.ts`
- Create: `src/core/a11y/anchor-position.ts`
- Tests for each

- [ ] **Step 1: Implement and test useLiveRegion (aria-live announcements)**
- [ ] **Step 2: Implement and test useStableId (SSR-safe ID generation)**
- [ ] **Step 3: Implement and test useAnchorPosition (JS fallback for CSS anchor positioning)**
- [ ] **Step 4: Wire up a11y barrel export**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat(v2): live regions, stable IDs, anchor position fallback — a11y complete"
```

---

## Phase 1G: Core Foundation — Form Engine

### Task 1.26: Validators

**Files:**
- Create: `src/core/forms/validators.ts`
- Test: `src/__tests__/core/forms/validators.test.ts`

- [ ] **Step 1: Write failing tests for all validators**

`v.required()`, `v.email()`, `v.minLength(3)`, `v.max(100)`, `v.pattern(/regex/)`, `v.match('password')`, `v.pipe()` composition, `v.custom()`, `v.async()` with debounce.

- [ ] **Step 2: Implement all validators**
- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): form validators — required, email, minLength, pattern, pipe, async"
```

### Task 1.27: createForm and useForm

**Files:**
- Create: `src/core/forms/create-form.ts`
- Create: `src/core/forms/use-form.ts`
- Create: `src/core/forms/form-context.tsx`
- Test: `src/__tests__/core/forms/create-form.test.ts`
- Test: `src/__tests__/core/forms/use-form.test.tsx`

- [ ] **Step 1: Write failing tests for createForm**

Test: returns form config with field definitions. Test: initial values are set.

- [ ] **Step 2: Implement createForm**
- [ ] **Step 3: Write failing tests for useForm**

Test: `form.values` reflects initial values. Test: `form.setValue('email', 'test@test.com')` updates. Test: `form.errors` populated after validation. Test: `form.handleSubmit()` calls onSubmit. Test: `form.submitting` is true during async submit. Test: `form.reset()` restores initial values.

- [ ] **Step 4: Implement useForm hook**
- [ ] **Step 5: Implement FormContext provider**
- [ ] **Step 6: Run tests, commit**

```bash
git commit -m "feat(v2): createForm + useForm — core form state management"
```

### Task 1.28: `<Form>` component and `<FieldArray>`

**Files:**
- Create: `src/core/forms/form-component.tsx`
- Create: `src/core/forms/field-array.tsx`
- Test: `src/__tests__/core/forms/form-component.test.tsx`
- Test: `src/__tests__/core/forms/field-array.test.tsx`

- [ ] **Step 1: Write failing tests for Form component**

Test: renders `<form>` element. Test: children can access form context. Test: Enter key submits. Test: submit prevention when invalid.

- [ ] **Step 2: Implement Form component**
- [ ] **Step 3: Write failing tests for FieldArray**

Test: `append()` adds item. Test: `remove(index)` removes. Test: `move(from, to)` reorders. Test: field keys remain stable.

- [ ] **Step 4: Implement FieldArray**
- [ ] **Step 5: Wire up form barrel exports**
- [ ] **Step 6: Run all form tests**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(v2): Form component + FieldArray — form engine complete"
```

---

## Phase 1H: Core Foundation — Icons

### Task 1.29: Icon system and ~50 SVG icons

**Files:**
- Create: `src/core/icons/icon.tsx` (Icon component)
- Create: `src/core/icons/paths.ts` (SVG path data for all icons)
- Test: `src/__tests__/core/icons/icon.test.tsx`

- [ ] **Step 1: Write failing tests**

Test: `<Icon name="check" />` renders SVG. Test: `size="sm"` applies correct dimensions. Test: custom `className` is forwarded. Test: `aria-hidden="true"` by default. Test: all 50 icon names are valid.

- [ ] **Step 2: Implement Icon component**

Single component that renders SVG with path data from a map. Sizes: `sm` (16px), `md` (20px), `lg` (24px). `aria-hidden="true"` by default (decorative). `role="img"` + `aria-label` when label is provided.

- [ ] **Step 3: Write all 50 icon SVG paths**

chevron-down, chevron-up, chevron-left, chevron-right, check, x, plus, minus, search, filter, sort-asc, sort-desc, arrow-up, arrow-down, arrow-left, arrow-right, external-link, copy, clipboard-check, eye, eye-off, calendar, clock, refresh, loader, alert-triangle, alert-circle, info, check-circle, x-circle, trash, edit, settings, menu, more-horizontal, more-vertical, grip-vertical, upload, download, file, folder, image, link, code, terminal, git-branch, git-commit, activity, bar-chart, zap

- [ ] **Step 4: Run tests, commit**

```bash
git commit -m "feat(v2): Icon system with 50 built-in SVG icons"
```

### Task 1.30: ComponentErrorBoundary

**Files:**
- Create: `src/core/utils/error-boundary.tsx`
- Test: `src/__tests__/core/utils/error-boundary.test.tsx`

- [ ] **Step 1: Write failing tests**

Test: renders children normally. Test: catches render error and shows fallback. Test: `onError` callback fires. Test: retry button re-renders children. Test: custom `fallback` prop renders instead of default.

- [ ] **Step 2: Implement ComponentErrorBoundary**

React error boundary class component with: default graceful error state, retry button, `fallback` and `onError` props, Aurora Fluid styled error display.

- [ ] **Step 3: Run tests, commit**

```bash
git commit -m "feat(v2): ComponentErrorBoundary for domain component resilience"
```

### Task 1.31: Visual regression test setup (Playwright)

**Files:**
- Create: `playwright.config.ts`
- Create: `src/__tests__/visual/setup.ts`
- Create: `src/__tests__/visual/.gitkeep`

- [ ] **Step 1: Install Playwright as devDependency**

```bash
npm install -D @playwright/test
```

- [ ] **Step 2: Create Playwright config**

Configure for screenshot comparison: chromium only, screenshot directory, threshold, dark + light mode variants, default + compact density.

- [ ] **Step 3: Create visual test helper**

Helper that renders a component in a Playwright browser, takes screenshots in dark/light and default/compact, and compares to baselines.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): Playwright visual regression test infrastructure"
```

### Task 1.32: Type tests setup

**Files:**
- Create: `src/__tests__/types/setup.ts`
- Modify: `package.json` (add `test:types` script)

- [ ] **Step 1: Install `expect-type` as devDependency**
- [ ] **Step 2: Create type test infrastructure**

Will be used by component tasks to validate: discriminated unions, forwardRef types, generic props, icon slot types.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(v2): type test infrastructure with expect-type"
```

---

## Phase 1 Checkpoint

- [ ] **Run full test suite**

Run: `npx vitest run`
Expected: All core tests pass

- [ ] **Run build**

Run: `npm run build`
Expected: Clean build, dist/esm/ contains index.js, form.js, theme.js with .d.ts files

- [ ] **Run typecheck**

Run: `npm run typecheck`
Expected: Zero errors

- [ ] **Update documentation**

Update README.md with v2 core API documentation (style engine, motion, tokens, a11y, forms, icons, input).

- [ ] **Commit checkpoint**

```bash
git commit -m "milestone(v2): Phase 1 complete — all core foundations built and tested"
```

- [ ] **Update memory file**

Write to `memory/project_v2_progress.md`:
- Phase 1 complete
- All core engines built: styles, motion, tokens, a11y, forms, icons, input
- Test count and coverage
- Any insights or failures encountered
- Next: Phase 2 — Primitive Components

---

## Phase 2: Primitive Components

### Task 2.1: Button

**Files:**
- Create: `src/components/button.tsx`
- Test: `src/__tests__/components/button.test.tsx`
- Test: `src/__tests__/components/button.a11y.test.tsx`
- Docs: Update README.md with Button API

- [ ] **Step 1: Write failing render tests**

Test: renders `<button>`. Test all variants: primary, secondary, ghost, danger. Test all sizes: sm, md, lg. Test: loading state shows spinner. Test: disabled state. Test: icon and iconEnd slots render. Test: forwardRef works.

- [ ] **Step 2: Write failing a11y tests**

Test: no axe violations. Test: focusable via keyboard. Test: activates on Enter and Space. Test: disabled is not focusable (if using `aria-disabled` vs `disabled`). Test: loading announces to screen reader.

- [ ] **Step 3: Write failing interaction tests**

Test: onClick fires. Test: rapid clicks debounced. Test: disabled doesn't fire. Test: type="submit" submits form.

- [ ] **Step 4: Implement Button component**

Use `useStyles()` for scoped CSS. Use `useMotionLevel()` for press animation. Debounce clicks. Icon slots accept ReactNode. Aurora Fluid styling with glow focus ring.

- [ ] **Step 5: Run all Button tests**

Expected: All PASS

- [ ] **Step 6: Update barrel export and README**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat(v2): Button — all variants, physics press, debounce, a11y tested"
```

### Task 2.2–2.14: Remaining Primitives

Each follows the same pattern as Button: failing tests → a11y tests → interaction tests → implement → barrel export → docs → commit.

**Task 2.2: Badge** — pulse animation, counter morph, dot indicator
- [ ] Write failing tests (render, a11y, variants, counter morph)
- [ ] Implement with Aurora Fluid styling, update barrel + docs
- [ ] Commit: `feat(v2): Badge — pulse, counter morph, dot indicator`

**Task 2.3: Avatar** — initials generator, status dot, group stacking
- [ ] Write failing tests (render, a11y, initials fallback, image error, group)
- [ ] Implement with Aurora Fluid styling, update barrel + docs
- [ ] Commit: `feat(v2): Avatar — initials, status dot, group stacking`

**Task 2.4: Card** — aurora glow, cursor-tracking, container-query responsive
- [ ] Write failing tests (render, a11y, container queries, polymorphic `as` prop)
- [ ] Implement with aurora glow ::before, cursor-tracking (level 3), update barrel + docs
- [ ] Commit: `feat(v2): Card — aurora glow, cursor-tracking, container-query`

**Task 2.5: Skeleton** — aurora shimmer, content morph, pre-sized
- [ ] Write failing tests (render, variants: text/card/circle, pre-sizing)
- [ ] Implement with aurora-themed shimmer, update barrel + docs
- [ ] Commit: `feat(v2): Skeleton — aurora shimmer, content morph`

**Task 2.6: Progress** — spring-animated fill, gradient, indeterminate
- [ ] Write failing tests (render, a11y, determinate/indeterminate, aria-valuenow)
- [ ] Implement with spring fill animation, update barrel + docs
- [ ] Commit: `feat(v2): Progress — spring fill, gradient, indeterminate`

**Task 2.7: Checkbox** — animated checkmark draw, indeterminate
- [ ] Write failing tests (render, a11y, checked/unchecked/indeterminate, keyboard toggle)
- [ ] Implement with SVG checkmark draw animation, update barrel + docs
- [ ] Commit: `feat(v2): Checkbox — animated draw, indeterminate state`

**Task 2.8: RadioGroup** — animated dot slide between options
- [ ] Write failing tests (render, a11y, arrow key navigation, roving tabindex)
- [ ] Implement with dot slide animation, update barrel + docs
- [ ] Commit: `feat(v2): RadioGroup — animated dot slide, keyboard nav`

**Task 2.9: ToggleSwitch** — physics thumb slide, stretch effect
- [ ] Write failing tests (render, a11y, toggle state, keyboard, form integration)
- [ ] Implement with spring thumb physics, update barrel + docs
- [ ] Commit: `feat(v2): ToggleSwitch — physics thumb, stretch effect`

**Task 2.10: Slider** — dual-thumb, tick marks, tooltip, touch-optimized
- [ ] Write failing tests (render, a11y, single/dual thumb, keyboard, touch targets)
- [ ] Implement with usePointer, touch-optimized targets, update barrel + docs
- [ ] Commit: `feat(v2): Slider — dual-thumb, ticks, tooltip, touch`

**Task 2.11: StatusBadge** — color-coded, icon, pulse
- [ ] Write failing tests (render, variants, semantic colors)
- [ ] Implement, update barrel + docs
- [ ] Commit: `feat(v2): StatusBadge — color-coded, icon, pulse`

**Task 2.12: StatusPulse** — radiating ring animation
- [ ] Write failing tests (render, animation respects motion level)
- [ ] Implement, update barrel + docs
- [ ] Commit: `feat(v2): StatusPulse — radiating ring animation`

**Task 2.13: SuccessCheckmark** — animated draw + burst particles
- [ ] Write failing tests (render, animation sequence, motion level degradation)
- [ ] Implement with SVG draw + particle burst (level 3), update barrel + docs
- [ ] Commit: `feat(v2): SuccessCheckmark — animated draw, burst particles`

**Task 2.14: AnimatedCounter** — spring physics number morphing
- [ ] Write failing tests (render, number transition, formatting, spring physics)
- [ ] Implement with spring solver for value transitions, update barrel + docs
- [ ] Commit: `feat(v2): AnimatedCounter — spring physics number morphing`

Each task:
1. Write failing tests (render + a11y + interaction)
2. Implement with useStyles, useMotionLevel, Aurora Fluid CSS
3. Run tests
4. Update barrel + docs
5. Commit with descriptive message

- [ ] **Phase 2 Checkpoint: All 14 primitives built, tested, documented**

```bash
git commit -m "milestone(v2): Phase 2 complete — 14 primitive components"
```

- [ ] **Update memory file with Phase 2 progress**

---

## Phase 3: Form Components (7 components)

**Task 3.1: FormInput** — auto-wiring with form engine, animated labels, error glow
- [ ] Write failing tests (render, a11y, form auto-wire, validation error display, animated label)
- [ ] Implement with form context integration, Aurora error glow, update barrel + docs
- [ ] Commit: `feat(v2): FormInput — form engine auto-wire, animated labels, error glow`

**Task 3.2: Select** — popover + anchor positioning, typeahead, virtual scroll (NO Radix)
- [ ] Write failing tests (render, a11y, keyboard nav, typeahead, open/close, form integration)
- [ ] Implement with popover API, useAnchorPosition, useRovingTabindex, update barrel + docs
- [ ] Commit: `feat(v2): Select — native popover, anchor positioning, zero Radix`

**Task 3.3: Combobox** — async search, section grouping, highlight matches, create-new
- [ ] Write failing tests (render, a11y, filtering, async, sections, activedescendant)
- [ ] Implement with input + popover + listbox pattern, update barrel + docs
- [ ] Commit: `feat(v2): Combobox — async search, sections, highlight, create-new`

**Task 3.4: ColorInput** — OKLCH picker, lightness/chroma/hue, alpha, swatches
- [ ] Write failing tests (render, a11y, hue/chroma/lightness controls, hex/oklch output)
- [ ] Implement with canvas/SVG picker, usePointer for drag, update barrel + docs
- [ ] Commit: `feat(v2): ColorInput — OKLCH picker with LCH wheels`

**Task 3.5: FileUpload** — drag zone, thumbnails, progress, multi-file
- [ ] Write failing tests (render, a11y, drag events, file selection, preview, progress)
- [ ] Implement with drag zone, thumbnail preview, update barrel + docs
- [ ] Commit: `feat(v2): FileUpload — drag zone, thumbnails, progress`

**Task 3.6: InlineEdit** — smooth transition between display and edit
- [ ] Write failing tests (render, a11y, click/double-tap to edit, escape to cancel, enter to save)
- [ ] Implement with smooth display↔edit transition, update barrel + docs
- [ ] Commit: `feat(v2): InlineEdit — smooth display/edit transition`

**Task 3.7: FilterPill** — animated add/remove, count badge, clear-all
- [ ] Write failing tests (render, a11y, add/remove animation, count, clear-all)
- [ ] Implement with stagger animation, update barrel + docs
- [ ] Commit: `feat(v2): FilterPill — animated add/remove, count badge`

Each task follows the same TDD pattern. Select and Combobox are the most complex — they use `popover` API, anchor positioning with JS fallback, roving tabindex, and virtual scroll.

- [ ] **Phase 3 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 3 complete — 7 form components"
```

- [ ] **Update memory file**

---

## Phase 4: Overlay Components (10 components)

**Task 4.1: Tooltip** — popover + anchor positioning, delay, arrow, touch-hold
- [ ] Write failing tests (render, a11y, delay, positioning, touch-hold, keyboard trigger)
- [ ] Implement with popover API + CSS anchor + JS fallback, update barrel + docs
- [ ] Commit: `feat(v2): Tooltip — native popover, anchor positioning, touch-hold`

**Task 4.2: NativeTooltip** — styled native tooltip via popover
- [ ] Write failing tests (render, progressive enhancement from title attr)
- [ ] Implement, update barrel + docs
- [ ] Commit: `feat(v2): NativeTooltip — styled native tooltip`

**Task 4.3: Popover** — arrow, nested, focus management
- [ ] Write failing tests (render, a11y, nested, arrow, dismiss on outside click, focus)
- [ ] Implement with popover API + anchor positioning + useFocusTrap, update barrel + docs
- [ ] Commit: `feat(v2): Popover — arrow, nested, focus management`

**Task 4.4: Dialog** — `<dialog>`, @starting-style entry/exit, nested, scroll lock
- [ ] Write failing tests (render, a11y, focus trap, escape close, nested, scroll lock)
- [ ] Implement with native `<dialog>` + showModal() + @starting-style, update barrel + docs
- [ ] Commit: `feat(v2): Dialog — native dialog, entry/exit animation, zero Radix`

**Task 4.5: ConfirmDialog** — preset confirm/cancel, destructive variant
- [ ] Write failing tests (render, a11y, confirm/cancel callbacks, destructive variant)
- [ ] Implement extending Dialog, update barrel + docs
- [ ] Commit: `feat(v2): ConfirmDialog — preset confirm/cancel, destructive`

**Task 4.6: Sheet** — side panel, swipe-to-dismiss physics, responsive bottom sheet
- [ ] Write failing tests (render, a11y, left/right/bottom positions, swipe dismiss, responsive)
- [ ] Implement with `<dialog>` + physics swipe via useGesture, update barrel + docs
- [ ] Commit: `feat(v2): Sheet — side panel, swipe physics, responsive bottom sheet`

**Task 4.7: DropdownMenu** — submenu, keyboard nav, shortcut display
- [ ] Write failing tests (render, a11y, keyboard nav, submenu, shortcut hints)
- [ ] Implement with popover + role="menu" + useRovingTabindex, update barrel + docs
- [ ] Commit: `feat(v2): DropdownMenu — submenu, keyboard nav, shortcuts`

**Task 4.8: Toast** — popover="manual", queue, stacking, swipe dismiss (NO sonner)
- [ ] Write failing tests (render, a11y, queue, stacking, auto-dismiss timer, swipe)
- [ ] Implement with popover="manual" + role="status", update barrel + docs
- [ ] Commit: `feat(v2): Toast — native popover, queue, stacking, zero sonner`

**Task 4.9: CommandBar** — dialog + combobox, fuzzy search, sections, shortcuts
- [ ] Write failing tests (render, a11y, fuzzy search, keyboard nav, sections, shortcut registration)
- [ ] Implement with `<dialog>` + combobox pattern, update barrel + docs
- [ ] Commit: `feat(v2): CommandBar — fuzzy search, sections, keyboard shortcuts`

**Task 4.10: NotificationStack** — stacked cards, swipe, group, mark-all-read
- [ ] Write failing tests (render, a11y, stacking, swipe dismiss, grouping)
- [ ] Implement with stagger animation, useGesture swipe, update barrel + docs
- [ ] Commit: `feat(v2): NotificationStack — stacked, swipe, group, mark-all-read`

- [ ] **Phase 4 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 4 complete — 10 overlay components (zero Radix)"
```

- [ ] **Update memory file**

---

## Phase 5: Layout & Navigation (6 components)

**Task 5.1: Tabs** — animated underline slide, overflow scroll, lazy panels
- [ ] Write failing tests (render, a11y, arrow key roving tabindex, lazy panels, overflow scroll)
- [ ] Implement with role="tablist", animated underline FLIP, update barrel + docs
- [ ] Commit: `feat(v2): Tabs — animated underline, overflow scroll, lazy panels`

**Task 5.2: StepWizard** — animated transitions, validation gates, responsive
- [ ] Write failing tests (render, a11y, step transitions, validation gates, responsive collapse)
- [ ] Implement with FLIP step transitions, form validation gates, update barrel + docs
- [ ] Commit: `feat(v2): StepWizard — animated transitions, validation gates`

**Task 5.3: ScrollReveal** — CSS animation-timeline, stagger, parallax
- [ ] Write failing tests (render, scroll-triggered visibility, motion level degradation)
- [ ] Implement with CSS animation-timeline + IO fallback, update barrel + docs
- [ ] Commit: `feat(v2): ScrollReveal — CSS scroll-driven, stagger, parallax`

**Task 5.4: InfiniteScroll** — sentinel, bi-directional, virtual, pull-to-refresh
- [ ] Write failing tests (render, sentinel trigger, bi-directional, pull-to-refresh gesture)
- [ ] Implement with IntersectionObserver sentinel, useGesture, update barrel + docs
- [ ] Commit: `feat(v2): InfiniteScroll — sentinel, bi-directional, pull-to-refresh`

**Task 5.5: ViewTransitionLink** — cross-page morphing with fallback
- [ ] Write failing tests (render, anchor behavior, transition name assignment)
- [ ] Implement with View Transitions API + instant fallback, update barrel + docs
- [ ] Commit: `feat(v2): ViewTransitionLink — cross-page morphing`

**Task 5.6: ResponsiveCard** — container-query self-adapting
- [ ] Write failing tests (render, container-query breakpoints, layout shifts)
- [ ] Implement with container-type: inline-size, update barrel + docs
- [ ] Commit: `feat(v2): ResponsiveCard — container-query self-adapting`

- [ ] **Phase 5 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 5 complete — 6 layout & navigation components"
```

- [ ] **Update memory file**

---

## Phase 6: Data Components (9 components)

**Task 6.1: DataTable** — virtual scroll, column resize, sort, filter, pin, export, keyboard nav, responsive card-mode
- [ ] Write failing tests (render, a11y, sort, filter, keyboard grid nav, virtual scroll, responsive card mode)
- [ ] Implement core table with virtual scroll, column resize, sort, pin, export
- [ ] Implement responsive card mode + keyboard nav, update barrel + docs
- [ ] Commit: `feat(v2): DataTable — virtual scroll, sort, filter, pin, keyboard, responsive`

**Task 6.2: SmartTable** — DataTable + built-in search, filter pills, pagination, column toggle
- [ ] Write failing tests (render, a11y, search, pagination, column toggle)
- [ ] Implement extending DataTable with pre-wired controls, update barrel + docs
- [ ] Commit: `feat(v2): SmartTable — DataTable + search, filters, pagination`

**Task 6.3: TreeView** — lazy load, drag reparenting, keyboard nav, indent guides
- [ ] Write failing tests (render, a11y, expand/collapse, keyboard tree pattern, lazy load)
- [ ] Implement with role="tree", useRovingTabindex, lazy branches, update barrel + docs
- [ ] Commit: `feat(v2): TreeView — lazy load, drag reparent, keyboard nav`

**Task 6.4: SortableList** — physics drag, touch/mouse/keyboard reorder
- [ ] Write failing tests (render, a11y, drag reorder, keyboard Alt+Arrow, touch drag)
- [ ] Implement with usePointer + spring physics drag, update barrel + docs
- [ ] Commit: `feat(v2): SortableList — physics drag, multi-input reorder`

**Task 6.5: KanbanColumn** — cross-column drag, WIP limits, swimlanes
- [ ] Write failing tests (render, a11y, cross-column drag, WIP limit enforcement)
- [ ] Implement with physics drag, cross-column detection, update barrel + docs
- [ ] Commit: `feat(v2): KanbanColumn — cross-column drag, WIP limits`

**Task 6.6: TruncatedText** — line-clamp, expand, tooltip
- [ ] Write failing tests (render, truncation, expand/collapse, tooltip on hover)
- [ ] Implement with CSS line-clamp + JS expand detection, update barrel + docs
- [ ] Commit: `feat(v2): TruncatedText — line-clamp, expand, tooltip`

**Task 6.7: CopyBlock** — syntax highlighting (built-in tokenizer), line numbers, copy
- [ ] Write failing tests (render, a11y, copy button, line numbers, syntax tokens)
- [ ] Implement with built-in regex tokenizer (JS/TS/CSS/JSON/bash), update barrel + docs
- [ ] Commit: `feat(v2): CopyBlock — built-in syntax highlighting, line numbers`

**Task 6.8: DiffViewer** — side-by-side + unified, line highlights, fold
- [ ] Write failing tests (render, side-by-side mode, unified mode, fold unchanged)
- [ ] Implement with diff algorithm + dual view modes, update barrel + docs
- [ ] Commit: `feat(v2): DiffViewer — side-by-side, unified, fold unchanged`

**Task 6.9: EmptyState** — illustrated placeholder, action, responsive
- [ ] Write failing tests (render, a11y, action button, responsive layout)
- [ ] Implement with Aurora Fluid styled placeholder, update barrel + docs
- [ ] Commit: `feat(v2): EmptyState — illustrated placeholder, action button`

- [ ] **Phase 6 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 6 complete — 9 data components"
```

- [ ] **Update memory file**

---

## Phase 7: Domain — Monitoring & Metrics (11 components)

**Task 7.1: MetricCard** — sparkline, trend, threshold, density-aware, container-query
- [ ] Write failing tests (render, a11y, loading/error/empty states, density variants, container-query)
- [ ] Implement with ComponentErrorBoundary wrapper, container-query, update barrel + docs
- [ ] Commit: `feat(v2): MetricCard — sparkline, trend, threshold, density-aware`

**Task 7.2: Sparkline** — canvas/SVG, spring data updates, gradient, tooltip
- [ ] Write failing tests (render, data update animation, tooltip on hover, responsive sizing)
- [ ] Implement with SVG path + spring morphPath for data transitions, update barrel + docs
- [ ] Commit: `feat(v2): Sparkline — SVG, spring data updates, gradient tooltip`

**Task 7.3: ThresholdGauge** — SVG arc, animated fill, needle physics
- [ ] Write failing tests (render, a11y, value ranges, color zones, responsive)
- [ ] Implement with SVG arc + spring needle animation, update barrel + docs
- [ ] Commit: `feat(v2): ThresholdGauge — SVG arc, needle physics, color zones`

**Task 7.4: UtilizationBar** — segmented, animated, threshold markers
- [ ] Write failing tests (render, a11y, segments, threshold lines, tooltip per segment)
- [ ] Implement with spring-animated fill, update barrel + docs
- [ ] Commit: `feat(v2): UtilizationBar — segmented, animated, threshold markers`

**Task 7.5: SeverityTimeline** — vertical/horizontal, expandable, live tail
- [ ] Write failing tests (render, a11y, orientation, expand events, live tail)
- [ ] Implement with ErrorBoundary, stagger animations, update barrel + docs
- [ ] Commit: `feat(v2): SeverityTimeline — vertical/horizontal, expandable, live tail`

**Task 7.6: LogViewer** — virtual scroll, ANSI parsing, regex search, auto-tail
- [ ] Write failing tests (render, a11y, virtual scroll, ANSI colors, search, filter, auto-tail)
- [ ] Implement with virtual scroll, built-in ANSI parser, regex search, update barrel + docs
- [ ] Commit: `feat(v2): LogViewer — virtual scroll, ANSI parsing, regex search`

**Task 7.7: PortStatusGrid** — dense grid, tooltip, bulk status
- [ ] Write failing tests (render, a11y, dense grid layout, tooltip per port)
- [ ] Implement with CSS grid, update barrel + docs
- [ ] Commit: `feat(v2): PortStatusGrid — dense grid, tooltip, bulk status`

**Task 7.8: PipelineStage** — connected stages, animated progress, status
- [ ] Write failing tests (render, a11y, stage connections, animated progress, status icons)
- [ ] Implement with spring progress animation, update barrel + docs
- [ ] Commit: `feat(v2): PipelineStage — connected stages, animated progress`

**Task 7.9: UptimeTracker** — 90-day bar, tooltip, SLA calc
- [ ] Write failing tests (render, a11y, 90-day bars, tooltip, SLA percentage)
- [ ] Implement with CSS grid bars, update barrel + docs
- [ ] Commit: `feat(v2): UptimeTracker — 90-day bar, tooltip, SLA calc`

**Task 7.10: TimeRangeSelector** — presets, custom range, brush
- [ ] Write failing tests (render, a11y, preset buttons, custom range, brush selection)
- [ ] Implement with dual slider + preset buttons, update barrel + docs
- [ ] Commit: `feat(v2): TimeRangeSelector — presets, custom range, brush`

**Task 7.11: HeatmapCalendar** — OKLCH intensity, tooltip, responsive months
- [ ] Write failing tests (render, a11y, OKLCH intensity scale, tooltip, responsive month count)
- [ ] Implement with CSS grid, OKLCH intensity mapping, update barrel + docs
- [ ] Commit: `feat(v2): HeatmapCalendar — OKLCH intensity, tooltip, responsive`

- [ ] **Phase 7 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 7 complete — 11 monitoring & metrics components"
```

- [ ] **Update memory file**

---

## Phase 8: Domain — AI & Real-Time (5 components)

**Task 8.1: StreamingText** — token-by-token, cursor, markdown, code blocks
- [ ] Write failing tests (render, a11y, token streaming, cursor blink, markdown parsing)
- [ ] Implement with built-in sanitizer, ErrorBoundary, update barrel + docs
- [ ] Commit: `feat(v2): StreamingText — token-by-token, cursor, markdown`

**Task 8.2: TypingIndicator** — physics-bouncing dots, avatar
- [ ] Write failing tests (render, a11y live region, dot animation, avatar)
- [ ] Implement with spring-bouncing dots, update barrel + docs
- [ ] Commit: `feat(v2): TypingIndicator — physics-bouncing dots, avatar`

**Task 8.3: ConfidenceBar** — gradient fill, thresholds, animated
- [ ] Write failing tests (render, a11y, gradient fill, threshold markers)
- [ ] Implement with spring-animated fill transitions, update barrel + docs
- [ ] Commit: `feat(v2): ConfidenceBar — gradient fill, thresholds, animated`

**Task 8.4: LiveFeed** — virtual scroll, auto-reconnect, pause/resume, flash
- [ ] Write failing tests (render, a11y, virtual scroll, connection states, pause/resume)
- [ ] Implement with ErrorBoundary, virtual scroll, reconnect logic, update barrel + docs
- [ ] Commit: `feat(v2): LiveFeed — virtual scroll, auto-reconnect, pause/resume`

**Task 8.5: RealtimeValue** — spring number changes, delta indicator, flash
- [ ] Write failing tests (render, a11y, value transition, delta indicator, flash on update)
- [ ] Implement with spring solver for value morphing, update barrel + docs
- [ ] Commit: `feat(v2): RealtimeValue — spring number changes, delta indicator`

- [ ] **Phase 8 Checkpoint**

```bash
git commit -m "milestone(v2): Phase 8 complete — 5 AI & real-time components"
```

- [ ] **Update memory file**

---

## Phase 9: Integration & Polish

### Task 9.1: UIProvider (combined provider)

**Files:**
- Create: `src/components/ui-provider.tsx`
- Test: `src/__tests__/components/ui-provider.test.tsx`

- [ ] **Step 1: Implement UIProvider** composing ThemeContext, MotionContext, DensityContext
- [ ] **Step 2: Test that child components receive all contexts**
- [ ] **Step 3: Test data-motion attribute for CSS fallback**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): UIProvider — combined theme, motion, density provider"
```

### Task 9.2: DensityProvider

- [ ] **Step 1: Implement DensityProvider with compact/default/comfortable/auto**
- [ ] **Step 2: Test auto density adapts to viewport**
- [ ] **Step 3: Commit**

### Task 9.3: CSS extraction script

**Files:**
- Create: `scripts/extract-css.ts`

- [ ] **Step 1: Implement script that scans built JS for css tagged templates and extracts to dist/css/**
- [ ] **Step 2: Test: generates theme.css, components/*.css, all.css**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(v2): CSS extraction script for dual-mode output"
```

### Task 9.4: Bundle size check script

- [ ] **Step 1: Implement scripts/check-bundle-size.ts**
- [ ] **Step 2: Test against defined budgets**
- [ ] **Step 3: Commit**

### Task 9.5: CLI v2

- [ ] **Step 1: Update CLI commands (init, add, list, theme)**
- [ ] **Step 2: Update component registry for v2**
- [ ] **Step 3: Test CLI commands**
- [ ] **Step 4: Commit**

### Task 9.6: CI/CD Workflows

- [ ] **Step 1: Update .github/workflows/ci.yml with a11y and bundle size checks**
- [ ] **Step 2: Update .github/workflows/publish.yml to trigger on v* tags**
- [ ] **Step 3: Update .github/workflows/deploy-demo.yml for v2 branch**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat(v2): updated CI/CD — tag-triggered publish, a11y + bundle size checks"
```

### Task 9.7: Demo site rebuild

- [ ] **Step 1: Update demo site with Aurora Fluid theme**
- [ ] **Step 2: Showcase all 62 components across pages**
- [ ] **Step 3: Test demo builds cleanly**
- [ ] **Step 4: Commit**

### Task 9.8: Storybook stories

- [ ] **Step 1: Write stories for all 62 components**
- [ ] **Step 2: Verify a11y addon shows no violations**
- [ ] **Step 3: Commit**

### Task 9.9: Documentation

- [ ] **Step 1: Complete README.md with all component APIs**
- [ ] **Step 2: Write migration guide from v1 to v2**
- [ ] **Step 3: Document theme customization**
- [ ] **Step 4: Document form engine usage**
- [ ] **Step 5: Document animation API**
- [ ] **Step 6: Commit**

```bash
git commit -m "docs(v2): complete documentation — README, migration guide, API docs"
```

### Task 9.10: Final integration test

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: Zero errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 4: Run bundle size check**

Run: `npm run test:bundle-size`
Expected: All components within budget

- [ ] **Step 5: Run a11y audit**

Run: `npm run test:a11y`
Expected: Zero violations across all components

- [ ] **Step 6: Final commit**

```bash
git commit -m "milestone(v2): Phase 9 complete — UI Kit v2.0 ready for release"
```

- [ ] **Step 7: Update memory with project completion status**

---

## Post-Completion

- [ ] Tag release: `npm version 2.0.0` → triggers automated publish
- [ ] Verify all three registries (npm, GitHub Packages, JSR) receive v2.0.0
- [ ] Verify demo site deploys to GitHub Pages
- [ ] Create GitHub Release with changelog
