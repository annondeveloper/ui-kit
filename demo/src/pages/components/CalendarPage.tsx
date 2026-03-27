'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Calendar } from '@ui/components/calendar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.calendar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: calendar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .calendar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .calendar-page__hero::before {
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
        .calendar-page__hero::before { animation: none; }
      }

      .calendar-page__title {
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

      .calendar-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .calendar-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .calendar-page__import-code {
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

      .calendar-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .calendar-page__section {
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
        animation: calendar-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes calendar-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .calendar-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .calendar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .calendar-page__section-title a { color: inherit; text-decoration: none; }
      .calendar-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .calendar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .calendar-page__preview {
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

      .calendar-page__preview::before {
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

// ─── Props Data ──────────────────────────────────────────────────────────────

const calendarProps: PropDef[] = [
  { name: 'value', type: 'Date | null', description: 'Controlled selected date.' },
  { name: 'defaultValue', type: 'Date | null', description: 'Uncontrolled initial selected date.' },
  { name: 'onChange', type: '(date: Date) => void', description: 'Called when a date is selected.' },
  { name: 'minDate', type: 'Date', description: 'Earliest selectable date.' },
  { name: 'maxDate', type: 'Date', description: 'Latest selectable date.' },
  { name: 'disabledDates', type: 'Date[] | ((date: Date) => boolean)', description: 'Dates or predicate to disable specific days.' },
  { name: 'firstDayOfWeek', type: '0 | 1', default: '0', description: 'Week start: 0 for Sunday, 1 for Monday.' },
  { name: 'locale', type: 'string', default: "'en-US'", description: 'Locale for day/month names.' },
  { name: 'showOutsideDays', type: 'boolean', default: 'false', description: 'Show days from adjacent months.' },
  { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Display ISO week numbers column.' },
  { name: 'numberOfMonths', type: 'number', default: '1', description: 'Number of months to display side by side.' },
  { name: 'highlightToday', type: 'boolean', default: 'true', description: 'Highlight today with an accent ring.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls overall calendar scale.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="calendar-page__copy-btn"
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

// ─── Page Component ──────────────────────────────────────────────────────────

const IMPORT_STR = "import { Calendar } from '@anthropic/ui-kit'"

export default function CalendarPage() {
  useStyles('calendar-page', pageStyles)

  const [selected, setSelected] = useState<Date | null>(null)
  const today = new Date()
  const disabledWeekends = (date: Date) => date.getDay() === 0 || date.getDay() === 6

  return (
    <div className="calendar-page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="calendar-page__hero">
        <h1 className="calendar-page__title">Calendar</h1>
        <p className="calendar-page__desc">
          Inline date picker with month navigation, disabled dates, week numbers, and multi-month display.
          Keyboard-navigable with full ARIA grid pattern.
        </p>
        <div className="calendar-page__import-row">
          <code className="calendar-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Basic ────────────────────────────────────────── */}
      <section className="calendar-page__section" id="basic">
        <h2 className="calendar-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="calendar-page__section-desc">
          Default calendar with month navigation. Click a day to select it.
          Selected: {selected ? selected.toLocaleDateString() : 'none'}.
        </p>
        <div className="calendar-page__preview">
          <Calendar value={selected} onChange={setSelected} highlightToday />
        </div>
      </section>

      {/* ── Disabled Dates & Week Numbers ────────────────── */}
      <section className="calendar-page__section" id="disabled">
        <h2 className="calendar-page__section-title"><a href="#disabled">Disabled Dates & Week Numbers</a></h2>
        <p className="calendar-page__section-desc">
          Weekends disabled via predicate function. Week numbers displayed with showWeekNumbers.
        </p>
        <div className="calendar-page__preview">
          <Calendar
            disabledDates={disabledWeekends}
            showWeekNumbers
            firstDayOfWeek={1}
          />
        </div>
      </section>

      {/* ── Two-Month View ───────────────────────────────── */}
      <section className="calendar-page__section" id="multi">
        <h2 className="calendar-page__section-title"><a href="#multi">Two-Month View</a></h2>
        <p className="calendar-page__section-desc">
          Display two months side by side with numberOfMonths={'{2}'}. Useful for date range selection contexts.
        </p>
        <div className="calendar-page__preview">
          <Calendar
            numberOfMonths={2}
            minDate={today}
            showOutsideDays
          />
        </div>
      </section>

      {/* ── Props Table ──────────────────────────────────── */}
      <section className="calendar-page__section" id="props">
        <h2 className="calendar-page__section-title"><a href="#props">Props</a></h2>
        <p className="calendar-page__section-desc">
          All props accepted by Calendar. Spreads native div attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={calendarProps} />
        </Card>
      </section>
    </div>
  )
}
