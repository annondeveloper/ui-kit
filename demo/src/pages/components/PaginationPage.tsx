'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Pagination } from '@ui/components/pagination'
import { Pagination as LitePagination } from '@ui/lite/pagination'
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
    @scope (.pagination-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pagination-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .pagination-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pagination-page__hero::before {
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
        animation: pagination-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes pagination-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .pagination-page__hero::before { animation: none; }
      }

      .pagination-page__title {
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

      .pagination-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pagination-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pagination-page__import-code {
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

      .pagination-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .pagination-page__section {
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
        animation: pagination-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pagination-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .pagination-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .pagination-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .pagination-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .pagination-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .pagination-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .pagination-page__preview {
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

      .pagination-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pagination-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .pagination-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .pagination-page__playground {
          grid-template-columns: 1fr;
        }
        .pagination-page__playground-controls {
          position: static !important;
        }
      }

      @container pagination-page (max-width: 680px) {
        .pagination-page__playground {
          grid-template-columns: 1fr;
        }
        .pagination-page__playground-controls {
          position: static !important;
        }
      }

      .pagination-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .pagination-page__playground-result {
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

      .pagination-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pagination-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .pagination-page__playground-controls {
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

      .pagination-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .pagination-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .pagination-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .pagination-page__option-btn {
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
      .pagination-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .pagination-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .pagination-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .pagination-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .pagination-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .pagination-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .pagination-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .pagination-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .pagination-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .pagination-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .pagination-page__tier-card {
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

      .pagination-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pagination-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .pagination-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .pagination-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pagination-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .pagination-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .pagination-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .pagination-page__tier-import {
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

      .pagination-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .pagination-page__code-tabs {
        margin-block-start: 1rem;
      }

      .pagination-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .pagination-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .pagination-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .pagination-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .pagination-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .pagination-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .pagination-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .pagination-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .pagination-page__hero {
          padding: 2rem 1.25rem;
        }

        .pagination-page__title {
          font-size: 1.75rem;
        }

        .pagination-page__preview {
          padding: 1.75rem;
        }

        .pagination-page__playground {
          grid-template-columns: 1fr;
        }

        .pagination-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .pagination-page__labeled-row {
          gap: 1rem;
        }

        .pagination-page__tiers {
          grid-template-columns: 1fr;
        }

        .pagination-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .pagination-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .pagination-page__hero {
          padding: 1.5rem 1rem;
        }

        .pagination-page__title {
          font-size: 1.5rem;
        }

        .pagination-page__preview {
          padding: 1rem;
        }

        .pagination-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .pagination-page__title {
          font-size: 4rem;
        }

        .pagination-page__preview {
          padding: 3.5rem;
        }

        .pagination-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .pagination-page__import-code,
      .pagination-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const paginationProps: PropDef[] = [
  { name: 'page', type: 'number', required: true, description: 'Current active page (1-indexed).' },
  { name: 'totalPages', type: 'number', required: true, description: 'Total number of pages.' },
  { name: 'onChange', type: '(page: number) => void', required: true, description: 'Callback when page changes.' },
  { name: 'siblingCount', type: 'number', default: '1', description: 'Number of sibling pages visible around the current page.' },
  { name: 'showFirst', type: 'boolean', default: 'false', description: 'Show first/last page navigation buttons (double chevrons).' },
  { name: 'showPrevNext', type: 'boolean', default: 'true', description: 'Show previous/next navigation buttons.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Button size controlling dimensions and font-size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying <nav> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Pagination } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Pagination } from '@annondeveloper/ui-kit'",
  premium: "import { Pagination } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text, prefix }: { text: string; prefix: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className={`${prefix}copy-btn`}
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
  prefix,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  prefix: string
}) {
  return (
    <div className={`${prefix}control-group`}>
      <span className={`${prefix}control-label`}>{label}</span>
      <div className={`${prefix}control-options`}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`${prefix}option-btn${opt === value ? ` ${prefix}option-btn--active` : ''}`}
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
  prefix,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  prefix: string
}) {
  return (
    <label className={`${prefix}toggle-label`}>
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
  totalPages: number,
  siblingCount: number,
  size: Size,
  showFirst: boolean,
  showPrevNext: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  page={page}')
  props.push(`  totalPages={${totalPages}}`)
  props.push('  onChange={setPage}')
  if (siblingCount !== 1) props.push(`  siblingCount={${siblingCount}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showFirst) props.push('  showFirst')
  if (!showPrevNext) props.push('  showPrevNext={false}')

  return `${importStr}
import { useState } from 'react'

function MyPagination() {
  const [page, setPage] = useState(1)

  return (
    <Pagination
${props.join('\n')}
    />
  )
}`
}

function generateHtmlCode(tier: Tier, totalPages: number, size: Size): string {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
  const className = tier === 'lite' ? 'ui-lite-pagination' : 'ui-pagination'

  return `<!-- Pagination — @annondeveloper/ui-kit ${tier} tier -->
<nav class="${className}" aria-label="Pagination"${tier !== 'lite' ? ` data-size="${size}"` : ''}>
  <button type="button" aria-label="Previous page" disabled>&laquo;</button>
${pages.map(p => `  <button type="button"${p === 1 ? ' aria-current="page"' : ''} aria-label="Page ${p}">${p}</button>`).join('\n')}
${totalPages > 7 ? '  <span class="' + className + '__ellipsis" aria-hidden="true">...</span>\n  <button type="button" aria-label="Page ' + totalPages + '">' + totalPages + '</button>\n' : ''}  <button type="button" aria-label="Next page">&raquo;</button>
</nav>`
}

function generateVueCode(tier: Tier, totalPages: number, size: Size): string {
  if (tier === 'lite') {
    return `<template>
  <nav class="ui-lite-pagination" aria-label="Pagination">
    <button @click="page > 1 && page--" :disabled="page <= 1">&laquo;</button>
    <button
      v-for="p in ${totalPages}"
      :key="p"
      :aria-current="p === page ? 'page' : undefined"
      @click="page = p"
    >{{ p }}</button>
    <button @click="page < ${totalPages} && page++" :disabled="page >= ${totalPages}">&raquo;</button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const page = ref(1)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = '@annondeveloper/ui-kit'
  return `<template>
  <Pagination
    :page="page"
    :totalPages="${totalPages}"
    ${size !== 'md' ? `size="${size}"\n    ` : ''}@change="page = $event"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Pagination } from '${importPath}'
const page = ref(1)
</script>`
}

function generateAngularCode(tier: Tier, totalPages: number, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<nav class="ui-lite-pagination" aria-label="Pagination">
  <button (click)="page > 1 && page = page - 1" [disabled]="page <= 1">&laquo;</button>
  <button
    *ngFor="let p of pages"
    [attr.aria-current]="p === page ? 'page' : null"
    (click)="page = p"
  >{{ p }}</button>
  <button (click)="page < ${totalPages} && page = page + 1" [disabled]="page >= ${totalPages}">&raquo;</button>
</nav>

/* In your component */
page = 1;
pages = Array.from({length: ${totalPages}}, (_, i) => i + 1);

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the CSS-only approach -->
<nav class="ui-pagination" data-size="${size}" aria-label="Pagination">
  <button (click)="prevPage()" [disabled]="page <= 1" aria-label="Previous page">
    &lsaquo;
  </button>
  <button
    *ngFor="let p of getPageRange()"
    [attr.aria-current]="p === page ? 'page' : null"
    (click)="page = p"
  >{{ p }}</button>
  <button (click)="nextPage()" [disabled]="page >= totalPages" aria-label="Next page">
    &rsaquo;
  </button>
</nav>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/pagination.css';`
}

function generateSvelteCode(tier: Tier, totalPages: number, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<script>
  let page = 1
  const totalPages = ${totalPages}
</script>

<nav class="ui-lite-pagination" aria-label="Pagination">
  <button on:click={() => page > 1 && page--} disabled={page <= 1}>&laquo;</button>
  {#each Array.from({length: totalPages}, (_, i) => i + 1) as p}
    <button
      aria-current={p === page ? 'page' : undefined}
      on:click={() => page = p}
    >{p}</button>
  {/each}
  <button on:click={() => page < totalPages && page++} disabled={page >= totalPages}>&raquo;</button>
</nav>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { Pagination } from '@annondeveloper/ui-kit'
  let page = 1
</script>

<Pagination
  {page}
  totalPages={${totalPages}}
  ${size !== 'md' ? `size="${size}"\n  ` : ''}on:change={(e) => page = e.detail}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

const P = 'pagination-page__'

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(20)
  const [siblingCount, setSiblingCount] = useState(1)
  const [size, setSize] = useState<Size>('md')
  const [showFirst, setShowFirst] = useState(false)
  const [showPrevNext, setShowPrevNext] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const handlePageChange = useCallback((p: number) => setPage(p), [])

  const reactCode = useMemo(
    () => generateReactCode(tier, totalPages, siblingCount, size, showFirst, showPrevNext),
    [tier, totalPages, siblingCount, size, showFirst, showPrevNext],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, totalPages, size),
    [tier, totalPages, size],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, totalPages, size),
    [tier, totalPages, size],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, totalPages, size),
    [tier, totalPages, size],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, totalPages, size),
    [tier, totalPages, size],
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
    <section className={`${P}section`} id="playground">
      <h2 className={`${P}section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${P}section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${P}playground`}>
        <div className={`${P}playground-preview`}>
          <div className={`${P}playground-result`}>
            {tier === 'lite' ? (
              <LitePagination
                page={page}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            ) : (
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={handlePageChange}
                siblingCount={siblingCount}
                size={size}
                showFirst={showFirst}
                showPrevNext={showPrevNext}
              />
            )}
          </div>

          <div className={`${P}code-tabs`}>
            <div className={`${P}export-row`}>
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
              {copyStatus && <span className={`${P}export-status`}>{copyStatus}</span>}
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

        <div className={`${P}playground-controls`}>
          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Total Pages</span>
            <input
              type="number"
              min={1}
              max={100}
              value={totalPages}
              onChange={e => {
                const v = Number(e.target.value)
                if (v >= 1 && v <= 100) {
                  setTotalPages(v)
                  if (page > v) setPage(v)
                }
              }}
              className={`${P}text-input`}
            />
          </div>

          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Current Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={e => {
                const v = Number(e.target.value)
                if (v >= 1 && v <= totalPages) setPage(v)
              }}
              className={`${P}text-input`}
            />
          </div>

          {tier !== 'lite' && (
            <OptionGroup
              label="Sibling Count"
              options={['0', '1', '2', '3'] as const}
              value={String(siblingCount) as '0' | '1' | '2' | '3'}
              onChange={v => setSiblingCount(Number(v))}
              prefix={P}
            />
          )}

          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} prefix={P} />
          )}

          <div className={`${P}control-group`}>
            <span className={`${P}control-label`}>Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && (
                <Toggle label="Show First/Last" checked={showFirst} onChange={setShowFirst} prefix={P} />
              )}
              {tier !== 'lite' && (
                <Toggle label="Show Prev/Next" checked={showPrevNext} onChange={setShowPrevNext} prefix={P} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaginationPage() {
  useStyles('pagination-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)
  const [demoPage, setDemoPage] = useState(1)

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.pagination-page__section')
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

  // Premium tier now available at @annondeveloper/ui-kit/premium
  const PaginationComponent = tier === 'lite' ? LitePagination : Pagination

  return (
    <div className="pagination-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className={`${P}hero`}>
        <h1 className={`${P}title`}>Pagination</h1>
        <p className={`${P}desc`}>
          Page navigation with smart truncation, sibling controls, and keyboard support.
          Ships in two weight tiers from a minimal CSS-only lite to a full-featured standard with size scales and motion.
        </p>
        <div className={`${P}import-row`}>
          <code className={`${P}import-code`}>{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} prefix={P} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="sizes">
          <h2 className={`${P}section-title`}>
            <a href="#sizes">Size Scale</a>
          </h2>
          <p className={`${P}section-desc`}>
            Five sizes control button dimensions and font-size. All sizes maintain consistent proportions and meet touch target requirements on mobile.
          </p>
          <div className={`${P}preview ${P}preview--col`}>
            {SIZES.map(s => (
              <div key={s} className={`${P}labeled-item`} style={{ width: '100%' }}>
                <Pagination page={3} totalPages={10} onChange={() => {}} size={s} />
                <span className={`${P}item-label`}>{s}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Sibling Count ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="siblings">
          <h2 className={`${P}section-title`}>
            <a href="#siblings">Sibling Count</a>
          </h2>
          <p className={`${P}section-desc`}>
            Control how many page numbers appear on each side of the current page. Higher sibling counts show more context but take more space.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '1.5rem' }}>
            {[0, 1, 2, 3].map(sc => (
              <div key={sc} className={`${P}labeled-item`} style={{ width: '100%' }}>
                <Pagination page={10} totalPages={20} onChange={() => {}} siblingCount={sc} />
                <span className={`${P}item-label`}>siblingCount={sc}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Navigation Buttons ──────────────────────── */}
      {tier !== 'lite' && (
        <section className={`${P}section`} id="nav-buttons">
          <h2 className={`${P}section-title`}>
            <a href="#nav-buttons">Navigation Buttons</a>
          </h2>
          <p className={`${P}section-desc`}>
            Toggle previous/next arrows and first/last page buttons. The first/last buttons use double chevrons for quick jumps to boundaries.
          </p>
          <div className={`${P}preview ${P}preview--col`} style={{ gap: '1.5rem' }}>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Pagination page={5} totalPages={10} onChange={() => {}} showPrevNext showFirst={false} />
              <span className={`${P}item-label`}>prev/next only</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Pagination page={5} totalPages={10} onChange={() => {}} showPrevNext showFirst />
              <span className={`${P}item-label`}>prev/next + first/last</span>
            </div>
            <div className={`${P}labeled-item`} style={{ width: '100%' }}>
              <Pagination page={5} totalPages={10} onChange={() => {}} showPrevNext={false} showFirst={false} />
              <span className={`${P}item-label`}>pages only (no arrows)</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Interactive Demo ──────────────────────────── */}
      <section className={`${P}section`} id="interactive">
        <h2 className={`${P}section-title`}>
          <a href="#interactive">Interactive Demo</a>
        </h2>
        <p className={`${P}section-desc`}>
          Click through pages to see the smart truncation algorithm in action. Ellipsis markers appear when needed.
        </p>
        <div className={`${P}preview`}>
          {tier === 'lite' ? (
            <LitePagination
              page={demoPage}
              totalPages={15}
              onChange={setDemoPage}
            />
          ) : (
            <Pagination
              page={demoPage}
              totalPages={15}
              onChange={setDemoPage}
              showFirst
            />
          )}
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBlockStart: '0.75rem', textAlign: 'center' }}>
          Current page: <strong style={{ color: 'var(--text-primary)' }}>{demoPage}</strong> of 15
        </p>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className={`${P}section`} id="tiers">
        <h2 className={`${P}section-title`}>
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className={`${P}section-desc`}>
          Choose the right balance of features and bundle size. Pagination ships as Lite (CSS-only) and Standard (full-featured).
          Premium adds aurora glow effects and spring animations.
        </p>

        <div className={`${P}tiers`}>
          {/* Lite */}
          <div
            className={`${P}tier-card${tier === 'lite' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Lite</span>
              <span className={`${P}tier-size`}>~0.4 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              CSS-only pagination. Simple prev/next with numbered pages. No truncation, no sibling control, no size variants.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Pagination {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className={`${P}tier-preview`}>
              <LitePagination page={1} totalPages={5} onChange={() => {}} />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`${P}tier-card${tier === 'standard' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Standard</span>
              <span className={`${P}tier-size`}>~1.8 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Full-featured pagination with smart truncation, sibling count, first/last buttons, five sizes, motion levels, and accessibility.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Pagination {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className={`${P}tier-preview`}>
              <Pagination page={3} totalPages={10} onChange={() => {}} showFirst />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`${P}tier-card${tier === 'premium' ? ` ${P}tier-card--active` : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className={`${P}tier-header`}>
              <span className={`${P}tier-name`}>Premium</span>
              <span className={`${P}tier-size`}>~3-5 KB</span>
            </div>
            <p className={`${P}tier-desc`}>
              Aurora glow on current page, spring-scale page pop animation, shimmer on page change, and hover glow.
            </p>
            <div className={`${P}tier-import`}>
              import {'{'} Pagination {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className={`${P}tier-preview`}>
              <Pagination page={3} totalPages={10} onChange={() => {}} showFirst />
            </div>
            <div className={`${P}size-breakdown`}>
              <div className={`${P}size-row`}>
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className={`${P}section`} id="props">
        <h2 className={`${P}section-title`}>
          <a href="#props">Props API</a>
        </h2>
        <p className={`${P}section-desc`}>
          All props accepted by Pagination. It also spreads any native nav HTML attributes
          onto the underlying {'<nav>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={paginationProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className={`${P}section`} id="accessibility">
        <h2 className={`${P}section-title`}>
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className={`${P}section-desc`}>
          Built on the native {'<nav>'} element with comprehensive ARIA support for screen readers and keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className={`${P}a11y-list`}>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Navigation landmark:</strong> Wrapped in <code className={`${P}a11y-key`}>{'<nav aria-label="Pagination">'}</code> for screen reader landmark navigation.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Current page:</strong> Active page marked with <code className={`${P}a11y-key`}>aria-current="page"</code> for screen reader announcement.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Button labels:</strong> Each page button has <code className={`${P}a11y-key`}>aria-label="Page N"</code> for clear identification.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Full keyboard navigation via <code className={`${P}a11y-key`}>Tab</code> and <code className={`${P}a11y-key`}>Enter</code>/<code className={`${P}a11y-key`}>Space</code> keys.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled state:</strong> Previous/next buttons properly disabled at boundaries with <code className={`${P}a11y-key`}>disabled</code> attribute.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus ring:</strong> Visible <code className={`${P}a11y-key`}>:focus-visible</code> outline with brand-colored ring on keyboard navigation.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className={`${P}a11y-key`}>@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className={`${P}a11y-item`}>
              <span className={`${P}a11y-icon`}><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className={`${P}a11y-key`}>forced-colors: active</code> with visible borders on all buttons.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
