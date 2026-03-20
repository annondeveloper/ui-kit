# Theming Guide

UI Kit v2 uses an OKLCH-based color system with automatic theme generation, CSS custom properties, and runtime theme switching.

## OKLCH Color System

### What is OKLCH?

OKLCH (Oklab Lightness Chroma Hue) is a perceptually uniform color space. Unlike HSL or RGB, OKLCH ensures that:

- **Lightness is perceptually linear** — `oklch(50% ...)` is genuinely half as bright as `oklch(100% ...)`
- **Chroma (saturation) is uniform** — increasing chroma doesn't shift perceived lightness
- **Hue is stable** — rotating hue preserves perceived brightness and saturation

This matters for UI design because it makes programmatic color generation reliable. A theme generated from a blue brand color will have the same visual weight as one generated from orange.

### OKLCH Syntax

```css
/* oklch(Lightness% Chroma Hue) */
oklch(65% 0.2 270)       /* A vibrant blue */
oklch(85% 0.1 145)       /* A soft green */
oklch(50% 0.25 25)       /* A saturated red */

/* With alpha */
oklch(65% 0.2 270 / 0.5) /* 50% transparent blue */
```

| Component | Range | Description |
|-----------|-------|-------------|
| Lightness | 0-100% | 0% is black, 100% is white |
| Chroma | 0-0.4 | 0 is gray, higher is more saturated |
| Hue | 0-360 | Color wheel angle (0=red, 145=green, 270=blue) |

## Generating a Theme

### From a brand color

```tsx
import { generateTheme, themeToCSS, applyTheme } from '@annondeveloper/ui-kit/theme'

// Generate a complete theme from a single hex color
const tokens = generateTheme('#6366f1', 'dark')

// Convert to a CSS string (for build-time injection)
const css = themeToCSS(tokens)
// Output:
// :root {
//   --brand: oklch(55.7% 0.228 277.1);
//   --brand-light: oklch(65.7% 0.228 277.1);
//   --bg-base: oklch(8% 0.02 277.1);
//   ...
// }

// Or apply directly to the document at runtime
applyTheme(tokens)
```

### With a custom selector

```tsx
const css = themeToCSS(tokens, '.my-app')
// Output:
// .my-app {
//   --brand: oklch(55.7% 0.228 277.1);
//   ...
// }
```

### Validate contrast

```tsx
import { validateContrast } from '@annondeveloper/ui-kit/theme'

const tokens = generateTheme('#6366f1', 'dark')
const isAccessible = validateContrast(tokens) // true if WCAG AA compliant
```

## CSS Custom Properties Reference

All tokens are set as CSS custom properties on `:root` (or your chosen selector). Values are full OKLCH color strings.

### Brand Colors

| Property | Description |
|----------|-------------|
| `--brand` | Primary brand color |
| `--brand-light` | Lighter brand variant (+10% lightness) |
| `--brand-dark` | Darker brand variant (-10% lightness) |
| `--brand-subtle` | Brand at 8% opacity (backgrounds) |
| `--brand-glow` | Brand at 15% opacity (ambient glows) |

### Surface Colors

| Property | Dark Mode | Light Mode |
|----------|-----------|------------|
| `--bg-base` | Deep dark (8% L) | Near white (98% L) |
| `--bg-surface` | Card/panel (12% L) | White (100% L) |
| `--bg-elevated` | Dropdowns/popovers (16% L) | Near white (100% L) |
| `--bg-overlay` | Modal backdrop (6% L, 85% alpha) | Dark scrim (20% L, 40% alpha) |

### Border Colors

| Property | Description |
|----------|-------------|
| `--border-subtle` | Subtle dividers (4% opacity) |
| `--border-default` | Standard borders (8% opacity) |
| `--border-strong` | Focus rings, emphasis (14% opacity) |
| `--border-glow` | Brand-tinted glow border |

### Text Colors

| Property | Description |
|----------|-------------|
| `--text-primary` | Headings and primary content |
| `--text-secondary` | Secondary labels and descriptions |
| `--text-tertiary` | Placeholder text and hints |
| `--text-disabled` | Disabled element text |

### Status Colors

| Property | Color | Usage |
|----------|-------|-------|
| `--status-ok` | Green (hue 145) | Success, online, healthy |
| `--status-warning` | Amber (hue 85) | Warning, degraded |
| `--status-critical` | Red (hue 25) | Error, critical, offline |
| `--status-info` | Blue (hue 250) | Informational |

### Aurora Colors

| Property | Description |
|----------|-------------|
| `--aurora-1` | Ambient glow wash 1 (brand hue - 20) |
| `--aurora-2` | Ambient glow wash 2 (brand hue + 30) |

These are used by the Aurora Fluid design system for atmospheric background effects.

## Dark / Light Mode

### Via UIProvider

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'

<UIProvider mode="dark">  {/* or "light" */}
  <App />
</UIProvider>
```

### Via CSS class

```tsx
// Toggle light mode on the document root
document.documentElement.classList.toggle('light')
```

### Via theme generation

```tsx
const darkTokens = generateTheme('#6366f1', 'dark')
const lightTokens = generateTheme('#6366f1', 'light')

const css = `
${themeToCSS(darkTokens, ':root')}
${themeToCSS(lightTokens, ':root.light')}
`
```

### System preference

```css
@media (prefers-color-scheme: light) {
  :root {
    /* Light mode overrides applied automatically by UIProvider */
  }
}
```

## Customizing Components

### Per-component overrides

Every component uses CSS custom properties scoped with the `ui-` prefix. Override them in your own CSS:

```css
/* Make all buttons have rounded corners */
.ui-button {
  border-radius: 9999px;
}

/* Custom card surface color */
.ui-card {
  background: oklch(14% 0.02 270);
}
```

### Scoped theme regions

Apply different themes to different sections of your app:

```tsx
const sidebarTokens = generateTheme('#10b981', 'dark')
const mainTokens = generateTheme('#6366f1', 'dark')

<div style={themeToInlineStyle(sidebarTokens)}>
  <Sidebar />
</div>
<div style={themeToInlineStyle(mainTokens)}>
  <MainContent />
</div>
```

Or use CSS:

```css
.sidebar {
  --brand: oklch(72% 0.19 160);
  --brand-subtle: oklch(72% 0.19 160 / 0.08);
}
```

### Component-level theming

Many components accept `className` for additional styling:

```tsx
<Button className="my-custom-button" variant="primary">
  Custom
</Button>
```

```css
.my-custom-button {
  --brand: oklch(78% 0.17 85);
  font-weight: 800;
}
```

## Typography

The theme includes fluid typography using `clamp()`:

| Class | Size Range | Usage |
|-------|------------|-------|
| `.text-display` | 2.5rem - 4rem | Hero headings |
| `.text-heading-1` | 1.75rem - 2.5rem | Page titles |
| `.text-heading-2` | 1.25rem - 1.75rem | Section headings |
| `.text-heading-3` | 1rem - 1.25rem | Subsection headings |
| `.text-body` | 0.875rem - 1rem | Body text |
| `.text-small` | 0.75rem - 0.875rem | Captions, labels |
| `.text-label` | 0.6875rem - 0.75rem | Form labels, badges |

Headings use `text-wrap: balance` and body text uses `text-wrap: pretty` for optimal line breaks.

## Density

Control spacing density globally via `<UIProvider>`:

```tsx
<UIProvider density="compact">   {/* Tighter spacing */}
<UIProvider density="default">   {/* Standard spacing */}
<UIProvider density="spacious">  {/* More breathing room */}
```

Components that respond to density include: Button, FormInput, Select, DataTable, Tabs, and all card-based components.
