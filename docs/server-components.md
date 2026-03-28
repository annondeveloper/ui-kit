# React Server Components (RSC) Integration

UI Kit v2 supports React Server Components with a dedicated `./rsc` entry point that exports only server-safe utilities — no hooks, no browser APIs, no client-side state.

## What works in Server Components

- **Theme generation** — `generateTheme()` and `themeToCSS()` run on the server
- **Style collection** — `ServerStyleSheet` collects CSS during SSR/streaming
- **Container breakpoints** — `CONTAINER_BREAKPOINTS` is a static constant
- **Type imports** — All types (`ThemeTokens`, `ThemeMode`, `ContainerBreakpoint`)

## What requires 'use client'

All interactive components use hooks (`useState`, `useEffect`, `useRef`) and must be imported in Client Components. The main `@annondeveloper/ui-kit` entry already adds `"use client"` banner to the build output.

## Import strategy

```tsx
// Server Component — safe imports
import { generateTheme, themeToCSS, ServerStyleSheet } from '@annondeveloper/ui-kit/rsc'
import type { ThemeTokens, ThemeMode } from '@annondeveloper/ui-kit/rsc'

// Client Component — interactive imports
'use client'
import { Button, Card, Dialog } from '@annondeveloper/ui-kit'
```

## ServerStyleSheet

`ServerStyleSheet` collects CSS emitted by components during server rendering, then outputs it as HTML `<style>` tags or a React element for streaming.

```tsx
import { ServerStyleSheet } from '@annondeveloper/ui-kit/rsc'

const sheet = new ServerStyleSheet()

// During render, components call sheet.collect(id, css)
sheet.collect('button', '.ui-button { ... }')
sheet.collect('card', '.ui-card { ... }')

// Output options:
sheet.getStyleTags()    // HTML string: <style data-ui-style="button">...</style>
sheet.getStyleElement() // React <style> element for streaming
sheet.getCSS()          // Raw CSS string

// Prevent further collection after render completes
sheet.seal()
```

### API

| Method | Returns | Description |
|--------|---------|-------------|
| `collect(id, css)` | `void` | Add a CSS chunk. No-op after `seal()`. |
| `getStyleTags()` | `string` | All styles as `<style>` HTML tags |
| `getStyleElement()` | `ReactElement` | Single `<style>` element with all CSS |
| `getCSS()` | `string` | All CSS concatenated |
| `seal()` | `void` | Freeze collection |
| `size` | `number` | Number of collected chunks |

## Next.js App Router

### Layout with server-side theme

```tsx
// app/layout.tsx (Server Component)
import { generateTheme, themeToCSS } from '@annondeveloper/ui-kit/rsc'
import type { ThemeMode } from '@annondeveloper/ui-kit/rsc'

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

### Client component boundary

```tsx
// components/interactive-card.tsx
'use client'

import { Card, Button } from '@annondeveloper/ui-kit'
import { useState } from 'react'

export function InteractiveCard() {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card variant="elevated" interactive>
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'}
      </Button>
      {expanded && <p>Additional content...</p>}
    </Card>
  )
}
```

### Page mixing server and client

```tsx
// app/dashboard/page.tsx (Server Component)
import { generateTheme } from '@annondeveloper/ui-kit/rsc'
import { InteractiveCard } from '@/components/interactive-card'

// This runs on the server — data fetching, no client JS
async function getMetrics() {
  const res = await fetch('https://api.example.com/metrics')
  return res.json()
}

export default async function DashboardPage() {
  const metrics = await getMetrics()
  const theme = generateTheme('#6366f1')

  return (
    <main>
      <h1>Dashboard</h1>
      {/* Static content rendered on server */}
      <pre>{JSON.stringify(theme, null, 2)}</pre>
      {/* Interactive content — ships client JS */}
      <InteractiveCard />
    </main>
  )
}
```

## Remix Integration

```tsx
// app/root.tsx
import { generateTheme, themeToCSS } from '@annondeveloper/ui-kit/rsc'

export default function Root() {
  const theme = generateTheme('#6366f1', 'dark')
  const css = themeToCSS(theme)

  return (
    <html lang="en">
      <head>
        <style>{css}</style>
      </head>
      <body>
        <Outlet />
      </body>
    </html>
  )
}
```

```tsx
// app/routes/dashboard.tsx
import { Button, Card } from '@annondeveloper/ui-kit'

export default function Dashboard() {
  return (
    <Card>
      <Button variant="primary">Action</Button>
    </Card>
  )
}
```

## SSR with ServerStyleSheet (custom frameworks)

For frameworks without built-in RSC support, use `ServerStyleSheet` with `renderToString` or `renderToPipeableStream`:

```tsx
import { renderToString } from 'react-dom/server'
import { ServerStyleSheet } from '@annondeveloper/ui-kit/rsc'
import { StyleProvider } from '@annondeveloper/ui-kit'
import App from './App'

const sheet = new ServerStyleSheet()
// Note: StyleProvider must be configured to feed into sheet.collect()

const html = renderToString(<App />)
const styleTags = sheet.getStyleTags()
sheet.seal()

const fullHtml = `
<!DOCTYPE html>
<html>
  <head>${styleTags}</head>
  <body><div id="root">${html}</div></body>
</html>
`
```

## Tree-shaking

Both `./rsc` and the main entry support tree-shaking. Import only what you need:

```tsx
// Only pulls in generateTheme + its deps (~1.5KB)
import { generateTheme } from '@annondeveloper/ui-kit/rsc'

// Only pulls in Button + its styles (~2KB)
import { Button } from '@annondeveloper/ui-kit'
```

## Static CSS alternative

If you prefer zero-JS theme injection, use the pre-built CSS:

```tsx
// app/layout.tsx
import '@annondeveloper/ui-kit/css/theme.css'
// or per-component:
// import '@annondeveloper/ui-kit/css/components/button.css'
```

This avoids the need for `ServerStyleSheet` entirely — the theme CSS is a static file that can be served from CDN.
