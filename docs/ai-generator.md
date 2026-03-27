# AI Component Generator

Generate production-ready component compositions from templates or custom selections, with code output for 5 frameworks.

## Overview

The AI Component Generator provides a template gallery with pre-built layouts, a custom composition builder for assembling components, and a searchable component database with metadata. Generated code is available in React (JSX), React (TypeScript), Vue, Svelte, and HTML/CSS.

## Quick Start

Access the Generator page in the demo app, or use the underlying utilities directly:

```tsx
import {
  getComponentDatabase,
  searchComponents,
  generateFromTemplate,
  generateFromComponents,
} from '@annondeveloper/ui-kit'
```

## API Reference

### Component Database

#### `getComponentDatabase()`

Returns the full database of all components with metadata:

```ts
const db = getComponentDatabase()
// ComponentInfo[]
```

Each `ComponentInfo` includes:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Component name (e.g., `'Button'`) |
| `category` | `string` | Category (e.g., `'general'`, `'domain'`) |
| `subcategory` | `string` | Subcategory (e.g., `'buttons'`, `'data-viz'`) |
| `description` | `string` | Short description |
| `tiers` | `string[]` | Available tiers (`['lite', 'standard', 'premium']`) |

#### `searchComponents(query)`

Full-text search across component names and descriptions:

```ts
const results = searchComponents('chart')
// Returns ComponentInfo[] matching "chart"
```

### Template Gallery

#### `generateFromTemplate(template, options?)`

Generate a complete layout from a named template.

| Template | Description | Components Used |
|----------|-------------|----------------|
| `dashboard` | Metrics + data table + charts | MetricCard, DataTable, TimeSeriesChart |
| `form` | Contact/settings form | FormInput, Select, Button, Card |
| `marketing` | Landing page hero | Button, Badge, Card |
| `saas` | SaaS app shell with sidebar | Tabs, DataTable, Sidebar |

```ts
const code = generateFromTemplate('dashboard', {
  framework: 'react-ts',
  tier: 'standard',
  theme: 'aurora',
})

// code.react    -- JSX output
// code.vue      -- Vue SFC output
// code.svelte   -- Svelte output
// code.html     -- HTML + CSS output
```

### Custom Composition Builder

#### `generateFromComponents(components, options?)`

Assemble code from a custom selection of components:

```ts
const code = generateFromComponents(
  ['MetricCard', 'DataTable', 'Badge', 'Button'],
  {
    framework: 'react-ts',
    tier: 'premium',
    theme: 'sunset',
    layout: 'grid',
  },
)
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `framework` | `'react' \| 'react-ts' \| 'vue' \| 'svelte' \| 'html'` | `'react-ts'` | Output framework |
| `tier` | `'lite' \| 'standard' \| 'premium'` | `'standard'` | Weight tier |
| `theme` | `string` | `'aurora'` | Theme name |
| `layout` | `'grid' \| 'stack' \| 'sidebar'` | `'stack'` | Layout arrangement |

### Generated Code Output

The `GeneratedCode` object contains:

| Property | Type | Description |
|----------|------|-------------|
| `react` | `string` | React JSX code |
| `reactTs` | `string` | React TypeScript code |
| `vue` | `string` | Vue Single File Component |
| `svelte` | `string` | Svelte component |
| `html` | `string` | Standalone HTML + CSS |

## Examples

### Browse and search components

```tsx
import { getComponentDatabase, searchComponents } from '@annondeveloper/ui-kit'

// Get all components
const all = getComponentDatabase()
console.log(`${all.length} components available`)

// Search for chart components
const charts = searchComponents('chart')
charts.forEach((c) => console.log(`${c.name}: ${c.description}`))

// Filter by category
const domain = all.filter((c) => c.category === 'domain')
```

### Generate from template and copy

```tsx
import { useState } from 'react'
import { generateFromTemplate } from '@annondeveloper/ui-kit'

function GeneratorUI() {
  const [framework, setFramework] = useState('react-ts')
  const code = generateFromTemplate('dashboard', { framework })

  return (
    <div>
      <select value={framework} onChange={(e) => setFramework(e.target.value)}>
        <option value="react-ts">React (TS)</option>
        <option value="react">React (JS)</option>
        <option value="vue">Vue</option>
        <option value="svelte">Svelte</option>
        <option value="html">HTML</option>
      </select>
      <pre>{code[framework]}</pre>
      <button onClick={() => navigator.clipboard.writeText(code[framework])}>
        Copy Code
      </button>
    </div>
  )
}
```

### Custom composition

```tsx
const code = generateFromComponents(
  ['AppShell', 'Sidebar', 'MetricCard', 'TimeSeriesChart', 'DataTable'],
  { framework: 'react-ts', tier: 'premium', layout: 'sidebar' },
)
```
