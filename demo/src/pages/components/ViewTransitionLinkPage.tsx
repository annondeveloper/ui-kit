'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ViewTransitionLink } from '@ui/domain/view-transition-link'
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
    @scope (.view-transition-link-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: vtl-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .view-transition-link-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .view-transition-link-page__hero::before {
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
        .view-transition-link-page__hero::before { animation: none; }
      }

      .view-transition-link-page__title {
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

      .view-transition-link-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .view-transition-link-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .view-transition-link-page__import-code {
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

      .view-transition-link-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .view-transition-link-page__section {
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
        .view-transition-link-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .view-transition-link-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .view-transition-link-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .view-transition-link-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .view-transition-link-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .view-transition-link-page__preview {
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

      .view-transition-link-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .view-transition-link-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Labeled items ──────────────────────────────── */

      .view-transition-link-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .view-transition-link-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Demo link styles ──────────────────────────── */

      .view-transition-link-page__demo-link {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--brand, oklch(65% 0.2 270));
      }

      .view-transition-link-page__demo-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .view-transition-link-page__card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        inline-size: 100%;
      }

      .view-transition-link-page__demo-card {
        padding: 1.5rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        text-align: center;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
      }

      .view-transition-link-page__demo-card:hover {
        border-color: var(--brand);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.15);
      }

      .view-transition-link-page__demo-card-title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--brand, oklch(65% 0.2 270));
        margin: 0;
      }

      .view-transition-link-page__demo-card-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        margin: 0.25rem 0 0;
      }

      /* ── API support badge ──────────────────────────── */

      .view-transition-link-page__api-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.75rem;
        border-radius: var(--radius-md);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
      }

      .view-transition-link-page__api-badge--supported {
        background: oklch(72% 0.19 155 / 0.12);
        color: oklch(72% 0.19 155);
      }

      .view-transition-link-page__api-badge--unsupported {
        background: oklch(80% 0.16 80 / 0.12);
        color: oklch(80% 0.16 80);
      }

      /* ── Playground ─────────────────────────────────── */

      .view-transition-link-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container vtl-page (max-width: 680px) {
        .view-transition-link-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .view-transition-link-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .view-transition-link-page__playground-result {
        min-block-size: 160px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .view-transition-link-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .view-transition-link-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .view-transition-link-page__playground-controls {
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

      .view-transition-link-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .view-transition-link-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .view-transition-link-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .view-transition-link-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .view-transition-link-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .view-transition-link-page__code-tabs {
        margin-block-start: 1rem;
      }

      .view-transition-link-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .view-transition-link-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .view-transition-link-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .view-transition-link-page__tier-card {
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

      .view-transition-link-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .view-transition-link-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .view-transition-link-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .view-transition-link-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .view-transition-link-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .view-transition-link-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .view-transition-link-page__tier-import {
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

      .view-transition-link-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .view-transition-link-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .view-transition-link-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .view-transition-link-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .view-transition-link-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .view-transition-link-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .view-transition-link-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .view-transition-link-page__hero { padding: 2rem 1.25rem; }
        .view-transition-link-page__title { font-size: 1.75rem; }
        .view-transition-link-page__preview { padding: 1.75rem; }
        .view-transition-link-page__playground { grid-template-columns: 1fr; }
        .view-transition-link-page__tiers { grid-template-columns: 1fr; }
        .view-transition-link-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .view-transition-link-page__hero { padding: 1.5rem 1rem; }
        .view-transition-link-page__title { font-size: 1.5rem; }
        .view-transition-link-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .view-transition-link-page__import-code,
      .view-transition-link-page code,
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

// ─── Props Data ───────────────────────────────────────────────────────────────

const viewTransitionLinkProps: PropDef[] = [
  { name: 'href', type: 'string', description: 'The URL to navigate to. Falls through to native anchor navigation when View Transitions API is unavailable.' },
  { name: 'transitionName', type: 'string', description: 'CSS view-transition-name applied via inline style. Used to create named transitions between pages.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'The link content (text, icons, or any elements).' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler called before the view transition starts. Call e.preventDefault() to cancel navigation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the anchor element.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles merged with the transition name style.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ViewTransitionLink } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ViewTransitionLink } from '@annondeveloper/ui-kit'",
  premium: "import { ViewTransitionLink } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="view-transition-link-page__copy-btn"
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
    <label className="view-transition-link-page__toggle-label">
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

function detectViewTransitionSupport(): boolean {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, transitionName: string, linkText: string, href: string): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [`  href="${href}"`]
  if (transitionName) props.push(`  transitionName="${transitionName}"`)

  return `${importStr}

<ViewTransitionLink
${props.join('\n')}
>
  ${linkText}
</ViewTransitionLink>`
}

function generateHtmlCode(tier: Tier, transitionName: string, linkText: string, href: string): string {
  const vtStyle = transitionName ? ` style="view-transition-name: ${transitionName}"` : ''
  return `<!-- ViewTransitionLink — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/view-transition-link.css">

<a
  href="${href}"
  class="ui-view-transition-link"${vtStyle}
  onclick="handleViewTransition(event)"
>
  ${linkText}
</a>

<script>
function handleViewTransition(e) {
  if (document.startViewTransition) {
    e.preventDefault();
    document.startViewTransition(() => {
      window.location.href = e.currentTarget.href;
    });
  }
}
</script>

<!-- @import '@annondeveloper/ui-kit/css/components/view-transition-link.css'; -->`
}

function generateVueCode(tier: Tier, transitionName: string, linkText: string, href: string): string {
  if (tier === 'lite') {
    const vtStyle = transitionName ? ` :style="{ viewTransitionName: '${transitionName}' }"` : ''
    return `<template>
  <a
    href="${href}"
    class="ui-view-transition-link"${vtStyle}
    @click="handleClick"
  >
    ${linkText}
  </a>
</template>

<script setup>
function handleClick(e) {
  if (document.startViewTransition) {
    e.preventDefault()
    document.startViewTransition(() => {
      window.location.href = e.currentTarget.href
    })
  }
}
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  href="${href}"`]
  if (transitionName) attrs.push(`  transition-name="${transitionName}"`)

  return `<template>
  <ViewTransitionLink
${attrs.join('\n')}
  >
    ${linkText}
  </ViewTransitionLink>
</template>

<script setup>
import { ViewTransitionLink } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, transitionName: string, linkText: string, href: string): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const vtStyle = transitionName ? ` [style.viewTransitionName]="'${transitionName}'"` : ''
  return `<!-- Angular — ${tier} tier -->
<a
  href="${href}"
  class="ui-view-transition-link"${vtStyle}
  (click)="handleViewTransition($event)"
>
  ${linkText}
</a>

/* In your component.ts */
handleViewTransition(e: Event) {
  if ((document as any).startViewTransition) {
    e.preventDefault();
    (document as any).startViewTransition(() => {
      window.location.href = (e.currentTarget as HTMLAnchorElement).href;
    });
  }
}

/* Import component CSS */
@import '${importPath}/css/components/view-transition-link.css';`
}

function generateSvelteCode(tier: Tier, transitionName: string, linkText: string, href: string): string {
  if (tier === 'lite') {
    const vtStyle = transitionName ? ` style="view-transition-name: ${transitionName}"` : ''
    return `<!-- Svelte — Lite tier (CSS-only) -->
<a
  href="${href}"
  class="ui-view-transition-link"${vtStyle}
  on:click={handleClick}
>
  ${linkText}
</a>

<script>
  function handleClick(e) {
    if (document.startViewTransition) {
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = e.currentTarget.href;
      });
    }
  }
</script>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  href="${href}"`]
  if (transitionName) attrs.push(`  transitionName="${transitionName}"`)

  return `<script>
  import { ViewTransitionLink } from '${importPath}';
</script>

<ViewTransitionLink
${attrs.join('\n')}
>
  ${linkText}
</ViewTransitionLink>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [transitionName, setTransitionName] = useState('hero-image')
  const [linkText, setLinkText] = useState('Navigate to Details')
  const [href, setHref] = useState('#playground')
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const reactCode = useMemo(() => generateReactCode(tier, transitionName, linkText, href), [tier, transitionName, linkText, href])
  const htmlCode = useMemo(() => generateHtmlCode(tier, transitionName, linkText, href), [tier, transitionName, linkText, href])
  const vueCode = useMemo(() => generateVueCode(tier, transitionName, linkText, href), [tier, transitionName, linkText, href])
  const angularCode = useMemo(() => generateAngularCode(tier, transitionName, linkText, href), [tier, transitionName, linkText, href])
  const svelteCode = useMemo(() => generateSvelteCode(tier, transitionName, linkText, href), [tier, transitionName, linkText, href])

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
    <section className="view-transition-link-page__section" id="playground">
      <h2 className="view-transition-link-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="view-transition-link-page__section-desc">
        Configure the link and see the generated code update in real-time. Click the link to trigger a view transition (in supported browsers).
      </p>

      <div className="view-transition-link-page__playground">
        <div className="view-transition-link-page__playground-preview">
          <div className="view-transition-link-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <ViewTransitionLink
                href={href}
                transitionName={transitionName || undefined}
                onClick={(e) => e.preventDefault()}
                className="view-transition-link-page__demo-link"
              >
                {linkText}
              </ViewTransitionLink>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
                Click is prevented in this demo. In production, the link triggers a view transition.
              </p>
            </div>
          </div>

          <div className="view-transition-link-page__code-tabs">
            <div className="view-transition-link-page__export-row">
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
              {copyStatus && <span className="view-transition-link-page__export-status">{copyStatus}</span>}
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

        <div className="view-transition-link-page__playground-controls">
          <div className="view-transition-link-page__control-group">
            <span className="view-transition-link-page__control-label">Link Text</span>
            <input
              type="text"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              className="view-transition-link-page__text-input"
              placeholder="Link text..."
            />
          </div>
          <div className="view-transition-link-page__control-group">
            <span className="view-transition-link-page__control-label">Href</span>
            <input
              type="text"
              value={href}
              onChange={e => setHref(e.target.value)}
              className="view-transition-link-page__text-input"
              placeholder="/destination"
            />
          </div>
          <div className="view-transition-link-page__control-group">
            <span className="view-transition-link-page__control-label">Transition Name</span>
            <input
              type="text"
              value={transitionName}
              onChange={e => setTransitionName(e.target.value)}
              className="view-transition-link-page__text-input"
              placeholder="e.g. hero-image"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ViewTransitionLinkPage() {
  useStyles('view-transition-link-page', pageStyles)

  const { tier, setTier } = useTier()
  const hasViewTransitions = useMemo(() => detectViewTransitionSupport(), [])

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.view-transition-link-page__section')
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
    <div className="view-transition-link-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="view-transition-link-page__hero">
        <h1 className="view-transition-link-page__title">ViewTransitionLink</h1>
        <p className="view-transition-link-page__desc">
          Anchor element that automatically wraps navigation in the View Transitions API
          for smooth cross-page animations. Falls back to native navigation in unsupported browsers.
        </p>
        <div className="view-transition-link-page__import-row">
          <code className="view-transition-link-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. API Support Check ───────────────────────── */}
      <section className="view-transition-link-page__section" id="support">
        <h2 className="view-transition-link-page__section-title">
          <a href="#support">Browser Support</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          The View Transitions API enables smooth animated transitions between pages or states.
          The component auto-detects support and falls back to normal navigation.
        </p>
        <div className="view-transition-link-page__preview">
          <span className={`view-transition-link-page__api-badge ${hasViewTransitions ? 'view-transition-link-page__api-badge--supported' : 'view-transition-link-page__api-badge--unsupported'}`}>
            {hasViewTransitions ? 'View Transitions API Supported' : 'View Transitions API Not Supported'}
          </span>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'center', maxInlineSize: '40ch' }}>
            {hasViewTransitions
              ? 'Your browser supports view transitions. Links will animate smoothly between pages.'
              : 'Your browser does not support view transitions. Links will use standard navigation (progressive enhancement).'}
          </div>
        </div>
      </section>

      {/* ── 3. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 4. Basic Usage ──────────────────────────────── */}
      <section className="view-transition-link-page__section" id="basic">
        <h2 className="view-transition-link-page__section-title">
          <a href="#basic">Basic Usage</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          A simple link that wraps navigation in a view transition. No transition name needed
          for basic cross-fade effects.
        </p>
        <div className="view-transition-link-page__preview">
          <ViewTransitionLink href="#basic" onClick={(e) => e.preventDefault()}>
            Simple transition link
          </ViewTransitionLink>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<ViewTransitionLink href="/about">
  Learn more about us
</ViewTransitionLink>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Named Transitions ───────────────────────── */}
      <section className="view-transition-link-page__section" id="named">
        <h2 className="view-transition-link-page__section-title">
          <a href="#named">Named Transitions</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          Assign a <code>transitionName</code> to create element-specific transitions. This sets
          the CSS <code>view-transition-name</code> property, enabling the browser to morph matched
          elements across pages.
        </p>
        <div className="view-transition-link-page__preview">
          <div className="view-transition-link-page__card-grid">
            <ViewTransitionLink href="#named" transitionName="card-alpha" onClick={(e) => e.preventDefault()}>
              <div className="view-transition-link-page__demo-card">
                <p className="view-transition-link-page__demo-card-title">Alpha Project</p>
                <p className="view-transition-link-page__demo-card-desc">transition: card-alpha</p>
              </div>
            </ViewTransitionLink>
            <ViewTransitionLink href="#named" transitionName="card-beta" onClick={(e) => e.preventDefault()}>
              <div className="view-transition-link-page__demo-card">
                <p className="view-transition-link-page__demo-card-title">Beta Project</p>
                <p className="view-transition-link-page__demo-card-desc">transition: card-beta</p>
              </div>
            </ViewTransitionLink>
            <ViewTransitionLink href="#named" transitionName="card-gamma" onClick={(e) => e.preventDefault()}>
              <div className="view-transition-link-page__demo-card">
                <p className="view-transition-link-page__demo-card-title">Gamma Project</p>
                <p className="view-transition-link-page__demo-card-desc">transition: card-gamma</p>
              </div>
            </ViewTransitionLink>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<ViewTransitionLink
  href="/projects/alpha"
  transitionName="card-alpha"
>
  <ProjectCard name="Alpha" />
</ViewTransitionLink>

/* On the target page, match the name: */
.project-detail-hero {
  view-transition-name: card-alpha;
}`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6. With onClick Handler ────────────────────── */}
      <section className="view-transition-link-page__section" id="onclick">
        <h2 className="view-transition-link-page__section-title">
          <a href="#onclick">Custom Click Handler</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          Pass an <code>onClick</code> handler to run custom logic before navigation.
          Call <code>e.preventDefault()</code> to cancel the navigation entirely.
        </p>
        <div className="view-transition-link-page__preview">
          <ViewTransitionLink
            href="#onclick"
            onClick={(e) => {
              e.preventDefault()
              alert('Custom click handler ran! Navigation was prevented.')
            }}
          >
            Click me (prevented)
          </ViewTransitionLink>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<ViewTransitionLink
  href="/dashboard"
  onClick={(e) => {
    // Run analytics, validation, etc.
    trackNavigation('/dashboard')
    // Don't call e.preventDefault() to allow navigation
  }}
>
  Go to Dashboard
</ViewTransitionLink>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="view-transition-link-page__section" id="tiers">
        <h2 className="view-transition-link-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          Choose the right balance of features and bundle size for your view transition links.
        </p>

        <div className="view-transition-link-page__tiers">
          {/* Lite */}
          <div
            className={`view-transition-link-page__tier-card${tier === 'lite' ? ' view-transition-link-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="view-transition-link-page__tier-header">
              <span className="view-transition-link-page__tier-name">Lite</span>
              <span className="view-transition-link-page__tier-size">~0.2 KB</span>
            </div>
            <p className="view-transition-link-page__tier-desc">
              CSS-only anchor styling. No automatic View Transitions API call. You wire up document.startViewTransition() yourself.
            </p>
            <div className="view-transition-link-page__tier-import">
              import {'{'} ViewTransitionLink {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="view-transition-link-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>CSS-only styling</span>
            </div>
            <div className="view-transition-link-page__size-breakdown">
              <div className="view-transition-link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`view-transition-link-page__tier-card${tier === 'standard' ? ' view-transition-link-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="view-transition-link-page__tier-header">
              <span className="view-transition-link-page__tier-name">Standard</span>
              <span className="view-transition-link-page__tier-size">~0.6 KB</span>
            </div>
            <p className="view-transition-link-page__tier-desc">
              Auto-detects View Transitions API, wraps navigation in startViewTransition(),
              applies transitionName style, and falls back to native anchor navigation.
            </p>
            <div className="view-transition-link-page__tier-import">
              import {'{'} ViewTransitionLink {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="view-transition-link-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Auto view transitions</span>
            </div>
            <div className="view-transition-link-page__size-breakdown">
              <div className="view-transition-link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`view-transition-link-page__tier-card${tier === 'premium' ? ' view-transition-link-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="view-transition-link-page__tier-header">
              <span className="view-transition-link-page__tier-name">Premium</span>
              <span className="view-transition-link-page__tier-size">~1.5 KB</span>
            </div>
            <p className="view-transition-link-page__tier-desc">
              Everything in Standard plus prefetch-on-hover, custom transition CSS injection,
              morph animations between matched elements, and route-aware transition types.
            </p>
            <div className="view-transition-link-page__tier-import">
              import {'{'} ViewTransitionLink {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="view-transition-link-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Prefetch + morph + custom CSS</span>
            </div>
            <div className="view-transition-link-page__size-breakdown">
              <div className="view-transition-link-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="view-transition-link-page__section" id="props">
        <h2 className="view-transition-link-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          All props accepted by ViewTransitionLink. It extends native anchor HTML attributes,
          so all standard {'<a>'} props like <code>target</code> and <code>rel</code> work too.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={viewTransitionLinkProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="view-transition-link-page__section" id="accessibility">
        <h2 className="view-transition-link-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="view-transition-link-page__section-desc">
          Built on the native anchor element with proper focus management and fallback behavior.
        </p>
        <Card variant="default" padding="md">
          <ul className="view-transition-link-page__a11y-list">
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Native element:</strong> Built on <code className="view-transition-link-page__a11y-key">{'<a>'}</code> element — inherits all native link semantics and behaviors.
              </span>
            </li>
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus ring:</strong> Visible 2px brand-colored outline on <code className="view-transition-link-page__a11y-key">:focus-visible</code> with offset.
              </span>
            </li>
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Progressive enhancement:</strong> Falls through to standard navigation when View Transitions API is unavailable.
              </span>
            </li>
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="view-transition-link-page__a11y-key">Enter</code> key, works with screen readers as a standard link.
              </span>
            </li>
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Uses <code className="view-transition-link-page__a11y-key">LinkText</code> and <code className="view-transition-link-page__a11y-key">Highlight</code> in forced-colors mode.
              </span>
            </li>
            <li className="view-transition-link-page__a11y-item">
              <span className="view-transition-link-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Cursor:</strong> Shows pointer cursor to indicate interactive element, matching native link behavior.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
