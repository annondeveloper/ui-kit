'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { InlineEdit } from '@ui/components/inline-edit'
import { InlineEdit as LiteInlineEdit } from '@ui/lite/inline-edit'
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
    @scope (.inline-edit-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: inline-edit-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .inline-edit-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .inline-edit-page__hero::before {
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
        animation: inline-edit-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes inline-edit-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .inline-edit-page__hero::before { animation: none; }
      }

      .inline-edit-page__title {
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

      .inline-edit-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .inline-edit-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .inline-edit-page__import-code {
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

      .inline-edit-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .inline-edit-page__section {
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
        animation: inline-edit-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes inline-edit-page__section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .inline-edit-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .inline-edit-page__section-title {
        font-size: 1.125rem; font-weight: 700; color: var(--text-primary);
        margin: 0 0 0.375rem; padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3; scroll-margin-block-start: 2rem;
      }
      .inline-edit-page__section-title a { color: inherit; text-decoration: none; }
      .inline-edit-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .inline-edit-page__section-desc {
        color: var(--text-secondary); font-size: var(--text-sm, 0.875rem);
        line-height: 1.6; margin: 0 0 1.5rem; text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────────── */

      .inline-edit-page__preview {
        padding: 2.5rem; border-radius: var(--radius-md); background: var(--bg-base);
        position: relative; overflow: hidden; display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center; gap: 1.25rem; min-block-size: 80px;
      }
      .inline-edit-page__preview::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .inline-edit-page__preview--col { flex-direction: column; align-items: flex-start; }

      /* ── Playground ─────────────────────────────────── */

      .inline-edit-page__playground {
        display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start;
      }
      @media (max-width: 768px) {
        .inline-edit-page__playground { grid-template-columns: 1fr; }
        .inline-edit-page__playground-controls { position: static !important; }
      }
      @container inline-edit-page (max-width: 680px) {
        .inline-edit-page__playground { grid-template-columns: 1fr; }
        .inline-edit-page__playground-controls { position: static !important; }
      }

      .inline-edit-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .inline-edit-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px; display: grid; place-items: center; padding: 3rem;
        background: var(--bg-base); border-radius: var(--radius-md);
        position: relative; overflow: hidden;
      }
      .inline-edit-page__playground-result::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .inline-edit-page__playground-result::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .inline-edit-page__playground-controls {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.25rem;
        display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem;
      }

      .inline-edit-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .inline-edit-page__control-label {
        font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .inline-edit-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .inline-edit-page__option-btn {
        font-size: var(--text-xs, 0.75rem); padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-secondary); cursor: pointer;
        font-family: inherit; font-weight: 500; transition: all 0.12s; line-height: 1.4;
      }
      .inline-edit-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .inline-edit-page__option-btn--active {
        background: var(--brand); color: oklch(100% 0 0);
        border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .inline-edit-page__toggle-label {
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary);
        cursor: pointer; display: flex; align-items: center; gap: 0.375rem;
      }

      .inline-edit-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .inline-edit-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .inline-edit-page__labeled-row {
        display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;
      }
      .inline-edit-page__labeled-item {
        display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      }
      .inline-edit-page__item-label {
        font-size: 0.6875rem; color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase; letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .inline-edit-page__states-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;
      }
      .inline-edit-page__state-cell {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 1.25rem 0.75rem; border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .inline-edit-page__state-cell:hover {
        border-color: var(--border-default); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }
      .inline-edit-page__state-label {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-weight: 500;
      }
      .inline-edit-page__state-hint {
        font-size: 0.625rem; color: var(--text-tertiary); font-style: italic;
      }

      /* ── Editable items demo ─────────────────────────── */

      .inline-edit-page__editable-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        inline-size: 100%;
        max-inline-size: 400px;
      }

      .inline-edit-page__editable-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .inline-edit-page__editable-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 600;
        min-inline-size: 80px;
        text-align: end;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .inline-edit-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .inline-edit-page__tier-card {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column;
        gap: 0.75rem; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0; overflow: hidden;
      }
      .inline-edit-page__tier-card:hover {
        border-color: var(--border-strong); transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .inline-edit-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .inline-edit-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .inline-edit-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .inline-edit-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .inline-edit-page__tier-size {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
      .inline-edit-page__tier-desc {
        font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start;
      }
      .inline-edit-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle);
        padding: 0.375rem 0.5rem; border-radius: var(--radius-sm);
        overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4;
      }
      .inline-edit-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .inline-edit-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .inline-edit-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */

      .inline-edit-page__code-tabs { margin-block-start: 1rem; }
      .inline-edit-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .inline-edit-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── A11y list ──────────────────────────────────── */

      .inline-edit-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .inline-edit-page__a11y-item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5;
      }
      .inline-edit-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .inline-edit-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle); color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .inline-edit-page__hero { padding: 2rem 1.25rem; }
        .inline-edit-page__title { font-size: 1.75rem; }
        .inline-edit-page__preview { padding: 1.75rem; }
        .inline-edit-page__playground { grid-template-columns: 1fr; }
        .inline-edit-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .inline-edit-page__states-grid { grid-template-columns: 1fr; }
        .inline-edit-page__tiers { grid-template-columns: 1fr; }
        .inline-edit-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .inline-edit-page__hero { padding: 1.5rem 1rem; }
        .inline-edit-page__title { font-size: 1.5rem; }
        .inline-edit-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .inline-edit-page__title { font-size: 4rem; }
        .inline-edit-page__preview { padding: 3.5rem; }
      }

      .inline-edit-page__import-code,
      .inline-edit-page code,
      pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const inlineEditProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Current text value (controlled).' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when value changes on save.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder shown when value is empty.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents entering edit mode.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls font size and input height.' },
  { name: 'multiline', type: 'boolean', default: 'false', description: 'Use textarea instead of input. Ctrl+Enter saves.' },
  { name: 'editTrigger', type: "'click' | 'dblclick'", default: "'click'", description: 'How the user enters edit mode.' },
  { name: 'onSave', type: '(value: string) => void', description: 'Called when edit is confirmed (Enter or blur).' },
  { name: 'onCancel', type: '() => void', description: 'Called when edit is cancelled (Escape).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for edit mode entry.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
type EditTrigger = 'click' | 'dblclick'

const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { InlineEdit } from '@annondeveloper/ui-kit/lite'",
  standard: "import { InlineEdit } from '@annondeveloper/ui-kit'",
  premium: "import { InlineEdit } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" className="inline-edit-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-edit-page__control-group">
      <span className="inline-edit-page__control-label">{label}</span>
      <div className="inline-edit-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`inline-edit-page__option-btn${opt === value ? ' inline-edit-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-edit-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, placeholder: string, disabled: boolean, multiline: boolean, editTrigger: EditTrigger, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const attrs: string[] = ['  value={text}', '  onChange={setText}']
    if (placeholder) attrs.push(`  placeholder="${placeholder}"`)
    return `${importStr}\n\nconst [text, setText] = useState('Click to edit')\n\n<InlineEdit\n${attrs.join('\n')}\n/>`
  }
  const props: string[] = ['  value={text}', '  onChange={setText}']
  if (size !== 'md') props.push(`  size="${size}"`)
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (disabled) props.push('  disabled')
  if (multiline) props.push('  multiline')
  if (editTrigger !== 'click') props.push(`  editTrigger="${editTrigger}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  onSave={(val) => console.log("Saved:", val)}')
  props.push('  onCancel={() => console.log("Cancelled")}')
  return `${importStr}\n\nconst [text, setText] = useState('Click to edit')\n\n<InlineEdit\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<!-- InlineEdit — Lite tier -->
<div class="ui-lite-inline-edit">
  <span role="button" tabindex="0">${placeholder || 'Click to edit'}</span>
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<!-- InlineEdit — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/inline-edit.css">

<div class="ui-inline-edit" data-size="md">
  <div class="ui-inline-edit__display" role="button" tabindex="0">
    <span class="ui-inline-edit__text">Click to edit</span>
    <span class="ui-inline-edit__icon" aria-hidden="true">
      <svg><!-- pencil icon --></svg>
    </span>
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, placeholder: string): string {
  if (tier === 'lite') {
    return `<template>
  <InlineEdit v-model="text" placeholder="${placeholder || 'Click to edit'}" />
</template>

<script setup>
import { ref } from 'vue'
const text = ref('Click to edit')
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <InlineEdit
    v-model="text"
    size="${size}"
    placeholder="${placeholder || 'Click to edit'}"
    @save="onSave"
  />
</template>

<script setup>
import { ref } from 'vue'
import { InlineEdit } from '@annondeveloper/ui-kit'
const text = ref('Click to edit')
const onSave = (val) => console.log('Saved:', val)
</script>`
}

function generateAngularCode(tier: Tier, placeholder: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<div class="ui-lite-inline-edit">
  <span *ngIf="!editing" role="button" tabindex="0" (click)="editing = true">
    {{ text || '${placeholder || 'Click to edit'}' }}
  </span>
  <input *ngIf="editing" [(ngModel)]="text"
    (blur)="editing = false"
    (keydown.enter)="editing = false"
    (keydown.escape)="editing = false"
    autofocus />
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-inline-edit" data-size="md">
  <div *ngIf="!editing" class="ui-inline-edit__display" role="button" tabindex="0"
    (click)="editing = true">
    <span class="ui-inline-edit__text">{{ text }}</span>
  </div>
  <input *ngIf="editing" class="ui-inline-edit__field"
    [(ngModel)]="text" (blur)="editing = false"
    (keydown.enter)="editing = false" (keydown.escape)="cancel()" autofocus />
</div>

/* Import CSS */
@import '@annondeveloper/ui-kit/css/components/inline-edit.css';`
}

function generateSvelteCode(tier: Tier, size: Size, placeholder: string): string {
  if (tier === 'lite') {
    return `<script>
  import { InlineEdit } from '@annondeveloper/ui-kit/lite';
  let text = 'Click to edit';
</script>

<InlineEdit value={text} placeholder="${placeholder || 'Click to edit'}" on:change={(e) => text = e.detail} />

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { InlineEdit } from '@annondeveloper/ui-kit';
  let text = 'Click to edit';
</script>

<InlineEdit
  value={text}
  size="${size}"
  placeholder="${placeholder || 'Click to edit'}"
  on:change={(e) => text = e.detail}
  on:save={(e) => console.log('Saved:', e.detail)}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [disabled, setDisabled] = useState(false)
  const [multiline, setMultiline] = useState(false)
  const [editTrigger, setEditTrigger] = useState<EditTrigger>('click')
  const [placeholder, setPlaceholder] = useState('Click to edit...')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [text, setText] = useState('Editable text')
  const [lastAction, setLastAction] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, size, placeholder, disabled, multiline, editTrigger, motion), [tier, size, placeholder, disabled, multiline, editTrigger, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, placeholder), [tier, placeholder])
  const vueCode = useMemo(() => generateVueCode(tier, size, placeholder), [tier, size, placeholder])
  const angularCode = useMemo(() => generateAngularCode(tier, placeholder), [tier, placeholder])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, placeholder), [tier, size, placeholder])

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
    <section className="inline-edit-page__section" id="playground">
      <h2 className="inline-edit-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="inline-edit-page__section-desc">
        Tweak every prop and see the result in real-time. Click the text to enter edit mode, press Enter to save or Escape to cancel.
      </p>

      <div className="inline-edit-page__playground">
        <div className="inline-edit-page__playground-preview">
          <div className="inline-edit-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {tier === 'lite' ? (
                <LiteInlineEdit
                  value={text}
                  onChange={v => { setText(v); setLastAction('Saved') }}
                  placeholder={placeholder}
                />
              ) : (
                <InlineEdit
                  value={text}
                  onChange={v => { setText(v); setLastAction('Changed') }}
                  placeholder={placeholder}
                  disabled={disabled}
                  size={size}
                  multiline={multiline}
                  editTrigger={editTrigger}
                  motion={motion}
                  onSave={v => setLastAction(`Saved: "${v}"`)}
                  onCancel={() => setLastAction('Cancelled')}
                />
              )}
              {lastAction && (
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Last action: {lastAction}
                </span>
              )}
            </div>
          </div>

          <div className="inline-edit-page__code-tabs">
            <div className="inline-edit-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="inline-edit-page__export-status">{copyStatus}</span>}
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

        <div className="inline-edit-page__playground-controls">
          {tier !== 'lite' && <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />}
          {tier !== 'lite' && (
            <OptionGroup label="Edit Trigger" options={['click', 'dblclick'] as const} value={editTrigger} onChange={setEditTrigger} />
          )}
          {tier !== 'lite' && (
            <OptionGroup label="Motion" options={['0', '1', '2', '3'] as const} value={String(motion) as any} onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)} />
          )}
          <div className="inline-edit-page__control-group">
            <span className="inline-edit-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />}
              {tier !== 'lite' && <Toggle label="Multiline" checked={multiline} onChange={setMultiline} />}
            </div>
          </div>
          <div className="inline-edit-page__control-group">
            <span className="inline-edit-page__control-label">Placeholder</span>
            <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)}
              className="inline-edit-page__text-input" placeholder="Placeholder..." />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Editable Profile Demo ───────────────────────────────────────────────────

function EditableProfileDemo({ tier }: { tier: Tier }) {
  const [name, setName] = useState('Jane Smith')
  const [title, setTitle] = useState('Senior Engineer')
  const [bio, setBio] = useState('Building the future of web components.')

  if (tier === 'lite') {
    return (
      <div className="inline-edit-page__editable-list">
        <div className="inline-edit-page__editable-row">
          <span className="inline-edit-page__editable-label">Name</span>
          <LiteInlineEdit value={name} onChange={setName} />
        </div>
        <div className="inline-edit-page__editable-row">
          <span className="inline-edit-page__editable-label">Title</span>
          <LiteInlineEdit value={title} onChange={setTitle} />
        </div>
        <div className="inline-edit-page__editable-row">
          <span className="inline-edit-page__editable-label">Bio</span>
          <LiteInlineEdit value={bio} onChange={setBio} />
        </div>
      </div>
    )
  }

  return (
    <div className="inline-edit-page__editable-list">
      <div className="inline-edit-page__editable-row">
        <span className="inline-edit-page__editable-label">Name</span>
        <InlineEdit value={name} onChange={setName} size="md" placeholder="Enter name" />
      </div>
      <div className="inline-edit-page__editable-row">
        <span className="inline-edit-page__editable-label">Title</span>
        <InlineEdit value={title} onChange={setTitle} size="sm" placeholder="Enter title" />
      </div>
      <div className="inline-edit-page__editable-row">
        <span className="inline-edit-page__editable-label">Bio</span>
        <InlineEdit value={bio} onChange={setBio} size="sm" multiline placeholder="Enter bio" />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InlineEditPage() {
  useStyles('inline-edit-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.inline-edit-page__section')
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
    <div className="inline-edit-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="inline-edit-page__hero">
        <h1 className="inline-edit-page__title">InlineEdit</h1>
        <p className="inline-edit-page__desc">
          Click-to-edit text field that toggles between display and edit mode. Supports single-line
          and multiline, save/cancel callbacks, and edit pencil icon with hover reveal.
        </p>
        <div className="inline-edit-page__import-row">
          <code className="inline-edit-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="inline-edit-page__section" id="sizes">
          <h2 className="inline-edit-page__section-title"><a href="#sizes">Size Scale</a></h2>
          <p className="inline-edit-page__section-desc">
            Three sizes for different typographic contexts. Sizes control font size and input height in edit mode.
          </p>
          <div className="inline-edit-page__preview inline-edit-page__preview--col">
            {SIZES.map(s => (
              <div key={s} className="inline-edit-page__labeled-item" style={{ width: '100%' }}>
                <InlineEdit value={`Size ${s}`} onChange={() => {}} size={s} />
                <span className="inline-edit-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="inline-edit-page__section" id="states">
        <h2 className="inline-edit-page__section-title"><a href="#states">States</a></h2>
        <p className="inline-edit-page__section-desc">
          InlineEdit handles display, hover, editing, placeholder, and disabled states.
        </p>
        <div className="inline-edit-page__states-grid">
          <div className="inline-edit-page__state-cell">
            {tier === 'lite' ? (
              <LiteInlineEdit value="Click me" onChange={() => {}} />
            ) : (
              <InlineEdit value="Click me" onChange={() => {}} />
            )}
            <span className="inline-edit-page__state-label">Default</span>
            <span className="inline-edit-page__state-hint">hover to see icon</span>
          </div>
          <div className="inline-edit-page__state-cell">
            {tier === 'lite' ? (
              <LiteInlineEdit value="" onChange={() => {}} placeholder="Empty field" />
            ) : (
              <InlineEdit value="" onChange={() => {}} placeholder="Empty field" />
            )}
            <span className="inline-edit-page__state-label">Placeholder</span>
          </div>
          <div className="inline-edit-page__state-cell">
            {tier === 'lite' ? (
              <LiteInlineEdit value="Click to edit" onChange={() => {}} />
            ) : (
              <InlineEdit value="Click to edit" onChange={() => {}} />
            )}
            <span className="inline-edit-page__state-label">Editing</span>
            <span className="inline-edit-page__state-hint">click text to edit</span>
          </div>
          <div className="inline-edit-page__state-cell">
            {tier === 'lite' ? (
              <LiteInlineEdit value="Locked" onChange={() => {}} />
            ) : (
              <InlineEdit value="Locked" onChange={() => {}} disabled />
            )}
            <span className="inline-edit-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 5. Edit Triggers ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="inline-edit-page__section" id="triggers">
          <h2 className="inline-edit-page__section-title"><a href="#triggers">Edit Triggers</a></h2>
          <p className="inline-edit-page__section-desc">
            Choose between click or double-click to enter edit mode. Double-click is useful when
            text selection should work on single click.
          </p>
          <div className="inline-edit-page__preview">
            <div className="inline-edit-page__labeled-row">
              <div className="inline-edit-page__labeled-item">
                <InlineEdit value="Single click" onChange={() => {}} editTrigger="click" />
                <span className="inline-edit-page__item-label">click</span>
              </div>
              <div className="inline-edit-page__labeled-item">
                <InlineEdit value="Double click" onChange={() => {}} editTrigger="dblclick" />
                <span className="inline-edit-page__item-label">dblclick</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Multiline ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="inline-edit-page__section" id="multiline">
          <h2 className="inline-edit-page__section-title"><a href="#multiline">Multiline</a></h2>
          <p className="inline-edit-page__section-desc">
            Enable <code>multiline</code> to use a textarea for longer text. In multiline mode,
            <code className="inline-edit-page__a11y-key">Ctrl+Enter</code> saves and <code className="inline-edit-page__a11y-key">Escape</code> cancels.
          </p>
          <div className="inline-edit-page__preview inline-edit-page__preview--col">
            <InlineEdit
              value="This is a longer piece of text that could span multiple lines. Click to edit and try pressing Ctrl+Enter to save."
              onChange={() => {}}
              multiline
              size="md"
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<InlineEdit\n  value={bio}\n  onChange={setBio}\n  multiline\n  onSave={(val) => api.updateBio(val)}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7. Editable Profile ────────────────────────── */}
      <section className="inline-edit-page__section" id="profile">
        <h2 className="inline-edit-page__section-title"><a href="#profile">Editable Profile</a></h2>
        <p className="inline-edit-page__section-desc">
          Real-world example: an editable user profile card with multiple inline edit fields.
        </p>
        <div className="inline-edit-page__preview inline-edit-page__preview--col" style={{ alignItems: 'center' }}>
          <EditableProfileDemo tier={tier} />
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="inline-edit-page__section" id="tiers">
        <h2 className="inline-edit-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="inline-edit-page__section-desc">
          Choose the right balance of features and bundle size. Lite has basic click-to-edit,
          Standard adds sizes, multiline, edit trigger options, pencil icon, and save/cancel callbacks.
        </p>

        <div className="inline-edit-page__tiers">
          <div
            className={`inline-edit-page__tier-card${tier === 'lite' ? ' inline-edit-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="inline-edit-page__tier-header">
              <span className="inline-edit-page__tier-name">Lite</span>
              <span className="inline-edit-page__tier-size">~0.3 KB</span>
            </div>
            <p className="inline-edit-page__tier-desc">
              Basic click-to-edit with Enter to save and Escape to cancel.
              No sizes, no multiline, no edit icon, no edit trigger config.
            </p>
            <div className="inline-edit-page__tier-import">
              import {'{'} InlineEdit {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="inline-edit-page__tier-preview">
              <LiteInlineEdit value="Lite edit" onChange={() => {}} />
            </div>
            <div className="inline-edit-page__size-breakdown">
              <div className="inline-edit-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`inline-edit-page__tier-card${tier === 'standard' ? ' inline-edit-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="inline-edit-page__tier-header">
              <span className="inline-edit-page__tier-name">Standard</span>
              <span className="inline-edit-page__tier-size">~2 KB</span>
            </div>
            <p className="inline-edit-page__tier-desc">
              Full inline edit with 3 sizes, multiline textarea, click/dblclick trigger,
              pencil icon hover, save/cancel callbacks, motion entry animation.
            </p>
            <div className="inline-edit-page__tier-import">
              import {'{'} InlineEdit {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="inline-edit-page__tier-preview">
              <InlineEdit value="Standard edit" onChange={() => {}} size="sm" />
            </div>
            <div className="inline-edit-page__size-breakdown">
              <div className="inline-edit-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`inline-edit-page__tier-card${tier === 'premium' ? ' inline-edit-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="inline-edit-page__tier-header">
              <span className="inline-edit-page__tier-name">Premium</span>
              <span className="inline-edit-page__tier-size">~3-5 KB</span>
            </div>
            <p className="inline-edit-page__tier-desc">
              Spring-scale on edit mode enter, aurora glow border on the edit field, and shimmer sweep on save.
            </p>
            <div className="inline-edit-page__tier-import">
              import {'{'} InlineEdit {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="inline-edit-page__tier-preview">
              <InlineEdit value="Standard edit" onChange={() => {}} size="sm" />
            </div>
            <div className="inline-edit-page__size-breakdown">
              <div className="inline-edit-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="inline-edit-page__section" id="props">
        <h2 className="inline-edit-page__section-title"><a href="#props">Props API</a></h2>
        <p className="inline-edit-page__section-desc">
          All props accepted by InlineEdit. The Lite tier supports value, onChange, and placeholder.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={inlineEditProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="inline-edit-page__section" id="accessibility">
        <h2 className="inline-edit-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="inline-edit-page__section-desc">
          Built with proper button semantics for the display mode and auto-focused input for edit mode.
        </p>
        <Card variant="default" padding="md">
          <ul className="inline-edit-page__a11y-list">
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Keyboard:</strong> <code className="inline-edit-page__a11y-key">Enter</code>/<code className="inline-edit-page__a11y-key">Space</code> enters edit mode, <code className="inline-edit-page__a11y-key">Enter</code> saves, <code className="inline-edit-page__a11y-key">Escape</code> cancels.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Multiline:</strong> <code className="inline-edit-page__a11y-key">Ctrl+Enter</code> saves in multiline mode, allowing natural line breaks with Enter.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Button:</strong> Display mode uses <code className="inline-edit-page__a11y-key">role="button"</code> with <code className="inline-edit-page__a11y-key">aria-label</code> describing current value.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Focus:</strong> Auto-focuses and selects text when entering edit mode. Returns focus on save/cancel.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Edit label:</strong> Input uses <code className="inline-edit-page__a11y-key">aria-label="Edit value"</code> for screen reader context.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Touch targets:</strong> 44px minimum height on coarse pointer devices.</span>
            </li>
            <li className="inline-edit-page__a11y-item">
              <span className="inline-edit-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="inline-edit-page__a11y-key">forced-colors: active</code> with visible borders and focus outlines.</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
