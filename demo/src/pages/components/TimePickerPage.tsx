'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TimePicker } from '@ui/components/time-picker'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tp-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tp-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .tp-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tp-page__hero::before {
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
        .tp-page__hero::before { animation: none; }
      }

      .tp-page__title {
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

      .tp-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tp-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tp-page__import-code {
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

      .tp-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .tp-page__section {
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
        animation: tp-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes tp-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .tp-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .tp-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .tp-page__section-title a { color: inherit; text-decoration: none; }
      .tp-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .tp-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .tp-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .tp-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const tpProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled time value (e.g., "14:30" or "2:30 PM").' },
  { name: 'onChange', type: '(time: string) => void', description: 'Called when the selected time changes.' },
  { name: 'format', type: "'12h' | '24h'", default: "'12h'", description: 'Display format: 12-hour with AM/PM or 24-hour.' },
  { name: 'minuteStep', type: 'number', default: '1', description: 'Minute increment step in the dropdown list.' },
  { name: 'minTime', type: 'string', description: 'Earliest selectable time (e.g., "09:00").' },
  { name: 'maxTime', type: 'string', description: 'Latest selectable time (e.g., "17:00").' },
  { name: 'label', type: 'string', description: 'Label displayed above the input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input size scale.' },
  { name: 'error', type: 'string', description: 'Error message below the input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the picker.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Show a clear button when a value is set.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'name', type: 'string', description: 'Form field name for hidden input serialization.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="tp-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { TimePicker } from '@anthropic/ui-kit'"

export default function TimePickerPage() {
  useStyles('tp-page', pageStyles)

  const [time12, setTime12] = useState<string | undefined>(undefined)
  const [time24, setTime24] = useState<string | undefined>(undefined)

  return (
    <div className="tp-page">
      <div className="tp-page__hero">
        <h1 className="tp-page__title">TimePicker</h1>
        <p className="tp-page__desc">
          Time selection input with dropdown, supporting 12-hour and 24-hour formats,
          minute stepping, and time range constraints.
        </p>
        <div className="tp-page__import-row">
          <code className="tp-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── 12h vs 24h ─────────────────────────────────── */}
      <section className="tp-page__section" id="formats">
        <h2 className="tp-page__section-title"><a href="#formats">12-Hour & 24-Hour Format</a></h2>
        <p className="tp-page__section-desc">
          Toggle between 12-hour (AM/PM) and 24-hour display. The value is always emitted in the configured format.
        </p>
        <div className="tp-page__preview">
          <TimePicker
            label="12-hour"
            format="12h"
            value={time12}
            onChange={setTime12}
            placeholder="Pick time"
            clearable
          />
          <TimePicker
            label="24-hour"
            format="24h"
            value={time24}
            onChange={setTime24}
            placeholder="HH:MM"
            clearable
          />
        </div>
      </section>

      {/* ── Minute Steps ───────────────────────────────── */}
      <section className="tp-page__section" id="steps">
        <h2 className="tp-page__section-title"><a href="#steps">Minute Steps</a></h2>
        <p className="tp-page__section-desc">
          Control granularity with minuteStep. Steps of 15 show :00, :15, :30, :45 in the dropdown.
        </p>
        <div className="tp-page__preview">
          <TimePicker label="5-min steps" minuteStep={5} format="24h" placeholder="Select" />
          <TimePicker label="15-min steps" minuteStep={15} format="12h" placeholder="Select" />
          <TimePicker label="30-min steps" minuteStep={30} format="12h" placeholder="Select" />
        </div>
      </section>

      {/* ── Constrained Range ─────────────────────────── */}
      <section className="tp-page__section" id="range">
        <h2 className="tp-page__section-title"><a href="#range">Time Range Constraints</a></h2>
        <p className="tp-page__section-desc">
          Restrict selectable times with minTime and maxTime. Times outside the range are disabled.
        </p>
        <div className="tp-page__preview">
          <TimePicker
            label="Business hours only"
            format="12h"
            minTime="09:00"
            maxTime="17:00"
            minuteStep={15}
            placeholder="9 AM - 5 PM"
          />
          <TimePicker
            label="With error"
            error="Time is required"
            placeholder="Required"
          />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="tp-page__section" id="props">
        <h2 className="tp-page__section-title"><a href="#props">Props</a></h2>
        <p className="tp-page__section-desc">
          All props accepted by TimePicker. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={tpProps} />
        </Card>
      </section>
    </div>
  )
}
