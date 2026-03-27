'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Tooltip } from '@ui/components/tooltip'
import { Tooltip as LiteTooltip } from '@ui/lite/tooltip'
import { Tooltip as PremiumTooltip } from '@ui/premium/tooltip'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tooltip-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tooltip-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .tooltip-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .tooltip-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .tooltip-page__hero::before { animation: none; }
      }

      .tooltip-page__title {
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

      .tooltip-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tooltip-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tooltip-page__import-code {
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

      .tooltip-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .tooltip-page__section {
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
        animation: tooltip-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tooltip-section-reveal {
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
        .tooltip-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .tooltip-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .tooltip-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .tooltip-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .tooltip-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .tooltip-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      /* Subtle dot grid */
      .tooltip-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tooltip-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .tooltip-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .tooltip-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .tooltip-page__playground {
          grid-template-columns: 1fr;
        }
        .tooltip-page__playground-controls {
          position: static !important;
        }
      }

      @container tooltip-page (max-width: 680px) {
        .tooltip-page__playground {
          grid-template-columns: 1fr;
        }
        .tooltip-page__playground-controls {
          position: static !important;
        }
      }

      .tooltip-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tooltip-page__playground-result {
        overflow: visible;
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      /* Dot grid for playground result */
      .tooltip-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .tooltip-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tooltip-page__playground-controls {
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

      .tooltip-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tooltip-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tooltip-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tooltip-page__option-btn {
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
      .tooltip-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .tooltip-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tooltip-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .tooltip-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .tooltip-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .tooltip-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .tooltip-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .tooltip-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .tooltip-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tooltip-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .tooltip-page__tier-card {
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

      .tooltip-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tooltip-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .tooltip-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tooltip-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tooltip-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .tooltip-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .tooltip-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .tooltip-page__tier-import {
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

      .tooltip-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .tooltip-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .tooltip-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .tooltip-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .tooltip-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .tooltip-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .tooltip-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .tooltip-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .tooltip-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .tooltip-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .tooltip-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .tooltip-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tooltip-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .tooltip-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .tooltip-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .tooltip-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .tooltip-page__hero {
          padding: 2rem 1.25rem;
        }

        .tooltip-page__title {
          font-size: 1.75rem;
        }

        .tooltip-page__preview {
          padding: 1.75rem;
        }

        .tooltip-page__playground {
          grid-template-columns: 1fr;
        }

        .tooltip-page__playground-result {
          padding: 2rem;
          min-block-size: 300px;
        }

        .tooltip-page__labeled-row {
          gap: 1rem;
        }

        .tooltip-page__tiers {
          grid-template-columns: 1fr;
        }

        .tooltip-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .tooltip-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .tooltip-page__hero {
          padding: 1.5rem 1rem;
        }

        .tooltip-page__title {
          font-size: 1.5rem;
        }

        .tooltip-page__preview {
          padding: 1rem;
        }

        .tooltip-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .tooltip-page__title {
          font-size: 4rem;
        }

        .tooltip-page__preview {
          padding: 3.5rem;
        }

        .tooltip-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .tooltip-page__import-code,
      .tooltip-page code,
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

const tooltipProps: PropDef[] = [
  { name: 'content', type: 'ReactNode', description: 'The tooltip content to display. Can be a string or any React node for rich content.' },
  { name: 'children', type: 'ReactElement', description: 'The trigger element that the tooltip attaches to. Must be a single React element.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Preferred placement of the tooltip relative to the trigger element.' },
  { name: 'delay', type: 'number', default: '300', description: 'Delay in milliseconds before the tooltip appears on hover.' },
  { name: 'offset', type: 'number', default: '8', description: 'Distance in pixels between the tooltip and the trigger element.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the tooltip will not appear on hover or focus.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Placement = 'top' | 'bottom' | 'left' | 'right'

const PLACEMENTS: Placement[] = ['top', 'bottom', 'left', 'right']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Tooltip } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Tooltip } from '@annondeveloper/ui-kit'",
  premium: "import { Tooltip } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#64748b', name: 'Slate' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="tooltip-page__copy-btn"
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
    <div className="tooltip-page__control-group">
      <span className="tooltip-page__control-label">{label}</span>
      <div className="tooltip-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`tooltip-page__option-btn${opt === value ? ' tooltip-page__option-btn--active' : ''}`}
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
    <label className="tooltip-page__toggle-label">
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
  placement: Placement,
  delay: number,
  disabled: boolean,
  customContent: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}

<Tooltip content="Helpful tooltip text">
  <button>Hover me</button>
</Tooltip>`
  }

  const props: string[] = []
  if (customContent) {
    props.push(`  content={
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <strong>Rich tooltip</strong>
      <span>with custom content</span>
    </div>
  }`)
  } else {
    props.push('  content="Helpful tooltip text"')
  }
  if (placement !== 'top') props.push(`  placement="${placement}"`)
  if (delay !== 300) props.push(`  delay={${delay}}`)
  if (disabled) props.push('  disabled')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

<Tooltip
${props.join('\n')}
>
  <button>Hover me</button>
</Tooltip>`
}

function generateHtmlCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- Tooltip — @annondeveloper/ui-kit lite tier -->
<!-- Lite tooltip uses native title attribute -->
<span class="ui-lite-tooltip" title="Helpful tooltip text">
  <button>Hover me</button>
</span>`
  }

  return `<!-- Tooltip — @annondeveloper/ui-kit standard tier -->
<!-- The standard Tooltip requires React for positioning logic -->
<!-- For HTML-only, use the lite tier with native title attribute -->
<span class="ui-lite-tooltip" title="Helpful tooltip text">
  <button>Hover me</button>
</span>

<!-- Or use CSS-only tooltip with data attributes: -->
<style>
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  ${placement === 'bottom' ? 'top: 100%; left: 50%; transform: translateX(-50%);' : ''}${placement === 'top' ? 'bottom: 100%; left: 50%; transform: translateX(-50%);' : ''}${placement === 'left' ? 'right: 100%; top: 50%; transform: translateY(-50%);' : ''}${placement === 'right' ? 'left: 100%; top: 50%; transform: translateY(-50%);' : ''}
  padding: 0.25rem 0.5rem;
  background: oklch(22% 0.01 270);
  color: oklch(90% 0 0);
  font-size: 0.875rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}
[data-tooltip]:hover::after {
  opacity: 1;
}
</style>
<button data-tooltip="Helpful tooltip text">Hover me</button>`
}

function generateVueCode(tier: Tier, placement: Placement, delay: number, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <span class="ui-lite-tooltip" title="Helpful tooltip text">
    <button>Hover me</button>
  </span>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = ['  content="Helpful tooltip text"']
  if (placement !== 'top') attrs.push(`  placement="${placement}"`)
  if (delay !== 300) attrs.push(`  :delay="${delay}"`)
  if (disabled) attrs.push('  disabled')

  return `<template>
  <Tooltip
  ${attrs.join('\n  ')}
  >
    <button>Hover me</button>
  </Tooltip>
</template>

<script setup>
import { Tooltip } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<span class="ui-lite-tooltip" title="Helpful tooltip text">
  <button>Hover me</button>
</span>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<!-- Use the React wrapper or CSS-only approach -->
<button
  [attr.data-tooltip]="'Helpful tooltip text'"
  [attr.data-placement]="'${placement}'"
>
  Hover me
</button>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/tooltip.css';`
}

function generateSvelteCode(tier: Tier, placement: Placement, delay: number, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<span class="ui-lite-tooltip" title="Helpful tooltip text">
  <button>Hover me</button>
</span>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = ['  content="Helpful tooltip text"']
  if (placement !== 'top') attrs.push(`  placement="${placement}"`)
  if (delay !== 300) attrs.push(`  delay={${delay}}`)
  if (disabled) attrs.push('  disabled')

  return `<script>
  import { Tooltip } from '@annondeveloper/ui-kit';
</script>

<Tooltip
${attrs.join('\n')}
>
  <button>Hover me</button>
</Tooltip>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [placement, setPlacement] = useState<Placement>('top')
  const [delay, setDelay] = useState(300)
  const [disabled, setDisabled] = useState(false)
  const [customContent, setCustomContent] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const TooltipComponent = tier === 'premium' ? PremiumTooltip : Tooltip

  const reactCode = useMemo(
    () => generateReactCode(tier, placement, delay, disabled, customContent, motion),
    [tier, placement, delay, disabled, customContent, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, placement),
    [tier, placement],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, placement, delay, disabled),
    [tier, placement, delay, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, placement),
    [tier, placement],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, placement, delay, disabled),
    [tier, placement, delay, disabled],
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

  const tooltipContent = customContent
    ? (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <strong>Rich tooltip</strong>
        <span style={{ opacity: 0.8 }}>with custom content</span>
      </div>
    )
    : 'Helpful tooltip text'

  return (
    <section className="tooltip-page__section" id="playground">
      <h2 className="tooltip-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tooltip-page__section-desc">
        Tweak every prop and see the result in real-time. Hover or focus the trigger button to see the tooltip.
      </p>

      <div className="tooltip-page__playground">
        {/* Preview area */}
        <div className="tooltip-page__playground-preview">
          <div className="tooltip-page__playground-result">
            {tier === 'lite' ? (
              <LiteTooltip content="Helpful tooltip text">
                <button
                  type="button"
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  Hover me (Lite)
                </button>
              </LiteTooltip>
            ) : (
              <TooltipComponent
                content={tooltipContent}
                placement={placement}
                delay={delay}
                disabled={disabled}
                motion={motion}
              >
                <button
                  type="button"
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  Hover me
                </button>
              </TooltipComponent>
            )}
          </div>

          {/* Tabbed code output */}
          <div className="tooltip-page__code-tabs">
            <div className="tooltip-page__export-row">
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
              {copyStatus && <span className="tooltip-page__export-status">{copyStatus}</span>}
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
        <div className="tooltip-page__playground-controls">
          <OptionGroup label="Placement" options={PLACEMENTS} value={placement} onChange={setPlacement} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="tooltip-page__control-group">
            <span className="tooltip-page__control-label">Delay (ms)</span>
            <input
              type="number"
              value={delay}
              min={0}
              max={2000}
              step={50}
              onChange={e => setDelay(Number(e.target.value))}
              className="tooltip-page__text-input"
            />
          </div>

          <div className="tooltip-page__control-group">
            <span className="tooltip-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Custom content" checked={customContent} onChange={setCustomContent} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TooltipPage() {
  useStyles('tooltip-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()
  const TooltipComponent = tier === 'premium' ? PremiumTooltip : Tooltip

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.tooltip-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
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

  const triggerButtonStyle: React.CSSProperties = {
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'var(--text-sm)',
  }

  return (
    <div className="tooltip-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="tooltip-page__hero">
        <h1 className="tooltip-page__title">Tooltip</h1>
        <p className="tooltip-page__desc">
          Contextual overlay that appears on hover or focus to provide supplementary information.
          Positioned with smart anchor logic and animated entry. Ships in two weight tiers from
          0.2KB lite to 1.8KB standard with motion-aware animations.
        </p>
        <div className="tooltip-page__import-row">
          <code className="tooltip-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Placement Variants ────────────────────────── */}
      <section className="tooltip-page__section" id="placement">
        <h2 className="tooltip-page__section-title">
          <a href="#placement">Placement Variants</a>
        </h2>
        <p className="tooltip-page__section-desc">
          Four placement options position the tooltip relative to the trigger element.
          The arrow indicator automatically adjusts to match the placement direction.
        </p>
        <div className="tooltip-page__preview">
          <div className="tooltip-page__labeled-row" style={{ justifyContent: 'center' }}>
            {tier === 'lite' ? (
              PLACEMENTS.map(p => (
                <div key={p} className="tooltip-page__labeled-item">
                  <LiteTooltip content={`Tooltip on ${p}`}>
                    <button type="button" style={triggerButtonStyle}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  </LiteTooltip>
                  <span className="tooltip-page__item-label">{p}</span>
                </div>
              ))
            ) : (
              PLACEMENTS.map(p => (
                <div key={p} className="tooltip-page__labeled-item">
                  <TooltipComponent content={`Tooltip on ${p}`} placement={p}>
                    <button type="button" style={triggerButtonStyle}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  </TooltipComponent>
                  <span className="tooltip-page__item-label">{p}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Features ──────────────────────────────────── */}
      <section className="tooltip-page__section" id="features">
        <h2 className="tooltip-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="tooltip-page__section-desc">
          Configurable delay, arrow indicator, and rich custom content support.
        </p>

        {/* Delay variants */}
        <div style={{ marginBlockEnd: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
            Show Delay
          </h3>
          <div className="tooltip-page__preview">
            <div className="tooltip-page__labeled-row" style={{ justifyContent: 'center' }}>
              {tier === 'lite' ? (
                <>
                  <div className="tooltip-page__labeled-item">
                    <LiteTooltip content="Instant tooltip">
                      <button type="button" style={triggerButtonStyle}>Instant</button>
                    </LiteTooltip>
                    <span className="tooltip-page__item-label">native</span>
                  </div>
                </>
              ) : (
                [0, 150, 300, 500, 1000].map(d => (
                  <div key={d} className="tooltip-page__labeled-item">
                    <TooltipComponent content={`Appears after ${d}ms`} delay={d}>
                      <button type="button" style={triggerButtonStyle}>
                        {d === 0 ? 'Instant' : `${d}ms`}
                      </button>
                    </TooltipComponent>
                    <span className="tooltip-page__item-label">{d}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Arrow indicator */}
        <div style={{ marginBlockEnd: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
            Arrow Indicator
          </h3>
          <div className="tooltip-page__preview">
            {tier === 'lite' ? (
              <LiteTooltip content="Lite uses native title (no arrow)">
                <button type="button" style={triggerButtonStyle}>Hover me</button>
              </LiteTooltip>
            ) : (
              <div className="tooltip-page__labeled-row" style={{ justifyContent: 'center' }}>
                {PLACEMENTS.map(p => (
                  <div key={p} className="tooltip-page__labeled-item">
                    <TooltipComponent content={`Arrow on ${p}`} placement={p}>
                      <button type="button" style={triggerButtonStyle}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    </TooltipComponent>
                    <span className="tooltip-page__item-label">arrow {p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom content */}
        {tier !== 'lite' && (
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
              Custom Content
            </h3>
            <div className="tooltip-page__preview">
              <div className="tooltip-page__labeled-row" style={{ justifyContent: 'center' }}>
                <div className="tooltip-page__labeled-item">
                  <TooltipComponent content="Simple text tooltip">
                    <button type="button" style={triggerButtonStyle}>Text content</button>
                  </TooltipComponent>
                  <span className="tooltip-page__item-label">text</span>
                </div>
                <div className="tooltip-page__labeled-item">
                  <TooltipComponent
                    content={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ fontSize: '0.8125rem' }}>Keyboard shortcut</strong>
                        <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>Press Ctrl+S to save</span>
                      </div>
                    }
                  >
                    <button type="button" style={triggerButtonStyle}>Rich content</button>
                  </TooltipComponent>
                  <span className="tooltip-page__item-label">rich</span>
                </div>
                <div className="tooltip-page__labeled-item">
                  <TooltipComponent
                    content={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Icon name="info" size="sm" />
                        <span>With icon</span>
                      </div>
                    }
                  >
                    <button type="button" style={triggerButtonStyle}>With icon</button>
                  </TooltipComponent>
                  <span className="tooltip-page__item-label">icon</span>
                </div>
              </div>
            </div>
            <div style={{ marginBlockStart: '1rem' }}>
              <CopyBlock
                code={`<Tooltip
  content={
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <strong>Keyboard shortcut</strong>
      <span>Press Ctrl+S to save</span>
    </div>
  }
>
  <button>Hover me</button>
</Tooltip>`}
                language="typescript"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="tooltip-page__section" id="tiers">
        <h2 className="tooltip-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="tooltip-page__section-desc">
          Choose the right balance of features and bundle size. Tooltip ships in two tiers.
          The Premium tier uses the Standard implementation.
        </p>

        <div className="tooltip-page__tiers">
          {/* Lite */}
          <div
            className={`tooltip-page__tier-card${tier === 'lite' ? ' tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="tooltip-page__tier-header">
              <span className="tooltip-page__tier-name">Lite</span>
              <span className="tooltip-page__tier-size">~0.2 KB</span>
            </div>
            <p className="tooltip-page__tier-desc">
              CSS-only variant using native <code>title</code> attribute.
              Zero JavaScript positioning. Browser-native tooltip rendering.
            </p>
            <div className="tooltip-page__tier-import">
              import {'{'} Tooltip {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="tooltip-page__tier-preview">
              <LiteTooltip content="Lite tooltip">
                <button type="button" style={triggerButtonStyle}>Lite Tooltip</button>
              </LiteTooltip>
            </div>
            <div className="tooltip-page__size-breakdown">
              <div className="tooltip-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`tooltip-page__tier-card${tier === 'standard' ? ' tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="tooltip-page__tier-header">
              <span className="tooltip-page__tier-name">Standard</span>
              <span className="tooltip-page__tier-size">~1.8 KB</span>
            </div>
            <p className="tooltip-page__tier-desc">
              Full-featured tooltip with smart positioning, placement variants,
              configurable delay, motion animation, and arrow indicator.
            </p>
            <div className="tooltip-page__tier-import">
              import {'{'} Tooltip {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="tooltip-page__tier-preview">
              <Tooltip content="Standard tooltip" placement="top">
                <button type="button" style={triggerButtonStyle}>Standard Tooltip</button>
              </Tooltip>
            </div>
            <div className="tooltip-page__size-breakdown">
              <div className="tooltip-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`tooltip-page__tier-card${tier === 'premium' ? ' tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="tooltip-page__tier-header">
              <span className="tooltip-page__tier-name">Premium</span>
              <span className="tooltip-page__tier-size">~2.0 KB</span>
            </div>
            <p className="tooltip-page__tier-desc">
              Spring-scale entrance with blur-in, directional slide offsets,
              and aurora glow shadow around the tooltip panel. Wraps Standard with premium CSS layer.
            </p>
            <div className="tooltip-page__tier-import">
              import {'{'} Tooltip {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="tooltip-page__tier-preview">
              <PremiumTooltip content="Premium spring + glow" placement="top">
                <button type="button" style={triggerButtonStyle}>Premium Tooltip</button>
              </PremiumTooltip>
            </div>
            <div className="tooltip-page__size-breakdown">
              <div className="tooltip-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="tooltip-page__section" id="brand-color">
        <h2 className="tooltip-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="tooltip-page__section-desc">
          Pick a brand color to see tooltips update in real-time. The theme generates
          derived colors (light, dark, subtle, glow) automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="tooltip-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`tooltip-page__color-preset${brandColor === p.hex ? ' tooltip-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}

          {/* Preview with brand color */}
          <div className="tooltip-page__preview" style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <LiteTooltip content="Branded tooltip">
                <button type="button" style={triggerButtonStyle}>Hover for branded tooltip</button>
              </LiteTooltip>
            ) : (
              <div className="tooltip-page__labeled-row" style={{ justifyContent: 'center' }}>
                {PLACEMENTS.map(p => (
                  <TooltipComponent key={p} content={`Branded ${p} tooltip`} placement={p}>
                    <button type="button" style={triggerButtonStyle}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  </TooltipComponent>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="tooltip-page__section" id="props">
        <h2 className="tooltip-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="tooltip-page__section-desc">
          All props accepted by the Tooltip component. The Standard tier wraps the trigger element
          with event handlers and renders a positioned floating panel.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tooltipProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="tooltip-page__section" id="accessibility">
        <h2 className="tooltip-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="tooltip-page__section-desc">
          Built with WAI-ARIA tooltip pattern and comprehensive keyboard/screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="tooltip-page__a11y-list">
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Uses <code className="tooltip-page__a11y-key">role="tooltip"</code> with
                {' '}<code className="tooltip-page__a11y-key">aria-describedby</code> linking trigger to tooltip content.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Tooltip appears on <code className="tooltip-page__a11y-key">focus</code> and
                dismisses on <code className="tooltip-page__a11y-key">Escape</code> key.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Delay:</strong> Configurable show delay prevents accidental triggers while keeping content accessible.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch:</strong> Long-press (500ms) activates on touch devices. Dismisses on touch outside.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="tooltip-page__a11y-key">prefers-reduced-motion</code> and
                {' '}<code className="tooltip-page__a11y-key">prefers-reduced-data</code> media queries.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="tooltip-page__a11y-key">forced-colors: active</code> with visible borders
                on both the panel and arrow.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Tooltip is hidden in print via <code className="tooltip-page__a11y-key">@media print</code>.
              </span>
            </li>
            <li className="tooltip-page__a11y-item">
              <span className="tooltip-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Tooltip panel meets WCAG AA contrast ratio (4.5:1 text, 3:1 UI boundaries).
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ────────────────────────────────────── */}
      <section className="tooltip-page__section" id="source">
        <h2 className="tooltip-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="tooltip-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/tooltip.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="tooltip-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/tooltip.tsx — Standard tier
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/tooltip.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="tooltip-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/tooltip.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
