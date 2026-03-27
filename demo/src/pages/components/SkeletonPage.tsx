'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Skeleton } from '@ui/components/skeleton'
import { Skeleton as LiteSkeleton } from '@ui/lite/skeleton'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.skeleton-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: skeleton-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .skeleton-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .skeleton-page__hero::before {
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
        animation: skeleton-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes skeleton-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton-page__hero::before { animation: none; }
      }

      .skeleton-page__title {
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

      .skeleton-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .skeleton-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .skeleton-page__import-code {
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

      .skeleton-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .skeleton-page__section {
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
        animation: skeleton-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes skeleton-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .skeleton-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .skeleton-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .skeleton-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .skeleton-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .skeleton-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .skeleton-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .skeleton-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .skeleton-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .skeleton-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .skeleton-page__playground {
          grid-template-columns: 1fr;
        }
        .skeleton-page__playground-controls {
          position: static !important;
        }
      }

      @container skeleton-page (max-width: 680px) {
        .skeleton-page__playground {
          grid-template-columns: 1fr;
        }
        .skeleton-page__playground-controls {
          position: static !important;
        }
      }

      .skeleton-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .skeleton-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .skeleton-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .skeleton-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .skeleton-page__playground-controls {
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

      .skeleton-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .skeleton-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .skeleton-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .skeleton-page__option-btn {
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
      .skeleton-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .skeleton-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .skeleton-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .skeleton-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .skeleton-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .skeleton-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .skeleton-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .skeleton-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Composition demo ──────────────────────────── */

      .skeleton-page__card-demo {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        align-items: flex-start;
      }

      .skeleton-page__card-demo-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .skeleton-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .skeleton-page__tier-card {
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

      .skeleton-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .skeleton-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .skeleton-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .skeleton-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .skeleton-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .skeleton-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .skeleton-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .skeleton-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .skeleton-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .skeleton-page__code-tabs {
        margin-block-start: 1rem;
      }

      .skeleton-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .skeleton-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .skeleton-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .skeleton-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .skeleton-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .skeleton-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ──────────────────────────────── */

      .skeleton-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .skeleton-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .skeleton-page__hero {
          padding: 2rem 1.25rem;
        }

        .skeleton-page__title {
          font-size: 1.75rem;
        }

        .skeleton-page__preview {
          padding: 1.75rem;
        }

        .skeleton-page__playground {
          grid-template-columns: 1fr;
        }

        .skeleton-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .skeleton-page__labeled-row {
          gap: 1rem;
        }

        .skeleton-page__tiers {
          grid-template-columns: 1fr;
        }

        .skeleton-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .skeleton-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .skeleton-page__hero {
          padding: 1.5rem 1rem;
        }

        .skeleton-page__title {
          font-size: 1.5rem;
        }

        .skeleton-page__preview {
          padding: 1rem;
        }

        .skeleton-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .skeleton-page__title {
          font-size: 4rem;
        }

        .skeleton-page__preview {
          padding: 3.5rem;
        }

        .skeleton-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .skeleton-page__import-code,
      .skeleton-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const skeletonProps: PropDef[] = [
  { name: 'variant', type: "'text' | 'circular' | 'rectangular'", default: "'text'", description: 'Shape variant. Text uses a thin line, circular is round, rectangular has rounded corners.' },
  { name: 'width', type: 'string | number', description: 'Custom inline-size. Numbers are converted to px.' },
  { name: 'height', type: 'string | number', description: 'Custom block-size. Numbers are converted to px.' },
  { name: 'lines', type: 'number', description: 'Number of text lines to render (only for text variant). Last line is 60% width.' },
  { name: 'animate', type: 'boolean', default: 'true', description: 'Enable shimmer animation. Respects prefers-reduced-motion.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. At 0, shimmer is disabled.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the underlying <div> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'text' | 'circular' | 'rectangular'

const VARIANTS: Variant[] = ['text', 'circular', 'rectangular']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Skeleton } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Skeleton } from '@annondeveloper/ui-kit'",
  premium: "import { Skeleton } from '@annondeveloper/ui-kit/premium'",
}

const P = 'skeleton-page__'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className={`${P}copy-btn`}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

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
    <div className={`${P}control-group`}>
      <span className={`${P}control-label`}>{label}</span>
      <div className={`${P}control-options`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${P}option-btn${opt === value ? ` ${P}option-btn--active` : ''}`}
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
    <label className={`${P}toggle-label`}>
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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  width: string,
  height: string,
  animate: boolean,
  lines: number | null,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (variant !== 'text') props.push(`  variant="${variant}"`)
  if (width) props.push(`  width="${width}"`)
  if (height) props.push(`  height="${height}"`)
  if (!animate && tier !== 'lite') props.push('  animate={false}')
  if (lines != null && lines > 0 && variant === 'text' && tier !== 'lite') props.push(`  lines={${lines}}`)

  const jsx = props.length === 0
    ? '<Skeleton />'
    : `<Skeleton\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, variant: Variant, width: string, height: string): string {
  const className = tier === 'lite' ? 'ui-lite-skeleton' : 'ui-skeleton'
  const style = [width ? `width: ${width}` : '', height ? `height: ${height}` : ''].filter(Boolean).join('; ')

  return `<!-- Skeleton — @annondeveloper/ui-kit ${tier} tier -->
<div
  class="${className}"
  data-variant="${variant}"
  aria-hidden="true"
  ${style ? `style="${style}"` : ''}
></div>`
}

function generateVueCode(tier: Tier, variant: Variant, width: string, height: string): string {
  if (tier === 'lite') {
    const style = [width ? `width: '${width}'` : '', height ? `height: '${height}'` : ''].filter(Boolean).join(', ')
    return `<template>
  <div
    class="ui-lite-skeleton"
    data-variant="${variant}"
    aria-hidden="true"
    ${style ? `:style="{ ${style} }"` : ''}
  />
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (variant !== 'text') props.push(`  variant="${variant}"`)
  if (width) props.push(`  width="${width}"`)
  if (height) props.push(`  height="${height}"`)

  return `<template>
  <Skeleton${props.length ? '\n' + props.join('\n') + '\n  ' : ' '}/>
</template>

<script setup>
import { Skeleton } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, width: string, height: string): string {
  const style = [width ? `width: ${width}` : '', height ? `height: ${height}` : ''].filter(Boolean).join('; ')

  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div
  class="ui-lite-skeleton"
  data-variant="${variant}"
  aria-hidden="true"
  ${style ? `style="${style}"` : ''}
></div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-skeleton"
  data-variant="${variant}"
  data-animate="true"
  aria-hidden="true"
  ${style ? `style="${style}"` : ''}
></div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/skeleton.css';`
}

function generateSvelteCode(tier: Tier, variant: Variant, width: string, height: string): string {
  if (tier === 'lite') {
    const style = [width ? `width: ${width}` : '', height ? `height: ${height}` : ''].filter(Boolean).join('; ')
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div
  class="ui-lite-skeleton"
  data-variant="${variant}"
  aria-hidden="true"
  ${style ? `style="${style}"` : ''}
></div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (variant !== 'text') props.push(`  variant="${variant}"`)
  if (width) props.push(`  width="${width}"`)
  if (height) props.push(`  height="${height}"`)

  return `<script>
  import { Skeleton } from '@annondeveloper/ui-kit'
</script>

<Skeleton${props.length ? '\n' + props.join('\n') + '\n' : ' '}/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('text')
  const [width, setWidth] = useState('200px')
  const [height, setHeight] = useState('40px')
  const [animate, setAnimate] = useState(true)
  const [lines, setLines] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, width, height, animate, lines > 0 ? lines : null),
    [tier, variant, width, height, animate, lines],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, variant, width, height),
    [tier, variant, width, height],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, width, height),
    [tier, variant, width, height],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, width, height),
    [tier, variant, width, height],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, width, height),
    [tier, variant, width, height],
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

  const showLines = variant === 'text' && tier !== 'lite' && lines > 0

  return (
    <section className={`${P}section`} id="playground">
      <h2 className={`${P}section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${P}section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${P}playground`}>
        <div className={`${P}playground-preview`}>
          <div className={`${P}playground-result`}>
            {tier === 'lite' ? (
              <LiteSkeleton
                variant={variant}
                width={width || undefined}
                height={height || undefined}
              />
            ) : showLines ? (
              <Skeleton
                variant="text"
                lines={lines}
                width={width || undefined}
                animate={animate}
              />
            ) : (
              <Skeleton
                variant={variant}
                width={width || undefined}
                height={height || undefined}
                animate={animate}
              />
            )}
          </div>

          <div className={`${P}code-tabs`}>
            <div className={`${P}export-row`}>
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
              {copyStatus && <span className={`${P}export-status`}>{copyStatus}</span>}
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

        <div className={`${P}playground-controls`}>
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />

          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Width</span>
            <input
              type="text"
              value={width}
              onChange={e => setWidth(e.target.value)}
              className={`${P}text-input`}
              placeholder="e.g. 200px, 100%, 20rem"
            />
          </div>

          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Height</span>
            <input
              type="text"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className={`${P}text-input`}
              placeholder="e.g. 40px, 3rem"
            />
          </div>

          {tier !== 'lite' && variant === 'text' && (
            <div className={`${P}control-group`}>
              <span className={`${P}control-label`}>Lines (multi-line)</span>
              <input
                type="number"
                min={0}
                max={10}
                value={lines}
                onChange={e => {
                  const v = Number(e.target.value)
                  if (v >= 0 && v <= 10) setLines(v)
                }}
                className={`${P}text-input`}
              />
            </div>
          )}

          {tier !== 'lite' && (
            <div className={`${P}control-group`}>
              <span className={`${P}control-label`}>Toggles</span>
              <Toggle label="Animate shimmer" checked={animate} onChange={setAnimate} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SkeletonPage() {
  useStyles('skeleton-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.skeleton-page__section')
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

  // Premium tier available at @annondeveloper/ui-kit/premium
  const SkeletonComponent = tier === 'lite' ? LiteSkeleton : Skeleton

  return (
    <div className="skeleton-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className={`${P}hero`}>
        <h1 className={`${P}title`}>Skeleton</h1>
        <p className={`${P}desc`}>
          Loading placeholder with shimmer animation in three variants: text, circular, and rectangular.
          Ships in two weight tiers with aurora-colored shimmer and multi-line text support.
        </p>
        <div className={`${P}import-row`}>
          <code className={`${P}import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ────────────────────────────────── */}
      <section className={`${P}section`} id="variants">
        <h2 className={`${P}section-title`}>
          <a href="#variants">Variants</a>
        </h2>
        <p className={`${P}section-desc`}>
          Three built-in shape variants to match the content being loaded.
        </p>
        <div className={`${P}preview`}>
          <div className={`${P}labeled-row`} style={{ gap: '2rem' }}>
            <div className={`${P}labeled-item`}>
              <SkeletonComponent variant="text" width="160px" />
              <span className={`${P}item-label`}>text</span>
            </div>
            <div className={`${P}labeled-item`}>
              <SkeletonComponent variant="circular" width={48} height={48} />
              <span className={`${P}item-label`}>circular</span>
            </div>
            <div className={`${P}labeled-item`}>
              <SkeletonComponent variant="rectangular" width={160} height={80} />
              <span className={`${P}item-label`}>rectangular</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Multi-line Text ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="multiline">
          <h2 className={`${P}section-title`}>
            <a href="#multiline">Multi-line Text</a>
          </h2>
          <p className={`${P}section-desc`}>
            Use the lines prop to render multiple text skeleton lines. The last line automatically renders at 60% width for a natural paragraph appearance.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '2rem' }}>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Skeleton variant="text" lines={2} width="100%" />
              <span className={`${P}item-label`}>lines=2</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Skeleton variant="text" lines={3} width="100%" />
              <span className={`${P}item-label`}>lines=3</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Skeleton variant="text" lines={5} width="100%" />
              <span className={`${P}item-label`}>lines=5</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Animation Control ──────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="animation">
          <h2 className={`${P}section-title`}>
            <a href="#animation">Animation Control</a>
          </h2>
          <p className={`${P}section-desc`}>
            The shimmer animation uses aurora-colored gradients and respects prefers-reduced-motion.
            Disable animation with the animate prop or motion level.
          </p>
          <div className={`${P}preview`} style={{ gap: '2rem' }}>
            <div className={`${P}labeled-item`}>
              <Skeleton variant="rectangular" width={160} height={60} animate />
              <span className={`${P}item-label`}>animated</span>
            </div>
            <div className={`${P}labeled-item`}>
              <Skeleton variant="rectangular" width={160} height={60} animate={false} />
              <span className={`${P}item-label`}>static</span>
            </div>
            <div className={`${P}labeled-item`}>
              <Skeleton variant="rectangular" width={160} height={60} motion={0} />
              <span className={`${P}item-label`}>motion=0</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Composition Examples ──────────────────── */}
      <section className={`${P}section`} id="composition">
        <h2 className={`${P}section-title`}>
          <a href="#composition">Composition Examples</a>
        </h2>
        <p className={`${P}section-desc`}>
          Combine skeleton variants to create realistic loading placeholders that match your content layout.
        </p>
        <div className={`${P}preview ${P}preview--col`} style={{ gap: '1.5rem', width: '100%' }}>
          {/* Card skeleton */}
          <div className={`${P}card-demo`}>
            {tier === 'lite' ? (
              <>
                <LiteSkeleton variant="circular" width={48} height={48} />
                <div className={`${P}card-demo-body`}>
                  <LiteSkeleton variant="text" width="60%" height="0.75em" />
                  <LiteSkeleton variant="text" width="80%" height="0.75em" />
                  <LiteSkeleton variant="text" width="40%" height="0.75em" />
                </div>
              </>
            ) : (
              <>
                <Skeleton variant="circular" width={48} height={48} />
                <div className={`${P}card-demo-body`}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" lines={2} width="100%" />
                </div>
              </>
            )}
          </div>

          {/* Media card skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '280px', maxWidth: '100%' }}>
            {tier === 'lite' ? (
              <>
                <LiteSkeleton variant="rectangular" width="100%" height="160px" />
                <LiteSkeleton variant="text" width="70%" height="0.75em" />
                <LiteSkeleton variant="text" width="90%" height="0.75em" />
              </>
            ) : (
              <>
                <Skeleton variant="rectangular" width="100%" height="160px" />
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" lines={2} width="100%" />
              </>
            )}
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`{/* User card skeleton */}
<div style={{ display: 'flex', gap: '1rem' }}>
  <Skeleton variant="circular" width={48} height={48} />
  <div style={{ flex: 1 }}>
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" lines={2} />
  </div>
</div>

{/* Media card skeleton */}
<div style={{ width: 280 }}>
  <Skeleton variant="rectangular" width="100%" height={160} />
  <Skeleton variant="text" width="70%" />
  <Skeleton variant="text" lines={2} />
</div>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className={`${P}section`} id="tiers">
        <h2 className={`${P}section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${P}section-desc`}>
          Choose the right balance of features and bundle size. Skeleton ships as Lite (CSS-only) and Standard (full-featured).
          Premium adds aurora glow effects and spring animations.
        </p>

        <div className={`${P}tiers`}>
          {/* Lite */}
          <div
            className={`${P}tier-card${tier === 'lite' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Lite</span>
              <span className={`${P}tier-size`}>~0.3 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              CSS-only skeleton. Three variants with basic styling. No shimmer animation, no multi-line support, no motion control.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Skeleton {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${P}tier-preview`}>
              <LiteSkeleton variant="rectangular" width={120} height={40} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`${P}tier-card${tier === 'standard' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Standard</span>
              <span className={`${P}tier-size`}>~1.2 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Full-featured skeleton with aurora shimmer animation, multi-line text, motion control, and comprehensive accessibility support.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Skeleton {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${P}tier-preview`}>
              <Skeleton variant="rectangular" width={120} height={40} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`${P}tier-card${tier === 'premium' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Premium</span>
              <span className={`${P}tier-size`}>~3-5 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Skeleton {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${P}tier-preview`}>
              <Skeleton variant="rectangular" width={120} height={40} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className={`${P}section`} id="props">
        <h2 className={`${P}section-title`}>
          <a href="#props">Props API</a>
        </h2>
        <p className={`${P}section-desc`}>
          All props accepted by Skeleton. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={skeletonProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className={`${P}section`} id="accessibility">
        <h2 className={`${P}section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${P}section-desc`}>
          Skeleton is a decorative placeholder that should be invisible to assistive technology.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${P}a11y-list`}>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden from screen readers:</strong> Uses <code className={`${P}a11y-key`}>aria-hidden="true"</code> to prevent screen reader announcement of loading shapes.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Shimmer animation respects <code className={`${P}a11y-key`}>prefers-reduced-motion</code> and motion level settings.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced data:</strong> Shimmer disabled under <code className={`${P}a11y-key`}>prefers-reduced-data: reduce</code> to save bandwidth.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Visible borders under <code className={`${P}a11y-key`}>forced-colors: active</code> so loading areas remain perceptible.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Shows a 1px border outline and disables shimmer animation for clean print output.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Companion pattern:</strong> Pair with a <code className={`${P}a11y-key`}>aria-busy="true"</code> container and <code className={`${P}a11y-key`}>aria-live="polite"</code> for screen reader loading announcements.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
