'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Breadcrumbs } from '@ui/components/breadcrumbs'
import { Breadcrumbs as LiteBreadcrumbs } from '@ui/lite/breadcrumbs'
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
    @scope (.breadcrumbs-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: breadcrumbs-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .breadcrumbs-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .breadcrumbs-page__hero::before {
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
        animation: breadcrumbs-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes breadcrumbs-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .breadcrumbs-page__hero::before { animation: none; }
      }

      .breadcrumbs-page__title {
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

      .breadcrumbs-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .breadcrumbs-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .breadcrumbs-page__import-code {
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

      .breadcrumbs-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .breadcrumbs-page__section {
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
        animation: breadcrumbs-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes breadcrumbs-section-reveal {
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
        .breadcrumbs-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .breadcrumbs-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .breadcrumbs-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .breadcrumbs-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .breadcrumbs-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .breadcrumbs-page__preview {
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

      .breadcrumbs-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .breadcrumbs-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .breadcrumbs-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .breadcrumbs-page__playground {
          grid-template-columns: 1fr;
        }
        .breadcrumbs-page__playground-controls {
          position: static !important;
        }
      }

      @container breadcrumbs-page (max-width: 680px) {
        .breadcrumbs-page__playground {
          grid-template-columns: 1fr;
        }
        .breadcrumbs-page__playground-controls {
          position: static !important;
        }
      }

      .breadcrumbs-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .breadcrumbs-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .breadcrumbs-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .breadcrumbs-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .breadcrumbs-page__playground-controls {
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

      .breadcrumbs-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .breadcrumbs-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .breadcrumbs-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .breadcrumbs-page__option-btn {
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
      .breadcrumbs-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .breadcrumbs-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .breadcrumbs-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .breadcrumbs-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .breadcrumbs-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .breadcrumbs-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .breadcrumbs-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .breadcrumbs-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .breadcrumbs-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .breadcrumbs-page__tier-card {
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

      .breadcrumbs-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .breadcrumbs-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .breadcrumbs-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .breadcrumbs-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .breadcrumbs-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .breadcrumbs-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .breadcrumbs-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .breadcrumbs-page__tier-import {
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

      .breadcrumbs-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .breadcrumbs-page__code-tabs {
        margin-block-start: 1rem;
      }

      .breadcrumbs-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .breadcrumbs-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .breadcrumbs-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .breadcrumbs-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .breadcrumbs-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .breadcrumbs-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ──────────────────────────────── */

      .breadcrumbs-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .breadcrumbs-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .breadcrumbs-page__hero {
          padding: 2rem 1.25rem;
        }

        .breadcrumbs-page__title {
          font-size: 1.75rem;
        }

        .breadcrumbs-page__preview {
          padding: 1.75rem;
        }

        .breadcrumbs-page__playground {
          grid-template-columns: 1fr;
        }

        .breadcrumbs-page__playground-result {
          padding: 2rem;
          min-block-size: 80px;
        }

        .breadcrumbs-page__labeled-row {
          gap: 1rem;
        }

        .breadcrumbs-page__tiers {
          grid-template-columns: 1fr;
        }

        .breadcrumbs-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .breadcrumbs-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .breadcrumbs-page__hero {
          padding: 1.5rem 1rem;
        }

        .breadcrumbs-page__title {
          font-size: 1.5rem;
        }

        .breadcrumbs-page__preview {
          padding: 1rem;
        }

        .breadcrumbs-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .breadcrumbs-page__title {
          font-size: 4rem;
        }

        .breadcrumbs-page__preview {
          padding: 3.5rem;
        }

        .breadcrumbs-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .breadcrumbs-page__import-code,
      .breadcrumbs-page code,
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

const breadcrumbsProps: PropDef[] = [
  { name: 'items', type: 'BreadcrumbItem[]', required: true, description: 'Array of breadcrumb items with label, optional href, and optional icon.' },
  { name: 'separator', type: 'ReactNode', default: '<ChevronRight />', description: 'Custom separator element between items. Defaults to a chevron-right SVG icon.' },
  { name: 'maxVisible', type: 'number', description: 'Maximum number of visible items. When exceeded, middle items collapse to an ellipsis.' },
  { name: 'onNavigate', type: '(href: string) => void', description: 'Custom navigation handler. When provided, prevents default link behavior for SPA routing.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying <nav> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SeparatorType = 'chevron' | 'slash' | 'arrow' | 'dot'

const SEPARATORS: SeparatorType[] = ['chevron', 'slash', 'arrow', 'dot']

const SEPARATOR_MAP: Record<SeparatorType, string> = {
  chevron: 'default',
  slash: '/',
  arrow: '>',
  dot: '·',
}

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Breadcrumbs } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Breadcrumbs } from '@annondeveloper/ui-kit'",
  premium: "import { Breadcrumbs } from '@annondeveloper/ui-kit/premium'",
}

const SAMPLE_ITEMS_SHORT = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget Pro' },
]

const SAMPLE_ITEMS_LONG = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Computers', href: '/products/electronics/computers' },
  { label: 'Laptops', href: '/products/electronics/computers/laptops' },
  { label: 'MacBook Pro 16"' },
]

const P = 'breadcrumbs-page__'

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

function buildItems(count: number): { label: string; href?: string }[] {
  const labels = ['Home', 'Products', 'Electronics', 'Computers', 'Laptops', 'Accessories', 'Peripherals', 'Keyboards', 'Mechanical', 'Details']
  return Array.from({ length: count }, (_, i) => ({
    label: labels[i] || `Level ${i + 1}`,
    ...(i < count - 1 ? { href: `/${labels[i]?.toLowerCase() || `level-${i + 1}`}` } : {}),
  }))
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  itemCount: number,
  separator: SeparatorType,
  maxVisible: number | null,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const items = buildItems(itemCount)
  const itemsStr = `[\n${items.map(it => `    { label: '${it.label}'${it.href ? `, href: '${it.href}'` : ''} }`).join(',\n')}\n  ]`

  const props: string[] = [`  items={${itemsStr}}`]
  if (separator !== 'chevron') props.push(`  separator="${SEPARATOR_MAP[separator]}"`)
  if (maxVisible != null) props.push(`  maxVisible={${maxVisible}}`)

  return `${importStr}

function MyBreadcrumbs() {
  return (
    <Breadcrumbs
${props.join('\n')}
    />
  )
}`
}

function generateHtmlCode(tier: Tier, itemCount: number, separator: SeparatorType): string {
  const items = buildItems(itemCount)
  const className = tier === 'lite' ? 'ui-lite-breadcrumbs' : 'ui-breadcrumbs'
  const sep = SEPARATOR_MAP[separator] === 'default' ? '/' : SEPARATOR_MAP[separator]

  return `<!-- Breadcrumbs — @annondeveloper/ui-kit ${tier} tier -->
<nav class="${className}" aria-label="Breadcrumb">
  <ol>
${items.map((it, i) => {
  const sepHtml = i > 0 ? `    <span class="${className}__sep" aria-hidden="true">${sep}</span>\n` : ''
  if (i === items.length - 1) {
    return `${sepHtml}    <li><span aria-current="page">${it.label}</span></li>`
  }
  return `${sepHtml}    <li><a href="${it.href}">${it.label}</a></li>`
}).join('\n')}
  </ol>
</nav>`
}

function generateVueCode(tier: Tier, itemCount: number, separator: SeparatorType): string {
  const items = buildItems(itemCount)
  const itemsStr = `[\n${items.map(it => `      { label: '${it.label}'${it.href ? `, href: '${it.href}'` : ''} }`).join(',\n')}\n    ]`

  if (tier === 'lite') {
    const sep = SEPARATOR_MAP[separator] === 'default' ? '/' : SEPARATOR_MAP[separator]
    return `<template>
  <nav class="ui-lite-breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <span v-if="i > 0" class="ui-lite-breadcrumbs__sep" aria-hidden="true">${sep}</span>
        <a v-if="item.href" :href="item.href">{{ item.label }}</a>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
const items = ${itemsStr}
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = [':items="items"']
  if (separator !== 'chevron') props.push(`separator="${SEPARATOR_MAP[separator]}"`)

  return `<template>
  <Breadcrumbs ${props.join(' ')} />
</template>

<script setup>
import { Breadcrumbs } from '@annondeveloper/ui-kit'
const items = ${itemsStr}
</script>`
}

function generateAngularCode(tier: Tier, itemCount: number, separator: SeparatorType): string {
  const items = buildItems(itemCount)
  const sep = SEPARATOR_MAP[separator] === 'default' ? '/' : SEPARATOR_MAP[separator]

  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<nav class="ui-lite-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li *ngFor="let item of items; let i = index">
      <span *ngIf="i > 0" class="ui-lite-breadcrumbs__sep" aria-hidden="true">${sep}</span>
      <a *ngIf="item.href" [href]="item.href">{{ item.label }}</a>
      <span *ngIf="!item.href" aria-current="page">{{ item.label }}</span>
    </li>
  </ol>
</nav>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<nav class="ui-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    <li *ngFor="let item of items; let i = index; let last = last">
      <span *ngIf="i > 0" class="ui-breadcrumbs__separator" aria-hidden="true">${sep}</span>
      <a *ngIf="!last" [href]="item.href">{{ item.label }}</a>
      <span *ngIf="last" class="ui-breadcrumbs__current" aria-current="page">{{ item.label }}</span>
    </li>
  </ol>
</nav>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/breadcrumbs.css';`
}

function generateSvelteCode(tier: Tier, itemCount: number, separator: SeparatorType): string {
  const items = buildItems(itemCount)
  const itemsStr = `[\n${items.map(it => `    { label: '${it.label}'${it.href ? `, href: '${it.href}'` : ''} }`).join(',\n')}\n  ]`
  const sep = SEPARATOR_MAP[separator] === 'default' ? '/' : SEPARATOR_MAP[separator]

  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<script>
  const items = ${itemsStr}
</script>

<nav class="ui-lite-breadcrumbs" aria-label="Breadcrumb">
  <ol>
    {#each items as item, i}
      <li>
        {#if i > 0}
          <span class="ui-lite-breadcrumbs__sep" aria-hidden="true">${sep}</span>
        {/if}
        {#if item.href}
          <a href={item.href}>{item.label}</a>
        {:else}
          <span aria-current="page">{item.label}</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = ['{items}']
  if (separator !== 'chevron') props.push(`separator="${SEPARATOR_MAP[separator]}"`)

  return `<script>
  import { Breadcrumbs } from '@annondeveloper/ui-kit'
  const items = ${itemsStr}
</script>

<Breadcrumbs ${props.join(' ')} />`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [itemCount, setItemCount] = useState(4)
  const [separator, setSeparator] = useState<SeparatorType>('chevron')
  const [useMaxVisible, setUseMaxVisible] = useState(false)
  const [maxVisible, setMaxVisible] = useState(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const items = useMemo(() => buildItems(itemCount), [itemCount])

  const separatorNode = separator === 'chevron' ? undefined : SEPARATOR_MAP[separator]

  const reactCode = useMemo(
    () => generateReactCode(tier, itemCount, separator, useMaxVisible && tier !== 'lite' ? maxVisible : null),
    [tier, itemCount, separator, useMaxVisible, maxVisible],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, itemCount, separator),
    [tier, itemCount, separator],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, itemCount, separator),
    [tier, itemCount, separator],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, itemCount, separator),
    [tier, itemCount, separator],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, itemCount, separator),
    [tier, itemCount, separator],
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

  const liteItems = items.map(it => ({ label: it.label, href: it.href }))

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
              <LiteBreadcrumbs
                items={liteItems}
                separator={separatorNode}
              />
            ) : (
              <Breadcrumbs
                items={items}
                separator={separatorNode}
                maxVisible={useMaxVisible ? maxVisible : undefined}
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
          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Items Count</span>
            <input
              type="number"
              min={2}
              max={10}
              value={itemCount}
              onChange={e => {
                const v = Number(e.target.value)
                if (v >= 2 && v <= 10) setItemCount(v)
              }}
              className={`${P}text-input`}
            />
          </div>

          <OptionGroup label="Separator" options={SEPARATORS} value={separator} onChange={setSeparator} />

          {tier !== 'lite' && (
            <div className={`${P}control-group`}>
              <span className={`${P}control-label`}>Collapse</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Collapsible (maxVisible)" checked={useMaxVisible} onChange={setUseMaxVisible} />
                {useMaxVisible && (
                  <input
                    type="number"
                    min={2}
                    max={itemCount}
                    value={maxVisible}
                    onChange={e => {
                      const v = Number(e.target.value)
                      if (v >= 2 && v <= itemCount) setMaxVisible(v)
                    }}
                    className={`${P}text-input`}
                    style={{ marginBlockStart: '0.25rem' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BreadcrumbsPage() {
  useStyles('breadcrumbs-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.breadcrumbs-page__section')
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
  const BreadcrumbsComponent = tier === 'lite' ? LiteBreadcrumbs : Breadcrumbs

  return (
    <div className="breadcrumbs-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className={`${P}hero`}>
        <h1 className={`${P}title`}>Breadcrumbs</h1>
        <p className={`${P}desc`}>
          Hierarchical navigation trail with custom separators, collapsible paths, and SPA routing support.
          Ships in two weight tiers from a minimal CSS-only lite to a full-featured standard with collapse logic.
        </p>
        <div className={`${P}import-row`}>
          <code className={`${P}import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Separators ──────────────────────────────── */}
      <section className={`${P}section`} id="separators">
        <h2 className={`${P}section-title`}>
          <a href="#separators">Separator Styles</a>
        </h2>
        <p className={`${P}section-desc`}>
          Customize the separator between breadcrumb items. Pass any ReactNode as the separator prop or use the built-in chevron default.
        </p>
        <div className={`${P}preview ${P}preview--col`} style={{ gap: '1.5rem' }}>
          <div className={`${P}labeled-item`} style={{ width: '100%' }}>
            {tier === 'lite' ? (
              <LiteBreadcrumbs items={SAMPLE_ITEMS_SHORT} />
            ) : (
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} />
            )}
            <span className={`${P}item-label`}>default (chevron)</span>
          </div>
          <div className={`${P}labeled-item`} style={{ width: '100%' }}>
            {tier === 'lite' ? (
              <LiteBreadcrumbs items={SAMPLE_ITEMS_SHORT} separator="/" />
            ) : (
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} separator="/" />
            )}
            <span className={`${P}item-label`}>slash</span>
          </div>
          <div className={`${P}labeled-item`} style={{ width: '100%' }}>
            {tier === 'lite' ? (
              <LiteBreadcrumbs items={SAMPLE_ITEMS_SHORT} separator=">" />
            ) : (
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} separator=">" />
            )}
            <span className={`${P}item-label`}>arrow</span>
          </div>
          <div className={`${P}labeled-item`} style={{ width: '100%' }}>
            {tier === 'lite' ? (
              <LiteBreadcrumbs items={SAMPLE_ITEMS_SHORT} separator="·" />
            ) : (
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} separator="·" />
            )}
            <span className={`${P}item-label`}>dot</span>
          </div>
        </div>
      </section>

      {/* ── 4. Collapsible Paths ──────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="collapsible">
          <h2 className={`${P}section-title`}>
            <a href="#collapsible">Collapsible Paths</a>
          </h2>
          <p className={`${P}section-desc`}>
            When paths get deep, use maxVisible to collapse middle items into an ellipsis. The first and last items always remain visible.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '1.5rem' }}>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Breadcrumbs items={SAMPLE_ITEMS_LONG} />
              <span className={`${P}item-label`}>no collapse (6 items)</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Breadcrumbs items={SAMPLE_ITEMS_LONG} maxVisible={4} />
              <span className={`${P}item-label`}>maxVisible=4</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Breadcrumbs items={SAMPLE_ITEMS_LONG} maxVisible={3} />
              <span className={`${P}item-label`}>maxVisible=3</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Breadcrumbs items={SAMPLE_ITEMS_LONG} maxVisible={2} />
              <span className={`${P}item-label`}>maxVisible=2</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. With Icons ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="icons">
          <h2 className={`${P}section-title`}>
            <a href="#icons">With Icons</a>
          </h2>
          <p className={`${P}section-desc`}>
            Breadcrumb items can include leading icons for better visual hierarchy and recognition.
          </p>
          <div className={`${P}preview`}>
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/', icon: <Icon name="home" size="sm" /> },
                { label: 'Settings', href: '/settings', icon: <Icon name="settings" size="sm" /> },
                { label: 'Profile', icon: <Icon name="user" size="sm" /> },
              ]}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Breadcrumbs
  items={[
    { label: 'Home', href: '/', icon: <Icon name="home" size="sm" /> },
    { label: 'Settings', href: '/settings', icon: <Icon name="settings" size="sm" /> },
    { label: 'Profile', icon: <Icon name="user" size="sm" /> },
  ]}
/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. SPA Routing ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="spa-routing">
          <h2 className={`${P}section-title`}>
            <a href="#spa-routing">SPA Routing</a>
          </h2>
          <p className={`${P}section-desc`}>
            Use the onNavigate callback to integrate with your SPA router (React Router, Next.js, etc.). It prevents default link behavior and passes the href.
          </p>
          <div style={{ marginBlockStart: '0.5rem' }}>
            <CopyBlock
              code={`import { useNavigate } from 'react-router-dom'
import { Breadcrumbs } from '@annondeveloper/ui-kit'

function MyPage() {
  const navigate = useNavigate()

  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Widget Pro' },
      ]}
      onNavigate={(href) => navigate(href)}
    />
  )
}`}
              language="typescript"
              showLineNumbers
            />
          </div>
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className={`${P}section`} id="tiers">
        <h2 className={`${P}section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${P}section-desc`}>
          Choose the right balance of features and bundle size. Breadcrumbs ships as Lite (CSS-only) and Standard (full-featured).
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
              CSS-only breadcrumbs. Simple list with separator. No collapse, no onNavigate, no icons.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Breadcrumbs {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${P}tier-preview`}>
              <LiteBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Page' }]} />
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
              <span className={`${P}tier-size`}>~1.4 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Full-featured breadcrumbs with collapsible paths, custom separators, icon support, SPA routing, and full accessibility.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Breadcrumbs {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${P}tier-preview`}>
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.3 KB</strong> gzip</span>
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
              import {'{'} Breadcrumbs {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${P}tier-preview`}>
              <Breadcrumbs items={SAMPLE_ITEMS_SHORT} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.3 KB</strong> gzip</span>
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
          All props accepted by Breadcrumbs. It also spreads any native nav HTML attributes
          onto the underlying {'<nav>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={breadcrumbsProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className={`${P}section`} id="accessibility">
        <h2 className={`${P}section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${P}section-desc`}>
          Built on the native {'<nav>'} element with an ordered list following WAI-ARIA Breadcrumb pattern.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${P}a11y-list`}>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Navigation landmark:</strong> Wrapped in <code className={`${P}a11y-key`}>{'<nav aria-label="Breadcrumb">'}</code> for screen reader landmark navigation.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Ordered list:</strong> Uses semantic <code className={`${P}a11y-key`}>{'<ol>'}</code> element to convey hierarchy to screen readers.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Current page:</strong> Last item marked with <code className={`${P}a11y-key`}>aria-current="page"</code> for screen reader announcement.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden separators:</strong> Separator elements use <code className={`${P}a11y-key`}>aria-hidden="true"</code> to prevent screen reader clutter.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus ring:</strong> Visible <code className={`${P}a11y-key`}>:focus-visible</code> outline with brand-colored ring on keyboard navigation.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className={`${P}a11y-key`}>@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className={`${P}a11y-key`}>forced-colors: active</code> with proper link and text colors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
