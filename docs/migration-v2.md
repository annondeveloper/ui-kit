# Migration Guide: v1 to v2

This guide covers everything you need to know to upgrade from `@annondeveloper/ui-kit` v1 (0.4.x) to v2 (2.0.0).

## Dependencies

### Before (v1)

```bash
npm install @annondeveloper/ui-kit react react-dom framer-motion lucide-react \
  clsx tailwind-merge sonner @radix-ui/react-select @radix-ui/react-alert-dialog \
  @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-dropdown-menu
```

### After (v2)

```bash
npm install @annondeveloper/ui-kit@^2.0.0
```

v2 has **zero runtime dependencies**. The only peer dependencies are `react` ^19 and `react-dom` ^19. Remove all of these from your dependencies if they were only used for this library:

- `framer-motion`
- `@radix-ui/react-select`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-popover`
- `@radix-ui/react-dropdown-menu`
- `lucide-react`
- `clsx`
- `tailwind-merge`
- `sonner`
- `react-hook-form`

## Styling

### Tailwind CSS is no longer required

v1 relied on Tailwind CSS for all component styling. v2 uses an embedded scoped CSS system that auto-injects styles via the `useStyles()` hook and `adoptedStyleSheets`.

- Remove your Tailwind config, PostCSS config, and `@import 'tailwindcss'` directives **if they were only used for this library**
- CSS custom properties have changed from HSL to OKLCH color space
- The `cn()` utility still works for combining class names, but no longer depends on `tailwind-merge`

### Standalone CSS (optional)

If you prefer not to use auto-injection (e.g., for SSR without JavaScript):

```tsx
import '@annondeveloper/ui-kit/css/theme.css'   // Theme tokens
import '@annondeveloper/ui-kit/css/all.css'      // All component styles
// or per-component:
import '@annondeveloper/ui-kit/css/components/button.css'
```

### Color token changes

v1 used HSL values:
```css
--brand-primary: 217 91% 60%;
background: hsl(var(--brand-primary));
```

v2 uses OKLCH values:
```css
--brand: oklch(65.4% 0.196 264.1);
background: var(--brand);
```

See [Theming Guide](./theming.md) for the full token reference.

## Component API Changes

### General changes

- `className` prop still works on all components
- Most prop names are unchanged (`variant`, `size`, `disabled`, etc.)
- Icon props now accept any `ReactNode` instead of requiring Lucide icon components
- A new `motion` prop is available on all animated components (0-3 intensity levels)

### Icon migration

```tsx
// Before (v1) — required lucide-react
import { Activity } from 'lucide-react'
<MetricCard icon={Activity} />

// After (v2) — built-in icons or any ReactNode
import { icons } from '@annondeveloper/ui-kit'
<MetricCard icon={<icons.Activity />} />
// or bring your own:
<MetricCard icon={<MyCustomIcon />} />
```

### Dialog

```tsx
// Before (v1) — Radix AlertDialog
import { ConfirmDialog } from '@annondeveloper/ui-kit'
<ConfirmDialog open={open} onOpenChange={setOpen} ... />

// After (v2) — native <dialog> with @starting-style animations
import { Dialog, ConfirmDialog } from '@annondeveloper/ui-kit'
<Dialog open={open} onClose={() => setOpen(false)} ... />
<ConfirmDialog open={open} onClose={() => setOpen(false)} ... />
```

### Popover

```tsx
// Before (v1) — Radix Popover
import { Popover } from '@annondeveloper/ui-kit'

// After (v2) — CSS Anchor Positioning with JS fallback
import { Popover } from '@annondeveloper/ui-kit'
// API is similar, but no longer depends on Radix
```

### Tooltip

```tsx
// Before (v1) — Radix Tooltip
import { Tooltip } from '@annondeveloper/ui-kit'

// After (v2) — native popover API with CSS anchor positioning
import { Tooltip } from '@annondeveloper/ui-kit'
// Same API surface, zero external dependencies
```

### DropdownMenu

```tsx
// Before (v1) — Radix DropdownMenu
import { DropdownMenu } from '@annondeveloper/ui-kit'

// After (v2) — native popover with keyboard navigation
import { DropdownMenu } from '@annondeveloper/ui-kit'
// Supports submenus, keyboard shortcuts, and full ARIA patterns
```

### Sheet

```tsx
// Before (v1) — Framer Motion spring animation
import { Sheet } from '@annondeveloper/ui-kit'

// After (v2) — native <dialog> with physics-based spring animation
import { Sheet } from '@annondeveloper/ui-kit'
// Now supports swipe-to-dismiss and responsive bottom sheet on mobile
```

## Form System

### Before (v1) — react-hook-form wrappers

```tsx
import { useForm } from 'react-hook-form'
import { RHFFormInput, RHFSelect } from '@annondeveloper/ui-kit/form'

function MyForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: { email: '', role: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RHFFormInput control={control} name="email" label="Email"
        rules={{ required: 'Email is required' }} />
      <RHFSelect control={control} name="role" label="Role"
        options={roles} rules={{ required: true }} />
      <button type="submit">Save</button>
    </form>
  )
}
```

### After (v2) — built-in form engine

```tsx
import { createForm, useForm, v, Form, FormInput, Select } from '@annondeveloper/ui-kit/form'

const loginForm = createForm({
  fields: {
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    role:  { initial: '', validate: v.required() },
  },
  onSubmit: (values) => console.log(values),
})

function MyForm() {
  const form = useForm(loginForm)

  return (
    <Form form={form}>
      <FormInput label="Email" {...form.getFieldProps('email')} />
      <Select label="Role" options={roles} {...form.getFieldProps('role')} />
      <button type="submit">Save</button>
    </Form>
  )
}
```

See [Form Engine Guide](./forms.md) for complete documentation.

## Providers

v2 introduces `<UIProvider>` which manages theme, motion intensity, and density globally:

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'

function App() {
  return (
    <UIProvider motion={2} density="default" mode="dark">
      <YourApp />
    </UIProvider>
  )
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `motion` | `0 \| 1 \| 2 \| 3` | `3` | Animation intensity level |
| `density` | `'compact' \| 'default' \| 'spacious'` | `'default'` | UI density |
| `mode` | `'dark' \| 'light'` | `'dark'` | Color mode |

## Animation Changes

v1 used Framer Motion for all animations. v2 uses a built-in physics engine:

```tsx
// Before (v1)
import { motion } from 'framer-motion'
<motion.div animate={{ opacity: 1 }} />

// After (v2) — CSS-first with JS spring physics
// Most animations are automatic via CSS @starting-style and transitions
// For programmatic animation:
import { animate, spring } from '@annondeveloper/ui-kit'

spring(element, { transform: 'scale(1)' }, { stiffness: 200, damping: 15 })
```

See [Animation Guide](./animation.md) for details.

## Entry Points

| v1 | v2 | Notes |
|----|-----|-------|
| `@annondeveloper/ui-kit` | `@annondeveloper/ui-kit` | Main barrel export |
| `@annondeveloper/ui-kit/form` | `@annondeveloper/ui-kit/form` | Form engine (new API) |
| `@annondeveloper/ui-kit/theme.css` | `@annondeveloper/ui-kit/css/theme.css` | Standalone theme CSS |
| N/A | `@annondeveloper/ui-kit/theme` | Theme utilities |
| N/A | `@annondeveloper/ui-kit/css/all.css` | All component CSS |
| N/A | `@annondeveloper/ui-kit/css/components/*` | Per-component CSS |

## Weight Tiers (New in v2)

v2 introduces a 3-tier weight system. Every component is available in up to 3 sizes, allowing you to optimize bundle size for your use case:

### Lite Tier
```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit/lite'
```
- Minimal bundle: ~0.3-1.2KB per component
- No animations, no motion engine
- Pure CSS styling with `@scope`
- Perfect for landing pages, static sites, email templates

### Standard Tier (default)
```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit'
```
- Full-featured: ~1.5-5KB per component
- Motion levels 0-3 with physics-based springs
- OKLCH theming, `adoptedStyleSheets` auto-injection
- Keyboard navigation, ARIA patterns, focus management

### Premium Tier
```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit/premium'
```
- Cinematic: ~3-8KB per component
- Aurora glow effects, spring-scale animations
- Shimmer gradients, particle effects, ambient pulses
- Everything in Standard + visual enhancements

### Mixing Tiers

You can mix tiers in the same app. A dashboard might use Premium cards for hero metrics and Lite badges for data table cells:

```tsx
import { MetricCard } from '@annondeveloper/ui-kit/premium'
import { Badge } from '@annondeveloper/ui-kit/lite'
import { DataTable } from '@annondeveloper/ui-kit'
```

### Current Tier Coverage

| Tier | Components |
|------|-----------|
| Lite | 109 components |
| Standard | 111 components (all) |
| Premium | 109 components (every component except ui-provider and native-tooltip) |

## Removed Components

None. All 62 components from v1 are present in v2, plus 49 new additions including:

- `Typography` — semantic text with 11 variants and fluid sizing
- `Kbd` — keyboard shortcut display
- `Link` — styled anchor with hover animations
- `Combobox` — searchable select with async loading
- `FileUpload` — drag-and-drop file upload with preview
- `InlineEdit` — click-to-edit text fields
- `TreeView` — hierarchical tree with expand/collapse
- `CommandBar` — Cmd+K command palette
- `StreamingText` — LLM token-by-token rendering
- `BackgroundBeams`, `MeteorShower`, `GlowCard` — visual effects
- `TimeSeriesChart` — full SVG line chart with multi-series, axes, crosshair
- `RingChart` — donut/ring chart for resource utilization
- `CoreChart` — CPU core utilization grid
- `StorageBar` — segmented storage usage bar with labels
- `RackDiagram` — data center rack visualization
- `SwitchFaceplate` — network switch port grid
- `DensitySelector`, `ColumnVisibilityToggle`, `CSVExportButton` — table utilities
- And 20+ more monitoring, data display, and AI components

## Renamed Exports

| v1 | v2 | Entry point |
|----|-----|-------------|
| `generateTheme` (main) | `generateTheme` | `@annondeveloper/ui-kit/theme` |
| `themeToCSS` (main) | `themeToCSS` | `@annondeveloper/ui-kit/theme` |
| N/A | `applyTheme` | `@annondeveloper/ui-kit/theme` |
| N/A | `validateContrast` | `@annondeveloper/ui-kit/theme` |
| N/A | `DensityProvider` | `@annondeveloper/ui-kit` (main) |

## Step-by-Step Migration Checklist

1. Update the package: `npm install @annondeveloper/ui-kit@^2.0.0`
2. Remove unused peer dependencies (framer-motion, Radix, lucide-react, etc.)
3. Wrap your app root in `<UIProvider>`
4. Replace `import '@annondeveloper/ui-kit/theme.css'` with `import '@annondeveloper/ui-kit/css/theme.css'` (if using standalone CSS)
5. Replace `RHFFormInput` / `RHFSelect` with the new form engine (`createForm` + `useForm`)
6. Replace Lucide icon imports with built-in icons or `ReactNode` elements
7. Update any direct HSL color token usage to OKLCH
8. Run your test suite and visually inspect components
