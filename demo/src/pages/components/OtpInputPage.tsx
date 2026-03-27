'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { OtpInput } from '@ui/components/otp-input'
import { OtpInput as LiteOtpInput } from '@ui/lite/otp-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.otp-input-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: otp-input-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .otp-input-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .otp-input-page__hero::before {
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
        animation: otp-input-page__aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes otp-input-page__aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .otp-input-page__hero::before { animation: none; }
      }

      .otp-input-page__title {
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

      .otp-input-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .otp-input-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .otp-input-page__import-code {
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

      .otp-input-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      /* ── Sections ───────────────────────────────────── */

      .otp-input-page__section {
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
        animation: otp-input-page__section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes otp-input-page__section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .otp-input-page__section {
          opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); animation: none;
        }
      }

      .otp-input-page__section-title {
        font-size: 1.125rem; font-weight: 700; color: var(--text-primary);
        margin: 0 0 0.375rem; padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3; scroll-margin-block-start: 2rem;
      }
      .otp-input-page__section-title a { color: inherit; text-decoration: none; }
      .otp-input-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .otp-input-page__section-desc {
        color: var(--text-secondary); font-size: var(--text-sm, 0.875rem);
        line-height: 1.6; margin: 0 0 1.5rem; text-wrap: pretty;
      }

      /* ── Preview ────────────────────────────────── */

      .otp-input-page__preview {
        padding: 2.5rem; border-radius: var(--radius-md); background: var(--bg-base);
        position: relative; overflow: hidden; display: flex; flex-wrap: wrap;
        align-items: center; justify-content: center; gap: 1.25rem; min-block-size: 80px;
      }
      .otp-input-page__preview::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .otp-input-page__preview--col { flex-direction: column; align-items: center; }

      /* ── Playground ─────────────────────────────────── */

      .otp-input-page__playground {
        display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start;
      }
      @media (max-width: 768px) {
        .otp-input-page__playground { grid-template-columns: 1fr; }
        .otp-input-page__playground-controls { position: static !important; }
      }
      @container otp-input-page (max-width: 680px) {
        .otp-input-page__playground { grid-template-columns: 1fr; }
        .otp-input-page__playground-controls { position: static !important; }
      }

      .otp-input-page__playground-preview { display: flex; flex-direction: column; gap: 1.5rem; }

      .otp-input-page__playground-result {
        min-block-size: 200px; display: grid; place-items: center; padding: 3rem;
        background: var(--bg-base); border-radius: var(--radius-md);
        position: relative; overflow: hidden;
      }
      .otp-input-page__playground-result::before {
        content: ''; position: absolute; inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px; pointer-events: none;
      }
      .otp-input-page__playground-result::after {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .otp-input-page__playground-controls {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.25rem;
        display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem;
      }

      .otp-input-page__control-group { display: flex; flex-direction: column; gap: 0.375rem; }
      .otp-input-page__control-label {
        font-size: var(--text-xs, 0.75rem); font-weight: 600; color: var(--text-tertiary);
        text-transform: uppercase; letter-spacing: 0.05em;
      }
      .otp-input-page__control-options { display: flex; flex-wrap: wrap; gap: 0.375rem; }

      .otp-input-page__option-btn {
        font-size: var(--text-xs, 0.75rem); padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: transparent; color: var(--text-secondary); cursor: pointer;
        font-family: inherit; font-weight: 500; transition: all 0.12s; line-height: 1.4;
      }
      .otp-input-page__option-btn:hover { border-color: var(--border-strong); color: var(--text-primary); }
      .otp-input-page__option-btn--active {
        background: var(--brand); color: oklch(100% 0 0);
        border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .otp-input-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .otp-input-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }

      .otp-input-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .otp-input-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-end;
      }

      .otp-input-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .otp-input-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Verification flow demo ─────────────────────── */

      .otp-input-page__verification-flow {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        inline-size: 100%;
        max-inline-size: 400px;
        margin-inline: auto;
      }

      .otp-input-page__verification-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .otp-input-page__verification-title {
        font-size: var(--text-base, 1rem);
        font-weight: 600;
        color: var(--text-primary);
      }

      .otp-input-page__verification-subtitle {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary);
      }

      .otp-input-page__verification-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        margin-block-start: 0.5rem;
      }

      .otp-input-page__verification-link {
        font-size: var(--text-xs, 0.75rem);
        color: var(--brand);
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 0.2em;
        font-family: inherit;
      }

      .otp-input-page__verification-status {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        text-align: center;
      }

      .otp-input-page__verification-status--success {
        background: oklch(from var(--status-ok, oklch(70% 0.18 145)) l c h / 0.1);
        color: var(--status-ok, oklch(70% 0.18 145));
      }

      .otp-input-page__verification-status--error {
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.1);
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* ── States grid ────────────────────────────────── */

      .otp-input-page__states-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;
      }
      .otp-input-page__state-cell {
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 1.25rem 0.75rem; border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); background: var(--bg-base);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .otp-input-page__state-cell:hover {
        border-color: var(--border-default); box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }
      .otp-input-page__state-label {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .otp-input-page__tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

      .otp-input-page__tier-card {
        background: var(--bg-surface); border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column;
        gap: 0.75rem; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0; overflow: hidden;
      }
      .otp-input-page__tier-card:hover {
        border-color: var(--border-strong); transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .otp-input-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }
      .otp-input-page__tier-card--active:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.18), 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .otp-input-page__tier-header { display: flex; align-items: center; justify-content: space-between; }
      .otp-input-page__tier-name { font-size: var(--text-sm, 0.875rem); font-weight: 700; color: var(--text-primary); }
      .otp-input-page__tier-size {
        font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
      .otp-input-page__tier-desc {
        font-size: var(--text-xs, 0.75rem); color: var(--text-secondary); line-height: 1.5; text-align: start;
      }
      .otp-input-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h); background: var(--border-subtle);
        padding: 0.375rem 0.5rem; border-radius: var(--radius-sm);
        overflow-wrap: break-word; word-break: break-all; text-align: start; line-height: 1.4;
      }
      .otp-input-page__tier-preview { display: flex; justify-content: center; padding-block-start: 0.5rem; }
      .otp-input-page__size-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); }
      .otp-input-page__size-row { display: flex; align-items: center; gap: 0.5rem; }

      /* ── Code tabs ─────────────────────────────────── */

      .otp-input-page__code-tabs { margin-block-start: 1rem; }
      .otp-input-page__export-row { display: flex; align-items: center; gap: 0.5rem; margin-block-start: 0.75rem; }
      .otp-input-page__export-status { font-size: var(--text-xs, 0.75rem); color: var(--text-tertiary); font-style: italic; }

      /* ── A11y list ──────────────────────────────────── */

      .otp-input-page__a11y-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.625rem; }
      .otp-input-page__a11y-item {
        display: flex; align-items: flex-start; gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem); color: var(--text-secondary); line-height: 1.5;
      }
      .otp-input-page__a11y-icon { color: var(--brand); flex-shrink: 0; margin-block-start: 0.125rem; }
      .otp-input-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle); padding: 0.125rem 0.375rem; border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle); color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .otp-input-page__hero { padding: 2rem 1.25rem; }
        .otp-input-page__title { font-size: 1.75rem; }
        .otp-input-page__preview { padding: 1.75rem; }
        .otp-input-page__playground { grid-template-columns: 1fr; }
        .otp-input-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .otp-input-page__states-grid { grid-template-columns: 1fr; }
        .otp-input-page__tiers { grid-template-columns: 1fr; }
        .otp-input-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .otp-input-page__hero { padding: 1.5rem 1rem; }
        .otp-input-page__title { font-size: 1.5rem; }
        .otp-input-page__preview { padding: 1rem; }
      }

      @media (min-width: 3000px) {
        :scope { max-inline-size: 1400px; }
        .otp-input-page__title { font-size: 4rem; }
        .otp-input-page__preview { padding: 3.5rem; }
      }

      .otp-input-page__import-code,
      .otp-input-page code,
      pre { overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--border-default) transparent; max-inline-size: 100%; }
      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const otpInputProps: PropDef[] = [
  { name: 'length', type: 'number', default: '6', description: 'Number of OTP digit fields.' },
  { name: 'value', type: 'string', description: 'Controlled OTP string value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when any digit changes.' },
  { name: 'onComplete', type: '(value: string) => void', description: 'Callback when all digits are filled.' },
  { name: 'type', type: "'number' | 'text'", default: "'number'", description: 'Input type: numeric-only or alphanumeric.' },
  { name: 'error', type: 'string', description: 'Error message with shake animation at motion 2+.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all digit inputs.' },
  { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Auto-focus the first digit on mount.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls digit cell dimensions and font size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls error shake.' },
  { name: 'className', type: 'string', description: 'Additional CSS class merged with component class.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type InputType = 'number' | 'text'

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const LENGTHS = [4, 5, 6, 8] as const

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { OtpInput } from '@annondeveloper/ui-kit/lite'",
  standard: "import { OtpInput } from '@annondeveloper/ui-kit'",
  premium: "import { OtpInput } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="otp-input-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >{copied ? 'Copied' : 'Copy'}</Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="otp-input-page__control-group">
      <span className="otp-input-page__control-label">{label}</span>
      <div className="otp-input-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button"
            className={`otp-input-page__option-btn${opt === value ? ' otp-input-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="otp-input-page__toggle-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, length: number, size: Size, type: InputType, disabled: boolean, error: string, motion: number): string {
  const importStr = IMPORT_STRINGS[tier]
  if (tier === 'lite') {
    const attrs: string[] = []
    if (length !== 6) attrs.push(`  length={${length}}`)
    if (error) attrs.push(`  error="${error}"`)
    const jsx = attrs.length === 0
      ? '<OtpInput value={otp} onChange={setOtp} onComplete={(code) => verify(code)} />'
      : `<OtpInput\n  value={otp}\n  onChange={setOtp}\n  onComplete={(code) => verify(code)}\n${attrs.join('\n')}\n/>`
    return `${importStr}\n\nconst [otp, setOtp] = useState('')\n\n${jsx}`
  }
  const props: string[] = ['  value={otp}', '  onChange={setOtp}', '  onComplete={(code) => verify(code)}']
  if (length !== 6) props.push(`  length={${length}}`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (type !== 'number') props.push(`  type="${type}"`)
  if (disabled) props.push('  disabled')
  if (error) props.push(`  error="${error}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)
  return `${importStr}\n\nconst [otp, setOtp] = useState('')\n\n<OtpInput\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, length: number): string {
  const inputs = Array.from({ length }, (_, i) => `  <input type="text" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" />`).join('\n')
  if (tier === 'lite') {
    return `<!-- OtpInput — Lite tier -->
<div class="ui-lite-otp-input">
${inputs}
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<!-- OtpInput — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/otp-input.css">

<div class="ui-otp-input" data-size="md" role="group" aria-label="Verification code">
  <div class="ui-otp-input__digits">
${inputs.replace(/  <input/g, '    <input').replace(/class=""/g, 'class="ui-otp-input__digit"')}
  </div>
</div>`
}

function generateVueCode(tier: Tier, length: number): string {
  if (tier === 'lite') {
    return `<template>
  <OtpInput :length="${length}" v-model="otp" @complete="verify" />
</template>

<script setup>
import { ref } from 'vue'
const otp = ref('')
const verify = (code) => console.log('Verify:', code)
</script>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<template>
  <OtpInput
    :length="${length}"
    v-model="otp"
    @complete="verify"
  />
</template>

<script setup>
import { ref } from 'vue'
import { OtpInput } from '@annondeveloper/ui-kit'
const otp = ref('')
const verify = (code) => console.log('Verify:', code)
</script>`
}

function generateAngularCode(tier: Tier, length: number): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<div class="ui-lite-otp-input">
  ${Array.from({ length }, (_, i) => `<input type="text" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" />`).join('\n  ')}
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  return `<!-- Angular — Standard tier (CSS approach) -->
<div class="ui-otp-input" data-size="md" role="group" aria-label="Verification code">
  <div class="ui-otp-input__digits">
    ${Array.from({ length }, (_, i) => `<input type="text" class="ui-otp-input__digit" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" />`).join('\n    ')}
  </div>
</div>

/* Import CSS */
@import '@annondeveloper/ui-kit/css/components/otp-input.css';`
}

function generateSvelteCode(tier: Tier, length: number): string {
  if (tier === 'lite') {
    return `<script>
  import { OtpInput } from '@annondeveloper/ui-kit/lite';
  let otp = '';
</script>

<OtpInput length={${length}} bind:value={otp} on:complete={(e) => verify(e.detail)} />

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  return `<script>
  import { OtpInput } from '@annondeveloper/ui-kit';
  let otp = '';
</script>

<OtpInput
  length={${length}}
  bind:value={otp}
  on:complete={(e) => verify(e.detail)}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [size, setSize] = useState<Size>('md')
  const [length, setLength] = useState(6)
  const [type, setType] = useState<InputType>('number')
  const [disabled, setDisabled] = useState(false)
  const [showError, setShowError] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [otpValue, setOtpValue] = useState('')
  const [completed, setCompleted] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const errorText = showError ? 'Invalid verification code' : ''

  const reactCode = useMemo(() => generateReactCode(tier, length, size, type, disabled, errorText, motion), [tier, length, size, type, disabled, errorText, motion])
  const htmlCode = useMemo(() => generateHtmlCode(tier, length), [tier, length])
  const vueCode = useMemo(() => generateVueCode(tier, length), [tier, length])
  const angularCode = useMemo(() => generateAngularCode(tier, length), [tier, length])
  const svelteCode = useMemo(() => generateSvelteCode(tier, length), [tier, length])

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

  const handleComplete = (code: string) => {
    setCompleted(true)
    setTimeout(() => setCompleted(false), 2000)
  }

  return (
    <section className="otp-input-page__section" id="playground">
      <h2 className="otp-input-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="otp-input-page__section-desc">
        Tweak every prop and see the result in real-time. Try pasting a code to test the paste handler.
      </p>

      <div className="otp-input-page__playground">
        <div className="otp-input-page__playground-preview">
          <div className="otp-input-page__playground-result">
            {tier === 'lite' ? (
              <LiteOtpInput
                length={length}
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleComplete}
                error={errorText || undefined}
              />
            ) : (
              <OtpInput
                length={length}
                size={size}
                type={type}
                disabled={disabled}
                error={errorText || undefined}
                motion={motion}
                value={otpValue}
                onChange={setOtpValue}
                onComplete={handleComplete}
              />
            )}
          </div>
          {(otpValue || completed) && (
            <p style={{ fontSize: '0.75rem', color: completed ? 'var(--status-ok, oklch(70% 0.18 145))' : 'var(--text-tertiary)', margin: 0 }}>
              {completed ? 'Code complete!' : `Current: ${otpValue}`}
            </p>
          )}

          <div className="otp-input-page__code-tabs">
            <div className="otp-input-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />}
                onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`); setTimeout(() => setCopyStatus(''), 2000) }) }}>
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="otp-input-page__export-status">{copyStatus}</span>}
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

        <div className="otp-input-page__playground-controls">
          {tier !== 'lite' && <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />}
          <OptionGroup label="Length" options={LENGTHS.map(String) as any} value={String(length)} onChange={v => setLength(Number(v))} />
          {tier !== 'lite' && (
            <OptionGroup label="Type" options={['number', 'text'] as const} value={type} onChange={setType} />
          )}
          {tier !== 'lite' && (
            <OptionGroup label="Motion" options={['0', '1', '2', '3'] as const} value={String(motion) as any} onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)} />
          )}
          <div className="otp-input-page__control-group">
            <span className="otp-input-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />}
              <Toggle label="Show error" checked={showError} onChange={setShowError} />
            </div>
          </div>
          <Button size="xs" variant="ghost" onClick={() => { setOtpValue(''); setCompleted(false) }}>
            <Icon name="refresh" size="sm" /> Reset
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── Verification Flow Demo ──────────────────────────────────────────────────

function VerificationFlowDemo({ tier }: { tier: Tier }) {
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [resent, setResent] = useState(false)

  const handleComplete = (code: string) => {
    setStatus('verifying')
    // Simulate async verification
    setTimeout(() => {
      if (code === '123456') {
        setStatus('success')
      } else {
        setStatus('error')
      }
    }, 1500)
  }

  const handleResend = () => {
    setResent(true)
    setOtp('')
    setStatus('idle')
    setTimeout(() => setResent(false), 3000)
  }

  const handleReset = () => {
    setOtp('')
    setStatus('idle')
  }

  return (
    <div className="otp-input-page__verification-flow">
      <div className="otp-input-page__verification-header">
        <span className="otp-input-page__verification-title">Enter verification code</span>
        <span className="otp-input-page__verification-subtitle">
          We sent a 6-digit code to your email. Try <strong>123456</strong> for success.
        </span>
      </div>

      {tier === 'lite' ? (
        <LiteOtpInput
          length={6}
          value={otp}
          onChange={(v) => { setOtp(v); setStatus('idle') }}
          onComplete={handleComplete}
          error={status === 'error' ? 'Invalid code. Try again.' : undefined}
        />
      ) : (
        <OtpInput
          length={6}
          size="md"
          value={otp}
          onChange={(v) => { setOtp(v); setStatus('idle') }}
          onComplete={handleComplete}
          error={status === 'error' ? 'Invalid code. Try again.' : undefined}
          aria-label="Verification code"
        />
      )}

      {status === 'success' && (
        <div className="otp-input-page__verification-status otp-input-page__verification-status--success">
          Verified successfully!
        </div>
      )}

      {status === 'verifying' && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Verifying...
        </div>
      )}

      <div className="otp-input-page__verification-actions">
        <button type="button" className="otp-input-page__verification-link" onClick={handleResend}>
          {resent ? 'Code resent!' : 'Resend code'}
        </button>
        {(status === 'error' || status === 'success') && (
          <Button size="xs" variant="ghost" onClick={handleReset}>
            <Icon name="refresh" size="sm" /> Try again
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OtpInputPage() {
  useStyles('otp-input-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.otp-input-page__section')
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
    <div className="otp-input-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="otp-input-page__hero">
        <h1 className="otp-input-page__title">OtpInput</h1>
        <p className="otp-input-page__desc">
          One-time password input with auto-advance, paste support, and error shake animation.
          Ships in two weight tiers for verification flows and multi-factor authentication.
        </p>
        <div className="otp-input-page__import-row">
          <code className="otp-input-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. All Sizes ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="otp-input-page__section" id="sizes">
          <h2 className="otp-input-page__section-title"><a href="#sizes">Size Scale</a></h2>
          <p className="otp-input-page__section-desc">
            Five sizes from compact inline (xs) to extra-large display (xl). Sizes control cell dimensions and font size.
          </p>
          <div className="otp-input-page__preview otp-input-page__preview--col">
            {SIZES.map(s => (
              <div key={s} className="otp-input-page__labeled-item" style={{ width: '100%' }}>
                <OtpInput size={s} length={4} value="12" aria-label={`Size ${s}`} />
                <span className="otp-input-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Lengths ──────────────────────────────────── */}
      <section className="otp-input-page__section" id="lengths">
        <h2 className="otp-input-page__section-title"><a href="#lengths">Code Lengths</a></h2>
        <p className="otp-input-page__section-desc">
          Configurable digit count for different verification schemes. Common lengths are 4, 6, and 8 digits.
        </p>
        <div className="otp-input-page__preview otp-input-page__preview--col">
          {tier === 'lite' ? (
            <>
              <div className="otp-input-page__labeled-item"><LiteOtpInput length={4} /><span className="otp-input-page__item-label">4 digits</span></div>
              <div className="otp-input-page__labeled-item"><LiteOtpInput length={6} /><span className="otp-input-page__item-label">6 digits</span></div>
            </>
          ) : (
            <>
              <div className="otp-input-page__labeled-item"><OtpInput length={4} size="sm" aria-label="4-digit code" /><span className="otp-input-page__item-label">4 digits</span></div>
              <div className="otp-input-page__labeled-item"><OtpInput length={6} size="sm" aria-label="6-digit code" /><span className="otp-input-page__item-label">6 digits</span></div>
              <div className="otp-input-page__labeled-item"><OtpInput length={8} size="sm" aria-label="8-digit code" /><span className="otp-input-page__item-label">8 digits</span></div>
            </>
          )}
        </div>
      </section>

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="otp-input-page__section" id="states">
        <h2 className="otp-input-page__section-title"><a href="#states">States</a></h2>
        <p className="otp-input-page__section-desc">
          OTP input handles default, error (with shake animation at motion 2+), and disabled states.
        </p>
        <div className="otp-input-page__states-grid">
          <div className="otp-input-page__state-cell">
            {tier === 'lite' ? <LiteOtpInput length={4} /> : <OtpInput length={4} size="sm" aria-label="Default" />}
            <span className="otp-input-page__state-label">Default</span>
          </div>
          <div className="otp-input-page__state-cell">
            {tier === 'lite' ? <LiteOtpInput length={4} value="1234" /> : <OtpInput length={4} size="sm" value="1234" aria-label="Filled" />}
            <span className="otp-input-page__state-label">Filled</span>
          </div>
          <div className="otp-input-page__state-cell">
            {tier === 'lite' ? <LiteOtpInput length={4} error="Invalid code" /> : <OtpInput length={4} size="sm" error="Invalid code" value="9999" aria-label="Error" />}
            <span className="otp-input-page__state-label">Error</span>
          </div>
          <div className="otp-input-page__state-cell">
            {tier === 'lite' ? <LiteOtpInput length={4} /> : <OtpInput length={4} size="sm" disabled aria-label="Disabled" />}
            <span className="otp-input-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── 6. Paste Support ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="otp-input-page__section" id="paste">
          <h2 className="otp-input-page__section-title"><a href="#paste">Paste Support</a></h2>
          <p className="otp-input-page__section-desc">
            Paste a full code from clipboard and it auto-distributes across all fields. Try copying
            <code style={{ marginInline: '0.25rem' }}>123456</code> and pasting into the first field.
          </p>
          <div className="otp-input-page__preview">
            <OtpInput length={6} aria-label="Paste test" onComplete={(code) => console.log('Pasted:', code)} />
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={`<OtpInput\n  length={6}\n  onComplete={(code) => verifyCode(code)}\n/>`} language="typescript" />
          </div>
        </section>
      )}

      {/* ── 7. Input Types ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="otp-input-page__section" id="types">
          <h2 className="otp-input-page__section-title"><a href="#types">Input Types</a></h2>
          <p className="otp-input-page__section-desc">
            Use <code>type="number"</code> for numeric-only codes or <code>type="text"</code> for alphanumeric
            verification codes. Number type filters non-digit input automatically.
          </p>
          <div className="otp-input-page__preview otp-input-page__preview--col">
            <div className="otp-input-page__labeled-item">
              <OtpInput length={6} size="sm" type="number" aria-label="Numeric code" />
              <span className="otp-input-page__item-label">type="number" (digits only)</span>
            </div>
            <div className="otp-input-page__labeled-item">
              <OtpInput length={6} size="sm" type="text" aria-label="Alphanumeric code" />
              <span className="otp-input-page__item-label">type="text" (any character)</span>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Numeric OTP (default)\n<OtpInput type="number" length={6} />\n\n// Alphanumeric code\n<OtpInput type="text" length={8} />`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 8. Verification Flow ──────────────────────── */}
      <section className="otp-input-page__section" id="verification">
        <h2 className="otp-input-page__section-title"><a href="#verification">Verification Flow</a></h2>
        <p className="otp-input-page__section-desc">
          Complete verification flow example with submit button, resend link, and status feedback.
          Enter any 6-digit code to see the flow in action.
        </p>
        <div className="otp-input-page__preview">
          <VerificationFlowDemo tier={tier} />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`const [otp, setOtp] = useState('')\nconst [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')\n\nconst verify = async (code: string) => {\n  setStatus('verifying')\n  const result = await api.verifyOtp(code)\n  setStatus(result.ok ? 'success' : 'error')\n}\n\n<OtpInput\n  value={otp}\n  onChange={setOtp}\n  onComplete={verify}\n  error={status === 'error' ? 'Invalid code' : undefined}\n/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 9. Weight Tiers ────────────────────────────── */}
      <section className="otp-input-page__section" id="tiers">
        <h2 className="otp-input-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="otp-input-page__section-desc">
          Choose the right balance of features and bundle size. Lite has basic digit input,
          Standard adds sizes, error shake, paste handling, and type filtering.
        </p>

        <div className="otp-input-page__tiers">
          <div
            className={`otp-input-page__tier-card${tier === 'lite' ? ' otp-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="otp-input-page__tier-header">
              <span className="otp-input-page__tier-name">Lite</span>
              <span className="otp-input-page__tier-size">~0.4 KB</span>
            </div>
            <p className="otp-input-page__tier-desc">
              Basic OTP input with auto-advance and backspace navigation.
              No sizes, no shake animation, no type filtering.
            </p>
            <div className="otp-input-page__tier-import">
              import {'{'} OtpInput {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="otp-input-page__tier-preview">
              <LiteOtpInput length={4} />
            </div>
            <div className="otp-input-page__size-breakdown">
              <div className="otp-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>0.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`otp-input-page__tier-card${tier === 'standard' ? ' otp-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="otp-input-page__tier-header">
              <span className="otp-input-page__tier-name">Standard</span>
              <span className="otp-input-page__tier-size">~2 KB</span>
            </div>
            <p className="otp-input-page__tier-desc">
              Full-featured OTP with 5 sizes, error shake, paste handling,
              auto-complete callback, type filtering, and motion levels.
            </p>
            <div className="otp-input-page__tier-import">
              import {'{'} OtpInput {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="otp-input-page__tier-preview">
              <OtpInput length={4} size="sm" value="42" aria-label="Standard preview" />
            </div>
            <div className="otp-input-page__size-breakdown">
              <div className="otp-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.0 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>2.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          <div
            className={`otp-input-page__tier-card${tier === 'premium' ? ' otp-input-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')} role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="otp-input-page__tier-header">
              <span className="otp-input-page__tier-name">Premium</span>
              <span className="otp-input-page__tier-size">~3-5 KB</span>
            </div>
            <p className="otp-input-page__tier-desc">
              Aurora glow effects, spring-scale animations, shimmer gradients, particle effects at motion level 3.
            </p>
            <div className="otp-input-page__tier-import">
              import {'{'} OtpInput {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="otp-input-page__tier-preview">
              <OtpInput length={4} size="sm" value="42" aria-label="Premium preview" />
            </div>
            <div className="otp-input-page__size-breakdown">
              <div className="otp-input-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="otp-input-page__section" id="props">
        <h2 className="otp-input-page__section-title"><a href="#props">Props API</a></h2>
        <p className="otp-input-page__section-desc">
          All props accepted by OtpInput. The Lite tier supports length, value, onChange, onComplete, and error.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={otpInputProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="otp-input-page__section" id="accessibility">
        <h2 className="otp-input-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="otp-input-page__section-desc">
          Built with proper group semantics and individual digit labeling for screen readers.
        </p>
        <Card variant="default" padding="md">
          <ul className="otp-input-page__a11y-list">
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Group:</strong> Uses <code className="otp-input-page__a11y-key">role="group"</code> with <code className="otp-input-page__a11y-key">aria-label</code> for the entire OTP container.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Labels:</strong> Each digit has <code className="otp-input-page__a11y-key">aria-label="Digit N of M"</code> for screen reader clarity.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Keyboard:</strong> Auto-advance on digit entry, <code className="otp-input-page__a11y-key">Backspace</code> returns to previous digit.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Paste:</strong> Supports paste from clipboard with automatic distribution across fields.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Error:</strong> Error messages linked via <code className="otp-input-page__a11y-key">aria-describedby</code> with <code className="otp-input-page__a11y-key">role="alert"</code>.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Autocomplete:</strong> Uses <code className="otp-input-page__a11y-key">autocomplete="one-time-code"</code> for SMS autofill on supported devices.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>Touch targets:</strong> 44px minimum on coarse pointer devices via <code className="otp-input-page__a11y-key">@media (pointer: coarse)</code>.</span>
            </li>
            <li className="otp-input-page__a11y-item">
              <span className="otp-input-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span><strong>High contrast:</strong> Supports <code className="otp-input-page__a11y-key">forced-colors: active</code> with visible borders.</span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
