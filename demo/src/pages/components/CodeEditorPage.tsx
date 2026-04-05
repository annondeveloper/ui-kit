'use client'

import { useState, useEffect, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CodeEditor } from '@ui/domain/code-editor'
import { CodeEditor as LiteCodeEditor } from '@ui/lite/code-editor'
import { CodeEditor as PremiumCodeEditor } from '@ui/premium/code-editor'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Sample Code ─────────────────────────────────────────────────────────────

const TS_SAMPLE = `import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  return { users, loading }
}`

const JSON_SAMPLE = `{
  "name": "@ui-kit/core",
  "version": "2.3.0",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./css/*": "./dist/css/*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`

const PYTHON_SAMPLE = `def fibonacci(n: int) -> list[int]:
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    sequence = [0, 1]
    for _ in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

# Print first 10 numbers
for num in fibonacci(10):
    print(num)`

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled editor content.' },
  { name: 'defaultValue', type: 'string', description: 'Initial content for uncontrolled mode.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called on every content change.' },
  { name: 'language', type: 'CodeEditorLanguage', description: 'Language for syntax highlighting.' },
  { name: 'readOnly', type: 'boolean', description: 'Prevent editing when true.' },
  { name: 'showLineNumbers', type: 'boolean', description: 'Show line number gutter.' },
  { name: 'lineNumberStart', type: 'number', description: 'First line number to display.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when the editor is empty.' },
  { name: 'minHeight', type: 'string | number', description: 'Minimum block size of the editor area.' },
  { name: 'maxHeight', type: 'string | number', description: 'Maximum block size before scrolling.' },
  { name: 'wordWrap', type: 'boolean', description: 'Wrap long lines instead of horizontal scroll.' },
  { name: 'tabSize', type: 'number', description: 'Number of spaces per tab indent.' },
  { name: 'highlightActiveLine', type: 'boolean', description: 'Highlight the line containing the cursor.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.code-editor-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .code-editor-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .code-editor-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .code-editor-page__hero::before { animation: none; } }

      .code-editor-page__title {
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

      .code-editor-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .code-editor-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .code-editor-page__import-code {
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
      }

      .code-editor-page__section {
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
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .code-editor-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .code-editor-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .code-editor-page__section-title a { color: inherit; text-decoration: none; }
      .code-editor-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .code-editor-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .code-editor-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .code-editor-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .code-editor-page__lang-tabs {
        display: flex;
        gap: 0.5rem;
        margin-block-end: 1rem;
        flex-wrap: wrap;
      }

      .code-editor-page__char-count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        margin-block-start: 0.75rem;
        text-align: end;
      }

      /* ── Tiers ───────────────────────────────── */

      .code-editor-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .code-editor-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .code-editor-page__tier-card:hover { border-color: var(--border-default); }
      .code-editor-page__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

      .code-editor-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .code-editor-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .code-editor-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .code-editor-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .code-editor-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }

      .code-editor-page__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      @container (max-width: 640px) {
        .code-editor-page__tiers { grid-template-columns: 1fr; }
      }

      /* ── Playground ─────────────────────────────── */

      .code-editor-page__playground {
        display: grid;
        grid-template-columns: 1fr 260px;
        gap: 1.5rem;
      }

      @container (max-width: 640px) {
        .code-editor-page__playground { grid-template-columns: 1fr; }
      }

      .code-editor-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .code-editor-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .code-editor-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .code-editor-page__control-select {
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        background: var(--bg-surface);
        color: var(--text-primary);
        font-size: var(--text-sm, 0.875rem);
      }

      .code-editor-page__control-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        cursor: pointer;
      }

      .code-editor-page__code-tabs {
        display: flex;
        gap: 0.25rem;
        margin-block-start: 1rem;
        flex-wrap: wrap;
      }

      /* ── Accessibility ──────────────────────────── */

      .code-editor-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .code-editor-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        line-height: 1.5;
      }

      .code-editor-page__a11y-icon {
        color: oklch(65% 0.18 145);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .code-editor-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }
    }
  }
`

const IMPORT_STR = "import { CodeEditor } from '@ui/domain/code-editor'"

type Lang = 'typescript' | 'json' | 'python'

type EditorConfig = {
  language: Lang
  showLineNumbers: boolean
  readOnly: boolean
  wordWrap: boolean
  highlightActiveLine: boolean
  tabSize: number
  tier: Tier
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(cfg: EditorConfig): string {
  const importPath = cfg.tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : cfg.tier === 'premium'
      ? "@annondeveloper/ui-kit/premium"
      : "@annondeveloper/ui-kit"

  const props: string[] = []
  props.push(`  language="${cfg.language}"`)
  if (cfg.showLineNumbers) props.push('  showLineNumbers')
  if (cfg.readOnly) props.push('  readOnly')
  if (cfg.wordWrap) props.push('  wordWrap')
  if (cfg.highlightActiveLine && cfg.tier !== 'lite') props.push('  highlightActiveLine')
  if (cfg.tabSize !== 2) props.push(`  tabSize={${cfg.tabSize}}`)
  props.push('  maxHeight="400px"')

  return `import { CodeEditor } from '${importPath}'

<CodeEditor
  value={code}
  onChange={setCode}
${props.join('\n')}
/>`
}

function generateHtmlExport(cfg: EditorConfig): string {
  const cssImport = cfg.tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/code-editor.css';`

  return `<!-- CodeEditor — @annondeveloper/ui-kit ${cfg.tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cfg.tier === 'lite' ? 'lite/styles.css' : 'css/components/code-editor.css'}">

<div class="ui-code-editor" data-language="${cfg.language}"${cfg.readOnly ? ' data-readonly' : ''}>
  <textarea
    spellcheck="false"
    ${cfg.readOnly ? 'readonly' : ''}
  ></textarea>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(cfg: EditorConfig): string {
  if (cfg.tier === 'lite') {
    return `<template>
  <div class="ui-code-editor" data-language="${cfg.language}">
    <textarea v-model="code" spellcheck="false"${cfg.readOnly ? ' readonly' : ''} />
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = cfg.tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  attrs.push(`  :value="code"`)
  attrs.push(`  @change="code = $event"`)
  attrs.push(`  language="${cfg.language}"`)
  if (cfg.showLineNumbers) attrs.push('  show-line-numbers')
  if (cfg.readOnly) attrs.push('  read-only')
  if (cfg.highlightActiveLine) attrs.push('  highlight-active-line')

  return `<template>
  <CodeEditor
${attrs.join('\n')}
  />
</template>

<script setup>
import { CodeEditor } from '${importPath}'
import { ref } from 'vue'

const code = ref('')
</script>`
}

function generateAngularCode(cfg: EditorConfig): string {
  const cssImport = cfg.tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : cfg.tier === 'premium'
      ? `@import '@annondeveloper/ui-kit/premium/css/components/code-editor.css';`
      : `@import '@annondeveloper/ui-kit/css/components/code-editor.css';`

  const attrs = [`class="ui-code-editor"`, `data-language="${cfg.language}"`]
  if (cfg.readOnly) attrs.push('[attr.data-readonly]="true"')

  return `<!-- Angular — ${cfg.tier === 'lite' ? 'Lite' : cfg.tier === 'premium' ? 'Premium' : 'Standard'} tier (CSS-only approach) -->
<div ${attrs.join(' ')}>
  <textarea
    [(ngModel)]="code"
    spellcheck="false"
    ${cfg.readOnly ? 'readonly' : ''}
  ></textarea>
</div>

/* In styles.css */
${cssImport}`
}

function generateSvelteCode(cfg: EditorConfig): string {
  if (cfg.tier === 'lite') {
    return `<!-- Svelte — Lite tier -->
<div class="ui-code-editor" data-language="${cfg.language}">
  <textarea bind:value={code} spellcheck="false"${cfg.readOnly ? ' readonly' : ''} />
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = cfg.tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  attrs.push(`  value={code}`)
  attrs.push(`  on:change={(e) => code = e.detail}`)
  attrs.push(`  language="${cfg.language}"`)
  if (cfg.showLineNumbers) attrs.push('  showLineNumbers')
  if (cfg.readOnly) attrs.push('  readOnly')
  if (cfg.highlightActiveLine) attrs.push('  highlightActiveLine')

  return `<script>
  import { CodeEditor } from '${importPath}';
  let code = '';
</script>

<CodeEditor
${attrs.join('\n')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [pgLang, setPgLang] = useState<Lang>('typescript')
  const [pgLineNumbers, setPgLineNumbers] = useState(true)
  const [pgReadOnly, setPgReadOnly] = useState(false)
  const [pgWordWrap, setPgWordWrap] = useState(false)
  const [pgHighlightActive, setPgHighlightActive] = useState(true)
  const [pgTabSize, setPgTabSize] = useState(2)
  const [pgCode, setPgCode] = useState(TS_SAMPLE)
  const [pgMotion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const SAMPLES_MAP: Record<Lang, string> = { typescript: TS_SAMPLE, json: JSON_SAMPLE, python: PYTHON_SAMPLE }

  const ActiveEditor = tier === 'lite' ? LiteCodeEditor : tier === 'premium' ? PremiumCodeEditor : CodeEditor

  const cfg: EditorConfig = {
    language: pgLang,
    showLineNumbers: pgLineNumbers,
    readOnly: pgReadOnly,
    wordWrap: pgWordWrap,
    highlightActiveLine: pgHighlightActive,
    tabSize: pgTabSize,
    tier,
  }

  const reactCode = useMemo(() => generateReactCode(cfg), [pgLang, pgLineNumbers, pgReadOnly, pgWordWrap, pgHighlightActive, pgTabSize, tier])
  const htmlCode = useMemo(() => generateHtmlExport(cfg), [pgLang, pgReadOnly, tier])
  const vueCode = useMemo(() => generateVueCode(cfg), [pgLang, pgLineNumbers, pgReadOnly, pgHighlightActive, tier])
  const angularCode = useMemo(() => generateAngularCode(cfg), [pgLang, pgReadOnly, tier])
  const svelteCode = useMemo(() => generateSvelteCode(cfg), [pgLang, pgLineNumbers, pgReadOnly, pgHighlightActive, tier])

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
    <section className="code-editor-page__section" id="playground">
      <h2 className="code-editor-page__section-title">
        <a href="#playground">Playground</a>
      </h2>
      <p className="code-editor-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="code-editor-page__playground">
        {/* Preview area */}
        <div>
          <div className="code-editor-page__preview">
            <ActiveEditor
              value={pgCode}
              onChange={setPgCode}
              language={pgLang}
              showLineNumbers={pgLineNumbers}
              readOnly={pgReadOnly}
              wordWrap={pgWordWrap}
              highlightActiveLine={pgHighlightActive}
              tabSize={pgTabSize}
              motion={pgMotion}
              maxHeight="300px"
            />
          </div>

          {/* Code output tabs */}
          <div className="code-editor-page__code-tabs">
            {codeTabs.map(tab => (
              <Button
                key={tab.id}
                size="xs"
                variant={activeCodeTab === tab.id ? 'primary' : 'secondary'}
                onClick={() => setActiveCodeTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <CopyBlock code={activeCode} language="typescript" />
        </div>

        {/* Controls */}
        <div className="code-editor-page__playground-controls">
          <div className="code-editor-page__control-group">
            <span className="code-editor-page__control-label">Language</span>
            <select
              className="code-editor-page__control-select"
              value={pgLang}
              onChange={e => { const l = e.target.value as Lang; setPgLang(l); setPgCode(SAMPLES_MAP[l]) }}
            >
              <option value="typescript">TypeScript</option>
              <option value="json">JSON</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="code-editor-page__control-group">
            <span className="code-editor-page__control-label">Tab Size</span>
            <select
              className="code-editor-page__control-select"
              value={pgTabSize}
              onChange={e => setPgTabSize(Number(e.target.value))}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>

          <label className="code-editor-page__control-toggle">
            <input type="checkbox" checked={pgLineNumbers} onChange={e => setPgLineNumbers(e.target.checked)} />
            Line numbers
          </label>

          <label className="code-editor-page__control-toggle">
            <input type="checkbox" checked={pgReadOnly} onChange={e => setPgReadOnly(e.target.checked)} />
            Read only
          </label>

          <label className="code-editor-page__control-toggle">
            <input type="checkbox" checked={pgWordWrap} onChange={e => setPgWordWrap(e.target.checked)} />
            Word wrap
          </label>

          <label className="code-editor-page__control-toggle">
            <input type="checkbox" checked={pgHighlightActive} onChange={e => setPgHighlightActive(e.target.checked)} />
            Highlight active line
          </label>

          <div className="code-editor-page__control-group">
            <span className="code-editor-page__control-label">Motion Level</span>
            <select
              className="code-editor-page__control-select"
              value={pgMotion}
              onChange={e => setMotion(Number(e.target.value) as 0 | 1 | 2 | 3)}
            >
              <option value="0">0 — None</option>
              <option value="1">1 — Subtle</option>
              <option value="2">2 — Expressive</option>
              <option value="3">3 — Cinematic</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CodeEditorPage() {
  useStyles('code-editor-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveCodeEditor = tier === 'lite' ? LiteCodeEditor : tier === 'premium' ? PremiumCodeEditor : CodeEditor

  const [lang, setLang] = useState<Lang>('typescript')
  const [code, setCode] = useState(TS_SAMPLE)

  const SAMPLES: Record<Lang, string> = { typescript: TS_SAMPLE, json: JSON_SAMPLE, python: PYTHON_SAMPLE }

  useEffect(() => {
    const sections = document.querySelectorAll('.code-editor-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="code-editor-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="code-editor-page__hero">
        <h1 className="code-editor-page__title">CodeEditor</h1>
        <p className="code-editor-page__desc">
          Lightweight code editor with built-in syntax highlighting for 8 languages, line numbers,
          active line highlight, and keyboard shortcuts. Zero external dependencies.
        </p>
        <div className="code-editor-page__import-row">
          <code className="code-editor-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Multi-Language ─────────────────────────── */}
      <section className="code-editor-page__section" id="languages">
        <h2 className="code-editor-page__section-title"><a href="#languages">Multi-Language Highlighting</a></h2>
        <p className="code-editor-page__section-desc">
          Switch between languages to see syntax highlighting adapt. The editor tokenizes
          keywords, strings, comments, numbers, and operators per language grammar.
        </p>
        <div className="code-editor-page__lang-tabs">
          {(['typescript', 'json', 'python'] as Lang[]).map(l => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? 'primary' : 'secondary'}
              onClick={() => { setLang(l); setCode(SAMPLES[l]) }}
            >
              {l}
            </Button>
          ))}
        </div>
        <div className="code-editor-page__preview">
          <ActiveCodeEditor
            value={code}
            onChange={setCode}
            language={lang}
            showLineNumbers
            highlightActiveLine
            maxHeight="400px"
          />
          <div className="code-editor-page__char-count">{code.length} characters</div>
        </div>
      </section>

      {/* ── 2. Read-Only ──────────────────────────────── */}
      <section className="code-editor-page__section" id="readonly">
        <h2 className="code-editor-page__section-title"><a href="#readonly">Read-Only Mode</a></h2>
        <p className="code-editor-page__section-desc">
          Use <code>readOnly</code> for documentation snippets or config display. The cursor changes
          to default and input is disabled while keeping selection and copy functionality.
        </p>
        <div className="code-editor-page__preview">
          <ActiveCodeEditor
            value={JSON_SAMPLE}
            language="json"
            readOnly
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 3. Customization ──────────────────────────── */}
      <section className="code-editor-page__section" id="options">
        <h2 className="code-editor-page__section-title"><a href="#options">Customization Options</a></h2>
        <p className="code-editor-page__section-desc">
          Hide line numbers, enable word wrap for narrow containers, adjust tab size, or
          set a placeholder for empty editors.
        </p>
        <div className="code-editor-page__preview">
          <ActiveCodeEditor
            defaultValue=""
            language="typescript"
            placeholder="Start typing your code here..."
            showLineNumbers={false}
            wordWrap
            minHeight="120px"
          />
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────── */}
      <section className="code-editor-page__section" id="tiers">
        <h2 className="code-editor-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="code-editor-page__section-desc">
          Choose the right balance of features and bundle size. Lite is a plain textarea with
          optional line numbers but no syntax highlighting; Standard adds full tokenized
          highlighting for 8 languages, active-line tracking, word wrap, and tab-size control;
          Premium wraps Standard with aurora focus glow, spring-animated active line numbers,
          and keyword shimmer.
        </p>
        <div className="code-editor-page__tiers">
          {/* Lite */}
          <div className={`code-editor-page__tier-card${tier === 'lite' ? ' code-editor-page__tier-card--active' : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="code-editor-page__tier-header">
              <span className="code-editor-page__tier-name">Lite</span>
              <span className="code-editor-page__tier-size">~0.5 KB gzip</span>
            </div>
            <p className="code-editor-page__tier-desc">
              Plain textarea with optional line-number gutter. Controlled and uncontrolled modes.
              No syntax highlighting, no active line, no maxHeight or wordWrap props.
            </p>
            <div className="code-editor-page__tier-import">
              import {'{'} CodeEditor {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="code-editor-page__tier-preview">
              <LiteCodeEditor defaultValue={'const x = 1\nconst y = 2'} showLineNumbers minHeight="80px" />
            </div>
          </div>

          {/* Standard */}
          <div className={`code-editor-page__tier-card${tier === 'standard' ? ' code-editor-page__tier-card--active' : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="code-editor-page__tier-header">
              <span className="code-editor-page__tier-name">Standard</span>
              <span className="code-editor-page__tier-size">~4.1 KB gzip</span>
            </div>
            <p className="code-editor-page__tier-desc">
              Tokenized syntax highlighting for TypeScript, JavaScript, JSON, Python, CSS, HTML,
              Bash, and SQL. Active line, word wrap, configurable tab size, and placeholder text.
            </p>
            <div className="code-editor-page__tier-import">
              import {'{'} CodeEditor {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="code-editor-page__tier-preview">
              <CodeEditor defaultValue={'const x = 1\nconst y = 2'} language="typescript" showLineNumbers highlightActiveLine maxHeight="100px" />
            </div>
          </div>

          {/* Premium */}
          <div className={`code-editor-page__tier-card${tier === 'premium' ? ' code-editor-page__tier-card--active' : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="code-editor-page__tier-header">
              <span className="code-editor-page__tier-name">Premium</span>
              <span className="code-editor-page__tier-size">~4.5 KB gzip</span>
            </div>
            <p className="code-editor-page__tier-desc">
              Wraps Standard with aurora glow on focus, spring-scale animation on active line numbers,
              keyword text-shadow shimmer, and motion-level-aware degradation.
            </p>
            <div className="code-editor-page__tier-import">
              import {'{'} CodeEditor {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="code-editor-page__tier-preview">
              <PremiumCodeEditor defaultValue={'const x = 1\nconst y = 2'} language="typescript" showLineNumbers highlightActiveLine maxHeight="100px" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Playground ────────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── Props ─────────────────────────────────────── */}
      <section className="code-editor-page__section" id="props">
        <h2 className="code-editor-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>

      {/* ── Accessibility ─────────────────────────────── */}
      <section className="code-editor-page__section" id="accessibility">
        <h2 className="code-editor-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="code-editor-page__section-desc">
          CodeEditor is built with accessibility in mind, using semantic HTML and ARIA attributes
          to ensure a usable experience for keyboard and screen reader users.
        </p>
        <ul className="code-editor-page__a11y-list">
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>Keyboard navigation:</strong> Full <code className="code-editor-page__a11y-key">Tab</code> key support for indentation, <code className="code-editor-page__a11y-key">Shift+Tab</code> for outdent, and <code className="code-editor-page__a11y-key">Enter</code> for auto-indent on new lines.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>Focus management:</strong> Visible focus ring with brand-colored glow via <code className="code-editor-page__a11y-key">:focus-visible</code>. Focus is contained within the editor textarea.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>ARIA roles:</strong> Uses <code className="code-editor-page__a11y-key">role="textbox"</code> with <code className="code-editor-page__a11y-key">aria-multiline="true"</code> to identify the editor to assistive technologies.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>Read-only state:</strong> Announces <code className="code-editor-page__a11y-key">aria-readonly="true"</code> when the editor is in read-only mode.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>Contrast:</strong> Syntax highlighting colors meet WCAG AA contrast ratio (4.5:1 for text) against the editor background.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>Reduced motion:</strong> Respects <code className="code-editor-page__a11y-key">prefers-reduced-motion</code> by disabling cursor blink and active line animations.
            </span>
          </li>
          <li className="code-editor-page__a11y-item">
            <span className="code-editor-page__a11y-icon">&#10003;</span>
            <span>
              <strong>High contrast:</strong> Supports <code className="code-editor-page__a11y-key">forced-colors: active</code> with visible borders and system color tokens.
            </span>
          </li>
        </ul>
      </section>

      {/* ── Source ──────────────────────────────────────── */}
      <section className="code-editor-page__section" id="source">
        <h2 className="code-editor-page__section-title"><a href="#source">Source</a></h2>
        <p className="code-editor-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/code-editor.tsx" target="_blank" rel="noopener noreferrer">
            src/domain/code-editor.tsx (Standard)
          </a>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/code-editor.tsx" target="_blank" rel="noopener noreferrer">
            src/lite/code-editor.tsx (Lite)
          </a>
          <a href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/code-editor.tsx" target="_blank" rel="noopener noreferrer">
            src/premium/code-editor.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
