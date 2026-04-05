'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TableOfContents } from '@ui/components/table-of-contents'
import { TableOfContents as LiteTableOfContents } from '@ui/lite/table-of-contents'
import { TableOfContents as PremiumTableOfContents } from '@ui/premium/table-of-contents'
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

const PAGE = 'toc-page'

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
        animation: aurora-spin-tc 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-tc {
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
        animation: section-reveal-tc 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-tc {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
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
        align-items: flex-start;
        justify-content: center;
        gap: 2rem;
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
      }

      .${PAGE}__variant-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        margin-block-end: 0.5rem;
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
        min-block-size: 200px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 2rem;
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

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TableOfContents } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TableOfContents } from '@annondeveloper/ui-kit'",
  premium: "import { TableOfContents } from '@annondeveloper/ui-kit/premium'",
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

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction', level: 1 },
  { id: 'getting-started', label: 'Getting Started', level: 1 },
  { id: 'installation', label: 'Installation', level: 2 },
  { id: 'configuration', label: 'Configuration', level: 2 },
  { id: 'components', label: 'Components', level: 1 },
  { id: 'button', label: 'Button', level: 2 },
  { id: 'card', label: 'Card', level: 2 },
  { id: 'dialog', label: 'Dialog', level: 2 },
  { id: 'theming', label: 'Theming', level: 1 },
  { id: 'api-reference', label: 'API Reference', level: 1 },
]

type TocVariant = 'default' | 'filled' | 'dots'
type TocSize = 'sm' | 'md' | 'lg'

const propsData: PropDef[] = [
  { name: 'items', type: 'TocItem[]', required: true, description: 'Array of items to render.' },
  { name: 'activeId', type: 'string', description: 'Active item id.' },
  { name: 'onItemClick', type: '(id: string) => void', description: 'On item click callback.' },
  { name: 'scrollSpy', type: 'boolean', default: 'false', description: 'Scroll spy toggle.' },
  { name: 'scrollOffset', type: 'number', default: '0', description: 'Scroll offset in pixels.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Component size.' },
  { name: 'variant', type: "'default' | 'filled' | 'dots'", default: "'default'", description: 'Visual style variant.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

const tocItemSubTypeProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier.' },
  { name: 'label', type: 'string', required: true, description: 'Label text.' },
  { name: 'level', type: 'number', required: true, description: 'Heading level (e.g. 1, 2, 3).' },
  { name: 'children', type: 'TocItem[]', description: 'Nested child items.' },
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
  tier: Tier, variant: TocVariant, size: TocSize, scrollSpy: boolean, motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  items={items}', '  activeId={activeId}', '  onItemClick={handleClick}']
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (scrollSpy) props.push('  scrollSpy')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  return `${importStr}\n\nconst items = [\n  { id: 'intro', label: 'Introduction', level: 1 },\n  { id: 'setup', label: 'Setup', level: 1 },\n  { id: 'install', label: 'Installation', level: 2 },\n]\n\n<TableOfContents\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, variant: TocVariant, size: TocSize): string {
  const cls = tier === 'lite' ? 'ui-lite-toc' : 'ui-toc'
  const attrs = [`class="${cls}"`, `data-variant="${variant}"`, `data-size="${size}"`]
  return `<!-- TableOfContents — @annondeveloper/ui-kit ${tier} tier -->\n<nav ${attrs.join(' ')} aria-label="Table of contents">\n  <ul class="${cls}__list">\n    <li class="${cls}__item"><a href="#intro" class="${cls}__link" data-active="true">Introduction</a></li>\n    <li class="${cls}__item"><a href="#setup" class="${cls}__link">Setup</a></li>\n    <li class="${cls}__item ${cls}__item--nested"><a href="#install" class="${cls}__link">Installation</a></li>\n  </ul>\n</nav>\n\n<style>\n@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/table-of-contents.css'}';\n</style>`
}

function generateVueCode(tier: Tier, variant: TocVariant, size: TocSize, scrollSpy: boolean): string {
  if (tier === 'lite') {
    return `<template>\n  <nav class="ui-lite-toc" data-variant="${variant}" data-size="${size}" aria-label="Table of contents">\n    <ul class="ui-lite-toc__list">\n      <li v-for="item in items" :key="item.id" class="ui-lite-toc__item">\n        <a :href="'#' + item.id" class="ui-lite-toc__link">{{ item.label }}</a>\n      </li>\n    </ul>\n  </nav>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  :items="items"', '  v-model:activeId="activeId"']
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (scrollSpy) attrs.push('  scroll-spy')
  return `<template>\n  <TableOfContents\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { TableOfContents } from '${importPath}'\n\nconst items = [\n  { id: 'intro', label: 'Introduction', level: 1 },\n  { id: 'setup', label: 'Setup', level: 1 },\n]\nconst activeId = ref('intro')\n</script>`
}

function generateAngularCode(tier: Tier, variant: TocVariant, size: TocSize): string {
  const cls = tier === 'lite' ? 'ui-lite-toc' : 'ui-toc'
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier CSS -->\n<nav class="${cls}" data-variant="${variant}" data-size="${size}" aria-label="Table of contents">\n  <ul class="${cls}__list">\n    <li *ngFor="let item of items" class="${cls}__item">\n      <a [href]="'#' + item.id" class="${cls}__link" (click)="setActive(item.id)">{{ item.label }}</a>\n    </li>\n  </ul>\n</nav>\n\n/* In styles.css */\n@import '${importPath}/css/components/table-of-contents.css';`
}

function generateSvelteCode(tier: Tier, variant: TocVariant, size: TocSize, scrollSpy: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<nav class="ui-lite-toc" data-variant="${variant}" data-size="${size}" aria-label="Table of contents">\n  <ul class="ui-lite-toc__list">\n    {#each items as item}\n      <li class="ui-lite-toc__item">\n        <a href={'#' + item.id} class="ui-lite-toc__link">{item.label}</a>\n      </li>\n    {/each}\n  </ul>\n</nav>\n\n<script>\n  let items = [\n    { id: 'intro', label: 'Introduction', level: 1 },\n    { id: 'setup', label: 'Setup', level: 1 },\n  ];\n</script>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { TableOfContents } from '${importPath}';\n  let activeId = 'intro';\n  const items = [\n    { id: 'intro', label: 'Introduction', level: 1 },\n    { id: 'setup', label: 'Setup', level: 1 },\n  ];\n</script>\n\n<TableOfContents\n  {items}\n  bind:activeId\n  variant="${variant}"\n  size="${size}"\n  ${scrollSpy ? 'scrollSpy' : ''}\n/>`
}

// ─── Playground ──────────────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<TocVariant>('default')
  const [size, setSize] = useState<TocSize>('md')
  const [scrollSpy, setScrollSpy] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeId, setActiveId] = useState('components')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const TocComponent = tier === 'lite' ? LiteTableOfContents : tier === 'premium' ? PremiumTableOfContents : TableOfContents

  const reactCode = useMemo(() => generateReactCode(tier, variant, size, scrollSpy, motion), [tier, variant, size, scrollSpy, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, variant, size), [tier, variant, size])
  const vueCode = useMemo(() => generateVueCode(tier, variant, size, scrollSpy), [tier, variant, size, scrollSpy])
  const angularCode = useMemo(() => generateAngularCode(tier, variant, size), [tier, variant, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, variant, size, scrollSpy), [tier, variant, size, scrollSpy])

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
    items: TOC_ITEMS,
    activeId,
    onItemClick: setActiveId,
    variant,
    size,
    scrollSpy,
  }
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}><a href="#playground">Playground</a></h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak every prop in real-time. Click items in the preview to see active state changes.
      </p>

      <div className={`${PAGE}__playground`}>
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <TocComponent {...previewProps} />
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
          <OptionGroup label="Variant" options={['default', 'filled', 'dots'] as const} value={variant} onChange={setVariant} />
          <OptionGroup label="Size" options={['sm', 'md', 'lg'] as const} value={size} onChange={setSize} />

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
              <Toggle label="Scroll spy" checked={scrollSpy} onChange={setScrollSpy} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TableOfContentsPage() {
  useStyles('toc-page', pageStyles)
  const { tier, setTier } = useTier()
  const { mode } = useTheme()
  const [brandColor, setBrandColor] = useState('#6366f1')

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

  const TocComponent = tier === 'lite' ? LiteTableOfContents : tier === 'premium' ? PremiumTableOfContents : TableOfContents

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
      {/* ── Hero ──────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>TableOfContents</h1>
        <p className={`${PAGE}__desc`}>
          Navigable table of contents with nested heading levels, scroll spy highlighting,
          and multiple visual variants. Perfect for documentation pages.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── Playground ───────────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── Variants ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="variants">
        <h2 className={`${PAGE}__section-title`}><a href="#variants">Variants</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Choose between default (line indicator), filled (background highlight), or dots (minimal) styles.
        </p>
        <div className={`${PAGE}__preview`} style={{ gap: '3rem' }}>
          {(['default', 'filled', 'dots'] as const).map(v => (
            <div key={v} style={{ flex: 1, minInlineSize: '180px' }}>
              <p className={`${PAGE}__variant-label`}>{v}</p>
              <TocComponent items={TOC_ITEMS.slice(0, 6)} activeId="installation" variant={v} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Sizes ─────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Three sizes to fit different contexts. Small for sidebars, large for standalone navigation.
        </p>
        <div className={`${PAGE}__preview`} style={{ gap: '3rem' }}>
          {(['sm', 'md', 'lg'] as const).map(s => (
            <div key={s} style={{ flex: 1, minInlineSize: '160px' }}>
              <p className={`${PAGE}__variant-label`}>{s}</p>
              <TocComponent items={TOC_ITEMS.slice(0, 5)} activeId="getting-started" size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Scroll Spy ────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="scroll-spy">
        <h2 className={`${PAGE}__section-title`}><a href="#scroll-spy">Scroll Spy</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Enable scrollSpy to automatically highlight the currently visible section as the user scrolls.
          This page's own sections demonstrate the scroll tracking behavior.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <TocComponent
            items={[
              { id: 'variants', label: 'Variants', level: 1 },
              { id: 'sizes', label: 'Sizes', level: 1 },
              { id: 'scroll-spy', label: 'Scroll Spy', level: 1 },
              { id: 'tiers', label: 'Weight Tiers', level: 1 },
              { id: 'props', label: 'Props API', level: 1 },
            ]}
            scrollSpy
            variant="filled"
          />
        </div>
      </section>

      {/* ── Weight Tiers ─────────────────────────────── */}
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
            <div className={`${PAGE}__tier-import`}>import {'{'} TableOfContents {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className={`${PAGE}__tier-preview`}>
              <LiteTableOfContents items={TOC_ITEMS.slice(0, 3)} activeId="introduction" />
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
            <p className={`${PAGE}__tier-desc`}>Full-featured with scroll spy, motion levels, and accessibility.</p>
            <div className={`${PAGE}__tier-import`}>import {'{'} TableOfContents {'}'} from '@annondeveloper/ui-kit'</div>
            <div className={`${PAGE}__tier-preview`}>
              <TableOfContents items={TOC_ITEMS.slice(0, 3)} activeId="introduction" />
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
            <p className={`${PAGE}__tier-desc`}>Everything in Standard plus spring indicator, aurora glow on active, and hover slide.</p>
            <div className={`${PAGE}__tier-import`}>import {'{'} TableOfContents {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className={`${PAGE}__tier-preview`}>
              <PremiumTableOfContents items={TOC_ITEMS.slice(0, 3)} activeId="introduction" />
            </div>
            <div className={`${PAGE}__size-breakdown`}>
              <div className={`${PAGE}__size-row`}>
                <span>~<strong style={{ color: 'var(--brand)' }}>3 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ──────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}><a href="#brand-color">Brand Color</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to see the component update in real-time. The theme generates derived
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

      {/* ── Props ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>
          All props accepted by the TableOfContents component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
        <Card variant="default" padding="md" style={{ marginBlockStart: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>TocItem (sub-type)</h3>
          <PropsTable props={tocItemSubTypeProps} />
        </Card>
      </section>

      {/* ── Accessibility ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="accessibility">
        <h2 className={`${PAGE}__section-title`}><a href="#accessibility">Accessibility</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Built on the native <code>&lt;nav&gt;</code> element with semantic list structure.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${PAGE}__a11y-list`}>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Uses <code className={`${PAGE}__a11y-key`}>&lt;nav&gt;</code> with <code className={`${PAGE}__a11y-key`}>aria-label="Table of contents"</code>.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> All links are natively focusable. Navigate with <code className={`${PAGE}__a11y-key`}>Tab</code> key.
              </span>
            </li>
            <li className={`${PAGE}__a11y-item`}>
              <span className={`${PAGE}__a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Active state:</strong> Current item uses <code className={`${PAGE}__a11y-key`}>aria-current="true"</code> for screen readers.
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
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className={`${PAGE}__a11y-key`}>:focus-visible</code>.
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

      {/* ── Source ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/table-of-contents.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/table-of-contents.tsx (Standard)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/table-of-contents.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/table-of-contents.tsx (Lite)
          </a>
          <a className={`${PAGE}__source-link`} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/table-of-contents.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/table-of-contents.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
