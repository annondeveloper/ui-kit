# @annondeveloper/ui-kit v2

> Zero-dependency React component library with 147 components, physics-based animations, OKLCH color system, and Aurora Fluid design.

## Quick Start

```bash
npm install @annondeveloper/ui-kit
```

```tsx
import { UIProvider, Button, Card, MetricCard } from '@annondeveloper/ui-kit'

function App() {
  return (
    <UIProvider>
      <Card>
        <Button variant="primary">Deploy</Button>
        <MetricCard title="CPU" value="87.4%" trend="up" />
      </Card>
    </UIProvider>
  )
}
```

## Features

- **Zero dependencies** — only `react` and `react-dom` peer deps
- **147 components** — 73 general-purpose + 74 domain-specific across 3 weight tiers
- **3 weight tiers** — Lite (144), Standard (147), Premium (145) — optimize your bundle
- **Aurora Fluid design** — deep atmospheric surfaces, ambient glows, OKLCH colors
- **Physics animations** — real spring solver, configurable motion levels (0-3)
- **Built-in form engine** — `createForm`, `useForm`, validators, zero external deps
- **15 pre-built themes** — including 5 new themes added in v2.4
- **MCP server** — Model Context Protocol integration for AI-assisted workflows
- **`classNames` prop** — deep customization of internal component elements
- **Accessibility** — WAI-ARIA patterns, keyboard navigation, screen reader support
- **Responsive** — container queries, fluid typography, touch/mouse/gamepad support
- **Theme generator** — generate complete theme from single brand color

## Documentation

- [Migration Guide](docs/migration-v2.md) -- Upgrading from v1 to v2
- [Theming](docs/theming.md) -- OKLCH colors, theme generation, customization
- [Form Engine](docs/forms.md) -- Built-in form state, validators, auto-wiring
- [Animation](docs/animation.md) -- Physics springs, timeline, stagger, scroll
- [Design Spec](docs/superpowers/specs/2026-03-20-ui-kit-v2-design.md) -- Full architecture document

### New in v2.5

- [Motion Choreography](docs/choreography.md) -- Sequenced multi-step animations with 5 presets
- [Container Queries](docs/container-queries.md) -- Container-responsive design tokens and components
- [View Transitions](docs/view-transitions.md) -- Native View Transitions API with 6 presets
- [Theme Editor](docs/theme-editor.md) -- Color harmony, contrast audit, multi-format export
- [AI Generator](docs/ai-generator.md) -- Template gallery, custom composition, 5 framework output
- [CLI Scaffolding](docs/cli-scaffolding.md) -- Project templates, component add, Figma export
- [Figma Plugin](docs/figma-plugin.md) -- Token sync between code and Figma Variables
- [Performance Dashboard](docs/performance-dashboard.md) -- Bundle tracking, render profiler, Web Vitals

## Next-Gen Features

**Motion Choreography** -- Orchestrate multi-step animation sequences with `Choreography` class, 5 presets (cascade, stagger-grid, wave, spiral, focus-in), and scroll-triggered choreography via `useScrollChoreography`.

**Container Query Design Tokens** -- `<ContainerQuery>` component, `useContainerSize()` hook, `resolveResponsive()` utility, and `CONTAINER_BREAKPOINTS` for building components that adapt to their container.

**View Transitions API** -- `useViewTransition()` hook with 6 presets (morph, crossfade, slide-left, slide-right, slide-up, zoom) and `assignTransitionName()` for element morphing.

**Theme Editor** -- Color harmony engine (5 types), WCAG contrast audit, export to CSS/Tailwind/Figma/CSS-in-JS, and shareable URL scheme.

**AI Component Generator** -- Template gallery (dashboard, form, marketing, saas, docs), custom composition builder, and code output for React, Vue, Svelte, and HTML.

**CLI Scaffolding** -- `add` copies components, `create` scaffolds full projects from 5 templates, `figma-export` generates Figma Variables JSON.

**Figma Plugin** -- Export theme tokens as Figma Variables and import them via the Aurora UI Kit Token Sync plugin.

**Performance Dashboard** -- Bundle size tracking with budget gauge, runtime render profiler, Web Vitals integration, and CI regression detection.

## CLI Commands

```bash
npx @annondeveloper/ui-kit init                                    # Copy theme + setup
npx @annondeveloper/ui-kit add <component> [--tier] [--out-dir]    # Copy component source
npx @annondeveloper/ui-kit create <name> --template <template>     # Scaffold project
npx @annondeveloper/ui-kit list                                    # List all 147 components
npx @annondeveloper/ui-kit theme <color>                           # Generate theme CSS
npx @annondeveloper/ui-kit figma-export --theme <name> --output <file>  # Export Figma tokens
```

## Component List

### General-Purpose Components (73)

| Component | Description |
|-----------|-------------|
| `ActionIcon` | Icon-only button with tooltip |
| `Accordion` | Collapsible sections with single/multiple mode |
| `Affix` | Fixed-position wrapper for floating elements |
| `Alert` | Inline status messages with variants |
| `AnimatedCounter` | Smooth number animation with easing |
| `AppShell` | Full application layout scaffold |
| `Avatar` | Image/initials avatar with status dot |
| `AvatarUpload` | Avatar with upload/crop functionality |
| `BackToTop` | Scroll-to-top floating button |
| `Badge` | Pill-shaped label with color presets |
| `Breadcrumbs` | Hierarchical navigation trail |
| `Button` | Primary action with variants and loading |
| `ButtonGroup` | Grouped button container |
| `Calendar` | Standalone calendar display |
| `Card` | Styled container with subcomponents |
| `Carousel` | Image/content carousel with navigation |
| `Checkbox` | Themed checkbox with indeterminate state |
| `Chip` | Compact interactive tag element |
| `ColorInput` | Color picker with hue/saturation panel |
| `Combobox` | Searchable select with async loading |
| `CommandBar` | Universal command palette (Cmd+K) |
| `ConfirmDialog` | Confirmation modal with danger variant |
| `CopyButton` | One-click copy to clipboard |
| `DatePicker` | Calendar-based date selection |
| `DateRangePicker` | Date range selection with presets |
| `Dialog` | Native dialog with animated entry/exit |
| `Divider` | Horizontal/vertical separator |
| `Drawer` | Slide-out panel from any edge |
| `DropdownMenu` | Action menu with submenus and shortcuts |
| `EmptyState` | Decorative placeholder with icon and actions |
| `FileUpload` | Drag-and-drop file upload with preview |
| `FilterPill` | Rounded filter toggle with count |
| `FormInput` | Themed input with label and validation |
| `Highlight` | Text highlighting with search match |
| `Indicator` | Dot/badge indicator overlay |
| `InlineEdit` | Click-to-edit text field |
| `Kbd` | Keyboard shortcut display |
| `Link` | Styled anchor with underline animation |
| `MultiSelect` | Multi-value select dropdown |
| `Navbar` | Top-level application navigation bar |
| `NativeTooltip` | Lightweight tooltip using title attribute |
| `NotificationStack` | Toast notification cards with auto-dismiss |
| `NumberInput` | Numeric input with increment/decrement |
| `OtpInput` | One-time password code entry |
| `Pagination` | Page navigation with controls |
| `PasswordInput` | Password field with visibility toggle |
| `PinInput` | PIN code entry with auto-advance |
| `Popover` | Anchored popover with arrow and focus management |
| `Progress` | Progress bar with indeterminate mode |
| `RadioGroup` | Radio button group with descriptions |
| `Rating` | Star rating input with half-star support |
| `ScrollReveal` | Scroll-triggered reveal animation |
| `SearchInput` | Search field with debounce and clear |
| `SegmentedControl` | Segmented toggle selector |
| `Select` | Themed dropdown select |
| `Sheet` | Slide-over drawer with swipe dismiss |
| `Sidebar` | Collapsible side navigation |
| `Skeleton` | Shimmer loading placeholder |
| `Slider` | Range slider with keyboard support |
| `Spoiler` | Collapsible content with show more/less |
| `Spotlight` | Spotlight search overlay |
| `StatusBadge` | Status indicator with colored dot |
| `StatusPulse` | Animated status dot with pulse ring |
| `Stepper` | Step indicator with progress |
| `SuccessCheckmark` | Animated SVG checkmark |
| `Tabs` | Tabbed interface with animated indicator |
| `TagInput` | Multi-value input with tag chips |
| `Textarea` | Auto-growing text area |
| `Toast` | Pre-themed toast notifications |
| `ToggleSwitch` | Boolean toggle switch |
| `Tooltip` | Popover-based tooltip with positioning |
| `Typography` | Semantic text with fluid sizing |
| `UIProvider` | Theme, motion, and density provider |

### Domain-Specific Components (74)

| Component | Description |
|-----------|-------------|
| `BackgroundBeams` | Animated sweeping light beams |
| `BackgroundBoxes` | Floating animated grid boxes |
| `BorderBeam` | Animated conic-gradient border |
| `Card3D` | 3D perspective tilt with glare |
| `CodeEditor` | Code editor with syntax highlighting |
| `ConfidenceBar` | Probability bar with threshold zones |
| `ConnectionTestPanel` | Step-by-step connectivity test UI |
| `CopyBlock` | Code display with one-click copy |
| `CoreChart` | CPU core utilization grid |
| `Cropper` | Image cropping tool |
| `CSVExportButton` | One-click CSV generation and download |
| `ColumnVisibilityToggle` | Column show/hide dropdown |
| `DashboardGrid` | Draggable dashboard layout |
| `DataTable` | Full-featured data grid with search, sort, filter |
| `DensitySelector` | Compact/comfortable/spacious control |
| `DiffViewer` | Side-by-side/inline diff viewer |
| `DiskMountBar` | Disk mount utilization bars |
| `EncryptedText` | Matrix-style character scramble/reveal |
| `EntityCard` | Infrastructure resource card |
| `EvervaultCard` | Matrix-style encrypted card |
| `FlipWords` | Rotating word animation |
| `GeoMap` | SVG geographic visualization |
| `GlowCard` | Mouse-tracking radial glow card |
| `HeatmapCalendar` | GitHub-style contribution heatmap |
| `HeroHighlight` | Gradient text highlight effect |
| `InfiniteScroll` | Virtualized infinite-scroll list |
| `JsonViewer` | Interactive JSON tree viewer |
| `KanbanColumn` | Kanban board column with cards |
| `LiveFeed` | Real-time event feed with auto-scroll |
| `LogViewer` | Log stream viewer with severity colors |
| `MeteorShower` | Falling meteor streak animation |
| `MetricCard` | Dashboard stat tile with sparkline |
| `NetworkTrafficCard` | Network throughput display |
| `NumberTicker` | Rolling digit counter |
| `OrbitingCircles` | Orbiting icon animation |
| `PipelineStage` | Horizontal pipeline visualization |
| `PortStatusGrid` | Network port status indicator grid |
| `PropertyList` | Key-value detail panel |
| `RackDiagram` | Data center rack visualization |
| `RealtimeValue` | Live data display with freshness tracking |
| `ResponsiveCard` | Container-query adaptive card |
| `RichTextEditor` | WYSIWYG rich text editor |
| `RingChart` | SVG donut chart with center label |
| `Ripple` | Click ripple effect |
| `SeverityTimeline` | Event timeline with severity dots |
| `ServiceStrip` | Horizontal service badge strip |
| `ShimmerButton` | Shimmering gradient button |
| `SmartTable` | DataTable with auto-generated filter suggestions |
| `SortableList` | Drag-and-drop reorderable list |
| `Sparkline` | Inline SVG sparkline chart |
| `SpotlightCard` | Spotlight hover effect card |
| `StepWizard` | Multi-step form wizard |
| `StorageBar` | Segmented horizontal bar |
| `StreamingText` | AI/LLM streaming text with cursor |
| `SwitchFaceplate` | Network switch port grid |
| `TableOfContents` | Auto-generated page navigation |
| `TextReveal` | Scroll-triggered character-by-character unveil |
| `ThresholdGauge` | Semicircular gauge with threshold zones |
| `TimePicker` | Time selection input |
| `TimeRangeSelector` | Compact time range pill selector |
| `Timeline` | Vertical event timeline |
| `TimeSeriesChart` | Full SVG line chart with multi-series |
| `Tour` | Guided product tour with step highlights |
| `TracingBeam` | Scroll-tracing side beam |
| `TransferList` | Dual-list item transfer |
| `TreeView` | Hierarchical tree with expand/collapse |
| `TruncatedText` | Auto-truncating text with tooltip |
| `TypingIndicator` | "Someone is typing" animation |
| `UpstreamDashboard` | Service monitoring layout |
| `UptimeTracker` | Daily uptime bar strip |
| `UtilizationBar` | Horizontal bar with threshold colors |
| `ViewTransitionLink` | View Transitions API integration |
| `WavyBackground` | Animated SVG sine waves |

### New in v2.5 (1 component)

| Component | Description |
|-----------|-------------|
| `ContainerQuery` | Container query wrapper with render-prop size info |

### New in v2.4 (30 components)

The following components were added in the v2.4 release:

**General-purpose:** ActionIcon, Affix, AvatarUpload, BackToTop, ButtonGroup, Calendar, Carousel, Chip, CopyButton, DateRangePicker, Highlight, Indicator, MultiSelect, NumberInput, PasswordInput, PinInput, SegmentedControl, Spoiler, Spotlight, Stepper, TableOfContents, Textarea, TimePicker, Timeline, TransferList

**Domain-specific:** CodeEditor, Cropper, JsonViewer, RichTextEditor, Tour

### Core Engine Modules

| Module | Size | Description |
|--------|------|-------------|
| `core/styles` | ~1KB | useStyles(), css tag, adoptedStyleSheets, SSR |
| `core/motion` | ~3.5KB | Spring solver, WAAPI, timeline, stagger, scroll, FLIP |
| `core/input` | ~2.4KB | Unified pointer, gestures, focus, gamepad, multitouch |
| `core/tokens` | ~1.5KB | OKLCH theme, generateTheme(), applyTheme() |
| `core/a11y` | ~1KB | Focus trap, roving tabindex, live region, stable ID |
| `core/icons` | ~2KB | 50+ built-in SVG icons, all overridable |
| `core/forms` | ~2KB | createForm, useForm, validators, Form, FieldArray |
| `core/utils` | ~0.5KB | cn(), formatting, sanitize, clamp |

## Entry Points

```typescript
import { Button, Dialog, DataTable } from '@annondeveloper/ui-kit'
import { Button as LiteButton } from '@annondeveloper/ui-kit/lite'
import { Button as PremiumButton } from '@annondeveloper/ui-kit/premium'
import { createForm, useForm, v } from '@annondeveloper/ui-kit/form'
import { generateTheme, themeToCSS } from '@annondeveloper/ui-kit/theme'
import '@annondeveloper/ui-kit/css/theme.css'  // Standalone CSS (optional)
```

## Weight Tiers

| Tier | Components | Description |
|------|-----------|-------------|
| Standard | 147 | Full-featured with motion, theming, a11y |
| Lite | 144 | Minimal wrappers, no motion (~0.3-1.2 KB each) |
| Premium | 145 | Aurora glow, spring animations, shimmer effects |

## Bundle Size

| Metric | Value |
|--------|-------|
| Total (gzipped) | 332.1 KB |
| Budget | 350 KB |
| Tree-shaking | Full ESM — import only what you use |

Typical app importing ~20 components: **~15-25 KB gzipped** after tree-shaking.

## Motion Levels

```tsx
<UIProvider motion={2}>  {/* 0=none, 1=subtle, 2=expressive, 3=cinematic */}
```

---

## v1 Documentation

> The React component library for monitoring dashboards, infrastructure tools, and professional applications.

53 components &bull; Dark/Light theme &bull; Accessible &bull; AI-ready &bull; Real-time primitives &bull; Tree-shakeable

[![npm](https://img.shields.io/npm/v/@annondeveloper/ui-kit)](https://www.npmjs.com/package/@annondeveloper/ui-kit)
&nbsp;
[GitHub](https://github.com/annondeveloper/ui-kit)
&nbsp;&bull;&nbsp;
[JSR](https://jsr.io/@annondeveloper/ui-kit)
&nbsp;&bull;&nbsp;
[Demo](https://annondeveloper.github.io/ui-kit)

---

## Quick Start

### Install

```bash
# npm
npm install @annondeveloper/ui-kit

# pnpm
pnpm add @annondeveloper/ui-kit

# yarn
yarn add @annondeveloper/ui-kit

# bun
bun add @annondeveloper/ui-kit

# jsr
npx jsr add @annondeveloper/ui-kit
```

### Peer Dependencies

```bash
npm install react react-dom framer-motion lucide-react clsx tailwind-merge sonner \
  @radix-ui/react-select @radix-ui/react-alert-dialog @radix-ui/react-tooltip \
  @radix-ui/react-popover @radix-ui/react-dropdown-menu
```

`react-hook-form` is an optional peer dependency -- only needed if you use the `@annondeveloper/ui-kit/form` entry point.

### Theme Setup

Import the theme CSS once in your app's root layout:

```tsx
import '@annondeveloper/ui-kit/theme.css'
```

Or copy the CSS custom properties into your own stylesheet. See [Theme System](#theme-system) below.

### Minimal Example

```tsx
import { Button, MetricCard, StatusBadge, Toaster } from '@annondeveloper/ui-kit'
import { Activity } from 'lucide-react'

function App() {
  return (
    <>
      <MetricCard label="CPU Usage" value={72.4} format={n => `${n.toFixed(1)}%`} icon={Activity} status="warning" />
      <StatusBadge status="active" pulse />
      <Button variant="primary" loading={isPending}>Deploy</Button>
      <Toaster />
    </>
  )
}
```

---

## Why This Library?

Most component libraries are built for CRUD apps. This one is built for **ops dashboards, infrastructure tools, and AI-powered interfaces** -- where data density, real-time updates, and status visualization are first-class concerns.

- **Smart Components** -- SmartTable auto-generates filter suggestions (outliers, top-N, patterns). CommandBar provides fuzzy search with recent history.
- **AI-Ready** -- StreamingText renders LLM output with a blinking cursor. TypingIndicator, ConfidenceBar, and copy-on-complete are built in.
- **Real-Time** -- RealtimeValue tracks data freshness with connection state indicators and stale-data dimming. LiveFeed auto-scrolls with pause controls. NotificationStack supports auto-dismiss with progress bars.
- **Monitoring** -- MetricCard with trend arrows and sparklines. ThresholdGauge with color-coded zones. UtilizationBar, UptimeTracker, PortStatusGrid, and PipelineStage for infrastructure dashboards.
- **Data-Dense** -- DataTable with 10+ features in one import (search, column filters, sort, pagination, density control, column picker, CSV export, row animations). HeatmapCalendar, SeverityTimeline, LogViewer for high-density displays.
- **Developer Experience** -- CLI for scaffolding (`npx @annondeveloper/ui-kit add button`). react-hook-form adapters. Zero config theming. Full TypeScript coverage with exported types.

---

## Component Reference

### Core

#### Button

A themed button with variant, size, and loading support.

```tsx
import { Button } from '@annondeveloper/ui-kit'

<Button variant="primary" size="md" loading={isPending}>Save</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'outline' \| 'ghost'` | `'primary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` | Size preset |
| `loading` | `boolean` | `false` | Show spinner and disable interaction |

Extends all native `<button>` attributes. Supports `ref` forwarding.

---

#### Badge

A pill-shaped label with 10 color presets and optional icon.

```tsx
import { Badge, createBadgeVariant } from '@annondeveloper/ui-kit'
import { Shield } from 'lucide-react'

<Badge color="green" icon={Shield} size="sm">Secure</Badge>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | -- | Badge content |
| `color` | `'brand' \| 'blue' \| 'green' \| 'yellow' \| 'red' \| 'orange' \| 'purple' \| 'pink' \| 'teal' \| 'gray'` | `'gray'` | Color preset |
| `icon` | `LucideIcon` | -- | Optional icon before the label |
| `size` | `'xs' \| 'sm' \| 'md'` | `'sm'` | Size variant |

##### Badge Factory

Create domain-specific badge components without modifying the library:

```tsx
const SeverityBadge = createBadgeVariant({
  colorMap: { critical: 'red', warning: 'yellow', info: 'blue' },
  labelMap: { critical: 'Critical', warning: 'Warning', info: 'Info' },
})

<SeverityBadge value="critical" />
```

---

#### Card

A styled card container with subcomponents for semantic structure.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@annondeveloper/ui-kit'

<Card variant="interactive" padding="lg">
  <CardHeader><CardTitle>Server Health</CardTitle></CardHeader>
  <CardContent>...</CardContent>
</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'interactive'` | `'default'` | Visual variant (`interactive` adds hover effect) |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding preset |

Subcomponents: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. All support `ref` forwarding.

---

#### Tabs

Accessible tabbed interface with three visual variants and animated indicator.

```tsx
import { Tabs } from '@annondeveloper/ui-kit'

<Tabs tabs={[{ value: 'metrics', label: 'Metrics' }, { value: 'logs', label: 'Logs' }]}
      value={tab} onChange={setTab} variant="pills" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | -- | Array of `{ value, label, icon?, disabled? }` |
| `value` | `string` | -- | Currently selected tab value |
| `onChange` | `(value: string) => void` | -- | Selection callback |
| `variant` | `'underline' \| 'pills' \| 'enclosed'` | `'underline'` | Visual variant |
| `size` | `'sm' \| 'md'` | `'md'` | Size preset |

Supports keyboard navigation (arrow keys, Home, End) and ARIA roles. Animated indicator uses Framer Motion `layoutId`.

---

#### Sheet

A slide-over drawer panel from any screen edge.

```tsx
import { Sheet } from '@annondeveloper/ui-kit'

<Sheet open={isOpen} onClose={() => setOpen(false)} title="Settings" side="right" width="max-w-lg">
  {children}
</Sheet>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Whether the sheet is open |
| `onClose` | `() => void` | -- | Close callback |
| `side` | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | Slide-in edge |
| `title` | `string` | -- | Header title |
| `description` | `string` | -- | Header description |
| `width` | `string` | `'max-w-md'` | Width/height class |

Features: backdrop blur, spring animation, Escape to close, body scroll lock, auto-focus.

---

#### Tooltip

Simple tooltip wrapper built on Radix UI with theme-styled content and arrow pointer.

```tsx
import { Tooltip } from '@annondeveloper/ui-kit'

<Tooltip content="Copy to clipboard" side="top"><button>...</button></Tooltip>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `ReactNode` | -- | Tooltip content |
| `children` | `ReactNode` | -- | Trigger element |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Display side |
| `delay` | `number` | `200` | Delay in ms |

---

#### Popover

Popover wrapper built on Radix Popover with Framer Motion entry animation.

```tsx
import { Popover } from '@annondeveloper/ui-kit'

<Popover trigger={<button>Options</button>} side="bottom" align="end">
  <p>Popover content</p>
</Popover>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | -- | Element that opens the popover |
| `children` | `ReactNode` | -- | Popover content |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Display side |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment |

---

#### DropdownMenu

Action/context dropdown menu built on Radix DropdownMenu with danger variant support.

```tsx
import { DropdownMenu } from '@annondeveloper/ui-kit'
import { Edit, Trash2 } from 'lucide-react'

<DropdownMenu
  trigger={<button>Actions</button>}
  items={[
    { label: 'Edit', icon: Edit, onClick: handleEdit },
    { label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'danger' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | -- | Element that opens the menu |
| `items` | `MenuItem[]` | -- | `{ label, icon?, onClick, variant?, disabled? }` |
| `align` | `'start' \| 'center' \| 'end'` | `'end'` | Menu alignment |

---

#### ConfirmDialog

Confirmation modal built on Radix AlertDialog with animated enter/exit.

```tsx
import { ConfirmDialog } from '@annondeveloper/ui-kit'

<ConfirmDialog
  open={showDelete} onOpenChange={setShowDelete}
  title="Delete server?" description="This action cannot be undone."
  variant="danger" confirmLabel="Delete" loading={isDeleting}
  onConfirm={handleDelete}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Control open state |
| `onOpenChange` | `(open: boolean) => void` | -- | Open state callback |
| `title` | `string` | -- | Dialog title |
| `description` | `string` | -- | Dialog description |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `variant` | `'danger' \| 'warning' \| 'default'` | `'danger'` | Icon and button color |
| `loading` | `boolean` | `false` | Show spinner on confirm button |
| `onConfirm` | `() => void` | -- | Confirm callback |

---

### Forms

#### FormInput

Themed form input with label, required indicator, and optional hint text.

```tsx
import { FormInput } from '@annondeveloper/ui-kit'

<FormInput label="Hostname" value={host} onChange={setHost} placeholder="10.0.0.1" required hint="IPv4 or FQDN" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Label text |
| `value` | `string` | -- | Input value |
| `onChange` | `(value: string) => void` | -- | Value change callback |
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | -- | Placeholder text |
| `required` | `boolean` | -- | Show required indicator |
| `disabled` | `boolean` | -- | Disable input |
| `hint` | `string` | -- | Help text below input |
| `autoComplete` | `string` | -- | Autocomplete attribute |

Also exports `INPUT_CLS`, `LABEL_CLS`, and `TEXTAREA_CLS` constants for building custom inputs with consistent styling.

---

#### Select

Themed dropdown built on Radix UI Select.

```tsx
import { Select } from '@annondeveloper/ui-kit'

<Select value={protocol} onValueChange={setProtocol}
        options={[{ value: 'snmp', label: 'SNMP' }, { value: 'ssh', label: 'SSH' }]}
        placeholder="Select protocol" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | -- | Selected value |
| `onValueChange` | `(v: string) => void` | -- | Selection callback |
| `options` | `SelectOption[]` | -- | `{ value, label }` |
| `placeholder` | `string` | -- | Placeholder text |
| `disabled` | `boolean` | -- | Disable select |

---

#### Checkbox

Themed checkbox with indeterminate state support. Forwards ref.

```tsx
import { Checkbox } from '@annondeveloper/ui-kit'

<Checkbox checked={selected} onChange={handleChange} indeterminate={isPartial} size="sm" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `indeterminate` | `boolean` | -- | Show minus indicator |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant |

Extends native `<input>` attributes (except `type` and `size`).

---

#### ToggleSwitch

Icon-based boolean toggle using lucide icons.

```tsx
import { ToggleSwitch } from '@annondeveloper/ui-kit'

<ToggleSwitch enabled={isActive} onChange={setIsActive} label="Auto-refresh" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | -- | Toggle state |
| `onChange` | `(enabled: boolean) => void` | -- | Change callback |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant |
| `disabled` | `boolean` | -- | Disable toggle |
| `label` | `string` | -- | Accessible label |

---

#### RadioGroup

Custom-styled radio button group with animated selection indicator.

```tsx
import { RadioGroup } from '@annondeveloper/ui-kit'

<RadioGroup
  options={[
    { value: 'v2c', label: 'SNMPv2c' },
    { value: 'v3', label: 'SNMPv3', description: 'Recommended for production' },
  ]}
  value={version} onChange={setVersion} orientation="vertical"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `RadioOption[]` | -- | `{ value, label, description?, disabled? }` |
| `value` | `string` | -- | Selected value |
| `onChange` | `(value: string) => void` | -- | Selection callback |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction |

Supports keyboard navigation (arrow keys, Home, End) and ARIA roles.

---

#### Slider

Custom range slider with keyboard accessibility and hover tooltip.

```tsx
import { Slider } from '@annondeveloper/ui-kit'

<Slider value={threshold} onChange={setThreshold} min={0} max={100} step={5} label="Alert threshold" showValue />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Current value |
| `onChange` | `(value: number) => void` | -- | Change callback |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `label` | `string` | -- | Label text |
| `showValue` | `boolean` | `false` | Show value display |

Supports keyboard (arrow keys, Home, End), mouse drag, and touch.

---

#### ColorInput

Compact color picker with expandable panel, hue/saturation area, format switching, and presets.

```tsx
import { ColorInput } from '@annondeveloper/ui-kit'

<ColorInput value={color} onChange={setColor} label="Accent" format="hex"
            presets={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | -- | Hex color string |
| `onChange` | `(color: string) => void` | -- | Change callback |
| `label` | `string` | -- | Optional label |
| `presets` | `string[]` | -- | Preset color swatches |
| `showAlpha` | `boolean` | `false` | Show alpha slider |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Display format |

Features: HSL picker area, hue slider, format switching, clipboard copy, recent color history (localStorage).

---

#### StepWizard

Multi-step form wizard with animated slide transitions and per-step validation.

```tsx
import { StepWizard } from '@annondeveloper/ui-kit'

<StepWizard
  steps={[
    { id: 'creds', title: 'Credentials', content: <CredentialsForm /> },
    { id: 'targets', title: 'Targets', content: <TargetForm />, validate: () => targets.length > 0 },
    { id: 'review', title: 'Review', content: <ReviewSummary /> },
  ]}
  onComplete={handleDeploy} showSummary
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `WizardStep[]` | -- | `{ id, title, description?, icon?, content, validate? }` |
| `onComplete` | `() => void` | -- | Final step completion callback |
| `onStepChange` | `(step: number) => void` | -- | Step change callback |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Step indicator layout |
| `allowSkip` | `boolean` | `false` | Allow skipping to uncompleted steps |
| `showSummary` | `boolean` | `false` | Show completion state after last step |

Features: animated step transitions, progress bar, keyboard navigation (Enter to advance), session storage auto-save, async validation.

---

#### FilterPill

Rounded pill-style filter toggle with optional count.

```tsx
import { FilterPill } from '@annondeveloper/ui-kit'

<FilterPill label="Critical" count={12} active={filter === 'critical'} onClick={() => setFilter('critical')} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Pill text |
| `count` | `number` | -- | Optional count badge |
| `active` | `boolean` | -- | Active/selected state |
| `onClick` | `() => void` | -- | Click handler |

---

### Data Display

#### DataTable

Full-featured data grid built on TanStack Table v8.

```tsx
import { DataTable } from '@annondeveloper/ui-kit'

<DataTable
  columns={columns} data={devices} isLoading={isLoading}
  searchPlaceholder="Search devices..."
  defaultPageSize={25} exportFilename="devices"
  onRowClick={(row) => router.push(`/devices/${row.id}`)}
  emptyState={{ icon: Server, title: 'No devices', description: 'Run a discovery scan to get started.' }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | -- | TanStack column definitions |
| `data` | `T[]` | -- | Row data |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `emptyState` | `{ icon, title, description }` | -- | Custom empty state |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `onRowClick` | `(row: T) => void` | -- | Row click handler |
| `defaultSort` | `{ id, desc }` | -- | Initial sort configuration |
| `defaultPageSize` | `number` | `25` | Rows per page |
| `exportFilename` | `string` | -- | Enables CSV export button |
| `stickyFirstColumn` | `boolean` | `false` | Sticky first column on scroll |
| `density` | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'` | Row density |

Built-in features: global search, auto-detected column filters (text/enum/number range), multi-column sort, pagination, density control (persisted to localStorage), column visibility picker with drag reorder, CSV export, row click, loading skeleton, empty state, Framer Motion row animations.

---

#### SmartTable

Enhanced DataTable that auto-generates filter suggestions by analyzing column data.

```tsx
import { SmartTable } from '@annondeveloper/ui-kit'

<SmartTable columns={columns} data={data} maxSuggestions={4} onFilterSuggestion={console.log} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ...all DataTable props | | | Inherits all DataTable props |
| `onFilterSuggestion` | `(suggestion: FilterSuggestion) => void` | -- | Suggestion click callback |
| `maxSuggestions` | `number` | `6` | Max visible suggestions |

Auto-detects: statistical outliers (>2 std dev), top-N frequent values, dominant pattern detection, minority value highlighting.

---

#### AnimatedCounter

Smooth number animation using requestAnimationFrame with cubic easing.

```tsx
import { AnimatedCounter } from '@annondeveloper/ui-kit'

<AnimatedCounter value={deviceCount} duration={400} format={n => n.toLocaleString()} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Target value |
| `duration` | `number` | `400` | Animation duration (ms) |
| `format` | `(n: number) => string` | -- | Custom number formatter |

---

#### Sparkline

Tiny inline SVG sparkline chart with gradient fill.

```tsx
import { Sparkline } from '@annondeveloper/ui-kit'

<Sparkline data={[10, 25, 18, 30, 22]} width={80} height={24} showDots />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | -- | Values to plot (min 2) |
| `width` | `number` | `80` | SVG width |
| `height` | `number` | `24` | SVG height |
| `color` | `string` | `'hsl(var(--brand-primary))'` | Line color |
| `fillOpacity` | `number` | `0.1` | Gradient fill opacity (0 to disable) |
| `showDots` | `boolean` | `false` | Dots on first/last points |

---

#### TruncatedText

Auto-truncating text with tooltip and copy-to-clipboard on hover.

```tsx
import { TruncatedText } from '@annondeveloper/ui-kit'

<TruncatedText text="very-long-hostname-that-overflows.example.com" maxWidth={200} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Full text content |
| `maxWidth` | `string \| number` | `'100%'` | Max width for truncation |

---

#### CopyBlock

Monospace code/text display with one-click copy and collapsible overflow.

```tsx
import { CopyBlock } from '@annondeveloper/ui-kit'

<CopyBlock content="curl -X GET https://api.example.com/health" language="bash" label="Health check" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | -- | Text content |
| `language` | `string` | -- | Language hint (e.g. "json", "bash") |
| `showLineNumbers` | `boolean` | `false` | Show line number gutter |
| `maxHeight` | `number` | -- | Max height before "Show more" toggle |
| `label` | `string` | -- | Label above the block |

---

#### DiffViewer

Line-by-line diff viewer using LCS algorithm with collapsible unchanged sections.

```tsx
import { DiffViewer } from '@annondeveloper/ui-kit'

<DiffViewer oldValue={previousConfig} newValue={currentConfig} mode="side-by-side" showLineNumbers />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `oldValue` | `string` | -- | Original text |
| `newValue` | `string` | -- | Modified text |
| `mode` | `'inline' \| 'side-by-side'` | `'inline'` | Display mode |
| `language` | `string` | -- | Language hint |
| `showLineNumbers` | `boolean` | `true` | Show line numbers |

---

### Status & Monitoring

#### StatusBadge

Configurable status indicator with colored dot and label.

```tsx
import { StatusBadge, defaultStatusMap } from '@annondeveloper/ui-kit'

<StatusBadge status="active" pulse />
<StatusBadge status="healthy" statusMap={myCustomStatuses} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | -- | Status key |
| `label` | `string` | -- | Override display label |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant |
| `pulse` | `boolean` | `false` | Pulse animation on the dot |
| `statusMap` | `Record<string, StatusConfig>` | `defaultStatusMap` | Custom status definitions |

Built-in statuses: `ok`, `active`, `warning`, `critical`, `unknown`, `maintenance`, `stale`, `inactive`, `decommissioned`, `pending`.

---

#### StatusPulse

Animated status dot with optional pulse ring and label.

```tsx
import { StatusPulse } from '@annondeveloper/ui-kit'

<StatusPulse status="online" />
<StatusPulse status="degraded" label={false} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | -- | Status key |
| `label` | `boolean` | `true` | Show status text |
| `configMap` | `Record<string, PulseConfig>` | `defaultPulseConfigMap` | Custom pulse configs |

Built-in statuses: `online` (green pulse), `degraded` (yellow fast pulse), `offline` (red, no pulse), `unknown` (gray, no pulse).

---

#### MetricCard

Dashboard stat tile with animated counter, trend indicator, and optional sparkline.

```tsx
import { MetricCard } from '@annondeveloper/ui-kit'
import { HardDrive } from 'lucide-react'

<MetricCard
  label="Disk Usage" value={78.3} format={n => `${n.toFixed(1)}%`}
  previousValue={72.1} trendDirection="up-bad"
  icon={HardDrive} status="warning"
  sparklineData={[65, 68, 70, 72, 75, 78]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Metric name |
| `value` | `number` | -- | Current value |
| `format` | `(n: number) => string` | -- | Custom formatter |
| `previousValue` | `number` | -- | Previous value for trend |
| `trendDirection` | `'up-good' \| 'up-bad' \| 'down-good' \| 'down-bad'` | -- | Color interpretation |
| `icon` | `ElementType` | -- | Lucide icon component |
| `status` | `'ok' \| 'warning' \| 'critical'` | -- | Left border accent color |
| `sparklineData` | `number[]` | -- | Recent values for inline chart |

---

#### ThresholdGauge

Semicircular SVG gauge with color-coded threshold zones.

```tsx
import { ThresholdGauge } from '@annondeveloper/ui-kit'

<ThresholdGauge value={85} label="CPU" thresholds={{ warning: 70, critical: 90 }} size={120} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Gauge value (0-100) |
| `label` | `string` | -- | Label below gauge |
| `thresholds` | `{ warning, critical }` | `{ warning: 70, critical: 90 }` | Color zone boundaries |
| `size` | `number` | `120` | Diameter in pixels |
| `showValue` | `boolean` | `true` | Show value in center |
| `format` | `(n: number) => string` | -- | Custom value formatter |

---

#### UtilizationBar

Horizontal bar with color-coded thresholds. Animates fill on mount.

```tsx
import { UtilizationBar } from '@annondeveloper/ui-kit'

<UtilizationBar value={92} label="Memory" thresholds={{ warning: 70, critical: 90 }} size="md" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Utilization percentage (0-100) |
| `thresholds` | `{ warning, critical }` | `{ warning: 70, critical: 90 }` | Color zone boundaries |
| `label` | `string` | -- | Label to the left |
| `showValue` | `boolean` | `true` | Show percentage text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height |
| `animated` | `boolean` | `true` | Animate fill width |

---

#### UptimeTracker

GitHub/Statuspage-style daily uptime bar strip.

```tsx
import { UptimeTracker } from '@annondeveloper/ui-kit'

<UptimeTracker
  days={last90Days} label="API Server" showPercentage
  onDayClick={(day) => showIncidents(day.date)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `days` | `DayStatus[]` | -- | `{ date, status: 'ok'\|'degraded'\|'outage'\|'no-data', uptime? }` |
| `showPercentage` | `boolean` | `true` | Show overall uptime % |
| `label` | `string` | -- | Header label |
| `onDayClick` | `(day: DayStatus) => void` | -- | Day click callback |

---

#### PortStatusGrid

Grid of colored indicators for network ports/interfaces.

```tsx
import { PortStatusGrid } from '@annondeveloper/ui-kit'

<PortStatusGrid
  ports={switchPorts} columns={24} size="md"
  onPortClick={(port) => showPortDetail(port.id)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ports` | `PortStatus[]` | -- | `{ id, label, status: 'up'\|'down'\|'disabled'\|'error', speed?, utilization? }` |
| `columns` | `number` | auto-fit | Grid columns |
| `size` | `'sm' \| 'md'` | `'sm'` | Indicator size |
| `onPortClick` | `(port: PortStatus) => void` | -- | Port click callback |

---

#### PipelineStage

Horizontal data pipeline visualization with status dots and chevron connectors.

```tsx
import { PipelineStage } from '@annondeveloper/ui-kit'

<PipelineStage
  stages={[
    { name: 'Collector', status: 'active', metric: { label: 'msg/s', value: '1.2K' } },
    { name: 'Normalizer', status: 'active' },
    { name: 'Writer', status: 'error' },
  ]}
  onStageClick={(stage) => showStageDetail(stage)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stages` | `StageInfo[]` | -- | `{ name, status: 'active'\|'idle'\|'error'\|'disabled', metric?, icon? }` |
| `onStageClick` | `(stage, index) => void` | -- | Stage click callback |

---

#### SeverityTimeline

Horizontal scrollable event timeline with severity-colored dots.

```tsx
import { SeverityTimeline } from '@annondeveloper/ui-kit'

<SeverityTimeline events={recentAlerts} maxVisible={20} onEventClick={showAlertDetail} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `TimelineEvent[]` | -- | `{ time, label, severity: 'critical'\|'warning'\|'info'\|'ok', detail? }` |
| `maxVisible` | `number` | `20` | Max visible events |
| `onEventClick` | `(event) => void` | -- | Event click callback |

---

#### TimeRangeSelector

Compact horizontal pill-group time range selector.

```tsx
import { TimeRangeSelector } from '@annondeveloper/ui-kit'

<TimeRangeSelector value={range} onChange={(v, r) => setRange(v)} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | -- | Selected range value |
| `onChange` | `(value, range) => void` | -- | Selection callback |
| `ranges` | `TimeRange[]` | `[1h, 6h, 24h, 7d, 30d]` | Custom range options (each `{ label, value, seconds }`) |

---

#### LogViewer

Real-time log stream viewer with severity-colored borders and auto-scroll.

```tsx
import { LogViewer } from '@annondeveloper/ui-kit'

<LogViewer entries={logs} maxHeight={400} autoScroll showTimestamps onEntryClick={showDetail} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entries` | `LogEntry[]` | -- | `{ time, level: 'error'\|'warn'\|'info'\|'debug'\|'trace', message, source? }` |
| `maxHeight` | `number` | `400` | Container max height |
| `autoScroll` | `boolean` | `true` | Auto-scroll on new entries |
| `showTimestamps` | `boolean` | `true` | Show timestamps column |
| `showLevel` | `boolean` | `true` | Show level badge |
| `onEntryClick` | `(entry) => void` | -- | Entry click callback |

Features: search filtering, "N new entries" floating badge when scrolled up.

---

### Real-Time & AI

#### RealtimeValue

Live data display with freshness tracking, connection state, and delta arrows.

```tsx
import { RealtimeValue } from '@annondeveloper/ui-kit'
import { fmtBps } from '@annondeveloper/ui-kit'

<RealtimeValue
  value={throughput} format={fmtBps}
  previousValue={prevThroughput} lastUpdated={lastTs}
  staleAfterMs={30000} connectionState="connected" size="lg"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| string` | -- | Current value |
| `label` | `string` | -- | Label text |
| `format` | `(v: number) => string` | -- | Custom formatter |
| `lastUpdated` | `string \| Date` | -- | Last data timestamp |
| `staleAfterMs` | `number` | `30000` | Staleness threshold (ms) |
| `connectionState` | `'connected' \| 'reconnecting' \| 'disconnected'` | `'connected'` | Connection indicator |
| `previousValue` | `number` | -- | Previous value for delta |
| `animate` | `boolean` | `true` | Animate value changes |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Display size |

Features: animated number transitions, freshness dot (green/yellow/red), ping animation when fresh, connection state icon (reconnecting spinner, disconnected icon), auto-updating relative timestamp.

---

#### StreamingText

AI/LLM streaming text display with blinking cursor and inline markdown formatting.

```tsx
import { StreamingText } from '@annondeveloper/ui-kit'

<StreamingText text={response} isStreaming={isGenerating} onComplete={() => logCompletion()} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Text content (grows as tokens arrive) |
| `isStreaming` | `boolean` | -- | Whether tokens are still arriving |
| `speed` | `number` | `500` | Cursor blink speed (ms) |
| `showCursor` | `boolean` | `true` | Show blinking cursor |
| `onComplete` | `() => void` | -- | Streaming complete callback |

Features: auto-scroll during streaming, inline `**bold**` and `` `code` `` formatting, copy button appears on completion.

---

#### TypingIndicator

"Someone is typing" indicator with three animation variants.

```tsx
import { TypingIndicator } from '@annondeveloper/ui-kit'

<TypingIndicator variant="dots" label="AI is thinking" size="md" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Status text |
| `variant` | `'dots' \| 'pulse' \| 'text'` | `'dots'` | Animation variant |
| `size` | `'sm' \| 'md'` | `'md'` | Size preset |

---

#### ConfidenceBar

Horizontal probability bar with color-coded threshold zones.

```tsx
import { ConfidenceBar } from '@annondeveloper/ui-kit'

<ConfidenceBar value={0.87} label="Match confidence" thresholds={{ low: 0.3, medium: 0.7 }} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Confidence (0-1) |
| `label` | `string` | -- | Label text |
| `showPercentage` | `boolean` | `true` | Show percentage |
| `thresholds` | `{ low, medium }` | `{ low: 0.3, medium: 0.7 }` | Color zone boundaries |
| `size` | `'sm' \| 'md'` | `'md'` | Bar height |

---

#### CommandBar

Universal command palette activated by Cmd+K / Ctrl+K.

```tsx
import { CommandBar } from '@annondeveloper/ui-kit'

<CommandBar
  items={[
    { id: 'devices', label: 'Go to Devices', shortcut: 'G D', onSelect: () => navigate('/devices') },
    { id: 'search', label: 'Search entities', icon: Search, onSelect: openSearch, keywords: ['find'] },
  ]}
  placeholder="Type a command..."
  onSearch={async (q) => fetchResults(q)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CommandItem[]` | -- | `{ id, label, description?, icon?, shortcut?, group?, onSelect, keywords? }` |
| `placeholder` | `string` | `'Type a command...'` | Search placeholder |
| `hotkey` | `string` | `'k'` | Hotkey letter (Cmd/Ctrl+key) |
| `onSearch` | `(query) => Promise<CommandItem[]>` | -- | Async search function |
| `recentKey` | `string` | `'ui-kit-command-recent'` | localStorage key for recents |
| `maxRecent` | `number` | `5` | Max recent items |

Features: fuzzy search scoring, grouped sections, recent selections (localStorage), async search with debounce, keyboard navigation (arrows + Enter), keyboard shortcut hints in footer.

---

#### LiveFeed

Real-time event feed with animated entry, pause/resume, and type-colored borders.

```tsx
import { LiveFeed } from '@annondeveloper/ui-kit'

<LiveFeed
  items={events} maxVisible={50} showTimestamps autoScroll
  onItemClick={(item) => showDetail(item.id)}
  emptyMessage="Waiting for events..."
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FeedItem[]` | -- | `{ id, content: ReactNode, timestamp, type?: 'info'\|'success'\|'warning'\|'error' }` |
| `maxVisible` | `number` | `50` | Max visible items |
| `showTimestamps` | `boolean` | `true` | Show relative timestamps |
| `autoScroll` | `boolean` | `true` | Auto-scroll to newest |
| `onItemClick` | `(item) => void` | -- | Item click callback |
| `emptyMessage` | `string` | `'No events yet'` | Empty state text |

Features: pause/resume button, "N new items" floating badge when scrolled, auto-updating relative timestamps.

---

#### NotificationStack

Fixed-position notification cards with auto-dismiss progress bars.

```tsx
import { NotificationStack } from '@annondeveloper/ui-kit'

<NotificationStack
  notifications={notifications}
  onDismiss={(id) => removeNotification(id)}
  position="top-right" maxVisible={5}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `Notification[]` | -- | `{ id, title, message?, type, action?, dismissible?, duration? }` |
| `onDismiss` | `(id: string) => void` | -- | Dismiss callback |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Screen position |
| `maxVisible` | `number` | `5` | Max visible before stacking |

Features: type-specific icons and colors, action buttons, auto-dismiss with progress bar, overflow indicator, spring entry/exit animations.

---

### Layout & Feedback

#### EmptyState

Decorative placeholder with icon, title, description, and optional actions.

```tsx
import { EmptyState, Button } from '@annondeveloper/ui-kit'
import { Inbox } from 'lucide-react'

<EmptyState icon={Inbox} title="No alerts" description="Your infrastructure is healthy."
            actions={<Button size="sm">Configure Rules</Button>} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `LucideIcon` | -- | Center icon |
| `title` | `string` | -- | Title text |
| `description` | `string` | -- | Description text |
| `actions` | `ReactNode` | -- | Action buttons |

---

#### Skeleton / SkeletonText / SkeletonCard

Shimmer loading placeholders.

```tsx
import { Skeleton, SkeletonText, SkeletonCard } from '@annondeveloper/ui-kit'

<Skeleton className="h-8 w-32" />
<SkeletonText lines={3} />
<SkeletonCard />
```

`SkeletonText` props: `lines?: number` (default 1).

---

#### Progress

Progress bar with optional label, animated fill, and indeterminate mode.

```tsx
import { Progress } from '@annondeveloper/ui-kit'

<Progress value={65} max={100} label="Upload" showValue variant="success" />
<Progress indeterminate label="Processing..." />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Current value |
| `max` | `number` | `100` | Maximum value |
| `label` | `string` | -- | Label text |
| `showValue` | `boolean` | `false` | Show percentage |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height |
| `animated` | `boolean` | `true` | Animate fill changes |
| `indeterminate` | `boolean` | `false` | Shimmer animation |

---

#### Avatar

User/entity avatar with image support, initials fallback, and status dot.

```tsx
import { Avatar } from '@annondeveloper/ui-kit'

<Avatar src="/avatar.jpg" alt="Jane Doe" size="md" status="online" />
<Avatar alt="John Smith" size="sm" />  {/* Shows "JS" initials */}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | -- | Image URL |
| `alt` | `string` | -- | Alt text (used for initials derivation) |
| `fallback` | `string` | -- | Override initials |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size preset |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away'` | -- | Status dot overlay |

---

#### InfiniteScroll

Virtualized infinite-scroll list using IntersectionObserver.

```tsx
import { InfiniteScroll } from '@annondeveloper/ui-kit'

<InfiniteScroll
  items={logs} hasMore={hasNextPage} isLoading={isFetching}
  loadMore={fetchNextPage} itemHeight={48}
  renderItem={(item, i) => <LogRow key={item.id} entry={item} />}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | -- | Loaded items |
| `renderItem` | `(item, index) => JSX.Element` | -- | Item renderer |
| `loadMore` | `() => void \| Promise<void>` | -- | Load more callback |
| `hasMore` | `boolean` | -- | Whether more items exist |
| `isLoading` | `boolean` | `false` | Loading state |
| `threshold` | `number` | `200` | Trigger distance from bottom (px) |
| `itemHeight` | `number` | -- | Fixed height for virtualization |
| `emptyState` | `ReactNode` | -- | Empty content |

Features: optional height-based virtualization, scroll-to-top button, skeleton placeholders.

---

#### SortableList

Drag-and-drop reorderable list with smooth layout animations.

```tsx
import { SortableList, DragHandle } from '@annondeveloper/ui-kit'

<SortableList
  items={rules} onReorder={setRules}
  renderItem={(item, i, dragProps) => (
    <div className="flex items-center gap-2 p-3">
      <DragHandle {...dragProps} />
      <span>{item.name}</span>
    </div>
  )}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` (each needs `id: string`) | -- | Items to display |
| `onReorder` | `(items: T[]) => void` | -- | Reorder callback |
| `renderItem` | `(item, index, dragHandleProps) => JSX.Element` | -- | Item renderer |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout direction |

Features: pointer-based drag (no external DnD library), keyboard reordering (Space to pick, arrows to move, Enter to drop), touch support, drop indicator line.

---

#### KanbanColumn

Kanban board column with title, count badge, and scrollable card list.

```tsx
import { KanbanColumn } from '@annondeveloper/ui-kit'

<KanbanColumn
  title="In Progress" color="hsl(var(--status-warning))"
  items={tasks} onItemClick={showTask} onAddItem={createTask}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | -- | Column title |
| `items` | `KanbanItem[]` | -- | `{ id, title, description?, tags?, assignee? }` |
| `count` | `number` | -- | Override count badge |
| `color` | `string` | -- | Header accent color |
| `onItemClick` | `(item) => void` | -- | Card click callback |
| `onAddItem` | `() => void` | -- | Add button callback |

---

#### HeatmapCalendar

GitHub-style contribution heatmap calendar with configurable color scale.

```tsx
import { HeatmapCalendar } from '@annondeveloper/ui-kit'

<HeatmapCalendar data={dailyMetrics} onDayClick={(d) => showDayDetail(d.date)} showMonthLabels showDayLabels />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `DayValue[]` | -- | `{ date: 'YYYY-MM-DD', value: number }` |
| `startDate` | `string` | 365 days ago | Start date |
| `endDate` | `string` | Today | End date |
| `colorScale` | `string[]` | Green 5-step scale | 5 colors lightest to darkest |
| `onDayClick` | `(day) => void` | -- | Day click callback |
| `showMonthLabels` | `boolean` | `true` | Month labels at top |
| `showDayLabels` | `boolean` | `true` | Day-of-week labels |
| `tooltipFormat` | `(day) => string` | -- | Custom tooltip format |

---

#### Toaster / toast

Pre-themed Sonner toast container. Import once, use `toast()` anywhere.

```tsx
// In layout:
import { Toaster } from '@annondeveloper/ui-kit'
<Toaster theme="dark" position="bottom-right" />

// Anywhere:
import { toast } from '@annondeveloper/ui-kit'
toast.success('Deployment complete')
toast.error('Connection failed')
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'dark' \| 'light'` | `'dark'` | Toast theme |
| `position` | Sonner positions | `'bottom-right'` | Screen position |
| `duration` | `number` | `4000` | Auto-dismiss (ms) |

---

#### SuccessCheckmark

Animated SVG checkmark with circle and path draw animations.

```tsx
import { SuccessCheckmark } from '@annondeveloper/ui-kit'

<SuccessCheckmark size={24} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `20` | SVG size in pixels |

---

## Utilities

### Class Merging

```tsx
import { cn } from '@annondeveloper/ui-kit'

cn('px-4 py-2', isActive && 'bg-blue-500', className)
```

### Formatters

| Function | Example | Output |
|----------|---------|--------|
| `fmtBps(n)` | `fmtBps(1_000_000_000)` | `"1.0 Gbps"` |
| `fmtSpeed(n)` | `fmtSpeed(10_000_000_000)` | `"10G"` |
| `fmtBytes(n)` | `fmtBytes(1_073_741_824)` | `"1.0 GB"` |
| `fmtPct(n, d?)` | `fmtPct(95.6)` | `"95.6%"` |
| `fmtUptime(secs)` | `fmtUptime(90061)` | `"1d 1h"` |
| `fmtRelative(iso)` | `fmtRelative('2024-01-01')` | `"3d ago"` |
| `fmtCompact(n)` | `fmtCompact(480_933_305)` | `"480.9M"` |
| `fmtDuration(secs)` | `fmtDuration(0.003)` | `"3ms"` |
| `fmtUtil(bps, speed)` | `fmtUtil(500_000_000, 1_000_000_000)` | `"50%"` |
| `stripCidr(ip)` | `stripCidr('10.0.0.1/32')` | `"10.0.0.1"` |
| `clamp(v, min, max)` | `clamp(150, 0, 100)` | `100` |

### utilColor

Returns a Tailwind class based on utilization percentage:

```tsx
import { utilColor, defaultUtilColorMap } from '@annondeveloper/ui-kit'

utilColor(85)                        // "text-[hsl(var(--status-critical))]"
utilColor(45)                        // "text-[hsl(var(--status-ok))]"
utilColor(75, customColorMap)        // uses your thresholds
```

The `defaultUtilColorMap` thresholds: >= 80% critical (red), >= 60% warning (yellow), < 60% ok (green).

### createBadgeVariant

Factory for domain-specific badge components. See [Badge](#badge) section above.

---

## Theme System

The library uses CSS custom properties for theming. Dark mode is the default; add the `light` class to `<html>` for light mode.

### Token Reference

| Token | Purpose | Dark Default | Light Default |
|-------|---------|--------------|---------------|
| `--bg-base` | Page background | `222 47% 7%` | `210 40% 98%` |
| `--bg-surface` | Card/panel background | `222 40% 10%` | `0 0% 100%` |
| `--bg-elevated` | Elevated surface (dropdowns, popovers) | `222 35% 14%` | `210 40% 96%` |
| `--bg-overlay` | Overlay/hover background | `222 30% 18%` | `210 30% 92%` |
| `--border-subtle` | Subtle borders | `222 30% 20%` | `210 20% 88%` |
| `--border-default` | Default borders | `222 25% 25%` | `210 20% 80%` |
| `--border-strong` | Strong/focus borders | `222 20% 35%` | `210 20% 65%` |
| `--text-primary` | Primary text | `210 40% 95%` | `222 47% 11%` |
| `--text-secondary` | Secondary text | `210 20% 70%` | `222 25% 35%` |
| `--text-tertiary` | Tertiary text | `210 15% 50%` | `222 15% 55%` |
| `--text-disabled` | Disabled text | `210 10% 35%` | `222 10% 75%` |
| `--brand-primary` | Brand/accent color | `217 91% 60%` | `217 91% 50%` |
| `--brand-secondary` | Secondary accent | `258 80% 65%` | `258 80% 58%` |
| `--text-on-brand` | Text on brand backgrounds | `0 0% 100%` | `0 0% 100%` |
| `--status-ok` | Success/online | `142 71% 45%` | `142 71% 38%` |
| `--status-warning` | Warning/degraded | `38 92% 50%` | `38 92% 42%` |
| `--status-critical` | Critical/error | `0 84% 60%` | `0 84% 52%` |
| `--status-unknown` | Unknown status | `220 15% 50%` | `220 15% 55%` |
| `--status-maintenance` | Maintenance mode | `258 60% 65%` | `258 60% 58%` |
| `--chart-1` through `--chart-8` | Chart color series | Various | Various |

### Customization

Override any token in your own CSS:

```css
:root {
  --brand-primary: 160 84% 39%;    /* teal accent */
  --status-ok: 160 84% 39%;
}
```

### Theme Toggle

```tsx
function ThemeToggle() {
  const toggle = () => document.documentElement.classList.toggle('light')
  return <button onClick={toggle}>Toggle theme</button>
}
```

### Typography Scale

The theme CSS includes utility classes: `.text-display`, `.text-heading-1`, `.text-heading-2`, `.text-heading-3`, `.text-body`, `.text-small`, `.text-label`.

---

## CLI

Scaffold components directly into your project -- shadcn/ui-style.

### Initialize

```bash
npx @annondeveloper/ui-kit init
```

Copies `theme.css` and `utils.ts` into your target directory (default `./components/ui`).

### Add a Component

```bash
npx @annondeveloper/ui-kit add button
npx @annondeveloper/ui-kit add data-table
npx @annondeveloper/ui-kit add metric-card
```

Copies the component source file and resolves internal dependencies automatically.

### List Available Components

```bash
npx @annondeveloper/ui-kit list
```

### Options

| Flag | Description |
|------|-------------|
| `--dir <path>` | Target directory (default `./components/ui`) |
| `--overwrite` | Overwrite existing files |

---

## Form Integration

Install the optional peer dependency:

```bash
npm install react-hook-form
```

Import from the dedicated entry point:

```tsx
import { RHFFormInput, RHFSelect, RHFCheckbox, RHFToggleSwitch } from '@annondeveloper/ui-kit/form'
```

### Example with Validation

```tsx
import { useForm } from 'react-hook-form'
import { RHFFormInput, RHFSelect } from '@annondeveloper/ui-kit/form'
import { Button } from '@annondeveloper/ui-kit'

function CredentialForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: { hostname: '', protocol: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RHFFormInput
        control={control} name="hostname" label="Hostname"
        rules={{ required: 'Hostname is required' }} placeholder="10.0.0.1"
      />
      <RHFSelect
        control={control} name="protocol" label="Protocol"
        options={[{ value: 'snmp', label: 'SNMP' }, { value: 'ssh', label: 'SSH' }]}
        rules={{ required: 'Select a protocol' }}
      />
      <Button type="submit" variant="primary">Save</Button>
    </form>
  )
}
```

All RHF wrappers automatically display validation errors from `fieldState.error`.

---

## Contributing

### Development Setup

```bash
git clone https://github.com/annondeveloper/ui-kit.git
cd ui-kit
npm install
npm run storybook     # Component explorer at localhost:6006
npm run test:watch    # Vitest in watch mode
npm run typecheck     # TypeScript check
```

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

Tests use Vitest + Testing Library + jest-axe for accessibility.

### Adding a Component

1. Create `src/components/my-component.tsx` with the `'use client'` directive
2. Export from `src/index.ts`
3. Add to `src/cli/registry.ts` for CLI support
4. Add a Storybook story in `src/components/my-component.stories.tsx`
5. Add tests in `src/__tests__/my-component.test.tsx`
6. Run `npm run typecheck && npm test` to verify

### Conventions

- All colors use `hsl(var(--token))` syntax -- never hardcoded hex values
- All animations respect `useReducedMotion()` from Framer Motion
- Components use `'use client'` directive for React Server Component compatibility
- Types are exported alongside components for consumer use

---

## License

[MIT](./LICENSE)
