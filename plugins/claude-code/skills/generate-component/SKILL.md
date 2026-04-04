---
name: generate-component
description: Generate production-ready React code using UI Kit components. Use when the user asks to "build", "create", "make", "generate" a UI, page, form, dashboard, or component composition. Produces working TSX with correct imports, props, and Aurora Fluid styling.
---

# UI Kit Code Generator

Generate a component using @annondeveloper/ui-kit for: $ARGUMENTS

## Rules

1. **Always wrap in UIProvider** — the root of any ui-kit app needs `<UIProvider>` for theme/motion
2. **Use correct imports** — Standard: `@annondeveloper/ui-kit`, Lite: `@annondeveloper/ui-kit/lite`, Premium: `@annondeveloper/ui-kit/premium`
3. **OKLCH colors only** — never use hex/rgb in custom styles. Use `oklch(65% 0.2 270)` or CSS variables like `var(--brand)`
4. **Motion prop** — all animated components accept `motion={0|1|2|3}`. Default is 3 (cinematic). Use 0 for instant, 1 for subtle
5. **Logical properties** — use `margin-inline-start` not `margin-left`, `block-size` not `height`
6. **Container queries** — components adapt to container, not viewport. Use `container-type: inline-size`

## Use MCP Tools

Use `get_component` to look up exact props before generating code. Use `generate_snippet` for multi-component compositions. Use `get_theme` for theme tokens. Use `get_icons` for icon names.

## Template

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'
import { /* components */ } from '@annondeveloper/ui-kit'

export function MyComponent() {
  return (
    <UIProvider>
      {/* composition here */}
    </UIProvider>
  )
}
```
