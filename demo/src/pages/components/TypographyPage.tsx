'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Typography } from '@ui/components/typography'
import { Typography as LiteTypography } from '@ui/lite/typography'
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
    @scope (.typography-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: typography-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .typography-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .typography-page__hero::before {
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
        animation: typography-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes typography-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .typography-page__hero::before { animation: none; }
      }

      .typography-page__title {
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

      .typography-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .typography-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .typography-page__import-code {
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

      .typography-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .typography-page__section {
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
        animation: typography-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes typography-section-reveal {
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
        .typography-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .typography-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .typography-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .typography-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .typography-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .typography-page__preview {
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

      .typography-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .typography-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .typography-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .typography-page__playground {
          grid-template-columns: 1fr;
        }
        .typography-page__playground-controls {
          position: static !important;
        }
      }

      @container typography-page (max-width: 680px) {
        .typography-page__playground {
          grid-template-columns: 1fr;
        }
        .typography-page__playground-controls {
          position: static !important;
        }
      }

      .typography-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .typography-page__playground-result {
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

      .typography-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .typography-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .typography-page__playground-controls {
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

      .typography-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .typography-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .typography-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .typography-page__option-btn {
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
      .typography-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .typography-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .typography-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .typography-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .typography-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .typography-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .typography-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .typography-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .typography-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .typography-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .typography-page__tier-card {
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

      .typography-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .typography-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .typography-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .typography-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .typography-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .typography-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .typography-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .typography-page__tier-import {
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

      .typography-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .typography-page__code-tabs {
        margin-block-start: 1rem;
      }

      .typography-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .typography-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Scale list ────────────────────────────────── */

      .typography-page__scale-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .typography-page__scale-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .typography-page__scale-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Color grid ────────────────────────────────── */

      .typography-page__color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
      }

      .typography-page__color-cell {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 1.25rem 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .typography-page__color-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── A11y list ──────────────────────────────────── */

      .typography-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .typography-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .typography-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .typography-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ────────────────────────────── */

      .typography-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .typography-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .typography-page__hero {
          padding: 2rem 1.25rem;
        }

        .typography-page__title {
          font-size: 1.75rem;
        }

        .typography-page__preview {
          padding: 1.75rem;
        }

        .typography-page__playground {
          grid-template-columns: 1fr;
        }

        .typography-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .typography-page__labeled-row {
          gap: 1rem;
        }

        .typography-page__tiers {
          grid-template-columns: 1fr;
        }

        .typography-page__section {
          padding: 1.25rem;
        }

        .typography-page__color-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .typography-page__hero {
          padding: 1.5rem 1rem;
        }

        .typography-page__title {
          font-size: 1.5rem;
        }

        .typography-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .typography-page__title {
          font-size: 4rem;
        }

        .typography-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .typography-page__import-code,
      .typography-page code,
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

const typographyProps: PropDef[] = [
  { name: 'variant', type: "'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'code' | 'overline'", default: "'body'", description: 'Semantic variant controlling element type, font-size, weight, and line-height.' },
  { name: 'color', type: "'primary' | 'secondary' | 'tertiary' | 'brand' | 'success' | 'warning' | 'danger'", description: 'Text color mapped to theme tokens. Falls back to variant default color.' },
  { name: 'weight', type: '300 | 400 | 500 | 600 | 700 | 800', description: 'Override font-weight. By default determined by the variant.' },
  { name: 'align', type: "'start' | 'center' | 'end'", description: 'Text alignment using logical properties.' },
  { name: 'truncate', type: 'boolean | number', description: 'Enable text truncation. true = single-line ellipsis, number = multi-line clamp.' },
  { name: 'as', type: 'React.ElementType', description: 'Override the rendered HTML element. By default determined by variant.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Text content to render.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying HTML element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'code' | 'overline'
type Color = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'success' | 'warning' | 'danger'
type Align = 'start' | 'center' | 'end'
type Weight = 300 | 400 | 500 | 600 | 700 | 800

const VARIANTS: Variant[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'body-sm', 'caption', 'code', 'overline']
const COLORS: Color[] = ['primary', 'secondary', 'tertiary', 'brand', 'success', 'warning', 'danger']
const ALIGNS: Align[] = ['start', 'center', 'end']
const WEIGHTS: Weight[] = [300, 400, 500, 600, 700, 800]
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Typography } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Typography } from '@annondeveloper/ui-kit'",
  premium: "import { Typography } from '@annondeveloper/ui-kit/premium'",
}

const VARIANT_DISPLAY_TEXT: Record<Variant, string> = {
  h1: 'Heading Level 1',
  h2: 'Heading Level 2',
  h3: 'Heading Level 3',
  h4: 'Heading Level 4',
  h5: 'Heading Level 5',
  h6: 'Heading Level 6',
  body: 'Body text for paragraphs and general content with good line-height.',
  'body-sm': 'Smaller body text for compact layouts and secondary content.',
  caption: 'Caption for labels and annotations',
  code: 'const theme = generateTheme(brand)',
  overline: 'Overline label',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="typography-page__copy-btn"
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
    <div className="typography-page__control-group">
      <span className="typography-page__control-label">{label}</span>
      <div className="typography-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`typography-page__option-btn${opt === value ? ' typography-page__option-btn--active' : ''}`}
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
    <label className="typography-page__toggle-label">
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
  color: Color | '',
  weight: Weight | '',
  align: Align | '',
  truncate: boolean,
  truncateLines: number,
  content: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (variant !== 'body') props.push(`  variant="${variant}"`)
  if (color) props.push(`  color="${color}"`)
  if (weight && tier !== 'lite') props.push(`  weight={${weight}}`)
  if (align && tier !== 'lite') props.push(`  align="${align}"`)
  if (truncate && tier !== 'lite') {
    if (truncateLines > 1) {
      props.push(`  truncate={${truncateLines}}`)
    } else {
      props.push('  truncate')
    }
  }

  const jsx = props.length === 0
    ? `<Typography>${content}</Typography>`
    : `<Typography\n${props.join('\n')}\n>\n  ${content}\n</Typography>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, variant: Variant, color: Color | '', content: string): string {
  const className = tier === 'lite' ? 'ui-lite-typography' : 'ui-typography'
  const elementMap: Record<string, string> = {
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
  }
  const el = elementMap[variant] || 'span'
  const attrs = [`class="${className}"`, `data-variant="${variant}"`]
  if (color) attrs.push(`data-color="${color}"`)

  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/typography.css';`

  return `<!-- Typography -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/typography.css'}">

<${el} ${attrs.join(' ')}>
  ${content}
</${el}>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, variant: Variant, color: Color | '', content: string): string {
  if (tier === 'lite') {
    const elementMap: Record<string, string> = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
      body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
    }
    const el = elementMap[variant] || 'span'
    const attrs = [`class="ui-lite-typography"`, `data-variant="${variant}"`]
    if (color) attrs.push(`data-color="${color}"`)
    return `<template>\n  <${el} ${attrs.join(' ')}>\n    ${content}\n  </${el}>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (variant !== 'body') attrs.push(`  variant="${variant}"`)
  if (color) attrs.push(`  color="${color}"`)

  const template = attrs.length === 0
    ? `  <Typography>${content}</Typography>`
    : `  <Typography\n  ${attrs.join('\n  ')}\n  >${content}</Typography>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Typography } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, color: Color | '', content: string): string {
  const elementMap: Record<string, string> = {
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
  }
  const el = elementMap[variant] || 'span'
  const className = tier === 'lite' ? 'ui-lite-typography' : 'ui-typography'
  const attrs = [`class="${className}"`, `data-variant="${variant}"`]
  if (color) attrs.push(`data-color="${color}"`)
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite/styles.css' : '@annondeveloper/ui-kit/css/components/typography.css'

  return `<!-- Angular -- ${tier} tier -->\n<${el} ${attrs.join(' ')}>\n  ${content}\n</${el}>\n\n/* In styles.css */\n@import '${importPath}';`
}

function generateSvelteCode(tier: Tier, variant: Variant, color: Color | '', content: string): string {
  if (tier === 'lite') {
    const elementMap: Record<string, string> = {
      h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
      body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
    }
    const el = elementMap[variant] || 'span'
    const attrs = [`class="ui-lite-typography"`, `data-variant="${variant}"`]
    if (color) attrs.push(`data-color="${color}"`)
    return `<${el} ${attrs.join(' ')}>\n  ${content}\n</${el}>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  return `<script>\n  import { Typography } from '@annondeveloper/ui-kit';\n</script>\n\n<Typography\n  variant="${variant}"\n  ${color ? `color="${color}"` : ''}\n>\n  ${content}\n</Typography>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('h2')
  const [color, setColor] = useState<Color | ''>('')
  const [weight, setWeight] = useState<Weight | ''>('')
  const [align, setAlign] = useState<Align | ''>('')
  const [truncate, setTruncate] = useState(false)
  const [truncateLines, setTruncateLines] = useState(2)
  const [content, setContent] = useState('The quick brown fox jumps over the lazy dog')
  const [copyStatus, setCopyStatus] = useState('')

  const TypoComponent = tier === 'lite' ? LiteTypography : Typography

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, color, weight, align, truncate, truncateLines, content),
    [tier, variant, color, weight, align, truncate, truncateLines, content],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, variant, color, content),
    [tier, variant, color, content],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, variant, color, content),
    [tier, variant, color, content],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, color, content),
    [tier, variant, color, content],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, color, content),
    [tier, variant, color, content],
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

  const previewProps: Record<string, unknown> = { variant }
  if (color) previewProps.color = color
  if (tier !== 'lite') {
    if (weight) previewProps.weight = weight
    if (align) previewProps.align = align
    if (truncate) {
      previewProps.truncate = truncateLines > 1 ? truncateLines : true
      previewProps.style = { maxInlineSize: '300px' }
    }
  }

  return (
    <section className="typography-page__section" id="playground">
      <h2 className="typography-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="typography-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="typography-page__playground">
        <div className="typography-page__playground-preview">
          <div className="typography-page__playground-result">
            <TypoComponent {...previewProps}>{content}</TypoComponent>
          </div>

          <div className="typography-page__code-tabs">
            <div className="typography-page__export-row">
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
              {copyStatus && <span className="typography-page__export-status">{copyStatus}</span>}
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

        <div className="typography-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Color" options={['', ...COLORS] as const} value={color as string} onChange={v => setColor(v as Color | '')} />

          {tier !== 'lite' && (
            <>
              <OptionGroup
                label="Weight"
                options={['', ...WEIGHTS.map(String)] as const}
                value={weight ? String(weight) : ''}
                onChange={v => setWeight(v ? (Number(v) as Weight) : '')}
              />
              <OptionGroup label="Align" options={['', ...ALIGNS] as const} value={align as string} onChange={v => setAlign(v as Align | '')} />
            </>
          )}

          <div className="typography-page__control-group">
            <span className="typography-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Truncate" checked={truncate} onChange={setTruncate} />}
            </div>
          </div>

          {truncate && tier !== 'lite' && (
            <div className="typography-page__control-group">
              <span className="typography-page__control-label">Truncate lines</span>
              <input
                type="number"
                min={1}
                max={5}
                value={truncateLines}
                onChange={e => setTruncateLines(Number(e.target.value))}
                className="typography-page__text-input"
                style={{ maxInlineSize: '80px' }}
              />
            </div>
          )}

          <div className="typography-page__control-group">
            <span className="typography-page__control-label">Content</span>
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="typography-page__text-input"
              placeholder="Text content..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TypographyPage() {
  useStyles('typography-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  const TypoComponent = tier === 'lite' ? LiteTypography : Typography

  // Scroll reveal for sections -- JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.typography-page__section')
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
    <div className="typography-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="typography-page__hero">
        <h1 className="typography-page__title">Typography</h1>
        <p className="typography-page__desc">
          Semantic text component with 11 variants, OKLCH color tokens, fluid sizing, text-wrap balance for headings,
          and multi-line truncation. Maps variants to correct HTML elements automatically.
        </p>
        <div className="typography-page__import-row">
          <code className="typography-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Full Type Scale ────────────────────────────── */}
      <section className="typography-page__section" id="scale">
        <h2 className="typography-page__section-title">
          <a href="#scale">Type Scale</a>
        </h2>
        <p className="typography-page__section-desc">
          All 11 variants shown at their default sizes and weights. Headings use text-wrap: balance,
          body text uses text-wrap: pretty. Sizes are fluid with clamp().
        </p>
        <div className="typography-page__preview typography-page__preview--col" style={{ gap: '1.5rem' }}>
          <div className="typography-page__scale-list">
            {VARIANTS.map(v => (
              <div key={v} className="typography-page__scale-item">
                <span className="typography-page__scale-label">{v}</span>
                <TypoComponent variant={v}>{VARIANT_DISPLAY_TEXT[v]}</TypoComponent>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Color Variants ────────────────────────────── */}
      <section className="typography-page__section" id="colors">
        <h2 className="typography-page__section-title">
          <a href="#colors">Color Variants</a>
        </h2>
        <p className="typography-page__section-desc">
          Seven color options mapped to theme tokens. Each color adapts to light and dark modes automatically.
        </p>
        <div className="typography-page__color-grid">
          {COLORS.map(c => (
            <div key={c} className="typography-page__color-cell">
              <span className="typography-page__color-label">{c}</span>
              <TypoComponent variant="body" color={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)} text color
              </TypoComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Font Weights ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="typography-page__section" id="weights">
          <h2 className="typography-page__section-title">
            <a href="#weights">Font Weights</a>
          </h2>
          <p className="typography-page__section-desc">
            Override the default weight with any value from 300 (light) to 800 (extra-bold).
          </p>
          <div className="typography-page__preview typography-page__preview--col" style={{ gap: '1rem' }}>
            {WEIGHTS.map(w => (
              <div key={w} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="typography-page__item-label" style={{ minInlineSize: '3rem' }}>{w}</span>
                <Typography variant="h4" weight={w}>The quick brown fox</Typography>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Alignment ──────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="typography-page__section" id="alignment">
          <h2 className="typography-page__section-title">
            <a href="#alignment">Text Alignment</a>
          </h2>
          <p className="typography-page__section-desc">
            Logical text-align properties that respect document direction (LTR/RTL).
          </p>
          <div className="typography-page__preview typography-page__preview--col" style={{ gap: '1.5rem', inlineSize: '100%' }}>
            {ALIGNS.map(a => (
              <div key={a} style={{ inlineSize: '100%' }}>
                <span className="typography-page__item-label">{a}</span>
                <Typography variant="body" align={a} style={{ inlineSize: '100%' }}>
                  Text aligned to {a}. Typography uses logical properties for internationalization.
                </Typography>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Truncation ─────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="typography-page__section" id="truncation">
          <h2 className="typography-page__section-title">
            <a href="#truncation">Truncation</a>
          </h2>
          <p className="typography-page__section-desc">
            Single-line ellipsis or multi-line clamping with CSS -webkit-line-clamp.
          </p>
          <div className="typography-page__preview typography-page__preview--col" style={{ gap: '2rem' }}>
            <div style={{ maxInlineSize: '350px' }}>
              <span className="typography-page__item-label">truncate (single line)</span>
              <Typography variant="body" truncate>
                This is a very long paragraph that should be truncated to a single line with an ellipsis at the end to prevent overflow.
              </Typography>
            </div>
            <div style={{ maxInlineSize: '350px' }}>
              <span className="typography-page__item-label">truncate={'{2}'} (two lines)</span>
              <Typography variant="body" truncate={2}>
                This is a very long paragraph that will be clamped to exactly two lines. The text will show an ellipsis after the second line to indicate that there is more content hidden from view.
              </Typography>
            </div>
            <div style={{ maxInlineSize: '350px' }}>
              <span className="typography-page__item-label">truncate={'{3}'} (three lines)</span>
              <Typography variant="body" truncate={3}>
                This is an even longer paragraph that demonstrates three-line clamping. The text wraps naturally across multiple lines, and after the third line it is truncated with an ellipsis to indicate continuation. This is useful for card descriptions and preview text blocks.
              </Typography>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Typography truncate>Single line ellipsis</Typography>\n<Typography truncate={2}>Two-line clamp</Typography>\n<Typography truncate={3}>Three-line clamp</Typography>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="typography-page__section" id="tiers">
        <h2 className="typography-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="typography-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides CSS-only rendering.
          Standard adds weight overrides, alignment, truncation, and motion. Premium adds aurora glow effects and spring animations.
        </p>

        <div className="typography-page__tiers">
          {/* Lite */}
          <div
            className={`typography-page__tier-card${tier === 'lite' ? ' typography-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="typography-page__tier-header">
              <span className="typography-page__tier-name">Lite</span>
              <span className="typography-page__tier-size">~0.2 KB</span>
            </div>
            <p className="typography-page__tier-desc">
              CSS-only variant with semantic element mapping and color support.
              No weight override, alignment, or truncation props.
            </p>
            <div className="typography-page__tier-import">
              import {'{'} Typography {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="typography-page__tier-preview">
              <LiteTypography variant="h4">Lite Typography</LiteTypography>
            </div>
            <div className="typography-page__size-breakdown">
              <div className="typography-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`typography-page__tier-card${tier === 'standard' ? ' typography-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="typography-page__tier-header">
              <span className="typography-page__tier-name">Standard</span>
              <span className="typography-page__tier-size">~0.8 KB</span>
            </div>
            <p className="typography-page__tier-desc">
              Full-featured typography with weight, alignment, truncation,
              motion levels, and embedded scoped CSS.
            </p>
            <div className="typography-page__tier-import">
              import {'{'} Typography {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="typography-page__tier-preview">
              <Typography variant="h4" color="brand">Standard</Typography>
            </div>
            <div className="typography-page__size-breakdown">
              <div className="typography-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`typography-page__tier-card${tier === 'premium' ? ' typography-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="typography-page__tier-header">
              <span className="typography-page__tier-name">Premium</span>
              <span className="typography-page__tier-size">~3-5 KB</span>
            </div>
            <p className="typography-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="typography-page__tier-import">
              import {'{'} Typography {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="typography-page__tier-preview">
              <Typography variant="h4" color="brand">Standard</Typography>
            </div>
            <div className="typography-page__size-breakdown">
              <div className="typography-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="typography-page__section" id="props">
        <h2 className="typography-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="typography-page__section-desc">
          All props accepted by Typography. It also spreads any native HTML attributes
          onto the underlying element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={typographyProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="typography-page__section" id="accessibility">
        <h2 className="typography-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="typography-page__section-desc">
          Typography maps variants to correct semantic HTML elements automatically.
        </p>
        <Card variant="default" padding="md">
          <ul className="typography-page__a11y-list">
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic elements:</strong> h1-h6 variants render actual heading elements for screen reader navigation.
              </span>
            </li>
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color contrast:</strong> All color variants meet WCAG AA contrast ratio (4.5:1 for normal text).
              </span>
            </li>
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Fluid sizing:</strong> Uses <code className="typography-page__a11y-key">clamp()</code> for responsive sizing that respects user zoom preferences.
              </span>
            </li>
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="typography-page__a11y-key">forced-colors: active</code> with CanvasText fallback.
              </span>
            </li>
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Falls back to black text in print stylesheets for maximum readability.
              </span>
            </li>
            <li className="typography-page__a11y-item">
              <span className="typography-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Element override:</strong> Use the <code className="typography-page__a11y-key">as</code> prop to render a different element while keeping the variant styles.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
