# Performance Dashboard

Monitor bundle size, runtime render performance, and Web Vitals from a single dashboard.

## Overview

The Performance Dashboard provides real-time visibility into your UI Kit bundle. It tracks gzip sizes of every output file against the 350 KB budget, profiles component render times, reports Web Vitals (LCP, FID, CLS, TTFB), and can detect size regressions in CI.

## Quick Start

Access the Performance Dashboard from the demo app's navigation, or use the underlying hooks in your own development tooling:

```tsx
import { useRenderTime } from '@annondeveloper/ui-kit'
import { useWebVitals } from '@annondeveloper/ui-kit'
```

## Features

### Bundle Size Tracking

The dashboard displays every output file with raw and gzipped sizes, sortable by name, raw size, or gzip size.

**Key metrics displayed:**
- Individual file sizes (raw + gzip)
- Total bundle size vs. 350 KB budget
- Budget utilization gauge (green / amber / red)
- Per-file budget percentage contribution

The bundle report is generated at build time and loaded by the dashboard:

```ts
interface BundleReport {
  generated: string       // ISO timestamp
  budget: number          // Budget in bytes (350 KB)
  files: BundleFile[]     // Individual file entries
  total: { raw: number; gzip: number }
}

interface BundleFile {
  name: string
  raw: number    // Raw size in bytes
  gzip: number   // Gzipped size in bytes
}
```

### Runtime Render Profiler

The `useRenderTime()` hook measures component render duration:

```tsx
import { useRenderTime } from '@annondeveloper/ui-kit'

function MyComponent() {
  const renderTime = useRenderTime()

  return (
    <div>
      <p>Last render: {renderTime.toFixed(1)}ms</p>
      {/* ... component content ... */}
    </div>
  )
}
```

The dashboard uses this to display render times for key components, with color-coded indicators:
- Green: < 5ms
- Amber: 5-16ms (within one frame)
- Red: > 16ms (may cause jank)

### Web Vitals Integration

The `useWebVitals()` hook collects Core Web Vitals:

```tsx
import { useWebVitals } from '@annondeveloper/ui-kit'

function VitalsDisplay() {
  const vitals = useWebVitals()

  return (
    <dl>
      <dt>LCP</dt><dd>{vitals.lcp ? `${vitals.lcp.toFixed(0)}ms` : '--'}</dd>
      <dt>FID</dt><dd>{vitals.fid ? `${vitals.fid.toFixed(0)}ms` : '--'}</dd>
      <dt>CLS</dt><dd>{vitals.cls ? vitals.cls.toFixed(3) : '--'}</dd>
      <dt>TTFB</dt><dd>{vitals.ttfb ? `${vitals.ttfb.toFixed(0)}ms` : '--'}</dd>
    </dl>
  )
}
```

**Metrics tracked:**

| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| LCP (Largest Contentful Paint) | < 2500ms | 2500-4000ms | > 4000ms |
| FID (First Input Delay) | < 100ms | 100-300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800-1800ms | > 1800ms |

### CI Regression Detection

Use the bundle size test to catch regressions in CI:

```bash
npm run test:bundle-size
```

This script:
1. Builds the library
2. Measures gzipped sizes of all output files
3. Compares total against the 350 KB budget
4. Fails if the budget is exceeded

**GitHub Actions integration:**

```yaml
- name: Bundle size check
  run: npm run test:bundle-size
```

## API Reference

### `useRenderTime()`

Returns the render duration in milliseconds for the current component. Uses `performance.now()` to measure the time between render start and effect execution.

```ts
function useRenderTime(): number
```

### `useWebVitals()`

Returns an object with Core Web Vitals measurements. Values are `null` until measured.

```ts
interface WebVitals {
  lcp: number | null   // Largest Contentful Paint (ms)
  fid: number | null   // First Input Delay (ms)
  cls: number | null   // Cumulative Layout Shift (score)
  ttfb: number | null  // Time to First Byte (ms)
}

function useWebVitals(): WebVitals
```

## Performance Budgets

| Category | JS (gzip) | CSS (gzip) |
|----------|-----------|-----------|
| Core primitive | < 2 KB | < 0.5 KB |
| Medium component | < 5 KB | < 1.5 KB |
| Complex domain | < 8 KB | < 2 KB |
| Full library | < 85 KB | < 20 KB |
| Motion engine | ~3.5 KB | -- |
| Input engine | ~2.4 KB | -- |
| **Total budget** | **350 KB** | included |

## Examples

### Dashboard widget

```tsx
function PerfWidget() {
  const vitals = useWebVitals()
  const renderTime = useRenderTime()

  return (
    <Card>
      <h3>Performance</h3>
      <MetricCard label="Render Time" value={`${renderTime.toFixed(1)}ms`} />
      <MetricCard label="LCP" value={vitals.lcp ? `${vitals.lcp.toFixed(0)}ms` : '--'} />
      <MetricCard label="CLS" value={vitals.cls ? vitals.cls.toFixed(3) : '--'} />
    </Card>
  )
}
```
