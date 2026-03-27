'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Tabs as LiteTabs } from '@ui/lite/tabs'
import { Tabs as PremiumTabs } from '@ui/premium/tabs'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
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
    @scope (.tabs-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tabs-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .tabs-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .tabs-page__hero::before {
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
        animation: tabs-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes tabs-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .tabs-page__hero::before { animation: none; }
      }

      .tabs-page__title {
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

      .tabs-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tabs-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tabs-page__import-code {
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

      .tabs-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .tabs-page__section {
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
        animation: tabs-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tabs-section-reveal {
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
        .tabs-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .tabs-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .tabs-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .tabs-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .tabs-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .tabs-page__preview {
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
      .tabs-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tabs-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .tabs-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .tabs-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .tabs-page__playground {
          grid-template-columns: 1fr;
        }
        .tabs-page__playground-controls {
          position: static !important;
        }
      }

      @container tabs-page (max-width: 680px) {
        .tabs-page__playground {
          grid-template-columns: 1fr;
        }
        .tabs-page__playground-controls {
          position: static !important;
        }
      }

      .tabs-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tabs-page__playground-result {
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
      .tabs-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .tabs-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tabs-page__playground-controls {
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

      .tabs-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tabs-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tabs-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tabs-page__option-btn {
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
      .tabs-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .tabs-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tabs-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .tabs-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .tabs-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .tabs-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .tabs-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tabs-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .tabs-page__tier-card {
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

      .tabs-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tabs-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .tabs-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tabs-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tabs-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .tabs-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .tabs-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .tabs-page__tier-import {
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

      .tabs-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .tabs-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .tabs-page__color-preset {
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
      .tabs-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .tabs-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .tabs-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .tabs-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .tabs-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .tabs-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .tabs-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tabs-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .tabs-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .tabs-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .tabs-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .tabs-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .tabs-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .tabs-page__hero {
          padding: 2rem 1.25rem;
        }

        .tabs-page__title {
          font-size: 1.75rem;
        }

        .tabs-page__preview {
          padding: 1.75rem;
        }

        .tabs-page__playground {
          grid-template-columns: 1fr;
        }

        .tabs-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .tabs-page__labeled-row {
          gap: 1rem;
        }

        .tabs-page__tiers {
          grid-template-columns: 1fr;
        }

        .tabs-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .tabs-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .tabs-page__hero {
          padding: 1.5rem 1rem;
        }

        .tabs-page__title {
          font-size: 1.5rem;
        }

        .tabs-page__preview {
          padding: 1rem;
        }

        .tabs-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .tabs-page__title {
          font-size: 4rem;
        }

        .tabs-page__preview {
          padding: 3.5rem;
        }

        .tabs-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .tabs-page__import-code,
      .tabs-page code,
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

const tabsProps: PropDef[] = [
  { name: 'tabs', type: 'Tab[]', description: 'Array of tab definitions: { id, label, icon?, disabled? }.' },
  { name: 'activeTab', type: 'string', description: 'Controlled active tab ID. Use with onChange for controlled mode.' },
  { name: 'defaultTab', type: 'string', description: 'Uncontrolled default active tab ID. Falls back to first tab.' },
  { name: 'onChange', type: '(tabId: string) => void', description: 'Called when the active tab changes.' },
  { name: 'variant', type: "'underline' | 'pills' | 'enclosed'", default: "'underline'", description: 'Visual style of the tab list.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding and font-size of tabs.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction. Vertical places tabs on the left.' },
  { name: 'lazy', type: 'boolean', default: 'false', description: 'Only render active panel content. Unmounts inactive panels.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'children', type: 'ReactNode', description: 'TabPanel children mapping to tab IDs.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'badge (Tab)', type: 'ReactNode', description: 'Badge/count shown next to tab label.' },
  { name: 'closeable (Tab)', type: 'boolean', description: 'Shows a close button on the tab.' },
  { name: 'onClose', type: '(tabId: string) => void', description: 'Called when a tab close button is clicked.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TabVariant = 'underline' | 'pills' | 'enclosed'
type Orientation = 'horizontal' | 'vertical'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: TabVariant[] = ['underline', 'pills', 'enclosed']
const ORIENTATIONS: Orientation[] = ['horizontal', 'vertical']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Tabs } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Tabs, TabPanel } from '@annondeveloper/ui-kit'",
  premium: "import { Tabs, TabPanel } from '@annondeveloper/ui-kit/premium'",
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

const DEMO_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'docs', label: 'Documentation' },
]

const DEMO_TABS_WITH_ICONS = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icon name="activity" size="sm" /> },
  { id: 'settings', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
  { id: 'profile', label: 'Profile', icon: <Icon name="user" size="sm" /> },
]

const DEMO_TABS_WITH_DISABLED = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'archived', label: 'Archived', disabled: true },
  { id: 'deleted', label: 'Deleted', disabled: true },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="tabs-page__copy-btn"
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
    <div className="tabs-page__control-group">
      <span className="tabs-page__control-label">{label}</span>
      <div className="tabs-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`tabs-page__option-btn${opt === value ? ' tabs-page__option-btn--active' : ''}`}
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
    <label className="tabs-page__toggle-label">
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
  variant: TabVariant,
  size: Size,
  orientation: Orientation,
  showIcons: boolean,
  hasDisabled: boolean,
  lazy: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const attrs: string[] = []
    if (variant !== 'underline') attrs.push(`  variant="${variant}"`)
    return `${importStr}

const tabs = [
  { id: 'tab1', label: 'First' },
  { id: 'tab2', label: 'Second' },
  { id: 'tab3', label: 'Third' },
]

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}${attrs.length ? '\n' + attrs.join('\n') : ''}
>
  <TabPanel tabId="tab1" activeTab={activeTab}>
    First panel content
  </TabPanel>
  <TabPanel tabId="tab2" activeTab={activeTab}>
    Second panel content
  </TabPanel>
</Tabs>`
  }

  const iconImport = showIcons ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''
  const tabDefs = showIcons
    ? `const tabs = [
  { id: 'tab1', label: 'Dashboard', icon: <Icon name="activity" size="sm" /> },
  { id: 'tab2', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
  { id: 'tab3', label: 'Profile', icon: <Icon name="user" size="sm" /> },
]`
    : hasDisabled
      ? `const tabs = [
  { id: 'tab1', label: 'Active' },
  { id: 'tab2', label: 'Pending' },
  { id: 'tab3', label: 'Archived', disabled: true },
]`
      : `const tabs = [
  { id: 'tab1', label: 'First' },
  { id: 'tab2', label: 'Second' },
  { id: 'tab3', label: 'Third' },
]`

  const props: string[] = []
  props.push('  tabs={tabs}')
  props.push('  activeTab={activeTab}')
  props.push('  onChange={setActiveTab}')
  if (variant !== 'underline') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (lazy) props.push('  lazy')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}${iconImport}

${tabDefs}

<Tabs
${props.join('\n')}
>
  <TabPanel tabId="tab1">First panel content</TabPanel>
  <TabPanel tabId="tab2">Second panel content</TabPanel>
  <TabPanel tabId="tab3">Third panel content</TabPanel>
</Tabs>`
}

function generateHtmlCode(
  tier: Tier,
  variant: TabVariant,
  size: Size,
  orientation: Orientation,
): string {
  const className = tier === 'lite' ? 'ui-lite-tabs' : 'ui-tabs'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/tabs.css';`

  return `<!-- Tabs — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/tabs.css'}">

<div class="${className}" data-variant="${variant}" data-size="${size}"${orientation !== 'horizontal' ? ` data-orientation="${orientation}"` : ''}>
  <div class="${className}__list" role="tablist">
    <button role="tab" aria-selected="true" class="${className}__tab">First</button>
    <button role="tab" aria-selected="false" class="${className}__tab">Second</button>
    <button role="tab" aria-selected="false" class="${className}__tab">Third</button>
  </div>
  <div role="tabpanel" class="${className}__panel">
    Panel content here
  </div>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(
  tier: Tier,
  variant: TabVariant,
  size: Size,
  orientation: Orientation,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-tabs"`, `data-variant="${variant}"`]
    return `<template>
  <div ${attrs.join(' ')}>
    <div class="ui-lite-tabs__list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="ui-lite-tabs__tab"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div role="tabpanel" class="ui-lite-tabs__panel">
      {{ panels[activeTab] }}
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  attrs.push('  :tabs="tabs"')
  attrs.push('  :active-tab="activeTab"')
  attrs.push('  @change="activeTab = $event"')
  if (variant !== 'underline') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (orientation !== 'horizontal') attrs.push(`  orientation="${orientation}"`)

  return `<template>
  <Tabs
  ${attrs.join('\n  ')}
  >
    <TabPanel tab-id="tab1">First panel</TabPanel>
    <TabPanel tab-id="tab2">Second panel</TabPanel>
  </Tabs>
</template>

<script setup>
import { Tabs, TabPanel } from '${importPath}'
</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: TabVariant,
  size: Size,
  orientation: Orientation,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-tabs" data-variant="${variant}">
  <div class="ui-lite-tabs__list" role="tablist">
    <button
      *ngFor="let tab of tabs"
      role="tab"
      [attr.aria-selected]="activeTab === tab.id"
      class="ui-lite-tabs__tab"
      (click)="activeTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>
  <div role="tabpanel" class="ui-lite-tabs__panel">
    {{ panels[activeTab] }}
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div
  class="ui-tabs"
  data-variant="${variant}"
  data-size="${size}"
  ${orientation !== 'horizontal' ? `data-orientation="${orientation}"` : ''}
>
  <div class="ui-tabs__list" role="tablist">
    <button
      *ngFor="let tab of tabs"
      role="tab"
      [attr.aria-selected]="activeTab === tab.id"
      class="ui-tabs__tab"
      (click)="activeTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>
  <div role="tabpanel" class="ui-tabs__panel">
    Panel content
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/tabs.css';`
}

function generateSvelteCode(
  tier: Tier,
  variant: TabVariant,
  size: Size,
  orientation: Orientation,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-tabs" data-variant="${variant}">
  <div class="ui-lite-tabs__list" role="tablist">
    {#each tabs as tab}
      <button
        role="tab"
        aria-selected={activeTab === tab.id}
        class="ui-lite-tabs__tab"
        on:click={() => activeTab = tab.id}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  <div role="tabpanel" class="ui-lite-tabs__panel">
    {panels[activeTab]}
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { Tabs, TabPanel } from '${importPath}';
  let activeTab = 'tab1';
  const tabs = [
    { id: 'tab1', label: 'First' },
    { id: 'tab2', label: 'Second' },
    { id: 'tab3', label: 'Third' },
  ];
</script>

<Tabs
  {tabs}
  {activeTab}
  variant="${variant}"
  size="${size}"
  ${orientation !== 'horizontal' ? `orientation="${orientation}"` : ''}
  on:change={(e) => activeTab = e.detail}
>
  <TabPanel tabId="tab1">First panel</TabPanel>
  <TabPanel tabId="tab2">Second panel</TabPanel>
  <TabPanel tabId="tab3">Third panel</TabPanel>
</Tabs>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<TabVariant>('underline')
  const [size, setSize] = useState<Size>('md')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [showIcons, setShowIcons] = useState(false)
  const [hasDisabled, setHasDisabled] = useState(false)
  const [lazy, setLazy] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activePlaygroundTab, setActivePlaygroundTab] = useState('tab1')
  const [copyStatus, setCopyStatus] = useState('')

  // effectiveTier maps each tier correctly
  const effectiveTier = tier
  const TabsComponent = effectiveTier === 'lite' ? LiteTabs : effectiveTier === 'premium' ? PremiumTabs : Tabs

  const playgroundTabs = useMemo(() => {
    if (showIcons && effectiveTier !== 'lite') {
      return [
        { id: 'tab1', label: 'Dashboard', icon: <Icon name="activity" size="sm" /> },
        { id: 'tab2', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
        { id: 'tab3', label: 'Profile', icon: <Icon name="user" size="sm" /> },
      ]
    }
    if (hasDisabled) {
      return [
        { id: 'tab1', label: 'Active' },
        { id: 'tab2', label: 'Pending' },
        { id: 'tab3', label: 'Archived', disabled: true },
      ]
    }
    return [
      { id: 'tab1', label: 'First' },
      { id: 'tab2', label: 'Second' },
      { id: 'tab3', label: 'Third' },
    ]
  }, [showIcons, hasDisabled, effectiveTier])

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, size, orientation, showIcons, hasDisabled, lazy, motion),
    [tier, variant, size, orientation, showIcons, hasDisabled, lazy, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, variant, size, orientation),
    [tier, variant, size, orientation],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, size, orientation),
    [tier, variant, size, orientation],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, size, orientation),
    [tier, variant, size, orientation],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, size, orientation),
    [tier, variant, size, orientation],
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

  // Build preview props based on tier
  const previewProps: Record<string, unknown> = {
    tabs: playgroundTabs,
    activeTab: activePlaygroundTab,
    onChange: setActivePlaygroundTab,
  }

  if (effectiveTier === 'lite') {
    // Lite only supports underline | pills for variant
    previewProps.variant = variant === 'enclosed' ? 'underline' : variant
  } else {
    previewProps.variant = variant
    previewProps.size = size
    previewProps.orientation = orientation
    previewProps.lazy = lazy
    previewProps.motion = motion
  }

  return (
    <section className="tabs-page__section" id="playground">
      <h2 className="tabs-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tabs-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="tabs-page__playground">
        {/* Preview area */}
        <div className="tabs-page__playground-preview">
          <div className="tabs-page__playground-result" style={{ placeItems: 'stretch', padding: '2rem' }}>
            {effectiveTier === 'lite' ? (
              <TabsComponent {...previewProps}>
                <div role="tabpanel" hidden={activePlaygroundTab !== 'tab1'} style={{ padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>First tab panel content. This is the overview section.</p>
                </div>
                <div role="tabpanel" hidden={activePlaygroundTab !== 'tab2'} style={{ padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Second tab panel content. Configure your settings here.</p>
                </div>
                <div role="tabpanel" hidden={activePlaygroundTab !== 'tab3'} style={{ padding: '1rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Third tab panel content. Review the details.</p>
                </div>
              </TabsComponent>
            ) : (
              <TabsComponent {...previewProps}>
                <TabPanel tabId="tab1">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>First tab panel content. This is the overview section.</p>
                </TabPanel>
                <TabPanel tabId="tab2">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Second tab panel content. Configure your settings here.</p>
                </TabPanel>
                <TabPanel tabId="tab3">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Third tab panel content. Review the details.</p>
                </TabPanel>
              </TabsComponent>
            )}
          </div>

          {/* Tabbed code output */}
          <div className="tabs-page__code-tabs">
            <div className="tabs-page__export-row">
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
              {copyStatus && <span className="tabs-page__export-status">{copyStatus}</span>}
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
        <div className="tabs-page__playground-controls">
          <OptionGroup
            label="Variant"
            options={effectiveTier === 'lite' ? (['underline', 'pills'] as const) : VARIANTS}
            value={effectiveTier === 'lite' && variant === 'enclosed' ? 'underline' : variant}
            onChange={setVariant as (v: string) => void}
          />

          {effectiveTier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          <OptionGroup label="Orientation" options={ORIENTATIONS} value={orientation} onChange={setOrientation} />

          {effectiveTier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="tabs-page__control-group">
            <span className="tabs-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {effectiveTier !== 'lite' && <Toggle label="Show icons" checked={showIcons} onChange={setShowIcons} />}
              <Toggle label="Disabled tabs" checked={hasDisabled} onChange={setHasDisabled} />
              {effectiveTier !== 'lite' && <Toggle label="Lazy render" checked={lazy} onChange={setLazy} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TabsPage() {
  useStyles('tabs-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  // effectiveTier maps each tier correctly
  const effectiveTier = tier
  const TabsComponent = effectiveTier === 'lite' ? LiteTabs : effectiveTier === 'premium' ? PremiumTabs : Tabs

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
    const sections = document.querySelectorAll('.tabs-page__section')
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

  // Demo state for variant showcases
  const [variantTab, setVariantTab] = useState('overview')
  const [iconTab, setIconTab] = useState('dashboard')
  const [disabledTab, setDisabledTab] = useState('active')

  return (
    <div className="tabs-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="tabs-page__hero">
        <h1 className="tabs-page__title">Tabs</h1>
        <p className="tabs-page__desc">
          Tabbed navigation with three visual variants, five sizes, vertical and horizontal orientations,
          icon support, and lazy rendering. Ships in three weight tiers from CSS-only lite to premium with
          morphing indicator animations.
        </p>
        <div className="tabs-page__import-row">
          <code className="tabs-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Variants ────────────────────────────────── */}
      <section className="tabs-page__section" id="variants">
        <h2 className="tabs-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="tabs-page__section-desc">
          Three built-in visual styles for different contexts. Underline is minimal, pills provides
          full background fills, and enclosed wraps tabs in a bordered container.
        </p>
        <div className="tabs-page__preview tabs-page__preview--col" style={{ gap: '2rem' }}>
          {VARIANTS.map(v => {
            // Lite only supports underline | pills
            if (effectiveTier === 'lite' && v === 'enclosed') return null
            return (
              <div key={v} style={{ width: '100%' }}>
                <span className="tabs-page__item-label" style={{ display: 'block', marginBlockEnd: '0.5rem' }}>{v}</span>
                {effectiveTier === 'lite' ? (
                  <TabsComponent
                    tabs={DEMO_TABS}
                    activeTab={variantTab}
                    onChange={setVariantTab}
                    variant={v as 'underline' | 'pills'}
                  >
                    <div role="tabpanel" hidden={variantTab !== 'overview'} style={{ padding: '0.75rem 0' }}>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Overview panel</p>
                    </div>
                  </TabsComponent>
                ) : (
                  <TabsComponent
                    tabs={DEMO_TABS}
                    activeTab={variantTab}
                    onChange={setVariantTab}
                    variant={v}
                  >
                    <TabPanel tabId="overview">
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Overview panel</p>
                    </TabPanel>
                    <TabPanel tabId="features">
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Features panel</p>
                    </TabPanel>
                    <TabPanel tabId="pricing">
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pricing panel</p>
                    </TabPanel>
                    <TabPanel tabId="docs">
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Documentation panel</p>
                    </TabPanel>
                  </TabsComponent>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 4. Size Scale ───────────────────────────────── */}
      <section className="tabs-page__section" id="sizes">
        <h2 className="tabs-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="tabs-page__section-desc">
          Five sizes from compact inline tabs (xs) to large headline tabs (xl).
          Sizes control padding, font-size, and touch target dimensions.
        </p>
        <div className="tabs-page__preview tabs-page__preview--col" style={{ gap: '2rem' }}>
          {effectiveTier === 'lite' ? (
            <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
              Size scale requires Standard or Premium tier. Lite uses a single default size.
            </p>
          ) : (
            SIZES.map(s => (
              <div key={s} style={{ width: '100%' }}>
                <span className="tabs-page__item-label" style={{ display: 'block', marginBlockEnd: '0.5rem' }}>{s}</span>
                <TabsComponent
                  tabs={DEMO_TABS.slice(0, 3)}
                  defaultTab="overview"
                  variant="underline"
                  size={s}
                >
                  <TabPanel tabId="overview">
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>Content at size {s}</p>
                  </TabPanel>
                  <TabPanel tabId="features">
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>Features content</p>
                  </TabPanel>
                  <TabPanel tabId="pricing">
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--text-sm)' }}>Pricing content</p>
                  </TabPanel>
                </TabsComponent>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="tabs-page__section" id="features">
        <h2 className="tabs-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="tabs-page__section-desc">
          Tabs support icons in labels, disabled tabs, vertical orientation, and lazy panel rendering.
        </p>

        {/* Icons in tabs */}
        {effectiveTier !== 'lite' ? (
          <div style={{ marginBlockEnd: '2rem' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Icons in Tabs</h3>
            <div className="tabs-page__preview tabs-page__preview--col">
              <TabsComponent
                tabs={DEMO_TABS_WITH_ICONS}
                activeTab={iconTab}
                onChange={setIconTab}
                variant="underline"
              >
                <TabPanel tabId="dashboard">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Dashboard panel with charts and metrics.</p>
                </TabPanel>
                <TabPanel tabId="settings">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Settings panel for configuration.</p>
                </TabPanel>
                <TabPanel tabId="profile">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Profile panel with user info.</p>
                </TabPanel>
              </TabsComponent>
            </div>
            <div style={{ marginBlockStart: '0.75rem' }}>
              <CopyBlock
                code={`const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <Icon name="activity" size="sm" /> },
  { id: 'settings', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
  { id: 'profile', label: 'Profile', icon: <Icon name="user" size="sm" /> },
]

<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
  <TabPanel tabId="dashboard">...</TabPanel>
</Tabs>`}
                language="typescript"
              />
            </div>
          </div>
        ) : (
          <div style={{ marginBlockEnd: '2rem' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Icons in Tabs</h3>
            <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
              Icons in tabs require Standard or Premium tier.
            </p>
          </div>
        )}

        {/* Disabled tabs */}
        <div style={{ marginBlockEnd: '2rem' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Disabled Tabs</h3>
          <div className="tabs-page__preview tabs-page__preview--col">
            {effectiveTier === 'lite' ? (
              <TabsComponent
                tabs={DEMO_TABS_WITH_DISABLED}
                activeTab={disabledTab}
                onChange={setDisabledTab}
                variant="underline"
              >
                <div role="tabpanel" hidden={disabledTab !== 'active'} style={{ padding: '0.75rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Active items panel.</p>
                </div>
                <div role="tabpanel" hidden={disabledTab !== 'pending'} style={{ padding: '0.75rem 0' }}>
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pending items panel.</p>
                </div>
              </TabsComponent>
            ) : (
              <TabsComponent
                tabs={DEMO_TABS_WITH_DISABLED}
                activeTab={disabledTab}
                onChange={setDisabledTab}
                variant="underline"
              >
                <TabPanel tabId="active">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Active items panel.</p>
                </TabPanel>
                <TabPanel tabId="pending">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pending items panel.</p>
                </TabPanel>
                <TabPanel tabId="archived">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Archived items (disabled).</p>
                </TabPanel>
                <TabPanel tabId="deleted">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Deleted items (disabled).</p>
                </TabPanel>
              </TabsComponent>
            )}
          </div>
          <div style={{ marginBlockStart: '0.75rem' }}>
            <CopyBlock
              code={`const tabs = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'archived', label: 'Archived', disabled: true },
  { id: 'deleted', label: 'Deleted', disabled: true },
]`}
              language="typescript"
            />
          </div>
        </div>

        {/* Vertical orientation */}
        {effectiveTier !== 'lite' && (
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Vertical Orientation</h3>
            <div className="tabs-page__preview tabs-page__preview--col">
              <TabsComponent
                tabs={DEMO_TABS.slice(0, 3)}
                defaultTab="overview"
                variant="underline"
                orientation="vertical"
              >
                <TabPanel tabId="overview">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Vertical tabs work well for settings pages and sidebars.</p>
                </TabPanel>
                <TabPanel tabId="features">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Features panel content.</p>
                </TabPanel>
                <TabPanel tabId="pricing">
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pricing panel content.</p>
                </TabPanel>
              </TabsComponent>
            </div>
            <div style={{ marginBlockStart: '0.75rem' }}>
              <CopyBlock
                code={`<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onChange={setActiveTab}
  orientation="vertical"
>
  <TabPanel tabId="tab1">...</TabPanel>
</Tabs>`}
                language="typescript"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="tabs-page__section" id="tiers">
        <h2 className="tabs-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="tabs-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits size, orientation, icons, lazy, and motion props).
        </p>

        <div className="tabs-page__tiers">
          {/* Lite */}
          <div
            className={`tabs-page__tier-card${tier === 'lite' ? ' tabs-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="tabs-page__tier-header">
              <span className="tabs-page__tier-name">Lite</span>
              <span className="tabs-page__tier-size">~0.4 KB</span>
            </div>
            <p className="tabs-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No icons, no sizes, no motion, no lazy render.
            </p>
            <div className="tabs-page__tier-import">
              import {'{'} Tabs {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="tabs-page__tier-preview">
              <LiteTabs
                tabs={[{ id: 't1', label: 'Tab 1' }, { id: 't2', label: 'Tab 2' }]}
                activeTab="t1"
                onChange={() => {}}
                variant="underline"
              >
                <span />
              </LiteTabs>
            </div>
            <div className="tabs-page__size-breakdown">
              <div className="tabs-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`tabs-page__tier-card${tier === 'standard' ? ' tabs-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="tabs-page__tier-header">
              <span className="tabs-page__tier-name">Standard</span>
              <span className="tabs-page__tier-size">~2 KB</span>
            </div>
            <p className="tabs-page__tier-desc">
              Full-featured tabs with sizes, orientations, icons,
              lazy rendering, motion levels, and keyboard navigation.
            </p>
            <div className="tabs-page__tier-import">
              import {'{'} Tabs, TabPanel {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="tabs-page__tier-preview">
              <Tabs
                tabs={[
                  { id: 't1', label: 'Overview', icon: <Icon name="activity" size="sm" /> },
                  { id: 't2', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
                ]}
                defaultTab="t1"
                variant="pills"
                size="sm"
              >
                <TabPanel tabId="t1"><span /></TabPanel>
                <TabPanel tabId="t2"><span /></TabPanel>
              </Tabs>
            </div>
            <div className="tabs-page__size-breakdown">
              <div className="tabs-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`tabs-page__tier-card${tier === 'premium' ? ' tabs-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="tabs-page__tier-header">
              <span className="tabs-page__tier-name">Premium</span>
              <span className="tabs-page__tier-size">~3 KB</span>
            </div>
            <p className="tabs-page__tier-desc">
              Everything in Standard plus morphing underline indicator,
              panel crossfade animation, and staggered content entry.
            </p>
            <div className="tabs-page__tier-import">
              import {'{'} Tabs, TabPanel {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="tabs-page__tier-preview">
              <PremiumTabs
                tabs={[
                  { id: 't1', label: 'Overview', icon: <Icon name="activity" size="sm" /> },
                  { id: 't2', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
                ]}
                defaultTab="t1"
                variant="underline"
                size="sm"
              >
                <TabPanel tabId="t1"><span /></TabPanel>
                <TabPanel tabId="t2"><span /></TabPanel>
              </PremiumTabs>
            </div>
            <div className="tabs-page__size-breakdown">
              <div className="tabs-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>2.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="tabs-page__section" id="brand-color">
        <h2 className="tabs-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="tabs-page__section-desc">
          Pick a brand color to see all tabs update in real-time. The theme generates
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
          <div className="tabs-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`tabs-page__color-preset${brandColor === p.hex ? ' tabs-page__color-preset--active' : ''}`}
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
      <section className="tabs-page__section" id="props">
        <h2 className="tabs-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="tabs-page__section-desc">
          All props accepted by Tabs. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tabsProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="tabs-page__section" id="accessibility">
        <h2 className="tabs-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="tabs-page__section-desc">
          Follows WAI-ARIA Tabs pattern with full keyboard navigation and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="tabs-page__a11y-list">
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Navigate with <code className="tabs-page__a11y-key">Arrow Left</code> / <code className="tabs-page__a11y-key">Arrow Right</code> (horizontal) or <code className="tabs-page__a11y-key">Arrow Up</code> / <code className="tabs-page__a11y-key">Arrow Down</code> (vertical). <code className="tabs-page__a11y-key">Home</code> / <code className="tabs-page__a11y-key">End</code> jump to first/last tab.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA roles:</strong> Uses <code className="tabs-page__a11y-key">role="tablist"</code>, <code className="tabs-page__a11y-key">role="tab"</code>, and <code className="tabs-page__a11y-key">role="tabpanel"</code> with proper <code className="tabs-page__a11y-key">aria-controls</code> and <code className="tabs-page__a11y-key">aria-labelledby</code> linking.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roving tabindex:</strong> Only the active tab is in the tab order. Arrow keys move focus between tabs using roving tabindex pattern.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled tabs:</strong> Marked with <code className="tabs-page__a11y-key">aria-disabled="true"</code>, skipped during keyboard navigation.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored outline via <code className="tabs-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="tabs-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="tabs-page__a11y-key">forced-colors: active</code> with visible borders and Highlight color.
              </span>
            </li>
            <li className="tabs-page__a11y-item">
              <span className="tabs-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> All panels are revealed in print mode via <code className="tabs-page__a11y-key">@media print</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="tabs-page__section" id="source">
        <h2 className="tabs-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="tabs-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/tabs.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="tabs-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/tabs.tsx — Standard
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/tabs.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="tabs-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/tabs.tsx — Lite
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/tabs.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="tabs-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/tabs.tsx — Premium
          </a>
        </div>
      </section>
    </div>
  )
}
