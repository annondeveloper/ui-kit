'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CopyBlock } from '@ui/domain/copy-block'
import { CopyBlock as LiteCopyBlock } from '@ui/lite/copy-block'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.copy-block-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: copy-block-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .copy-block-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .copy-block-page__hero::before {
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
        animation: cb-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes cb-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .copy-block-page__hero::before { animation: none; }
      }

      .copy-block-page__title {
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

      .copy-block-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .copy-block-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .copy-block-page__import-code {
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

      .copy-block-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .copy-block-page__section {
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
        animation: cb-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes cb-section-reveal {
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
        .copy-block-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .copy-block-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .copy-block-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .copy-block-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .copy-block-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .copy-block-page__preview {
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

      .copy-block-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .copy-block-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container copy-block-page (max-width: 680px) {
        .copy-block-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .copy-block-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .copy-block-page__playground-result {
        padding: 1rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .copy-block-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .copy-block-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .copy-block-page__playground-controls {
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

      .copy-block-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .copy-block-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .copy-block-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .copy-block-page__option-btn {
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
      .copy-block-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .copy-block-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .copy-block-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .copy-block-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .copy-block-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Language grid ──────────────────────────────── */

      .copy-block-page__lang-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .copy-block-page__lang-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .copy-block-page__lang-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .copy-block-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .copy-block-page__tier-card {
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

      .copy-block-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .copy-block-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .copy-block-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .copy-block-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .copy-block-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .copy-block-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .copy-block-page__tier-import {
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

      .copy-block-page__tier-preview {
        max-height: 120px;
        overflow: hidden;
        border-radius: var(--radius-sm);
      }

      .copy-block-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .copy-block-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .copy-block-page__code-tabs {
        margin-block-start: 1rem;
      }

      .copy-block-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .copy-block-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .copy-block-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .copy-block-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .copy-block-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .copy-block-page__a11y-key {
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
        .copy-block-page__hero { padding: 2rem 1.25rem; }
        .copy-block-page__title { font-size: 1.75rem; }
        .copy-block-page__preview { padding: 1.25rem; }
        .copy-block-page__playground { grid-template-columns: 1fr; }
        .copy-block-page__tiers { grid-template-columns: 1fr; }
        .copy-block-page__section { padding: 1.25rem; }
        .copy-block-page__lang-grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .copy-block-page__hero { padding: 1.5rem 1rem; }
        .copy-block-page__title { font-size: 1.5rem; }
        .copy-block-page__preview { padding: 0.75rem; }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .copy-block-page__import-code,
      .copy-block-page code,
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

const copyBlockProps: PropDef[] = [
  { name: 'code', type: 'string', required: true, description: 'The source code string to display and copy.' },
  { name: 'language', type: "'javascript' | 'typescript' | 'css' | 'json' | 'bash' | 'html' | 'text'", default: "'text'", description: 'Language for syntax highlighting tokenizer.' },
  { name: 'showLineNumbers', type: 'boolean', default: 'true', description: 'Show line numbers in the left gutter.' },
  { name: 'highlight', type: 'number[]', description: 'Array of 1-based line numbers to highlight with brand color background.' },
  { name: 'maxHeight', type: 'string', description: 'Maximum height for the scrollable code area (e.g., "300px").' },
  { name: 'title', type: 'string', description: 'Optional header bar with title text and language badge.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

// ─── Sample Code Strings ──────────────────────────────────────────────────────

const SAMPLE_TS = `import { useState, useEffect } from 'react'
import { Button } from '@annondeveloper/ui-kit'

export function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.title = \`Count: \${count}\`
  }, [count])

  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <Button onClick={() => setCount(c => c + 1)}>
        Increment
      </Button>
    </div>
  )
}`

const SAMPLE_CSS = `@layer components {
  @scope (.ui-card) {
    :scope {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg, 0.75rem);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      padding: var(--space-lg);
      container-type: inline-size;
    }

    .ui-card__title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text-primary);
      text-wrap: balance;
    }
  }
}`

const SAMPLE_JSON = `{
  "name": "@annondeveloper/ui-kit",
  "version": "2.0.0",
  "description": "Zero-dependency React component library",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./lite": "./dist/lite/index.js",
    "./premium": "./dist/premium/index.js"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`

const SAMPLE_BASH = `# Install the UI Kit
npm install @annondeveloper/ui-kit

# Initialize theme and utilities
npx @annondeveloper/ui-kit init

# Add specific components
npx @annondeveloper/ui-kit add button
npx @annondeveloper/ui-kit add card
npx @annondeveloper/ui-kit add dialog

# Generate a theme from your brand color
npx @annondeveloper/ui-kit theme --color "#6366f1"

# List all available components
npx @annondeveloper/ui-kit list`

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UI Kit Demo</title>
  <link rel="stylesheet" href="./theme.css" />
  <link rel="stylesheet" href="./components/button.css" />
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <button class="ui-button" data-variant="primary" data-size="md">
      Click Me
    </button>
  </div>
</body>
</html>`

type Language = 'typescript' | 'css' | 'json' | 'bash' | 'html'

const LANG_SAMPLES: Record<Language, { code: string; label: string }> = {
  typescript: { code: SAMPLE_TS, label: 'TypeScript / JSX' },
  css: { code: SAMPLE_CSS, label: 'CSS' },
  json: { code: SAMPLE_JSON, label: 'JSON' },
  bash: { code: SAMPLE_BASH, label: 'Bash' },
  html: { code: SAMPLE_HTML, label: 'HTML' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { CopyBlock } from '@annondeveloper/ui-kit/lite'",
  standard: "import { CopyBlock } from '@annondeveloper/ui-kit'",
  premium: "import { CopyBlock } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="copy-block-page__copy-btn"
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
    <div className="copy-block-page__control-group">
      <span className="copy-block-page__control-label">{label}</span>
      <div className="copy-block-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`copy-block-page__option-btn${opt === value ? ' copy-block-page__option-btn--active' : ''}`}
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
    <label className="copy-block-page__toggle-label">
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
  language: Language,
  showLineNumbers: boolean,
  highlight: number[],
  maxHeight: string,
  title: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = ['  code={code}']
  if (language !== 'text' as any) props.push(`  language="${language}"`)
  if (!showLineNumbers) props.push('  showLineNumbers={false}')
  if (tier !== 'lite' && highlight.length > 0) props.push(`  highlight={[${highlight.join(', ')}]}`)
  if (tier !== 'lite' && maxHeight) props.push(`  maxHeight="${maxHeight}"`)
  if (tier !== 'lite' && title) props.push(`  title="${title}"`)

  return `${importStr}\n\nconst code = \`...\`\n\n<CopyBlock\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, language: Language): string {
  const cls = tier === 'lite' ? 'ui-lite-copy-block' : 'ui-copy-block'
  return `<!-- CopyBlock — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/copy-block.css">

<div class="${cls}">
  ${tier !== 'lite' ? `<div class="ui-copy-block__header">
    <span class="ui-copy-block__title">Example</span>
    <span class="ui-copy-block__lang-badge">${language}</span>
  </div>` : `<div class="${cls}__header">
    <span class="${cls}__lang">${language}</span>
    <button class="${cls}__btn" aria-label="Copy code">Copy</button>
  </div>`}
  <pre${tier !== 'lite' ? ' class="ui-copy-block__pre"' : ''}>
    <code>// your code here</code>
  </pre>
</div>`
}

function generateVueCode(tier: Tier, language: Language, showLineNumbers: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <CopyBlock
    :code="code"
    language="${language}"
    ${showLineNumbers ? ':show-line-numbers="true"' : ''}
  />
</template>

<script setup>
import { CopyBlock } from '@annondeveloper/ui-kit/lite'
const code = '// your code here'
</script>`
  }
  return `<template>
  <CopyBlock
    :code="code"
    language="${language}"
    ${showLineNumbers ? '' : ':show-line-numbers="false"'}
    title="Example"
  />
</template>

<script setup>
import { CopyBlock } from '@annondeveloper/ui-kit'
const code = '// your code here'
</script>`
}

function generateAngularCode(tier: Tier): string {
  const cls = tier === 'lite' ? 'ui-lite-copy-block' : 'ui-copy-block'
  return `<!-- Angular — ${tier} tier (CSS-only approach) -->
<div class="${cls}">
  ${tier !== 'lite' ? `<div class="ui-copy-block__header">
    <span class="ui-copy-block__title">Example</span>
  </div>` : ''}
  <button (click)="copyCode()" aria-label="Copy code">Copy</button>
  <pre><code>{{ code }}</code></pre>
</div>

/* styles.css */
@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/copy-block.css'}';`
}

function generateSvelteCode(tier: Tier, language: Language, showLineNumbers: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { CopyBlock } from '@annondeveloper/ui-kit/lite';
  const code = '// your code here';
</script>

<CopyBlock
  {code}
  language="${language}"
  ${showLineNumbers ? 'showLineNumbers' : ''}
/>`
  }
  return `<script>
  import { CopyBlock } from '@annondeveloper/ui-kit';
  const code = '// your code here';
</script>

<CopyBlock
  {code}
  language="${language}"
  title="Example"
  ${showLineNumbers ? '' : 'showLineNumbers={false}'}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [language, setLanguage] = useState<Language>('typescript')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showHighlight, setShowHighlight] = useState(false)
  const [maxHeight, setMaxHeight] = useState('')
  const [title, setTitle] = useState('Example')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const highlight = showHighlight ? [1, 2, 5, 6] : []

  const reactCode = useMemo(() => generateReactCode(tier, language, showLineNumbers, highlight, maxHeight, title), [tier, language, showLineNumbers, highlight, maxHeight, title])
  const htmlCode = useMemo(() => generateHtmlCode(tier, language), [tier, language])
  const vueCode = useMemo(() => generateVueCode(tier, language, showLineNumbers), [tier, language, showLineNumbers])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, language, showLineNumbers), [tier, language, showLineNumbers])

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

  const sampleCode = LANG_SAMPLES[language].code

  return (
    <section className="copy-block-page__section" id="playground">
      <h2 className="copy-block-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="copy-block-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="copy-block-page__playground">
        <div className="copy-block-page__playground-preview">
          <div className="copy-block-page__playground-result" style={{ position: 'relative', zIndex: 1 }}>
            {tier === 'lite' ? (
              <LiteCopyBlock code={sampleCode} language={language} showLineNumbers={showLineNumbers} />
            ) : (
              <CopyBlock
                code={sampleCode}
                language={language}
                showLineNumbers={showLineNumbers}
                highlight={highlight.length > 0 ? highlight : undefined}
                maxHeight={maxHeight || undefined}
                title={title || undefined}
              />
            )}
          </div>

          <div className="copy-block-page__code-tabs">
            <div className="copy-block-page__export-row">
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
              {copyStatus && <span className="copy-block-page__export-status">{copyStatus}</span>}
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

        <div className="copy-block-page__playground-controls">
          <OptionGroup
            label="Language"
            options={['typescript', 'css', 'json', 'bash', 'html'] as const}
            value={language}
            onChange={setLanguage}
          />
          <div className="copy-block-page__control-group">
            <span className="copy-block-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Line numbers" checked={showLineNumbers} onChange={setShowLineNumbers} />
              {tier !== 'lite' && <Toggle label="Highlight lines" checked={showHighlight} onChange={setShowHighlight} />}
            </div>
          </div>
          {tier !== 'lite' && (
            <>
              <div className="copy-block-page__control-group">
                <span className="copy-block-page__control-label">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="copy-block-page__text-input"
                  placeholder="Header title..."
                />
              </div>
              <div className="copy-block-page__control-group">
                <span className="copy-block-page__control-label">Max Height</span>
                <input
                  type="text"
                  value={maxHeight}
                  onChange={e => setMaxHeight(e.target.value)}
                  className="copy-block-page__text-input"
                  placeholder="e.g., 200px"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CopyBlockPage() {
  useStyles('copy-block-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.copy-block-page__section')
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
    <div className="copy-block-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="copy-block-page__hero">
        <h1 className="copy-block-page__title">CopyBlock</h1>
        <p className="copy-block-page__desc">
          Code display component with syntax highlighting, line numbers, line highlighting,
          one-click copy to clipboard, and a scrollable body. Supports 7 languages with built-in tokenizers.
        </p>
        <div className="copy-block-page__import-row">
          <code className="copy-block-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Language Support ─────────────────────────── */}
      <section className="copy-block-page__section" id="languages">
        <h2 className="copy-block-page__section-title">
          <a href="#languages">Language Support</a>
        </h2>
        <p className="copy-block-page__section-desc">
          Built-in tokenizers for TypeScript/JavaScript, CSS, JSON, Bash, and HTML. Each language
          highlights keywords, strings, comments, and numbers with distinct colors.
        </p>
        <div className="copy-block-page__lang-grid">
          {(Object.entries(LANG_SAMPLES) as [Language, { code: string; label: string }][]).map(([lang, { code, label }]) => (
            <div key={lang} className="copy-block-page__lang-card">
              <span className="copy-block-page__lang-label">{label}</span>
              {tier === 'lite' ? (
                <LiteCopyBlock code={code.split('\n').slice(0, 6).join('\n')} language={lang} showLineNumbers />
              ) : (
                <CopyBlock code={code.split('\n').slice(0, 6).join('\n')} language={lang} showLineNumbers maxHeight="200px" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Line Highlighting ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="copy-block-page__section" id="highlight">
          <h2 className="copy-block-page__section-title">
            <a href="#highlight">Line Highlighting</a>
          </h2>
          <p className="copy-block-page__section-desc">
            Use the <code>highlight</code> prop to emphasize specific lines with a brand-tinted background.
            Pass an array of 1-based line numbers.
          </p>
          <div className="copy-block-page__preview">
            <CopyBlock
              code={SAMPLE_TS}
              language="typescript"
              showLineNumbers
              highlight={[1, 2, 5, 6]}
              title="counter.tsx"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<CopyBlock\n  code={code}\n  language="typescript"\n  highlight={[1, 2, 5, 6]}\n  title="counter.tsx"\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 5. Title Header ────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="copy-block-page__section" id="title-header">
          <h2 className="copy-block-page__section-title">
            <a href="#title-header">Title Header</a>
          </h2>
          <p className="copy-block-page__section-desc">
            Add a header bar with a title and language badge using the <code>title</code> prop.
            Useful for file names or descriptive labels.
          </p>
          <div className="copy-block-page__preview">
            <CopyBlock
              code={SAMPLE_JSON}
              language="json"
              showLineNumbers
              title="package.json"
            />
          </div>
        </section>
      )}

      {/* ── 6. Max Height Scrolling ────────────────────── */}
      {tier !== 'lite' && (
        <section className="copy-block-page__section" id="max-height">
          <h2 className="copy-block-page__section-title">
            <a href="#max-height">Scrollable with Max Height</a>
          </h2>
          <p className="copy-block-page__section-desc">
            Set <code>maxHeight</code> to constrain the code area and enable scrolling.
            The copy button copies the full code, not just the visible portion.
          </p>
          <div className="copy-block-page__preview">
            <CopyBlock
              code={SAMPLE_TS + '\n\n' + SAMPLE_CSS}
              language="typescript"
              showLineNumbers
              maxHeight="200px"
              title="large-file.tsx"
            />
          </div>
        </section>
      )}

      {/* ── 7. No Line Numbers ─────────────────────────── */}
      <section className="copy-block-page__section" id="no-line-numbers">
        <h2 className="copy-block-page__section-title">
          <a href="#no-line-numbers">Without Line Numbers</a>
        </h2>
        <p className="copy-block-page__section-desc">
          Set <code>showLineNumbers={'{false}'}</code> for compact inline code snippets.
        </p>
        <div className="copy-block-page__preview">
          {tier === 'lite' ? (
            <LiteCopyBlock
              code={`npm install @annondeveloper/ui-kit`}
              language="bash"
              showLineNumbers={false}
            />
          ) : (
            <CopyBlock
              code={`npm install @annondeveloper/ui-kit`}
              language="bash"
              showLineNumbers={false}
            />
          )}
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="copy-block-page__section" id="tiers">
        <h2 className="copy-block-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="copy-block-page__section-desc">
          The Lite tier provides copy-to-clipboard with plain text rendering. Standard adds syntax
          highlighting, line highlighting, title header, and max-height scrolling.
        </p>

        <div className="copy-block-page__tiers">
          {/* Lite */}
          <div
            className={`copy-block-page__tier-card${tier === 'lite' ? ' copy-block-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="copy-block-page__tier-header">
              <span className="copy-block-page__tier-name">Lite</span>
              <span className="copy-block-page__tier-size">~0.3 KB</span>
            </div>
            <p className="copy-block-page__tier-desc">
              Plain text display with copy button. No syntax highlighting,
              no line highlighting, no title header. Just code and copy.
            </p>
            <div className="copy-block-page__tier-import">
              import {'{'} CopyBlock {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="copy-block-page__tier-preview">
              <LiteCopyBlock code="const x = 42" language="typescript" />
            </div>
            <div className="copy-block-page__size-breakdown">
              <div className="copy-block-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`copy-block-page__tier-card${tier === 'standard' ? ' copy-block-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="copy-block-page__tier-header">
              <span className="copy-block-page__tier-name">Standard</span>
              <span className="copy-block-page__tier-size">~3.5 KB</span>
            </div>
            <p className="copy-block-page__tier-desc">
              Full-featured with syntax highlighting tokenizers for 7 languages,
              line highlighting, title header, language badge, and max-height scroll.
            </p>
            <div className="copy-block-page__tier-import">
              import {'{'} CopyBlock {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="copy-block-page__tier-preview">
              <CopyBlock code="const x = 42" language="typescript" title="example.ts" />
            </div>
            <div className="copy-block-page__size-breakdown">
              <div className="copy-block-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`copy-block-page__tier-card${tier === 'premium' ? ' copy-block-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="copy-block-page__tier-header">
              <span className="copy-block-page__tier-name">Premium</span>
              <span className="copy-block-page__tier-size">~3-5 KB</span>
            </div>
            <p className="copy-block-page__tier-desc">
              Aurora glow on copy button and container hover, spring-scale click feedback, and shimmer on highlighted lines.
            </p>
            <div className="copy-block-page__tier-import">
              import {'{'} CopyBlock {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="copy-block-page__tier-preview">
              <CopyBlock code="const x = 42" language="typescript" title="example.ts" />
            </div>
            <div className="copy-block-page__size-breakdown">
              <div className="copy-block-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="copy-block-page__section" id="props">
        <h2 className="copy-block-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="copy-block-page__section-desc">
          All props accepted by CopyBlock. It also spreads any native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={copyBlockProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="copy-block-page__section" id="accessibility">
        <h2 className="copy-block-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="copy-block-page__section-desc">
          Built with semantic pre/code elements and accessible copy interaction.
        </p>
        <Card variant="default" padding="md">
          <ul className="copy-block-page__a11y-list">
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic markup:</strong> Uses <code className="copy-block-page__a11y-key">&lt;pre&gt;</code> and <code className="copy-block-page__a11y-key">&lt;code&gt;</code> elements for proper code semantics.
              </span>
            </li>
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Copy button:</strong> Has <code className="copy-block-page__a11y-key">aria-label="Copy code"</code> and focus-visible ring.
              </span>
            </li>
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Line numbers:</strong> Marked as <code className="copy-block-page__a11y-key">aria-hidden="true"</code> and <code className="copy-block-page__a11y-key">user-select: none</code> so they are not copied or read.
              </span>
            </li>
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Clipboard fallback:</strong> Falls back to <code className="copy-block-page__a11y-key">document.execCommand</code> when the Clipboard API is not available.
              </span>
            </li>
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="copy-block-page__a11y-key">forced-colors: active</code> — syntax colors revert to inherit, highlighted lines use system Highlight.
              </span>
            </li>
            <li className="copy-block-page__a11y-item">
              <span className="copy-block-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Copy button hidden in <code className="copy-block-page__a11y-key">@media print</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
