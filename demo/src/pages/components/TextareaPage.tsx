'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Textarea } from '@ui/components/textarea'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ta-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ta-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ta-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ta-page__hero::before {
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
        .ta-page__hero::before { animation: none; }
      }

      .ta-page__title {
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

      .ta-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ta-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ta-page__import-code {
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

      .ta-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .ta-page__section {
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
        animation: ta-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ta-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .ta-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .ta-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .ta-page__section-title a { color: inherit; text-decoration: none; }
      .ta-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .ta-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .ta-page__preview {
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

      .ta-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ta-page__preview--col {
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 480px;
        margin-inline: auto;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const taProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled textarea value.' },
  { name: 'defaultValue', type: 'string', description: 'Uncontrolled initial value.' },
  { name: 'onChange', type: '(e: ChangeEvent<HTMLTextAreaElement>) => void', description: 'Standard textarea change handler.' },
  { name: 'label', type: 'string', description: 'Label above the textarea.' },
  { name: 'description', type: 'string', description: 'Help text below the label.' },
  { name: 'error', type: 'string', description: 'Error message below the textarea.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Textarea size scale.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the textarea.' },
  { name: 'required', type: 'boolean', default: 'false', description: 'Marks field as required.' },
  { name: 'autoResize', type: 'boolean', default: 'false', description: 'Automatically grow height to fit content.' },
  { name: 'minRows', type: 'number', default: '3', description: 'Minimum number of visible rows.' },
  { name: 'maxRows', type: 'number', description: 'Maximum rows before scrolling when autoResize is enabled.' },
  { name: 'maxLength', type: 'number', description: 'Maximum character count.' },
  { name: 'showCount', type: 'boolean', default: 'false', description: 'Display character count (requires maxLength).' },
  { name: 'resize', type: "'none' | 'vertical' | 'horizontal' | 'both'", default: "'vertical'", description: 'CSS resize behavior.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="ta-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Textarea } from '@anthropic/ui-kit'"

export default function TextareaPage() {
  useStyles('ta-page', pageStyles)

  return (
    <div className="ta-page">
      <div className="ta-page__hero">
        <h1 className="ta-page__title">Textarea</h1>
        <p className="ta-page__desc">
          Multi-line text input with auto-resize, character counter, and configurable row bounds.
          Supports all standard textarea behaviors with enhanced UX.
        </p>
        <div className="ta-page__import-row">
          <code className="ta-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Auto-Resize ────────────────────────────────── */}
      <section className="ta-page__section" id="autoresize">
        <h2 className="ta-page__section-title"><a href="#autoresize">Auto-Resize</a></h2>
        <p className="ta-page__section-desc">
          Enable autoResize to grow the textarea height as content is typed.
          Combined with minRows and maxRows to constrain the range.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea
            label="Auto-resize (3-8 rows)"
            placeholder="Start typing to see it grow..."
            autoResize
            minRows={3}
            maxRows={8}
          />
          <Textarea
            label="Fixed height (no resize)"
            placeholder="This textarea has a fixed height"
            resize="none"
            minRows={4}
          />
        </div>
      </section>

      {/* ── Character Counter ──────────────────────────── */}
      <section className="ta-page__section" id="counter">
        <h2 className="ta-page__section-title"><a href="#counter">Character Counter</a></h2>
        <p className="ta-page__section-desc">
          Set maxLength with showCount to display a live character counter.
          The counter turns red as the limit approaches.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            maxLength={280}
            showCount
            description="Maximum 280 characters"
          />
          <Textarea
            label="Short note"
            placeholder="Quick note..."
            maxLength={100}
            showCount
            autoResize
            minRows={2}
            maxRows={4}
          />
        </div>
      </section>

      {/* ── States ─────────────────────────────────────── */}
      <section className="ta-page__section" id="states">
        <h2 className="ta-page__section-title"><a href="#states">States & Validation</a></h2>
        <p className="ta-page__section-desc">
          Error messages, disabled, and required states.
        </p>
        <div className="ta-page__preview ta-page__preview--col">
          <Textarea label="With error" error="Description is required" placeholder="Required field" required />
          <Textarea label="Disabled" disabled defaultValue="This content cannot be edited" />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="ta-page__section" id="props">
        <h2 className="ta-page__section-title"><a href="#props">Props</a></h2>
        <p className="ta-page__section-desc">
          All props accepted by Textarea. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={taProps} />
        </Card>
      </section>
    </div>
  )
}
