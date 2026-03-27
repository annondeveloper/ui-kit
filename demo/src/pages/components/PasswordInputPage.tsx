'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PasswordInput } from '@ui/components/password-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pw-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pw-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .pw-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pw-page__hero::before {
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
        .pw-page__hero::before { animation: none; }
      }

      .pw-page__title {
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

      .pw-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pw-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pw-page__import-code {
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

      .pw-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .pw-page__section {
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
        animation: pw-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pw-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .pw-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .pw-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .pw-page__section-title a { color: inherit; text-decoration: none; }
      .pw-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .pw-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .pw-page__preview {
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

      .pw-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pw-page__preview--col {
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 360px;
        margin-inline: auto;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const pwProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled input value.' },
  { name: 'onChange', type: '(e: ChangeEvent<HTMLInputElement>) => void', description: 'Standard input change handler.' },
  { name: 'label', type: 'string', description: 'Label above the input.' },
  { name: 'description', type: 'string', description: 'Help text below the label.' },
  { name: 'error', type: 'string', description: 'Error message below the input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Input size scale.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required.' },
  { name: 'visibilityToggle', type: 'boolean', default: 'true', description: 'Show the eye icon to toggle password visibility.' },
  { name: 'showStrengthMeter', type: 'boolean', default: 'false', description: 'Display a password strength progress bar.' },
  { name: 'strengthLabels', type: 'string[]', default: "['', 'Weak', 'Fair', 'Good', 'Strong']", description: 'Labels for each strength level (0-4).' },
  { name: 'onStrengthChange', type: '(strength: number) => void', description: 'Called when calculated strength changes.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="pw-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { PasswordInput } from '@anthropic/ui-kit'"

export default function PasswordInputPage() {
  useStyles('pw-page', pageStyles)

  const [strength, setStrength] = useState(0)

  return (
    <div className="pw-page">
      <div className="pw-page__hero">
        <h1 className="pw-page__title">PasswordInput</h1>
        <p className="pw-page__desc">
          Secure password field with visibility toggle and optional strength meter.
          Calculates strength from length, character variety, and symbol usage.
        </p>
        <div className="pw-page__import-row">
          <code className="pw-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Visibility Toggle ─────────────────────────── */}
      <section className="pw-page__section" id="toggle">
        <h2 className="pw-page__section-title"><a href="#toggle">Visibility Toggle</a></h2>
        <p className="pw-page__section-desc">
          Click the eye icon to reveal or hide the password. The toggle is enabled by default
          and can be disabled with visibilityToggle={'{false}'}.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordInput label="With toggle (default)" placeholder="Enter password" />
          <PasswordInput label="Without toggle" placeholder="Enter password" visibilityToggle={false} />
        </div>
      </section>

      {/* ── Strength Meter ─────────────────────────────── */}
      <section className="pw-page__section" id="strength">
        <h2 className="pw-page__section-title"><a href="#strength">Strength Meter</a></h2>
        <p className="pw-page__section-desc">
          Enable showStrengthMeter to display a colored progress bar below the input.
          Try typing to see strength update in real time. Current strength: {strength}/4.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordInput
            label="Create password"
            placeholder="Type to see strength"
            showStrengthMeter
            onStrengthChange={setStrength}
            description="Use 8+ characters with uppercase, numbers, and symbols"
          />
          <PasswordInput
            label="With custom labels"
            placeholder="Custom strength labels"
            showStrengthMeter
            strengthLabels={['', 'Too short', 'Needs work', 'Almost there', 'Excellent']}
          />
        </div>
      </section>

      {/* ── States ─────────────────────────────────────── */}
      <section className="pw-page__section" id="states">
        <h2 className="pw-page__section-title"><a href="#states">States & Sizes</a></h2>
        <p className="pw-page__section-desc">
          Error, disabled, and size variations.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordInput label="Small" size="sm" placeholder="Small input" />
          <PasswordInput label="With error" error="Password is too weak" placeholder="Weak password" />
          <PasswordInput label="Disabled" disabled placeholder="Disabled" />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="pw-page__section" id="props">
        <h2 className="pw-page__section-title"><a href="#props">Props</a></h2>
        <p className="pw-page__section-desc">
          All props accepted by PasswordInput. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pwProps} />
        </Card>
      </section>
    </div>
  )
}
