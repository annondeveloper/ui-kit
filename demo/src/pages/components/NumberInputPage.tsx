'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NumberInput } from '@ui/components/number-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ni-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ni-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ni-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ni-page__hero::before {
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
        .ni-page__hero::before { animation: none; }
      }

      .ni-page__title {
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

      .ni-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ni-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ni-page__import-code {
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

      .ni-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .ni-page__section {
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
        animation: ni-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ni-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .ni-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .ni-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .ni-page__section-title a { color: inherit; text-decoration: none; }
      .ni-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .ni-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .ni-page__preview {
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
        min-block-size: 80px;
      }

      .ni-page__preview::before {
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

const niProps: PropDef[] = [
  { name: 'value', type: 'number | null', description: 'Controlled numeric value.' },
  { name: 'defaultValue', type: 'number', description: 'Uncontrolled initial value.' },
  { name: 'onChange', type: '(value: number | null) => void', description: 'Called when the value changes.' },
  { name: 'min', type: 'number', description: 'Minimum allowed value.' },
  { name: 'max', type: 'number', description: 'Maximum allowed value.' },
  { name: 'step', type: 'number', default: '1', description: 'Increment/decrement step for stepper buttons and arrow keys.' },
  { name: 'precision', type: 'number', description: 'Number of decimal places to display.' },
  { name: 'label', type: 'string', description: 'Label above the input.' },
  { name: 'description', type: 'string', description: 'Help text below the label.' },
  { name: 'error', type: 'string', description: 'Error message below the input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input size scale.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and steppers.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the input read-only.' },
  { name: 'hideControls', type: 'boolean', default: 'false', description: 'Hides the increment/decrement stepper buttons.' },
  { name: 'clampBehavior', type: "'strict' | 'blur'", default: "'blur'", description: 'When to clamp: strict on every change, blur only on blur.' },
  { name: 'prefix', type: 'string', description: 'Text displayed before the value (e.g., "$").' },
  { name: 'suffix', type: 'string', description: 'Text displayed after the value (e.g., "kg").' },
  { name: 'thousandSeparator', type: 'boolean', default: 'false', description: 'Format display with thousand separators.' },
  { name: 'allowNegative', type: 'boolean', default: 'true', description: 'Allow negative values.' },
  { name: 'allowDecimal', type: 'boolean', default: 'true', description: 'Allow decimal values.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="ni-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { NumberInput } from '@anthropic/ui-kit'"

export default function NumberInputPage() {
  useStyles('ni-page', pageStyles)

  const [qty, setQty] = useState<number | null>(1)
  const [price, setPrice] = useState<number | null>(1250.5)

  return (
    <div className="ni-page">
      <div className="ni-page__hero">
        <h1 className="ni-page__title">NumberInput</h1>
        <p className="ni-page__desc">
          Numeric input with stepper buttons, min/max clamping, prefix/suffix decorations,
          and thousand separators. Supports keyboard arrows and mouse wheel.
        </p>
        <div className="ni-page__import-row">
          <code className="ni-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Steppers & Min/Max ─────────────────────────── */}
      <section className="ni-page__section" id="steppers">
        <h2 className="ni-page__section-title"><a href="#steppers">Steppers & Min/Max</a></h2>
        <p className="ni-page__section-desc">
          Built-in increment/decrement buttons with configurable step and clamped to min/max bounds.
          Current value: {qty ?? 'null'}.
        </p>
        <div className="ni-page__preview">
          <NumberInput
            label="Quantity"
            value={qty}
            onChange={setQty}
            min={0}
            max={100}
            step={1}
            placeholder="0-100"
          />
          <NumberInput
            label="Step of 5"
            defaultValue={25}
            min={0}
            max={100}
            step={5}
          />
          <NumberInput
            label="No controls"
            defaultValue={42}
            hideControls
          />
        </div>
      </section>

      {/* ── Prefix, Suffix & Thousands ─────────────────── */}
      <section className="ni-page__section" id="formatting">
        <h2 className="ni-page__section-title"><a href="#formatting">Prefix, Suffix & Formatting</a></h2>
        <p className="ni-page__section-desc">
          Decorate values with prefix/suffix strings and enable thousand separators for large numbers.
        </p>
        <div className="ni-page__preview">
          <NumberInput
            label="Price"
            prefix="$"
            value={price}
            onChange={setPrice}
            precision={2}
            thousandSeparator
            min={0}
          />
          <NumberInput
            label="Weight"
            suffix="kg"
            defaultValue={75}
            step={0.5}
            precision={1}
          />
          <NumberInput
            label="Percentage"
            suffix="%"
            min={0}
            max={100}
            defaultValue={50}
          />
        </div>
      </section>

      {/* ── Validation ─────────────────────────────────── */}
      <section className="ni-page__section" id="validation">
        <h2 className="ni-page__section-title"><a href="#validation">Validation & States</a></h2>
        <p className="ni-page__section-desc">
          Error messages, disabled state, and strict clamping behavior.
        </p>
        <div className="ni-page__preview">
          <NumberInput label="With error" error="Value must be positive" defaultValue={-5} />
          <NumberInput label="Disabled" disabled defaultValue={10} />
          <NumberInput label="Read only" readOnly defaultValue={99} />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="ni-page__section" id="props">
        <h2 className="ni-page__section-title"><a href="#props">Props</a></h2>
        <p className="ni-page__section-desc">
          All props accepted by NumberInput. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={niProps} />
        </Card>
      </section>
    </div>
  )
}
