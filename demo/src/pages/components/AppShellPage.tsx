'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { AppShell } from '@ui/components/app-shell'
import { AppShell as LiteAppShell } from '@ui/lite/app-shell'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.app-shell-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: app-shell-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .app-shell-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .app-shell-page__hero::before {
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
        animation: app-shell-page-aurora 20s linear infinite;
        pointer-events: none;
      }

      @keyframes app-shell-page-aurora {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .app-shell-page__hero::before { animation: none; }
      }

      .app-shell-page__title {
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

      .app-shell-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .app-shell-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .app-shell-page__import-code {
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

      .app-shell-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .app-shell-page__section {
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
        animation: app-shell-page-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes app-shell-page-reveal {
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
        .app-shell-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .app-shell-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .app-shell-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .app-shell-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .app-shell-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .app-shell-page__preview {
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .app-shell-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .app-shell-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .app-shell-page__playground {
          grid-template-columns: 1fr;
        }
        .app-shell-page__playground-controls {
          position: static !important;
        }
      }

      @container app-shell-page (max-width: 680px) {
        .app-shell-page__playground {
          grid-template-columns: 1fr;
        }
        .app-shell-page__playground-controls {
          position: static !important;
        }
      }

      .app-shell-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .app-shell-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 0;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .app-shell-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .app-shell-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .app-shell-page__playground-controls {
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

      .app-shell-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .app-shell-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .app-shell-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .app-shell-page__option-btn {
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
      .app-shell-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .app-shell-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .app-shell-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .app-shell-page__code-tabs {
        margin-block-start: 1rem;
      }

      .app-shell-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .app-shell-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .app-shell-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .app-shell-page__tier-card {
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

      .app-shell-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .app-shell-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .app-shell-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .app-shell-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .app-shell-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .app-shell-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .app-shell-page__tier-import {
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

      .app-shell-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Mini shell preview ─────────────────────────── */

      .app-shell-page__mini-shell {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
        min-block-size: 200px;
        position: relative;
        font-size: 0.6875rem;
      }

      .app-shell-page__mini-navbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-elevated);
        border-block-end: 1px solid var(--border-subtle);
        font-weight: 600;
        color: var(--text-primary);
      }

      .app-shell-page__mini-body {
        display: flex;
        min-block-size: 160px;
      }

      .app-shell-page__mini-sidebar {
        inline-size: 120px;
        flex-shrink: 0;
        background: var(--bg-surface);
        border-inline-end: 1px solid var(--border-subtle);
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .app-shell-page__mini-sidebar-item {
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: 0.625rem;
      }

      .app-shell-page__mini-sidebar-item--active {
        background: var(--brand-subtle);
        color: var(--brand);
        font-weight: 600;
      }

      .app-shell-page__mini-main {
        flex: 1;
        padding: 0.75rem;
        color: var(--text-secondary);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .app-shell-page__mini-footer {
        padding: 0.375rem 0.75rem;
        background: var(--bg-elevated);
        border-block-start: 1px solid var(--border-subtle);
        font-size: 0.5625rem;
        color: var(--text-tertiary);
        text-align: center;
      }

      /* ── A11y list ──────────────────────────────────── */

      .app-shell-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .app-shell-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .app-shell-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .app-shell-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Labeled row ────────────────────────────────── */

      .app-shell-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .app-shell-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .app-shell-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .app-shell-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .app-shell-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .app-shell-page__hero {
          padding: 2rem 1.25rem;
        }
        .app-shell-page__title {
          font-size: 1.75rem;
        }
        .app-shell-page__playground {
          grid-template-columns: 1fr;
        }
        .app-shell-page__tiers {
          grid-template-columns: 1fr;
        }
        .app-shell-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .app-shell-page__hero {
          padding: 1.5rem 1rem;
        }
        .app-shell-page__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .app-shell-page__title {
          font-size: 4rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .app-shell-page__import-code,
      .app-shell-page code,
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
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const appShellProps: PropDef[] = [
  { name: 'navbar', type: 'ReactNode', description: 'Navbar content rendered at the top, spanning full width.' },
  { name: 'sidebar', type: 'ReactNode', description: 'Sidebar content rendered alongside main area.' },
  { name: 'footer', type: 'ReactNode', description: 'Footer content rendered at the bottom, spanning full width.' },
  { name: 'sidebarCollapsed', type: 'boolean', default: 'false', description: 'Controls whether the sidebar is in collapsed state.' },
  { name: 'sidebarPosition', type: "'left' | 'right'", default: "'left'", description: 'Which side the sidebar renders on.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Main content area.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SidebarPos = 'left' | 'right'

const SIDEBAR_POSITIONS: SidebarPos[] = ['left', 'right']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { AppShell } from '@annondeveloper/ui-kit/lite'",
  standard: "import { AppShell } from '@annondeveloper/ui-kit'",
  premium: "import { AppShell } from '@annondeveloper/ui-kit'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="app-shell-page__copy-btn"
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
    <div className="app-shell-page__control-group">
      <span className="app-shell-page__control-label">{label}</span>
      <div className="app-shell-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`app-shell-page__option-btn${opt === value ? ' app-shell-page__option-btn--active' : ''}`}
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
    <label className="app-shell-page__toggle-label">
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

// ─── Mini Shell Preview ───────────────────────────────────────────────────────

function MiniShellPreview({
  showNavbar,
  showSidebar,
  showFooter,
  sidebarPosition,
}: {
  showNavbar: boolean
  showSidebar: boolean
  showFooter: boolean
  sidebarPosition: SidebarPos
}) {
  const sidebarContent = (
    <div className="app-shell-page__mini-sidebar">
      <div className="app-shell-page__mini-sidebar-item app-shell-page__mini-sidebar-item--active">Dashboard</div>
      <div className="app-shell-page__mini-sidebar-item">Analytics</div>
      <div className="app-shell-page__mini-sidebar-item">Settings</div>
      <div className="app-shell-page__mini-sidebar-item">Users</div>
    </div>
  )

  return (
    <div className="app-shell-page__mini-shell">
      {showNavbar && (
        <div className="app-shell-page__mini-navbar">
          <Icon name="zap" size={12} />
          <span>My Application</span>
        </div>
      )}
      <div className="app-shell-page__mini-body" style={{ flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row' }}>
        {showSidebar && sidebarContent}
        <div className="app-shell-page__mini-main">
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Main Content Area</div>
          <div style={{ fontSize: '0.625rem' }}>This is where your page content goes. The layout adapts to the slots you populate.</div>
          <div style={{ display: 'flex', gap: '0.375rem', marginBlockStart: '0.25rem' }}>
            <div style={{ padding: '0.375rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.5625rem' }}>Card 1</div>
            <div style={{ padding: '0.375rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.5625rem' }}>Card 2</div>
            <div style={{ padding: '0.375rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.5625rem' }}>Card 3</div>
          </div>
        </div>
      </div>
      {showFooter && (
        <div className="app-shell-page__mini-footer">
          &copy; 2026 My Application &mdash; All rights reserved
        </div>
      )}
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  showNavbar: boolean,
  showSidebar: boolean,
  showFooter: boolean,
  sidebarPosition: SidebarPos,
  sidebarCollapsed: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (showNavbar) props.push('  navbar={<MyNavbar />}')
  if (showSidebar) props.push('  sidebar={<MySidebar />}')
  if (showFooter) props.push('  footer={<MyFooter />}')
  if (sidebarPosition !== 'left') props.push(`  sidebarPosition="${sidebarPosition}"`)
  if (sidebarCollapsed) props.push('  sidebarCollapsed')

  const jsx = props.length === 0
    ? `<AppShell>\n  <main>Your content here</main>\n</AppShell>`
    : `<AppShell\n${props.join('\n')}\n>\n  <main>Your content here</main>\n</AppShell>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  tier: Tier,
  showNavbar: boolean,
  showSidebar: boolean,
  showFooter: boolean,
  sidebarPosition: SidebarPos,
): string {
  const className = tier === 'lite' ? 'ui-lite-app-shell' : 'ui-app-shell'
  const posAttr = sidebarPosition !== 'left' ? ` data-sidebar-position="${sidebarPosition}"` : ''
  const hasSidebar = showSidebar ? ' data-has-sidebar="true"' : ''

  let html = `<!-- AppShell layout -->\n<div class="${className}"${posAttr}${hasSidebar}>\n`
  if (showNavbar) html += `  <div class="${className}__navbar">\n    <nav>Your navbar content</nav>\n  </div>\n`
  if (showSidebar) html += `  <div class="${className}__sidebar">\n    <aside>Sidebar navigation</aside>\n  </div>\n`
  html += `  <div class="${className}__main">\n    <main>Main content area</main>\n  </div>\n`
  if (showFooter) html += `  <div class="${className}__footer">\n    <footer>Footer content</footer>\n  </div>\n`
  html += `</div>`

  return html
}

function generateVueCode(
  tier: Tier,
  showNavbar: boolean,
  showSidebar: boolean,
  showFooter: boolean,
  sidebarPosition: SidebarPos,
): string {
  if (tier === 'lite') {
    return generateHtmlCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition) + `\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const props: string[] = []
  if (showNavbar) props.push('    <template #navbar><nav>Navbar</nav></template>')
  if (showSidebar) props.push('    <template #sidebar><aside>Sidebar</aside></template>')
  if (showFooter) props.push('    <template #footer><footer>Footer</footer></template>')
  if (sidebarPosition !== 'left') props.push(`    sidebar-position="${sidebarPosition}"`)

  return `<template>\n  <AppShell${sidebarPosition !== 'left' ? ` sidebar-position="${sidebarPosition}"` : ''}>\n${props.join('\n')}\n    <main>Content</main>\n  </AppShell>\n</template>\n\n<script setup>\nimport { AppShell } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  showNavbar: boolean,
  showSidebar: boolean,
  showFooter: boolean,
  sidebarPosition: SidebarPos,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n${generateHtmlCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition)}\n\n/* styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — use CSS class approach -->\n${generateHtmlCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition)}\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/app-shell.css';`
}

function generateSvelteCode(
  tier: Tier,
  showNavbar: boolean,
  showSidebar: boolean,
  showFooter: boolean,
  sidebarPosition: SidebarPos,
): string {
  if (tier === 'lite') {
    return `${generateHtmlCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition)}\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  const props: string[] = []
  if (showNavbar) props.push('  navbar={MyNavbar}')
  if (showSidebar) props.push('  sidebar={MySidebar}')
  if (showFooter) props.push('  footer={MyFooter}')
  if (sidebarPosition !== 'left') props.push(`  sidebarPosition="${sidebarPosition}"`)

  return `<script>\n  import { AppShell } from '${importPath}';\n</script>\n\n<AppShell\n${props.join('\n')}\n>\n  <main>Content</main>\n</AppShell>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [showNavbar, setShowNavbar] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showFooter, setShowFooter] = useState(true)
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPos>('left')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const reactCode = useMemo(
    () => generateReactCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition, sidebarCollapsed),
    [tier, showNavbar, showSidebar, showFooter, sidebarPosition, sidebarCollapsed],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition),
    [tier, showNavbar, showSidebar, showFooter, sidebarPosition],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition),
    [tier, showNavbar, showSidebar, showFooter, sidebarPosition],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition),
    [tier, showNavbar, showSidebar, showFooter, sidebarPosition],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, showNavbar, showSidebar, showFooter, sidebarPosition),
    [tier, showNavbar, showSidebar, showFooter, sidebarPosition],
  )

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
    <section className="app-shell-page__section" id="playground">
      <h2 className="app-shell-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="app-shell-page__section-desc">
        Toggle layout slots and configure sidebar position to see how AppShell adapts. Generated code updates live.
      </p>

      <div className="app-shell-page__playground">
        <div className="app-shell-page__playground-preview">
          <div className="app-shell-page__playground-result">
            <div style={{ inlineSize: '100%', position: 'relative', zIndex: 1 }}>
              <MiniShellPreview
                showNavbar={showNavbar}
                showSidebar={showSidebar && !sidebarCollapsed}
                showFooter={showFooter}
                sidebarPosition={sidebarPosition}
              />
            </div>
          </div>

          <div className="app-shell-page__code-tabs">
            <div className="app-shell-page__export-row">
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
              {copyStatus && <span className="app-shell-page__export-status">{copyStatus}</span>}
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

        <div className="app-shell-page__playground-controls">
          <OptionGroup
            label="Sidebar Position"
            options={SIDEBAR_POSITIONS}
            value={sidebarPosition}
            onChange={setSidebarPosition}
          />

          <div className="app-shell-page__control-group">
            <span className="app-shell-page__control-label">Slots</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show Navbar" checked={showNavbar} onChange={setShowNavbar} />
              <Toggle label="Show Sidebar" checked={showSidebar} onChange={setShowSidebar} />
              <Toggle label="Show Footer" checked={showFooter} onChange={setShowFooter} />
              {tier !== 'lite' && (
                <Toggle label="Sidebar Collapsed" checked={sidebarCollapsed} onChange={setSidebarCollapsed} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppShellPage() {
  useStyles('app-shell-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.app-shell-page__section')
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
    <div className="app-shell-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="app-shell-page__hero">
        <h1 className="app-shell-page__title">AppShell</h1>
        <p className="app-shell-page__desc">
          Foundational layout component with navbar, sidebar, main content area, and footer slots.
          Uses CSS Grid for a responsive, slot-based layout that adapts from mobile to ultra-wide.
        </p>
        <div className="app-shell-page__import-row">
          <code className="app-shell-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Layout Slots ────────────────────────────── */}
      <section className="app-shell-page__section" id="layout-slots">
        <h2 className="app-shell-page__section-title">
          <a href="#layout-slots">Layout Slots</a>
        </h2>
        <p className="app-shell-page__section-desc">
          AppShell uses four named slots. All are optional — the grid automatically adjusts
          based on which slots you provide.
        </p>
        <div className="app-shell-page__preview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <MiniShellPreview showNavbar showSidebar showFooter sidebarPosition="left" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>All slots</p>
            </div>
            <div>
              <MiniShellPreview showNavbar showSidebar={false} showFooter={false} sidebarPosition="left" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>Navbar only</p>
            </div>
            <div>
              <MiniShellPreview showNavbar={false} showSidebar showFooter={false} sidebarPosition="left" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>Sidebar only</p>
            </div>
            <div>
              <MiniShellPreview showNavbar={false} showSidebar={false} showFooter={false} sidebarPosition="left" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>Content only</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Sidebar Position ─────────────────────────── */}
      <section className="app-shell-page__section" id="sidebar-position">
        <h2 className="app-shell-page__section-title">
          <a href="#sidebar-position">Sidebar Position</a>
        </h2>
        <p className="app-shell-page__section-desc">
          The sidebar can be placed on the left (default) or right side. The CSS Grid layout
          adapts column order automatically via data attributes.
        </p>
        <div className="app-shell-page__preview">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <MiniShellPreview showNavbar showSidebar showFooter sidebarPosition="left" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>sidebarPosition="left"</p>
            </div>
            <div>
              <MiniShellPreview showNavbar showSidebar showFooter sidebarPosition="right" />
              <p className="app-shell-page__item-label" style={{ textAlign: 'center', marginBlockStart: '0.5rem' }}>sidebarPosition="right"</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Responsive Behavior ──────────────────────── */}
      <section className="app-shell-page__section" id="responsive">
        <h2 className="app-shell-page__section-title">
          <a href="#responsive">Responsive Behavior</a>
        </h2>
        <p className="app-shell-page__section-desc">
          On screens below 768px, the sidebar automatically hides and the main content spans the full width.
          This uses both <code className="app-shell-page__a11y-key">@container</code> queries and
          a <code className="app-shell-page__a11y-key">@media</code> fallback for broad browser support.
        </p>
        <div className="app-shell-page__preview">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ inlineSize: '420px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBlockEnd: '0.375rem' }}>Desktop (sidebar visible)</div>
              <MiniShellPreview showNavbar showSidebar showFooter sidebarPosition="left" />
            </div>
            <div style={{ inlineSize: '200px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textAlign: 'center', marginBlockEnd: '0.375rem' }}>Mobile (sidebar hidden)</div>
              <MiniShellPreview showNavbar showSidebar={false} showFooter sidebarPosition="left" />
            </div>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`/* Responsive behavior — built in */\n@container (max-width: 768px) {\n  .ui-app-shell { grid-template-columns: 1fr !important; }\n  .ui-app-shell__sidebar { display: none; }\n}\n\n/* Media query fallback */\n@media (max-width: 768px) {\n  .ui-app-shell { grid-template-columns: 1fr !important; }\n  .ui-app-shell__sidebar { display: none; }\n}`}
            language="css"
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 6. Real Component Demo ─────────────────────── */}
      <section className="app-shell-page__section" id="real-demo">
        <h2 className="app-shell-page__section-title">
          <a href="#real-demo">Real Component</a>
        </h2>
        <p className="app-shell-page__section-desc">
          A live instance of the actual AppShell component rendered in a constrained container.
          This uses the {tier === 'lite' ? 'Lite' : 'Standard'} tier component.
        </p>
        <div className="app-shell-page__preview" style={{ padding: 0, overflow: 'hidden' }}>
          {tier === 'lite' ? (
            <LiteAppShell
              navbar={
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', borderBlockEnd: '1px solid var(--border-subtle)' }}>
                  <Icon name="zap" size={14} />
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Lite Shell</span>
                </nav>
              }
              sidebar={
                <aside style={{ inlineSize: '100px', padding: '0.5rem', background: 'var(--bg-surface)', borderInlineEnd: '1px solid var(--border-subtle)', fontSize: '0.6875rem' }}>
                  <div style={{ padding: '0.25rem 0.5rem', background: 'var(--brand-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--brand)', fontWeight: 600, marginBlockEnd: '0.25rem' }}>Home</div>
                  <div style={{ padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}>About</div>
                </aside>
              }
              footer={
                <footer style={{ padding: '0.375rem 0.75rem', background: 'var(--bg-elevated)', borderBlockStart: '1px solid var(--border-subtle)', fontSize: '0.5625rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  Lite tier footer
                </footer>
              }
              style={{ minBlockSize: '200px' }}
            >
              <div style={{ padding: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 600, marginBlockEnd: '0.5rem', color: 'var(--text-primary)' }}>Main Content</div>
                <div style={{ color: 'var(--text-secondary)' }}>Lite tier: minimal CSS-only layout, no JS interactivity.</div>
              </div>
            </LiteAppShell>
          ) : (
            <AppShell
              navbar={
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)', borderBlockEnd: '1px solid var(--border-subtle)' }}>
                  <Icon name="zap" size={14} />
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Standard Shell</span>
                </nav>
              }
              sidebar={
                <aside style={{ inlineSize: '120px', padding: '0.5rem', background: 'var(--bg-surface)', borderInlineEnd: '1px solid var(--border-subtle)', fontSize: '0.6875rem' }}>
                  <div style={{ padding: '0.25rem 0.5rem', background: 'var(--brand-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--brand)', fontWeight: 600, marginBlockEnd: '0.25rem' }}>Dashboard</div>
                  <div style={{ padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}>Analytics</div>
                  <div style={{ padding: '0.25rem 0.5rem', color: 'var(--text-secondary)' }}>Settings</div>
                </aside>
              }
              footer={
                <footer style={{ padding: '0.375rem 0.75rem', background: 'var(--bg-elevated)', borderBlockStart: '1px solid var(--border-subtle)', fontSize: '0.5625rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  Standard tier footer &mdash; grid layout with container queries
                </footer>
              }
              sidebarPosition="left"
              style={{ minBlockSize: '220px' }}
            >
              <div style={{ padding: '1rem', fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: 600, marginBlockEnd: '0.5rem', color: 'var(--text-primary)' }}>Main Content</div>
                <div style={{ color: 'var(--text-secondary)', marginBlockEnd: '0.75rem' }}>
                  Standard tier: CSS Grid layout, data attributes, container queries, responsive collapse.
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Card variant="default" padding="sm" style={{ flex: '1 1 120px', fontSize: '0.6875rem' }}>
                    <div style={{ fontWeight: 600 }}>Users</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>1,234</div>
                  </Card>
                  <Card variant="default" padding="sm" style={{ flex: '1 1 120px', fontSize: '0.6875rem' }}>
                    <div style={{ fontWeight: 600 }}>Revenue</div>
                    <div style={{ color: 'var(--text-tertiary)' }}>$42.5K</div>
                  </Card>
                </div>
              </div>
            </AppShell>
          )}
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="app-shell-page__section" id="tiers">
        <h2 className="app-shell-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="app-shell-page__section-desc">
          Choose the right balance of features and bundle size. AppShell ships in two tiers
          (no premium variant &mdash; premium maps to standard).
        </p>

        <div className="app-shell-page__tiers">
          {/* Lite */}
          <div
            className={`app-shell-page__tier-card${tier === 'lite' ? ' app-shell-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="app-shell-page__tier-header">
              <span className="app-shell-page__tier-name">Lite</span>
              <span className="app-shell-page__tier-size">~0.2 KB</span>
            </div>
            <p className="app-shell-page__tier-desc">
              CSS-only layout. Minimal forwardRef wrapper, no data attributes for sidebar state.
              Just navbar, sidebar, main, footer slots.
            </p>
            <div className="app-shell-page__tier-import">
              import {'{'} AppShell {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="app-shell-page__size-breakdown">
              <div className="app-shell-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`app-shell-page__tier-card${tier === 'standard' ? ' app-shell-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="app-shell-page__tier-header">
              <span className="app-shell-page__tier-name">Standard</span>
              <span className="app-shell-page__tier-size">~1.2 KB</span>
            </div>
            <p className="app-shell-page__tier-desc">
              Full-featured CSS Grid layout with sidebarPosition, sidebarCollapsed data attributes,
              container queries, responsive collapse, print and forced-colors support.
            </p>
            <div className="app-shell-page__tier-import">
              import {'{'} AppShell {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="app-shell-page__size-breakdown">
              <div className="app-shell-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium (maps to standard) */}
          <div
            className={`app-shell-page__tier-card${tier === 'premium' ? ' app-shell-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="app-shell-page__tier-header">
              <span className="app-shell-page__tier-name">Premium</span>
              <span className="app-shell-page__tier-size">= Standard</span>
            </div>
            <p className="app-shell-page__tier-desc">
              No separate premium tier for AppShell. The standard version includes all layout
              features. Premium maps directly to Standard.
            </p>
            <div className="app-shell-page__tier-import">
              import {'{'} AppShell {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="app-shell-page__size-breakdown">
              <div className="app-shell-page__size-row">
                <span style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>Same as Standard tier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CSS Grid Details ─────────────────────────── */}
      <section className="app-shell-page__section" id="grid-details">
        <h2 className="app-shell-page__section-title">
          <a href="#grid-details">CSS Grid Layout</a>
        </h2>
        <p className="app-shell-page__section-desc">
          AppShell uses a CSS Grid with <code className="app-shell-page__a11y-key">grid-template-rows: auto 1fr auto</code> and
          <code className="app-shell-page__a11y-key">grid-template-columns: auto 1fr</code>.
          The navbar and footer span full width while sidebar and main share the middle row.
        </p>
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`.ui-app-shell {\n  display: grid;\n  grid-template-rows: auto 1fr auto;\n  grid-template-columns: auto 1fr;\n  min-block-size: 100dvh;\n}\n\n/* Navbar: spans full width */\n.ui-app-shell__navbar { grid-column: 1 / -1; grid-row: 1; }\n\n/* Sidebar: left or right column */\n.ui-app-shell__sidebar { grid-row: 2; }\n\n/* Main: remaining space */\n.ui-app-shell__main { grid-row: 2; min-inline-size: 0; }\n\n/* Footer: spans full width */\n.ui-app-shell__footer { grid-column: 1 / -1; grid-row: 3; }`}
            language="css"
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="app-shell-page__section" id="props">
        <h2 className="app-shell-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="app-shell-page__section-desc">
          All props accepted by AppShell. It also spreads any native div HTML attributes
          onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={appShellProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="app-shell-page__section" id="accessibility">
        <h2 className="app-shell-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="app-shell-page__section-desc">
          AppShell uses semantic HTML landmark structure for assistive technologies.
        </p>
        <Card variant="default" padding="md">
          <ul className="app-shell-page__a11y-list">
            <li className="app-shell-page__a11y-item">
              <span className="app-shell-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Landmarks:</strong> Main content renders inside the layout grid. You control semantic elements
                (<code className="app-shell-page__a11y-key">&lt;nav&gt;</code>, <code className="app-shell-page__a11y-key">&lt;aside&gt;</code>,
                <code className="app-shell-page__a11y-key">&lt;main&gt;</code>, <code className="app-shell-page__a11y-key">&lt;footer&gt;</code>) through slot content.
              </span>
            </li>
            <li className="app-shell-page__a11y-item">
              <span className="app-shell-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Responsive:</strong> Sidebar hides on mobile. Ensure critical navigation is also accessible from the navbar or a mobile drawer.
              </span>
            </li>
            <li className="app-shell-page__a11y-item">
              <span className="app-shell-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced colors:</strong> Supports <code className="app-shell-page__a11y-key">forced-colors: active</code> with Canvas and CanvasText system colors.
              </span>
            </li>
            <li className="app-shell-page__a11y-item">
              <span className="app-shell-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Sidebar hides in print view. Main content expands to full width for clean output.
              </span>
            </li>
            <li className="app-shell-page__a11y-item">
              <span className="app-shell-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Min-height:</strong> Uses <code className="app-shell-page__a11y-key">100dvh</code> to ensure the shell fills the viewport on mobile with dynamic toolbars.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
