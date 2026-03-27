'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Link } from '@ui/components/link'
import { Link as LiteLink } from '@ui/lite/link'
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
    @scope (.link-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: link-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .link-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .link-page__hero::before {
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
        animation: link-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes link-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .link-page__hero::before { animation: none; }
      }

      .link-page__title {
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

      .link-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .link-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .link-page__import-code {
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

      .link-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .link-page__section {
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
        animation: link-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes link-section-reveal {
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
        .link-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .link-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .link-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .link-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .link-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .link-page__preview {
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

      .link-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .link-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .link-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .link-page__playground {
          grid-template-columns: 1fr;
        }
        .link-page__playground-controls {
          position: static !important;
        }
      }

      @container link-page (max-width: 680px) {
        .link-page__playground {
          grid-template-columns: 1fr;
        }
        .link-page__playground-controls {
          position: static !important;
        }
      }

      .link-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .link-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .link-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .link-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .link-page__playground-controls {
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

      .link-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .link-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .link-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .link-page__option-btn {
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
      .link-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .link-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .link-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .link-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .link-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .link-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .link-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .link-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Variant grid ─────────────────────────────── */

      .link-page__variant-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
      }

      .link-page__variant-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .link-page__variant-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .link-page__variant-desc {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .link-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .link-page__tier-card {
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

      .link-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .link-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .link-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .link-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .link-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .link-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .link-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .link-page__tier-import {
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

      .link-page__tier-preview {
        display: flex;
        justify-content: center;
        gap: 1rem;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .link-page__code-tabs {
        margin-block-start: 1rem;
      }

      .link-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .link-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .link-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .link-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .link-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .link-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ────────────────────────────── */

      .link-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .link-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .link-page__hero {
          padding: 2rem 1.25rem;
        }

        .link-page__title {
          font-size: 1.75rem;
        }

        .link-page__preview {
          padding: 1.75rem;
        }

        .link-page__playground {
          grid-template-columns: 1fr;
        }

        .link-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .link-page__tiers {
          grid-template-columns: 1fr;
        }

        .link-page__section {
          padding: 1.25rem;
        }

        .link-page__variant-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .link-page__hero {
          padding: 1.5rem 1rem;
        }

        .link-page__title {
          font-size: 1.5rem;
        }

        .link-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .link-page__title {
          font-size: 4rem;
        }

        .link-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .link-page__import-code,
      .link-page code,
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

const linkProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'subtle' | 'brand'", default: "'default'", description: 'Visual variant controlling color and hover effect.' },
  { name: 'underline', type: "'always' | 'hover' | 'none'", default: "'hover'", description: 'Underline behavior. Hover mode uses animated slide-in at motion level 2+.' },
  { name: 'external', type: 'boolean', default: 'false', description: 'Marks link as external. Adds arrow indicator, target="_blank", and rel="noopener noreferrer".' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Font size of the link.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. Level 2+ enables the slide-in underline effect on hover.' },
  { name: 'href', type: 'string', description: 'URL destination of the link.' },
  { name: 'target', type: 'string', description: 'Link target. Auto-set to "_blank" for external links.' },
  { name: 'rel', type: 'string', description: 'Link relationship. Auto-set to "noopener noreferrer" for external links.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Link text content.' },
  { name: 'ref', type: 'Ref<HTMLAnchorElement>', description: 'Forwarded ref to the underlying <a> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type LinkVariant = 'default' | 'subtle' | 'brand'
type Underline = 'always' | 'hover' | 'none'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const LINK_VARIANTS: LinkVariant[] = ['default', 'subtle', 'brand']
const UNDERLINES: Underline[] = ['always', 'hover', 'none']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Link } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Link } from '@annondeveloper/ui-kit'",
  premium: "import { Link } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="link-page__copy-btn"
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
    <div className="link-page__control-group">
      <span className="link-page__control-label">{label}</span>
      <div className="link-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`link-page__option-btn${opt === value ? ' link-page__option-btn--active' : ''}`}
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
    <label className="link-page__toggle-label">
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
  variant: LinkVariant,
  underline: Underline,
  external: boolean,
  size: Size,
  label: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  href="https://example.com"']
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (underline !== 'hover') props.push(`  underline="${underline}"`)
  if (external) props.push('  external')
  if (size !== 'md') props.push(`  size="${size}"`)

  const jsx = `<Link\n${props.join('\n')}\n>\n  ${label}\n</Link>`
  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, variant: LinkVariant, underline: Underline, external: boolean, size: Size, label: string): string {
  const className = tier === 'lite' ? 'ui-lite-link' : 'ui-link'
  const attrs = [`class="${className}"`, `href="https://example.com"`, `data-variant="${variant}"`, `data-underline="${underline}"`, `data-size="${size}"`]
  if (external) {
    attrs.push('data-external="true"', 'target="_blank"', 'rel="noopener noreferrer"')
  }
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/link.css';`

  return `<!-- Link -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/link.css'}">

<a ${attrs.join(' ')}>
  ${label}
</a>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, variant: LinkVariant, underline: Underline, external: boolean, size: Size, label: string): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-link"`, `href="https://example.com"`, `data-variant="${variant}"`, `data-underline="${underline}"`, `data-size="${size}"`]
    if (external) attrs.push('data-external="true"', 'target="_blank"', 'rel="noopener noreferrer"')
    return `<template>\n  <a ${attrs.join(' ')}>\n    ${label}\n  </a>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = ['  href="https://example.com"']
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (underline !== 'hover') attrs.push(`  underline="${underline}"`)
  if (external) attrs.push('  external')
  if (size !== 'md') attrs.push(`  size="${size}"`)

  return `<template>\n  <Link\n  ${attrs.join('\n  ')}\n  >${label}</Link>\n</template>\n\n<script setup>\nimport { Link } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, variant: LinkVariant, underline: Underline, external: boolean, size: Size, label: string): string {
  const className = tier === 'lite' ? 'ui-lite-link' : 'ui-link'
  const attrs = [`class="${className}"`, `href="https://example.com"`, `data-variant="${variant}"`, `data-underline="${underline}"`, `data-size="${size}"`]
  if (external) attrs.push('data-external="true"', 'target="_blank"', 'rel="noopener noreferrer"')
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite/styles.css' : '@annondeveloper/ui-kit/css/components/link.css'

  return `<!-- Angular -- ${tier} tier -->\n<a ${attrs.join(' ')}>\n  ${label}\n</a>\n\n/* In styles.css */\n@import '${importPath}';`
}

function generateSvelteCode(tier: Tier, variant: LinkVariant, underline: Underline, external: boolean, size: Size, label: string): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-link"`, `href="https://example.com"`, `data-variant="${variant}"`, `data-underline="${underline}"`, `data-size="${size}"`]
    if (external) attrs.push('data-external="true"', 'target="_blank"', 'rel="noopener noreferrer"')
    return `<a ${attrs.join(' ')}>\n  ${label}\n</a>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const attrs: string[] = ['  href="https://example.com"']
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (underline !== 'hover') attrs.push(`  underline="${underline}"`)
  if (external) attrs.push('  external')
  if (size !== 'md') attrs.push(`  size="${size}"`)

  return `<script>\n  import { Link } from '@annondeveloper/ui-kit';\n</script>\n\n<Link\n${attrs.join('\n')}\n>\n  ${label}\n</Link>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<LinkVariant>('default')
  const [underline, setUnderline] = useState<Underline>('hover')
  const [external, setExternal] = useState(false)
  const [size, setSize] = useState<Size>('md')
  const [label, setLabel] = useState('Click this link')
  const [copyStatus, setCopyStatus] = useState('')

  const LinkComponent = tier === 'lite' ? LiteLink : Link

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, underline, external, size, label),
    [tier, variant, underline, external, size, label],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, variant, underline, external, size, label),
    [tier, variant, underline, external, size, label],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, variant, underline, external, size, label),
    [tier, variant, underline, external, size, label],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, underline, external, size, label),
    [tier, variant, underline, external, size, label],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, underline, external, size, label),
    [tier, variant, underline, external, size, label],
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

  return (
    <section className="link-page__section" id="playground">
      <h2 className="link-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="link-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="link-page__playground">
        <div className="link-page__playground-preview">
          <div className="link-page__playground-result">
            <LinkComponent
              href="#playground"
              variant={variant}
              underline={underline}
              external={external}
              size={size}
              onClick={e => e.preventDefault()}
            >
              {label}
            </LinkComponent>
          </div>

          <div className="link-page__code-tabs">
            <div className="link-page__export-row">
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
              {copyStatus && <span className="link-page__export-status">{copyStatus}</span>}
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

        <div className="link-page__playground-controls">
          <OptionGroup label="Variant" options={LINK_VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Underline" options={UNDERLINES} value={underline} onChange={setUnderline} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          <div className="link-page__control-group">
            <span className="link-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="External" checked={external} onChange={setExternal} />
            </div>
          </div>

          <div className="link-page__control-group">
            <span className="link-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="link-page__text-input"
              placeholder="Link text..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LinkPage() {
  useStyles('link-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  const LinkComponent = tier === 'lite' ? LiteLink : Link

  // Scroll reveal for sections -- JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.link-page__section')
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
    <div className="link-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="link-page__hero">
        <h1 className="link-page__title">Link</h1>
        <p className="link-page__desc">
          Styled anchor component with three variants, animated slide-in underline, external link indicators,
          five sizes, and brand glow hover effect. Auto-sets security attributes for external links.
        </p>
        <div className="link-page__import-row">
          <code className="link-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Variants ────────────────────────────── */}
      <section className="link-page__section" id="variants">
        <h2 className="link-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="link-page__section-desc">
          Three visual variants for different levels of emphasis. Default and brand use the brand color,
          subtle uses secondary text color for less prominent links.
        </p>
        <div className="link-page__variant-grid">
          <div className="link-page__variant-cell">
            <span className="link-page__variant-label">default</span>
            <LinkComponent href="#" variant="default" onClick={e => e.preventDefault()}>Default link</LinkComponent>
            <span className="link-page__variant-desc">Brand-colored, standard emphasis</span>
          </div>
          <div className="link-page__variant-cell">
            <span className="link-page__variant-label">subtle</span>
            <LinkComponent href="#" variant="subtle" onClick={e => e.preventDefault()}>Subtle link</LinkComponent>
            <span className="link-page__variant-desc">Secondary text color, minimal emphasis</span>
          </div>
          <div className="link-page__variant-cell">
            <span className="link-page__variant-label">brand</span>
            <LinkComponent href="#" variant="brand" onClick={e => e.preventDefault()}>Brand link</LinkComponent>
            <span className="link-page__variant-desc">Brand-colored with glow on hover</span>
          </div>
        </div>
      </section>

      {/* ── 4. Underline Modes ──────────────────────────── */}
      <section className="link-page__section" id="underlines">
        <h2 className="link-page__section-title">
          <a href="#underlines">Underline Modes</a>
        </h2>
        <p className="link-page__section-desc">
          Three underline behaviors. The hover mode uses an animated slide-in underline at motion level 2+,
          falling back to a standard text-decoration for lower motion levels.
        </p>
        <div className="link-page__preview">
          <div className="link-page__labeled-row">
            {UNDERLINES.map(u => (
              <div key={u} className="link-page__labeled-item">
                <LinkComponent href="#" underline={u} onClick={e => e.preventDefault()}>
                  {u.charAt(0).toUpperCase() + u.slice(1)} underline
                </LinkComponent>
                <span className="link-page__item-label">{u}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Link underline="always">Always underlined</Link>\n<Link underline="hover">Underline on hover</Link>\n<Link underline="none">No underline</Link>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Size Scale ────────────────────────────────── */}
      <section className="link-page__section" id="sizes">
        <h2 className="link-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="link-page__section-desc">
          Five sizes from extra-small inline annotations (xs) to large prominent call-to-action links (xl).
        </p>
        <div className="link-page__preview">
          <div className="link-page__labeled-row" style={{ alignItems: 'center' }}>
            {SIZES.map(s => (
              <div key={s} className="link-page__labeled-item">
                <LinkComponent href="#" size={s} onClick={e => e.preventDefault()}>Link text</LinkComponent>
                <span className="link-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. External vs Internal ──────────────────────── */}
      <section className="link-page__section" id="external">
        <h2 className="link-page__section-title">
          <a href="#external">External vs Internal Links</a>
        </h2>
        <p className="link-page__section-desc">
          External links automatically add an arrow indicator, target="_blank", and rel="noopener noreferrer"
          for security. In print mode, external links show their URL.
        </p>
        <div className="link-page__preview link-page__preview--col" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="link-page__item-label" style={{ minInlineSize: '5rem' }}>internal</span>
              <LinkComponent href="#" onClick={e => e.preventDefault()}>Documentation</LinkComponent>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="link-page__item-label" style={{ minInlineSize: '5rem' }}>external</span>
              <LinkComponent href="https://github.com" external onClick={e => e.preventDefault()}>GitHub Repository</LinkComponent>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <LinkComponent href="https://react.dev" external onClick={e => e.preventDefault()}>React Docs</LinkComponent>
            <LinkComponent href="https://vitejs.dev" external variant="subtle" onClick={e => e.preventDefault()}>Vite</LinkComponent>
            <LinkComponent href="https://typescriptlang.org" external variant="brand" onClick={e => e.preventDefault()}>TypeScript</LinkComponent>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Link href="/docs">Internal link</Link>\n<Link href="https://github.com" external>External link</Link>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Inline Usage ──────────────────────────────── */}
      <section className="link-page__section" id="inline">
        <h2 className="link-page__section-title">
          <a href="#inline">Inline Usage</a>
        </h2>
        <p className="link-page__section-desc">
          Links render as inline elements that flow naturally within body text.
        </p>
        <div className="link-page__preview link-page__preview--col">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem', maxInlineSize: '60ch' }}>
            Read the <LinkComponent href="#" onClick={e => e.preventDefault()}>getting started guide</LinkComponent> to
            set up your project. You can find the full <LinkComponent href="#" variant="brand" onClick={e => e.preventDefault()}>API reference</LinkComponent> in
            our documentation. For issues, visit the <LinkComponent href="https://github.com" external onClick={e => e.preventDefault()}>GitHub repository</LinkComponent>.
            See also our <LinkComponent href="#" variant="subtle" onClick={e => e.preventDefault()}>changelog</LinkComponent> for
            recent updates.
          </p>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="link-page__section" id="tiers">
        <h2 className="link-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="link-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides CSS-only rendering.
          Standard adds motion-aware animated underlines and embedded scoped CSS. Premium adds aurora glow effects and spring animations.
        </p>

        <div className="link-page__tiers">
          {/* Lite */}
          <div
            className={`link-page__tier-card${tier === 'lite' ? ' link-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="link-page__tier-header">
              <span className="link-page__tier-name">Lite</span>
              <span className="link-page__tier-size">~0.2 KB</span>
            </div>
            <p className="link-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No motion or animated underline.
            </p>
            <div className="link-page__tier-import">
              import {'{'} Link {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="link-page__tier-preview">
              <LiteLink href="#" onClick={e => e.preventDefault()}>Lite Link</LiteLink>
              <LiteLink href="#" external onClick={e => e.preventDefault()}>External</LiteLink>
            </div>
            <div className="link-page__size-breakdown">
              <div className="link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`link-page__tier-card${tier === 'standard' ? ' link-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="link-page__tier-header">
              <span className="link-page__tier-name">Standard</span>
              <span className="link-page__tier-size">~0.6 KB</span>
            </div>
            <p className="link-page__tier-desc">
              Full-featured link with motion levels, animated slide-in underline,
              brand glow, and embedded scoped CSS.
            </p>
            <div className="link-page__tier-import">
              import {'{'} Link {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="link-page__tier-preview">
              <Link href="#" onClick={e => e.preventDefault()}>Standard</Link>
              <Link href="#" variant="brand" onClick={e => e.preventDefault()}>Brand</Link>
            </div>
            <div className="link-page__size-breakdown">
              <div className="link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`link-page__tier-card${tier === 'premium' ? ' link-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="link-page__tier-header">
              <span className="link-page__tier-name">Premium</span>
              <span className="link-page__tier-size">~3-5 KB</span>
            </div>
            <p className="link-page__tier-desc">
              Aurora underline glow on hover, spring-slide underline animation, and shimmer text effect.
            </p>
            <div className="link-page__tier-import">
              import {'{'} Link {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="link-page__tier-preview">
              <Link href="#" variant="brand" onClick={e => e.preventDefault()}>Standard</Link>
            </div>
            <div className="link-page__size-breakdown">
              <div className="link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="link-page__section" id="props">
        <h2 className="link-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="link-page__section-desc">
          All props accepted by Link. It also spreads any native anchor HTML attributes
          onto the underlying {'<a>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={linkProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="link-page__section" id="accessibility">
        <h2 className="link-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="link-page__section-desc">
          Built on the native {'<a>'} element with comprehensive focus and security support.
        </p>
        <Card variant="default" padding="md">
          <ul className="link-page__a11y-list">
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses the native <code className="link-page__a11y-key">{'<a>'}</code> element for correct screen reader announcements.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Clear focus ring with brand-colored glow via <code className="link-page__a11y-key">:focus-visible</code> with 2px outline + 4px shadow.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>External security:</strong> Auto-adds <code className="link-page__a11y-key">target="_blank"</code> and <code className="link-page__a11y-key">rel="noopener noreferrer"</code> for external links.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>External indicator:</strong> Arrow symbol after external links provides a visual cue that the link opens externally.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="link-page__a11y-key">forced-colors: active</code> with LinkText fallback color.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Animated underline disabled when <code className="link-page__a11y-key">prefers-reduced-motion: reduce</code> is active.
              </span>
            </li>
            <li className="link-page__a11y-item">
              <span className="link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> External links show their URL in parentheses after the link text for print stylesheets.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
