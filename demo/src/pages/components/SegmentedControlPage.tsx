'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SegmentedControl } from '@ui/components/segmented-control'
import { SegmentedControl as LiteSegmentedControl } from '@ui/lite/segmented-control'
import { SegmentedControl as PremiumSegmentedControl } from '@ui/premium/segmented-control'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'segmented-control-page'

const pageStyles = css`
  @layer demo {
    @scope (.${PAGE}) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ${PAGE};
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .${PAGE}__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .${PAGE}__hero::before {
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
        animation: aurora-spin-sc 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-sc {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .${PAGE}__hero::before { animation: none; }
      }

      .${PAGE}__title {
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

      .${PAGE}__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .${PAGE}__import-code {
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

      .${PAGE}__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .${PAGE}__section {
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
        animation: section-reveal-sc 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-sc {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .${PAGE}__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .${PAGE}__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .${PAGE}__section-title a { color: inherit; text-decoration: none; }
      .${PAGE}__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .${PAGE}__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .${PAGE}__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .${PAGE}__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__preview--col {
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Playground ─────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      .${PAGE}__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .${PAGE}__playground-result {
        min-block-size: 160px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .${PAGE}__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
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

      .${PAGE}__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .${PAGE}__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .${PAGE}__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .${PAGE}__option-btn {
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
      .${PAGE}__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .${PAGE}__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .${PAGE}__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .${PAGE}__code-tabs {
        margin-block-start: 1rem;
      }

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .${PAGE}__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .${PAGE}__tier-card {
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

      .${PAGE}__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .${PAGE}__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .${PAGE}__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .${PAGE}__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .${PAGE}__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .${PAGE}__tier-import {
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

      .${PAGE}__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .${PAGE}__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .${PAGE}__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .${PAGE}__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .${PAGE}__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .${PAGE}__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .${PAGE}__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .${PAGE}__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .${PAGE}__hero { padding: 2rem 1.25rem; }
        .${PAGE}__title { font-size: 1.75rem; }
        .${PAGE}__playground { grid-template-columns: 1fr; }
        .${PAGE}__playground-controls { position: static !important; }
        .${PAGE}__tiers { grid-template-columns: 1fr; }
        .${PAGE}__section { padding: 1.25rem; }
      }

      @container ${PAGE} (max-width: 680px) {
        .${PAGE}__playground { grid-template-columns: 1fr; }
        .${PAGE}__playground-controls { position: static !important; }
      }

      @media (max-width: 400px) {
        .${PAGE}__hero { padding: 1.5rem 1rem; }
        .${PAGE}__title { font-size: 1.5rem; }
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'data', type: 'SegmentedControlOption[] | string[]', required: true, description: 'Data for segment options.' },
  { name: 'value', type: 'string', description: 'Controlled value.' },
  { name: 'defaultValue', type: 'string', description: 'Initial uncontrolled value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback on value change.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Component size.' },
  { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Fills container width.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Horizontal or vertical layout.' },
  { name: 'color', type: 'string', description: 'Color variant or custom color.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes read-only.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

const OPTION_SUB_TYPE_PROPS: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'Unique segment value.' },
  { name: 'label', type: 'ReactNode', required: true, description: 'Label text or element.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element.' },
  { name: 'disabled', type: 'boolean', description: 'Disables this segment.' },
]

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
type Size = typeof SIZES[number]
type Orientation = 'horizontal' | 'vertical'

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { SegmentedControl } from '@annondeveloper/ui-kit/lite'",
  standard: "import { SegmentedControl } from '@annondeveloper/ui-kit'",
  premium: "import { SegmentedControl } from '@annondeveloper/ui-kit/premium'",
}

const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
  'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
  'borderGlow', 'aurora1', 'aurora2',
]

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className={`${PAGE}__copy-btn`}
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
    <div className={`${PAGE}__control-group`}>
      <span className={`${PAGE}__control-label`}>{label}</span>
      <div className={`${PAGE}__control-options`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${PAGE}__option-btn${opt === value ? ` ${PAGE}__option-btn--active` : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`${PAGE}__toggle-label`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier, data: string[], size: Size, orientation: Orientation,
  fullWidth: boolean, disabled: boolean, motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  data={${JSON.stringify(data)}}`]
  if (size !== 'md') props.push(`  size="${size}"`)
  if (orientation !== 'horizontal') props.push(`  orientation="${orientation}"`)
  if (fullWidth) props.push('  fullWidth')
  if (disabled) props.push('  disabled')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  props.push(`  value={selected}`)
  props.push(`  onChange={setSelected}`)
  return `${importStr}\n\nconst [selected, setSelected] = useState('${data[0]}')\n\n<SegmentedControl\n${props.join('\n')}\n/>`
}

function generateHtmlCode(
  tier: Tier, data: string[], size: Size, orientation: Orientation,
): string {
  const cls = tier === 'lite' ? 'ui-lite-segmented' : 'ui-segmented'
  const attrs = [`class="${cls}"`, `data-size="${size}"`]
  if (orientation === 'vertical') attrs.push('data-orientation="vertical"')
  const buttons = data.map((d, i) => `  <button class="${cls}__option"${i === 0 ? ' aria-pressed="true"' : ''}>${d}</button>`).join('\n')
  return `<!-- SegmentedControl — @annondeveloper/ui-kit ${tier} tier -->\n<div ${attrs.join(' ')} role="radiogroup">\n${buttons}\n</div>\n\n<style>\n@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/segmented-control.css'}';\n</style>`
}

function generateVueCode(tier: Tier, data: string[], size: Size, disabled: boolean): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-lite-segmented" data-size="${size}" role="radiogroup">\n${data.map((d, i) => `    <button class="ui-lite-segmented__option"${i === 0 ? ' aria-pressed="true"' : ''}>${d}</button>`).join('\n')}\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  :data='${JSON.stringify(data)}'`, `  v-model="selected"`]
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')
  return `<template>\n  <SegmentedControl\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { SegmentedControl } from '${importPath}'\n\nconst selected = ref('${data[0]}')\n</script>`
}

function generateAngularCode(tier: Tier, data: string[], size: Size, disabled: boolean): string {
  const cls = tier === 'lite' ? 'ui-lite-segmented' : 'ui-segmented'
  const attrs = [`class="${cls}"`, `data-size="${size}"`, 'role="radiogroup"']
  if (disabled) attrs.push('[attr.aria-disabled]="true"')
  const buttons = data.map((d, i) => `  <button class="${cls}__option"${i === 0 ? ' aria-pressed="true"' : ''} (click)="select('${d}')">${d}</button>`).join('\n')
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier CSS -->\n<div ${attrs.join(' ')}>\n${buttons}\n</div>\n\n/* In styles.css */\n@import '${importPath}/css/components/segmented-control.css';`
}

function generateSvelteCode(tier: Tier, data: string[], size: Size, disabled: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div class="ui-lite-segmented" data-size="${size}" role="radiogroup">\n${data.map((d, i) => `  <button class="ui-lite-segmented__option"${i === 0 ? ' aria-pressed="true"' : ''} on:click={() => selected = '${d}'}>${d}</button>`).join('\n')}\n</div>\n\n<script>\n  let selected = '${data[0]}';\n</script>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { SegmentedControl } from '${importPath}';\n  let selected = '${data[0]}';\n</script>\n\n<SegmentedControl\n  data={${JSON.stringify(data)}}\n  bind:value={selected}\n  size="${size}"\n  ${disabled ? 'disabled' : ''}\n/>`
}

// ─── Playground ──────────────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [fullWidth, setFullWidth] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [selected, setSelected] = useState('React')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const data = ['React', 'Vue', 'Svelte']

  const ControlComponent = tier === 'lite' ? LiteSegmentedControl : tier === 'premium' ? PremiumSegmentedControl : SegmentedControl

  const reactCode = useMemo(() => generateReactCode(tier, data, size, orientation, fullWidth, disabled, motion), [tier, size, orientation, fullWidth, disabled, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, data, size, orientation), [tier, size, orientation])
  const vueCode = useMemo(() => generateVueCode(tier, data, size, disabled), [tier, size, disabled])
  const angularCode = useMemo(() => generateAngularCode(tier, data, size, disabled), [tier, size, disabled])
  const svelteCode = useMemo(() => generateSvelteCode(tier, data, size, disabled), [tier, size, disabled])

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

  const previewProps: Record<string, unknown> = {
    data,
    size,
    orientation,
    fullWidth,
    disabled,
    value: selected,
    onChange: setSelected,
  }
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}><a href="#playground">Playground</a></h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak every prop in real-time. Generated code updates as you change settings.
      </p>

      <div className={`${PAGE}__playground`}>
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <ControlComponent {...previewProps} />
          </div>

          <div className={`${PAGE}__code-tabs`}>
            <div className={`${PAGE}__export-row`}>
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
              {copyStatus && <span className={`${PAGE}__export-status`}>{copyStatus}</span>}
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

        <div className={`${PAGE}__playground-controls`}>
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Orientation" options={['horizontal', 'vertical'] as const} value={orientation} onChange={setOrientation} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className={`${PAGE}__control-group`}>
            <span className={`${PAGE}__control-label`}>Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Full width" checked={fullWidth} onChange={setFullWidth} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SegmentedControlPage() {
  useStyles('segmented-control-page', pageStyles)
  const { tier, setTier } = useTier()
  const { mode } = useTheme()
  const [brandColor, setBrandColor] = useState('#6366f1')

  const [view, setView] = useState('list')
  const [orientation, setOrientation] = useState('horizontal')

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  const ControlComponent = tier === 'lite' ? LiteSegmentedControl : tier === 'premium' ? PremiumSegmentedControl : SegmentedControl

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll(`.${PAGE}__section`)
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
    <div className={PAGE} style={themeStyle}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Segmented Control</h1>
        <p className={`${PAGE}__desc`}>
          Inline toggle for switching between a small number of options. Features a smooth sliding
          indicator, horizontal and vertical layouts, and keyboard navigation.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── Playground ───────────────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── Orientation ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="orientation">
        <h2 className={`${PAGE}__section-title`}><a href="#orientation">Orientation</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Segmented controls can be laid out horizontally (default) or vertically.
          The sliding indicator animates along the appropriate axis.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent data={['List', 'Grid', 'Board']} value={view} onChange={setView} />
            <span className={`${PAGE}__item-label`}>horizontal (default)</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent
              data={['Overview', 'Analytics', 'Reports']}
              orientation="vertical"
              value={orientation}
              onChange={setOrientation}
            />
            <span className={`${PAGE}__item-label`}>vertical</span>
          </div>
        </div>
      </section>

      {/* ── Sizes & Full Width ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes & Full Width</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five sizes from xs to xl. Enable fullWidth to stretch the control to fill its container.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          {SIZES.map(s => (
            <div key={s} className={`${PAGE}__labeled-item`}>
              <ControlComponent data={['React', 'Vue', 'Svelte']} defaultValue="React" size={s} />
              <span className={`${PAGE}__item-label`}>{s}</span>
            </div>
          ))}
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent data={['Day', 'Week', 'Month', 'Year']} defaultValue="Week" fullWidth />
            <span className={`${PAGE}__item-label`}>fullWidth</span>
          </div>
        </div>
      </section>

      {/* ── States ────────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="states">
        <h2 className={`${PAGE}__section-title`}><a href="#states">States</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Disabled and read-only states prevent interaction. Individual segments can also be disabled.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent data={['Active', 'Paused', 'Stopped']} defaultValue="Active" disabled />
            <span className={`${PAGE}__item-label`}>disabled</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent data={['Active', 'Paused', 'Stopped']} defaultValue="Active" readOnly />
            <span className={`${PAGE}__item-label`}>readOnly</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <ControlComponent
              data={[
                { value: 'on', label: 'On' },
                { value: 'standby', label: 'Standby', disabled: true },
                { value: 'off', label: 'Off' },
              ]}
              defaultValue="on"
            />
            <span className={`${PAGE}__item-label`}>individual segment disabled</span>
          </div>
        </div>
      </section>

      {/* ── Weight Tiers ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}><a href="#tiers">Weight Tiers</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Choose the right balance of features and bundle size. All three tiers share the same API surface (Lite omits motion props).
        </p>
        <div className={`${PAGE}__tiers`}>
          <div
            className={`${PAGE}__tier-card${tier === 'lite' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Lite</span>
              <span className={`${PAGE}__tier-size`}>~0.3 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>CSS-only, zero motion. Minimal wrapper around Standard with motion=0.</p>
            <div className={`${PAGE}__tier-import`}>import {'{'} SegmentedControl {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteSegmentedControl data={['A', 'B', 'C']} defaultValue="A" />
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>~<strong style={{ color: 'var(--brand)' }}>0.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`${PAGE}__tier-card${tier === 'standard' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Standard</span>
              <span className={`${PAGE}__tier-size`}>~2 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>Full-featured with sliding indicator, motion levels, and accessibility.</p>
            <div className={`${PAGE}__tier-import`}>import {'{'} SegmentedControl {'}'} from '@annondeveloper/ui-kit'</div>
            <div className={`${PAGE}__tier-preview`}>
              <SegmentedControl data={['A', 'B', 'C']} defaultValue="A" />
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>~<strong style={{ color: 'var(--brand)' }}>2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`${PAGE}__tier-card${tier === 'premium' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Premium</span>
              <span className={`${PAGE}__tier-size`}>~3 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>Everything in Standard plus spring animations, glow indicator, and hover scale.</p>
            <div className={`${PAGE}__tier-import`}>import {'{'} SegmentedControl {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumSegmentedControl data={['A', 'B', 'C']} defaultValue="A" />
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>~<strong style={{ color: 'var(--brand)' }}>3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}><a href="#brand-color">Brand Color</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to see all controls update in real-time. The theme generates derived
          colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={COLOR_PRESETS.map(p => p.hex)}
          />
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── Props API ────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for SegmentedControl.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
        <Card variant="default" padding="md" style={{ marginBlockStart: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>SegmentedControlOption (sub-type)</h3>
          <PropsTable props={OPTION_SUB_TYPE_PROPS} />
        </Card>
      </section>

      {/* ── Accessibility ────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}><a href="#accessibility">Accessibility</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Built on <code>role="radiogroup"</code> with comprehensive keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Navigate segments with <code className={`${PAGE}__a11y-key`}>Arrow Left</code> / <code className={`${PAGE}__a11y-key`}>Arrow Right</code> keys (or Up/Down in vertical orientation).
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Home/End:</strong> Jump to first or last segment with <code className={`${PAGE}__a11y-key`}>Home</code> / <code className={`${PAGE}__a11y-key`}>End</code> keys.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Uses <code className={`${PAGE}__a11y-key`}>role="radiogroup"</code> with <code className={`${PAGE}__a11y-key`}>aria-checked</code> on each option.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className={`${PAGE}__a11y-key`}>:focus-visible</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variants meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Source ────────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/segmented-control.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/segmented-control.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/segmented-control.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/segmented-control.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/segmented-control.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/segmented-control.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
