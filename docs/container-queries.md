# Container Query Design Tokens

Build truly responsive components that adapt to their container width rather than the viewport.

## Overview

The Container Query system provides a `useContainerSize()` hook, a `<ContainerQuery>` wrapper component, breakpoint constants, and a `resolveResponsive()` utility. Together they let components accept responsive prop values that change based on the container they live in.

## Quick Start

```tsx
import { ContainerQuery } from '@annondeveloper/ui-kit'

function Dashboard() {
  return (
    <ContainerQuery>
      {({ width, breakpoint }) => (
        <div>
          <p>Container is {width}px wide ({breakpoint})</p>
          {breakpoint === 'xs' && <CompactView />}
          {breakpoint !== 'xs' && <FullView />}
        </div>
      )}
    </ContainerQuery>
  )
}
```

## API Reference

### `useContainerSize(ref)`

Tracks the dimensions of a container element via `ResizeObserver`. Returns `{ width, height, breakpoint }`. SSR-safe -- returns zeros when `ResizeObserver` is unavailable. Debounced via `requestAnimationFrame`.

```tsx
import { useRef } from 'react'
import { useContainerSize } from '@annondeveloper/ui-kit'

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null)
  const { width, height, breakpoint } = useContainerSize(ref)

  return (
    <div ref={ref}>
      {breakpoint === 'lg' ? <WideLayout /> : <NarrowLayout />}
    </div>
  )
}
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `width` | `number` | Container width in pixels |
| `height` | `number` | Container height in pixels |
| `breakpoint` | `ContainerBreakpoint` | Current breakpoint name |

### `<ContainerQuery>` component

A wrapper `<div>` with `container-type: inline-size` that provides size info to children.

```tsx
<ContainerQuery className="sidebar">
  {({ width, breakpoint }) => (
    <nav>{breakpoint === 'xs' ? <IconNav /> : <FullNav />}</nav>
  )}
</ContainerQuery>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode \| ((size: ContainerSize) => ReactNode)` | Render prop or plain children |
| `className` | `string` | Additional class name |
| `style` | `CSSProperties` | Additional styles |

When `children` is a plain `ReactNode`, the component still sets `container-type: inline-size` so CSS `@container` queries work inside it.

### `CONTAINER_BREAKPOINTS`

Named breakpoint thresholds (mobile-first, smallest wins):

| Breakpoint | Min Width |
|-----------|-----------|
| `xs` | 0px |
| `sm` | 320px |
| `md` | 480px |
| `lg` | 640px |
| `xl` | 960px |

```ts
import { CONTAINER_BREAKPOINTS } from '@annondeveloper/ui-kit'
// { xs: 200, sm: 320, md: 480, lg: 640, xl: 960 }
```

### `resolveResponsive(value, breakpoint, defaultValue)`

Resolves a static or responsive prop value for a given breakpoint. Uses mobile-first cascade -- tries the current breakpoint, then falls down to smaller ones.

```ts
import { resolveResponsive } from '@annondeveloper/ui-kit'

// Static value -- returns as-is
resolveResponsive('lg', 'md', 'md')  // 'lg'

// Responsive map -- cascades down
resolveResponsive({ xs: 'sm', md: 'lg' }, 'xl', 'md')  // 'lg' (md is closest <= xl)
resolveResponsive({ xs: 'sm', md: 'lg' }, 'sm', 'md')   // 'sm' (xs is closest <= sm)
```

### `ResponsiveValue<T>` type

A value that is either static or varies by container breakpoint:

```ts
type ResponsiveValue<T> = T | Partial<Record<ContainerBreakpoint, T>>
```

## Examples

### Responsive card layout

```tsx
import { ContainerQuery, Card, MetricCard } from '@annondeveloper/ui-kit'

function DashboardPanel() {
  return (
    <ContainerQuery>
      {({ breakpoint }) => (
        <div style={{
          display: 'grid',
          gridTemplateColumns: breakpoint === 'xs' ? '1fr' : 'repeat(3, 1fr)',
          gap: '1rem',
        }}>
          <MetricCard label="CPU" value="87%" />
          <MetricCard label="Memory" value="4.2 GB" />
          <MetricCard label="Disk" value="72%" />
        </div>
      )}
    </ContainerQuery>
  )
}
```

### Responsive props in custom components

```tsx
import { useRef } from 'react'
import { useContainerSize, resolveResponsive, type ResponsiveValue } from '@annondeveloper/ui-kit'

interface GridProps {
  columns: ResponsiveValue<number>
  children: React.ReactNode
}

function ResponsiveGrid({ columns, children }: GridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { breakpoint } = useContainerSize(ref)
  const cols = resolveResponsive(columns, breakpoint, 1)

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {children}
    </div>
  )
}

// Usage: 1 column on xs/sm, 2 on md, 4 on lg+
<ResponsiveGrid columns={{ xs: 1, md: 2, lg: 4 }}>
  <Card>A</Card>
  <Card>B</Card>
  <Card>C</Card>
  <Card>D</Card>
</ResponsiveGrid>
```

### Pure CSS container queries

When children are not a render prop, `<ContainerQuery>` still sets `container-type: inline-size`:

```tsx
<ContainerQuery>
  <div className="my-layout">
    {/* CSS @container queries work here */}
  </div>
</ContainerQuery>
```

```css
@container (min-width: 480px) {
  .my-layout { grid-template-columns: 1fr 1fr; }
}
@container (min-width: 960px) {
  .my-layout { grid-template-columns: repeat(4, 1fr); }
}
```
