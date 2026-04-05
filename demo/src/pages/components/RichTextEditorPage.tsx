'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RichTextEditor } from '@ui/domain/rich-text-editor'
import { RichTextEditor as LiteRichTextEditor } from '@ui/lite/rich-text-editor'
import { RichTextEditor as PremiumRichTextEditor } from '@ui/premium/rich-text-editor'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

type Tier = 'lite' | 'standard' | 'premium'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled HTML content string.' },
  { name: 'defaultValue', type: 'string', description: 'Initial HTML content for uncontrolled mode.' },
  { name: 'onChange', type: '(html: string) => void', description: 'Called on every content change with sanitized HTML.' },
  { name: 'placeholder', type: 'string', default: "'Start typing...'", description: 'Placeholder text shown when the editor is empty.' },
  { name: 'label', type: 'string', description: 'Accessible label rendered above the editor.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the editor.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all editing and toolbar interactions.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Allow reading and selection but prevent edits.' },
  { name: 'minHeight', type: 'string | number', default: '120', description: 'Minimum block size of the editable area.' },
  { name: 'maxHeight', type: 'string | number', description: 'Maximum block size before the content scrolls.' },
  { name: 'toolbar', type: 'ToolbarAction[]', default: 'DEFAULT_TOOLBAR', description: 'Array of toolbar actions to display.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls font-size and padding of the editor.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.rte-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .rte-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .rte-page__hero::before {
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
      @media (prefers-reduced-motion: reduce) { .rte-page__hero::before { animation: none; } }

      .rte-page__title {
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

      .rte-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .rte-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .rte-page__import-code {
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

      .rte-page__section {
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
        .rte-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .rte-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .rte-page__section-title a { color: inherit; text-decoration: none; }
      .rte-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .rte-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .rte-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .rte-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .rte-page__output {
        margin-block-start: 1rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        background: oklch(0% 0 0 / 0.15);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        white-space: pre-wrap;
        word-break: break-all;
        max-block-size: 120px;
        overflow-y: auto;
      }

      .rte-page__output-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-block-start: 1rem;
        margin-block-end: 0.25rem;
      }

      /* ── Tiers ───────────────────────────────── */

      .rte-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .rte-page__tier-card {
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
      .rte-page__tier-card:hover { border-color: var(--border-default); }
      .rte-page__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

      .rte-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .rte-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .rte-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .rte-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .rte-page__tier-import {
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

      .rte-page__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      /* ── Playground ─────────────────────────────────── */

      .rte-page__playground {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
      }

      .rte-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .rte-page__playground-preview {
        min-width: 0;
      }

      .rte-page__playground-result {
        position: relative;
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        overflow: visible;
      }

      .rte-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
        border-radius: inherit;
      }

      .rte-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .rte-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .rte-page__control-row {
        display: flex;
        gap: 0.375rem;
        flex-wrap: wrap;
      }

      .rte-page__control-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        background: var(--bg-surface);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
      }
      .rte-page__control-btn:hover { border-color: var(--border-default); color: var(--text-primary); }
      .rte-page__control-btn--active {
        background: var(--brand, oklch(65% 0.2 270));
        color: white;
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* ── Code Tabs ─────────────────────────────────── */

      .rte-page__code-tabs {
        display: flex;
        gap: 0;
        border-block-end: 1px solid var(--border-subtle);
        margin-block-end: 0;
      }

      .rte-page__code-tab {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        color: var(--text-tertiary);
        cursor: pointer;
        border-block-end: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }
      .rte-page__code-tab:hover { color: var(--text-primary); }
      .rte-page__code-tab--active {
        color: var(--brand, oklch(65% 0.2 270));
        border-block-end-color: var(--brand, oklch(65% 0.2 270));
      }

      .rte-page__code-block {
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-block-start: none;
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        padding: 1rem;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        overflow-x: auto;
        white-space: pre;
        line-height: 1.6;
      }

      /* ── Accessibility Section ─────────────────────── */

      .rte-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .rte-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .rte-page__a11y-icon {
        flex-shrink: 0;
        color: oklch(72% 0.19 155);
        margin-block-start: 0.15rem;
      }

      .rte-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.1em 0.4em;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      @container (max-width: 640px) {
        .rte-page__tiers { grid-template-columns: 1fr; }
        .rte-page__playground { grid-template-columns: 1fr; }
      }
    }
  }
`

const IMPORT_STR = "import { RichTextEditor } from '@ui/domain/rich-text-editor'"

// ─── Code Generation ────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: string, disabled: boolean, readOnly: boolean, motion: number): string {
  const importPath = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : tier === 'premium'
    ? "@annondeveloper/ui-kit/premium"
    : "@annondeveloper/ui-kit"

  const props: string[] = ['  label="Post content"', '  placeholder="Write something..."']
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (readOnly) props.push('  readOnly')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push('  onChange={(html) => console.log(html)}')

  return `import { RichTextEditor } from '${importPath}'

<RichTextEditor
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, size: string, disabled: boolean, readOnly: boolean): string {
  const disabledAttr = disabled ? ' contenteditable="false" aria-disabled="true"' : ''
  const readOnlyAttr = readOnly ? ' contenteditable="false"' : ''
  const sizeClass = size !== 'md' ? ` ui-rich-text-editor--${size}` : ''

  if (tier === 'lite') {
    return `<!-- RichTextEditor -- @annondeveloper/ui-kit lite tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">

<div class="ui-lite-rich-text-editor${sizeClass}">
  <label class="ui-lite-rich-text-editor__label">Post content</label>
  <div class="ui-lite-rich-text-editor__toolbar">
    <button type="button" aria-label="Bold"><b>B</b></button>
    <button type="button" aria-label="Italic"><i>I</i></button>
    <button type="button" aria-label="Underline"><u>U</u></button>
  </div>
  <div class="ui-lite-rich-text-editor__content"
       contenteditable="true"${disabledAttr}${readOnlyAttr}
       role="textbox"
       aria-multiline="true"
       aria-label="Post content"
       data-placeholder="Write something...">
  </div>
</div>`
  }

  return `<!-- RichTextEditor -- @annondeveloper/ui-kit standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/rich-text-editor.css">

<div class="ui-rich-text-editor${sizeClass}">
  <label class="ui-rich-text-editor__label">Post content</label>
  <div class="ui-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
    <button type="button" aria-label="Bold" aria-pressed="false"><b>B</b></button>
    <button type="button" aria-label="Italic" aria-pressed="false"><i>I</i></button>
    <button type="button" aria-label="Underline" aria-pressed="false"><u>U</u></button>
    <button type="button" aria-label="Link">Link</button>
  </div>
  <div class="ui-rich-text-editor__content"
       contenteditable="${disabled ? 'false' : 'true'}"${disabledAttr}${readOnlyAttr}
       role="textbox"
       aria-multiline="true"
       aria-label="Post content"
       data-placeholder="Write something..."
       style="min-block-size: 120px;">
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: string): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/rich-text-editor.css'
  const sizeClass = size !== 'md' ? ` ui-rich-text-editor--${size}` : ''

  return `<template>
  <div class="ui-rich-text-editor${sizeClass}">
    <label class="ui-rich-text-editor__label">Post content</label>
    <div class="ui-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
      <button @click="format('bold')" :aria-pressed="isBold">B</button>
      <button @click="format('italic')" :aria-pressed="isItalic">I</button>
      <button @click="format('underline')" :aria-pressed="isUnderline">U</button>
    </div>
    <div
      ref="editor"
      class="ui-rich-text-editor__content"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      aria-label="Post content"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const editor = ref<HTMLElement>()
const html = ref('')
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

function format(cmd: string) {
  document.queryCommandSupported(cmd) && document.queryCommandValue(cmd)
  editor.value?.focus()
}

function onInput() {
  html.value = editor.value?.innerHTML ?? ''
}
</script>

<style>
@import '${importPath}';
</style>`
}

function generateAngularCode(tier: Tier, size: string): string {
  const sizeClass = size !== 'md' ? ` ui-rich-text-editor--${size}` : ''
  const cssPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/rich-text-editor.css'

  return `// Angular tier: ${tier} -- Angular CSS import: ${cssPath}
import { Component } from '@angular/core';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  template: \`
    <div class="ui-rich-text-editor${sizeClass}">
      <label class="ui-rich-text-editor__label">Post content</label>
      <div class="ui-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
        <button (click)="format('bold')" [attr.aria-pressed]="isBold">B</button>
        <button (click)="format('italic')" [attr.aria-pressed]="isItalic">I</button>
        <button (click)="format('underline')" [attr.aria-pressed]="isUnderline">U</button>
      </div>
      <div
        class="ui-rich-text-editor__content"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        aria-label="Post content"
        (input)="onInput()">
      </div>
    </div>
  \`,
  styleUrls: ['${cssPath}']
})
export class RichTextEditorComponent {
  isBold = false;
  isItalic = false;
  isUnderline = false;
  html = '';

  format(command: string) {
    document.queryCommandSupported(command);
  }

  onInput() {
    const el = document.querySelector('.ui-rich-text-editor__content');
    this.html = el?.innerHTML ?? '';
  }
}`
}

function generateSvelteCode(tier: Tier, size: string): string {
  const sizeClass = size !== 'md' ? ` ui-rich-text-editor--${size}` : ''
  const cssImport = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite/styles.css"
    : "@annondeveloper/ui-kit/css/components/rich-text-editor.css"

  return `<!-- Svelte tier: ${tier} -- Svelte import -->
<script lang="ts">
  let html = $state('')
  let editor: HTMLElement

  function format(command: string) {
    document.queryCommandSupported(command)
    editor?.focus()
  }

  function onInput() {
    html = editor?.innerHTML ?? ''
  }
</script>

<div class="ui-rich-text-editor${sizeClass}">
  <label class="ui-rich-text-editor__label">Post content</label>
  <div class="ui-rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
    <button onclick={() => format('bold')}>B</button>
    <button onclick={() => format('italic')}>I</button>
    <button onclick={() => format('underline')}>U</button>
  </div>
  <div
    bind:this={editor}
    class="ui-rich-text-editor__content"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    aria-label="Post content"
    oninput={onInput}
  />
</div>

<style>
  @import '${cssImport}';
</style>`
}

// ─── Playground Component ───────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = (tierProp ?? contextTier) as Tier
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [disabled, setDisabled] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const ActiveRTE = tier === 'lite' ? LiteRichTextEditor : tier === 'premium' ? PremiumRichTextEditor : RichTextEditor

  const reactCode = useMemo(
    () => generateReactCode(tier, size, disabled, readOnly, motion),
    [tier, size, disabled, readOnly, motion],
  )
  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, disabled, readOnly),
    [tier, size, disabled, readOnly],
  )
  const vueCode = useMemo(
    () => generateVueCode(tier, size),
    [tier, size],
  )
  const angularCode = useMemo(
    () => generateAngularCode(tier, size),
    [tier, size],
  )
  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size),
    [tier, size],
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
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode)
  }, [activeCode])

  return (
    <section className="rte-page__section" id="playground">
      <h2 className="rte-page__section-title">
        <a href="#playground">Playground</a>
      </h2>
      <p className="rte-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="rte-page__playground">
        {/* Controls */}
        <div className="rte-page__playground-controls">
          <div className="rte-page__control-group">
            <span className="rte-page__control-label">Size</span>
            <div className="rte-page__control-row">
              {(['sm', 'md', 'lg'] as const).map(s => (
                <button
                  key={s}
                  className={`rte-page__control-btn${size === s ? ' rte-page__control-btn--active' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rte-page__control-group">
            <span className="rte-page__control-label">Motion Level</span>
            <div className="rte-page__control-row">
              {([0, 1, 2, 3] as const).map(m => (
                <button
                  key={m}
                  className={`rte-page__control-btn${motion === m ? ' rte-page__control-btn--active' : ''}`}
                  onClick={() => setMotion(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="rte-page__control-group">
            <span className="rte-page__control-label">State</span>
            <div className="rte-page__control-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={disabled} onChange={e => { setDisabled(e.target.checked); if (e.target.checked) setReadOnly(false) }} style={{ accentColor: 'var(--brand)' }} />
                Disabled
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={readOnly} onChange={e => { setReadOnly(e.target.checked); if (e.target.checked) setDisabled(false) }} style={{ accentColor: 'var(--brand)' }} />
                Read-only
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rte-page__playground-preview">
          <div className="rte-page__playground-result">
            <ActiveRTE
              key={`${tier}-${size}-${disabled}-${readOnly}`}
              defaultValue="<p>Try <strong>bold</strong>, <em>italic</em>, and <a href='#'>links</a>.</p>"
              label="Post content"
              placeholder="Write something..."
              size={size}
              disabled={disabled}
              readOnly={readOnly}
              {...(tier !== 'lite' ? { motion } : {})}
              minHeight="120px"
            />
          </div>
        </div>
      </div>

      {/* Code output */}
      <div style={{ marginBlockStart: '1.5rem' }}>
        <div className="rte-page__code-tabs">
          {codeTabs.map(tab => (
            <button
              key={tab.id}
              className={`rte-page__code-tab${activeCodeTab === tab.id ? ' rte-page__code-tab--active' : ''}`}
              onClick={() => setActiveCodeTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            className="rte-page__code-tab"
            style={{ marginInlineStart: 'auto' }}
            onClick={handleCopy}
          >
            Copy
          </button>
        </div>
        <div className="rte-page__code-block">{activeCode}</div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RichTextEditorPage() {
  useStyles('rte-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveRTE = tier === 'lite' ? LiteRichTextEditor : tier === 'premium' ? PremiumRichTextEditor : RichTextEditor

  const [html, setHtml] = useState('<p>Try <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>')

  useEffect(() => {
    const sections = document.querySelectorAll('.rte-page__section')
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
    <div className="rte-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="rte-page__hero">
        <h1 className="rte-page__title">RichTextEditor</h1>
        <p className="rte-page__desc">
          WYSIWYG rich text editor with a configurable toolbar, keyboard shortcuts, HTML sanitization,
          and accessible labeling. Zero dependencies -- uses contentEditable under the hood.
        </p>
        <div className="rte-page__import-row">
          <code className="rte-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Full Toolbar ───────────────────────────── */}
      <section className="rte-page__section" id="full">
        <h2 className="rte-page__section-title"><a href="#full">Full Toolbar</a></h2>
        <p className="rte-page__section-desc">
          All formatting actions enabled. Use keyboard shortcuts like <code>Ctrl+B</code> for bold,
          <code>Ctrl+I</code> for italic, and <code>Ctrl+K</code> for links.
        </p>
        <div className="rte-page__preview">
          <ActiveRTE
            value={html}
            onChange={setHtml}
            label="Post content"
            placeholder="Write something..."
            minHeight="160px"
          />
          <div className="rte-page__output-label">HTML Output</div>
          <div className="rte-page__output">{html}</div>
        </div>
      </section>

      {/* ── 2. Minimal Toolbar ────────────────────────── */}
      <section className="rte-page__section" id="minimal">
        <h2 className="rte-page__section-title"><a href="#minimal">Minimal Toolbar</a></h2>
        <p className="rte-page__section-desc">
          Restrict the toolbar to only the actions you need. Here we show just bold, italic,
          and link -- perfect for comment fields or inline editing.
        </p>
        <div className="rte-page__preview">
          <ActiveRTE
            defaultValue="<p>A simpler editing experience.</p>"
            toolbar={['bold', 'italic', 'link']}
            size="sm"
            placeholder="Add a comment..."
            minHeight="100px"
          />
        </div>
      </section>

      {/* ── 3. States ─────────────────────────────────── */}
      <section className="rte-page__section" id="states">
        <h2 className="rte-page__section-title"><a href="#states">States</a></h2>
        <p className="rte-page__section-desc">
          The editor supports error, disabled, and read-only states with appropriate
          visual feedback and ARIA attributes.
        </p>
        <div className="rte-page__preview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ActiveRTE
            defaultValue="<p>This field has a validation error.</p>"
            label="With error"
            error="Content must be at least 50 characters."
            minHeight="80px"
          />
          <ActiveRTE
            defaultValue="<p>This editor is disabled.</p>"
            label="Disabled"
            disabled
            minHeight="80px"
          />
          <ActiveRTE
            defaultValue="<p>This content is <strong>read-only</strong>. You can select and copy but not edit.</p>"
            label="Read-only"
            readOnly
            minHeight="80px"
          />
        </div>
      </section>

      {/* ── 4. Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 5. Accessibility ──────────────────────────── */}
      <section className="rte-page__section" id="accessibility">
        <h2 className="rte-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="rte-page__section-desc">
          The RichTextEditor follows WAI-ARIA authoring practices for rich text editing regions
          with comprehensive keyboard support and screen reader compatibility.
        </p>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <ul className="rte-page__a11y-list">
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>ARIA role:</strong> The editing area uses <code className="rte-page__a11y-key">role="textbox"</code> with <code className="rte-page__a11y-key">aria-multiline="true"</code> for proper screen reader announcement.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Keyboard shortcuts:</strong> <code className="rte-page__a11y-key">Ctrl+B</code> for bold, <code className="rte-page__a11y-key">Ctrl+I</code> for italic, <code className="rte-page__a11y-key">Ctrl+K</code> for link insertion, and <code className="rte-page__a11y-key">Ctrl+U</code> for underline.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Toolbar navigation:</strong> The toolbar uses <code className="rte-page__a11y-key">role="toolbar"</code> with arrow key roving tabindex for efficient navigation.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Label association:</strong> The <code className="rte-page__a11y-key">label</code> prop renders a visible label connected via <code className="rte-page__a11y-key">aria-labelledby</code>.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Error announcements:</strong> Validation errors are linked via <code className="rte-page__a11y-key">aria-describedby</code> and announced to screen readers with <code className="rte-page__a11y-key">aria-invalid="true"</code>.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Focus management:</strong> Visible focus ring with brand-colored outline via <code className="rte-page__a11y-key">:focus-visible</code>. Focus returns to the editor after toolbar interactions.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>Motion:</strong> Respects <code className="rte-page__a11y-key">prefers-reduced-motion</code>. Motion level 0 disables all transitions and animations.
              </span>
            </li>
            <li className="rte-page__a11y-item">
              <span className="rte-page__a11y-icon">&#10003;</span>
              <span>
                <strong>High contrast:</strong> Supports <code className="rte-page__a11y-key">forced-colors: active</code> with system color borders and visible toolbar button outlines.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────── */}
      <section className="rte-page__section" id="tiers">
        <h2 className="rte-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="rte-page__section-desc">
          Three tiers let you choose the right balance of bundle size and features.
          Lite provides a basic contentEditable with bold, italic, and underline buttons only;
          Standard adds a full configurable toolbar with 11 actions, keyboard shortcuts, HTML
          sanitization, error and disabled states, and 4 motion levels; Premium wraps Standard
          with aurora glow on focus, spring-scale toolbar button interactions, and motion-level-aware
          degradation.
        </p>
        <div className="rte-page__tiers">
          {/* Lite */}
          <div className={`rte-page__tier-card${tier === 'lite' ? ' rte-page__tier-card--active' : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="rte-page__tier-header">
              <span className="rte-page__tier-name">Lite</span>
              <span className="rte-page__tier-size">~0.8 KB gzip</span>
            </div>
            <p className="rte-page__tier-desc">
              Basic contentEditable with bold, italic, and underline toolbar buttons. Supports
              controlled/uncontrolled value, label, placeholder, disabled, readOnly, and minHeight.
              No error state, no keyboard shortcuts, no motion.
            </p>
            <div className="rte-page__tier-import">
              import {'{'} RichTextEditor {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="rte-page__tier-preview">
              <LiteRichTextEditor
                defaultValue="<p>Lite editor — bold, italic, underline only.</p>"
                minHeight="80px"
              />
            </div>
          </div>

          {/* Standard */}
          <div className={`rte-page__tier-card${tier === 'standard' ? ' rte-page__tier-card--active' : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="rte-page__tier-header">
              <span className="rte-page__tier-name">Standard</span>
              <span className="rte-page__tier-size">~4.8 KB gzip</span>
            </div>
            <p className="rte-page__tier-desc">
              Full configurable toolbar with 11 actions, keyboard shortcuts (Ctrl+B/I/K), HTML
              sanitization, error display, disabled/readOnly states, size variants, and 4 motion levels.
            </p>
            <div className="rte-page__tier-import">
              import {'{'} RichTextEditor {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="rte-page__tier-preview">
              <RichTextEditor
                defaultValue="<p>Standard editor with full toolbar.</p>"
                toolbar={['bold', 'italic', 'underline', 'link']}
                minHeight="80px"
              />
            </div>
          </div>

          {/* Premium */}
          <div className={`rte-page__tier-card${tier === 'premium' ? ' rte-page__tier-card--active' : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="rte-page__tier-header">
              <span className="rte-page__tier-name">Premium</span>
              <span className="rte-page__tier-size">~5.2 KB gzip</span>
            </div>
            <p className="rte-page__tier-desc">
              Wraps Standard with aurora glow on focus, spring-scale animation on toolbar buttons,
              and motion-level-aware degradation. Full props compatibility with Standard.
            </p>
            <div className="rte-page__tier-import">
              import {'{'} RichTextEditor {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="rte-page__tier-preview">
              <PremiumRichTextEditor
                defaultValue="<p>Premium editor with aurora focus glow.</p>"
                toolbar={['bold', 'italic', 'underline', 'link']}
                minHeight="80px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Source ────────────────────────────────────── */}
      <section className="rte-page__section" id="source">
        <h2 className="rte-page__section-title"><a href="#source">Source</a></h2>
        <p className="rte-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/rich-text-editor.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand, oklch(65% 0.2 270))', fontSize: 'var(--text-sm, 0.875rem)' }}
          >
            src/domain/rich-text-editor.tsx — Standard tier
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/rich-text-editor.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand, oklch(65% 0.2 270))', fontSize: 'var(--text-sm, 0.875rem)' }}
          >
            src/lite/rich-text-editor.tsx — Lite tier
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/rich-text-editor.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand, oklch(65% 0.2 270))', fontSize: 'var(--text-sm, 0.875rem)' }}
          >
            src/premium/rich-text-editor.tsx — Premium tier
          </a>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="rte-page__section" id="props">
        <h2 className="rte-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
