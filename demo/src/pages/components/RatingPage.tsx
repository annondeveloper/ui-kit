'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Rating } from '@ui/components/rating'
import { Rating as LiteRating } from '@ui/lite/rating'
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
    @scope (.rating-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: rating-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .rating-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .rating-page__hero::before {
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
        animation: aurora-spin-rt 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-rt {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .rating-page__hero::before { animation: none; }
      }

      .rating-page__title {
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

      .rating-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .rating-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .rating-page__import-code {
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

      .rating-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .rating-page__section {
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
        animation: rt-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes rt-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .rating-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .rating-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .rating-page__section-title a { color: inherit; text-decoration: none; }
      .rating-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .rating-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .rating-page__preview {
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

      .rating-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .rating-page__preview--col { flex-direction: column; align-items: center; }

      /* ── Playground ─────────────────────────────────── */

      .rating-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .rating-page__playground { grid-template-columns: 1fr; }
        .rating-page__playground-controls { position: static !important; }
      }

      @container rating-page (max-width: 680px) {
        .rating-page__playground { grid-template-columns: 1fr; }
        .rating-page__playground-controls { position: static !important; }
      }

      .rating-page__playground-preview { display: flex; flex-direction: column; gap: 1.5rem; }

      .rating-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .rating-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .rating-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .rating-page__playground-controls {
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

      .rating-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .rating-page__control-label { font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
      .rating-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .rating-page__option-btn {
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
      .rating-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .rating-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .rating-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .rating-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .rating-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .rating-page__labeled-row { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end; }
      .rating-page__labeled-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .rating-page__item-label { font-size: 0.6875rem; color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; text-transform: lowercase; letter-spacing: 0.03em; }

      /* ── Weight Tier Cards ──────────────────────────── */

      .rating-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .rating-page__tier-card {
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

      .rating-page__tier-card:hover { border-color: var(--border-strong); transform: translateY(-2px); box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2); }
      .rating-page__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12); background: oklch(from var(--bg-surface) calc(l + 0.02) c h); }
      .rating-page__tier-card--active:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2); }
      .rating-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .rating-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .rating-page__tier-size { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; }
      .rating-page__tier-desc { font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start; }
      .rating-page__tier-import { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem; color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle); padding: 0.375rem 0.5rem; border-radius: var(--radius-sm); overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4; }
      .rating-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }

      /* ── Color picker ──────────────────────────────── */

      .rating-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .rating-page__color-preset { inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s; box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2); }
      .rating-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .rating-page__color-preset--active { border-color: oklch(100% 0 0); transform: scale(1.2); box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5); }

      .rating-page__code-tabs { margin-block-start: 1rem; }
      .rating-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .rating-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── A11y list ──────────────────────────────────── */

      .rating-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .rating-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .rating-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .rating-page__a11y-key { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem); background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-primary); }

      .rating-page__source-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--brand); text-decoration: none; font-weight: 500; }
      .rating-page__source-link:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .rating-page__hero { padding: 2rem 1.25rem; }
        .rating-page__title { font-size: 1.75rem; }
        .rating-page__preview { padding: 1.75rem; }
        .rating-page__playground { grid-template-columns: 1fr; }
        .rating-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .rating-page__tiers { grid-template-columns: 1fr; }
        .rating-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .rating-page__hero { padding: 1.5rem 1rem; }
        .rating-page__title { font-size: 1.5rem; }
        .rating-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .rating-page__title { font-size: 4rem; }
        .rating-page__preview { padding: 3.5rem; }
      }

      .rating-page__import-code, .rating-page code, pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const ratingPropsData: PropDef[] = [
  { name: 'value', type: 'number', description: 'Controlled rating value. When set, the component becomes controlled.' },
  { name: 'defaultValue', type: 'number', default: '0', description: 'Initial value for uncontrolled mode.' },
  { name: 'onChange', type: '(value: number) => void', description: 'Callback fired when the rating value changes.' },
  { name: 'max', type: 'number', default: '5', description: 'Maximum number of stars.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Star icon size from 0.75rem (xs) to 2.5rem (xl).' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevent interaction. Stars are not clickable and tab is disabled.' },
  { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allow half-star values (0.5 increments).' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon for filled stars. Defaults to a filled star SVG.' },
  { name: 'emptyIcon', type: 'ReactNode', description: 'Custom icon for empty stars. Defaults to an outlined star SVG.' },
  { name: 'color', type: 'string', description: 'Custom CSS color for the rating stars.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for star scale effect on click.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const LITE_SIZES: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Rating } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Rating } from '@annondeveloper/ui-kit'",
  premium: "import { Rating } from '@annondeveloper/ui-kit'",
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
    <Button size="sm" variant="secondary" className="rating-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="rating-page__control-group">
      <span className="rating-page__control-label">{label}</span>
      <div className="rating-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`rating-page__option-btn${opt === value ? ' rating-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="rating-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, max: number, readOnly: boolean, allowHalf: boolean, ratingValue: number): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const props: string[] = []
    if (ratingValue !== 0) props.push(`  defaultValue={${ratingValue}}`)
    if (max !== 5) props.push(`  max={${max}}`)
    if (size !== 'md') props.push(`  size="${size}"`)
    if (readOnly) props.push('  readOnly')
    return `${importStr}\n\n<Rating${props.length ? '\n' + props.join('\n') + '\n' : ' '}onChange={setValue} />`
  }
  const props: string[] = []
  if (ratingValue !== 0) props.push(`  defaultValue={${ratingValue}}`)
  if (max !== 5) props.push(`  max={${max}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (readOnly) props.push('  readOnly')
  if (allowHalf) props.push('  allowHalf')
  return `${importStr}\n\n<Rating${props.length ? '\n' + props.join('\n') + '\n' : ' '}onChange={setValue} />`
}

function generateHtmlCode(tier: Tier, size: Size, max: number, readOnly: boolean, ratingValue: number): string {
  const stars = Array.from({ length: max }, (_, i) => i < ratingValue ? '\u2605' : '\u2606').join(' ')
  return `<!-- Rating — @annondeveloper/ui-kit ${tier} tier -->
<div class="${tier === 'lite' ? 'ui-lite-rating' : 'ui-rating'}" data-size="${size}" role="slider"
  aria-valuenow="${ratingValue}" aria-valuemin="0" aria-valuemax="${max}"${readOnly ? ' aria-readonly="true"' : ''}>
  ${stars}
</div>`
}

function generateVueCode(tier: Tier, size: Size, max: number, readOnly: boolean, allowHalf: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-rating" data-size="${size}" role="radiogroup" aria-label="Rating">
    <button v-for="i in ${max}" :key="i" class="ui-lite-rating__star"
      :data-filled="i <= value ? '' : undefined"
      :disabled="${readOnly}"
      @click="value = i"
    >{{ i <= value ? '\u2605' : '\u2606' }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const value = ref(3)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const attrs: string[] = [`v-model="value"`, `:max="${max}"`, `size="${size}"`]
  if (readOnly) attrs.push('read-only')
  if (allowHalf) attrs.push('allow-half')
  return `<template>
  <Rating ${attrs.join(' ')} />
</template>

<script setup>
import { ref } from 'vue'
import { Rating } from '@annondeveloper/ui-kit'
const value = ref(3)
</script>`
}

function generateAngularCode(tier: Tier, size: Size, max: number, readOnly: boolean): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-rating" data-size="${size}" role="radiogroup" aria-label="Rating">
  <button *ngFor="let i of [1,2,3,4,5]" class="ui-lite-rating__star"
    [attr.data-filled]="i <= value ? '' : null"
    [disabled]="${readOnly}"
    (click)="value = i"
  >{{ i <= value ? '\u2605' : '\u2606' }}</button>
</div>

@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier -->
<div class="ui-rating" data-size="${size}" role="slider"
  [attr.aria-valuenow]="value" aria-valuemin="0" aria-valuemax="${max}"${readOnly ? ' aria-readonly="true"' : ''}>
  <span *ngFor="let i of stars" class="ui-rating__star"
    [attr.data-state]="i <= value ? 'full' : 'empty'"
    (click)="value = i">
  </span>
</div>

@import '@annondeveloper/ui-kit/css/components/rating.css';`
}

function generateSvelteCode(tier: Tier, size: Size, max: number, readOnly: boolean, allowHalf: boolean): string {
  if (tier === 'lite') {
    return `<script>
  let value = 3;
</script>

<div class="ui-lite-rating" data-size="${size}" role="radiogroup" aria-label="Rating">
  {#each Array(${max}) as _, i}
    <button class="ui-lite-rating__star"
      data-filled={i < value ? '' : undefined}
      disabled={${readOnly}}
      on:click={() => value = i + 1}
    >{i < value ? '\u2605' : '\u2606'}</button>
  {/each}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const attrs: string[] = [`bind:value`, `max={${max}}`, `size="${size}"`]
  if (readOnly) attrs.push('readOnly')
  if (allowHalf) attrs.push('allowHalf')
  return `<script>
  import { Rating } from '@annondeveloper/ui-kit';
  let value = 3;
</script>

<Rating ${attrs.join(' ')} />`
}

// ─── Interactive Playground ──────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('lg')
  const [max, setMax] = useState(5)
  const [readOnly, setReadOnly] = useState(false)
  const [allowHalf, setAllowHalf] = useState(false)
  const [ratingValue, setRatingValue] = useState(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, size, max, readOnly, allowHalf, ratingValue), [tier, size, max, readOnly, allowHalf, ratingValue])
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, max, readOnly, ratingValue), [tier, size, max, readOnly, ratingValue])
  const vueCode = useMemo(() => generateVueCode(tier, size, max, readOnly, allowHalf), [tier, size, max, readOnly, allowHalf])
  const angularCode = useMemo(() => generateAngularCode(tier, size, max, readOnly), [tier, size, max, readOnly])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, max, readOnly, allowHalf), [tier, size, max, readOnly, allowHalf])

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
    <section className="rating-page__section" id="playground">
      <h2 className="rating-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="rating-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="rating-page__playground">
        <div className="rating-page__playground-preview">
          <div className="rating-page__playground-result">
            {tier === 'lite' ? (
              <LiteRating
                value={ratingValue}
                onChange={setRatingValue}
                max={max}
                size={size as 'sm' | 'md' | 'lg'}
                readOnly={readOnly}
              />
            ) : (
              <Rating
                value={ratingValue}
                onChange={setRatingValue}
                max={max}
                size={size}
                readOnly={readOnly}
                allowHalf={allowHalf}
              />
            )}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
              Current value: <strong style={{ color: 'var(--text-primary)' }}>{ratingValue}</strong> / {max}
            </p>
          </div>

          <div className="rating-page__code-tabs">
            <div className="rating-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}
              >Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="rating-page__export-status">{copyStatus}</span>}
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

        <div className="rating-page__playground-controls">
          <OptionGroup label="Size" options={tier === 'lite' ? LITE_SIZES : SIZES} value={size as any} onChange={setSize as any} />

          <div className="rating-page__control-group">
            <span className="rating-page__control-label">Max Stars</span>
            <input type="number" value={max} min={1} max={10}
              onChange={e => setMax(Number(e.target.value))}
              className="rating-page__text-input"
            />
          </div>

          <div className="rating-page__control-group">
            <span className="rating-page__control-label">Value</span>
            <input type="number" value={ratingValue} min={0} max={max} step={allowHalf ? 0.5 : 1}
              onChange={e => setRatingValue(Number(e.target.value))}
              className="rating-page__text-input"
            />
          </div>

          <div className="rating-page__control-group">
            <span className="rating-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Read only" checked={readOnly} onChange={setReadOnly} />
              {tier !== 'lite' && <Toggle label="Allow half stars" checked={allowHalf} onChange={setAllowHalf} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RatingPage() {
  useStyles('rating-page', pageStyles)

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

  useEffect(() => {
    const sections = document.querySelectorAll('.rating-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="rating-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero ──────────────────────────────── */}
      <div className="rating-page__hero">
        <h1 className="rating-page__title">Rating</h1>
        <p className="rating-page__desc">
          Star rating input with hover preview, half-star support, keyboard navigation,
          and custom icons. Built with SVG stars and full ARIA slider pattern.
        </p>
        <div className="rating-page__import-row">
          <code className="rating-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="rating-page__section" id="sizes">
        <h2 className="rating-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="rating-page__section-desc">
          {tier === 'lite'
            ? 'Three sizes (sm, md, lg) for the lite tier.'
            : 'Five star sizes from compact (xs) to large (xl). Sizes control the star SVG dimensions.'}
        </p>
        <div className="rating-page__preview rating-page__preview--col" style={{ gap: '1.5rem' }}>
          {tier === 'lite' ? (
            LITE_SIZES.map(s => (
              <div key={s} className="rating-page__labeled-item">
                <LiteRating defaultValue={3} size={s} />
                <span className="rating-page__item-label">{s}</span>
              </div>
            ))
          ) : (
            SIZES.map(s => (
              <div key={s} className="rating-page__labeled-item">
                <Rating defaultValue={3} size={s} />
                <span className="rating-page__item-label">{s}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── 4. Features ─────────────────────────────────── */}
      <section className="rating-page__section" id="features">
        <h2 className="rating-page__section-title"><a href="#features">Features</a></h2>
        <p className="rating-page__section-desc">
          Read-only display, half-star values, custom max, hover preview, and keyboard control.
        </p>
        <div className="rating-page__preview rating-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <>
              <div className="rating-page__labeled-item">
                <LiteRating defaultValue={4} />
                <span className="rating-page__item-label">interactive</span>
              </div>
              <div className="rating-page__labeled-item">
                <LiteRating defaultValue={3} readOnly />
                <span className="rating-page__item-label">read only</span>
              </div>
              <div className="rating-page__labeled-item">
                <LiteRating defaultValue={7} max={10} />
                <span className="rating-page__item-label">10 stars</span>
              </div>
            </>
          ) : (
            <>
              <div className="rating-page__labeled-item">
                <Rating defaultValue={4} size="lg" />
                <span className="rating-page__item-label">interactive (click to rate)</span>
              </div>
              <div className="rating-page__labeled-item">
                <Rating value={3.5} readOnly allowHalf size="lg" />
                <span className="rating-page__item-label">read-only with half star</span>
              </div>
              <div className="rating-page__labeled-item">
                <Rating defaultValue={2.5} allowHalf size="lg" />
                <span className="rating-page__item-label">allow half (keyboard: 0.5 steps)</span>
              </div>
              <div className="rating-page__labeled-item">
                <Rating defaultValue={7} max={10} size="md" />
                <span className="rating-page__item-label">custom max (10 stars)</span>
              </div>
              <div className="rating-page__labeled-item">
                <Rating defaultValue={3} size="lg" readOnly />
                <span className="rating-page__item-label">read-only (no interaction)</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="rating-page__section" id="tiers">
        <h2 className="rating-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="rating-page__section-desc">
          Choose the right balance of features and bundle size. Lite uses unicode stars and button elements,
          while Standard adds SVG stars, half-star support, hover preview, and motion.
        </p>

        <div className="rating-page__tiers">
          <div
            className={`rating-page__tier-card${tier === 'lite' ? ' rating-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="rating-page__tier-header">
              <span className="rating-page__tier-name">Lite</span>
              <span className="rating-page__tier-size">~0.4 KB</span>
            </div>
            <p className="rating-page__tier-desc">
              Unicode star characters with button elements. 3 sizes, no half stars, no hover preview.
            </p>
            <div className="rating-page__tier-import">import {'{'} Rating {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="rating-page__tier-preview">
              <LiteRating defaultValue={4} />
            </div>
          </div>

          <div
            className={`rating-page__tier-card${tier === 'standard' ? ' rating-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="rating-page__tier-header">
              <span className="rating-page__tier-name">Standard</span>
              <span className="rating-page__tier-size">~2.2 KB</span>
            </div>
            <p className="rating-page__tier-desc">
              SVG star icons with half-star clip path, hover preview,
              5 sizes, keyboard navigation, and motion levels.
            </p>
            <div className="rating-page__tier-import">import {'{'} Rating {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="rating-page__tier-preview">
              <Rating defaultValue={3.5} allowHalf size="lg" />
            </div>
          </div>

          <div
            className={`rating-page__tier-card${tier === 'premium' ? ' rating-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="rating-page__tier-header">
              <span className="rating-page__tier-name">Premium</span>
              <span className="rating-page__tier-size">~2.2 KB</span>
            </div>
            <p className="rating-page__tier-desc">
              Same as Standard. Premium tier shares the full Rating implementation with all features included.
            </p>
            <div className="rating-page__tier-import">import {'{'} Rating {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="rating-page__tier-preview">
              <Rating defaultValue={4} size="xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="rating-page__section" id="brand-color">
        <h2 className="rating-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="rating-page__section-desc">
          Pick a brand color to see the focus ring and UI accents update in real-time.
          Star color uses the warning token by default for universal recognition.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
          <div className="rating-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button key={p.hex} type="button"
                className={`rating-page__color-preset${brandColor === p.hex ? ' rating-page__color-preset--active' : ''}`}
                style={{ background: p.hex }} onClick={() => setBrandColor(p.hex)} title={p.name} aria-label={`Set brand color to ${p.name}`} />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
          <div className="rating-page__preview" style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <LiteRating defaultValue={4} />
            ) : (
              <Rating defaultValue={4} size="xl" />
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="rating-page__section" id="props">
        <h2 className="rating-page__section-title"><a href="#props">Props API</a></h2>
        <p className="rating-page__section-desc">
          All props accepted by Rating. It also spreads any native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={ratingPropsData} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="rating-page__section" id="accessibility">
        <h2 className="rating-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="rating-page__section-desc">
          Rating uses the ARIA slider pattern for screen reader compatibility and full keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="rating-page__a11y-list">
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Role:</strong> Uses <code className="rating-page__a11y-key">role="slider"</code> with <code className="rating-page__a11y-key">aria-valuenow</code>, <code className="rating-page__a11y-key">aria-valuemin</code>, and <code className="rating-page__a11y-key">aria-valuemax</code>.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Keyboard:</strong> <code className="rating-page__a11y-key">Arrow Left/Down</code> decrease, <code className="rating-page__a11y-key">Arrow Right/Up</code> increase. <code className="rating-page__a11y-key">Home</code> sets to 0, <code className="rating-page__a11y-key">End</code> sets to max.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="rating-page__a11y-key">:focus-visible</code>.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Read-only:</strong> Sets <code className="rating-page__a11y-key">aria-readonly="true"</code> and <code className="rating-page__a11y-key">tabIndex={-1}</code> to prevent interaction.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Star icons:</strong> SVG stars use <code className="rating-page__a11y-key">aria-hidden="true"</code> — the slider role provides the accessible value.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="rating-page__a11y-key">forced-colors: active</code> with ButtonText and Highlight colors.</span>
            </li>
            <li className="rating-page__a11y-item">
              <span className="rating-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Motion:</strong> Scale-on-click animation only at motion level 2+, respecting user preferences.</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────── */}
      <section className="rating-page__section" id="source">
        <h2 className="rating-page__section-title"><a href="#source">Source</a></h2>
        <p className="rating-page__section-desc">View the component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a className="rating-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/rating.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/rating.tsx — Standard tier
          </a>
          <a className="rating-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/rating.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/rating.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
