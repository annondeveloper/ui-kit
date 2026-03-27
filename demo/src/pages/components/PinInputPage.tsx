'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PinInput } from '@ui/components/pin-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pin-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pin-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .pin-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pin-page__hero::before {
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
        .pin-page__hero::before { animation: none; }
      }

      .pin-page__title {
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

      .pin-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pin-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pin-page__import-code {
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

      .pin-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .pin-page__section {
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
        animation: pin-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pin-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .pin-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .pin-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .pin-page__section-title a { color: inherit; text-decoration: none; }
      .pin-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .pin-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .pin-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .pin-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pin-page__preview--col {
        flex-direction: column;
        align-items: center;
      }

      .pin-page__status {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        text-align: center;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const pinProps: PropDef[] = [
  { name: 'length', type: 'number', default: '4', description: 'Number of input digits.' },
  { name: 'value', type: 'string', description: 'Controlled pin value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called on each digit change.' },
  { name: 'onComplete', type: '(value: string) => void', description: 'Called when all digits are filled.' },
  { name: 'mask', type: 'boolean', default: 'false', description: 'Mask entered digits with dots for security.' },
  { name: 'type', type: "'number' | 'alphanumeric'", default: "'number'", description: 'Restrict input to numbers or allow letters too.' },
  { name: 'placeholder', type: 'string', default: "'○'", description: 'Placeholder character for empty digits.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input cell size scale.' },
  { name: 'error', type: 'boolean', default: 'false', description: 'Show error styling on all digits.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all digit inputs.' },
  { name: 'oneTimeCode', type: 'boolean', default: 'false', description: 'Set autocomplete="one-time-code" for SMS autofill.' },
  { name: 'manageFocus', type: 'boolean', default: 'true', description: 'Auto-advance focus to next digit on input.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="pin-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { PinInput } from '@anthropic/ui-kit'"

export default function PinInputPage() {
  useStyles('pin-page', pageStyles)

  const [pin, setPin] = useState('')
  const [completed, setCompleted] = useState('')

  return (
    <div className="pin-page">
      <div className="pin-page__hero">
        <h1 className="pin-page__title">PinInput</h1>
        <p className="pin-page__desc">
          One-time code and PIN entry with auto-advancing focus, paste support, masked input,
          and configurable length. Supports SMS autofill with oneTimeCode.
        </p>
        <div className="pin-page__import-row">
          <code className="pin-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Basic & Masked ─────────────────────────────── */}
      <section className="pin-page__section" id="basic">
        <h2 className="pin-page__section-title"><a href="#basic">Basic & Masked</a></h2>
        <p className="pin-page__section-desc">
          Default 4-digit pin with auto-focus advance. Enable mask to hide entered digits.
          {completed ? ` Completed: ${completed}` : ''}
        </p>
        <div className="pin-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput
              value={pin}
              onChange={setPin}
              onComplete={setCompleted}
            />
            <span className="pin-page__status">Visible digits</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput mask length={4} />
            <span className="pin-page__status">Masked</span>
          </div>
        </div>
      </section>

      {/* ── Length & Type ──────────────────────────────── */}
      <section className="pin-page__section" id="length">
        <h2 className="pin-page__section-title"><a href="#length">Length & Alphanumeric</a></h2>
        <p className="pin-page__section-desc">
          Configure length from 4 to 8 digits. Use type="alphanumeric" to accept letters alongside numbers.
        </p>
        <div className="pin-page__preview pin-page__preview--col">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput length={6} oneTimeCode />
            <span className="pin-page__status">6-digit OTP (SMS autofill)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput length={8} type="alphanumeric" placeholder="-" />
            <span className="pin-page__status">8-character alphanumeric</span>
          </div>
        </div>
      </section>

      {/* ── Error & Disabled ──────────────────────────── */}
      <section className="pin-page__section" id="states">
        <h2 className="pin-page__section-title"><a href="#states">Error & Disabled</a></h2>
        <p className="pin-page__section-desc">
          Error state highlights all digit cells in red. Disabled prevents any input.
        </p>
        <div className="pin-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput error value="12" length={4} />
            <span className="pin-page__status">Error state</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput disabled value="1234" length={4} />
            <span className="pin-page__status">Disabled</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PinInput size="lg" length={4} />
            <span className="pin-page__status">Large size</span>
          </div>
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="pin-page__section" id="props">
        <h2 className="pin-page__section-title"><a href="#props">Props</a></h2>
        <p className="pin-page__section-desc">
          All props accepted by PinInput. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pinProps} />
        </Card>
      </section>
    </div>
  )
}
