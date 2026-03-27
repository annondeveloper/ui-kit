'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DropdownMenu, type MenuItem } from '@ui/components/dropdown-menu'
import { DropdownMenu as LiteDropdownMenu } from '@ui/lite/dropdown-menu'
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
    @scope (.dropdown-menu-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: dropdown-menu-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .dropdown-menu-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .dropdown-menu-page__hero::before {
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
        animation: dropdown-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dropdown-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dropdown-menu-page__hero::before { animation: none; }
      }

      .dropdown-menu-page__title {
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

      .dropdown-menu-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .dropdown-menu-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dropdown-menu-page__import-code {
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

      .dropdown-menu-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .dropdown-menu-page__section {
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
        animation: dropdown-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dropdown-section-reveal {
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
        .dropdown-menu-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .dropdown-menu-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .dropdown-menu-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .dropdown-menu-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .dropdown-menu-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .dropdown-menu-page__preview {
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

      .dropdown-menu-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .dropdown-menu-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .dropdown-menu-page__playground {
          grid-template-columns: 1fr;
        }
        .dropdown-menu-page__playground-controls {
          position: static !important;
        }
      }

      @container dropdown-menu-page (max-width: 680px) {
        .dropdown-menu-page__playground {
          grid-template-columns: 1fr;
        }
        .dropdown-menu-page__playground-controls {
          position: static !important;
        }
      }

      .dropdown-menu-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dropdown-menu-page__playground-result {
        min-block-size: 300px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;
      }

      .dropdown-menu-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .dropdown-menu-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .dropdown-menu-page__playground-controls {
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

      .dropdown-menu-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dropdown-menu-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dropdown-menu-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .dropdown-menu-page__option-btn {
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
      .dropdown-menu-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .dropdown-menu-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .dropdown-menu-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled items ──────────────────────────────── */

      .dropdown-menu-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .dropdown-menu-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .dropdown-menu-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .dropdown-menu-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .dropdown-menu-page__tier-card {
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

      .dropdown-menu-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .dropdown-menu-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .dropdown-menu-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dropdown-menu-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .dropdown-menu-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .dropdown-menu-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .dropdown-menu-page__tier-import {
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

      .dropdown-menu-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .dropdown-menu-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .dropdown-menu-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .dropdown-menu-page__code-tabs {
        margin-block-start: 1rem;
      }

      .dropdown-menu-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .dropdown-menu-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .dropdown-menu-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .dropdown-menu-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .dropdown-menu-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .dropdown-menu-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .dropdown-menu-page__hero {
          padding: 2rem 1.25rem;
        }

        .dropdown-menu-page__title {
          font-size: 1.75rem;
        }

        .dropdown-menu-page__preview {
          padding: 1.75rem;
        }

        .dropdown-menu-page__playground {
          grid-template-columns: 1fr;
        }

        .dropdown-menu-page__playground-result {
          padding: 2rem;
          min-block-size: 300px;
        }

        .dropdown-menu-page__tiers {
          grid-template-columns: 1fr;
        }

        .dropdown-menu-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .dropdown-menu-page__hero {
          padding: 1.5rem 1rem;
        }

        .dropdown-menu-page__title {
          font-size: 1.5rem;
        }

        .dropdown-menu-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .dropdown-menu-page__title {
          font-size: 4rem;
        }

        .dropdown-menu-page__preview {
          padding: 3.5rem;
        }
      }

      .dropdown-menu-page__import-code,
      .dropdown-menu-page code,
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

const menuItemProps: PropDef[] = [
  { name: 'type', type: "'item' | 'separator' | 'label'", default: "'item'", description: 'The type of menu entry — action item, visual separator, or group label.' },
  { name: 'label', type: 'ReactNode', description: 'The text or node to display for items and group labels.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon element rendered before the label text.' },
  { name: 'shortcut', type: 'string', description: 'Keyboard shortcut hint displayed on the right side of the item.' },
  { name: 'disabled', type: 'boolean', description: 'When true, the item appears dimmed and cannot be clicked.' },
  { name: 'danger', type: 'boolean', description: 'When true, the item is styled with a danger/destructive color.' },
  { name: 'onClick', type: '() => void', description: 'Click handler for the menu item. The menu closes automatically after click.' },
]

const dropdownMenuProps: PropDef[] = [
  { name: 'items', type: 'MenuItem[]', required: true, description: 'Array of menu items to render (items, separators, labels).' },
  { name: 'children', type: 'ReactElement', required: true, description: 'The trigger element that opens the dropdown menu on click.' },
  { name: 'placement', type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'", default: "'bottom-start'", description: 'Preferred placement of the dropdown relative to the trigger.' },
  { name: 'open', type: 'boolean', description: 'Controlled open state. Use with onOpenChange.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback fired when the menu opens or closes.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

const PLACEMENTS: Placement[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DropdownMenu } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DropdownMenu } from '@annondeveloper/ui-kit'",
  premium: "import { DropdownMenu } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="dropdown-menu-page__copy-btn"
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
    <div className="dropdown-menu-page__control-group">
      <span className="dropdown-menu-page__control-label">{label}</span>
      <div className="dropdown-menu-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`dropdown-menu-page__option-btn${opt === value ? ' dropdown-menu-page__option-btn--active' : ''}`}
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
    <label className="dropdown-menu-page__toggle-label">
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

// ─── Demo Items ───────────────────────────────────────────────────────────────

function createDemoItems(showIcons: boolean, showDisabled: boolean, showSeparator: boolean, showDanger: boolean): MenuItem[] {
  const items: MenuItem[] = []

  items.push({ type: 'label', label: 'Actions' })
  items.push({
    label: 'Edit',
    icon: showIcons ? <Icon name="edit" size="sm" /> : undefined,
    shortcut: 'Ctrl+E',
    onClick: () => {},
  })
  items.push({
    label: 'Duplicate',
    icon: showIcons ? <Icon name="copy" size="sm" /> : undefined,
    shortcut: 'Ctrl+D',
    onClick: () => {},
  })
  items.push({
    label: 'Share',
    icon: showIcons ? <Icon name="link" size="sm" /> : undefined,
    onClick: () => {},
  })

  if (showDisabled) {
    items.push({
      label: 'Archive',
      icon: showIcons ? <Icon name="archive" size="sm" /> : undefined,
      disabled: true,
      onClick: () => {},
    })
  }

  if (showSeparator) {
    items.push({ type: 'separator' })
  }

  if (showDanger) {
    items.push({
      label: 'Delete',
      icon: showIcons ? <Icon name="trash" size="sm" /> : undefined,
      danger: true,
      shortcut: 'Del',
      onClick: () => {},
    })
  }

  return items
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  placement: Placement,
  showIcons: boolean,
  showDisabled: boolean,
  showSeparator: boolean,
  showDanger: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}

<DropdownMenu
  trigger={<button>Actions</button>}
  items={[
    { id: 'edit', label: 'Edit', onClick: handleEdit },
    { id: 'duplicate', label: 'Duplicate', onClick: handleDuplicate },
    { id: 'share', label: 'Share', onClick: handleShare },${showDisabled ? "\n    { id: 'archive', label: 'Archive', disabled: true }," : ''}${showDanger ? "\n    { id: 'delete', label: 'Delete', onClick: handleDelete }," : ''}
  ]}
/>`
  }

  const itemLines: string[] = []
  itemLines.push("  { type: 'label', label: 'Actions' },")
  itemLines.push(`  { label: 'Edit', ${showIcons ? "icon: <Icon name=\"edit\" size=\"sm\" />, " : ''}shortcut: 'Ctrl+E', onClick: handleEdit },`)
  itemLines.push(`  { label: 'Duplicate', ${showIcons ? "icon: <Icon name=\"copy\" size=\"sm\" />, " : ''}shortcut: 'Ctrl+D', onClick: handleDuplicate },`)
  itemLines.push(`  { label: 'Share', ${showIcons ? "icon: <Icon name=\"link\" size=\"sm\" />, " : ''}onClick: handleShare },`)
  if (showDisabled) {
    itemLines.push(`  { label: 'Archive', ${showIcons ? "icon: <Icon name=\"archive\" size=\"sm\" />, " : ''}disabled: true },`)
  }
  if (showSeparator) {
    itemLines.push("  { type: 'separator' },")
  }
  if (showDanger) {
    itemLines.push(`  { label: 'Delete', ${showIcons ? "icon: <Icon name=\"trash\" size=\"sm\" />, " : ''}danger: true, shortcut: 'Del', onClick: handleDelete },`)
  }

  const props: string[] = []
  props.push(`  items={[\n  ${itemLines.join('\n  ')}\n  ]}`)
  if (placement !== 'bottom-start') props.push(`  placement="${placement}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}${showIcons ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''}

<DropdownMenu
${props.join('\n')}
>
  <Button>Actions</Button>
</DropdownMenu>`
}

function generateHtmlCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- DropdownMenu — Lite tier (details/summary) -->
<div class="ui-lite-dropdown-menu">
  <details>
    <summary>Actions</summary>
    <ul class="ui-lite-dropdown-menu__list" role="menu">
      <li role="menuitem"><button>Edit</button></li>
      <li role="menuitem"><button>Duplicate</button></li>
      <li role="menuitem"><button>Share</button></li>
    </ul>
  </details>
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<!-- DropdownMenu — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/dropdown-menu.css">

<div class="ui-dropdown-menu" data-placement="${placement}">
  <div class="ui-dropdown-menu__panel" role="menu">
    <div class="ui-dropdown-menu__group-label">Actions</div>
    <button class="ui-dropdown-menu__item" role="menuitem">
      <span class="ui-dropdown-menu__icon"><!-- icon --></span>
      <span class="ui-dropdown-menu__label-text">Edit</span>
      <span class="ui-dropdown-menu__shortcut">Ctrl+E</span>
    </button>
    <div class="ui-dropdown-menu__separator" role="separator"></div>
    <button class="ui-dropdown-menu__item" role="menuitem" data-danger="true">
      <span class="ui-dropdown-menu__label-text">Delete</span>
    </button>
  </div>
</div>`
}

function generateVueCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<template>
  <DropdownMenu
    :trigger="triggerSlot"
    :items="menuItems"
  />
</template>

<script setup>
import { DropdownMenu } from '@annondeveloper/ui-kit/lite'

const menuItems = [
  { id: 'edit', label: 'Edit', onClick: () => handleEdit() },
  { id: 'dup', label: 'Duplicate', onClick: () => handleDuplicate() },
]
</script>`
  }

  return `<template>
  <DropdownMenu
    :items="menuItems"
    placement="${placement}"
  >
    <Button>Actions</Button>
  </DropdownMenu>
</template>

<script setup>
import { DropdownMenu } from '@annondeveloper/ui-kit'
import { Button } from '@annondeveloper/ui-kit'

const menuItems = [
  { type: 'label', label: 'Actions' },
  { label: 'Edit', shortcut: 'Ctrl+E', onClick: () => {} },
  { type: 'separator' },
  { label: 'Delete', danger: true, onClick: () => {} },
]
</script>`
}

function generateAngularCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<div class="ui-lite-dropdown-menu">
  <details>
    <summary>Actions</summary>
    <ul class="ui-lite-dropdown-menu__list" role="menu">
      <li role="menuitem"><button (click)="handleEdit()">Edit</button></li>
      <li role="menuitem"><button (click)="handleDuplicate()">Duplicate</button></li>
    </ul>
  </details>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier (CSS-only approach) -->
<div
  class="ui-dropdown-menu"
  data-placement="${placement}"
>
  <div class="ui-dropdown-menu__panel" role="menu">
    <div class="ui-dropdown-menu__group-label">Actions</div>
    <button
      class="ui-dropdown-menu__item"
      role="menuitem"
      (click)="handleEdit()"
    >
      <span class="ui-dropdown-menu__label-text">Edit</span>
      <span class="ui-dropdown-menu__shortcut">Ctrl+E</span>
    </button>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/dropdown-menu.css';`
}

function generateSvelteCode(tier: Tier, placement: Placement): string {
  if (tier === 'lite') {
    return `<script>
  import { DropdownMenu } from '@annondeveloper/ui-kit/lite';

  const items = [
    { id: 'edit', label: 'Edit', onClick: () => handleEdit() },
    { id: 'dup', label: 'Duplicate', onClick: () => handleDuplicate() },
  ];
</script>

<DropdownMenu trigger="Actions" {items} />`
  }

  return `<script>
  import { DropdownMenu } from '@annondeveloper/ui-kit';
  import { Button } from '@annondeveloper/ui-kit';

  const items = [
    { type: 'label', label: 'Actions' },
    { label: 'Edit', shortcut: 'Ctrl+E', onClick: () => {} },
    { type: 'separator' },
    { label: 'Delete', danger: true, onClick: () => {} },
  ];
</script>

<DropdownMenu {items} placement="${placement}">
  <Button>Actions</Button>
</DropdownMenu>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [placement, setPlacement] = useState<Placement>('bottom-start')
  const [showIcons, setShowIcons] = useState(true)
  const [showDisabled, setShowDisabled] = useState(true)
  const [showSeparator, setShowSeparator] = useState(true)
  const [showDanger, setShowDanger] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const items = useMemo(
    () => createDemoItems(showIcons, showDisabled, showSeparator, showDanger),
    [showIcons, showDisabled, showSeparator, showDanger],
  )

  const liteItems = useMemo(() => [
    { id: 'edit', label: 'Edit' as React.ReactNode, onClick: () => {} },
    { id: 'duplicate', label: 'Duplicate' as React.ReactNode, onClick: () => {} },
    { id: 'share', label: 'Share' as React.ReactNode, onClick: () => {} },
    ...(showDisabled ? [{ id: 'archive', label: 'Archive' as React.ReactNode, disabled: true }] : []),
    ...(showDanger ? [{ id: 'delete', label: 'Delete' as React.ReactNode, onClick: () => {} }] : []),
  ], [showDisabled, showDanger])

  const reactCode = useMemo(
    () => generateReactCode(tier, placement, showIcons, showDisabled, showSeparator, showDanger, motion),
    [tier, placement, showIcons, showDisabled, showSeparator, showDanger, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, placement),
    [tier, placement],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, placement),
    [tier, placement],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, placement),
    [tier, placement],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, placement),
    [tier, placement],
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
    <section className="dropdown-menu-page__section" id="playground">
      <h2 className="dropdown-menu-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="dropdown-menu-page__section-desc">
        Configure items, icons, placement, separators, and danger actions. Click the trigger to see the menu.
      </p>

      <div className="dropdown-menu-page__playground">
        <div className="dropdown-menu-page__playground-preview">
          <div className="dropdown-menu-page__playground-result">
            {tier === 'lite' ? (
              <LiteDropdownMenu
                trigger={<Button variant="secondary">Actions</Button>}
                items={liteItems}
              />
            ) : (
              <DropdownMenu
                items={items}
                placement={placement}
                motion={motion}
              >
                <Button>Actions</Button>
              </DropdownMenu>
            )}
          </div>

          <div className="dropdown-menu-page__code-tabs">
            <div className="dropdown-menu-page__export-row">
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
              {copyStatus && <span className="dropdown-menu-page__export-status">{copyStatus}</span>}
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

        <div className="dropdown-menu-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Placement" options={PLACEMENTS} value={placement} onChange={setPlacement} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="dropdown-menu-page__control-group">
            <span className="dropdown-menu-page__control-label">Item Features</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Show icons" checked={showIcons} onChange={setShowIcons} />}
              <Toggle label="Disabled item" checked={showDisabled} onChange={setShowDisabled} />
              {tier !== 'lite' && <Toggle label="Separator" checked={showSeparator} onChange={setShowSeparator} />}
              <Toggle label="Danger item" checked={showDanger} onChange={setShowDanger} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DropdownMenuPage() {
  useStyles('dropdown-menu-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.dropdown-menu-page__section')
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
    <div className="dropdown-menu-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="dropdown-menu-page__hero">
        <h1 className="dropdown-menu-page__title">DropdownMenu</h1>
        <p className="dropdown-menu-page__desc">
          Contextual action menu triggered by click, with icons, shortcuts, separators,
          danger actions, keyboard navigation, and roving tabindex. Ships in two weight tiers.
        </p>
        <div className="dropdown-menu-page__import-row">
          <code className="dropdown-menu-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Placement Options ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="dropdown-menu-page__section" id="placements">
          <h2 className="dropdown-menu-page__section-title">
            <a href="#placements">Placement Options</a>
          </h2>
          <p className="dropdown-menu-page__section-desc">
            Four placement options control where the menu appears relative to the trigger.
            The menu auto-positions based on available viewport space.
          </p>
          <div className="dropdown-menu-page__preview" style={{ gap: '2rem', minBlockSize: '160px' }}>
            <div className="dropdown-menu-page__labeled-row" style={{ gap: '2rem' }}>
              {PLACEMENTS.map(p => (
                <div key={p} className="dropdown-menu-page__labeled-item">
                  <DropdownMenu
                    placement={p}
                    items={[
                      { label: 'Edit', onClick: () => {} },
                      { label: 'Duplicate', onClick: () => {} },
                      { type: 'separator' },
                      { label: 'Delete', danger: true, onClick: () => {} },
                    ]}
                  >
                    <Button variant="secondary" size="sm">{p}</Button>
                  </DropdownMenu>
                  <span className="dropdown-menu-page__item-label">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Icons and Shortcuts ─────────────────────── */}
      {tier !== 'lite' && (
        <section className="dropdown-menu-page__section" id="icons">
          <h2 className="dropdown-menu-page__section-title">
            <a href="#icons">Icons and Shortcuts</a>
          </h2>
          <p className="dropdown-menu-page__section-desc">
            Menu items support leading icons and right-aligned keyboard shortcut hints.
            Icons help users quickly identify actions at a glance.
          </p>
          <div className="dropdown-menu-page__preview" style={{ minBlockSize: '140px' }}>
            <DropdownMenu
              items={[
                { label: 'Cut', icon: <Icon name="scissors" size="sm" />, shortcut: 'Ctrl+X', onClick: () => {} },
                { label: 'Copy', icon: <Icon name="copy" size="sm" />, shortcut: 'Ctrl+C', onClick: () => {} },
                { label: 'Paste', icon: <Icon name="clipboard" size="sm" />, shortcut: 'Ctrl+V', onClick: () => {} },
                { type: 'separator' },
                { label: 'Select All', shortcut: 'Ctrl+A', onClick: () => {} },
              ]}
            >
              <Button>Edit Menu</Button>
            </DropdownMenu>
          </div>
        </section>
      )}

      {/* ── 5. Separators and Labels ───────────────────── */}
      {tier !== 'lite' && (
        <section className="dropdown-menu-page__section" id="separators">
          <h2 className="dropdown-menu-page__section-title">
            <a href="#separators">Separators and Group Labels</a>
          </h2>
          <p className="dropdown-menu-page__section-desc">
            Use separators to visually divide groups of related actions.
            Group labels provide context for sections within the menu.
          </p>
          <div className="dropdown-menu-page__preview" style={{ minBlockSize: '140px' }}>
            <DropdownMenu
              items={[
                { type: 'label', label: 'File' },
                { label: 'New', icon: <Icon name="plus" size="sm" />, onClick: () => {} },
                { label: 'Open', icon: <Icon name="folder" size="sm" />, onClick: () => {} },
                { label: 'Save', icon: <Icon name="download" size="sm" />, onClick: () => {} },
                { type: 'separator' },
                { type: 'label', label: 'Danger Zone' },
                { label: 'Delete Project', danger: true, icon: <Icon name="trash" size="sm" />, onClick: () => {} },
              ]}
            >
              <Button variant="secondary">File Menu</Button>
            </DropdownMenu>
          </div>
        </section>
      )}

      {/* ── 6. Disabled and Danger Items ───────────────── */}
      <section className="dropdown-menu-page__section" id="states">
        <h2 className="dropdown-menu-page__section-title">
          <a href="#states">Item States</a>
        </h2>
        <p className="dropdown-menu-page__section-desc">
          Items can be disabled (greyed out, not clickable) or marked as danger (red destructive styling).
          Disabled items are skipped during keyboard navigation.
        </p>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const items = [
  { label: 'Edit', onClick: handleEdit },
  { label: 'Archive', disabled: true },  // Greyed out
  { type: 'separator' },
  { label: 'Delete', danger: true, onClick: handleDelete },  // Red styling
]`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="dropdown-menu-page__section" id="tiers">
        <h2 className="dropdown-menu-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="dropdown-menu-page__section-desc">
          Lite uses native {'<details>'}/{'<summary>'} for zero-JS menus. Standard adds
          anchor positioning, keyboard navigation, icons, shortcuts, and animation.
        </p>

        <div className="dropdown-menu-page__tiers">
          {/* Lite */}
          <div
            className={`dropdown-menu-page__tier-card${tier === 'lite' ? ' dropdown-menu-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="dropdown-menu-page__tier-header">
              <span className="dropdown-menu-page__tier-name">Lite</span>
              <span className="dropdown-menu-page__tier-size">~0.3 KB</span>
            </div>
            <p className="dropdown-menu-page__tier-desc">
              Uses native details/summary for disclosure. No icons, shortcuts,
              separators, or keyboard navigation.
            </p>
            <div className="dropdown-menu-page__tier-import">
              import {'{'} DropdownMenu {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="dropdown-menu-page__tier-preview">
              <Button variant="secondary" size="sm">Lite Menu</Button>
            </div>
            <div className="dropdown-menu-page__size-breakdown">
              <div className="dropdown-menu-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`dropdown-menu-page__tier-card${tier === 'standard' ? ' dropdown-menu-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="dropdown-menu-page__tier-header">
              <span className="dropdown-menu-page__tier-name">Standard</span>
              <span className="dropdown-menu-page__tier-size">~3 KB</span>
            </div>
            <p className="dropdown-menu-page__tier-desc">
              Full-featured dropdown with anchor positioning, roving tabindex,
              icons, shortcuts, separators, danger items, and motion.
            </p>
            <div className="dropdown-menu-page__tier-import">
              import {'{'} DropdownMenu {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="dropdown-menu-page__tier-preview">
              <Button variant="primary" size="sm">Standard Menu</Button>
            </div>
            <div className="dropdown-menu-page__size-breakdown">
              <div className="dropdown-menu-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`dropdown-menu-page__tier-card${tier === 'premium' ? ' dropdown-menu-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="dropdown-menu-page__tier-header">
              <span className="dropdown-menu-page__tier-name">Premium</span>
              <span className="dropdown-menu-page__tier-size">~3-5 KB</span>
            </div>
            <p className="dropdown-menu-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="dropdown-menu-page__tier-import">
              import {'{'} DropdownMenu {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="dropdown-menu-page__tier-preview">
              <Button variant="primary" size="sm">Premium Menu</Button>
            </div>
            <div className="dropdown-menu-page__size-breakdown">
              <div className="dropdown-menu-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API — MenuItem ─────────────────────── */}
      <section className="dropdown-menu-page__section" id="menu-item-props">
        <h2 className="dropdown-menu-page__section-title">
          <a href="#menu-item-props">MenuItem Interface</a>
        </h2>
        <p className="dropdown-menu-page__section-desc">
          Each item in the items array follows the MenuItem interface.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={menuItemProps} />
        </Card>
      </section>

      {/* ── 9. Props API — DropdownMenu ────────────────── */}
      <section className="dropdown-menu-page__section" id="props">
        <h2 className="dropdown-menu-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="dropdown-menu-page__section-desc">
          All props accepted by DropdownMenu. The trigger element receives aria-expanded,
          aria-haspopup, and aria-controls automatically.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dropdownMenuProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="dropdown-menu-page__section" id="accessibility">
        <h2 className="dropdown-menu-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="dropdown-menu-page__section-desc">
          Follows the WAI-ARIA Menu pattern with full keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="dropdown-menu-page__a11y-list">
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="dropdown-menu-page__a11y-key">ArrowDown</code>/<code className="dropdown-menu-page__a11y-key">ArrowUp</code> navigate items, <code className="dropdown-menu-page__a11y-key">Home</code>/<code className="dropdown-menu-page__a11y-key">End</code> jump to first/last.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Activation:</strong> <code className="dropdown-menu-page__a11y-key">Enter</code> and <code className="dropdown-menu-page__a11y-key">Space</code> activate the focused item.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dismiss:</strong> <code className="dropdown-menu-page__a11y-key">Escape</code> and click-outside close the menu.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roles:</strong> Uses <code className="dropdown-menu-page__a11y-key">role="menu"</code>, <code className="dropdown-menu-page__a11y-key">role="menuitem"</code>, and <code className="dropdown-menu-page__a11y-key">role="separator"</code>.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Trigger:</strong> Receives <code className="dropdown-menu-page__a11y-key">aria-expanded</code> and <code className="dropdown-menu-page__a11y-key">aria-haspopup="menu"</code>.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Items with <code className="dropdown-menu-page__a11y-key">aria-disabled="true"</code> are skipped in keyboard navigation.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="dropdown-menu-page__a11y-item">
              <span className="dropdown-menu-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="dropdown-menu-page__a11y-key">forced-colors: active</code> mode.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
