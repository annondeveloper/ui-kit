'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Drawer } from '@ui/components/drawer'
import { Drawer as PremiumDrawer } from '@ui/premium/drawer'
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
    @scope (.drawer-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: drawer-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .drawer-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .drawer-page__hero::before {
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
        .drawer-page__hero::before { animation: none; }
      }

      .drawer-page__title {
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

      .drawer-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .drawer-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .drawer-page__import-code {
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

      .drawer-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .drawer-page__section {
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
        animation: drawer-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes drawer-section-reveal {
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
        .drawer-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .drawer-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .drawer-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .drawer-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .drawer-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .drawer-page__preview {
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
      .drawer-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .drawer-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .drawer-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .drawer-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .drawer-page__playground {
          grid-template-columns: 1fr;
        }
        .drawer-page__playground-controls {
          position: static !important;
        }
      }

      @container drawer-page (max-width: 680px) {
        .drawer-page__playground {
          grid-template-columns: 1fr;
        }
        .drawer-page__playground-controls {
          position: static !important;
        }
      }

      .drawer-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .drawer-page__playground-result {
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
      .drawer-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .drawer-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .drawer-page__playground-controls {
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

      .drawer-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .drawer-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .drawer-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .drawer-page__option-btn {
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
      .drawer-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .drawer-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .drawer-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .drawer-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .drawer-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .drawer-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .drawer-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .drawer-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .drawer-page__tier-card {
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

      .drawer-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .drawer-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .drawer-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .drawer-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .drawer-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .drawer-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .drawer-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .drawer-page__tier-import {
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

      .drawer-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .drawer-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .drawer-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .drawer-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .drawer-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .drawer-page__color-preset {
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
      .drawer-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .drawer-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .drawer-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .drawer-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .drawer-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .drawer-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .drawer-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .drawer-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .drawer-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .drawer-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .drawer-page__hero {
          padding: 2rem 1.25rem;
        }

        .drawer-page__title {
          font-size: 1.75rem;
        }

        .drawer-page__preview {
          padding: 1.75rem;
        }

        .drawer-page__playground {
          grid-template-columns: 1fr;
        }

        .drawer-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .drawer-page__labeled-row {
          gap: 1rem;
        }

        .drawer-page__tiers {
          grid-template-columns: 1fr;
        }

        .drawer-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .drawer-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .drawer-page__hero {
          padding: 1.5rem 1rem;
        }

        .drawer-page__title {
          font-size: 1.5rem;
        }

        .drawer-page__preview {
          padding: 1rem;
        }

        .drawer-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .drawer-page__title {
          font-size: 4rem;
        }

        .drawer-page__preview {
          padding: 3.5rem;
        }

        .drawer-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .drawer-page__import-code,
      .drawer-page code,
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

const drawerProps: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Controls whether the drawer is visible.' },
  { name: 'onClose', type: '() => void', required: true, description: 'Callback fired when the drawer requests to close (overlay click, Escape key).' },
  { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", default: "'left'", description: 'Which edge the drawer slides in from.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Width (left/right) or height (top/bottom) of the drawer panel.' },
  { name: 'overlay', type: 'boolean', default: 'true', description: 'Show a semi-transparent backdrop behind the drawer.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content rendered inside the drawer body.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root drawer element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Side = 'left' | 'right'
type DrawerSize = 'sm' | 'md' | 'lg' | 'full'

const SIDES: Side[] = ['left', 'right']
const DRAWER_SIZES: DrawerSize[] = ['sm', 'md', 'lg', 'full']


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

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Drawer } from '@annondeveloper/ui-kit'",
  standard: "import { Drawer } from '@annondeveloper/ui-kit'",
  premium: "import { Drawer } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="drawer-page__copy-btn"
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
    <div className="drawer-page__control-group">
      <span className="drawer-page__control-label">{label}</span>
      <div className="drawer-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`drawer-page__option-btn${opt === value ? ' drawer-page__option-btn--active' : ''}`}
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
    <label className="drawer-page__toggle-label">
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
  side: Side,
  size: DrawerSize,
  showHeader: boolean,
  showClose: boolean,
  showOverlay: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  open={open}')
  props.push('  onClose={() => setOpen(false)}')
  if (side !== 'left') props.push(`  side="${side}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (!showOverlay) props.push('  overlay={false}')

  const headerJsx = showHeader
    ? `\n      <h2 style={{ margin: 0 }}>Drawer Title</h2>`
    : ''
  const closeJsx = showClose
    ? `\n      <button onClick={() => setOpen(false)}>Close</button>`
    : ''
  const bodyContent = `\n      <p>Drawer content goes here.</p>`

  return `${importStr}
import { useState } from 'react'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <Drawer
${props.join('\n')}
      >${headerJsx}${closeJsx}${bodyContent}
      </Drawer>
    </>
  )
}`
}

function generateHtmlCssCode(side: Side, size: DrawerSize): string {
  return `<!-- Drawer — @annondeveloper/ui-kit standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/drawer.css">

<div class="ui-drawer" id="my-drawer">
  <div class="ui-drawer__overlay" onclick="closeDrawer()"></div>
  <div class="ui-drawer__panel" data-side="${side}" data-size="${size}">
    <div class="ui-drawer__body">
      <h2>Drawer Title</h2>
      <p>Drawer content goes here.</p>
      <button onclick="closeDrawer()">Close</button>
    </div>
  </div>
</div>

<script>
function openDrawer() {
  document.getElementById('my-drawer').style.display = 'block';
}
function closeDrawer() {
  document.getElementById('my-drawer').style.display = 'none';
}
</script>`
}

function generateVueCode(side: Side, size: DrawerSize): string {
  const sideAttr = side !== 'left' ? `\n    side="${side}"` : ''
  const sizeAttr = size !== 'md' ? `\n    size="${size}"` : ''
  return `<template>
  <button @click="open = true">Open Drawer</button>
  <Drawer
    :open="open"
    @close="open = false"${sideAttr}${sizeAttr}
  >
    <h2>Drawer Title</h2>
    <p>Drawer content goes here.</p>
  </Drawer>
</template>

<script setup>
import { ref } from 'vue'
import { Drawer } from '@annondeveloper/ui-kit'

const open = ref(false)
</script>`
}

function generateAngularCode(side: Side, size: DrawerSize): string {
  const sideAttr = side !== 'left' ? ` data-side="${side}"` : ' data-side="left"'
  const sizeAttr = size !== 'md' ? ` data-size="${size}"` : ' data-size="md"'
  return `<!-- Angular — Standard tier (CSS-only approach) -->
<button (click)="drawerOpen = true">Open Drawer</button>

<div class="ui-drawer" *ngIf="drawerOpen">
  <div class="ui-drawer__overlay" (click)="drawerOpen = false"></div>
  <div class="ui-drawer__panel"${sideAttr}${sizeAttr}>
    <div class="ui-drawer__body">
      <h2>Drawer Title</h2>
      <p>Drawer content goes here.</p>
      <button (click)="drawerOpen = false">Close</button>
    </div>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/drawer.css';`
}

function generateSvelteCode(side: Side, size: DrawerSize): string {
  const sideAttr = side !== 'left' ? `\n  side="${side}"` : ''
  const sizeAttr = size !== 'md' ? `\n  size="${size}"` : ''
  return `<script>
  import { Drawer } from '@annondeveloper/ui-kit';
  let open = false;
</script>

<button on:click={() => open = true}>Open Drawer</button>

<Drawer
  {open}
  onClose={() => open = false}${sideAttr}${sizeAttr}
>
  <h2>Drawer Title</h2>
  <p>Drawer content goes here.</p>
</Drawer>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [side, setSide] = useState<Side>('left')
  const [size, setSize] = useState<DrawerSize>('md')
  const [showHeader, setShowHeader] = useState(true)
  const [showClose, setShowClose] = useState(true)
  const [showOverlay, setShowOverlay] = useState(true)
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const DrawerComponent = tier === 'premium' ? PremiumDrawer : Drawer

  const reactCode = useMemo(
    () => generateReactCode(tier, side, size, showHeader, showClose, showOverlay),
    [tier, side, size, showHeader, showClose, showOverlay],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(side, size),
    [side, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(side, size),
    [side, size],
  )

  const angularCode = useMemo(
    () => generateAngularCode(side, size),
    [side, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(side, size),
    [side, size],
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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  return (
    <section className="drawer-page__section" id="playground">
      <h2 className="drawer-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="drawer-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="drawer-page__playground">
        {/* Preview area — left / top */}
        <div className="drawer-page__playground-preview">
          <div className="drawer-page__playground-result">
            <Button variant="primary" onClick={() => setPlaygroundOpen(true)}>
              Open Drawer
            </Button>
            <DrawerComponent
              open={playgroundOpen}
              onClose={() => setPlaygroundOpen(false)}
              side={side}
              size={size}
              overlay={showOverlay}
            >
              {showHeader && (
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>Drawer Title</h2>
              )}
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This is the drawer content. You can place any React elements here.
              </p>
              {showClose && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPlaygroundOpen(false)}
                  style={{ marginBlockStart: '1.5rem' }}
                >
                  Close Drawer
                </Button>
              )}
            </DrawerComponent>
          </div>

          {/* Tabbed code output */}
          <div className="drawer-page__code-tabs">
            <div className="drawer-page__export-row">
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
              {copyStatus && <span className="drawer-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel — right / bottom */}
        <div className="drawer-page__playground-controls">
          <OptionGroup label="Side" options={SIDES} value={side} onChange={setSide} />
          <OptionGroup label="Size" options={DRAWER_SIZES} value={size} onChange={setSize} />

          <div className="drawer-page__control-group">
            <span className="drawer-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show header" checked={showHeader} onChange={setShowHeader} />
              <Toggle label="Show close button" checked={showClose} onChange={setShowClose} />
              <Toggle label="Overlay backdrop" checked={showOverlay} onChange={setShowOverlay} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DrawerPage() {
  useStyles('drawer-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const DrawerComponent = tier === 'premium' ? PremiumDrawer : Drawer

  // Individual open states for each demo
  const [sideLeftOpen, setSideLeftOpen] = useState(false)
  const [sideRightOpen, setSideRightOpen] = useState(false)
  const [featureHeaderOpen, setFeatureHeaderOpen] = useState(false)
  const [featureFooterOpen, setFeatureFooterOpen] = useState(false)
  const [featureOverlayOpen, setFeatureOverlayOpen] = useState(false)

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
    const sections = document.querySelectorAll('.drawer-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
    if (CSS.supports?.('animation-timeline', 'view()')) return // CSS handles it

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
    <div className="drawer-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="drawer-page__hero">
        <h1 className="drawer-page__title">Drawer</h1>
        <p className="drawer-page__desc">
          Slide-out panel anchored to any edge of the viewport. Supports left, right, top, and bottom sides
          with four size presets, overlay backdrop, and keyboard dismiss via Escape.
        </p>
        <div className="drawer-page__import-row">
          <code className="drawer-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Side Variants ─────────────────────────────── */}
      <section className="drawer-page__section" id="sides">
        <h2 className="drawer-page__section-title">
          <a href="#sides">Side Variants</a>
        </h2>
        <p className="drawer-page__section-desc">
          The drawer can slide in from the left or right edge. Left is the default for navigation patterns,
          right for detail panels and settings.
        </p>
        <div className="drawer-page__preview">
          <div className="drawer-page__labeled-row">
            <div className="drawer-page__labeled-item">
              <Button variant="primary" onClick={() => setSideLeftOpen(true)}>
                Open Left
              </Button>
              <span className="drawer-page__item-label">left (default)</span>
            </div>
            <div className="drawer-page__labeled-item">
              <Button variant="secondary" onClick={() => setSideRightOpen(true)}>
                Open Right
              </Button>
              <span className="drawer-page__item-label">right</span>
            </div>
          </div>
        </div>
        <DrawerComponent open={sideLeftOpen} onClose={() => setSideLeftOpen(false)} side="left">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>Left Drawer</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This drawer slides in from the left edge. Commonly used for navigation menus.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSideLeftOpen(false)}
            style={{ marginBlockStart: '1.5rem' }}
          >
            Close
          </Button>
        </DrawerComponent>
        <DrawerComponent open={sideRightOpen} onClose={() => setSideRightOpen(false)} side="right">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>Right Drawer</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This drawer slides in from the right edge. Ideal for detail panels and settings.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSideRightOpen(false)}
            style={{ marginBlockStart: '1.5rem' }}
          >
            Close
          </Button>
        </DrawerComponent>
      </section>

      {/* ── 4. Features ──────────────────────────────────── */}
      <section className="drawer-page__section" id="features">
        <h2 className="drawer-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="drawer-page__section-desc">
          Drawer supports custom headers, footers, and overlay click-to-close behavior. Combine these
          for rich slide-out experiences.
        </p>
        <div className="drawer-page__preview">
          <div className="drawer-page__labeled-row">
            <div className="drawer-page__labeled-item">
              <Button variant="primary" onClick={() => setFeatureHeaderOpen(true)}>
                With Header
              </Button>
              <span className="drawer-page__item-label">header</span>
            </div>
            <div className="drawer-page__labeled-item">
              <Button variant="secondary" onClick={() => setFeatureFooterOpen(true)}>
                With Footer
              </Button>
              <span className="drawer-page__item-label">footer</span>
            </div>
            <div className="drawer-page__labeled-item">
              <Button variant="secondary" onClick={() => setFeatureOverlayOpen(true)}>
                No Overlay
              </Button>
              <span className="drawer-page__item-label">overlay={'{false}'}</span>
            </div>
          </div>
        </div>

        {/* With Header drawer */}
        <DrawerComponent open={featureHeaderOpen} onClose={() => setFeatureHeaderOpen(false)} side="right">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBlockEnd: '1.5rem', paddingBlockEnd: '1rem', borderBlockEnd: '1px solid var(--border-subtle)' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeatureHeaderOpen(false)}
              aria-label="Close drawer"
              icon={<Icon name="x" size="sm" />}
            />
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This drawer has a structured header with a title and close button.
          </p>
        </DrawerComponent>

        {/* With Footer drawer */}
        <DrawerComponent open={featureFooterOpen} onClose={() => setFeatureFooterOpen(false)} side="right">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>Confirm Action</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
            This drawer has a footer with action buttons pinned to the bottom.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginBlockStart: '2rem', paddingBlockStart: '1rem', borderBlockStart: '1px solid var(--border-subtle)' }}>
            <Button variant="secondary" size="sm" onClick={() => setFeatureFooterOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setFeatureFooterOpen(false)}>
              Save Changes
            </Button>
          </div>
        </DrawerComponent>

        {/* No overlay drawer */}
        <DrawerComponent open={featureOverlayOpen} onClose={() => setFeatureOverlayOpen(false)} side="right" overlay={false}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 700 }}>No Overlay</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This drawer has no overlay backdrop. The page content behind remains fully interactive.
            Press Escape to close.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFeatureOverlayOpen(false)}
            style={{ marginBlockStart: '1.5rem' }}
          >
            Close
          </Button>
        </DrawerComponent>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="drawer-page__section" id="tiers">
        <h2 className="drawer-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="drawer-page__section-desc">
          Drawer ships in two weight tiers. Lite maps to Standard (no CSS-only variant exists).
          Premium adds spring entrance with overshoot, aurora glow edge, layered shadows, and backdrop particles.
        </p>

        <div className="drawer-page__tiers">
          {/* Lite */}
          <div
            className={`drawer-page__tier-card${tier === 'lite' ? ' drawer-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="drawer-page__tier-header">
              <span className="drawer-page__tier-name">Lite</span>
              <span className="drawer-page__tier-size">= Standard</span>
            </div>
            <p className="drawer-page__tier-desc">
              Maps to Standard. Drawer requires JS for open/close state management,
              so no CSS-only lite variant exists.
            </p>
            <div className="drawer-page__tier-import">
              import {'{'} Drawer {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="drawer-page__size-breakdown">
              <div className="drawer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`drawer-page__tier-card${tier === 'standard' ? ' drawer-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="drawer-page__tier-header">
              <span className="drawer-page__tier-name">Standard</span>
              <span className="drawer-page__tier-size">~2 KB</span>
            </div>
            <p className="drawer-page__tier-desc">
              Full-featured drawer with slide animation, overlay backdrop,
              Escape key dismiss, and four size presets.
            </p>
            <div className="drawer-page__tier-import">
              import {'{'} Drawer {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="drawer-page__size-breakdown">
              <div className="drawer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`drawer-page__tier-card${tier === 'premium' ? ' drawer-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="drawer-page__tier-header">
              <span className="drawer-page__tier-name">Premium</span>
              <span className="drawer-page__tier-size">~4.2 KB</span>
            </div>
            <p className="drawer-page__tier-desc">
              Spring entrance with overshoot per side, aurora glow along the visible edge,
              layered box-shadows, and floating backdrop particles at motion level 3.
            </p>
            <div className="drawer-page__tier-import">
              import {'{'} Drawer {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="drawer-page__size-breakdown">
              <div className="drawer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="drawer-page__section" id="brand-color">
        <h2 className="drawer-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="drawer-page__section-desc">
          Pick a brand color to see the drawer page accents update in real-time. The theme generates
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
          <div className="drawer-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`drawer-page__color-preset${brandColor === p.hex ? ' drawer-page__color-preset--active' : ''}`}
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

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="drawer-page__section" id="props">
        <h2 className="drawer-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="drawer-page__section-desc">
          All props accepted by Drawer. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={drawerProps} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="drawer-page__section" id="accessibility">
        <h2 className="drawer-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="drawer-page__section-desc">
          Built with keyboard navigation and screen reader support in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="drawer-page__a11y-list">
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Closes on <code className="drawer-page__a11y-key">Escape</code> key press.
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Overlay dismiss:</strong> Clicking the overlay backdrop calls <code className="drawer-page__a11y-key">onClose</code> for easy dismissal.
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Overlay hidden:</strong> The overlay is marked with <code className="drawer-page__a11y-key">aria-hidden="true"</code> to avoid confusing screen readers.
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All surfaces and borders meet WCAG AA contrast ratios (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Touch-friendly scrolling with <code className="drawer-page__a11y-key">-webkit-overflow-scrolling: touch</code> on coarse pointer devices.
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="drawer-page__a11y-key">forced-colors: active</code> with visible 2px borders and system colors.
              </span>
            </li>
            <li className="drawer-page__a11y-item">
              <span className="drawer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Drawer renders as static content with no overlay in print stylesheets.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────── */}
      <section className="drawer-page__section" id="source">
        <h2 className="drawer-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="drawer-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/drawer.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/drawer.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/drawer.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/drawer.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
