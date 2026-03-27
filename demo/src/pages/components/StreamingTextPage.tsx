'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { StreamingText } from '@ui/domain/streaming-text'
import { StreamingText as LiteStreamingText } from '@ui/lite/streaming-text'
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
    @scope (.streaming-text-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: streaming-text-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .streaming-text-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .streaming-text-page__hero::before {
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
        animation: streaming-text-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes streaming-text-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .streaming-text-page__hero::before { animation: none; }
      }

      .streaming-text-page__title {
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

      .streaming-text-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .streaming-text-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .streaming-text-page__import-code {
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

      .streaming-text-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .streaming-text-page__section {
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
        animation: streaming-text-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes streaming-text-section-reveal {
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
        .streaming-text-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .streaming-text-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .streaming-text-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .streaming-text-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .streaming-text-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .streaming-text-page__preview {
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

      .streaming-text-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .streaming-text-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .streaming-text-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @container streaming-text-page (max-width: 680px) {
        .streaming-text-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .streaming-text-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .streaming-text-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        align-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .streaming-text-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .streaming-text-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .streaming-text-page__playground-controls {
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

      .streaming-text-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .streaming-text-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .streaming-text-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .streaming-text-page__option-btn {
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
      .streaming-text-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .streaming-text-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .streaming-text-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .streaming-text-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .streaming-text-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .streaming-text-page__textarea {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.5rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
        min-block-size: 80px;
        resize: vertical;
      }
      .streaming-text-page__textarea:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .streaming-text-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .streaming-text-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .streaming-text-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .streaming-text-page__tier-card {
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

      .streaming-text-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .streaming-text-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .streaming-text-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .streaming-text-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .streaming-text-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .streaming-text-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .streaming-text-page__tier-import {
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

      .streaming-text-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
        min-block-size: 3rem;
        align-items: center;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .streaming-text-page__code-tabs {
        margin-block-start: 1rem;
      }

      .streaming-text-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .streaming-text-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .streaming-text-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .streaming-text-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .streaming-text-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .streaming-text-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown ─────────────────────────────── */

      .streaming-text-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .streaming-text-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Color presets ─────────────────────────────── */

      .streaming-text-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .streaming-text-page__color-preset {
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
      .streaming-text-page__color-preset:hover {
        transform: scale(1.2);
      }
      .streaming-text-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Chat bubble styling ────────────────────────── */

      .streaming-text-page__chat-bubble {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 1rem 1.25rem;
        max-inline-size: 80%;
        position: relative;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .streaming-text-page__hero { padding: 2rem 1.25rem; }
        .streaming-text-page__title { font-size: 1.75rem; }
        .streaming-text-page__preview { padding: 1.75rem; }
        .streaming-text-page__playground { grid-template-columns: 1fr; }
        .streaming-text-page__playground-result { padding: 1.5rem; overflow-x: auto;
        min-block-size: 150px; }
        .streaming-text-page__tiers { grid-template-columns: 1fr; }
        .streaming-text-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .streaming-text-page__hero { padding: 1.5rem 1rem; }
        .streaming-text-page__title { font-size: 1.5rem; }
        .streaming-text-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .streaming-text-page__import-code,
      .streaming-text-page code,
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

const streamingTextProps: PropDef[] = [
  { name: 'text', type: 'string', description: 'The text content to display. Supports markdown-style code blocks with triple backticks.' },
  { name: 'streaming', type: 'boolean', default: 'false', description: 'When true, shows a blinking cursor and sets aria-busy. Triggers onComplete and cursor fade when toggled off.' },
  { name: 'showCursor', type: 'boolean', description: 'Override cursor visibility. Defaults to matching the streaming prop value.' },
  { name: 'speed', type: 'number', description: 'Characters revealed per animation frame for typewriter effect. Omit for instant display.' },
  { name: 'onComplete', type: '() => void', description: 'Called when streaming transitions from true to false.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. 0 = no cursor blink, 1-3 = animated cursor.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { StreamingText } from '@annondeveloper/ui-kit/lite'",
  standard: "import { StreamingText } from '@annondeveloper/ui-kit'",
  premium: "import { StreamingText } from '@annondeveloper/ui-kit/premium'",
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

const SAMPLE_TEXTS = {
  plain: 'The quick brown fox jumps over the lazy dog. This is a demonstration of the StreamingText component with smooth character-by-character reveal.',
  code: 'Here is a code example:\n\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name}!`\n}\n\nconsole.log(greet("World"))\n```\n\nThe function above demonstrates basic TypeScript typing.',
  long: 'Artificial intelligence continues to reshape how we build software. Modern language models can understand context, generate code, and assist with complex reasoning tasks.\n\nKey developments include:\n- Transformer architectures achieving human-level performance\n- Real-time streaming responses for better UX\n- Multi-modal models processing text, images, and audio\n\nThe future of development is collaborative: humans and AI working together to build better software, faster.',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="streaming-text-page__copy-btn"
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
    <div className="streaming-text-page__control-group">
      <span className="streaming-text-page__control-label">{label}</span>
      <div className="streaming-text-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`streaming-text-page__option-btn${opt === value ? ' streaming-text-page__option-btn--active' : ''}`}
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
    <label className="streaming-text-page__toggle-label">
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
  streaming: boolean,
  showCursor: boolean,
  speed: number | undefined,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = ['  text={text}']
  if (streaming) props.push('  streaming')
  if (showCursor) props.push('  showCursor')
  if (speed) props.push(`  speed={${speed}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}\n\nconst [text, setText] = useState('')\nconst [streaming, setStreaming] = useState(false)\n\n<StreamingText\n${props.join('\n')}\n/>`
}

function generateHtmlCode(): string {
  return `<!-- StreamingText — CSS-only static fallback -->
<div class="ui-streaming-text" aria-live="polite">
  <div class="ui-streaming-text__content">
    Your text content here...
  </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/streaming-text.css">`
}

function generateVueCode(tier: Tier, streaming: boolean, speed: number | undefined): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-lite-streaming-text">{{ text }}</div>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nconst text = ref('Hello, world!')\n</script>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [':text="text"']
  if (streaming) attrs.push(':streaming="true"')
  if (speed) attrs.push(`:speed="${speed}"`)
  return `<template>\n  <StreamingText\n    ${attrs.join('\n    ')}\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { StreamingText } from '${importPath}'\nconst text = ref('Hello, world!')\n</script>`
}

function generateAngularCode(tier: Tier): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div class="ui-lite-streaming-text">{{ text }}</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Use CSS-only approach or React wrapper -->\n<div\n  class="ui-streaming-text"\n  [attr.aria-live]="'polite'"\n  [attr.aria-busy]="streaming"\n>\n  <div class="ui-streaming-text__content">{{ text }}</div>\n</div>\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/streaming-text.css';`
}

function generateSvelteCode(tier: Tier, streaming: boolean): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div class="ui-lite-streaming-text">{text}</div>\n\n<script>\n  let text = 'Hello, world!'\n</script>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { StreamingText } from '${importPath}';\n  let text = 'Hello, world!'\n</script>\n\n<StreamingText\n  {text}\n  ${streaming ? 'streaming' : ''}\n/>`
}

// ─── Streaming Simulator ─────────────────────────────────────────────────────

function useStreamingSimulator(fullText: string, charsPerTick = 3) {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(0)

  const start = useCallback(() => {
    setText('')
    indexRef.current = 0
    setStreaming(true)
    intervalRef.current = setInterval(() => {
      indexRef.current += charsPerTick
      if (indexRef.current >= fullText.length) {
        setText(fullText)
        setStreaming(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setText(fullText.slice(0, indexRef.current))
      }
    }, 30)
  }, [fullText, charsPerTick])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStreaming(false)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { text, streaming, start, stop }
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [sampleKey, setSampleKey] = useState<'plain' | 'code' | 'long'>('plain')
  const [showCursor, setShowCursor] = useState(true)
  const [speed, setSpeed] = useState<number | undefined>(undefined)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const sim = useStreamingSimulator(SAMPLE_TEXTS[sampleKey], 2)

  const reactCode = useMemo(
    () => generateReactCode(tier, sim.streaming, showCursor, speed, motion),
    [tier, sim.streaming, showCursor, speed, motion],
  )
  const htmlCode = useMemo(() => generateHtmlCode(), [])
  const vueCode = useMemo(() => generateVueCode(tier, sim.streaming, speed), [tier, sim.streaming, speed])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, sim.streaming), [tier, sim.streaming])

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
    <section className="streaming-text-page__section" id="playground">
      <h2 className="streaming-text-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="streaming-text-page__section-desc">
        Simulate streaming text and tweak props in real-time. Press "Start Streaming" to see the effect.
      </p>

      <div className="streaming-text-page__playground">
        <div className="streaming-text-page__playground-preview">
          <div className="streaming-text-page__playground-result">
            {tier === 'lite' ? (
              <LiteStreamingText text={sim.text || 'Press "Start Streaming" to begin...'} style={{ position: 'relative', zIndex: 1 }} />
            ) : (
              <StreamingText
                text={sim.text || 'Press "Start Streaming" to begin...'}
                streaming={sim.streaming}
                showCursor={showCursor}
                speed={speed}
                motion={motion}
                style={{ position: 'relative', zIndex: 1 }}
              />
            )}
          </div>

          <div className="streaming-text-page__code-tabs">
            <div className="streaming-text-page__export-row">
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
              {copyStatus && <span className="streaming-text-page__export-status">{copyStatus}</span>}
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

        <div className="streaming-text-page__playground-controls">
          <div className="streaming-text-page__control-group">
            <span className="streaming-text-page__control-label">Actions</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="sm" variant="primary" onClick={sim.start} disabled={sim.streaming}>
                <Icon name="zap" size="sm" /> Start
              </Button>
              <Button size="sm" variant="secondary" onClick={sim.stop} disabled={!sim.streaming}>
                Stop
              </Button>
            </div>
          </div>

          <OptionGroup
            label="Sample Text"
            options={['plain', 'code', 'long'] as const}
            value={sampleKey}
            onChange={setSampleKey}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          {tier !== 'lite' && (
            <div className="streaming-text-page__control-group">
              <span className="streaming-text-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Show cursor" checked={showCursor} onChange={setShowCursor} />
              </div>
            </div>
          )}

          <div className="streaming-text-page__control-group">
            <span className="streaming-text-page__control-label">Typewriter speed</span>
            <input
              type="number"
              value={speed ?? ''}
              placeholder="(none)"
              min={1}
              max={20}
              onChange={e => setSpeed(e.target.value ? Number(e.target.value) : undefined)}
              className="streaming-text-page__text-input"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StreamingTextPage() {
  useStyles('streaming-text-page', pageStyles)

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
    const sections = document.querySelectorAll('.streaming-text-page__section')
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

  const chatSim = useStreamingSimulator(
    'I can help you with that! Here is a quick example of how to set up a REST API endpoint using Express:\n\n```typescript\nimport express from "express"\n\nconst app = express()\n\napp.get("/api/users", (req, res) => {\n  res.json([{ id: 1, name: "Alice" }])\n})\n\napp.listen(3000)\n```\n\nThis creates a simple GET endpoint that returns a JSON array of users.',
    2,
  )

  return (
    <div className="streaming-text-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="streaming-text-page__hero">
        <h1 className="streaming-text-page__title">StreamingText</h1>
        <p className="streaming-text-page__desc">
          Real-time text display with blinking cursor, code block parsing, typewriter effect,
          and streaming state management. Built for AI chat interfaces, live documentation,
          and progressive content reveal.
        </p>
        <div className="streaming-text-page__import-row">
          <code className="streaming-text-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. Streaming States ────────────────────────── */}
      <section className="streaming-text-page__section" id="streaming-states">
        <h2 className="streaming-text-page__section-title">
          <a href="#streaming-states">Streaming States</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          The component tracks streaming lifecycle: idle, actively streaming with cursor,
          and completed with cursor fade-out. The onComplete callback fires when streaming ends.
        </p>
        <div className="streaming-text-page__preview streaming-text-page__preview--col" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>idle (no cursor)</span>
            <StreamingText text="This text is fully loaded and static." />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>streaming (blinking cursor)</span>
            <StreamingText text="This text appears to be actively streaming..." streaming showCursor />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>cursor only (no streaming)</span>
            <StreamingText text="Static text with a visible cursor." showCursor />
          </div>
        </div>
      </section>

      {/* ── 4. Code Block Parsing ──────────────────────── */}
      <section className="streaming-text-page__section" id="code-blocks">
        <h2 className="streaming-text-page__section-title">
          <a href="#code-blocks">Code Block Parsing</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          Triple-backtick fenced code blocks are automatically detected and rendered with
          syntax-appropriate styling. Language labels are displayed when specified.
        </p>
        <div className="streaming-text-page__preview streaming-text-page__preview--col">
          <StreamingText
            text={'Here is a function:\n\n```typescript\nfunction fibonacci(n: number): number {\n  if (n <= 1) return n\n  return fibonacci(n - 1) + fibonacci(n - 2)\n}\n```\n\nAnd in Python:\n\n```python\ndef fibonacci(n: int) -> int:\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n```\n\nBoth implementations use the same recursive approach.'}
          />
        </div>
      </section>

      {/* ── 5. Typewriter Effect ──────────────────────── */}
      <section className="streaming-text-page__section" id="typewriter">
        <h2 className="streaming-text-page__section-title">
          <a href="#typewriter">Typewriter Effect</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          Set the speed prop to reveal characters progressively using requestAnimationFrame.
          Higher values reveal more characters per frame for faster typing.
        </p>
        <div className="streaming-text-page__preview streaming-text-page__preview--col" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>speed=1 (slow)</span>
            <StreamingText text="Each character appears one at a time, creating a deliberate typing effect." speed={1} showCursor />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>speed=3 (medium)</span>
            <StreamingText text="Three characters per frame gives a natural reading pace for most content." speed={3} showCursor />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="streaming-text-page__item-label" style={{ alignSelf: 'flex-start' }}>speed=10 (fast)</span>
            <StreamingText text="Ten characters per frame creates a rapid-fire reveal that fills quickly." speed={10} showCursor />
          </div>
        </div>
      </section>

      {/* ── 6. Chat Interface Example ──────────────────── */}
      <section className="streaming-text-page__section" id="chat-example">
        <h2 className="streaming-text-page__section-title">
          <a href="#chat-example">Chat Interface Example</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          StreamingText is designed for AI chat interfaces. Here is a simulated conversation
          with streaming response and code block output.
        </p>
        <div className="streaming-text-page__preview streaming-text-page__preview--col" style={{ gap: '1rem' }}>
          <div className="streaming-text-page__chat-bubble" style={{ alignSelf: 'flex-end', background: 'var(--brand)', color: 'oklch(100% 0 0)' }}>
            How do I create a REST API with Express?
          </div>
          <div className="streaming-text-page__chat-bubble" style={{ alignSelf: 'flex-start' }}>
            <StreamingText
              text={chatSim.text || 'Click "Simulate Response" below to see the streaming effect.'}
              streaming={chatSim.streaming}
              showCursor={chatSim.streaming}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
            <Button size="sm" variant="primary" onClick={chatSim.start} disabled={chatSim.streaming}>
              <Icon name="zap" size="sm" /> Simulate Response
            </Button>
            <Button size="sm" variant="ghost" onClick={chatSim.stop} disabled={!chatSim.streaming}>
              Stop
            </Button>
          </div>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="streaming-text-page__section" id="tiers">
        <h2 className="streaming-text-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          Choose the right balance of features and bundle size for your streaming text needs.
        </p>

        <div className="streaming-text-page__tiers">
          {/* Lite */}
          <div
            className={`streaming-text-page__tier-card${tier === 'lite' ? ' streaming-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="streaming-text-page__tier-header">
              <span className="streaming-text-page__tier-name">Lite</span>
              <span className="streaming-text-page__tier-size">~0.1 KB</span>
            </div>
            <p className="streaming-text-page__tier-desc">
              Static text display wrapper. No cursor, no streaming state,
              no code block parsing. Pure CSS className wrapper.
            </p>
            <div className="streaming-text-page__tier-import">
              import {'{'} StreamingText {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="streaming-text-page__tier-preview">
              <LiteStreamingText text="Static display only" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }} />
            </div>
            <div className="streaming-text-page__size-breakdown">
              <div className="streaming-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`streaming-text-page__tier-card${tier === 'standard' ? ' streaming-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="streaming-text-page__tier-header">
              <span className="streaming-text-page__tier-name">Standard</span>
              <span className="streaming-text-page__tier-size">~1.8 KB</span>
            </div>
            <p className="streaming-text-page__tier-desc">
              Full-featured with streaming cursor, code block parsing, typewriter speed,
              onComplete callback, and motion levels.
            </p>
            <div className="streaming-text-page__tier-import">
              import {'{'} StreamingText {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="streaming-text-page__tier-preview">
              <StreamingText text="Streaming with cursor..." streaming showCursor style={{ fontSize: '0.875rem' }} />
            </div>
            <div className="streaming-text-page__size-breakdown">
              <div className="streaming-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`streaming-text-page__tier-card${tier === 'premium' ? ' streaming-text-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="streaming-text-page__tier-header">
              <span className="streaming-text-page__tier-name">Premium</span>
              <span className="streaming-text-page__tier-size">~2.8 KB</span>
            </div>
            <p className="streaming-text-page__tier-desc">
              Everything in Standard plus word-level fade-in, syntax highlighting,
              scroll-to-bottom auto-follow, and glow cursor effects.
            </p>
            <div className="streaming-text-page__tier-import">
              import {'{'} StreamingText {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="streaming-text-page__tier-preview">
              <StreamingText text="Premium streaming..." streaming showCursor style={{ fontSize: '0.875rem' }} />
            </div>
            <div className="streaming-text-page__size-breakdown">
              <div className="streaming-text-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="streaming-text-page__section" id="brand-color">
        <h2 className="streaming-text-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          Pick a brand color to see the cursor and page accents update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={COLOR_PRESETS.map(p => p.hex)}
          />
          <div className="streaming-text-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`streaming-text-page__color-preset${brandColor === p.hex ? ' streaming-text-page__color-preset--active' : ''}`}
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

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="streaming-text-page__section" id="props">
        <h2 className="streaming-text-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          All props accepted by StreamingText. It also spreads any native {'<div>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={streamingTextProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="streaming-text-page__section" id="accessibility">
        <h2 className="streaming-text-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="streaming-text-page__section-desc">
          StreamingText provides accessible live-updating content with proper ARIA semantics.
        </p>
        <Card variant="default" padding="md">
          <ul className="streaming-text-page__a11y-list">
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Uses <code className="streaming-text-page__a11y-key">aria-live="polite"</code> to announce new content to screen readers.
              </span>
            </li>
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Busy state:</strong> Sets <code className="streaming-text-page__a11y-key">aria-busy</code> while actively streaming to defer announcements.
              </span>
            </li>
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Hidden cursor:</strong> The visual cursor is marked <code className="streaming-text-page__a11y-key">aria-hidden="true"</code>.
              </span>
            </li>
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Cursor blink animation is disabled with <code className="streaming-text-page__a11y-key">prefers-reduced-motion</code>.
              </span>
            </li>
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Cursor is hidden in print media with <code className="streaming-text-page__a11y-key">display: none</code>.
              </span>
            </li>
            <li className="streaming-text-page__a11y-item">
              <span className="streaming-text-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Cursor and code blocks use system colors in <code className="streaming-text-page__a11y-key">forced-colors: active</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
