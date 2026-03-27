'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ColorInput } from '@ui/components/color-input'
import { ColorInput as LiteColorInput } from '@ui/lite/color-input'
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
    @scope (.color-input-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: color-input-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .color-input-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .color-input-page__hero::before {
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
        animation: color-input-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes color-input-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .color-input-page__hero::before { animation: none; }
      }

      .color-input-page__title {
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

      .color-input-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .color-input-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .color-input-page__import-code {
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

      .color-input-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .color-input-page__section {
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
        animation: color-input-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes color-input-page__section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .color-input-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .color-input-page__section-title {
        font-size: 1.125rem; font-weight: 700; color: var(--text-primary);
        margin: 0 0 0.375rem; padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3; scroll-margin-block-start: 2rem;
      }
      .color-input-page__section-title a { color: inherit; text-decoration: none; }
      .color-input-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .color-input-page__section-desc {
        color: var(--text-secondary); font-size: var(--text-sm, 0.875rem);
        line-height: 1.6; margin: 0 0 1.5rem; text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────────── */

      .color-input-page__preview {
        padding: 2.5rem; border-radius: var(--radius-md); background: var(--bg-base);
        position: relative; overflow: hidden; display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center; gap: 1.25rem; min-block-size: 80px;
      }
      .color-input-page__preview::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .color-input-page__preview--col { flex-direction: column; align-items: flex-start; }

      /* ── Playground ─────────────────────────────────── */

      .color-input-page__playground {
        display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start;
      }
      @media (max-width: 768px) {
        .color-input-page__playground { grid-template-columns: 1fr; }
        .color-input-page__playground-controls { position: static !important; }
      }
      @container color-input-page (max-width: 680px) {
        .color-input-page__playground { grid-template-columns: 1fr; }
        .color-input-page__playground-controls { position: static !important; }
      }

      .color-input-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .color-input-page__playground-result {
        overflow: visible;
        min-block-size: 200px; display: grid; place-items: center; padding: 3rem;
        background: var(--bg-base); border-radius: var(--radius-md);
        position: relative; overflow: hidden;
      }
      .color-input-page__playground-result::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .color-input-page__playground-result::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .color-input-page__playground-controls {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.25rem;
        display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem;
      }

      .color-input-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .color-input-page__control-label {
        font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .color-input-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .color-input-page__option-btn {
        font-size: var(--text-xs, 0.75rem); padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-secondary); cursor: pointer;
        font-family: inherit; font-weight: 500; transition: all 0.12s; line-height: 1.4;
      }
      .color-input-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .color-input-page__option-btn--active {
        background: var(--brand); color: oklch(100% 0 0);
        border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .color-input-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .color-input-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }

      .color-input-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Color palette demo ──────────────────────────── */

      .color-input-page__palette {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.75rem;
      }

      .color-input-page__palette-item {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        align-items: center;
      }

      .color-input-page__palette-swatch {
        inline-size: 100%;
        aspect-ratio: 1;
        border-radius: var(--radius-md);
        border: 2px solid var(--border-default);
        transition: transform 0.15s, box-shadow 0.15s;
      }

      .color-input-page__palette-swatch:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.2);
      }

      .color-input-page__palette-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      /* ── Theme generator demo ────────────────────────── */

      .color-input-page__theme-row {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .color-input-page__theme-preview {
        display: flex;
        gap: 0.5rem;
      }

      .color-input-page__theme-swatch-sm {
        inline-size: 32px;
        block-size: 32px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
      }

      /* ── Labeled row ────────────────────────────────── */

      .color-input-page__labeled-row {
        display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end;
      }
      .color-input-page__labeled-item {
        display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      }
      .color-input-page__item-label {
        font-size: 0.6875rem; color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase; letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .color-input-page__states-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;
      }
      .color-input-page__state-cell {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 1.25rem 0.75rem; border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .color-input-page__state-cell:hover {
        border-color: var(--border-default); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }
      .color-input-page__state-label {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-weight: 500;
      }

      /* ── Color preview swatch ────────────────────────── */

      .color-input-page__color-swatch {
        inline-size: 80px;
        block-size: 80px;
        border-radius: var(--radius-md);
        border: 2px solid var(--border-default);
        transition: background-color 0.2s;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .color-input-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .color-input-page__tier-card {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column;
        gap: 0.75rem; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0; overflow: hidden;
      }
      .color-input-page__tier-card:hover {
        border-color: var(--border-strong); transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .color-input-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .color-input-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .color-input-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .color-input-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .color-input-page__tier-size {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
      .color-input-page__tier-desc {
        font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start;
      }
      .color-input-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle);
        padding: 0.375rem 0.5rem; border-radius: var(--radius-sm);
        overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4;
      }
      .color-input-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .color-input-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .color-input-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */

      .color-input-page__code-tabs { margin-block-start: 1rem; }
      .color-input-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .color-input-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── A11y list ──────────────────────────────────── */

      .color-input-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .color-input-page__a11y-item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5;
      }
      .color-input-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .color-input-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle); color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .color-input-page__hero { padding: 2rem 1.25rem; }
        .color-input-page__title { font-size: 1.75rem; }
        .color-input-page__preview { padding: 1.75rem; }
        .color-input-page__playground { grid-template-columns: 1fr; }
        .color-input-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .color-input-page__states-grid { grid-template-columns: 1fr; }
        .color-input-page__tiers { grid-template-columns: 1fr; }
        .color-input-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .color-input-page__hero { padding: 1.5rem 1rem; }
        .color-input-page__title { font-size: 1.5rem; }
        .color-input-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .color-input-page__title { font-size: 4rem; }
        .color-input-page__preview { padding: 3.5rem; }
      }

      .color-input-page__import-code,
      .color-input-page code,
      pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const colorInputProps: PropDef[] = [
  { name: 'name', type: 'string', description: 'Form field name for the hex input.' },
  { name: 'value', type: 'string', description: 'Controlled hex color value (e.g. "#ff0000").' },
  { name: 'defaultValue', type: 'string', default: "'#000000'", description: 'Initial color for uncontrolled mode.' },
  { name: 'onChange', type: '(color: string) => void', description: 'Callback when color changes.' },
  { name: 'label', type: 'ReactNode', description: 'Label rendered above the input.' },
  { name: 'error', type: 'string', description: 'Error message with animated entry.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire color input.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls trigger and input dimensions.' },
  { name: 'swatches', type: 'string[]', description: 'Array of preset hex colors shown in the popover.' },
  { name: 'showInput', type: 'boolean', default: 'true', description: 'Show the hex text input alongside the swatch trigger.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for popover entry and error animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']
const DEFAULT_SWATCHES = ['#ff0000', '#ff8800', '#ffcc00', '#00cc44', '#0088ff', '#6644ff', '#cc00cc', '#ff4488', '#222222', '#888888']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ColorInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ColorInput } from '@annondeveloper/ui-kit'",
  premium: "import { ColorInput } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" className="color-input-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="color-input-page__control-group">
      <span className="color-input-page__control-label">{label}</span>
      <div className="color-input-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`color-input-page__option-btn${opt === value ? ' color-input-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="color-input-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, label: string, disabled: boolean, showInput: boolean, swatches: boolean, error: string, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const attrs: string[] = []
    if (label) attrs.push(`  label="${label}"`)
    const jsx = attrs.length === 0
      ? '<ColorInput value={color} onChange={(e) => setColor(e.target.value)} />'
      : `<ColorInput\n  value={color}\n  onChange={(e) => setColor(e.target.value)}\n${attrs.join('\n')}\n/>`
    return `${importStr}\n\nconst [color, setColor] = useState('#6366f1')\n\n${jsx}`
  }
  const props: string[] = ['  name="brand-color"', '  value={color}', '  onChange={setColor}']
  if (size !== 'md') props.push(`  size="${size}"`)
  if (label) props.push(`  label="${label}"`)
  if (disabled) props.push('  disabled')
  if (!showInput) props.push('  showInput={false}')
  if (error) props.push(`  error="${error}"`)
  if (swatches) props.push(`  swatches={['#ff0000', '#00cc44', '#0088ff', '#6644ff', '#ff4488']}`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  return `${importStr}\n\nconst [color, setColor] = useState('#6366f1')\n\n<ColorInput\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, label: string): string {
  if (tier === 'lite') {
    return `<!-- ColorInput — Lite tier (native) -->
<div class="ui-lite-color-input">
  ${label ? `<label>${label}</label>` : ''}
  <input type="color" value="#6366f1" />
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<!-- ColorInput — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/color-input.css">

<div class="ui-color-input" data-size="md">
  ${label ? `<label class="ui-color-input__label">${label}</label>` : ''}
  <div class="ui-color-input__row">
    <div class="ui-color-input__trigger" role="button" tabindex="0">
      <div class="ui-color-input__swatch" style="background-color: #6366f1"></div>
    </div>
    <input type="text" class="ui-color-input__hex-input" value="#6366f1" />
  </div>
</div>`
}

function generateVueCode(tier: Tier, size: Size, label: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-color-input">
    ${label ? `<label>${label}</label>` : ''}
    <input type="color" v-model="color" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const color = ref('#6366f1')
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <ColorInput
    name="brand-color"
    v-model="color"
    size="${size}"
    ${label ? `label="${label}"` : ''}
  />
</template>

<script setup>
import { ref } from 'vue'
import { ColorInput } from '@annondeveloper/ui-kit'
const color = ref('#6366f1')
</script>`
}

function generateAngularCode(tier: Tier, label: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (native) -->
<div class="ui-lite-color-input">
  ${label ? `<label>${label}</label>` : ''}
  <input type="color" [(ngModel)]="color" />
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-color-input" data-size="md">
  ${label ? `<label class="ui-color-input__label">${label}</label>` : ''}
  <div class="ui-color-input__row">
    <div class="ui-color-input__trigger" role="button" tabindex="0">
      <div class="ui-color-input__swatch" [style.background-color]="color"></div>
    </div>
    <input type="text" class="ui-color-input__hex-input" [(ngModel)]="color" />
  </div>
</div>

/* Import CSS */
@import '@annondeveloper/ui-kit/css/components/color-input.css';`
}

function generateSvelteCode(tier: Tier, size: Size, label: string): string {
  if (tier === 'lite') {
    return `<script>
  let color = '#6366f1';
</script>

<div class="ui-lite-color-input">
  ${label ? `<label>${label}</label>` : ''}
  <input type="color" bind:value={color} />
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { ColorInput } from '@annondeveloper/ui-kit';
  let color = '#6366f1';
</script>

<ColorInput
  name="brand-color"
  size="${size}"
  ${label ? `label="${label}"` : ''}
  bind:value={color}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [disabled, setDisabled] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [showSwatches, setShowSwatches] = useState(true)
  const [showError, setShowError] = useState(false)
  const [label, setLabel] = useState('Brand color')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [color, setColor] = useState('#6366f1')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const errorText = showError ? 'Invalid color format' : ''

  const reactCode = useMemo(() => generateReactCode(tier, size, label, disabled, showInput, showSwatches, errorText, motion), [tier, size, label, disabled, showInput, showSwatches, errorText, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, label), [tier, label])
  const vueCode = useMemo(() => generateVueCode(tier, size, label), [tier, size, label])
  const angularCode = useMemo(() => generateAngularCode(tier, label), [tier, label])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, label), [tier, size, label])

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
    <section className="color-input-page__section" id="playground">
      <h2 className="color-input-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="color-input-page__section-desc">
        Tweak every prop and see the result in real-time. Open the popover to test the HSL color area and hue slider.
      </p>

      <div className="color-input-page__playground">
        <div className="color-input-page__playground-preview">
          <div className="color-input-page__playground-result">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
              {tier === 'lite' ? (
                <LiteColorInput
                  label={label || undefined}
                  value={color}
                  onChange={e => setColor((e.target as HTMLInputElement).value)}
                />
              ) : (
                <ColorInput
                  name="playground-color"
                  size={size}
                  label={label || undefined}
                  disabled={disabled}
                  showInput={showInput}
                  error={errorText || undefined}
                  swatches={showSwatches ? DEFAULT_SWATCHES : undefined}
                  motion={motion}
                  value={color}
                  onChange={setColor}
                />
              )}
              <div className="color-input-page__color-swatch" style={{ backgroundColor: color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{color}</span>
            </div>
          </div>

          <div className="color-input-page__code-tabs">
            <div className="color-input-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="color-input-page__export-status">{copyStatus}</span>}
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

        <div className="color-input-page__playground-controls">
          {tier !== 'lite' && <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />}
          {tier !== 'lite' && (
            <OptionGroup label="Motion" options={['0', '1', '2', '3'] as const} value={String(motion) as any} onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)} />
          )}
          <div className="color-input-page__control-group">
            <span className="color-input-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />}
              {tier !== 'lite' && <Toggle label="Show hex input" checked={showInput} onChange={setShowInput} />}
              {tier !== 'lite' && <Toggle label="Show swatches" checked={showSwatches} onChange={setShowSwatches} />}
              <Toggle label="Show error" checked={showError} onChange={setShowError} />
            </div>
          </div>
          <div className="color-input-page__control-group">
            <span className="color-input-page__control-label">Label</span>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              className="color-input-page__option-btn" style={{ width: '100%', textAlign: 'start' }}
              placeholder="Label text..." />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Palette Builder Demo ────────────────────────────────────────────────────

function PaletteBuilderDemo() {
  const [colors, setColors] = useState([
    { label: 'Primary', hex: '#6366f1' },
    { label: 'Secondary', hex: '#0ea5e9' },
    { label: 'Accent', hex: '#f43f5e' },
    { label: 'Success', hex: '#10b981' },
    { label: 'Warning', hex: '#f59e0b' },
    { label: 'Neutral', hex: '#64748b' },
  ])

  const updateColor = (index: number, hex: string) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, hex } : c))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="color-input-page__palette">
        {colors.map((c, i) => (
          <div key={c.label} className="color-input-page__palette-item">
            <div className="color-input-page__palette-swatch" style={{ backgroundColor: c.hex }} />
            <span className="color-input-page__palette-label">{c.hex}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {colors.map((c, i) => (
          <ColorInput
            key={c.label}
            name={`palette-${c.label.toLowerCase()}`}
            label={c.label}
            value={c.hex}
            onChange={(hex) => updateColor(i, hex)}
            size="sm"
          />
        ))}
      </div>
    </div>
  )
}

// ─── Theme Generation Demo ──────────────────────────────────────────────────

function ThemeGenDemo() {
  const [brand, setBrand] = useState('#6366f1')

  // Simple derived colors (approximation without the full generator)
  const lighter = brand + '40'
  const darker = brand + 'cc'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div className="color-input-page__theme-row">
        <ColorInput
          name="theme-brand"
          value={brand}
          onChange={setBrand}
          label="Brand color"
          size="md"
          swatches={['#6366f1', '#f97316', '#f43f5e', '#0ea5e9', '#10b981', '#8b5cf6']}
        />
        <div className="color-input-page__theme-preview">
          <div className="color-input-page__theme-swatch-sm" style={{ backgroundColor: brand }} title="Brand" />
          <div className="color-input-page__theme-swatch-sm" style={{ backgroundColor: lighter }} title="Brand Light" />
          <div className="color-input-page__theme-swatch-sm" style={{ backgroundColor: darker }} title="Brand Dark" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button style={{ ['--brand' as string]: brand } as React.CSSProperties}>Primary Button</Button>
        <Button variant="secondary" style={{ ['--brand' as string]: brand } as React.CSSProperties}>Secondary</Button>
        <Button variant="ghost" style={{ ['--brand' as string]: brand } as React.CSSProperties}>Ghost</Button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
        Selected brand: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{brand}</strong>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ColorInputPage() {
  useStyles('color-input-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.color-input-page__section')
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
    <div className="color-input-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="color-input-page__hero">
        <h1 className="color-input-page__title">ColorInput</h1>
        <p className="color-input-page__desc">
          HSL color picker with saturation/lightness area, hue slider, preset swatches, and hex input.
          Ships in two weight tiers from a native color input to a full interactive picker.
        </p>
        <div className="color-input-page__import-row">
          <code className="color-input-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="color-input-page__section" id="sizes">
          <h2 className="color-input-page__section-title"><a href="#sizes">Size Scale</a></h2>
          <p className="color-input-page__section-desc">
            Three sizes for the trigger swatch and hex input. Sizes control dimensions and font size.
          </p>
          <div className="color-input-page__preview">
            <div className="color-input-page__labeled-row" style={{ alignItems: 'flex-end' }}>
              {SIZES.map(s => (
                <div key={s} className="color-input-page__labeled-item">
                  <ColorInput name={`size-${s}`} size={s} defaultValue="#6366f1" />
                  <span className="color-input-page__item-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="color-input-page__section" id="states">
        <h2 className="color-input-page__section-title"><a href="#states">States</a></h2>
        <p className="color-input-page__section-desc">
          Color input handles default, error, and disabled states with clear visual feedback.
        </p>
        <div className="color-input-page__states-grid">
          <div className="color-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteColorInput label="Default" defaultValue="#6366f1" />
            ) : (
              <ColorInput name="state-default" label="Default" defaultValue="#6366f1" />
            )}
            <span className="color-input-page__state-label">Default</span>
          </div>
          <div className="color-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteColorInput label="With value" defaultValue="#f43f5e" />
            ) : (
              <ColorInput name="state-value" label="With value" defaultValue="#f43f5e" />
            )}
            <span className="color-input-page__state-label">With value</span>
          </div>
          <div className="color-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteColorInput label="Lite only" />
            ) : (
              <ColorInput name="state-error" label="Error" error="Invalid hex" defaultValue="#xyz" />
            )}
            <span className="color-input-page__state-label">{tier === 'lite' ? 'Native' : 'Error'}</span>
          </div>
          <div className="color-input-page__state-cell">
            {tier === 'lite' ? (
              <LiteColorInput label="Disabled" disabled />
            ) : (
              <ColorInput name="state-disabled" label="Disabled" disabled defaultValue="#888888" />
            )}
            <span className="color-input-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 5. Swatches ────────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="color-input-page__section" id="swatches">
          <h2 className="color-input-page__section-title"><a href="#swatches">Preset Swatches</a></h2>
          <p className="color-input-page__section-desc">
            Pass an array of hex colors as <code>swatches</code> prop to show quick-pick presets in the popover.
          </p>
          <div className="color-input-page__preview">
            <ColorInput
              name="swatches-demo"
              label="With presets"
              defaultValue="#6366f1"
              swatches={DEFAULT_SWATCHES}
            />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<ColorInput\n  name="brand"\n  swatches={['#ff0000', '#00cc44', '#0088ff', '#6644ff', '#ff4488']}\n  onChange={(color) => console.log(color)}\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6. Without Hex Input ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="color-input-page__section" id="swatch-only">
          <h2 className="color-input-page__section-title"><a href="#swatch-only">Swatch Only</a></h2>
          <p className="color-input-page__section-desc">
            Set <code>showInput=false</code> to hide the hex text input and show only the color swatch trigger.
          </p>
          <div className="color-input-page__preview">
            <div className="color-input-page__labeled-row">
              <div className="color-input-page__labeled-item">
                <ColorInput name="swatch-sm" size="sm" showInput={false} defaultValue="#ff0000" />
                <span className="color-input-page__item-label">sm swatch</span>
              </div>
              <div className="color-input-page__labeled-item">
                <ColorInput name="swatch-md" size="md" showInput={false} defaultValue="#00cc44" />
                <span className="color-input-page__item-label">md swatch</span>
              </div>
              <div className="color-input-page__labeled-item">
                <ColorInput name="swatch-lg" size="lg" showInput={false} defaultValue="#0088ff" />
                <span className="color-input-page__item-label">lg swatch</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Color Palette Builder ──────────────────── */}
      {tier !== 'lite' && (
        <section className="color-input-page__section" id="palette">
          <h2 className="color-input-page__section-title"><a href="#palette">Color Palette Builder</a></h2>
          <p className="color-input-page__section-desc">
            Real-world example: use multiple ColorInputs to build a custom color palette.
            Each swatch is independently editable with the full HSL picker.
          </p>
          <div className="color-input-page__preview color-input-page__preview--col">
            <PaletteBuilderDemo />
          </div>
        </section>
      )}

      {/* ── 8. Theme Generation ────────────────────────── */}
      {tier !== 'lite' && (
        <section className="color-input-page__section" id="theme">
          <h2 className="color-input-page__section-title"><a href="#theme">Theme Generation</a></h2>
          <p className="color-input-page__section-desc">
            Pair ColorInput with the theme generator to create brand themes in real-time.
            Select a color and see derived brand tokens update instantly.
          </p>
          <div className="color-input-page__preview color-input-page__preview--col">
            <ThemeGenDemo />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`import { ColorInput } from '@annondeveloper/ui-kit'\nimport { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'\n\nconst [brand, setBrand] = useState('#6366f1')\nconst theme = generateTheme(brand)\napplyTheme(theme)\n\n<ColorInput\n  name="brand"\n  value={brand}\n  onChange={setBrand}\n  label="Brand color"\n/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 9. Weight Tiers ────────────────────────────── */}
      <section className="color-input-page__section" id="tiers">
        <h2 className="color-input-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="color-input-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses the native color input,
          Standard provides a full HSL picker with hex input and swatches.
        </p>

        <div className="color-input-page__tiers">
          <div
            className={`color-input-page__tier-card${tier === 'lite' ? ' color-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="color-input-page__tier-header">
              <span className="color-input-page__tier-name">Lite</span>
              <span className="color-input-page__tier-size">~0.1 KB</span>
            </div>
            <p className="color-input-page__tier-desc">
              Wraps native HTML color input. Zero JavaScript beyond forwardRef.
              No HSL picker, no hex input, no swatches.
            </p>
            <div className="color-input-page__tier-import">
              import {'{'} ColorInput {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="color-input-page__tier-preview">
              <LiteColorInput label="Lite" defaultValue="#6366f1" />
            </div>
            <div className="color-input-page__size-breakdown">
              <div className="color-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.1 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`color-input-page__tier-card${tier === 'standard' ? ' color-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="color-input-page__tier-header">
              <span className="color-input-page__tier-name">Standard</span>
              <span className="color-input-page__tier-size">~3.5 KB</span>
            </div>
            <p className="color-input-page__tier-desc">
              Full HSL color picker with saturation/lightness area, hue slider,
              hex input, preset swatches, click-outside close, and animated popover.
            </p>
            <div className="color-input-page__tier-import">
              import {'{'} ColorInput {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="color-input-page__tier-preview">
              <ColorInput name="tier-std" size="sm" defaultValue="#6366f1" />
            </div>
            <div className="color-input-page__size-breakdown">
              <div className="color-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`color-input-page__tier-card${tier === 'premium' ? ' color-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="color-input-page__tier-header">
              <span className="color-input-page__tier-name">Premium</span>
              <span className="color-input-page__tier-size">~3-5 KB</span>
            </div>
            <p className="color-input-page__tier-desc">
              Aurora glow on focus, spring-scale on swatch hover, shimmer sweep on selected color, and glass popover.
            </p>
            <div className="color-input-page__tier-import">
              import {'{'} ColorInput {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="color-input-page__tier-preview">
              <ColorInput name="tier-prem" size="sm" defaultValue="#6366f1" />
            </div>
            <div className="color-input-page__size-breakdown">
              <div className="color-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="color-input-page__section" id="props">
        <h2 className="color-input-page__section-title"><a href="#props">Props API</a></h2>
        <p className="color-input-page__section-desc">
          All props accepted by ColorInput. The Lite tier accepts standard HTML input attributes plus <code>label</code>.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={colorInputProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="color-input-page__section" id="accessibility">
        <h2 className="color-input-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="color-input-page__section-desc">
          Built with ARIA patterns for interactive color selection including keyboard and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="color-input-page__a11y-list">
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Keyboard:</strong> <code className="color-input-page__a11y-key">Enter</code>/<code className="color-input-page__a11y-key">Space</code> toggles popover, <code className="color-input-page__a11y-key">Escape</code> closes.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Dialog:</strong> Popover uses <code className="color-input-page__a11y-key">role="dialog"</code> with <code className="color-input-page__a11y-key">aria-label="Color picker"</code>.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Trigger:</strong> Swatch uses <code className="color-input-page__a11y-key">role="button"</code> with <code className="color-input-page__a11y-key">aria-expanded</code> and descriptive label.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Slider:</strong> Hue slider has <code className="color-input-page__a11y-key">aria-label="Hue"</code>. SL area has <code className="color-input-page__a11y-key">aria-valuetext</code> for current saturation/lightness.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Swatches:</strong> Preset swatches in a labeled <code className="color-input-page__a11y-key">role="group"</code> with individual <code className="color-input-page__a11y-key">aria-label</code>.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Error:</strong> Error messages linked via <code className="color-input-page__a11y-key">aria-describedby</code> with <code className="color-input-page__a11y-key">role="alert"</code>.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Touch targets:</strong> 44px minimum trigger on coarse pointer devices.</span>
            </li>
            <li className="color-input-page__a11y-item">
              <span className="color-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="color-input-page__a11y-key">forced-colors: active</code> with visible borders.</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
