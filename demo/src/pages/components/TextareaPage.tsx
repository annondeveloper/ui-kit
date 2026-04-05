'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Textarea } from '@ui/components/textarea'
import { Textarea as LiteTextarea } from '@ui/lite/textarea'
import { Textarea as PremiumTextarea } from '@ui/premium/textarea'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ta-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ta-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ta-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ta-page__hero::before {
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
        .ta-page__hero::before { animation: none; }
      }

      .ta-page__title {
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

      .ta-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ta-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ta-page__import-code {
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

      .ta-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .ta-page__section {
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
        animation: ta-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ta-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .ta-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .ta-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .ta-page__section-title a { color: inherit; text-decoration: none; }
      .ta-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .ta-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .ta-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .ta-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ta-page__preview--col {
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 480px;
        margin-inline: auto;
      }

      /* ── Playground ─────────────────────────────────── */

      .ta-page__playground {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
      }

      @container ta-page (max-width: 640px) {
        .ta-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .ta-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .ta-page__playground-control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ta-page__playground-control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ta-page__playground-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ta-page__playground-opt {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm, 4px);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .ta-page__playground-opt:hover {
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .ta-page__playground-opt[data-active='true'] {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        color: white;
      }

      .ta-page__playground-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        cursor: pointer;
      }

      .ta-page__playground-toggle input {
        accent-color: var(--brand, oklch(65% 0.2 270));
      }

      .ta-page__playground-result {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        min-block-size: 200px;
      }

      .ta-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ta-page__playground-live {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 480px;
        margin-inline: auto;
        inline-size: 100%;
      }

      /* ── Code tabs ───────────────────────────────────── */

      .ta-page__code-tabs {
        display: flex;
        gap: 0;
        border-block-end: 1px solid var(--border-default);
        margin-block-start: 0.5rem;
      }

      .ta-page__code-tab {
        padding: 0.5rem 1rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        border: none;
        background: none;
        border-block-end: 2px solid transparent;
        transition: all 0.15s ease;
      }

      .ta-page__code-tab:hover { color: var(--text-primary); }

      .ta-page__code-tab[data-active='true'] {
        color: var(--brand, oklch(65% 0.2 270));
        border-block-end-color: var(--brand, oklch(65% 0.2 270));
      }

      .ta-page__code-block {
        position: relative;
        background: oklch(0% 0 0 / 0.3);
        border-radius: var(--radius-md);
        padding: 1rem;
        overflow-x: auto;
      }

      .ta-page__code-block pre {
        margin: 0;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        line-height: 1.6;
        color: var(--text-primary);
        white-space: pre-wrap;
      }

      .ta-page__code-copy {
        position: absolute;
        inset-block-start: 0.5rem;
        inset-inline-end: 0.5rem;
      }

      /* ── Accessibility ───────────────────────────────── */

      .ta-page__a11y-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.75rem;
      }

      .ta-page__a11y-card {
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        border: 1px solid var(--border-subtle);
      }

      .ta-page__a11y-card h4 {
        margin: 0 0 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .ta-page__a11y-card p {
        margin: 0;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const taProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled value.' },
  { name: 'defaultValue', type: 'string', description: 'Initial uncontrolled value.' },
  { name: 'onChange', type: '(e: React.ChangeEvent<HTMLTextAreaElement>) => void', description: 'Callback on value change.' },
  { name: 'label', type: 'string', description: 'Label text above input.' },
  { name: 'description', type: 'string', description: 'Helper text below input.' },
  { name: 'error', type: 'string', description: 'Error message below input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Component size.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'required', type: 'boolean', description: 'Marks as required.' },
  { name: 'autoResize', type: 'boolean', description: 'Auto resize toggle.' },
  { name: 'minRows', type: 'number', default: '3', description: 'Minimum number of visible rows.' },
  { name: 'maxRows', type: 'number', description: 'Maximum rows before scrolling when autoResize is enabled.' },
  { name: 'maxLength', type: 'number', description: 'Maximum character length.' },
  { name: 'showCount', type: 'boolean', description: 'Show count toggle.' },
  { name: 'resize', type: "'none' | 'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'CSS resize behavior.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Code Generators ────────────────────────────────────────────────────────

type Tier = 'lite' | 'standard' | 'premium'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Resize = 'none' | 'vertical' | 'horizontal' | 'both'

function generateReactCode(
  tier: Tier, size: Size, placeholder: string, disabled: boolean,
  readOnly: boolean, required: boolean, rows: number, maxLength: number,
  resize: Resize, motion: 0 | 1 | 2 | 3,
): string {
  const importPath = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : tier === 'premium'
      ? "@annondeveloper/ui-kit/premium"
      : "@annondeveloper/ui-kit"
  const props: string[] = []
  props.push(`  label="Message"`)
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (readOnly) props.push('  readOnly')
  if (required) props.push('  required')
  if (rows !== 3) props.push(`  minRows={${rows}}`)
  if (maxLength > 0) props.push(`  maxLength={${maxLength}}`)
  if (maxLength > 0) props.push('  showCount')
  if (resize !== 'vertical') props.push(`  resize="${resize}"`)
  if (tier !== 'lite' && motion !== 3) props.push(`  motion={${motion}}`)
  return `import { Textarea } from '${importPath}'\n\n<Textarea\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier, size: Size, placeholder: string, disabled: boolean,
  rows: number, maxLength: number, resize: Resize,
): string {
  const cls = tier === 'lite' ? 'ui-lite-textarea' : 'ui-textarea'
  const attrs: string[] = [`class="${cls}"`, `data-size="${size}"`]
  if (placeholder) attrs.push(`placeholder="${placeholder}"`)
  if (disabled) attrs.push('disabled')
  if (rows !== 3) attrs.push(`rows="${rows}"`)
  if (maxLength > 0) attrs.push(`maxlength="${maxLength}"`)
  const cssImport = tier === 'lite'
    ? "@import '@annondeveloper/ui-kit/css/lite/textarea.css';"
    : "@import '@annondeveloper/ui-kit/css/components/textarea.css';"
  const style = resize !== 'vertical' ? `\n\n<style>\n  .${cls} textarea { resize: ${resize}; }\n</style>` : ''
  return `<div ${attrs.join(' ')}>\n  <label>Message</label>\n  <textarea ${attrs.filter(a => a !== `class="${cls}"` && a !== `data-size="${size}"`).join(' ')}></textarea>\n</div>${style}\n\n<style>\n  ${cssImport}\n</style>`
}

function generateVueCode(
  tier: Tier, size: Size, placeholder: string, disabled: boolean,
  rows: number, maxLength: number,
): string {
  const importPath = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : tier === 'premium'
      ? "@annondeveloper/ui-kit/premium"
      : "@annondeveloper/ui-kit"
  const props: string[] = [`  label="Message"`]
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  :disabled="true"')
  if (rows !== 3) props.push(`  :min-rows="${rows}"`)
  if (maxLength > 0) props.push(`  :max-length="${maxLength}"`)
  if (maxLength > 0) props.push('  show-count')
  return `<template>\n  <Textarea\n  ${props.join('\n  ')}\n    v-model="text"\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { Textarea } from '${importPath}'\n\nconst text = ref('')\n</script>`
}

function generateAngularCode(
  tier: Tier, size: Size, placeholder: string, disabled: boolean,
  rows: number, maxLength: number,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-textarea"`, `data-size="${size}"`]
    if (disabled) attrs.push('[disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <label>Message</label>\n  <textarea\n    ${placeholder ? `placeholder="${placeholder}"` : ''}\n    ${rows !== 3 ? `rows="${rows}"` : ''}\n    ${maxLength > 0 ? `maxlength="${maxLength}"` : ''}\n  ></textarea>\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/css/lite/textarea.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<div\n  class="ui-textarea"\n  data-size="${size}"\n  ${disabled ? '[attr.data-disabled]="true"' : ''}\n>\n  <label>Message</label>\n  <textarea\n    ${placeholder ? `placeholder="${placeholder}"` : ''}\n    ${rows !== 3 ? `rows="${rows}"` : ''}\n    ${maxLength > 0 ? `maxlength="${maxLength}"` : ''}\n    [(ngModel)]="text"\n  ></textarea>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/textarea.css';`
}

function generateSvelteCode(
  tier: Tier, size: Size, placeholder: string, disabled: boolean,
  rows: number, maxLength: number,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div class="ui-lite-textarea" data-size="${size}">\n  <label>Message</label>\n  <textarea\n    bind:value={text}\n    ${placeholder ? `placeholder="${placeholder}"` : ''}\n    ${disabled ? 'disabled' : ''}\n    ${rows !== 3 ? `rows="${rows}"` : ''}\n    ${maxLength > 0 ? `maxlength="${maxLength}"` : ''}\n  ></textarea>\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/css/lite/textarea.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = [`  label="Message"`]
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (rows !== 3) props.push(`  minRows={${rows}}`)
  if (maxLength > 0) props.push(`  maxLength={${maxLength}}`)
  if (maxLength > 0) props.push('  showCount')
  return `<script>\n  import { Textarea } from '${importPath}';\n</script>\n\n<Textarea\n${props.join('\n')}\n  bind:value={text}\n/>`
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="ta-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string | number>({
  label, options, value, onChange,
}: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="ta-page__playground-control-group">
      <span className="ta-page__playground-control-label">{label}</span>
      <div className="ta-page__playground-options">
        {options.map(opt => (
          <button
            key={String(opt)}
            className="ta-page__playground-opt"
            data-active={opt === value}
            onClick={() => onChange(opt)}
          >
            {String(opt)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ta-page__playground-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Textarea } from '@anthropic/ui-kit'"

export default function TextareaPage() {
  useStyles('ta-page', pageStyles)
  const { tier } = useTier()

  // Playground state
  const [size, setSize] = useState<Size>('md')
  const [placeholder, setPlaceholder] = useState('Type your message...')
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [required, setRequired] = useState(false)
  const [rows, setRows] = useState(3)
  const [maxLength, setMaxLength] = useState(0)
  const [resize, setResize] = useState<Resize>('vertical')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const TextareaComponent = tier === 'lite' ? LiteTextarea : tier === 'premium' ? PremiumTextarea : Textarea

  const reactCode = useMemo(
    () => generateReactCode(tier as Tier, size, placeholder, disabled, readOnly, required, rows, maxLength, resize, motion),
    [tier, size, placeholder, disabled, readOnly, required, rows, maxLength, resize, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier as Tier, size, placeholder, disabled, rows, maxLength, resize),
    [tier, size, placeholder, disabled, rows, maxLength, resize],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier as Tier, size, placeholder, disabled, rows, maxLength),
    [tier, size, placeholder, disabled, rows, maxLength],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier as Tier, size, placeholder, disabled, rows, maxLength),
    [tier, size, placeholder, disabled, rows, maxLength],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier as Tier, size, placeholder, disabled, rows, maxLength),
    [tier, size, placeholder, disabled, rows, maxLength],
  )

  const activeCode = activeCodeTab === 'react' ? reactCode
    : activeCodeTab === 'html' ? htmlCode
    : activeCodeTab === 'vue' ? vueCode
    : activeCodeTab === 'angular' ? angularCode
    : svelteCode

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(activeCode)
  }, [activeCode])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  return (
    <div className="ta-page">
      <div className="ta-page__hero">
        <h1 className="ta-page__title">Textarea</h1>
        <p className="ta-page__desc">
          Multi-line text input with auto-resize, character counter, and configurable row bounds.
          Supports all standard textarea behaviors with enhanced UX.
        </p>
        <div className="ta-page__import-row">
          <code className="ta-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Playground ─────────────────────────────────── */}
      <section className="ta-page__section" id="playground">
        <h2 className="ta-page__section-title"><a href="#playground">Playground</a></h2>
        <p className="ta-page__section-desc">
          Interactively configure the Textarea component and copy generated code for your framework.
        </p>

        <div className="ta-page__playground">
          <div className="ta-page__playground-controls">
            <OptionGroup label="Size" options={['xs', 'sm', 'md', 'lg', 'xl'] as Size[]} value={size} onChange={setSize} />
            <OptionGroup label="Resize" options={['none', 'vertical', 'horizontal', 'both'] as Resize[]} value={resize} onChange={setResize} />
            <OptionGroup label="Rows" options={[2, 3, 4, 6, 8]} value={rows} onChange={v => setRows(v as number)} />
            <OptionGroup label="Max Length" options={[0, 100, 280, 500]} value={maxLength} onChange={v => setMaxLength(v as number)} />
            <OptionGroup label="Motion Level" options={[0, 1, 2, 3] as (0 | 1 | 2 | 3)[]} value={motion} onChange={v => setMotion(v as 0 | 1 | 2 | 3)} />
            <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            <Toggle label="Read only" checked={readOnly} onChange={setReadOnly} />
            <Toggle label="Required" checked={required} onChange={setRequired} />
          </div>

          <div className="ta-page__playground-result">
            <div className="ta-page__playground-live">
              <TextareaComponent
                label="Message"
                placeholder={placeholder}
                size={size}
                disabled={disabled}
                required={required}
                minRows={rows}
                resize={resize}
                maxLength={maxLength > 0 ? maxLength : undefined}
                showCount={maxLength > 0}
                motion={tier !== 'lite' ? motion : undefined}
              />
            </div>

            <div className="ta-page__code-tabs">
              {codeTabs.map(tab => (
                <button
                  key={tab.id}
                  className="ta-page__code-tab"
                  data-active={activeCodeTab === tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="ta-page__code-block">
              <pre>{activeCode}</pre>
              <div className="ta-page__code-copy">
                <CopyButton text={activeCode} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Auto-Resize ────────────────────────────────── */}
      <section className="ta-page__section" id="autoresize">
        <h2 className="ta-page__section-title"><a href="#autoresize">Auto-Resize</a></h2>
        <p className="ta-page__section-desc">
          Enable autoResize to grow the textarea height as content is typed.
          Combined with minRows and maxRows to constrain the range.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea
            label="Auto-resize (3-8 rows)"
            placeholder="Start typing to see it grow..."
            autoResize
            minRows={3}
            maxRows={8}
          />
          <Textarea
            label="Fixed height (no resize)"
            placeholder="This textarea has a fixed height"
            resize="none"
            minRows={4}
          />
        </div>
      </section>

      {/* ── Character Counter ──────────────────────────── */}
      <section className="ta-page__section" id="counter">
        <h2 className="ta-page__section-title"><a href="#counter">Character Counter</a></h2>
        <p className="ta-page__section-desc">
          Set maxLength with showCount to display a live character counter.
          The counter turns red as the limit approaches.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            maxLength={280}
            showCount
            description="Maximum 280 characters"
          />
          <Textarea
            label="Short note"
            placeholder="Quick note..."
            maxLength={100}
            showCount
            autoResize
            minRows={2}
            maxRows={4}
          />
        </div>
      </section>

      {/* ── States ─────────────────────────────────────── */}
      <section className="ta-page__section" id="states">
        <h2 className="ta-page__section-title"><a href="#states">States & Validation</a></h2>
        <p className="ta-page__section-desc">
          Error messages, disabled, and required states.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea label="With error" error="Description is required" placeholder="Required field" required />
          <Textarea label="Disabled" disabled defaultValue="This content cannot be edited" />
        </div>
      </section>

      {/* ── Accessibility ──────────────────────────────── */}
      <section className="ta-page__section" id="accessibility">
        <h2 className="ta-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="ta-page__section-desc">
          Built-in accessibility features following WAI-ARIA authoring practices.
        </p>
        <div className="ta-page__a11y-grid">
          <div className="ta-page__a11y-card">
            <h4>Label association</h4>
            <p>
              The label prop automatically creates an associated label element with a stable
              generated ID, providing screen reader context.
            </p>
          </div>
          <div className="ta-page__a11y-card">
            <h4>Error announcements</h4>
            <p>
              Error messages use aria-describedby and aria-invalid to communicate
              validation state to assistive technology.
            </p>
          </div>
          <div className="ta-page__a11y-card">
            <h4>Character count</h4>
            <p>
              When showCount is enabled, the remaining character count is announced
              via a live region as the user approaches the limit.
            </p>
          </div>
          <div className="ta-page__a11y-card">
            <h4>Reduced motion</h4>
            <p>
              All animations respect prefers-reduced-motion and the motion prop,
              ensuring a comfortable experience for motion-sensitive users.
            </p>
          </div>
        </div>
      </section>

      {/* ── Weight Tiers ──────────────────────────────────── */}
      <section className="ta-page__section" id="tiers">
        <h2 className="ta-page__section-title">Weight Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with motion, theming, and accessibility.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Textarea {'}'} from '@annondeveloper/ui-kit'</code>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
              ~3.1 KB gzip (JS) + ~0.9 KB gzip (CSS)
            </p>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal footprint, no motion or advanced theming.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Textarea {'}'} from '@annondeveloper/ui-kit/lite'</code>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
              ~0.8 KB gzip (JS) + ~0.4 KB gzip (CSS)
            </p>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow, spring animations, and shimmer effects.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Textarea {'}'} from '@annondeveloper/ui-kit/premium'</code>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>
              ~4.2 KB gzip (JS) + ~1.2 KB gzip (CSS)
            </p>
          </Card>
        </div>
      </section>

      {/* ── Source & Brand Color ──────────────────────────── */}
      <section className="ta-page__section" id="source">
        <h2 className="ta-page__section-title"><a href="#source">Source & Customization</a></h2>
        <p className="ta-page__section-desc">
          View the component source, customize the brand color used by the Textarea focus ring and accents.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/textarea.tsx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: 'var(--brand, oklch(65% 0.2 270))' }}
            >
              Source on GitHub
            </a>
            <a
              href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/textarea.tsx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: 'var(--brand, oklch(65% 0.2 270))' }}
            >
              Lite Source
            </a>
            <a
              href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/textarea.tsx"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: 'var(--brand, oklch(65% 0.2 270))' }}
            >
              Premium Source
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Brand Color
            </label>
            <input
              type="color"
              defaultValue="#6366f1"
              onChange={e => {
                document.documentElement.style.setProperty('--brand', e.target.value)
              }}
              style={{ blockSize: '2rem', inlineSize: '3rem', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="ta-page__section" id="props">
        <h2 className="ta-page__section-title"><a href="#props">Props</a></h2>
        <p className="ta-page__section-desc">
          All props accepted by Textarea. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={taProps} />
        </Card>
      </section>
    </div>
  )
}
