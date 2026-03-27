'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CommandBar, type CommandItem } from '@ui/domain/command-bar'
import { CommandBar as LiteCommandBar } from '@ui/lite/command-bar'
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
    @scope (.command-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: command-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .command-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .command-bar-page__hero::before {
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
        animation: command-bar-page-aurora 20s linear infinite;
        pointer-events: none;
      }

      @keyframes command-bar-page-aurora {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .command-bar-page__hero::before { animation: none; }
      }

      .command-bar-page__title {
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

      .command-bar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .command-bar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .command-bar-page__import-code {
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

      .command-bar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .command-bar-page__section {
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
        animation: command-bar-page-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes command-bar-page-reveal {
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
        .command-bar-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .command-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .command-bar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .command-bar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .command-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .command-bar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .command-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .command-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .command-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .command-bar-page__playground-controls {
          position: static !important;
        }
      }

      @container command-bar-page (max-width: 680px) {
        .command-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .command-bar-page__playground-controls {
          position: static !important;
        }
      }

      .command-bar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .command-bar-page__playground-result {
        overflow-x: auto;
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .command-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .command-bar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .command-bar-page__playground-controls {
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

      .command-bar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .command-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .command-bar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .command-bar-page__option-btn {
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
      .command-bar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .command-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .command-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .command-bar-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .command-bar-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .command-bar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .command-bar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .command-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .command-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .command-bar-page__tier-card {
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

      .command-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .command-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .command-bar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .command-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .command-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .command-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .command-bar-page__tier-import {
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

      /* ── Shortcut badge ─────────────────────────────── */

      .command-bar-page__kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.5rem;
        padding-inline: 0.375rem;
        block-size: 1.5rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        background: oklch(100% 0 0 / 0.04);
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        color: var(--text-secondary);
        line-height: 1;
      }

      .command-bar-page__shortcut-row {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .command-bar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .command-bar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .command-bar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .command-bar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .command-bar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .command-bar-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Feature grid ──────────────────────────────── */

      .command-bar-page__features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .command-bar-page__feature-card {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .command-bar-page__feature-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .command-bar-page__feature-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .command-bar-page__hero {
          padding: 2rem 1.25rem;
        }
        .command-bar-page__title {
          font-size: 1.75rem;
        }
        .command-bar-page__preview {
          padding: 1.75rem;
        }
        .command-bar-page__playground {
          grid-template-columns: 1fr;
        }
        .command-bar-page__tiers {
          grid-template-columns: 1fr;
        }
        .command-bar-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .command-bar-page__hero {
          padding: 1.5rem 1rem;
        }
        .command-bar-page__title {
          font-size: 1.5rem;
        }
        .command-bar-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .command-bar-page__title {
          font-size: 4rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .command-bar-page__import-code,
      .command-bar-page code,
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

const commandBarProps: PropDef[] = [
  { name: 'items', type: 'CommandItem[]', required: true, description: 'Array of command items to display in the palette.' },
  { name: 'open', type: 'boolean', required: true, description: 'Controls whether the command bar is visible.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', required: true, description: 'Callback when the open state changes.' },
  { name: 'placeholder', type: 'string', default: "'Type a command...'", description: 'Placeholder text for the search input.' },
  { name: 'emptyMessage', type: 'string', default: "'No results found'", description: 'Message shown when no items match the query.' },
  { name: 'shortcut', type: 'string[]', description: 'Custom keyboard shortcut keys (e.g., ["Meta", "k"]). Defaults to Cmd/Ctrl+K.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

const commandItemProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the command item.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the command.' },
  { name: 'description', type: 'string', description: 'Optional secondary description shown below the label.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element.' },
  { name: 'shortcut', type: 'string[]', description: 'Keyboard shortcut keys displayed as badges (e.g., ["Cmd", "S"]).' },
  { name: 'section', type: 'string', description: 'Section group name for organizing items.' },
  { name: 'onSelect', type: '() => void', required: true, description: 'Callback when the item is selected.' },
  { name: 'disabled', type: 'boolean', description: 'Prevents selection of this item.' },
  { name: 'keywords', type: 'string[]', description: 'Additional keywords for fuzzy search matching.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CommandBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CommandBar } from '@annondeveloper/ui-kit'",
  premium: "import { CommandBar } from '@annondeveloper/ui-kit/premium'",
}

const DEMO_ITEMS: CommandItem[] = [
  { id: 'new-file', label: 'New File', description: 'Create a new file', icon: <Icon name="file" size={16} />, shortcut: ['Cmd', 'N'], section: 'File', onSelect: () => {}, keywords: ['create'] },
  { id: 'open-file', label: 'Open File', description: 'Open an existing file', icon: <Icon name="folder" size={16} />, shortcut: ['Cmd', 'O'], section: 'File', onSelect: () => {} },
  { id: 'save', label: 'Save', description: 'Save current file', icon: <Icon name="download" size={16} />, shortcut: ['Cmd', 'S'], section: 'File', onSelect: () => {} },
  { id: 'search', label: 'Search in Files', description: 'Full-text search across project', icon: <Icon name="search" size={16} />, shortcut: ['Cmd', 'Shift', 'F'], section: 'Edit', onSelect: () => {}, keywords: ['find', 'grep'] },
  { id: 'replace', label: 'Find and Replace', icon: <Icon name="edit" size={16} />, shortcut: ['Cmd', 'H'], section: 'Edit', onSelect: () => {} },
  { id: 'theme', label: 'Toggle Theme', description: 'Switch between light and dark mode', icon: <Icon name="eye" size={16} />, section: 'View', onSelect: () => {} },
  { id: 'terminal', label: 'Toggle Terminal', icon: <Icon name="terminal" size={16} />, shortcut: ['Ctrl', '`'], section: 'View', onSelect: () => {} },
  { id: 'settings', label: 'Open Settings', icon: <Icon name="settings" size={16} />, shortcut: ['Cmd', ','], section: 'Preferences', onSelect: () => {} },
  { id: 'extensions', label: 'Extensions', description: 'Manage extensions', icon: <Icon name="code" size={16} />, section: 'Preferences', onSelect: () => {}, disabled: true },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="command-bar-page__copy-btn"
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
    <div className="command-bar-page__control-group">
      <span className="command-bar-page__control-label">{label}</span>
      <div className="command-bar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`command-bar-page__option-btn${opt === value ? ' command-bar-page__option-btn--active' : ''}`}
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
    <label className="command-bar-page__toggle-label">
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
  placeholder: string,
  emptyMessage: string,
  motion: number,
  showSections: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}\n\nconst items = [\n  { id: 'search', label: 'Search Files', shortcut: ['Cmd', 'F'] },\n  { id: 'save', label: 'Save', onSelect: () => saveFile() },\n]\n\n<CommandBar\n  open={open}\n  onClose={() => setOpen(false)}\n  items={items}\n  placeholder="${placeholder}"\n/>`
  }

  const props: string[] = ['  items={items}', '  open={open}', '  onOpenChange={setOpen}']
  if (placeholder !== 'Type a command...') props.push(`  placeholder="${placeholder}"`)
  if (emptyMessage !== 'No results found') props.push(`  emptyMessage="${emptyMessage}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  const itemsCode = showSections
    ? `const items: CommandItem[] = [\n  {\n    id: 'new-file',\n    label: 'New File',\n    description: 'Create a new file',\n    icon: <FileIcon />,\n    shortcut: ['Cmd', 'N'],\n    section: 'File',\n    onSelect: () => createFile(),\n  },\n  {\n    id: 'search',\n    label: 'Search',\n    icon: <SearchIcon />,\n    shortcut: ['Cmd', 'F'],\n    section: 'Edit',\n    onSelect: () => openSearch(),\n  },\n]`
    : `const items: CommandItem[] = [\n  { id: 'save', label: 'Save', onSelect: () => save() },\n  { id: 'open', label: 'Open', onSelect: () => open() },\n]`

  return `${importStr}\nimport type { CommandItem } from '@annondeveloper/ui-kit'\n\n${itemsCode}\n\n<CommandBar\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<!-- CommandBar — Lite tier -->\n<dialog class="ui-lite-command-bar">\n  <input type="search" placeholder="${placeholder}" autofocus />\n  <ul role="listbox">\n    <li role="option">\n      <span>New File</span>\n      <kbd>Cmd+N</kbd>\n    </li>\n    <li role="option">\n      <span>Save</span>\n      <kbd>Cmd+S</kbd>\n    </li>\n  </ul>\n</dialog>`
  }
  return `<!-- CommandBar — uses <dialog> with modal backdrop -->\n<div class="ui-command-bar">\n  <dialog>\n    <div class="ui-command-bar__search">\n      <span class="ui-command-bar__search-icon"><!-- search svg --></span>\n      <input class="ui-command-bar__input" type="text"\n        role="combobox" aria-expanded="true"\n        placeholder="${placeholder}" />\n    </div>\n    <div class="ui-command-bar__list" role="listbox">\n      <div class="ui-command-bar__section-header">File</div>\n      <div class="ui-command-bar__item" role="option">\n        <span class="ui-command-bar__item-label">New File</span>\n        <span class="ui-command-bar__shortcut">\n          <kbd class="ui-command-bar__kbd">Cmd</kbd>\n          <kbd class="ui-command-bar__kbd">N</kbd>\n        </span>\n      </div>\n    </div>\n  </dialog>\n</div>`
}

function generateVueCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<template>\n  <CommandBar\n    :open="open"\n    @close="open = false"\n    :items="items"\n    placeholder="${placeholder}"\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { CommandBar } from '@annondeveloper/ui-kit/lite'\n\nconst open = ref(false)\nconst items = [\n  { id: 'save', label: 'Save', onSelect: () => {} },\n]\n</script>`
  }
  return `<template>\n  <CommandBar\n    :items="items"\n    :open="open"\n    @openChange="open = $event"\n    placeholder="${placeholder}"\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { CommandBar } from '@annondeveloper/ui-kit'\n\nconst open = ref(false)\nconst items = [\n  { id: 'save', label: 'Save', onSelect: () => {} },\n]\n</script>`
}

function generateAngularCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->\n<dialog class="ui-lite-command-bar" #dialog>\n  <input type="search" placeholder="${placeholder}" />\n  <ul role="listbox">\n    <li *ngFor="let item of items" role="option"\n      (click)="item.onSelect?.()">\n      {{ item.label }}\n    </li>\n  </ul>\n</dialog>\n\n/* styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — use CSS class approach -->\n<div class="ui-command-bar">\n  <dialog #commandDialog>\n    <div class="ui-command-bar__search">\n      <input class="ui-command-bar__input"\n        type="text" role="combobox"\n        placeholder="${placeholder}" />\n    </div>\n    <div class="ui-command-bar__list" role="listbox">\n      <div *ngFor="let item of items"\n        class="ui-command-bar__item" role="option"\n        (click)="selectItem(item)">\n        {{ item.label }}\n      </div>\n    </div>\n  </dialog>\n</div>\n\n@import '@annondeveloper/ui-kit/css/components/command-bar.css';`
}

function generateSvelteCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<script>\n  import { CommandBar } from '@annondeveloper/ui-kit/lite';\n  let open = false;\n  const items = [\n    { id: 'save', label: 'Save', onSelect: () => {} },\n  ];\n</script>\n\n<CommandBar\n  {open}\n  onClose={() => open = false}\n  {items}\n  placeholder="${placeholder}"\n/>`
  }
  return `<script>\n  import { CommandBar } from '@annondeveloper/ui-kit';\n  let open = false;\n  const items = [\n    { id: 'save', label: 'Save', onSelect: () => {} },\n  ];\n</script>\n\n<CommandBar\n  {items}\n  {open}\n  onOpenChange={(v) => open = v}\n  placeholder="${placeholder}"\n/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [open, setOpen] = useState(false)
  const [placeholder, setPlaceholder] = useState('Type a command...')
  const [emptyMessage, setEmptyMessage] = useState('No results found')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [showSections, setShowSections] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [lastAction, setLastAction] = useState('')

  const demoItems: CommandItem[] = useMemo(() =>
    DEMO_ITEMS.map(item => ({
      ...item,
      onSelect: () => setLastAction(`Selected: ${item.label}`),
    })),
  [])

  const liteItems = useMemo(() =>
    DEMO_ITEMS.slice(0, 5).map(item => ({
      id: item.id,
      label: item.label,
      description: item.description,
      shortcut: item.shortcut,
      onSelect: () => setLastAction(`Selected: ${item.label}`),
    })),
  [])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const reactCode = useMemo(() => generateReactCode(tier, placeholder, emptyMessage, motion, showSections), [tier, placeholder, emptyMessage, motion, showSections])
  const htmlCode = useMemo(() => generateHtmlCode(tier, placeholder), [tier, placeholder])
  const vueCode = useMemo(() => generateVueCode(tier, placeholder), [tier, placeholder])
  const angularCode = useMemo(() => generateAngularCode(tier, placeholder), [tier, placeholder])
  const svelteCode = useMemo(() => generateSvelteCode(tier, placeholder), [tier, placeholder])

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
    <section className="command-bar-page__section" id="playground">
      <h2 className="command-bar-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="command-bar-page__section-desc">
        Open the command bar, search, and navigate items with the keyboard. Press <kbd className="command-bar-page__kbd">Cmd</kbd>+<kbd className="command-bar-page__kbd">K</kbd> or click the button below.
      </p>

      <div className="command-bar-page__playground">
        <div className="command-bar-page__playground-preview">
          <div className="command-bar-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <Button
                variant="secondary"
                icon={<Icon name="search" size="sm" />}
                onClick={() => setOpen(true)}
              >
                Open Command Bar
              </Button>
              <div className="command-bar-page__shortcut-row">
                <kbd className="command-bar-page__kbd">Cmd</kbd>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>+</span>
                <kbd className="command-bar-page__kbd">K</kbd>
              </div>
              {lastAction && (
                <div style={{ fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 500 }}>{lastAction}</div>
              )}
            </div>
          </div>

          {tier === 'lite' ? (
            <LiteCommandBar
              open={open}
              onClose={() => setOpen(false)}
              items={liteItems}
              placeholder={placeholder}
            />
          ) : (
            <CommandBar
              items={demoItems}
              open={open}
              onOpenChange={setOpen}
              placeholder={placeholder}
              emptyMessage={emptyMessage}
              motion={motion}
            />
          )}

          <div className="command-bar-page__code-tabs">
            <div className="command-bar-page__export-row">
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
              {copyStatus && <span className="command-bar-page__export-status">{copyStatus}</span>}
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

        <div className="command-bar-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="command-bar-page__control-group">
            <span className="command-bar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Show sections" checked={showSections} onChange={setShowSections} />}
            </div>
          </div>

          <div className="command-bar-page__control-group">
            <span className="command-bar-page__control-label">Placeholder</span>
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              className="command-bar-page__text-input"
            />
          </div>

          {tier !== 'lite' && (
            <div className="command-bar-page__control-group">
              <span className="command-bar-page__control-label">Empty Message</span>
              <input
                type="text"
                value={emptyMessage}
                onChange={e => setEmptyMessage(e.target.value)}
                className="command-bar-page__text-input"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CommandBarPage() {
  useStyles('command-bar-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.command-bar-page__section')
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
    <div className="command-bar-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="command-bar-page__hero">
        <h1 className="command-bar-page__title">CommandBar</h1>
        <p className="command-bar-page__desc">
          A keyboard-first command palette with fuzzy search, sections, keyboard navigation,
          and shortcut badges. Built on the native dialog element with modal backdrop.
        </p>
        <div className="command-bar-page__import-row">
          <code className="command-bar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Features ─────────────────────────────────── */}
      <section className="command-bar-page__section" id="features">
        <h2 className="command-bar-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="command-bar-page__section-desc">
          CommandBar ships with a comprehensive feature set for building professional command palettes.
        </p>
        <div className="command-bar-page__features">
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Fuzzy Search</div>
            <div className="command-bar-page__feature-desc">
              Character-by-character fuzzy matching against label, description, and keywords.
            </div>
          </div>
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Sections</div>
            <div className="command-bar-page__feature-desc">
              Group items by section with automatic header rendering and visual separation.
            </div>
          </div>
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Recent Items</div>
            <div className="command-bar-page__feature-desc">
              Automatically tracks recently selected items and surfaces them at the top.
            </div>
          </div>
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Keyboard Navigation</div>
            <div className="command-bar-page__feature-desc">
              Full arrow key navigation with Home, End, Enter to select, Escape to close.
            </div>
          </div>
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Shortcut Badges</div>
            <div className="command-bar-page__feature-desc">
              Display keyboard shortcut hints as styled kbd elements next to each item.
            </div>
          </div>
          <div className="command-bar-page__feature-card">
            <div className="command-bar-page__feature-title">Global Shortcut</div>
            <div className="command-bar-page__feature-desc">
              Opens with Cmd/Ctrl+K by default. Customize with the shortcut prop.
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Keyboard Navigation ──────────────────────── */}
      <section className="command-bar-page__section" id="keyboard">
        <h2 className="command-bar-page__section-title">
          <a href="#keyboard">Keyboard Navigation</a>
        </h2>
        <p className="command-bar-page__section-desc">
          Full keyboard control following the ARIA combobox pattern. All navigation happens
          without a mouse.
        </p>
        <div className="command-bar-page__preview" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
            <div className="command-bar-page__shortcut-row">
              <kbd className="command-bar-page__kbd">Cmd</kbd>
              <span style={{ color: 'var(--text-tertiary)' }}>+</span>
              <kbd className="command-bar-page__kbd">K</kbd>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>Toggle command bar open/close</span>

            <div className="command-bar-page__shortcut-row">
              <kbd className="command-bar-page__kbd" style={{ minInlineSize: '1.25rem' }}>&darr;</kbd>
              <kbd className="command-bar-page__kbd" style={{ minInlineSize: '1.25rem' }}>&uarr;</kbd>
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>Navigate between items</span>

            <kbd className="command-bar-page__kbd">Home</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>Jump to first item</span>

            <kbd className="command-bar-page__kbd">End</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>Jump to last item</span>

            <kbd className="command-bar-page__kbd">Enter</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>Select the active item</span>

            <kbd className="command-bar-page__kbd">Escape</kbd>
            <span style={{ color: 'var(--text-secondary)' }}>Close the command bar</span>
          </div>
        </div>
      </section>

      {/* ── 5. Sections & Grouping ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="command-bar-page__section" id="sections">
          <h2 className="command-bar-page__section-title">
            <a href="#sections">Sections & Grouping</a>
          </h2>
          <p className="command-bar-page__section-desc">
            Add a <code className="command-bar-page__a11y-key">section</code> property to items to automatically group them
            with section headers. Items without a section appear ungrouped.
          </p>
          <CopyBlock
            code={`const items: CommandItem[] = [\n  { id: 'new', label: 'New File', section: 'File', onSelect: () => {} },\n  { id: 'open', label: 'Open', section: 'File', onSelect: () => {} },\n  { id: 'search', label: 'Search', section: 'Edit', onSelect: () => {} },\n  { id: 'replace', label: 'Replace', section: 'Edit', onSelect: () => {} },\n  { id: 'theme', label: 'Toggle Theme', section: 'View', onSelect: () => {} },\n]`}
            language="typescript"
            showLineNumbers
          />
        </section>
      )}

      {/* ── 6. Custom Shortcut ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="command-bar-page__section" id="custom-shortcut">
          <h2 className="command-bar-page__section-title">
            <a href="#custom-shortcut">Custom Shortcut</a>
          </h2>
          <p className="command-bar-page__section-desc">
            Override the default Cmd+K shortcut with a custom key combination.
          </p>
          <CopyBlock
            code={`<CommandBar\n  items={items}\n  open={open}\n  onOpenChange={setOpen}\n  shortcut={['Ctrl', 'Shift', 'p']} // Custom shortcut\n/>`}
            language="typescript"
            showLineNumbers
          />
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="command-bar-page__section" id="tiers">
        <h2 className="command-bar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="command-bar-page__section-desc">
          Choose the right tier for your needs. CommandBar ships in two tiers
          Premium adds aurora glow effects and spring animations.
        </p>

        <div className="command-bar-page__tiers">
          {/* Lite */}
          <div
            className={`command-bar-page__tier-card${tier === 'lite' ? ' command-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="command-bar-page__tier-header">
              <span className="command-bar-page__tier-name">Lite</span>
              <span className="command-bar-page__tier-size">~0.5 KB</span>
            </div>
            <p className="command-bar-page__tier-desc">
              Basic dialog with search input and list rendering.
              No fuzzy search, no sections, no keyboard navigation, no recent items.
            </p>
            <div className="command-bar-page__tier-import">
              import {'{'} CommandBar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="command-bar-page__size-breakdown">
              <div className="command-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`command-bar-page__tier-card${tier === 'standard' ? ' command-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="command-bar-page__tier-header">
              <span className="command-bar-page__tier-name">Standard</span>
              <span className="command-bar-page__tier-size">~3.5 KB</span>
            </div>
            <p className="command-bar-page__tier-desc">
              Full-featured command palette with fuzzy search, sections, keyboard navigation,
              recent items, motion, ARIA combobox pattern, and shortcut badges.
            </p>
            <div className="command-bar-page__tier-import">
              import {'{'} CommandBar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="command-bar-page__size-breakdown">
              <div className="command-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`command-bar-page__tier-card${tier === 'premium' ? ' command-bar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="command-bar-page__tier-header">
              <span className="command-bar-page__tier-name">Premium</span>
              <span className="command-bar-page__tier-size">~3-5 KB</span>
            </div>
            <p className="command-bar-page__tier-desc">
              Glass morphism container, aurora glow on active item, spring entrance animation, and hover glow.
            </p>
            <div className="command-bar-page__tier-import">
              import {'{'} CommandBar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="command-bar-page__size-breakdown">
              <div className="command-bar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CommandItem Interface ────────────────────── */}
      <section className="command-bar-page__section" id="command-item">
        <h2 className="command-bar-page__section-title">
          <a href="#command-item">CommandItem Interface</a>
        </h2>
        <p className="command-bar-page__section-desc">
          Each item in the commands array follows this interface. Only id, label, and onSelect are required.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={commandItemProps} />
        </Card>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="command-bar-page__section" id="props">
        <h2 className="command-bar-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="command-bar-page__section-desc">
          All props accepted by CommandBar. It also spreads native div attributes onto the root wrapper.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={commandBarProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="command-bar-page__section" id="accessibility">
        <h2 className="command-bar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="command-bar-page__section-desc">
          CommandBar follows the ARIA combobox pattern with listbox for keyboard-navigable results.
        </p>
        <Card variant="default" padding="md">
          <ul className="command-bar-page__a11y-list">
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dialog:</strong> Uses native <code className="command-bar-page__a11y-key">&lt;dialog&gt;</code> element
                with <code className="command-bar-page__a11y-key">showModal()</code> for proper focus trapping and backdrop.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Combobox:</strong> Input has <code className="command-bar-page__a11y-key">role="combobox"</code>,
                <code className="command-bar-page__a11y-key">aria-expanded</code>,
                <code className="command-bar-page__a11y-key">aria-activedescendant</code>, and
                <code className="command-bar-page__a11y-key">aria-controls</code>.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Listbox:</strong> Results container has <code className="command-bar-page__a11y-key">role="listbox"</code> with each item as
                <code className="command-bar-page__a11y-key">role="option"</code>.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Arrow keys navigate, Enter selects, Escape closes. Home/End for first/last.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled items:</strong> Marked with <code className="command-bar-page__a11y-key">aria-disabled="true"</code> and skipped during keyboard navigation.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced colors:</strong> Supports <code className="command-bar-page__a11y-key">forced-colors: active</code> with visible borders on dialog and active items.
              </span>
            </li>
            <li className="command-bar-page__a11y-item">
              <span className="command-bar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Items expand to 44px minimum on coarse pointer devices.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
