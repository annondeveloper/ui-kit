'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DateRangePicker } from '@ui/components/date-range-picker'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.drp-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: drp-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .drp-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .drp-page__hero::before {
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
        .drp-page__hero::before { animation: none; }
      }

      .drp-page__title {
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

      .drp-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .drp-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .drp-page__import-code {
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

      .drp-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .drp-page__section {
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
        animation: drp-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes drp-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .drp-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .drp-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .drp-page__section-title a { color: inherit; text-decoration: none; }
      .drp-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .drp-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .drp-page__preview {
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

      .drp-page__preview::before {
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

const drpProps: PropDef[] = [
  { name: 'value', type: '[Date | null, Date | null]', description: 'Controlled range value as [start, end] tuple.' },
  { name: 'onChange', type: '(range: [Date | null, Date | null]) => void', description: 'Called when range selection changes.' },
  { name: 'presets', type: 'DateRangePreset[]', description: 'Quick-select preset ranges displayed as buttons.' },
  { name: 'minDate', type: 'Date', description: 'Earliest selectable date.' },
  { name: 'maxDate', type: 'Date', description: 'Latest selectable date.' },
  { name: 'label', type: 'string', description: 'Label displayed above the input trigger.' },
  { name: 'placeholder', type: 'string', default: "'Select range'", description: 'Placeholder text when no range selected.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Input trigger size.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the trigger.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the picker.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'name', type: 'string', description: 'Form field name for hidden input serialization.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="drp-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { DateRangePicker } from '@anthropic/ui-kit'"

export default function DateRangePickerPage() {
  useStyles('drp-page', pageStyles)

  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])
  const today = new Date()

  const presets = [
    { label: 'Last 7 days', range: [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), today] as [Date, Date] },
    { label: 'Last 30 days', range: [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30), today] as [Date, Date] },
    { label: 'This month', range: [new Date(today.getFullYear(), today.getMonth(), 1), today] as [Date, Date] },
  ]

  return (
    <div className="drp-page">
      <div className="drp-page__hero">
        <h1 className="drp-page__title">DateRangePicker</h1>
        <p className="drp-page__desc">
          Select a date range with a dropdown calendar, preset shortcuts, and keyboard navigation.
          Built on Calendar with range highlighting.
        </p>
        <div className="drp-page__import-row">
          <code className="drp-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Basic ──────────────────────────────────────── */}
      <section className="drp-page__section" id="basic">
        <h2 className="drp-page__section-title"><a href="#basic">Basic Range Selection</a></h2>
        <p className="drp-page__section-desc">
          Click two dates to select a range. The calendar highlights the start, end, and days in between.
        </p>
        <div className="drp-page__preview">
          <DateRangePicker
            label="Date range"
            value={range}
            onChange={setRange}
          />
        </div>
      </section>

      {/* ── Presets ────────────────────────────────────── */}
      <section className="drp-page__section" id="presets">
        <h2 className="drp-page__section-title"><a href="#presets">With Presets</a></h2>
        <p className="drp-page__section-desc">
          Preset ranges appear as quick-select buttons alongside the calendar for common time windows.
        </p>
        <div className="drp-page__preview">
          <DateRangePicker
            label="Report period"
            presets={presets}
            placeholder="Choose period"
          />
        </div>
      </section>

      {/* ── Sizes & Error ─────────────────────────────── */}
      <section className="drp-page__section" id="sizes">
        <h2 className="drp-page__section-title"><a href="#sizes">Sizes & Validation</a></h2>
        <p className="drp-page__section-desc">
          Available in sm, md, and lg sizes. Pass an error string to display validation feedback.
        </p>
        <div className="drp-page__preview" style={{ flexDirection: 'column', alignItems: 'stretch', maxInlineSize: 360 }}>
          <DateRangePicker label="Small" size="sm" placeholder="Select dates" />
          <DateRangePicker label="Medium (default)" size="md" placeholder="Select dates" />
          <DateRangePicker label="With error" size="md" error="End date is required" />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="drp-page__section" id="props">
        <h2 className="drp-page__section-title"><a href="#props">Props</a></h2>
        <p className="drp-page__section-desc">
          All props accepted by DateRangePicker. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={drpProps} />
        </Card>
      </section>
    </div>
  )
}
