# Motion Choreography

Orchestrate multi-step, sequenced animations across groups of elements with the Choreography engine.

## Overview

The Choreography system lets you define a **sequence** of animation steps that play one after another. Each step targets one or more DOM elements, applies a built-in or custom animation, and supports staggered delays within the group. Five named presets cover common patterns out of the box.

## Quick Start

```tsx
import { Choreography, choreography } from '@annondeveloper/ui-kit'

const intro = choreography({
  sequence: [
    { target: '.hero-title', animation: 'slideUp', duration: 500 },
    { target: '.hero-subtitle', animation: 'fadeIn', duration: 400, delay: 100 },
    { target: '.hero-cards > *', animation: 'scaleIn', stagger: { each: 60, from: 'start' } },
  ],
})

// Play
await intro.play()

// Control
intro.pause()
intro.resume()
intro.cancel()

// Read progress (0-1)
console.log(intro.progress)
```

## API Reference

### `Choreography` class

```ts
class Choreography {
  constructor(config: ChoreographyConfig)
  play(): Promise<void>
  pause(): void
  resume(): void
  cancel(): void
  get progress(): number  // 0..1
}
```

### `ChoreographyConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sequence` | `ChoreographyStep[]` | required | Ordered list of animation steps |
| `defaults` | `Partial<ChoreographyStep>` | `{}` | Default values merged into every step |
| `respectMotion` | `boolean` | `true` | Skip animations when `prefers-reduced-motion` is active |

### `ChoreographyStep`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `target` | `string \| Element \| Element[]` | required | CSS selector or element(s) to animate |
| `animation` | `'fadeIn' \| 'slideUp' \| 'slideDown' \| 'slideLeft' \| 'slideRight' \| 'scaleIn' \| 'custom'` | required | Animation type |
| `keyframes` | `Keyframe[]` | -- | Custom keyframes (used when `animation: 'custom'`) |
| `duration` | `number` | `400` | Duration in milliseconds |
| `spring` | `{ stiffness?, damping?, mass? }` | -- | Spring physics parameters |
| `stagger` | `{ each?, from? }` | -- | Stagger delay between elements |
| `delay` | `number` | `0` | Delay before this step begins |

### `choreography(config)` factory

Shorthand that returns a new `Choreography` instance:

```ts
const ch = choreography({ sequence: [...] })
```

## Presets

Use `getChoreographyPreset(name, selector, options?)` to get a ready-made `ChoreographyConfig`.

| Preset | Effect | Stagger From |
|--------|--------|-------------|
| `cascade` | Slide up sequentially | `start` |
| `stagger-grid` | Scale in from center | `center` |
| `wave` | Slide up from center | `center` |
| `spiral` | Scale in from center | `center` |
| `focus-in` | Scale in, then fade children | `start` |

```ts
import { getChoreographyPreset, Choreography } from '@annondeveloper/ui-kit'

const config = getChoreographyPreset('cascade', '.card-grid > *', {
  duration: 500,
  staggerEach: 80,
})

const ch = new Choreography(config)
await ch.play()
```

## `useScrollChoreography` hook

Trigger a choreography sequence when an element scrolls into view.

```tsx
import { useRef } from 'react'
import { useScrollChoreography } from '@annondeveloper/ui-kit'

function FeatureSection() {
  const ref = useRef<HTMLDivElement>(null)

  useScrollChoreography({
    trigger: ref,
    preset: 'cascade',        // Use a named preset
    start: 'top bottom',      // Trigger when element top hits viewport bottom
    once: true,                // Only play once
  })

  return (
    <div ref={ref} data-scroll-choreo-id="features">
      <div className="feature-card">Feature 1</div>
      <div className="feature-card">Feature 2</div>
      <div className="feature-card">Feature 3</div>
    </div>
  )
}
```

### `ScrollChoreographyConfig`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `trigger` | `RefObject<HTMLElement>` | required | Element that triggers the choreography |
| `sequence` | `ChoreographyStep[]` | `[]` | Custom steps (ignored if `preset` is set) |
| `preset` | `ChoreographyPreset` | -- | Named preset to use |
| `start` | `string` | `'top bottom'` | When to trigger (e.g., `'top center'`, `'top top'`) |
| `scrub` | `boolean` | `false` | Tie progress to scroll position |
| `once` | `boolean` | `true` | Only trigger once |

## Examples

### Dashboard card entrance

```tsx
const dashboard = choreography({
  defaults: { duration: 400 },
  sequence: [
    { target: '.dashboard-header', animation: 'fadeIn' },
    { target: '.metric-card', animation: 'slideUp', stagger: { each: 80, from: 'start' } },
    { target: '.chart-area', animation: 'scaleIn', delay: 200 },
  ],
})
```

### Custom keyframes

```tsx
const custom = choreography({
  sequence: [
    {
      target: '.logo',
      animation: 'custom',
      keyframes: [
        { opacity: 0, transform: 'rotate(-10deg) scale(0.8)' },
        { opacity: 1, transform: 'rotate(0deg) scale(1)' },
      ],
      duration: 600,
    },
  ],
})
```

### Scroll-scrubbed timeline

```tsx
useScrollChoreography({
  trigger: sectionRef,
  scrub: true,
  sequence: [
    { target: '.step-1', animation: 'slideLeft' },
    { target: '.step-2', animation: 'slideRight' },
    { target: '.step-3', animation: 'fadeIn' },
  ],
})
```
