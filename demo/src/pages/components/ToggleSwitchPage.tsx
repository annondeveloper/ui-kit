'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { ToggleSwitch as LiteToggleSwitch } from '@ui/lite/toggle-switch'
import { ToggleSwitch as PremiumToggleSwitch } from '@ui/premium/toggle-switch'
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
    @scope (.toggle-switch-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: toggle-switch-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .toggle-switch-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .toggle-switch-page__hero::before {
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
        animation: toggle-switch-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes toggle-switch-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toggle-switch-page__hero::before { animation: none; }
      }

      .toggle-switch-page__title {
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

      .toggle-switch-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .toggle-switch-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .toggle-switch-page__import-code {
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

      .toggle-switch-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .toggle-switch-page__section {
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
        animation: toggle-switch-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes toggle-switch-section-reveal {
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
        .toggle-switch-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .toggle-switch-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .toggle-switch-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .toggle-switch-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .toggle-switch-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .toggle-switch-page__preview {
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
      .toggle-switch-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .toggle-switch-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .toggle-switch-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .toggle-switch-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .toggle-switch-page__playground {
          grid-template-columns: 1fr;
        }
        .toggle-switch-page__playground-controls {
          position: static !important;
        }
      }

      @container toggle-switch-page (max-width: 680px) {
        .toggle-switch-page__playground {
          grid-template-columns: 1fr;
        }
        .toggle-switch-page__playground-controls {
          position: static !important;
        }
      }

      .toggle-switch-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .toggle-switch-page__playground-result {
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
      .toggle-switch-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .toggle-switch-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .toggle-switch-page__playground-controls {
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

      .toggle-switch-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .toggle-switch-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .toggle-switch-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .toggle-switch-page__option-btn {
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
      .toggle-switch-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .toggle-switch-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .toggle-switch-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .toggle-switch-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .toggle-switch-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .toggle-switch-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .toggle-switch-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .toggle-switch-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .toggle-switch-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .toggle-switch-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .toggle-switch-page__state-cell {
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
      .toggle-switch-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .toggle-switch-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .toggle-switch-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .toggle-switch-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .toggle-switch-page__tier-card {
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

      .toggle-switch-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .toggle-switch-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .toggle-switch-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .toggle-switch-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .toggle-switch-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .toggle-switch-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .toggle-switch-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .toggle-switch-page__tier-import {
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

      .toggle-switch-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .toggle-switch-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .toggle-switch-page__color-preset {
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
      .toggle-switch-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .toggle-switch-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .toggle-switch-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .toggle-switch-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .toggle-switch-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .toggle-switch-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .toggle-switch-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .toggle-switch-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .toggle-switch-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .toggle-switch-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .toggle-switch-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .toggle-switch-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .toggle-switch-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .toggle-switch-page__hero {
          padding: 2rem 1.25rem;
        }

        .toggle-switch-page__title {
          font-size: 1.75rem;
        }

        .toggle-switch-page__preview {
          padding: 1.75rem;
        }

        .toggle-switch-page__playground {
          grid-template-columns: 1fr;
        }

        .toggle-switch-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .toggle-switch-page__labeled-row {
          gap: 1rem;
        }

        .toggle-switch-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .toggle-switch-page__tiers {
          grid-template-columns: 1fr;
        }

        .toggle-switch-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 640px) {
        .toggle-switch-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .toggle-switch-page__hero {
          padding: 1.5rem 1rem;
        }

        .toggle-switch-page__title {
          font-size: 1.5rem;
        }

        .toggle-switch-page__preview {
          padding: 1rem;
        }

        .toggle-switch-page__states-grid {
          grid-template-columns: 1fr;
        }

        .toggle-switch-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .toggle-switch-page__title {
          font-size: 4rem;
        }

        .toggle-switch-page__preview {
          padding: 3.5rem;
        }

        .toggle-switch-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .toggle-switch-page__import-code,
      .toggle-switch-page code,
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

const toggleSwitchProps: PropDef[] = [
  { name: 'label', type: 'ReactNode', description: 'Text label displayed adjacent to the toggle track.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls the track and thumb dimensions across five sizes.' },
  { name: 'checked', type: 'boolean', description: 'Controlled checked state. Use with onChange for full control.' },
  { name: 'defaultChecked', type: 'boolean', description: 'Initial checked state for uncontrolled usage.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the toggle with reduced opacity and pointer-events: none.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the toggle. Sets aria-invalid and aria-describedby.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. 0=instant, 1=simple, 2=spring, 3=full physics with stretch.' },
  { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler fired when the toggle state changes.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'id', type: 'string', description: 'Custom id for the underlying input. Auto-generated if omitted.' },
  { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'Forwarded ref to the underlying <input> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ToggleSwitch } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ToggleSwitch } from '@annondeveloper/ui-kit'",
  premium: "import { ToggleSwitch } from '@annondeveloper/ui-kit/premium'",
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
      className="toggle-switch-page__copy-btn"
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
    <div className="toggle-switch-page__control-group">
      <span className="toggle-switch-page__control-label">{label}</span>
      <div className="toggle-switch-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`toggle-switch-page__option-btn${opt === value ? ' toggle-switch-page__option-btn--active' : ''}`}
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
    <label className="toggle-switch-page__toggle-label">
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
  checked: boolean,
  disabled: boolean,
  labelText: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (checked) props.push('  defaultChecked')
  if (disabled) props.push('  disabled')
  if (labelText) props.push(`  label="${labelText}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<ToggleSwitch />'
    : `<ToggleSwitch\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlExport(tier: Tier, size: Size, checked: boolean, disabled: boolean, labelText: string): string {
  const checkedAttr = checked ? ' checked' : ''
  const disabledAttr = disabled ? ' disabled' : ''

  if (tier === 'lite') {
    return `<!-- ToggleSwitch — @annondeveloper/ui-kit lite tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">

<label class="ui-lite-toggle">
  <input type="checkbox" role="switch"${checkedAttr}${disabledAttr}>
  ${labelText ? `<span>${labelText}</span>` : ''}
</label>`
  }

  return `<!-- ToggleSwitch — @annondeveloper/ui-kit standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/toggle-switch.css">

<div class="ui-toggle-switch" data-size="${size}">
  <label class="ui-toggle-switch__row">
    <input type="checkbox" role="switch" class="ui-toggle-switch__input"${checkedAttr}${disabledAttr}>
    <span class="ui-toggle-switch__track" aria-hidden="true">
      <span class="ui-toggle-switch__thumb"></span>
    </span>
    ${labelText ? `<span class="ui-toggle-switch__label">${labelText}</span>` : ''}
  </label>
</div>`
}

function generateVueCode(tier: Tier, size: Size, checked: boolean, disabled: boolean, labelText: string): string {
  if (tier === 'lite') {
    const attrs: string[] = ['class="ui-lite-toggle"']
    return `<template>
  <label ${attrs.join(' ')}>
    <input type="checkbox" role="switch"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>
    ${labelText ? `<span>${labelText}</span>` : ''}
  </label>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (checked) props.push('  :default-checked="true"')
  if (disabled) props.push('  disabled')
  if (labelText) props.push(`  label="${labelText}"`)

  const template = props.length === 0
    ? '  <ToggleSwitch />'
    : `  <ToggleSwitch\n  ${props.join('\n  ')}\n  />`

  return `<template>
${template}
</template>

<script setup>
import { ToggleSwitch } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, size: Size, checked: boolean, disabled: boolean, labelText: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->
<label class="ui-lite-toggle">
  <input type="checkbox" role="switch"${checked ? ' checked' : ''}${disabled ? ' [disabled]="true"' : ''}>
  ${labelText ? `<span>${labelText}</span>` : ''}
</label>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div
  class="ui-toggle-switch"
  data-size="${size}"
  ${disabled ? 'data-disabled' : ''}
>
  <label class="ui-toggle-switch__row">
    <input type="checkbox" role="switch" class="ui-toggle-switch__input"${checked ? ' checked' : ''}${disabled ? ' [disabled]="true"' : ''}>
    <span class="ui-toggle-switch__track" aria-hidden="true">
      <span class="ui-toggle-switch__thumb"></span>
    </span>
    ${labelText ? `<span class="ui-toggle-switch__label">${labelText}</span>` : ''}
  </label>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/toggle-switch.css';`
}

function generateSvelteCode(tier: Tier, size: Size, checked: boolean, disabled: boolean, labelText: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<label class="ui-lite-toggle">
  <input type="checkbox" role="switch"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>
  ${labelText ? `<span>${labelText}</span>` : ''}
</label>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (checked) props.push('  checked')
  if (disabled) props.push('  disabled')
  if (labelText) props.push(`  label="${labelText}"`)

  const propsStr = props.length > 0 ? `\n${props.join('\n')}\n` : ''

  return `<script>
  import { ToggleSwitch } from '@annondeveloper/ui-kit';
</script>

<ToggleSwitch${propsStr}/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [checked, setChecked] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [labelText, setLabelText] = useState('Enable notifications')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  const SwitchComponent = tier === 'premium' ? PremiumToggleSwitch : tier === 'lite' ? LiteToggleSwitch : ToggleSwitch

  const reactCode = useMemo(
    () => generateReactCode(tier, size, checked, disabled, labelText, motion),
    [tier, size, checked, disabled, labelText, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(tier, size, checked, disabled, labelText),
    [tier, size, checked, disabled, labelText],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, checked, disabled, labelText),
    [tier, size, checked, disabled, labelText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, checked, disabled, labelText),
    [tier, size, checked, disabled, labelText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, checked, disabled, labelText),
    [tier, size, checked, disabled, labelText],
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

  const previewProps: Record<string, unknown> = {}
  if (tier !== 'lite') {
    previewProps.size = size
    previewProps.motion = motion
  }
  if (labelText) previewProps.label = labelText
  previewProps.checked = checked
  previewProps.onChange = () => setChecked(c => !c)
  previewProps.disabled = disabled

  return (
    <section className="toggle-switch-page__section" id="playground">
      <h2 className="toggle-switch-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="toggle-switch-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="toggle-switch-page__playground">
        {/* Preview area */}
        <div className="toggle-switch-page__playground-preview">
          <div className="toggle-switch-page__playground-result">
            <SwitchComponent {...previewProps} />
          </div>

          {/* Tabbed code output */}
          <div className="toggle-switch-page__code-tabs">
            <div className="toggle-switch-page__export-row">
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
              {copyStatus && <span className="toggle-switch-page__export-status">{copyStatus}</span>}
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
        <div className="toggle-switch-page__playground-controls">
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

          <div className="toggle-switch-page__control-group">
            <span className="toggle-switch-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Checked" checked={checked} onChange={setChecked} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>

          <div className="toggle-switch-page__control-group">
            <span className="toggle-switch-page__control-label">Label</span>
            <input
              type="text"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              className="toggle-switch-page__text-input"
              placeholder="Toggle label..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ToggleSwitchPage() {
  useStyles('toggle-switch-page', pageStyles)

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
    const sections = document.querySelectorAll('.toggle-switch-page__section')
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

  const SwitchComponent = tier === 'premium' ? PremiumToggleSwitch : tier === 'lite' ? LiteToggleSwitch : ToggleSwitch

  return (
    <div className="toggle-switch-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="toggle-switch-page__hero">
        <h1 className="toggle-switch-page__title">Toggle Switch</h1>
        <p className="toggle-switch-page__desc">
          Binary on/off control with physics-based thumb animation, five sizes, label support,
          and full accessibility. Ships in two weight tiers from a CSS-only lite to a full-featured standard.
        </p>
        <div className="toggle-switch-page__import-row">
          <code className="toggle-switch-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ───────────────────────────────── */}
      <section className="toggle-switch-page__section" id="sizes">
        <h2 className="toggle-switch-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          Five sizes from compact inline controls (xs) to large touch-friendly toggles (xl).
          Sizes control track dimensions and thumb diameter.
        </p>
        <div className="toggle-switch-page__preview">
          <div className="toggle-switch-page__labeled-row" style={{ alignItems: 'center' }}>
            {tier === 'lite' ? (
              <div className="toggle-switch-page__labeled-item">
                <LiteToggleSwitch label="Default size" />
                <span className="toggle-switch-page__item-label">default</span>
              </div>
            ) : (
              SIZES.map(s => (
                <div key={s} className="toggle-switch-page__labeled-item">
                  <ToggleSwitch size={s} label={s.toUpperCase()} />
                  <span className="toggle-switch-page__item-label">{s}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── 4. States ──────────────────────────────────── */}
      <section className="toggle-switch-page__section" id="states">
        <h2 className="toggle-switch-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          Toggle switches display clear visual feedback for on, off, and disabled states.
        </p>
        <div className="toggle-switch-page__states-grid">
          <div className="toggle-switch-page__state-cell">
            <SwitchComponent label="Off" />
            <span className="toggle-switch-page__state-label">Off (default)</span>
          </div>
          <div className="toggle-switch-page__state-cell">
            <SwitchComponent label="On" defaultChecked />
            <span className="toggle-switch-page__state-label">On</span>
          </div>
          <div className="toggle-switch-page__state-cell">
            <SwitchComponent label="Disabled off" disabled />
            <span className="toggle-switch-page__state-label">Disabled (off)</span>
          </div>
          <div className="toggle-switch-page__state-cell">
            <SwitchComponent label="Disabled on" defaultChecked disabled />
            <span className="toggle-switch-page__state-label">Disabled (on)</span>
          </div>
          {tier !== 'lite' && (
            <div className="toggle-switch-page__state-cell">
              <ToggleSwitch label="Focus me" />
              <span className="toggle-switch-page__state-label">Focus</span>
              <span className="toggle-switch-page__state-hint">press Tab key</span>
            </div>
          )}
          {tier !== 'lite' && (
            <div className="toggle-switch-page__state-cell">
              <ToggleSwitch label="Error" error="Required field" />
              <span className="toggle-switch-page__state-label">Error</span>
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Features ────────────────────────────────── */}
      <section className="toggle-switch-page__section" id="features">
        <h2 className="toggle-switch-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          ToggleSwitch supports labels, error messages, and physics-based motion levels for the thumb animation.
        </p>
        <div className="toggle-switch-page__preview toggle-switch-page__preview--col" style={{ gap: '1.5rem' }}>
          {/* Label */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBlockEnd: '0.5rem' }}>
              With Label
            </p>
            <SwitchComponent label="Enable dark mode" defaultChecked />
          </div>

          {/* Without label */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBlockEnd: '0.5rem' }}>
              Without Label
            </p>
            <SwitchComponent aria-label="Toggle feature" />
          </div>

          {/* Error state */}
          {tier !== 'lite' && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBlockEnd: '0.5rem' }}>
                Error State
              </p>
              <ToggleSwitch label="Accept terms" error="You must accept the terms to continue" />
            </div>
          )}

          {/* Motion levels */}
          {tier !== 'lite' && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBlockEnd: '0.5rem' }}>
                Motion Levels
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
                <div className="toggle-switch-page__labeled-item">
                  <ToggleSwitch motion={0} label="Instant" defaultChecked />
                  <span className="toggle-switch-page__item-label">motion=0</span>
                </div>
                <div className="toggle-switch-page__labeled-item">
                  <ToggleSwitch motion={1} label="Subtle" defaultChecked />
                  <span className="toggle-switch-page__item-label">motion=1</span>
                </div>
                <div className="toggle-switch-page__labeled-item">
                  <ToggleSwitch motion={2} label="Spring" defaultChecked />
                  <span className="toggle-switch-page__item-label">motion=2</span>
                </div>
                <div className="toggle-switch-page__labeled-item">
                  <ToggleSwitch motion={3} label="Physics" defaultChecked />
                  <span className="toggle-switch-page__item-label">motion=3</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="toggle-switch-page__section" id="tiers">
        <h2 className="toggle-switch-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          Choose the right balance of features and bundle size. ToggleSwitch ships in three tiers.
        </p>

        <div className="toggle-switch-page__tiers" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {/* Lite */}
          <div
            className={`toggle-switch-page__tier-card${tier === 'lite' ? ' toggle-switch-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="toggle-switch-page__tier-header">
              <span className="toggle-switch-page__tier-name">Lite</span>
              <span className="toggle-switch-page__tier-size">~0.2 KB</span>
            </div>
            <p className="toggle-switch-page__tier-desc">
              CSS-only variant. Minimal JavaScript — just a forwardRef wrapper.
              No size prop, no motion, no error state.
            </p>
            <div className="toggle-switch-page__tier-import">
              import {'{'} ToggleSwitch {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="toggle-switch-page__tier-preview">
              <LiteToggleSwitch label="Lite Toggle" defaultChecked />
            </div>
            <div className="toggle-switch-page__size-breakdown">
              <div className="toggle-switch-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`toggle-switch-page__tier-card${tier === 'standard' ? ' toggle-switch-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="toggle-switch-page__tier-header">
              <span className="toggle-switch-page__tier-name">Standard</span>
              <span className="toggle-switch-page__tier-size">~1.5 KB</span>
            </div>
            <p className="toggle-switch-page__tier-desc">
              Full-featured toggle with five sizes, physics-based motion,
              error state, ARIA attributes, and scoped CSS injection.
            </p>
            <div className="toggle-switch-page__tier-import">
              import {'{'} ToggleSwitch {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="toggle-switch-page__tier-preview">
              <ToggleSwitch label="Standard" size="md" defaultChecked />
            </div>
            <div className="toggle-switch-page__size-breakdown">
              <div className="toggle-switch-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`toggle-switch-page__tier-card${tier === 'premium' ? ' toggle-switch-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="toggle-switch-page__tier-header">
              <span className="toggle-switch-page__tier-name">Premium</span>
              <span className="toggle-switch-page__tier-size">~1.7 KB</span>
            </div>
            <p className="toggle-switch-page__tier-desc">
              Spring-bounce thumb animation on toggle, brand glow trail behind thumb
              when checked, and motion-level-aware degradation. Wraps Standard with premium CSS layer.
            </p>
            <div className="toggle-switch-page__tier-import">
              import {'{'} ToggleSwitch {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="toggle-switch-page__tier-preview">
              <PremiumToggleSwitch label="Premium" size="md" defaultChecked />
            </div>
            <div className="toggle-switch-page__size-breakdown">
              <div className="toggle-switch-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.7 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="toggle-switch-page__section" id="brand-color">
        <h2 className="toggle-switch-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          Pick a brand color to see all toggles update in real-time. The theme generates
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
          <div className="toggle-switch-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`toggle-switch-page__color-preset${brandColor === p.hex ? ' toggle-switch-page__color-preset--active' : ''}`}
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

          {/* Preview with brand color */}
          <div className="toggle-switch-page__preview" style={{ gap: '1.5rem' }}>
            <SwitchComponent label="Off state" />
            <SwitchComponent label="On state" defaultChecked />
            {tier !== 'lite' && (
              <>
                <ToggleSwitch label="Large" size="lg" defaultChecked />
                <ToggleSwitch label="Small" size="sm" defaultChecked />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="toggle-switch-page__section" id="props">
        <h2 className="toggle-switch-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          All props accepted by ToggleSwitch. It also spreads any native input HTML attributes
          (except <code>type</code>) onto the underlying {'<input>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={toggleSwitchProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="toggle-switch-page__section" id="accessibility">
        <h2 className="toggle-switch-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          Built on a native {'<input type="checkbox">'} with <code>role="switch"</code> for correct semantics.
        </p>
        <Card variant="default" padding="md">
          <ul className="toggle-switch-page__a11y-list">
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="toggle-switch-page__a11y-key">role="switch"</code> on the input for proper screen reader announcement.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Toggles on <code className="toggle-switch-page__a11y-key">Space</code> key. Label click also toggles via native {'<label>'} association.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="toggle-switch-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>State:</strong> Announces checked state via <code className="toggle-switch-page__a11y-key">aria-checked</code>.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Errors:</strong> Error messages linked via <code className="toggle-switch-page__a11y-key">aria-describedby</code> and <code className="toggle-switch-page__a11y-key">aria-invalid</code>.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="toggle-switch-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="toggle-switch-page__a11y-key">forced-colors: active</code> with system color tokens for track and thumb.
              </span>
            </li>
            <li className="toggle-switch-page__a11y-item">
              <span className="toggle-switch-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="toggle-switch-page__a11y-key">prefers-reduced-motion</code> via cascading motion levels.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="toggle-switch-page__section" id="source">
        <h2 className="toggle-switch-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="toggle-switch-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/toggle-switch.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="toggle-switch-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/toggle-switch.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/toggle-switch.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="toggle-switch-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/toggle-switch.tsx (Lite)
          </a>
        </div>
      </section>
    </div>
  )
}
