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

## Source

- RSC entry point: `src/rsc/index.ts`
- ServerStyleSheet: `src/core/styles/server-style-sheet.ts`
