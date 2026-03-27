'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TagInput } from '@ui/components/tag-input'
import { TagInput as LiteTagInput } from '@ui/lite/tag-input'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tag-input-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tag-input-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .tag-input-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tag-input-page__hero::before {
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
        .tag-input-page__hero::before { animation: none; }
      }

      .tag-input-page__title {
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

      .tag-input-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tag-input-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tag-input-page__import-code {
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

      .tag-input-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .tag-input-page__section {
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
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .tag-input-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .tag-input-page__section-title {
        font-size: 1.125rem; font-weight: 700; color: var(--text-primary);
        margin: 0 0 0.375rem; padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3; scroll-margin-block-start: 2rem;
      }
      .tag-input-page__section-title a { color: inherit; text-decoration: none; }
      .tag-input-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .tag-input-page__section-desc {
        color: var(--text-secondary); font-size: var(--text-sm, 0.875rem);
        line-height: 1.6; margin: 0 0 1.5rem; text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .tag-input-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .tag-input-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tag-input-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .tag-input-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .tag-input-page__playground { grid-template-columns: 1fr; }
        .tag-input-page__playground-controls { position: static !important; }
      }

      @container tag-input-page (max-width: 680px) {
        .tag-input-page__playground { grid-template-columns: 1fr; }
        .tag-input-page__playground-controls { position: static !important; }
      }

      .tag-input-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .tag-input-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .tag-input-page__playground-result::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }

      .tag-input-page__playground-result::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .tag-input-page__playground-controls {
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

      .tag-input-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .tag-input-page__control-label {
        font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .tag-input-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .tag-input-page__option-btn {
        font-size: var(--text-xs, 0.75rem); padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-secondary); cursor: pointer;
        font-family: inherit; font-weight: 500; transition: all 0.12s; line-height: 1.4;
      }
      .tag-input-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .tag-input-page__option-btn--active {
        background: var(--brand); color: oklch(100% 0 0); border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .tag-input-page__toggle-label {
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary);
        cursor: pointer; display: flex; align-items: center; gap: 0.375rem;
      }

      .tag-input-page__text-input {
        font-size: var(--text-sm, 0.875rem); padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-primary); font-family: inherit; inline-size: 100%;
      }
      .tag-input-page__text-input:focus {
        outline: 2px solid var(--brand); outline-offset: 1px;
        border-color: transparent; box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled items ─────────────────────────────── */
      .tag-input-page__item-label {
        font-size: 0.6875rem; color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase; letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .tag-input-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .tag-input-page__state-cell {
        display: flex; flex-direction: column; gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
        background: var(--bg-base); transition: border-color 0.2s, box-shadow 0.2s;
      }
      .tag-input-page__state-cell:hover { border-color: var(--border-default); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05); }

      .tag-input-page__state-label {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary);
        font-weight: 500; text-align: center;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .tag-input-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .tag-input-page__tier-card {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.5rem; display: flex;
        flex-direction: column; gap: 0.75rem; cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0; overflow: hidden;
      }
      .tag-input-page__tier-card:hover {
        border-color: var(--border-strong); transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .tag-input-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .tag-input-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .tag-input-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .tag-input-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .tag-input-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
      .tag-input-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }
      .tag-input-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle);
        padding: 0.375rem 0.5rem; border-radius: var(--radius-sm);
        overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4;
      }
      .tag-input-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .tag-input-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .tag-input-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */
      .tag-input-page__code-tabs { margin-block-start: 1rem; }
      .tag-input-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .tag-input-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── Color picker ──────────────────────────────── */
      .tag-input-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .tag-input-page__color-preset {
        inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent;
        cursor: pointer; padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .tag-input-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .tag-input-page__color-preset--active {
        border-color: oklch(100% 0 0); transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */
      .tag-input-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .tag-input-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .tag-input-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .tag-input-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle); color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */
      @media (max-width: 768px) {
        .tag-input-page__hero { padding: 2rem 1.25rem; }
        .tag-input-page__title { font-size: 1.75rem; }
        .tag-input-page__preview { padding: 1.75rem; }
        .tag-input-page__playground { grid-template-columns: 1fr; }
        .tag-input-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .tag-input-page__states-grid { grid-template-columns: 1fr; }
        .tag-input-page__tiers { grid-template-columns: 1fr; }
        .tag-input-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .tag-input-page__hero { padding: 1.5rem 1rem; }
        .tag-input-page__title { font-size: 1.5rem; }
        .tag-input-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .tag-input-page__title { font-size: 4rem; }
        .tag-input-page__preview { padding: 3.5rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */
      .tag-input-page__import-code, .tag-input-page code, pre {
        overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%;
      }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const tagInputPropDefs: PropDef[] = [
  { name: 'tags', type: 'string[]', description: 'Controlled array of tag strings.' },
  { name: 'onChange', type: '(tags: string[]) => void', description: 'Called when tags array changes (add or remove).' },
  { name: 'placeholder', type: 'string', description: 'Placeholder shown in the input when empty.' },
  { name: 'maxTags', type: 'number', description: 'Maximum number of tags allowed. Input stops accepting when reached.' },
  { name: 'allowDuplicates', type: 'boolean', default: 'false', description: 'Allow duplicate tag values.' },
  { name: 'validate', type: '(tag: string) => boolean', description: 'Custom validation function. Return false to reject a tag.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls wrapper height, tag pill size, and input font-size.' },
  { name: 'error', type: 'string', description: 'Error message with role="alert" for screen readers.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and all tag removal buttons.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for tag entry animation.' },
  { name: 'aria-label', type: 'string', description: 'Accessible label for the input element.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with the component root.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root div element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TagInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TagInput } from '@annondeveloper/ui-kit'",
  premium: "import { TagInput } from '@annondeveloper/ui-kit/premium'",
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
      size="sm" variant="secondary" className="tag-input-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="tag-input-page__control-group">
      <span className="tag-input-page__control-label">{label}</span>
      <div className="tag-input-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`tag-input-page__option-btn${opt === value ? ' tag-input-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="tag-input-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, placeholder: string, maxTags: number, error: string, disabled: boolean, allowDuplicates: boolean, hasValidation: boolean): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = ['  tags={tags}', '  onChange={setTags}']
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md' && tier !== 'lite') props.push(`  size="${size}"`)
  if (maxTags > 0) props.push(`  maxTags={${maxTags}}`)
  if (error) props.push(`  error="${error}"`)
  if (disabled) props.push('  disabled')
  if (allowDuplicates && tier !== 'lite') props.push('  allowDuplicates')
  if (hasValidation && tier !== 'lite') props.push('  validate={(tag) => tag.length >= 2}')

  return `${importStr}\nimport { useState } from 'react'\n\nconst [tags, setTags] = useState(['React', 'TypeScript'])\n\n<TagInput\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, placeholder: string): string {
  const className = tier === 'lite' ? 'ui-lite-tag-input' : 'ui-tag-input'
  return `<!-- TagInput -- @annondeveloper/ui-kit ${tier} tier -->
<div class="${className}">
  <div class="${className}__tags">
    <span class="${className}__tag">
      React
      <button type="button" aria-label="Remove React">&times;</button>
    </span>
    <span class="${className}__tag">
      TypeScript
      <button type="button" aria-label="Remove TypeScript">&times;</button>
    </span>
    <input type="text" ${placeholder ? `placeholder="${placeholder}"` : ''} />
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <TagInput
    :tags="tags"
    @change="tags = $event"
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${disabled ? 'disabled' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TagInput } from '@annondeveloper/ui-kit/lite'

const tags = ref(['React', 'TypeScript'])
</script>`
  }
  return `<template>
  <TagInput
    :tags="tags"
    @change="tags = $event"
    ${placeholder ? `placeholder="${placeholder}"` : ''}
    ${size !== 'md' ? `size="${size}"` : ''}
    ${disabled ? 'disabled' : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { TagInput } from '@annondeveloper/ui-kit'

const tags = ref(['React', 'TypeScript'])
</script>`
}

function generateAngularCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  return `<!-- Angular -- ${tier === 'lite' ? 'Lite' : 'Standard'} tier -->
<!-- TagInput requires a JS wrapper for interactivity -->
<div class="${tier === 'lite' ? 'ui-lite-tag-input' : 'ui-tag-input'}" ${size !== 'md' ? `data-size="${size}"` : ''}>
  <div class="${tier === 'lite' ? 'ui-lite-tag-input__tags' : 'ui-tag-input__wrapper'}">
    <span *ngFor="let tag of tags" class="${tier === 'lite' ? 'ui-lite-tag-input__tag' : 'ui-tag-input__tag'}">
      {{ tag }}
      <button type="button" (click)="removeTag(tag)" [attr.aria-label]="'Remove ' + tag" ${disabled ? '[disabled]="true"' : ''}>&times;</button>
    </span>
    <input type="text" ${placeholder ? `placeholder="${placeholder}"` : ''} ${disabled ? '[disabled]="true"' : ''} (keydown.enter)="addTag($event)" />
  </div>
</div>

@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles' : 'css/components/tag-input'}.css';`
}

function generateSvelteCode(tier: Tier, size: Size, placeholder: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { TagInput } from '@annondeveloper/ui-kit/lite';
  let tags = ['React', 'TypeScript'];
</script>

<TagInput
  {tags}
  on:change={(e) => tags = e.detail}
  ${placeholder ? `placeholder="${placeholder}"` : ''}
  ${disabled ? 'disabled' : ''}
/>`
  }
  return `<script>
  import { TagInput } from '@annondeveloper/ui-kit';
  let tags = ['React', 'TypeScript'];
</script>

<TagInput
  {tags}
  on:change={(e) => tags = e.detail}
  ${placeholder ? `placeholder="${placeholder}"` : ''}
  ${size !== 'md' ? `size="${size}"` : ''}
  ${disabled ? 'disabled' : ''}
/>`
}

// ─── Stateful Tag Wrapper ────────────────────────────────────────────────────

function StatefulTagInput({ tier, size, placeholder, maxTags, error, disabled, allowDuplicates, hasValidation, initialTags }: {
  tier: Tier; size: Size; placeholder: string; maxTags: number; error: string; disabled: boolean; allowDuplicates: boolean; hasValidation: boolean; initialTags: string[]
}) {
  const [tags, setTags] = useState(initialTags)
  const validate = hasValidation ? (tag: string) => tag.length >= 2 : undefined

  if (tier === 'lite') {
    return (
      <LiteTagInput
        tags={tags}
        onChange={setTags}
        placeholder={placeholder || undefined}
        maxTags={maxTags > 0 ? maxTags : undefined}
        error={error || undefined}
      />
    )
  }

  return (
    <TagInput
      tags={tags}
      onChange={setTags}
      placeholder={placeholder || undefined}
      size={size}
      maxTags={maxTags > 0 ? maxTags : undefined}
      error={error || undefined}
      disabled={disabled}
      allowDuplicates={allowDuplicates}
      validate={validate}
      aria-label="Tag input"
    />
  )
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [placeholder, setPlaceholder] = useState('Add tag...')
  const [maxTags, setMaxTags] = useState(0)
  const [error, setError] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [allowDuplicates, setAllowDuplicates] = useState(false)
  const [hasValidation, setHasValidation] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(
    () => generateReactCode(tier, size, placeholder, maxTags, error, disabled, allowDuplicates, hasValidation),
    [tier, size, placeholder, maxTags, error, disabled, allowDuplicates, hasValidation],
  )
  const htmlCode = useMemo(() => generateHtmlCode(tier, placeholder), [tier, placeholder])
  const vueCode = useMemo(() => generateVueCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, placeholder, disabled), [tier, size, placeholder, disabled])

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
    <section className="tag-input-page__section" id="playground">
      <h2 className="tag-input-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="tag-input-page__section-desc">
        Tweak every prop and see the result in real-time. Press Enter, comma, or Tab to add a tag. Backspace removes the last tag.
      </p>

      <div className="tag-input-page__playground">
        <div className="tag-input-page__playground-preview">
          <div className="tag-input-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '420px' }}>
              <StatefulTagInput
                tier={tier} size={size} placeholder={placeholder} maxTags={maxTags}
                error={error} disabled={disabled} allowDuplicates={allowDuplicates}
                hasValidation={hasValidation} initialTags={['React', 'TypeScript']}
              />
            </div>
          </div>

          <div className="tag-input-page__code-tabs">
            <div className="tag-input-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="tag-input-page__export-status">{copyStatus}</span>}
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

        <div className="tag-input-page__playground-controls">
          {tier !== 'lite' && <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />}

          <div className="tag-input-page__control-group">
            <span className="tag-input-page__control-label">Max Tags</span>
            <div className="tag-input-page__control-options">
              {[0, 3, 5, 10].map(n => (
                <button key={n} type="button"
                  className={`tag-input-page__option-btn${maxTags === n ? ' tag-input-page__option-btn--active' : ''}`}
                  onClick={() => setMaxTags(n)}>
                  {n === 0 ? 'None' : String(n)}
                </button>
              ))}
            </div>
          </div>

          <div className="tag-input-page__control-group">
            <span className="tag-input-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Allow duplicates" checked={allowDuplicates} onChange={setAllowDuplicates} />}
              {tier !== 'lite' && <Toggle label="Min 2 chars validation" checked={hasValidation} onChange={setHasValidation} />}
            </div>
          </div>

          <div className="tag-input-page__control-group">
            <span className="tag-input-page__control-label">Placeholder</span>
            <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="tag-input-page__text-input" placeholder="Placeholder..." />
          </div>

          <div className="tag-input-page__control-group">
            <span className="tag-input-page__control-label">Error</span>
            <input type="text" value={error} onChange={e => setError(e.target.value)} className="tag-input-page__text-input" placeholder="Error message..." />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TagInputPage() {
  useStyles('tag-input-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]; const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.tag-input-page__section')
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

  // State for stateful demos
  const [defaultTags, setDefaultTags] = useState(['React', 'Vue', 'Svelte'])
  const [errorTags, setErrorTags] = useState(['invalid'])
  const [disabledTags] = useState(['Locked', 'ReadOnly'])
  const [maxTags, setMaxTags] = useState(['One', 'Two', 'Three'])
  const [validatedTags, setValidatedTags] = useState(['React', 'TS'])

  return (
    <div className="tag-input-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="tag-input-page__hero">
        <h1 className="tag-input-page__title">TagInput</h1>
        <p className="tag-input-page__desc">
          Multi-tag input with keyboard shortcuts, validation, max tag limits, and animated tag pills.
          Ships in two tiers: lite with basic functionality and standard with full animation and validation.
        </p>
        <div className="tag-input-page__import-row">
          <code className="tag-input-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="tag-input-page__section" id="sizes">
          <h2 className="tag-input-page__section-title"><a href="#sizes">Size Scale</a></h2>
          <p className="tag-input-page__section-desc">
            Five sizes from compact (xs) to large (xl). Sizes control the wrapper height, tag pill dimensions, and input font-size.
          </p>
          <div className="tag-input-page__preview tag-input-page__preview--col" style={{ gap: '1rem', maxInlineSize: '480px', marginInline: 'auto' }}>
            {SIZES.map(s => {
              const [tags, setTags] = useState(['Tag A', 'Tag B'])
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="tag-input-page__item-label" style={{ minInlineSize: '2rem' }}>{s}</span>
                  <div style={{ flex: 1 }}>
                    <TagInput tags={tags} onChange={setTags} placeholder={`Size ${s}`} size={s} aria-label={`Size ${s}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── 4. Max Tags ────────────────────────────────── */}
      <section className="tag-input-page__section" id="max-tags">
        <h2 className="tag-input-page__section-title"><a href="#max-tags">Max Tags Limit</a></h2>
        <p className="tag-input-page__section-desc">
          Set a maximum number of tags. Once the limit is reached, the input stops accepting new tags.
          Try adding a 4th tag below (limit is 3).
        </p>
        <div className="tag-input-page__preview" style={{ justifyContent: 'center' }}>
          <div style={{ inlineSize: '100%', maxInlineSize: '420px' }}>
            {tier === 'lite' ? (
              <LiteTagInput tags={maxTags} onChange={setMaxTags} maxTags={3} placeholder="Max 3 tags..." />
            ) : (
              <TagInput tags={maxTags} onChange={setMaxTags} maxTags={3} placeholder="Max 3 tags..." aria-label="Max tags demo" />
            )}
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock code={`<TagInput\n  tags={tags}\n  onChange={setTags}\n  maxTags={3}\n  placeholder="Max 3 tags..."\n/>`} language="typescript" />
        </div>
      </section>

      {/* ── 5. Validation ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="tag-input-page__section" id="validation">
          <h2 className="tag-input-page__section-title"><a href="#validation">Custom Validation</a></h2>
          <p className="tag-input-page__section-desc">
            Pass a <code>validate</code> function to reject invalid tags. Below, tags must be at least 2 characters. Try typing "a" and pressing Enter.
          </p>
          <div className="tag-input-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '420px' }}>
              <TagInput
                tags={validatedTags}
                onChange={setValidatedTags}
                validate={(tag) => tag.length >= 2}
                placeholder="Min 2 chars..."
                aria-label="Validated tags"
              />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<TagInput\n  tags={tags}\n  onChange={setTags}\n  validate={(tag) => tag.length >= 2}\n  placeholder="Min 2 chars..."\n/>`} language="typescript" />
          </div>
        </section>
      )}

      {/* ── 6. States ──────────────────────────────────── */}
      <section className="tag-input-page__section" id="states">
        <h2 className="tag-input-page__section-title"><a href="#states">States</a></h2>
        <p className="tag-input-page__section-desc">
          TagInput handles all interaction states with clear visual feedback including focus glow, error highlights, and disabled styling.
        </p>
        <div className="tag-input-page__states-grid">
          <div className="tag-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteTagInput tags={defaultTags} onChange={setDefaultTags} placeholder="Add tag..." />
            ) : (
              <TagInput tags={defaultTags} onChange={setDefaultTags} placeholder="Add tag..." aria-label="Default state" />
            )}
            <span className="tag-input-page__state-label">Default</span>
          </div>
          <div className="tag-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteTagInput tags={errorTags} onChange={setErrorTags} error="At least 2 tags required" />
            ) : (
              <TagInput tags={errorTags} onChange={setErrorTags} error="At least 2 tags required" aria-label="Error state" />
            )}
            <span className="tag-input-page__state-label">Error</span>
          </div>
          <div className="tag-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteTagInput tags={disabledTags} onChange={() => {}} />
            ) : (
              <TagInput tags={disabledTags} onChange={() => {}} disabled aria-label="Disabled state" />
            )}
            <span className="tag-input-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="tag-input-page__section" id="tiers">
        <h2 className="tag-input-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="tag-input-page__section-desc">
          Lite provides basic tag input/remove. Standard adds size variants, validation, allowDuplicates, motion animation, and aria-describedby.
        </p>

        <div className="tag-input-page__tiers">
          {/* Lite */}
          <div className={`tag-input-page__tier-card${tier === 'lite' ? ' tag-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="tag-input-page__tier-header">
              <span className="tag-input-page__tier-name">Lite</span>
              <span className="tag-input-page__tier-size">~0.5 KB</span>
            </div>
            <p className="tag-input-page__tier-desc">Basic tag input with add/remove. No sizes, motion, or custom validation.</p>
            <div className="tag-input-page__tier-import">import {'{'} TagInput {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="tag-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <StatefulTagInput tier="lite" size="md" placeholder="Add tag..." maxTags={0} error="" disabled={false} allowDuplicates={false} hasValidation={false} initialTags={['Lite']} />
              </div>
            </div>
            <div className="tag-input-page__size-breakdown">
              <div className="tag-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.2 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div className={`tag-input-page__tier-card${tier === 'standard' ? ' tag-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="tag-input-page__tier-header">
              <span className="tag-input-page__tier-name">Standard</span>
              <span className="tag-input-page__tier-size">~2 KB</span>
            </div>
            <p className="tag-input-page__tier-desc">Full-featured with 5 sizes, validation, duplicate control, animated tag pills, and error states.</p>
            <div className="tag-input-page__tier-import">import {'{'} TagInput {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="tag-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <StatefulTagInput tier="standard" size="md" placeholder="Add..." maxTags={0} error="" disabled={false} allowDuplicates={false} hasValidation={false} initialTags={['Standard']} />
              </div>
            </div>
            <div className="tag-input-page__size-breakdown">
              <div className="tag-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className={`tag-input-page__tier-card${tier === 'premium' ? ' tag-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="tag-input-page__tier-header">
              <span className="tag-input-page__tier-name">Premium</span>
              <span className="tag-input-page__tier-size">~3-5 KB</span>
            </div>
            <p className="tag-input-page__tier-desc">Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.</p>
            <div className="tag-input-page__tier-import">import {'{'} TagInput {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="tag-input-page__tier-preview">
              <div style={{ inlineSize: '100%' }}>
                <StatefulTagInput tier="standard" size="md" placeholder="Add..." maxTags={0} error="" disabled={false} allowDuplicates={false} hasValidation={false} initialTags={['Premium']} />
              </div>
            </div>
            <div className="tag-input-page__size-breakdown">
              <div className="tag-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Keyboard Interactions ──────────────────── */}
      <section className="tag-input-page__section" id="keyboard">
        <h2 className="tag-input-page__section-title">
          <a href="#keyboard">Keyboard Interactions</a>
        </h2>
        <p className="tag-input-page__section-desc">
          TagInput supports multiple keyboard shortcuts for efficient tag management.
          These work across all tiers.
        </p>
        <div className="tag-input-page__preview tag-input-page__preview--col" style={{ gap: '1.5rem', maxInlineSize: '480px', marginInline: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="tag-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Enter</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Adds the current text as a new tag
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="tag-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>,</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Adds the current text as a new tag (comma separator)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="tag-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Tab</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Adds the current text and moves focus to next element
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code className="tag-input-page__a11y-key" style={{ minInlineSize: '6rem', textAlign: 'center' }}>Backspace</code>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Removes the last tag when input is empty
              </span>
            </div>
          </div>
          <div style={{ marginBlockStart: '0.5rem' }}>
            <StatefulTagInput
              tier={tier}
              size="md"
              placeholder="Try keyboard shortcuts..."
              maxTags={0}
              error=""
              disabled={false}
              allowDuplicates={false}
              hasValidation={false}
              initialTags={['Try', 'Keyboard']}
            />
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`// Tags are added on Enter, comma, or Tab\n// Backspace removes the last tag when input is empty\n<TagInput\n  tags={tags}\n  onChange={setTags}\n  placeholder="Type and press Enter..."\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 9. Allow Duplicates ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="tag-input-page__section" id="duplicates">
          <h2 className="tag-input-page__section-title">
            <a href="#duplicates">Allow Duplicates</a>
          </h2>
          <p className="tag-input-page__section-desc">
            By default, duplicate tags are rejected. Set <code>allowDuplicates</code> to true to allow the same tag multiple times.
            Try typing "React" below -- duplicates will be accepted.
          </p>
          <div className="tag-input-page__preview" style={{ justifyContent: 'center' }}>
            <div style={{ inlineSize: '100%', maxInlineSize: '420px' }}>
              <StatefulTagInput
                tier="standard"
                size="md"
                placeholder="Duplicates OK..."
                maxTags={0}
                error=""
                disabled={false}
                allowDuplicates={true}
                hasValidation={false}
                initialTags={['React', 'React']}
              />
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<TagInput\n  tags={tags}\n  onChange={setTags}\n  allowDuplicates\n  placeholder="Duplicates OK..."\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 10. Brand Color ─────────────────────────────── */}
      <section className="tag-input-page__section" id="brand-color">
        <h2 className="tag-input-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="tag-input-page__section-desc">
          Pick a brand color to see the tag input focus glow update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
          <div className="tag-input-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button key={p.hex} type="button"
                className={`tag-input-page__color-preset${brandColor === p.hex ? ' tag-input-page__color-preset--active' : ''}`}
                style={{ background: p.hex }} onClick={() => setBrandColor(p.hex)} title={p.name} aria-label={`Set brand color to ${p.name}`} />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 9. Props API ──────────────────────────────── */}
      <section className="tag-input-page__section" id="props">
        <h2 className="tag-input-page__section-title"><a href="#props">Props API</a></h2>
        <p className="tag-input-page__section-desc">
          All props accepted by TagInput. It also spreads native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tagInputPropDefs} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="tag-input-page__section" id="accessibility">
        <h2 className="tag-input-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="tag-input-page__section-desc">
          Built with keyboard-first interaction and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="tag-input-page__a11y-list">
            <li className="tag-input-page__a11y-item">
              <span className="tag-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="tag-input-page__a11y-key">Enter</code>, <code className="tag-input-page__a11y-key">,</code>, and <code className="tag-input-page__a11y-key">Tab</code> add tags. <code className="tag-input-page__a11y-key">Backspace</code> removes the last tag.
              </span>
            </li>
            <li className="tag-input-page__a11y-item">
              <span className="tag-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Remove buttons:</strong> Each tag pill has a remove button with <code className="tag-input-page__a11y-key">aria-label="Remove [tag]"</code>.
              </span>
            </li>
            <li className="tag-input-page__a11y-item">
              <span className="tag-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error announcements:</strong> Error messages use <code className="tag-input-page__a11y-key">role="alert"</code> and <code className="tag-input-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="tag-input-page__a11y-item">
              <span className="tag-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on the wrapper via <code className="tag-input-page__a11y-key">:focus-within</code>.
              </span>
            </li>
            <li className="tag-input-page__a11y-item">
              <span className="tag-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="tag-input-page__a11y-key">forced-colors: active</code> with visible borders on tags and wrapper.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
