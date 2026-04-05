'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ConfirmDialog } from '@ui/components/confirm-dialog'
import { ConfirmDialog as LiteConfirmDialog } from '@ui/lite/confirm-dialog'
import { ConfirmDialog as PremiumConfirmDialog } from '@ui/premium/confirm-dialog'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.confirm-dialog-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: confirm-dialog-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .confirm-dialog-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .confirm-dialog-page__hero::before {
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
        animation: aurora-spin-cd 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-cd {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .confirm-dialog-page__hero::before { animation: none; }
      }

      .confirm-dialog-page__title {
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

      .confirm-dialog-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .confirm-dialog-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .confirm-dialog-page__import-code {
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

      .confirm-dialog-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .confirm-dialog-page__section {
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
        animation: section-reveal-cd 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-cd {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .confirm-dialog-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .confirm-dialog-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .confirm-dialog-page__section-title a { color: inherit; text-decoration: none; }
      .confirm-dialog-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .confirm-dialog-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .confirm-dialog-page__preview {
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

      .confirm-dialog-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .confirm-dialog-page__result {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        min-inline-size: 200px;
        text-align: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .confirm-dialog-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .confirm-dialog-page__playground {
          grid-template-columns: 1fr;
        }
        .confirm-dialog-page__playground-controls {
          position: static !important;
        }
      }

      @container confirm-dialog-page (max-width: 680px) {
        .confirm-dialog-page__playground {
          grid-template-columns: 1fr;
        }
        .confirm-dialog-page__playground-controls {
          position: static !important;
        }
      }

      .confirm-dialog-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .confirm-dialog-page__playground-result {
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

      .confirm-dialog-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .confirm-dialog-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .confirm-dialog-page__playground-controls {
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

      .confirm-dialog-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .confirm-dialog-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .confirm-dialog-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .confirm-dialog-page__option-btn {
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
      .confirm-dialog-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .confirm-dialog-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .confirm-dialog-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .confirm-dialog-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .confirm-dialog-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .confirm-dialog-page__code-tabs {
        margin-block-start: 1rem;
      }

      .confirm-dialog-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .confirm-dialog-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .confirm-dialog-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .confirm-dialog-page__tier-card {
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

      .confirm-dialog-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .confirm-dialog-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .confirm-dialog-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .confirm-dialog-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .confirm-dialog-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .confirm-dialog-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .confirm-dialog-page__tier-import {
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

      .confirm-dialog-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .confirm-dialog-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .confirm-dialog-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .confirm-dialog-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .confirm-dialog-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .confirm-dialog-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .confirm-dialog-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .confirm-dialog-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Color presets ──────────────────────────────── */

      .confirm-dialog-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .confirm-dialog-page__color-preset {
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
      .confirm-dialog-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .confirm-dialog-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .confirm-dialog-page__hero {
          padding: 2rem 1.25rem;
        }

        .confirm-dialog-page__title {
          font-size: 1.75rem;
        }

        .confirm-dialog-page__preview {
          padding: 1.75rem;
        }

        .confirm-dialog-page__playground {
          grid-template-columns: 1fr;
        }

        .confirm-dialog-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .confirm-dialog-page__tiers {
          grid-template-columns: 1fr;
        }

        .confirm-dialog-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .confirm-dialog-page__hero {
          padding: 1.5rem 1rem;
        }

        .confirm-dialog-page__title {
          font-size: 1.5rem;
        }

        .confirm-dialog-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .confirm-dialog-page__title {
          font-size: 4rem;
        }

        .confirm-dialog-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .confirm-dialog-page__import-code,
      .confirm-dialog-page code,
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

// ─── Data ────────────────────────────────────────────────────────────────────

type Variant = 'default' | 'danger'
type MotionLevel = 0 | 1 | 2 | 3

const VARIANTS: Variant[] = ['default', 'danger']
const MOTION_LEVELS: MotionLevel[] = [0, 1, 2, 3]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ConfirmDialog } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ConfirmDialog } from '@annondeveloper/ui-kit'",
  premium: "import { ConfirmDialog } from '@annondeveloper/ui-kit/premium'",
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

const propsData: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Whether the confirmation dialog is visible.' },
  { name: 'onConfirm', type: '() => void', required: true, description: 'Callback when the user confirms the action.' },
  { name: 'onCancel', type: '() => void', required: true, description: 'Callback when the user cancels or dismisses.' },
  { name: 'title', type: 'ReactNode', required: true, description: 'Dialog heading text.' },
  { name: 'description', type: 'ReactNode', description: 'Supporting text explaining the action and its consequences.' },
  { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Label for the confirm button.' },
  { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Label for the cancel button.' },
  { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Visual style. Danger uses red confirm button for destructive actions.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows loading spinner on the confirm button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="confirm-dialog-page__copy-btn"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size="sm" />
      {copied ? 'Copied!' : 'Copy'}
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
    <div className="confirm-dialog-page__control-group">
      <span className="confirm-dialog-page__control-label">{label}</span>
      <div className="confirm-dialog-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`confirm-dialog-page__option-btn${opt === value ? ' confirm-dialog-page__option-btn--active' : ''}`}
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
    <label className="confirm-dialog-page__toggle-label">
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

function generateReactCode(
  tier: Tier,
  variant: Variant,
  title: string,
  description: string,
  confirmLabel: string,
  cancelLabel: string,
  loading: boolean,
  motion: MotionLevel,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  open={open}',
    `  title="${title}"`,
  ]
  if (description) props.push(`  description="${description}"`)
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (confirmLabel !== 'Confirm') props.push(`  confirmLabel="${confirmLabel}"`)
  if (cancelLabel !== 'Cancel') props.push(`  cancelLabel="${cancelLabel}"`)
  if (loading && tier !== 'lite') props.push('  loading')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  onConfirm={() => setOpen(false)}')
  props.push('  onCancel={() => setOpen(false)}')

  return `${importStr}
import { useState } from 'react'

function Example() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      <ConfirmDialog
${props.join('\n')}
      />
    </>
  )
}`
}

function generateHtmlCode(
  variant: Variant,
  title: string,
  description: string,
  confirmLabel: string,
  cancelLabel: string,
): string {
  return `<!-- ConfirmDialog — @annondeveloper/ui-kit HTML/CSS approach -->
<dialog id="confirm-dialog" class="ui-confirm-dialog">
  <h2>${title}</h2>
  ${description ? `<p>${description}</p>` : ''}
  <div class="ui-confirm-dialog__actions">
    <button class="ui-button" data-variant="secondary" onclick="this.closest('dialog').close()">
      ${cancelLabel}
    </button>
    <button class="ui-button" data-variant="${variant === 'danger' ? 'danger' : 'primary'}" onclick="handleConfirm()">
      ${confirmLabel}
    </button>
  </div>
</dialog>

<button onclick="document.getElementById('confirm-dialog').showModal()">
  Open Dialog
</button>

<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/confirm-dialog.css">`
}

function generateVueCode(
  tier: Tier,
  variant: Variant,
  title: string,
  description: string,
  confirmLabel: string,
  cancelLabel: string,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'

  if (tier === 'lite') {
    return `<template>
  <button @click="open = true">Open Dialog</button>
  <dialog ref="dialogRef" class="ui-lite-confirm-dialog" data-variant="${variant}">
    <h2>${title}</h2>
    ${description ? `<p>${description}</p>` : ''}
    <div class="ui-lite-dialog__footer">
      <button class="ui-lite-button" data-variant="secondary" @click="open = false">${cancelLabel}</button>
      <button class="ui-lite-button" data-variant="${variant === 'danger' ? 'danger' : 'primary'}" @click="handleConfirm">${confirmLabel}</button>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const open = ref(false)
const dialogRef = ref(null)

watch(open, (val) => {
  if (val) dialogRef.value?.showModal()
  else dialogRef.value?.close()
})

const handleConfirm = () => { open.value = false }
</script>

<style>
@import '${importPath}/styles.css';
</style>`
  }

  const props: string[] = [':open="open"', `title="${title}"`]
  if (description) props.push(`description="${description}"`)
  if (variant !== 'default') props.push(`variant="${variant}"`)
  if (confirmLabel !== 'Confirm') props.push(`confirmLabel="${confirmLabel}"`)
  if (cancelLabel !== 'Cancel') props.push(`cancelLabel="${cancelLabel}"`)
  props.push('@confirm="open = false"')
  props.push('@cancel="open = false"')

  return `<template>
  <button @click="open = true">Open Dialog</button>
  <ConfirmDialog
    ${props.join('\n    ')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { ConfirmDialog } from '${importPath}'

const open = ref(false)
</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: Variant,
  title: string,
  description: string,
  confirmLabel: string,
  cancelLabel: string,
): string {
  const tierLabel = tier === 'premium' ? 'Premium' : tier === 'lite' ? 'Lite' : 'Standard'
  const cssImport = tier === 'lite'
    ? "@import '@annondeveloper/ui-kit/lite/styles.css';"
    : "@import '@annondeveloper/ui-kit/css/components/confirm-dialog.css';"

  return `<!-- Angular — ${tierLabel} tier (CSS-only approach) -->
<button (click)="open = true">Open Dialog</button>

<dialog #confirmDialog class="ui-confirm-dialog" [attr.open]="open || null">
  <h2>${title}</h2>
  ${description ? `<p>${description}</p>` : ''}
  <div class="ui-confirm-dialog__actions">
    <button class="ui-button" data-variant="secondary" (click)="open = false">
      ${cancelLabel}
    </button>
    <button class="ui-button" data-variant="${variant === 'danger' ? 'danger' : 'primary'}" (click)="handleConfirm()">
      ${confirmLabel}
    </button>
  </div>
</dialog>

/* In styles.css */
${cssImport}`
}

function generateSvelteCode(
  tier: Tier,
  variant: Variant,
  title: string,
  description: string,
  confirmLabel: string,
  cancelLabel: string,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'

  if (tier === 'lite') {
    return `<script>
  let open = false
  let dialogEl

  $: if (dialogEl) {
    if (open) dialogEl.showModal()
    else dialogEl.close()
  }
</script>

<button on:click={() => open = true}>Open Dialog</button>

<dialog bind:this={dialogEl} class="ui-lite-confirm-dialog" data-variant="${variant}">
  <h2>${title}</h2>
  ${description ? `<p>${description}</p>` : ''}
  <div class="ui-lite-dialog__footer">
    <button class="ui-lite-button" data-variant="secondary" on:click={() => open = false}>${cancelLabel}</button>
    <button class="ui-lite-button" data-variant="${variant === 'danger' ? 'danger' : 'primary'}" on:click={() => open = false}>${confirmLabel}</button>
  </div>
</dialog>

<style>
  @import '${importPath}/styles.css';
</style>`
  }

  return `<script>
  import { ConfirmDialog } from '${importPath}'
  let open = false
</script>

<button on:click={() => open = true}>Open Dialog</button>

<ConfirmDialog
  bind:open
  title="${title}"
  ${description ? `description="${description}"` : ''}
  ${variant !== 'default' ? `variant="${variant}"` : ''}
  ${confirmLabel !== 'Confirm' ? `confirmLabel="${confirmLabel}"` : ''}
  ${cancelLabel !== 'Cancel' ? `cancelLabel="${cancelLabel}"` : ''}
  on:confirm={() => open = false}
  on:cancel={() => open = false}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('default')
  const [dialogTitle, setDialogTitle] = useState('Save changes?')
  const [dialogDesc, setDialogDesc] = useState('Your changes will be saved to the server.')
  const [confirmLabel, setConfirmLabel] = useState('Confirm')
  const [cancelLabel, setCancelLabel] = useState('Cancel')
  const [loading, setLoading] = useState(false)
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [result, setResult] = useState('No action taken yet')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const effectiveTier = tier

  // Render appropriate tier component
  const renderDialog = () => {
    const commonProps = {
      open: dialogOpen,
      title: dialogTitle,
      description: dialogDesc,
      confirmLabel,
      cancelLabel,
      variant,
      onConfirm: () => { setDialogOpen(false); setResult('Confirmed') },
      onCancel: () => { setDialogOpen(false); setResult('Cancelled') },
    }

    if (effectiveTier === 'lite') {
      return (
        <LiteConfirmDialog
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setResult('Cancelled') }}
          onConfirm={() => { setDialogOpen(false); setResult('Confirmed') }}
          title={dialogTitle}
          description={dialogDesc}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          variant={variant}
          loading={loading}
        >
          {dialogDesc}
        </LiteConfirmDialog>
      )
    }

    if (effectiveTier === 'premium') {
      return (
        <PremiumConfirmDialog
          {...commonProps}
          loading={loading}
          motion={motion}
        />
      )
    }

    return (
      <ConfirmDialog
        {...commonProps}
        loading={loading}
        motion={motion}
      />
    )
  }

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel, loading, motion),
    [tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel, loading, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel),
    [variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel),
    [tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel),
    [tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel),
    [tier, variant, dialogTitle, dialogDesc, confirmLabel, cancelLabel],
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

  return (
    <section className="confirm-dialog-page__section" id="playground">
      <h2 className="confirm-dialog-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="confirm-dialog-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="confirm-dialog-page__playground">
        {/* Preview area */}
        <div className="confirm-dialog-page__playground-preview">
          <div className="confirm-dialog-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={() => setDialogOpen(true)}
              >
                <Icon name={variant === 'danger' ? 'trash' : 'check'} size="sm" />
                Open ConfirmDialog
              </Button>
              <div className="confirm-dialog-page__result">{result}</div>
            </div>
          </div>

          {renderDialog()}

          {/* Tabbed code output */}
          <div className="confirm-dialog-page__code-tabs">
            <div className="confirm-dialog-page__export-row">
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
              {copyStatus && <span className="confirm-dialog-page__export-status">{copyStatus}</span>}
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
        <div className="confirm-dialog-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as MotionLevel)}
            />
          )}

          <div className="confirm-dialog-page__control-group">
            <span className="confirm-dialog-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
            </div>
          </div>

          <div className="confirm-dialog-page__control-group">
            <span className="confirm-dialog-page__control-label">Title</span>
            <input
              type="text"
              value={dialogTitle}
              onChange={e => setDialogTitle(e.target.value)}
              className="confirm-dialog-page__text-input"
              placeholder="Dialog title..."
            />
          </div>

          <div className="confirm-dialog-page__control-group">
            <span className="confirm-dialog-page__control-label">Description</span>
            <input
              type="text"
              value={dialogDesc}
              onChange={e => setDialogDesc(e.target.value)}
              className="confirm-dialog-page__text-input"
              placeholder="Description..."
            />
          </div>

          <div className="confirm-dialog-page__control-group">
            <span className="confirm-dialog-page__control-label">Confirm Label</span>
            <input
              type="text"
              value={confirmLabel}
              onChange={e => setConfirmLabel(e.target.value)}
              className="confirm-dialog-page__text-input"
              placeholder="Confirm"
            />
          </div>

          <div className="confirm-dialog-page__control-group">
            <span className="confirm-dialog-page__control-label">Cancel Label</span>
            <input
              type="text"
              value={cancelLabel}
              onChange={e => setCancelLabel(e.target.value)}
              className="confirm-dialog-page__text-input"
              placeholder="Cancel"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ConfirmDialogPage() {
  useStyles('confirm-dialog-page', pageStyles)
  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const [defaultOpen, setDefaultOpen] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [loadingOpen, setLoadingOpen] = useState(false)
  const [loadingActive, setLoadingActive] = useState(false)
  const [result, setResult] = useState<string>('No action taken yet')

  const effectiveTier = tier

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

  // Select the right component for the tier
  const renderConfirmDialog = (props: {
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant?: 'default' | 'danger'
    loading?: boolean
    onConfirm: () => void
    onCancel: () => void
  }) => {
    if (effectiveTier === 'lite') {
      return (
        <LiteConfirmDialog
          open={props.open}
          onClose={props.onCancel}
          onConfirm={props.onConfirm}
          title={props.title}
          description={props.description}
          confirmLabel={props.confirmLabel}
          cancelLabel="Cancel"
          variant={props.variant}
          loading={props.loading}
        >
          {props.description}
        </LiteConfirmDialog>
      )
    }
    if (effectiveTier === 'premium') {
      return (
        <PremiumConfirmDialog
          open={props.open}
          onConfirm={props.onConfirm}
          onCancel={props.onCancel}
          title={props.title}
          description={props.description}
          confirmLabel={props.confirmLabel}
          variant={props.variant}
          loading={props.loading}
        />
      )
    }
    return (
      <ConfirmDialog
        open={props.open}
        onConfirm={props.onConfirm}
        onCancel={props.onCancel}
        title={props.title}
        description={props.description}
        confirmLabel={props.confirmLabel}
        variant={props.variant}
        loading={props.loading}
      />
    )
  }

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.confirm-dialog-page__section')
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
    <div className="confirm-dialog-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="confirm-dialog-page__hero">
        <h1 className="confirm-dialog-page__title">ConfirmDialog</h1>
        <p className="confirm-dialog-page__desc">
          Modal confirmation dialog with default and danger variants. Built on native
          &lt;dialog&gt; with focus trapping, backdrop dismiss, and keyboard navigation.
          Ships in three weight tiers from 0.4KB lite to 1.8KB premium with spring entrance.
        </p>
        <div className="confirm-dialog-page__import-row">
          <code className="confirm-dialog-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Default Confirmation ──────────────────────── */}
      <section className="confirm-dialog-page__section" id="default">
        <h2 className="confirm-dialog-page__section-title"><a href="#default">Default Confirmation</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Standard confirmation with neutral styling. Useful for non-destructive actions that need user acknowledgment.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button onClick={() => setDefaultOpen(true)}>
            <Icon name="check" size="sm" /> Save Changes
          </Button>
          <div className="confirm-dialog-page__result">{result}</div>
        </div>
        {renderConfirmDialog({
          open: defaultOpen,
          title: 'Save changes?',
          description: 'Your changes will be saved to the server. You can always revert later from the history.',
          confirmLabel: 'Save',
          onConfirm: () => { setDefaultOpen(false); setResult('Confirmed: Changes saved') },
          onCancel: () => { setDefaultOpen(false); setResult('Cancelled: No changes saved') },
        })}
      </section>

      {/* ── 4. Danger Variant ────────────────────────────── */}
      <section className="confirm-dialog-page__section" id="danger">
        <h2 className="confirm-dialog-page__section-title"><a href="#danger">Danger Variant</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Red-tinted confirm button for destructive actions like deletion. Draws user attention to the severity.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button variant="secondary" onClick={() => setDangerOpen(true)}>
            <Icon name="trash" size="sm" /> Delete Account
          </Button>
        </div>
        {renderConfirmDialog({
          open: dangerOpen,
          variant: 'danger',
          title: 'Delete account?',
          description: 'This action cannot be undone. All your data, projects, and settings will be permanently removed.',
          confirmLabel: 'Delete permanently',
          onConfirm: () => setDangerOpen(false),
          onCancel: () => setDangerOpen(false),
        })}
      </section>

      {/* ── 5. Loading State ─────────────────────────── */}
      <section className="confirm-dialog-page__section" id="loading">
        <h2 className="confirm-dialog-page__section-title"><a href="#loading">Loading State</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Show a loading spinner on the confirm button while an async action is in progress.
          The dialog remains open until the operation completes.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button variant="secondary" onClick={() => { setLoadingOpen(true); setLoadingActive(true) }}>
            <Icon name="upload" size="sm" /> Deploy
          </Button>
        </div>
        {renderConfirmDialog({
          open: loadingOpen,
          title: 'Deploy to production?',
          description: 'This will deploy the current build to production. The process takes about 30 seconds.',
          confirmLabel: 'Deploy',
          loading: loadingActive,
          onConfirm: () => {
            setTimeout(() => {
              setLoadingOpen(false)
              setLoadingActive(false)
            }, 2000)
          },
          onCancel: () => { setLoadingOpen(false); setLoadingActive(false) },
        })}
      </section>

      {/* ── 6. Weight Tiers ──────────────────────────── */}
      <section className="confirm-dialog-page__section" id="tiers">
        <h2 className="confirm-dialog-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="confirm-dialog-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same core API.
          Lite uses native &lt;dialog&gt; directly; Premium adds spring entrance and aurora backdrop glow.
        </p>

        <div className="confirm-dialog-page__tiers">
          {/* Lite */}
          <div
            className={`confirm-dialog-page__tier-card${tier === 'lite' ? ' confirm-dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="confirm-dialog-page__tier-header">
              <span className="confirm-dialog-page__tier-name">Lite</span>
              <span className="confirm-dialog-page__tier-size">~0.4 KB</span>
            </div>
            <p className="confirm-dialog-page__tier-desc">
              CSS-only native &lt;dialog&gt; wrapper. Zero styling dependencies, minimal JS.
            </p>
            <div className="confirm-dialog-page__tier-import">
              import {'{'} ConfirmDialog {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="confirm-dialog-page__size-breakdown">
              <div className="confirm-dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`confirm-dialog-page__tier-card${tier === 'standard' ? ' confirm-dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="confirm-dialog-page__tier-header">
              <span className="confirm-dialog-page__tier-name">Standard</span>
              <span className="confirm-dialog-page__tier-size">~1.2 KB</span>
            </div>
            <p className="confirm-dialog-page__tier-desc">
              Full-featured with focus trapping, motion levels, embedded scoped CSS, and accessibility.
            </p>
            <div className="confirm-dialog-page__tier-import">
              import {'{'} ConfirmDialog {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="confirm-dialog-page__size-breakdown">
              <div className="confirm-dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`confirm-dialog-page__tier-card${tier === 'premium' ? ' confirm-dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="confirm-dialog-page__tier-header">
              <span className="confirm-dialog-page__tier-name">Premium</span>
              <span className="confirm-dialog-page__tier-size">~1.8 KB</span>
            </div>
            <p className="confirm-dialog-page__tier-desc">
              Everything in Standard plus spring scale entrance, aurora backdrop glow, and button shimmer.
            </p>
            <div className="confirm-dialog-page__tier-import">
              import {'{'} ConfirmDialog {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="confirm-dialog-page__size-breakdown">
              <div className="confirm-dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────── */}
      <section className="confirm-dialog-page__section" id="brand-color">
        <h2 className="confirm-dialog-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="confirm-dialog-page__section-desc">
          Pick a brand color to see the confirm dialog update in real-time. The theme generates
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
          <div className="confirm-dialog-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`confirm-dialog-page__color-preset${brandColor === p.hex ? ' confirm-dialog-page__color-preset--active' : ''}`}
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
      <section className="confirm-dialog-page__section" id="props">
        <h2 className="confirm-dialog-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="confirm-dialog-page__section-desc">
          All props accepted by the ConfirmDialog component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="confirm-dialog-page__section" id="accessibility">
        <h2 className="confirm-dialog-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="confirm-dialog-page__section-desc">
          Built on the native &lt;dialog&gt; element with comprehensive keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="confirm-dialog-page__a11y-list">
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="confirm-dialog-page__a11y-key">Escape</code> dismisses the dialog. <code className="confirm-dialog-page__a11y-key">Tab</code> / <code className="confirm-dialog-page__a11y-key">Shift+Tab</code> cycles through focusable elements.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus trap:</strong> Focus is locked within the dialog while open. On close, focus returns to the trigger element.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Uses native <code className="confirm-dialog-page__a11y-key">&lt;dialog&gt;</code> with implicit <code className="confirm-dialog-page__a11y-key">role="dialog"</code> and <code className="confirm-dialog-page__a11y-key">aria-modal="true"</code>.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Backdrop:</strong> Clicking the backdrop dismisses the dialog, matching native browser behavior.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Confirm button announces <code className="confirm-dialog-page__a11y-key">aria-busy="true"</code> during async operations.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variants meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Action buttons enforce 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="confirm-dialog-page__a11y-item">
              <span className="confirm-dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="confirm-dialog-page__a11y-key">prefers-reduced-motion</code> and <code className="confirm-dialog-page__a11y-key">motion</code> prop.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="confirm-dialog-page__section" id="source">
        <h2 className="confirm-dialog-page__section-title"><a href="#source">Source</a></h2>
        <p className="confirm-dialog-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="confirm-dialog-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/confirm-dialog.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/confirm-dialog.tsx (Standard)
          </a>
          <a className="confirm-dialog-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/confirm-dialog.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/confirm-dialog.tsx (Lite)
          </a>
          <a className="confirm-dialog-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/confirm-dialog.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/confirm-dialog.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
