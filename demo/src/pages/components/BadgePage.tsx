'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Badge } from '@ui/components/badge'
import { Badge as LiteBadge } from '@ui/lite/badge'
import { Badge as PremiumBadge } from '@ui/premium/badge'
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
    @scope (.badge-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: badge-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .badge-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .badge-page__hero::before {
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
        .badge-page__hero::before { animation: none; }
      }

      .badge-page__title {
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

      .badge-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .badge-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .badge-page__import-code {
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

      .badge-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .badge-page__section {
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
        .badge-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .badge-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .badge-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .badge-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .badge-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .badge-page__preview {
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
      .badge-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .badge-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .badge-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .badge-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .badge-page__playground {
          grid-template-columns: 1fr;
        }
        .badge-page__playground-controls {
          position: static !important;
        }
      }

      @container badge-page (max-width: 680px) {
        .badge-page__playground {
          grid-template-columns: 1fr;
        }
        .badge-page__playground-controls {
          position: static !important;
        }
      }

      .badge-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .badge-page__playground-result {
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

      /* Dot grid for playground result */
      .badge-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .badge-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .badge-page__playground-controls {
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

      .badge-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .badge-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .badge-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .badge-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: background 0.12s, color 0.12s, border-color 0.12s, box-shadow 0.12s;
        line-height: 1.4;
      }
      .badge-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .badge-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .badge-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .badge-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .badge-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .badge-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .badge-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .badge-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .badge-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .badge-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .badge-page__state-cell {
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
      .badge-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .badge-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .badge-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .badge-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .badge-page__tier-card {
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

      .badge-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .badge-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .badge-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .badge-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .badge-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .badge-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .badge-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .badge-page__tier-import {
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

      .badge-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .badge-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .badge-page__color-preset {
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
      .badge-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .badge-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .badge-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .badge-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .badge-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .badge-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .badge-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .badge-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .badge-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .badge-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .badge-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .badge-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .badge-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .badge-page__size-note {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .badge-page__hero {
          padding: 2rem 1.25rem;
        }

        .badge-page__title {
          font-size: 1.75rem;
        }

        .badge-page__preview {
          padding: 1.75rem;
        }

        .badge-page__playground {
          grid-template-columns: 1fr;
        }

        .badge-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .badge-page__labeled-row {
          gap: 1rem;
        }

        .badge-page__tier-selector {
          flex-wrap: wrap;
          inline-size: 100%;
        }

        .badge-page__tier-btn {
          flex: 1;
          min-inline-size: 0;
        }

        .badge-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .badge-page__tiers {
          grid-template-columns: 1fr;
        }

        .badge-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .badge-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .badge-page__hero {
          padding: 1.5rem 1rem;
        }

        .badge-page__title {
          font-size: 1.5rem;
        }

        .badge-page__preview {
          padding: 1rem;
        }

        .badge-page__states-grid {
          grid-template-columns: 1fr;
        }

        .badge-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .badge-page__title {
          font-size: 4rem;
        }

        .badge-page__preview {
          padding: 3.5rem;
        }

        .badge-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .badge-page__import-code,
      .badge-page code,
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

const badgeProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Semantic color variant controlling background, text, and border colors.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and overall badge dimensions.' },
  { name: 'dot', type: 'boolean', default: 'false', description: 'Shows a small colored dot indicator inside the badge.' },
  { name: 'pulse', type: 'boolean', default: 'false', description: 'Adds a pulsing animation to the dot indicator. Requires motion level 2+.' },
  { name: 'count', type: 'number', description: 'Display a numeric count instead of children. When set, replaces children content.' },
  { name: 'maxCount', type: 'number', default: '99', description: 'Maximum count before showing overflow (e.g. "99+"). Only applies when count is set.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element rendered before the badge content.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Badge label content. Overridden by count prop when set.' },
  { name: 'ref', type: 'Ref<HTMLSpanElement>', description: 'Forwarded ref to the underlying <span> element.' },
  { name: 'removable', type: 'boolean', default: 'false', description: 'Shows a remove (X) button.' },
  { name: 'onRemove', type: '() => void', description: 'Called when remove button is clicked.' },
  { name: 'outline', type: 'boolean', default: 'false', description: 'Outline variant with transparent background.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type LiteSize = 'xs' | 'sm' | 'md'

const VARIANTS: Variant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const LITE_SIZES: LiteSize[] = ['xs', 'sm', 'md']

const IMPORT_STRINGS: Record<string, string> = {
  lite: "import { Badge } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Badge } from '@annondeveloper/ui-kit'",
  premium: "import { Badge } from '@annondeveloper/ui-kit/premium'",
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
      variant={"secondary" as any}
      className="badge-page__copy-btn"
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
    <div className="badge-page__control-group">
      <span className="badge-page__control-label">{label}</span>
      <div className="badge-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`badge-page__option-btn${opt === value ? ' badge-page__option-btn--active' : ''}`}
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
    <label className="badge-page__toggle-label">
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
  variant: Variant,
  size: Size,
  label: string,
  dot: boolean,
  pulse: boolean,
  showIcon: boolean,
  count: number | undefined,
  maxCount: number,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier] || IMPORT_STRINGS.standard
  const iconImport = showIcon && tier !== 'lite' ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = []
  if (variant !== 'default') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (dot && tier !== 'lite') props.push('  dot')
  if (pulse && tier !== 'lite') props.push('  pulse')
  if (count !== undefined) props.push(`  count={${count}}`)
  if (maxCount !== 99 && count !== undefined) props.push(`  maxCount={${maxCount}}`)
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="check" size="sm" />}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const hasChildren = label && count === undefined
  const jsx = props.length === 0
    ? `<Badge>${hasChildren ? label : ''}</Badge>`
    : hasChildren
      ? `<Badge\n${props.join('\n')}\n>${label}</Badge>`
      : `<Badge\n${props.join('\n')}\n/>`

  return `${importStr}${iconImport}\n\n${jsx}`
}

function generateHtmlCssCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  label: string,
  dot: boolean,
  pulse: boolean,
  count: number | undefined,
  maxCount: number,
  motion: number,
): string {
  const className = tier === 'lite' ? 'ui-lite-badge' : 'ui-badge'
  const tierLabel = tier === 'lite' ? 'lite' : 'standard'
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/badge.css';`

  const displayCount = count !== undefined
    ? count > maxCount ? `${maxCount}+` : String(count)
    : null
  const content = displayCount ?? label

  if (tier === 'lite') {
    return `<!-- Badge — @annondeveloper/ui-kit lite tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">

<span class="${className}" data-variant="${variant}" data-size="${size}">
  ${content}
</span>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
  }

  const dotHtml = dot
    ? `\n  <span class="ui-badge__dot"${pulse ? ' data-pulse="true"' : ''}></span>`
    : ''

  return `<!-- Badge — @annondeveloper/ui-kit ${tierLabel} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/badge.css">

<span class="${className}" data-variant="${variant}" data-size="${size}" data-motion="${motion}">${dotHtml}
  ${content}
</span>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(tier: Tier, variant: Variant, size: Size, label: string, dot: boolean, pulse: boolean, count: number | undefined): string {
  if (tier === 'lite') {
    const attrs: string[] = [`class="ui-lite-badge"`, `data-variant="${variant}"`, `data-size="${size}"`]
    const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
    const content = displayCount ?? label
    return `<template>\n  <span ${attrs.join(' ')}>\n    ${content}\n  </span>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const attrs: string[] = []
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (dot) attrs.push('  dot')
  if (pulse) attrs.push('  pulse')
  if (count !== undefined) attrs.push(`  :count="${count}"`)

  const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
  const content = displayCount ?? label

  const template = attrs.length === 0
    ? `  <Badge>${content}</Badge>`
    : `  <Badge\n  ${attrs.join('\n  ')}\n  >${content}</Badge>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Badge } from '@annondeveloper/ui-kit'\n</script>`
}

function generateAngularCode(tier: Tier, variant: Variant, size: Size, label: string, dot: boolean, count: number | undefined): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-badge"`, `data-variant="${variant}"`, `data-size="${size}"`]
    const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
    const content = displayCount ?? label
    return `<!-- Angular — Lite tier (CSS-only) -->\n<span ${attrs.join(' ')}>\n  ${content}\n</span>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  const attrs = [`class="ui-badge"`, `data-variant="${variant}"`, `data-size="${size}"`]
  const dotHtml = dot ? `\n  <span class="ui-badge__dot"></span>` : ''
  const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
  const content = displayCount ?? label

  return `<!-- Angular — Standard tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<span\n  ${attrs.join('\n  ')}\n>${dotHtml}\n  ${content}\n</span>\n\n/* Import component CSS */\n@import '@annondeveloper/ui-kit/css/components/badge.css';`
}

function generateSvelteCode(tier: Tier, variant: Variant, size: Size, label: string, dot: boolean, pulse: boolean, count: number | undefined): string {
  if (tier === 'lite') {
    const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
    const content = displayCount ?? label
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<span\n  class="ui-lite-badge"\n  data-variant="${variant}"\n  data-size="${size}"\n>\n  ${content}\n</span>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const attrs: string[] = []
  if (variant !== 'default') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (dot) attrs.push('  dot')
  if (pulse) attrs.push('  pulse')
  if (count !== undefined) attrs.push(`  count={${count}}`)

  const displayCount = count !== undefined ? (count > 99 ? '99+' : String(count)) : null
  const content = displayCount ?? label

  const propsStr = attrs.length > 0 ? `\n${attrs.join('\n')}\n` : ''
  return `<script>\n  import { Badge } from '@annondeveloper/ui-kit';\n</script>\n\n<Badge${propsStr}>\n  ${content}\n</Badge>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [variant, setVariant] = useState<Variant>('primary')
  const [size, setSize] = useState<Size>('md')
  const [dot, setDot] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [count, setCount] = useState<number | undefined>(undefined)
  const [countInput, setCountInput] = useState('')
  const [maxCount, setMaxCount] = useState(99)
  const [maxCountInput, setMaxCountInput] = useState('99')
  const [label, setLabel] = useState('New')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const BadgeComponent = tier === 'premium' ? PremiumBadge : tier === 'lite' ? LiteBadge : Badge

  // Clamp size for lite tier
  const effectiveSize = tier === 'lite' && !LITE_SIZES.includes(size as LiteSize) ? 'md' : size

  const reactCode = useMemo(
    () => generateReactCode(tier, variant, effectiveSize, label, dot, pulse, showIcon, count, maxCount, motion),
    [tier, variant, effectiveSize, label, dot, pulse, showIcon, count, maxCount, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCssCode(tier, variant, effectiveSize, label, dot, pulse, count, maxCount, motion),
    [tier, variant, effectiveSize, label, dot, pulse, count, maxCount, motion],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, variant, effectiveSize, label, dot, pulse, count),
    [tier, variant, effectiveSize, label, dot, pulse, count],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, variant, effectiveSize, label, dot, count),
    [tier, variant, effectiveSize, label, dot, count],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, variant, effectiveSize, label, dot, pulse, count),
    [tier, variant, effectiveSize, label, dot, pulse, count],
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
    size: effectiveSize,
  }
  if (tier !== 'lite') {
    previewProps.dot = dot
    previewProps.pulse = pulse
    previewProps.icon = showIcon ? <Icon name="check" size="sm" /> : undefined
    previewProps.count = count
    previewProps.maxCount = maxCount
    previewProps.motion = motion
  }

  return (
    <section className="badge-page__section" id="playground">
      <h2 className="badge-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="badge-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="badge-page__playground">
        {/* Preview area — left / top */}
        <div className="badge-page__playground-preview">
          <div className="badge-page__playground-result">
            <BadgeComponent {...previewProps}>{count === undefined ? label : undefined}</BadgeComponent>
          </div>

          {/* Tabbed code output */}
          <div className="badge-page__code-tabs">
            <div className="badge-page__export-row">
              <Button
                size="xs"
                variant={"secondary" as any}
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
              {copyStatus && <span className="badge-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel — right / bottom */}
        <div className="badge-page__playground-controls">
          <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
          <OptionGroup
            label="Size"
            options={tier === 'lite' ? LITE_SIZES : SIZES}
            value={effectiveSize as any}
            onChange={(v) => setSize(v as Size)}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="badge-page__control-group">
            <span className="badge-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Dot" checked={dot} onChange={setDot} />}
              {tier !== 'lite' && <Toggle label="Pulse" checked={pulse} onChange={setPulse} />}
              {tier !== 'lite' && <Toggle label="Icon" checked={showIcon} onChange={setShowIcon} />}
            </div>
          </div>

          <div className="badge-page__control-group">
            <span className="badge-page__control-label">Count</span>
            <input
              type="number"
              value={countInput}
              onChange={e => {
                setCountInput(e.target.value)
                const val = e.target.value.trim()
                setCount(val === '' ? undefined : Number(val))
              }}
              className="badge-page__text-input"
              placeholder="Leave empty for text label"
              min={0}
            />
          </div>

          <div className="badge-page__control-group">
            <span className="badge-page__control-label">Max Count</span>
            <input
              type="number"
              value={maxCountInput}
              onChange={e => {
                setMaxCountInput(e.target.value)
                const val = Number(e.target.value)
                if (!isNaN(val) && val > 0) setMaxCount(val)
              }}
              className="badge-page__text-input"
              placeholder="99"
              min={1}
            />
          </div>

          <div className="badge-page__control-group">
            <span className="badge-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="badge-page__text-input"
              placeholder="Badge label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BadgePage() {
  useStyles('badge-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()
  const [removableTags, setRemovableTags] = useState(['React', 'TypeScript', 'Node.js', 'CSS', 'Rust'])

  // tier removed — premium is now a real tier

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
    const sections = document.querySelectorAll('.badge-page__section')
    if (!sections.length) return

    // Check if CSS animation-timeline is supported
    if (CSS.supports?.('animation-timeline', 'view()')) return // CSS handles it

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

  const BadgeComponent = tier === 'premium' ? PremiumBadge : tier === 'lite' ? LiteBadge : Badge

  return (
    <div className="badge-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="badge-page__hero">
        <h1 className="badge-page__title">Badge</h1>
        <p className="badge-page__desc">
          Compact status indicator with variant colors, dot indicators, pulse animations, count display, and icon support.
          Ships in two weight tiers from a CSS-only lite to a full-featured standard with motion.
        </p>
        <div className="badge-page__import-row">
          <code className="badge-page__import-code">{IMPORT_STRINGS[tier] || IMPORT_STRINGS.standard}</code>
          <CopyButton text={IMPORT_STRINGS[tier] || IMPORT_STRINGS.standard} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Variants ────────────────────────────── */}
      <section className="badge-page__section" id="variants">
        <h2 className="badge-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="badge-page__section-desc">
          Six built-in semantic variants for status indication, categorization, and visual hierarchy.
        </p>
        <div className="badge-page__preview">
          <div className="badge-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="badge-page__labeled-item">
                <BadgeComponent variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</BadgeComponent>
                <span className="badge-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Size Scale ───────────────────────────────── */}
      <section className="badge-page__section" id="sizes">
        <h2 className="badge-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="badge-page__section-desc">
          {tier === 'lite'
            ? 'Three sizes for the lite tier: compact (xs), small (sm), and medium (md).'
            : 'Five sizes from compact inline labels (xs) to large prominent badges (xl). Sizes control padding and font-size.'}
        </p>
        <div className="badge-page__preview">
          <div className="badge-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {(tier === 'lite' ? LITE_SIZES : SIZES).map(s => (
              <div key={s} className="badge-page__labeled-item">
                <BadgeComponent variant="primary" size={s as any}>Badge</BadgeComponent>
                <span className="badge-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="badge-page__section" id="states">
        <h2 className="badge-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="badge-page__section-desc">
          Badges support several display modes including dot indicators, pulse animations, counts, and icons.
        </p>
        <div className="badge-page__states-grid">
          <div className="badge-page__state-cell">
            <BadgeComponent variant="primary">Default</BadgeComponent>
            <span className="badge-page__state-label">Default</span>
          </div>
          {tier !== 'lite' && (
            <div className="badge-page__state-cell">
              <Badge variant="primary" dot>With Dot</Badge>
              <span className="badge-page__state-label">Dot</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="badge-page__state-cell">
              <Badge variant="danger" dot pulse>Pulse</Badge>
              <span className="badge-page__state-label">Pulse</span>
              <span className="badge-page__state-hint">animated dot</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="badge-page__state-cell">
              <Badge variant="primary" count={5}>Count</Badge>
              <span className="badge-page__state-label">Count</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="badge-page__state-cell">
              <Badge variant="primary" icon={<Icon name="check" size="sm" />}>Verified</Badge>
              <span className="badge-page__state-label">With Icon</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="badge-page__state-cell">
              <Badge variant="danger" count={150} maxCount={99} />
              <span className="badge-page__state-label">Overflow</span>
              <span className="badge-page__state-hint">count &gt; maxCount</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6a. Dot Indicator ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="badge-page__section" id="dot">
          <h2 className="badge-page__section-title">
            <a href="#dot">Dot Indicator</a>
          </h2>
          <p className="badge-page__section-desc">
            Add a small colored dot to visually mark status. The dot inherits the variant color via <code>currentColor</code>.
          </p>
          <div className="badge-page__preview">
            <div className="badge-page__labeled-row">
              {VARIANTS.map(v => (
                <div key={v} className="badge-page__labeled-item">
                  <Badge variant={v} dot>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>
                  <span className="badge-page__item-label">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Badge variant="success" dot>Online</Badge>\n<Badge variant="danger" dot>Offline</Badge>\n<Badge variant="warning" dot>Away</Badge>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6b. Pulse Animation ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="badge-page__section" id="pulse">
          <h2 className="badge-page__section-title">
            <a href="#pulse">Pulse Animation</a>
          </h2>
          <p className="badge-page__section-desc">
            Combine <code>dot</code> and <code>pulse</code> for an animated attention indicator.
            The pulse animation requires motion level 2 or higher and respects <code>prefers-reduced-motion</code>.
          </p>
          <div className="badge-page__preview">
            <div className="badge-page__labeled-row">
              <div className="badge-page__labeled-item">
                <Badge variant="success" dot pulse>Live</Badge>
                <span className="badge-page__item-label">success</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="danger" dot pulse>Alert</Badge>
                <span className="badge-page__item-label">danger</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="info" dot pulse>Syncing</Badge>
                <span className="badge-page__item-label">info</span>
              </div>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Badge variant="success" dot pulse>Live</Badge>\n<Badge variant="danger" dot pulse>Alert</Badge>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6c. Count Badge ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="badge-page__section" id="count">
          <h2 className="badge-page__section-title">
            <a href="#count">Count Badge</a>
          </h2>
          <p className="badge-page__section-desc">
            Display a numeric count. When <code>count</code> exceeds <code>maxCount</code> (default 99),
            it displays as "99+". The count prop takes priority over children.
          </p>
          <div className="badge-page__preview">
            <div className="badge-page__labeled-row">
              <div className="badge-page__labeled-item">
                <Badge variant="primary" count={3} />
                <span className="badge-page__item-label">count=3</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="primary" count={42} />
                <span className="badge-page__item-label">count=42</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="danger" count={99} />
                <span className="badge-page__item-label">count=99</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="danger" count={150} maxCount={99} />
                <span className="badge-page__item-label">99+</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="warning" count={999} maxCount={999} />
                <span className="badge-page__item-label">maxCount=999</span>
              </div>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Badge variant="primary" count={3} />\n<Badge variant="danger" count={150} maxCount={99} /> {/* Shows "99+" */}\n<Badge variant="warning" count={999} maxCount={999} />`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6d. With Icons ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="badge-page__section" id="icons">
          <h2 className="badge-page__section-title">
            <a href="#icons">With Icons</a>
          </h2>
          <p className="badge-page__section-desc">
            Add a leading icon element. Icons automatically scale to match the badge font-size via <code>1em</code> sizing.
          </p>
          <div className="badge-page__preview">
            <div className="badge-page__labeled-row">
              <div className="badge-page__labeled-item">
                <Badge variant="success" icon={<Icon name="check" size="sm" />}>Verified</Badge>
                <span className="badge-page__item-label">check</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="danger" icon={<Icon name="x" size="sm" />}>Error</Badge>
                <span className="badge-page__item-label">x</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="info" icon={<Icon name="info" size="sm" />}>Info</Badge>
                <span className="badge-page__item-label">info</span>
              </div>
              <div className="badge-page__labeled-item">
                <Badge variant="warning" icon={<Icon name="alert-triangle" size="sm" />}>Warn</Badge>
                <span className="badge-page__item-label">warning</span>
              </div>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<Badge variant="success" icon={<Icon name="check" size="sm" />}>Verified</Badge>\n<Badge variant="danger" icon={<Icon name="x" size="sm" />}>Error</Badge>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6b. Removable Badges ───────────────────────── */}
      {tier !== 'lite' && (
        <section className="badge-page__section" id="removable">
          <h2 className="badge-page__section-title">
            <a href="#removable">Removable</a>
          </h2>
          <p className="badge-page__section-desc">
            Set <code>removable</code> to show a close button on the badge.
            Pair with <code>onRemove</code> to handle removal. Useful for tag inputs,
            filter chips, and selected item lists.
          </p>
          <div className="badge-page__preview" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
            {removableTags.map(tag => (
              <BadgeComponent
                key={tag}
                variant="primary"
                removable
                onRemove={() => setRemovableTags(prev => prev.filter(t => t !== tag))}
              >
                {tag}
              </BadgeComponent>
            ))}
            {removableTags.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>All removed!</span>
                <Button size="xs" variant={"secondary" as any} onClick={() => setRemovableTags(['React', 'TypeScript', 'Node.js', 'CSS', 'Rust'])}>
                  Reset Tags
                </Button>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
            Click the X on each badge to remove it.
          </p>
          <div style={{ marginBlockStart: '0.75rem' }}>
            <CopyBlock
              code={`const [tags, setTags] = useState(['React', 'TypeScript', 'Node.js'])

{tags.map(tag => (
  <Badge
    key={tag}
    removable
    onRemove={() => setTags(prev => prev.filter(t => t !== tag))}
  >
    {tag}
  </Badge>
))}`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 6c. Outline Variant ─────────────────────────── */}
      <section className="badge-page__section" id="outline">
        <h2 className="badge-page__section-title">
          <a href="#outline">Outline</a>
        </h2>
        <p className="badge-page__section-desc">
          Use the <code>outline</code> prop to render badges with a transparent background
          and colored border. Creates a lighter visual weight while maintaining the same color semantics.
        </p>
        <div className="badge-page__preview" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const).map(v => (
            <BadgeComponent key={v} variant={v} outline>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </BadgeComponent>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockStart: '0.75rem' }}>
          Compare: filled vs. outline side by side.
        </p>
        <div className="badge-page__preview" style={{ gap: '0.75rem', marginBlockStart: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <BadgeComponent variant="primary">Filled</BadgeComponent>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>default</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <BadgeComponent variant="primary" outline>Outline</BadgeComponent>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>outline</span>
          </div>
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<Badge variant="primary" outline>\n  Outline Badge\n</Badge>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="badge-page__section" id="tiers">
        <h2 className="badge-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="badge-page__section-desc">
          Choose between three weight tiers. Lite is CSS-only with no JavaScript beyond a forwardRef wrapper.
          Standard adds dot, pulse, count, icon, and motion support. Premium adds ambient glow, spring-scale entrance, and enhanced pulse.
        </p>

        <div className="badge-page__tiers">
          {/* Lite */}
          <div
            className={`badge-page__tier-card${tier === 'lite' ? ' badge-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="badge-page__tier-header">
              <span className="badge-page__tier-name">Lite</span>
              <span className="badge-page__tier-size">~0.2 KB</span>
            </div>
            <p className="badge-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No dot, pulse, count, icon, or motion support. Supports 3 sizes (xs/sm/md).
            </p>
            <div className="badge-page__tier-import">
              import {'{'} Badge {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="badge-page__tier-preview">
              <LiteBadge variant="primary">Lite Badge</LiteBadge>
            </div>
            <div className="badge-page__size-breakdown">
              <div className="badge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`badge-page__tier-card${tier === 'standard' ? ' badge-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="badge-page__tier-header">
              <span className="badge-page__tier-name">Standard</span>
              <span className="badge-page__tier-size">~1.5 KB</span>
            </div>
            <p className="badge-page__tier-desc">
              Full-featured badge with dot indicators, pulse animation,
              count display, icon support, and motion levels.
            </p>
            <div className="badge-page__tier-import">
              import {'{'} Badge {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="badge-page__tier-preview">
              <Badge variant="primary" dot pulse icon={<Icon name="check" size="sm" />}>Standard</Badge>
            </div>
            <div className="badge-page__size-breakdown">
              <div className="badge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`badge-page__tier-card${tier === 'premium' ? ' badge-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="badge-page__tier-header">
              <span className="badge-page__tier-name">Premium</span>
              <span className="badge-page__tier-size">~1.7 KB</span>
            </div>
            <p className="badge-page__tier-desc">
              Ambient glow matching variant color, spring-scale entrance animation,
              and enhanced pulse effect. Wraps Standard with premium CSS layer.
            </p>
            <div className="badge-page__tier-import">
              import {'{'} Badge {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="badge-page__tier-preview">
              <PremiumBadge variant="primary" dot pulse icon={<Icon name="check" size="sm" />}>Premium</PremiumBadge>
            </div>
            <div className="badge-page__size-breakdown">
              <div className="badge-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.7 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="badge-page__section" id="brand-color">
        <h2 className="badge-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="badge-page__section-desc">
          Pick a brand color to see all badges update in real-time. The theme generates
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
          <div className="badge-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`badge-page__color-preset${brandColor === p.hex ? ' badge-page__color-preset--active' : ''}`}
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
      <section className="badge-page__section" id="props">
        <h2 className="badge-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="badge-page__section-desc">
          All props accepted by Badge. It also spreads any native span HTML attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={badgeProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="badge-page__section" id="accessibility">
        <h2 className="badge-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="badge-page__section-desc">
          Built on a semantic {'<span>'} element with comprehensive visual accessibility support.
        </p>
        <Card variant="default" padding="md">
          <ul className="badge-page__a11y-list">
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Uses a <code className="badge-page__a11y-key">{'<span>'}</code> element — non-interactive by default. Add <code className="badge-page__a11y-key">role</code> and keyboard handling if made interactive.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All variant colors meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI) against their backgrounds.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Pulse animation respects <code className="badge-page__a11y-key">prefers-reduced-motion</code> and only runs at motion level 2+.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 28px minimum on coarse pointer devices via <code className="badge-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="badge-page__a11y-key">forced-colors: active</code> with visible 1px borders.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Disables animations and adds solid borders for print media.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Count overflow:</strong> When count exceeds maxCount, displays "{'>'}maxCount+" (e.g. "99+") to keep the badge compact.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
