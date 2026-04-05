'use client'

import { useState, useEffect, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Cropper, type CropResult } from '@ui/domain/cropper'
import { Cropper as LiteCropper } from '@ui/lite/cropper'
import { Cropper as PremiumCropper } from '@ui/premium/cropper'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'src', type: 'string', required: true, description: 'URL or data URI of the image to crop.' },
  { name: 'aspectRatio', type: 'number', description: 'Fixed aspect ratio (width/height). Omit for free-form cropping.' },
  { name: 'minWidth', type: 'number', description: 'Minimum crop width in pixels.' },
  { name: 'minHeight', type: 'number', description: 'Minimum crop height in pixels.' },
  { name: 'maxWidth', type: 'number', description: 'Maximum crop width in pixels.' },
  { name: 'maxHeight', type: 'number', description: 'Maximum crop height in pixels.' },
  { name: 'onCrop', type: '(result: CropResult) => void', description: 'Called when the crop area changes. Receives { x, y, width, height, rotation, zoom }.' },
  { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show rule-of-thirds grid overlay inside the crop area.' },
  { name: 'showZoom', type: 'boolean', default: 'true', description: 'Show the zoom slider control.' },
  { name: 'showRotate', type: 'boolean', default: 'true', description: 'Show the rotation slider control.' },
  { name: 'rounded', type: 'boolean', default: 'false', description: 'Clip the crop preview as a circle (for avatars).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for transitions and handle interactions.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.cropper-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .cropper-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .cropper-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .cropper-page__hero::before { animation: none; } }

      .cropper-page__title {
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

      .cropper-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .cropper-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .cropper-page__import-code {
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

      .cropper-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .cropper-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .cropper-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .cropper-page__section-title a { color: inherit; text-decoration: none; }
      .cropper-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .cropper-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .cropper-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .cropper-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .cropper-page__result {
        margin-block-start: 1rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        background: oklch(0% 0 0 / 0.15);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.5rem;
      }

      .cropper-page__result-item {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .cropper-page__result-label {
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
        font-weight: 600;
      }

      .cropper-page__ratio-btns {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-block-end: 1rem;
      }

      /* ── Tiers ───────────────────────────────── */

      .cropper-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .cropper-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .cropper-page__tier-card:hover { border-color: var(--border-default); }
      .cropper-page__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

      .cropper-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .cropper-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .cropper-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .cropper-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .cropper-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }

      .cropper-page__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      @container (max-width: 640px) {
        .cropper-page__tiers { grid-template-columns: 1fr; }
      }

      /* ── Playground ─────────────────────────────────── */

      .cropper-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .cropper-page__playground { grid-template-columns: 1fr; }
        .cropper-page__playground-controls { position: static !important; }
      }

      @container (max-width: 680px) {
        .cropper-page__playground { grid-template-columns: 1fr; }
        .cropper-page__playground-controls { position: static !important; }
      }

      .cropper-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .cropper-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .cropper-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .cropper-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .cropper-page__playground-controls {
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

      .cropper-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .cropper-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .cropper-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .cropper-page__option-btn {
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
      .cropper-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .cropper-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .cropper-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .cropper-page__code-tabs {
        margin-block-start: 1rem;
      }

      .cropper-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .cropper-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .cropper-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .cropper-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .cropper-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .cropper-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }
    }
  }
`

const IMPORT_STR = "import { Cropper, type CropResult } from '@ui/domain/cropper'"

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Cropper } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Cropper, type CropResult } from '@annondeveloper/ui-kit'",
  premium: "import { Cropper, type CropResult } from '@annondeveloper/ui-kit/premium'",
}

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
    <div className="cropper-page__control-group">
      <span className="cropper-page__control-label">{label}</span>
      <div className="cropper-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`cropper-page__option-btn${opt === value ? ' cropper-page__option-btn--active' : ''}`}
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
    <label className="cropper-page__toggle-label">
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

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  aspectRatioLabel: string,
  aspectRatio: number | undefined,
  showGrid: boolean,
  showZoom: boolean,
  showRotate: boolean,
  rounded: boolean,
  motion: 0 | 1 | 2 | 3,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const props: string[] = ['  src={imageSrc}']
    if (aspectRatio !== undefined) props.push(`  aspectRatio={${aspectRatio}}`)
    if (rounded) props.push('  rounded')
    return `${importStr}

<Cropper
${props.join('\n')}
/>`
  }

  const props: string[] = ['  src={imageSrc}']
  if (aspectRatio !== undefined) props.push(`  aspectRatio={${aspectRatio}} /* ${aspectRatioLabel} */`)
  if (showGrid) props.push('  showGrid')
  if (showZoom) props.push('  showZoom')
  if (showRotate) props.push('  showRotate')
  if (rounded) props.push('  rounded')
  if (motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  onCrop={(result) => console.log(result)}')

  return `${importStr}

<Cropper
${props.join('\n')}
/>`
}

function generateHtmlCode(
  tier: Tier,
  aspectRatio: number | undefined,
  rounded: boolean,
): string {
  const className = tier === 'lite' ? 'ui-lite-cropper' : 'ui-cropper'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  return `<!-- Cropper — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/cropper.css'}">

<div class="${className}"${aspectRatio ? ` data-aspect-ratio="${aspectRatio}"` : ''}${rounded ? ' data-rounded' : ''}>
  <img src="your-image.jpg" alt="Image to crop" />
</div>`
}

function generateVueCode(
  tier: Tier,
  aspectRatio: number | undefined,
  showGrid: boolean,
  showZoom: boolean,
  showRotate: boolean,
  rounded: boolean,
): string {
  if (tier === 'lite') {
    return `<template>
  <Cropper src="/image.jpg"${aspectRatio ? ` :aspect-ratio="${aspectRatio}"` : ''}${rounded ? ' rounded' : ''} />
</template>

<script setup>
import { Cropper } from '@annondeveloper/ui-kit/lite'
</script>`
  }

  const attrs: string[] = ['    src="/image.jpg"']
  if (aspectRatio) attrs.push(`    :aspect-ratio="${aspectRatio}"`)
  if (showGrid) attrs.push('    show-grid')
  if (showZoom) attrs.push('    show-zoom')
  if (showRotate) attrs.push('    show-rotate')
  if (rounded) attrs.push('    rounded')
  attrs.push('    @crop="onCrop"')

  return `<template>
  <Cropper
${attrs.join('\n')}
  />
</template>

<script setup>
import { Cropper } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'

function onCrop(result) {
  console.log(result)
}
</script>`
}

function generateAngularCode(
  tier: Tier,
  aspectRatio: number | undefined,
  showGrid: boolean,
  showZoom: boolean,
  showRotate: boolean,
  rounded: boolean,
): string {
  const attrs: string[] = ['  src="/image.jpg"']
  if (aspectRatio) attrs.push(`  [aspectRatio]="${aspectRatio}"`)
  if (showGrid) attrs.push('  [showGrid]="true"')
  if (showZoom) attrs.push('  [showZoom]="true"')
  if (showRotate) attrs.push('  [showRotate]="true"')
  if (rounded) attrs.push('  [rounded]="true"')
  if (tier !== 'lite') attrs.push('  (crop)="onCrop($event)"')

  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'

  return `<!-- Angular — ${tierLabel} tier -->
@import '@annondeveloper/ui-kit/css/components/cropper.css';

<ui-cropper
${attrs.join('\n')}
></ui-cropper>`
}

function generateSvelteCode(
  tier: Tier,
  aspectRatio: number | undefined,
  showGrid: boolean,
  showZoom: boolean,
  showRotate: boolean,
  rounded: boolean,
): string {
  if (tier === 'lite') {
    return `<script>
  import { Cropper } from '@annondeveloper/ui-kit/lite'
</script>

<Cropper src="/image.jpg"${aspectRatio ? ` aspectRatio={${aspectRatio}}` : ''}${rounded ? ' rounded' : ''} />`
  }

  const attrs: string[] = ['  src="/image.jpg"']
  if (aspectRatio) attrs.push(`  aspectRatio={${aspectRatio}}`)
  if (showGrid) attrs.push('  showGrid')
  if (showZoom) attrs.push('  showZoom')
  if (showRotate) attrs.push('  showRotate')
  if (rounded) attrs.push('  rounded')
  attrs.push('  on:crop={handleCrop}')

  return `<script>
  import { Cropper } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'

  function handleCrop(e) {
    console.log(e.detail)
  }
</script>

<Cropper
${attrs.join('\n')}
/>`
}

// A placeholder SVG image encoded as a data URI
const SAMPLE_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#1a1a2e"/>
    <circle cx="200" cy="180" r="80" fill="#e94560" opacity="0.8"/>
    <circle cx="400" cy="300" r="120" fill="#0f3460" opacity="0.7"/>
    <circle cx="600" cy="200" r="60" fill="#533483" opacity="0.6"/>
    <rect x="100" y="400" width="600" height="120" rx="12" fill="#16213e" opacity="0.5"/>
    <text x="400" y="470" text-anchor="middle" fill="#e0e0e0" font-size="24" font-family="system-ui">Sample Image</text>
  </svg>`
)

const ASPECT_RATIO_OPTIONS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
] as const

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const ActiveCropper = tier === 'lite' ? LiteCropper : tier === 'premium' ? PremiumCropper : Cropper

  const [aspectRatioIdx, setAspectRatioIdx] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [showZoom, setShowZoom] = useState(true)
  const [showRotate, setShowRotate] = useState(true)
  const [rounded, setRounded] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const selectedRatio = ASPECT_RATIO_OPTIONS[aspectRatioIdx]
  const aspectRatio = selectedRatio.value
  const aspectLabel = selectedRatio.label

  const reactCode = useMemo(
    () => generateReactCode(tier, aspectLabel, aspectRatio, showGrid, showZoom, showRotate, rounded, motion),
    [tier, aspectLabel, aspectRatio, showGrid, showZoom, showRotate, rounded, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(tier, aspectRatio, rounded),
    [tier, aspectRatio, rounded],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, aspectRatio, showGrid, showZoom, showRotate, rounded),
    [tier, aspectRatio, showGrid, showZoom, showRotate, rounded],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, aspectRatio, showGrid, showZoom, showRotate, rounded),
    [tier, aspectRatio, showGrid, showZoom, showRotate, rounded],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, aspectRatio, showGrid, showZoom, showRotate, rounded),
    [tier, aspectRatio, showGrid, showZoom, showRotate, rounded],
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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  return (
    <section className="cropper-page__section" id="playground">
      <h2 className="cropper-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="cropper-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="cropper-page__playground">
        {/* Preview area */}
        <div className="cropper-page__playground-preview">
          <div className="cropper-page__playground-result">
            <ActiveCropper
              src={SAMPLE_IMAGE}
              aspectRatio={aspectRatio}
              showGrid={showGrid}
              showZoom={showZoom}
              showRotate={showRotate}
              rounded={rounded}
              {...(tier !== 'lite' ? { motion } : {})}
              style={{ inlineSize: '100%', position: 'relative', zIndex: 1 }}
            />
          </div>

          {/* Tabbed code output */}
          <div className="cropper-page__code-tabs">
            <div className="cropper-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="cropper-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
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
        <div className="cropper-page__playground-controls">
          <OptionGroup
            label="Aspect Ratio"
            options={ASPECT_RATIO_OPTIONS.map(r => r.label) as unknown as readonly string[]}
            value={aspectLabel}
            onChange={v => {
              const idx = ASPECT_RATIO_OPTIONS.findIndex(r => r.label === v)
              if (idx >= 0) setAspectRatioIdx(idx)
            }}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="cropper-page__control-group">
            <span className="cropper-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Show grid" checked={showGrid} onChange={setShowGrid} />}
              {tier !== 'lite' && <Toggle label="Show zoom" checked={showZoom} onChange={setShowZoom} />}
              {tier !== 'lite' && <Toggle label="Show rotate" checked={showRotate} onChange={setShowRotate} />}
              <Toggle label="Rounded (avatar)" checked={rounded} onChange={setRounded} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CropperPage() {
  useStyles('cropper-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveCropper = tier === 'lite' ? LiteCropper : tier === 'premium' ? PremiumCropper : Cropper

  const [cropResult, setCropResult] = useState<CropResult | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined)

  const RATIOS: { label: string; value: number | undefined }[] = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:2', value: 3 / 2 },
  ]

  useEffect(() => {
    const sections = document.querySelectorAll('.cropper-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="cropper-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="cropper-page__hero">
        <h1 className="cropper-page__title">Cropper</h1>
        <p className="cropper-page__desc">
          Interactive image cropper with drag-to-select, resize handles, zoom and rotation controls,
          and optional aspect ratio locking. Ideal for avatar uploads and media editing.
        </p>
        <div className="cropper-page__import-row">
          <code className="cropper-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Free Crop with Aspect Ratio ────────────── */}
      <section className="cropper-page__section" id="basic">
        <h2 className="cropper-page__section-title"><a href="#basic">Crop with Aspect Ratio</a></h2>
        <p className="cropper-page__section-desc">
          Drag the handles to adjust the crop area. Toggle between free-form and fixed aspect ratios.
          The zoom and rotation sliders provide fine-grained control.
        </p>
        <div className="cropper-page__ratio-btns">
          {RATIOS.map(r => (
            <Button
              key={r.label}
              size="sm"
              variant={aspectRatio === r.value ? 'primary' : 'secondary'}
              onClick={() => setAspectRatio(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <div className="cropper-page__preview">
          <ActiveCropper
            src={SAMPLE_IMAGE}
            aspectRatio={aspectRatio}
            onCrop={setCropResult}
            showGrid
            showZoom
            showRotate
          />
          {cropResult && (
            <div className="cropper-page__result">
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">X</span>
                <span>{Math.round(cropResult.x)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Y</span>
                <span>{Math.round(cropResult.y)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Width</span>
                <span>{Math.round(cropResult.width)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Height</span>
                <span>{Math.round(cropResult.height)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Rotation</span>
                <span>{Math.round(cropResult.rotation)}&deg;</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Zoom</span>
                <span>{cropResult.zoom.toFixed(2)}x</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Avatar (Rounded) ───────────────────────── */}
      <section className="cropper-page__section" id="avatar">
        <h2 className="cropper-page__section-title"><a href="#avatar">Avatar Mode</a></h2>
        <p className="cropper-page__section-desc">
          Enable <code>rounded</code> for a circular crop preview, perfect for profile picture uploads.
          Combined with a 1:1 aspect ratio for consistent output.
        </p>
        <div className="cropper-page__preview">
          <ActiveCropper
            src={SAMPLE_IMAGE}
            aspectRatio={1}
            rounded
            showZoom
            showRotate={false}
            showGrid={false}
          />
        </div>
      </section>

      {/* ── Playground ──────────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── Tiers ─────────────────────────────────────── */}
      <section className="cropper-page__section" id="tiers">
        <h2 className="cropper-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="cropper-page__section-desc">
          Three tiers balance interactivity and bundle size. Lite renders a static image display
          with optional aspect ratio and rounded clipping — no drag, no sliders, no state;
          Standard provides the full interactive cropper with drag handles, zoom and rotation sliders,
          rule-of-thirds grid, and onCrop callbacks; Premium wraps Standard with spring-physics handle
          animations, aurora glow on the crop overlay, and motion-level-aware degradation.
        </p>
        <div className="cropper-page__tiers">
          {/* Lite */}
          <div className={`cropper-page__tier-card${tier === 'lite' ? ' cropper-page__tier-card--active' : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="cropper-page__tier-header">
              <span className="cropper-page__tier-name">Lite</span>
              <span className="cropper-page__tier-size">~0.3 KB gzip</span>
            </div>
            <p className="cropper-page__tier-desc">
              Static image display with optional aspect ratio constraint and rounded clip. Supports
              src, aspectRatio, and rounded only. No interactivity, no sliders, no onCrop callback.
            </p>
            <div className="cropper-page__tier-import">
              import {'{'} Cropper {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="cropper-page__tier-preview">
              <LiteCropper src={SAMPLE_IMAGE} aspectRatio={16 / 9} />
            </div>
          </div>

          {/* Standard */}
          <div className={`cropper-page__tier-card${tier === 'standard' ? ' cropper-page__tier-card--active' : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="cropper-page__tier-header">
              <span className="cropper-page__tier-name">Standard</span>
              <span className="cropper-page__tier-size">~5.4 KB gzip</span>
            </div>
            <p className="cropper-page__tier-desc">
              Full interactive cropper with drag-to-select, resize handles, zoom and rotation sliders,
              optional rule-of-thirds grid, aspect ratio locking, and onCrop callback.
            </p>
            <div className="cropper-page__tier-import">
              import {'{'} Cropper {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="cropper-page__tier-preview">
              <Cropper src={SAMPLE_IMAGE} aspectRatio={16 / 9} showGrid showZoom />
            </div>
          </div>

          {/* Premium */}
          <div className={`cropper-page__tier-card${tier === 'premium' ? ' cropper-page__tier-card--active' : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="cropper-page__tier-header">
              <span className="cropper-page__tier-name">Premium</span>
              <span className="cropper-page__tier-size">~5.8 KB gzip</span>
            </div>
            <p className="cropper-page__tier-desc">
              Wraps Standard with spring-physics resize handle animations, aurora glow on the
              crop overlay boundary, smooth spring transitions on zoom and rotation, and
              motion-level-aware degradation.
            </p>
            <div className="cropper-page__tier-import">
              import {'{'} Cropper {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="cropper-page__tier-preview">
              <PremiumCropper src={SAMPLE_IMAGE} aspectRatio={16 / 9} showGrid showZoom />
            </div>
          </div>
        </div>
      </section>

      {/* ── Accessibility ────────────────────────────── */}
      <section className="cropper-page__section" id="accessibility">
        <h2 className="cropper-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="cropper-page__section-desc">
          Built with keyboard support, ARIA labels, and motion sensitivity for an inclusive cropping experience.
        </p>
        <Card variant="default" padding="md">
          <ul className="cropper-page__a11y-list">
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Crop handles are focusable and can be moved with arrow keys for precise adjustments.
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA labels:</strong> Zoom and rotation sliders use <code className="cropper-page__a11y-key">aria-label</code> and <code className="cropper-page__a11y-key">aria-valuetext</code> for screen reader output.
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus indicators:</strong> Visible focus rings via <code className="cropper-page__a11y-key">:focus-visible</code> on all interactive handles and controls.
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Resize handles meet the 44px minimum touch target size for mobile accessibility.
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Grid overlay and handle colors meet WCAG AA contrast ratio (3:1 UI).
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Animations respect <code className="cropper-page__a11y-key">prefers-reduced-motion</code> and the <code className="cropper-page__a11y-key">motion</code> prop.
              </span>
            </li>
            <li className="cropper-page__a11y-item">
              <span className="cropper-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="cropper-page__a11y-key">forced-colors: active</code> with visible crop boundaries.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Brand Color ──────────────────────────────── */}
      <section className="cropper-page__section" id="brand-color">
        <h2 className="cropper-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="cropper-page__section-desc">
          The Cropper handle colors and focus rings adapt to your brand color via OKLCH tokens.
          Use the <code>ColorInput</code> component or <code>generateTheme()</code> to set a custom brand.
        </p>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="cropper-page__section" id="props">
        <h2 className="cropper-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>

      {/* ── Source ────────────────────────────────────── */}
      <section className="cropper-page__section" id="source">
        <h2 className="cropper-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="cropper-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/cropper.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--brand)', textDecoration: 'none' }}
          >
            <Icon name="code" size="sm" />
            src/domain/cropper.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/cropper.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--brand)', textDecoration: 'none' }}
          >
            <Icon name="code" size="sm" />
            src/lite/cropper.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/cropper.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--brand)', textDecoration: 'none' }}
          >
            <Icon name="code" size="sm" />
            src/premium/cropper.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
