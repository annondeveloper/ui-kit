'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Dialog } from '@ui/components/dialog'
import { Dialog as LiteDialog } from '@ui/lite/dialog'
import { Dialog as PremiumDialog } from '@ui/premium/dialog'
import { ConfirmDialog } from '@ui/components/confirm-dialog'
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
    @scope (.dialog-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: dialog-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .dialog-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .dialog-page__hero::before {
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
        animation: dialog-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes dialog-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .dialog-page__hero::before { animation: none; }
      }

      .dialog-page__title {
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

      .dialog-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .dialog-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dialog-page__import-code {
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

      .dialog-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .dialog-page__section {
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
        animation: dialog-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes dialog-section-reveal {
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
        .dialog-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .dialog-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .dialog-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .dialog-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .dialog-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .dialog-page__preview {
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
      .dialog-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .dialog-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .dialog-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .dialog-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .dialog-page__playground {
          grid-template-columns: 1fr;
        }
        .dialog-page__playground-controls {
          position: static !important;
        }
      }

      @container dialog-page (max-width: 680px) {
        .dialog-page__playground {
          grid-template-columns: 1fr;
        }
        .dialog-page__playground-controls {
          position: static !important;
        }
      }

      .dialog-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dialog-page__playground-result {
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
      .dialog-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .dialog-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .dialog-page__playground-controls {
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

      .dialog-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dialog-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dialog-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .dialog-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: border-color 0.12s, color 0.12s, background 0.12s, box-shadow 0.12s;
        line-height: 1.4;
      }
      .dialog-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .dialog-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .dialog-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dialog-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .dialog-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .dialog-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .dialog-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .dialog-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .dialog-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .dialog-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .dialog-page__tier-card {
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

      .dialog-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .dialog-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .dialog-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .dialog-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .dialog-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .dialog-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .dialog-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .dialog-page__tier-import {
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

      .dialog-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .dialog-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .dialog-page__color-preset {
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
      .dialog-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .dialog-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .dialog-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .dialog-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .dialog-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .dialog-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .dialog-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .dialog-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .dialog-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .dialog-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .dialog-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .dialog-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .dialog-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dialog-page__size-note {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      /* ── Feature sub-sections ──────────────────────── */

      .dialog-page__feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .dialog-page__feature-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .dialog-page__feature-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .dialog-page__feature-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .dialog-page__hero {
          padding: 2rem 1.25rem;
        }

        .dialog-page__title {
          font-size: 1.75rem;
        }

        .dialog-page__preview {
          padding: 1.75rem;
        }

        .dialog-page__playground {
          grid-template-columns: 1fr;
        }

        .dialog-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .dialog-page__labeled-row {
          gap: 1rem;
        }

        .dialog-page__tiers {
          grid-template-columns: 1fr;
        }

        .dialog-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .dialog-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .dialog-page__hero {
          padding: 1.5rem 1rem;
        }

        .dialog-page__title {
          font-size: 1.5rem;
        }

        .dialog-page__preview {
          padding: 1rem;
        }

        .dialog-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .dialog-page__title {
          font-size: 4rem;
        }

        .dialog-page__preview {
          padding: 3.5rem;
        }

        .dialog-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .dialog-page__import-code,
      .dialog-page code,
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

const dialogProps: PropDef[] = [
  { name: 'open', type: 'boolean', description: 'Whether the dialog is open.' },
  { name: 'onClose', type: '() => void', description: 'Called when the dialog should close (overlay click, escape key, or close button).' },
  { name: 'title', type: 'ReactNode', description: 'Title text displayed in the dialog header.' },
  { name: 'description', type: 'string', description: 'Description text below the title. Standard/Premium only.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Controls max-width. Lite supports sm/md/lg only.' },
  { name: 'closeOnOverlay', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop overlay. Standard/Premium only.' },
  { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Close when pressing the Escape key. Standard/Premium only.' },
  { name: 'showClose', type: 'boolean', default: 'true', description: 'Show the close button in the header. Standard/Premium only.' },
  { name: 'children', type: 'ReactNode', description: 'Content rendered inside the dialog body.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Standard/Premium only.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

const confirmDialogProps: PropDef[] = [
  { name: 'open', type: 'boolean', description: 'Whether the confirm dialog is open.' },
  { name: 'onConfirm', type: '() => void', description: 'Called when the confirm button is clicked.' },
  { name: 'onCancel', type: '() => void', description: 'Called when the cancel button or close action is triggered.' },
  { name: 'title', type: 'ReactNode', description: 'Title text displayed in the dialog header.' },
  { name: 'description', type: 'ReactNode', description: 'Description text displayed in the dialog body.' },
  { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Label for the confirm button.' },
  { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Label for the cancel button.' },
  { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Visual variant. Danger variant uses a red confirm button.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows loading state on the confirm button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg' | 'full'
type LiteSize = 'sm' | 'md' | 'lg'

const SIZES_STANDARD: Size[] = ['sm', 'md', 'lg', 'full']
const SIZES_LITE: LiteSize[] = ['sm', 'md', 'lg']


const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Dialog } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Dialog } from '@annondeveloper/ui-kit'",
  premium: "import { Dialog } from '@annondeveloper/ui-kit/premium'",
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
      className="dialog-page__copy-btn"
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
    <div className="dialog-page__control-group">
      <span className="dialog-page__control-label">{label}</span>
      <div className="dialog-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`dialog-page__option-btn${opt === value ? ' dialog-page__option-btn--active' : ''}`}
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
    <label className="dialog-page__toggle-label">
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
  size: string,
  showTitle: boolean,
  titleText: string,
  showDescription: boolean,
  descriptionText: string,
  showClose: boolean,
  closeOnOverlay: boolean,
  closeOnEscape: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const props: string[] = [
      '  open={open}',
      '  onClose={() => setOpen(false)}',
    ]
    if (showTitle) props.push(`  title="${titleText}"`)
    if (size !== 'md') props.push(`  size="${size}"`)
    return `${importStr}\n\n<Dialog\n${props.join('\n')}\n>\n  <p>Your content here.</p>\n</Dialog>`
  }

  const props: string[] = [
    '  open={open}',
    '  onClose={() => setOpen(false)}',
  ]
  if (showTitle) props.push(`  title="${titleText}"`)
  if (showDescription) props.push(`  description="${descriptionText}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (!closeOnOverlay) props.push('  closeOnOverlay={false}')
  if (!closeOnEscape) props.push('  closeOnEscape={false}')
  if (!showClose) props.push('  showClose={false}')
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}\n\n<Dialog\n${props.join('\n')}\n>\n  <p>Your content here.</p>\n</Dialog>`
}

function generateHtmlCode(
  tier: Tier,
  size: string,
  showTitle: boolean,
  titleText: string,
  showDescription: boolean,
  descriptionText: string,
  showClose: boolean,
): string {
  if (tier === 'lite') {
    const headerHtml = showTitle
      ? `\n  <div class="ui-lite-dialog__header">\n    <h2>${titleText}</h2>\n    <button class="ui-lite-dialog__close" aria-label="Close">&times;</button>\n  </div>`
      : ''
    return `<dialog class="ui-lite-dialog" data-size="${size}">${headerHtml}\n  <div class="ui-lite-dialog__body">\n    <p>Your content here.</p>\n  </div>\n</dialog>\n\n<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">`
  }

  const headerParts: string[] = []
  if (showTitle || showClose) {
    headerParts.push('  <div class="ui-dialog__header">')
    headerParts.push('    <div class="ui-dialog__header-text">')
    if (showTitle) headerParts.push(`      <h2 class="ui-dialog__title">${titleText}</h2>`)
    if (showDescription) headerParts.push(`      <p class="ui-dialog__description">${descriptionText}</p>`)
    headerParts.push('    </div>')
    if (showClose) headerParts.push('    <button class="ui-dialog__close" aria-label="Close">&times;</button>')
    headerParts.push('  </div>')
  }

  return `<div class="ui-dialog">\n  <dialog data-size="${size}">\n${headerParts.join('\n')}\n    <div class="ui-dialog__body">\n      <p>Your content here.</p>\n    </div>\n  </dialog>\n</div>\n\n<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/dialog.css">`
}

function generateVueCode(
  tier: Tier,
  size: string,
  showTitle: boolean,
  titleText: string,
  showDescription: boolean,
  descriptionText: string,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-dialog"`, `data-size="${size}"`]
    return `<template>\n  <dialog ${attrs.join(' ')}>\n    ${showTitle ? `<div class="ui-lite-dialog__header">\n      <h2>${titleText}</h2>\n      <button class="ui-lite-dialog__close">&times;</button>\n    </div>\n    ` : ''}<div class="ui-lite-dialog__body">\n      <p>Your content here.</p>\n    </div>\n  </dialog>\n</template>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    '  :open="isOpen"',
    '  @close="isOpen = false"',
  ]
  if (showTitle) attrs.push(`  title="${titleText}"`)
  if (showDescription) attrs.push(`  description="${descriptionText}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)

  return `<template>\n  <Dialog\n  ${attrs.join('\n  ')}\n  >\n    <p>Your content here.</p>\n  </Dialog>\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { Dialog } from '${importPath}'\n\nconst isOpen = ref(false)\n</script>`
}

function generateAngularCode(
  tier: Tier,
  size: string,
  showTitle: boolean,
  titleText: string,
): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<dialog class="ui-lite-dialog" data-size="${size}">\n  ${showTitle ? `<div class="ui-lite-dialog__header">\n    <h2>${titleText}</h2>\n    <button class="ui-lite-dialog__close">&times;</button>\n  </div>\n  ` : ''}<div class="ui-lite-dialog__body">\n    <p>Your content here.</p>\n  </div>\n</dialog>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<!-- Use the React wrapper or CSS-only approach -->\n<div class="ui-dialog">\n  <dialog\n    data-size="${size}"\n    [open]="isOpen"\n  >\n    <div class="ui-dialog__header">\n      <div class="ui-dialog__header-text">\n        ${showTitle ? `<h2 class="ui-dialog__title">${titleText}</h2>` : ''}\n      </div>\n      <button class="ui-dialog__close" (click)="close()">&times;</button>\n    </div>\n    <div class="ui-dialog__body">\n      <p>Your content here.</p>\n    </div>\n  </dialog>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/dialog.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: string,
  showTitle: boolean,
  titleText: string,
  showDescription: boolean,
  descriptionText: string,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<dialog\n  class="ui-lite-dialog"\n  data-size="${size}"\n>\n  ${showTitle ? `<div class="ui-lite-dialog__header">\n    <h2>${titleText}</h2>\n    <button class="ui-lite-dialog__close" on:click={() => open = false}>&times;</button>\n  </div>\n  ` : ''}<div class="ui-lite-dialog__body">\n    <p>Your content here.</p>\n  </div>\n</dialog>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    `  open={isOpen}`,
    `  onClose={() => isOpen = false}`,
  ]
  if (showTitle) attrs.push(`  title="${titleText}"`)
  if (showDescription) attrs.push(`  description="${descriptionText}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)

  return `<script>\n  import { Dialog } from '${importPath}';\n  let isOpen = false;\n</script>\n\n<Dialog\n${attrs.join('\n')}\n>\n  <p>Your content here.</p>\n</Dialog>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<string>('md')
  const [showTitle, setShowTitle] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [showClose, setShowClose] = useState(true)
  const [closeOnOverlay, setCloseOnOverlay] = useState(true)
  const [closeOnEscape, setCloseOnEscape] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [titleText, setTitleText] = useState('Dialog Title')
  const [descriptionText, setDescriptionText] = useState('This is a description of the dialog content.')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  // Reset size if switching to lite and full is selected
  useEffect(() => {
    if (tier === 'lite' && size === 'full') {
      setSize('md')
    }
  }, [tier, size])

  const sizeOptions = tier === 'lite' ? SIZES_LITE : SIZES_STANDARD

  const reactCode = useMemo(
    () => generateReactCode(tier, size, showTitle, titleText, showDescription, descriptionText, showClose, closeOnOverlay, closeOnEscape, motion),
    [tier, size, showTitle, titleText, showDescription, descriptionText, showClose, closeOnOverlay, closeOnEscape, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, showTitle, titleText, showDescription, descriptionText, showClose),
    [tier, size, showTitle, titleText, showDescription, descriptionText, showClose],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, showTitle, titleText, showDescription, descriptionText),
    [tier, size, showTitle, titleText, showDescription, descriptionText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, showTitle, titleText),
    [tier, size, showTitle, titleText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, showTitle, titleText, showDescription, descriptionText),
    [tier, size, showTitle, titleText, showDescription, descriptionText],
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

  // Build dialog props based on tier
  const dialogPreviewProps: Record<string, unknown> = {
    open: dialogOpen,
    onClose: () => setDialogOpen(false),
    size,
  }

  if (showTitle) dialogPreviewProps.title = titleText

  if (tier !== 'lite') {
    if (showDescription) dialogPreviewProps.description = descriptionText
    dialogPreviewProps.closeOnOverlay = closeOnOverlay
    dialogPreviewProps.closeOnEscape = closeOnEscape
    dialogPreviewProps.showClose = showClose
    dialogPreviewProps.motion = motion
  }

  const DialogComponent = tier === 'lite' ? LiteDialog : tier === 'premium' ? PremiumDialog : Dialog

  return (
    <section className="dialog-page__section" id="playground">
      <h2 className="dialog-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="dialog-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="dialog-page__playground">
        {/* Preview area — left / top */}
        <div className="dialog-page__playground-preview">
          <div className="dialog-page__playground-result">
            <Button variant="primary" onClick={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
            <DialogComponent {...dialogPreviewProps as any}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This is sample dialog content. You can put any React components or HTML elements here.
                The dialog supports scrollable content when the body exceeds the available height.
              </p>
            </DialogComponent>
          </div>

          {/* Tabbed code output */}
          <div className="dialog-page__code-tabs">
            <div className="dialog-page__export-row">
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
              {copyStatus && <span className="dialog-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel — right / bottom */}
        <div className="dialog-page__playground-controls">
          <OptionGroup label="Size" options={sizeOptions} value={size as any} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="dialog-page__control-group">
            <span className="dialog-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show Title" checked={showTitle} onChange={setShowTitle} />
              {tier !== 'lite' && <Toggle label="Show Description" checked={showDescription} onChange={setShowDescription} />}
              {tier !== 'lite' && <Toggle label="Show Close button" checked={showClose} onChange={setShowClose} />}
              {tier !== 'lite' && <Toggle label="Close on Overlay" checked={closeOnOverlay} onChange={setCloseOnOverlay} />}
              {tier !== 'lite' && <Toggle label="Close on Escape" checked={closeOnEscape} onChange={setCloseOnEscape} />}
            </div>
          </div>

          <div className="dialog-page__control-group">
            <span className="dialog-page__control-label">Title Text</span>
            <input
              type="text"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              className="dialog-page__text-input"
              placeholder="Dialog title..."
            />
          </div>

          {tier !== 'lite' && (
            <div className="dialog-page__control-group">
              <span className="dialog-page__control-label">Description Text</span>
              <input
                type="text"
                value={descriptionText}
                onChange={e => setDescriptionText(e.target.value)}
                className="dialog-page__text-input"
                placeholder="Dialog description..."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DialogPage() {
  useStyles('dialog-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  // Size scale demo states
  const [sizeSmOpen, setSizeSmOpen] = useState(false)
  const [sizeMdOpen, setSizeMdOpen] = useState(false)
  const [sizeLgOpen, setSizeLgOpen] = useState(false)
  const [sizeFullOpen, setSizeFullOpen] = useState(false)

  // Feature demo states
  const [featureTitleOpen, setFeatureTitleOpen] = useState(false)
  const [featureCloseOpen, setFeatureCloseOpen] = useState(false)
  const [featureCustomOpen, setFeatureCustomOpen] = useState(false)

  // ConfirmDialog demo states
  const [confirmDefaultOpen, setConfirmDefaultOpen] = useState(false)
  const [confirmDangerOpen, setConfirmDangerOpen] = useState(false)
  const [confirmLoadingOpen, setConfirmLoadingOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const DialogComponent = tier === 'lite' ? LiteDialog : tier === 'premium' ? PremiumDialog : Dialog

  const sizeInfo = useMemo(() => {
    if (tier === 'lite') {
      return {
        component: 0.8,
        shared: 3.7,
        total: 4.5,
        note: 'First component loads 3.7KB theme CSS (shared). Lite dialog is a minimal forwardRef wrapper.',
      }
    }
    if (tier === 'premium') {
      return {
        component: 2.1,
        shared: 3.3,
        total: 5.4,
        note: 'Premium wraps Standard — includes spring-scale entrance animation + floating particles.',
      }
    }
    return {
      component: 3.2,
      shared: 0.9,
      total: 4.1,
      note: 'Style engine (0.5KB) and motion hook (0.3KB) are shared — only loaded once regardless of component count.',
    }
  }, [tier])

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
    const sections = document.querySelectorAll('.dialog-page__section')
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

  // Handle confirm loading simulation
  const handleConfirmLoading = useCallback(() => {
    setConfirmLoading(true)
    setTimeout(() => {
      setConfirmLoading(false)
      setConfirmLoadingOpen(false)
    }, 2000)
  }, [])

  return (
    <div className="dialog-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="dialog-page__hero">
        <h1 className="dialog-page__title">Dialog</h1>
        <p className="dialog-page__desc">
          Modal dialog built on the native {'<dialog>'} element with backdrop, focus trap,
          and scroll lock. Ships in three weight tiers from 0.8KB lite to 5.4KB premium with
          spring-scale entrance and floating particles.
        </p>
        <div className="dialog-page__import-row">
          <code className="dialog-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="dialog-page__section" id="sizes">
        <h2 className="dialog-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="dialog-page__section-desc">
          {tier === 'lite'
            ? 'Three sizes controlling max-width. Lite tier supports sm, md, and lg.'
            : 'Four sizes from compact overlays (sm) to full-screen takeovers (full). Sizes control max-inline-size.'}
        </p>
        <div className="dialog-page__preview">
          <div className="dialog-page__labeled-row">
            <div className="dialog-page__labeled-item">
              <Button size="sm" variant="secondary" onClick={() => setSizeSmOpen(true)}>Open sm</Button>
              <span className="dialog-page__item-label">sm (400px)</span>
            </div>
            <div className="dialog-page__labeled-item">
              <Button size="sm" variant="secondary" onClick={() => setSizeMdOpen(true)}>Open md</Button>
              <span className="dialog-page__item-label">md (560px)</span>
            </div>
            <div className="dialog-page__labeled-item">
              <Button size="sm" variant="secondary" onClick={() => setSizeLgOpen(true)}>Open lg</Button>
              <span className="dialog-page__item-label">lg (720px)</span>
            </div>
            {tier !== 'lite' && (
              <div className="dialog-page__labeled-item">
                <Button size="sm" variant="secondary" onClick={() => setSizeFullOpen(true)}>Open full</Button>
                <span className="dialog-page__item-label">full (100vw)</span>
              </div>
            )}
          </div>
        </div>

        {/* Size dialogs */}
        <DialogComponent open={sizeSmOpen} onClose={() => setSizeSmOpen(false)} title="Small Dialog" size="sm">
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This is a small dialog (max-width: 400px). Good for simple confirmations and short messages.
          </p>
        </DialogComponent>
        <DialogComponent open={sizeMdOpen} onClose={() => setSizeMdOpen(false)} title="Medium Dialog" size="md">
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This is a medium dialog (max-width: 560px). The default size, suitable for most use cases including forms and content.
          </p>
        </DialogComponent>
        <DialogComponent open={sizeLgOpen} onClose={() => setSizeLgOpen(false)} title="Large Dialog" size="lg">
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This is a large dialog (max-width: 720px). Best for complex content, tables, or multi-step forms.
          </p>
        </DialogComponent>
        {tier !== 'lite' && (
          <DialogComponent open={sizeFullOpen} onClose={() => setSizeFullOpen(false)} title="Full Screen Dialog" size={'full' as any}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This is a full-screen dialog (100vw x 100dvh). Use for immersive content, editors, or settings panels.
              The border-radius is removed and the dialog fills the entire viewport.
            </p>
          </DialogComponent>
        )}
      </section>

      {/* ── 4. Dialog Features ─────────────────────────── */}
      <section className="dialog-page__section" id="features">
        <h2 className="dialog-page__section-title">
          <a href="#features">Dialog Features</a>
        </h2>
        <p className="dialog-page__section-desc">
          Explore title, description, close behavior, and custom content capabilities.
        </p>

        <div className="dialog-page__feature-grid">
          {/* Title & Description */}
          <div className="dialog-page__feature-cell">
            <Button size="sm" variant="secondary" onClick={() => setFeatureTitleOpen(true)}>
              Title &amp; Description
            </Button>
            <span className="dialog-page__feature-label">Header variants</span>
          </div>

          {/* Close Behavior */}
          {tier !== 'lite' && (
            <div className="dialog-page__feature-cell">
              <Button size="sm" variant="secondary" onClick={() => setFeatureCloseOpen(true)}>
                No Close Button
              </Button>
              <span className="dialog-page__feature-label">Close behavior</span>
            </div>
          )}

          {/* Custom Content */}
          <div className="dialog-page__feature-cell">
            <Button size="sm" variant="secondary" onClick={() => setFeatureCustomOpen(true)}>
              Custom Content
            </Button>
            <span className="dialog-page__feature-label">Rich content</span>
          </div>
        </div>

        {/* Feature dialogs */}
        {tier === 'lite' ? (
          <LiteDialog open={featureTitleOpen} onClose={() => setFeatureTitleOpen(false)} title="Title Only" size="md">
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The Lite dialog supports a title in the header. Description is only available in Standard and Premium tiers.
            </p>
          </LiteDialog>
        ) : (
          <DialogComponent
            open={featureTitleOpen}
            onClose={() => setFeatureTitleOpen(false)}
            title="Title with Description"
            description="Descriptions appear below the title in a smaller, muted style."
            size="md"
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The dialog header supports both title and description text. The title uses
              aria-labelledby and the description uses aria-describedby for accessibility.
            </p>
          </DialogComponent>
        )}

        {tier !== 'lite' && (
          <DialogComponent
            open={featureCloseOpen}
            onClose={() => setFeatureCloseOpen(false)}
            title="No Close Button"
            description="This dialog has showClose={false}. Use overlay click or Escape to close."
            showClose={false}
            size="md"
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The close button is hidden. Users can still close by clicking the backdrop overlay
              or pressing the Escape key (unless those are also disabled).
            </p>
          </DialogComponent>
        )}

        {tier === 'lite' ? (
          <LiteDialog open={featureCustomOpen} onClose={() => setFeatureCustomOpen(false)} title="Custom Content" size="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Dialogs accept any React content as children. Here is a form example:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" onClick={() => setFeatureCustomOpen(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={() => setFeatureCustomOpen(false)}>Submit</Button>
              </div>
            </div>
          </LiteDialog>
        ) : (
          <DialogComponent
            open={featureCustomOpen}
            onClose={() => setFeatureCustomOpen(false)}
            title="Custom Content"
            description="Dialogs accept any React content as children."
            size="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Here is a form example inside a dialog:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button size="sm" variant="secondary" onClick={() => setFeatureCustomOpen(false)}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={() => setFeatureCustomOpen(false)}>Submit</Button>
              </div>
            </div>
          </DialogComponent>
        )}
      </section>

      {/* ── 5. ConfirmDialog ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="dialog-page__section" id="confirm-dialog">
          <h2 className="dialog-page__section-title">
            <a href="#confirm-dialog">ConfirmDialog</a>
          </h2>
          <p className="dialog-page__section-desc">
            A specialized dialog for confirmation actions. Includes confirm/cancel buttons with
            default and danger variants, plus loading state support.
          </p>
          <div className="dialog-page__preview">
            <div className="dialog-page__labeled-row">
              <div className="dialog-page__labeled-item">
                <Button size="sm" variant="secondary" onClick={() => setConfirmDefaultOpen(true)}>Default</Button>
                <span className="dialog-page__feature-label">default variant</span>
              </div>
              <div className="dialog-page__labeled-item">
                <Button size="sm" variant="danger" onClick={() => setConfirmDangerOpen(true)}>Danger</Button>
                <span className="dialog-page__feature-label">danger variant</span>
              </div>
              <div className="dialog-page__labeled-item">
                <Button size="sm" variant="secondary" onClick={() => setConfirmLoadingOpen(true)}>With Loading</Button>
                <span className="dialog-page__feature-label">loading state</span>
              </div>
            </div>
          </div>

          <ConfirmDialog
            open={confirmDefaultOpen}
            onConfirm={() => setConfirmDefaultOpen(false)}
            onCancel={() => setConfirmDefaultOpen(false)}
            title="Confirm Action"
            description="Are you sure you want to proceed? This action can be undone."
          />
          <ConfirmDialog
            open={confirmDangerOpen}
            onConfirm={() => setConfirmDangerOpen(false)}
            onCancel={() => setConfirmDangerOpen(false)}
            title="Delete Item"
            description="This action is permanent and cannot be undone. All associated data will be lost."
            variant="danger"
            confirmLabel="Delete"
            cancelLabel="Keep"
          />
          <ConfirmDialog
            open={confirmLoadingOpen}
            onConfirm={handleConfirmLoading}
            onCancel={() => { setConfirmLoadingOpen(false); setConfirmLoading(false) }}
            title="Save Changes"
            description="Saving your changes to the server. This may take a moment."
            confirmLabel="Save"
            loading={confirmLoading}
          />

          <div style={{ marginBlockStart: '1.25rem' }}>
            <CopyBlock
              code={`import { ConfirmDialog } from '@annondeveloper/ui-kit'\n\n<ConfirmDialog\n  open={open}\n  onConfirm={() => handleDelete()}\n  onCancel={() => setOpen(false)}\n  title="Delete Item"\n  description="This action cannot be undone."\n  variant="danger"\n  confirmLabel="Delete"\n/>`}
              language="typescript"
              showLineNumbers
            />
          </div>
        </section>
      )}

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="dialog-page__section" id="tiers">
        <h2 className="dialog-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="dialog-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same core API
          (Lite omits description, motion, and close behavior props).
        </p>

        <div className="dialog-page__tiers">
          {/* Lite */}
          <div
            className={`dialog-page__tier-card${tier === 'lite' ? ' dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="dialog-page__tier-header">
              <span className="dialog-page__tier-name">Lite</span>
              <span className="dialog-page__tier-size">~0.8 KB</span>
            </div>
            <p className="dialog-page__tier-desc">
              Minimal dialog wrapper. Uses native {'<dialog>'} element with forwardRef.
              No description, close behavior controls, or motion.
            </p>
            <div className="dialog-page__tier-import">
              import {'{'} Dialog {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="dialog-page__size-breakdown">
              <div className="dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>{sizeInfo.component} KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.5 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`dialog-page__tier-card${tier === 'standard' ? ' dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="dialog-page__tier-header">
              <span className="dialog-page__tier-name">Standard</span>
              <span className="dialog-page__tier-size">~3.2 KB</span>
            </div>
            <p className="dialog-page__tier-desc">
              Full-featured dialog with description, close behavior controls,
              motion levels, backdrop blur, and aurora glow.
            </p>
            <div className="dialog-page__tier-import">
              import {'{'} Dialog {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="dialog-page__size-breakdown">
              <div className="dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.1 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`dialog-page__tier-card${tier === 'premium' ? ' dialog-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="dialog-page__tier-header">
              <span className="dialog-page__tier-name">Premium</span>
              <span className="dialog-page__tier-size">~2.1 KB</span>
            </div>
            <p className="dialog-page__tier-desc">
              Everything in Standard plus spring-scale entrance animation
              and floating backdrop particles at motion level 3.
            </p>
            <div className="dialog-page__tier-import">
              import {'{'} Dialog {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="dialog-page__size-breakdown">
              <div className="dialog-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.1 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="dialog-page__section" id="brand-color">
        <h2 className="dialog-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="dialog-page__section-desc">
          Pick a brand color to see the dialog chrome update in real-time. The theme generates
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
          <div className="dialog-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`dialog-page__color-preset${brandColor === p.hex ? ' dialog-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="dialog-page__section" id="props">
        <h2 className="dialog-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="dialog-page__section-desc">
          All props accepted by Dialog. It also spreads any native dialog HTML attributes
          onto the underlying {'<dialog>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dialogProps} />
        </Card>

        {tier !== 'lite' && (
          <>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockStart: '2rem', marginBlockEnd: '0.5rem' }}>
              ConfirmDialog Props
            </h3>
            <Card variant="default" padding="md">
              <PropsTable props={confirmDialogProps} />
            </Card>
          </>
        )}
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="dialog-page__section" id="accessibility">
        <h2 className="dialog-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="dialog-page__section-desc">
          Built on the native {'<dialog>'} element with showModal() for proper modal behavior.
        </p>
        <Card variant="default" padding="md">
          <ul className="dialog-page__a11y-list">
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus trap:</strong> Focus is trapped inside the dialog when open. The native {'<dialog>'} element with <code className="dialog-page__a11y-key">showModal()</code> handles this automatically.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Escape key:</strong> Pressing <code className="dialog-page__a11y-key">Escape</code> closes the dialog (configurable via <code className="dialog-page__a11y-key">closeOnEscape</code>).
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA labelling:</strong> Title is linked via <code className="dialog-page__a11y-key">aria-labelledby</code> and description via <code className="dialog-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus restoration:</strong> When the dialog closes, focus returns to the element that opened it (native browser behavior).
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Backdrop click:</strong> Clicking the backdrop overlay closes the dialog (configurable via <code className="dialog-page__a11y-key">closeOnOverlay</code>).
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Close button enforces 44px minimum on coarse pointer devices via <code className="dialog-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="dialog-page__a11y-key">forced-colors: active</code> with visible borders and Canvas background.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="dialog-page__a11y-key">prefers-reduced-motion</code> and <code className="dialog-page__a11y-key">motion={'{0}'}</code> prop for instant open/close.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="dialog-page__section" id="source">
        <h2 className="dialog-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="dialog-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/dialog.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/dialog.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/dialog.tsx (Premium)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/confirm-dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/confirm-dialog.tsx (ConfirmDialog)
          </a>
        </div>
      </section>
    </div>
  )
}
