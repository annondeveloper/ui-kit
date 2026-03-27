'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Card3D } from '@ui/domain/card-3d'
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
    @scope (.card-3d-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: card-3d-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .card-3d-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .card-3d-page__hero::before {
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
        animation: card-3d-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes card-3d-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .card-3d-page__hero::before { animation: none; }
      }

      .card-3d-page__title {
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

      .card-3d-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .card-3d-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .card-3d-page__import-code {
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

      .card-3d-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .card-3d-page__section {
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
        animation: c3d-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes c3d-section-reveal {
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
        .card-3d-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .card-3d-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .card-3d-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .card-3d-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .card-3d-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .card-3d-page__preview {
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

      .card-3d-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .card-3d-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .card-3d-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container card-3d-page (max-width: 680px) {
        .card-3d-page__playground {
          grid-template-columns: 1fr;
        }
        .card-3d-page__playground-controls {
          position: static !important;
        }
      }

      .card-3d-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card-3d-page__playground-result {
        overflow-x: auto;
        min-block-size: 280px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .card-3d-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .card-3d-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .card-3d-page__playground-controls {
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

      .card-3d-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .card-3d-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .card-3d-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .card-3d-page__option-btn {
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
      .card-3d-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .card-3d-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .card-3d-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .card-3d-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .card-3d-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled items ──────────────────────────────── */

      .card-3d-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .card-3d-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .card-3d-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .card-3d-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .card-3d-page__tier-card {
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

      .card-3d-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .card-3d-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .card-3d-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .card-3d-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-3d-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .card-3d-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .card-3d-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .card-3d-page__tier-import {
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

      .card-3d-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .card-3d-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .card-3d-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .card-3d-page__code-tabs {
        margin-block-start: 1rem;
      }

      .card-3d-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .card-3d-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color presets ──────────────────────────────── */

      .card-3d-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .card-3d-page__color-preset {
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
      .card-3d-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .card-3d-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .card-3d-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .card-3d-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .card-3d-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .card-3d-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Demo card content ──────────────────────────── */

      .card-3d-page__demo-content {
        padding: 0.5rem;
      }

      .card-3d-page__demo-content h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
      }

      .card-3d-page__demo-content p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.5;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .card-3d-page__hero {
          padding: 2rem 1.25rem;
        }

        .card-3d-page__title {
          font-size: 1.75rem;
        }

        .card-3d-page__preview {
          padding: 1.75rem;
        }

        .card-3d-page__playground {
          grid-template-columns: 1fr;
        }

        .card-3d-page__playground-controls {
          position: static !important;
        }

        .card-3d-page__playground-result {
          padding: 2rem;
          min-block-size: 180px;
        }

        .card-3d-page__tiers {
          grid-template-columns: 1fr;
        }

        .card-3d-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .card-3d-page__hero {
          padding: 1.5rem 1rem;
        }

        .card-3d-page__title {
          font-size: 1.5rem;
        }

        .card-3d-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .card-3d-page__title {
          font-size: 4rem;
        }

        .card-3d-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .card-3d-page__import-code,
      .card-3d-page code,
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

const card3DProps: PropDef[] = [
  { name: 'perspective', type: 'number', default: '1000', description: 'CSS perspective value in pixels. Lower values create more dramatic 3D rotation.' },
  { name: 'maxTilt', type: 'number', default: '10', description: 'Maximum tilt angle in degrees. Higher values create more dramatic rotation on hover.' },
  { name: 'glare', type: 'boolean', default: 'true', description: 'Show a directional glare overlay that follows cursor position.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 disables tilt and glare. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the card with preserve-3d transform style.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
  { name: 'onMouseMove', type: '(e: MouseEvent) => void', description: 'Mouse move handler. Called alongside internal tilt tracking.' },
  { name: 'onMouseLeave', type: '(e: MouseEvent) => void', description: 'Mouse leave handler. Called alongside tilt reset to 0.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Card3D } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Card3D } from '@annondeveloper/ui-kit'",
  premium: "import { Card3D } from '@annondeveloper/ui-kit/premium'",
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

const PERSPECTIVE_PRESETS = [
  { value: 500, label: '500px (dramatic)' },
  { value: 800, label: '800px (moderate)' },
  { value: 1000, label: '1000px (default)' },
  { value: 1500, label: '1500px (subtle)' },
  { value: 2000, label: '2000px (gentle)' },
]

const TILT_PRESETS = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="card-3d-page__copy-btn"
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
    <div className="card-3d-page__control-group">
      <span className="card-3d-page__control-label">{label}</span>
      <div className="card-3d-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`card-3d-page__option-btn${opt === value ? ' card-3d-page__option-btn--active' : ''}`}
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
    <label className="card-3d-page__toggle-label">
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
  perspective: number,
  maxTilt: number,
  glare: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (perspective !== 1000) props.push(`  perspective={${perspective}}`)
  if (maxTilt !== 10) props.push(`  maxTilt={${maxTilt}}`)
  if (!glare) props.push('  glare={false}')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const inner = `  <h3>3D Card</h3>\n  <p>Hover and tilt to see the 3D perspective effect.</p>`

  if (props.length === 0) {
    return `${importStr}\n\n<Card3D>\n${inner}\n</Card3D>`
  }
  return `${importStr}\n\n<Card3D\n${props.join('\n')}\n>\n${inner}\n</Card3D>`
}

function generateHtmlCode(tier: Tier, perspective: number, glare: boolean): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/card-3d.css';`
  const perspectiveStyle = perspective !== 1000 ? ` style="--card-3d-perspective: ${perspective}px"` : ''

  return `<!-- Card3D — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/card-3d.css">

<div class="ui-card-3d"${perspectiveStyle}>
  <div class="ui-card-3d--inner">
    <div class="ui-card-3d--content">
      <h3>3D Card</h3>
      <p>Hover to see the tilt effect.</p>
    </div>${glare ? '\n    <div class="ui-card-3d--glare" aria-hidden="true"></div>' : ''}
  </div>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->

<!-- Note: JS required for cursor-tracking tilt effect -->`
}

function generateVueCode(tier: Tier, perspective: number, maxTilt: number, glare: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-card-3d">
    <div class="ui-card-3d--inner">
      <div class="ui-card-3d--content">
        <h3>3D Card</h3>
        <p>Hover to see the tilt effect.</p>
      </div>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (perspective !== 1000) attrs.push(`  :perspective="${perspective}"`)
  if (maxTilt !== 10) attrs.push(`  :max-tilt="${maxTilt}"`)
  if (!glare) attrs.push('  :glare="false"')

  const template = attrs.length === 0
    ? `  <Card3D>\n    <h3>3D Card</h3>\n    <p>Hover to see the tilt effect.</p>\n  </Card3D>`
    : `  <Card3D\n  ${attrs.join('\n  ')}\n  >\n    <h3>3D Card</h3>\n    <p>Hover to see the tilt effect.</p>\n  </Card3D>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Card3D } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, perspective: number, glare: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-card-3d">
  <div class="ui-card-3d--inner">
    <div class="ui-card-3d--content">
      <h3>3D Card</h3>
      <p>Hover to see the tilt effect.</p>
    </div>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const perspectiveAttr = perspective !== 1000 ? `\n  [style]="'--card-3d-perspective: ${perspective}px'"` : ''
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-card-3d"${perspectiveAttr}
>
  <div class="ui-card-3d--inner">
    <div class="ui-card-3d--content">
      <h3>3D Card</h3>
      <p>Hover to see the tilt effect.</p>
    </div>${glare ? '\n    <div class="ui-card-3d--glare" aria-hidden="true"></div>' : ''}
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/card-3d.css';`
}

function generateSvelteCode(tier: Tier, perspective: number, maxTilt: number, glare: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-card-3d">
  <div class="ui-card-3d--inner">
    <div class="ui-card-3d--content">
      <h3>3D Card</h3>
      <p>Hover to see the tilt effect.</p>
    </div>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (perspective !== 1000) attrs.push(`perspective={${perspective}}`)
  if (maxTilt !== 10) attrs.push(`maxTilt={${maxTilt}}`)
  if (!glare) attrs.push('glare={false}')
  const attrStr = attrs.length > 0 ? `\n  ${attrs.join('\n  ')}` : ''
  return `<script>
  import { Card3D } from '${importPath}';
</script>

<Card3D${attrStr}>
  <h3>3D Card</h3>
  <p>Hover to see the tilt effect.</p>
</Card3D>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [perspective, setPerspective] = useState(1000)
  const [maxTilt, setMaxTilt] = useState(10)
  const [glare, setGlare] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(() => generateReactCode(tier, perspective, maxTilt, glare, motion), [tier, perspective, maxTilt, glare, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, perspective, glare), [tier, perspective, glare])
  const vueCode = useMemo(() => generateVueCode(tier, perspective, maxTilt, glare), [tier, perspective, maxTilt, glare])
  const angularCode = useMemo(() => generateAngularCode(tier, perspective, glare), [tier, perspective, glare])
  const svelteCode = useMemo(() => generateSvelteCode(tier, perspective, maxTilt, glare), [tier, perspective, maxTilt, glare])

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
    <section className="card-3d-page__section" id="playground">
      <h2 className="card-3d-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="card-3d-page__section-desc">
        Tweak every prop and see the result in real-time. Hover and move your cursor over the card to see the 3D tilt and glare effects.
      </p>

      <div className="card-3d-page__playground">
        <div className="card-3d-page__playground-preview">
          <div className="card-3d-page__playground-result">
            <Card3D
              perspective={perspective}
              maxTilt={maxTilt}
              glare={glare}
              motion={motion}
            >
              <div className="card-3d-page__demo-content" style={{ padding: '1.5rem', minInlineSize: '220px' }}>
                <h3>Interactive 3D Card</h3>
                <p>Move your cursor over this card to see the perspective tilt and glare effects update in real-time.</p>
              </div>
            </Card3D>
          </div>

          <div className="card-3d-page__code-tabs">
            <div className="card-3d-page__export-row">
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
              {copyStatus && <span className="card-3d-page__export-status">{copyStatus}</span>}
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

        <div className="card-3d-page__playground-controls">
          <OptionGroup
            label="Max Tilt"
            options={TILT_PRESETS.map(t => t.label) as unknown as readonly string[]}
            value={String(maxTilt)}
            onChange={v => setMaxTilt(Number(v))}
          />

          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />

          <div className="card-3d-page__control-group">
            <span className="card-3d-page__control-label">Perspective</span>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={perspective}
              onChange={e => setPerspective(Number(e.target.value))}
              style={{ inlineSize: '100%', accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{perspective}px</span>
          </div>

          <div className="card-3d-page__control-group">
            <span className="card-3d-page__control-label">Toggles</span>
            <Toggle label="Glare overlay" checked={glare} onChange={setGlare} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Card3dPage() {
  useStyles('card-3d-page', pageStyles)

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.card-3d-page__section')
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
    <div className="card-3d-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="card-3d-page__hero">
        <h1 className="card-3d-page__title">Card3D</h1>
        <p className="card-3d-page__desc">
          A perspective-aware card that tilts in 3D space following cursor movement.
          Features configurable perspective depth, tilt intensity, and an optional directional glare overlay.
        </p>
        <div className="card-3d-page__import-row">
          <code className="card-3d-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Perspective Depth ────────────────────────── */}
      <section className="card-3d-page__section" id="perspective">
        <h2 className="card-3d-page__section-title">
          <a href="#perspective">Perspective Depth</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Lower perspective values create more dramatic 3D rotation while higher values create a subtler effect.
          The default of 1000px provides a balanced 3D feel.
        </p>
        <div className="card-3d-page__preview" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
            {PERSPECTIVE_PRESETS.slice(0, 4).map(p => (
              <div key={p.value} className="card-3d-page__labeled-item">
                <Card3D perspective={p.value} maxTilt={15}>
                  <div className="card-3d-page__demo-content" style={{ padding: '1rem', minInlineSize: '140px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.875rem' }}>{p.value}px</h3>
                    <p style={{ fontSize: '0.75rem' }}>Hover me</p>
                  </div>
                </Card3D>
                <span className="card-3d-page__item-label">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Tilt Intensity ──────────────────────────── */}
      <section className="card-3d-page__section" id="tilt">
        <h2 className="card-3d-page__section-title">
          <a href="#tilt">Tilt Intensity</a>
        </h2>
        <p className="card-3d-page__section-desc">
          The <code>maxTilt</code> prop controls the maximum rotation angle in degrees.
          Values from 5 (subtle) to 30 (dramatic) cover most use cases.
        </p>
        <div className="card-3d-page__preview" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            {TILT_PRESETS.map(t => (
              <div key={t.value} className="card-3d-page__labeled-item">
                <Card3D maxTilt={t.value}>
                  <div className="card-3d-page__demo-content" style={{ padding: '1rem', minInlineSize: '120px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.875rem' }}>{t.value} deg</h3>
                    <p style={{ fontSize: '0.75rem' }}>Hover me</p>
                  </div>
                </Card3D>
                <span className="card-3d-page__item-label">maxTilt={t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Glare Effect ────────────────────────────── */}
      <section className="card-3d-page__section" id="glare">
        <h2 className="card-3d-page__section-title">
          <a href="#glare">Glare Effect</a>
        </h2>
        <p className="card-3d-page__section-desc">
          The glare overlay simulates light reflection on the card surface. The angle and opacity
          dynamically follow the cursor position. Disable with <code>glare={'{false}'}</code>.
        </p>
        <div className="card-3d-page__preview" style={{ gap: '2rem' }}>
          <div className="card-3d-page__labeled-item">
            <Card3D glare maxTilt={15}>
              <div className="card-3d-page__demo-content" style={{ padding: '1.5rem', minInlineSize: '200px' }}>
                <h3>With Glare</h3>
                <p style={{ fontSize: '0.8125rem' }}>Directional light reflection follows cursor position.</p>
              </div>
            </Card3D>
            <span className="card-3d-page__item-label">glare={'{true}'}</span>
          </div>
          <div className="card-3d-page__labeled-item">
            <Card3D glare={false} maxTilt={15}>
              <div className="card-3d-page__demo-content" style={{ padding: '1.5rem', minInlineSize: '200px' }}>
                <h3>Without Glare</h3>
                <p style={{ fontSize: '0.8125rem' }}>Pure 3D tilt without the glare overlay element.</p>
              </div>
            </Card3D>
            <span className="card-3d-page__item-label">glare={'{false}'}</span>
          </div>
        </div>
      </section>

      {/* ── 6. Motion Levels ────────────────────────────── */}
      <section className="card-3d-page__section" id="motion">
        <h2 className="card-3d-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Motion level 0 disables tilt and glare completely. The component respects both the motion prop
          and the OS-level <code>prefers-reduced-motion</code> media query.
        </p>
        <div className="card-3d-page__preview" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center' }}>
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="card-3d-page__labeled-item">
                <Card3D motion={m} maxTilt={15}>
                  <div className="card-3d-page__demo-content" style={{ padding: '1rem', minInlineSize: '130px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.875rem' }}>Motion {m}</h3>
                    <p style={{ fontSize: '0.75rem' }}>{m === 0 ? 'Static' : `Level ${m}`}</p>
                  </div>
                </Card3D>
                <span className="card-3d-page__item-label">motion={m}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Content Examples ─────────────────────────── */}
      <section className="card-3d-page__section" id="examples">
        <h2 className="card-3d-page__section-title">
          <a href="#examples">Content Examples</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Card3D preserves 3D transforms on child elements. Use <code>transform-style: preserve-3d</code>
          on nested elements to create layered depth effects.
        </p>
        <div className="card-3d-page__preview card-3d-page__preview--col" style={{ gap: '1.5rem', alignItems: 'center' }}>
          <Card3D maxTilt={12}>
            <div className="card-3d-page__demo-content" style={{ padding: '1.5rem', minInlineSize: '300px' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  inlineSize: '56px',
                  blockSize: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, oklch(65% 0.2 270 / 0.2), oklch(55% 0.18 300 / 0.15))',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name="zap" size="md" />
                </div>
                <div>
                  <h3>Feature Card</h3>
                  <p style={{ fontSize: '0.8125rem' }}>Combine with icons and rich content layouts for product feature showcases.</p>
                </div>
              </div>
            </div>
          </Card3D>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Card3D maxTilt={8} perspective={800}>
              <div className="card-3d-page__demo-content" style={{ padding: '1.25rem', textAlign: 'center', minInlineSize: '160px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand)' }}>42</div>
                <p style={{ fontSize: '0.75rem', marginBlockStart: '0.25rem' }}>Active Projects</p>
              </div>
            </Card3D>
            <Card3D maxTilt={8} perspective={800}>
              <div className="card-3d-page__demo-content" style={{ padding: '1.25rem', textAlign: 'center', minInlineSize: '160px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand)' }}>98%</div>
                <p style={{ fontSize: '0.75rem', marginBlockStart: '0.25rem' }}>Success Rate</p>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="card-3d-page__section" id="tiers">
        <h2 className="card-3d-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides CSS-only hover transform.
          Standard adds full cursor-tracking tilt. Premium adds spring physics, parallax layers, and depth-of-field blur.
        </p>

        <div className="card-3d-page__tiers">
          {/* Lite */}
          <div
            className={`card-3d-page__tier-card${tier === 'lite' ? ' card-3d-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="card-3d-page__tier-header">
              <span className="card-3d-page__tier-name">Lite</span>
              <span className="card-3d-page__tier-size">~0.3 KB</span>
            </div>
            <p className="card-3d-page__tier-desc">
              CSS-only perspective card with static hover transform via <code>:hover</code>.
              No JavaScript cursor tracking. Fixed tilt angle on hover.
            </p>
            <div className="card-3d-page__tier-import">
              import {'{'} Card3D {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="card-3d-page__tier-preview">
              <Card3D motion={0}>
                <div className="card-3d-page__demo-content" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.75rem' }}>Lite</h3>
                  <p style={{ fontSize: '0.625rem' }}>CSS hover only</p>
                </div>
              </Card3D>
            </div>
            <div className="card-3d-page__size-breakdown">
              <div className="card-3d-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`card-3d-page__tier-card${tier === 'standard' ? ' card-3d-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="card-3d-page__tier-header">
              <span className="card-3d-page__tier-name">Standard</span>
              <span className="card-3d-page__tier-size">~1.5 KB</span>
            </div>
            <p className="card-3d-page__tier-desc">
              Full cursor-tracking 3D tilt with configurable perspective and maxTilt.
              Dynamic glare overlay with angle and opacity following the cursor.
            </p>
            <div className="card-3d-page__tier-import">
              import {'{'} Card3D {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="card-3d-page__tier-preview">
              <Card3D maxTilt={12}>
                <div className="card-3d-page__demo-content" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.75rem' }}>Standard</h3>
                  <p style={{ fontSize: '0.625rem' }}>Cursor tilt</p>
                </div>
              </Card3D>
            </div>
            <div className="card-3d-page__size-breakdown">
              <div className="card-3d-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`card-3d-page__tier-card${tier === 'premium' ? ' card-3d-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="card-3d-page__tier-header">
              <span className="card-3d-page__tier-name">Premium</span>
              <span className="card-3d-page__tier-size">~2.8 KB</span>
            </div>
            <p className="card-3d-page__tier-desc">
              Everything in Standard plus spring physics for natural tilt easing,
              parallax content layers, depth-of-field blur on edges, and gyroscope support on mobile.
            </p>
            <div className="card-3d-page__tier-import">
              import {'{'} Card3D {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="card-3d-page__tier-preview">
              <Card3D maxTilt={15} perspective={800}>
                <div className="card-3d-page__demo-content" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.75rem' }}>Premium</h3>
                  <p style={{ fontSize: '0.625rem' }}>Spring + parallax</p>
                </div>
              </Card3D>
            </div>
            <div className="card-3d-page__size-breakdown">
              <div className="card-3d-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="card-3d-page__section" id="brand-color">
        <h2 className="card-3d-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Pick a brand color to see the card surface and glare update in real-time. The theme generates
          derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="card-3d-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`card-3d-page__color-preset${brandColor === p.hex ? ' card-3d-page__color-preset--active' : ''}`}
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
      <section className="card-3d-page__section" id="props">
        <h2 className="card-3d-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="card-3d-page__section-desc">
          All props accepted by Card3D. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={card3DProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ─────────────────────────── */}
      <section className="card-3d-page__section" id="accessibility">
        <h2 className="card-3d-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="card-3d-page__section-desc">
          Card3D is a presentational container with comprehensive motion safety and high-contrast support.
        </p>
        <Card variant="default" padding="md">
          <ul className="card-3d-page__a11y-list">
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> 3D tilt is forced to <code className="card-3d-page__a11y-key">transform: none</code> when <code className="card-3d-page__a11y-key">prefers-reduced-motion: reduce</code> is active.
              </span>
            </li>
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion levels:</strong> Setting <code className="card-3d-page__a11y-key">motion={'{0}'}</code> disables tilt, transitions, and the glare overlay.
              </span>
            </li>
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Glare hidden:</strong> The glare overlay has <code className="card-3d-page__a11y-key">aria-hidden="true"</code> to exclude it from the accessibility tree.
              </span>
            </li>
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="card-3d-page__a11y-key">forced-colors: active</code> with visible 2px borders and no transforms.
              </span>
            </li>
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> All 3D transforms and glare are disabled in print stylesheets.
              </span>
            </li>
            <li className="card-3d-page__a11y-item">
              <span className="card-3d-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Uses plain <code className="card-3d-page__a11y-key">{'<div>'}</code> elements. Add <code className="card-3d-page__a11y-key">role</code> and <code className="card-3d-page__a11y-key">tabIndex</code> for interactive cards.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
