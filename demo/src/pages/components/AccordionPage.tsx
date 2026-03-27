'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Accordion } from '@ui/components/accordion'
import { Accordion as LiteAccordion } from '@ui/lite/accordion'
import { Accordion as PremiumAccordion } from '@ui/premium/accordion'
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
    @scope (.accordion-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: accordion-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .accordion-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .accordion-page__hero::before {
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
        animation: accordion-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes accordion-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .accordion-page__hero::before { animation: none; }
      }

      .accordion-page__title {
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

      .accordion-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .accordion-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .accordion-page__import-code {
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

      .accordion-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .accordion-page__section {
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
        animation: accordion-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes accordion-section-reveal {
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
        .accordion-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .accordion-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .accordion-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .accordion-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .accordion-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .accordion-page__preview {
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

      /* Subtle dot grid */
      .accordion-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .accordion-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .accordion-page__preview--full {
        justify-content: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .accordion-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .accordion-page__playground {
          grid-template-columns: 1fr;
        }
        .accordion-page__playground-controls {
          position: static !important;
        }
      }

      @container accordion-page (max-width: 680px) {
        .accordion-page__playground {
          grid-template-columns: 1fr;
        }
        .accordion-page__playground-controls {
          position: static !important;
        }
      }

      .accordion-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .accordion-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      /* Dot grid for playground result */
      .accordion-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .accordion-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .accordion-page__playground-controls {
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

      .accordion-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .accordion-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .accordion-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .accordion-page__option-btn {
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
      .accordion-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .accordion-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .accordion-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .accordion-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .accordion-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .accordion-page__tier-card {
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

      .accordion-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .accordion-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .accordion-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .accordion-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .accordion-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .accordion-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .accordion-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .accordion-page__tier-import {
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

      .accordion-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .accordion-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .accordion-page__color-preset {
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
      .accordion-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .accordion-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .accordion-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .accordion-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .accordion-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .accordion-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .accordion-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .accordion-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .accordion-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .accordion-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .accordion-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .accordion-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .accordion-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .accordion-page__hero {
          padding: 2rem 1.25rem;
        }

        .accordion-page__title {
          font-size: 1.75rem;
        }

        .accordion-page__preview {
          padding: 1.75rem;
        }

        .accordion-page__playground {
          grid-template-columns: 1fr;
        }

        .accordion-page__playground-result {
          padding: 1.5rem;
          min-block-size: 120px;
        }

        .accordion-page__tiers {
          grid-template-columns: 1fr;
        }

        .accordion-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .accordion-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .accordion-page__hero {
          padding: 1.5rem 1rem;
        }

        .accordion-page__title {
          font-size: 1.5rem;
        }

        .accordion-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .accordion-page__title {
          font-size: 4rem;
        }

        .accordion-page__preview {
          padding: 3.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .accordion-page__import-code,
      .accordion-page code,
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

const accordionPropsData: PropDef[] = [
  { name: 'items', type: 'AccordionItem[]', required: true, description: 'Array of accordion items with id, trigger, content, and optional disabled flag.' },
  { name: 'type', type: "'single' | 'multiple'", default: "'multiple'", description: 'Whether only one item or multiple items can be expanded at once.' },
  { name: 'defaultOpen', type: 'string[]', default: '[]', description: 'Array of item IDs that should be expanded on initial render.' },
  { name: 'onOpenChange', type: '(openIds: string[]) => void', description: 'Callback fired when the set of open items changes.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root <div> element.' },
]

const accordionItemPropsData: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the item, used in defaultOpen and onOpenChange.' },
  { name: 'trigger', type: 'ReactNode', required: true, description: 'Content rendered as the clickable summary header.' },
  { name: 'content', type: 'ReactNode', required: true, description: 'Content revealed when the item is expanded.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the item from being toggled. Shown with reduced opacity.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Accordion } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Accordion } from '@annondeveloper/ui-kit'",
  premium: "import { Accordion } from '@annondeveloper/ui-kit/premium'",
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

const FAQ_ITEMS = [
  {
    id: 'what-is',
    trigger: 'What is ui-kit?',
    content: 'A zero-dependency React component library with 62 components, physics-based animations, OKLCH color system, and Aurora Fluid design identity. Ships in three weight tiers from ultra-light CSS-only to premium with cinematic effects.',
  },
  {
    id: 'bundle-size',
    trigger: 'How small is the bundle?',
    content: 'Core primitives are under 2KB gzip. The full library is under 85KB JS gzip and 20KB CSS gzip. Each component can be individually imported for optimal tree-shaking.',
  },
  {
    id: 'accessibility',
    trigger: 'Is it accessible?',
    content: 'Every component follows WAI-ARIA APG patterns, supports keyboard navigation, respects prefers-reduced-motion, meets WCAG AA contrast ratios, and works with forced-colors mode. Touch targets are enforced at 44px minimum.',
  },
  {
    id: 'framework-support',
    trigger: 'Does it work with other frameworks?',
    content: 'The Lite tier is pure CSS with minimal HTML and works in Vue, Angular, Svelte, or plain HTML. Standard and Premium tiers are React 19 components with optional CSS-only fallbacks for non-React projects.',
  },
  {
    id: 'theming',
    trigger: 'How does theming work?',
    content: 'The OKLCH color system generates a complete theme from a single brand color. All derived colors (light, dark, subtle, glow) are computed automatically. Themes can be applied via CSS custom properties or the UIProvider component.',
  },
]

const NESTED_OUTER_ITEMS = [
  {
    id: 'getting-started',
    trigger: 'Getting Started',
    content: 'Install the package with npm install @annondeveloper/ui-kit, import the components you need, and wrap your app in UIProvider. Zero configuration required.',
  },
  {
    id: 'advanced-topics',
    trigger: 'Advanced Topics',
    content: 'NESTED_PLACEHOLDER',
  },
  {
    id: 'troubleshooting',
    trigger: 'Troubleshooting',
    content: 'Check the browser console for warnings. Ensure React 19+ is installed as a peer dependency. If styles are not loading, verify that your bundler supports CSS injection via adoptedStyleSheets.',
  },
]

const NESTED_INNER_ITEMS = [
  {
    id: 'nested-motion',
    trigger: 'Motion Configuration',
    content: 'Motion levels cascade from OS prefers-reduced-motion to component prop to CSS --motion to UIProvider. Level 0 is instant, 1 is subtle, 2 is expressive, and 3 is cinematic with full physics.',
  },
  {
    id: 'nested-theming',
    trigger: 'Custom Theme Generation',
    content: 'Use generateTheme(brandColor, mode) to create a full token set. Apply with applyTheme() or convert to CSS with themeToCSS(). Validate contrast ratios with validateContrast().',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="accordion-page__copy-btn"
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
    <div className="accordion-page__control-group">
      <span className="accordion-page__control-label">{label}</span>
      <div className="accordion-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`accordion-page__option-btn${opt === value ? ' accordion-page__option-btn--active' : ''}`}
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
    <label className="accordion-page__toggle-label">
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
  type: 'single' | 'multiple',
  defaultOpen: string[],
  motion: number,
  showIcons: boolean,
): string {
  const importPath = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : tier === 'premium'
    ? "@annondeveloper/ui-kit/premium"
    : "@annondeveloper/ui-kit"
  const imports = [`import { Accordion } from '${importPath}'`]
  if (showIcons && tier !== 'lite') imports.push(`import { Icon } from '${importPath === "@annondeveloper/ui-kit/lite" ? "@annondeveloper/ui-kit" : importPath}'`)

  const itemsStr = showIcons && tier !== 'lite'
    ? `const items = [
  { id: 'item-1', trigger: <><Icon name="info" size={16} /> What is ui-kit?</>, content: 'A zero-dependency React component library...' },
  { id: 'item-2', trigger: <><Icon name="zap" size={16} /> How small is the bundle?</>, content: 'Core primitives are under 2KB gzip...' },
  { id: 'item-3', trigger: <><Icon name="shield" size={16} /> Is it accessible?</>, content: 'Every component follows WAI-ARIA APG patterns...' },
]`
    : `const items = [
  { id: 'item-1', trigger: 'What is ui-kit?', content: 'A zero-dependency React component library...' },
  { id: 'item-2', trigger: 'How small is the bundle?', content: 'Core primitives are under 2KB gzip...' },
  { id: 'item-3', trigger: 'Is it accessible?', content: 'Every component follows WAI-ARIA APG patterns...' },
]`

  const props: string[] = ['  items={items}']
  if (type !== 'multiple' && tier !== 'lite') props.push(`  type="${type}"`)
  if (defaultOpen.length > 0) props.push(`  defaultOpen={[${defaultOpen.map(d => `'${d}'`).join(', ')}]}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = `<Accordion\n${props.join('\n')}\n/>`

  return `${imports.join('\n')}\n\n${itemsStr}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, type: 'single' | 'multiple', defaultOpen: string[]): string {
  const openAttr = (id: string) => defaultOpen.includes(id) ? ' open' : ''

  if (tier === 'lite') {
    return `<!-- Accordion — @annondeveloper/ui-kit lite tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">

<div class="ui-lite-accordion">
  <details class="ui-lite-accordion__item"${openAttr('item-1')}>
    <summary class="ui-lite-accordion__trigger">What is ui-kit?</summary>
    <div class="ui-lite-accordion__content">
      A zero-dependency React component library...
    </div>
  </details>
  <details class="ui-lite-accordion__item"${openAttr('item-2')}>
    <summary class="ui-lite-accordion__trigger">How small is the bundle?</summary>
    <div class="ui-lite-accordion__content">
      Core primitives are under 2KB gzip...
    </div>
  </details>
</div>`
  }

  return `<!-- Accordion — @annondeveloper/ui-kit standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/accordion.css">

<div class="ui-accordion"${type === 'single' ? ' data-type="single"' : ''}>
  <details${openAttr('item-1')}>
    <summary>What is ui-kit?</summary>
    <div class="ui-accordion__content-wrapper">
      <div class="ui-accordion__content">
        <div class="ui-accordion__content-inner">
          A zero-dependency React component library...
        </div>
      </div>
    </div>
  </details>
  <details${openAttr('item-2')}>
    <summary>How small is the bundle?</summary>
    <div class="ui-accordion__content-wrapper">
      <div class="ui-accordion__content">
        <div class="ui-accordion__content-inner">
          Core primitives are under 2KB gzip...
        </div>
      </div>
    </div>
  </details>
</div>`
}

function generateVueCode(tier: Tier, type: 'single' | 'multiple'): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-accordion">
    <details v-for="item in items" :key="item.id" class="ui-lite-accordion__item">
      <summary class="ui-lite-accordion__trigger">{{ item.trigger }}</summary>
      <div class="ui-lite-accordion__content">{{ item.content }}</div>
    </details>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const typeAttr = type !== 'multiple' ? `\n  type="${type}"` : ''
  return `<template>
  <Accordion
    :items="items"${typeAttr}
    @open-change="handleChange"
  />
</template>

<script setup>
import { Accordion } from '@annondeveloper/ui-kit'

const items = [
  { id: 'item-1', trigger: 'What is ui-kit?', content: 'A zero-dependency React component library...' },
  { id: 'item-2', trigger: 'How small is the bundle?', content: 'Core primitives are under 2KB gzip...' },
]

function handleChange(openIds) {
  console.log('Open items:', openIds)
}
</script>`
}

function generateAngularCode(tier: Tier, type: 'single' | 'multiple'): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-accordion">
  <details *ngFor="let item of items" class="ui-lite-accordion__item">
    <summary class="ui-lite-accordion__trigger">{{ item.trigger }}</summary>
    <div class="ui-lite-accordion__content">{{ item.content }}</div>
  </details>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div class="ui-accordion"${type === 'single' ? ' data-type="single"' : ''}>
  <details *ngFor="let item of items">
    <summary>{{ item.trigger }}</summary>
    <div class="ui-accordion__content-wrapper">
      <div class="ui-accordion__content">
        <div class="ui-accordion__content-inner">
          {{ item.content }}
        </div>
      </div>
    </div>
  </details>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/accordion.css';`
}

function generateSvelteCode(tier: Tier, type: 'single' | 'multiple'): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
{#each items as item (item.id)}
  <details class="ui-lite-accordion__item">
    <summary class="ui-lite-accordion__trigger">{item.trigger}</summary>
    <div class="ui-lite-accordion__content">{item.content}</div>
  </details>
{/each}

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const typeAttr = type !== 'multiple' ? `\n  type="${type}"` : ''
  return `<script>
  import { Accordion } from '@annondeveloper/ui-kit';

  const items = [
    { id: 'item-1', trigger: 'What is ui-kit?', content: 'A zero-dependency React component library...' },
    { id: 'item-2', trigger: 'How small is the bundle?', content: 'Core primitives are under 2KB gzip...' },
  ];
</script>

<Accordion
  {items}${typeAttr}
  onOpenChange={(ids) => console.log('Open:', ids)}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

const ICON_ITEMS = [
  {
    id: 'what-is',
    icon: 'info' as const,
    trigger: 'What is ui-kit?',
    content: 'A zero-dependency React component library with 62 components, physics-based animations, OKLCH color system, and Aurora Fluid design identity. Ships in three weight tiers from ultra-light CSS-only to premium with cinematic effects.',
  },
  {
    id: 'bundle-size',
    icon: 'zap' as const,
    trigger: 'How small is the bundle?',
    content: 'Core primitives are under 2KB gzip. The full library is under 85KB JS gzip and 20KB CSS gzip. Each component can be individually imported for optimal tree-shaking.',
  },
  {
    id: 'accessibility',
    icon: 'shield' as const,
    trigger: 'Is it accessible?',
    content: 'Every component follows WAI-ARIA APG patterns, supports keyboard navigation, respects prefers-reduced-motion, meets WCAG AA contrast ratios, and works with forced-colors mode. Touch targets are enforced at 44px minimum.',
  },
  {
    id: 'framework-support',
    icon: 'settings' as const,
    trigger: 'Does it work with other frameworks?',
    content: 'The Lite tier is pure CSS with minimal HTML and works in Vue, Angular, Svelte, or plain HTML. Standard and Premium tiers are React 19 components with optional CSS-only fallbacks for non-React projects.',
  },
]

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [type, setType] = useState<'single' | 'multiple'>('multiple')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [defaultOpen, setDefaultOpen] = useState<string[]>(['what-is'])
  const [showIcons, setShowIcons] = useState(false)
  const [collapsible, setCollapsible] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const playgroundItems = useMemo(() => {
    const base = ICON_ITEMS
    if (showIcons && tier !== 'lite') {
      return base.map(item => ({
        id: item.id,
        trigger: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon name={item.icon} size={16} /> {item.trigger}
          </span>
        ),
        content: item.content,
      }))
    }
    return base.map(item => ({
      id: item.id,
      trigger: item.trigger,
      content: item.content,
    }))
  }, [showIcons, tier])
  const AccordionComponent = tier === 'premium' ? PremiumAccordion : tier === 'lite' ? LiteAccordion : Accordion

  const reactCode = useMemo(
    () => generateReactCode(tier, type, defaultOpen, motion, showIcons),
    [tier, type, defaultOpen, motion, showIcons],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, type, defaultOpen),
    [tier, type, defaultOpen],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, type),
    [tier, type],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, type),
    [tier, type],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, type),
    [tier, type],
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

  const handleOpenChange = useCallback((openIds: string[]) => {
    if (!collapsible && openIds.length === 0) return
    setDefaultOpen(openIds)
  }, [collapsible])

  const accordionComponentProps: Record<string, unknown> = {
    items: playgroundItems,
    key: `${tier}-${showIcons}`,
  }

  if (tier === 'lite') {
    accordionComponentProps.defaultOpen = defaultOpen
  } else {
    accordionComponentProps.type = type
    accordionComponentProps.defaultOpen = defaultOpen
    accordionComponentProps.motion = motion
    accordionComponentProps.onOpenChange = handleOpenChange
  }

  return (
    <section className="accordion-page__section" id="playground">
      <h2 className="accordion-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="accordion-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="accordion-page__playground">
        {/* Preview area */}
        <div className="accordion-page__playground-preview">
          <div className="accordion-page__playground-result">
            <AccordionComponent {...accordionComponentProps as any} />
          </div>

          {/* Tabbed code output */}
          <div className="accordion-page__code-tabs">
            <div className="accordion-page__export-row">
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
              {copyStatus && <span className="accordion-page__export-status">{copyStatus}</span>}
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
        <div className="accordion-page__playground-controls">
          {tier === 'lite' && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '0.5rem', background: 'oklch(100% 0 0 / 0.03)', borderRadius: 'var(--radius-sm)' }}>
              Lite tier uses native {'<details>'} elements with no JS. Type, motion, and icon controls are standard-only features.
            </div>
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Type"
              options={['single', 'multiple'] as const}
              value={type}
              onChange={setType}
            />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="accordion-page__control-group">
            <span className="accordion-page__control-label">Default Open</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {ICON_ITEMS.map(item => (
                <Toggle
                  key={item.id}
                  label={item.trigger}
                  checked={defaultOpen.includes(item.id)}
                  onChange={(checked) => {
                    setDefaultOpen(prev =>
                      checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                    )
                  }}
                />
              ))}
            </div>
          </div>

          {tier !== 'lite' && (
            <div className="accordion-page__control-group">
              <span className="accordion-page__control-label">Features</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle
                  label="Icons in triggers"
                  checked={showIcons}
                  onChange={setShowIcons}
                />
                <Toggle
                  label="Collapsible (allow closing all)"
                  checked={collapsible}
                  onChange={setCollapsible}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccordionPage() {
  useStyles('accordion-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const { mode } = useTheme()

  const AccordionComponent = tier === 'premium' ? PremiumAccordion : tier === 'lite' ? LiteAccordion : Accordion

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
    const sections = document.querySelectorAll('.accordion-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
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
    <div className="accordion-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="accordion-page__hero">
        <h1 className="accordion-page__title">Accordion</h1>
        <p className="accordion-page__desc">
          Collapsible content sections built on native {'<details>'} elements with smooth height
          animation, single/multiple mode, and keyboard navigation. Ships in three weight tiers
          from 0.3KB lite to 2KB standard.
        </p>
        <div className="accordion-page__import-row">
          <code className="accordion-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ─────────────────────────────────── */}
      <section className="accordion-page__section" id="variants">
        <h2 className="accordion-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="accordion-page__section-desc">
          Single mode allows only one item open at a time. Multiple mode (default) allows
          any number of items to be expanded simultaneously.
          {tier === 'lite' && (
            <span style={{ display: 'block', marginBlockStart: '0.5rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Note: Lite tier always uses native {'<details>'} behavior (multiple mode). Single mode requires Standard tier.
            </span>
          )}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
              Single mode {tier === 'lite' && <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>(Standard only)</span>}
            </h3>
            <div className="accordion-page__preview accordion-page__preview--col">
              {tier === 'lite' ? (
                <>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBlockEnd: '0.5rem' }}>
                    Lite fallback — native {'<details>'} cannot enforce single mode:
                  </div>
                  <LiteAccordion
                    items={FAQ_ITEMS.slice(0, 3)}
                    defaultOpen={['what-is']}
                  />
                </>
              ) : (
                <Accordion
                  items={FAQ_ITEMS.slice(0, 3)}
                  type="single"
                  defaultOpen={['what-is']}
                />
              )}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
              Multiple mode
            </h3>
            <div className="accordion-page__preview accordion-page__preview--col">
              {tier === 'lite' ? (
                <LiteAccordion
                  items={FAQ_ITEMS.slice(0, 3)}
                  defaultOpen={['what-is', 'bundle-size']}
                />
              ) : (
                <Accordion
                  items={FAQ_ITEMS.slice(0, 3)}
                  type="multiple"
                  defaultOpen={['what-is', 'bundle-size']}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4a. Feature: Multiple Open ──────────────────── */}
      <section className="accordion-page__section" id="multiple-open">
        <h2 className="accordion-page__section-title">
          <a href="#multiple-open">Multiple Open</a>
        </h2>
        <p className="accordion-page__section-desc">
          With <code>type="multiple"</code> (default), users can expand any number of sections.
          Great for FAQ pages where users may want to compare answers.
        </p>
        <div className="accordion-page__preview accordion-page__preview--col">
          <AccordionComponent
            items={FAQ_ITEMS}
            {...(tier !== 'lite' ? { type: 'multiple' as const } : {})}
            defaultOpen={['what-is', 'bundle-size', 'accessibility']}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={tier === 'lite'
              ? `<Accordion\n  items={faqItems}\n  defaultOpen={['what-is', 'bundle-size', 'accessibility']}\n/>`
              : `<Accordion\n  items={faqItems}\n  type="multiple"\n  defaultOpen={['what-is', 'bundle-size', 'accessibility']}\n/>`
            }
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4b. Feature: Default Expanded ───────────────── */}
      <section className="accordion-page__section" id="default-expanded">
        <h2 className="accordion-page__section-title">
          <a href="#default-expanded">Default Expanded</a>
        </h2>
        <p className="accordion-page__section-desc">
          Use <code>defaultOpen</code> to specify which items are expanded on initial render.
          Pass an array of item IDs.
        </p>
        <div className="accordion-page__preview accordion-page__preview--col">
          <AccordionComponent
            items={FAQ_ITEMS.slice(0, 3)}
            defaultOpen={['what-is', 'accessibility']}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Accordion\n  items={items}\n  defaultOpen={['what-is', 'accessibility']}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4c. Feature: Icons in Triggers ──────────────── */}
      <section className="accordion-page__section" id="icons">
        <h2 className="accordion-page__section-title">
          <a href="#icons">Icons in Triggers</a>
        </h2>
        <p className="accordion-page__section-desc">
          Trigger content accepts any ReactNode, so you can include icons, badges, or rich content
          in the accordion headers.
          {tier === 'lite' && (
            <span style={{ display: 'block', marginBlockStart: '0.5rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Note: Lite tier renders plain text triggers via native {'<details>'}. Icons require the Standard tier.
            </span>
          )}
        </p>

        {tier === 'lite' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
                Lite — plain text triggers only
              </h3>
              <div className="accordion-page__preview accordion-page__preview--col">
                <LiteAccordion
                  items={[
                    { id: 'icon-1', trigger: 'Performance', content: 'Core primitives are under 2KB gzip. The motion engine is 3.5KB. Every component is individually tree-shakeable.' },
                    { id: 'icon-2', trigger: 'Security', content: 'Zero external dependencies means minimal supply chain risk. All inputs are sanitized with no dynamic code execution.' },
                    { id: 'icon-3', trigger: 'Configuration', content: 'Zero configuration required. Wrap your app in UIProvider and start importing components. Theming is optional.' },
                  ]}
                  defaultOpen={['icon-1']}
                />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
                Standard — with icons in triggers
              </h3>
              <div className="accordion-page__preview accordion-page__preview--col">
                <Accordion
                  items={[
                    {
                      id: 'icon-1',
                      trigger: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="zap" size={16} /> Performance
                        </span>
                      ),
                      content: 'Core primitives are under 2KB gzip. The motion engine is 3.5KB. Every component is individually tree-shakeable.',
                    },
                    {
                      id: 'icon-2',
                      trigger: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="shield" size={16} /> Security
                        </span>
                      ),
                      content: 'Zero external dependencies means minimal supply chain risk. All inputs are sanitized with no dynamic code execution.',
                    },
                    {
                      id: 'icon-3',
                      trigger: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Icon name="settings" size={16} /> Configuration
                        </span>
                      ),
                      content: 'Zero configuration required. Wrap your app in UIProvider and start importing components. Theming is optional.',
                    },
                  ]}
                  defaultOpen={['icon-1']}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="accordion-page__preview accordion-page__preview--col">
            <Accordion
              items={[
                {
                  id: 'icon-1',
                  trigger: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="zap" size={16} /> Performance
                    </span>
                  ),
                  content: 'Core primitives are under 2KB gzip. The motion engine is 3.5KB. Every component is individually tree-shakeable.',
                },
                {
                  id: 'icon-2',
                  trigger: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="shield" size={16} /> Security
                    </span>
                  ),
                  content: 'Zero external dependencies means minimal supply chain risk. All inputs are sanitized with no dynamic code execution.',
                },
                {
                  id: 'icon-3',
                  trigger: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="settings" size={16} /> Configuration
                    </span>
                  ),
                  content: 'Zero configuration required. Wrap your app in UIProvider and start importing components. Theming is optional.',
                },
              ]}
              defaultOpen={['icon-1']}
            />
          </div>
        )}

        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Accordion items={[\n  {\n    id: 'perf',\n    trigger: <><Icon name="zap" /> Performance</>,\n    content: 'Core primitives are under 2KB gzip...',\n  },\n  // ...\n]} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4d. Feature: Nested Accordions ──────────────── */}
      <section className="accordion-page__section" id="nested">
        <h2 className="accordion-page__section-title">
          <a href="#nested">Nested Accordions</a>
        </h2>
        <p className="accordion-page__section-desc">
          Accordion content can contain another Accordion for multi-level navigation or deeply
          structured content. Each level operates independently.
        </p>
        {tier === 'lite' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
                Lite — nested native {'<details>'}
              </h3>
              <div className="accordion-page__preview accordion-page__preview--col">
                <LiteAccordion
                  items={NESTED_OUTER_ITEMS.map(item => ({
                    ...item,
                    content: item.id === 'advanced-topics' ? (
                      <div style={{ paddingBlockStart: '0.5rem' }}>
                        <LiteAccordion
                          items={NESTED_INNER_ITEMS}
                          defaultOpen={['nested-motion']}
                        />
                      </div>
                    ) : item.content,
                  }))}
                  defaultOpen={['advanced-topics']}
                />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>
                Standard — smooth animated nesting
              </h3>
              <div className="accordion-page__preview accordion-page__preview--col">
                <Accordion
                  items={NESTED_OUTER_ITEMS.map(item => ({
                    ...item,
                    content: item.id === 'advanced-topics' ? (
                      <div style={{ paddingBlockStart: '0.5rem' }}>
                        <Accordion
                          items={NESTED_INNER_ITEMS}
                          defaultOpen={['nested-motion']}
                        />
                      </div>
                    ) : item.content,
                  }))}
                  defaultOpen={['advanced-topics']}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="accordion-page__preview accordion-page__preview--col">
            <Accordion
              items={NESTED_OUTER_ITEMS.map(item => ({
                ...item,
                content: item.id === 'advanced-topics' ? (
                  <div style={{ paddingBlockStart: '0.5rem' }}>
                    <Accordion
                      items={NESTED_INNER_ITEMS}
                      defaultOpen={['nested-motion']}
                    />
                  </div>
                ) : item.content,
              }))}
              defaultOpen={['advanced-topics']}
            />
          </div>
        )}
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Accordion items={[\n  { id: 'topic', trigger: 'Advanced Topics', content: (\n    <Accordion\n      items={nestedItems}\n      defaultOpen={['nested-motion']}\n    />\n  )},\n]} />`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="accordion-page__section" id="tiers">
        <h2 className="accordion-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="accordion-page__section-desc">
          Choose the right balance of features and bundle size. Accordion ships in three tiers.
          Premium adds spring expand/collapse, aurora glow on active headers, and shimmer dividers.
        </p>

        <div className="accordion-page__tiers">
          {/* Lite */}
          <div
            className={`accordion-page__tier-card${tier === 'lite' ? ' accordion-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="accordion-page__tier-header">
              <span className="accordion-page__tier-name">Lite</span>
              <span className="accordion-page__tier-size">~0.3 KB</span>
            </div>
            <p className="accordion-page__tier-desc">
              CSS-only with native {'<details>'} behavior.
              No JavaScript state management, no animation, no single mode.
            </p>
            <div className="accordion-page__tier-import">
              import {'{'} Accordion {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="accordion-page__tier-preview">
              <LiteAccordion
                items={[
                  { id: 'lite-demo', trigger: 'Lite Accordion', content: 'Pure CSS, zero JS overhead.' },
                ]}
                defaultOpen={['lite-demo']}
              />
            </div>
            <div className="accordion-page__size-breakdown">
              <div className="accordion-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`accordion-page__tier-card${tier === 'standard' ? ' accordion-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="accordion-page__tier-header">
              <span className="accordion-page__tier-name">Standard</span>
              <span className="accordion-page__tier-size">~2 KB</span>
            </div>
            <p className="accordion-page__tier-desc">
              Full-featured accordion with single/multiple mode,
              controlled state, smooth height animation, and motion levels.
            </p>
            <div className="accordion-page__tier-import">
              import {'{'} Accordion {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="accordion-page__tier-preview">
              <Accordion
                items={[
                  { id: 'std-demo', trigger: 'Standard Accordion', content: 'Smooth height animation with motion levels.' },
                ]}
                defaultOpen={['std-demo']}
              />
            </div>
            <div className="accordion-page__size-breakdown">
              <div className="accordion-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`accordion-page__tier-card${tier === 'premium' ? ' accordion-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="accordion-page__tier-header">
              <span className="accordion-page__tier-name">Premium</span>
              <span className="accordion-page__tier-size">~3.1 KB</span>
            </div>
            <p className="accordion-page__tier-desc">
              Spring-animated expand/collapse with overshoot curve, aurora glow on active header,
              and shimmer dividers. Wraps Standard with premium CSS layer.
            </p>
            <div className="accordion-page__tier-import">
              import {'{'} Accordion {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="accordion-page__tier-preview">
              <PremiumAccordion
                items={[
                  { id: 'prem-demo', trigger: 'Spring expand + aurora glow', content: 'Premium tier with physics-based animations and atmospheric effects.' },
                ]}
                defaultOpen={['prem-demo']}
              />
            </div>
            <div className="accordion-page__size-breakdown">
              <div className="accordion-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Brand Color ───────────────────────────────── */}
      <section className="accordion-page__section" id="brand-color">
        <h2 className="accordion-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="accordion-page__section-desc">
          Pick a brand color to see the accordion update in real-time. The theme generates
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
          <div className="accordion-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`accordion-page__color-preset${brandColor === p.hex ? ' accordion-page__color-preset--active' : ''}`}
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

      {/* ── 7. Props API ───────────────────────────────── */}
      <section className="accordion-page__section" id="props">
        <h2 className="accordion-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="accordion-page__section-desc">
          All props accepted by Accordion. It also spreads any native div HTML attributes
          onto the underlying {'<div>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={accordionPropsData} />
        </Card>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', marginBlockStart: '1.5rem', marginBlockEnd: '0.75rem' }}>
          AccordionItem
        </h3>
        <Card variant="default" padding="md">
          <PropsTable props={accordionItemPropsData} />
        </Card>
      </section>

      {/* ── 8. Accessibility ──────────────────────────── */}
      <section className="accordion-page__section" id="accessibility">
        <h2 className="accordion-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="accordion-page__section-desc">
          Built on native {'<details>'} and {'<summary>'} elements for maximum browser support and accessibility.
        </p>
        <Card variant="default" padding="md">
          <ul className="accordion-page__a11y-list">
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Toggle items with <code className="accordion-page__a11y-key">Enter</code> and <code className="accordion-page__a11y-key">Space</code> keys when summary is focused.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored outline via <code className="accordion-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses native <code className="accordion-page__a11y-key">{'<details>'}</code> and <code className="accordion-page__a11y-key">{'<summary>'}</code> elements for built-in toggle behavior.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled state:</strong> Disabled items use <code className="accordion-page__a11y-key">aria-disabled="true"</code> with reduced opacity and pointer-events: none.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="accordion-page__a11y-key">prefers-reduced-motion</code>. Motion level 0 disables all transitions.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="accordion-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="accordion-page__a11y-key">forced-colors: active</code> with visible borders and system colors.
              </span>
            </li>
            <li className="accordion-page__a11y-item">
              <span className="accordion-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> All items expand automatically and transitions are disabled for clean print output.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 9. Source ──────────────────────────────────── */}
      <section className="accordion-page__section" id="source">
        <h2 className="accordion-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="accordion-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/accordion.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="accordion-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/accordion.tsx — Standard tier
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/accordion.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="accordion-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/accordion.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
