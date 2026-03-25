'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TextReveal } from '@ui/domain/text-reveal'
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
    @scope (.text-reveal-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: text-reveal-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .text-reveal-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .text-reveal-page__hero::before {
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
        animation: text-reveal-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes text-reveal-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .text-reveal-page__hero::before { animation: none; }
      }

      .text-reveal-page__title {
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

      .text-reveal-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .text-reveal-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .text-reveal-page__import-code {
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

      .text-reveal-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .text-reveal-page__section {
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
        animation: text-reveal-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes text-reveal-section-reveal {
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
        .text-reveal-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .text-reveal-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .text-reveal-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .text-reveal-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .text-reveal-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .text-reveal-page__preview {
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

      .text-reveal-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .text-reveal-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .text-reveal-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .text-reveal-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .text-reveal-page__playground {
          grid-template-columns: 1fr;
        }
        .text-reveal-page__playground-controls {
          position: static !important;
        }
      }

      @container text-reveal-page (max-width: 680px) {
        .text-reveal-page__playground {
          grid-template-columns: 1fr;
        }
        .text-reveal-page__playground-controls {
          position: static !important;
        }
      }

      .text-reveal-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .text-reveal-page__playground-result {
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .text-reveal-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .text-reveal-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .text-reveal-page__playground-controls {
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

      .text-reveal-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .text-reveal-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .text-reveal-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .text-reveal-page__option-btn {
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
      .text-reveal-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .text-reveal-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .text-reveal-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .text-reveal-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .text-reveal-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .text-reveal-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .text-reveal-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .text-reveal-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .text-reveal-page__tier-card {
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

      .text-reveal-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .text-reveal-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .text-reveal-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .text-reveal-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .text-reveal-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .text-reveal-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .text-reveal-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .text-reveal-page__tier-import {
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

      .text-reveal-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .text-reveal-page__code-tabs {
        margin-block-start: 1rem;
      }

      .text-reveal-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .text-reveal-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Color picker ──────────────────────────────── */

      .text-reveal-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .text-reveal-page__color-preset {
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
      .text-reveal-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .text-reveal-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── A11y list ──────────────────────────────────── */

      .text-reveal-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .text-reveal-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .text-reveal-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .text-reveal-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .text-reveal-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .text-reveal-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .text-reveal-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .text-reveal-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .text-reveal-page__hero {
          padding: 2rem 1.25rem;
        }

        .text-reveal-page__title {
          font-size: 1.75rem;
        }

        .text-reveal-page__preview {
          padding: 1.75rem;
        }

        .text-reveal-page__playground {
          grid-template-columns: 1fr;
        }

        .text-reveal-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .text-reveal-page__labeled-row {
          gap: 1rem;
        }

        .text-reveal-page__tiers {
          grid-template-columns: 1fr;
        }

        .text-reveal-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .text-reveal-page__hero {
          padding: 1.5rem 1rem;
        }

        .text-reveal-page__title {
          font-size: 1.5rem;
        }

        .text-reveal-page__preview {
          padding: 1rem;
        }

        .text-reveal-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .text-reveal-page__title {
          font-size: 4rem;
        }

        .text-reveal-page__preview {
          padding: 3.5rem;
        }

        .text-reveal-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .text-reveal-page__import-code,
      .text-reveal-page code,
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

const textRevealProps: PropDef[] = [
  { name: 'text', type: 'string', description: 'The text to reveal character-by-character.' },
  { name: 'trigger', type: "'mount' | 'inView'", default: "'mount'", description: 'When to start the reveal animation. Mount starts immediately, inView waits for scroll.' },
  { name: 'speed', type: 'number', default: '30', description: 'Characters revealed per second. Higher values create faster reveals.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0 = instant reveal, 3 = full character animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TriggerType = 'mount' | 'inView'

const TRIGGERS: TriggerType[] = ['mount', 'inView']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { TextReveal } from '@annondeveloper/ui-kit/lite'",
  standard: "import { TextReveal } from '@annondeveloper/ui-kit'",
  premium: "import { TextReveal } from '@annondeveloper/ui-kit/premium'",
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
      className="text-reveal-page__copy-btn"
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
    <div className="text-reveal-page__control-group">
      <span className="text-reveal-page__control-label">{label}</span>
      <div className="text-reveal-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`text-reveal-page__option-btn${opt === value ? ' text-reveal-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  text: string,
  trigger: TriggerType,
  speed: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  props.push(`  text="${text}"`)
  if (trigger !== 'mount') props.push(`  trigger="${trigger}"`)
  if (speed !== 30) props.push(`  speed={${speed}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = `<TextReveal\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(text: string): string {
  return `<!-- TextReveal is a JS-powered component -->
<!-- For non-React frameworks, use the CSS-only approach: -->
<div class="ui-text-reveal" aria-label="${text}" role="img">
  ${Array.from(text).map(c => c === ' '
    ? '<span class="ui-text-reveal--char" data-revealed="true" data-space="true" aria-hidden="true">&nbsp;</span>'
    : `<span class="ui-text-reveal--char" data-revealed="true" aria-hidden="true">${c}</span>`
  ).join('\n  ')}
</div>

<!-- Import component CSS -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/text-reveal.css">`
}

function generateVueCode(tier: Tier, text: string, trigger: TriggerType, speed: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  text="${text}"`]
  if (trigger !== 'mount') attrs.push(`  trigger="${trigger}"`)
  if (speed !== 30) attrs.push(`  :speed="${speed}"`)

  return `<template>\n  <TextReveal\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { TextReveal } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, text: string, trigger: TriggerType): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — Use the CSS-only approach or React wrapper -->
<div
  class="ui-text-reveal"
  aria-label="${text}"
  role="img"
>
  <!-- Characters rendered by the component JS -->
</div>

/* Import component CSS */
@import '${importPath}/css/components/text-reveal.css';`
}

function generateSvelteCode(tier: Tier, text: string, trigger: TriggerType, speed: number): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  text="${text}"`]
  if (trigger !== 'mount') attrs.push(`  trigger="${trigger}"`)
  if (speed !== 30) attrs.push(`  speed={${speed}}`)

  return `<script>\n  import { TextReveal } from '${importPath}';\n</script>\n\n<TextReveal\n${attrs.join('\n')}\n/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [text, setText] = useState('Every character tells a story.')
  const [trigger, setTrigger] = useState<TriggerType>('mount')
  const [speed, setSpeed] = useState(30)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')
  const [replayKey, setReplayKey] = useState(0)

  const reactCode = useMemo(
    () => generateReactCode(tier, text, trigger, speed, motion),
    [tier, text, trigger, speed, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(text),
    [text],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, text, trigger, speed),
    [tier, text, trigger, speed],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, text, trigger),
    [tier, text, trigger],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, text, trigger, speed),
    [tier, text, trigger, speed],
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
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="text-reveal-page__section" id="playground">
      <h2 className="text-reveal-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="text-reveal-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="text-reveal-page__playground">
        <div className="text-reveal-page__playground-preview">
          <div className="text-reveal-page__playground-result">
            <span style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)', fontWeight: 700, position: 'relative', maxInlineSize: '40ch', textAlign: 'center' }}>
              <TextReveal
                key={replayKey}
                text={text}
                trigger={trigger}
                speed={speed}
                motion={motion}
              />
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              size="xs"
              variant="secondary"
              icon={<Icon name="refresh" size="sm" />}
              onClick={() => setReplayKey(k => k + 1)}
            >
              Replay
            </Button>
          </div>

          <div className="text-reveal-page__code-tabs">
            <div className="text-reveal-page__export-row">
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
              {copyStatus && <span className="text-reveal-page__export-status">{copyStatus}</span>}
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

        <div className="text-reveal-page__playground-controls">
          <OptionGroup label="Trigger" options={TRIGGERS} value={trigger} onChange={setTrigger} />
          <OptionGroup
            label="Speed (chars/sec)"
            options={['10', '20', '30', '50', '80'] as const}
            value={String(speed) as '10' | '20' | '30' | '50' | '80'}
            onChange={v => setSpeed(Number(v))}
          />
          <OptionGroup
            label="Motion"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <div className="text-reveal-page__control-group">
            <span className="text-reveal-page__control-label">Text</span>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              className="text-reveal-page__text-input"
              placeholder="Text to reveal..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TextRevealPage() {
  useStyles('text-reveal-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
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

  // Scroll reveal for sections — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.text-reveal-page__section')
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
    <div className="text-reveal-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="text-reveal-page__hero">
        <h1 className="text-reveal-page__title">TextReveal</h1>
        <p className="text-reveal-page__desc">
          Character-by-character reveal animation with translateY entrance. Each character fades in
          and slides up sequentially, creating a typewriter-like effect with smooth CSS transitions.
        </p>
        <div className="text-reveal-page__import-row">
          <code className="text-reveal-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Trigger Modes ───────────────────────────── */}
      <section className="text-reveal-page__section" id="triggers">
        <h2 className="text-reveal-page__section-title">
          <a href="#triggers">Trigger Modes</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Two trigger modes control when the reveal begins. Mount starts immediately on render,
          and inView uses IntersectionObserver to start when the element scrolls into the viewport.
        </p>
        <div className="text-reveal-page__preview text-reveal-page__preview--col" style={{ gap: '2rem' }}>
          <div className="text-reveal-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <TextReveal text="Reveals immediately on mount" trigger="mount" speed={30} />
            </span>
            <span className="text-reveal-page__item-label">trigger="mount"</span>
          </div>
          <div className="text-reveal-page__labeled-item" style={{ alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <TextReveal text="Reveals when scrolled into view" trigger="inView" speed={30} />
            </span>
            <span className="text-reveal-page__item-label">trigger="inView"</span>
          </div>
        </div>
      </section>

      {/* ── 4. Speed Variations ─────────────────────────── */}
      <section className="text-reveal-page__section" id="speeds">
        <h2 className="text-reveal-page__section-title">
          <a href="#speeds">Speed Variations</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          The speed prop controls characters revealed per second. Low values create a slow,
          dramatic reveal. High values produce a rapid typewriter effect.
        </p>
        <div className="text-reveal-page__preview text-reveal-page__preview--col" style={{ gap: '1.5rem' }}>
          {[10, 20, 30, 50, 80].map(s => (
            <div key={s} className="text-reveal-page__labeled-item" style={{ alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                <TextReveal text="Speed controls the reveal pace" trigger="mount" speed={s} />
              </span>
              <span className="text-reveal-page__item-label">speed={s} ({s < 20 ? 'slow' : s < 40 ? 'default' : s < 60 ? 'fast' : 'rapid'})</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Motion Levels ───────────────────────────── */}
      <section className="text-reveal-page__section" id="motion">
        <h2 className="text-reveal-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Motion intensity cascades from OS preference through component prop. Level 0 shows
          all text instantly. Levels 1-3 progressively enhance the reveal animation.
        </p>
        <div className="text-reveal-page__preview text-reveal-page__preview--col" style={{ gap: '1.5rem' }}>
          {([0, 1, 2, 3] as const).map(m => (
            <div key={m} className="text-reveal-page__labeled-item" style={{ alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                <TextReveal text="Motion level demonstration" trigger="mount" speed={30} motion={m} />
              </span>
              <span className="text-reveal-page__item-label">motion={m} {m === 0 ? '(instant)' : m === 3 ? '(full animation)' : ''}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Long Text ──────────────────────────────── */}
      <section className="text-reveal-page__section" id="long-text">
        <h2 className="text-reveal-page__section-title">
          <a href="#long-text">Long Text Reveal</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          TextReveal handles multi-line content gracefully. Spaces are rendered with explicit
          width to prevent layout shift. The animation scales naturally with content length.
        </p>
        <div className="text-reveal-page__preview text-reveal-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Short text</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              <TextReveal text="Hello world" trigger="mount" speed={20} />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Paragraph text</span>
            <span style={{ fontSize: '1rem', lineHeight: 1.6, maxInlineSize: '50ch' }}>
              <TextReveal
                text="The quick brown fox jumps over the lazy dog. This sentence contains every letter of the English alphabet and demonstrates how TextReveal handles longer content."
                trigger="mount"
                speed={40}
              />
            </span>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<TextReveal\n  text="The quick brown fox jumps over the lazy dog."\n  speed={40}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="text-reveal-page__section" id="tiers">
        <h2 className="text-reveal-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier provides static
          text display, Standard adds the full reveal animation engine, and Premium adds
          enhanced visual effects with spring physics and glow trails.
        </p>

        <div className="text-reveal-page__tiers">
          {/* Lite */}
          <div
            className={`text-reveal-page__tier-card${tier === 'lite' ? ' text-reveal-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="text-reveal-page__tier-header">
              <span className="text-reveal-page__tier-name">Lite</span>
              <span className="text-reveal-page__tier-size">~0.2 KB</span>
            </div>
            <p className="text-reveal-page__tier-desc">
              Static text display with no animation. Renders the full text immediately.
              Useful for SSR or contexts where animation is not needed.
            </p>
            <div className="text-reveal-page__tier-import">
              import {'{'} TextReveal {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="text-reveal-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Static text display
              </span>
            </div>
            <div className="text-reveal-page__size-breakdown">
              <div className="text-reveal-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`text-reveal-page__tier-card${tier === 'standard' ? ' text-reveal-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="text-reveal-page__tier-header">
              <span className="text-reveal-page__tier-name">Standard</span>
              <span className="text-reveal-page__tier-size">~1.6 KB</span>
            </div>
            <p className="text-reveal-page__tier-desc">
              Full character-by-character reveal animation with mount and inView triggers.
              Configurable speed, smooth CSS transitions, and motion level support.
            </p>
            <div className="text-reveal-page__tier-import">
              import {'{'} TextReveal {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="text-reveal-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                <TextReveal text="Standard tier" trigger="mount" speed={25} />
              </span>
            </div>
            <div className="text-reveal-page__size-breakdown">
              <div className="text-reveal-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`text-reveal-page__tier-card${tier === 'premium' ? ' text-reveal-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="text-reveal-page__tier-header">
              <span className="text-reveal-page__tier-name">Premium</span>
              <span className="text-reveal-page__tier-size">~2.6 KB</span>
            </div>
            <p className="text-reveal-page__tier-desc">
              Everything in Standard plus spring physics on character entrance, subtle glow
              trail effect, and OKLCH color wash that sweeps across revealed characters.
            </p>
            <div className="text-reveal-page__tier-import">
              import {'{'} TextReveal {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="text-reveal-page__tier-preview">
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                <TextReveal text="Premium tier" trigger="mount" speed={25} />
              </span>
            </div>
            <div className="text-reveal-page__size-breakdown">
              <div className="text-reveal-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.6 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ────────────────────────────── */}
      <section className="text-reveal-page__section" id="brand-color">
        <h2 className="text-reveal-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Pick a brand color to see the page update in real-time. The OKLCH-based theme
          system generates derived colors automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="text-reveal-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`text-reveal-page__color-preset${brandColor === p.hex ? ' text-reveal-page__color-preset--active' : ''}`}
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

      {/* ── 9. Use Cases ──────────────────────────────── */}
      <section className="text-reveal-page__section" id="use-cases">
        <h2 className="text-reveal-page__section-title">
          <a href="#use-cases">Use Cases</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Real-world scenarios where TextReveal adds cinematic impact and engagement.
        </p>
        <div className="text-reveal-page__preview text-reveal-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Hero headline</span>
            <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <TextReveal text="Design without limits" trigger="mount" speed={25} />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Scroll-triggered quote</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 500, fontStyle: 'italic', maxInlineSize: '45ch', lineHeight: 1.5 }}>
              <TextReveal
                text="Simplicity is the ultimate sophistication."
                trigger="inView"
                speed={20}
              />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Feature description</span>
            <span style={{ fontSize: '1rem', lineHeight: 1.6, maxInlineSize: '50ch' }}>
              <TextReveal
                text="Zero-dependency components with physics-based animations, OKLCH color system, and Aurora Fluid design identity."
                trigger="mount"
                speed={35}
              />
            </span>
          </div>
        </div>
      </section>

      {/* ── 10. Props API ──────────────────────────────── */}
      <section className="text-reveal-page__section" id="props">
        <h2 className="text-reveal-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          All props accepted by TextReveal. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={textRevealProps} />
        </Card>
      </section>

      {/* ── 11. Accessibility ──────────────────────────── */}
      <section className="text-reveal-page__section" id="accessibility">
        <h2 className="text-reveal-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          Designed with screen reader support and motion sensitivity in mind.
        </p>
        <Card variant="default" padding="md">
          <ul className="text-reveal-page__a11y-list">
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Screen reader:</strong> Uses <code className="text-reveal-page__a11y-key">aria-label</code> with the full text so screen readers announce the complete content, not individual characters.
              </span>
            </li>
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Marked as <code className="text-reveal-page__a11y-key">role="img"</code> to indicate the progressive reveal is a decorative visual effect.
              </span>
            </li>
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden characters:</strong> Each character span uses <code className="text-reveal-page__a11y-key">aria-hidden="true"</code> to prevent letter-by-letter reading.
              </span>
            </li>
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="text-reveal-page__a11y-key">prefers-reduced-motion</code> by making all characters immediately visible without animation.
              </span>
            </li>
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> All characters are fully visible in print media regardless of reveal state.
              </span>
            </li>
            <li className="text-reveal-page__a11y-item">
              <span className="text-reveal-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Whitespace handling:</strong> Spaces use explicit width via <code className="text-reveal-page__a11y-key">data-space</code> attribute to prevent layout shift.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 12. Source ──────────────────────────────────── */}
      <section className="text-reveal-page__section" id="source">
        <h2 className="text-reveal-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="text-reveal-page__section-desc">
          View the component source code on GitHub.
        </p>
        <a
          className="text-reveal-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/text-reveal.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="github" size="sm" />
          src/domain/text-reveal.tsx
        </a>
      </section>
    </div>
  )
}
