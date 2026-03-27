'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TruncatedText } from '@ui/domain/truncated-text'
import { TruncatedText as LiteTruncatedText } from '@ui/lite/truncated-text'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.truncated-text-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: truncated-text-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .truncated-text-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .truncated-text-page__hero::before {
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
        animation: truncated-text-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes truncated-text-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .truncated-text-page__hero::before { animation: none; }
      }

      .truncated-text-page__title {
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

      .truncated-text-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .truncated-text-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .truncated-text-page__import-code {
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

      .truncated-text-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .truncated-text-page__section {
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
        animation: truncated-text-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes truncated-text-section-reveal {
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
        .truncated-text-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .truncated-text-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .truncated-text-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .truncated-text-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .truncated-text-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .truncated-text-page__preview {
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

      .truncated-text-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .truncated-text-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .truncated-text-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .truncated-text-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .truncated-text-page__playground {
          grid-template-columns: 1fr;
        }
        .truncated-text-page__playground-controls {
          position: static !important;
        }
      }

      @container truncated-text-page (max-width: 680px) {
        .truncated-text-page__playground {
          grid-template-columns: 1fr;
        }
        .truncated-text-page__playground-controls {
          position: static !important;
        }
      }

      .truncated-text-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .truncated-text-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .truncated-text-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .truncated-text-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .truncated-text-page__playground-controls {
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

      .truncated-text-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .truncated-text-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .truncated-text-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .truncated-text-page__option-btn {
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
      .truncated-text-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .truncated-text-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .truncated-text-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .truncated-text-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .truncated-text-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .truncated-text-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .truncated-text-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .truncated-text-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .truncated-text-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .truncated-text-page__tier-card {
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

      .truncated-text-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .truncated-text-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .truncated-text-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .truncated-text-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .truncated-text-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .truncated-text-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .truncated-text-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .truncated-text-page__tier-import {
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

      .truncated-text-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .truncated-text-page__code-tabs {
        margin-block-start: 1rem;
      }

      .truncated-text-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .truncated-text-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .truncated-text-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .truncated-text-page__color-preset {
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
      .truncated-text-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .truncated-text-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .truncated-text-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .truncated-text-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .truncated-text-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .truncated-text-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .truncated-text-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .truncated-text-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .truncated-text-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .truncated-text-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .truncated-text-page__hero {
          padding: 2rem 1.25rem;
        }

        .truncated-text-page__title {
          font-size: 1.75rem;
        }

        .truncated-text-page__preview {
          padding: 1.75rem;
        }

        .truncated-text-page__playground {
          grid-template-columns: 1fr;
        }

        .truncated-text-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .truncated-text-page__labeled-row {
          gap: 1rem;
        }

        .truncated-text-page__tiers {
          grid-template-columns: 1fr;
        }

        .truncated-text-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .truncated-text-page__hero {
          padding: 1.5rem 1rem;
        }

        .truncated-text-page__title {
          font-size: 1.5rem;
        }

        .truncated-text-page__preview {
          padding: 1rem;
        }

        .truncated-text-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .truncated-text-page__title {
          font-size: 4rem;
        }

        .truncated-text-page__preview {
          padding: 3.5rem;
        }

        .truncated-text-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .truncated-text-page__import-code,
      .truncated-text-page code,
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

const truncatedTextProps: PropDef[] = [
  { name: 'text', type: 'string', description: 'The text content to display with truncation.' },
  { name: 'lines', type: 'number', default: '1', description: 'Number of lines before truncation. 1 = single-line ellipsis, 2+ = multi-line clamp.' },
  { name: 'expandable', type: 'boolean', default: 'false', description: 'Show a "Show more" / "Show less" toggle button below the text.' },
  { name: 'showTooltip', type: 'boolean', default: 'true', description: 'Show the full text as a native title tooltip on hover when truncated.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TruncatedText } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TruncatedText } from '@annondeveloper/ui-kit'",
  premium: "import { TruncatedText } from '@annondeveloper/ui-kit/premium'",
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

const SAMPLE_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

const SAMPLE_SHORT = 'This is a short piece of text that will be truncated when it overflows its container boundary.'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="truncated-text-page__copy-btn"
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
    <div className="truncated-text-page__control-group">
      <span className="truncated-text-page__control-label">{label}</span>
      <div className="truncated-text-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`truncated-text-page__option-btn${opt === value ? ' truncated-text-page__option-btn--active' : ''}`}
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
    <label className="truncated-text-page__toggle-label">
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
  text: string,
  lines: number,
  expandable: boolean,
  showTooltip: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push(`  text="${text.length > 60 ? text.slice(0, 57) + '...' : text}"`)
  if (lines !== 1) props.push(`  lines={${lines}}`)
  if (expandable && tier !== 'lite') props.push('  expandable')
  if (!showTooltip) props.push('  showTooltip={false}')

  const jsx = `<TruncatedText\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(text: string, lines: number): string {
  return `<!-- TruncatedText — CSS-only approach -->
<span class="ui-truncated-text" data-lines="${lines}" title="${text.length > 60 ? text.slice(0, 57) + '...' : text}">
  <span class="ui-truncated-text__content" style="--lines: ${lines}">
    ${text}
  </span>
</span>

<!-- Import component CSS -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/truncated-text.css">

<!-- For expandable behavior, add JS to toggle data-expanded attribute -->`
}

function generateVueCode(tier: Tier, text: string, lines: number, expandable: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  text="${text.length > 60 ? text.slice(0, 57) + '...' : text}"`]
  if (lines !== 1) attrs.push(`  :lines="${lines}"`)
  if (expandable && tier !== 'lite') attrs.push('  expandable')

  return `<template>\n  <TruncatedText\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { TruncatedText } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, text: string, lines: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — Use the CSS-only approach -->
<span
  class="ui-truncated-text"
  [attr.data-lines]="${lines}"
  [title]="'${text.length > 60 ? text.slice(0, 57) + '...' : text}'"
>
  <span class="ui-truncated-text__content" [style.--lines]="${lines}">
    {{ text }}
  </span>
</span>

/* Import component CSS */
@import '${importPath}/css/components/truncated-text.css';`
}

function generateSvelteCode(tier: Tier, text: string, lines: number, expandable: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  text="${text.length > 60 ? text.slice(0, 57) + '...' : text}"`]
  if (lines !== 1) attrs.push(`  lines={${lines}}`)
  if (expandable && tier !== 'lite') attrs.push('  expandable')

  return `<script>\n  import { TruncatedText } from '${importPath}';\n</script>\n\n<TruncatedText\n${attrs.join('\n')}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [text, setText] = useState(SAMPLE_TEXT)
  const [lines, setLines] = useState(2)
  const [expandable, setExpandable] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const TextComponent = tier === 'lite' ? LiteTruncatedText : TruncatedText

  const reactCode = useMemo(
    () => generateReactCode(tier, text, lines, expandable, showTooltip),
    [tier, text, lines, expandable, showTooltip],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(text, lines),
    [text, lines],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, text, lines, expandable),
    [tier, text, lines, expandable],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, text, lines),
    [tier, text, lines],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, text, lines, expandable),
    [tier, text, lines, expandable],
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
    text,
    lines,
  }
  if (tier !== 'lite') {
    previewProps.expandable = expandable
    previewProps.showTooltip = showTooltip
  }

  return (
    <section className="truncated-text-page__section" id="playground">
      <h2 className="truncated-text-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="truncated-text-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="truncated-text-page__playground">
        <div className="truncated-text-page__playground-preview">
          <div className="truncated-text-page__playground-result">
            <div style={{ maxInlineSize: '400px', position: 'relative', fontSize: '1rem', lineHeight: 1.6 }}>
              <TextComponent {...previewProps as any} />
            </div>
          </div>

          <div className="truncated-text-page__code-tabs">
            <div className="truncated-text-page__export-row">
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
              {copyStatus && <span className="truncated-text-page__export-status">{copyStatus}</span>}
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

        <div className="truncated-text-page__playground-controls">
          <OptionGroup
            label="Lines"
            options={['1', '2', '3', '4', '5'] as const}
            value={String(lines) as '1' | '2' | '3' | '4' | '5'}
            onChange={v => setLines(Number(v))}
          />

          <div className="truncated-text-page__control-group">
            <span className="truncated-text-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Expandable" checked={expandable} onChange={setExpandable} />}
              {tier !== 'lite' && <Toggle label="Show tooltip" checked={showTooltip} onChange={setShowTooltip} />}
            </div>
          </div>

          <div className="truncated-text-page__control-group">
            <span className="truncated-text-page__control-label">Text</span>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="truncated-text-page__text-input"
              placeholder="Text content..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TruncatedTextPage() {
  useStyles('truncated-text-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

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
    const sections = document.querySelectorAll('.truncated-text-page__section')
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

  const TextComponent = tier === 'lite' ? LiteTruncatedText : TruncatedText

  return (
    <div className="truncated-text-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="truncated-text-page__hero">
        <h1 className="truncated-text-page__title">TruncatedText</h1>
        <p className="truncated-text-page__desc">
          Smart text truncation with single-line ellipsis and multi-line clamping. Includes an
          expandable toggle, native tooltip on hover, and proper accessibility for clipped content.
        </p>
        <div className="truncated-text-page__import-row">
          <code className="truncated-text-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Line Clamp ─────────────────────────────── */}
      <section className="truncated-text-page__section" id="lines">
        <h2 className="truncated-text-page__section-title">
          <a href="#lines">Line Clamping</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          Control the number of visible lines before truncation. Single-line uses text-overflow: ellipsis,
          multi-line uses -webkit-line-clamp for cross-browser multi-line truncation.
        </p>
        <div className="truncated-text-page__preview truncated-text-page__preview--col" style={{ gap: '2rem' }}>
          {[1, 2, 3, 4].map(l => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxInlineSize: '400px', inlineSize: '100%' }}>
              <span className="truncated-text-page__item-label">lines={l}</span>
              <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                <TruncatedText text={SAMPLE_TEXT} lines={l} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Expandable ─────────────────────────────── */}
      {tier !== 'lite' ? (
        <section className="truncated-text-page__section" id="expandable">
          <h2 className="truncated-text-page__section-title">
            <a href="#expandable">Expandable Toggle</a>
          </h2>
          <p className="truncated-text-page__section-desc">
            Enable the expandable prop to show a "Show more" / "Show less" toggle button.
            The toggle uses aria-expanded for screen reader support and brand-colored styling.
          </p>
          <div className="truncated-text-page__preview truncated-text-page__preview--col" style={{ gap: '2rem' }}>
            <div style={{ maxInlineSize: '400px', inlineSize: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>2-line with expand</span>
                <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  <TruncatedText text={SAMPLE_TEXT} lines={2} expandable />
                </div>
              </div>
            </div>
            <div style={{ maxInlineSize: '400px', inlineSize: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>3-line with expand</span>
                <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  <TruncatedText text={SAMPLE_TEXT} lines={3} expandable />
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<TruncatedText\n  text="Long text content..."\n  lines={2}\n  expandable\n/>`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="truncated-text-page__section" id="expandable">
          <h2 className="truncated-text-page__section-title">
            <a href="#expandable">Expandable Toggle</a>
          </h2>
          <p className="truncated-text-page__section-desc">
            The expandable toggle allows users to reveal the full text content.
          </p>
          <p className="truncated-text-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Expandable toggle requires Standard or Premium tier. The Lite tier provides CSS-only truncation.
          </p>
        </section>
      )}

      {/* ── 5. Tooltip ────────────────────────────────── */}
      <section className="truncated-text-page__section" id="tooltip">
        <h2 className="truncated-text-page__section-title">
          <a href="#tooltip">Tooltip on Hover</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          By default, the full text appears as a native title tooltip when hovering over truncated content.
          This provides a quick way to read the full text without expanding. Disable with showTooltip={'{false}'}.
        </p>
        <div className="truncated-text-page__preview truncated-text-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ maxInlineSize: '300px', inlineSize: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>With tooltip (hover me)</span>
              <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                <TruncatedText text={SAMPLE_SHORT} lines={1} showTooltip />
              </div>
            </div>
          </div>
          <div style={{ maxInlineSize: '300px', inlineSize: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Without tooltip</span>
              <div style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
                <TruncatedText text={SAMPLE_SHORT} lines={1} showTooltip={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Real World Examples ────────────────────── */}
      <section className="truncated-text-page__section" id="examples">
        <h2 className="truncated-text-page__section-title">
          <a href="#examples">Real World Examples</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          Common scenarios where TruncatedText improves layout consistency and user experience.
        </p>
        <div className="truncated-text-page__preview truncated-text-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Card description</span>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', maxInlineSize: '300px' }}>
              <div style={{ fontWeight: 600, marginBlockEnd: '0.375rem' }}>Component Library</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <TruncatedText
                  text="A comprehensive collection of 62 React components with physics-based animations, OKLCH color system, and Aurora Fluid design identity. Zero external dependencies."
                  lines={2}
                  expandable={tier !== 'lite'}
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Table cell</span>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', maxInlineSize: '200px' }}>
              <div style={{ fontSize: '0.875rem' }}>
                <TruncatedText text="very-long-file-name-that-exceeds-the-available-space.component.tsx" lines={1} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Comment thread</span>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', maxInlineSize: '350px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBlockEnd: '0.5rem' }}>
                <div style={{ inlineSize: '24px', blockSize: '24px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>User</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>2h ago</span>
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                <TruncatedText
                  text="This is a really detailed comment about the implementation that goes into great depth about the technical decisions made and the reasoning behind each choice in the architecture."
                  lines={3}
                  expandable={tier !== 'lite'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="truncated-text-page__section" id="tiers">
        <h2 className="truncated-text-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier provides CSS-only
          truncation, Standard adds expandable toggle and tooltip control, and Premium adds
          animated expand/collapse transitions.
        </p>

        <div className="truncated-text-page__tiers">
          {/* Lite */}
          <div
            className={`truncated-text-page__tier-card${tier === 'lite' ? ' truncated-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="truncated-text-page__tier-header">
              <span className="truncated-text-page__tier-name">Lite</span>
              <span className="truncated-text-page__tier-size">~0.2 KB</span>
            </div>
            <p className="truncated-text-page__tier-desc">
              CSS-only truncation with single and multi-line support. Uses -webkit-line-clamp
              for multi-line. No expand toggle, no tooltip control. Title attribute always shows.
            </p>
            <div className="truncated-text-page__tier-import">
              import {'{'} TruncatedText {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="truncated-text-page__tier-preview">
              <div style={{ maxInlineSize: '180px', fontSize: '0.75rem', lineHeight: 1.4, overflow: 'hidden' }}>
                <LiteTruncatedText text={SAMPLE_SHORT} lines={1} />
              </div>
            </div>
            <div className="truncated-text-page__size-breakdown">
              <div className="truncated-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`truncated-text-page__tier-card${tier === 'standard' ? ' truncated-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="truncated-text-page__tier-header">
              <span className="truncated-text-page__tier-name">Standard</span>
              <span className="truncated-text-page__tier-size">~1.2 KB</span>
            </div>
            <p className="truncated-text-page__tier-desc">
              Full truncation with expandable toggle button, tooltip control, and aria-expanded
              for accessibility. Brand-colored toggle with focus-visible ring.
            </p>
            <div className="truncated-text-page__tier-import">
              import {'{'} TruncatedText {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="truncated-text-page__tier-preview">
              <div style={{ maxInlineSize: '180px', fontSize: '0.75rem', lineHeight: 1.4 }}>
                <TruncatedText text={SAMPLE_SHORT} lines={1} expandable />
              </div>
            </div>
            <div className="truncated-text-page__size-breakdown">
              <div className="truncated-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`truncated-text-page__tier-card${tier === 'premium' ? ' truncated-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="truncated-text-page__tier-header">
              <span className="truncated-text-page__tier-name">Premium</span>
              <span className="truncated-text-page__tier-size">~2.0 KB</span>
            </div>
            <p className="truncated-text-page__tier-desc">
              Everything in Standard plus animated expand/collapse transitions with
              height auto-calculation, gradient fade mask on truncated edge, and smooth
              spring-based toggle animation.
            </p>
            <div className="truncated-text-page__tier-import">
              import {'{'} TruncatedText {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="truncated-text-page__tier-preview">
              <div style={{ maxInlineSize: '180px', fontSize: '0.75rem', lineHeight: 1.4 }}>
                <TruncatedText text={SAMPLE_SHORT} lines={1} expandable />
              </div>
            </div>
            <div className="truncated-text-page__size-breakdown">
              <div className="truncated-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ────────────────────────────── */}
      <section className="truncated-text-page__section" id="brand-color">
        <h2 className="truncated-text-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          Pick a brand color to see the toggle button and focus ring update in real-time. The
          OKLCH-based theme system generates derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="truncated-text-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`truncated-text-page__color-preset${brandColor === p.hex ? ' truncated-text-page__color-preset--active' : ''}`}
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
        </div>
      </section>

      {/* ── 9. Props API ──────────────────────────────── */}
      <section className="truncated-text-page__section" id="props">
        <h2 className="truncated-text-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          All props accepted by TruncatedText. It also spreads any native span HTML attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={truncatedTextProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="truncated-text-page__section" id="accessibility">
        <h2 className="truncated-text-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          Designed with keyboard navigation and screen reader support in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="truncated-text-page__a11y-list">
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Title tooltip:</strong> Native <code className="truncated-text-page__a11y-key">title</code> attribute provides the full text on hover for both mouse users and some assistive technologies.
              </span>
            </li>
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Expand toggle:</strong> Uses <code className="truncated-text-page__a11y-key">aria-expanded</code> to communicate the current state to screen readers.
              </span>
            </li>
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Toggle button shows a prominent brand-colored focus ring via <code className="truncated-text-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced colors:</strong> Toggle link uses <code className="truncated-text-page__a11y-key">LinkText</code> system color and <code className="truncated-text-page__a11y-key">Highlight</code> focus ring in Windows High Contrast mode.
              </span>
            </li>
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses native <code className="truncated-text-page__a11y-key">{'<button>'}</code> element for the toggle, ensuring keyboard activation with Enter and Space.
              </span>
            </li>
            <li className="truncated-text-page__a11y-item">
              <span className="truncated-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Content accessible:</strong> Full text is always present in the DOM even when visually truncated, so screen readers can access it.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ──────────────────────────────────── */}
      <section className="truncated-text-page__section" id="source">
        <h2 className="truncated-text-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="truncated-text-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          className="truncated-text-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/truncated-text.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="github" size="sm" />
          src/domain/truncated-text.tsx
        </a>
      </section>
    </div>
  )
}
