# Aurora UI Kit — Figma Plugin

Import UI Kit theme tokens as Figma Variables so designs and code stay in sync.

## Setup

1. In Figma, go to **Plugins > Development > Import plugin from manifest...**
2. Select the `figma-plugin/manifest.json` file from this repository.
3. The plugin appears under **Plugins > Development > Aurora UI Kit — Token Sync**.

## Usage

### 1. Export tokens from the CLI

```bash
# Named theme
npx @annondeveloper/ui-kit figma-export --theme aurora --output tokens.json

# Custom brand color
npx @annondeveloper/ui-kit figma-export --theme "#6366f1" --output tokens.json

# Light mode
npx @annondeveloper/ui-kit figma-export --theme ocean --mode light --output tokens-light.json
```

### 2. Import into Figma

1. Run the plugin in Figma.
2. Paste the contents of `tokens.json` into the text area.
3. Click **Import Variables**.

The plugin creates a Variable Collection with all 23 theme tokens (brand, background, border, text, status, aurora colors). Each token becomes a Figma Color Variable that you can bind to fills, strokes, and effects.

## Available Themes

aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon

## Building (optional)

The plugin code is plain TypeScript. To compile for distribution:

```bash
npx tsc figma-plugin/code.ts --outDir figma-plugin --target ES2020 --module ES2020
```

For local development, Figma loads TypeScript directly in development mode.
