# React Server Components Support

UI Kit provides a dedicated RSC entry point that exports only server-safe utilities — no hooks, no browser APIs, no client-side state.

## Import

```tsx
import { ServerStyleSheet, CONTAINER_BREAKPOINTS, generateTheme, themeToCSS } from '@annondeveloper/ui-kit/rsc'
import type { ThemeTokens, ThemeMode, ContainerBreakpoint } from '@annondeveloper/ui-kit/rsc'
```

## What's Safe on the Server

| Export | Kind | Description |
|--------|------|-------------|
| `ServerStyleSheet` | Class | Collects component CSS during SSR |
| `CONTAINER_BREAKPOINTS` | Constant | Breakpoint definitions for container queries |
| `generateTheme` | Function | Generate theme tokens from a hex color |
| `themeToCSS` | Function | Convert theme tokens to a CSS string |
| `ThemeTokens` | Type | Theme token shape |
| `ThemeMode` | Type | `'dark' \| 'light'` |
| `ContainerBreakpoint` | Type | Breakpoint definition shape |

Everything else (hooks, components, motion engine) requires `'use client'`.

## ServerStyleSheet

Collects CSS chunks during server rendering, then flushes them as `<style>` tags.

```tsx
import { ServerStyleSheet } from '@annondeveloper/ui-kit/rsc'

const sheet = new ServerStyleSheet()

// During rendering, components call sheet.collect(id, css)
sheet.collect('button', '.ui-button { ... }')
sheet.collect('card', '.ui-card { ... }')

// Output options:
sheet.getStyleTags()    // HTML string: <style data-ui-style="button">...</style>
sheet.getStyleElement() // React <style> element with all CSS combined
sheet.getCSS()          // Raw CSS string

sheet.seal() // Prevent further collection after render completes
```

## App Router Layout Example

```tsx
// app/layout.tsx (Server Component)
import { ServerStyleSheet, generateTheme, themeToCSS } from '@annondeveloper/ui-kit/rsc'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = generateTheme('#6366f1', 'dark')
  const css = themeToCSS(theme)

  return (
    <html lang="en">
      <head>
        <style>{css}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## The 'use client' Boundary

Interactive components must be wrapped in client component files:

```tsx
// components/interactive-card.tsx
'use client'

import { Card, Button } from '@annondeveloper/ui-kit'

export function InteractiveCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h3>{title}</h3>
      {children}
      <Button onClick={() => console.log('clicked')}>Action</Button>
    </Card>
  )
}
```

```tsx
// app/page.tsx (Server Component — fetches data on the server)
import { InteractiveCard } from '../components/interactive-card'

export default async function Page() {
  const data = await fetch('https://api.example.com/items').then(r => r.json())

  return (
    <main>
      {data.map((item: { id: string; title: string; body: string }) => (
        <InteractiveCard key={item.id} title={item.title}>
          <p>{item.body}</p>
        </InteractiveCard>
      ))}
    </main>
  )
}
```

## `useSearchParams` and `UIProvider` Interaction

`UIProvider` is a client component (it uses hooks internally). In Next.js App Router, wrapping a page that calls `useSearchParams()` inside `UIProvider` can trigger unexpected Suspense boundary issues. Next.js requires a `<Suspense>` boundary above any component that reads `useSearchParams()` during static rendering, and if `UIProvider` sits above the page without an intervening boundary, you may see a build-time error or a flash of fallback content.

### Workaround 1: Wrap page content in `<Suspense>`

Place a `<Suspense>` boundary between `UIProvider` and the page content that uses `useSearchParams()`:

```tsx
// app/layout.tsx
'use client'

import { Suspense } from 'react'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </UIProvider>
      </body>
    </html>
  )
}
```

```tsx
// app/search/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return <div>Results for: {query}</div>
}
```

### Workaround 2: Move `UIProvider` below the Suspense boundary

Keep the layout as a Server Component and push `UIProvider` into a client wrapper that sits below `<Suspense>`:

```tsx
// app/layout.tsx (Server Component)
import { Suspense } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
```

```tsx
// app/search/layout.tsx
'use client'

import { UIProvider } from '@annondeveloper/ui-kit'

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <UIProvider>{children}</UIProvider>
}
```

```tsx
// app/search/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return <div>Results for: {query}</div>
}
```

In this approach, `UIProvider` is a sibling of the Suspense boundary rather than a parent, so Next.js can correctly suspend the `useSearchParams()` call without bubbling through the provider.

## Source

- RSC entry point: `src/rsc/index.ts`
- ServerStyleSheet: `src/core/styles/server-style-sheet.ts`
