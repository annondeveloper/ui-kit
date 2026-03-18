# @annondeveloper/ui-kit

Production-grade React UI component library with dark/light theme support, built on Tailwind CSS v4, Framer Motion, and Radix UI primitives.

## Features

- **17 components** — Button, DataTable, Select, Badge, ConfirmDialog, and more
- **Dark/light theme** — CSS custom properties, toggleable via `.light` class on `<html>`
- **Accessible** — Radix UI primitives for Select, Dialog, Tooltip
- **Animated** — Framer Motion with `useReducedMotion()` respect
- **Responsive** — Desktop-first, mobile-capable
- **Tree-shakeable** — ESM-only, import only what you use
- **Type-safe** — Full TypeScript with exported types

## Install

```bash
npm install @annondeveloper/ui-kit
```

### Peer Dependencies

```bash
npm install react react-dom framer-motion lucide-react clsx tailwind-merge sonner \
  @radix-ui/react-select @radix-ui/react-alert-dialog @radix-ui/react-tooltip
```

## Setup

### 1. Import the theme CSS

```tsx
// app/layout.tsx or main entry
import '@annondeveloper/ui-kit/src/theme.css'
```

Or copy the CSS custom properties into your own `globals.css`.

### 2. Use components

```tsx
import { Button, DataTable, Badge, Select, AnimatedCounter } from '@annondeveloper/ui-kit'

function App() {
  return (
    <Button variant="primary" loading={isPending}>
      Save Changes
    </Button>
  )
}
```

## Components

### Layout & Feedback

| Component | Description |
|-----------|-------------|
| `Button` | 5 variants (primary/secondary/danger/outline/ghost), 4 sizes, loading state |
| `Badge` | Color-coded label with 10 color presets |
| `EmptyState` | Placeholder with icon, title, description, optional actions |
| `Skeleton` / `SkeletonText` / `SkeletonCard` | Loading placeholders with shimmer animation |
| `SuccessCheckmark` | Animated SVG checkmark for success states |
| `StatusBadge` | Configurable status indicator (accepts custom status map) |
| `StatusPulse` | Animated status dot with configurable pulse behavior |

### Forms

| Component | Description |
|-----------|-------------|
| `Select` | Radix UI select with theme-safe styling |
| `Checkbox` | Forwarded ref checkbox with indeterminate support |
| `ToggleSwitch` | Icon-based boolean toggle |
| `FormInput` | Labeled input with hint text + shared class constants |
| `FilterPill` | Rounded filter toggle pill with optional count |

### Data Display

| Component | Description |
|-----------|-------------|
| `DataTable` | Full-featured table — sort, filter, search, paginate, density, column picker, CSV export |
| `AnimatedCounter` | Smooth number animation with rAF easing |
| `TruncatedText` | Auto-truncation with Radix tooltip + copy-to-clipboard |

### Overlays

| Component | Description |
|-----------|-------------|
| `ConfirmDialog` | Radix AlertDialog with Framer Motion animations, danger variant |
| `Toaster` / `toast` | Sonner wrapper with theme-aware styling |

## Utilities

```tsx
import { cn, fmtBytes, fmtRelative, fmtBps, fmtPct } from '@annondeveloper/ui-kit'

// Tailwind class merging
cn('px-4 py-2', isActive && 'bg-blue-500', className)

// Formatters
fmtBytes(1073741824)     // "1.0 GB"
fmtRelative('2024-01-01') // "3 months ago"
fmtBps(1000000000)       // "1.0 Gbps"
fmtPct(0.956)            // "95.6%"
```

## Theme System

The library uses CSS custom properties for theming. Dark mode is the default; add `.light` class to `<html>` for light mode.

```css
/* Dark mode (default) */
:root {
  --bg-base: 220 15% 8%;
  --bg-surface: 220 14% 11%;
  --text-primary: 220 10% 93%;
  --brand-primary: 217 91% 60%;
  --status-ok: 142 71% 45%;
  --status-critical: 0 84% 60%;
}

/* Light mode */
.light {
  --bg-base: 220 14% 96%;
  --bg-surface: 0 0% 100%;
  --text-primary: 220 14% 10%;
}
```

All components use `hsl(var(--token))` syntax — never hardcoded colors.

## Badge Factory

Create domain-specific badge variants without modifying the library:

```tsx
import { createBadgeVariant } from '@annondeveloper/ui-kit'

const SeverityBadge = createBadgeVariant({
  colorMap: { critical: 'red', warning: 'yellow', info: 'blue' },
  labelMap: { critical: 'Critical', warning: 'Warning', info: 'Info' },
})

// Usage: <SeverityBadge value="critical" />
```

## StatusBadge Configuration

```tsx
import { StatusBadge, defaultStatusMap } from '@annondeveloper/ui-kit'

// Use defaults
<StatusBadge status="ok" />

// Or provide custom status map
const myStatuses = {
  healthy: { label: 'Healthy', color: 'hsl(var(--status-ok))', dot: 'bg-green-500' },
  degraded: { label: 'Degraded', color: 'hsl(var(--status-warning))', dot: 'bg-yellow-500' },
}
<StatusBadge status="healthy" statusMap={myStatuses} />
```

## DataTable

The most feature-rich component — a full data grid built on TanStack Table:

```tsx
import { DataTable } from '@annondeveloper/ui-kit'
import type { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'email', header: 'Email', accessorKey: 'email' },
  { id: 'role', header: 'Role', accessorKey: 'role', size: 100 },
]

<DataTable
  columns={columns}
  data={users}
  isLoading={isLoading}
  searchPlaceholder="Search users..."
  defaultPageSize={25}
  exportFilename="users"
  onRowClick={(row) => router.push(`/users/${row.id}`)}
  emptyState={{ icon: Users, title: 'No users', description: 'Get started by inviting team members.' }}
/>
```

Features: global search, per-column filters (text/enum/number), multi-column sort, pagination, density control (compact/comfortable/spacious), column visibility picker, CSV export, row click handler, loading skeleton, empty state, Framer Motion row animations.

## Publishing

### GitHub Packages

```bash
npm login --registry=https://npm.pkg.github.com --scope=@annondeveloper
npm publish
```

### npm

```bash
npm login
npm publish --access public
```

### JSR

```bash
npx jsr publish
```

## License

MIT
