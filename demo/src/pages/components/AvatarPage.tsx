'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Avatar, AvatarGroup } from '@ui/components/avatar'
import { Avatar as LiteAvatar } from '@ui/lite/avatar'
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
    @scope (.avatar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: avatar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .avatar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .avatar-page__hero::before {
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
        animation: aurora-spin-av 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-av {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .avatar-page__hero::before { animation: none; }
      }

      .avatar-page__title {
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

      .avatar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .avatar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .avatar-page__import-code {
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

      .avatar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .avatar-page__section {
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
        animation: av-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes av-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .avatar-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .avatar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .avatar-page__section-title a { color: inherit; text-decoration: none; }
      .avatar-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .avatar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .avatar-page__preview {
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

      .avatar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .avatar-page__preview--col { flex-direction: column; align-items: center; }

      /* ── Playground ─────────────────────────────────── */

      .avatar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .avatar-page__playground { grid-template-columns: 1fr; }
        .avatar-page__playground-controls { position: static !important; }
      }

      @container avatar-page (max-width: 680px) {
        .avatar-page__playground { grid-template-columns: 1fr; }
        .avatar-page__playground-controls { position: static !important; }
      }

      .avatar-page__playground-preview { min-inline-size: 0;
        display: flex; flex-direction: column; gap: 1.5rem; }

      .avatar-page__playground-result {
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

      .avatar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .avatar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .avatar-page__playground-controls {
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

      .avatar-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .avatar-page__control-label { font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
      .avatar-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .avatar-page__option-btn {
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
      .avatar-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .avatar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .avatar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .avatar-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .avatar-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .avatar-page__labeled-row { display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-end; }
      .avatar-page__labeled-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      .avatar-page__item-label { font-size: 0.6875rem; color: var(--text-tertiary); font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; text-transform: lowercase; letter-spacing: 0.03em; }

      /* ── Weight Tier Cards ──────────────────────────── */

      .avatar-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .avatar-page__tier-card {
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

      .avatar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .avatar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .avatar-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .avatar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .avatar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .avatar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .avatar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .avatar-page__tier-import {
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

      .avatar-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Size breakdown bar ─────────────────────────── */

      .avatar-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .avatar-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── States grid ────────────────────────────────── */

      .avatar-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 1rem;
      }

      .avatar-page__state-cell {
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

      .avatar-page__state-cell:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .avatar-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Color picker ──────────────────────────────── */

      .avatar-page__color-presets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
      .avatar-page__color-preset { inline-size: 24px; block-size: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; padding: 0; transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.15s, box-shadow 0.15s; box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2); }
      .avatar-page__color-preset:hover { transform: scale(1.2); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.3); }
      .avatar-page__color-preset--active { border-color: oklch(100% 0 0); transform: scale(1.2); box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px oklch(100% 0 0 / 0.5); }

      .avatar-page__code-tabs { margin-block-start: 1rem; }
      .avatar-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .avatar-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── A11y list ──────────────────────────────────── */

      .avatar-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .avatar-page__a11y-item { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5; }
      .avatar-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .avatar-page__a11y-key { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem); background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-primary); }

      .avatar-page__source-link { display: inline-flex; align-items: center; gap: 0.5rem; font-size: var(--text-sm, 0.875rem); color: var(--brand); text-decoration: none; font-weight: 500; }
      .avatar-page__source-link:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .avatar-page__hero { padding: 2rem 1.25rem; }
        .avatar-page__title { font-size: 1.75rem; }
        .avatar-page__preview { padding: 1.75rem; }
        .avatar-page__playground { grid-template-columns: 1fr; }
        .avatar-page__playground-result { padding: 2rem; overflow-x: auto;
        min-block-size: 120px; }
        .avatar-page__tiers { grid-template-columns: 1fr; }
        .avatar-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .avatar-page__hero { padding: 1.5rem 1rem; }
        .avatar-page__title { font-size: 1.5rem; }
        .avatar-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .avatar-page__title { font-size: 4rem; }
        .avatar-page__preview { padding: 3.5rem; }
      }

      .avatar-page__import-code, .avatar-page code, pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const avatarPropsData: PropDef[] = [
  { name: 'src', type: 'string', description: 'Image source URL. Falls back to initials or icon on error.' },
  { name: 'alt', type: 'string', description: 'Alt text for the image. Also used as aria-label when no image is shown.' },
  { name: 'name', type: 'string', description: 'Full name used to generate initials fallback (e.g., "John Doe" => "JD").' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Avatar diameter from 22px (xs) to 64px (xl).' },
  { name: 'status', type: "'online' | 'offline' | 'away' | 'busy'", description: 'Status indicator dot displayed at bottom-right.' },
  { name: 'icon', type: 'ReactNode', description: 'Custom icon fallback when no src or name is provided.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Status = 'online' | 'offline' | 'away' | 'busy'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const STATUSES: Status[] = ['online', 'offline', 'away', 'busy']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Avatar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Avatar } from '@annondeveloper/ui-kit'",
  premium: "import { Avatar } from '@annondeveloper/ui-kit/premium'",
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

const SAMPLE_IMAGE = 'https://i.pravatar.cc/150?u=demo'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" className="avatar-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="avatar-page__control-group">
      <span className="avatar-page__control-label">{label}</span>
      <div className="avatar-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`avatar-page__option-btn${opt === value ? ' avatar-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="avatar-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, name: string, src: string, status: string, showIcon: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const props: string[] = []
    if (size !== 'md') props.push(`  size="${size}"`)
    if (src) props.push(`  src="${src}"`)
    if (name) props.push(`  alt="${name}"`)
    if (!src && name) props.push(`  fallback="${name.split(' ').map(p => p[0]).join('').toUpperCase()}"`)
    return `${importStr}\n\n<Avatar${props.length ? '\n' + props.join('\n') + '\n' : ''}/>`
  }
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (src) props.push(`  src="${src}"`)
  if (name) props.push(`  name="${name}"`)
  if (!src && name) props.push(`  alt="${name}"`)
  if (status && status !== 'none') props.push(`  status="${status}"`)
  if (showIcon && !src && !name) props.push('  icon={<Icon name="user" />}')
  return `${importStr}\n\n<Avatar${props.length ? '\n' + props.join('\n') + '\n' : ''}/>`
}

function generateHtmlCode(tier: Tier, size: Size, name: string, src: string): string {
  const className = tier === 'lite' ? 'ui-lite-avatar' : 'ui-avatar'
  const initials = name ? name.split(' ').map(p => p[0]).join('').toUpperCase() : '?'
  return `<!-- Avatar — @annondeveloper/ui-kit ${tier} tier -->
<div class="${className}" data-size="${size}">
  ${src ? `<img src="${src}" alt="${name || 'Avatar'}" />` : `<span>${initials}</span>`}
</div>`
}

function generateVueCode(tier: Tier, size: Size, name: string, src: string, status: string): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-lite-avatar" data-size="${size}">
    ${src ? `<img src="${src}" alt="${name || ''}" />` : `<span>${name ? name.split(' ').map(p => p[0]).join('').toUpperCase() : '?'}</span>`}
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const attrs: string[] = []
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (src) attrs.push(`  src="${src}"`)
  if (name) attrs.push(`  name="${name}"`)
  if (status && status !== 'none') attrs.push(`  status="${status}"`)
  return `<template>
  <Avatar${attrs.length ? '\n' + attrs.join('\n') + '\n  ' : ' '}/>
</template>

<script setup>
import { Avatar } from '@annondeveloper/ui-kit'
</script>`
}

function generateAngularCode(tier: Tier, size: Size, name: string, src: string): string {
  const className = tier === 'lite' ? 'ui-lite-avatar' : 'ui-avatar'
  const initials = name ? name.split(' ').map(p => p[0]).join('').toUpperCase() : '?'
  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : 'Standard'} tier -->
<div class="${className}" data-size="${size}">
  ${src ? `<img [src]="'${src}'" alt="${name || 'Avatar'}" />` : `<span>${initials}</span>`}
</div>

@import '@annondeveloper/ui-kit/${tier === 'lite' ? 'lite/styles.css' : 'css/components/avatar.css'}';`
}

function generateSvelteCode(tier: Tier, size: Size, name: string, src: string, status: string): string {
  if (tier === 'lite') {
    const initials = name ? name.split(' ').map(p => p[0]).join('').toUpperCase() : '?'
    return `<div class="ui-lite-avatar" data-size="${size}">
  ${src ? `<img src="${src}" alt="${name || ''}" />` : `<span>${initials}</span>`}
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const attrs: string[] = [`size="${size}"`]
  if (src) attrs.push(`src="${src}"`)
  if (name) attrs.push(`name="${name}"`)
  if (status && status !== 'none') attrs.push(`status="${status}"`)
  return `<script>
  import { Avatar } from '@annondeveloper/ui-kit';
</script>

<Avatar ${attrs.join(' ')} />`
}

// ─── Interactive Playground ──────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('lg')
  const [name, setName] = useState('Jane Doe')
  const [src, setSrc] = useState(SAMPLE_IMAGE)
  const [status, setStatus] = useState<string>('online')
  const [showIcon, setShowIcon] = useState(false)
  const [useImage, setUseImage] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const effectiveSrc = useImage ? src : ''

  const reactCode = useMemo(() => generateReactCode(tier, size, name, effectiveSrc, status, showIcon), [tier, size, name, effectiveSrc, status, showIcon])
  const htmlCode = useMemo(() => generateHtmlCode(tier, size, name, effectiveSrc), [tier, size, name, effectiveSrc])
  const vueCode = useMemo(() => generateVueCode(tier, size, name, effectiveSrc, status), [tier, size, name, effectiveSrc, status])
  const angularCode = useMemo(() => generateAngularCode(tier, size, name, effectiveSrc), [tier, size, name, effectiveSrc])
  const svelteCode = useMemo(() => generateSvelteCode(tier, size, name, effectiveSrc, status), [tier, size, name, effectiveSrc, status])

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
    <section className="avatar-page__section" id="playground">
      <h2 className="avatar-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="avatar-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="avatar-page__playground">
        <div className="avatar-page__playground-preview">
          <div className="avatar-page__playground-result">
            {tier === 'lite' ? (
              <LiteAvatar size={size} src={effectiveSrc || undefined} alt={name} fallback={name ? name.split(' ').map(p => p[0]).join('').toUpperCase() : undefined} />
            ) : (
              <Avatar size={size} src={effectiveSrc || undefined} name={name || undefined} alt={name || undefined} status={status !== 'none' ? status as Status : undefined} icon={showIcon && !effectiveSrc && !name ? <Icon name="user" /> : undefined} />
            )}
          </div>

          <div className="avatar-page__code-tabs">
            <div className="avatar-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}
              >Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="avatar-page__export-status">{copyStatus}</span>}
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

        <div className="avatar-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          {tier !== 'lite' && (
            <OptionGroup label="Status" options={['none', ...STATUSES] as const} value={status as any} onChange={setStatus} />
          )}

          <div className="avatar-page__control-group">
            <span className="avatar-page__control-label">Name</span>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="avatar-page__text-input" placeholder="Full name..." />
          </div>

          <div className="avatar-page__control-group">
            <span className="avatar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show image" checked={useImage} onChange={setUseImage} />
              {tier !== 'lite' && !useImage && !name && (
                <Toggle label="Show icon fallback" checked={showIcon} onChange={setShowIcon} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvatarPage() {
  useStyles('avatar-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const pageRef = useRef<HTMLDivElement>(null)
  const { mode } = useTheme()

  const themeTokens = useMemo(() => { try { return generateTheme(brandColor, mode) } catch { return null } }, [brandColor, mode])

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = ['brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2']

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) { const cssVar = TOKEN_TO_CSS[key]; const value = themeTokens[key]; if (cssVar && value) style[cssVar] = value }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  useEffect(() => {
    const sections = document.querySelectorAll('.avatar-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="avatar-page" ref={pageRef} style={themeStyle}>
      {/* ── 1. Hero ──────────────────────────────── */}
      <div className="avatar-page__hero">
        <h1 className="avatar-page__title">Avatar</h1>
        <p className="avatar-page__desc">
          User representation with image, initials fallback, icon fallback, status indicator,
          and grouped stacking. Ships in two weight tiers with automatic image error handling.
        </p>
        <div className="avatar-page__import-row">
          <code className="avatar-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Size Scale ──────────────────────────────── */}
      <section className="avatar-page__section" id="sizes">
        <h2 className="avatar-page__section-title"><a href="#sizes">Size Scale</a></h2>
        <p className="avatar-page__section-desc">
          Five sizes from 22px (xs) to 64px (xl). The avatar automatically scales initials text to fit.
        </p>
        <div className="avatar-page__preview">
          <div className="avatar-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="avatar-page__labeled-item">
                {tier === 'lite' ? (
                  <LiteAvatar size={s} src={`https://i.pravatar.cc/150?u=${s}`} alt={s} />
                ) : (
                  <Avatar size={s} src={`https://i.pravatar.cc/150?u=${s}`} alt={s} />
                )}
                <span className="avatar-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Variants ─────────────────────────────────── */}
      <section className="avatar-page__section" id="variants">
        <h2 className="avatar-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="avatar-page__section-desc">
          Image, initials, and icon fallbacks. The avatar gracefully degrades when an image fails to load.
        </p>
        <div className="avatar-page__preview">
          <div className="avatar-page__labeled-row">
            <div className="avatar-page__labeled-item">
              {tier === 'lite' ? (
                <LiteAvatar size="lg" src="https://i.pravatar.cc/150?u=img" alt="Image" />
              ) : (
                <Avatar size="lg" src="https://i.pravatar.cc/150?u=img" alt="Image" />
              )}
              <span className="avatar-page__item-label">image</span>
            </div>
            <div className="avatar-page__labeled-item">
              {tier === 'lite' ? (
                <LiteAvatar size="lg" fallback="JD" />
              ) : (
                <Avatar size="lg" name="Jane Doe" />
              )}
              <span className="avatar-page__item-label">initials</span>
            </div>
            <div className="avatar-page__labeled-item">
              {tier === 'lite' ? (
                <LiteAvatar size="lg" fallback={<Icon name="user" />} />
              ) : (
                <Avatar size="lg" icon={<Icon name="user" />} />
              )}
              <span className="avatar-page__item-label">icon</span>
            </div>
            {tier !== 'lite' && (
              <div className="avatar-page__labeled-item">
                <Avatar size="lg" src="https://invalid-url.example.com/broken.jpg" name="Fallback User" alt="Broken image fallback" />
                <span className="avatar-page__item-label">error fallback</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. Features ─────────────────────────────────── */}
      <section className="avatar-page__section" id="features">
        <h2 className="avatar-page__section-title"><a href="#features">Features</a></h2>
        <p className="avatar-page__section-desc">
          Status indicators, avatar groups with overflow, and automatic initials generation.
        </p>
        <div className="avatar-page__preview avatar-page__preview--col" style={{ gap: '2rem' }}>
          {tier === 'lite' ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <LiteAvatar size="lg" src="https://i.pravatar.cc/150?u=a" alt="User A" />
                <LiteAvatar size="lg" fallback="AB" />
                <LiteAvatar size="lg" src="https://i.pravatar.cc/150?u=c" alt="User C" />
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <div key={s} className="avatar-page__labeled-item">
                    <Avatar size="lg" name={s.charAt(0).toUpperCase() + s.slice(1)} status={s} />
                    <span className="avatar-page__item-label">{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBlockEnd: '0.75rem' }}>
                  <strong>AvatarGroup</strong> — stacks avatars with overlap and shows overflow count.
                </p>
                <AvatarGroup max={4} size="md">
                  <Avatar src="https://i.pravatar.cc/150?u=g1" alt="User 1" />
                  <Avatar src="https://i.pravatar.cc/150?u=g2" alt="User 2" />
                  <Avatar src="https://i.pravatar.cc/150?u=g3" alt="User 3" />
                  <Avatar src="https://i.pravatar.cc/150?u=g4" alt="User 4" />
                  <Avatar src="https://i.pravatar.cc/150?u=g5" alt="User 5" />
                  <Avatar src="https://i.pravatar.cc/150?u=g6" alt="User 6" />
                </AvatarGroup>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBlockEnd: '0.75rem' }}>
                  <strong>Initials</strong> — automatically extracted from the <code>name</code> prop.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Avatar size="lg" name="Alice" />
                  <Avatar size="lg" name="Bob Smith" />
                  <Avatar size="lg" name="Charlie David Evans" />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="avatar-page__section" id="tiers">
        <h2 className="avatar-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="avatar-page__section-desc">
          Choose the right balance of features and bundle size. Lite provides basic image/fallback,
          while Standard adds status indicators, initials, error handling, and AvatarGroup.
        </p>

        <div className="avatar-page__tiers">
          <div
            className={`avatar-page__tier-card${tier === 'lite' ? ' avatar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="avatar-page__tier-header">
              <span className="avatar-page__tier-name">Lite</span>
              <span className="avatar-page__tier-size">~0.2 KB</span>
            </div>
            <p className="avatar-page__tier-desc">
              Minimal wrapper with image and custom fallback. No status, no initials, no group.
            </p>
            <div className="avatar-page__tier-import">import {'{'} Avatar {'}'} from '@annondeveloper/ui-kit/lite'</div>
            <div className="avatar-page__tier-preview">
              <LiteAvatar size="lg" src="https://i.pravatar.cc/150?u=lite-tier" alt="Lite" />
            </div>
          </div>

          <div
            className={`avatar-page__tier-card${tier === 'standard' ? ' avatar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="avatar-page__tier-header">
              <span className="avatar-page__tier-name">Standard</span>
              <span className="avatar-page__tier-size">~1.5 KB</span>
            </div>
            <p className="avatar-page__tier-desc">
              Full-featured avatar with initials, status indicators, icon fallback,
              error handling, and AvatarGroup.
            </p>
            <div className="avatar-page__tier-import">import {'{'} Avatar {'}'} from '@annondeveloper/ui-kit'</div>
            <div className="avatar-page__tier-preview">
              <Avatar size="lg" src="https://i.pravatar.cc/150?u=std-tier" alt="Standard" status="online" />
            </div>
          </div>

          <div
            className={`avatar-page__tier-card${tier === 'premium' ? ' avatar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="avatar-page__tier-header">
              <span className="avatar-page__tier-name">Premium</span>
              <span className="avatar-page__tier-size">~3-5 KB</span>
            </div>
            <p className="avatar-page__tier-desc">
              Ambient aurora glow ring, spring-scale on hover, shimmer on loading state, and status dot glow.
            </p>
            <div className="avatar-page__tier-import">import {'{'} Avatar {'}'} from '@annondeveloper/ui-kit/premium'</div>
            <div className="avatar-page__tier-preview">
              <Avatar size="xl" name="Premium User" status="away" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color ───────────────────────────────── */}
      <section className="avatar-page__section" id="brand-color">
        <h2 className="avatar-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="avatar-page__section-desc">
          Pick a brand color to see the avatar surface and focus ring update in real-time.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
          <div className="avatar-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button key={p.hex} type="button"
                className={`avatar-page__color-preset${brandColor === p.hex ? ' avatar-page__color-preset--active' : ''}`}
                style={{ background: p.hex }} onClick={() => setBrandColor(p.hex)} title={p.name} aria-label={`Set brand color to ${p.name}`} />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
          <div className="avatar-page__preview" style={{ marginBlockStart: '0.5rem' }}>
            {tier === 'lite' ? (
              <LiteAvatar size="xl" fallback="BR" />
            ) : (
              <Avatar size="xl" name="Brand User" status="online" />
            )}
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="avatar-page__section" id="props">
        <h2 className="avatar-page__section-title"><a href="#props">Props API</a></h2>
        <p className="avatar-page__section-desc">
          All props accepted by Avatar. It also spreads any native div HTML attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={avatarPropsData} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="avatar-page__section" id="accessibility">
        <h2 className="avatar-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="avatar-page__section-desc">
          Avatar provides accessible image alternatives and status indicators.
        </p>
        <Card variant="default" padding="md">
          <ul className="avatar-page__a11y-list">
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Alt text:</strong> Images use the <code className="avatar-page__a11y-key">alt</code> prop. When no image is shown, the root gets <code className="avatar-page__a11y-key">role="img"</code> and <code className="avatar-page__a11y-key">aria-label</code>.</span>
            </li>
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Status indicator:</strong> Status dot is <code className="avatar-page__a11y-key">aria-hidden="true"</code> as it is decorative. Pair with visible text for critical status.</span>
            </li>
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>AvatarGroup:</strong> Uses <code className="avatar-page__a11y-key">role="group"</code> and overflow count has <code className="avatar-page__a11y-key">aria-label</code>.</span>
            </li>
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="avatar-page__a11y-key">@media (pointer: coarse)</code>.</span>
            </li>
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="avatar-page__a11y-key">forced-colors: active</code> with visible 2px borders.</span>
            </li>
            <li className="avatar-page__a11y-item">
              <span className="avatar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Reduced data:</strong> Images hidden under <code className="avatar-page__a11y-key">prefers-reduced-data: reduce</code>, showing initials instead.</span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ──────────────────────────────────── */}
      <section className="avatar-page__section" id="source">
        <h2 className="avatar-page__section-title"><a href="#source">Source</a></h2>
        <p className="avatar-page__section-desc">View the component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a className="avatar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/avatar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/avatar.tsx — Standard tier
          </a>
          <a className="avatar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/avatar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/avatar.tsx — Lite tier
          </a>
        </div>
      </section>
    </div>
  )
}
