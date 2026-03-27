# UI Kit v2 — Documentation

## Overview

`@annondeveloper/ui-kit` is a zero-dependency React component library with 116 components, physics-based animations, an OKLCH color system, and the Aurora Fluid design identity.

- **116 components** across 3 weight tiers (Lite, Standard, Premium)
- **Zero dependencies** — only `react` ^19 and `react-dom` ^19 as peer deps
- **OKLCH color system** — perceptually uniform, with relative color syntax for theme generation
- **Physics-based motion** — real spring solver (RK4 integration), 4 motion levels
- **Dark and light mode** — automatic via CSS custom properties
- **Full accessibility** — WAI-ARIA patterns, keyboard navigation, screen reader support

## Installation

```bash
npm install @annondeveloper/ui-kit
```

## Quick Start

```tsx
import { UIProvider, Button, Card, Badge } from '@annondeveloper/ui-kit'

function App() {
  return (
    <UIProvider motion={3} mode="dark">
      <Card variant="elevated" padding="lg">
        <h2>Welcome</h2>
        <p>Your first ui-kit app</p>
        <Button variant="primary" size="md">
          Get Started
        </Button>
        <Badge variant="success">Online</Badge>
      </Card>
    </UIProvider>
  )
}
```

## Weight Tiers

Every component is available in up to 3 weight tiers, allowing you to optimize bundle size.

### Lite — 114 components

```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit/lite'
```

- ~0.3–1.2 KB per component (gzipped)
- No animations, no motion engine, no style injection
- Pure `className` + `data-*` attribute wrappers with `forwardRef`
- Ideal for: landing pages, static sites, email templates, SSR

### Standard (default) — 116 components

```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit'
```

- ~1.5–5 KB per component (gzipped)
- 47 general-purpose + 69 domain-specific components
- Motion levels 0–3 with real spring solver
- OKLCH theming with `adoptedStyleSheets` auto-injection
- `@scope` CSS isolation, `@layer components` cascade
- Full keyboard navigation and ARIA patterns

### Premium — 114 components

```tsx
import { Button, Badge, Card } from '@annondeveloper/ui-kit/premium'
```

- ~3–8 KB per component (gzipped)
- Aurora glow effects (brand-colored layered box-shadows)
- Spring-scale entrance animations with overshoot
- Shimmer gradients on interactive elements
- Particle bursts on completion events
- Glass morphism on overlay components
- `@layer premium` CSS isolation

### Mixing Tiers

```tsx
import { MetricCard } from '@annondeveloper/ui-kit/premium'  // hero metric with aurora glow
import { Badge } from '@annondeveloper/ui-kit/lite'           // lightweight table badge
import { DataTable } from '@annondeveloper/ui-kit'            // full-featured table
```

### Tier Coverage

| Tier | Components | Notes |
|------|-----------|-------|
| Lite | 114 | All except `ui-provider` and `native-tooltip` |
| Standard | 116 | 47 general-purpose + 69 domain-specific |
| Premium | 114 | All except `ui-provider` and `native-tooltip` |

## Entry Points

| Path | Description | Components |
|------|-------------|-----------|
| `@annondeveloper/ui-kit` | Standard tier (default) | 116 |
| `@annondeveloper/ui-kit/lite` | Lite tier | 114 |
| `@annondeveloper/ui-kit/premium` | Premium tier | 114 |
| `@annondeveloper/ui-kit/form` | Form engine | `createForm`, `useForm`, validators |
| `@annondeveloper/ui-kit/theme` | Theme utilities | `generateTheme`, `applyTheme`, `themeToCSS`, `validateContrast` |
| `@annondeveloper/ui-kit/css/theme.css` | Standalone theme CSS | Dark + light mode tokens |
| `@annondeveloper/ui-kit/css/all.css` | All component CSS | 114 component stylesheets |
| `@annondeveloper/ui-kit/css/components/*` | Per-component CSS | Individual stylesheets |

## UIProvider

Wrap your app root to configure motion, density, and color mode:

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'

<UIProvider motion={3} mode="dark" density="default">
  <App />
</UIProvider>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `motion` | `0 \| 1 \| 2 \| 3` | `3` | Animation intensity |
| `mode` | `'dark' \| 'light'` | `'dark'` | Color scheme |
| `density` | `'compact' \| 'default' \| 'spacious'` | `'default'` | UI spacing density |

### Motion Levels

| Level | Name | Behavior |
|-------|------|----------|
| 0 | None | Instant show/hide, no transitions |
| 1 | Subtle | Simple CSS transitions, no springs |
| 2 | Expressive | Conservative springs, no overshoot |
| 3 | Cinematic | Full physics with overshoot, particles, aurora glow |

Motion cascade: OS `prefers-reduced-motion` > component `motion` prop > CSS `--motion` > `UIProvider` > default (3).

## Component Reference

### General-Purpose (47)

#### Buttons & Actions
- **Button** — 5 variants (primary, secondary, outline, ghost, danger), 5 sizes, icon support, loading state
- **ShimmerButton** — shimmering gradient border animation

#### Typography & Text
- **Typography** — 11 semantic variants (h1–h6, body, body-sm, caption, code, overline), fluid `clamp()` sizing, color, weight, alignment, multi-line truncation, custom element via `as` prop
- **Kbd** — keyboard shortcut display, default and ghost variants, 3 sizes
- **Link** — styled anchor with slide-in underline animation, 3 variants (default, subtle, brand), external link auto-detection, 5 sizes
- **TruncatedText** — overflow text with expand/collapse toggle

#### Layout & Containers
- **Card** — versatile container with header/body/footer, 3 variants (default, elevated, outline), 5 padding levels, interactive mode
- **Divider** — horizontal/vertical separator with optional label, 3 line styles (solid, dashed, dotted)
- **AppShell** — full application layout scaffold with sidebar, header, main content
- **Sidebar** — collapsible side navigation with items, header, content, footer
- **Navbar** — top-level application navigation bar

#### Forms
- **FormInput** — text input with label, placeholder, hint, error, icon, 3 variants (default, filled, outline), 5 sizes
- **Select** — dropdown with search, multi-select, clearable, grouped options, 5 sizes
- **Checkbox** — binary toggle with indeterminate state, label, error
- **ToggleSwitch** — on/off switch with animated thumb, label, 5 sizes
- **Slider** — range input with marks, tooltip, min/max, step
- **RadioGroup** — single selection from a set, horizontal/vertical, 5 sizes
- **ComboBox** — searchable dropdown with autocomplete
- **DatePicker** — calendar-based date selection with min/max, week numbers
- **TagInput** — multi-value input with tag chips, max tags, validation
- **OtpInput** — one-time password code entry, configurable digit count
- **FileUpload** — drag-and-drop uploader with file preview, accept types, max size
- **ColorInput** — color picker with OKLCH support, hex input, preset swatches
- **SearchInput** — search field with debounce, clear button, loading state, 5 sizes
- **Rating** — star rating input with half-star support, custom icons, readonly mode
- **InlineEdit** — click-to-edit text fields with save/cancel

#### Data Display
- **Badge** — status indicators with 6 variants, dot, pulse animation, 5 sizes
- **Avatar** — user images with initials fallback, status indicator, 5 sizes
- **StatusBadge** — operational status display (ok, warning, critical, info), pulse animation
- **StatusPulse** — animated status dot indicator with label
- **Skeleton** — animated loading placeholders (text, circular, rectangular)
- **Progress** — linear progress bar with 5 variants, 5 sizes, shimmer animation
- **AnimatedCounter** — smooth number transition animation
- **FilterPill** — dismissible filter tokens with count badge
- **EmptyState** — zero-data placeholder with icon, title, description, CTA

#### Navigation
- **Tabs** — tabbed content with 3 variants (underline, pills, enclosed), keyboard nav
- **Accordion** — collapsible sections with single/multiple mode, 5 sizes
- **Breadcrumbs** — hierarchical trail with separator options, collapsible
- **Pagination** — page navigation with first/last, prev/next, sibling count, 5 sizes
- **StepWizard** — multi-step guided flow with validation

#### Overlays
- **Dialog** — modal with focus trapping, `@starting-style` entry animation
- **ConfirmDialog** — confirmation prompt with danger/warning variants
- **Drawer** — slide-out panel from any edge (left, right, top, bottom)
- **Sheet** — bottom sheet for mobile with swipe-to-dismiss
- **Tooltip** — contextual info on hover/focus with 4 placements and arrow
- **Popover** — anchored floating content panel with CSS anchor positioning + JS fallback
- **DropdownMenu** — contextual action menu with keyboard navigation
- **Alert** — inline status messages with 5 variants, dismissible
- **Toast** — ephemeral notification popups with position control
- **NotificationStack** — stacked notification queue
- **CommandBar** — Cmd+K command palette with search

#### Utilities
- **UIProvider** — global theme/motion/density provider
- **NativeTooltip** — browser-native title attribute tooltip
- **SuccessCheckmark** — animated SVG success checkmark

### Domain-Specific (64)

#### Data Visualization
- **DataTable** — sortable, filterable data grid with pagination, selection, density control
- **SmartTable** — auto-configured table from schema definition
- **MetricCard** — KPI display with sparkline, trend, status, change period
- **Sparkline** — inline SVG trend line chart
- **TimeSeriesChart** — full SVG line chart with multi-series, X/Y axes, grid, hover crosshair, legend, bezier paths, responsive width
- **RingChart** — SVG donut chart for resource utilization with center label
- **CoreChart** — CPU core utilization grid with per-core coloring (green–red scale)
- **StorageBar** — segmented horizontal bar with labels, legend, percentage
- **HeatmapCalendar** — GitHub-style contribution grid with color scales
- **ConfidenceBar** — multi-segment confidence level display
- **ThresholdGauge** — gauge with colored threshold zones (ok/warning/critical)
- **UtilizationBar** — resource usage bar with threshold indicators
- **NumberTicker** — rolling digit counter with locale formatting
- **DiffViewer** — side-by-side code diff with add/remove highlighting
- **TreeView** — collapsible hierarchical tree with lazy loading, multi-select
- **CopyBlock** — syntax-highlighted code block with one-click copy

#### Infrastructure Monitoring
- **UpstreamDashboard** — service monitoring layout with link status
- **LogViewer** — streaming log display with level filtering (error, warn, info, debug)
- **LiveFeed** — real-time event stream with status indicators
- **PipelineStage** — CI/CD pipeline visualization with stage status
- **UptimeTracker** — service uptime bars with day-level resolution
- **PortStatusGrid** — port availability matrix
- **NetworkTrafficCard** — network throughput display with sparkline and status
- **SeverityTimeline** — incident severity timeline
- **RealtimeValue** — live-updating metric with smooth number interpolation (rAF-based)
- **GeoMap** — SVG geographic visualization with points and connections
- **DashboardGrid** — draggable dashboard layout with groups
- **RackDiagram** — data center rack visualization with U-slot device positioning
- **SwitchFaceplate** — network switch port grid with status colors and port type shapes

#### Entity & Detail Display
- **PropertyList** — key-value detail panel with label/value rows, copy buttons, monospace, links
- **EntityCard** — infrastructure resource card with name, status, type, metrics, tags, actions
- **DiskMountBar** — collapsible disk mount utilization bars with threshold colors
- **ServiceStrip** — horizontal service badge strip with status colors and overflow count
- **ConnectionTestPanel** — step-by-step connectivity test UI with pass/fail/running status

#### Table Utilities
- **DensitySelector** — compact/comfortable/spacious segmented control
- **ColumnVisibilityToggle** — dropdown checkbox list for column show/hide
- **CSVExportButton** — one-click CSV generation and download

#### AI & Realtime
- **StreamingText** — LLM token-by-token rendering with cursor animation
- **TypingIndicator** — chat typing animation (bouncing dots)
- **EncryptedText** — matrix-style character scramble/reveal
- **FlipWords** — rotating word animation with configurable interval
- **TextReveal** — scroll-triggered character-by-character unveil

#### Interactive
- **InfiniteScroll** — virtualized infinite loading list
- **SortableList** — drag-to-reorder with keyboard support
- **KanbanColumn** — kanban board column with WIP limits
- **ResponsiveCard** — container-query adaptive card
- **TimeRangeSelector** — preset time range picker (1h, 6h, 24h, 7d, 30d)
- **ViewTransitionLink** — View Transition API integration for SPA navigation
- **ScrollReveal** — scroll-triggered reveal animation wrapper

#### Visual Effects
- **BackgroundBeams** — animated sweeping light beams
- **BackgroundBoxes** — floating animated grid boxes
- **BorderBeam** — animated conic-gradient border
- **GlowCard** — mouse-tracking radial glow card
- **SpotlightCard** — spotlight hover effect card
- **Card3D** — 3D perspective tilt with glare
- **EvervaultCard** — matrix-style encrypted card
- **HeroHighlight** — gradient text highlight effect
- **MeteorShower** — falling meteor streak animation
- **WavyBackground** — animated SVG sine waves
- **OrbitingCircles** — orbiting icon animation
- **Ripple** — click ripple effect
- **ShimmerButton** — shimmering gradient button
- **TracingBeam** — scroll-tracing side beam

## Form Engine

Built-in form management with zero external dependencies:

```tsx
import { createForm, useForm, v, Form, FormInput, Select, FieldArray } from '@annondeveloper/ui-kit/form'

const profileForm = createForm({
  fields: {
    name: { initial: '', validate: v.pipe(v.required(), v.minLength(2)) },
    email: { initial: '', validate: v.pipe(v.required(), v.email()) },
    role: { initial: '', validate: v.required() },
    tags: { initial: [] as string[], validate: v.minLength(1, 'At least one tag') },
  },
  onSubmit: async (values) => {
    await saveProfile(values)
  },
})

function ProfileForm() {
  const form = useForm(profileForm)

  return (
    <Form form={form}>
      <FormInput label="Name" {...form.getFieldProps('name')} />
      <FormInput label="Email" type="email" {...form.getFieldProps('email')} />
      <Select
        label="Role"
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' },
        ]}
        {...form.getFieldProps('role')}
      />
      <FieldArray name="tags" form={form}>
        {(items) => items.map((item, i) => (
          <FormInput key={i} label={`Tag ${i + 1}`} {...item} />
        ))}
      </FieldArray>
      <Button type="submit" loading={form.isSubmitting}>Save Profile</Button>
    </Form>
  )
}
```

## Theming

Generate a complete theme from a single brand color:

```tsx
import { generateTheme, applyTheme, themeToCSS, validateContrast } from '@annondeveloper/ui-kit/theme'

// Generate tokens
const theme = generateTheme('#6366f1', 'dark')

// Apply to DOM
applyTheme(theme)

// Or get CSS string
const css = themeToCSS(theme, ':root')

// Validate WCAG contrast
const result = validateContrast(theme)
// { aa: true, aaa: false, ratio: 7.2 }
```

## Bundle Size

| Metric | Value |
|--------|-------|
| Total (gzipped) | 236.7 KB |
| Budget | 250 KB |
| Standard tier | ~149 KB gzip |
| Premium tier | ~40 KB gzip |
| Lite tier | ~12 KB gzip |
| CSS extractions | 114 component files |
| Tree-shaking | Full ESM — import only what you use |

Typical app importing ~20 components: **~15–25 KB gzipped** after tree-shaking.

## Browser Support

- Chrome/Edge 111+ (CSS `@scope`, `@layer`, `@starting-style`)
- Firefox 128+ (`@scope` support)
- Safari 17.4+ (`@starting-style`)
- Fallbacks: BEM `.ui-` prefix scoping, IntersectionObserver, `getBoundingClientRect()` for anchor positioning

## CLI Tool

```bash
npx @annondeveloper/ui-kit init          # Copy theme + utils
npx @annondeveloper/ui-kit add <name>    # Copy component source
npx @annondeveloper/ui-kit list          # List all 116 components
npx @annondeveloper/ui-kit theme         # Generate theme from brand color
```
