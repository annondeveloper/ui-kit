# View Transitions API

Smooth page and element transitions using the native View Transitions API, with 6 built-in presets and automatic fallback.

## Overview

The `useViewTransition()` hook wraps the browser's `document.startViewTransition()` API. It injects temporary CSS for preset animations, manages transition lifecycle state, and gracefully degrades when the API is unavailable or when `prefers-reduced-motion` is active.

## Quick Start

```tsx
import { useState } from 'react'
import { useViewTransition } from '@annondeveloper/ui-kit'

function TabSwitcher() {
  const [tab, setTab] = useState('home')
  const { startTransition, isTransitioning } = useViewTransition({
    preset: 'crossfade',
    duration: 250,
  })

  const switchTab = (next: string) => {
    startTransition(() => setTab(next))
  }

  return (
    <div>
      <nav>
        <button onClick={() => switchTab('home')}>Home</button>
        <button onClick={() => switchTab('settings')}>Settings</button>
      </nav>
      {isTransitioning && <p>Transitioning...</p>}
      {tab === 'home' ? <HomePage /> : <SettingsPage />}
    </div>
  )
}
```

## API Reference

### `useViewTransition(options?)`

```ts
function useViewTransition(options?: ViewTransitionOptions): ViewTransitionResult
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `preset` | `TransitionPreset` | -- | Named animation preset |
| `duration` | `number` | `300` | Transition duration in ms |
| `onStart` | `() => void` | -- | Called when transition begins |
| `onFinish` | `() => void` | -- | Called when transition ends |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `startTransition` | `(callback: () => void \| Promise<void>) => Promise<void>` | Wraps a DOM-mutating callback in a view transition |
| `isTransitioning` | `boolean` | True while a transition is in progress |
| `assignTransitionName` | `(element: HTMLElement \| null, name: string) => void` | Sets `view-transition-name` on an element; cleans up on unmount |

### Presets

| Preset | Effect |
|--------|--------|
| `morph` | Scale down old view, scale up new view |
| `crossfade` | Simple opacity crossfade |
| `slide-left` | Old slides left, new slides in from right |
| `slide-right` | Old slides right, new slides in from left |
| `slide-up` | Old slides up, new slides in from bottom |
| `zoom` | Old zooms out, new zooms in |

### `assignTransitionName(element, name)`

Assigns a `view-transition-name` CSS property to a DOM element, enabling element-level morphing between states. Names are automatically cleaned up on component unmount.

```tsx
const { startTransition, assignTransitionName } = useViewTransition({ preset: 'morph' })

// Assign a shared transition name to elements that should morph into each other
<img ref={(el) => assignTransitionName(el, 'hero-image')} src={currentImage} />
```

## Examples

### Router integration

```tsx
import { useViewTransition } from '@annondeveloper/ui-kit'

function AppRouter() {
  const [route, setRoute] = useState('/')
  const { startTransition } = useViewTransition({ preset: 'slide-left', duration: 300 })

  const navigate = (path: string) => {
    startTransition(() => setRoute(path))
  }

  return (
    <div>
      <nav>
        <a onClick={() => navigate('/')}>Home</a>
        <a onClick={() => navigate('/about')}>About</a>
        <a onClick={() => navigate('/contact')}>Contact</a>
      </nav>
      {route === '/' && <HomePage />}
      {route === '/about' && <AboutPage />}
      {route === '/contact' && <ContactPage />}
    </div>
  )
}
```

### Element morphing between list and detail

```tsx
function ProductList({ products, onSelect }) {
  const { startTransition, assignTransitionName } = useViewTransition({ preset: 'morph' })

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <img
            ref={(el) => assignTransitionName(el, `product-${p.id}`)}
            src={p.image}
            onClick={() => startTransition(() => onSelect(p))}
          />
          <span>{p.name}</span>
        </li>
      ))}
    </ul>
  )
}

function ProductDetail({ product }) {
  const { assignTransitionName } = useViewTransition()

  return (
    <div>
      <img ref={(el) => assignTransitionName(el, `product-${product.id}`)} src={product.image} />
      <h1>{product.name}</h1>
    </div>
  )
}
```

### Lifecycle callbacks

```tsx
const { startTransition } = useViewTransition({
  preset: 'zoom',
  duration: 400,
  onStart: () => console.log('Transition started'),
  onFinish: () => console.log('Transition complete'),
})
```

## Browser Support

- **Chrome/Edge 111+**: Full support
- **Safari 18+**: Full support
- **Firefox**: Not yet supported

When the View Transitions API is unavailable, `startTransition` calls the callback directly with no animation. When `prefers-reduced-motion` is active (motion level 0), transitions are skipped entirely.
