# Animation System

UI Kit v2 includes a complete animation engine built on the Web Animations API (WAAPI) with a real spring physics solver. No external animation libraries are required.

The engine weighs approximately 3.5KB gzipped and provides: spring physics, timeline sequencing, stagger patterns, scroll-triggered reveals, FLIP layout transitions, and text splitting for per-character animation.

## Motion Levels

Every animated component respects a global motion intensity level (0-3). This cascades from multiple sources, with the highest priority winning:

1. **OS preference** — `prefers-reduced-motion: reduce` forces level 0
2. **Component prop** — `<Button motion={1} />` overrides for that component
3. **CSS custom property** — `--motion: 2` on an ancestor element
4. **UIProvider** — `<UIProvider motion={2}>` sets the default
5. **Default** — level 3 (cinematic) if nothing else is set

### Level 0: None

All animations are instant. Transitions have zero duration. Use for users who prefer reduced motion or testing environments.

```tsx
<UIProvider motion={0}>
  {/* All animations disabled */}
</UIProvider>
```

### Level 1: Subtle

Simple CSS transitions only (opacity, color changes). No spring physics, no layout animations.

```css
/* Level 1 activates basic transitions */
.ui-button {
  transition: background-color 150ms ease, opacity 150ms ease;
}
```

### Level 2: Expressive

Conservative spring animations with no overshoot. Stagger effects on lists. Entry/exit transitions on overlays.

```tsx
<UIProvider motion={2}>
  {/* Springs settle without bouncing */}
  {/* Lists animate in with stagger */}
  {/* Dialogs fade + scale in */}
</UIProvider>
```

### Level 3: Cinematic (default)

Full physics simulation with overshoot, bouncy springs, scroll-driven parallax, aurora glow animations, and FLIP layout transitions.

```tsx
<UIProvider motion={3}>
  {/* Full spring physics with bounce */}
  {/* Scroll-triggered reveal animations */}
  {/* Aurora ambient glow effects */}
  {/* FLIP transitions on layout changes */}
</UIProvider>
```

### Using in components

```tsx
import { useMotionLevel } from '@annondeveloper/ui-kit'

function MyComponent({ motion }: { motion?: number }) {
  const level = useMotionLevel(motion)

  if (level === 0) {
    // Instant, no animation
  } else if (level >= 2) {
    // Use spring physics
  }
}
```

## Spring Physics

The spring solver uses 4th-order Runge-Kutta (RK4) integration to solve the damped harmonic oscillator equation: `mx'' + cx' + kx = 0`. This produces physically accurate spring motion, not CSS approximations.

### SpringConfig

| Parameter | Default | Description |
|-----------|---------|-------------|
| `stiffness` | `100` | Spring constant (higher = snappier) |
| `damping` | `10` | Friction (higher = less bounce) |
| `mass` | `1` | Object mass (higher = more inertia) |
| `velocity` | `0` | Initial velocity |
| `precision` | `0.01` | Settlement threshold |

### Presets

```tsx
// Snappy UI interaction
{ stiffness: 300, damping: 25, mass: 1 }

// Gentle float
{ stiffness: 50, damping: 8, mass: 1 }

// Bouncy entrance
{ stiffness: 200, damping: 12, mass: 1 }

// Heavy, deliberate
{ stiffness: 100, damping: 20, mass: 3 }
```

### spring() function

Animate an element with spring physics:

```tsx
import { spring } from '@annondeveloper/ui-kit'

// Animate to target values
const result = spring(element, { opacity: 1, transform: 'scale(1)' }, {
  stiffness: 200,
  damping: 15,
})

// Wait for completion
await result.finished

// Cancel mid-animation
result.cancel()
```

### solveSpring()

Get the raw spring curve as an array of values (0 to ~1):

```tsx
import { solveSpring } from '@annondeveloper/ui-kit'

const values = solveSpring({ stiffness: 200, damping: 15 })
// [0, 0.023, 0.089, 0.192, ..., 1.042, 1.018, 1.003, 1.0]
//  ^ starts at 0, overshoots past 1, settles at 1
```

### springToLinearEasing()

Convert a spring curve to a CSS `linear()` easing function (max 40 control points):

```tsx
import { springToLinearEasing, springDuration } from '@annondeveloper/ui-kit'

const easing = springToLinearEasing({ stiffness: 200, damping: 15 })
const duration = springDuration({ stiffness: 200, damping: 15 })

element.style.transition = `transform ${duration}ms ${easing}`
```

## animate()

Low-level WAAPI wrapper with sensible defaults:

```tsx
import { animate } from '@annondeveloper/ui-kit'

const result = animate(element, [
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' },
], {
  duration: 300,     // ms (default: 300)
  easing: 'ease-out', // any CSS easing (default: 'ease-out')
  delay: 0,           // ms (default: 0)
  fill: 'forwards',   // FillMode (default: 'forwards')
  iterations: 1,      // number (default: 1)
  direction: 'normal', // PlaybackDirection (default: 'normal')
})

await result.finished
```

Returns an `AnimationResult`:

| Property | Type | Description |
|----------|------|-------------|
| `animation` | `Animation \| null` | The underlying WAAPI Animation object |
| `finished` | `Promise<void>` | Resolves when animation completes or is cancelled |
| `cancel` | `() => void` | Cancel the animation |

## Timeline

Sequence multiple animations with precise timing control:

```tsx
import { timeline, animate, spring } from '@annondeveloper/ui-kit'

const tl = timeline()
  .add(() => animate(header, [
    { opacity: 0 }, { opacity: 1 }
  ], { duration: 400 }))
  .add(() => animate(subtitle, [
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 300 }), '-100')  // overlap by 100ms
  .add(() => spring(cta, { opacity: 1 }, { stiffness: 200, damping: 15 }))

await tl.play()
```

### Timing offsets

The second argument to `.add()` controls when the animation starts relative to the previous one:

| Offset | Meaning |
|--------|---------|
| (none) | Start after previous animation ends |
| `'-100'` | Start 100ms before previous ends (overlap) |
| `'+200'` | Start 200ms after previous ends (gap) |
| `500` | Start at absolute time 500ms |

### Labels

Mark positions in the timeline for reference:

```tsx
const tl = timeline()
  .add(() => animate(bg, ...))
  .label('content-start')
  .add(() => animate(title, ...), 'content-start+=100')
  .add(() => animate(body, ...), 'content-start+=200')
```

### Playback control

```tsx
const tl = timeline()
// ... add animations

await tl.play()
tl.pause()
tl.resume()
tl.cancel()
tl.playbackRate = 0.5  // slow motion
tl.playbackRate = 2    // fast forward
```

## Stagger

Calculate delay values for staggered list and grid animations:

```tsx
import { computeStaggerDelays } from '@annondeveloper/ui-kit'

// Simple list stagger: 50ms between each item
const delays = computeStaggerDelays(10, { each: 50, from: 'start' })
// [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]
```

### Stagger origins

| `from` | Description |
|--------|-------------|
| `'start'` | First item animates first (default) |
| `'end'` | Last item animates first |
| `'center'` | Center items animate first, edges last |
| `'edges'` | Edge items animate first, center last |
| `'random'` | Random stagger order |
| `number` | Index to stagger from (e.g., `3` = item at index 3 goes first) |

### Grid stagger

For 2D grid layouts, items stagger radially from the center:

```tsx
const delays = computeStaggerDelays(24, {
  each: 30,
  grid: [6, 4],  // 6 columns, 4 rows
})
// Items near the center animate first, corners last
```

### Using with animate()

```tsx
const items = document.querySelectorAll('.card')
const delays = computeStaggerDelays(items.length, { each: 50, from: 'start' })

items.forEach((item, i) => {
  animate(item, [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 300, delay: delays[i] })
})
```

## Scroll Animations

### useScrollReveal()

React hook that triggers when an element enters the viewport. Uses `IntersectionObserver` with automatic fallback for browsers that support CSS `animation-timeline: view()`.

```tsx
import { useRef } from 'react'
import { useScrollReveal } from '@annondeveloper/ui-kit'

function RevealSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useScrollReveal(ref, {
    threshold: 0.1,       // 10% visible triggers (default)
    rootMargin: '0px',    // IntersectionObserver margin
    once: true,           // Only trigger once (default)
  })

  return (
    <div ref={ref} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s' }}>
      This content reveals on scroll
    </div>
  )
}
```

### ScrollReveal component

A pre-built component that wraps `useScrollReveal()` with configurable animations:

```tsx
import { ScrollReveal } from '@annondeveloper/ui-kit'

<ScrollReveal>
  <Card>This card fades in when scrolled into view</Card>
</ScrollReveal>
```

### CSS scroll-driven animations

When the browser supports `animation-timeline: view()`, the CSS-native approach is used automatically. No JavaScript IntersectionObserver is needed in that case.

```tsx
import { supportsScrollDrivenAnimations } from '@annondeveloper/ui-kit'

if (supportsScrollDrivenAnimations()) {
  // Browser handles scroll animations natively via CSS
}
```

## FLIP Layout Transitions

FLIP (First, Last, Invert, Play) animates elements between layout positions. Useful for reordering lists, expanding/collapsing cards, and layout changes.

```tsx
import { flip } from '@annondeveloper/ui-kit'

// 1. Capture current positions
const state = flip.capture('.card')

// 2. Make your DOM change (React setState, etc.)
reorderCards()

// 3. After the DOM updates, animate from old to new positions
requestAnimationFrame(() => {
  flip.play(state, { duration: 300, easing: 'ease-out' })
})
```

### flip.capture()

Captures the bounding rectangles of elements before a layout change.

```tsx
// By CSS selector
const state = flip.capture('.grid-item')

// By element array
const state = flip.capture([element1, element2, element3])
```

### flip.play()

Animates elements from their captured positions to their current positions.

```tsx
await flip.play(state, {
  duration: 300,       // ms (default: 300)
  easing: 'ease-out',  // CSS easing (default: 'ease-out')
})
```

The animation automatically handles position changes (translate) and size changes (scale). Elements that haven't moved are skipped.

## TextSplitter

Split text into individually animatable `<span>` elements:

```tsx
import { TextSplitter } from '@annondeveloper/ui-kit'

<TextSplitter
  text="Hello World"
  splitBy="chars"         // 'chars' | 'words' | 'lines'
  className="heading"     // Class on the wrapper
  charClassName="char"    // Class on each split element
/>
```

Each split element:
- Has `display: inline-block` for transform animations
- Has `aria-hidden="true"` (the wrapper has the full `aria-label`)
- Preserves whitespace characters with `white-space: pre`

### Animating split text

Combine `TextSplitter` with `computeStaggerDelays`:

```tsx
function AnimatedHeading({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chars = ref.current.querySelectorAll('.char')
    const delays = computeStaggerDelays(chars.length, { each: 30, from: 'start' })

    chars.forEach((char, i) => {
      animate(char, [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 400, delay: delays[i] })
    })
  }, [text])

  return <TextSplitter ref={ref} text={text} splitBy="chars" charClassName="char" />
}
```

## CSS-First Animations

Many component animations are handled purely in CSS, using modern features with progressive degradation:

### @starting-style

Entry animations for elements that appear (e.g., dialogs, popovers):

```css
.ui-dialog[open] {
  opacity: 1;
  transform: scale(1);
  transition: opacity 200ms, transform 200ms;

  @starting-style {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### transition-behavior: allow-discrete

Exit animations for elements being removed from the page:

```css
.ui-popover {
  transition: opacity 150ms, display 150ms allow-discrete;
}
```

### animation-timeline: view()

Scroll-driven animations without JavaScript:

```css
.ui-scroll-reveal {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 30%;
}
```

### Reduced motion

All animations respect the user's OS preference:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Motion Controller

For complex orchestration, use the `MotionContext` to coordinate animations across component trees:

```tsx
import { UIProvider } from '@annondeveloper/ui-kit'

function App() {
  const [motionLevel, setMotionLevel] = useState(3)

  return (
    <UIProvider motion={motionLevel}>
      <button onClick={() => setMotionLevel(0)}>Reduce motion</button>
      <button onClick={() => setMotionLevel(3)}>Full motion</button>
      <Dashboard />
    </UIProvider>
  )
}
```

Components throughout the tree will immediately respond to motion level changes, adjusting their animation behavior accordingly.
