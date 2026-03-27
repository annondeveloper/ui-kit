'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { TreeView, type TreeNode } from '@ui/domain/tree-view'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tree-view-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tree-view-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .tree-view-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tree-view-page__hero::before {
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
        .tree-view-page__hero::before { animation: none; }
      }

      .tree-view-page__title {
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

      .tree-view-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tree-view-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tree-view-page__import-code {
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

      .tree-view-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .tree-view-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        .tree-view-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .tree-view-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .tree-view-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .tree-view-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .tree-view-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .tree-view-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .tree-view-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .tree-view-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container tree-view-page (max-width: 680px) {
        .tree-view-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .tree-view-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .tree-view-page__playground-result {
        min-block-size: 250px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .tree-view-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tree-view-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tree-view-page__playground-controls {
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

      .tree-view-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tree-view-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tree-view-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .tree-view-page__option-btn {
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
      .tree-view-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .tree-view-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tree-view-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .tree-view-page__selected-info {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        margin-block-start: 0.75rem;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .tree-view-page__code-tabs {
        margin-block-start: 1rem;
      }

      .tree-view-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .tree-view-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tree-view-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .tree-view-page__tier-card {
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

      .tree-view-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tree-view-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .tree-view-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .tree-view-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .tree-view-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .tree-view-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .tree-view-page__tier-import {
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

      .tree-view-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .tree-view-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .tree-view-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tree-view-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .tree-view-page__a11y-key {
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
        .tree-view-page__hero { padding: 2rem 1.25rem; }
        .tree-view-page__title { font-size: 1.75rem; }
        .tree-view-page__preview { padding: 1.5rem; }
        .tree-view-page__playground { grid-template-columns: 1fr; }
        .tree-view-page__tiers { grid-template-columns: 1fr; }
        .tree-view-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .tree-view-page__hero { padding: 1.5rem 1rem; }
        .tree-view-page__title { font-size: 1.5rem; }
        .tree-view-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .tree-view-page__title { font-size: 4rem; }
        .tree-view-page__preview { padding: 3rem; }
      }

      .tree-view-page__import-code,
      .tree-view-page code,
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
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const treeViewProps: PropDef[] = [
  { name: 'nodes', type: 'TreeNode[]', required: true, description: 'Hierarchical data structure. Each node has id, label, optional children, icon, disabled, data.' },
  { name: 'selected', type: 'string | string[]', description: 'Currently selected node ID(s). Supports single or multi-select.' },
  { name: 'onSelect', type: '(nodeId: string) => void', description: 'Callback when a node is selected via click or keyboard.' },
  { name: 'expanded', type: 'string[]', default: '[]', description: 'Array of expanded node IDs. Controls which branches are open.' },
  { name: 'onExpand', type: '(nodeId: string, expanded: boolean) => void', description: 'Callback when a node is expanded or collapsed.' },
  { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Enable multi-selection mode with aria-multiselectable.' },
  { name: 'lazy', type: '(nodeId: string) => Promise<TreeNode[]>', description: 'Lazy loading function for on-demand child nodes. Shows spinner while loading.' },
  { name: 'showGuides', type: 'boolean', default: 'true', description: 'Show vertical indent guide lines for visual hierarchy.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for expand/collapse transitions.' },
]

const treeNodeProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the node.' },
  { name: 'label', type: 'ReactNode', required: true, description: 'Display content for the node row.' },
  { name: 'icon', type: 'ReactNode', description: 'Optional icon rendered before the label.' },
  { name: 'children', type: 'TreeNode[]', description: 'Child nodes. Presence of this array makes the node expandable.' },
  { name: 'disabled', type: 'boolean', description: 'Disables selection and expansion for this node.' },
  { name: 'data', type: 'unknown', description: 'Arbitrary data payload attached to the node.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TreeView } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TreeView } from '@annondeveloper/ui-kit'",
  premium: "import { TreeView } from '@annondeveloper/ui-kit'",
}

const FILE_TREE: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Icon name="folder" size="sm" />,
    children: [
      {
        id: 'src/components',
        label: 'components',
        icon: <Icon name="folder" size="sm" />,
        children: [
          { id: 'src/components/button.tsx', label: 'button.tsx', icon: <Icon name="file" size="sm" /> },
          { id: 'src/components/card.tsx', label: 'card.tsx', icon: <Icon name="file" size="sm" /> },
          { id: 'src/components/dialog.tsx', label: 'dialog.tsx', icon: <Icon name="file" size="sm" /> },
        ],
      },
      {
        id: 'src/core',
        label: 'core',
        icon: <Icon name="folder" size="sm" />,
        children: [
          { id: 'src/core/styles', label: 'styles', icon: <Icon name="folder" size="sm" />, children: [
            { id: 'src/core/styles/css-tag.ts', label: 'css-tag.ts', icon: <Icon name="file" size="sm" /> },
            { id: 'src/core/styles/use-styles.ts', label: 'use-styles.ts', icon: <Icon name="file" size="sm" /> },
          ]},
          { id: 'src/core/motion', label: 'motion', icon: <Icon name="folder" size="sm" />, children: [
            { id: 'src/core/motion/spring.ts', label: 'spring.ts', icon: <Icon name="file" size="sm" /> },
          ]},
        ],
      },
      { id: 'src/index.ts', label: 'index.ts', icon: <Icon name="file" size="sm" /> },
    ],
  },
  {
    id: 'package.json',
    label: 'package.json',
    icon: <Icon name="file" size="sm" />,
  },
  {
    id: 'tsconfig.json',
    label: 'tsconfig.json',
    icon: <Icon name="file" size="sm" />,
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="tree-view-page__copy-btn"
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
    <label className="tree-view-page__toggle-label">
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
    <div className="tree-view-page__control-group">
      <span className="tree-view-page__control-label">{label}</span>
      <div className="tree-view-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`tree-view-page__option-btn${opt === value ? ' tree-view-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, showGuides: boolean, multiSelect: boolean, motion: number): string {
  if (tier === 'lite') {
    return `import { TreeView } from '@annondeveloper/ui-kit/lite'

const nodes = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'src/index.ts', label: 'index.ts' },
      { id: 'src/app.tsx', label: 'app.tsx' },
    ],
  },
  { id: 'package.json', label: 'package.json' },
]

<TreeView nodes={nodes} />`
  }

  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  nodes={nodes}', '  selected={selected}', '  onSelect={handleSelect}', '  expanded={expanded}', '  onExpand={handleExpand}']
  if (!showGuides) props.push('  showGuides={false}')
  if (multiSelect) props.push('  multiSelect')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

const nodes = [
  {
    id: 'src',
    label: 'src',
    icon: <FolderIcon />,
    children: [
      { id: 'src/index.ts', label: 'index.ts', icon: <FileIcon /> },
      { id: 'src/app.tsx', label: 'app.tsx', icon: <FileIcon /> },
    ],
  },
  { id: 'package.json', label: 'package.json', icon: <FileIcon /> },
]

const [selected, setSelected] = useState<string>('')
const [expanded, setExpanded] = useState<string[]>(['src'])

<TreeView
${props.join('\n')}
/>`
}

function generateHtmlCode(): string {
  return `<!-- TreeView — CSS-only with <details> -->
<div class="ui-lite-tree-view" role="tree">
  <details class="ui-lite-tree-view__node" open>
    <summary>src</summary>
    <div class="ui-lite-tree-view__children">
      <div class="ui-lite-tree-view__leaf">index.ts</div>
      <div class="ui-lite-tree-view__leaf">app.tsx</div>
    </div>
  </details>
  <div class="ui-lite-tree-view__leaf">package.json</div>
</div>`
}

function generateVueCode(tier: Tier, showGuides: boolean, multiSelect: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-tree-view" role="tree">
    <details v-for="node in nodes" :key="node.id" class="ui-lite-tree-view__node">
      <summary>{{ node.label }}</summary>
      <div v-if="node.children" class="ui-lite-tree-view__children">
        <div v-for="child in node.children" :key="child.id" class="ui-lite-tree-view__leaf">
          {{ child.label }}
        </div>
      </div>
    </details>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <TreeView
    :nodes="nodes"
    :selected="selected"
    :expanded="expanded"
    @select="onSelect"
    @expand="onExpand"${!showGuides ? '\n    :showGuides="false"' : ''}${multiSelect ? '\n    multiSelect' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TreeView } from '${importPath}'

const selected = ref('')
const expanded = ref(['src'])
const nodes = [...]
</script>`
}

function generateAngularCode(tier: Tier): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only with <details>) -->
<div class="ui-lite-tree-view" role="tree">
  <details *ngFor="let node of nodes" class="ui-lite-tree-view__node">
    <summary>{{ node.label }}</summary>
    <div *ngIf="node.children" class="ui-lite-tree-view__children">
      <div *ngFor="let child of node.children" class="ui-lite-tree-view__leaf">
        {{ child.label }}
      </div>
    </div>
  </details>
</div>

@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-tree-view" data-guides="true">
  <ul role="tree">
    <li *ngFor="let node of nodes" role="treeitem"
      [attr.aria-expanded]="isExpanded(node.id)">
      <div class="ui-tree-view__row" (click)="toggle(node.id)">
        <button class="ui-tree-view__toggle" *ngIf="node.children">
          <!-- Chevron icon -->
        </button>
        <span class="ui-tree-view__label">{{ node.label }}</span>
      </div>
    </li>
  </ul>
</div>

@import '@annondeveloper/ui-kit/css/components/tree-view.css';`
}

function generateSvelteCode(tier: Tier, showGuides: boolean, multiSelect: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-tree-view" role="tree">
  {#each nodes as node}
    {#if node.children}
      <details class="ui-lite-tree-view__node">
        <summary>{node.label}</summary>
        <div class="ui-lite-tree-view__children">
          {#each node.children as child}
            <div class="ui-lite-tree-view__leaf">{child.label}</div>
          {/each}
        </div>
      </details>
    {:else}
      <div class="ui-lite-tree-view__leaf">{node.label}</div>
    {/if}
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { TreeView } from '${importPath}';

  let selected = '';
  let expanded = ['src'];
  const nodes = [...]
</script>

<TreeView
  {nodes}
  {selected}
  {expanded}
  on:select={(e) => selected = e.detail}
  on:expand={(e) => { /* handle expand */ }}${!showGuides ? '\n  showGuides={false}' : ''}${multiSelect ? '\n  multiSelect' : ''}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [selected, setSelected] = useState<string>('src/components/button.tsx')
  const [expanded, setExpanded] = useState<string[]>(['src', 'src/components'])
  const [showGuides, setShowGuides] = useState(true)
  const [multiSelect, setMultiSelect] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const handleExpand = useCallback((nodeId: string, isExpanded: boolean) => {
    setExpanded(prev =>
      isExpanded ? [...prev, nodeId] : prev.filter(id => id !== nodeId)
    )
  }, [])

  const reactCode = useMemo(
    () => generateReactCode(tier, showGuides, multiSelect, motion),
    [tier, showGuides, multiSelect, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(), [])
  const vueCode = useMemo(() => generateVueCode(tier, showGuides, multiSelect), [tier, showGuides, multiSelect])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, showGuides, multiSelect), [tier, showGuides, multiSelect])

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
    <section className="tree-view-page__section" id="playground">
      <h2 className="tree-view-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tree-view-page__section-desc">
        Explore a file tree and toggle features. The generated code updates as you change settings.
      </p>

      <div className="tree-view-page__playground">
        <div className="tree-view-page__playground-preview">
          <div className="tree-view-page__playground-result">
            <TreeView
              nodes={FILE_TREE}
              selected={selected}
              onSelect={setSelected}
              expanded={expanded}
              onExpand={handleExpand}
              showGuides={showGuides}
              multiSelect={multiSelect}
              motion={motion}
            />
            <div className="tree-view-page__selected-info">
              Selected: {selected || '(none)'}
            </div>
          </div>

          <div className="tree-view-page__code-tabs">
            <div className="tree-view-page__export-row">
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
              {copyStatus && <span className="tree-view-page__export-status">{copyStatus}</span>}
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

        <div className="tree-view-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="tree-view-page__control-group">
            <span className="tree-view-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show guides" checked={showGuides} onChange={setShowGuides} />
              <Toggle label="Multi-select" checked={multiSelect} onChange={setMultiSelect} />
            </div>
          </div>

          <div className="tree-view-page__control-group">
            <span className="tree-view-page__control-label">Quick actions</span>
            <div className="tree-view-page__control-options">
              <button
                type="button"
                className="tree-view-page__option-btn"
                onClick={() => setExpanded(['src', 'src/components', 'src/core', 'src/core/styles', 'src/core/motion'])}
              >
                Expand all
              </button>
              <button
                type="button"
                className="tree-view-page__option-btn"
                onClick={() => setExpanded([])}
              >
                Collapse all
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreeViewPage() {
  useStyles('tree-view-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.tree-view-page__section')
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
    <div className="tree-view-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="tree-view-page__hero">
        <h1 className="tree-view-page__title">TreeView</h1>
        <p className="tree-view-page__desc">
          Hierarchical data explorer with expand/collapse, keyboard navigation, lazy loading,
          multi-select, indent guides, and animated transitions.
        </p>
        <div className="tree-view-page__import-row">
          <code className="tree-view-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Keyboard Navigation ───────────────────────── */}
      <section className="tree-view-page__section" id="keyboard">
        <h2 className="tree-view-page__section-title">
          <a href="#keyboard">Keyboard Navigation</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Full WAI-ARIA tree pattern keyboard support. Navigate, expand, collapse, and select nodes
          entirely from the keyboard.
        </p>
        <div className="tree-view-page__preview">
          <KeyboardDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`// Keyboard shortcuts:
// Arrow Down  — Move focus to next visible node
// Arrow Up    — Move focus to previous visible node
// Arrow Right — Expand node / move to first child
// Arrow Left  — Collapse node / move to parent
// Home        — Focus first node
// End         — Focus last visible node
// Enter/Space — Select focused node
// *           — Expand all siblings at current level`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. Lazy Loading ──────────────────────────────── */}
      <section className="tree-view-page__section" id="lazy-loading">
        <h2 className="tree-view-page__section-title">
          <a href="#lazy-loading">Lazy Loading</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Load child nodes on demand with an async function. Shows a spinner while loading.
          Ideal for large or server-backed trees.
        </p>
        <div className="tree-view-page__preview">
          <LazyDemo />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<TreeView
  nodes={nodes}
  expanded={expanded}
  onExpand={handleExpand}
  lazy={async (nodeId) => {
    const response = await fetch(\`/api/tree/\${nodeId}/children\`)
    return response.json()
  }}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Multi-Select ──────────────────────────────── */}
      <section className="tree-view-page__section" id="multi-select">
        <h2 className="tree-view-page__section-title">
          <a href="#multi-select">Multi-Select</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Enable multi-select mode to allow selecting multiple nodes. Uses aria-multiselectable
          for accessibility compliance.
        </p>
        <div className="tree-view-page__preview">
          <MultiSelectDemo />
        </div>
      </section>

      {/* ── 6. Disabled Nodes ────────────────────────────── */}
      <section className="tree-view-page__section" id="disabled-nodes">
        <h2 className="tree-view-page__section-title">
          <a href="#disabled-nodes">Disabled Nodes</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Individual nodes can be disabled to prevent selection and expansion.
          Disabled nodes are skipped during keyboard navigation.
        </p>
        <div className="tree-view-page__preview">
          <DisabledDemo />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="tree-view-page__section" id="tiers">
        <h2 className="tree-view-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses native {'<details>'} elements,
          Standard adds full keyboard navigation and lazy loading.
        </p>

        <div className="tree-view-page__tiers">
          <div
            className={`tree-view-page__tier-card${tier === 'lite' ? ' tree-view-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="tree-view-page__tier-header">
              <span className="tree-view-page__tier-name">Lite</span>
              <span className="tree-view-page__tier-size">~0.2 KB</span>
            </div>
            <p className="tree-view-page__tier-desc">
              CSS-only tree using native {'<details>'} elements. No keyboard navigation,
              no selection tracking, no lazy loading.
            </p>
            <div className="tree-view-page__tier-import">
              import {'{'} TreeView {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="tree-view-page__tier-preview">
              <Button size="sm" variant="secondary" onClick={() => setTier('lite')}>Select Lite</Button>
            </div>
          </div>

          <div
            className={`tree-view-page__tier-card${tier === 'standard' ? ' tree-view-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="tree-view-page__tier-header">
              <span className="tree-view-page__tier-name">Standard</span>
              <span className="tree-view-page__tier-size">~4.8 KB</span>
            </div>
            <p className="tree-view-page__tier-desc">
              Full tree with WAI-ARIA keyboard navigation, selection tracking, lazy loading,
              indent guides, animated expand/collapse, and disabled state.
            </p>
            <div className="tree-view-page__tier-import">
              import {'{'} TreeView {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="tree-view-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('standard')}>Select Standard</Button>
            </div>
          </div>

          <div
            className={`tree-view-page__tier-card${tier === 'premium' ? ' tree-view-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="tree-view-page__tier-header">
              <span className="tree-view-page__tier-name">Premium</span>
              <span className="tree-view-page__tier-size">~6.2 KB</span>
            </div>
            <p className="tree-view-page__tier-desc">
              Everything in Standard plus spring-animated expand/collapse,
              drag-and-drop reordering, virtual scrolling for large trees, and search/filter.
            </p>
            <div className="tree-view-page__tier-import">
              import {'{'} TreeView {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="tree-view-page__tier-preview">
              <Button size="sm" variant="primary" onClick={() => setTier('premium')}>Select Premium</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TreeView Props ────────────────────────────── */}
      <section className="tree-view-page__section" id="props">
        <h2 className="tree-view-page__section-title">
          <a href="#props">TreeView Props</a>
        </h2>
        <p className="tree-view-page__section-desc">
          All props accepted by TreeView. It also spreads any native div HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={treeViewProps} />
        </Card>
      </section>

      {/* ── 9. TreeNode Definition ───────────────────────── */}
      <section className="tree-view-page__section" id="tree-node">
        <h2 className="tree-view-page__section-title">
          <a href="#tree-node">TreeNode Definition</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Each node in the nodes array accepts these properties.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={treeNodeProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="tree-view-page__section" id="accessibility">
        <h2 className="tree-view-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="tree-view-page__section-desc">
          Implements the WAI-ARIA TreeView pattern with full keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="tree-view-page__a11y-list">
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA roles:</strong> Uses <code className="tree-view-page__a11y-key">role="tree"</code> and <code className="tree-view-page__a11y-key">role="treeitem"</code> with proper nesting.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Expand state:</strong> Each expandable node announces its state via <code className="tree-view-page__a11y-key">aria-expanded</code>.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Selection:</strong> Selected nodes use <code className="tree-view-page__a11y-key">aria-selected="true"</code>. Multi-select uses <code className="tree-view-page__a11y-key">aria-multiselectable</code>.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Full arrow key navigation including Home, End, *, Enter, and Space.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Roving tabindex:</strong> Only the focused item receives <code className="tree-view-page__a11y-key">tabIndex=0</code>.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Nodes with <code className="tree-view-page__a11y-key">aria-disabled</code> are skipped during keyboard navigation.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> 44px minimum row height on coarse pointer devices.
              </span>
            </li>
            <li className="tree-view-page__a11y-item">
              <span className="tree-view-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="tree-view-page__a11y-key">forced-colors: active</code> with Highlight outlines.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}

// ─── Demo Sub-components ─────────────────────────────────────────────────────

function KeyboardDemo() {
  const [selected, setSelected] = useState('')
  const [expanded, setExpanded] = useState<string[]>(['kb-docs'])

  const nodes: TreeNode[] = [
    {
      id: 'kb-docs',
      label: 'docs',
      children: [
        { id: 'kb-readme', label: 'README.md' },
        { id: 'kb-guide', label: 'guide.md' },
        { id: 'kb-api', label: 'api-reference.md' },
      ],
    },
    {
      id: 'kb-tests',
      label: 'tests',
      children: [
        { id: 'kb-unit', label: 'unit.test.ts' },
        { id: 'kb-e2e', label: 'e2e.test.ts' },
      ],
    },
    { id: 'kb-config', label: 'config.ts' },
  ]

  return (
    <div style={{ maxInlineSize: '400px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem' }}>
        Click any node, then use arrow keys to navigate. Try Home, End, and * keys.
      </p>
      <TreeView
        nodes={nodes}
        selected={selected}
        onSelect={setSelected}
        expanded={expanded}
        onExpand={(id, exp) => setExpanded(prev => exp ? [...prev, id] : prev.filter(x => x !== id))}
      />
    </div>
  )
}

function LazyDemo() {
  const [expanded, setExpanded] = useState<string[]>([])
  const [selected, setSelected] = useState('')

  const nodes: TreeNode[] = [
    {
      id: 'lazy-users',
      label: 'Users (click to load)',
      icon: <Icon name="users" size="sm" />,
      children: [],
    },
    {
      id: 'lazy-projects',
      label: 'Projects (click to load)',
      icon: <Icon name="folder" size="sm" />,
      children: [],
    },
  ]

  const lazyLoad = useCallback(async (nodeId: string): Promise<TreeNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (nodeId === 'lazy-users') {
      return [
        { id: 'user-alice', label: 'Alice', icon: <Icon name="user" size="sm" /> },
        { id: 'user-bob', label: 'Bob', icon: <Icon name="user" size="sm" /> },
        { id: 'user-carol', label: 'Carol', icon: <Icon name="user" size="sm" /> },
      ]
    }
    return [
      { id: 'proj-alpha', label: 'Project Alpha', icon: <Icon name="file" size="sm" /> },
      { id: 'proj-beta', label: 'Project Beta', icon: <Icon name="file" size="sm" /> },
    ]
  }, [])

  return (
    <div style={{ maxInlineSize: '400px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem' }}>
        Click a folder to trigger lazy loading with a 1-second simulated delay.
      </p>
      <TreeView
        nodes={nodes}
        selected={selected}
        onSelect={setSelected}
        expanded={expanded}
        onExpand={(id, exp) => setExpanded(prev => exp ? [...prev, id] : prev.filter(x => x !== id))}
        lazy={lazyLoad}
      />
    </div>
  )
}

function MultiSelectDemo() {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>(['ms-fruits'])

  const nodes: TreeNode[] = [
    {
      id: 'ms-fruits',
      label: 'Fruits',
      children: [
        { id: 'ms-apple', label: 'Apple' },
        { id: 'ms-banana', label: 'Banana' },
        { id: 'ms-cherry', label: 'Cherry' },
      ],
    },
    {
      id: 'ms-vegs',
      label: 'Vegetables',
      children: [
        { id: 'ms-carrot', label: 'Carrot' },
        { id: 'ms-broccoli', label: 'Broccoli' },
      ],
    },
  ]

  const handleSelect = useCallback((nodeId: string) => {
    setSelected(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    )
  }, [])

  return (
    <div style={{ maxInlineSize: '400px' }}>
      <TreeView
        nodes={nodes}
        selected={selected}
        onSelect={handleSelect}
        expanded={expanded}
        onExpand={(id, exp) => setExpanded(prev => exp ? [...prev, id] : prev.filter(x => x !== id))}
        multiSelect
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
        Selected: {selected.length ? selected.join(', ') : '(none)'}
      </p>
    </div>
  )
}

function DisabledDemo() {
  const [selected, setSelected] = useState('')
  const [expanded, setExpanded] = useState<string[]>(['dis-root'])

  const nodes: TreeNode[] = [
    {
      id: 'dis-root',
      label: 'Project',
      children: [
        { id: 'dis-src', label: 'src (editable)' },
        { id: 'dis-locked', label: 'locked-file.ts (disabled)', disabled: true },
        { id: 'dis-config', label: 'config.json' },
        { id: 'dis-build', label: 'build (disabled)', disabled: true, children: [
          { id: 'dis-build-out', label: 'output.js' },
        ]},
      ],
    },
  ]

  return (
    <div style={{ maxInlineSize: '400px' }}>
      <TreeView
        nodes={nodes}
        selected={selected}
        onSelect={setSelected}
        expanded={expanded}
        onExpand={(id, exp) => setExpanded(prev => exp ? [...prev, id] : prev.filter(x => x !== id))}
      />
    </div>
  )
}
