'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DiffViewer } from '@ui/domain/diff-viewer'
import { DiffViewer as LiteDiffViewer } from '@ui/lite/diff-viewer'
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
    @scope (.diff-viewer-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: diff-viewer-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .diff-viewer-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .diff-viewer-page__hero::before {
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
        animation: dv-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dv-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .diff-viewer-page__hero::before { animation: none; }
      }

      .diff-viewer-page__title {
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

      .diff-viewer-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .diff-viewer-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .diff-viewer-page__import-code {
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

      .diff-viewer-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .diff-viewer-page__section {
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
        animation: dv-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dv-section-reveal {
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
        .diff-viewer-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .diff-viewer-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .diff-viewer-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .diff-viewer-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .diff-viewer-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .diff-viewer-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .diff-viewer-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .diff-viewer-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container diff-viewer-page (max-width: 680px) {
        .diff-viewer-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .diff-viewer-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .diff-viewer-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .diff-viewer-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .diff-viewer-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .diff-viewer-page__playground-controls {
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

      .diff-viewer-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .diff-viewer-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .diff-viewer-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .diff-viewer-page__option-btn {
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
      .diff-viewer-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .diff-viewer-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .diff-viewer-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .diff-viewer-page__code-tabs {
        margin-block-start: 1rem;
      }

      .diff-viewer-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .diff-viewer-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .diff-viewer-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .diff-viewer-page__tier-card {
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

      .diff-viewer-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .diff-viewer-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .diff-viewer-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .diff-viewer-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .diff-viewer-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .diff-viewer-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .diff-viewer-page__tier-import {
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

      .diff-viewer-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      .diff-viewer-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .diff-viewer-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .diff-viewer-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .diff-viewer-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .diff-viewer-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .diff-viewer-page__a11y-key {
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
        .diff-viewer-page__hero { padding: 2rem 1.25rem; }
        .diff-viewer-page__title { font-size: 1.75rem; }
        .diff-viewer-page__preview { padding: 1.25rem; }
        .diff-viewer-page__playground { grid-template-columns: 1fr; }
        .diff-viewer-page__tiers { grid-template-columns: 1fr; }
        .diff-viewer-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .diff-viewer-page__hero { padding: 1.5rem 1rem; }
        .diff-viewer-page__title { font-size: 1.5rem; }
        .diff-viewer-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .diff-viewer-page__import-code,
      .diff-viewer-page code,
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

const diffViewerProps: PropDef[] = [
  { name: 'oldValue', type: 'string', required: true, description: 'The original text to compare against.' },
  { name: 'newValue', type: 'string', required: true, description: 'The modified text to compare.' },
  { name: 'oldTitle', type: 'string', description: 'Label displayed above the old (left) pane.' },
  { name: 'newTitle', type: 'string', description: 'Label displayed above the new (right) pane.' },
  { name: 'mode', type: "'side-by-side' | 'unified'", default: "'unified'", description: 'Display mode — unified shows interleaved changes, side-by-side shows two columns.' },
  { name: 'showLineNumbers', type: 'boolean', default: 'true', description: 'Show old/new line numbers in the gutter.' },
  { name: 'foldUnchanged', type: 'boolean', default: 'true', description: 'Collapse large unchanged regions into expandable folds.' },
  { name: 'foldThreshold', type: 'number', default: '3', description: 'Minimum unchanged lines before folding kicks in.' },
  { name: 'language', type: 'string', description: 'Language hint for syntax highlighting (future use).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

const CODE_OLD = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

function add(a, b) {
  return a + b;
}

// Main
const result = add(1, 2);
greet("World");
console.log(result);`

const CODE_NEW = `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

function add(a: number, b: number): number {
  return a + b;
}

// Main — updated with types
const result: number = add(1, 2);
greet("World");
console.log("Result:", result);`

const CONFIG_OLD = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`

const CONFIG_NEW = `{
  "name": "my-app",
  "version": "2.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@annondeveloper/ui-kit": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}`

const CSS_OLD = `.button {
  background: blue;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
}`

const CSS_NEW = `.button {
  background: oklch(65% 0.2 270);
  color: oklch(100% 0 0);
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md, 0.5rem);
  transition: all 0.15s ease;
  font-weight: 600;
}`

type DiffSample = 'code' | 'config' | 'css'
type DiffMode = 'unified' | 'side-by-side'

const DIFF_SAMPLES: Record<DiffSample, { old: string; new: string; oldTitle: string; newTitle: string }> = {
  code: { old: CODE_OLD, new: CODE_NEW, oldTitle: 'utils.js', newTitle: 'utils.ts' },
  config: { old: CONFIG_OLD, new: CONFIG_NEW, oldTitle: 'package.json (v1)', newTitle: 'package.json (v2)' },
  css: { old: CSS_OLD, new: CSS_NEW, oldTitle: 'styles.css (before)', newTitle: 'styles.css (after)' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DiffViewer } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DiffViewer } from '@annondeveloper/ui-kit'",
  premium: "import { DiffViewer } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="diff-viewer-page__copy-btn"
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
    <div className="diff-viewer-page__control-group">
      <span className="diff-viewer-page__control-label">{label}</span>
      <div className="diff-viewer-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`diff-viewer-page__option-btn${opt === value ? ' diff-viewer-page__option-btn--active' : ''}`}
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
    <label className="diff-viewer-page__toggle-label">
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

function generateReactCode(tier: Tier, mode: DiffMode, showLineNumbers: boolean, foldUnchanged: boolean, foldThreshold: number): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}\n\nconst oldCode = \`function greet(name) {\n  console.log("Hello, " + name);\n}\`\n\nconst newCode = \`function greet(name: string) {\n  console.log(\\\`Hello, \\\${name}!\\\`);\n}\`\n\n<DiffViewer\n  oldValue={oldCode}\n  newValue={newCode}\n  oldTitle="before"\n  newTitle="after"\n/>`
  }

  const props: string[] = ['  oldValue={oldCode}', '  newValue={newCode}', '  oldTitle="before"', '  newTitle="after"']
  if (mode !== 'unified') props.push(`  mode="${mode}"`)
  if (!showLineNumbers) props.push('  showLineNumbers={false}')
  if (!foldUnchanged) props.push('  foldUnchanged={false}')
  if (foldThreshold !== 3) props.push(`  foldThreshold={${foldThreshold}}`)

  return `${importStr}\n\nconst oldCode = \`function greet(name) {\n  console.log("Hello, " + name);\n}\`\n\nconst newCode = \`function greet(name: string) {\n  console.log(\\\`Hello, \\\${name}!\\\`);\n}\`\n\n<DiffViewer\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier): string {
  const cls = tier === 'lite' ? 'ui-lite-diff-viewer' : 'ui-diff-viewer'
  return `<!-- DiffViewer — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/diff-viewer.css">

<div class="${cls}" data-mode="unified">
  <div class="${cls}__titles">
    <div class="${cls}__title">before</div>
    <div class="${cls}__title">after</div>
  </div>
  <div class="${cls}__unified">
    <div class="${cls}__line ${cls}__line--removed">
      <span class="${cls}__prefix">-</span>
      <span>function greet(name) {</span>
    </div>
    <div class="${cls}__line ${cls}__line--added">
      <span class="${cls}__prefix">+</span>
      <span>function greet(name: string) {</span>
    </div>
  </div>
</div>`
}

function generateVueCode(tier: Tier, mode: DiffMode): string {
  if (tier === 'lite') {
    return `<template>
  <DiffViewer
    :old-value="oldCode"
    :new-value="newCode"
    old-title="before"
    new-title="after"
  />
</template>

<script setup>
import { DiffViewer } from '@annondeveloper/ui-kit/lite'
const oldCode = 'function greet(name) { ... }'
const newCode = 'function greet(name: string) { ... }'
</script>`
  }
  return `<template>
  <DiffViewer
    :old-value="oldCode"
    :new-value="newCode"
    old-title="before"
    new-title="after"
    mode="${mode}"
  />
</template>

<script setup>
import { DiffViewer } from '@annondeveloper/ui-kit'
const oldCode = 'function greet(name) { ... }'
const newCode = 'function greet(name: string) { ... }'
</script>`
}

function generateAngularCode(tier: Tier): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (table-based diff) -->
<div class="ui-lite-diff-viewer">
  <table>
    <thead><tr><th>Old</th><th>New</th></tr></thead>
    <tbody>
      <tr data-changed>
        <td class="ui-lite-diff-viewer__removed">function greet(name) {'{'}</td>
        <td class="ui-lite-diff-viewer__added">function greet(name: string) {'{'}</td>
      </tr>
    </tbody>
  </table>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — use CSS-only approach -->
<div class="ui-diff-viewer" data-mode="unified">
  <!-- Render diff lines from your diff algorithm -->
</div>

@import '@annondeveloper/ui-kit/css/components/diff-viewer.css';`
}

function generateSvelteCode(tier: Tier, mode: DiffMode): string {
  if (tier === 'lite') {
    return `<script>
  import { DiffViewer } from '@annondeveloper/ui-kit/lite';
  const oldCode = 'function greet(name) { ... }';
  const newCode = 'function greet(name: string) { ... }';
</script>

<DiffViewer oldValue={oldCode} newValue={newCode} oldTitle="before" newTitle="after" />`
  }
  return `<script>
  import { DiffViewer } from '@annondeveloper/ui-kit';
  const oldCode = 'function greet(name) { ... }';
  const newCode = 'function greet(name: string) { ... }';
</script>

<DiffViewer
  oldValue={oldCode}
  newValue={newCode}
  oldTitle="before"
  newTitle="after"
  mode="${mode}"
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [sample, setSample] = useState<DiffSample>('code')
  const [mode, setMode] = useState<DiffMode>('unified')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [foldUnchanged, setFoldUnchanged] = useState(true)
  const [foldThreshold, setFoldThreshold] = useState(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const current = DIFF_SAMPLES[sample]

  const reactCode = useMemo(() => generateReactCode(tier, mode, showLineNumbers, foldUnchanged, foldThreshold), [tier, mode, showLineNumbers, foldUnchanged, foldThreshold])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, mode), [tier, mode])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, mode), [tier, mode])

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
    <section className="diff-viewer-page__section" id="playground">
      <h2 className="diff-viewer-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="diff-viewer-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="diff-viewer-page__playground">
        <div className="diff-viewer-page__playground-preview">
          <div className="diff-viewer-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              {tier === 'lite' ? (
                <LiteDiffViewer
                  oldValue={current.old}
                  newValue={current.new}
                  oldTitle={current.oldTitle}
                  newTitle={current.newTitle}
                />
              ) : (
                <DiffViewer
                  oldValue={current.old}
                  newValue={current.new}
                  oldTitle={current.oldTitle}
                  newTitle={current.newTitle}
                  mode={mode}
                  showLineNumbers={showLineNumbers}
                  foldUnchanged={foldUnchanged}
                  foldThreshold={foldThreshold}
                />
              )}
            </div>
          </div>

          <div className="diff-viewer-page__code-tabs">
            <div className="diff-viewer-page__export-row">
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
              {copyStatus && <span className="diff-viewer-page__export-status">{copyStatus}</span>}
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

        <div className="diff-viewer-page__playground-controls">
          <OptionGroup label="Sample" options={['code', 'config', 'css'] as const} value={sample} onChange={setSample} />

          {tier !== 'lite' && (
            <>
              <OptionGroup label="Mode" options={['unified', 'side-by-side'] as const} value={mode} onChange={setMode} />
              <OptionGroup
                label="Fold Threshold"
                options={['2', '3', '5', '8'] as const}
                value={String(foldThreshold)}
                onChange={v => setFoldThreshold(Number(v))}
              />
              <div className="diff-viewer-page__control-group">
                <span className="diff-viewer-page__control-label">Toggles</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <Toggle label="Line numbers" checked={showLineNumbers} onChange={setShowLineNumbers} />
                  <Toggle label="Fold unchanged" checked={foldUnchanged} onChange={setFoldUnchanged} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiffViewerPage() {
  useStyles('diff-viewer-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.diff-viewer-page__section')
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
    <div className="diff-viewer-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="diff-viewer-page__hero">
        <h1 className="diff-viewer-page__title">DiffViewer</h1>
        <p className="diff-viewer-page__desc">
          Code diff viewer with LCS-based line comparison, unified and side-by-side modes,
          line numbers, and collapsible unchanged regions. Ships from 0.5KB lite to 3.2KB standard.
        </p>
        <div className="diff-viewer-page__import-row">
          <code className="diff-viewer-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Unified Mode ────────────────────────────── */}
      <section className="diff-viewer-page__section" id="unified">
        <h2 className="diff-viewer-page__section-title">
          <a href="#unified">Unified Mode</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          Unified mode shows old and new lines interleaved with +/- prefixes, similar to <code>git diff</code>.
          Added lines have a green background, removed lines have red. Line numbers show both old and new positions.
        </p>
        <div className="diff-viewer-page__preview">
          {tier === 'lite' ? (
            <LiteDiffViewer oldValue={CODE_OLD} newValue={CODE_NEW} oldTitle="utils.js" newTitle="utils.ts" />
          ) : (
            <DiffViewer
              oldValue={CODE_OLD}
              newValue={CODE_NEW}
              oldTitle="utils.js"
              newTitle="utils.ts"
              mode="unified"
              showLineNumbers
              foldUnchanged
            />
          )}
        </div>
      </section>

      {/* ── 4. Side-by-Side Mode ───────────────────────── */}
      {tier !== 'lite' ? (
        <section className="diff-viewer-page__section" id="side-by-side">
          <h2 className="diff-viewer-page__section-title">
            <a href="#side-by-side">Side-by-Side Mode</a>
          </h2>
          <p className="diff-viewer-page__section-desc">
            Side-by-side mode displays old and new content in two parallel columns, making it easy
            to visually compare each version. Unchanged lines appear in both panes.
          </p>
          <div className="diff-viewer-page__preview">
            <DiffViewer
              oldValue={CONFIG_OLD}
              newValue={CONFIG_NEW}
              oldTitle="package.json (v1)"
              newTitle="package.json (v2)"
              mode="side-by-side"
              showLineNumbers
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<DiffViewer\n  oldValue={oldConfig}\n  newValue={newConfig}\n  mode="side-by-side"\n  showLineNumbers\n/>`}
              language="typescript"
            />
          </div>
        </section>
      ) : (
        <section className="diff-viewer-page__section" id="side-by-side">
          <h2 className="diff-viewer-page__section-title">
            <a href="#side-by-side">Side-by-Side Mode</a>
          </h2>
          <p className="diff-viewer-page__section-desc">
            Display old and new content in two parallel columns for easy comparison.
          </p>
          <p className="diff-viewer-page__section-desc" style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
            Side-by-side mode, line numbers, and fold controls require Standard tier.
            Lite provides a simple table-based comparison.
          </p>
        </section>
      )}

      {/* ── 5. Fold Unchanged ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="diff-viewer-page__section" id="fold">
          <h2 className="diff-viewer-page__section-title">
            <a href="#fold">Fold Unchanged Regions</a>
          </h2>
          <p className="diff-viewer-page__section-desc">
            Large blocks of unchanged lines are automatically collapsed into expandable fold markers.
            Click a fold to reveal the hidden lines. The fold threshold controls how many unchanged
            lines trigger folding.
          </p>
          <div className="diff-viewer-page__preview">
            <DiffViewer
              oldValue={CODE_OLD}
              newValue={CODE_NEW}
              foldUnchanged
              foldThreshold={2}
              oldTitle="Low threshold (2)"
              newTitle="utils.ts"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<DiffViewer\n  oldValue={oldCode}\n  newValue={newCode}\n  foldUnchanged\n  foldThreshold={2}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. CSS Diff Example ────────────────────────── */}
      <section className="diff-viewer-page__section" id="css-diff">
        <h2 className="diff-viewer-page__section-title">
          <a href="#css-diff">CSS Migration Example</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          Visualize CSS modernization changes — migrating from pixel values and hex colors to
          OKLCH color functions and fluid sizing with CSS custom properties.
        </p>
        <div className="diff-viewer-page__preview">
          {tier === 'lite' ? (
            <LiteDiffViewer oldValue={CSS_OLD} newValue={CSS_NEW} oldTitle="Before" newTitle="After" />
          ) : (
            <DiffViewer
              oldValue={CSS_OLD}
              newValue={CSS_NEW}
              oldTitle="styles.css (legacy)"
              newTitle="styles.css (modern)"
              mode="unified"
            />
          )}
        </div>
      </section>

      {/* ── 7. Config Diff Example ─────────────────────── */}
      <section className="diff-viewer-page__section" id="config-diff">
        <h2 className="diff-viewer-page__section-title">
          <a href="#config-diff">Config File Comparison</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          Compare configuration files to review dependency upgrades, new fields, and structural changes
          between versions.
        </p>
        <div className="diff-viewer-page__preview">
          {tier === 'lite' ? (
            <LiteDiffViewer oldValue={CONFIG_OLD} newValue={CONFIG_NEW} oldTitle="v1" newTitle="v2" />
          ) : (
            <DiffViewer
              oldValue={CONFIG_OLD}
              newValue={CONFIG_NEW}
              oldTitle="package.json (v1)"
              newTitle="package.json (v2)"
              mode="unified"
              foldUnchanged={false}
            />
          )}
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="diff-viewer-page__section" id="tiers">
        <h2 className="diff-viewer-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses a simple table comparison,
          Standard includes LCS diff, unified/side-by-side modes, line numbers, and foldable regions.
        </p>

        <div className="diff-viewer-page__tiers">
          {/* Lite */}
          <div
            className={`diff-viewer-page__tier-card${tier === 'lite' ? ' diff-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="diff-viewer-page__tier-header">
              <span className="diff-viewer-page__tier-name">Lite</span>
              <span className="diff-viewer-page__tier-size">~0.5 KB</span>
            </div>
            <p className="diff-viewer-page__tier-desc">
              Simple line-by-line table comparison. No LCS algorithm, no fold, no modes.
              Just a two-column table highlighting changed rows.
            </p>
            <div className="diff-viewer-page__tier-import">
              import {'{'} DiffViewer {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="diff-viewer-page__tier-preview" style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <LiteDiffViewer oldValue="old line" newValue="new line" oldTitle="Old" newTitle="New" />
            </div>
            <div className="diff-viewer-page__size-breakdown">
              <div className="diff-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`diff-viewer-page__tier-card${tier === 'standard' ? ' diff-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="diff-viewer-page__tier-header">
              <span className="diff-viewer-page__tier-name">Standard</span>
              <span className="diff-viewer-page__tier-size">~3.2 KB</span>
            </div>
            <p className="diff-viewer-page__tier-desc">
              Full LCS-based diff with unified and side-by-side modes, line numbers,
              expandable fold regions, and motion support.
            </p>
            <div className="diff-viewer-page__tier-import">
              import {'{'} DiffViewer {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="diff-viewer-page__tier-preview" style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <DiffViewer oldValue="const x = 1;" newValue="const x: number = 1;" oldTitle="Old" newTitle="New" />
            </div>
            <div className="diff-viewer-page__size-breakdown">
              <div className="diff-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`diff-viewer-page__tier-card${tier === 'premium' ? ' diff-viewer-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="diff-viewer-page__tier-header">
              <span className="diff-viewer-page__tier-name">Premium</span>
              <span className="diff-viewer-page__tier-size">~3-5 KB</span>
            </div>
            <p className="diff-viewer-page__tier-desc">
              Aurora glow on changed lines, shimmer on additions, spring-slide staggered line entrance, and fold toggle hover glow.
            </p>
            <div className="diff-viewer-page__tier-import">
              import {'{'} DiffViewer {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="diff-viewer-page__tier-preview" style={{ maxHeight: '120px', overflow: 'hidden' }}>
              <DiffViewer oldValue="const x = 1;" newValue="const x: number = 1;" oldTitle="Old" newTitle="New" />
            </div>
            <div className="diff-viewer-page__size-breakdown">
              <div className="diff-viewer-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="diff-viewer-page__section" id="props">
        <h2 className="diff-viewer-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          All props accepted by DiffViewer. It also spreads any native div HTML attributes
          onto the underlying wrapper element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={diffViewerProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="diff-viewer-page__section" id="accessibility">
        <h2 className="diff-viewer-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="diff-viewer-page__section-desc">
          Built with semantic markup and keyboard interaction for fold controls.
        </p>
        <Card variant="default" padding="md">
          <ul className="diff-viewer-page__a11y-list">
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Fold buttons are keyboard-accessible with <code className="diff-viewer-page__a11y-key">Enter</code> / <code className="diff-viewer-page__a11y-key">Space</code> activation.
              </span>
            </li>
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Fold controls show <code className="diff-viewer-page__a11y-key">:focus-visible</code> outline with brand color.
              </span>
            </li>
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Line numbers:</strong> Marked with <code className="diff-viewer-page__a11y-key">aria-hidden="true"</code> as they are decorative.
              </span>
            </li>
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Prefix markers:</strong> +/- prefix characters marked <code className="diff-viewer-page__a11y-key">aria-hidden</code> since colors convey the change type.
              </span>
            </li>
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="diff-viewer-page__a11y-key">forced-colors: active</code> with border indicators replacing background colors.
              </span>
            </li>
            <li className="diff-viewer-page__a11y-item">
              <span className="diff-viewer-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Monospace:</strong> Uses system monospace font stack for consistent character alignment across platforms.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
