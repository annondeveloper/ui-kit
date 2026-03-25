'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem } from '@ui/components/sidebar'
import { Sidebar as LiteSidebar, SidebarHeader as LiteSidebarHeader, SidebarContent as LiteSidebarContent, SidebarFooter as LiteSidebarFooter, SidebarItem as LiteSidebarItem } from '@ui/lite/sidebar'
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
    @scope (.sidebar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: sidebar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .sidebar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .sidebar-page__hero::before {
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
        animation: sidebar-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes sidebar-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .sidebar-page__hero::before { animation: none; }
      }

      .sidebar-page__title {
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

      .sidebar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .sidebar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .sidebar-page__import-code {
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

      .sidebar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .sidebar-page__section {
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
        animation: sidebar-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes sidebar-section-reveal {
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
        .sidebar-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .sidebar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .sidebar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .sidebar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .sidebar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .sidebar-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.5rem;
        min-block-size: 80px;
      }

      .sidebar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Sidebar demo container ─────────────────────── */

      .sidebar-page__sidebar-demo {
        block-size: 320px;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
        display: flex;
        position: relative;
      }

      .sidebar-page__sidebar-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        color: var(--text-tertiary);
        font-size: var(--text-sm, 0.875rem);
        min-inline-size: 0;
      }

      /* ── Playground ─────────────────────────────────── */

      .sidebar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .sidebar-page__playground {
          grid-template-columns: 1fr;
        }
        .sidebar-page__playground-controls {
          position: static !important;
        }
      }

      @container sidebar-page (max-width: 680px) {
        .sidebar-page__playground {
          grid-template-columns: 1fr;
        }
        .sidebar-page__playground-controls {
          position: static !important;
        }
      }

      .sidebar-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .sidebar-page__playground-result {
        min-block-size: 360px;
        display: flex;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
        border: 1px solid var(--border-subtle);
      }

      .sidebar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
        z-index: 0;
      }

      .sidebar-page__playground-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
        font-size: var(--text-sm, 0.875rem);
        position: relative;
        z-index: 1;
      }

      .sidebar-page__playground-controls {
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

      .sidebar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .sidebar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .sidebar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .sidebar-page__option-btn {
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
      .sidebar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .sidebar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .sidebar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled items ──────────────────────────────── */

      .sidebar-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .sidebar-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .sidebar-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .sidebar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .sidebar-page__tier-card {
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

      .sidebar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sidebar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .sidebar-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .sidebar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .sidebar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .sidebar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .sidebar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .sidebar-page__tier-import {
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

      .sidebar-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        overflow: hidden;
        border-radius: var(--radius-sm);
        block-size: 160px;
      }

      .sidebar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .sidebar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .sidebar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .sidebar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .sidebar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .sidebar-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .sidebar-page__color-preset {
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
      .sidebar-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .sidebar-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .sidebar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .sidebar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .sidebar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .sidebar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .sidebar-page__import-code,
      .sidebar-page code,
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

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .sidebar-page__hero { padding: 2rem 1.25rem; }
        .sidebar-page__title { font-size: 1.75rem; }
        .sidebar-page__preview { padding: 1rem; }
        .sidebar-page__playground { grid-template-columns: 1fr; }
        .sidebar-page__tiers { grid-template-columns: 1fr; }
        .sidebar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .sidebar-page__hero { padding: 1.5rem 1rem; }
        .sidebar-page__title { font-size: 1.5rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .sidebar-page__title { font-size: 4rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const sidebarProps: PropDef[] = [
  { name: 'collapsed', type: 'boolean', default: 'false', description: 'Whether the sidebar is in collapsed (icon-only) state.' },
  { name: 'onCollapse', type: '(collapsed: boolean) => void', description: 'Callback fired when the collapse toggle is clicked.' },
  { name: 'width', type: 'number | string', default: '240', description: 'Expanded width of the sidebar. Number values are treated as pixels.' },
  { name: 'collapsedWidth', type: 'number | string', default: '64', description: 'Width when collapsed. Number values are treated as pixels.' },
  { name: 'position', type: "'left' | 'right'", default: "'left'", description: 'Which side the sidebar attaches to. Affects border placement.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Sidebar content. Use SidebarHeader, SidebarContent, and SidebarFooter sub-components.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for the collapse/expand transition.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying <aside> element.' },
]

const sidebarItemProps: PropDef[] = [
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element for the item.' },
  { name: 'label', type: 'string', required: true, description: 'Text label for the item. Visually hidden when sidebar is collapsed.' },
  { name: 'active', type: 'boolean', description: 'Highlights the item with brand color background.' },
  { name: 'href', type: 'string', description: 'If provided, renders as an <a> tag instead of <button>.' },
  { name: 'onClick', type: '() => void', description: 'Click handler for the item.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Sidebar, SidebarItem } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Sidebar, SidebarItem } from '@annondeveloper/ui-kit'",
  premium: "import { Sidebar, SidebarItem } from '@annondeveloper/ui-kit'",
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
      className="sidebar-page__copy-btn"
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
    <div className="sidebar-page__control-group">
      <span className="sidebar-page__control-label">{label}</span>
      <div className="sidebar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`sidebar-page__option-btn${opt === value ? ' sidebar-page__option-btn--active' : ''}`}
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
    <label className="sidebar-page__toggle-label">
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

// ─── Demo Sidebar ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: 'home', label: 'Dashboard' },
  { icon: 'file-text', label: 'Documents' },
  { icon: 'users', label: 'Team' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'chart', label: 'Analytics' },
] as const

function DemoSidebar({
  collapsed,
  onCollapse,
  position,
  width,
  collapsedWidth,
  motion,
  activeIndex,
  onActiveChange,
  lite,
}: {
  collapsed: boolean
  onCollapse: (v: boolean) => void
  position: 'left' | 'right'
  width: number
  collapsedWidth: number
  motion: 0 | 1 | 2 | 3
  activeIndex: number
  onActiveChange: (i: number) => void
  lite?: boolean
}) {
  const SidebarComp = lite ? LiteSidebar : Sidebar
  const HeaderComp = lite ? LiteSidebarHeader : SidebarHeader
  const ContentComp = lite ? LiteSidebarContent : SidebarContent
  const FooterComp = lite ? LiteSidebarFooter : SidebarFooter
  const ItemComp = lite ? LiteSidebarItem : SidebarItem

  return (
    <SidebarComp
      collapsed={collapsed}
      onCollapse={onCollapse}
      position={position}
      width={width}
      collapsedWidth={collapsedWidth}
      motion={motion}
    >
      <HeaderComp>
        <span style={{ fontWeight: 700, fontSize: collapsed ? '0.75rem' : '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {collapsed ? 'A' : 'Acme App'}
        </span>
      </HeaderComp>
      <ContentComp>
        {NAV_ITEMS.map((item, i) => (
          <ItemComp
            key={item.label}
            icon={<Icon name={item.icon as any} size="sm" />}
            label={item.label}
            active={i === activeIndex}
            onClick={() => onActiveChange(i)}
          />
        ))}
      </ContentComp>
      <FooterComp>
        <ItemComp
          icon={<Icon name="log-out" size="sm" />}
          label="Logout"
          onClick={() => {}}
        />
      </FooterComp>
    </SidebarComp>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, collapsed: boolean, position: 'left' | 'right', width: number, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (collapsed) props.push('  collapsed={collapsed}')
  else props.push('  collapsed={collapsed}')
  props.push('  onCollapse={setCollapsed}')
  if (position !== 'left') props.push(`  position="${position}"`)
  if (width !== 240) props.push(`  width={${width}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}
import { SidebarHeader, SidebarContent, SidebarFooter } from '@annondeveloper/ui-kit'

const [collapsed, setCollapsed] = useState(false)

<Sidebar
${props.join('\n')}
>
  <SidebarHeader>
    <span style={{ fontWeight: 700 }}>My App</span>
  </SidebarHeader>
  <SidebarContent>
    <SidebarItem icon={<HomeIcon />} label="Dashboard" active />
    <SidebarItem icon={<FileIcon />} label="Documents" />
    <SidebarItem icon={<UsersIcon />} label="Team" />
    <SidebarItem icon={<SettingsIcon />} label="Settings" />
  </SidebarContent>
  <SidebarFooter>
    <SidebarItem icon={<LogOutIcon />} label="Logout" />
  </SidebarFooter>
</Sidebar>`
}

function generateHtmlCode(tier: Tier, collapsed: boolean, position: 'left' | 'right', width: number): string {
  return `<!-- Sidebar -- @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/sidebar.css">

<aside class="ui-sidebar"
  data-collapsed="${collapsed}"
  data-position="${position}"
  style="--sidebar-width: ${width}px; --sidebar-collapsed-width: 64px">
  <button class="ui-sidebar__toggle" aria-label="${collapsed ? 'Expand' : 'Collapse'} sidebar">
    ${collapsed ? '&raquo;' : '&laquo;'}
  </button>
  <div class="ui-sidebar__header">
    <span style="font-weight: 700">My App</span>
  </div>
  <div class="ui-sidebar__content">
    <a class="ui-sidebar__item" data-active="true">
      <span class="ui-sidebar__item-icon">...</span>
      <span class="ui-sidebar__item-label">Dashboard</span>
    </a>
    <a class="ui-sidebar__item">
      <span class="ui-sidebar__item-icon">...</span>
      <span class="ui-sidebar__item-label">Settings</span>
    </a>
  </div>
  <div class="ui-sidebar__footer">
    <button class="ui-sidebar__item">
      <span class="ui-sidebar__item-icon">...</span>
      <span class="ui-sidebar__item-label">Logout</span>
    </button>
  </div>
</aside>`
}

function generateVueCode(tier: Tier, collapsed: boolean, position: 'left' | 'right'): string {
  if (tier === 'lite') {
    return `<template>
  <aside class="ui-sidebar" :data-collapsed="String(collapsed)" data-position="${position}">
    <button class="ui-sidebar__toggle" @click="collapsed = !collapsed">
      {{ collapsed ? '&raquo;' : '&laquo;' }}
    </button>
    <div class="ui-sidebar__content">
      <a class="ui-sidebar__item" data-active="true">
        <span class="ui-sidebar__item-label">Dashboard</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
const collapsed = ref(${collapsed})
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<template>
  <Sidebar v-model:collapsed="collapsed" position="${position}">
    <SidebarContent>
      <SidebarItem label="Dashboard" :active="true" />
      <SidebarItem label="Settings" />
    </SidebarContent>
  </Sidebar>
</template>

<script setup>
import { ref } from 'vue'
import { Sidebar, SidebarContent, SidebarItem } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}'
const collapsed = ref(${collapsed})
</script>`
}

function generateAngularCode(tier: Tier, collapsed: boolean, position: 'left' | 'right'): string {
  return `<!-- Angular -- ${tier} tier -->
<aside class="ui-sidebar"
  [attr.data-collapsed]="collapsed"
  data-position="${position}">
  <button class="ui-sidebar__toggle" (click)="collapsed = !collapsed">
    {{ collapsed ? '&raquo;' : '&laquo;' }}
  </button>
  <div class="ui-sidebar__content">
    <a class="ui-sidebar__item" data-active="true">
      <span class="ui-sidebar__item-label">Dashboard</span>
    </a>
    <a class="ui-sidebar__item">
      <span class="ui-sidebar__item-label">Settings</span>
    </a>
  </div>
</aside>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/sidebar.css';`
}

function generateSvelteCode(tier: Tier, collapsed: boolean, position: 'left' | 'right'): string {
  if (tier === 'lite') {
    return `<script>
  let collapsed = $state(${collapsed});
</script>

<aside class="ui-sidebar" data-collapsed={String(collapsed)} data-position="${position}">
  <button class="ui-sidebar__toggle" onclick={() => collapsed = !collapsed}>
    {collapsed ? '>' : '<'}
  </button>
  <div class="ui-sidebar__content">
    <a class="ui-sidebar__item" data-active="true">
      <span class="ui-sidebar__item-label">Dashboard</span>
    </a>
  </div>
</aside>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<script>
  import { Sidebar, SidebarContent, SidebarItem } from '${tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'}';
  let collapsed = $state(${collapsed});
</script>

<Sidebar bind:collapsed position="${position}">
  <SidebarContent>
    <SidebarItem label="Dashboard" active />
    <SidebarItem label="Settings" />
  </SidebarContent>
</Sidebar>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [collapsed, setCollapsed] = useState(false)
  const [position, setPosition] = useState<'left' | 'right'>('left')
  const [width, setWidth] = useState(240)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeIndex, setActiveIndex] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, collapsed, position, width, motion),
    [tier, collapsed, position, width, motion],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, collapsed, position, width),
    [tier, collapsed, position, width],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, collapsed, position),
    [tier, collapsed, position],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, collapsed, position),
    [tier, collapsed, position],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, collapsed, position),
    [tier, collapsed, position],
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
    <section className="sidebar-page__section" id="playground">
      <h2 className="sidebar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="sidebar-page__section-desc">
        Tweak every prop and see the Sidebar update in real-time. Click the collapse toggle or use the controls.
      </p>

      <div className="sidebar-page__playground">
        <div className="sidebar-page__playground-preview">
          <div className="sidebar-page__playground-result" style={{ flexDirection: position === 'right' ? 'row-reverse' : 'row' }}>
            <DemoSidebar
              collapsed={collapsed}
              onCollapse={setCollapsed}
              position={position}
              width={width}
              collapsedWidth={64}
              motion={motion}
              activeIndex={activeIndex}
              onActiveChange={setActiveIndex}
              lite={tier === 'lite'}
            />
            <div className="sidebar-page__playground-body">
              Main content area
            </div>
          </div>

          <div className="sidebar-page__code-tabs">
            <div className="sidebar-page__export-row">
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
              {copyStatus && <span className="sidebar-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="sidebar-page__playground-controls">
          <div className="sidebar-page__control-group">
            <span className="sidebar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Collapsed" checked={collapsed} onChange={setCollapsed} />
            </div>
          </div>

          <OptionGroup label="Position" options={['left', 'right'] as const} value={position} onChange={setPosition} />

          <div className="sidebar-page__control-group">
            <span className="sidebar-page__control-label">Width</span>
            <div className="sidebar-page__control-options">
              {[180, 200, 240, 280, 320].map(w => (
                <button
                  key={w}
                  type="button"
                  className={`sidebar-page__option-btn${w === width ? ' sidebar-page__option-btn--active' : ''}`}
                  onClick={() => setWidth(w)}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SidebarPage() {
  useStyles('sidebar-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
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

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.sidebar-page__section')
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

  // Demo states for static sections
  const [expandedCollapsed, setExpandedCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  return (
    <div className="sidebar-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero ──────────────────────────────── */}
      <div className="sidebar-page__hero">
        <h1 className="sidebar-page__title">Sidebar</h1>
        <p className="sidebar-page__desc">
          Collapsible navigation sidebar with header, content, and footer slots. Features smooth
          width transitions, icon-only collapsed mode, active item highlighting, and a built-in toggle button.
        </p>
        <div className="sidebar-page__import-row">
          <code className="sidebar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Collapsed vs Expanded ──────────────── */}
      <section className="sidebar-page__section" id="collapsed">
        <h2 className="sidebar-page__section-title">
          <a href="#collapsed">Collapsed vs Expanded</a>
        </h2>
        <p className="sidebar-page__section-desc">
          When collapsed, labels are visually hidden (still accessible to screen readers) and items center their icons.
          The sidebar animates between states at motion level 1+.
        </p>
        <div className="sidebar-page__preview">
          <div className="sidebar-page__labeled-item">
            <div className="sidebar-page__sidebar-demo">
              <DemoSidebar
                collapsed={false}
                onCollapse={() => {}}
                position="left"
                width={220}
                collapsedWidth={64}
                motion={3}
                activeIndex={0}
                onActiveChange={() => {}}
                lite={tier === 'lite'}
              />
              <div className="sidebar-page__sidebar-body">Content</div>
            </div>
            <span className="sidebar-page__item-label">expanded</span>
          </div>
          <div className="sidebar-page__labeled-item">
            <div className="sidebar-page__sidebar-demo">
              <DemoSidebar
                collapsed={true}
                onCollapse={() => {}}
                position="left"
                width={220}
                collapsedWidth={64}
                motion={3}
                activeIndex={0}
                onActiveChange={() => {}}
                lite={tier === 'lite'}
              />
              <div className="sidebar-page__sidebar-body">Content</div>
            </div>
            <span className="sidebar-page__item-label">collapsed</span>
          </div>
        </div>
      </section>

      {/* ── 4. Position ──────────────────────────── */}
      <section className="sidebar-page__section" id="position">
        <h2 className="sidebar-page__section-title">
          <a href="#position">Position</a>
        </h2>
        <p className="sidebar-page__section-desc">
          The sidebar can attach to the left or right side of its container.
          Border placement adjusts automatically based on position.
        </p>
        <div className="sidebar-page__preview">
          <div className="sidebar-page__labeled-item">
            <div className="sidebar-page__sidebar-demo">
              <DemoSidebar
                collapsed={false}
                onCollapse={() => {}}
                position="left"
                width={180}
                collapsedWidth={64}
                motion={3}
                activeIndex={1}
                onActiveChange={() => {}}
                lite={tier === 'lite'}
              />
              <div className="sidebar-page__sidebar-body">Content</div>
            </div>
            <span className="sidebar-page__item-label">position="left"</span>
          </div>
          <div className="sidebar-page__labeled-item">
            <div className="sidebar-page__sidebar-demo" style={{ flexDirection: 'row-reverse' }}>
              <DemoSidebar
                collapsed={rightCollapsed}
                onCollapse={setRightCollapsed}
                position="right"
                width={180}
                collapsedWidth={64}
                motion={3}
                activeIndex={2}
                onActiveChange={() => {}}
                lite={tier === 'lite'}
              />
              <div className="sidebar-page__sidebar-body">Content</div>
            </div>
            <span className="sidebar-page__item-label">position="right"</span>
          </div>
        </div>
      </section>

      {/* ── 5. Motion Levels ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="sidebar-page__section" id="motion">
          <h2 className="sidebar-page__section-title">
            <a href="#motion">Motion Levels</a>
          </h2>
          <p className="sidebar-page__section-desc">
            Control the animation intensity of the collapse transition. Level 0 is instant,
            level 1+ adds a smooth width transition. Click the toggle to see each level in action.
          </p>
          <div className="sidebar-page__preview">
            {([0, 1, 2, 3] as const).map(m => {
              const [c, setC] = useState(false)
              return (
                <div key={m} className="sidebar-page__labeled-item">
                  <div className="sidebar-page__sidebar-demo" style={{ blockSize: 220 }}>
                    <DemoSidebar
                      collapsed={c}
                      onCollapse={setC}
                      position="left"
                      width={160}
                      collapsedWidth={64}
                      motion={m}
                      activeIndex={0}
                      onActiveChange={() => {}}
                    />
                    <div className="sidebar-page__sidebar-body" style={{ fontSize: '0.75rem' }}>
                      Click toggle
                    </div>
                  </div>
                  <span className="sidebar-page__item-label">motion={m}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 6. Sub-components ──────────────────────── */}
      <section className="sidebar-page__section" id="subcomponents">
        <h2 className="sidebar-page__section-title">
          <a href="#subcomponents">Sub-components</a>
        </h2>
        <p className="sidebar-page__section-desc">
          The Sidebar ships with four sub-components for structured composition:
          SidebarHeader, SidebarContent (scrollable), SidebarFooter, and SidebarItem.
        </p>
        <div className="sidebar-page__preview">
          <CopyBlock
            code={`<Sidebar collapsed={collapsed} onCollapse={setCollapsed}>
  <SidebarHeader>
    <Logo />
  </SidebarHeader>
  <SidebarContent>
    <SidebarItem icon={<HomeIcon />} label="Dashboard" active />
    <SidebarItem icon={<FileIcon />} label="Documents" />
    <SidebarItem icon={<UsersIcon />} label="Team" />
  </SidebarContent>
  <SidebarFooter>
    <SidebarItem icon={<LogOutIcon />} label="Logout" />
  </SidebarFooter>
</Sidebar>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ──────────────────────── */}
      <section className="sidebar-page__section" id="tiers">
        <h2 className="sidebar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="sidebar-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier provides
          CSS-only styling while Standard adds motion and the collapse toggle behavior.
        </p>

        <div className="sidebar-page__tiers">
          {/* Lite */}
          <div
            className={`sidebar-page__tier-card${tier === 'lite' ? ' sidebar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="sidebar-page__tier-header">
              <span className="sidebar-page__tier-name">Lite</span>
              <span className="sidebar-page__tier-size">~0.5 KB</span>
            </div>
            <p className="sidebar-page__tier-desc">
              CSS-only sidebar layout. No motion transitions, no useMotionLevel hook.
              Collapse/expand is handled purely via CSS data attributes.
            </p>
            <div className="sidebar-page__tier-import">
              import {'{'} Sidebar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="sidebar-page__tier-preview">
              <LiteSidebar collapsed={false} width={120} collapsedWidth={48}>
                <LiteSidebarContent>
                  <LiteSidebarItem icon={<Icon name="home" size="sm" />} label="Home" active />
                  <LiteSidebarItem icon={<Icon name="settings" size="sm" />} label="Settings" />
                </LiteSidebarContent>
              </LiteSidebar>
            </div>
            <div className="sidebar-page__size-breakdown">
              <div className="sidebar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`sidebar-page__tier-card${tier === 'standard' ? ' sidebar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="sidebar-page__tier-header">
              <span className="sidebar-page__tier-name">Standard</span>
              <span className="sidebar-page__tier-size">~1.8 KB</span>
            </div>
            <p className="sidebar-page__tier-desc">
              Full-featured sidebar with smooth motion transitions, collapse toggle,
              useMotionLevel integration, and all sub-components with proper accessibility.
            </p>
            <div className="sidebar-page__tier-import">
              import {'{'} Sidebar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sidebar-page__tier-preview">
              <Sidebar collapsed={false} width={120} collapsedWidth={48} motion={0}>
                <SidebarContent>
                  <SidebarItem icon={<Icon name="home" size="sm" />} label="Home" active />
                  <SidebarItem icon={<Icon name="settings" size="sm" />} label="Settings" />
                </SidebarContent>
              </Sidebar>
            </div>
            <div className="sidebar-page__size-breakdown">
              <div className="sidebar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`sidebar-page__tier-card${tier === 'premium' ? ' sidebar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="sidebar-page__tier-header">
              <span className="sidebar-page__tier-name">Premium</span>
              <span className="sidebar-page__tier-size">~1.8 KB</span>
            </div>
            <p className="sidebar-page__tier-desc">
              Same as Standard for Sidebar. Premium animations apply to child items
              and interactive elements within the sidebar for enhanced visual feedback.
            </p>
            <div className="sidebar-page__tier-import">
              import {'{'} Sidebar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="sidebar-page__tier-preview">
              <Sidebar collapsed={false} width={120} collapsedWidth={48} motion={0}>
                <SidebarContent>
                  <SidebarItem icon={<Icon name="home" size="sm" />} label="Home" active />
                  <SidebarItem icon={<Icon name="settings" size="sm" />} label="Settings" />
                </SidebarContent>
              </Sidebar>
            </div>
            <div className="sidebar-page__size-breakdown">
              <div className="sidebar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ─────────────────────────── */}
      <section className="sidebar-page__section" id="brand-color">
        <h2 className="sidebar-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="sidebar-page__section-desc">
          Pick a brand color to see the active item highlight and toggle button update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="sidebar-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`sidebar-page__color-preset${brandColor === p.hex ? ' sidebar-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ──────────────────────────── */}
      <section className="sidebar-page__section" id="props">
        <h2 className="sidebar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="sidebar-page__section-desc">
          All props accepted by Sidebar and SidebarItem.
        </p>
        <Card variant="default" padding="md">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Sidebar</h3>
          <PropsTable props={sidebarProps} />
        </Card>
        <Card variant="default" padding="md" style={{ marginBlockStart: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>SidebarItem</h3>
          <PropsTable props={sidebarItemProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────── */}
      <section className="sidebar-page__section" id="accessibility">
        <h2 className="sidebar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="sidebar-page__section-desc">
          Built on the native {'<aside>'} landmark with full keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="sidebar-page__a11y-list">
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Landmark:</strong> Uses <code className="sidebar-page__a11y-key">{'<aside>'}</code> for proper document structure and navigation.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Toggle:</strong> Collapse button has dynamic <code className="sidebar-page__a11y-key">aria-label</code> ("Expand sidebar" / "Collapse sidebar").
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Collapsed labels:</strong> Labels are visually hidden with CSS (not display:none) so screen readers still announce them.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on toggle and items via <code className="sidebar-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Active state:</strong> Active items use <code className="sidebar-page__a11y-key">data-active</code> for styling without relying on color alone.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="sidebar-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Full <code className="sidebar-page__a11y-key">forced-colors: active</code> support with system colors.
              </span>
            </li>
            <li className="sidebar-page__a11y-item">
              <span className="sidebar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic items:</strong> SidebarItem renders as <code className="sidebar-page__a11y-key">{'<a>'}</code> when href is provided, <code className="sidebar-page__a11y-key">{'<button>'}</code> otherwise.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
