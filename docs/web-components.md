# Web Components Integration

UI Kit v2 provides a Web Components wrapper that lets you use UI Kit components as standard Custom Elements in any HTML page or framework.

> **Note:** The Web Components wrapper requires React and ReactDOM as runtime dependencies. It renders React components inside Shadow DOM.

## Installation

```bash
npm install @annondeveloper/ui-kit react react-dom
```

## Quick start

```html
<script type="module">
  import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'
  defineCustomElements()
</script>

<ui-button variant="primary">Click me</ui-button>
<ui-badge variant="success" dot="true">Online</ui-badge>
<ui-card variant="elevated" padding="lg">
  Card content goes here
</ui-card>
```

## `defineCustomElements(prefix?)`

Registers all 20 built-in elements with the browser. Call once at application startup.

```ts
import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'

// Default prefix: 'ui'
defineCustomElements()
// => <ui-button>, <ui-card>, etc.

// Custom prefix:
defineCustomElements('myapp')
// => <myapp-button>, <myapp-card>, etc.
```

The function is idempotent — calling it multiple times with the same prefix is safe.

## Available elements

| Custom Element | React Component | Observed Attributes |
|---------------|----------------|-------------------|
| `<ui-button>` | Button | `variant`, `size`, `loading`, `disabled`, `full-width` |
| `<ui-badge>` | Badge | `variant`, `size`, `dot`, `pulse` |
| `<ui-card>` | Card | `variant`, `padding`, `interactive`, `bordered` |
| `<ui-alert>` | Alert | `variant`, `title`, `dismissible`, `banner` |
| `<ui-progress>` | Progress | `value`, `size`, `variant` |
| `<ui-avatar>` | Avatar | `name`, `src`, `size` |
| `<ui-divider>` | Divider | `orientation`, `variant`, `spacing`, `label` |
| `<ui-typography>` | Typography | `variant`, `color`, `weight`, `align` |
| `<ui-kbd>` | Kbd | `size`, `variant` |
| `<ui-skeleton>` | Skeleton | `variant`, `width`, `height`, `lines`, `animate` |
| `<ui-status-badge>` | StatusBadge | `status`, `label`, `pulse`, `size` |
| `<ui-status-pulse>` | StatusPulse | `status`, `size` |
| `<ui-checkbox>` | Checkbox | `label`, `size`, `checked`, `disabled` |
| `<ui-toggle-switch>` | ToggleSwitch | `label`, `size`, `checked`, `disabled` |
| `<ui-slider>` | Slider | `value`, `min`, `max`, `step` |
| `<ui-form-input>` | FormInput | `name`, `label`, `placeholder`, `type`, `size`, `error` |
| `<ui-search-input>` | SearchInput | `placeholder`, `size`, `loading` |
| `<ui-chip>` | Chip | `size`, `checked`, `disabled` |
| `<ui-rating>` | Rating | `value`, `max`, `size`, `readonly` |
| `<ui-tooltip>` | Tooltip | `content`, `placement`, `delay` |

## Attribute mapping

HTML attributes are automatically converted:

- **kebab-case to camelCase** — `full-width` becomes `fullWidth`
- **Boolean coercion** — `"true"` / `"false"` become `true` / `false`
- **Number coercion** — `"42"` becomes `42`, `"3.14"` becomes `3.14`
- **String passthrough** — everything else stays as a string

```html
<!-- These attribute values are converted to typed props -->
<ui-button disabled="true" size="lg">Submit</ui-button>
<ui-progress value="75" size="sm" variant="success"></ui-progress>
<ui-slider value="50" min="0" max="100" step="5"></ui-slider>
```

## Text content as children

The text content of a custom element is passed as the `children` prop:

```html
<ui-button variant="primary">Click me</ui-button>
<!-- Equivalent to: <Button variant="primary">Click me</Button> -->
```

## Custom element creation

Wrap any React component as a Custom Element using `createWebComponent`:

```ts
import { createWebComponent } from '@annondeveloper/ui-kit/web-components'
import { MyComponent } from './my-component'

const MyElement = createWebComponent(
  MyComponent,
  ['title', 'description', 'variant', 'is-active'],  // observed attributes
  ':host { display: block; }'  // optional Shadow DOM CSS
)

customElements.define('my-element', MyElement)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `ReactComponent` | `React.ComponentType` | The React component to wrap |
| `observedAttrs` | `string[]` | HTML attributes to observe and pass as props |
| `cssText` | `string?` | Optional CSS injected into Shadow DOM via `adoptedStyleSheets` |

## Shadow DOM

Each custom element renders inside a Shadow DOM with `mode: 'open'`. This provides:

- **Style encapsulation** — component styles do not leak out
- **DOM encapsulation** — internal structure is hidden from `querySelector`

Theme CSS variables are injected into each Shadow DOM automatically when using `defineCustomElements()`.

## CSS theme integration

For theme variables to work inside Shadow DOM, the theme CSS is embedded in each element. For custom elements created with `createWebComponent`, pass your theme CSS as the third argument:

```ts
import { createWebComponent } from '@annondeveloper/ui-kit/web-components'
import themeCSS from '@annondeveloper/ui-kit/css/theme.css?raw'

const MyButton = createWebComponent(Button, ['variant', 'size'], themeCSS)
```

## Framework examples

### Vanilla HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script type="module">
    import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'
    defineCustomElements()
  </script>
</head>
<body>
  <ui-card variant="elevated" padding="lg">
    <ui-typography variant="h3">Hello World</ui-typography>
    <ui-button variant="primary">Get Started</ui-button>
  </ui-card>
</body>
</html>
```

### Vue

```vue
<template>
  <ui-button variant="primary" @click="handleClick">
    {{ label }}
  </ui-button>
</template>

<script setup>
import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'
defineCustomElements()

const label = 'Click me'
const handleClick = () => console.log('clicked')
</script>
```

### Svelte

```svelte
<script>
  import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'
  import { onMount } from 'svelte'

  onMount(() => defineCustomElements())
</script>

<ui-button variant="primary">Click me</ui-button>
```

## Limitations

- **React runtime required** — React and ReactDOM must be loaded on the page
- **No complex children** — only text content is passed as children; nested JSX elements are not supported through the HTML API
- **Event handling** — React synthetic events are not exposed as Custom Element events; use `addEventListener` on the element or access the Shadow DOM
- **No SSR** — Web Components require a browser environment with `customElements` support
- **Attribute-only props** — only observed attributes are passed; complex object/array props cannot be set via HTML attributes
