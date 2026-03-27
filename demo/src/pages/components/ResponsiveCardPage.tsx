'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ResponsiveCard } from '@ui/domain/responsive-card'
import { ResponsiveCard as LiteResponsiveCard } from '@ui/lite/responsive-card'
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
    @scope (.responsive-card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: responsive-card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .responsive-card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .responsive-card-page__hero::before {
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
        animation: rc-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes rc-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .responsive-card-page__hero::before { animation: none; }
      }

      .responsive-card-page__title {
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

      .responsive-card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .responsive-card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .responsive-card-page__import-code {
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

      .responsive-card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .responsive-card-page__section {
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
        animation: rc-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes rc-section-reveal {
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
        .responsive-card-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .responsive-card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .responsive-card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .responsive-card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .responsive-card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .responsive-card-page__preview {
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
      .responsive-card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .responsive-card-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .responsive-card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .responsive-card-page__playground {
          grid-template-columns: 1fr;
        }
        .responsive-card-page__playground-controls {
          position: static !important;
        }
      }

      @container responsive-card-page (max-width: 680px) {
        .responsive-card-page__playground {
          grid-template-columns: 1fr;
        }
        .responsive-card-page__playground-controls {
          position: static !important;
        }
      }

      .responsive-card-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .responsive-card-page__playground-result {
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

      /* Dot grid for playground result */
      .responsive-card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .responsive-card-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .responsive-card-page__playground-controls {
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

      .responsive-card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .responsive-card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .responsive-card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .responsive-card-page__option-btn {
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
      .responsive-card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .responsive-card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .responsive-card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .responsive-card-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .responsive-card-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .responsive-card-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .responsive-card-page__tier-card {
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

      .responsive-card-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .responsive-card-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .responsive-card-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .responsive-card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .responsive-card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .responsive-card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .responsive-card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .responsive-card-page__tier-import {
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

      .responsive-card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .responsive-card-page__code-tabs {
        margin-block-start: 1rem;
      }

      .responsive-card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .responsive-card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .responsive-card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .responsive-card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .responsive-card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .responsive-card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Color picker ──────────────────────────────── */

      .responsive-card-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .responsive-card-page__color-preset {
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
      .responsive-card-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .responsive-card-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .responsive-card-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .responsive-card-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .responsive-card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .responsive-card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 200px;
      }

      .responsive-card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Resize container ────────────────────────────── */

      .responsive-card-page__resize-container {
        resize: horizontal;
        overflow: auto;
        min-inline-size: 200px;
        max-inline-size: 100%;
        border: 2px dashed var(--border-default);
        border-radius: var(--radius-md);
        padding: 1rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .responsive-card-page__hero {
          padding: 2rem 1.25rem;
        }

        .responsive-card-page__title {
          font-size: 1.75rem;
        }

        .responsive-card-page__preview {
          padding: 1.75rem;
        }

        .responsive-card-page__playground {
          grid-template-columns: 1fr;
        }

        .responsive-card-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .responsive-card-page__tiers {
          grid-template-columns: 1fr;
        }

        .responsive-card-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .responsive-card-page__hero {
          padding: 1.5rem 1rem;
        }

        .responsive-card-page__title {
          font-size: 1.5rem;
        }

        .responsive-card-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .responsive-card-page__import-code,
      .responsive-card-page code,
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

const responsiveCardProps: PropDef[] = [
  { name: 'title', type: 'ReactNode', description: 'Card title displayed as an h3 heading. Required.' },
  { name: 'description', type: 'ReactNode', description: 'Optional description text displayed below the title.' },
  { name: 'image', type: 'ReactNode', description: 'Optional image or media element displayed in the card image slot.' },
  { name: 'actions', type: 'ReactNode', description: 'Optional actions area rendered at the bottom of the card (buttons, links).' },
  { name: 'badge', type: 'ReactNode', description: 'Optional badge element positioned absolutely at the top-right corner.' },
  { name: 'variant', type: "'default' | 'horizontal' | 'compact'", default: "'default'", description: 'Layout variant. Default auto-switches based on container width. Horizontal forces side-by-side. Compact reduces padding.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. Controls hover lift effect. 0 disables all transitions.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'horizontal' | 'compact'
type MotionLevel = 0 | 1 | 2 | 3

const VARIANTS: Variant[] = ['default', 'horizontal', 'compact']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ResponsiveCard } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ResponsiveCard } from '@annondeveloper/ui-kit'",
  premium: "import { ResponsiveCard } from '@annondeveloper/ui-kit/premium'",
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

const PLACEHOLDER_IMAGE = (
  <div style={{
    background: 'linear-gradient(135deg, oklch(50% 0.15 270) 0%, oklch(40% 0.12 300) 100%)',
    aspectRatio: '16/9',
    display: 'grid',
    placeItems: 'center',
    color: 'oklch(85% 0 0)',
    fontSize: '0.75rem',
    fontWeight: 600,
  }}>
    <Icon name="image" size="lg" />
  </div>
)

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="responsive-card-page__copy-btn"
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
    <div className="responsive-card-page__control-group">
      <span className="responsive-card-page__control-label">{label}</span>
      <div className="responsive-card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`responsive-card-page__option-btn${opt === value ? ' responsive-card-page__option-btn--active' : ''}`}
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
    <label className="responsive-card-page__toggle-label">
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

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  motion: MotionLevel,
  titleText: string,
  showImage: boolean,
  showActions: boolean,
  showBadge: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const props: string[] = [`  title="${titleText}"`]
    if (showImage) props.push('  image={<img src="/placeholder.jpg" alt="Cover" />}')
    if (showActions) props.push('  actions={<button>View</button>}')
    if (showBadge) props.push('  badge={<span>New</span>}')
    return `${importStr}\n\n<ResponsiveCard\n${props.join('\n')}\n  description="A brief description of this card's content."\n/>`
  }

  const props: string[] = [`  title="${titleText}"`]
  props.push('  description="A brief description of this card\'s content."')
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  if (showImage) props.push('  image={<img src="/placeholder.jpg" alt="Cover" />}')
  if (showActions) props.push('  actions={<Button size="sm">View Details</Button>}')
  if (showBadge) props.push('  badge={<Badge variant="primary">New</Badge>}')

  return `${importStr}\n\n<ResponsiveCard\n${props.join('\n')}\n/>`
}

function generateHtmlCssCode(tier: Tier, variant: Variant, titleText: string): string {
  return `<!-- ResponsiveCard — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/responsive-card.css">

<article class="ui-responsive-card" data-variant="${variant}">
  <div class="ui-responsive-card__image">
    <img src="/placeholder.jpg" alt="Cover" />
  </div>
  <div class="ui-responsive-card__content">
    <h3 class="ui-responsive-card__title">${titleText}</h3>
    <p class="ui-responsive-card__description">
      A brief description of this card's content.
    </p>
  </div>
  <div class="ui-responsive-card__actions">
    <button>View Details</button>
  </div>
</article>

<style>
.ui-responsive-card {
  position: relative;
  display: flex;
  flex-direction: column;
  container-type: inline-size;
  border-radius: 0.75rem;
  background: oklch(22% 0.02 270);
  border: 1px solid oklch(100% 0 0 / 0.08);
  overflow: hidden;
}
</style>`
}

function generateVueCode(tier: Tier, variant: Variant, motion: MotionLevel, titleText: string): string {
  if (tier === 'lite') {
    return `<template>
  <article class="ui-lite-responsive-card">
    <div class="ui-lite-responsive-card__image">
      <img src="/placeholder.jpg" alt="Cover" />
    </div>
    <div class="ui-lite-responsive-card__body">
      <h3>${titleText}</h3>
      <p>A brief description of this card's content.</p>
    </div>
  </article>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  title="${titleText}"`]
  attrs.push('  description="A brief description of this card\'s content."')
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (motion !== 3) attrs.push(`:motion="${motion}"`)

  return `<template>
  <ResponsiveCard
  ${attrs.join('\n  ')}
  >
    <template #image><img src="/placeholder.jpg" alt="Cover" /></template>
  </ResponsiveCard>
</template>

<script setup>
import { ResponsiveCard } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, titleText: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<article class="ui-lite-responsive-card">
  <div class="ui-lite-responsive-card__image">
    <img src="/placeholder.jpg" alt="Cover" />
  </div>
  <div class="ui-lite-responsive-card__body">
    <h3>${titleText}</h3>
    <p>A brief description of this card's content.</p>
  </div>
</article>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<article
  class="ui-responsive-card"
  data-variant="${variant}"
>
  <div class="ui-responsive-card__image">
    <img src="/placeholder.jpg" alt="Cover" />
  </div>
  <div class="ui-responsive-card__content">
    <h3 class="ui-responsive-card__title">${titleText}</h3>
    <p class="ui-responsive-card__description">
      A brief description of this card's content.
    </p>
  </div>
</article>

/* Import component CSS */
@import '${importPath}/css/components/responsive-card.css';`
}

function generateSvelteCode(tier: Tier, variant: Variant, motion: MotionLevel, titleText: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<article class="ui-lite-responsive-card">
  <div class="ui-lite-responsive-card__image">
    <img src="/placeholder.jpg" alt="Cover" />
  </div>
  <div class="ui-lite-responsive-card__body">
    <h3>${titleText}</h3>
    <p>A brief description of this card's content.</p>
  </div>
</article>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`title="${titleText}"`]
  attrs.push('description="A brief description of this card\'s content."')
  if (variant !== 'default') attrs.push(`variant="${variant}"`)
  if (motion !== 3) attrs.push(`motion={${motion}}`)

  return `<script>
  import { ResponsiveCard } from '${importPath}';
</script>

<ResponsiveCard
  ${attrs.join('\n  ')}
>
  <img slot="image" src="/placeholder.jpg" alt="Cover" />
</ResponsiveCard>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('default')
  const [motion, setMotion] = useState<MotionLevel>(3)
  const [titleText, setTitleText] = useState('Responsive Card')
  const [showImage, setShowImage] = useState(true)
  const [showActions, setShowActions] = useState(true)
  const [showBadge, setShowBadge] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const CardComponent = tier === 'lite' ? LiteResponsiveCard : ResponsiveCard

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, motion, titleText, showImage, showActions, showBadge),
    [tier, variant, motion, titleText, showImage, showActions, showBadge],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, variant, titleText),
    [tier, variant, titleText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, motion, titleText),
    [tier, variant, motion, titleText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, titleText),
    [tier, variant, titleText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, motion, titleText),
    [tier, variant, motion, titleText],
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

  const cardProps: Record<string, unknown> = {
    title: titleText,
    description: 'A brief description of this card\'s content that wraps to multiple lines when the container is narrow.',
  }

  if (tier !== 'lite') {
    cardProps.variant = variant
    cardProps.motion = motion
  }
  if (showImage) cardProps.image = PLACEHOLDER_IMAGE
  if (showActions) {
    cardProps.actions = (
      <Button size="sm" variant="secondary">View Details</Button>
    )
  }
  if (showBadge) {
    cardProps.badge = (
      <span style={{
        background: 'var(--brand)',
        color: 'oklch(100% 0 0)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
      }}>
        New
      </span>
    )
  }

  return (
    <section className="responsive-card-page__section" id="playground">
      <h2 className="responsive-card-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="responsive-card-page__section-desc">
        Tweak every prop and see the card adapt in real-time. The card uses container queries
        to automatically switch between vertical and horizontal layouts.
      </p>

      <div className="responsive-card-page__playground">
        <div className="responsive-card-page__playground-preview">
          <div className="responsive-card-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '400px', position: 'relative', zIndex: 1 }}>
              <CardComponent {...cardProps as any} />
            </div>
          </div>

          <div className="responsive-card-page__code-tabs">
            <div className="responsive-card-page__export-row">
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
              {copyStatus && <span className="responsive-card-page__export-status">{copyStatus}</span>}
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

        <div className="responsive-card-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as MotionLevel)}
            />
          )}

          <div className="responsive-card-page__control-group">
            <span className="responsive-card-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show image" checked={showImage} onChange={setShowImage} />
              <Toggle label="Show actions" checked={showActions} onChange={setShowActions} />
              <Toggle label="Show badge" checked={showBadge} onChange={setShowBadge} />
            </div>
          </div>

          <div className="responsive-card-page__control-group">
            <span className="responsive-card-page__control-label">Title</span>
            <input
              type="text"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              className="responsive-card-page__text-input"
              placeholder="Card title..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResponsiveCardPage() {
  useStyles('responsive-card-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

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
    const sections = document.querySelectorAll('.responsive-card-page__section')
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

  const CardComponent = tier === 'lite' ? LiteResponsiveCard : ResponsiveCard

  return (
    <div className="responsive-card-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="responsive-card-page__hero">
        <h1 className="responsive-card-page__title">ResponsiveCard</h1>
        <p className="responsive-card-page__desc">
          A container-query-powered card that automatically adapts its layout based on
          available space. Switches between vertical and horizontal layouts at breakpoints,
          with Aurora glow, hover lift, and three layout variants.
        </p>
        <div className="responsive-card-page__import-row">
          <code className="responsive-card-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Variants ───────────────────────────────── */}
      <section className="responsive-card-page__section" id="variants">
        <h2 className="responsive-card-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          Three layout variants for different use cases. The default variant uses container
          queries to auto-switch. Horizontal forces a side-by-side layout. Compact reduces padding.
        </p>
        <div className="responsive-card-page__preview responsive-card-page__preview--col" style={{ gap: '1.5rem' }}>
          <div className="responsive-card-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="responsive-card-page__labeled-item">
                <ResponsiveCard
                  title={`${v.charAt(0).toUpperCase() + v.slice(1)} Card`}
                  description="Adapts layout based on container width using CSS container queries."
                  variant={v}
                  image={PLACEHOLDER_IMAGE}
                  actions={<Button size="sm" variant="secondary">Action</Button>}
                />
                <span className="responsive-card-page__item-label">variant="{v}"</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Container Query Demo ───────────────────── */}
      <section className="responsive-card-page__section" id="container-queries">
        <h2 className="responsive-card-page__section-title">
          <a href="#container-queries">Container Queries</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          Drag the resize handle to see the card adapt its layout in real-time. The default
          variant uses <code>@container</code> queries at 280px and 480px breakpoints.
        </p>
        <div className="responsive-card-page__resize-container" style={{ inlineSize: '500px' }}>
          <ResponsiveCard
            title="Resize Me"
            description="Drag the bottom-right corner of this container to see the card adapt its layout automatically."
            image={PLACEHOLDER_IMAGE}
            actions={<Button size="sm" variant="secondary">View</Button>}
            badge={
              <span style={{
                background: 'oklch(72% 0.19 155)',
                color: 'oklch(100% 0 0)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
              }}>
                Live
              </span>
            }
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.5rem' }}>
          Drag the bottom-right corner to resize. Card switches between column and row layout at 480px.
        </p>
      </section>

      {/* ── 5. Motion Levels ──────────────────────────── */}
      <section className="responsive-card-page__section" id="motion-levels">
        <h2 className="responsive-card-page__section-title">
          <a href="#motion-levels">Motion Levels</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          The hover lift effect adapts to motion intensity. Level 0 disables all transitions.
          Levels 1-3 progressively enhance the hover response.
        </p>
        <div className="responsive-card-page__preview" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          {([0, 1, 2, 3] as const).map(level => (
            <div key={level} style={{ inlineSize: '200px' }}>
              <ResponsiveCard
                title={`Motion ${level}`}
                description="Hover to see the lift effect at this motion level."
                motion={level}
              />
              <span className="responsive-card-page__item-label" style={{ display: 'block', textAlign: 'center', marginBlockStart: '0.5rem' }}>
                motion={level}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Usage Examples ──────────────────────────── */}
      <section className="responsive-card-page__section" id="examples">
        <h2 className="responsive-card-page__section-title">
          <a href="#examples">Usage Examples</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          ResponsiveCard is versatile for product cards, blog posts, team members,
          and any content that needs adaptive layouts.
        </p>
        <div className="responsive-card-page__preview responsive-card-page__preview--col" style={{ gap: '1.5rem' }}>
          {/* Product card */}
          <div style={{ maxInlineSize: '350px' }}>
            <ResponsiveCard
              title="Aurora Pro Keyboard"
              description="Mechanical keyboard with per-key RGB, hot-swappable switches, and wireless connectivity."
              image={
                <div style={{
                  background: 'linear-gradient(135deg, oklch(35% 0.08 270) 0%, oklch(25% 0.06 300) 100%)',
                  aspectRatio: '16/9',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'oklch(85% 0 0)',
                }}>
                  <Icon name="settings" size="lg" />
                </div>
              }
              badge={
                <span style={{
                  background: 'oklch(62% 0.22 25)',
                  color: 'oklch(100% 0 0)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                }}>
                  Sale
                </span>
              }
              actions={
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button size="sm" variant="primary">Add to Cart</Button>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>$199</span>
                </div>
              }
            />
          </div>

          {/* Team member card */}
          <div style={{ maxInlineSize: '350px' }}>
            <ResponsiveCard
              variant="horizontal"
              title="Sarah Chen"
              description="Lead Engineer at Aurora Labs. Specializes in distributed systems and real-time data processing."
              image={
                <div style={{
                  background: 'linear-gradient(135deg, oklch(50% 0.15 200) 0%, oklch(40% 0.12 240) 100%)',
                  aspectRatio: '1',
                  inlineSize: '120px',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'oklch(90% 0 0)',
                }}>
                  <Icon name="user" size="lg" />
                </div>
              }
            />
          </div>

          {/* Blog post card */}
          <div style={{ maxInlineSize: '350px' }}>
            <ResponsiveCard
              variant="compact"
              title="Getting Started with Container Queries"
              description="Learn how to use CSS container queries to build truly responsive components."
              actions={
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>3 min read</span>
              }
            />
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="responsive-card-page__section" id="tiers">
        <h2 className="responsive-card-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          Choose the right balance of features and bundle size. The Standard tier includes
          container queries, Aurora glow, and motion levels. Lite provides a CSS-only card.
        </p>

        <div className="responsive-card-page__tiers">
          {/* Lite */}
          <div
            className={`responsive-card-page__tier-card${tier === 'lite' ? ' responsive-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="responsive-card-page__tier-header">
              <span className="responsive-card-page__tier-name">Lite</span>
              <span className="responsive-card-page__tier-size">~0.4 KB</span>
            </div>
            <p className="responsive-card-page__tier-desc">
              CSS-only card structure. No container queries, no Aurora glow, no hover lift.
              Minimal HTML structure with forwardRef wrapper.
            </p>
            <div className="responsive-card-page__tier-import">
              import {'{'} ResponsiveCard {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="responsive-card-page__tier-preview">
              <LiteResponsiveCard
                title="Lite Card"
                description="Simple structure"
              />
            </div>
            <div className="responsive-card-page__size-breakdown">
              <div className="responsive-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`responsive-card-page__tier-card${tier === 'standard' ? ' responsive-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="responsive-card-page__tier-header">
              <span className="responsive-card-page__tier-name">Standard</span>
              <span className="responsive-card-page__tier-size">~2.5 KB</span>
            </div>
            <p className="responsive-card-page__tier-desc">
              Full container-query responsive card with Aurora glow, hover lift,
              three variants, motion levels, and badge positioning.
            </p>
            <div className="responsive-card-page__tier-import">
              import {'{'} ResponsiveCard {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="responsive-card-page__tier-preview">
              <ResponsiveCard
                title="Standard Card"
                description="Full features"
              />
            </div>
            <div className="responsive-card-page__size-breakdown">
              <div className="responsive-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`responsive-card-page__tier-card${tier === 'premium' ? ' responsive-card-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="responsive-card-page__tier-header">
              <span className="responsive-card-page__tier-name">Premium</span>
              <span className="responsive-card-page__tier-size">~4.0 KB</span>
            </div>
            <p className="responsive-card-page__tier-desc">
              Everything in Standard plus parallax image scroll, cursor-tracking glow,
              3D tilt on hover, and spring-based entrance animation.
            </p>
            <div className="responsive-card-page__tier-import">
              import {'{'} ResponsiveCard {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="responsive-card-page__tier-preview">
              <ResponsiveCard
                title="Premium Card"
                description="Enhanced effects"
              />
            </div>
            <div className="responsive-card-page__size-breakdown">
              <div className="responsive-card-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>7.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────────── */}
      <section className="responsive-card-page__section" id="brand-color">
        <h2 className="responsive-card-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          Pick a brand color to see the Aurora glow and focus ring
          update in real-time across all cards.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="responsive-card-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`responsive-card-page__color-preset${brandColor === p.hex ? ' responsive-card-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="responsive-card-page__section" id="props">
        <h2 className="responsive-card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          All props accepted by ResponsiveCard. It also spreads any native div HTML attributes
          onto the underlying {'<article>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={responsiveCardProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ─────────────────────────── */}
      <section className="responsive-card-page__section" id="accessibility">
        <h2 className="responsive-card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="responsive-card-page__section-desc">
          ResponsiveCard is built on semantic HTML with comprehensive accessibility support.
        </p>
        <Card variant="default" padding="md">
          <ul className="responsive-card-page__a11y-list">
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses <code className="responsive-card-page__a11y-key">{'<article>'}</code> element for proper content sectioning and screen reader navigation.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Heading hierarchy:</strong> Title renders as <code className="responsive-card-page__a11y-key">{'<h3>'}</code> for proper document outline.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus visible:</strong> Brand-colored focus ring with <code className="responsive-card-page__a11y-key">:focus-visible</code> and 2px outline offset.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="responsive-card-page__a11y-key">forced-colors: active</code> with solid ButtonText borders and disabled Aurora glow.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print friendly:</strong> Removes box-shadow and Aurora glow in print, adds solid border and <code className="responsive-card-page__a11y-key">break-inside: avoid</code>.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced data:</strong> Respects <code className="responsive-card-page__a11y-key">prefers-reduced-data</code> by hiding box-shadow and Aurora glow.
              </span>
            </li>
            <li className="responsive-card-page__a11y-item">
              <span className="responsive-card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Container responsive:</strong> Adapts to container size, not viewport — works correctly inside modals, sidebars, and split views.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
