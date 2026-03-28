'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { FormInput } from '@ui/components/form-input'
import { FormInput as LiteFormInput } from '@ui/lite/form-input'
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
    @scope (.form-input-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: form-input-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .form-input-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .form-input-page__hero::before {
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
        .form-input-page__hero::before { animation: none; }
      }

      .form-input-page__title {
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

      .form-input-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .form-input-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .form-input-page__import-code {
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

      .form-input-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .form-input-page__section {
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
        .form-input-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .form-input-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .form-input-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .form-input-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .form-input-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .form-input-page__preview {
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

      .form-input-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .form-input-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .form-input-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .form-input-page__playground {
          grid-template-columns: 1fr;
        }
        .form-input-page__playground-controls {
          position: static !important;
        }
      }

      @container form-input-page (max-width: 680px) {
        .form-input-page__playground {
          grid-template-columns: 1fr;
        }
        .form-input-page__playground-controls {
          position: static !important;
        }
      }

      .form-input-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-input-page__playground-result {
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

      .form-input-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .form-input-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .form-input-page__playground-controls {
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

      .form-input-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .form-input-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .form-input-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .form-input-page__option-btn {
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
      .form-input-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .form-input-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .form-input-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-input-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .form-input-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .form-input-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .form-input-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .form-input-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .form-input-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .form-input-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .form-input-page__state-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .form-input-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .form-input-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .form-input-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .form-input-page__tier-card {
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

      .form-input-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .form-input-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .form-input-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .form-input-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .form-input-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .form-input-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .form-input-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .form-input-page__tier-import {
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

      .form-input-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .form-input-page__code-tabs {
        margin-block-start: 1rem;
      }

      .form-input-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .form-input-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .form-input-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .form-input-page__color-preset {
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
      .form-input-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .form-input-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .form-input-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .form-input-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .form-input-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .form-input-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ────────────────────────────── */

      .form-input-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .form-input-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .form-input-page__hero { padding: 2rem 1.25rem; }
        .form-input-page__title { font-size: 1.75rem; }
        .form-input-page__preview { padding: 1.75rem; }
        .form-input-page__playground { grid-template-columns: 1fr; }
        .form-input-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .form-input-page__labeled-row { gap: 1rem; }
        .form-input-page__states-grid { grid-template-columns: repeat(2, 1fr); }
        .form-input-page__tiers { grid-template-columns: 1fr; }
        .form-input-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .form-input-page__hero { padding: 1.5rem 1rem; }
        .form-input-page__title { font-size: 1.5rem; }
        .form-input-page__preview { padding: 1rem; }
        .form-input-page__states-grid { grid-template-columns: 1fr; }
        .form-input-page__labeled-row { gap: 0.5rem; justify-content: center; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .form-input-page__title { font-size: 4rem; }
        .form-input-page__preview { padding: 3.5rem; }
        .form-input-page__labeled-row { gap: 2.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .form-input-page__import-code,
      .form-input-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const formInputPropDefs: PropDef[] = [
  { name: 'name', type: 'string', description: 'Field name for form context integration and native form submission.' },
  { name: 'label', type: 'ReactNode', description: 'Label text rendered above the input with proper htmlFor binding.' },
  { name: 'description', type: 'string', description: 'Helper text rendered below the input for additional guidance.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the input with role="alert" for screen readers.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and minimum block-size.' },
  { name: 'variant', type: "'default' | 'filled'", default: "'default'", description: 'Visual style: default has a border, filled has a solid background.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon rendered inside the input field.' },
  { name: 'iconEnd', type: 'ReactNode', description: 'Trailing icon rendered at the end of the input field.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override for error animations.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input with reduced opacity.' },
  { name: 'type', type: 'string', default: "'text'", description: 'HTML input type: text, email, password, number, tel, url, etc.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text shown when the input is empty.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with the component root.' },
  { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'Forwarded ref to the underlying <input> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'default' | 'filled'

const INPUT_TYPES: InputType[] = ['text', 'email', 'password', 'number', 'tel', 'url']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const VARIANTS: Variant[] = ['default', 'filled']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { FormInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { FormInput } from '@annondeveloper/ui-kit'",
  premium: "import { FormInput } from '@annondeveloper/ui-kit/premium'",
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
      className="form-input-page__copy-btn"
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
    <div className="form-input-page__control-group">
      <span className="form-input-page__control-label">{label}</span>
      <div className="form-input-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`form-input-page__option-btn${opt === value ? ' form-input-page__option-btn--active' : ''}`}
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
    <label className="form-input-page__toggle-label">
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
  inputType: InputType,
  size: Size,
  variant: Variant,
  label: string,
  placeholder: string,
  error: string,
  description: string,
  disabled: boolean,
  showIcon: boolean,
  showIconEnd: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = (showIcon || showIconEnd) && tier !== 'lite' ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = ['  name="my-field"']
  if (label) props.push(`  label="${label}"`)
  if (inputType !== 'text') props.push(`  type="${inputType}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (variant !== 'default' && tier !== 'lite') props.push(`  variant="${variant}"`)
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (error) props.push(`  error="${error}"`)
  if (description && tier !== 'lite') props.push(`  description="${description}"`)
  if (disabled) props.push('  disabled')
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="user" size="sm" />}')
  if (showIconEnd && tier !== 'lite') props.push('  iconEnd={<Icon name="check" size="sm" />}')

  const jsx = `<FormInput\n${props.join('\n')}\n/>`
  return `${importStr}${iconImport}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, inputType: InputType, size: Size, label: string, placeholder: string, error: string): string {
  const className = tier === 'lite' ? 'ui-lite-form-input' : 'ui-form-input'
  const tierLabel = tier === 'lite' ? 'lite' : 'standard'
  return `<!-- FormInput -- @annondeveloper/ui-kit ${tierLabel} tier -->
<div class="${className}" data-size="${size}">
  ${label ? `<label for="my-field">${label}</label>` : ''}
  <input
    id="my-field"
    name="my-field"
    type="${inputType}"
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${error ? `aria-invalid="true"` : ''}
  />
  ${error ? `<span class="${className}__error" role="alert">${error}</span>` : ''}
</div>`
}

function generateVueCode(tier: Tier, inputType: InputType, size: Size, label: string, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-form-input" data-size="${size}">
    ${label ? `<label for="my-field">${label}</label>` : ''}
    <input id="my-field" name="my-field" type="${inputType}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? 'disabled' : ''} />
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = '@annondeveloper/ui-kit'
  const attrs: string[] = ['  name="my-field"']
  if (label) attrs.push(`  label="${label}"`)
  if (inputType !== 'text') attrs.push(`  type="${inputType}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (placeholder) attrs.push(`  placeholder="${placeholder}"`)
  if (disabled) attrs.push('  disabled')

  return `<template>
  <FormInput
  ${attrs.join('\n  ')}
  />
</template>

<script setup>
import { FormInput } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, inputType: InputType, size: Size, label: string, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular -- Lite tier (CSS-only) -->
<div class="ui-lite-form-input" data-size="${size}">
  ${label ? `<label for="my-field">${label}</label>` : ''}
  <input id="my-field" name="my-field" type="${inputType}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? '[disabled]="true"' : ''} />
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div class="ui-form-input" data-size="${size}">
  ${label ? `<label for="my-field">${label}</label>` : ''}
  <input
    id="my-field"
    name="my-field"
    type="${inputType}"
    class="ui-form-input__field"
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${disabled ? '[disabled]="true"' : ''}
  />
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/form-input.css';`
}

function generateSvelteCode(tier: Tier, inputType: InputType, size: Size, label: string, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte -- Lite tier (CSS-only) -->
<div class="ui-lite-form-input" data-size="${size}">
  ${label ? `<label for="my-field">${label}</label>` : ''}
  <input id="my-field" name="my-field" type="${inputType}" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? 'disabled' : ''} />
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<script>
  import { FormInput } from '@annondeveloper/ui-kit';
</script>

<FormInput
  name="my-field"
  ${label ? `label="${label}"` : ''}
  ${inputType !== 'text' ? `type="${inputType}"` : ''}
  ${size !== 'md' ? `size="${size}"` : ''}
  ${placeholder ? `placeholder="${placeholder}"` : ''}
  ${disabled ? 'disabled' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [inputType, setInputType] = useState<InputType>('text')
  const [size, setSize] = useState<Size>('md')
  const [variant, setVariant] = useState<Variant>('default')
  const [label, setLabel] = useState('Email Address')
  const [placeholder, setPlaceholder] = useState('you@example.com')
  const [error, setError] = useState('')
  const [description, setDescription] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [showIconEnd, setShowIconEnd] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const InputComponent = tier === 'lite' ? LiteFormInput : FormInput

  const reactCode = useMemo(
    () => generateReactCode(tier, inputType, size, variant, label, placeholder, error, description, disabled, showIcon, showIconEnd),
    [tier, inputType, size, variant, label, placeholder, error, description, disabled, showIcon, showIconEnd],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, inputType, size, label, placeholder, error),
    [tier, inputType, size, label, placeholder, error],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, inputType, size, label, placeholder, disabled),
    [tier, inputType, size, label, placeholder, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, inputType, size, label, placeholder, disabled),
    [tier, inputType, size, label, placeholder, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, inputType, size, label, placeholder, disabled),
    [tier, inputType, size, label, placeholder, disabled],
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

  const previewProps: Record<string, unknown> = {
    name: 'demo-field',
    size,
  }
  if (label) previewProps.label = label
  if (placeholder) previewProps.placeholder = placeholder
  if (disabled) previewProps.disabled = disabled
  if (inputType !== 'text') previewProps.type = inputType

  if (tier !== 'lite') {
    if (error) previewProps.error = error
    if (description) previewProps.description = description
    if (variant !== 'default') previewProps.variant = variant
    if (showIcon) previewProps.icon = <Icon name="user" size="sm" />
    if (showIconEnd) previewProps.iconEnd = <Icon name="check" size="sm" />
  } else {
    if (error) previewProps.error = error
  }

  return (
    <section className="form-input-page__section" id="playground">
      <h2 className="form-input-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="form-input-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="form-input-page__playground">
        <div className="form-input-page__playground-preview">
          <div className="form-input-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '360px' }}>
              <InputComponent {...previewProps as any} />
            </div>
          </div>

          <div className="form-input-page__code-tabs">
            <div className="form-input-page__export-row">
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
              {copyStatus && <span className="form-input-page__export-status">{copyStatus}</span>}
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

        <div className="form-input-page__playground-controls">
          <OptionGroup label="Type" options={INPUT_TYPES} value={inputType} onChange={setInputType} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          {tier !== 'lite' && <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />}

          <div className="form-input-page__control-group">
            <span className="form-input-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Leading icon" checked={showIcon} onChange={setShowIcon} />}
              {tier !== 'lite' && <Toggle label="Trailing icon" checked={showIconEnd} onChange={setShowIconEnd} />}
            </div>
          </div>

          <div className="form-input-page__control-group">
            <span className="form-input-page__control-label">Label</span>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="form-input-page__text-input" placeholder="Label text..." />
          </div>

          <div className="form-input-page__control-group">
            <span className="form-input-page__control-label">Placeholder</span>
            <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="form-input-page__text-input" placeholder="Placeholder..." />
          </div>

          <div className="form-input-page__control-group">
            <span className="form-input-page__control-label">Error</span>
            <input type="text" value={error} onChange={e => setError(e.target.value)} className="form-input-page__text-input" placeholder="Error message..." />
          </div>

          {tier !== 'lite' && (
            <div className="form-input-page__control-group">
              <span className="form-input-page__control-label">Description</span>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="form-input-page__text-input" placeholder="Helper text..." />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FormInputPage() {
  useStyles('form-input-page', pageStyles)

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

  // Scroll reveal for sections -- JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.form-input-page__section')
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

  const InputComponent = tier === 'lite' ? LiteFormInput : FormInput

  return (
    <div className="form-input-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="form-input-page__hero">
        <h1 className="form-input-page__title">FormInput</h1>
        <p className="form-input-page__desc">
          Text input with label, description, error state, icon slots, and form context integration.
          Ships in two weight tiers from 0.3KB lite to 2KB standard with full validation support.
        </p>
        <div className="form-input-page__import-row">
          <code className="form-input-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Input Types ─────────────────────────────── */}
      <section className="form-input-page__section" id="types">
        <h2 className="form-input-page__section-title">
          <a href="#types">Input Types</a>
        </h2>
        <p className="form-input-page__section-desc">
          Supports all standard HTML input types. The browser provides native validation and input formatting for each type.
        </p>
        <div className="form-input-page__preview form-input-page__preview--col" style={{ gap: '1rem', maxInlineSize: '400px', marginInline: 'auto' }}>
          <InputComponent name="type-text" label="Text" type="text" placeholder="Enter text..." size="md" />
          <InputComponent name="type-email" label="Email" type="email" placeholder="you@example.com" size="md" />
          <InputComponent name="type-password" label="Password" type="password" placeholder="Enter password..." size="md" />
          <InputComponent name="type-number" label="Number" type="number" placeholder="0" size="md" />
          <InputComponent name="type-tel" label="Telephone" type="tel" placeholder="+1 (555) 123-4567" size="md" />
          <InputComponent name="type-url" label="URL" type="url" placeholder="https://example.com" size="md" />
        </div>
      </section>

      {/* ── 4. Size Scale ──────────────────────────────── */}
      <section className="form-input-page__section" id="sizes">
        <h2 className="form-input-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="form-input-page__section-desc">
          Five sizes from compact inline inputs (xs) to large prominent fields (xl).
          Sizes control padding, font-size, and minimum block-size.
        </p>
        <div className="form-input-page__preview form-input-page__preview--col" style={{ gap: '1rem', maxInlineSize: '400px', marginInline: 'auto' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="form-input-page__item-label" style={{ minInlineSize: '2rem' }}>{s}</span>
              <div style={{ flex: 1 }}>
                <InputComponent name={`size-${s}`} placeholder={`Size ${s}`} size={s as any} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Variants ────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="form-input-page__section" id="variants">
          <h2 className="form-input-page__section-title">
            <a href="#variants">Variants</a>
          </h2>
          <p className="form-input-page__section-desc">
            Two visual styles: default with a visible border, and filled with a subtle background that transitions on focus.
          </p>
          <div className="form-input-page__preview form-input-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '400px', marginInline: 'auto' }}>
            <FormInput name="variant-default" label="Default Variant" placeholder="Border style..." variant="default" />
            <FormInput name="variant-filled" label="Filled Variant" placeholder="Filled background..." variant="filled" />
          </div>
        </section>
      )}

      {/* ── 6. States ──────────────────────────────────── */}
      <section className="form-input-page__section" id="states">
        <h2 className="form-input-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="form-input-page__section-desc">
          FormInput handles all interaction states with clear visual feedback including focus glow, error highlights, and disabled styling.
        </p>
        <div className="form-input-page__states-grid">
          <div className="form-input-page__state-cell">
            <InputComponent name="state-default" label="Default" placeholder="Type here..." />
            <span className="form-input-page__state-label">Default</span>
          </div>
          <div className="form-input-page__state-cell">
            <InputComponent name="state-focus" label="Focus" placeholder="Click to focus..." />
            <span className="form-input-page__state-label">Focus (click)</span>
          </div>
          {tier !== 'lite' && (
            <div className="form-input-page__state-cell">
              <FormInput name="state-error" label="With Error" placeholder="Invalid..." error="This field is required" />
              <span className="form-input-page__state-label">Error</span>
            </div>
          )}
          {tier === 'lite' && (
            <div className="form-input-page__state-cell">
              <LiteFormInput name="state-error" label="With Error" error="This field is required" />
              <span className="form-input-page__state-label">Error</span>
            </div>
          )}
          <div className="form-input-page__state-cell">
            <InputComponent name="state-disabled" label="Disabled" placeholder="Cannot edit" disabled />
            <span className="form-input-page__state-label">Disabled</span>
          </div>
          {tier !== 'lite' && (
            <div className="form-input-page__state-cell">
              <FormInput name="state-desc" label="With Description" placeholder="Enter value" description="This is a helper description." />
              <span className="form-input-page__state-label">Description</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="form-input-page__state-cell">
              <FormInput name="state-filled" label="Filled" placeholder="Filled variant" variant="filled" />
              <span className="form-input-page__state-label">Filled</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. With Icons ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="form-input-page__section" id="icons">
          <h2 className="form-input-page__section-title">
            <a href="#icons">With Icons</a>
          </h2>
          <p className="form-input-page__section-desc">
            FormInput accepts leading and trailing icon elements. Icons are positioned absolutely inside the field and the input padding adjusts automatically.
          </p>
          <div className="form-input-page__preview form-input-page__preview--col" style={{ gap: '1.25rem', maxInlineSize: '400px', marginInline: 'auto' }}>
            <FormInput
              name="icon-leading"
              label="With Leading Icon"
              placeholder="Search users..."
              icon={<Icon name="user" size="sm" />}
            />
            <FormInput
              name="icon-trailing"
              label="With Trailing Icon"
              placeholder="Enter email..."
              iconEnd={<Icon name="check" size="sm" />}
            />
            <FormInput
              name="icon-both"
              label="Both Icons"
              placeholder="Enter value..."
              icon={<Icon name="search" size="sm" />}
              iconEnd={<Icon name="arrow-right" size="sm" />}
            />
          </div>
        </section>
      )}

      {/* ── 7b. Character Count ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="form-input-page__section" id="character-count">
          <h2 className="form-input-page__section-title">
            <a href="#character-count">Character Count</a>
          </h2>
          <p className="form-input-page__section-desc">
            Combine <code>showCount</code> with <code>maxLength</code> to display a live
            character counter below the input. The counter updates as the user types and
            changes color when approaching or exceeding the limit.
          </p>
          <div className="form-input-page__preview" style={{ flexDirection: 'column', gap: '1.25rem', maxWidth: 400 }}>
            <InputComponent
              name="count-short"
              label="Username"
              placeholder="Enter username..."
              maxLength={20}
              showCount
              size="md"
            />
            <InputComponent
              name="count-bio"
              label="Bio"
              placeholder="Tell us about yourself..."
              maxLength={140}
              showCount
              size="md"
            />
            <InputComponent
              name="count-description"
              label="Description"
              placeholder="Project description..."
              maxLength={500}
              showCount
              description="Briefly describe your project in 500 characters or less."
              size="md"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FormInput\n  name="username"\n  label="Username"\n  maxLength={20}\n  showCount       // shows "0/20" counter\n  placeholder="Enter username..."\n/>\n\n<FormInput\n  name="bio"\n  label="Bio"\n  maxLength={140}\n  showCount\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7c. Clearable ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="form-input-page__section" id="clearable">
          <h2 className="form-input-page__section-title">
            <a href="#clearable">Clearable</a>
          </h2>
          <p className="form-input-page__section-desc">
            Use the <code>clearable</code> prop to show a clear button (X) when the input
            has a value. Clicking it resets the input to empty and fires the <code>onChange</code> callback.
          </p>
          <div className="form-input-page__preview" style={{ flexDirection: 'column', gap: '1.25rem', maxWidth: 400 }}>
            <InputComponent
              name="clearable-search"
              label="Search"
              placeholder="Type to search..."
              clearable
              icon="search"
              size="md"
            />
            <InputComponent
              name="clearable-url"
              label="Website URL"
              placeholder="https://example.com"
              clearable
              size="md"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FormInput\n  name="search"\n  label="Search"\n  placeholder="Type to search..."\n  clearable       // shows X button when input has value\n  icon="search"\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="form-input-page__section" id="tiers">
        <h2 className="form-input-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="form-input-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides basic input with label and error.
          Standard adds icons, variants, descriptions, motion, and form context integration.
        </p>

        <div className="form-input-page__tiers">
          {/* Lite */}
          <div
            className={`form-input-page__tier-card${tier === 'lite' ? ' form-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="form-input-page__tier-header">
              <span className="form-input-page__tier-name">Lite</span>
              <span className="form-input-page__tier-size">~0.3 KB</span>
            </div>
            <p className="form-input-page__tier-desc">
              Minimal input with label and error. No icons, variants, descriptions, or motion.
              Zero JS beyond the forwardRef wrapper.
            </p>
            <div className="form-input-page__tier-import">
              import {'{'} FormInput {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="form-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <LiteFormInput name="lite-preview" label="Lite Input" placeholder="Basic input..." />
              </div>
            </div>
            <div className="form-input-page__size-breakdown">
              <div className="form-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`form-input-page__tier-card${tier === 'standard' ? ' form-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="form-input-page__tier-header">
              <span className="form-input-page__tier-name">Standard</span>
              <span className="form-input-page__tier-size">~2 KB</span>
            </div>
            <p className="form-input-page__tier-desc">
              Full-featured input with icons, filled variant, descriptions,
              error animation, form context, and motion levels.
            </p>
            <div className="form-input-page__tier-import">
              import {'{'} FormInput {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="form-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <FormInput name="std-preview" label="Standard Input" placeholder="Full-featured..." icon={<Icon name="user" size="sm" />} />
              </div>
            </div>
            <div className="form-input-page__size-breakdown">
              <div className="form-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`form-input-page__tier-card${tier === 'premium' ? ' form-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="form-input-page__tier-header">
              <span className="form-input-page__tier-name">Premium</span>
              <span className="form-input-page__tier-size">~3-5 KB</span>
            </div>
            <p className="form-input-page__tier-desc">
              Aurora glow focus ring, spring-shake on validation error, and shimmer sweep on valid focus.
            </p>
            <div className="form-input-page__tier-import">
              import {'{'} FormInput {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="form-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <FormInput name="prem-preview" label="Premium Input" placeholder="Premium tier..." iconEnd={<Icon name="check" size="sm" />} />
              </div>
            </div>
            <div className="form-input-page__size-breakdown">
              <div className="form-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="form-input-page__section" id="brand-color">
        <h2 className="form-input-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="form-input-page__section-desc">
          Pick a brand color to see all inputs update their focus glow and error accents in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="form-input-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`form-input-page__color-preset${brandColor === p.hex ? ' form-input-page__color-preset--active' : ''}`}
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

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="form-input-page__section" id="props">
        <h2 className="form-input-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="form-input-page__section-desc">
          All props accepted by FormInput. It also spreads any native input HTML attributes
          onto the underlying {'<input>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={formInputPropDefs} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="form-input-page__section" id="accessibility">
        <h2 className="form-input-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="form-input-page__section-desc">
          Built on the native {'<input>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="form-input-page__a11y-list">
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label binding:</strong> The <code className="form-input-page__a11y-key">label</code> is bound to the input via <code className="form-input-page__a11y-key">htmlFor</code> for screen reader association.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error announcements:</strong> Error messages use <code className="form-input-page__a11y-key">role="alert"</code> for immediate screen reader notification.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Invalid state:</strong> Uses <code className="form-input-page__a11y-key">aria-invalid="true"</code> when an error is present.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Described by:</strong> Description and error are linked via <code className="form-input-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="form-input-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="form-input-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="form-input-page__a11y-item">
              <span className="form-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="form-input-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
