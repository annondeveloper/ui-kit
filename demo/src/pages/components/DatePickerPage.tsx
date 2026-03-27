'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DatePicker } from '@ui/components/date-picker'
import { DatePicker as LiteDatePicker } from '@ui/lite/date-picker'
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
    @scope (.date-picker-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: date-picker-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .date-picker-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .date-picker-page__hero::before {
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
        animation: date-picker-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes date-picker-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .date-picker-page__hero::before { animation: none; }
      }

      .date-picker-page__title {
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

      .date-picker-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .date-picker-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .date-picker-page__import-code {
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

      .date-picker-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .date-picker-page__section {
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
        animation: date-picker-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes date-picker-page__section-reveal {
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
        .date-picker-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .date-picker-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .date-picker-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .date-picker-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .date-picker-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .date-picker-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 360px;
      }

      .date-picker-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .date-picker-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .date-picker-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .date-picker-page__playground {
          grid-template-columns: 1fr;
        }
        .date-picker-page__playground-controls {
          position: static !important;
        }
      }

      @container date-picker-page (max-width: 680px) {
        .date-picker-page__playground {
          grid-template-columns: 1fr;
        }
        .date-picker-page__playground-controls {
          position: static !important;
        }
      }

      .date-picker-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .date-picker-page__playground-result {
        overflow: visible;
        min-block-size: 380px;
        display: grid;
        place-items: start center;
        padding: 2rem 3rem 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .date-picker-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .date-picker-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .date-picker-page__playground-controls {
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

      .date-picker-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .date-picker-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .date-picker-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .date-picker-page__option-btn {
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
      .date-picker-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .date-picker-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .date-picker-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .date-picker-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .date-picker-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .date-picker-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .date-picker-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .date-picker-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .date-picker-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .date-picker-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .date-picker-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .date-picker-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .date-picker-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .date-picker-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .date-picker-page__tier-card {
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

      .date-picker-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .date-picker-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .date-picker-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .date-picker-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .date-picker-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .date-picker-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .date-picker-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .date-picker-page__tier-import {
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

      .date-picker-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .date-picker-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .date-picker-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .date-picker-page__code-tabs {
        margin-block-start: 1rem;
      }

      .date-picker-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .date-picker-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .date-picker-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .date-picker-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .date-picker-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .date-picker-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .date-picker-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .date-picker-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .date-picker-page__hero {
          padding: 2rem 1.25rem;
        }
        .date-picker-page__title {
          font-size: 1.75rem;
        }
        .date-picker-page__preview {
          padding: 1.75rem;
        }
        .date-picker-page__playground {
          grid-template-columns: 1fr;
        }
        .date-picker-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }
        .date-picker-page__labeled-row {
          gap: 1rem;
        }
        .date-picker-page__states-grid {
          grid-template-columns: 1fr;
        }
        .date-picker-page__tiers {
          grid-template-columns: 1fr;
        }
        .date-picker-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .date-picker-page__hero {
          padding: 1.5rem 1rem;
        }
        .date-picker-page__title {
          font-size: 1.5rem;
        }
        .date-picker-page__preview {
          padding: 1rem;
        }
        .date-picker-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .date-picker-page__title {
          font-size: 4rem;
        }
        .date-picker-page__preview {
          padding: 3.5rem;
        }
        .date-picker-page__labeled-row {
          gap: 2.5rem;
        }
      }

      .date-picker-page__import-code,
      .date-picker-page code,
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

const datePickerProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled ISO date string (YYYY-MM-DD).' },
  { name: 'defaultValue', type: 'string', description: 'Initial date for uncontrolled mode.' },
  { name: 'onChange', type: '(date: string) => void', description: 'Callback fired when user selects a date.' },
  { name: 'min', type: 'string', description: 'Minimum selectable date (ISO format). Days before this are disabled.' },
  { name: 'max', type: 'string', description: 'Maximum selectable date (ISO format). Days after this are disabled.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text shown when no date is selected.' },
  { name: 'label', type: 'ReactNode', description: 'Label rendered above the input field.' },
  { name: 'error', type: 'string', description: 'Error message. When set, adds red border and shows error text.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire date picker.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls input height and font size.' },
  { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Show ISO week numbers in calendar.' },
  { name: 'firstDayOfWeek', type: '0 | 1', default: '1', description: 'First day of week: 0 = Sunday, 1 = Monday.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override for calendar entry.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type FirstDay = 0 | 1

const SIZES: Size[] = ['sm', 'md', 'lg']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DatePicker } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DatePicker } from '@annondeveloper/ui-kit'",
  premium: "import { DatePicker } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="date-picker-page__copy-btn"
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
    <div className="date-picker-page__control-group">
      <span className="date-picker-page__control-label">{label}</span>
      <div className="date-picker-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`date-picker-page__option-btn${opt === value ? ' date-picker-page__option-btn--active' : ''}`}
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
    <label className="date-picker-page__toggle-label">
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
  size: Size,
  label: string,
  placeholder: string,
  disabled: boolean,
  error: string,
  min: string,
  max: string,
  firstDayOfWeek: FirstDay,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (label) props.push(`  label="${label}"`)
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (disabled) props.push('  disabled')
  if (error) props.push(`  error="${error}"`)
  if (min) props.push(`  min="${min}"`)
  if (max) props.push(`  max="${max}"`)
  if (firstDayOfWeek !== 1 && tier !== 'lite') props.push(`  firstDayOfWeek={${firstDayOfWeek}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  if (tier === 'lite') {
    const attrs: string[] = []
    if (label) attrs.push(`  label="${label}"`)
    if (error) attrs.push(`  error="${error}"`)
    if (disabled) attrs.push('  disabled')
    const jsx = attrs.length === 0
      ? '<DatePicker />'
      : `<DatePicker\n${attrs.join('\n')}\n/>`
    return `${importStr}\n\n${jsx}`
  }

  const jsx = props.length === 0
    ? '<DatePicker onChange={(date) => console.log(date)} />'
    : `<DatePicker\n${props.join('\n')}\n  onChange={(date) => console.log(date)}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- DatePicker — Lite tier (native date input) -->
<div class="ui-lite-date-picker">
  ${label ? `<label for="date-field">${label}</label>` : ''}
  <input type="date" id="date-field"${disabled ? ' disabled' : ''} />
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<!-- DatePicker — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/date-picker.css">

<div class="ui-date-picker" data-size="${size}">
  ${label ? `<label class="ui-date-picker__label">${label}</label>` : ''}
  <div class="ui-date-picker__input-wrapper">
    <input type="text" class="ui-date-picker__input" placeholder="Select a date" readonly />
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-date-picker">
    ${label ? `<label>${label}</label>` : ''}
    <input type="date" v-model="date"${disabled ? ' disabled' : ''} />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const date = ref('')
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = ['  v-model="date"']
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (label) attrs.push(`  label="${label}"`)
  if (disabled) attrs.push('  disabled')
  return `<template>
  <DatePicker
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { DatePicker } from '${importPath}'
const date = ref('')
</script>`
}

function generateAngularCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (native) -->
<div class="ui-lite-date-picker">
  ${label ? `<label>${label}</label>` : ''}
  <input type="date" [(ngModel)]="date"${disabled ? ' [disabled]="true"' : ''} />
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only approach) -->
<div class="ui-date-picker" data-size="${size}">
  ${label ? `<label class="ui-date-picker__label">${label}</label>` : ''}
  <div class="ui-date-picker__input-wrapper">
    <input type="text" class="ui-date-picker__input" placeholder="Select a date" readonly${disabled ? ' disabled' : ''} />
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/date-picker.css';`
}

function generateSvelteCode(tier: Tier, size: Size, label: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (native) -->
<div class="ui-lite-date-picker">
  ${label ? `<label>${label}</label>` : ''}
  <input type="date" bind:value={date}${disabled ? ' disabled' : ''} />
</div>

<script>
  let date = '';
</script>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { DatePicker } from '@annondeveloper/ui-kit';
  let date = '';
</script>

<DatePicker
  size="${size}"
  ${label ? `label="${label}"` : ''}
  ${disabled ? 'disabled' : ''}
  on:change={(e) => date = e.detail}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)
  const [label, setLabel] = useState('Select date')
  const [placeholder, setPlaceholder] = useState('Pick a date...')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<FirstDay>(1)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [selectedDate, setSelectedDate] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const errorText = showError ? 'Please select a valid date' : ''

  const reactCode = useMemo(
    () => generateReactCode(tier, size, label, placeholder, disabled, errorText, min, max, firstDayOfWeek, motion),
    [tier, size, label, placeholder, disabled, errorText, min, max, firstDayOfWeek, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, label, disabled), [tier, size, label, disabled])
  const vueCode = useMemo(() => generateVueCode(tier, size, label, disabled), [tier, size, label, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, label, disabled), [tier, size, label, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, label, disabled), [tier, size, label, disabled])

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
    <section className="date-picker-page__section" id="playground">
      <h2 className="date-picker-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="date-picker-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="date-picker-page__playground">
        <div className="date-picker-page__playground-preview">
          <div className="date-picker-page__playground-result">
            {tier === 'lite' ? (
              <LiteDatePicker
                label={label || undefined}
                error={errorText || undefined}
                disabled={disabled}
                onChange={e => setSelectedDate((e.target as HTMLInputElement).value)}
              />
            ) : (
              <DatePicker
                size={size}
                label={label || undefined}
                placeholder={placeholder || undefined}
                disabled={disabled}
                error={errorText || undefined}
                min={min || undefined}
                max={max || undefined}
                firstDayOfWeek={firstDayOfWeek}
                motion={motion}
                value={selectedDate || undefined}
                onChange={setSelectedDate}
              />
            )}
          </div>
          {selectedDate && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Selected: <strong style={{ color: 'var(--text-primary)' }}>{selectedDate}</strong>
            </p>
          )}

          <div className="date-picker-page__code-tabs">
            <div className="date-picker-page__export-row">
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
              {copyStatus && <span className="date-picker-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="date-picker-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="First Day"
              options={['1', '0'] as const}
              value={String(firstDayOfWeek) as '0' | '1'}
              onChange={v => setFirstDayOfWeek(Number(v) as FirstDay)}
            />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="date-picker-page__control-group">
            <span className="date-picker-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              <Toggle label="Show error" checked={showError} onChange={setShowError} />
            </div>
          </div>

          <div className="date-picker-page__control-group">
            <span className="date-picker-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="date-picker-page__text-input"
              placeholder="Label text..."
            />
          </div>

          {tier !== 'lite' && (
            <>
              <div className="date-picker-page__control-group">
                <span className="date-picker-page__control-label">Placeholder</span>
                <input
                  type="text"
                  value={placeholder}
                  onChange={e => setPlaceholder(e.target.value)}
                  className="date-picker-page__text-input"
                  placeholder="Placeholder text..."
                />
              </div>
              <div className="date-picker-page__control-group">
                <span className="date-picker-page__control-label">Min date</span>
                <input
                  type="date"
                  value={min}
                  onChange={e => setMin(e.target.value)}
                  className="date-picker-page__text-input"
                />
              </div>
              <div className="date-picker-page__control-group">
                <span className="date-picker-page__control-label">Max date</span>
                <input
                  type="date"
                  value={max}
                  onChange={e => setMax(e.target.value)}
                  className="date-picker-page__text-input"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DatePickerPage() {
  useStyles('date-picker-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.date-picker-page__section')
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
    <div className="date-picker-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="date-picker-page__hero">
        <h1 className="date-picker-page__title">DatePicker</h1>
        <p className="date-picker-page__desc">
          Calendar-based date selection with month navigation, keyboard support, and configurable
          date constraints. Ships in two weight tiers from a native input lite to a full custom calendar.
        </p>
        <div className="date-picker-page__import-row">
          <code className="date-picker-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="date-picker-page__section" id="sizes">
          <h2 className="date-picker-page__section-title">
            <a href="#sizes">Size Scale</a>
          </h2>
          <p className="date-picker-page__section-desc">
            Three sizes to fit different layout contexts. Sizes control input height and font size.
          </p>
          <div className="date-picker-page__preview">
            <div className="date-picker-page__labeled-row" style={{ alignItems: 'flex-end' }}>
              {SIZES.map(s => (
                <div key={s} className="date-picker-page__labeled-item">
                  <DatePicker size={s} placeholder="Pick a date" />
                  <span className="date-picker-page__item-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="date-picker-page__section" id="states">
        <h2 className="date-picker-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="date-picker-page__section-desc">
          The date picker handles default, error, and disabled states with clear visual feedback.
        </p>
        <div className="date-picker-page__states-grid">
          <div className="date-picker-page__state-cell">
            {tier === 'lite' ? (
              <LiteDatePicker label="Default" />
            ) : (
              <DatePicker label="Default" placeholder="Pick a date" />
            )}
            <span className="date-picker-page__state-label">Default</span>
          </div>
          <div className="date-picker-page__state-cell">
            {tier === 'lite' ? (
              <LiteDatePicker label="With value" defaultValue="2026-03-24" />
            ) : (
              <DatePicker label="With value" defaultValue="2026-03-24" />
            )}
            <span className="date-picker-page__state-label">With value</span>
          </div>
          <div className="date-picker-page__state-cell">
            {tier === 'lite' ? (
              <LiteDatePicker label="Error" error="Date required" />
            ) : (
              <DatePicker label="Error" error="Date is required" placeholder="Pick a date" />
            )}
            <span className="date-picker-page__state-label">Error</span>
          </div>
          <div className="date-picker-page__state-cell">
            {tier === 'lite' ? (
              <LiteDatePicker label="Disabled" disabled />
            ) : (
              <DatePicker label="Disabled" disabled placeholder="Pick a date" />
            )}
            <span className="date-picker-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 5. Date Constraints ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="date-picker-page__section" id="constraints">
          <h2 className="date-picker-page__section-title">
            <a href="#constraints">Date Constraints</a>
          </h2>
          <p className="date-picker-page__section-desc">
            Use <code>min</code> and <code>max</code> props to constrain the selectable date range.
            Days outside the range are visually disabled.
          </p>
          <div className="date-picker-page__preview date-picker-page__preview--col">
            <DatePicker
              label="Min: 2026-03-01"
              min="2026-03-01"
              placeholder="Only after March 1st"
            />
            <DatePicker
              label="Max: 2026-12-31"
              max="2026-12-31"
              placeholder="Only before end of 2026"
            />
            <DatePicker
              label="Range: Mar 10 – Mar 30"
              min="2026-03-10"
              max="2026-03-30"
              placeholder="Within range only"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<DatePicker\n  min="2026-03-01"\n  max="2026-12-31"\n  label="Booking date"\n  onChange={(date) => console.log(date)}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. First Day of Week ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="date-picker-page__section" id="first-day">
          <h2 className="date-picker-page__section-title">
            <a href="#first-day">First Day of Week</a>
          </h2>
          <p className="date-picker-page__section-desc">
            Toggle between Monday-first (ISO standard) and Sunday-first calendars.
          </p>
          <div className="date-picker-page__preview">
            <div className="date-picker-page__labeled-row">
              <div className="date-picker-page__labeled-item">
                <DatePicker label="Monday first" firstDayOfWeek={1} placeholder="Mon start" />
                <span className="date-picker-page__item-label">firstDayOfWeek=1</span>
              </div>
              <div className="date-picker-page__labeled-item">
                <DatePicker label="Sunday first" firstDayOfWeek={0} placeholder="Sun start" />
                <span className="date-picker-page__item-label">firstDayOfWeek=0</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="date-picker-page__section" id="tiers">
        <h2 className="date-picker-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="date-picker-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses the native date input,
          Standard provides a full custom calendar with navigation and constraints.
        </p>

        <div className="date-picker-page__tiers">
          {/* Lite */}
          <div
            className={`date-picker-page__tier-card${tier === 'lite' ? ' date-picker-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="date-picker-page__tier-header">
              <span className="date-picker-page__tier-name">Lite</span>
              <span className="date-picker-page__tier-size">~0.2 KB</span>
            </div>
            <p className="date-picker-page__tier-desc">
              Wraps native HTML date input. Zero JavaScript beyond forwardRef.
              No calendar popup, no month navigation, no custom styling.
            </p>
            <div className="date-picker-page__tier-import">
              import {'{'} DatePicker {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="date-picker-page__tier-preview">
              <LiteDatePicker label="Lite" />
            </div>
            <div className="date-picker-page__size-breakdown">
              <div className="date-picker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`date-picker-page__tier-card${tier === 'standard' ? ' date-picker-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="date-picker-page__tier-header">
              <span className="date-picker-page__tier-name">Standard</span>
              <span className="date-picker-page__tier-size">~3 KB</span>
            </div>
            <p className="date-picker-page__tier-desc">
              Full custom calendar with month/year navigation, keyboard controls,
              date constraints, week numbers, first-day config, and animated entry.
            </p>
            <div className="date-picker-page__tier-import">
              import {'{'} DatePicker {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="date-picker-page__tier-preview">
              <DatePicker placeholder="Standard" size="sm" />
            </div>
            <div className="date-picker-page__size-breakdown">
              <div className="date-picker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`date-picker-page__tier-card${tier === 'premium' ? ' date-picker-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="date-picker-page__tier-header">
              <span className="date-picker-page__tier-name">Premium</span>
              <span className="date-picker-page__tier-size">~5 KB</span>
            </div>
            <p className="date-picker-page__tier-desc">
              Spring calendar entrance with overshoot, aurora glow on selected date,
              shimmer highlight on today, glass morphism dropdown.
            </p>
            <div className="date-picker-page__tier-import">
              import {'{'} DatePicker {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="date-picker-page__tier-preview">
              <DatePicker placeholder="Premium" size="sm" />
            </div>
            <div className="date-picker-page__size-breakdown">
              <div className="date-picker-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="date-picker-page__section" id="props">
        <h2 className="date-picker-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="date-picker-page__section-desc">
          All props accepted by DatePicker. The Lite tier accepts standard HTML input attributes
          plus <code>label</code> and <code>error</code>.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={datePickerProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="date-picker-page__section" id="accessibility">
        <h2 className="date-picker-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="date-picker-page__section-desc">
          Built with WAI-ARIA date picker patterns for full keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="date-picker-page__a11y-list">
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="date-picker-page__a11y-key">Arrow</code> keys navigate days,
                <code className="date-picker-page__a11y-key">Enter</code>/<code className="date-picker-page__a11y-key">Space</code> selects,
                <code className="date-picker-page__a11y-key">Escape</code> closes calendar.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Combobox:</strong> Input uses <code className="date-picker-page__a11y-key">role="combobox"</code> with
                <code className="date-picker-page__a11y-key">aria-expanded</code> and <code className="date-picker-page__a11y-key">aria-haspopup="dialog"</code>.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Grid:</strong> Calendar uses <code className="date-picker-page__a11y-key">role="grid"</code> with properly
                labeled columns and focusable day cells.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Each day has a full <code className="date-picker-page__a11y-key">aria-label</code> with
                weekday, month, day, and year for screen reader clarity.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages linked via <code className="date-picker-page__a11y-key">aria-describedby</code> with
                <code className="date-picker-page__a11y-key">role="alert"</code> for live announcements.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="date-picker-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="date-picker-page__a11y-item">
              <span className="date-picker-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="date-picker-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
