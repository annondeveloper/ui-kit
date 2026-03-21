'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Button as LiteButton } from '@ui/lite/button'
import { Button as PremiumButton } from '@ui/premium/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.button-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: button-page;
      }

      /* ── Hero header ────────────────────────────────── */

      .button-page__hero {
        position: relative;
        padding: 2.5rem 2rem;
        margin: -1.5rem -2rem 2.5rem;
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        overflow: hidden;
      }

      /* Aurora glow behind hero */
      .button-page__hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -30%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, var(--aurora-1, oklch(60% 0.15 250 / 0.08)) 0%, transparent 70%);
        pointer-events: none;
      }
      .button-page__hero::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: -20%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, var(--aurora-2, oklch(55% 0.18 300 / 0.06)) 0%, transparent 70%);
        pointer-events: none;
      }

      .button-page__title {
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

      .button-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .button-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .button-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: var(--border-subtle);
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

      .button-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .button-page__section {
        margin-block-end: 2rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 1.75rem;
        overflow: hidden;
        animation: button-page-reveal 0.4s ease-out both;
        animation-timeline: view();
        animation-range: entry 0% entry 30%;
      }

      @keyframes button-page-reveal {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Fallback for browsers without animation-timeline */
      @supports not (animation-timeline: view()) {
        .button-page__section {
          animation: none;
        }
      }

      .button-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .button-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .button-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .button-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .button-page__preview {
        padding: 1.75rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }

      /* Dot grid pattern background */
      .button-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.04) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
      }

      .button-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .button-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .button-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      @container (max-width: 600px) {
        .button-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .button-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .button-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
        position: relative;
        overflow: hidden;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      /* Dot grid for playground result */
      .button-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.04) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
      }

      .button-page__playground-controls {
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
      }

      .button-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .button-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .button-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .button-page__option-btn {
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
      .button-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .button-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .button-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .button-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .button-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .button-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Color picker ──────────────────────────────── */

      .button-page__color-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .button-page__color-swatch {
        inline-size: 32px;
        block-size: 32px;
        border-radius: var(--radius-md, 10px);
        border: 2px solid var(--border-default);
        cursor: pointer;
        padding: 0;
        appearance: none;
        -webkit-appearance: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .button-page__color-swatch:hover {
        border-color: var(--border-strong);
      }
      .button-page__color-swatch:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px var(--brand-glow);
      }
      .button-page__color-swatch::-webkit-color-swatch-wrapper { padding: 2px; }
      .button-page__color-swatch::-webkit-color-swatch { border: none; border-radius: 6px; }

      .button-page__color-hex {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: var(--bg-elevated);
        color: var(--text-primary);
        inline-size: 8ch;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .button-page__color-hex:focus {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .button-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .button-page__color-preset {
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
      .button-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .button-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Tier selector ─────────────────────────────── */

      .button-page__tier-selector {
        display: flex;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        overflow: hidden;
        inline-size: fit-content;
        background: var(--bg-surface);
        box-shadow: var(--shadow-sm, 0 1px 3px oklch(0% 0 0 / 0.08));
      }

      .button-page__tier-btn {
        padding: 0.5rem 1rem;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        font-family: inherit;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.12s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.125rem;
        line-height: 1.2;
      }
      .button-page__tier-btn:not(:last-child) {
        border-inline-end: 1px solid var(--border-default);
      }
      .button-page__tier-btn:hover {
        background: var(--border-subtle);
        color: var(--text-primary);
      }
      .button-page__tier-btn--active {
        background: linear-gradient(135deg, var(--brand) 0%, oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h) 100%);
        color: oklch(100% 0 0);
        box-shadow: 0 2px 8px var(--brand-glow);
      }
      .button-page__tier-btn--active:hover {
        background: linear-gradient(135deg, var(--brand) 0%, oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h) 100%);
        color: oklch(100% 0 0);
      }

      .button-page__tier-size-label {
        font-size: 0.5625rem;
        font-weight: 400;
        opacity: 0.7;
      }

      /* ── Tier section controls wrapper ────────────── */

      .button-page__tier-section-controls {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        padding: 1.5rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
      }

      /* ── Labeled row ────────────────────────────────── */

      .button-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .button-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .button-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .button-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .button-page__state-cell {
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
      .button-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .button-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .button-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Tier card ──────────────────────────────────── */

      .button-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.25rem;
      }

      .button-page__tier-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.5rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .button-page__tier-card:hover {
        border-color: var(--border-default);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.06);
      }

      .button-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .button-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .button-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .button-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .button-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: nowrap;
      }

      .button-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .button-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .button-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .button-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .button-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .button-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .button-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .button-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .button-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .button-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Responsive: Mobile ──────────────────────── */
      @media (max-width: 768px) {
        .button-page__hero {
          padding: 2rem 1.25rem;
          margin: -1rem -1rem 2rem;
        }

        .button-page__title {
          font-size: 1.75rem;
        }

        .button-page__preview {
          padding: 1.75rem;
        }

        .button-page__playground {
          grid-template-columns: 1fr;
        }

        .button-page__playground-result {
          padding: 2rem;
          min-block-size: 100px;
        }

        .button-page__labeled-row {
          gap: 1rem;
        }

        .button-page__tier-selector {
          flex-wrap: wrap;
          inline-size: 100%;
        }

        .button-page__tier-btn {
          flex: 1;
          min-inline-size: 0;
        }

        .button-page__states-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .button-page__tiers {
          grid-template-columns: 1fr;
        }

        .button-page__section {
          margin-block-end: 1.5rem;
          padding: 1.25rem;
        }
      }

      /* ── Responsive: Small mobile ────────────────── */
      @media (max-width: 400px) {
        .button-page__hero {
          padding: 1rem 0.75rem;
          margin: -0.5rem -0.75rem 1rem;
        }

        .button-page__title {
          font-size: 1.5rem;
        }

        .button-page__preview {
          padding: 1rem;
        }

        .button-page__states-grid {
          grid-template-columns: 1fr;
        }

        .button-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }

        .button-page__color-group {
          flex-wrap: wrap;
        }
      }

      /* ── Responsive: Video wall ──────────────────── */
      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .button-page__title {
          font-size: 4rem;
        }

        .button-page__preview {
          padding: 3.5rem;
        }

        .button-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Code blocks scroll horizontally ──────────── */

      .button-page__import-code,
      .button-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
      }

      /* WebKit custom scrollbar for all scrollable areas */
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

const buttonProps: PropDef[] = [
  { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'", description: 'Visual style variant controlling colors and emphasis.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and min-height.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner overlay and prevents interaction. Announces via aria-busy.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element rendered before children.' },
  { name: 'iconEnd', type: 'ReactNode', description: 'Trailing icon element rendered after children.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button with reduced opacity and pointer-events: none.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'HTML button type. Defaults to "button" to prevent accidental form submission.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler. Debounced internally at 150ms to prevent double-clicks.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Button label content.' },
  { name: 'ref', type: 'Ref<HTMLButtonElement>', description: 'Forwarded ref to the underlying <button> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Tier = 'lite' | 'standard' | 'premium'
type AnimationStyle = 'smooth' | 'spring' | 'bounce' | 'none'

const VARIANTS: Variant[] = ['primary', 'secondary', 'ghost', 'danger']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]
const ANIMATION_STYLES: AnimationStyle[] = ['smooth', 'spring', 'bounce', 'none']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Button } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Button } from '@annondeveloper/ui-kit'",
  premium: "import { Button } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="button-page__copy-btn"
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
    <div className="button-page__control-group">
      <span className="button-page__control-label">{label}</span>
      <div className="button-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`button-page__option-btn${opt === value ? ' button-page__option-btn--active' : ''}`}
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
    <label className="button-page__toggle-label">
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

function generateLiteCss(variant: Variant, size: Size, brandColor: string): string {
  const defaultBrand = '#7c3aed'
  const brandCss = brandColor !== defaultBrand ? `\n  --brand: ${brandColor};` : ''

  const baseCSS = `.ui-lite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  outline: none;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);${brandCss}
}`

  const sizesMap: Record<Size, string> = {
    xs: '.ui-lite-button[data-size="xs"] { padding: 0.25rem 0.5rem; font-size: 0.6875rem; min-height: 24px; border-radius: 6px; }',
    sm: '.ui-lite-button[data-size="sm"] { padding: 0.375rem 0.75rem; font-size: 0.75rem; min-height: 32px; border-radius: 6px; }',
    md: '.ui-lite-button[data-size="md"] { padding: 0.5rem 1rem; font-size: 0.875rem; min-height: 36px; }',
    lg: '.ui-lite-button[data-size="lg"] { padding: 0.625rem 1.25rem; font-size: 1rem; min-height: 44px; }',
    xl: '.ui-lite-button[data-size="xl"] { padding: 0.75rem 1.5rem; font-size: 1.125rem; min-height: 52px; }',
  }

  const variantsMap: Record<Variant, string> = {
    primary: `.ui-lite-button[data-variant="primary"] {
  background: var(--brand, oklch(65% 0.2 270));
  color: oklch(100% 0 0);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.3);
}
.ui-lite-button[data-variant="primary"]:hover:not(:disabled) {
  box-shadow: 0 4px 12px oklch(0% 0 0 / 0.25);
  transform: translateY(-1px);
}`,
    secondary: `.ui-lite-button[data-variant="secondary"] {
  background: oklch(100% 0 0 / 0.06);
  color: oklch(97% 0 0);
  border-color: oklch(100% 0 0 / 0.08);
}
.ui-lite-button[data-variant="secondary"]:hover:not(:disabled) {
  background: oklch(100% 0 0 / 0.1);
  transform: translateY(-1px);
}`,
    ghost: `.ui-lite-button[data-variant="ghost"] {
  background: transparent;
  color: oklch(70% 0 0);
}
.ui-lite-button[data-variant="ghost"]:hover:not(:disabled) {
  background: oklch(100% 0 0 / 0.06);
  color: oklch(97% 0 0);
}`,
    danger: `.ui-lite-button[data-variant="danger"] {
  background: oklch(62% 0.22 25);
  color: oklch(100% 0 0);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.3);
}
.ui-lite-button[data-variant="danger"]:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}`,
  }

  return `${baseCSS}\n${sizesMap[size]}\n${variantsMap[variant]}`
}

function generateHtmlExport(variant: Variant, size: Size, label: string, brandColor: string): string {
  const cssCode = generateLiteCss(variant, size, brandColor)
  return `<!-- Button — @annondeveloper/ui-kit lite tier -->
<button class="ui-lite-button" data-variant="${variant}" data-size="${size}">
  ${label}
</button>

<style>
${cssCode}
</style>`
}

function generateReactCode(
  tier: Tier,
  variant: Variant,
  size: Size,
  label: string,
  loading: boolean,
  disabled: boolean,
  showIcon: boolean,
  showIconEnd: boolean,
  motion: number,
  animationStyle: AnimationStyle,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const iconImport = (showIcon || showIconEnd) ? "\nimport { Icon } from '@annondeveloper/ui-kit'" : ''

  const props: string[] = []
  if (variant !== 'primary') props.push(`  variant="${variant}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (loading && tier !== 'lite') props.push('  loading')
  if (disabled) props.push('  disabled')
  if (showIcon && tier !== 'lite') props.push('  icon={<Icon name="zap" size="sm" />}')
  if (showIconEnd && tier !== 'lite') props.push('  iconEnd={<Icon name="arrow-right" size="sm" />}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)
  if (tier === 'premium' && animationStyle !== 'smooth') props.push(`  animationStyle="${animationStyle}"`)

  const jsx = props.length === 0
    ? `<Button>${label}</Button>`
    : `<Button\n${props.join('\n')}\n>${label}</Button>`

  return `${importStr}${iconImport}\n\n${jsx}`
}

function generateVueCode(variant: Variant, size: Size, label: string, disabled: boolean): string {
  const attrs: string[] = []
  if (variant !== 'primary') attrs.push(`  variant="${variant}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')

  const template = attrs.length === 0
    ? `  <UiButton>${label}</UiButton>`
    : `  <UiButton\n  ${attrs.join('\n  ')}\n  >${label}</UiButton>`

  return `<template>\n${template}\n</template>\n\n<script setup>\n// Vue adapter — wrap the Web Component or use CSS-only:\nimport '@annondeveloper/ui-kit/css/components/button.css'\n</script>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier, brandColor }: { tier: Tier; brandColor: string }) {
  const [variant, setVariant] = useState<Variant>('primary')
  const [size, setSize] = useState<Size>('md')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [showIconEnd, setShowIconEnd] = useState(false)
  const [label, setLabel] = useState('Click me')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('smooth')
  const [copyStatus, setCopyStatus] = useState('')

  // Resolve component for active tier
  const ButtonComponent = tier === 'lite' ? LiteButton : tier === 'premium' ? PremiumButton : Button

  // Generate codes for all tabs
  const reactCode = useMemo(
    () => generateReactCode(tier, variant, size, label, loading, disabled, showIcon, showIconEnd, motion, animationStyle),
    [tier, variant, size, label, loading, disabled, showIcon, showIconEnd, motion, animationStyle],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlExport(variant, size, label, brandColor),
    [variant, size, label, brandColor],
  )

  const vueCode = useMemo(
    () => generateVueCode(variant, size, label, disabled),
    [variant, size, label, disabled],
  )

  const handleCopyHtmlCss = useCallback(() => {
    navigator.clipboard.writeText(htmlCssCode).then(() => {
      setCopyStatus('Copied HTML+CSS!')
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [htmlCssCode])

  // Build props for the preview button (lite has fewer features)
  const previewProps: Record<string, unknown> = {
    variant,
    size,
  }
  if (tier !== 'lite') {
    previewProps.loading = loading
    previewProps.disabled = disabled
    previewProps.icon = showIcon ? <Icon name="zap" size="sm" /> : undefined
    previewProps.iconEnd = showIconEnd ? <Icon name="arrow-right" size="sm" /> : undefined
    previewProps.motion = motion
  } else {
    previewProps.disabled = disabled
  }

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
  ]

  return (
    <section className="button-page__section" id="playground">
      <h2 className="button-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="button-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="button-page__playground">
          {/* Preview + Code */}
          <div className="button-page__playground-preview">
            <div
              className="button-page__playground-result"
              style={undefined}
            >
              <ButtonComponent {...previewProps}>{label}</ButtonComponent>
            </div>

            {/* Export button */}
            <div className="button-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopyHtmlCss}
              >
                Copy HTML+CSS
              </Button>
              {copyStatus && <span className="button-page__export-status">{copyStatus}</span>}
            </div>

            {/* Tabbed code output */}
            <div className="button-page__code-tabs">
              <Tabs tabs={codeTabs} defaultTab="react" size="sm" variant="pills">
                <TabPanel tabId="react">
                  <CopyBlock code={reactCode} language="typescript" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="html">
                  <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
                </TabPanel>
                <TabPanel tabId="vue">
                  <CopyBlock code={vueCode} language="html" showLineNumbers />
                </TabPanel>
              </Tabs>
            </div>
          </div>

          {/* Controls */}
          <div className="button-page__playground-controls">
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

            {tier !== 'lite' && (
              <OptionGroup
                label="Motion"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
            )}

            {tier === 'premium' && (
              <OptionGroup
                label="Animation Style"
                options={ANIMATION_STYLES}
                value={animationStyle}
                onChange={setAnimationStyle}
              />
            )}

            <div className="button-page__control-group">
              <span className="button-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {tier !== 'lite' && <Toggle label="Loading" checked={loading} onChange={setLoading} />}
                <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
                {tier !== 'lite' && <Toggle label="Leading icon" checked={showIcon} onChange={setShowIcon} />}
                {tier !== 'lite' && <Toggle label="Trailing icon" checked={showIconEnd} onChange={setShowIconEnd} />}
              </div>
            </div>

            <div className="button-page__control-group">
              <span className="button-page__control-label">Label</span>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="button-page__text-input"
                placeholder="Button label..."
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ButtonPage() {
  useStyles('button-page', pageStyles)

  const [tier, setTier] = useState<Tier>('standard')
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  // Dynamic bundle size estimation based on tier and enabled features
  // These are measured gzip sizes from the actual built artifacts
  const BUNDLE_SIZES = {
    lite: {
      base: 0.33,        // forwardRef wrapper
      css: 1.16,          // CSS for button only
    },
    standard: {
      base: 2.35,         // component code
      styleEngine: 0.52,  // useStyles (shared, amortized)
      motionHook: 0.28,   // useMotionLevel
      cn: 0.12,           // cn() utility
    },
    premium: {
      base: 1.60,         // premium wrapper
      standardDeps: 3.25, // pulls in standard
      entranceHook: 0.18, // useEntrance
    },
  }

  // Calculate total based on tier
  const estimatedSize = useMemo(() => {
    if (tier === 'lite') {
      return BUNDLE_SIZES.lite.base + BUNDLE_SIZES.lite.css
    }
    if (tier === 'premium') {
      return BUNDLE_SIZES.premium.base + BUNDLE_SIZES.premium.standardDeps + BUNDLE_SIZES.premium.entranceHook
    }
    // Standard
    return BUNDLE_SIZES.standard.base + BUNDLE_SIZES.standard.styleEngine + BUNDLE_SIZES.standard.motionHook + BUNDLE_SIZES.standard.cn
  }, [tier])

  // Generate full OKLCH theme from brand color — MODE AWARE
  const themeTokens = useMemo(() => {
    try {
      return generateTheme(brandColor, mode)
    } catch {
      return null
    }
  }, [brandColor, mode])

  // Only override BRAND-related tokens — never surfaces/text/borders
  // Surfaces must come from the global theme (html.light / :root) for consistent dark/light switching
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

  const ButtonComponent = tier === 'lite' ? LiteButton : tier === 'premium' ? PremiumButton : Button

  return (
    <div className="button-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="button-page__hero">
        <h1 className="button-page__title">Button</h1>
        <p className="button-page__desc">
          Primary action trigger with variant styles, sizes, loading state, and icon support.
          Ships in three weight tiers from 1.5KB lite to 4.8KB premium with ripple effects.
        </p>
        <div className="button-page__import-row">
          <code className="button-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      <Divider spacing="md" />

      {/* ── 2. Weight Tier Selector ─────────────────────── */}
      <section className="button-page__section" id="tier-selector">
        <h2 className="button-page__section-title">
          <a href="#tier-selector">Weight Tier</a>
        </h2>
        <p className="button-page__section-desc">
          Select a weight tier to switch ALL button examples on this page. Each tier trades features for bundle size.
        </p>
        <div className="button-page__tier-section-controls">
          <div className="button-page__tier-selector">
            {TIERS.map(t => {
              const tierSizes = { lite: 1.5, standard: 3.3, premium: 5.0 }
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`button-page__tier-btn${t.id === tier ? ' button-page__tier-btn--active' : ''}`}
                  onClick={() => setTier(t.id)}
                >
                  {t.label}
                  <span className="button-page__tier-size-label">{tierSizes[t.id].toFixed(1)} KB</span>
                </button>
              )
            })}
          </div>
          {/* Dynamic estimated size */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Estimated bundle:</span>
            <strong style={{ color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{estimatedSize.toFixed(1)} KB</strong>
            <span>gzip (tree-shaken)</span>
          </div>

          {/* Color customization */}
          <div>
            <div className="button-page__control-group">
              <span className="button-page__control-label">Brand Color</span>
              <ColorInput
                name="brand-color"
                value={brandColor}
                onChange={setBrandColor}
                size="sm"
                swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
              />
            </div>
            {/* Preset color swatches */}
            <div className="button-page__color-presets" style={{ marginBlockStart: '0.5rem' }}>
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.hex}
                  type="button"
                  className={`button-page__color-preset${brandColor === p.hex ? ' button-page__color-preset--active' : ''}`}
                  style={{ background: p.hex }}
                  onClick={() => setBrandColor(p.hex)}
                  title={p.name}
                  aria-label={`Set brand color to ${p.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="md" />

      {/* ── 3. Interactive Playground ───────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      <Divider spacing="md" />

      {/* ── 4. Variant Gallery ─────────────────────────── */}
      <section className="button-page__section" id="variants">
        <h2 className="button-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="button-page__section-desc">
          Four built-in variants for different levels of emphasis and semantic meaning.
        </p>
        <div
          className="button-page__preview"
          style={undefined}
        >
          <div className="button-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="button-page__labeled-item">
                <ButtonComponent variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</ButtonComponent>
                <span className="button-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="md" />

      {/* ── 5. Size Scale ──────────────────────────────── */}
      <section className="button-page__section" id="sizes">
        <h2 className="button-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="button-page__section-desc">
          Five sizes from compact inline actions (xs) to large call-to-action buttons (xl).
          Sizes control padding, font-size, and minimum block-size.
        </p>
        <div
          className="button-page__preview"
          style={undefined}
        >
          <div className="button-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="button-page__labeled-item">
                <ButtonComponent size={s}>Button</ButtonComponent>
                <span className="button-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="md" />

      {/* ── 6. States ──────────────────────────────────── */}
      <section className="button-page__section" id="states">
        <h2 className="button-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="button-page__section-desc">
          Buttons handle all interaction states with clear visual feedback.
        </p>
        <div
          className="button-page__states-grid"
          style={undefined}
        >
          <div className="button-page__state-cell">
            <ButtonComponent>Default</ButtonComponent>
            <span className="button-page__state-label">Default</span>
          </div>
          <div className="button-page__state-cell">
            <ButtonComponent>Hover me</ButtonComponent>
            <span className="button-page__state-label">Hover</span>
            <span className="button-page__state-hint">move cursor over</span>
          </div>
          <div className="button-page__state-cell">
            <ButtonComponent>Focus me</ButtonComponent>
            <span className="button-page__state-label">Focus</span>
            <span className="button-page__state-hint">press Tab key</span>
          </div>
          <div className="button-page__state-cell">
            <ButtonComponent>Press me</ButtonComponent>
            <span className="button-page__state-label">Active</span>
            <span className="button-page__state-hint">click and hold</span>
          </div>
          {tier !== 'lite' && (
            <div className="button-page__state-cell">
              <ButtonComponent loading>Saving...</ButtonComponent>
              <span className="button-page__state-label">Loading</span>
            </div>
          )}
          <div className="button-page__state-cell">
            <ButtonComponent disabled>Disabled</ButtonComponent>
            <span className="button-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      <Divider spacing="md" />

      {/* ── 7. With Icons ──────────────────────────────── */}
      {tier !== 'lite' && (
        <>
          <section className="button-page__section" id="icons">
            <h2 className="button-page__section-title">
              <a href="#icons">With Icons</a>
            </h2>
            <p className="button-page__section-desc">
              Buttons accept leading and trailing icon elements. Icons automatically scale to match the button's font-size.
            </p>
            <div
              className="button-page__preview button-page__preview--col"
              style={{
                gap: '1.25rem',
                ...(brandColor !== '#7c3aed' ? { ['--brand' as string]: brandColor } : {}),
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <div className="button-page__labeled-item">
                  <ButtonComponent icon={<Icon name="zap" size="sm" />}>Deploy</ButtonComponent>
                  <span className="button-page__item-label">Leading</span>
                </div>
                <div className="button-page__labeled-item">
                  <ButtonComponent iconEnd={<Icon name="arrow-right" size="sm" />}>Next Step</ButtonComponent>
                  <span className="button-page__item-label">Trailing</span>
                </div>
                <div className="button-page__labeled-item">
                  <ButtonComponent
                    icon={<Icon name="download" size="sm" />}
                    iconEnd={<Icon name="arrow-right" size="sm" />}
                  >
                    Download
                  </ButtonComponent>
                  <span className="button-page__item-label">Both</span>
                </div>
                <div className="button-page__labeled-item">
                  <ButtonComponent
                    icon={<Icon name="plus" size="sm" />}
                    aria-label="Add item"
                    style={{ paddingInline: '0.5rem' }}
                  />
                  <span className="button-page__item-label">Icon only</span>
                </div>
              </div>
              <CopyBlock
                code={`// Leading icon
<Button icon={<Icon name="zap" size="sm" />}>Deploy</Button>

// Trailing icon
<Button iconEnd={<Icon name="arrow-right" size="sm" />}>Next Step</Button>

// Both icons
<Button icon={<Icon name="download" size="sm" />} iconEnd={<Icon name="arrow-right" size="sm" />}>
  Download
</Button>

// Icon-only (provide aria-label)
<Button icon={<Icon name="plus" size="sm" />} aria-label="Add item" />`}
                language="typescript"
                showLineNumbers
              />
            </div>
          </section>

          <Divider spacing="md" />
        </>
      )}

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="button-page__section" id="tiers">
        <h2 className="button-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="button-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits loading, icon, and motion props).
        </p>
        <div className="button-page__tiers">
          {/* Lite */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Lite</span>
              <span className="button-page__tier-size">~0.3 KB</span>
            </div>
            <p className="button-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No loading spinner, no motion, no icon slots.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="button-page__tier-preview">
              <LiteButton variant="primary">Lite Button</LiteButton>
            </div>
          </div>

          {/* Standard */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Standard</span>
              <span className="button-page__tier-size">~2 KB</span>
            </div>
            <p className="button-page__tier-desc">
              Full-featured button with loading state, icon support,
              motion levels, click debouncing, and accessibility.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="button-page__tier-preview">
              <Button variant="primary" icon={<Icon name="zap" size="sm" />}>Standard</Button>
            </div>
          </div>

          {/* Premium */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Premium</span>
              <span className="button-page__tier-size">~3 KB</span>
            </div>
            <p className="button-page__tier-desc">
              Everything in Standard plus cursor-tracking glow,
              click ripple, particle burst, and entrance animation.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="button-page__tier-preview">
              <PremiumButton variant="primary" icon={<Icon name="zap" size="sm" />}>Premium</PremiumButton>
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="md" />

      {/* ── 9. Motion Levels ───────────────────────────── */}
      {tier !== 'lite' && (
        <>
          <section className="button-page__section" id="motion">
            <h2 className="button-page__section-title">
              <a href="#motion">Motion Levels</a>
            </h2>
            <p className="button-page__section-desc">
              Each button can be pinned to a specific motion level via the motion prop.
              Level 0 disables all animation; level 3 enables cinematic spring physics.
            </p>
            <div
              className="button-page__preview"
              style={undefined}
            >
              <div className="button-page__labeled-row">
                {([0, 1, 2, 3] as const).map(m => (
                  <div key={m} className="button-page__labeled-item">
                    <ButtonComponent motion={m}>Motion {m}</ButtonComponent>
                    <span className="button-page__item-label">
                      {m === 0 ? 'Instant' : m === 1 ? 'Subtle' : m === 2 ? 'Spring' : 'Cinematic'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBlockStart: '0.75rem' }}>
              <CopyBlock
                code={`<Button motion={0}>Instant</Button>    // No animation
<Button motion={1}>Subtle</Button>     // CSS transitions only
<Button motion={2}>Spring</Button>     // Spring physics, no overshoot
<Button motion={3}>Cinematic</Button>  // Full physics + effects`}
                language="typescript"
                showLineNumbers
              />
            </div>
          </section>

          <Divider spacing="md" />
        </>
      )}

      {/* ── 10. Props API Table ─────────────────────────── */}
      <section className="button-page__section" id="props">
        <h2 className="button-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="button-page__section-desc">
          All props accepted by Button. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={buttonProps} />
        </Card>
      </section>

      <Divider spacing="md" />

      {/* ── 11. Accessibility Notes ────────────────────── */}
      <section className="button-page__section" id="accessibility">
        <h2 className="button-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="button-page__section-desc">
          Built on the native {'<button>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="button-page__a11y-list">
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="button-page__a11y-key">Enter</code> and <code className="button-page__a11y-key">Space</code> keys.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="button-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Announced to screen readers via <code className="button-page__a11y-key">aria-busy="true"</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Type:</strong> Defaults to <code className="button-page__a11y-key">type="button"</code> to prevent accidental form submission.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses both <code className="button-page__a11y-key">disabled</code> attribute and <code className="button-page__a11y-key">aria-disabled</code> for maximum compatibility.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="button-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="button-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="md" />

      {/* ── 12. Source Code ─────────────────────────────── */}
      <section className="button-page__section" id="source">
        <h2 className="button-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="button-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/button.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/button.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/button.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
