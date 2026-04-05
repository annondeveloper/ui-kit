'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SuccessCheckmark } from '@ui/components/success-checkmark'
import { SuccessCheckmark as LiteSuccessCheckmark } from '@ui/lite/success-checkmark'
import { SuccessCheckmark as PremiumSuccessCheckmark } from '@ui/premium/success-checkmark'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.success-checkmark-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: success-checkmark-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .success-checkmark-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .success-checkmark-page__hero::before {
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
        animation: success-checkmark-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes success-checkmark-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .success-checkmark-page__hero::before { animation: none; }
      }

      .success-checkmark-page__title {
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

      .success-checkmark-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .success-checkmark-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .success-checkmark-page__import-code {
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

      .success-checkmark-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .success-checkmark-page__section {
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
        animation: success-checkmark-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes success-checkmark-page-section-reveal {
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
        .success-checkmark-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .success-checkmark-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .success-checkmark-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .success-checkmark-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .success-checkmark-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .success-checkmark-page__preview {
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

      .success-checkmark-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .success-checkmark-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container success-checkmark-page (max-width: 680px) {
        .success-checkmark-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .success-checkmark-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .success-checkmark-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .success-checkmark-page__playground-result {
        overflow: hidden;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .success-checkmark-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .success-checkmark-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .success-checkmark-page__playground-controls {
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

      .success-checkmark-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .success-checkmark-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .success-checkmark-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .success-checkmark-page__option-btn {
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
      .success-checkmark-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .success-checkmark-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .success-checkmark-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .success-checkmark-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .success-checkmark-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .success-checkmark-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Tier cards ─────────────────────────────────── */

      .success-checkmark-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .success-checkmark-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
      }
      .success-checkmark-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .success-checkmark-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .success-checkmark-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .success-checkmark-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }
      .success-checkmark-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
      .success-checkmark-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }
      .success-checkmark-page__tier-import {
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
      .success-checkmark-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .success-checkmark-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .success-checkmark-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .success-checkmark-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .success-checkmark-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .success-checkmark-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .success-checkmark-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .success-checkmark-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .success-checkmark-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Replay button ──────────────────────────────── */

      .success-checkmark-page__replay-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        cursor: pointer;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .success-checkmark-page__hero {
          padding: 2rem 1.25rem;
        }
        .success-checkmark-page__title {
          font-size: 1.75rem;
        }
        .success-checkmark-page__tiers {
          grid-template-columns: 1fr;
        }
        .success-checkmark-page__section {
          padding: 1.25rem;
        }
        .success-checkmark-page__labeled-row {
          gap: 1rem;
        }
      }

      @media (max-width: 400px) {
        .success-checkmark-page__hero {
          padding: 1.5rem 1rem;
        }
        .success-checkmark-page__title {
          font-size: 1.5rem;
        }
        .success-checkmark-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .success-checkmark-page__import-code,
      .success-checkmark-page code,
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
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const successCheckmarkProps: PropDef[] = [
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the checkmark (32px / 48px / 64px).' },
  { name: 'animated', type: 'boolean', default: 'true', description: 'Whether to animate the checkmark drawing on mount.' },
  { name: 'label', type: 'string', default: "'Success'", description: 'Accessible label for the checkmark (aria-label).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0=instant, 1=fade, 2=draw, 3=draw+particles.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SuccessCheckmark } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SuccessCheckmark } from '@annondeveloper/ui-kit'",
  premium: "import { SuccessCheckmark } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="success-checkmark-page__copy-btn"
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
    <div className="success-checkmark-page__control-group">
      <span className="success-checkmark-page__control-label">{label}</span>
      <div className="success-checkmark-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`success-checkmark-page__option-btn${opt === value ? ' success-checkmark-page__option-btn--active' : ''}`}
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
    <label className="success-checkmark-page__toggle-label">
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

function generateReactCode(tier: Tier, size: Size, animated: boolean, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (!animated) props.push('  animated={false}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<SuccessCheckmark />'
    : `<SuccessCheckmark\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/success-checkmark.css';`

  return `<!-- SuccessCheckmark — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/success-checkmark.css'}">

<div class="ui-success-checkmark" data-size="${size}" role="img" aria-label="Success">
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" stroke-width="2" />
    <polyline points="14,24 22,32 34,16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, size: Size, animated: boolean): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-success-checkmark" data-size="${size}" role="img" aria-label="Success">\n    ✓\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (!animated) attrs.push('  :animated="false"')

  const template = attrs.length === 0
    ? '  <SuccessCheckmark />'
    : `  <SuccessCheckmark\n  ${attrs.join('\n  ')}\n  />`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { SuccessCheckmark } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div class="ui-success-checkmark" data-size="${size}" role="img" aria-label="Success">\n  ✓\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<div\n  class="ui-success-checkmark"\n  data-size="${size}"\n  role="img"\n  aria-label="Success"\n>\n  <svg viewBox="0 0 48 48" aria-hidden="true">...</svg>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/success-checkmark.css';`
}

function generateSvelteCode(tier: Tier, size: Size, animated: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div class="ui-success-checkmark" data-size="${size}" role="img" aria-label="Success">\n  ✓\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (!animated) attrs.push('  animated={false}')

  const template = attrs.length === 0
    ? '<SuccessCheckmark />'
    : `<SuccessCheckmark\n${attrs.join('\n')}\n/>`

  return `<script>\n  import { SuccessCheckmark } from '${importPath}';\n</script>\n\n${template}`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [animated, setAnimated] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [animKey, setAnimKey] = useState(0)

  const CheckmarkComponent = tier === 'lite'
    ? LiteSuccessCheckmark
    : tier === 'premium'
    ? PremiumSuccessCheckmark
    : SuccessCheckmark

  const handleReplay = useCallback(() => {
    setAnimKey(k => k + 1)
  }, [])

  const reactCode = useMemo(
    () => generateReactCode(tier, size, animated, motion),
    [tier, size, animated, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(tier, size),
    [tier, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, animated),
    [tier, size, animated],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size),
    [tier, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, animated),
    [tier, size, animated],
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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  return (
    <section className="success-checkmark-page__section" id="playground">
      <h2 className="success-checkmark-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="success-checkmark-page__section-desc">
        Tweak props and click "Replay" to re-trigger the animation. The generated code updates as you change settings.
      </p>

      <div className="success-checkmark-page__playground">
        <div className="success-checkmark-page__playground-preview">
          <div className="success-checkmark-page__playground-result">
            <CheckmarkComponent
              key={animKey}
              size={size}
              animated={animated}
              {...(tier !== 'lite' ? { motion } : {})}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Button size="sm" variant="secondary" onClick={handleReplay} icon={<Icon name="refresh" size="sm" />}>
              Replay Animation
            </Button>
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

        <div className="success-checkmark-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="success-checkmark-page__control-group">
            <span className="success-checkmark-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Animated" checked={animated} onChange={setAnimated} />
            </div>
          </div>

          <Button size="xs" variant="primary" onClick={handleReplay} icon={<Icon name="refresh" size="sm" />}>
            Replay
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuccessCheckmarkPage() {
  useStyles('success-checkmark-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')

  const CheckmarkComponent = tier === 'lite'
    ? LiteSuccessCheckmark
    : tier === 'premium'
    ? PremiumSuccessCheckmark
    : SuccessCheckmark

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.success-checkmark-page__section')
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
    <div className="success-checkmark-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="success-checkmark-page__hero">
        <h1 className="success-checkmark-page__title">SuccessCheckmark</h1>
        <p className="success-checkmark-page__desc">
          An animated SVG checkmark for success confirmations. Draws the circle and check with
          configurable motion levels, from instant display to cinematic particle bursts.
          Ships in three weight tiers.
        </p>
        <div className="success-checkmark-page__import-row">
          <code className="success-checkmark-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="success-checkmark-page__section" id="sizes">
        <h2 className="success-checkmark-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          Three sizes from compact inline indicators (sm, 32px) to large celebratory confirmations (lg, 64px).
        </p>
        <div className="success-checkmark-page__preview">
          <div className="success-checkmark-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="success-checkmark-page__labeled-item">
                <CheckmarkComponent size={s} animated={false} />
                <span className="success-checkmark-page__item-label">{s} ({s === 'sm' ? '32px' : s === 'md' ? '48px' : '64px'})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Features: Auto-play and Colors ─────────── */}
      <section className="success-checkmark-page__section" id="features">
        <h2 className="success-checkmark-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          The checkmark auto-plays its animation on mount. Disable with <code>animated={'{false}'}</code>.
          Colors are driven by the <code>--status-ok</code> CSS custom property, defaulting to a green accent.
        </p>

        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
          Animated vs Static
        </h3>
        <div className="success-checkmark-page__preview">
          <div className="success-checkmark-page__labeled-row">
            <div className="success-checkmark-page__labeled-item">
              <SuccessCheckmark animated={true} />
              <span className="success-checkmark-page__item-label">animated (default)</span>
            </div>
            <div className="success-checkmark-page__labeled-item">
              <SuccessCheckmark animated={false} />
              <span className="success-checkmark-page__item-label">animated={'{false}'}</span>
            </div>
          </div>
        </div>

        {tier !== 'lite' && (
          <>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '1.5rem 0 0.75rem' }}>
              Motion Levels
            </h3>
            <p className="success-checkmark-page__section-desc">
              Motion level 0 = instant display, 1 = fade in, 2 = circle + check draw animation,
              3 = full draw animation with particle burst.
            </p>
            <div className="success-checkmark-page__preview">
              <div className="success-checkmark-page__labeled-row">
                {([0, 1, 2, 3] as const).map(m => (
                  <div key={m} className="success-checkmark-page__labeled-item">
                    <SuccessCheckmark motion={m} />
                    <span className="success-checkmark-page__item-label">motion={m}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '1.5rem 0 0.75rem' }}>
          Custom Colors via CSS
        </h3>
        <div className="success-checkmark-page__preview">
          <div className="success-checkmark-page__labeled-row">
            <div className="success-checkmark-page__labeled-item">
              <div style={{ '--status-ok': 'oklch(72% 0.19 145)' } as React.CSSProperties}>
                <CheckmarkComponent animated={false} />
              </div>
              <span className="success-checkmark-page__item-label">default (green)</span>
            </div>
            <div className="success-checkmark-page__labeled-item">
              <div style={{ '--status-ok': 'oklch(65% 0.2 270)' } as React.CSSProperties}>
                <CheckmarkComponent animated={false} />
              </div>
              <span className="success-checkmark-page__item-label">--status-ok: blue</span>
            </div>
            <div className="success-checkmark-page__labeled-item">
              <div style={{ '--status-ok': 'oklch(70% 0.18 50)' } as React.CSSProperties}>
                <CheckmarkComponent animated={false} />
              </div>
              <span className="success-checkmark-page__item-label">--status-ok: orange</span>
            </div>
            <div className="success-checkmark-page__labeled-item">
              <div style={{ '--status-ok': 'oklch(65% 0.22 330)' } as React.CSSProperties}>
                <CheckmarkComponent animated={false} />
              </div>
              <span className="success-checkmark-page__item-label">--status-ok: pink</span>
            </div>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`/* Override the color with a CSS custom property */
.my-container {
  --status-ok: oklch(65% 0.2 270); /* blue */
}

<div className="my-container">
  <SuccessCheckmark />
</div>`}
            language="css"
          />
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="success-checkmark-page__section" id="tiers">
        <h2 className="success-checkmark-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          Choose the right balance of features and bundle size. Lite is a static unicode checkmark,
          Standard draws an SVG with configurable animation, and Premium adds spring physics
          and aurora glow bursts.
        </p>

        <div className="success-checkmark-page__tiers">
          {/* Lite */}
          <div
            className={`success-checkmark-page__tier-card${tier === 'lite' ? ' success-checkmark-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="success-checkmark-page__tier-header">
              <span className="success-checkmark-page__tier-name">Lite</span>
              <span className="success-checkmark-page__tier-size">~0.2 KB</span>
            </div>
            <p className="success-checkmark-page__tier-desc">
              Static unicode checkmark character. Zero JavaScript animation.
              No SVG, no motion levels, no particles.
            </p>
            <div className="success-checkmark-page__tier-import">
              {IMPORT_STRINGS.lite}
            </div>
            <div className="success-checkmark-page__tier-preview">
              <LiteSuccessCheckmark size="md" />
            </div>
            <div className="success-checkmark-page__size-breakdown">
              <div className="success-checkmark-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.1 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`success-checkmark-page__tier-card${tier === 'standard' ? ' success-checkmark-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="success-checkmark-page__tier-header">
              <span className="success-checkmark-page__tier-name">Standard</span>
              <span className="success-checkmark-page__tier-size">~1.5 KB</span>
            </div>
            <p className="success-checkmark-page__tier-desc">
              Animated SVG with circle draw, checkmark draw,
              four motion levels, and particle burst at level 3.
            </p>
            <div className="success-checkmark-page__tier-import">
              {IMPORT_STRINGS.standard}
            </div>
            <div className="success-checkmark-page__tier-preview">
              <SuccessCheckmark size="md" animated={false} />
            </div>
            <div className="success-checkmark-page__size-breakdown">
              <div className="success-checkmark-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`success-checkmark-page__tier-card${tier === 'premium' ? ' success-checkmark-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="success-checkmark-page__tier-header">
              <span className="success-checkmark-page__tier-name">Premium</span>
              <span className="success-checkmark-page__tier-size">~2.2 KB</span>
            </div>
            <p className="success-checkmark-page__tier-desc">
              Everything in Standard plus spring-physics drawing,
              aurora glow burst, and aurora-colored particles with glowing box shadows.
            </p>
            <div className="success-checkmark-page__tier-import">
              {IMPORT_STRINGS.premium}
            </div>
            <div className="success-checkmark-page__tier-preview">
              <PremiumSuccessCheckmark size="md" animated={false} />
            </div>
            <div className="success-checkmark-page__size-breakdown">
              <div className="success-checkmark-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ──────────────────────────────── */}
      <section className="success-checkmark-page__section" id="brand-color">
        <h2 className="success-checkmark-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          Pick a brand color to preview how SuccessCheckmark adapts via the <code>--status-ok</code> CSS custom property.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="success-checkmark-page__preview" style={{ minBlockSize: 'auto', padding: '1.5rem' }}>
            <div style={{ '--status-ok': brandColor } as React.CSSProperties}>
              <CheckmarkComponent size="lg" animated={false} />
            </div>
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="success-checkmark-page__section" id="props">
        <h2 className="success-checkmark-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          All props accepted by SuccessCheckmark. It also spreads any native div HTML attributes
          onto the wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={successCheckmarkProps} />
        </Card>
      </section>

      {/* ── 7. Accessibility ──────────────────────────── */}
      <section className="success-checkmark-page__section" id="accessibility">
        <h2 className="success-checkmark-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          The checkmark follows image accessibility patterns.
        </p>
        <Card variant="default" padding="md">
          <ul className="success-checkmark-page__a11y-list">
            <li className="success-checkmark-page__a11y-item">
              <span className="success-checkmark-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="success-checkmark-page__a11y-key">role="img"</code> with <code className="success-checkmark-page__a11y-key">aria-label</code> for screen reader announcement.
              </span>
            </li>
            <li className="success-checkmark-page__a11y-item">
              <span className="success-checkmark-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden SVG:</strong> The inner SVG is marked <code className="success-checkmark-page__a11y-key">aria-hidden="true"</code> to prevent duplicate announcements.
              </span>
            </li>
            <li className="success-checkmark-page__a11y-item">
              <span className="success-checkmark-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="success-checkmark-page__a11y-key">prefers-reduced-motion: reduce</code> by disabling all animations, showing the checkmark instantly.
              </span>
            </li>
            <li className="success-checkmark-page__a11y-item">
              <span className="success-checkmark-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="success-checkmark-page__a11y-key">forced-colors: active</code> using <code className="success-checkmark-page__a11y-key">ButtonText</code> system color.
              </span>
            </li>
            <li className="success-checkmark-page__a11y-item">
              <span className="success-checkmark-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Custom label:</strong> Override the default "Success" announcement with the <code className="success-checkmark-page__a11y-key">label</code> prop.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 8. Source ─────────────────────────────────── */}
      <section className="success-checkmark-page__section" id="source">
        <h2 className="success-checkmark-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="success-checkmark-page__section-desc">
          View the source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/success-checkmark.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="success-checkmark-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/components/success-checkmark.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/success-checkmark.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="success-checkmark-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/lite/success-checkmark.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/success-checkmark.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="success-checkmark-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/premium/success-checkmark.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
