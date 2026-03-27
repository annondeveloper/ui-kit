'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { OrbitingCircles } from '@ui/domain/orbiting-circles'
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
    @scope (.orbiting-circles-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: orbiting-circles-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .orbiting-circles-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .orbiting-circles-page__hero::before {
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
        animation: orbit-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes orbit-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .orbiting-circles-page__hero::before { animation: none; }
      }

      .orbiting-circles-page__title {
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

      .orbiting-circles-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .orbiting-circles-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .orbiting-circles-page__import-code {
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

      .orbiting-circles-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .orbiting-circles-page__section {
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
        animation: orbit-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes orbit-section-reveal {
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
        .orbiting-circles-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .orbiting-circles-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .orbiting-circles-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .orbiting-circles-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .orbiting-circles-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .orbiting-circles-page__preview {
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
        min-block-size: 200px;
      }

      .orbiting-circles-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .orbiting-circles-page__preview--tall {
        min-block-size: 360px;
      }

      /* ── Orbit icon items ────────────────────────────── */

      .orbiting-circles-page__orbit-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: 50%;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        box-shadow: 0 2px 6px oklch(0% 0 0 / 0.2);
        font-size: 0.875rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .orbiting-circles-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .orbiting-circles-page__playground {
          grid-template-columns: 1fr;
        }
        .orbiting-circles-page__playground-controls {
          position: static !important;
        }
      }

      @container orbiting-circles-page (max-width: 680px) {
        .orbiting-circles-page__playground {
          grid-template-columns: 1fr;
        }
        .orbiting-circles-page__playground-controls {
          position: static !important;
        }
      }

      .orbiting-circles-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .orbiting-circles-page__playground-result {
        overflow-x: auto;
        min-block-size: 360px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .orbiting-circles-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .orbiting-circles-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .orbiting-circles-page__playground-controls {
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

      .orbiting-circles-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .orbiting-circles-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .orbiting-circles-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .orbiting-circles-page__option-btn {
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
      .orbiting-circles-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .orbiting-circles-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .orbiting-circles-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .orbiting-circles-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .orbiting-circles-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2.5rem;
        align-items: center;
        justify-content: center;
      }

      .orbiting-circles-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .orbiting-circles-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .orbiting-circles-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .orbiting-circles-page__tier-card {
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

      .orbiting-circles-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .orbiting-circles-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .orbiting-circles-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .orbiting-circles-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .orbiting-circles-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .orbiting-circles-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .orbiting-circles-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .orbiting-circles-page__tier-import {
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

      .orbiting-circles-page__tier-preview {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-block-start: 0.5rem;
        min-block-size: 100px;
      }

      /* ── Color picker ──────────────────────────────── */

      .orbiting-circles-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .orbiting-circles-page__color-preset {
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
      .orbiting-circles-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .orbiting-circles-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .orbiting-circles-page__code-tabs {
        margin-block-start: 1rem;
      }

      .orbiting-circles-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .orbiting-circles-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .orbiting-circles-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .orbiting-circles-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .orbiting-circles-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .orbiting-circles-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .orbiting-circles-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .orbiting-circles-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .orbiting-circles-page__hero {
          padding: 2rem 1.25rem;
        }
        .orbiting-circles-page__title {
          font-size: 1.75rem;
        }
        .orbiting-circles-page__preview {
          padding: 1.75rem;
        }
        .orbiting-circles-page__playground {
          grid-template-columns: 1fr;
        }
        .orbiting-circles-page__playground-result {
          padding: 2rem;
          min-block-size: 280px;
        }
        .orbiting-circles-page__tiers {
          grid-template-columns: 1fr;
        }
        .orbiting-circles-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .orbiting-circles-page__hero {
          padding: 1.5rem 1rem;
        }
        .orbiting-circles-page__title {
          font-size: 1.5rem;
        }
        .orbiting-circles-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .orbiting-circles-page__title {
          font-size: 4rem;
        }
        .orbiting-circles-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .orbiting-circles-page__import-code,
      .orbiting-circles-page code,
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

const orbitingCirclesProps: PropDef[] = [
  { name: 'radius', type: 'number', default: '100', description: 'Orbit radius in pixels. Controls the distance of items from center.' },
  { name: 'duration', type: 'number', default: '15', description: 'Full orbit duration in seconds.' },
  { name: 'reverse', type: 'boolean', default: 'false', description: 'Reverses the orbit direction (counter-clockwise).' },
  { name: 'children', type: 'ReactNode[]', description: 'Array of elements to distribute evenly around the orbit. Each child becomes an orbiting item.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 places items statically on the circle.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles applied to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { OrbitingCircles } from '@annondeveloper/ui-kit/domain'",
  standard: "import { OrbitingCircles } from '@annondeveloper/ui-kit'",
  premium: "import { OrbitingCircles } from '@annondeveloper/ui-kit/premium'",
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

const ORBIT_ICONS = ['zap', 'star', 'heart', 'code', 'settings', 'globe'] as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="orbiting-circles-page__copy-btn"
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
    <div className="orbiting-circles-page__control-group">
      <span className="orbiting-circles-page__control-label">{label}</span>
      <div className="orbiting-circles-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`orbiting-circles-page__option-btn${opt === value ? ' orbiting-circles-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function OrbitIcon({ name }: { name: string }) {
  return (
    <span className="orbiting-circles-page__orbit-icon">
      <Icon name={name as any} size="sm" />
    </span>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  radius: number,
  duration: number,
  reverse: boolean,
  itemCount: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (radius !== 100) props.push(`  radius={${radius}}`)
  if (duration !== 15) props.push(`  duration={${duration}}`)
  if (reverse) props.push('  reverse')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const icons = ORBIT_ICONS.slice(0, itemCount)
  const children = icons.map(name => `  <Icon name="${name}" />`).join('\n')

  if (props.length === 0) {
    return `${importStr}\nimport { Icon } from '@annondeveloper/ui-kit'\n\n<OrbitingCircles>\n${children}\n</OrbitingCircles>`
  }

  return `${importStr}\nimport { Icon } from '@annondeveloper/ui-kit'\n\n<OrbitingCircles\n${props.join('\n')}\n>\n${children}\n</OrbitingCircles>`
}

function generateHtmlCode(radius: number, duration: number, itemCount: number): string {
  return `<!-- OrbitingCircles — @annondeveloper/ui-kit -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/orbiting-circles.css">

<div class="ui-orbiting-circles"
  style="--orbit-radius: ${radius}px; --orbit-duration: ${duration}s;"
  role="presentation"
>
  ${Array.from({ length: itemCount }, (_, i) =>
    `<div class="ui-orbiting-circles--item"
    style="--orbit-start-angle: ${(i * 360 / itemCount)}deg; --orbit-delay: ${-(i * duration / itemCount)}s;">
    <!-- Your icon or content -->
  </div>`
  ).join('\n  ')}
</div>`
}

function generateVueCode(tier: Tier, radius: number, duration: number, reverse: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (radius !== 100) props.push(`  :radius="${radius}"`)
  if (duration !== 15) props.push(`  :duration="${duration}"`)
  if (reverse) props.push('  reverse')

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<template>
  <OrbitingCircles${propsStr}>
    <Icon name="zap" />
    <Icon name="star" />
    <Icon name="heart" />
    <Icon name="code" />
  </OrbitingCircles>
</template>

<script setup>
import { OrbitingCircles } from '${importPath}'
import { Icon } from '${importPath}'
</script>`
}

function generateAngularCode(radius: number, duration: number, itemCount: number): string {
  return `<!-- Angular — Use CSS-only approach -->
<div class="ui-orbiting-circles"
  style="--orbit-radius: ${radius}px; --orbit-duration: ${duration}s;"
  role="presentation"
>
  <div *ngFor="let item of items; let i = index"
    class="ui-orbiting-circles--item"
    [style.--orbit-start-angle]="(i * 360 / ${itemCount}) + 'deg'"
    [style.--orbit-delay]="-(i * ${duration} / ${itemCount}) + 's'">
    <!-- Your icon component -->
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/orbiting-circles.css';`
}

function generateSvelteCode(tier: Tier, radius: number, duration: number, reverse: boolean): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (radius !== 100) props.push(`  radius={${radius}}`)
  if (duration !== 15) props.push(`  duration={${duration}}`)
  if (reverse) props.push('  reverse')

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>
  import { OrbitingCircles } from '${importPath}';
  import { Icon } from '${importPath}';
</script>

<OrbitingCircles${propsStr}>
  <Icon name="zap" />
  <Icon name="star" />
  <Icon name="heart" />
  <Icon name="code" />
</OrbitingCircles>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [radius, setRadius] = useState(100)
  const [duration, setDuration] = useState(15)
  const [reverse, setReverse] = useState(false)
  const [itemCount, setItemCount] = useState(4)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, radius, duration, reverse, itemCount, motion),
    [tier, radius, duration, reverse, itemCount, motion],
  )

  const htmlCode = useMemo(() => generateHtmlCode(radius, duration, itemCount), [radius, duration, itemCount])
  const vueCode = useMemo(() => generateVueCode(tier, radius, duration, reverse), [tier, radius, duration, reverse])
  const angularCode = useMemo(() => generateAngularCode(radius, duration, itemCount), [radius, duration, itemCount])
  const svelteCode = useMemo(() => generateSvelteCode(tier, radius, duration, reverse), [tier, radius, duration, reverse])

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

  const icons = ORBIT_ICONS.slice(0, itemCount)

  return (
    <section className="orbiting-circles-page__section" id="playground">
      <h2 className="orbiting-circles-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="orbiting-circles-page__section-desc">
        Adjust orbit radius, speed, direction and item count to see the orbiting animation in real-time.
      </p>

      <div className="orbiting-circles-page__playground">
        <div className="orbiting-circles-page__playground-preview">
          <div className="orbiting-circles-page__playground-result">
            <OrbitingCircles
              radius={radius}
              duration={duration}
              reverse={reverse}
              motion={motion}
            >
              {icons.map(name => (
                <OrbitIcon key={name} name={name} />
              ))}
            </OrbitingCircles>
          </div>

          <div className="orbiting-circles-page__code-tabs">
            <div className="orbiting-circles-page__export-row">
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
              {copyStatus && <span className="orbiting-circles-page__export-status">{copyStatus}</span>}
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

        <div className="orbiting-circles-page__playground-controls">
          <OptionGroup
            label="Radius"
            options={['60', '80', '100', '120', '150'] as const}
            value={String(radius)}
            onChange={v => setRadius(Number(v))}
          />
          <OptionGroup
            label="Duration (s)"
            options={['5', '10', '15', '20', '30'] as const}
            value={String(duration)}
            onChange={v => setDuration(Number(v))}
          />
          <OptionGroup
            label="Items"
            options={['2', '3', '4', '5', '6'] as const}
            value={String(itemCount)}
            onChange={v => setItemCount(Number(v))}
          />
          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <div className="orbiting-circles-page__control-group">
            <span className="orbiting-circles-page__control-label">Direction</span>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <input
                type="checkbox"
                checked={reverse}
                onChange={e => setReverse(e.target.checked)}
                style={{ accentColor: 'var(--brand)' }}
              />
              Reverse (counter-clockwise)
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrbitingCirclesPage() {
  useStyles('orbiting-circles-page', pageStyles)

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.orbiting-circles-page__section')
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
    <div className="orbiting-circles-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="orbiting-circles-page__hero">
        <h1 className="orbiting-circles-page__title">OrbitingCircles</h1>
        <p className="orbiting-circles-page__desc">
          Animated circular orbit that distributes child elements evenly around a center point.
          Each child counter-rotates to stay upright while following its orbital path. Ideal for
          showcasing integrations, tech stacks, or feature icons.
        </p>
        <div className="orbiting-circles-page__import-row">
          <code className="orbiting-circles-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Orbit Radius ────────────────────────────── */}
      <section className="orbiting-circles-page__section" id="radius">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#radius">Orbit Radius</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          The radius prop controls the orbital distance from center. Smaller radii create
          tight, compact orbits; larger radii create expansive, atmospheric patterns.
        </p>
        <div className="orbiting-circles-page__labeled-row">
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={50} duration={10}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">radius=50</span>
          </div>
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={80} duration={12}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">radius=80</span>
          </div>
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={120} duration={15}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">radius=120</span>
          </div>
        </div>
      </section>

      {/* ── 4. Direction ───────────────────────────────── */}
      <section className="orbiting-circles-page__section" id="direction">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#direction">Direction</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          Use the reverse prop to orbit counter-clockwise. Combine two orbits with opposite
          directions for a dynamic dual-ring effect.
        </p>
        <div className="orbiting-circles-page__preview orbiting-circles-page__preview--tall">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <OrbitingCircles radius={90} duration={15}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
              <OrbitIcon name="code" />
            </OrbitingCircles>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <OrbitingCircles radius={55} duration={12} reverse>
                <OrbitIcon name="settings" />
                <OrbitIcon name="globe" />
                <OrbitIcon name="terminal" />
              </OrbitingCircles>
            </div>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`{/* Dual-ring orbit: outer clockwise, inner counter-clockwise */}
<div style={{ position: 'relative' }}>
  <OrbitingCircles radius={90} duration={15}>
    <Icon name="zap" />
    <Icon name="star" />
    <Icon name="heart" />
    <Icon name="code" />
  </OrbitingCircles>
  <OrbitingCircles radius={55} duration={12} reverse>
    <Icon name="settings" />
    <Icon name="globe" />
    <Icon name="terminal" />
  </OrbitingCircles>
</div>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Motion Levels ────────────────────────────── */}
      <section className="orbiting-circles-page__section" id="motion">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          Four motion levels control animation intensity. Level 0 statically positions items
          on the orbit circle without animation. Respects <code className="orbiting-circles-page__a11y-key">prefers-reduced-motion</code> automatically.
        </p>
        <div className="orbiting-circles-page__labeled-row">
          {([0, 3] as const).map(level => (
            <div key={level} className="orbiting-circles-page__labeled-item">
              <OrbitingCircles radius={60} duration={10} motion={level}>
                <OrbitIcon name="zap" />
                <OrbitIcon name="star" />
                <OrbitIcon name="heart" />
              </OrbitingCircles>
              <span className="orbiting-circles-page__item-label">motion={level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Speed Variations ─────────────────────────── */}
      <section className="orbiting-circles-page__section" id="speed">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#speed">Speed Variations</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          The duration prop sets how many seconds a full orbit takes. Lower values create
          a faster, more energetic feel; higher values create a calm, meditative orbit.
        </p>
        <div className="orbiting-circles-page__labeled-row">
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={60} duration={5}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">5s (fast)</span>
          </div>
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={60} duration={15}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">15s (default)</span>
          </div>
          <div className="orbiting-circles-page__labeled-item">
            <OrbitingCircles radius={60} duration={30}>
              <OrbitIcon name="zap" />
              <OrbitIcon name="star" />
              <OrbitIcon name="heart" />
            </OrbitingCircles>
            <span className="orbiting-circles-page__item-label">30s (slow)</span>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="orbiting-circles-page__section" id="tiers">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          OrbitingCircles ships with three weight tiers. The Lite tier provides CSS-only
          orbiting via keyframes. Standard adds motion level control and dynamic angle
          calculations. Premium adds trail effects and glow halos.
        </p>

        <div className="orbiting-circles-page__tiers">
          {/* Lite */}
          <div
            className={`orbiting-circles-page__tier-card${tier === 'lite' ? ' orbiting-circles-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="orbiting-circles-page__tier-header">
              <span className="orbiting-circles-page__tier-name">Lite</span>
              <span className="orbiting-circles-page__tier-size">~0.4 KB</span>
            </div>
            <p className="orbiting-circles-page__tier-desc">
              CSS-only orbit with keyframe animation. No JavaScript animation engine.
              Items are evenly distributed via CSS custom properties.
            </p>
            <div className="orbiting-circles-page__tier-import">
              import {'{'} OrbitingCircles {'}'} from '@annondeveloper/ui-kit/domain'
            </div>
            <div className="orbiting-circles-page__tier-preview">
              <OrbitingCircles radius={40} duration={10} motion={0}>
                <OrbitIcon name="zap" />
                <OrbitIcon name="star" />
                <OrbitIcon name="heart" />
              </OrbitingCircles>
            </div>
            <div className="orbiting-circles-page__size-breakdown">
              <div className="orbiting-circles-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`orbiting-circles-page__tier-card${tier === 'standard' ? ' orbiting-circles-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="orbiting-circles-page__tier-header">
              <span className="orbiting-circles-page__tier-name">Standard</span>
              <span className="orbiting-circles-page__tier-size">~1.5 KB</span>
            </div>
            <p className="orbiting-circles-page__tier-desc">
              Full orbit engine with motion levels, counter-rotation to keep
              children upright, and dynamic angle distribution.
            </p>
            <div className="orbiting-circles-page__tier-import">
              import {'{'} OrbitingCircles {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="orbiting-circles-page__tier-preview">
              <OrbitingCircles radius={40} duration={10}>
                <OrbitIcon name="zap" />
                <OrbitIcon name="star" />
                <OrbitIcon name="heart" />
              </OrbitingCircles>
            </div>
            <div className="orbiting-circles-page__size-breakdown">
              <div className="orbiting-circles-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`orbiting-circles-page__tier-card${tier === 'premium' ? ' orbiting-circles-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="orbiting-circles-page__tier-header">
              <span className="orbiting-circles-page__tier-name">Premium</span>
              <span className="orbiting-circles-page__tier-size">~2.8 KB</span>
            </div>
            <p className="orbiting-circles-page__tier-desc">
              Everything in Standard plus trailing glow effects, orbit track
              shimmer, and smooth entrance animations for each item.
            </p>
            <div className="orbiting-circles-page__tier-import">
              import {'{'} OrbitingCircles {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="orbiting-circles-page__tier-preview">
              <OrbitingCircles radius={40} duration={10}>
                <OrbitIcon name="zap" />
                <OrbitIcon name="star" />
                <OrbitIcon name="heart" />
              </OrbitingCircles>
            </div>
            <div className="orbiting-circles-page__size-breakdown">
              <div className="orbiting-circles-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="orbiting-circles-page__section" id="brand-color">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          Pick a brand color to see the page theme update in real-time. The orbit track
          and accent colors derive automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="orbiting-circles-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`orbiting-circles-page__color-preset${brandColor === p.hex ? ' orbiting-circles-page__color-preset--active' : ''}`}
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
      <section className="orbiting-circles-page__section" id="props">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          All props accepted by OrbitingCircles. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={orbitingCirclesProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="orbiting-circles-page__section" id="accessibility">
        <h2 className="orbiting-circles-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="orbiting-circles-page__section-desc">
          OrbitingCircles is a presentational component that handles motion accessibility gracefully.
        </p>
        <Card variant="default" padding="md">
          <ul className="orbiting-circles-page__a11y-list">
            <li className="orbiting-circles-page__a11y-item">
              <span className="orbiting-circles-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Presentation:</strong> Root element uses <code className="orbiting-circles-page__a11y-key">role="presentation"</code> to indicate decorative purpose.
              </span>
            </li>
            <li className="orbiting-circles-page__a11y-item">
              <span className="orbiting-circles-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="orbiting-circles-page__a11y-key">prefers-reduced-motion</code> by stopping all orbit animation and showing static positions.
              </span>
            </li>
            <li className="orbiting-circles-page__a11y-item">
              <span className="orbiting-circles-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Static fallback:</strong> When <code className="orbiting-circles-page__a11y-key">motion={'{'}0{'}'}</code> is set, items are positioned on the orbit circle without animation using CSS transforms.
              </span>
            </li>
            <li className="orbiting-circles-page__a11y-item">
              <span className="orbiting-circles-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Animation is disabled in print media so items appear in their static orbital positions.
              </span>
            </li>
            <li className="orbiting-circles-page__a11y-item">
              <span className="orbiting-circles-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Counter-rotation:</strong> Child elements counter-rotate to remain upright, ensuring any text or icons stay readable.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
