'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Carousel } from '@ui/components/carousel'
import { Carousel as LiteCarousel } from '@ui/lite/carousel'
import { Carousel as PremiumCarousel } from '@ui/premium/carousel'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.carousel-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: carousel-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .carousel-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .carousel-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: aurora-spin-cr 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-cr {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .carousel-page__hero::before { animation: none; }
      }

      .carousel-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .carousel-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .carousel-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .carousel-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      .carousel-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-cr 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-cr {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .carousel-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .carousel-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .carousel-page__section-title a { color: inherit; text-decoration: none; }
      .carousel-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .carousel-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .carousel-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .carousel-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .carousel-page__preview--full {
        flex-direction: column;
        align-items: stretch;
      }

      .carousel-page__slide {
        display: grid;
        place-items: center;
        min-block-size: 200px;
        border-radius: var(--radius-md);
        font-size: 1.5rem;
        font-weight: 700;
        color: oklch(100% 0 0);
      }

      /* ── Playground ─────────────────────────────────── */

      .carousel-page__playground {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .carousel-page__playground {
          grid-template-columns: 1fr;
        }
        .carousel-page__playground-controls {
          position: static !important;
        }
      }

      @container carousel-page (max-width: 680px) {
        .carousel-page__playground {
          grid-template-columns: 1fr;
        }
        .carousel-page__playground-controls {
          position: static !important;
        }
      }

      .carousel-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .carousel-page__playground-result {
        overflow: hidden;
        min-block-size: 260px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .carousel-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .carousel-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .carousel-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .carousel-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .carousel-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .carousel-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .carousel-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }

      .carousel-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .carousel-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .carousel-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .carousel-page__number-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }

      .carousel-page__number-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .carousel-page__code-tabs {
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .carousel-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-block-end: 0.75rem;
      }

      .carousel-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-success, oklch(72% 0.17 155));
        font-weight: 500;
      }

      /* ── Accessibility ──────────────────────────────── */

      .carousel-page__a11y-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.75rem;
      }

      .carousel-page__a11y-item {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        background: var(--bg-base);
      }

      .carousel-page__a11y-icon {
        flex-shrink: 0;
        inline-size: 20px;
        block-size: 20px;
        color: var(--text-success, oklch(72% 0.17 155));
      }

      .carousel-page__a11y-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Carousel } from '@annondeveloper/ui-kit'",
  lite: "import { Carousel } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Carousel } from '@annondeveloper/ui-kit/premium'",
}

const SLIDE_COLORS = [
  'oklch(55% 0.2 250)', 'oklch(55% 0.2 300)', 'oklch(55% 0.2 150)',
  'oklch(55% 0.2 30)', 'oklch(55% 0.2 200)',
]

const propsData: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Slide elements rendered inside the carousel viewport.' },
  { name: 'autoPlay', type: 'boolean', default: 'false', description: 'Automatically advance slides at a set interval.' },
  { name: 'autoPlayInterval', type: 'number', default: '5000', description: 'Time in ms between auto-advance (when autoPlay is true).' },
  { name: 'showArrows', type: 'boolean', default: 'true', description: 'Show previous/next navigation arrows.' },
  { name: 'showDots', type: 'boolean', default: 'true', description: 'Show dot indicators below the slides.' },
  { name: 'loop', type: 'boolean', default: 'false', description: 'Whether the carousel wraps around at the ends.' },
  { name: 'slidesPerView', type: 'number', default: '1', description: 'Number of slides visible at once.' },
  { name: 'gap', type: 'number | string', default: '0', description: 'Gap between slides when showing multiple.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Helper Components ──────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="carousel-page__control-group">
      <span className="carousel-page__control-label">{label}</span>
      <div className="carousel-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`carousel-page__option-btn${opt === value ? ' carousel-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="carousel-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  autoPlay: boolean,
  loop: boolean,
  showDots: boolean,
  showArrows: boolean,
  slidesPerView: number,
  interval: number,
  motion: number,
  gap: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (autoPlay) props.push('  autoPlay')
  if (autoPlay && interval !== 5000) props.push(`  autoPlayInterval={${interval}}`)
  if (loop) props.push('  loop')
  if (!showDots) props.push('  showDots={false}')
  if (!showArrows) props.push('  showArrows={false}')
  if (slidesPerView !== 1) props.push(`  slidesPerView={${slidesPerView}}`)
  if (gap !== '0') props.push(`  gap="${gap}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const children = `  <div>Slide 1</div>\n  <div>Slide 2</div>\n  <div>Slide 3</div>`

  const jsx = props.length === 0
    ? `<Carousel>\n${children}\n</Carousel>`
    : `<Carousel\n${props.join('\n')}\n>\n${children}\n</Carousel>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  autoPlay: boolean,
  loop: boolean,
  showDots: boolean,
  showArrows: boolean,
  slidesPerView: number,
  gap: string,
): string {
  const attrs: string[] = ['class="ui-carousel"']
  if (autoPlay) attrs.push('data-autoplay="true"')
  if (loop) attrs.push('data-loop="true"')
  if (!showDots) attrs.push('data-show-dots="false"')
  if (!showArrows) attrs.push('data-show-arrows="false"')
  if (slidesPerView !== 1) attrs.push(`data-slides-per-view="${slidesPerView}"`)
  if (gap !== '0') attrs.push(`data-gap="${gap}"`)

  return `<!-- HTML + CSS (standalone) -->
<div ${attrs.join('\n     ')}>
  <div class="ui-carousel__track">
    <div class="ui-carousel__slide">Slide 1</div>
    <div class="ui-carousel__slide">Slide 2</div>
    <div class="ui-carousel__slide">Slide 3</div>
  </div>
</div>

<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/carousel.css" />`
}

function generateVueCode(
  tier: Tier,
  autoPlay: boolean,
  loop: boolean,
  showDots: boolean,
  showArrows: boolean,
  slidesPerView: number,
  interval: number,
  gap: string,
): string {
  if (tier === 'lite') {
    const attrs: string[] = ['class="ui-carousel"']
    if (autoPlay) attrs.push(':auto-play="true"')
    if (loop) attrs.push(':loop="true"')
    if (!showDots) attrs.push(':show-dots="false"')
    if (!showArrows) attrs.push(':show-arrows="false"')
    return `<template>\n  <div ${attrs.join(' ')}>\n    <div class="ui-carousel__track">\n      <div class="ui-carousel__slide">Slide 1</div>\n      <div class="ui-carousel__slide">Slide 2</div>\n      <div class="ui-carousel__slide">Slide 3</div>\n    </div>\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/css/components/carousel.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (autoPlay) attrs.push('  auto-play')
  if (autoPlay && interval !== 5000) attrs.push(`  :auto-play-interval="${interval}"`)
  if (loop) attrs.push('  loop')
  if (!showDots) attrs.push('  :show-dots="false"')
  if (!showArrows) attrs.push('  :show-arrows="false"')
  if (slidesPerView !== 1) attrs.push(`  :slides-per-view="${slidesPerView}"`)
  if (gap !== '0') attrs.push(`  gap="${gap}"`)

  const template = attrs.length === 0
    ? `  <Carousel>\n    <div>Slide 1</div>\n    <div>Slide 2</div>\n    <div>Slide 3</div>\n  </Carousel>`
    : `  <Carousel\n  ${attrs.join('\n  ')}\n  >\n    <div>Slide 1</div>\n    <div>Slide 2</div>\n    <div>Slide 3</div>\n  </Carousel>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Carousel } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  autoPlay: boolean,
  loop: boolean,
  showDots: boolean,
  showArrows: boolean,
  slidesPerView: number,
  gap: string,
): string {
  const attrs: string[] = ['class="ui-carousel"']
  if (autoPlay) attrs.push('data-autoplay="true"')
  if (loop) attrs.push('data-loop="true"')
  if (!showDots) attrs.push('data-show-dots="false"')
  if (!showArrows) attrs.push('data-show-arrows="false"')
  if (slidesPerView !== 1) attrs.push(`data-slides-per-view="${slidesPerView}"`)
  if (gap !== '0') attrs.push(`data-gap="${gap}"`)

  const tierLabel = tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'

  return `<!-- Angular ${tierLabel} tier (CSS-only approach) -->
<div ${attrs.join('\n     ')}>
  <div class="ui-carousel__track">
    <div class="ui-carousel__slide">Slide 1</div>
    <div class="ui-carousel__slide">Slide 2</div>
    <div class="ui-carousel__slide">Slide 3</div>
  </div>
</div>

/* In styles.css */
@import '${importPath}/css/components/carousel.css';`
}

function generateSvelteCode(
  tier: Tier,
  autoPlay: boolean,
  loop: boolean,
  showDots: boolean,
  showArrows: boolean,
  slidesPerView: number,
  interval: number,
  gap: string,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte Lite tier (CSS-only) -->
<div class="ui-carousel"${autoPlay ? ' data-autoplay="true"' : ''}${loop ? ' data-loop="true"' : ''}>
  <div class="ui-carousel__track">
    <div class="ui-carousel__slide">Slide 1</div>
    <div class="ui-carousel__slide">Slide 2</div>
    <div class="ui-carousel__slide">Slide 3</div>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/carousel.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (autoPlay) attrs.push('  autoPlay')
  if (autoPlay && interval !== 5000) attrs.push(`  autoPlayInterval={${interval}}`)
  if (loop) attrs.push('  loop')
  if (!showDots) attrs.push('  showDots={false}')
  if (!showArrows) attrs.push('  showArrows={false}')
  if (slidesPerView !== 1) attrs.push(`  slidesPerView={${slidesPerView}}`)
  if (gap !== '0') attrs.push(`  gap="${gap}"`)

  const carouselTag = attrs.length === 0
    ? `<Carousel>\n  <div>Slide 1</div>\n  <div>Slide 2</div>\n  <div>Slide 3</div>\n</Carousel>`
    : `<Carousel\n${attrs.join('\n')}\n>\n  <div>Slide 1</div>\n  <div>Slide 2</div>\n  <div>Slide 3</div>\n</Carousel>`

  return `<script>\n  import { Carousel } from '${importPath}';\n</script>\n\n${carouselTag}`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [autoPlay, setAutoPlay] = useState(false)
  const [loop, setLoop] = useState(false)
  const [showDots, setShowDots] = useState(true)
  const [showArrows, setShowArrows] = useState(true)
  const [slidesPerView, setSlidesPerView] = useState(1)
  const [interval, setInterval_] = useState(5000)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [gap, setGap] = useState('0')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const CarouselComponent = tier === 'lite' ? LiteCarousel : tier === 'premium' ? PremiumCarousel : Carousel

  const reactCode = useMemo(
    () => generateReactCode(tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, motion, gap),
    [tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, motion, gap],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(autoPlay, loop, showDots, showArrows, slidesPerView, gap),
    [autoPlay, loop, showDots, showArrows, slidesPerView, gap],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, gap),
    [tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, gap],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, autoPlay, loop, showDots, showArrows, slidesPerView, gap),
    [tier, autoPlay, loop, showDots, showArrows, slidesPerView, gap],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, gap),
    [tier, autoPlay, loop, showDots, showArrows, slidesPerView, interval, gap],
  )

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const carouselProps: Record<string, unknown> = {}
  if (autoPlay) carouselProps.autoPlay = true
  if (autoPlay && interval !== 5000) carouselProps.autoPlayInterval = interval
  if (loop) carouselProps.loop = true
  if (!showDots) carouselProps.showDots = false
  if (!showArrows) carouselProps.showArrows = false
  if (slidesPerView !== 1) carouselProps.slidesPerView = slidesPerView
  if (gap !== '0') carouselProps.gap = gap
  if (tier !== 'lite' && motion !== 3) carouselProps.motion = motion

  return (
    <section className="carousel-page__section" id="playground">
      <h2 className="carousel-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="carousel-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="carousel-page__playground">
        {/* Preview area */}
        <div className="carousel-page__playground-preview">
          <div className="carousel-page__playground-result">
            <CarouselComponent {...carouselProps}>
              {SLIDE_COLORS.map((color, i) => (
                <div key={i} className="carousel-page__slide" style={{ background: color }}>
                  Slide {i + 1}
                </div>
              ))}
            </CarouselComponent>
          </div>

          {/* Tabbed code output */}
          <div className="carousel-page__code-tabs">
            <div className="carousel-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="carousel-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        {/* Controls panel */}
        <div className="carousel-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <OptionGroup
            label="Slides Per View"
            options={['1', '2', '3'] as const}
            value={String(slidesPerView) as '1' | '2' | '3'}
            onChange={v => setSlidesPerView(Number(v))}
          />

          <OptionGroup
            label="Gap"
            options={['0', '0.5rem', '1rem', '1.5rem'] as const}
            value={gap as any}
            onChange={setGap}
          />

          <div className="carousel-page__control-group">
            <span className="carousel-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Auto Play" checked={autoPlay} onChange={setAutoPlay} />
              <Toggle label="Loop" checked={loop} onChange={setLoop} />
              <Toggle label="Show Dots" checked={showDots} onChange={setShowDots} />
              <Toggle label="Show Arrows" checked={showArrows} onChange={setShowArrows} />
            </div>
          </div>

          {autoPlay && (
            <div className="carousel-page__control-group">
              <span className="carousel-page__control-label">Interval (ms)</span>
              <input
                type="number"
                value={interval}
                onChange={e => setInterval_(Math.max(500, Number(e.target.value) || 5000))}
                className="carousel-page__number-input"
                min={500}
                max={15000}
                step={500}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Accessibility Section ──────────────────────────────────────────────────

function AccessibilitySection() {
  const features = [
    'Arrow Left / Arrow Right keyboard navigation between slides',
    'Dot indicators are focusable with descriptive aria-label attributes',
    'Arrow buttons include aria-label for screen readers',
    'Autoplay pauses on hover and focus to respect user attention',
    'Uses role="group" with aria-roledescription="carousel"',
    'Each slide has aria-roledescription="slide" and aria-label',
    'Live region announces current slide on change',
    'Respects prefers-reduced-motion by disabling transitions',
  ]

  return (
    <section className="carousel-page__section" id="accessibility">
      <h2 className="carousel-page__section-title">
        <a href="#accessibility">Accessibility</a>
      </h2>
      <p className="carousel-page__section-desc">
        Built following WAI-ARIA Carousel Pattern with full keyboard support and screen reader announcements.
      </p>
      <div className="carousel-page__a11y-grid">
        {features.map((feature, i) => (
          <div key={i} className="carousel-page__a11y-item">
            <svg className="carousel-page__a11y-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="carousel-page__a11y-text">{feature}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CarouselPage() {
  useStyles('carousel-page', pageStyles)
  const { tier } = useTier()

  const CarouselComponent = tier === 'lite' ? LiteCarousel : tier === 'premium' ? PremiumCarousel : Carousel
  const effectiveTier = tier

  useEffect(() => {
    const sections = document.querySelectorAll('.carousel-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="carousel-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="carousel-page__hero">
        <h1 className="carousel-page__title">Carousel</h1>
        <p className="carousel-page__desc">
          Slide-based content viewer with arrow navigation, dot indicators,
          autoplay, loop, and multi-slide display. Keyboard and touch accessible.
          Ships in three weight tiers from ultra-light CSS-only to premium with aurora glow.
        </p>
        <div className="carousel-page__import-row">
          <code className="carousel-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── Basic Carousel ────────────────────────── */}
      <section className="carousel-page__section" id="basic">
        <h2 className="carousel-page__section-title"><a href="#basic">Basic Carousel</a></h2>
        <p className="carousel-page__section-desc">
          Navigate slides with arrows and dots. Supports keyboard navigation via Arrow Left/Right.
          The {effectiveTier === 'lite' ? 'lite' : effectiveTier === 'premium' ? 'premium' : 'standard'} tier
          is currently active.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <CarouselComponent>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </CarouselComponent>
        </div>
      </section>

      {/* ── Autoplay ──────────────────────────────── */}
      <section className="carousel-page__section" id="autoplay">
        <h2 className="carousel-page__section-title"><a href="#autoplay">Autoplay</a></h2>
        <p className="carousel-page__section-desc">
          Slides advance automatically every 3 seconds. Autoplay pauses on hover and focus.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <CarouselComponent autoPlay autoPlayInterval={3000}>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </CarouselComponent>
        </div>
      </section>

      {/* ── Loop ──────────────────────────────────── */}
      <section className="carousel-page__section" id="loop">
        <h2 className="carousel-page__section-title"><a href="#loop">Infinite Loop</a></h2>
        <p className="carousel-page__section-desc">
          Wraps around seamlessly at the ends. Navigate past the last slide to return to the first.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <CarouselComponent loop>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </CarouselComponent>
        </div>
      </section>

      {/* ── Multi-slide ───────────────────────────── */}
      <section className="carousel-page__section" id="multi-slide">
        <h2 className="carousel-page__section-title"><a href="#multi-slide">Multi-Slide</a></h2>
        <p className="carousel-page__section-desc">
          Show multiple slides at once with a gap between them. Useful for card-based content.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <CarouselComponent slidesPerView={3} gap="1rem" showDots={false}>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color, minBlockSize: '140px', fontSize: '1.125rem' }}>
                Card {i + 1}
              </div>
            ))}
          </CarouselComponent>
        </div>
      </section>

      {/* ── Minimal (no dots, no arrows) ──────────── */}
      <section className="carousel-page__section" id="minimal">
        <h2 className="carousel-page__section-title"><a href="#minimal">Minimal</a></h2>
        <p className="carousel-page__section-desc">
          Hide both arrows and dots for a clean, swipe-only experience. Still keyboard accessible.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <CarouselComponent showDots={false} showArrows={false}>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </CarouselComponent>
        </div>
      </section>

      {/* ── Live Playground ───────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── Weight Tiers ──────────────────────────── */}
      <section className="carousel-page__section" id="tiers">
        <h2 className="carousel-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="carousel-page__section-desc">
          Choose the right weight tier for your project. Each tier shares the same API but ships
          different levels of visual richness and bundle size.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with smooth scrolling, theming, and accessibility. ~3.2KB gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Carousel {'}'} from '@annondeveloper/ui-kit'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal wrapper, no motion. Instant scroll behavior. ~1.2KB gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Carousel {'}'} from '@annondeveloper/ui-kit/lite'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow on arrows, spring scale, active dot glow, dot morphing. ~4.5KB gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Carousel {'}'} from '@annondeveloper/ui-kit/premium'</code>
          </Card>
        </div>
      </section>

      {/* ── Accessibility ─────────────────────────── */}
      <AccessibilitySection />

      {/* ── Brand Color ───────────────────────────── */}
      <section className="carousel-page__section" id="brand-color">
        <h2 className="carousel-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="carousel-page__section-desc">
          Pick a brand color to see how the carousel adapts. Arrow buttons, dot indicators,
          and focus rings all derive from the brand token automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
        </div>
      </section>

      {/* ── Source ─────────────────────────────────── */}
      <section className="carousel-page__section" id="source">
        <h2 className="carousel-page__section-title"><a href="#source">Source</a></h2>
        <p className="carousel-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/carousel.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/carousel.tsx (Standard)
          </a>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/carousel.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/carousel.tsx (Lite)
          </a>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/carousel.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/carousel.tsx (Premium)
          </a>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="carousel-page__section" id="props">
        <h2 className="carousel-page__section-title"><a href="#props">Props API</a></h2>
        <p className="carousel-page__section-desc">
          All props accepted by the Carousel component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
