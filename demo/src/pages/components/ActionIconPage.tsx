'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ActionIcon } from '@ui/components/action-icon'
import { ActionIcon as LiteActionIcon } from '@ui/lite/action-icon'
import { ActionIcon as PremiumActionIcon } from '@ui/premium/action-icon'
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

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE = 'action-icon-page'
const VARIANTS = ['filled', 'light', 'outline', 'subtle', 'transparent'] as const
const COLORS = ['default', 'primary', 'success', 'warning', 'danger'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const RADII = ['sm', 'md', 'lg', 'full'] as const

type Variant = (typeof VARIANTS)[number]
type Color = (typeof COLORS)[number]
type Size = (typeof SIZES)[number]
type Radius = (typeof RADII)[number]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ActionIcon } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ActionIcon } from '@annondeveloper/ui-kit'",
  premium: "import { ActionIcon } from '@annondeveloper/ui-kit/premium'",
}

const COLOR_PRESETS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Slate', hex: '#64748b' },
]

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'variant', type: "'filled' | 'light' | 'outline' | 'subtle' | 'transparent'", default: "'subtle'", description: 'Visual style variant.' },
  { name: 'color', type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color variant.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Component size.' },
  { name: 'radius', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Border radius override.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows loading spinner.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'aria-label', type: 'string', required: true, description: 'Required accessible label (no visible text).' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Icon element to render.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
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

      /* ── Sections ───────────────────────────────────── */

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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
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
        align-items: flex-start;
        gap: 1.5rem;
      }

      .${PAGE}__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        min-inline-size: 5rem;
      }

      /* ── Playground ─────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
        .${PAGE}__playground-controls {
          position: static !important;
        }
      }

      @container ${PAGE} (max-width: 680px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
        .${PAGE}__playground-controls {
          position: static !important;
        }
      }

      .${PAGE}__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .${PAGE}__playground-result {
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

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-ok, oklch(72% 0.19 155));
        font-weight: 500;
      }

      /* ── Tier cards ──────────────────────────────────── */

      .${PAGE}__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 0.75rem;
      }

      .${PAGE}__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .${PAGE}__tier-card:hover {
        border-color: var(--brand);
      }
      .${PAGE}__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .${PAGE}__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-block-end: 0.375rem;
      }
      .${PAGE}__tier-name { font-weight: 700; color: var(--text-primary); }
      .${PAGE}__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--brand);
        font-weight: 600;
      }
      .${PAGE}__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0 0 0.625rem;
      }
      .${PAGE}__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        margin-block-end: 0.75rem;
      }
      .${PAGE}__tier-preview {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-block-end: 0.5rem;
      }
      .${PAGE}__size-breakdown {
        border-block-start: 1px solid var(--border-subtle);
        padding-block-start: 0.5rem;
      }
      .${PAGE}__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── Color presets ──────────────────────────────── */

      .${PAGE}__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .${PAGE}__color-preset {
        inline-size: 28px;
        block-size: 28px;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.12s;
        padding: 0;
      }
      .${PAGE}__color-preset:hover {
        transform: scale(1.15);
      }
      .${PAGE}__color-preset--active {
        border-color: oklch(100% 0 0);
        box-shadow: 0 0 0 2px var(--brand);
      }

      /* ── Accessibility list ─────────────────────────── */

      .${PAGE}__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .${PAGE}__a11y-item {
        display: flex;
        gap: 0.625rem;
        align-items: flex-start;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .${PAGE}__a11y-icon {
        color: var(--status-ok, oklch(72% 0.19 155));
        flex-shrink: 0;
        margin-block-start: 0.1rem;
      }
      .${PAGE}__a11y-key {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 0.8125em;
        background: oklch(0% 0 0 / 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ────────────────────────────────── */

      .${PAGE}__source-link {
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        text-decoration: none;
      }
      .${PAGE}__source-link:hover { text-decoration: underline; }
    }
  }
`

// ─── Helper Components ───────────────────────────────────────────────────────

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
    <label className={`${PAGE}__toggle-label`}>
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

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  radius: Radius,
  loading: boolean,
  disabled: boolean,
  motion: number,
  iconName: string,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = "\nimport { Icon } from '@annondeveloper/ui-kit'"

  const props: string[] = [`  aria-label="Action"`]
  if (variant !== 'subtle') props.push(`  variant="${variant}"`)
  if (color !== 'default') props.push(`  color="${color}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (radius !== 'md') props.push(`  radius="${radius}"`)
  if (loading && tier !== 'lite') props.push('  loading')
  if (disabled) props.push('  disabled')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}${iconImport}\n\n<ActionIcon\n${props.join('\n')}\n>\n  <Icon name="${iconName}" size="sm" />\n</ActionIcon>`
}

function generateHtmlCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  radius: Radius,
  disabled: boolean,
  iconName: string,
): string {
  const className = 'ui-action-icon'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssPath = tier === 'lite' ? 'lite/styles.css' : 'css/components/action-icon.css'

  const attrs = [
    `class="${className}"`,
    `data-variant="${variant}"`,
    `data-color="${color}"`,
    `data-size="${size}"`,
    `data-radius="${radius}"`,
    `aria-label="Action"`,
    `type="button"`,
  ]
  if (disabled) attrs.push('disabled')

  return `<!-- ActionIcon — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${cssPath}">

<button ${attrs.join('\n       ')}>
  <svg><!-- ${iconName} icon SVG --></svg>
</button>`
}

function generateVueCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  radius: Radius,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-action-icon"`, `data-variant="${variant}"`, `data-color="${color}"`, `data-size="${size}"`, `data-radius="${radius}"`, `aria-label="Action"`, `type="button"`]
    if (disabled) attrs.push(':disabled="true"')
    return `<template>\n  <button ${attrs.join(' ')}>\n    <svg><!-- icon --></svg>\n  </button>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  aria-label="Action"`]
  if (variant !== 'subtle') attrs.push(`  variant="${variant}"`)
  if (color !== 'default') attrs.push(`  color="${color}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (radius !== 'md') attrs.push(`  radius="${radius}"`)
  if (disabled) attrs.push('  disabled')

  return `<template>\n  <ActionIcon\n  ${attrs.join('\n  ')}\n  >\n    <Icon name="settings" size="sm" />\n  </ActionIcon>\n</template>\n\n<script setup>\nimport { ActionIcon } from '${importPath}'\nimport { Icon } from '@annondeveloper/ui-kit'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  radius: Radius,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-action-icon"`, `data-variant="${variant}"`, `data-color="${color}"`, `data-size="${size}"`, `data-radius="${radius}"`, `aria-label="Action"`, `type="button"`]
    if (disabled) attrs.push('[disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->\n<button ${attrs.join(' ')}>\n  <svg><!-- icon --></svg>\n</button>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<button\n  class="ui-action-icon"\n  data-variant="${variant}"\n  data-color="${color}"\n  data-size="${size}"\n  data-radius="${radius}"\n  aria-label="Action"\n  type="button"\n  ${disabled ? '[disabled]="true"' : ''}\n>\n  <svg><!-- icon --></svg>\n</button>\n\n/* Import component CSS */\n@import '${importPath}/css/components/action-icon.css';`
}

function generateSvelteCode(
  tier: Tier,
  variant: Variant,
  color: Color,
  size: Size,
  radius: Radius,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<button\n  class="ui-action-icon"\n  data-variant="${variant}"\n  data-color="${color}"\n  data-size="${size}"\n  data-radius="${radius}"\n  aria-label="Action"\n  type="button"\n  ${disabled ? 'disabled' : ''}\n>\n  <svg><!-- icon --></svg>\n</button>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { ActionIcon } from '${importPath}';\n  import { Icon } from '@annondeveloper/ui-kit';\n</script>\n\n<ActionIcon\n  variant="${variant}"\n  color="${color}"\n  size="${size}"\n  radius="${radius}"\n  aria-label="Action"\n  ${disabled ? 'disabled' : ''}\n>\n  <Icon name="settings" size="sm" />\n</ActionIcon>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('subtle')
  const [color, setColor] = useState<Color>('default')
  const [size, setSize] = useState<Size>('md')
  const [radius, setRadius] = useState<Radius>('md')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [iconName] = useState('settings')
  const [copyStatus, setCopyStatus] = useState('')

  const ActionIconComponent = tier === 'lite' ? LiteActionIcon : tier === 'premium' ? PremiumActionIcon : ActionIcon

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, color, size, radius, loading, disabled, motion, iconName),
    [tier, variant, color, size, radius, loading, disabled, motion, iconName],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(tier, variant, color, size, radius, disabled, iconName),
    [tier, variant, color, size, radius, disabled, iconName],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, color, size, radius, disabled),
    [tier, variant, color, size, radius, disabled],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, color, size, radius, disabled),
    [tier, variant, color, size, radius, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, color, size, radius, disabled),
    [tier, variant, color, size, radius, disabled],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

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
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  const previewProps: Record<string, unknown> = {
    variant,
    color,
    size,
    radius,
    'aria-label': 'Action',
  }
  if (tier !== 'lite') {
    previewProps.loading = loading
    previewProps.disabled = disabled
    previewProps.motion = motion
  } else {
    previewProps.disabled = disabled
  }

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${PAGE}__playground`}>
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <ActionIconComponent {...previewProps}>
              <Icon name={iconName} size="sm" />
            </ActionIconComponent>
          </div>

          <div>
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
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className={`${PAGE}__playground-controls`}>
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup label="Color" options={COLORS} value={color} onChange={setColor} />
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Radius" options={RADII} value={radius} onChange={setRadius} />

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
              {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ActionIconPage() {
  useStyles('action-icon-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const [copied, setCopied] = useState(false)
  const importStr = IMPORT_STRINGS[tier]

  const copyImport = () => {
    navigator.clipboard.writeText(importStr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const ActionIconComponent = tier === 'lite' ? LiteActionIcon : tier === 'premium' ? PremiumActionIcon : ActionIcon

  const sizeInfo = useMemo(() => {
    if (tier === 'lite') {
      return { component: 0.3, shared: 3.7, total: 4.0, note: 'CSS-only wrapper with motion locked to 0. Shared theme CSS loaded once.' }
    }
    if (tier === 'premium') {
      return { component: 0.8, shared: 3.3, total: 4.1, note: 'Premium wraps Standard — adds aurora glow, spring hover, and press effects.' }
    }
    return { component: 1.2, shared: 0.9, total: 2.1, note: 'Style engine (0.5KB) and motion hook (0.3KB) are shared across components.' }
  }, [tier])

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

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

  // Scroll reveal JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll(`.${PAGE}__section`)
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className={PAGE} style={themeStyle}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>ActionIcon</h1>
        <p className={`${PAGE}__desc`}>
          Icon-only button for toolbars, card actions, and compact controls.
          Requires an aria-label for accessibility since there is no visible text.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{importStr}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Variants & Colors ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="variants">
        <h2 className={`${PAGE}__section-title`}><a href="#variants">Variants & Colors</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five visual variants across five color schemes. Filled and light provide strong visual weight,
          while subtle and transparent blend into surrounding content.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          {VARIANTS.map(v => (
            <div key={v} className={`${PAGE}__row`}>
              <span className={`${PAGE}__label`}>{v}</span>
              {COLORS.map(c => (
                <ActionIconComponent key={`${v}-${c}`} variant={v} color={c} aria-label={`${v} ${c}`}>
                  <Icon name="settings" size="sm" />
                </ActionIconComponent>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Sizes & Radius ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes & Radius</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five sizes from xs to xl paired with four border radius options. Use radius "full" for circular buttons.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__row`}>
            <span className={`${PAGE}__label`}>sizes</span>
            {SIZES.map(s => (
              <ActionIconComponent key={s} size={s} aria-label={`Size ${s}`}>
                <Icon name="heart" size="sm" />
              </ActionIconComponent>
            ))}
          </div>
          <div className={`${PAGE}__row`}>
            <span className={`${PAGE}__label`}>radius</span>
            {RADII.map(r => (
              <ActionIconComponent key={r} radius={r} variant="outline" aria-label={`Radius ${r}`}>
                <Icon name="star" size="sm" />
              </ActionIconComponent>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Loading & Disabled ────────────────────────── */}
      <section className={`${PAGE}__section`} id="states">
        <h2 className={`${PAGE}__section-title`}><a href="#states">Loading & Disabled</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Loading shows a spinner overlay, disabled reduces opacity and prevents interaction.
        </p>
        <div className={`${PAGE}__preview`}>
          <ActionIconComponent loading aria-label="Loading"><Icon name="refresh" size="sm" /></ActionIconComponent>
          <ActionIconComponent loading variant="outline" color="primary" aria-label="Loading primary"><Icon name="refresh" size="sm" /></ActionIconComponent>
          <ActionIconComponent loading variant="light" color="success" aria-label="Loading success"><Icon name="check" size="sm" /></ActionIconComponent>
          <ActionIconComponent disabled aria-label="Disabled"><Icon name="trash" size="sm" /></ActionIconComponent>
          <ActionIconComponent disabled variant="outline" aria-label="Disabled outline"><Icon name="edit" size="sm" /></ActionIconComponent>
        </div>
      </section>

      {/* ── 4. Live Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 5. Weight Tiers ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Choose the right balance of features and bundle size. All three tiers share the same visual
          output (Lite omits loading and motion props).
        </p>

        <div className={`${PAGE}__tiers`}>
          {/* Lite */}
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
            <p className={`${PAGE}__tier-desc`}>
              CSS-only wrapper. Zero JavaScript beyond forwardRef. No loading, no motion.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} ActionIcon {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteActionIcon variant="filled" color="primary" aria-label="Lite demo">
                <Icon name="star" size="sm" />
              </LiteActionIcon>
              <LiteActionIcon variant="outline" aria-label="Lite outline">
                <Icon name="settings" size="sm" />
              </LiteActionIcon>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`${PAGE}__tier-card${tier === 'standard' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Standard</span>
              <span className={`${PAGE}__tier-size`}>~1.2 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Full-featured with loading state, motion levels, spring bounce, and accessibility.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} ActionIcon {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <ActionIcon variant="filled" color="primary" aria-label="Standard demo">
                <Icon name="star" size="sm" />
              </ActionIcon>
              <ActionIcon variant="outline" aria-label="Standard outline">
                <Icon name="settings" size="sm" />
              </ActionIcon>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`${PAGE}__tier-card${tier === 'premium' ? ` ${PAGE}__tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${PAGE}__tier-header`}>
              <span className={`${PAGE}__tier-name`}>Premium</span>
              <span className={`${PAGE}__tier-size`}>~0.8 KB</span>
            </div>
            <p className={`${PAGE}__tier-desc`}>
              Everything in Standard plus aurora glow on focus, spring hover scale, and press depression.
            </p>
            <div className={`${PAGE}__tier-import`}>
              import {'{'} ActionIcon {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumActionIcon variant="filled" color="primary" aria-label="Premium demo">
                <Icon name="star" size="sm" />
              </PremiumActionIcon>
              <PremiumActionIcon variant="outline" aria-label="Premium outline">
                <Icon name="settings" size="sm" />
              </PremiumActionIcon>
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to see all action icons update in real-time. The theme generates
          derived colors (light, dark, subtle, glow) automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className={`${PAGE}__color-presets`}>
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`${PAGE}__color-preset${brandColor === p.hex ? ` ${PAGE}__color-preset--active` : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <div className={`${PAGE}__preview`}>
              {VARIANTS.map(v => (
                <ActionIconComponent key={v} variant={v} color="primary" aria-label={`${v} branded`}>
                  <Icon name="star" size="sm" />
                </ActionIconComponent>
              ))}
            </div>
          )}
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 7. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>
          All props accepted by ActionIcon. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── 8. Accessibility ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${PAGE}__section-desc`}>
          Built on the native {'<button>'} element with required aria-label for icon-only buttons.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>aria-label required:</strong> The <code className={`${PAGE}__a11y-key`}>aria-label</code> prop is mandatory since there is no visible text content.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className={`${PAGE}__a11y-key`}>Enter</code> and <code className={`${PAGE}__a11y-key`}>Space</code> keys.
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
                <strong>Loading:</strong> Announced to screen readers via <code className={`${PAGE}__a11y-key`}>aria-busy="true"</code>.
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
                <strong>Type:</strong> Defaults to <code className={`${PAGE}__a11y-key`}>type="button"</code> to prevent accidental form submission.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses both <code className={`${PAGE}__a11y-key`}>disabled</code> attribute and <code className={`${PAGE}__a11y-key`}>aria-disabled</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className={`${PAGE}__a11y-key`}>@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className={`${PAGE}__a11y-key`}>forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/action-icon.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/action-icon.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/action-icon.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/action-icon.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/action-icon.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/action-icon.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
