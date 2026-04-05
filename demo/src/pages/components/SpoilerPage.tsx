'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Spoiler } from '@ui/components/spoiler'
import { Spoiler as LiteSpoiler } from '@ui/lite/spoiler'
import { Spoiler as PremiumSpoiler } from '@ui/premium/spoiler'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.spoiler-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: spoiler-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .spoiler-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .spoiler-page__hero::before {
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
        animation: aurora-spin-sl 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-sl {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .spoiler-page__hero::before { animation: none; }
      }

      .spoiler-page__title {
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

      .spoiler-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .spoiler-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .spoiler-page__import-code {
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
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      /* ── Section cards ─────────────────────────────────── */

      .spoiler-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-sl 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-sl {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .spoiler-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .spoiler-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .spoiler-page__section-title a { color: inherit; text-decoration: none; }
      .spoiler-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .spoiler-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .spoiler-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .spoiler-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .spoiler-page__sample-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.7;
        text-wrap: pretty;
      }

      /* ── Playground ─────────────────────────────────── */

      .spoiler-page__playground {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .spoiler-page__playground {
          grid-template-columns: 1fr;
        }
        .spoiler-page__playground-controls {
          position: static !important;
        }
      }

      @container spoiler-page (max-width: 680px) {
        .spoiler-page__playground {
          grid-template-columns: 1fr;
        }
        .spoiler-page__playground-controls {
          position: static !important;
        }
      }

      .spoiler-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .spoiler-page__playground-result {
        overflow-x: auto;
        min-block-size: 160px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .spoiler-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .spoiler-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .spoiler-page__playground-controls {
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

      .spoiler-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .spoiler-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .spoiler-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .spoiler-page__option-btn {
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
      .spoiler-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .spoiler-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .spoiler-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .spoiler-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .spoiler-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .spoiler-page__number-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .spoiler-page__number-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Code tabs ──────────────────────────────────── */

      .spoiler-page__code-tabs {
        margin-block-start: 1rem;
      }

      .spoiler-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .spoiler-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .spoiler-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container spoiler-page (max-width: 600px) {
        .spoiler-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      .spoiler-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .spoiler-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .spoiler-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle), 0 4px 16px oklch(0% 0 0 / 0.1);
      }

      .spoiler-page__tier-name {
        font-size: var(--text-base, 1rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .spoiler-page__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .spoiler-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        word-break: break-all;
      }

      .spoiler-page__size-row {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        display: flex;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .spoiler-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .spoiler-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .spoiler-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .spoiler-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .spoiler-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .spoiler-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Spoiler } from '@annondeveloper/ui-kit'",
  lite: "import { Spoiler } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Spoiler } from '@annondeveloper/ui-kit/premium'",
}

const LONG_TEXT = `Aurora Fluid is a design language that draws inspiration from the natural phenomenon of the aurora borealis. It uses deep atmospheric surfaces, ambient glows, and ethereal color washes to create interfaces that feel alive and immersive. The OKLCH color system ensures perceptually uniform color distribution, while physics-based animations powered by a real spring solver provide motion that feels natural and responsive. Every component in the library is designed with progressive enhancement in mind, using modern CSS features like @scope, @layer, container queries, and scroll-driven animations, with graceful fallbacks for older browsers. The zero-dependency architecture means the entire library ships with only React as a peer dependency, keeping bundle sizes minimal while delivering a premium experience.`

const SHORT_TEXT = `This section contains a brief overview of the component architecture. Click "Show more" to reveal additional details about implementation patterns and best practices.`

const NESTED_TEXT = `The Spoiler component supports nested content including rich HTML, images, and even other interactive components. When the max height is exceeded, a smooth gradient fade is applied to hint that more content exists below. The toggle button allows the user to expand and collapse the content with a natural animation.

Here are some key features of the Spoiler component:
- Smooth expand/collapse transitions using CSS or spring physics
- Configurable gradient fade at the clip boundary
- Custom show/hide labels for the toggle button
- Respects prefers-reduced-motion for accessibility
- Works with any content type including text, images, and nested components
- Three weight tiers: Lite (no motion), Standard (CSS transitions), and Premium (spring animations with aurora effects)`

const propsData: PropDef[] = [
  { name: 'maxHeight', type: 'number', required: true, description: 'Maximum height in pixels before content is clipped.' },
  { name: 'showLabel', type: 'string', default: "'Show more'", description: 'Label for the expand button.' },
  { name: 'hideLabel', type: 'string', default: "'Show less'", description: 'Label for the collapse button.' },
  { name: 'initialState', type: "'hidden' | 'visible'", default: "'hidden'", description: 'Initial visibility state of the content.' },
  { name: 'transitionDuration', type: 'number', default: '350', description: 'Duration of the expand/collapse transition in milliseconds.' },
  { name: 'gradient', type: 'boolean', default: 'true', description: 'Show gradient fade at bottom when collapsed.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to display, which may be clipped at maxHeight.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

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
    <div className="spoiler-page__control-group">
      <span className="spoiler-page__control-label">{label}</span>
      <div className="spoiler-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`spoiler-page__option-btn${opt === value ? ' spoiler-page__option-btn--active' : ''}`}
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
    <label className="spoiler-page__toggle-label">
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
  maxHeight: number,
  showLabel: string,
  hideLabel: string,
  initialState: 'hidden' | 'visible',
  gradient: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = [`  maxHeight={${maxHeight}}`]
  if (showLabel !== 'Show more') props.push(`  showLabel="${showLabel}"`)
  if (hideLabel !== 'Show less') props.push(`  hideLabel="${hideLabel}"`)
  if (initialState !== 'hidden') props.push(`  initialState="${initialState}"`)
  if (!gradient) props.push('  gradient={false}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}

<Spoiler
${props.join('\n')}
>
  <p>Your content here...</p>
</Spoiler>`
}

function generateHtmlCode(
  tier: Tier,
  maxHeight: number,
  showLabel: string,
  hideLabel: string,
): string {
  const cssImport = tier === 'premium'
    ? "@import '@annondeveloper/ui-kit/premium/css/components/spoiler.css';"
    : tier === 'lite'
    ? "@import '@annondeveloper/ui-kit/lite/styles.css';"
    : "@import '@annondeveloper/ui-kit/css/components/spoiler.css';"

  return `<!-- HTML + CSS — ${tier} tier -->
<div class="ui-spoiler" data-state="hidden">
  <div class="ui-spoiler__content"
       style="max-height: ${maxHeight}px; overflow: hidden;">
    <p>Your content here...</p>
  </div>
  <button class="ui-spoiler__toggle" type="button">
    ${showLabel}
  </button>
</div>

<style>
  ${cssImport}

  /* Toggle logic requires JS — see React/Vue examples */
  .ui-spoiler__toggle {
    cursor: pointer;
    background: none;
    border: none;
    color: var(--brand, oklch(65% 0.2 270));
    font-weight: 500;
  }
</style>

<script>
  const spoiler = document.querySelector('.ui-spoiler');
  const content = spoiler.querySelector('.ui-spoiler__content');
  const toggle = spoiler.querySelector('.ui-spoiler__toggle');
  let expanded = false;

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    spoiler.dataset.state = expanded ? 'visible' : 'hidden';
    content.style.maxHeight = expanded ? content.scrollHeight + 'px' : '${maxHeight}px';
    toggle.textContent = expanded ? '${hideLabel}' : '${showLabel}';
  });
</script>`
}

function generateVueCode(
  tier: Tier,
  maxHeight: number,
  showLabel: string,
  hideLabel: string,
  gradient: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Vue — Lite tier -->
<template>
  <div class="ui-spoiler" :data-state="expanded ? 'visible' : 'hidden'">
    <div
      class="ui-spoiler__content"
      :style="{ maxHeight: expanded ? 'none' : '${maxHeight}px' }"
    >
      <slot />
    </div>
    <button class="ui-spoiler__toggle" @click="expanded = !expanded">
      {{ expanded ? '${hideLabel}' : '${showLabel}' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const expanded = ref(false)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`  :max-height="${maxHeight}"`]
  if (showLabel !== 'Show more') props.push(`  show-label="${showLabel}"`)
  if (hideLabel !== 'Show less') props.push(`  hide-label="${hideLabel}"`)
  if (!gradient) props.push('  :gradient="false"')

  return `<template>
  <Spoiler
${props.join('\n')}
  >
    <p>Your content here...</p>
  </Spoiler>
</template>

<script setup>
import { Spoiler } from '${importPath}'
</script>`
}

function generateAngularCode(
  tier: Tier,
  maxHeight: number,
  showLabel: string,
  hideLabel: string,
): string {
  const cssImport = tier === 'premium'
    ? '@annondeveloper/ui-kit/premium/css/components/spoiler.css'
    : tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/spoiler.css'

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : tier === 'lite' ? 'Lite' : 'Standard'} tier (CSS-only) -->
<div class="ui-spoiler" [attr.data-state]="expanded ? 'visible' : 'hidden'">
  <div
    class="ui-spoiler__content"
    [style.max-height]="expanded ? 'none' : '${maxHeight}px'"
  >
    <p>Your content here...</p>
  </div>
  <button
    class="ui-spoiler__toggle"
    type="button"
    (click)="expanded = !expanded"
  >
    {{ expanded ? '${hideLabel}' : '${showLabel}' }}
  </button>
</div>

/* In styles.css */
@import '${cssImport}';`
}

function generateSvelteCode(
  tier: Tier,
  maxHeight: number,
  showLabel: string,
  hideLabel: string,
  gradient: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier -->
<script>
  let expanded = false;
</script>

<div class="ui-spoiler" data-state={expanded ? 'visible' : 'hidden'}>
  <div
    class="ui-spoiler__content"
    style="max-height: {expanded ? 'none' : '${maxHeight}px'}; overflow: hidden;"
  >
    <slot />
  </div>
  <button class="ui-spoiler__toggle" on:click={() => expanded = !expanded}>
    {expanded ? '${hideLabel}' : '${showLabel}'}
  </button>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`  maxHeight={${maxHeight}}`]
  if (showLabel !== 'Show more') props.push(`  showLabel="${showLabel}"`)
  if (hideLabel !== 'Show less') props.push(`  hideLabel="${hideLabel}"`)
  if (!gradient) props.push('  gradient={false}')

  return `<script>
  import { Spoiler } from '${importPath}';
</script>

<Spoiler
${props.join('\n')}
>
  <p>Your content here...</p>
</Spoiler>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [maxHeight, setMaxHeight] = useState(80)
  const [showLabel, setShowLabel] = useState('Show more')
  const [hideLabel, setHideLabel] = useState('Show less')
  const [initialState, setInitialState] = useState<'hidden' | 'visible'>('hidden')
  const [gradient, setGradient] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const SpoilerComponent = tier === 'lite' ? LiteSpoiler : tier === 'premium' ? PremiumSpoiler : Spoiler

  const reactCode = useMemo(
    () => generateReactCode(tier, maxHeight, showLabel, hideLabel, initialState, gradient, motion),
    [tier, maxHeight, showLabel, hideLabel, initialState, gradient, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, maxHeight, showLabel, hideLabel),
    [tier, maxHeight, showLabel, hideLabel],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, maxHeight, showLabel, hideLabel, gradient),
    [tier, maxHeight, showLabel, hideLabel, gradient],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, maxHeight, showLabel, hideLabel),
    [tier, maxHeight, showLabel, hideLabel],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, maxHeight, showLabel, hideLabel, gradient),
    [tier, maxHeight, showLabel, hideLabel, gradient],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

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

  const previewProps: Record<string, unknown> = {
    maxHeight,
    showLabel,
    hideLabel,
    initialState,
    gradient,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="spoiler-page__section" id="playground">
      <h2 className="spoiler-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="spoiler-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="spoiler-page__playground">
        {/* Preview area */}
        <div className="spoiler-page__playground-preview">
          <div className="spoiler-page__playground-result">
            <SpoilerComponent {...previewProps}>
              <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
            </SpoilerComponent>
          </div>

          {/* Tabbed code output */}
          <div className="spoiler-page__code-tabs">
            <div className="spoiler-page__export-row">
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
              {copyStatus && <span className="spoiler-page__export-status">{copyStatus}</span>}
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
        <div className="spoiler-page__playground-controls">
          <div className="spoiler-page__control-group">
            <span className="spoiler-page__control-label">Max Height (px)</span>
            <input
              type="number"
              value={maxHeight}
              onChange={e => setMaxHeight(Math.max(20, Number(e.target.value) || 80))}
              className="spoiler-page__number-input"
              min={20}
              max={500}
            />
          </div>

          <OptionGroup
            label="Initial State"
            options={['hidden', 'visible'] as const}
            value={initialState}
            onChange={setInitialState}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="spoiler-page__control-group">
            <span className="spoiler-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Gradient fade" checked={gradient} onChange={setGradient} />
            </div>
          </div>

          <div className="spoiler-page__control-group">
            <span className="spoiler-page__control-label">Show Label</span>
            <input
              type="text"
              value={showLabel}
              onChange={e => setShowLabel(e.target.value)}
              className="spoiler-page__text-input"
              placeholder="Show more"
            />
          </div>

          <div className="spoiler-page__control-group">
            <span className="spoiler-page__control-label">Hide Label</span>
            <input
              type="text"
              value={hideLabel}
              onChange={e => setHideLabel(e.target.value)}
              className="spoiler-page__text-input"
              placeholder="Show less"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SpoilerPage() {
  useStyles('spoiler-page', pageStyles)
  const { tier } = useTier()

  const effectiveTier = tier
  const isLite = effectiveTier === 'lite'
  const SpoilerComponent = isLite ? LiteSpoiler : effectiveTier === 'premium' ? PremiumSpoiler : Spoiler

  useEffect(() => {
    const sections = document.querySelectorAll('.spoiler-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="spoiler-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="spoiler-page__hero">
        <h1 className="spoiler-page__title">Spoiler</h1>
        <p className="spoiler-page__desc">
          Expandable content container with a max height, fade gradient,
          and show more/less toggle. Smooth animated expand and collapse
          with configurable motion intensity and spring physics.
        </p>
        <div className="spoiler-page__import-row">
          <code className="spoiler-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────── */}
      <section className="spoiler-page__section" id="basic">
        <h2 className="spoiler-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="spoiler-page__section-desc">
          Content exceeding the maxHeight is clipped with a gradient fade. Click the toggle to expand.
        </p>
        <div className="spoiler-page__preview">
          <SpoilerComponent maxHeight={80}>
            <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
          </SpoilerComponent>
        </div>
      </section>

      {/* ── 2. Live Playground ────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Custom Labels & Heights ────────────────── */}
      <section className="spoiler-page__section" id="custom">
        <h2 className="spoiler-page__section-title"><a href="#custom">Custom Labels &amp; Heights</a></h2>
        <p className="spoiler-page__section-desc">
          Customize the expand/collapse labels and the max height threshold.
        </p>
        <div className="spoiler-page__preview" style={{ gap: '2rem' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>maxHeight=60, custom labels</p>
            <SpoilerComponent maxHeight={60} showLabel="Read more..." hideLabel="Collapse">
              <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
            </SpoilerComponent>
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>maxHeight=200 (no clip needed)</p>
            <SpoilerComponent maxHeight={200}>
              <p className="spoiler-page__sample-text">{SHORT_TEXT}</p>
            </SpoilerComponent>
          </div>
        </div>
      </section>

      {/* ── 4. Without Gradient ───────────────────────── */}
      <section className="spoiler-page__section" id="no-gradient">
        <h2 className="spoiler-page__section-title"><a href="#no-gradient">Without Gradient</a></h2>
        <p className="spoiler-page__section-desc">
          Disable the fade gradient for a hard clip at the max height boundary.
        </p>
        <div className="spoiler-page__preview">
          <SpoilerComponent maxHeight={80} gradient={false}>
            <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
          </SpoilerComponent>
        </div>
      </section>

      {/* ── 5. Initially Visible ──────────────────────── */}
      <section className="spoiler-page__section" id="initial-state">
        <h2 className="spoiler-page__section-title"><a href="#initial-state">Initially Visible</a></h2>
        <p className="spoiler-page__section-desc">
          Start with content fully expanded by setting <code>initialState="visible"</code>.
        </p>
        <div className="spoiler-page__preview">
          <SpoilerComponent maxHeight={80} initialState="visible">
            <p className="spoiler-page__sample-text">{NESTED_TEXT}</p>
          </SpoilerComponent>
        </div>
      </section>

      {/* ── 6. Nested Content ─────────────────────────── */}
      <section className="spoiler-page__section" id="nested">
        <h2 className="spoiler-page__section-title"><a href="#nested">Rich Nested Content</a></h2>
        <p className="spoiler-page__section-desc">
          The Spoiler component works with any content type, including nested cards and structured layouts.
        </p>
        <div className="spoiler-page__preview">
          <SpoilerComponent maxHeight={120}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card padding="sm">
                <strong>Section 1: Overview</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  The Spoiler component provides an elegant way to hide and reveal content with smooth animations.
                </p>
              </Card>
              <Card padding="sm">
                <strong>Section 2: Configuration</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  Configure max height, gradient, labels, and motion level for your use case.
                </p>
              </Card>
              <Card padding="sm">
                <strong>Section 3: Advanced Usage</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  Combine with other components for rich interactive disclosure patterns.
                </p>
              </Card>
            </div>
          </SpoilerComponent>
        </div>
      </section>

      {/* ── 7. Weight Tiers ──────────────────────────── */}
      <section className="spoiler-page__section" id="tiers">
        <h2 className="spoiler-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="spoiler-page__section-desc">
          Choose the right tier for your performance and feature needs.
        </p>
        <div className="spoiler-page__tiers">
          <div
            className={`spoiler-page__tier-card${tier === 'lite' ? ' spoiler-page__tier-card--active' : ''}`}
            onClick={() => {}}
          >
            <span className="spoiler-page__tier-name">Lite</span>
            <span className="spoiler-page__tier-desc">
              Minimal footprint, no motion or spring animations. CSS transitions only.
            </span>
            <code className="spoiler-page__tier-import">import {'{'} Spoiler {'}'} from '@annondeveloper/ui-kit/lite'</code>
            <span className="spoiler-page__size-row">~0.3 KB gzip JS</span>
          </div>
          <div
            className={`spoiler-page__tier-card${tier === 'standard' ? ' spoiler-page__tier-card--active' : ''}`}
            onClick={() => {}}
          >
            <span className="spoiler-page__tier-name">Standard</span>
            <span className="spoiler-page__tier-desc">
              Full-featured with CSS transitions, gradient fade, and motion levels.
            </span>
            <code className="spoiler-page__tier-import">import {'{'} Spoiler {'}'} from '@annondeveloper/ui-kit'</code>
            <span className="spoiler-page__size-row">~1.8 KB gzip JS</span>
          </div>
          <div
            className={`spoiler-page__tier-card${tier === 'premium' ? ' spoiler-page__tier-card--active' : ''}`}
            onClick={() => {}}
          >
            <span className="spoiler-page__tier-name">Premium</span>
            <span className="spoiler-page__tier-desc">
              Aurora glow effects, spring physics for expand/collapse, and shimmer toggle.
            </span>
            <code className="spoiler-page__tier-import">import {'{'} Spoiler {'}'} from '@annondeveloper/ui-kit/premium'</code>
            <span className="spoiler-page__size-row">~2.2 KB gzip JS</span>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ──────────────────────────────── */}
      <section className="spoiler-page__section" id="props">
        <h2 className="spoiler-page__section-title"><a href="#props">Props API</a></h2>
        <p className="spoiler-page__section-desc">
          All props accepted by the Spoiler component. It also spreads any native div HTML attributes
          onto the underlying container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="spoiler-page__section" id="accessibility">
        <h2 className="spoiler-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="spoiler-page__section-desc">
          Built with progressive disclosure accessibility patterns in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="spoiler-page__a11y-list">
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Toggle button is focusable and activates on <code className="spoiler-page__a11y-key">Enter</code> and <code className="spoiler-page__a11y-key">Space</code>.
              </span>
            </li>
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Uses <code className="spoiler-page__a11y-key">aria-expanded</code> on the toggle button to announce state to screen readers.
              </span>
            </li>
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="spoiler-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="spoiler-page__a11y-key">prefers-reduced-motion</code> — transitions are disabled when the user prefers reduced motion.
              </span>
            </li>
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Toggle button meets WCAG AA contrast ratio (4.5:1) against all surface backgrounds.
              </span>
            </li>
            <li className="spoiler-page__a11y-item">
              <span className="spoiler-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Toggle button enforces 44px minimum touch target on coarse pointer devices.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ─────────────────────────────────── */}
      <section className="spoiler-page__section" id="source">
        <h2 className="spoiler-page__section-title"><a href="#source">Source</a></h2>
        <p className="spoiler-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="spoiler-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/spoiler.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/spoiler.tsx (Standard)
          </a>
          <a className="spoiler-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/spoiler.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/spoiler.tsx (Lite)
          </a>
          <a className="spoiler-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/spoiler.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/spoiler.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
