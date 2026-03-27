# CLI Tool

Scaffold components, generate projects, export tokens, and manage your UI Kit installation from the command line.

## Overview

The CLI provides 6 commands: `init` for project setup, `add` for copying individual components, `create` for scaffolding full projects from templates, `list` for browsing components, `theme` for generating themes, and `figma-export` for exporting Figma Variables.

## Quick Start

```bash
# Initialize a project with theme CSS
npx @annondeveloper/ui-kit init

# Add a single component
npx @annondeveloper/ui-kit add button

# Scaffold a full project
npx @annondeveloper/ui-kit create my-dashboard --template dashboard

# Export Figma tokens
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json
```

## Commands

### `ui-kit init [dir]`

Copies theme CSS and prints setup instructions.

```bash
npx @annondeveloper/ui-kit init
npx @annondeveloper/ui-kit init ./src/styles
```

**What it does:**
1. Copies `theme.css` to the target directory
2. Prints the `UIProvider` import and wrapping instructions

### `ui-kit add <component>`

Copies a component's source files into your project.

```bash
npx @annondeveloper/ui-kit add button
npx @annondeveloper/ui-kit add metric-card --tier premium --out-dir ./src/ui
```

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--tier` | `standard` | Weight tier: `standard`, `lite`, or `premium` |
| `--out-dir` | `./components` | Destination directory |

**Examples:**

```bash
# Copy standard Button
npx @annondeveloper/ui-kit add button

# Copy premium MetricCard to custom directory
npx @annondeveloper/ui-kit add metric-card --tier premium --out-dir ./src/components

# Copy lite Badge
npx @annondeveloper/ui-kit add badge --tier lite
```

### `ui-kit create <name>`

Scaffolds a complete Vite + React project from a template.

```bash
npx @annondeveloper/ui-kit create my-app --template dashboard
```

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--template` | `dashboard` | Project template |
| `--theme` | `aurora` | Theme name |
| `--tier` | `standard` | Weight tier |

**Templates:**

| Template | Description | Key Components |
|----------|-------------|----------------|
| `dashboard` | Metrics dashboard with data table | MetricCard, DataTable |
| `form` | Contact/settings form | FormInput, Select, Card, Button |
| `marketing` | Landing page with hero section | Button, Badge, Card |
| `saas` | SaaS app with sidebar navigation | Tabs, DataTable |
| `docs` | Documentation site with code blocks | CopyBlock |

**Example output structure:**

```
my-app/
  package.json
  vite.config.ts
  index.html
  src/
    main.tsx
    App.tsx
```

Each template generates a fully runnable project:

```bash
npx @annondeveloper/ui-kit create my-dashboard --template dashboard --theme ocean
cd my-dashboard
npm install
npm run dev
```

### `ui-kit list`

Lists all available components.

```bash
npx @annondeveloper/ui-kit list
```

### `ui-kit theme [color]`

Generates a theme from a brand color and prints the CSS.

```bash
npx @annondeveloper/ui-kit theme "#6366f1"
```

### `ui-kit figma-export`

Exports theme tokens as Figma Variables JSON.

```bash
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json
npx @annondeveloper/ui-kit figma-export --theme "#6366f1" --output tokens.json
npx @annondeveloper/ui-kit figma-export --theme ocean --mode light --output tokens-light.json
```

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--theme` | required | Theme name or hex color |
| `--output` | required | Output file path |
| `--mode` | `dark` | Color mode: `dark` or `light` |

**Available theme names:** aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon

## Configuration

### `ui-kit.config.json`

Optional project configuration file:

```json
{
  "outDir": "./src/components",
  "tier": "standard",
  "theme": "aurora",
  "typescript": true
}
```

When present, the CLI reads defaults from this file so you can omit flags:

```bash
# Uses outDir and tier from config
npx @annondeveloper/ui-kit add button
```

## Examples

### Full project scaffold workflow

```bash
# Create a new dashboard project
npx @annondeveloper/ui-kit create ops-dashboard --template dashboard --theme midnight

# Enter the project
cd ops-dashboard

# Install dependencies
npm install

# Start development
npm run dev
```

### Copy multiple components

```bash
npx @annondeveloper/ui-kit add button
npx @annondeveloper/ui-kit add card
npx @annondeveloper/ui-kit add metric-card
npx @annondeveloper/ui-kit add data-table
```

### Export tokens for design handoff

```bash
# Export both dark and light mode tokens
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens-dark.json
npx @annondeveloper/ui-kit figma-export --theme aurora --mode light --output tokens-light.json
```
