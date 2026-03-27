'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Progress } from '@ui/components/progress'
import { Progress as LiteProgress } from '@ui/lite/progress'
import { Progress as PremiumProgress } from '@ui/premium/progress'
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
    @scope (.progress-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: progress-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .progress-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .progress-page__hero::before {
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
        .progress-page__hero::before { animation: none; }
      }

      .progress-page__title {
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

      .progress-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .progress-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .progress-page__import-code {
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

      .progress-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .progress-page__section {
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
        .progress-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .progress-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .progress-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .progress-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .progress-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .progress-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      /* Subtle dot grid */
      .progress-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .progress-page__preview--row {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .progress-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .progress-page__playground {
          grid-template-columns: 1fr;
        }
        .progress-page__playground-controls {
          position: static !important;
        }
      }

      @container progress-page (max-width: 680px) {
        .progress-page__playground {
          grid-template-columns: 1fr;
        }
        .progress-page__playground-controls {
          position: static !important;
        }
      }

      .progress-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .progress-page__playground-result {
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

      /* Dot grid for playground result */
      .progress-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .progress-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .progress-page__playground-result > * {
        position: relative;
        z-index: 1;
        inline-size: 100%;
      }

      .progress-page__playground-controls {
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

      .progress-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .progress-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .progress-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .progress-page__option-btn {
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
      .progress-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .progress-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .progress-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .progress-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .progress-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .progress-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .progress-page__range-input {
        inline-size: 100%;
        accent-color: var(--brand);
        cursor: pointer;
      }

      .progress-page__range-value {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
        font-variant-numeric: tabular-nums;
        min-inline-size: 3ch;
        text-align: end;
      }

      /* ── Labeled row ────────────────────────────────── */

      .progress-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .progress-page__labeled-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 120px;
      }

      .progress-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Variants grid ────────────────────────────────── */

      .progress-page__variants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .progress-page__variant-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .progress-page__variant-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .progress-page__variant-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .progress-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .progress-page__tier-card {
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

      .progress-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .progress-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .progress-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .progress-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .progress-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .progress-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .progress-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .progress-page__tier-import {
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

      .progress-page__tier-preview {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .progress-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .progress-page__color-preset {
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
      .progress-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .progress-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .progress-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .progress-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .progress-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .progress-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .progress-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .progress-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .progress-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .progress-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .progress-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .progress-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .progress-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .progress-page__import-code,
      .progress-page code,
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

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .progress-page__hero {
          padding: 2rem 1.25rem;
        }

        .progress-page__title {
          font-size: 1.75rem;
        }

        .progress-page__preview {
          padding: 1.75rem;
        }

        .progress-page__playground {
          grid-template-columns: 1fr;
        }

        .progress-page__playground-result {
          padding: 2rem;
          min-block-size: 80px;
        }

        .progress-page__labeled-row {
          gap: 1rem;
        }

        .progress-page__variants-grid {
          grid-template-columns: 1fr;
        }

        .progress-page__tiers {
          grid-template-columns: 1fr;
        }

        .progress-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .progress-page__hero {
          padding: 1.5rem 1rem;
        }

        .progress-page__title {
          font-size: 1.5rem;
        }

        .progress-page__preview {
          padding: 1rem;
        }

        .progress-page__variants-grid {
          grid-template-columns: 1fr;
        }

        .progress-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .progress-page__title {
          font-size: 4rem;
        }

        .progress-page__preview {
          padding: 3.5rem;
        }

        .progress-page__labeled-row {
          gap: 2.5rem;
        }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const progressProps: PropDef[] = [
  { name: 'value', type: 'number', description: 'Current progress value. Omit for indeterminate mode.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value for the progress bar.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls the track height across five sizes.' },
  { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Visual color variant for semantic meaning.' },
  { name: 'label', type: 'string', description: 'Accessible label announced by screen readers via aria-label.' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Show the percentage value text next to the bar.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the underlying <div> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'success' | 'warning' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: Variant[] = ['default', 'success', 'warning', 'danger']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']


const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Progress } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Progress } from '@annondeveloper/ui-kit'",
  premium: "import { Progress } from '@annondeveloper/ui-kit/premium'",
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
      className="progress-page__copy-btn"
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
    <div className="progress-page__control-group">
      <span className="progress-page__control-label">{label}</span>
      <div className="progress-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`progress-page__option-btn${opt === value ? ' progress-page__option-btn--active' : ''}`}
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
    <label className="progress-page__toggle-label">
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
  size: Size,
  value: number | undefined,
  showValue: boolean,
  label: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (value !== undefined) props.push(`  value={${value}}`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showValue && tier !== 'lite') props.push('  showValue')
  if (label) props.push(`  label="${label}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<Progress />'
    : `<Progress\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, variant: Variant, size: Size, value: number | undefined): string {
  const className = tier === 'lite' ? 'ui-lite-progress' : 'ui-progress'
  const tierLabel = tier === 'lite' ? 'lite' : 'standard'
  const pct = value !== undefined ? Math.round((value / 100) * 100) : undefined

  const attrs = [
    `class="${className}"`,
    `role="progressbar"`,
    `data-size="${size}"`,
    `data-variant="${variant}"`,
  ]
  if (pct !== undefined) {
    attrs.push(`aria-valuenow="${value}"`)
    attrs.push('aria-valuemin="0"')
    attrs.push('aria-valuemax="100"')
  } else {
    attrs.push('data-indeterminate')
  }

  const fillStyle = pct !== undefined ? ` style="width: ${pct}%"` : ''

  return `<!-- Progress — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/progress.css'}">

<div ${attrs.join('\n     ')}>
  <div class="${className}__track">
    <div class="${className}__fill"${fillStyle}></div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, variant: Variant, size: Size, value: number | undefined): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-progress"`, `role="progressbar"`, `data-size="${size}"`]
    if (value !== undefined) {
      attrs.push(`:aria-valuenow="${value}"`)
      attrs.push('aria-valuemin="0"')
      attrs.push('aria-valuemax="100"')
    }
    const fillStyle = value !== undefined ? ` :style="{ width: '${value}%' }"` : ''
    return `<template>\n  <div ${attrs.join(' ')}>\n    <div class="ui-lite-progress__fill"${fillStyle} />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const props: string[] = []
  if (value !== undefined) props.push(`  :value="${value}"`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)

  const template = props.length === 0
    ? '  <Progress />'
    : `  <Progress\n  ${props.join('\n  ')}\n  />`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Progress } from '@annondeveloper/ui-kit'\n</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, size: Size, value: number | undefined): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-progress"`, `role="progressbar"`, `data-size="${size}"`]
    if (value !== undefined) attrs.push(`[attr.aria-valuenow]="${value}"`)
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <div class="ui-lite-progress__fill" [style.width.%]="${value ?? 0}"></div>\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const attrs = [`class="ui-progress"`, `role="progressbar"`, `data-variant="${variant}"`, `data-size="${size}"`]
  if (value !== undefined) attrs.push(`[attr.aria-valuenow]="${value}"`)
  return `<!-- Angular — Standard tier -->\n<div\n  ${attrs.join('\n  ')}\n>\n  <div class="ui-progress__track">\n    <div class="ui-progress__fill" [style.inline-size.%]="${value ?? 0}"></div>\n  </div>\n</div>\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/progress.css';`
}

function generateSvelteCode(tier: Tier, variant: Variant, size: Size, value: number | undefined): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div\n  class="ui-lite-progress"\n  role="progressbar"\n  data-size="${size}"\n  ${value !== undefined ? `aria-valuenow={${value}}` : ''}\n>\n  <div class="ui-lite-progress__fill" style="width: ${value ?? 0}%" />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const props: string[] = []
  if (value !== undefined) props.push(`  value={${value}}`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)

  return `<script>\n  import { Progress } from '@annondeveloper/ui-kit';\n</script>\n\n<Progress\n${props.join('\n')}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('default')
  const [size, setSize] = useState<Size>('md')
  const [value, setValue] = useState(65)
  const [indeterminate, setIndeterminate] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const [label, setLabel] = useState('Loading progress')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')


  const ProgressComponent = tier === 'premium' ? PremiumProgress : tier === 'lite' ? LiteProgress : Progress

  const currentValue = indeterminate ? undefined : value

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, size, currentValue, showValue, label, motion),
    [tier, variant, size, currentValue, showValue, label, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, variant, size, currentValue),
    [tier, variant, size, currentValue],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, size, currentValue),
    [tier, variant, size, currentValue],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, size, currentValue),
    [tier, variant, size, currentValue],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, size, currentValue),
    [tier, variant, size, currentValue],
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

  const previewProps: Record<string, unknown> = {}
  if (tier === 'lite') {
    if (!indeterminate) previewProps.value = value
    previewProps.max = 100
  } else {
    if (!indeterminate) previewProps.value = value
    previewProps.max = 100
    previewProps.variant = variant
    previewProps.size = size
    previewProps.showValue = showValue
    previewProps.label = label
    previewProps.motion = motion
  }

  return (
    <section className="progress-page__section" id="playground">
      <h2 className="progress-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="progress-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="progress-page__playground">
        {/* Preview area */}
        <div className="progress-page__playground-preview">
          <div className="progress-page__playground-result">
            <ProgressComponent {...previewProps} />
          </div>

          {/* Tabbed code output */}
          <div className="progress-page__code-tabs">
            <div className="progress-page__export-row">
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
              {copyStatus && <span className="progress-page__export-status">{copyStatus}</span>}
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
        <div className="progress-page__playground-controls">
          {/* Value slider */}
          <div className="progress-page__control-group">
            <span className="progress-page__control-label">
              Value{' '}
              <span className="progress-page__range-value">{indeterminate ? '--' : `${value}%`}</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              disabled={indeterminate}
              className="progress-page__range-input"
            />
          </div>

          {tier !== 'lite' && (
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          )}

          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="progress-page__control-group">
            <span className="progress-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Indeterminate" checked={indeterminate} onChange={setIndeterminate} />
              {tier !== 'lite' && <Toggle label="Show value" checked={showValue} onChange={setShowValue} />}
            </div>
          </div>

          {tier !== 'lite' && (
            <div className="progress-page__control-group">
              <span className="progress-page__control-label">Label (aria-label)</span>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="progress-page__text-input"
                placeholder="Accessible label..."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  useStyles('progress-page', pageStyles)

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
    const sections = document.querySelectorAll('.progress-page__section')
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

  const ProgressComponent = tier === 'premium' ? PremiumProgress : tier === 'lite' ? LiteProgress : Progress

  return (
    <div className="progress-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="progress-page__hero">
        <h1 className="progress-page__title">Progress</h1>
        <p className="progress-page__desc">
          Determinate and indeterminate progress indicator with variant colors, five track sizes,
          and smooth animated fill. Ships in three weight tiers from a CSS-only lite to a full-featured standard, plus Premium with shimmer and aurora glow.
        </p>
        <div className="progress-page__import-row">
          <code className="progress-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ─────────────────────────────────── */}
      <section className="progress-page__section" id="variants">
        <h2 className="progress-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="progress-page__section-desc">
          Four built-in color variants for different semantic states: default brand, success, warning, and danger.
        </p>
        <div className="progress-page__variants-grid">
          {VARIANTS.map(v => (
            <div key={v} className="progress-page__variant-cell">
              <span className="progress-page__variant-label">{v}</span>
              {tier === 'lite' ? (
                <LiteProgress value={72} max={100} />
              ) : (
                <Progress value={72} variant={v} showValue />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Size Scale ───────────────────────────────── */}
      <section className="progress-page__section" id="sizes">
        <h2 className="progress-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="progress-page__section-desc">
          Five track heights from ultra-thin hairline (xs) to thick prominent bar (xl).
          Sizes control the track block-size while the fill adapts automatically.
        </p>
        <div className="progress-page__preview">
          {SIZES.map(s => (
            <div key={s} className="progress-page__labeled-item" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
              <span className="progress-page__item-label" style={{ minInlineSize: '2ch' }}>{s}</span>
              {tier === 'lite' ? (
                <LiteProgress value={60} max={100} />
              ) : (
                <Progress value={60} size={s} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="progress-page__section" id="features">
        <h2 className="progress-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="progress-page__section-desc">
          Key capabilities including indeterminate mode, value display, and accessible labeling.
        </p>
        <div className="progress-page__preview">
          {/* Indeterminate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="progress-page__item-label">indeterminate (no value)</span>
            {tier === 'lite' ? (
              <LiteProgress max={100} />
            ) : (
              <Progress label="Loading..." />
            )}
          </div>

          {/* With value display */}
          {tier !== 'lite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="progress-page__item-label">showValue</span>
              <Progress value={83} showValue label="Upload progress" />
            </div>
          )}

          {/* With label */}
          {tier !== 'lite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span className="progress-page__item-label">aria-label for screen readers</span>
              <Progress value={45} label="Downloading assets" showValue />
            </div>
          )}

          {/* Determinate at various values */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="progress-page__item-label">determinate at different values</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[0, 25, 50, 75, 100].map(v => (
                tier === 'lite' ? (
                  <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', minInlineSize: '3ch', textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}>{v}%</span>
                    <LiteProgress value={v} max={100} />
                  </div>
                ) : (
                  <Progress key={v} value={v} showValue />
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="progress-page__section" id="tiers">
        <h2 className="progress-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="progress-page__section-desc">
          Choose the right balance of features and bundle size. Lite is CSS-only,
          Standard adds variants, sizes, motion, value display, and indeterminate animation.
          Premium adds shimmer sweep, aurora glow, and celebration particles at 100%.
        </p>

        <div className="progress-page__tiers" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {/* Lite */}
          <div
            className={`progress-page__tier-card${tier === 'lite' ? ' progress-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="progress-page__tier-header">
              <span className="progress-page__tier-name">Lite</span>
              <span className="progress-page__tier-size">~0.2 KB</span>
            </div>
            <p className="progress-page__tier-desc">
              CSS-only progress bar. Zero JavaScript beyond the forwardRef wrapper.
              Basic value/max support, no variants, no motion, no value display.
            </p>
            <div className="progress-page__tier-import">
              import {'{'} Progress {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="progress-page__tier-preview">
              <LiteProgress value={65} max={100} />
            </div>
            <div className="progress-page__size-breakdown">
              <div className="progress-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`progress-page__tier-card${tier === 'standard' ? ' progress-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="progress-page__tier-header">
              <span className="progress-page__tier-name">Standard</span>
              <span className="progress-page__tier-size">~1.2 KB</span>
            </div>
            <p className="progress-page__tier-desc">
              Full-featured progress with 4 color variants, 5 sizes, value display,
              indeterminate animation, motion levels, and ARIA support.
            </p>
            <div className="progress-page__tier-import">
              import {'{'} Progress {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="progress-page__tier-preview">
              <Progress value={65} variant="default" showValue />
            </div>
            <div className="progress-page__size-breakdown">
              <div className="progress-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`progress-page__tier-card${tier === 'premium' ? ' progress-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="progress-page__tier-header">
              <span className="progress-page__tier-name">Premium</span>
              <span className="progress-page__tier-size">~1.5 KB</span>
            </div>
            <p className="progress-page__tier-desc">
              Animated shimmer sweep across the filled bar, aurora glow beneath the track,
              and celebration particles at 100%. Wraps Standard with premium CSS layer.
            </p>
            <div className="progress-page__tier-import">
              import {'{'} Progress {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="progress-page__tier-preview">
              <PremiumProgress value={65} variant="default" showValue />
            </div>
            <div className="progress-page__size-breakdown">
              <div className="progress-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="progress-page__section" id="brand-color">
        <h2 className="progress-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="progress-page__section-desc">
          Pick a brand color to see the default variant update in real-time. The theme generates
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
          <div className="progress-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`progress-page__color-preset${brandColor === p.hex ? ' progress-page__color-preset--active' : ''}`}
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
          {/* Preview with custom brand */}
          <div className="progress-page__preview" style={{ gap: '1rem' }}>
            {tier === 'lite' ? (
              <LiteProgress value={72} max={100} />
            ) : (
              <>
                <Progress value={72} showValue label="Brand colored progress" />
                <Progress label="Indeterminate with brand color" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="progress-page__section" id="props">
        <h2 className="progress-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="progress-page__section-desc">
          All props accepted by Progress. It also spreads any native HTML div attributes
          onto the underlying {'<div>'} element with <code className="progress-page__a11y-key">role="progressbar"</code>.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tier === 'lite' ? progressProps.filter(p => ['value', 'max', 'className', 'ref'].includes(p.name)) : progressProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="progress-page__section" id="accessibility">
        <h2 className="progress-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="progress-page__section-desc">
          Built with semantic ARIA progressbar role and comprehensive screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="progress-page__a11y-list">
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="progress-page__a11y-key">role="progressbar"</code> with
                {' '}<code className="progress-page__a11y-key">aria-valuenow</code>,
                {' '}<code className="progress-page__a11y-key">aria-valuemin</code>, and
                {' '}<code className="progress-page__a11y-key">aria-valuemax</code>.
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> Supports <code className="progress-page__a11y-key">aria-label</code> via
                the <code className="progress-page__a11y-key">label</code> prop for descriptive context.
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Indeterminate:</strong> When no value is set, ARIA value attributes are omitted
                to signal indeterminate state to assistive technology.
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variant fill colors meet WCAG AA contrast ratio (3:1 UI components).
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="progress-page__a11y-key">forced-colors: active</code> with
                visible 2px borders using system <code className="progress-page__a11y-key">Highlight</code> color.
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="progress-page__a11y-key">prefers-reduced-motion</code> and
                {' '}<code className="progress-page__a11y-key">prefers-reduced-data</code> — disables indeterminate animation.
              </span>
            </li>
            <li className="progress-page__a11y-item">
              <span className="progress-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Renders with solid fill and no animation in print media.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ────────────────────────────────────── */}
      <section className="progress-page__section" id="source">
        <h2 className="progress-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="progress-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/progress.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="progress-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/progress.tsx — Standard tier
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/progress.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="progress-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/progress.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
