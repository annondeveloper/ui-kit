'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { AvatarUpload } from '@ui/components/avatar-upload'
import { AvatarUpload as LiteAvatarUpload } from '@ui/lite/avatar-upload'
import { AvatarUpload as PremiumAvatarUpload } from '@ui/premium/avatar-upload'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.avatar-upload-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: avatar-upload-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .avatar-upload-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .avatar-upload-page__hero::before {
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
        animation: aurora-spin-aup 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-aup {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .avatar-upload-page__hero::before { animation: none; }
      }

      .avatar-upload-page__title {
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

      .avatar-upload-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .avatar-upload-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .avatar-upload-page__import-code {
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

      .avatar-upload-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .avatar-upload-page__section {
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
        animation: aup-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes aup-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .avatar-upload-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .avatar-upload-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .avatar-upload-page__section-title a { color: inherit; text-decoration: none; }
      .avatar-upload-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .avatar-upload-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .avatar-upload-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .avatar-upload-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .avatar-upload-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .avatar-upload-page__playground { grid-template-columns: 1fr; }
        .avatar-upload-page__playground-controls { position: static !important; }
      }

      @container avatar-upload-page (max-width: 680px) {
        .avatar-upload-page__playground { grid-template-columns: 1fr; }
        .avatar-upload-page__playground-controls { position: static !important; }
      }

      .avatar-upload-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .avatar-upload-page__playground-result {
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

      .avatar-upload-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .avatar-upload-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .avatar-upload-page__playground-controls {
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

      .avatar-upload-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .avatar-upload-page__control-label { font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
      .avatar-upload-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .avatar-upload-page__option-btn {
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
      .avatar-upload-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .avatar-upload-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .avatar-upload-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .avatar-upload-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .avatar-upload-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .avatar-upload-page__labeled-row { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end; }
      .avatar-upload-page__labeled-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .avatar-upload-page__item-label { font-size: 0.6875rem; color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; text-transform: lowercase; letter-spacing: 0.03em; }

      /* ── Weight Tier Cards ──────────────────────────── */

      .avatar-upload-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .avatar-upload-page__tier-card {
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

      .avatar-upload-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .avatar-upload-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .avatar-upload-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .avatar-upload-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .avatar-upload-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .avatar-upload-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .avatar-upload-page__tier-import {
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

      .avatar-upload-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .avatar-upload-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .avatar-upload-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .avatar-upload-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .avatar-upload-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .avatar-upload-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .avatar-upload-page__a11y-key { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem); background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-primary); }

      .avatar-upload-page__source-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--brand); text-decoration: none; font-weight: 500; }
      .avatar-upload-page__source-link:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      /* ── Color picker ──────────────────────────────── */

      .avatar-upload-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .avatar-upload-page__color-preset { inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s; box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2); }
      .avatar-upload-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .avatar-upload-page__color-preset--active { border-color: oklch(100% 0 0); transform: scale(1.2); box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5); }

      .avatar-upload-page__code-tabs { margin-block-start: 1rem; }
      .avatar-upload-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .avatar-upload-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .avatar-upload-page__hero { padding: 2rem 1.25rem; }
        .avatar-upload-page__title { font-size: 1.75rem; }
        .avatar-upload-page__preview { padding: 1.75rem; }
        .avatar-upload-page__playground { grid-template-columns: 1fr; }
        .avatar-upload-page__playground-result { padding: 2rem; overflow-x: auto; min-block-size: 120px; }
        .avatar-upload-page__tiers { grid-template-columns: 1fr; }
        .avatar-upload-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .avatar-upload-page__hero { padding: 1.5rem 1rem; }
        .avatar-upload-page__title { font-size: 1.5rem; }
        .avatar-upload-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .avatar-upload-page__title { font-size: 4rem; }
        .avatar-upload-page__preview { padding: 3.5rem; }
      }

      .avatar-upload-page__import-code, .avatar-upload-page code, pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propsData: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled image URL or data URI for the preview.' },
  { name: 'onChange', type: '(file: File, preview: string) => void', description: 'Callback when a file is selected. Receives the File and a data URI preview string.' },
  { name: 'onRemove', type: '() => void', description: 'Called when the remove button is clicked.' },
  { name: 'size', type: 'number', default: '120', description: 'Width and height of the upload area in pixels.' },
  { name: 'accept', type: 'string', default: "'image/*'", description: 'Accepted file MIME types.' },
  { name: 'maxSize', type: 'number', description: 'Maximum file size in bytes.' },
  { name: 'placeholder', type: 'ReactNode', description: 'Custom placeholder content when no image is set.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the upload interaction.' },
  { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape of the avatar preview area.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Shape = 'circle' | 'square'

const SIZES = [60, 80, 120, 160] as const
const SHAPES: Shape[] = ['circle', 'square']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { AvatarUpload } from '@annondeveloper/ui-kit/lite'",
  standard: "import { AvatarUpload } from '@annondeveloper/ui-kit'",
  premium: "import { AvatarUpload } from '@annondeveloper/ui-kit/premium'",
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
    <Button size="sm" variant="secondary" className="avatar-upload-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="avatar-upload-page__control-group">
      <span className="avatar-upload-page__control-label">{label}</span>
      <div className="avatar-upload-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`avatar-upload-page__option-btn${opt === value ? ' avatar-upload-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="avatar-upload-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: number, shape: Shape, accept: string, maxSize: string, disabled: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 120) props.push(`  size={${size}}`)
  if (shape !== 'circle') props.push(`  shape="${shape}"`)
  if (accept !== 'image/*') props.push(`  accept="${accept}"`)
  if (maxSize) props.push(`  maxSize={${maxSize}}`)
  if (disabled) props.push('  disabled')
  props.push('  onChange={(file, preview) => console.log(file.name, preview)}')
  props.push('  onRemove={() => console.log("removed")}')
  return `${importStr}

<AvatarUpload
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, size: number, shape: Shape): string {
  const className = tier === 'lite' ? 'ui-lite-avatar-upload' : 'ui-avatar-upload'
  return `<!-- AvatarUpload — @annondeveloper/ui-kit ${tier} tier -->
<div class="${className}" data-shape="${shape}">
  <label class="${className}__container" style="width: ${size}px; height: ${size}px;">
    <input type="file" accept="image/*" class="${className}__input" />
    <div class="${className}__placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
      <span>Upload</span>
    </div>
  </label>
</div>

<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/avatar-upload.css">`
}

function generateVueCode(tier: Tier, size: number, shape: Shape, accept: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <AvatarUpload
    :size="${size}"
    shape="${shape}"${accept !== 'image/*' ? `\n    accept="${accept}"` : ''}${disabled ? '\n    disabled' : ''}
    @change="handleChange"
    @remove="handleRemove"
  />
</template>

<script setup>
import { AvatarUpload } from '@annondeveloper/ui-kit/lite'

function handleChange(file, preview) {
  console.log('Selected:', file.name)
}

function handleRemove() {
  console.log('Removed')
}
</script>`
  }
  return `<template>
  <AvatarUpload
    :size="${size}"
    shape="${shape}"${accept !== 'image/*' ? `\n    accept="${accept}"` : ''}${disabled ? '\n    disabled' : ''}
    @change="handleChange"
    @remove="handleRemove"
  />
</template>

<script setup>
import { AvatarUpload } from '@annondeveloper/ui-kit'

function handleChange(file, preview) {
  console.log('Selected:', file.name)
}

function handleRemove() {
  console.log('Removed')
}
</script>`
}

function generateAngularCode(tier: Tier, size: number, shape: Shape): string {
  const className = tier === 'lite' ? 'ui-lite-avatar-upload' : 'ui-avatar-upload'
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier CSS -->
<div class="${className}" data-shape="${shape}">
  <label class="${className}__container"
    [style.width.px]="${size}"
    [style.height.px]="${size}">
    <input type="file" accept="image/*"
      class="${className}__input"
      (change)="onFileChange($event)" />
    <div class="${className}__placeholder">Upload</div>
  </label>
</div>

@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/avatar-upload.css'}';`
}

function generateSvelteCode(tier: Tier, size: number, shape: Shape, accept: string, disabled: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { AvatarUpload } from '@annondeveloper/ui-kit/lite'

  function handleChange(file, preview) {
    console.log('Selected:', file.name)
  }
</script>

<AvatarUpload
  size={${size}}
  shape="${shape}"${accept !== 'image/*' ? `\n  accept="${accept}"` : ''}${disabled ? '\n  disabled' : ''}
  on:change={handleChange}
  on:remove={() => console.log('Removed')}
/>`
  }
  return `<script>
  import { AvatarUpload } from '@annondeveloper/ui-kit${tier === 'premium' ? '/premium' : ''}'

  function handleChange(file, preview) {
    console.log('Selected:', file.name)
  }
</script>

<AvatarUpload
  size={${size}}
  shape="${shape}"${accept !== 'image/*' ? `\n  accept="${accept}"` : ''}${disabled ? '\n  disabled' : ''}
  on:change={handleChange}
  on:remove={() => console.log('Removed')}
/>`
}

// ─── Interactive Playground ──────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<number>(120)
  const [shape, setShape] = useState<Shape>('circle')
  const [accept, setAccept] = useState('image/*')
  const [maxSize, setMaxSize] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(undefined)

  const handleChange = (_file: File, preview: string) => {
    setPreviewSrc(preview)
  }

  const handleRemove = () => {
    setPreviewSrc(undefined)
  }

  const reactCode = useMemo(() => generateReactCode(tier, size, shape, accept, maxSize, disabled), [tier, size, shape, accept, maxSize, disabled])
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, shape), [tier, size, shape])
  const vueCode = useMemo(() => generateVueCode(tier, size, shape, accept, disabled), [tier, size, shape, accept, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, size, shape), [tier, size, shape])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, shape, accept, disabled), [tier, size, shape, accept, disabled])

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

  const renderUpload = () => {
    const commonProps = {
      value: previewSrc,
      onChange: handleChange,
      onRemove: previewSrc ? handleRemove : undefined,
      size,
      shape,
      accept,
      maxSize: maxSize ? Number(maxSize) : undefined,
      disabled,
    }

    if (tier === 'lite') {
      return <LiteAvatarUpload {...commonProps} />
    }
    if (tier === 'premium') {
      return <PremiumAvatarUpload {...commonProps} motion={motion} />
    }
    return <AvatarUpload {...commonProps} />
  }

  return (
    <section className="avatar-upload-page__section" id="playground">
      <h2 className="avatar-upload-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="avatar-upload-page__section-desc">
        Tweak every prop and see the result in real-time. Upload a file, change shape and size, toggle disabled state. The generated code updates as you change settings.
      </p>

      <div className="avatar-upload-page__playground">
        <div className="avatar-upload-page__playground-preview">
          <div className="avatar-upload-page__playground-result">
            {renderUpload()}
          </div>

          <div className="avatar-upload-page__code-tabs">
            <div className="avatar-upload-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}
              >Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="avatar-upload-page__export-status">{copyStatus}</span>}
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

        <div className="avatar-upload-page__playground-controls">
          <OptionGroup label="Size" options={['60', '80', '120', '160'] as const} value={String(size) as any} onChange={v => setSize(Number(v))} />
          <OptionGroup label="Shape" options={SHAPES} value={shape} onChange={setShape} />
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="avatar-upload-page__control-group">
            <span className="avatar-upload-page__control-label">Accept</span>
            <input type="text" value={accept} onChange={e => setAccept(e.target.value)} className="avatar-upload-page__text-input" placeholder="image/*" />
          </div>

          <div className="avatar-upload-page__control-group">
            <span className="avatar-upload-page__control-label">Max Size (bytes)</span>
            <input type="text" value={maxSize} onChange={e => setMaxSize(e.target.value)} className="avatar-upload-page__text-input" placeholder="e.g. 2097152 (2MB)" />
          </div>

          <div className="avatar-upload-page__control-group">
            <span className="avatar-upload-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvatarUploadPage() {
  useStyles('avatar-upload-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => { try { return generateTheme(brandColor, mode) } catch { return null } }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = ['brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2']

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) { const cssVar = TOKEN_TO_CSS[key]; const value = themeTokens[key]; if (cssVar && value) style[cssVar] = value }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  const [avatar1, setAvatar1] = useState<string | undefined>(undefined)
  const [avatar2, setAvatar2] = useState<string | undefined>(undefined)

  useEffect(() => {
    const sections = document.querySelectorAll('.avatar-upload-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  const effectiveTier = tier

  const renderUpload = (props: { value?: string; onChange: (file: File, preview: string) => void; onRemove?: () => void; size?: number; shape?: Shape; disabled?: boolean }) => {
    if (effectiveTier === 'lite') return <LiteAvatarUpload {...props} />
    if (effectiveTier === 'premium') return <PremiumAvatarUpload {...props} />
    return <AvatarUpload {...props} />
  }

  return (
    <div className="avatar-upload-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero ──────────────────────────────── */}
      <div className="avatar-upload-page__hero">
        <h1 className="avatar-upload-page__title">AvatarUpload</h1>
        <p className="avatar-upload-page__desc">
          Image upload component with circular or square preview, drag-and-drop support,
          file validation, and instant preview via FileReader. Ships in three weight tiers
          with motion choreography and accessibility built in.
        </p>
        <div className="avatar-upload-page__import-row">
          <code className="avatar-upload-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Basic Upload ──────────────────────────── */}
      <section className="avatar-upload-page__section" id="basic">
        <h2 className="avatar-upload-page__section-title"><a href="#basic">Basic Upload</a></h2>
        <p className="avatar-upload-page__section-desc">
          Click to select an image or drag and drop a file. The preview updates instantly.
          When an image is set, hovering reveals a "Change" overlay.
        </p>
        <div className="avatar-upload-page__preview">
          {renderUpload({
            value: avatar1,
            onChange: (_file, preview) => setAvatar1(preview),
            onRemove: avatar1 ? () => setAvatar1(undefined) : undefined,
          })}
        </div>
      </section>

      {/* ── 4. Sizes ────────────────────────── */}
      <section className="avatar-upload-page__section" id="sizes">
        <h2 className="avatar-upload-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="avatar-upload-page__section-desc">
          Four standard sizes from 60px to 160px. Pass any pixel value via the <code>size</code> prop.
        </p>
        <div className="avatar-upload-page__preview">
          <div className="avatar-upload-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="avatar-upload-page__labeled-item">
                {effectiveTier === 'lite' ? (
                  <LiteAvatarUpload value={undefined} onChange={() => {}} size={s} />
                ) : effectiveTier === 'premium' ? (
                  <PremiumAvatarUpload value={undefined} onChange={() => {}} size={s} />
                ) : (
                  <AvatarUpload value={undefined} onChange={() => {}} size={s} />
                )}
                <span className="avatar-upload-page__item-label">{s}px</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Shapes ──────────────────────────── */}
      <section className="avatar-upload-page__section" id="shapes">
        <h2 className="avatar-upload-page__section-title"><a href="#shapes">Shapes</a></h2>
        <p className="avatar-upload-page__section-desc">
          Circle for user profiles, square for logos and branding. Both shapes support drag-and-drop.
        </p>
        <div className="avatar-upload-page__preview">
          <div className="avatar-upload-page__labeled-row">
            {SHAPES.map(s => (
              <div key={s} className="avatar-upload-page__labeled-item">
                {renderUpload({
                  value: avatar2,
                  onChange: (_file, preview) => setAvatar2(preview),
                  onRemove: avatar2 ? () => setAvatar2(undefined) : undefined,
                  shape: s,
                })}
                <span className="avatar-upload-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Disabled State ──────────────────────── */}
      <section className="avatar-upload-page__section" id="disabled">
        <h2 className="avatar-upload-page__section-title"><a href="#disabled">Disabled State</a></h2>
        <p className="avatar-upload-page__section-desc">
          When disabled, the upload area is muted and does not accept interactions or drag-and-drop.
        </p>
        <div className="avatar-upload-page__preview">
          <div className="avatar-upload-page__labeled-row">
            <div className="avatar-upload-page__labeled-item">
              {renderUpload({ value: undefined, onChange: () => {}, disabled: true })}
              <span className="avatar-upload-page__item-label">empty</span>
            </div>
            <div className="avatar-upload-page__labeled-item">
              {renderUpload({ value: 'https://i.pravatar.cc/150?u=disabled', onChange: () => {}, disabled: true })}
              <span className="avatar-upload-page__item-label">with image</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="avatar-upload-page__section" id="tiers">
        <h2 className="avatar-upload-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="avatar-upload-page__section-desc">
          Choose the right balance of features and bundle size. Lite is zero-motion, Premium adds aurora glow and spring animations.
        </p>

        <div className="avatar-upload-page__tiers">
          <div
            className={`avatar-upload-page__tier-card${tier === 'lite' ? ' avatar-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="avatar-upload-page__tier-header">
              <span className="avatar-upload-page__tier-name">Lite</span>
              <span className="avatar-upload-page__tier-size">~0.3 KB gzip</span>
            </div>
            <p className="avatar-upload-page__tier-desc">
              Minimal wrapper. No motion, no premium effects. Wraps standard with motion=0.
            </p>
            <div className="avatar-upload-page__tier-import">import {'{'} AvatarUpload {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="avatar-upload-page__tier-preview">
              <LiteAvatarUpload value={undefined} onChange={() => {}} size={80} />
            </div>
            <div className="avatar-upload-page__size-breakdown">
              <div className="avatar-upload-page__size-row">JS ~0.3 KB | CSS ~0 KB (shared)</div>
            </div>
          </div>

          <div
            className={`avatar-upload-page__tier-card${tier === 'standard' ? ' avatar-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="avatar-upload-page__tier-header">
              <span className="avatar-upload-page__tier-name">Standard</span>
              <span className="avatar-upload-page__tier-size">~1.8 KB gzip</span>
            </div>
            <p className="avatar-upload-page__tier-desc">
              Full-featured with drag-and-drop, file validation, motion choreography, and theming.
            </p>
            <div className="avatar-upload-page__tier-import">import {'{'} AvatarUpload {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="avatar-upload-page__tier-preview">
              <AvatarUpload value={undefined} onChange={() => {}} size={80} />
            </div>
            <div className="avatar-upload-page__size-breakdown">
              <div className="avatar-upload-page__size-row">JS ~1.8 KB | CSS ~0.8 KB</div>
            </div>
          </div>

          <div
            className={`avatar-upload-page__tier-card${tier === 'premium' ? ' avatar-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="avatar-upload-page__tier-header">
              <span className="avatar-upload-page__tier-name">Premium</span>
              <span className="avatar-upload-page__tier-size">~2.2 KB gzip</span>
            </div>
            <p className="avatar-upload-page__tier-desc">
              Aurora ring glow on hover, spring entrance animation, and enhanced hover transform.
            </p>
            <div className="avatar-upload-page__tier-import">import {'{'} AvatarUpload {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="avatar-upload-page__tier-preview">
              <PremiumAvatarUpload value={undefined} onChange={() => {}} size={80} />
            </div>
            <div className="avatar-upload-page__size-breakdown">
              <div className="avatar-upload-page__size-row">JS ~2.2 KB | CSS ~1.0 KB</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Accessibility ────────────────────────────── */}
      <section className="avatar-upload-page__section" id="accessibility">
        <h2 className="avatar-upload-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="avatar-upload-page__section-desc">
          Built with native HTML elements and ARIA attributes for full screen reader and keyboard support.
        </p>
        <ul className="avatar-upload-page__a11y-list">
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Native <code className="avatar-upload-page__a11y-key">&lt;input type="file"&gt;</code> hidden with <code className="avatar-upload-page__a11y-key">clip: rect(0,0,0,0)</code> for screen reader discovery</span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span><code className="avatar-upload-page__a11y-key">aria-label="Upload avatar"</code> on the clickable label for context</span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Remove button has <code className="avatar-upload-page__a11y-key">aria-label="Remove avatar"</code> and <code className="avatar-upload-page__a11y-key">focus-visible</code> ring</span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>Error messages use <code className="avatar-upload-page__a11y-key">role="alert"</code> for live region announcements</span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span>44px minimum touch targets on coarse pointer devices via <code className="avatar-upload-page__a11y-key">@media (pointer: coarse)</code></span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span><code className="avatar-upload-page__a11y-key">@media (forced-colors: active)</code> support for Windows High Contrast mode</span>
          </li>
          <li className="avatar-upload-page__a11y-item">
            <span className="avatar-upload-page__a11y-icon"><Icon name="check" size="sm" /></span>
            <span><code className="avatar-upload-page__a11y-key">prefers-reduced-motion</code> respected at all motion levels</span>
          </li>
        </ul>
      </section>

      {/* ── 9. Brand Color ────────────────────────────── */}
      <section className="avatar-upload-page__section" id="brand-color">
        <h2 className="avatar-upload-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="avatar-upload-page__section-desc">
          The upload area glow and focus ring adapt to your brand color via OKLCH theme generation.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlockEnd: '1rem', flexWrap: 'wrap' }}>
          <ColorInput value={brandColor} onChange={setBrandColor} />
          <div className="avatar-upload-page__color-presets">
            {COLOR_PRESETS.map(c => (
              <button key={c.hex} type="button" title={c.name}
                className={`avatar-upload-page__color-preset${brandColor === c.hex ? ' avatar-upload-page__color-preset--active' : ''}`}
                style={{ background: c.hex }}
                onClick={() => setBrandColor(c.hex)}
              />
            ))}
          </div>
        </div>
        <div className="avatar-upload-page__preview">
          {renderUpload({ value: undefined, onChange: () => {} })}
        </div>
      </section>

      {/* ── 10. Props ─────────────────────────────────── */}
      <section className="avatar-upload-page__section" id="props">
        <h2 className="avatar-upload-page__section-title"><a href="#props">Props API</a></h2>
        <p className="avatar-upload-page__section-desc">
          All props accepted by the AvatarUpload component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── 11. Source ─────────────────────────────────── */}
      <section className="avatar-upload-page__section" id="source">
        <h2 className="avatar-upload-page__section-title"><a href="#source">Source</a></h2>
        <p className="avatar-upload-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="avatar-upload-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/avatar-upload.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source — Standard tier
          </a>
          <a className="avatar-upload-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/avatar-upload.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source — Lite tier
          </a>
          <a className="avatar-upload-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/avatar-upload.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> Source — Premium tier
          </a>
        </div>
      </section>
    </div>
  )
}
