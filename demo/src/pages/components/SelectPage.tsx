'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Select, type SelectOption } from '@ui/components/select'
import { Select as LiteSelect } from '@ui/lite/select'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { Button } from '@ui/components/button'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.select-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: select-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .select-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .select-page__hero::before {
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
        .select-page__hero::before { animation: none; }
      }

      .select-page__title {
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

      .select-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .select-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .select-page__import-code {
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

      .select-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .select-page__section {
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
        .select-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .select-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .select-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .select-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .select-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .select-page__preview {
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
      .select-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .select-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .select-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .select-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .select-page__playground {
          grid-template-columns: 1fr;
        }
        .select-page__playground-controls {
          position: static !important;
        }
      }

      @container select-page (max-width: 680px) {
        .select-page__playground {
          grid-template-columns: 1fr;
        }
        .select-page__playground-controls {
          position: static !important;
        }
      }

      .select-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .select-page__playground-result {
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
      .select-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* Subtle aurora glow in playground */
      .select-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .select-page__playground-controls {
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

      .select-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .select-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .select-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .select-page__option-btn {
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
      .select-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .select-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .select-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .select-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .select-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .select-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .select-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .select-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .select-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── States grid ────────────────────────────────── */

      .select-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .select-page__state-cell {
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
      .select-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .select-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .select-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .select-page__tiers {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .select-page__tier-card {
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

      .select-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .select-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .select-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .select-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .select-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .select-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .select-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .select-page__tier-import {
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

      .select-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Color picker ──────────────────────────────── */

      .select-page__color-presets {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .select-page__color-preset {
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
      .select-page__color-preset:hover {
        transform: scale(1.2);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3);
      }
      .select-page__color-preset--active {
        border-color: oklch(100% 0 0);
        transform: scale(1.2);
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5);
      }

      /* ── Code tabs ─────────────────────────────────── */

      .select-page__code-tabs {
        margin-block-start: 1rem;
      }

      /* ── Export button row ─────────────────────────── */

      .select-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .select-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .select-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .select-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .select-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .select-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .select-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .select-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .select-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .select-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .select-page__size-note {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      /* ── Feature grid ──────────────────────────────── */

      .select-page__feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
      }

      .select-page__feature-cell {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .select-page__feature-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .select-page__feature-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .select-page__feature-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        line-height: 1.4;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .select-page__hero {
          padding: 2rem 1.25rem;
        }

        .select-page__title {
          font-size: 1.75rem;
        }

        .select-page__preview {
          padding: 1.75rem;
        }

        .select-page__playground {
          grid-template-columns: 1fr;
        }

        .select-page__playground-result {
          padding: 2rem;
          min-block-size: 120px;
        }

        .select-page__labeled-row {
          gap: 1rem;
        }

        .select-page__states-grid {
          grid-template-columns: 1fr;
        }

        .select-page__tiers {
          grid-template-columns: 1fr;
        }

        .select-page__section {
          padding: 1.25rem;
        }

        .select-page__feature-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 400px) {
        .select-page__hero {
          padding: 1.5rem 1rem;
        }

        .select-page__title {
          font-size: 1.5rem;
        }

        .select-page__preview {
          padding: 1rem;
        }

        .select-page__states-grid {
          grid-template-columns: 1fr;
        }

        .select-page__labeled-row {
          gap: 0.5rem;
          justify-content: center;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .select-page__title {
          font-size: 4rem;
        }

        .select-page__preview {
          padding: 3.5rem;
        }

        .select-page__labeled-row {
          gap: 2.5rem;
        }
      }

      /* ── Scrollbar + code blocks ──────────────────── */

      .select-page__import-code,
      .select-page code,
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

// ─── Demo Options ─────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
]

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'csharp', label: 'C#' },
]

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'utc', label: 'UTC+0 (UTC)' },
  { value: 'est', label: 'UTC-5 (Eastern)' },
  { value: 'cst', label: 'UTC-6 (Central)' },
  { value: 'mst', label: 'UTC-7 (Mountain)' },
  { value: 'pst', label: 'UTC-8 (Pacific)' },
  { value: 'gmt1', label: 'UTC+1 (Central Europe)' },
  { value: 'ist', label: 'UTC+5:30 (India)' },
  { value: 'jst', label: 'UTC+9 (Japan)' },
]

const GROUPED_OPTIONS: SelectOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'django', label: 'Django', group: 'Backend' },
  { value: 'rails', label: 'Rails', group: 'Backend' },
  { value: 'spring', label: 'Spring', group: 'Backend' },
  { value: 'postgres', label: 'PostgreSQL', group: 'Database' },
  { value: 'mongodb', label: 'MongoDB', group: 'Database' },
  { value: 'redis', label: 'Redis', group: 'Database' },
]

const ICON_OPTIONS: SelectOption[] = [
  { value: 'download', label: 'Download', icon: <Icon name="download" size="sm" /> },
  { value: 'upload', label: 'Upload', icon: <Icon name="upload" size="sm" /> },
  { value: 'settings', label: 'Settings', icon: <Icon name="settings" size="sm" /> },
  { value: 'search', label: 'Search', icon: <Icon name="search" size="sm" /> },
  { value: 'star', label: 'Favorites', icon: <Icon name="star" size="sm" /> },
  { value: 'home', label: 'Home', icon: <Icon name="home" size="sm" /> },
]

const COLOR_OPTIONS: SelectOption[] = [
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
  { value: 'violet', label: 'Violet' },
]

// Convert standard options to lite format (strip icon)
const COUNTRY_LITE_OPTIONS = COUNTRY_OPTIONS.map(({ value, label, disabled }) => ({ value, label, disabled }))

const GROUPED_LITE_OPTIONS = GROUPED_OPTIONS.map(({ value, label, disabled, group }) => ({ value, label, disabled, group }))

// ─── Props Data ───────────────────────────────────────────────────────────────

const selectProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Field name for form submission. Also used for hidden input elements.' },
  { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of option objects to render in the dropdown.' },
  { name: 'value', type: 'string | string[]', description: 'Controlled value. Pass string[] when multiple is true.' },
  { name: 'defaultValue', type: 'string | string[]', description: 'Initial value for uncontrolled usage.' },
  { name: 'onChange', type: '(value: string | string[]) => void', description: 'Called when selection changes. Returns string[] when multiple is true.' },
  { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Placeholder text when no value is selected.' },
  { name: 'label', type: 'ReactNode', description: 'Label rendered above the trigger. Linked via aria-labelledby.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the trigger. Adds invalid styling.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select with reduced opacity and pointer-events: none.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls trigger height, padding, and font-size.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Adds a search input to filter options in the dropdown.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Shows a clear button when a value is selected.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow selecting multiple options. Renders tags in trigger.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root wrapper element.' },
]

const selectOptionProps: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'Unique value identifier for the option.' },
  { name: 'label', type: 'string', required: true, description: 'Display text for the option.' },
  { name: 'disabled', type: 'boolean', description: 'Prevents selection of this option. Shown with reduced opacity.' },
  { name: 'icon', type: 'ReactNode', description: 'Icon element rendered before the label (Standard tier only).' },
  { name: 'group', type: 'string', description: 'Group name for categorizing options in the dropdown.' },
]

const liteSelectProps: PropDef[] = [
  { name: 'label', type: 'ReactNode', description: 'Label element rendered above the native select.' },
  { name: 'options', type: 'LiteSelectOption[]', required: true, description: 'Array of option objects for the native select.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the select.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls select height and font-size.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder option (disabled, not selectable).' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type LiteSize = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const LITE_SIZES: LiteSize[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<string, string> = {
  lite: "import { Select } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Select } from '@annondeveloper/ui-kit'",
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
      className="select-page__copy-btn"
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
    <div className="select-page__control-group">
      <span className="select-page__control-label">{label}</span>
      <div className="select-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`select-page__option-btn${opt === value ? ' select-page__option-btn--active' : ''}`}
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
    <label className="select-page__toggle-label">
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
  searchable: boolean,
  clearable: boolean,
  multiple: boolean,
  disabled: boolean,
  error: string,
  placeholder: string,
  label: string,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier] ?? IMPORT_STRINGS.standard

  if (tier === 'lite') {
    const props: string[] = []
    props.push('  name="country"')
    if (label) props.push(`  label="${label}"`)
    props.push('  options={options}')
    if (size !== 'md') props.push(`  size="${size}"`)
    if (placeholder) props.push(`  placeholder="${placeholder}"`)
    if (error) props.push(`  error="${error}"`)
    if (disabled) props.push('  disabled')

    return `${importStr}

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
]

<Select
${props.join('\n')}
/>`
  }

  const props: string[] = []
  props.push('  name="country"')
  if (label) props.push(`  label="${label}"`)
  props.push('  options={options}')
  props.push('  value={value}')
  props.push('  onChange={setValue}')
  if (size !== 'md') props.push(`  size="${size}"`)
  if (placeholder) props.push(`  placeholder="${placeholder}"`)
  if (searchable) props.push('  searchable')
  if (clearable) props.push('  clearable')
  if (multiple) props.push('  multiple')
  if (disabled) props.push('  disabled')
  if (error) props.push(`  error="${error}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
]

const [value, setValue] = useState${multiple ? "<string[]>([])" : "<string>('')"}

<Select
${props.join('\n')}
/>`
}

function generateHtmlCode(
  tier: Tier,
  size: string,
  placeholder: string,
  label: string,
  disabled: boolean,
  error: string,
): string {
  if (tier === 'lite') {
    const disabledAttr = disabled ? ' disabled' : ''
    return `<!-- Select — @annondeveloper/ui-kit lite tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/lite/styles.css">

<div class="ui-lite-select" data-size="${size}">
  ${label ? `<label for="country-select">${label}</label>` : ''}
  <select id="country-select" name="country"${disabledAttr}>
    ${placeholder ? `<option value="" disabled>${placeholder}</option>` : ''}
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </select>
  ${error ? `<span class="ui-lite-select__error">${error}</span>` : ''}
</div>`
  }

  return `<!-- Select — @annondeveloper/ui-kit standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/select.css">

<!-- Standard Select requires JavaScript — use the React component -->
<!-- For non-React projects, use the CSS-only Lite tier -->

<!-- Or import in your CSS: -->
<!-- @import '@annondeveloper/ui-kit/css/components/select.css'; -->`
}

function generateVueCode(
  tier: Tier,
  size: string,
  placeholder: string,
  label: string,
  disabled: boolean,
  searchable: boolean,
  clearable: boolean,
  multiple: boolean,
): string {
  if (tier === 'lite') {
    const disabledAttr = disabled ? ' disabled' : ''
    return `<template>
  <div class="ui-lite-select" data-size="${size}">
    ${label ? `<label for="country-select">${label}</label>` : ''}
    <select id="country-select" v-model="selected"${disabledAttr}>
      ${placeholder ? `<option value="" disabled>${placeholder}</option>` : ''}
      <option value="us">United States</option>
      <option value="uk">United Kingdom</option>
      <option value="ca">Canada</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const selected = ref('')
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = ['  name="country"']
  attrs.push('  :options="options"')
  attrs.push('  v-model="selected"')
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (placeholder) attrs.push(`  placeholder="${placeholder}"`)
  if (searchable) attrs.push('  searchable')
  if (clearable) attrs.push('  clearable')
  if (multiple) attrs.push('  multiple')
  if (disabled) attrs.push('  disabled')

  return `<template>
  <Select
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@annondeveloper/ui-kit'

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
]
const selected = ref(${multiple ? '[]' : "''"})
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: string,
  placeholder: string,
  label: string,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const disabledAttr = disabled ? ' [disabled]="true"' : ''
    return `<!-- Angular — Lite tier (CSS-only) -->
<div class="ui-lite-select" data-size="${size}">
  ${label ? `<label for="country-select">${label}</label>` : ''}
  <select id="country-select" [(ngModel)]="selected"${disabledAttr}>
    ${placeholder ? `<option value="" disabled>${placeholder}</option>` : ''}
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </select>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div class="ui-lite-select" data-size="${size}">
  ${label ? `<label for="country-select">${label}</label>` : ''}
  <select id="country-select" [(ngModel)]="selected"${disabled ? ' [disabled]="true"' : ''}>
    ${placeholder ? `<option value="" disabled>${placeholder}</option>` : ''}
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </select>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/select.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: string,
  placeholder: string,
  label: string,
  disabled: boolean,
  searchable: boolean,
  clearable: boolean,
  multiple: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-lite-select" data-size="${size}">
  ${label ? `<label for="country-select">${label}</label>` : ''}
  <select id="country-select" bind:value={selected}${disabled ? ' disabled' : ''}>
    ${placeholder ? `<option value="" disabled>${placeholder}</option>` : ''}
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </select>
</div>

<script>
  let selected = '';
</script>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const attrs: string[] = ['  name="country"']
  attrs.push('  {options}')
  attrs.push('  bind:value={selected}')
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (placeholder) attrs.push(`  placeholder="${placeholder}"`)
  if (searchable) attrs.push('  searchable')
  if (clearable) attrs.push('  clearable')
  if (multiple) attrs.push('  multiple')
  if (disabled) attrs.push('  disabled')

  return `<script>
  import { Select } from '@annondeveloper/ui-kit';

  const options = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ];
  let selected = ${multiple ? '[]' : "''"};
</script>

<Select
${attrs.join('\n')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const isLite = tier === 'lite'

  const [size, setSize] = useState<string>('md')
  const [searchable, setSearchable] = useState(false)
  const [clearable, setClearable] = useState(false)
  const [multiple, setMultiple] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')
  const [placeholder, setPlaceholder] = useState('Select a country...')
  const [label, setLabel] = useState('Country')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [copyStatus, setCopyStatus] = useState('')

  // Controlled value for standard select
  const [selectedValue, setSelectedValue] = useState<string | string[]>('')

  // Reset value when toggling multiple
  useEffect(() => {
    setSelectedValue(multiple ? [] : '')
  }, [multiple])

  const activeSizes = isLite ? LITE_SIZES : SIZES

  const reactCode = useMemo(
    () => generateReactCode(tier, size, searchable, clearable, multiple, disabled, error, placeholder, label, motion),
    [tier, size, searchable, clearable, multiple, disabled, error, placeholder, label, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, size, placeholder, label, disabled, error),
    [tier, size, placeholder, label, disabled, error],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, placeholder, label, disabled, searchable, clearable, multiple),
    [tier, size, placeholder, label, disabled, searchable, clearable, multiple],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, placeholder, label, disabled),
    [tier, size, placeholder, label, disabled],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, placeholder, label, disabled, searchable, clearable, multiple),
    [tier, size, placeholder, label, disabled, searchable, clearable, multiple],
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
    <section className="select-page__section" id="playground">
      <h2 className="select-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="select-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="select-page__playground">
        {/* Preview area */}
        <div className="select-page__playground-preview">
          <div className="select-page__playground-result">
            {isLite ? (
              <LiteSelect
                name="playground-demo"
                label={label || undefined}
                options={COUNTRY_LITE_OPTIONS}
                size={size as 'sm' | 'md' | 'lg'}
                placeholder={placeholder || undefined}
                error={error || undefined}
                disabled={disabled}
              />
            ) : (
              <Select
                name="playground-demo"
                label={label || undefined}
                options={COUNTRY_OPTIONS}
                value={selectedValue}
                onChange={setSelectedValue}
                size={size as Size}
                placeholder={placeholder || undefined}
                searchable={searchable}
                clearable={clearable}
                multiple={multiple}
                disabled={disabled}
                error={error || undefined}
                motion={motion}
              />
            )}
          </div>

          {/* Tabbed code output */}
          <div className="select-page__code-tabs">
            <div className="select-page__export-row">
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
              {copyStatus && <span className="select-page__export-status">{copyStatus}</span>}
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
        <div className="select-page__playground-controls">
          <OptionGroup
            label="Size"
            options={activeSizes}
            value={size as any}
            onChange={(v) => setSize(v)}
          />

          {!isLite && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="select-page__control-group">
            <span className="select-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {!isLite && <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />}
              {!isLite && <Toggle label="Clearable" checked={clearable} onChange={setClearable} />}
              {!isLite && <Toggle label="Multiple" checked={multiple} onChange={setMultiple} />}
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
            </div>
          </div>

          <div className="select-page__control-group">
            <span className="select-page__control-label">Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="select-page__text-input"
              placeholder="Label text..."
            />
          </div>

          <div className="select-page__control-group">
            <span className="select-page__control-label">Placeholder</span>
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              className="select-page__text-input"
              placeholder="Placeholder text..."
            />
          </div>

          <div className="select-page__control-group">
            <span className="select-page__control-label">Error</span>
            <input
              type="text"
              value={error}
              onChange={e => setError(e.target.value)}
              className="select-page__text-input"
              placeholder="Error message..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectPage() {
  useStyles('select-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()
  const isLite = tier === 'lite'

  // Demo state for feature demos
  const [searchableValue, setSearchableValue] = useState<string>('')
  const [clearableValue, setClearableValue] = useState<string>('')
  const [multipleValue, setMultipleValue] = useState<string[]>([])
  const [groupedValue, setGroupedValue] = useState<string>('')
  const [iconValue, setIconValue] = useState<string>('')
  const [errorValue, setErrorValue] = useState<string>('')
  const [variantCountryValue, setVariantCountryValue] = useState<string>('')
  const [variantColorValue, setVariantColorValue] = useState<string>('')
  const [variantGroupedValue, setVariantGroupedValue] = useState<string>('')

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
    const sections = document.querySelectorAll('.select-page__section')
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

  return (
    <div className="select-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="select-page__hero">
        <h1 className="select-page__title">Select</h1>
        <p className="select-page__desc">
          Dropdown selection component with search, multi-select, grouped options, and icon support.
          Ships in two weight tiers from a native {'<select>'} lite to a fully custom Standard dropdown.
        </p>
        <div className="select-page__import-row">
          <code className="select-page__import-code">{IMPORT_STRINGS[tier] ?? IMPORT_STRINGS.standard}</code>
          <CopyButton text={IMPORT_STRINGS[tier] ?? IMPORT_STRINGS.standard} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ─────────────────────────────────── */}
      <section className="select-page__section" id="variants">
        <h2 className="select-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="select-page__section-desc">
          Select with different option sets for various use cases: countries, colors, and grouped frameworks.
        </p>
        <div className="select-page__preview select-page__preview--col" style={{ gap: '1.5rem' }}>
          <div className="select-page__labeled-row" style={{ alignItems: 'flex-start', gap: '2rem' }}>
            <div className="select-page__labeled-item">
              {isLite ? (
                <LiteSelect
                  name="variant-country"
                  label="Country"
                  options={COUNTRY_LITE_OPTIONS}
                  placeholder="Choose country..."
                />
              ) : (
                <Select
                  name="variant-country"
                  label="Country"
                  options={COUNTRY_OPTIONS}
                  value={variantCountryValue}
                  onChange={v => setVariantCountryValue(v as string)}
                  placeholder="Choose country..."
                />
              )}
              <span className="select-page__item-label">countries</span>
            </div>
            <div className="select-page__labeled-item">
              {isLite ? (
                <LiteSelect
                  name="variant-color"
                  label="Color"
                  options={COLOR_OPTIONS.map(({ value, label }) => ({ value, label }))}
                  placeholder="Pick a color..."
                />
              ) : (
                <Select
                  name="variant-color"
                  label="Color"
                  options={COLOR_OPTIONS}
                  value={variantColorValue}
                  onChange={v => setVariantColorValue(v as string)}
                  placeholder="Pick a color..."
                />
              )}
              <span className="select-page__item-label">colors</span>
            </div>
            <div className="select-page__labeled-item">
              {isLite ? (
                <LiteSelect
                  name="variant-grouped"
                  label="Framework"
                  options={GROUPED_LITE_OPTIONS}
                  placeholder="Choose framework..."
                />
              ) : (
                <Select
                  name="variant-grouped"
                  label="Framework"
                  options={GROUPED_OPTIONS}
                  value={variantGroupedValue}
                  onChange={v => setVariantGroupedValue(v as string)}
                  placeholder="Choose framework..."
                />
              )}
              <span className="select-page__item-label">grouped</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Size Scale ───────────────────────────────── */}
      <section className="select-page__section" id="sizes">
        <h2 className="select-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="select-page__section-desc">
          {isLite
            ? 'Three sizes for the lite tier: sm, md, and lg. Sizes control height and font-size.'
            : 'Five sizes from compact inline actions (xs) to large form controls (xl). Sizes control trigger height, padding, and font-size.'}
        </p>
        <div className="select-page__preview select-page__preview--col" style={{ gap: '1.25rem', alignItems: 'stretch' }}>
          <div className="select-page__labeled-row" style={{ alignItems: 'flex-end', gap: '1.5rem' }}>
            {(isLite ? LITE_SIZES : SIZES).map(s => (
              <div key={s} className="select-page__labeled-item" style={{ minInlineSize: '160px' }}>
                {isLite ? (
                  <LiteSelect
                    name={`size-${s}`}
                    options={COUNTRY_LITE_OPTIONS}
                    size={s as 'sm' | 'md' | 'lg'}
                    placeholder="Select..."
                  />
                ) : (
                  <Select
                    name={`size-${s}`}
                    options={COUNTRY_OPTIONS}
                    size={s as Size}
                    placeholder="Select..."
                  />
                )}
                <span className="select-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="select-page__section" id="features">
        <h2 className="select-page__section-title">
          <a href="#features">Features</a>
        </h2>
        <p className="select-page__section-desc">
          {isLite
            ? <>The lite tier uses a native {'<select>'} element. Grouped options are supported via {'<optgroup>'}. Error state is displayed below the select.</>
            : 'The standard Select supports searchable filtering, clearable selections, multi-select with tags, grouped options, icon-prefixed options, and error states.'}
        </p>

        <div className="select-page__feature-grid">
          {/* Searchable */}
          {!isLite && (
            <div className="select-page__feature-cell">
              <span className="select-page__feature-label">Searchable</span>
              <span className="select-page__feature-desc">Type to filter options in real-time.</span>
              <Select
                name="feature-searchable"
                options={LANGUAGE_OPTIONS}
                value={searchableValue}
                onChange={v => setSearchableValue(v as string)}
                searchable
                placeholder="Search languages..."
              />
            </div>
          )}

          {/* Clearable */}
          {!isLite && (
            <div className="select-page__feature-cell">
              <span className="select-page__feature-label">Clearable</span>
              <span className="select-page__feature-desc">Shows a clear button when a value is selected.</span>
              <Select
                name="feature-clearable"
                options={TIMEZONE_OPTIONS}
                value={clearableValue}
                onChange={v => setClearableValue(v as string)}
                clearable
                placeholder="Select timezone..."
              />
            </div>
          )}

          {/* Multiple */}
          {!isLite && (
            <div className="select-page__feature-cell">
              <span className="select-page__feature-label">Multiple</span>
              <span className="select-page__feature-desc">Select multiple options, shown as tags in the trigger.</span>
              <Select
                name="feature-multiple"
                options={LANGUAGE_OPTIONS}
                value={multipleValue}
                onChange={v => setMultipleValue(v as string[])}
                multiple
                placeholder="Select languages..."
              />
            </div>
          )}

          {/* Grouped Options */}
          <div className="select-page__feature-cell">
            <span className="select-page__feature-label">Grouped Options</span>
            <span className="select-page__feature-desc">
              {isLite
                ? <>Options are grouped into {'<optgroup>'} elements using the group property.</>
                : 'Options are visually grouped in the dropdown using the group property.'}
            </span>
            {isLite ? (
              <LiteSelect
                name="feature-grouped"
                options={GROUPED_LITE_OPTIONS}
                placeholder="Select framework..."
              />
            ) : (
              <Select
                name="feature-grouped"
                options={GROUPED_OPTIONS}
                value={groupedValue}
                onChange={v => setGroupedValue(v as string)}
                placeholder="Select framework..."
              />
            )}
          </div>

          {/* With Icons */}
          {!isLite && (
            <div className="select-page__feature-cell">
              <span className="select-page__feature-label">With Icons</span>
              <span className="select-page__feature-desc">Options can include leading icon elements for visual context.</span>
              <Select
                name="feature-icons"
                options={ICON_OPTIONS}
                value={iconValue}
                onChange={v => setIconValue(v as string)}
                placeholder="Select action..."
              />
            </div>
          )}

          {/* Error State */}
          <div className="select-page__feature-cell">
            <span className="select-page__feature-label">Error State</span>
            <span className="select-page__feature-desc">Displays a red border and error message below the trigger.</span>
            {isLite ? (
              <LiteSelect
                name="feature-error"
                options={COUNTRY_LITE_OPTIONS}
                placeholder="Select country..."
                error="Please select a country"
              />
            ) : (
              <Select
                name="feature-error"
                options={COUNTRY_OPTIONS}
                value={errorValue}
                onChange={v => setErrorValue(v as string)}
                placeholder="Select country..."
                error="Please select a country"
              />
            )}
          </div>
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="select-page__section" id="tiers">
        <h2 className="select-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="select-page__section-desc">
          Choose the right balance of features and bundle size. The Lite tier uses the native {'<select>'} element,
          while Standard provides a fully custom dropdown with search, multi-select, and icons.
        </p>

        <div className="select-page__tiers">
          {/* Lite */}
          <div
            className={`select-page__tier-card${tier === 'lite' ? ' select-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="select-page__tier-header">
              <span className="select-page__tier-name">Lite</span>
              <span className="select-page__tier-size">~0.3 KB</span>
            </div>
            <p className="select-page__tier-desc">
              Native {'<select>'} element. Zero JavaScript beyond the forwardRef wrapper.
              Supports grouping via {'<optgroup>'}. No search, no multi-select, no icons.
            </p>
            <div className="select-page__tier-import">
              import {'{'} Select {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="select-page__tier-preview">
              <LiteSelect
                name="tier-lite-demo"
                options={COUNTRY_LITE_OPTIONS}
                placeholder="Select..."
              />
            </div>
            <div className="select-page__size-breakdown">
              <div className="select-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`select-page__tier-card${tier === 'standard' ? ' select-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="select-page__tier-header">
              <span className="select-page__tier-name">Standard</span>
              <span className="select-page__tier-size">~4 KB</span>
            </div>
            <p className="select-page__tier-desc">
              Fully custom dropdown with searchable filtering, clearable button,
              multi-select with tags, grouped options, icon support, and keyboard navigation.
            </p>
            <div className="select-page__tier-import">
              import {'{'} Select {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="select-page__tier-preview">
              <Select
                name="tier-standard-demo"
                options={COUNTRY_OPTIONS}
                placeholder="Select..."
                searchable
              />
            </div>
            <div className="select-page__size-breakdown">
              <div className="select-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ──────────────────────────────── */}
      <section className="select-page__section" id="brand-color">
        <h2 className="select-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="select-page__section-desc">
          Pick a brand color to see all selects update in real-time. The theme generates
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
          <div className="select-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`select-page__color-preset${brandColor === p.hex ? ' select-page__color-preset--active' : ''}`}
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

      {/* ── 8. Props API ────────────────────────────────── */}
      <section className="select-page__section" id="props">
        <h2 className="select-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="select-page__section-desc">
          {isLite
            ? <>All props accepted by the Lite Select. It also spreads any native {'<select>'} HTML attributes onto the underlying element.</>
            : <>All props accepted by the Standard Select. It also spreads any native {'<div>'} HTML attributes onto the root wrapper.</>}
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={isLite ? liteSelectProps : selectProps} />
        </Card>

        {!isLite && (
          <>
            <h3 className="select-page__section-title" style={{ marginBlockStart: '1.5rem' }}>
              SelectOption Interface
            </h3>
            <p className="select-page__section-desc">
              Shape of each option object passed to the <code>options</code> prop.
            </p>
            <Card variant="default" padding="md">
              <PropsTable props={selectOptionProps} />
            </Card>
          </>
        )}
      </section>

      {/* ── 9. Accessibility ──────────────────────────────── */}
      <section className="select-page__section" id="accessibility">
        <h2 className="select-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="select-page__section-desc">
          {isLite
            ? <>Built on the native {'<select>'} element with inherent accessibility support.</>
            : 'Custom dropdown built with WAI-ARIA combobox pattern and full keyboard navigation.'}
        </p>
        <Card variant="default" padding="md">
          <ul className="select-page__a11y-list">
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Opens with <code className="select-page__a11y-key">Enter</code>,{' '}
                <code className="select-page__a11y-key">Space</code>, or{' '}
                <code className="select-page__a11y-key">Arrow Down</code>. Navigate options with{' '}
                <code className="select-page__a11y-key">Arrow Up/Down</code>. Select with{' '}
                <code className="select-page__a11y-key">Enter</code>. Close with{' '}
                <code className="select-page__a11y-key">Escape</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA:</strong> Uses <code className="select-page__a11y-key">role="combobox"</code> on trigger with{' '}
                <code className="select-page__a11y-key">aria-expanded</code>,{' '}
                <code className="select-page__a11y-key">aria-haspopup="listbox"</code>, and{' '}
                <code className="select-page__a11y-key">aria-controls</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Listbox:</strong> Dropdown uses <code className="select-page__a11y-key">role="listbox"</code> with{' '}
                <code className="select-page__a11y-key">role="option"</code> items and{' '}
                <code className="select-page__a11y-key">aria-selected</code> state.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via{' '}
                <code className="select-page__a11y-key">:focus-visible</code>. Focus trap within dropdown when open.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Error messages linked via{' '}
                <code className="select-page__a11y-key">aria-describedby</code> and{' '}
                <code className="select-page__a11y-key">aria-invalid</code> on the trigger.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Label:</strong> Connected via <code className="select-page__a11y-key">aria-labelledby</code> to the label element.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via{' '}
                <code className="select-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports{' '}
                <code className="select-page__a11y-key">forced-colors: active</code> with visible 2px borders on trigger and dropdown.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Typeahead:</strong> Typing a letter jumps to the first matching option (non-searchable mode).
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ────────────────────────────────────── */}
      <section className="select-page__section" id="source">
        <h2 className="select-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="select-page__section-desc">
          View the component source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/select.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="select-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/select.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/select.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="select-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/select.tsx (Lite)
          </a>
        </div>
      </section>
    </div>
  )
}
