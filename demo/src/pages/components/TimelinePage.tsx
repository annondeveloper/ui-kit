'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Timeline } from '@ui/components/timeline'
import { Timeline as LiteTimeline } from '@ui/lite/timeline'
import { Timeline as PremiumTimeline } from '@ui/premium/timeline'
import { Card } from '@ui/components/card'
import { Button } from '@ui/components/button'
import { Icon } from '@ui/core/icons/icon'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'alternate' | 'compact'
type Size = 'sm' | 'md' | 'lg'
type ConnectorStyle = 'solid' | 'dashed' | 'dotted'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.timeline-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: timeline-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .timeline-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .timeline-page__hero::before {
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
        animation: aurora-spin-tl 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-tl {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .timeline-page__hero::before { animation: none; }
      }

      .timeline-page__title {
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

      .timeline-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .timeline-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .timeline-page__import-code {
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

      .timeline-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-tl 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-tl {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .timeline-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .timeline-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .timeline-page__section-title a { color: inherit; text-decoration: none; }
      .timeline-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .timeline-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .timeline-page__preview {
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

      .timeline-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .timeline-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .timeline-page__preview--side-by-side {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
      }

      @container timeline-page (max-width: 600px) {
        .timeline-page__preview--side-by-side {
          grid-template-columns: 1fr;
        }
      }

      /* ── Playground ─────────────────────────────────── */

      .timeline-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container timeline-page (max-width: 700px) {
        .timeline-page__playground {
          grid-template-columns: 1fr;
        }
        .timeline-page__playground-controls {
          order: -1;
        }
      }

      .timeline-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .timeline-page__playground-result {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        border: 1px solid var(--border-subtle);
        position: relative;
        min-block-size: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .timeline-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .timeline-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 50%, oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04) 0%, transparent 70%);
        pointer-events: none;
      }

      .timeline-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: var(--bg-base);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
      }

      .timeline-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .timeline-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .timeline-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .timeline-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
      }

      .timeline-page__option-btn:hover {
        border-color: var(--brand);
        color: var(--text-primary);
      }

      .timeline-page__option-btn--active {
        background: var(--brand);
        border-color: var(--brand);
        color: oklch(100% 0 0);
      }

      .timeline-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .timeline-page__code-tabs {
        margin-block-start: 1rem;
      }

      .timeline-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-end: 0.5rem;
      }

      .timeline-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: oklch(72% 0.19 145);
        font-weight: 500;
      }

      /* ── Accessibility ─────────────────────────────── */

      .timeline-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .timeline-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .timeline-page__a11y-icon {
        color: oklch(72% 0.19 145);
        flex-shrink: 0;
        margin-block-start: 0.15rem;
      }

      .timeline-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
        border: 1px solid oklch(100% 0 0 / 0.06);
      }
    }
  }
`

// ─── Import Strings ──────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Timeline } from '@annondeveloper/ui-kit'",
  lite: "import { Timeline } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Timeline } from '@annondeveloper/ui-kit/premium'",
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DEPLOY_ITEMS = [
  { id: 'push', title: 'Code pushed', description: 'Pushed 3 commits to main', status: 'completed' as const, timestamp: '10:30 AM' },
  { id: 'test', title: 'Tests passed', description: 'All 247 tests passed', status: 'completed' as const, timestamp: '10:32 AM' },
  { id: 'build', title: 'Building', description: 'Docker image building...', status: 'active' as const, timestamp: '10:34 AM' },
  { id: 'staging', title: 'Deploy to staging', description: 'Waiting for build', status: 'pending' as const },
  { id: 'prod', title: 'Deploy to production', description: 'Requires manual approval', status: 'pending' as const },
]

const INCIDENT_ITEMS = [
  { id: 'detect', title: 'Incident detected', description: 'CPU usage exceeded 95%', status: 'error' as const, timestamp: '14:02' },
  { id: 'alert', title: 'Alert triggered', description: 'PagerDuty notification sent', status: 'active' as const, timestamp: '14:03' },
  { id: 'investigate', title: 'Investigation started', description: 'On-call engineer assigned', status: 'completed' as const, timestamp: '14:05' },
  { id: 'rootcause', title: 'Root cause identified', description: 'Memory leak in worker pool', status: 'completed' as const, timestamp: '14:22' },
  { id: 'fix', title: 'Fix deployed', description: 'Hotfix merged and deployed', status: 'completed' as const, timestamp: '14:45' },
]

const PLAYGROUND_ITEMS = [
  { id: 'step1', title: 'Initialize project', description: 'Set up repository and install dependencies', status: 'completed' as const, timestamp: '09:00' },
  { id: 'step2', title: 'Design system', description: 'Create wireframes and design tokens', status: 'completed' as const, timestamp: '09:30' },
  { id: 'step3', title: 'Build components', description: 'Implement core component library', status: 'active' as const, timestamp: '10:15' },
  { id: 'step4', title: 'Write tests', description: 'Unit and integration test coverage', status: 'pending' as const },
  { id: 'step5', title: 'Ship to production', description: 'Final deploy and monitoring', status: 'pending' as const },
]

const VARIANTS: readonly Variant[] = ['default', 'alternate', 'compact'] as const
const SIZES: readonly Size[] = ['sm', 'md', 'lg'] as const
const CONNECTOR_STYLES: readonly ConnectorStyle[] = ['solid', 'dashed', 'dotted'] as const

const propsData: PropDef[] = [
  { name: 'items', type: 'TimelineItem[]', required: true, description: 'Array of timeline items to render.' },
  { name: 'variant', type: "'default' | 'alternate' | 'compact'", default: "'default'", description: 'Layout variant. Alternate places items on alternating sides.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the size of icons and spacing.' },
  { name: 'connectorStyle', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Style of the connecting line between items.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

const timelineItemProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the timeline item.' },
  { name: 'title', type: 'ReactNode', required: true, description: 'Title text for the timeline item.' },
  { name: 'description', type: 'ReactNode', description: 'Optional helper text or detail below the title.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional leading icon element rendered in the dot.' },
  { name: 'timestamp', type: 'string', description: 'Optional timestamp string displayed alongside the item.' },
  { name: 'status', type: "'completed' | 'active' | 'pending' | 'error'", description: 'Visual status of the item.' },
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
    <div className="timeline-page__control-group">
      <span className="timeline-page__control-label">{label}</span>
      <div className="timeline-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`timeline-page__option-btn${opt === value ? ' timeline-page__option-btn--active' : ''}`}
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
    <label className="timeline-page__toggle-label">
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

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  connectorStyle: ConnectorStyle,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push('  items={items}')
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (connectorStyle !== 'solid') props.push(`  connectorStyle="${connectorStyle}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const itemsDecl = `const items = [
  { id: '1', title: 'Step one', description: 'First step', status: 'completed' },
  { id: '2', title: 'Step two', description: 'In progress', status: 'active' },
  { id: '3', title: 'Step three', description: 'Upcoming', status: 'pending' },
]`

  return `${importStr}\n\n${itemsDecl}\n\n<Timeline\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  variant: Variant,
  size: Size,
  connectorStyle: ConnectorStyle,
): string {
  return `<!-- HTML + CSS — Timeline -->
<div
  class="ui-timeline"
  data-variant="${variant}"
  data-size="${size}"
  data-connector="${connectorStyle}"
>
  <div class="ui-timeline__item" data-status="completed">
    <div class="ui-timeline__dot"></div>
    <div class="ui-timeline__content">
      <span class="ui-timeline__title">Step one</span>
      <span class="ui-timeline__desc">First step</span>
    </div>
  </div>
  <div class="ui-timeline__item" data-status="active">
    <div class="ui-timeline__dot"></div>
    <div class="ui-timeline__content">
      <span class="ui-timeline__title">Step two</span>
      <span class="ui-timeline__desc">In progress</span>
    </div>
  </div>
  <div class="ui-timeline__item" data-status="pending">
    <div class="ui-timeline__dot"></div>
    <div class="ui-timeline__content">
      <span class="ui-timeline__title">Step three</span>
      <span class="ui-timeline__desc">Upcoming</span>
    </div>
  </div>
</div>

<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/timeline.css" />`
}

function generateVueCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  connectorStyle: ConnectorStyle,
): string {
  if (tier === 'lite') {
    return `<template>
  <div
    class="ui-timeline"
    data-variant="${variant}"
    data-size="${size}"
    data-connector="${connectorStyle}"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="ui-timeline__item"
      :data-status="item.status"
    >
      <div class="ui-timeline__dot"></div>
      <div class="ui-timeline__content">
        <span class="ui-timeline__title">{{ item.title }}</span>
        <span class="ui-timeline__desc">{{ item.description }}</span>
      </div>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :items="items"']
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (connectorStyle !== 'solid') attrs.push(`  connectorStyle="${connectorStyle}"`)

  return `<template>
  <Timeline
${attrs.join('\n')}
  />
</template>

<script setup>
import { Timeline } from '${importPath}'

const items = [
  { id: '1', title: 'Step one', description: 'First step', status: 'completed' },
  { id: '2', title: 'Step two', description: 'In progress', status: 'active' },
  { id: '3', title: 'Step three', description: 'Upcoming', status: 'pending' },
]
</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  connectorStyle: ConnectorStyle,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div
  class="ui-timeline"
  [attr.data-variant]="'${variant}'"
  [attr.data-size]="'${size}'"
  [attr.data-connector]="'${connectorStyle}'"
>
  <div
    *ngFor="let item of items"
    class="ui-timeline__item"
    [attr.data-status]="item.status"
  >
    <div class="ui-timeline__dot"></div>
    <div class="ui-timeline__content">
      <span class="ui-timeline__title">{{ item.title }}</span>
      <span class="ui-timeline__desc">{{ item.description }}</span>
    </div>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-timeline"
  data-variant="${variant}"
  data-size="${size}"
  data-connector="${connectorStyle}"
>
  <div
    *ngFor="let item of items"
    class="ui-timeline__item"
    [attr.data-status]="item.status"
  >
    <div class="ui-timeline__dot"></div>
    <div class="ui-timeline__content">
      <span class="ui-timeline__title">{{ item.title }}</span>
      <span class="ui-timeline__desc">{{ item.description }}</span>
    </div>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/timeline.css';`
}

function generateSvelteCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  connectorStyle: ConnectorStyle,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div
  class="ui-timeline"
  data-variant="${variant}"
  data-size="${size}"
  data-connector="${connectorStyle}"
>
  {#each items as item (item.id)}
    <div class="ui-timeline__item" data-status={item.status}>
      <div class="ui-timeline__dot"></div>
      <div class="ui-timeline__content">
        <span class="ui-timeline__title">{item.title}</span>
        <span class="ui-timeline__desc">{item.description}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { Timeline } from '${importPath}';

  const items = [
    { id: '1', title: 'Step one', description: 'First step', status: 'completed' },
    { id: '2', title: 'Step two', description: 'In progress', status: 'active' },
    { id: '3', title: 'Step three', description: 'Upcoming', status: 'pending' },
  ];
</script>

<Timeline
  {items}
  variant="${variant}"
  size="${size}"
  connectorStyle="${connectorStyle}"
/>`
}

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [variant, setVariant] = useState<Variant>('default')
  const [size, setSize] = useState<Size>('md')
  const [connectorStyle, setConnectorStyle] = useState<ConnectorStyle>('solid')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [showTimestamps, setShowTimestamps] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const TimelineComponent = effectiveTier === 'lite'
    ? LiteTimeline
    : effectiveTier === 'premium'
      ? PremiumTimeline
      : Timeline

  const items = useMemo(() => {
    if (!showTimestamps) {
      return PLAYGROUND_ITEMS.map(({ timestamp, ...rest }) => rest)
    }
    return PLAYGROUND_ITEMS
  }, [showTimestamps])

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, size, connectorStyle, motion),
    [tier, variant, size, connectorStyle, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(variant, size, connectorStyle),
    [variant, size, connectorStyle],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, size, connectorStyle),
    [tier, variant, size, connectorStyle],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, size, connectorStyle),
    [tier, variant, size, connectorStyle],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, size, connectorStyle),
    [tier, variant, size, connectorStyle],
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

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  const previewProps: Record<string, unknown> = {
    items,
    variant,
    size,
    connectorStyle,
  }
  if (tier !== 'lite') {
    previewProps.motion = motion
  }

  return (
    <section className="timeline-page__section" id="playground">
      <h2 className="timeline-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="timeline-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="timeline-page__playground">
        {/* Preview area */}
        <div className="timeline-page__playground-preview">
          <div className="timeline-page__playground-result">
            <TimelineComponent {...previewProps as any} />
          </div>

          {/* Tabbed code output */}
          <div className="timeline-page__code-tabs">
            <div className="timeline-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="timeline-page__export-status">{copyStatus}</span>}
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
        <div className="timeline-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Connector" options={CONNECTOR_STYLES} value={connectorStyle} onChange={setConnectorStyle} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="timeline-page__control-group">
            <span className="timeline-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show timestamps" checked={showTimestamps} onChange={setShowTimestamps} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TimelinePage() {
  useStyles('timeline-page', pageStyles)
  const { tier } = useTier()

  const effectiveTier = tier
  const isLite = effectiveTier === 'lite'

  const TimelineComponent = isLite
    ? LiteTimeline
    : effectiveTier === 'premium'
      ? PremiumTimeline
      : Timeline

  useEffect(() => {
    const sections = document.querySelectorAll('.timeline-page__section')
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
    <div className="timeline-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="timeline-page__hero">
        <h1 className="timeline-page__title">Timeline</h1>
        <p className="timeline-page__desc">
          Vertical timeline for displaying sequential events with status indicators,
          timestamps, and connecting lines. Supports alternate and compact layouts
          with three weight tiers from lite to premium with aurora glow and spring animations.
        </p>
        <div className="timeline-page__import-row">
          <code className="timeline-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── Default Timeline ──────────────────────── */}
      <section className="timeline-page__section" id="default">
        <h2 className="timeline-page__section-title"><a href="#default">Deployment Pipeline</a></h2>
        <p className="timeline-page__section-desc">
          Default vertical timeline showing a deployment flow with completed, active, and pending steps.
          The active tier determines the visual treatment of status dots and connector lines.
        </p>
        <div className="timeline-page__preview timeline-page__preview--col">
          <TimelineComponent items={DEPLOY_ITEMS} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Timeline items={[
  { id: 'push', title: 'Code pushed', status: 'completed', timestamp: '10:30 AM' },
  { id: 'build', title: 'Building', status: 'active', timestamp: '10:34 AM' },
  { id: 'deploy', title: 'Deploy', status: 'pending' },
]} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── Variants ──────────────────────────────── */}
      <section className="timeline-page__section" id="variants">
        <h2 className="timeline-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="timeline-page__section-desc">
          Alternate layout places items on alternating sides. Compact reduces spacing for dense timelines.
        </p>
        <div className="timeline-page__preview timeline-page__preview--side-by-side">
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBlockEnd: '1rem', fontWeight: 600 }}>Alternate</p>
            <TimelineComponent items={INCIDENT_ITEMS} variant="alternate" />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBlockEnd: '1rem', fontWeight: 600 }}>Compact</p>
            <TimelineComponent items={INCIDENT_ITEMS} variant="compact" size="sm" />
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`// Alternate layout — items alternate left and right
<Timeline items={DEPLOY_ITEMS} variant="alternate" />

// Compact layout — reduced spacing for dense timelines
<Timeline items={DEPLOY_ITEMS} variant="compact" size="sm" />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── Line Styles ───────────────────────────── */}
      <section className="timeline-page__section" id="line-styles">
        <h2 className="timeline-page__section-title"><a href="#line-styles">Line Styles</a></h2>
        <p className="timeline-page__section-desc">
          Choose between solid, dashed, or dotted connecting lines to suit different content types.
        </p>
        <div className="timeline-page__preview timeline-page__preview--col" style={{ gap: '2rem' }}>
          {(['solid', 'dashed', 'dotted'] as const).map(style => (
            <div key={style}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem', fontFamily: 'monospace' }}>{style}</p>
              <TimelineComponent items={DEPLOY_ITEMS.slice(0, 3)} connectorStyle={style} variant="compact" size="sm" />
            </div>
          ))}
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`{(['solid', 'dashed', 'dotted'] as const).map(style => (
  <div key={style}>
    <span>{style}</span>
    <Timeline items={DEPLOY_ITEMS.slice(0, 3)} connectorStyle={style} />
  </div>
))}`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── Weight Tiers ──────────────────────────────────── */}
      <section className="timeline-page__section" id="tiers">
        <h2 className="timeline-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="timeline-page__section-desc">
          Timeline ships in three weight tiers to match your performance budget and feature needs.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with motion, theming, and accessibility.
            </p>
            <div className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0' }}>~3.2KB JS gzip + ~0.8KB CSS gzip</div>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Timeline {'}'} from '@annondeveloper/ui-kit'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal footprint, no motion or advanced theming. Wraps standard with motion=0.
            </p>
            <div className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0' }}>~1.8KB JS gzip + ~0.5KB CSS gzip</div>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Timeline {'}'} from '@annondeveloper/ui-kit/lite'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow, spring animations, shimmer connector, and staggered dot entrance.
            </p>
            <div className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0' }}>~4.1KB JS gzip + ~1.2KB CSS gzip</div>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Timeline {'}'} from '@annondeveloper/ui-kit/premium'</code>
          </Card>
        </div>
      </section>

      {/* ── Accessibility ─────────────────────────── */}
      <section className="timeline-page__section" id="accessibility">
        <h2 className="timeline-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="timeline-page__section-desc">
          Timeline is built with semantic HTML and WAI-ARIA best practices for assistive technology support.
        </p>
        <Card variant="default" padding="md">
          <ul className="timeline-page__a11y-list">
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic list:</strong> Renders as an ordered or unordered list structure for screen readers to announce item count and position.
              </span>
            </li>
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status indicators:</strong> Each item's status is conveyed via <code className="timeline-page__a11y-key">aria-label</code> on the dot, not color alone.
              </span>
            </li>
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Status dot colors meet WCAG AA contrast ratio (3:1 UI components) against both light and dark backgrounds.
              </span>
            </li>
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="timeline-page__a11y-key">prefers-reduced-motion</code> at all tiers. Premium animations disable gracefully.
              </span>
            </li>
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="timeline-page__a11y-key">forced-colors: active</code> — dots and connectors remain visible with system colors.
              </span>
            </li>
            <li className="timeline-page__a11y-item">
              <span className="timeline-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Timestamps:</strong> Associated with their items via DOM proximity for natural reading order.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Brand Color ──────────────────────────── */}
      <section className="timeline-page__section" id="brand-color">
        <h2 className="timeline-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="timeline-page__section-desc">
          Timeline inherits brand color from the theme. Override with a custom color to see how status dots and
          connectors adapt. The premium tier uses this color for aurora glow and shimmer effects.
        </p>
        <div className="timeline-page__preview">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Use the global ColorInput in the sidebar or UIProvider to change the brand color across all components.
          </p>
        </div>
      </section>

      {/* ── Source ────────────────────────────────── */}
      <section className="timeline-page__section" id="source">
        <h2 className="timeline-page__section-title">
          <a href="#source">Source Code</a>
        </h2>
        <p className="timeline-page__section-desc">
          View the component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/timeline.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand)', fontSize: 'var(--text-sm)', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}
          >
            Source — src/components/timeline.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/timeline.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand)', fontSize: 'var(--text-sm)', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}
          >
            Source — src/lite/timeline.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/timeline.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand)', fontSize: 'var(--text-sm)', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}
          >
            Source — src/premium/timeline.tsx
          </a>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="timeline-page__section" id="props">
        <h2 className="timeline-page__section-title"><a href="#props">Props API</a></h2>
        <p className="timeline-page__section-desc">
          All props accepted by the Timeline component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
        <h3 className="timeline-page__section-title" style={{ marginBlockStart: '1.5rem' }}>TimelineItem</h3>
        <p className="timeline-page__section-desc">Shape of each item in the <code>items</code> array.</p>
        <Card variant="default" padding="md">
          <PropsTable props={timelineItemProps} />
        </Card>
      </section>
    </div>
  )
}
