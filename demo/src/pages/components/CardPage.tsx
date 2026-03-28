'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Card as LiteCard } from '@ui/lite/card'
import { Card as PremiumCard } from '@ui/premium/card'
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
    @scope (.card-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: card-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .card-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .card-page__hero::before {
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
        animation: card-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes card-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .card-page__hero::before { animation: none; }
      }

      .card-page__title {
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

      .card-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .card-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .card-page__import-code {
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

      .card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .card-page__section {
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
        animation: card-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes card-section-reveal {
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
        .card-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .card-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .card-page__preview {
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
      .card-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .card-page__preview .ui-card,
      .card-page__preview .ui-premium-card {
        min-width: 200px;
      }

      .card-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .card-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .card-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .card-page__playground {
          grid-template-columns: 1fr;
        }
        .card-page__playground-controls {
          position: static !important;
        }
      }

      @container card-page (max-width: 680px) {
        .card-page__playground {
          grid-template-columns: 1fr;
        }
        .card-page__playground-controls {
          position: static !important;
        }
      }

      .card-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: visible;  /* Don't clip premium 3D perspective */
      }

      /* Ensure premium card wrapper fills available space */
      .card-page__playground-result .ui-premium-card {
        width: 100%;
        max-width: 400px;
      }

      /* Ensure card inside playground has readable width */
      .card-page__playground-result .ui-card {
        width: 100%;
        max-width: 400px;
      }

      /* Dot grid for playground result */
      .card-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .card-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .card-page__playground-controls {
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

      .card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .card-page__option-btn {
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
      .card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .card-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .card-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .card-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .card-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .card-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .card-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .card-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .card-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .card-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        overflow: visible;
        min-width: 0;
      }

      .card-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .card-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .card-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .card-page__tier-import {
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

      .card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding: 1rem;
        min-height: 120px;
        align-items: center;
      }

      .card-page__tier-preview .ui-premium-card {
        width: 100%;
      }

      /* ── Color picker ──────────────────────────────── */

      .card-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .card-page__color-preset {
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
      .card-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .card-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .card-page__code-tabs {
        margin-block-start: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      /* ── Export button row ─────────────────────────── */

      .card-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .card-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .card-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .card-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Container query demo ───────────────────────── */

      .card-page__container-demo {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .card-page__container-wrapper {
        border: 2px dashed var(--border-default);
        border-radius: var(--radius-md);
        padding: 1rem;
        position: relative;
      }

      .card-page__container-label {
        position: absolute;
        top: -0.6rem;
        left: 0.75rem;
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        padding: 0 0.375rem;
        font-size: 0.625rem;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        color: var(--text-tertiary);
      }

      /* ── Polymorphic demo ───────────────────────────── */

      .card-page__poly-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .card-page__poly-label {
        font-size: 0.6875rem;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        color: var(--text-tertiary);
        margin-block-start: 0.5rem;
        text-align: center;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .card-page__hero {
          padding: 2rem 1.25rem;
        }

        .card-page__title {
          font-size: 1.75rem;
        }

        .card-page__preview {
          padding: 1.75rem;
        }

        .card-page__playground {
          grid-template-columns: 1fr;
        }

        .card-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .card-page__labeled-row {
          gap: 1rem;
        }

        .card-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .card-page__tiers {
          grid-template-columns: 1fr;
        }

        .card-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .card-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .card-page__hero {
          padding: 1.5rem 1rem;
        }

        .card-page__title {
          font-size: 1.5rem;
        }

        .card-page__preview {
          padding: 1rem;
        }

        .card-page__states-grid {
          grid-template-columns: 1fr;
        }

        .card-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .card-page__title {
          font-size: 4rem;
        }

        .card-page__preview {
          padding: 3.5rem;
        }

        .card-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .card-page__import-code,
      .card-page code,
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

const cardProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'elevated' | 'outlined' | 'ghost' | 'glass' | 'gradient'", default: "'default'", description: 'Visual style variant controlling surface appearance and border.' },
  { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Internal padding scale.' },
  { name: 'interactive', type: 'boolean', default: 'false', description: 'Enable hover lift and cursor glow effects.' },
  { name: 'as', type: 'React.ElementType', default: "'div'", description: 'Render as a different HTML element (div, article, a, section).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'header', type: 'ReactNode', description: 'Card header area (image, title bar, etc.). Renders above content with a bottom border.' },
  { name: 'footer', type: 'ReactNode', description: 'Card footer area (action buttons). Renders below content with a top border.' },
  { name: 'expandable', type: 'boolean', default: 'false', description: 'Enable click to expand/collapse content.' },
  { name: 'defaultExpanded', type: 'boolean', default: 'true', description: 'Initial expanded state when expandable is true.' },
  { name: 'className', type: 'string', description: 'Additional CSS class names merged with the component class.' },
  { name: 'style', type: 'React.CSSProperties', description: 'Inline styles applied to the root element.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Card content.' },
  { name: 'href', type: 'string', description: 'Polymorphic pass-through when rendered as an anchor element.' },
  { name: 'target', type: 'string', description: 'Link target when using as="a".' },
  { name: 'rel', type: 'string', description: 'Link relationship when using as="a".' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'glass' | 'gradient'
type Padding = 'none' | 'sm' | 'md' | 'lg'
type AsElement = 'div' | 'article' | 'a' | 'section'

const VARIANTS: Variant[] = ['default', 'elevated', 'outlined', 'ghost', 'glass', 'gradient']
const PADDINGS: Padding[] = ['none', 'sm', 'md', 'lg']
const AS_ELEMENTS: AsElement[] = ['div', 'article', 'a', 'section']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Card } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Card } from '@annondeveloper/ui-kit'",
  premium: "import { Card } from '@annondeveloper/ui-kit/premium'",
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
      className="card-page__copy-btn"
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
    <div className="card-page__control-group">
      <span className="card-page__control-label">{label}</span>
      <div className="card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`card-page__option-btn${opt === value ? ' card-page__option-btn--active' : ''}`}
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
    <label className="card-page__toggle-label">
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

// ─── Sample Card Content ──────────────────────────────────────────────────────

function SampleCardContent() {
  return (
    <>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Card Title
      </h3>
      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        This is sample card content demonstrating layout and typography within the component.
      </p>
      <Button size="sm" variant="secondary">Action</Button>
    </>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateLiteCss(variant: 'default' | 'elevated', padding: Padding): string {
  const baseCSS = `.ui-lite-card {
  position: relative;
  display: block;
  border-radius: 0.75rem;
  overflow: hidden;
  color: inherit;
  box-sizing: border-box;
}`

  const paddingsMap: Record<Padding, string> = {
    none: '.ui-lite-card[data-padding={"none" as any}] { padding: 0; }',
    sm: '.ui-lite-card[data-padding="sm"] { padding: 0.75rem; }',
    md: '.ui-lite-card[data-padding="md"] { padding: 1.25rem; }',
    lg: '.ui-lite-card[data-padding="lg"] { padding: 2rem; }',
  }

  const variantsMap: Record<'default' | 'elevated', string> = {
    default: `.ui-lite-card[data-variant="default"] {
  background: var(--bg-surface, oklch(20% 0 0));
  border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
}`,
    elevated: `.ui-lite-card[data-variant="elevated"] {
  background: var(--bg-elevated, oklch(22% 0 0));
  border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
  box-shadow: 0 4px 12px oklch(0% 0 0 / 0.25);
}`,
  }

  return `${baseCSS}\n${paddingsMap[padding]}\n${variantsMap[variant]}`
}

function generateHtmlExport(tier: Tier, variant: Variant, padding: Padding, label: string): string {
  const className = tier === 'lite' ? 'ui-lite-card' : 'ui-card'
  const tierLabel = tier === 'lite' ? 'lite' : tier === 'premium' ? 'premium' : 'standard'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/card.css';`

  const liteVariant = (variant === 'outlined' || variant === 'ghost') ? 'default' : variant
  const cssCode = generateLiteCss(liteVariant as 'default' | 'elevated', padding)

  return `<!-- Card -- @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/card.css'}">

<div class="${className}" data-variant="${variant}" data-padding="${padding}">
  <h3>${label}</h3>
  <p>Card content goes here.</p>
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->

<!-- Inline styles (if not using the CSS file): -->
<!--
<style>
${cssCode}
</style>
-->`
}

function generateReactCode(
  tier: Tier,
  variant: Variant,
  padding: Padding,
  interactive: boolean,
  asElement: AsElement,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (padding !== 'md') props.push(`  padding="${padding}"`)
  if (interactive && tier !== 'lite') props.push('  interactive')
  if (asElement !== 'div' && tier !== 'lite') props.push(`  as="${asElement}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? `<Card>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</Card>`
    : `<Card\n${props.join('\n')}\n>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</Card>`

  return `${importStr}\n\n${jsx}`
}

function generateVueCode(tier: Tier, variant: Variant, padding: Padding): string {
  if (tier === 'lite') {
    const liteVariant = (variant === 'outlined' || variant === 'ghost') ? 'default' : variant
    const attrs: string[] = [`class="ui-lite-card"`, `data-variant="${liteVariant}"`, `data-padding="${padding}"`]
    return `<template>\n  <div ${attrs.join(' ')}>\n    <h3>Card Title</h3>\n    <p>Card content goes here.</p>\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (padding !== 'md') attrs.push(`  padding="${padding}"`)

  const template = attrs.length === 0
    ? `  <Card>\n    <h3>Card Title</h3>\n    <p>Card content goes here.</p>\n  </Card>`
    : `  <Card\n  ${attrs.join('\n  ')}\n  >\n    <h3>Card Title</h3>\n    <p>Card content goes here.</p>\n  </Card>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Card } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, padding: Padding): string {
  if (tier === 'lite') {
    const liteVariant = (variant === 'outlined' || variant === 'ghost') ? 'default' : variant
    const attrs = [`class="ui-lite-card"`, `data-variant="${liteVariant}"`, `data-padding="${padding}"`]
    return `<!-- Angular -- Lite tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<div\n  class="ui-card"\n  data-variant="${variant}"\n  data-padding="${padding}"\n>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/card.css';`
}

function generateSvelteCode(tier: Tier, variant: Variant, padding: Padding): string {
  if (tier === 'lite') {
    const liteVariant = (variant === 'outlined' || variant === 'ghost') ? 'default' : variant
    return `<!-- Svelte -- Lite tier (CSS-only) -->\n<div\n  class="ui-lite-card"\n  data-variant="${liteVariant}"\n  data-padding="${padding}"\n>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const props: string[] = []
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (padding !== 'md') props.push(`  padding="${padding}"`)
  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''
  return `<script>\n  import { Card } from '${importPath}';\n</script>\n\n<Card${propsStr}>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</Card>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('default')
  const [padding, setPadding] = useState<Padding>('md')
  const [interactive, setInteractive] = useState(false)
  const [asElement, setAsElement] = useState<AsElement>('div')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [showHeader, setShowHeader] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const [isExpandable, setIsExpandable] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const CardComponent = tier === 'lite' ? LiteCard : tier === 'premium' ? PremiumCard : Card

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, padding, interactive, asElement, motion),
    [tier, variant, padding, interactive, asElement, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(tier, variant, padding, 'Card Title'),
    [tier, variant, padding],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, padding),
    [tier, variant, padding],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, padding),
    [tier, variant, padding],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, padding),
    [tier, variant, padding],
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

  // Build preview props based on tier
  const previewProps: Record<string, unknown> = { variant: tier === 'lite' ? ((variant === 'outlined' || variant === 'ghost') ? 'default' : variant) : variant, padding }
  if (tier !== 'lite') {
    previewProps.interactive = interactive
    if (asElement !== 'div') previewProps.as = asElement
    previewProps.motion = motion
    if (showHeader) previewProps.header = <span style={{ fontWeight: 600 }}>Card Header</span>
    if (showFooter) previewProps.footer = (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button size="xs" variant={"ghost" as any}>Cancel</Button>
        <Button size="xs" variant="primary">Save</Button>
      </div>
    )
    if (isExpandable) previewProps.expandable = true
  }

  return (
    <section className="card-page__section" id="playground">
      <h2 className="card-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="card-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="card-page__playground">
        {/* Preview area */}
        <div className="card-page__playground-preview">
          <div className="card-page__playground-result">
            <div style={{ width: '100%', maxWidth: '360px' }}>
              <CardComponent {...previewProps}>
                <SampleCardContent />
              </CardComponent>
            </div>
          </div>

          {/* Tabbed code output */}
          <div className="card-page__code-tabs">
            <div className="card-page__export-row">
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
              {copyStatus && <span className="card-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel */}
        <div className="card-page__playground-controls">
          <OptionGroup label="Variant" options={tier === 'lite' ? (['default', 'elevated'] as const) : VARIANTS} value={tier === 'lite' ? ((variant === 'outlined' || variant === 'ghost') ? 'default' : variant) : variant} onChange={v => setVariant(v as Variant)} />
          <OptionGroup label="Padding" options={PADDINGS} value={padding} onChange={setPadding} />

          {tier !== 'lite' && (
            <OptionGroup label="as" options={AS_ELEMENTS} value={asElement} onChange={setAsElement} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          {tier !== 'lite' && (
            <div className="card-page__control-group">
              <span className="card-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Interactive" checked={interactive} onChange={setInteractive} />
                <Toggle label="Header" checked={showHeader} onChange={setShowHeader} />
                <Toggle label="Footer" checked={showFooter} onChange={setShowFooter} />
                <Toggle label="Expandable" checked={isExpandable} onChange={setIsExpandable} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CardPage() {
  useStyles('card-page', pageStyles)

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

  // Scroll reveal for sections -- JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.card-page__section')
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

  const CardComponent = tier === 'lite' ? LiteCard : tier === 'premium' ? PremiumCard : Card

  return (
    <div className="card-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="card-page__hero">
        <h1 className="card-page__title">Card</h1>
        <p className="card-page__desc">
          Versatile surface container with variant styles, padding scale, interactive hover effects,
          and polymorphic rendering. Ships in three weight tiers from ~1KB lite to ~3.5KB premium with 3D tilt.
        </p>
        <div className="card-page__import-row">
          <code className="card-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 3. All Variants ────────────────────────────── */}
      <section className="card-page__section" id="variants">
        <h2 className="card-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="card-page__section-desc">
          {tier === 'lite'
            ? 'Two built-in variants for different surface levels. Standard and Premium tiers add outlined and ghost.'
            : 'Four built-in variants for different surface levels and visual emphasis.'
          }
        </p>
        <div className="card-page__preview">
          <div className="card-page__labeled-row">
            {(tier === 'lite' ? (['default', 'elevated'] as const) : VARIANTS).map(v => (
              <div key={v} className="card-page__labeled-item">
                <CardComponent variant={v as any} padding="md" style={{ inlineSize: '180px' }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Sample content
                  </p>
                </CardComponent>
                <span className="card-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Padding Scale ──────────────────────────── */}
      <section className="card-page__section" id="padding">
        <h2 className="card-page__section-title">
          <a href="#padding">Padding Scale</a>
        </h2>
        <p className="card-page__section-desc">
          Four padding levels from zero internal spacing to generous breathing room.
          The padding prop controls all internal spacing uniformly.
        </p>
        <div className="card-page__preview">
          <div className="card-page__labeled-row" style={{ alignItems: 'flex-start' }}>
            {PADDINGS.map(p => (
              <div key={p} className="card-page__labeled-item">
                <CardComponent variant="elevated" padding={p} style={{ inlineSize: '160px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Padding: {p}
                  </p>
                </CardComponent>
                <span className="card-page__item-label">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="card-page__section" id="states">
        <h2 className="card-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="card-page__section-desc">
          Cards handle interaction states with clear visual feedback when interactive mode is enabled.
        </p>
        <div className="card-page__states-grid">
          <div className="card-page__state-cell">
            <CardComponent variant="default" padding="sm" style={{ inlineSize: '100%' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Default card</p>
            </CardComponent>
            <span className="card-page__state-label">Default</span>
          </div>
          <div className="card-page__state-cell">
            <CardComponent variant="elevated" padding="sm" style={{ inlineSize: '100%' }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Elevated card</p>
            </CardComponent>
            <span className="card-page__state-label">Elevated</span>
          </div>
          {tier !== 'lite' && (
            <div className="card-page__state-cell">
              <CardComponent variant="default" padding="sm" interactive style={{ inlineSize: '100%' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Hover me</p>
              </CardComponent>
              <span className="card-page__state-label">Interactive</span>
              <span className="card-page__state-hint">move cursor over</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="card-page__state-cell">
              <CardComponent variant={"outlined" as any} padding="sm" style={{ inlineSize: '100%' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Outlined</p>
              </CardComponent>
              <span className="card-page__state-label">Outlined</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="card-page__state-cell">
              <CardComponent variant={"ghost" as any} padding="sm" style={{ inlineSize: '100%' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Ghost</p>
              </CardComponent>
              <span className="card-page__state-label">Ghost</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6a. Interactive Mode ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="interactive">
          <h2 className="card-page__section-title">
            <a href="#interactive">Interactive Mode</a>
          </h2>
          <p className="card-page__section-desc">
            Enable hover lift and cursor glow effects with the <code>interactive</code> prop.
            Interactive cards subtly rise on hover and display an ambient glow that follows the cursor.
          </p>
          <div className="card-page__preview" style={{ gap: '1.5rem' }}>
            <CardComponent variant="default" padding="md" interactive style={{ inlineSize: '260px' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Hover me
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                This card lifts on hover with a subtle shadow increase and cursor-tracking glow.
              </p>
            </CardComponent>
            <CardComponent variant="elevated" padding="md" interactive style={{ inlineSize: '260px' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Elevated + Interactive
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Combines the elevated surface with interactive hover effects for rich depth.
              </p>
            </CardComponent>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Card interactive>\n  <h3>Hover me</h3>\n  <p>Lifts on hover with cursor glow.</p>\n</Card>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6a2. Visual Effects (Premium) ────────────── */}
      {tier === 'premium' && (
        <section className="card-page__section" id="effects">
          <h2 className="card-page__section-title">
            <a href="#effects">Visual Effects (Premium)</a>
          </h2>
          <p className="card-page__section-desc">
            Premium tier adds 3D tilt, cursor-tracking glow, and entrance animations.
            These effects activate at motion level 3.
          </p>
          <div className="card-page__preview" style={{ minHeight: 200, flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 280 }}>
                <PremiumCard variant="elevated" padding="md" motion={3}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>3D Tilt + Glow</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Hover to see 3D perspective tilt and cursor-tracking aurora glow.
                  </p>
                </PremiumCard>
              </div>
              <div style={{ width: '100%', maxWidth: 280 }}>
                <PremiumCard variant="default" padding="md" motion={2}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>Entrance Only</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Motion level 2: fade-up entrance, no 3D tilt.
                  </p>
                </PremiumCard>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6b. Polymorphic as ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="polymorphic">
          <h2 className="card-page__section-title">
            <a href="#polymorphic">Polymorphic Rendering</a>
          </h2>
          <p className="card-page__section-desc">
            Render the Card as any HTML element using the <code>as</code> prop. This preserves
            semantic HTML while keeping the Card's visual style.
          </p>
          <div className="card-page__poly-grid">
            {AS_ELEMENTS.map(el => (
              <div key={el}>
                <CardComponent
                  variant={"outlined" as any}
                  padding="md"
                  as={el}
                  {...(el === 'a' ? { href: '#polymorphic', style: { textDecoration: 'none', color: 'inherit', display: 'block' } } : {})}
                >
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {'<'}{el}{'>'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Rendered as {el === 'a' ? 'an anchor' : `a ${el}`} element
                  </p>
                </CardComponent>
                <p className="card-page__poly-label">as="{el}"</p>
              </div>
            ))}
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Card as="article" padding="lg">\n  <h2>Blog Post</h2>\n  <p>Semantic article element.</p>\n</Card>\n\n<Card as="a" href="/page" interactive>\n  <h3>Clickable Card</h3>\n</Card>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6c. Container Queries ─────────────────────── */}
      <section className="card-page__section" id="container-queries">
        <h2 className="card-page__section-title">
          <a href="#container-queries">Container Queries</a>
        </h2>
        <p className="card-page__section-desc">
          Card uses <code>container-type: inline-size</code> internally, so child content can
          adapt to the card's width instead of the viewport. Resize the containers below to see the effect.
        </p>
        <div className="card-page__container-demo">
          <div className="card-page__container-wrapper" style={{ maxInlineSize: '100%' }}>
            <span className="card-page__container-label">100% width</span>
            <CardComponent variant="default" padding="md">
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full Width</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Content flows horizontally when there is enough space.
                  </p>
                </div>
                <Button size="sm" variant="secondary">Action</Button>
              </div>
            </CardComponent>
          </div>
          <div className="card-page__container-wrapper" style={{ maxInlineSize: '360px' }}>
            <span className="card-page__container-label">360px width</span>
            <CardComponent variant="default" padding="md">
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Narrow</h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Content stacks when the container is narrow.
                  </p>
                </div>
                <Button size="sm" variant="secondary">Action</Button>
              </div>
            </CardComponent>
          </div>
          <div className="card-page__container-wrapper" style={{ maxInlineSize: '240px' }}>
            <span className="card-page__container-label">240px width</span>
            <CardComponent variant="default" padding="sm">
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Compact</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Minimal content at small sizes.
              </p>
            </CardComponent>
          </div>
        </div>
      </section>

      {/* ── 6d. Special Variants (Glass & Gradient) ────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="special-variants">
          <h2 className="card-page__section-title">
            <a href="#special-variants">Special Variants</a>
          </h2>
          <p className="card-page__section-desc">
            Glass and gradient cards for hero sections and premium UI.
          </p>
          {/* Glass card needs a colorful background behind it to show the blur */}
          <div className="card-page__preview" style={{ background: 'var(--bg-base)', position: 'relative' }}>
            <CardComponent variant={"glass" as any} padding="lg" style={{ width: '100%', maxWidth: 320 }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Glass Card</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Frosted glass effect with backdrop blur. Perfect for overlaying images or gradients.
              </p>
            </CardComponent>
            <CardComponent variant={"gradient" as any} padding="lg" style={{ width: '100%', maxWidth: 320 }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gradient Card</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Subtle gradient from elevated to brand-tinted. Great for featured content.
              </p>
            </CardComponent>
          </div>
        </section>
      )}

      {/* ── 6e. Header & Footer ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="header-footer">
          <h2 className="card-page__section-title">
            <a href="#header-footer">Header & Footer</a>
          </h2>
          <p className="card-page__section-desc">
            Structured cards with dedicated header and footer areas.
          </p>
          <div className="card-page__preview card-page__preview--col" style={{ alignItems: 'center' }}>
            <CardComponent
              padding={"none" as any}
              style={{ maxWidth: 360, width: '100%' }}
              header={
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Project Settings</strong>
                </div>
              }
              footer={
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button size="sm" variant={"ghost" as any}>Cancel</Button>
                  <Button size="sm" variant="primary">Save</Button>
                </div>
              }
            >
              <div style={{ padding: '1.25rem' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm, 0.875rem)', lineHeight: 1.6 }}>
                  Configure your project name, description, and visibility settings.
                </p>
              </div>
            </CardComponent>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Card\n  padding={"none" as any}\n  header={\n    <div style={{ padding: '1rem 1.25rem' }}>\n      <strong>Project Settings</strong>\n    </div>\n  }\n  footer={\n    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>\n      <Button size="sm" variant={"ghost" as any}>Cancel</Button>\n      <Button size="sm" variant="primary">Save</Button>\n    </div>\n  }\n>\n  <div style={{ padding: '1.25rem' }}>\n    <p>Configure your project settings.</p>\n  </div>\n</Card>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6f. Expandable ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="expandable">
          <h2 className="card-page__section-title">
            <a href="#expandable">Expandable</a>
          </h2>
          <p className="card-page__section-desc">
            Click the toggle to expand or collapse card content.
          </p>
          <div className="card-page__preview card-page__preview--col" style={{ alignItems: 'center', gap: '1rem' }}>
            <CardComponent expandable padding="md" style={{ maxWidth: 400, width: '100%' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click to expand</h4>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This content is initially visible. When collapsed, only the header area shows.
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Additional content that appears when expanded. Great for FAQs, settings panels, or any content you want to show progressively.
              </p>
            </CardComponent>
            <CardComponent expandable defaultExpanded={false} padding="md" style={{ maxWidth: 400, width: '100%' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>Initially collapsed</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This card starts collapsed. Click the toggle arrow to reveal this content.
              </p>
            </CardComponent>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Card expandable padding="md">\n  <h4>Click to expand</h4>\n  <p>Content visible when expanded.</p>\n</Card>\n\n<Card expandable defaultExpanded={false}>\n  <h4>Initially collapsed</h4>\n  <p>Hidden until user expands.</p>\n</Card>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6g. Loading (Skeleton Overlay) ──────────────── */}
      {tier !== 'lite' && (
        <section className="card-page__section" id="loading">
          <h2 className="card-page__section-title">
            <a href="#loading">Loading State</a>
          </h2>
          <p className="card-page__section-desc">
            Set the <code>loading</code> prop to overlay the card content with an animated skeleton
            placeholder. The card's dimensions are preserved while content is replaced with shimmer lines.
          </p>
          <div className="card-page__preview" style={{ gap: '1.5rem' }}>
            <CardComponent variant="default" padding="md" loading style={{ inlineSize: '260px', minBlockSize: '120px' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                This content is hidden
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                The card shows a skeleton overlay instead of this text.
              </p>
            </CardComponent>
            <CardComponent variant="elevated" padding="md" style={{ inlineSize: '260px' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Loaded content
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                This card has finished loading and shows its real content.
              </p>
            </CardComponent>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Card loading padding="md">\n  {/* Content hidden behind skeleton overlay */}\n  <h4>Dashboard</h4>\n  <p>Loading data...</p>\n</Card>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6h. Bordered ────────────────────────────────── */}
      <section className="card-page__section" id="bordered">
        <h2 className="card-page__section-title">
          <a href="#bordered">Bordered</a>
        </h2>
        <p className="card-page__section-desc">
          Use the <code>bordered</code> prop to add a visible border to any card variant.
          This provides stronger visual separation without relying on elevation alone.
        </p>
        <div className="card-page__preview" style={{ gap: '1.5rem' }}>
          <div className="card-page__labeled-item">
            <CardComponent variant="default" padding="md" bordered style={{ inlineSize: '200px' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Default + Bordered
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Clear boundary line
              </p>
            </CardComponent>
            <span className="card-page__item-label">bordered</span>
          </div>
          <div className="card-page__labeled-item">
            <CardComponent variant="elevated" padding="md" bordered style={{ inlineSize: '200px' }}>
              <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Elevated + Bordered
              </h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Shadow + border combo
              </p>
            </CardComponent>
            <span className="card-page__item-label">elevated bordered</span>
          </div>
          {tier !== 'lite' && (
            <div className="card-page__labeled-item">
              <CardComponent variant={"ghost" as any} padding="md" bordered style={{ inlineSize: '200px' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ghost + Bordered
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Transparent fill, visible edge
                </p>
              </CardComponent>
              <span className="card-page__item-label">ghost bordered</span>
            </div>
          )}
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Card bordered padding="md">\n  Content with a visible border\n</Card>\n\n<Card variant="elevated" bordered>\n  Elevation + border for stronger separation\n</Card>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 6i. Real-World Compositions ─────────────────── */}
      <section className="card-page__section" id="compositions">
        <h2 className="card-page__section-title">
          <a href="#compositions">Real-World Compositions</a>
        </h2>
        <p className="card-page__section-desc">
          Card is a generic container. Here's what you can build by composing it with content.
          For dedicated monitoring metrics, see <a href="/ui-kit/components/metric-card" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>MetricCard</a>.
        </p>

        {/* Row 1: Photo cards */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.75rem', paddingInlineStart: '0.5rem' }}>Photo / Image Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <CardComponent variant="default" padding={"none" as any}>
            <div style={{ height: 140, background: 'linear-gradient(135deg, oklch(35% 0.15 250), oklch(25% 0.1 300))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image" size="lg" style={{ color: 'oklch(100% 0 0 / 0.3)' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              <h4 style={{ margin: '0 0 0.375rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mountain Vista</h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>A breathtaking view of the alpine landscape at sunset.</p>
            </div>
          </CardComponent>

          <CardComponent variant="elevated" padding={"none" as any}>
            <div style={{ height: 140, background: 'linear-gradient(135deg, oklch(30% 0.12 180), oklch(20% 0.08 220))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="terminal" size="lg" style={{ color: 'oklch(100% 0 0 / 0.3)' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              <h4 style={{ margin: '0 0 0.375rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dev Environment</h4>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your cloud workspace is ready with all tools configured.</p>
              <Button size="xs" variant="primary">Open IDE</Button>
            </div>
          </CardComponent>

          <CardComponent variant="default" padding={"none" as any} {...(tier !== 'lite' ? { interactive: true } : {})}>
            <div style={{ height: 140, background: 'linear-gradient(135deg, oklch(28% 0.1 30), oklch(22% 0.06 60))', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="activity" size="lg" style={{ color: 'oklch(100% 0 0 / 0.3)' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.125rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Analytics</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Updated 2m ago</span>
              </div>
              <Icon name="arrow-right" size="sm" style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </CardComponent>
        </div>

        {/* Row 2: Metric & Trend cards */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.75rem', paddingInlineStart: '0.5rem' }}>Metric & Trend Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <CardComponent variant="default" padding="lg">
            <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Revenue</div>
            <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>$48.3K</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--status-ok)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <Icon name="arrow-up" size={14} /> 12.5%
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginInlineStart: '0.25rem' }}>vs last month</span>
            </div>
          </CardComponent>

          <CardComponent variant="default" padding="lg">
            <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Active Users</div>
            <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>2,847</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--status-warning)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <Icon name="arrow-down" size={14} /> 3.2%
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginInlineStart: '0.25rem' }}>this week</span>
            </div>
          </CardComponent>

          <CardComponent variant="default" padding="lg">
            <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Uptime</div>
            <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--status-ok)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>99.98<span style={{ fontSize: '0.5em', color: 'var(--text-tertiary)' }}>%</span></div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.75rem' }}>Last 30 days · SLA target 99.9%</div>
          </CardComponent>

          <CardComponent variant="elevated" padding="lg">
            <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Error Rate</div>
            <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--status-critical)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>0.42<span style={{ fontSize: '0.5em', color: 'var(--text-tertiary)' }}>%</span></div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--status-critical)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <Icon name="alert-triangle" size={14} /> Above 0.1% threshold
            </div>
          </CardComponent>
        </div>

        {/* Row 3: Metric with trendline — metric SUPERIMPOSED over the sparkline */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.75rem', paddingInlineStart: '0.5rem' }}>Metric + Trendline (superimposed)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* CPU — metric overlays the sparkline */}
          <CardComponent variant="default" padding={"none" as any}>
            <div style={{ position: 'relative', padding: '1.5rem', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Sparkline fills the entire card background */}
              <svg viewBox="0 0 200 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                <defs>
                  <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#cpuFill)" points="0,80 0,60 20,52 40,56 60,40 80,44 100,32 120,28 140,20 160,16 180,12 200,8 200,80" />
                <polyline fill="none" stroke="var(--brand)" strokeWidth="2.5" points="0,60 20,52 40,56 60,40 80,44 100,32 120,28 140,20 160,16 180,12 200,8" />
              </svg>
              {/* Content overlays the sparkline */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>CPU Usage</div>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>87.4<span style={{ fontSize: '0.4em', color: 'var(--text-tertiary)' }}>%</span></div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--status-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="arrow-up" size={14} /> 5.2%</span>
                <span style={{ color: 'var(--text-tertiary)' }}>last 24h</span>
              </div>
            </div>
          </CardComponent>

          {/* Network — metric overlays sparkline */}
          <CardComponent variant="default" padding={"none" as any}>
            <div style={{ position: 'relative', padding: '1.5rem', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <svg viewBox="0 0 200 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
                <defs>
                  <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--status-ok)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--status-ok)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#netFill)" points="0,80 0,40 20,44 40,36 60,40 80,38 100,42 120,36 140,40 160,38 180,40 200,36 200,80" />
                <polyline fill="none" stroke="var(--status-ok)" strokeWidth="2.5" points="0,40 20,44 40,36 60,40 80,38 100,42 120,36 140,40 160,38 180,40 200,36" />
              </svg>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>Network I/O</div>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>2.4<span style={{ fontSize: '0.4em', color: 'var(--text-tertiary)' }}> Gbps</span></div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--status-ok)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Icon name="activity" size={14} /> Stable</span>
                <span style={{ color: 'var(--text-tertiary)' }}>99.7% utilization</span>
              </div>
            </div>
          </CardComponent>
        </div>

        {/* Row 4: Profile & Action cards */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.75rem', paddingInlineStart: '0.5rem' }}>Profile & Action Cards</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <CardComponent variant="elevated" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0 }}>JD</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Jane Doe</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Senior Engineer · San Francisco</div>
              </div>
            </div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Building next-gen infrastructure with zero-dependency components.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="xs" variant="primary">Follow</Button>
              <Button size="xs" variant="secondary">Message</Button>
            </div>
          </CardComponent>

          <CardComponent variant={"outlined" as any} padding="md" {...(tier !== 'lite' ? { interactive: true } : {})}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
              <Icon name="upload" size="md" style={{ color: 'var(--brand)' }} />
              <strong style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Deploy to Production</strong>
            </div>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Push the latest build to production servers with zero-downtime rolling update.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="xs" variant="primary" icon={<Icon name="zap" size="sm" />}>Deploy Now</Button>
              <Button size="xs" variant={"ghost" as any}>Schedule</Button>
            </div>
          </CardComponent>
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="card-page__section" id="tiers">
        <h2 className="card-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="card-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits interactive, as, outlined/ghost variants, and motion props).
        </p>

        <div className="card-page__tiers">
          {/* Lite */}
          <div
            className={`card-page__tier-card${tier === 'lite' ? ' card-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Lite</span>
              <span className="card-page__tier-size">~1 KB</span>
            </div>
            <p className="card-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              Two variants (default, elevated), no interactive mode, no polymorphic as.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="card-page__tier-preview">
              <LiteCard variant="elevated" padding="sm" style={{ width: '100%' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Lite Card</h4>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Minimal footprint, CSS-only styling.</p>
              </LiteCard>
            </div>
            <div className="card-page__size-breakdown">
              <div className="card-page__size-row">
                <span>JS: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ CSS: <strong style={{ color: 'var(--text-primary)' }}>0.8 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>~1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`card-page__tier-card${tier === 'standard' ? ' card-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Standard</span>
              <span className="card-page__tier-size">~2 KB</span>
            </div>
            <p className="card-page__tier-desc">
              Full-featured card with four variants, interactive hover,
              polymorphic as, motion levels, and aurora glow styling.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="card-page__tier-preview">
              <Card variant="elevated" padding="sm" interactive style={{ width: '100%' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Standard Card</h4>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Full variants, interactive hover, aurora glow.</p>
              </Card>
            </div>
            <div className="card-page__size-breakdown">
              <div className="card-page__size-row">
                <span>Component + styles: <strong style={{ color: 'var(--text-primary)' }}>~2 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>~2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`card-page__tier-card${tier === 'premium' ? ' card-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Premium</span>
              <span className="card-page__tier-size">~3.5 KB</span>
            </div>
            <p className="card-page__tier-desc">
              Everything in Standard plus 3D tilt on hover,
              cursor-tracking glow, and entrance animation.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="card-page__tier-preview">
              <PremiumCard variant="elevated" padding="sm" interactive style={{ width: '100%' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Premium Card</h4>
                <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>3D tilt, cursor glow, entrance animation.</p>
              </PremiumCard>
            </div>
            <div className="card-page__size-breakdown">
              <div className="card-page__size-row">
                <span>Standard + effects: <strong style={{ color: 'var(--text-primary)' }}>~3.5 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>~3.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="card-page__section" id="brand-color">
        <h2 className="card-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="card-page__section-desc">
          Pick a brand color to see all cards update in real-time. The theme generates
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
          <div className="card-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`card-page__color-preset${brandColor === p.hex ? ' card-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant={"ghost" as any} onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="card-page__section" id="props">
        <h2 className="card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="card-page__section-desc">
          All props accepted by Card. It also spreads any native HTML attributes
          onto the underlying element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={cardProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="card-page__section" id="accessibility">
        <h2 className="card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="card-page__section-desc">
          Card follows semantic HTML practices with container query support for responsive content.
        </p>
        <Card variant="default" padding="md">
          <ul className="card-page__a11y-list">
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic:</strong> Polymorphic <code className="card-page__a11y-key">as</code> prop renders the correct HTML element (article, section, a).
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Interactive cards receive visible focus ring with brand-colored glow via <code className="card-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variants meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI boundaries).
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="card-page__a11y-key">prefers-reduced-motion</code> and motion level cascade.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Container queries:</strong> Content adapts to container width, not viewport -- works in zoom and magnification.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Links:</strong> When rendered as <code className="card-page__a11y-key">{'<a>'}</code>, fully accessible link semantics with href, target, rel support.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="card-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
