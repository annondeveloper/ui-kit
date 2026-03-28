# SSR Integration Guide

`@annondeveloper/ui-kit` uses `adoptedStyleSheets` for zero-flash style injection at runtime. For server-side rendering (SSR), the library provides a `StyleCollector` + `StyleProvider` pair that captures all component CSS during the render pass so you can inline it into the HTML response.

## How It Works

1. Create a `StyleCollector` instance before rendering.
2. Wrap your app tree with `<StyleProvider collector={collector}>`.
3. After `renderToString` / `renderToPipeableStream`, call `collector.collect()` to get all CSS as a single string.
4. Inject that string into a `<style>` tag in the document `<head>`.

```tsx
import { StyleCollector } from '@annondeveloper/ui-kit'
import { StyleProvider } from '@annondeveloper/ui-kit'

const collector = new StyleCollector()

const html = renderToString(
  <StyleProvider collector={collector}>
    <App />
  </StyleProvider>
)

const css = collector.collect()
// Insert <style>{css}</style> into <head>
```

## StyleCollector API

```ts
class StyleCollector {
  add(id: string, css: string): void   // Called internally by useStyles()
  collect(): string                     // Returns all collected CSS as one string
  getIds(): string[]                    // Returns IDs of collected stylesheets
  clear(): void                         // Resets for next request
}
```

---

## Next.js App Router

In Next.js 13+ with the App Router, create a root layout that collects styles during streaming.

```tsx
// app/layout.tsx
import { UIProvider } from '@annondeveloper/ui-kit'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider>
          {children}
        </UIProvider>
      </body>
    </html>
  )
}
```

For full SSR style extraction in a custom `renderToPipeableStream` setup:

```tsx
// app/registry.tsx
'use client'
import { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { StyleCollector, StyleProvider } from '@annondeveloper/ui-kit'

export function StyleRegistry({ children }: { children: React.ReactNode }) {
  const [collector] = useState(() => new StyleCollector())

  useServerInsertedHTML(() => {
    const css = collector.collect()
    collector.clear()
    if (!css) return null
    return <style data-ui-kit>{css}</style>
  })

  return <StyleProvider collector={collector}>{children}</StyleProvider>
}
```

Then wrap your layout:

```tsx
// app/layout.tsx
import { StyleRegistry } from './registry'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyleRegistry>{children}</StyleRegistry>
      </body>
    </html>
  )
}
```

---

## Remix

In Remix, collect styles during the server render in `entry.server.tsx`:

```tsx
// entry.server.tsx
import { renderToPipeableStream } from 'react-dom/server'
import { RemixServer } from '@remix-run/react'
import { StyleCollector, StyleProvider } from '@annondeveloper/ui-kit'

export default function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const collector = new StyleCollector()

  return new Promise((resolve, reject) => {
    const { pipe } = renderToPipeableStream(
      <StyleProvider collector={collector}>
        <RemixServer context={remixContext} url={request.url} />
      </StyleProvider>,
      {
        onShellReady() {
          responseHeaders.set('Content-Type', 'text/html')
          const css = collector.collect()
          // Inject css into the document head
          resolve(new Response(pipe(), { status: responseStatusCode, headers: responseHeaders }))
        },
        onError: reject,
      }
    )
  })
}
```

---

## Astro

Astro supports React components via `@astrojs/react`. Since Astro renders to static HTML by default, use the standalone CSS import approach:

```astro
---
// src/layouts/Layout.astro
---
<html lang="en">
  <head>
    <link rel="stylesheet" href="@annondeveloper/ui-kit/css/theme.css" />
    <link rel="stylesheet" href="@annondeveloper/ui-kit/css/all.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

For interactive islands with `client:load` / `client:visible`, the `useStyles()` hook will auto-inject CSS on the client via `adoptedStyleSheets` as usual -- no extra setup needed.

For SSR mode (`output: 'server'`), wrap the React island root:

```tsx
// src/components/MyIsland.tsx
import { Button } from '@annondeveloper/ui-kit'

export default function MyIsland() {
  return <Button variant="primary">Click me</Button>
}
```

---

## Vite SSR

For custom Vite SSR setups:

```tsx
// server.js
import { renderToString } from 'react-dom/server'
import { StyleCollector, StyleProvider } from '@annondeveloper/ui-kit'
import App from './src/App'

export function render(url) {
  const collector = new StyleCollector()

  const html = renderToString(
    <StyleProvider collector={collector}>
      <App url={url} />
    </StyleProvider>
  )

  const css = collector.collect()
  return { html, css }
}
```

In your HTML template, replace the placeholder:

```html
<!DOCTYPE html>
<html>
  <head>
    <style data-ui-kit><!--css-placeholder--></style>
  </head>
  <body>
    <div id="root"><!--app-html--></div>
  </body>
</html>
```

---

## Tree-Shaking Import Strategy

For optimal bundle size, import only the components you use:

```tsx
// Recommended: named imports from subpaths
import { Button } from '@annondeveloper/ui-kit'
import { MetricCard } from '@annondeveloper/ui-kit'
import { useForm } from '@annondeveloper/ui-kit/form'
import { generateTheme } from '@annondeveloper/ui-kit/theme'

// For CSS-only consumers (no JS runtime needed):
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/components/button.css'
import '@annondeveloper/ui-kit/css/components/card.css'
```

The library is fully tree-shakable with ESM. Bundlers like Vite, Webpack 5, and esbuild will only include the components you import.

### Per-Component CSS

For non-React projects or to avoid the JS style injection:

```
@annondeveloper/ui-kit/css/theme.css          # Base theme tokens
@annondeveloper/ui-kit/css/all.css            # All component CSS bundled
@annondeveloper/ui-kit/css/components/*.css   # Individual component CSS
```

### Weight Tiers

Use the tier that fits your needs:

```tsx
// Standard (default) -- full features
import { Button } from '@annondeveloper/ui-kit'

// Lite -- minimal, no motion, ~20-30 lines each
import { Button } from '@annondeveloper/ui-kit/lite'

// Premium -- aurora glow, spring physics, shimmer effects
import { Button } from '@annondeveloper/ui-kit/premium'
```
