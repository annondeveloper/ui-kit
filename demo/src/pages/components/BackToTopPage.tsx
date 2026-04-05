'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { BackToTop } from '@ui/components/back-to-top'
import { BackToTop as LiteBackToTop } from '@ui/lite/back-to-top'
import { BackToTop as PremiumBackToTop } from '@ui/premium/back-to-top'
import { Card } from '@ui/components/card'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.back-to-top-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: back-to-top-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .back-to-top-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .back-to-top-page__hero::before {
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
        animation: aurora-spin-btt 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-btt {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .back-to-top-page__hero::before { animation: none; }
      }

      .back-to-top-page__title {
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

      .back-to-top-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .back-to-top-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .back-to-top-page__import-code {
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

      .back-to-top-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .back-to-top-page__section {
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
        animation: section-reveal-btt 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-btt {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .back-to-top-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .back-to-top-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .back-to-top-page__section-title a { color: inherit; text-decoration: none; }
      .back-to-top-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .back-to-top-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .back-to-top-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .back-to-top-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .back-to-top-page__scroll-box {
        inline-size: 100%;
        max-block-size: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        position: relative;
        background: var(--bg-surface);
      }

      .back-to-top-page__scroll-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .back-to-top-page__scroll-content p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .back-to-top-page__hint {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        text-align: center;
        font-style: italic;
      }

      /* ── Playground ─────────────────────────────────── */

      .back-to-top-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .back-to-top-page__playground {
          grid-template-columns: 1fr;
        }
        .back-to-top-page__playground-controls {
          position: static !important;
        }
      }

      @container back-to-top-page (max-width: 680px) {
        .back-to-top-page__playground {
          grid-template-columns: 1fr;
        }
        .back-to-top-page__playground-controls {
          position: static !important;
        }
      }

      .back-to-top-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .back-to-top-page__playground-result {
        overflow: visible;
        min-block-size: 300px;
        position: relative;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-subtle);
      }

      .back-to-top-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .back-to-top-page__playground-scroll {
        inline-size: 100%;
        block-size: 300px;
        overflow-y: auto;
        padding: 1.5rem;
        position: relative;
      }

      .back-to-top-page__playground-controls {
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

      .back-to-top-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .back-to-top-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .back-to-top-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .back-to-top-page__option-btn {
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
      .back-to-top-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .back-to-top-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .back-to-top-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .back-to-top-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .back-to-top-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .back-to-top-page__tier-card {
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

      .back-to-top-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .back-to-top-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .back-to-top-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .back-to-top-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .back-to-top-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .back-to-top-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .back-to-top-page__tier-import {
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

      .back-to-top-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .back-to-top-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .back-to-top-page__code-tabs {
        margin-block-start: 1rem;
      }

      .back-to-top-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .back-to-top-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .back-to-top-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .back-to-top-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .back-to-top-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .back-to-top-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .back-to-top-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .back-to-top-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .back-to-top-page__hero {
          padding: 2rem 1.25rem;
        }
        .back-to-top-page__title {
          font-size: 1.75rem;
        }
        .back-to-top-page__preview {
          padding: 1.75rem;
        }
        .back-to-top-page__playground {
          grid-template-columns: 1fr;
        }
        .back-to-top-page__tiers {
          grid-template-columns: 1fr;
        }
        .back-to-top-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .back-to-top-page__hero {
          padding: 1.5rem 1rem;
        }
        .back-to-top-page__title {
          font-size: 1.5rem;
        }
        .back-to-top-page__preview {
          padding: 1rem;
        }
      }

      /* ── Scrollbar styling ──────────────────────────── */

      .back-to-top-page__import-code,
      .back-to-top-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const propsData: PropDef[] = [
  { name: 'visibleFrom', type: 'number', default: '400', description: 'Scroll distance in px before the button appears.' },
  { name: 'smooth', type: 'boolean', default: 'true', description: 'Use smooth scrolling when clicking the button.' },
  { name: 'target', type: 'React.RefObject<HTMLElement>', description: 'Scroll container to attach to (defaults to window).' },
  { name: 'showProgress', type: 'boolean', default: 'false', description: 'Show a circular progress ring indicating scroll position.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the floating button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BTTSize = 'sm' | 'md' | 'lg'

const SIZES: BTTSize[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { BackToTop } from '@annondeveloper/ui-kit/lite'",
  standard: "import { BackToTop } from '@annondeveloper/ui-kit'",
  premium: "import { BackToTop } from '@annondeveloper/ui-kit/premium'",
}

const FILLER_PARAGRAPHS = Array.from({ length: 15 }, (_, i) =>
  `Section ${i + 1}: This is filler content to demonstrate the scroll behavior. The BackToTop button appears after scrolling past the configured threshold distance. It provides a convenient way to return to the top of the page or scroll container. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
)

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
    <div className="back-to-top-page__control-group">
      <span className="back-to-top-page__control-label">{label}</span>
      <div className="back-to-top-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`back-to-top-page__option-btn${opt === value ? ' back-to-top-page__option-btn--active' : ''}`}
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
    <label className="back-to-top-page__toggle-label">
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

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: BTTSize,
  showProgress: boolean,
  smooth: boolean,
  visibleFrom: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showProgress) props.push('  showProgress')
  if (!smooth) props.push('  smooth={false}')
  if (visibleFrom !== 400) props.push(`  visibleFrom={${visibleFrom}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<BackToTop />'
    : `<BackToTop\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  tier: Tier,
  size: BTTSize,
  showProgress: boolean,
): string {
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  return `<!-- BackToTop — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/back-to-top.css">

<button
  class="ui-back-to-top"
  data-size="${size}"
  data-visible="false"
  aria-label="Back to top"
>
  ${showProgress ? `<svg class="ui-back-to-top__progress" viewBox="0 0 44 44" width="44" height="44">
    <circle class="ui-back-to-top__progress-track" cx="22" cy="22" r="21" stroke-width="2" />
    <circle class="ui-back-to-top__progress-fill" cx="22" cy="22" r="21" stroke-width="2" />
  </svg>` : ''}
  <span class="ui-back-to-top__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</button>

<script>
  // Show/hide on scroll
  const btn = document.querySelector('.ui-back-to-top');
  window.addEventListener('scroll', () => {
    btn.dataset.visible = window.scrollY > 400 ? 'true' : 'false';
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>`
}

function generateVueCode(
  tier: Tier,
  size: BTTSize,
  showProgress: boolean,
  smooth: boolean,
): string {
  if (tier === 'lite') {
    return `<template>
  <button
    class="ui-back-to-top"
    data-size="${size}"
    :data-visible="visible"
    aria-label="Back to top"
    @click="scrollToTop"
  >
    <span class="ui-back-to-top__icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 400
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: '${smooth ? 'smooth' : 'instant'}' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style>
@import '@annondeveloper/ui-kit/css/components/back-to-top.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showProgress) attrs.push('  show-progress')
  if (!smooth) attrs.push('  :smooth="false"')

  const template = attrs.length === 0
    ? '  <BackToTop />'
    : `  <BackToTop\n  ${attrs.join('\n  ')}\n  />`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { BackToTop } from '${importPath}'\n</script>`
}

function generateAngularCode(
  tier: Tier,
  size: BTTSize,
  showProgress: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<button
  class="ui-back-to-top"
  data-size="${size}"
  [attr.data-visible]="visible"
  aria-label="Back to top"
  (click)="scrollToTop()"
>
  <span class="ui-back-to-top__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</button>

/* In styles.css */
@import '@annondeveloper/ui-kit/css/components/back-to-top.css';`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<button
  class="ui-back-to-top"
  data-size="${size}"
  [attr.data-visible]="visible"
  ${showProgress ? '[attr.data-show-progress]="true"' : ''}
  aria-label="Back to top"
  (click)="scrollToTop()"
>
  <span class="ui-back-to-top__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</button>

/* Import component CSS */
@import '${importPath}/css/components/back-to-top.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: BTTSize,
  showProgress: boolean,
  smooth: boolean,
): string {
  if (tier === 'lite') {
    return `<script>
  import { onMount, onDestroy } from 'svelte';

  let visible = false;

  function onScroll() {
    visible = window.scrollY > 400;
  }
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: '${smooth ? 'smooth' : 'instant'}' });
  }

  onMount(() => window.addEventListener('scroll', onScroll));
  onDestroy(() => window.removeEventListener('scroll', onScroll));
</script>

<button
  class="ui-back-to-top"
  data-size="${size}"
  data-visible={visible}
  aria-label="Back to top"
  on:click={scrollToTop}
>
  <span class="ui-back-to-top__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</button>

<style>
  @import '@annondeveloper/ui-kit/css/components/back-to-top.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showProgress) attrs.push('  showProgress')
  if (!smooth) attrs.push('  smooth={false}')

  const inner = attrs.length === 0
    ? '<BackToTop />'
    : `<BackToTop\n${attrs.join('\n')}\n/>`

  return `<script>\n  import { BackToTop } from '${importPath}';\n</script>\n\n${inner}`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<BTTSize>('md')
  const [showProgress, setShowProgress] = useState(true)
  const [smooth, setSmooth] = useState(true)
  const [visibleFrom, setVisibleFrom] = useState(100)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const scrollRef = useRef<HTMLDivElement>(null)

  const BackToTopComponent = tier === 'lite' ? LiteBackToTop : tier === 'premium' ? PremiumBackToTop : BackToTop

  const reactCode = useMemo(
    () => generateReactCode(tier, size, showProgress, smooth, visibleFrom, motion),
    [tier, size, showProgress, smooth, visibleFrom, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, showProgress),
    [tier, size, showProgress],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, showProgress, smooth),
    [tier, size, showProgress, smooth],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, showProgress),
    [tier, size, showProgress],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, showProgress, smooth),
    [tier, size, showProgress, smooth],
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

  return (
    <section className="back-to-top-page__section" id="playground">
      <h2 className="back-to-top-page__section-title">
        <a href="#playground">Playground</a>
      </h2>
      <p className="back-to-top-page__section-desc">
        Tweak every prop and see the result in real-time. Scroll the box below to see the
        BackToTop button appear. The generated code updates as you change settings.
      </p>

      <div className="back-to-top-page__playground">
        {/* Preview area */}
        <div className="back-to-top-page__playground-preview">
          <div className="back-to-top-page__playground-result">
            <div
              className="back-to-top-page__playground-scroll"
              ref={scrollRef}
            >
              <div className="back-to-top-page__scroll-content">
                {FILLER_PARAGRAPHS.map((text, i) => (
                  <p key={i} style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{text}</p>
                ))}
              </div>
            </div>
            <BackToTopComponent
              size={size}
              showProgress={showProgress}
              smooth={smooth}
              visibleFrom={visibleFrom}
              target={scrollRef as React.RefObject<HTMLElement>}
              motion={tier !== 'lite' ? motion : undefined}
              style={{ position: 'absolute', insetBlockEnd: '12px', insetInlineEnd: '12px' }}
            />
          </div>

          {/* Tabbed code output */}
          <div className="back-to-top-page__code-tabs">
            <div className="back-to-top-page__export-row">
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
              {copyStatus && <span className="back-to-top-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
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

        {/* Controls panel */}
        <div className="back-to-top-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="back-to-top-page__control-group">
            <span className="back-to-top-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show progress ring" checked={showProgress} onChange={setShowProgress} />
              <Toggle label="Smooth scroll" checked={smooth} onChange={setSmooth} />
            </div>
          </div>

          <div className="back-to-top-page__control-group">
            <span className="back-to-top-page__control-label">Visible From (px)</span>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={visibleFrom}
              onChange={e => setVisibleFrom(Number(e.target.value))}
              style={{ inlineSize: '100%', accentColor: 'var(--brand)' }}
            />
            <span style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-tertiary)' }}>{visibleFrom}px</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BackToTopPage() {
  useStyles('back-to-top-page', pageStyles)
  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')

  const scrollDemoRef = useRef<HTMLDivElement>(null)

  const effectiveTier = tier
  const BackToTopComponent = effectiveTier === 'lite' ? LiteBackToTop : effectiveTier === 'premium' ? PremiumBackToTop : BackToTop

  useEffect(() => {
    const sections = document.querySelectorAll('.back-to-top-page__section')
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
    <div className="back-to-top-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="back-to-top-page__hero">
        <h1 className="back-to-top-page__title">BackToTop</h1>
        <p className="back-to-top-page__desc">
          Floating scroll-to-top button that appears after scrolling past a threshold.
          Optional progress ring shows current scroll position. Available in three weight tiers.
        </p>
        <div className="back-to-top-page__import-row">
          <code className="back-to-top-page__import-code">{IMPORT_STRINGS[effectiveTier]}</code>
        </div>
      </div>

      {/* ── Page-Level Demo ────────────────────────────── */}
      <section className="back-to-top-page__section" id="page-level">
        <h2 className="back-to-top-page__section-title"><a href="#page-level">Page-Level Button</a></h2>
        <p className="back-to-top-page__section-desc">
          Scroll this page down to see the BackToTop button appear in the bottom-right corner.
          The progress ring fills as you scroll further.
        </p>
        <div className="back-to-top-page__preview">
          <p className="back-to-top-page__hint">
            Scroll the page to see the button appear. It is rendered at the page level with a progress ring.
          </p>
        </div>
        <BackToTopComponent showProgress />
        <CopyBlock code={`<BackToTop showProgress />`} language="typescript" />
      </section>

      {/* ── Container-Scoped ──────────────────────── */}
      <section className="back-to-top-page__section" id="container">
        <h2 className="back-to-top-page__section-title"><a href="#container">Container-Scoped</a></h2>
        <p className="back-to-top-page__section-desc">
          Attach the button to a specific scroll container instead of the window.
          Scroll the box below to trigger it.
        </p>
        <div className="back-to-top-page__preview" style={{ position: 'relative' }}>
          <div className="back-to-top-page__scroll-box" ref={scrollDemoRef}>
            <div className="back-to-top-page__scroll-content">
              {FILLER_PARAGRAPHS.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
          <BackToTopComponent
            target={scrollDemoRef as React.RefObject<HTMLElement>}
            showProgress
            visibleFrom={100}
            size="sm"
            style={{ position: 'absolute', insetBlockEnd: '16px', insetInlineEnd: '16px' }}
          />
        </div>
        <CopyBlock
          code={`const scrollRef = useRef<HTMLDivElement>(null)\n\n<div ref={scrollRef} style={{ maxHeight: 300, overflowY: 'auto' }}>\n  {/* scrollable content */}\n</div>\n<BackToTop target={scrollRef} showProgress visibleFrom={100} size="sm" />`}
          language="typescript"
        />
      </section>

      {/* ── Sizes ──────────────────────────────────────── */}
      <section className="back-to-top-page__section" id="sizes">
        <h2 className="back-to-top-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="back-to-top-page__section-desc">
          Three sizes available: <code>sm</code> (36px), <code>md</code> (44px), and <code>lg</code> (56px).
          The md size meets the 44px minimum touch target requirement.
        </p>
        <div className="back-to-top-page__preview" style={{ flexDirection: 'row', gap: '2rem' }}>
          {SIZES.map(s => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <BackToTopComponent
                size={s}
                showProgress
                style={{ position: 'relative', insetBlockEnd: 'auto', insetInlineEnd: 'auto' }}
                data-visible="true"
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: "'SF Mono', monospace" }}>{s}</span>
            </div>
          ))}
        </div>
        <CopyBlock code={`<BackToTop size="sm" />\n<BackToTop size="md" />\n<BackToTop size="lg" />`} language="typescript" />
      </section>

      {/* ── Playground ─────────────────────────────────── */}
      <PlaygroundSection tier={effectiveTier} brandColor={brandColor} />

      {/* ── Weight Tiers ──────────────────────────────── */}
      <section className="back-to-top-page__section" id="tiers">
        <h2 className="back-to-top-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="back-to-top-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits motion props).
        </p>

        <div className="back-to-top-page__tiers">
          {/* Lite */}
          <div
            className={`back-to-top-page__tier-card${effectiveTier === 'lite' ? ' back-to-top-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="back-to-top-page__tier-header">
              <span className="back-to-top-page__tier-name">Lite</span>
              <span className="back-to-top-page__tier-size">~0.2 KB gzip</span>
            </div>
            <p className="back-to-top-page__tier-desc">
              Minimal wrapper with motion forced to 0. Zero JavaScript beyond the forwardRef delegate.
            </p>
            <div className="back-to-top-page__tier-import">
              import {'{'} BackToTop {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="back-to-top-page__size-breakdown">
              <div className="back-to-top-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.3 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`back-to-top-page__tier-card${effectiveTier === 'standard' ? ' back-to-top-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="back-to-top-page__tier-header">
              <span className="back-to-top-page__tier-name">Standard</span>
              <span className="back-to-top-page__tier-size">~1.5 KB gzip</span>
            </div>
            <p className="back-to-top-page__tier-desc">
              Full-featured with scroll tracking, progress ring, motion levels,
              and container-scoped scrolling.
            </p>
            <div className="back-to-top-page__tier-import">
              import {'{'} BackToTop {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="back-to-top-page__size-breakdown">
              <div className="back-to-top-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`back-to-top-page__tier-card${effectiveTier === 'premium' ? ' back-to-top-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="back-to-top-page__tier-header">
              <span className="back-to-top-page__tier-name">Premium</span>
              <span className="back-to-top-page__tier-size">~2.1 KB gzip</span>
            </div>
            <p className="back-to-top-page__tier-desc">
              Everything in Standard plus aurora glow pulse, spring hover animation,
              and enhanced active press effect.
            </p>
            <div className="back-to-top-page__tier-import">
              import {'{'} BackToTop {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="back-to-top-page__size-breakdown">
              <div className="back-to-top-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>2.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="back-to-top-page__section" id="brand-color">
        <h2 className="back-to-top-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="back-to-top-page__section-desc">
          Pick a brand color to see the progress ring and focus ring update in real-time.
          The theme generates derived colors automatically from your choice.
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

      {/* ── Props API ─────────────────────────────────── */}
      <section className="back-to-top-page__section" id="props">
        <h2 className="back-to-top-page__section-title"><a href="#props">Props API</a></h2>
        <p className="back-to-top-page__section-desc">
          All props accepted by BackToTop. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── Accessibility ──────────────────────────────── */}
      <section className="back-to-top-page__section" id="accessibility">
        <h2 className="back-to-top-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="back-to-top-page__section-desc">
          Built on the native {'<button>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="back-to-top-page__a11y-list">
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> Uses <code className="back-to-top-page__a11y-key">aria-label="Back to top"</code> for screen reader announcement.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="back-to-top-page__a11y-key">Enter</code> and <code className="back-to-top-page__a11y-key">Space</code> keys.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="back-to-top-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All visual elements meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="back-to-top-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="back-to-top-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="back-to-top-page__a11y-key">prefers-reduced-motion</code> — disables all animations.
              </span>
            </li>
            <li className="back-to-top-page__a11y-item">
              <span className="back-to-top-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Hidden via <code className="back-to-top-page__a11y-key">@media print</code> to keep printed pages clean.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── Source ──────────────────────────────────────── */}
      <section className="back-to-top-page__section" id="source">
        <h2 className="back-to-top-page__section-title"><a href="#source">Source</a></h2>
        <p className="back-to-top-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="back-to-top-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/back-to-top.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/back-to-top.tsx (Standard)
          </a>
          <a className="back-to-top-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/back-to-top.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/back-to-top.tsx (Lite)
          </a>
          <a className="back-to-top-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/back-to-top.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/back-to-top.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
