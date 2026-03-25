'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TypingIndicator } from '@ui/domain/typing-indicator'
import { TypingIndicator as LiteTypingIndicator } from '@ui/lite/typing-indicator'
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
    @scope (.typing-indicator-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: typing-indicator-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .typing-indicator-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .typing-indicator-page__hero::before {
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
        animation: typing-indicator-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes typing-indicator-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .typing-indicator-page__hero::before { animation: none; }
      }

      .typing-indicator-page__title {
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

      .typing-indicator-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .typing-indicator-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .typing-indicator-page__import-code {
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

      .typing-indicator-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .typing-indicator-page__section {
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
        animation: typing-indicator-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes typing-indicator-section-reveal {
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
        .typing-indicator-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .typing-indicator-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .typing-indicator-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .typing-indicator-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .typing-indicator-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .typing-indicator-page__preview {
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

      .typing-indicator-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .typing-indicator-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .typing-indicator-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container typing-indicator-page (max-width: 680px) {
        .typing-indicator-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .typing-indicator-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .typing-indicator-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .typing-indicator-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .typing-indicator-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .typing-indicator-page__playground-controls {
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

      .typing-indicator-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .typing-indicator-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .typing-indicator-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .typing-indicator-page__option-btn {
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
      .typing-indicator-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .typing-indicator-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .typing-indicator-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .typing-indicator-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .typing-indicator-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .typing-indicator-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .typing-indicator-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .typing-indicator-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .typing-indicator-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .typing-indicator-page__tier-card {
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

      .typing-indicator-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .typing-indicator-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .typing-indicator-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .typing-indicator-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .typing-indicator-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .typing-indicator-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .typing-indicator-page__tier-import {
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

      .typing-indicator-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .typing-indicator-page__code-tabs {
        margin-block-start: 1rem;
      }

      .typing-indicator-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .typing-indicator-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .typing-indicator-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .typing-indicator-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .typing-indicator-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .typing-indicator-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .typing-indicator-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .typing-indicator-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color presets ─────────────────────────────── */

      .typing-indicator-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .typing-indicator-page__color-preset {
        inline-size: 24px;
        block-size: 24px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        padding: 0;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.15s,
                    box-shadow 0.15s;
        box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
      }
      .typing-indicator-page__color-preset:hover {
        transform: scale(1.2);
      }
      .typing-indicator-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Chat styling ──────────────────────────────── */

      .typing-indicator-page__chat-bubble {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 0.75rem 1rem;
        max-inline-size: 80%;
      }

      .typing-indicator-page__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 28px;
        block-size: 28px;
        border-radius: 50%;
        background: var(--brand);
        color: oklch(100% 0 0);
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .typing-indicator-page__hero { padding: 2rem 1.25rem; }
        .typing-indicator-page__title { font-size: 1.75rem; }
        .typing-indicator-page__preview { padding: 1.75rem; }
        .typing-indicator-page__playground { grid-template-columns: 1fr; }
        .typing-indicator-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .typing-indicator-page__tiers { grid-template-columns: 1fr; }
        .typing-indicator-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .typing-indicator-page__hero { padding: 1.5rem 1rem; }
        .typing-indicator-page__title { font-size: 1.5rem; }
        .typing-indicator-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .typing-indicator-page__import-code,
      .typing-indicator-page code,
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

const typingIndicatorProps: PropDef[] = [
  { name: 'avatar', type: 'ReactNode', description: 'Optional avatar element displayed before the bouncing dots.' },
  { name: 'label', type: 'string', default: "'Someone is typing...'", description: 'Visually hidden label announced to screen readers via role="status".' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Controls dot size and spacing. sm = 4px dots, md = 6px dots.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = static, 1 = simple bounce, 2-3 = spring physics with overshoot.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md'

const SIZES: Size[] = ['sm', 'md']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TypingIndicator } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TypingIndicator } from '@annondeveloper/ui-kit'",
  premium: "import { TypingIndicator } from '@annondeveloper/ui-kit/premium'",
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
      size="sm"
      variant="secondary"
      className="typing-indicator-page__copy-btn"
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
    <div className="typing-indicator-page__control-group">
      <span className="typing-indicator-page__control-label">{label}</span>
      <div className="typing-indicator-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`typing-indicator-page__option-btn${opt === value ? ' typing-indicator-page__option-btn--active' : ''}`}
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
    <label className="typing-indicator-page__toggle-label">
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
  size: Size,
  showAvatar: boolean,
  label: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showAvatar && tier !== 'lite') props.push('  avatar={<Avatar />}')
  if (showAvatar && tier === 'lite') props.push('  avatar={<span className="avatar">AI</span>}')
  if (label !== 'Someone is typing...') props.push(`  label="${label}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return props.length === 0
    ? `${importStr}\n\n<TypingIndicator />`
    : `${importStr}\n\n<TypingIndicator\n${props.join('\n')}\n/>`
}

function generateHtmlCode(size: Size): string {
  return `<!-- TypingIndicator — CSS-only -->
<div class="ui-typing-indicator" data-size="${size}" role="status" aria-live="polite">
  <span class="ui-typing-indicator__dots" aria-hidden="true">
    <span class="ui-typing-indicator__dot"></span>
    <span class="ui-typing-indicator__dot"></span>
    <span class="ui-typing-indicator__dot"></span>
  </span>
  <span class="sr-only">Someone is typing...</span>
</div>

<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/typing-indicator.css">`
}

function generateVueCode(tier: Tier, size: Size, showAvatar: boolean): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-lite-typing-indicator" aria-label="Typing">\n    ${showAvatar ? '<span class="ui-lite-typing-indicator__avatar">AI</span>\n    ' : ''}<span class="ui-lite-typing-indicator__dots">\n      <span /><span /><span />\n    </span>\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (showAvatar) attrs.push(':avatar="avatarEl"')
  const attrStr = attrs.length ? `\n    ${attrs.join('\n    ')}\n  ` : ' '
  return `<template>\n  <TypingIndicator${attrStr}/>\n</template>\n\n<script setup>\nimport { TypingIndicator } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div class="ui-lite-typing-indicator" aria-label="Typing">\n  <span class="ui-lite-typing-indicator__dots">\n    <span></span><span></span><span></span>\n  </span>\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Use CSS-only approach -->\n<div\n  class="ui-typing-indicator"\n  data-size="${size}"\n  role="status"\n  aria-live="polite"\n>\n  <span class="ui-typing-indicator__dots" aria-hidden="true">\n    <span class="ui-typing-indicator__dot"></span>\n    <span class="ui-typing-indicator__dot"></span>\n    <span class="ui-typing-indicator__dot"></span>\n  </span>\n</div>\n\n@import '@annondeveloper/ui-kit/css/components/typing-indicator.css';`
}

function generateSvelteCode(tier: Tier, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div class="ui-lite-typing-indicator" aria-label="Typing">\n  <span class="ui-lite-typing-indicator__dots">\n    <span/><span/><span/>\n  </span>\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { TypingIndicator } from '${importPath}';\n</script>\n\n<TypingIndicator${size !== 'md' ? ` size="${size}"` : ''} />`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [showAvatar, setShowAvatar] = useState(false)
  const [label, setLabel] = useState('Someone is typing...')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const reactCode = useMemo(
    () => generateReactCode(tier, size, showAvatar, label, motion),
    [tier, size, showAvatar, label, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(size), [size])
  const vueCode = useMemo(() => generateVueCode(tier, size, showAvatar), [tier, size, showAvatar])
  const angularCode = useMemo(() => generateAngularCode(tier, size), [tier, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size), [tier, size])

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
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const avatar = showAvatar ? <span className="typing-indicator-page__avatar">AI</span> : undefined

  return (
    <section className="typing-indicator-page__section" id="playground">
      <h2 className="typing-indicator-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="typing-indicator-page__section-desc">
        Configure the typing indicator and see the animation in real-time. The generated code updates as you change settings.
      </p>

      <div className="typing-indicator-page__playground">
        <div className="typing-indicator-page__playground-preview">
          <div className="typing-indicator-page__playground-result">
            {tier === 'lite' ? (
              <LiteTypingIndicator avatar={avatar} label={label} />
            ) : (
              <TypingIndicator size={size} avatar={avatar} label={label} motion={motion} />
            )}
          </div>

          <div className="typing-indicator-page__code-tabs">
            <div className="typing-indicator-page__export-row">
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
              {copyStatus && <span className="typing-indicator-page__export-status">{copyStatus}</span>}
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

        <div className="typing-indicator-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="typing-indicator-page__control-group">
            <span className="typing-indicator-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show avatar" checked={showAvatar} onChange={setShowAvatar} />
            </div>
          </div>

          <div className="typing-indicator-page__control-group">
            <span className="typing-indicator-page__control-label">Label (a11y)</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="typing-indicator-page__text-input"
              placeholder="Someone is typing..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TypingIndicatorPage() {
  useStyles('typing-indicator-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
    'borderGlow', 'aurora1', 'aurora2',
  ]

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

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.typing-indicator-page__section')
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
    <div className="typing-indicator-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="typing-indicator-page__hero">
        <h1 className="typing-indicator-page__title">TypingIndicator</h1>
        <p className="typing-indicator-page__desc">
          Animated bouncing dots indicating someone is typing. Used in chat interfaces, collaborative
          editors, and real-time messaging. Features three motion levels from static to spring physics.
        </p>
        <div className="typing-indicator-page__import-row">
          <code className="typing-indicator-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Sizes ─────────────────────────────────────── */}
      <section className="typing-indicator-page__section" id="sizes">
        <h2 className="typing-indicator-page__section-title">
          <a href="#sizes">Sizes</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Two size options: compact (sm) for inline indicators and standard (md) for standalone placement.
        </p>
        <div className="typing-indicator-page__preview">
          <div className="typing-indicator-page__labeled-row">
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator size="sm" />
              <span className="typing-indicator-page__item-label">sm (4px dots)</span>
            </div>
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator size="md" />
              <span className="typing-indicator-page__item-label">md (6px dots)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Motion Levels ──────────────────────────── */}
      <section className="typing-indicator-page__section" id="motion">
        <h2 className="typing-indicator-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Four motion levels from static dots to spring-physics bounce with overshoot. The animation
          cascades: OS preference, component prop, CSS variable, UIProvider, default (3).
        </p>
        <div className="typing-indicator-page__preview">
          <div className="typing-indicator-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="typing-indicator-page__labeled-item">
                <TypingIndicator motion={m} />
                <span className="typing-indicator-page__item-label">motion={m}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`{/* Static — no animation */}\n<TypingIndicator motion={0} />\n\n{/* Simple CSS bounce */}\n<TypingIndicator motion={1} />\n\n{/* Spring physics with overshoot */}\n<TypingIndicator motion={3} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. With Avatar ──────────────────────────────── */}
      <section className="typing-indicator-page__section" id="avatar">
        <h2 className="typing-indicator-page__section-title">
          <a href="#avatar">With Avatar</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Pass any ReactNode as the avatar prop to show who is typing. Works with images, icons, or initials.
        </p>
        <div className="typing-indicator-page__preview">
          <div className="typing-indicator-page__labeled-row">
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator avatar={<span className="typing-indicator-page__avatar">AI</span>} />
              <span className="typing-indicator-page__item-label">initials</span>
            </div>
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator avatar={<span className="typing-indicator-page__avatar"><Icon name="user" size="sm" /></span>} />
              <span className="typing-indicator-page__item-label">icon</span>
            </div>
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator avatar={<span className="typing-indicator-page__avatar" style={{ background: 'var(--status-positive, oklch(72% 0.19 155))' }}>JD</span>} />
              <span className="typing-indicator-page__item-label">custom color</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Chat Integration Example ──────────────── */}
      <section className="typing-indicator-page__section" id="chat-example">
        <h2 className="typing-indicator-page__section-title">
          <a href="#chat-example">Chat Integration</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Common pattern: show the typing indicator in a chat thread while the other party is composing
          a message. It uses role="status" to announce state changes to screen readers.
        </p>
        <div className="typing-indicator-page__preview typing-indicator-page__preview--col" style={{ gap: '0.75rem' }}>
          <div className="typing-indicator-page__chat-bubble" style={{ alignSelf: 'flex-end', background: 'var(--brand)', color: 'oklch(100% 0 0)' }}>
            Hey, can you help me with the API integration?
          </div>
          <div className="typing-indicator-page__chat-bubble" style={{ alignSelf: 'flex-start' }}>
            Sure! Let me pull up the docs.
          </div>
          <div className="typing-indicator-page__chat-bubble" style={{ alignSelf: 'flex-end', background: 'var(--brand)', color: 'oklch(100% 0 0)' }}>
            Perfect, thanks!
          </div>
          <div style={{ alignSelf: 'flex-start', paddingInlineStart: '0.25rem' }}>
            <TypingIndicator
              avatar={<span className="typing-indicator-page__avatar">AI</span>}
              label="Assistant is typing..."
            />
          </div>
        </div>
      </section>

      {/* ── 7. Custom Labels ──────────────────────────── */}
      <section className="typing-indicator-page__section" id="labels">
        <h2 className="typing-indicator-page__section-title">
          <a href="#labels">Custom Labels</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          The label prop provides the screen reader announcement. Customize it to identify who is typing
          or the context of the activity.
        </p>
        <div className="typing-indicator-page__preview">
          <div className="typing-indicator-page__labeled-row">
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator label="Alice is typing..." />
              <span className="typing-indicator-page__item-label">"Alice is typing..."</span>
            </div>
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator label="AI is thinking..." />
              <span className="typing-indicator-page__item-label">"AI is thinking..."</span>
            </div>
            <div className="typing-indicator-page__labeled-item">
              <TypingIndicator label="3 people are typing..." />
              <span className="typing-indicator-page__item-label">"3 people are typing..."</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="typing-indicator-page__section" id="tiers">
        <h2 className="typing-indicator-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Choose the right balance of features and bundle size for your typing indicator.
        </p>

        <div className="typing-indicator-page__tiers">
          {/* Lite */}
          <div
            className={`typing-indicator-page__tier-card${tier === 'lite' ? ' typing-indicator-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="typing-indicator-page__tier-header">
              <span className="typing-indicator-page__tier-name">Lite</span>
              <span className="typing-indicator-page__tier-size">~0.15 KB</span>
            </div>
            <p className="typing-indicator-page__tier-desc">
              Static three-dot indicator with CSS-only animations.
              No motion levels, no size prop. Basic avatar support.
            </p>
            <div className="typing-indicator-page__tier-import">
              import {'{'} TypingIndicator {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="typing-indicator-page__tier-preview">
              <LiteTypingIndicator />
            </div>
            <div className="typing-indicator-page__size-breakdown">
              <div className="typing-indicator-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.15 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.85 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`typing-indicator-page__tier-card${tier === 'standard' ? ' typing-indicator-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="typing-indicator-page__tier-header">
              <span className="typing-indicator-page__tier-name">Standard</span>
              <span className="typing-indicator-page__tier-size">~0.8 KB</span>
            </div>
            <p className="typing-indicator-page__tier-desc">
              Full-featured with motion levels, size variants, avatar slot,
              custom label, spring physics animation, and forced-colors support.
            </p>
            <div className="typing-indicator-page__tier-import">
              import {'{'} TypingIndicator {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="typing-indicator-page__tier-preview">
              <TypingIndicator />
            </div>
            <div className="typing-indicator-page__size-breakdown">
              <div className="typing-indicator-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>1.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`typing-indicator-page__tier-card${tier === 'premium' ? ' typing-indicator-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="typing-indicator-page__tier-header">
              <span className="typing-indicator-page__tier-name">Premium</span>
              <span className="typing-indicator-page__tier-size">~1.4 KB</span>
            </div>
            <p className="typing-indicator-page__tier-desc">
              Everything in Standard plus glow pulse effect, wave animation,
              color-shifting dots, and entrance/exit transitions.
            </p>
            <div className="typing-indicator-page__tier-import">
              import {'{'} TypingIndicator {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="typing-indicator-page__tier-preview">
              <TypingIndicator />
            </div>
            <div className="typing-indicator-page__size-breakdown">
              <div className="typing-indicator-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Brand Color ───────────────────────────────── */}
      <section className="typing-indicator-page__section" id="brand-color">
        <h2 className="typing-indicator-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          Pick a brand color to see the page accents update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={COLOR_PRESETS.map(p => p.hex)}
          />
          <div className="typing-indicator-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`typing-indicator-page__color-preset${brandColor === p.hex ? ' typing-indicator-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 10. Props API ───────────────────────────────── */}
      <section className="typing-indicator-page__section" id="props">
        <h2 className="typing-indicator-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          All props accepted by TypingIndicator. It also spreads any native {'<div>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={typingIndicatorProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="typing-indicator-page__section" id="accessibility">
        <h2 className="typing-indicator-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="typing-indicator-page__section-desc">
          TypingIndicator provides accessible status updates with proper ARIA semantics.
        </p>
        <Card variant="default" padding="md">
          <ul className="typing-indicator-page__a11y-list">
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status role:</strong> Uses <code className="typing-indicator-page__a11y-key">role="status"</code> for polite screen reader announcements.
              </span>
            </li>
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> <code className="typing-indicator-page__a11y-key">aria-live="polite"</code> announces when typing starts.
              </span>
            </li>
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden dots:</strong> Visual dots are <code className="typing-indicator-page__a11y-key">aria-hidden="true"</code>. The label provides the semantic meaning.
              </span>
            </li>
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Animation stops entirely with <code className="typing-indicator-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Dots and borders use system colors in <code className="typing-indicator-page__a11y-key">forced-colors: active</code>.
              </span>
            </li>
            <li className="typing-indicator-page__a11y-item">
              <span className="typing-indicator-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Visually hidden label:</strong> Uses CSS clip technique so the label is accessible but not visible.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
