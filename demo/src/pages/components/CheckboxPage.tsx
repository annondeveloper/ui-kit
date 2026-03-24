'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Checkbox } from '@ui/components/checkbox'
import { Checkbox as LiteCheckbox } from '@ui/lite/checkbox'
import { Checkbox as PremiumCheckbox } from '@ui/premium/checkbox'
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
    @scope (.checkbox-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: checkbox-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .checkbox-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .checkbox-page__hero::before {
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
        .checkbox-page__hero::before { animation: none; }
      }

      .checkbox-page__title {
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

      .checkbox-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .checkbox-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .checkbox-page__import-code {
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

      .checkbox-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .checkbox-page__section {
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
        .checkbox-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .checkbox-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .checkbox-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .checkbox-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .checkbox-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .checkbox-page__preview {
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

      /* Subtle dot grid */
      .checkbox-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .checkbox-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .checkbox-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .checkbox-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .checkbox-page__playground {
          grid-template-columns: 1fr;
        }
        .checkbox-page__playground-controls {
          position: static !important;
        }
      }

      @container checkbox-page (max-width: 680px) {
        .checkbox-page__playground {
          grid-template-columns: 1fr;
        }
        .checkbox-page__playground-controls {
          position: static !important;
        }
      }

      .checkbox-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .checkbox-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      /* Dot grid for playground result */
      .checkbox-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .checkbox-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .checkbox-page__playground-controls {
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

      .checkbox-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .checkbox-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .checkbox-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .checkbox-page__option-btn {
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
      .checkbox-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .checkbox-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .checkbox-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .checkbox-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .checkbox-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .checkbox-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .checkbox-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .checkbox-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .checkbox-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .checkbox-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .checkbox-page__state-cell {
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
      .checkbox-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .checkbox-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .checkbox-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .checkbox-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .checkbox-page__tier-card {
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

      .checkbox-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .checkbox-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .checkbox-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .checkbox-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .checkbox-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .checkbox-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .checkbox-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .checkbox-page__tier-import {
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

      .checkbox-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .checkbox-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .checkbox-page__color-preset {
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
      .checkbox-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .checkbox-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .checkbox-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .checkbox-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .checkbox-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .checkbox-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .checkbox-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .checkbox-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .checkbox-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .checkbox-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .checkbox-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .checkbox-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .checkbox-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .checkbox-page__hero {
          padding: 2rem 1.25rem;
        }

        .checkbox-page__title {
          font-size: 1.75rem;
        }

        .checkbox-page__preview {
          padding: 1.75rem;
        }

        .checkbox-page__playground {
          grid-template-columns: 1fr;
        }

        .checkbox-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .checkbox-page__labeled-row {
          gap: 1rem;
        }

        .checkbox-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .checkbox-page__tiers {
          grid-template-columns: 1fr;
        }

        .checkbox-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .checkbox-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .checkbox-page__hero {
          padding: 1.5rem 1rem;
        }

        .checkbox-page__title {
          font-size: 1.5rem;
        }

        .checkbox-page__preview {
          padding: 1rem;
        }

        .checkbox-page__states-grid {
          grid-template-columns: 1fr;
        }

        .checkbox-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .checkbox-page__title {
          font-size: 4rem;
        }

        .checkbox-page__preview {
          padding: 3.5rem;
        }

        .checkbox-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .checkbox-page__import-code,
      .checkbox-page code,
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

const checkboxProps: PropDef[] = [
  { name: 'label', type: 'ReactNode', description: 'Text label rendered beside the checkbox.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls the checkbox box dimensions and label font-size.' },
  { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows an indeterminate dash instead of a checkmark. Set via prop, synced to the native indeterminate property.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the checkbox. Sets aria-invalid and aria-describedby.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox with reduced opacity and pointer-events: none.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
  { name: 'defaultChecked', type: 'boolean', description: 'Uncontrolled initial checked state.' },
  { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler called when checked state changes.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'id', type: 'string', description: 'Custom id for the input element. Auto-generated if not provided.' },
  { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'Forwarded ref to the underlying <input type="checkbox"> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Checkbox } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Checkbox } from '@annondeveloper/ui-kit'",
  premium: "import { Checkbox } from '@annondeveloper/ui-kit/premium'",
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
      className="checkbox-page__copy-btn"
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
    <div className="checkbox-page__control-group">
      <span className="checkbox-page__control-label">{label}</span>
      <div className="checkbox-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`checkbox-page__option-btn${opt === value ? ' checkbox-page__option-btn--active' : ''}`}
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
    <label className="checkbox-page__toggle-label">
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

function generateLiteCss(size: Size, brandColor: string): string {
  const defaultBrand = '#6366f1'
  const brandCss = brandColor !== defaultBrand ? `\n  --brand: ${brandColor};` : ''

  const baseCSS = `.ui-lite-checkbox {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-family: inherit;${brandCss}
}
.ui-lite-checkbox input[type="checkbox"] {
  accent-color: var(--brand, oklch(65% 0.2 270));
}`

  const sizesMap: Record<Size, string> = {
    xs: '/* xs: use font-size: 0.75rem on the label */',
    sm: '/* sm: use font-size: 0.8125rem on the label */',
    md: '/* md: default size, no override needed */',
    lg: '/* lg: use font-size: 1rem on the label */',
    xl: '/* xl: use font-size: 1.125rem on the label */',
  }

  return `${baseCSS}\n${sizesMap[size]}`
}

function generateHtmlExport(tier: Tier, size: Size, label: string, checked: boolean, indeterminate: boolean, brandColor: string): string {

  const className = tier === 'lite' ? 'ui-lite-checkbox' : 'ui-checkbox'
  const tierLabel = tier === 'lite' ? 'lite' : 'standard'
  const cssCode = generateLiteCss(size, brandColor)

  const checkedAttr = checked ? ' checked' : ''
  const indeterminateNote = indeterminate ? '\n<!-- Set indeterminate via JS: el.indeterminate = true -->' : ''

  return `<!-- Checkbox — @annondeveloper/ui-kit ${tierLabel} tier -->
<label class="${className}" data-size="${size}">
  <input type="checkbox"${checkedAttr} />
  <span>${label}</span>
</label>${indeterminateNote}

<!-- Inline styles (if not using the CSS file): -->
<!--
<style>
${cssCode}
</style>
-->`
}

function generateReactCode(
  tier: Tier,
  size: Size,
  label: string,
  checked: boolean,
  indeterminate: boolean,
  disabled: boolean,
  error: string,
  motion: number,
): string {

  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (checked) props.push('  checked')
  if (indeterminate && tier !== 'lite') props.push('  indeterminate')
  if (disabled) props.push('  disabled')
  if (error && tier !== 'lite') props.push(`  error="${error}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  if (label) props.push(`  label="${label}"`)

  const jsx = props.length === 0
    ? '<Checkbox />'
    : `<Checkbox\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateVueCode(tier: Tier, size: Size, label: string, checked: boolean, disabled: boolean): string {


  if (tier === 'lite') {
    const attrs: string[] = ['class="ui-lite-checkbox"']
    if (checked) attrs.push(':checked="true"')
    if (disabled) attrs.push(':disabled="true"')
    return `<template>\n  <label ${attrs.join(' ')}>\n    <input type="checkbox" />\n    <span>${label}</span>\n  </label>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (checked) attrs.push('  :checked="true"')
  if (disabled) attrs.push('  disabled')
  if (label) attrs.push(`  label="${label}"`)

  const template = attrs.length === 0
    ? '  <Checkbox />'
    : `  <Checkbox\n  ${attrs.join('\n  ')}\n  />`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Checkbox } from '@annondeveloper/ui-kit'\n</script>`
}

function generateAngularCode(tier: Tier, size: Size, label: string, checked: boolean, disabled: boolean): string {


  if (tier === 'lite') {
    const attrs = ['class="ui-lite-checkbox"', `data-size="${size}"`]
    if (disabled) attrs.push('[disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->\n<label ${attrs.join(' ')}>\n  <input type="checkbox"${checked ? ' checked' : ''}${disabled ? ' [disabled]="true"' : ''} />\n  <span>${label}</span>\n</label>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<label\n  class="ui-checkbox"\n  data-size="${size}"\n>\n  <input type="checkbox"${checked ? ' checked' : ''}${disabled ? ' [disabled]="true"' : ''} />\n  <span>${label}</span>\n</label>\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/checkbox.css';`
}

function generateSvelteCode(tier: Tier, size: Size, label: string, checked: boolean, disabled: boolean): string {


  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<label\n  class="ui-lite-checkbox"\n  data-size="${size}"\n>\n  <input type="checkbox"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''} />\n  <span>${label}</span>\n</label>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  return `<script>\n  import { Checkbox } from '@annondeveloper/ui-kit';\n</script>\n\n<Checkbox\n  size="${size}"\n  label="${label}"${checked ? '\n  checked' : ''}${disabled ? '\n  disabled' : ''}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier


  const [size, setSize] = useState<Size>('md')
  const [checked, setChecked] = useState(false)
  const [indeterminate, setIndeterminate] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')
  const [label, setLabel] = useState('Accept terms')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const CheckboxComponent = tier === 'premium' ? PremiumCheckbox : tier === 'lite' ? LiteCheckbox : Checkbox

  const reactCode = useMemo(
    () => generateReactCode(tier, size, label, checked, indeterminate, disabled, error, motion),
    [tier, size, label, checked, indeterminate, disabled, error, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(tier, size, label, checked, indeterminate, '#6366f1'),
    [tier, size, label, checked, indeterminate],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, label, checked, disabled),
    [tier, size, label, checked, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, label, checked, disabled),
    [tier, size, label, checked, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, label, checked, disabled),
    [tier, size, label, checked, disabled],
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

  const previewProps: Record<string, unknown> = { size }

  if (tier === 'lite') {
    // Lite tier — minimal props
    if (label) previewProps.label = label
    if (disabled) previewProps.disabled = disabled
    if (checked) previewProps.checked = checked
  } else {
    // Standard tier — full props
    if (label) previewProps.label = label
    previewProps.checked = checked
    previewProps.indeterminate = indeterminate
    previewProps.disabled = disabled
    if (error) previewProps.error = error
    previewProps.motion = motion
    previewProps.onChange = () => setChecked(!checked)
  }

  return (
    <section className="checkbox-page__section" id="playground">
      <h2 className="checkbox-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="checkbox-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="checkbox-page__playground">
        {/* Preview area */}
        <div className="checkbox-page__playground-preview">
          <div className="checkbox-page__playground-result">
            <CheckboxComponent {...previewProps} />
          </div>

          {/* Tabbed code output */}
          <div className="checkbox-page__code-tabs">
            <div className="checkbox-page__export-row">
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
              {copyStatus && <span className="checkbox-page__export-status">{copyStatus}</span>}
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
        <div className="checkbox-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="checkbox-page__control-group">
            <span className="checkbox-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Checked" checked={checked} onChange={setChecked} />
              {tier !== 'lite' && <Toggle label="Indeterminate" checked={indeterminate} onChange={setIndeterminate} />}
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>

          {tier !== 'lite' && (
            <div className="checkbox-page__control-group">
              <span className="checkbox-page__control-label">Error</span>
              <input
                type="text"
                value={error}
                onChange={e => setError(e.target.value)}
                className="checkbox-page__text-input"
                placeholder="Error message..."
              />
            </div>
          )}

          <div className="checkbox-page__control-group">
            <span className="checkbox-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="checkbox-page__text-input"
              placeholder="Checkbox label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckboxPage() {
  useStyles('checkbox-page', pageStyles)

  const { tier, setTier } = useTier()

  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const CheckboxComponent = tier === 'premium' ? PremiumCheckbox : tier === 'lite' ? LiteCheckbox : Checkbox

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
    const sections = document.querySelectorAll('.checkbox-page__section')
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

  return (
    <div className="checkbox-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="checkbox-page__hero">
        <h1 className="checkbox-page__title">Checkbox</h1>
        <p className="checkbox-page__desc">
          Boolean toggle with label, indeterminate state, animated checkmark, and error
          validation. Ships in two weight tiers from 0.2KB lite to 1.8KB standard with
          stroke-draw animation.
        </p>
        <div className="checkbox-page__import-row">
          <code className="checkbox-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="checkbox-page__section" id="sizes">
        <h2 className="checkbox-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Five sizes from compact inline usage (xs) to large touch-friendly targets (xl).
          Sizes control the checkbox box dimensions and label font-size.
        </p>
        <div className="checkbox-page__preview">
          <div className="checkbox-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="checkbox-page__labeled-item">
                <CheckboxComponent size={s as any} label="Option" defaultChecked />
                <span className="checkbox-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="checkbox-page__section" id="states">
        <h2 className="checkbox-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Checkboxes handle all interaction states with clear visual feedback.
        </p>
        <div className="checkbox-page__states-grid">
          <div className="checkbox-page__state-cell">
            <CheckboxComponent label="Unchecked" />
            <span className="checkbox-page__state-label">Unchecked</span>
          </div>
          <div className="checkbox-page__state-cell">
            <CheckboxComponent label="Checked" defaultChecked />
            <span className="checkbox-page__state-label">Checked</span>
          </div>
          {tier !== 'lite' && (
            <div className="checkbox-page__state-cell">
              <Checkbox label="Indeterminate" indeterminate />
              <span className="checkbox-page__state-label">Indeterminate</span>
            </div>
          )}
          <div className="checkbox-page__state-cell">
            <CheckboxComponent label="Disabled" disabled />
            <span className="checkbox-page__state-label">Disabled</span>
          </div>
          <div className="checkbox-page__state-cell">
            <CheckboxComponent label="Disabled checked" disabled defaultChecked />
            <span className="checkbox-page__state-label">Disabled + Checked</span>
          </div>
          {tier !== 'lite' && (
            <div className="checkbox-page__state-cell">
              <Checkbox label="With error" error="Required field" />
              <span className="checkbox-page__state-label">Error</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Features ────────────────────────────────── */}
      <section className="checkbox-page__section" id="features">
        <h2 className="checkbox-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Key capabilities of the Checkbox component beyond basic checked/unchecked toggling.
        </p>

        {/* Label */}
        <div style={{ marginBlockEnd: '1.5rem' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
            Label
          </h3>
          <div className="checkbox-page__preview checkbox-page__preview--col">
            <CheckboxComponent label="I agree to the terms and conditions" />
            <CheckboxComponent label="Subscribe to newsletter" defaultChecked />
            <CheckboxComponent />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.5rem' }}>
            Labels are optional. Without a label, ensure you provide an <code>aria-label</code> for accessibility.
          </p>
        </div>

        {/* Description / Error */}
        {tier !== 'lite' && (
          <div style={{ marginBlockEnd: '1.5rem' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
              Error Validation
            </h3>
            <div className="checkbox-page__preview checkbox-page__preview--col">
              <Checkbox label="Accept privacy policy" error="You must accept the privacy policy to continue" />
              <Checkbox label="Confirm your age" error="Age confirmation is required" defaultChecked />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.5rem' }}>
              Error messages are announced via <code>role="alert"</code> and linked with <code>aria-describedby</code>.
            </p>
          </div>
        )}

        {/* Indeterminate */}
        {tier !== 'lite' && (
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
              Indeterminate
            </h3>
            <div className="checkbox-page__preview checkbox-page__preview--col">
              <Checkbox label="Select all items" indeterminate />
              <div style={{ paddingInlineStart: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Checkbox label="Item A" defaultChecked />
                <Checkbox label="Item B" />
                <Checkbox label="Item C" defaultChecked />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.5rem' }}>
              The indeterminate state indicates partial selection. It renders a horizontal dash instead of a checkmark.
              Set via the <code>indeterminate</code> prop, which syncs to the native <code>HTMLInputElement.indeterminate</code> property.
            </p>
            <div style={{ marginBlockStart: '0.75rem' }}>
              <CopyBlock
                code={`<Checkbox label="Select all" indeterminate />\n\n{/* Typical "select all" pattern */}\nconst allChecked = items.every(i => i.checked)\nconst someChecked = items.some(i => i.checked)\n\n<Checkbox\n  label="Select all"\n  checked={allChecked}\n  indeterminate={someChecked && !allChecked}\n  onChange={() => toggleAll()}\n/>`}
                language="typescript"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="checkbox-page__section" id="tiers">
        <h2 className="checkbox-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Choose the right balance of features and bundle size. Checkbox ships in two tiers.
          The Lite tier wraps a native checkbox, while Standard adds indeterminate state,
          animated checkmark, motion levels, and error validation.
        </p>

        <div className="checkbox-page__tiers">
          {/* Lite */}
          <div
            className={`checkbox-page__tier-card${tier === 'lite' ? ' checkbox-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="checkbox-page__tier-header">
              <span className="checkbox-page__tier-name">Lite</span>
              <span className="checkbox-page__tier-size">~0.2 KB</span>
            </div>
            <p className="checkbox-page__tier-desc">
              Native checkbox with label. Zero JavaScript beyond the forwardRef wrapper.
              No indeterminate, no animated checkmark, no error display.
            </p>
            <div className="checkbox-page__tier-import">
              import {'{'} Checkbox {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="checkbox-page__tier-preview">
              <LiteCheckbox label="Lite Checkbox" defaultChecked />
            </div>
            <div className="checkbox-page__size-breakdown">
              <div className="checkbox-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`checkbox-page__tier-card${tier === 'standard' || tier === 'premium' ? ' checkbox-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="checkbox-page__tier-header">
              <span className="checkbox-page__tier-name">Standard</span>
              <span className="checkbox-page__tier-size">~1.8 KB</span>
            </div>
            <p className="checkbox-page__tier-desc">
              Full-featured checkbox with custom visual, indeterminate state,
              animated stroke-draw checkmark, motion levels, error validation,
              and accessibility.
            </p>
            <div className="checkbox-page__tier-import">
              import {'{'} Checkbox {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="checkbox-page__tier-preview">
              <Checkbox label="Standard Checkbox" defaultChecked />
            </div>
            <div className="checkbox-page__size-breakdown">
              <div className="checkbox-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`checkbox-page__tier-card${tier === 'premium' ? ' checkbox-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="checkbox-page__tier-header">
              <span className="checkbox-page__tier-name">Premium</span>
              <span className="checkbox-page__tier-size">~2.0 KB</span>
            </div>
            <p className="checkbox-page__tier-desc">
              Spring-scale pop animation on check, brand-colored glow when checked,
              and motion-level-aware degradation. Wraps Standard with premium CSS layer.
            </p>
            <div className="checkbox-page__tier-import">
              import {'{'} Checkbox {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="checkbox-page__tier-preview">
              <PremiumCheckbox label="Premium" defaultChecked />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="checkbox-page__section" id="brand-color">
        <h2 className="checkbox-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Pick a brand color to see all checkboxes update in real-time. The theme generates
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
          <div className="checkbox-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`checkbox-page__color-preset${brandColor === p.hex ? ' checkbox-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="checkbox-page__section" id="props">
        <h2 className="checkbox-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="checkbox-page__section-desc">
          All props accepted by Checkbox. It also spreads any native {'<input>'} HTML attributes
          (except <code>type</code> and <code>size</code>) onto the underlying {'<input type="checkbox">'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={checkboxProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="checkbox-page__section" id="accessibility">
        <h2 className="checkbox-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="checkbox-page__section-desc">
          Built on the native {'<input type="checkbox">'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="checkbox-page__a11y-list">
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Toggles on <code className="checkbox-page__a11y-key">Space</code> key.
                Label is clickable via native <code className="checkbox-page__a11y-key">{'<label>'}</code> association.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="checkbox-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Indeterminate:</strong> Native <code className="checkbox-page__a11y-key">indeterminate</code> property
                set via ref, announced correctly by screen readers as "mixed" state.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages linked via <code className="checkbox-page__a11y-key">aria-describedby</code> and
                announced via <code className="checkbox-page__a11y-key">role="alert"</code>.
                Input marked with <code className="checkbox-page__a11y-key">aria-invalid</code>.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> Meets WCAG AA contrast ratio (4.5:1 text, 3:1 UI) in all states.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="checkbox-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="checkbox-page__a11y-key">forced-colors: active</code> with visible 2px borders
                and system color highlights.
              </span>
            </li>
            <li className="checkbox-page__a11y-item">
              <span className="checkbox-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="checkbox-page__a11y-key">prefers-reduced-motion</code>.
                Checkmark draw animation disabled at motion level 0-1.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="checkbox-page__section" id="source">
        <h2 className="checkbox-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="checkbox-page__section-desc">
          View the component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/checkbox.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="checkbox-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/checkbox.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/checkbox.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="checkbox-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/checkbox.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
