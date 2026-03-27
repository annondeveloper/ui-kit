'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Navbar } from '@ui/components/navbar'
import { Navbar as LiteNavbar } from '@ui/lite/navbar'
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
    @scope (.navbar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: navbar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .navbar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .navbar-page__hero::before {
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
        animation: navbar-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes navbar-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .navbar-page__hero::before { animation: none; }
      }

      .navbar-page__title {
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

      .navbar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .navbar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .navbar-page__import-code {
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

      .navbar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .navbar-page__section {
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
        animation: navbar-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes navbar-section-reveal {
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
        .navbar-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .navbar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .navbar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .navbar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .navbar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .navbar-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .navbar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .navbar-page__preview--row {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .navbar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .navbar-page__playground {
          grid-template-columns: 1fr;
        }
        .navbar-page__playground-controls {
          position: static !important;
        }
      }

      @container navbar-page (max-width: 680px) {
        .navbar-page__playground {
          grid-template-columns: 1fr;
        }
        .navbar-page__playground-controls {
          position: static !important;
        }
      }

      .navbar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .navbar-page__playground-result {
        overflow-x: auto;
        min-block-size: 120px;
        display: flex;
        flex-direction: column;
        padding: 0;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .navbar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .navbar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .navbar-page__playground-body {
        padding: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        color: var(--text-tertiary);
        font-size: var(--text-sm, 0.875rem);
      }

      .navbar-page__playground-controls {
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

      .navbar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .navbar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .navbar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .navbar-page__option-btn {
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
      .navbar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .navbar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .navbar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .navbar-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .navbar-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .navbar-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .navbar-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .navbar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .navbar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .navbar-page__tier-card {
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

      .navbar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .navbar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .navbar-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .navbar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .navbar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .navbar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .navbar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .navbar-page__tier-import {
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

      .navbar-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      .navbar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .navbar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Nav link demo ─────────────────────────────── */

      .navbar-page__nav-link {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        text-decoration: none;
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-sm);
        transition: color 0.15s, background 0.15s;
        cursor: pointer;
        border: none;
        background: transparent;
        font-family: inherit;
        font-weight: 500;
      }
      .navbar-page__nav-link:hover {
        color: var(--text-primary);
        background: oklch(100% 0 0 / 0.06);
      }
      .navbar-page__nav-link--active {
        color: var(--brand, oklch(65% 0.2 270));
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .navbar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .navbar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .navbar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .navbar-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .navbar-page__color-preset {
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
      .navbar-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .navbar-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── States grid ────────────────────────────────── */

      .navbar-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .navbar-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        padding: 0;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        overflow: hidden;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .navbar-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .navbar-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        padding: 0.75rem;
        text-align: center;
        border-block-start: 1px solid var(--border-subtle);
      }

      /* ── A11y list ──────────────────────────────────── */

      .navbar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .navbar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .navbar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .navbar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .navbar-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .navbar-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .navbar-page__import-code,
      .navbar-page code,
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
        .navbar-page__hero {
          padding: 2rem 1.25rem;
        }
        .navbar-page__title {
          font-size: 1.75rem;
        }
        .navbar-page__preview {
          padding: 1rem;
        }
        .navbar-page__playground {
          grid-template-columns: 1fr;
        }
        .navbar-page__tiers {
          grid-template-columns: 1fr;
        }
        .navbar-page__section {
          padding: 1.25rem;
        }
        .navbar-page__states-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .navbar-page__hero {
          padding: 1.5rem 1rem;
        }
        .navbar-page__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .navbar-page__title {
          font-size: 4rem;
        }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const navbarProps: PropDef[] = [
  { name: 'logo', type: 'ReactNode', description: 'Logo element rendered at the start of the navbar.' },
  { name: 'children', type: 'ReactNode', description: 'Navigation items rendered in the center nav slot. Hidden on mobile, shown in hamburger menu.' },
  { name: 'actions', type: 'ReactNode', description: 'Action elements (buttons, avatars) rendered at the end of the navbar.' },
  { name: 'sticky', type: 'boolean', default: 'true', description: 'Makes the navbar stick to the top with backdrop blur effect.' },
  { name: 'bordered', type: 'boolean', default: 'true', description: 'Shows a subtle bottom border for visual separation.' },
  { name: 'transparent', type: 'boolean', default: 'false', description: 'Makes the background transparent. Combines with sticky for a glass effect.' },
  { name: 'height', type: 'number', default: '56', description: 'Navbar height in pixels. Sets the --navbar-height CSS custom property.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying <header> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Navbar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Navbar } from '@annondeveloper/ui-kit'",
  premium: "import { Navbar } from '@annondeveloper/ui-kit/premium'",
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
      className="navbar-page__copy-btn"
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
    <div className="navbar-page__control-group">
      <span className="navbar-page__control-label">{label}</span>
      <div className="navbar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`navbar-page__option-btn${opt === value ? ' navbar-page__option-btn--active' : ''}`}
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
    <label className="navbar-page__toggle-label">
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

// ─── Nav Link Component ───────────────────────────────────────────────────────

function NavLink({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      className={`navbar-page__nav-link${active ? ' navbar-page__nav-link--active' : ''}`}
    >
      {children}
    </button>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  sticky: boolean,
  bordered: boolean,
  transparent: boolean,
  height: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (!sticky) props.push('  sticky={false}')
  if (!bordered) props.push('  bordered={false}')
  if (transparent) props.push('  transparent')
  if (height !== 56) props.push(`  height={${height}}`)

  const logoJsx = '  logo={<span style={{ fontWeight: 700 }}>MyApp</span>}'
  const actionsJsx = '  actions={<button>Sign In</button>}'

  const propsStr = [logoJsx, ...props, actionsJsx].join('\n')

  return `${importStr}

<Navbar
${propsStr}
>
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
  <a href="/docs">Docs</a>
</Navbar>`
}

function generateHtmlCode(tier: Tier, sticky: boolean, bordered: boolean, transparent: boolean): string {
  const attrs: string[] = ['class="ui-navbar"']
  if (sticky) attrs.push('data-sticky="true"')
  if (bordered) attrs.push('data-bordered="true"')
  if (transparent) attrs.push('data-transparent="true"')

  return `<!-- Navbar -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/navbar.css">

<header ${attrs.join(' ')}>
  <div class="ui-navbar__logo">
    <span style="font-weight: 700">MyApp</span>
  </div>
  <nav class="ui-navbar__nav">
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
  </nav>
  <div class="ui-navbar__actions">
    <button>Sign In</button>
  </div>
</header>`
}

function generateVueCode(tier: Tier, sticky: boolean, bordered: boolean, transparent: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <header class="ui-navbar" ${sticky ? 'data-sticky="true"' : ''} ${bordered ? 'data-bordered="true"' : ''} ${transparent ? 'data-transparent="true"' : ''}>
    <div class="ui-navbar__logo"><span style="font-weight: 700">MyApp</span></div>
    <nav class="ui-navbar__nav">
      <a href="/dashboard">Dashboard</a>
      <a href="/settings">Settings</a>
    </nav>
    <div class="ui-navbar__actions"><button>Sign In</button></div>
  </header>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (!sticky) props.push('  :sticky="false"')
  if (!bordered) props.push('  :bordered="false"')
  if (transparent) props.push('  transparent')

  return `<template>
  <Navbar
    :logo="logo"${props.length ? '\n' + props.join('\n') : ''}
    :actions="actions"
  >
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
  </Navbar>
</template>

<script setup>
import { Navbar } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'
</script>`
}

function generateAngularCode(tier: Tier, sticky: boolean, bordered: boolean, transparent: boolean): string {
  const attrs: string[] = ['class="ui-navbar"']
  if (sticky) attrs.push('data-sticky="true"')
  if (bordered) attrs.push('data-bordered="true"')
  if (transparent) attrs.push('data-transparent="true"')

  return `<!-- Angular -- ${tier} tier -->
<header ${attrs.join(' ')}>
  <div class="ui-navbar__logo">
    <span style="font-weight: 700">MyApp</span>
  </div>
  <nav class="ui-navbar__nav">
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
  </nav>
  <div class="ui-navbar__actions">
    <button>Sign In</button>
  </div>
</header>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/navbar.css';`
}

function generateSvelteCode(tier: Tier, sticky: boolean, bordered: boolean, transparent: boolean): string {
  if (tier === 'lite') {
    return `<header class="ui-navbar" ${sticky ? 'data-sticky="true"' : ''} ${bordered ? 'data-bordered="true"' : ''} ${transparent ? 'data-transparent="true"' : ''}>
  <div class="ui-navbar__logo"><span style="font-weight: 700">MyApp</span></div>
  <nav class="ui-navbar__nav">
    <a href="/dashboard">Dashboard</a>
    <a href="/settings">Settings</a>
  </nav>
  <div class="ui-navbar__actions"><button>Sign In</button></div>
</header>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (!sticky) props.push('  sticky={false}')
  if (!bordered) props.push('  bordered={false}')
  if (transparent) props.push('  transparent')

  return `<script>
  import { Navbar } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}';
</script>

<Navbar
  logo={<span style="font-weight: 700">MyApp</span>}${props.length ? '\n' + props.join('\n') : ''}
>
  <a href="/dashboard">Dashboard</a>
  <a href="/settings">Settings</a>
</Navbar>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [sticky, setSticky] = useState(true)
  const [bordered, setBordered] = useState(true)
  const [transparent, setTransparent] = useState(false)
  const [height, setHeight] = useState(56)
  const [copyStatus, setCopyStatus] = useState('')

  const NavbarComponent = tier === 'lite' ? LiteNavbar : Navbar

  const reactCode = useMemo(
    () => generateReactCode(tier, sticky, bordered, transparent, height),
    [tier, sticky, bordered, transparent, height],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, sticky, bordered, transparent),
    [tier, sticky, bordered, transparent],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, sticky, bordered, transparent),
    [tier, sticky, bordered, transparent],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, sticky, bordered, transparent),
    [tier, sticky, bordered, transparent],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, sticky, bordered, transparent),
    [tier, sticky, bordered, transparent],
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

  return (
    <section className="navbar-page__section" id="playground">
      <h2 className="navbar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="navbar-page__section-desc">
        Tweak every prop and see the Navbar update in real-time. Generated code updates as you change settings.
      </p>

      <div className="navbar-page__playground">
        <div className="navbar-page__playground-preview">
          <div className="navbar-page__playground-result">
            <NavbarComponent
              sticky={false}
              bordered={bordered}
              transparent={transparent}
              height={height}
              logo={<span style={{ fontWeight: 700, fontSize: '1rem' }}>MyApp</span>}
              actions={
                <Button size="sm" variant="primary">
                  Sign In
                </Button>
              }
            >
              <NavLink active>Dashboard</NavLink>
              <NavLink>Settings</NavLink>
              <NavLink>Docs</NavLink>
            </NavbarComponent>
            <div className="navbar-page__playground-body">
              Page content area
            </div>
          </div>

          <div className="navbar-page__code-tabs">
            <div className="navbar-page__export-row">
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
              {copyStatus && <span className="navbar-page__export-status">{copyStatus}</span>}
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

        <div className="navbar-page__playground-controls">
          <div className="navbar-page__control-group">
            <span className="navbar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Sticky" checked={sticky} onChange={setSticky} />
              <Toggle label="Bordered" checked={bordered} onChange={setBordered} />
              <Toggle label="Transparent" checked={transparent} onChange={setTransparent} />
            </div>
          </div>

          <div className="navbar-page__control-group">
            <span className="navbar-page__control-label">Height</span>
            <div className="navbar-page__control-options">
              {[40, 48, 56, 64, 72].map(h => (
                <button
                  key={h}
                  type="button"
                  className={`navbar-page__option-btn${h === height ? ' navbar-page__option-btn--active' : ''}`}
                  onClick={() => setHeight(h)}
                >
                  {h}px
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NavbarPage() {
  useStyles('navbar-page', pageStyles)

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
    const sections = document.querySelectorAll('.navbar-page__section')
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

  const NavbarComponent = tier === 'lite' ? LiteNavbar : Navbar

  return (
    <div className="navbar-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="navbar-page__hero">
        <h1 className="navbar-page__title">Navbar</h1>
        <p className="navbar-page__desc">
          Responsive navigation bar with logo, nav links, actions, and a mobile hamburger menu.
          Supports sticky positioning, transparent glass effect, and responsive collapse behavior.
        </p>
        <div className="navbar-page__import-row">
          <code className="navbar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Sticky vs Static ──────────────────────────── */}
      <section className="navbar-page__section" id="sticky">
        <h2 className="navbar-page__section-title">
          <a href="#sticky">Sticky vs Static</a>
        </h2>
        <p className="navbar-page__section-desc">
          Sticky navbars remain fixed at the top of the viewport with a backdrop blur effect.
          Static navbars scroll with the page content.
        </p>
        <div className="navbar-page__states-grid">
          <div className="navbar-page__state-cell">
            <NavbarComponent
              sticky={false}
              bordered
              logo={<span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Sticky</span>}
            >
              <NavLink active>Home</NavLink>
              <NavLink>About</NavLink>
            </NavbarComponent>
            <span className="navbar-page__state-label">sticky=true (default)</span>
          </div>
          <div className="navbar-page__state-cell">
            <NavbarComponent
              sticky={false}
              bordered
              logo={<span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Static</span>}
            >
              <NavLink active>Home</NavLink>
              <NavLink>About</NavLink>
            </NavbarComponent>
            <span className="navbar-page__state-label">sticky=false</span>
          </div>
        </div>
      </section>

      {/* ── 4. Bordered & Transparent ────────────────────── */}
      <section className="navbar-page__section" id="appearance">
        <h2 className="navbar-page__section-title">
          <a href="#appearance">Appearance Options</a>
        </h2>
        <p className="navbar-page__section-desc">
          Combine bordered and transparent props to achieve different visual styles.
          Transparent + sticky creates a frosted glass effect with backdrop blur.
        </p>
        <div className="navbar-page__states-grid">
          <div className="navbar-page__state-cell">
            <NavbarComponent
              sticky={false}
              bordered
              logo={<span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Bordered</span>}
              actions={<Button size="xs" variant="secondary">Action</Button>}
            >
              <NavLink active>Home</NavLink>
            </NavbarComponent>
            <span className="navbar-page__state-label">bordered=true</span>
          </div>
          <div className="navbar-page__state-cell">
            <NavbarComponent
              sticky={false}
              bordered={false}
              logo={<span style={{ fontWeight: 700, fontSize: '0.875rem' }}>No Border</span>}
              actions={<Button size="xs" variant="secondary">Action</Button>}
            >
              <NavLink active>Home</NavLink>
            </NavbarComponent>
            <span className="navbar-page__state-label">bordered=false</span>
          </div>
          <div className="navbar-page__state-cell">
            <div style={{ background: 'linear-gradient(135deg, oklch(30% 0.08 250), oklch(20% 0.06 300))', padding: '0.5rem 0', borderRadius: 'var(--radius-sm)' }}>
              <NavbarComponent
                sticky={false}
                bordered={false}
                transparent
                logo={<span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Glass</span>}
                actions={<Button size="xs" variant="secondary">Action</Button>}
              >
                <NavLink active>Home</NavLink>
              </NavbarComponent>
            </div>
            <span className="navbar-page__state-label">transparent=true</span>
          </div>
        </div>
      </section>

      {/* ── 5. Heights ──────────────────────────────────── */}
      <section className="navbar-page__section" id="heights">
        <h2 className="navbar-page__section-title">
          <a href="#heights">Custom Heights</a>
        </h2>
        <p className="navbar-page__section-desc">
          The height prop controls the navbar block-size via the --navbar-height CSS custom property.
          Default is 56px, but you can use any value for compact or spacious layouts.
        </p>
        <div className="navbar-page__preview">
          {[40, 48, 56, 64, 72].map(h => (
            <div key={h} style={{ width: '100%' }}>
              <NavbarComponent
                sticky={false}
                bordered
                height={h}
                logo={<span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{h}px</span>}
              >
                <NavLink active>Home</NavLink>
                <NavLink>About</NavLink>
              </NavbarComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Logo + Actions ──────────────────────────── */}
      <section className="navbar-page__section" id="composition">
        <h2 className="navbar-page__section-title">
          <a href="#composition">Composition</a>
        </h2>
        <p className="navbar-page__section-desc">
          The Navbar accepts three slot areas: logo, children (nav links), and actions.
          All slots are optional, allowing flexible composition for different layouts.
        </p>
        <div className="navbar-page__preview">
          <div style={{ width: '100%' }}>
            <NavbarComponent
              sticky={false}
              bordered
              logo={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Icon name="zap" size="sm" /> Acme
                </span>
              }
              actions={
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button size="xs" variant="ghost" icon={<Icon name="search" size="sm" />} aria-label="Search" />
                  <Button size="xs" variant="ghost" icon={<Icon name="bell" size="sm" />} aria-label="Notifications" />
                  <Button size="sm" variant="primary">Sign Up</Button>
                </div>
              }
            >
              <NavLink active>Dashboard</NavLink>
              <NavLink>Projects</NavLink>
              <NavLink>Team</NavLink>
              <NavLink>Settings</NavLink>
            </NavbarComponent>
          </div>

          <div style={{ width: '100%' }}>
            <NavbarComponent
              sticky={false}
              bordered
              logo={<span style={{ fontWeight: 700 }}>MinimalApp</span>}
            />
          </div>

          <div style={{ width: '100%' }}>
            <NavbarComponent
              sticky={false}
              bordered
              actions={
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button size="sm" variant="secondary">Log In</Button>
                  <Button size="sm" variant="primary">Sign Up</Button>
                </div>
              }
            >
              <NavLink active>Features</NavLink>
              <NavLink>Pricing</NavLink>
              <NavLink>Docs</NavLink>
            </NavbarComponent>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="navbar-page__section" id="tiers">
        <h2 className="navbar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="navbar-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier is CSS-only with no JavaScript
          for the mobile menu toggle. Standard tier includes the full responsive hamburger behavior.
        </p>

        <div className="navbar-page__tiers">
          {/* Lite */}
          <div
            className={`navbar-page__tier-card${tier === 'lite' ? ' navbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="navbar-page__tier-header">
              <span className="navbar-page__tier-name">Lite</span>
              <span className="navbar-page__tier-size">~0.4 KB</span>
            </div>
            <p className="navbar-page__tier-desc">
              CSS-only layout. No mobile hamburger toggle. Ideal for server-rendered or static pages
              where you handle responsive nav yourself.
            </p>
            <div className="navbar-page__tier-import">
              import {'{'} Navbar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="navbar-page__tier-preview">
              <LiteNavbar
                sticky={false}
                bordered
                logo={<span style={{ fontWeight: 700, fontSize: '0.75rem' }}>Lite</span>}
              >
                <NavLink active>Home</NavLink>
                <NavLink>About</NavLink>
              </LiteNavbar>
            </div>
            <div className="navbar-page__size-breakdown">
              <div className="navbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`navbar-page__tier-card${tier === 'standard' ? ' navbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="navbar-page__tier-header">
              <span className="navbar-page__tier-name">Standard</span>
              <span className="navbar-page__tier-size">~1.2 KB</span>
            </div>
            <p className="navbar-page__tier-desc">
              Full-featured navbar with responsive hamburger menu, mobile overlay,
              backdrop blur, and accessible toggle button with aria-expanded.
            </p>
            <div className="navbar-page__tier-import">
              import {'{'} Navbar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="navbar-page__tier-preview">
              <Navbar
                sticky={false}
                bordered
                logo={<span style={{ fontWeight: 700, fontSize: '0.75rem' }}>Standard</span>}
              >
                <NavLink active>Home</NavLink>
                <NavLink>About</NavLink>
              </Navbar>
            </div>
            <div className="navbar-page__size-breakdown">
              <div className="navbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`navbar-page__tier-card${tier === 'premium' ? ' navbar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="navbar-page__tier-header">
              <span className="navbar-page__tier-name">Premium</span>
              <span className="navbar-page__tier-size">~3-5 KB</span>
            </div>
            <p className="navbar-page__tier-desc">
              Glass morphism surface, aurora glow on active items, spring hover transitions, and slide entrance animation.
            </p>
            <div className="navbar-page__tier-import">
              import {'{'} Navbar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="navbar-page__tier-preview">
              <Navbar
                sticky={false}
                bordered
                logo={<span style={{ fontWeight: 700, fontSize: '0.75rem' }}>Premium</span>}
              >
                <NavLink active>Home</NavLink>
                <NavLink>About</NavLink>
              </Navbar>
            </div>
            <div className="navbar-page__size-breakdown">
              <div className="navbar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────────── */}
      <section className="navbar-page__section" id="brand-color">
        <h2 className="navbar-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="navbar-page__section-desc">
          Pick a brand color to see all navbars update in real-time. The theme generates
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
          <div className="navbar-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`navbar-page__color-preset${brandColor === p.hex ? ' navbar-page__color-preset--active' : ''}`}
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
      <section className="navbar-page__section" id="props">
        <h2 className="navbar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="navbar-page__section-desc">
          All props accepted by Navbar. It also spreads any native HTML attributes
          onto the underlying {'<header>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={navbarProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="navbar-page__section" id="accessibility">
        <h2 className="navbar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="navbar-page__section-desc">
          Built on native {'<header>'} and {'<nav>'} landmarks with full keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="navbar-page__a11y-list">
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Landmarks:</strong> Uses <code className="navbar-page__a11y-key">{'<header>'}</code> and <code className="navbar-page__a11y-key">{'<nav>'}</code> for proper document structure.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hamburger:</strong> Toggle button includes <code className="navbar-page__a11y-key">aria-expanded</code> and <code className="navbar-page__a11y-key">aria-label</code>.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Mobile nav:</strong> Mobile navigation has its own <code className="navbar-page__a11y-key">aria-label="Mobile navigation"</code>.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on hamburger button via <code className="navbar-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Hamburger enforces 44px minimum on coarse pointer devices via <code className="navbar-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="navbar-page__a11y-key">forced-colors: active</code> support with Canvas/ButtonText system colors.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Hamburger hidden and nav links forced visible in <code className="navbar-page__a11y-key">@media print</code>.
              </span>
            </li>
            <li className="navbar-page__a11y-item">
              <span className="navbar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Responsive:</strong> Container query collapse at 640px with media query fallback for non-container contexts.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
