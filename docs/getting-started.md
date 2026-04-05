# Getting Started

Everything you need to go from `npm install` to a working page in under 5 minutes.

## Installation

```bash
npm install @annondeveloper/ui-kit
```

Peer dependencies: `react` ^19 and `react-dom` ^19. No other dependencies.

## CSS Setup

> **Warning:** Without CSS imports, components render correct HTML and ARIA attributes but have **no visual styling**. This is the #1 setup issue.

You must import the theme and component CSS in your app's root entry file.

### Next.js (App Router)

```tsx
// app/layout.tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### Vite

```tsx
// src/main.tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
```

### Remix

```tsx
// app/root.tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
```

### SSR / Server-Side Rendering

The CSS imports above work out-of-the-box for SSR (Next.js, Remix, Astro, Vite SSR) — styles are bundled into your CSS output and included in the initial HTML, so there is **no flash of unstyled content (FOUC)**.

For **dynamic theming during SSR** (e.g., generating a theme from a database-stored brand color), use the `StyleCollector`:

```tsx
// app/registry.tsx ('use client') — Next.js App Router
import { useServerInsertedHTML } from 'next/navigation'
import { StyleCollector, StyleProvider } from '@annondeveloper/ui-kit'
import { useState } from 'react'

export function StyleRegistry({ children }: { children: React.ReactNode }) {
  const [collector] = useState(() => new StyleCollector())

  useServerInsertedHTML(() => {
    const css = collector.collect()
    collector.clear()
    return css ? <style data-ui-kit>{css}</style> : null
  })

  return <StyleProvider collector={collector}>{children}</StyleProvider>
}
```

```tsx
// app/layout.tsx
import '@annondeveloper/ui-kit/css/theme.css'
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

> **Most projects don't need `StyleCollector`** — the static CSS imports handle everything. Only use it if you need server-side dynamic theme generation.

### Alternative: Per-component CSS

If you only use a few components and want smaller bundles:

```tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/components/button.css'
import '@annondeveloper/ui-kit/css/components/card.css'
```

## UIProvider Setup

Wrap your app with `UIProvider` to enable theming and motion control:

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider mode="dark" motion={3}>
      {children}
    </UIProvider>
  )
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'dark' \| 'light'` | `'dark'` | Color mode |
| `motion` | `0 \| 1 \| 2 \| 3` | `3` | Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic) |

Motion automatically respects `prefers-reduced-motion` at the OS level.

## First Component

```tsx
import { Button, Card, Badge } from '@annondeveloper/ui-kit'

function MyPage() {
  return (
    <Card padding="md">
      <h2>Hello World</h2>
      <Badge>New</Badge>
      <Button variant="primary" onClick={() => alert('It works!')}>
        Get Started
      </Button>
    </Card>
  )
}
```

## Building a Full Page

Every page should use layout primitives for consistent spacing and responsive behavior. Here is a complete dashboard you can copy-paste:

```tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import {
  UIProvider, PageShell, PageHeader, StatsGrid, SectionHeader,
  CardGrid, Card, Toolbar, ListLayout, Button, Badge, SearchInput
} from '@annondeveloper/ui-kit'
import { MetricCard } from '@annondeveloper/ui-kit'

export default function DashboardPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="xl">
        <PageHeader
          title="Dashboard"
          description="Overview of your system status and metrics"
          actions={<Button variant="primary">Create New</Button>}
        />

        <StatsGrid columns={4}>
          <MetricCard label="Total Users" value={1284} trend={12} status="ok" />
          <MetricCard label="Active Now" value={42} status="ok" />
          <MetricCard label="Errors" value={3} status="critical" />
          <MetricCard label="Uptime" value="99.9%" status="ok" />
        </StatsGrid>

        <Toolbar justify="between">
          <SearchInput placeholder="Search..." />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm">Filter</Button>
            <Button variant="secondary" size="sm">Export</Button>
          </div>
        </Toolbar>

        <SectionHeader
          title="Recent Activity"
          action={<Button variant="ghost" size="sm">View All</Button>}
        />
        <ListLayout dividers>
          <div>Deployment completed <Badge>New</Badge></div>
          <div>User signup: alice@example.com</div>
          <div>Alert resolved: CPU spike</div>
        </ListLayout>

        <SectionHeader title="Quick Actions" />
        <CardGrid columns={3}>
          <Card padding="md"><h3>Reports</h3><p>Generate and view reports</p></Card>
          <Card padding="md"><h3>Settings</h3><p>Configure your workspace</p></Card>
          <Card padding="md"><h3>Team</h3><p>Manage team members</p></Card>
        </CardGrid>
      </PageShell>
    </UIProvider>
  )
}
```

### Layout Primitives Reference

| Component | Purpose |
|-----------|---------|
| `PageShell` | Page container with padding and max-width |
| `PageHeader` | Title + description + actions (renders `<header>`) |
| `SectionHeader` | Section dividers with optional action buttons |
| `StatsGrid` | Responsive metric card grid |
| `CardGrid` | Responsive card layout (auto-reflows) |
| `Toolbar` | Search/filter/action bar (wraps on mobile) |
| `ListLayout` | Vertical list with optional dividers |

These components handle all spacing and responsive behavior automatically. Do not add manual margins between them.

## Weight Tiers

Every component ships in 3 tiers. Choose based on your bundle budget and design needs:

| Tier | Import | Size | Features |
|------|--------|------|----------|
| **Lite** | `@annondeveloper/ui-kit/lite` | ~0.3KB | Minimal CSS-only, no motion |
| **Standard** | `@annondeveloper/ui-kit` | ~2KB | Full features, transitions |
| **Premium** | `@annondeveloper/ui-kit/premium` | ~3KB | Spring physics + aurora glow |

```tsx
// Standard (default)
import { Button } from '@annondeveloper/ui-kit'

// Lite — minimal bundle, no animations
import { Button } from '@annondeveloper/ui-kit/lite'

// Premium — spring physics, shimmer effects, aurora glow
import { Button } from '@annondeveloper/ui-kit/premium'
```

**When to use each:**
- **Lite** — Internal tools, admin panels, low-bandwidth environments
- **Standard** — Most production apps (recommended default)
- **Premium** — Marketing sites, product demos, consumer-facing apps where polish matters

## Theming

Generate a complete theme from any brand color:

```tsx
import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'

// Generate a theme from your brand color
const theme = generateTheme('#6366f1', 'dark')
applyTheme(theme)
```

Or use one of 15 built-in themes:

```tsx
import { applyTheme, themes } from '@annondeveloper/ui-kit/theme'

applyTheme(themes.aurora)  // aurora, sunset, ocean, emerald, etc.
```

Always use semantic color tokens in your own CSS — never hardcode hex values:

```css
.my-component {
  color: var(--text-primary);
  background: var(--bg-surface);
  border-color: var(--border-subtle);
  accent-color: var(--brand);
}
```

## Using with AI (MCP)

The MCP server lets Claude, Cursor, and other AI assistants discover and use components programmatically.

### Setup

```bash
npx @annondeveloper/ui-kit mcp
```

This auto-detects your AI assistant and configures MCP. After setup, the AI can use 8 tools:

| Tool | What it does |
|------|-------------|
| `get_started` | Complete setup guide for your framework |
| `get_page_template` | Full page scaffolds (dashboard, settings, list, detail, auth, landing, empty) |
| `list_components` | Browse all 147 components with filters |
| `get_component` | Full API docs for any component |
| `search_components` | Find components by use-case |
| `generate_snippet` | Working TSX code for any component combo |
| `get_theme` | Theme tokens and CSS for built-in themes |
| `get_icons` | Browse the built-in SVG icon set |

### Recommended workflow

1. Ask the AI to call `get_started` with your framework — it returns a complete setup checklist
2. Ask for a page template with `get_page_template` — get a full working page scaffold
3. Use `search_components` and `get_component` to explore the API as you build

## Common Patterns

### Dashboard Page

```tsx
<PageShell padding="lg" maxWidth="xl">
  <PageHeader title="Dashboard" actions={<Button variant="primary">Create</Button>} />
  <StatsGrid columns={4}>
    <MetricCard label="Users" value={1284} trend={12} status="ok" />
    {/* more metrics */}
  </StatsGrid>
  <SectionHeader title="Activity" />
  <ListLayout dividers>{/* items */}</ListLayout>
</PageShell>
```

### Settings Page

```tsx
<PageShell padding="lg" maxWidth="md">
  <PageHeader title="Settings" description="Manage your preferences" />

  <SectionHeader title="Profile" />
  <Card padding="md">
    <ListLayout gap="md">
      <FormInput label="Display Name" placeholder="Your name" />
      <FormInput label="Email" type="email" placeholder="you@example.com" />
    </ListLayout>
  </Card>

  <SectionHeader title="Notifications" />
  <Card padding="md">
    <ListLayout gap="md">
      <ToggleSwitch label="Email notifications" />
      <ToggleSwitch label="Push notifications" />
    </ListLayout>
  </Card>

  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save Changes</Button>
  </div>
</PageShell>
```

### List Page with Search

```tsx
<PageShell padding="lg" maxWidth="lg">
  <PageHeader
    title="Devices"
    description="Manage connected devices"
    actions={<Button variant="primary">Add Device</Button>}
  />

  <Toolbar justify="between">
    <SearchInput placeholder="Search devices..." />
    <Button variant="secondary" size="sm">Filters</Button>
  </Toolbar>

  <ListLayout dividers>
    <Card padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <strong>Core Router</strong>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>192.168.1.1</p>
      </div>
      <Badge color="success">Online</Badge>
    </Card>
    {/* more items */}
  </ListLayout>

  <Pagination total={50} pageSize={10} />
</PageShell>
```

### Detail Page

```tsx
<PageShell padding="lg" maxWidth="lg">
  <PageHeader
    title="Device: Core Router"
    breadcrumbs={<span>Devices &gt; Core Router</span>}
    actions={
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary">Edit</Button>
        <Button variant="danger">Delete</Button>
      </div>
    }
  />

  <CardGrid columns={2}>
    <Card padding="md">
      <SectionHeader title="Status" size="sm" />
      <Badge color="success" size="lg">Online</Badge>
    </Card>
    <Card padding="md">
      <SectionHeader title="Uptime" size="sm" />
      <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>99.9%</p>
    </Card>
  </CardGrid>

  <SectionHeader title="Properties" />
  <Card padding="md">
    <PropertyList items={[
      { label: 'IP Address', value: '192.168.1.1' },
      { label: 'MAC Address', value: 'AA:BB:CC:DD:EE:FF' },
      { label: 'Firmware', value: 'v3.2.1' },
    ]} />
  </Card>
</PageShell>
```
