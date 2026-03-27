# Figma Integration

Sync UI Kit theme tokens with Figma as Variables, keeping design and code in perfect alignment.

## Overview

The Figma integration has two parts: a **CLI command** (`figma-export`) that generates Figma Variables JSON from any theme, and a **Figma plugin** that imports those tokens into your Figma file as Color Variables. All 23 theme tokens (brand, background, border, text, status, aurora colors) are mapped.

## Quick Start

```bash
# 1. Export tokens from CLI
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json

# 2. Open Figma, run the plugin, paste tokens.json content, click Import
```

## Plugin Installation

1. Clone or download the `figma-plugin/` directory from the repository.
2. In Figma, go to **Plugins > Development > Import plugin from manifest...**
3. Select `figma-plugin/manifest.json`.
4. The plugin appears under **Plugins > Development > Aurora UI Kit -- Token Sync**.

## Usage

### Step 1: Export tokens

Use the CLI to generate a JSON file with Figma Variables:

```bash
# Named theme (dark mode)
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json

# Custom brand color
npx @annondeveloper/ui-kit figma-export --theme "#6366f1" --output tokens.json

# Light mode
npx @annondeveloper/ui-kit figma-export --theme ocean --mode light --output tokens-light.json
```

### Step 2: Import into Figma

1. Open your Figma file.
2. Run the Aurora UI Kit -- Token Sync plugin.
3. Paste the contents of the generated JSON file into the text area.
4. Click **Import Variables**.

The plugin creates a **Variable Collection** named after your theme. Each token becomes a Figma Color Variable.

### Step 3: Use in designs

Once imported, variables are available in:
- **Fill colors** -- click the variable icon in the fill panel
- **Stroke colors** -- bind to border variables
- **Effects** -- use aurora glow tokens for shadow effects
- **Component properties** -- bind to status colors for state variants

## Token Export Format

The `figma-export` command produces Figma Variables JSON:

```json
{
  "brand": { "$type": "color", "$value": "oklch(65% 0.27 270)" },
  "brand-light": { "$type": "color", "$value": "oklch(75% 0.20 270)" },
  "bg-base": { "$type": "color", "$value": "oklch(15% 0.02 270)" },
  "bg-surface": { "$type": "color", "$value": "oklch(20% 0.02 270)" },
  "bg-elevated": { "$type": "color", "$value": "oklch(25% 0.02 270)" },
  "border-subtle": { "$type": "color", "$value": "oklch(30% 0.03 270)" },
  "border-default": { "$type": "color", "$value": "oklch(40% 0.04 270)" },
  "text-primary": { "$type": "color", "$value": "oklch(95% 0.01 270)" },
  "text-secondary": { "$type": "color", "$value": "oklch(70% 0.02 270)" }
}
```

## Style Dictionary Compatibility

The exported JSON follows the [Design Tokens Community Group](https://design-tokens.github.io/community-group/format/) format with `$type` and `$value` keys. This means it is also compatible with **Style Dictionary** for generating platform-specific outputs:

```bash
# Use with Style Dictionary
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json
npx style-dictionary build --config style-dictionary.config.json
```

## Component Mapping

UI Kit components map to Figma components as follows:

| UI Kit Component | Figma Pattern | Token Bindings |
|-----------------|---------------|----------------|
| `Button` | Button component with variants | `--brand`, `--text-primary` |
| `Card` | Card auto-layout frame | `--bg-surface`, `--border-subtle` |
| `Badge` | Badge component set | `--brand`, status colors |
| `MetricCard` | Metric card with nested text | `--bg-elevated`, `--text-primary` |
| `Alert` | Alert with icon + text | Status colors (`--ok`, `--warning`, `--critical`) |

## Available Themes

15 built-in themes, each exportable in dark and light mode:

aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon

## Examples

### Export all theme variants

```bash
#!/bin/bash
THEMES="aurora sunset rose amber ocean emerald cyan violet fuchsia slate corporate midnight forest wine carbon"

for theme in $THEMES; do
  npx @annondeveloper/ui-kit figma-export --theme "$theme" --output "tokens/${theme}-dark.json"
  npx @annondeveloper/ui-kit figma-export --theme "$theme" --mode light --output "tokens/${theme}-light.json"
done
```

### Custom brand color export

```bash
# Your brand color as input
npx @annondeveloper/ui-kit figma-export --theme "#1a73e8" --output tokens.json

# Google-blue inspired theme tokens ready for Figma
```
