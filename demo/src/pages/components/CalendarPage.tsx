'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Calendar } from '@ui/components/calendar'
import { Calendar as LiteCalendar } from '@ui/lite/calendar'
import { Calendar as PremiumCalendar } from '@ui/premium/calendar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

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

      /* ── Sections ───────────────────────────────────── */

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

      /* ── Playground ─────────────────────────────────── */

      .calendar-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .calendar-page__playground {
          grid-template-columns: 1fr;
        }
        .calendar-page__playground-controls {
          position: static !important;
        }
      }

      @container calendar-page (max-width: 680px) {
        .calendar-page__playground {
          grid-template-columns: 1fr;
        }
        .calendar-page__playground-controls {
          position: static !important;
        }
      }

      .calendar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .calendar-page__playground-result {
        overflow-x: auto;
        min-block-size: 320px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .calendar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .calendar-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .calendar-page__playground-controls {
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

      .calendar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .calendar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .calendar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .calendar-page__option-btn {
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
      .calendar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .calendar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .calendar-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }
      .calendar-page__toggle-label:hover { color: var(--text-primary); }

      /* ── Tier cards ─────────────────────────────────── */

      .calendar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container calendar-page (max-width: 640px) {
        .calendar-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      .calendar-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .calendar-page__tier-card:hover { border-color: var(--border-strong); }
      .calendar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .calendar-page__tier-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-block-end: 0.5rem;
      }
      .calendar-page__tier-name {
        font-weight: 700;
        color: var(--text-primary);
      }
      .calendar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }
      .calendar-page__tier-desc {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0 0 0.75rem;
      }
      .calendar-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: var(--text-secondary);
        background: oklch(0% 0 0 / 0.15);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        margin-block-end: 0.75rem;
        overflow-x: auto;
        white-space: nowrap;
      }
      .calendar-page__tier-preview {
        display: flex;
        justify-content: center;
        padding: 0.75rem 0;
      }

      .calendar-page__size-breakdown {
        margin-block-start: 0.5rem;
        padding-block-start: 0.5rem;
        border-block-start: 1px solid var(--border-subtle);
      }
      .calendar-page__size-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      /* ── Accessibility ──────────────────────────────── */

      .calendar-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .calendar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary);
      }
      .calendar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }
      .calendar-page__a11y-key {
        font-family: 'SF Mono', monospace;
        font-size: 0.75rem;
        padding: 0.125rem 0.375rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
      }

      /* ── Source links ───────────────────────────────── */

      .calendar-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--brand);
        font-size: var(--text-sm, 0.875rem);
        text-decoration: none;
        padding: 0.375rem 0;
      }
      .calendar-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
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
  { name: 'firstDayOfWeek', type: '0 | 1', description: 'Week start: 0 for Sunday, 1 for Monday.' },
  { name: 'locale', type: 'string', description: 'Locale for day/month names.' },
  { name: 'showOutsideDays', type: 'boolean', description: 'Show days from adjacent months.' },
  { name: 'showWeekNumbers', type: 'boolean', description: 'Display ISO week numbers column.' },
  { name: 'numberOfMonths', type: 'number', description: 'Number of months to display side by side.' },
  { name: 'highlightToday', type: 'boolean', description: 'Highlight today with an accent ring.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Controls overall calendar scale.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: readonly Size[] = ['sm', 'md', 'lg'] as const

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { Calendar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { Calendar } from '@annondeveloper/ui-kit'",
  premium: "import { Calendar } from '@annondeveloper/ui-kit/premium'",
}

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

// ─── Control Widgets ─────────────────────────────────────────────────────────

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
    <div className="calendar-page__control-group">
      <span className="calendar-page__control-label">{label}</span>
      <div className="calendar-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`calendar-page__option-btn${opt === value ? ' calendar-page__option-btn--active' : ''}`}
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
    <label className="calendar-page__toggle-label">
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

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: Size,
  showWeekNumbers: boolean,
  highlightToday: boolean,
  firstDayOfWeek: 0 | 1,
  numberOfMonths: number,
  disabled: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showWeekNumbers) props.push('  showWeekNumbers')
  if (highlightToday) props.push('  highlightToday')
  if (firstDayOfWeek === 1) props.push('  firstDayOfWeek={1}')
  if (numberOfMonths > 1) props.push(`  numberOfMonths={${numberOfMonths}}`)
  if (disabled) props.push('  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<Calendar onChange={setDate} />'
    : `<Calendar\n  onChange={setDate}\n${props.join('\n')}\n/>`

  return `${importStr}\n\nconst [date, setDate] = useState<Date | null>(null)\n\n${jsx}`
}

function generateHtmlCode(
  tier: Tier,
  size: Size,
  brandColor: string,
): string {
  const className = tier === 'lite' ? 'ui-lite-calendar' : 'ui-calendar'
  const cssImport = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite/styles.css'
    : '@annondeveloper/ui-kit/css/components/calendar.css'

  return `<!-- HTML+CSS — ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/${cssImport}">

<div class="${className}" data-size="${size}"${brandColor !== '#7c3aed' ? ` style="--brand: ${brandColor}"` : ''}>
  <!-- Calendar requires JS for navigation -->
  <!-- Use the React/Vue/Svelte component or build custom JS -->
</div>

<style>
  @import '${cssImport}';
</style>`
}

function generateVueCode(
  tier: Tier,
  size: Size,
  showWeekNumbers: boolean,
  highlightToday: boolean,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-calendar"`, `data-size="${size}"`]
    return `<template>\n  <div ${attrs.join(' ')}>\n    <!-- Lite calendar: CSS-only shell -->\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  @change="onDateChange"']
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showWeekNumbers) attrs.push('  show-week-numbers')
  if (highlightToday) attrs.push('  highlight-today')
  if (disabled) attrs.push('  :disabled-dates="disableWeekends"')

  return `<template>\n  <Calendar\n${attrs.join('\n')}\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { Calendar } from '${importPath}'\n\nconst date = ref(null)\nconst disableWeekends = (d) => d.getDay() === 0 || d.getDay() === 6\nconst onDateChange = (d) => { date.value = d }\n</script>`
}

function generateAngularCode(
  tier: Tier,
  size: Size,
  showWeekNumbers: boolean,
  highlightToday: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-lite-calendar"`, `data-size="${size}"`]
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <!-- Lite calendar shell -->\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs = [`class="ui-calendar"`, `data-size="${size}"`]
  if (showWeekNumbers) attrs.push('[attr.data-week-numbers]="true"')
  if (highlightToday) attrs.push('[attr.data-highlight-today]="true"')
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<div\n  ${attrs.join('\n  ')}\n>\n  <!-- Calendar via CSS + custom JS logic -->\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/calendar.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: Size,
  showWeekNumbers: boolean,
  highlightToday: boolean,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div\n  class="ui-lite-calendar"\n  data-size="${size}"\n>\n  <!-- Lite calendar shell -->\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  on:change={handleDate}`]
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (showWeekNumbers) attrs.push('  showWeekNumbers')
  if (highlightToday) attrs.push('  highlightToday')
  if (disabled) attrs.push('  disabledDates={disableWeekends}')

  return `<script>\n  import { Calendar } from '${importPath}';\n  let date = null;\n  const disableWeekends = (d) => d.getDay() === 0 || d.getDay() === 6;\n  const handleDate = (e) => { date = e.detail; };\n</script>\n\n<Calendar\n${attrs.join('\n')}\n/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp, brandColor }: { tier: Tier; brandColor: string }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<Size>('md')
  const [showWeekNumbers, setShowWeekNumbers] = useState(false)
  const [highlightToday, setHighlightToday] = useState(true)
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<0 | 1>(0)
  const [numberOfMonths, setNumberOfMonths] = useState(1)
  const [disableWeekends, setDisableWeekends] = useState(false)
  const [showOutsideDays, setShowOutsideDays] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [selected, setSelected] = useState<Date | null>(null)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const CalendarComponent = tier === 'lite' ? LiteCalendar : tier === 'premium' ? PremiumCalendar : Calendar

  const disabledFn = disableWeekends ? ((d: Date) => d.getDay() === 0 || d.getDay() === 6) : undefined

  const reactCode = useMemo(
    () => generateReactCode(tier, size, showWeekNumbers, highlightToday, firstDayOfWeek, numberOfMonths, disableWeekends, motion),
    [tier, size, showWeekNumbers, highlightToday, firstDayOfWeek, numberOfMonths, disableWeekends, motion],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(tier, size, brandColor),
    [tier, size, brandColor],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, showWeekNumbers, highlightToday, disableWeekends),
    [tier, size, showWeekNumbers, highlightToday, disableWeekends],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, showWeekNumbers, highlightToday),
    [tier, size, showWeekNumbers, highlightToday],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, showWeekNumbers, highlightToday, disableWeekends),
    [tier, size, showWeekNumbers, highlightToday, disableWeekends],
  )

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCssCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCssCode, vueCode, angularCode, svelteCode])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  return (
    <section className="calendar-page__section" id="playground">
      <h2 className="calendar-page__section-title">
        <a href="#playground">Playground</a>
      </h2>
      <p className="calendar-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
        {selected ? ` Selected: ${selected.toLocaleDateString()}.` : ''}
      </p>

      <div className="calendar-page__playground">
        {/* Preview area */}
        <div className="calendar-page__playground-preview">
          <div className="calendar-page__playground-result">
            <CalendarComponent
              value={selected}
              onChange={setSelected}
              size={size}
              showWeekNumbers={showWeekNumbers}
              highlightToday={highlightToday}
              firstDayOfWeek={firstDayOfWeek}
              numberOfMonths={numberOfMonths}
              showOutsideDays={showOutsideDays}
              disabledDates={disabledFn}
              {...(tier !== 'lite' ? { motion } : {})}
            />
          </div>

          {/* Tabbed code output */}
          <div>
            <Tabs
              tabs={codeTabs}
              activeTab={activeCodeTab}
              onChange={setActiveCodeTab}
              size="sm"
            >
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCssCode} language="html" showLineNumbers />
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
        <div className="calendar-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

          <OptionGroup
            label="First Day"
            options={['0', '1'] as const}
            value={String(firstDayOfWeek) as '0' | '1'}
            onChange={v => setFirstDayOfWeek(Number(v) as 0 | 1)}
          />

          <OptionGroup
            label="Months"
            options={['1', '2'] as const}
            value={String(numberOfMonths) as '1' | '2'}
            onChange={v => setNumberOfMonths(Number(v))}
          />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="calendar-page__control-group">
            <span className="calendar-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Highlight today" checked={highlightToday} onChange={setHighlightToday} />
              <Toggle label="Week numbers" checked={showWeekNumbers} onChange={setShowWeekNumbers} />
              <Toggle label="Outside days" checked={showOutsideDays} onChange={setShowOutsideDays} />
              <Toggle label="Disable weekends" checked={disableWeekends} onChange={setDisableWeekends} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────

const IMPORT_STR = "import { Calendar } from '@anthropic/ui-kit'"

export default function CalendarPage() {
  useStyles('calendar-page', pageStyles)
  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#7c3aed')

  const [selected, setSelected] = useState<Date | null>(null)
  const today = new Date()
  const disabledWeekends = (date: Date) => date.getDay() === 0 || date.getDay() === 6

  const CalendarComponent = tier === 'lite' ? LiteCalendar : tier === 'premium' ? PremiumCalendar : Calendar

  const importStr = IMPORT_STRINGS[tier]

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
          <code className="calendar-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────────── */}
      <section className="calendar-page__section" id="basic">
        <h2 className="calendar-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="calendar-page__section-desc">
          Default calendar with month navigation. Click a day to select it.
          Selected: {selected ? selected.toLocaleDateString() : 'none'}.
          {tier !== 'standard' && ` Showing the ${tier} tier variant.`}
        </p>
        <div className="calendar-page__preview">
          <CalendarComponent value={selected} onChange={setSelected} highlightToday />
        </div>
      </section>

      {/* ── 2. Sizes ─────────────────────────────────────── */}
      <section className="calendar-page__section" id="sizes">
        <h2 className="calendar-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="calendar-page__section-desc">
          Three size options: small for compact UIs, medium (default), and large for touch-first interfaces.
        </p>
        <div className="calendar-page__preview">
          <CalendarComponent size="sm" highlightToday />
          <CalendarComponent size="md" highlightToday />
          <CalendarComponent size="lg" highlightToday />
        </div>
      </section>

      {/* ── 3. Disabled Dates & Week Numbers ─────────────── */}
      <section className="calendar-page__section" id="disabled">
        <h2 className="calendar-page__section-title"><a href="#disabled">Disabled Dates & Week Numbers</a></h2>
        <p className="calendar-page__section-desc">
          Weekends disabled via predicate function. Week numbers displayed with showWeekNumbers.
          Monday first via firstDayOfWeek={'{1}'}.
        </p>
        <div className="calendar-page__preview">
          <CalendarComponent
            disabledDates={disabledWeekends}
            showWeekNumbers
            firstDayOfWeek={1}
          />
        </div>
      </section>

      {/* ── 4. Min/Max Date Range ────────────────────────── */}
      <section className="calendar-page__section" id="range">
        <h2 className="calendar-page__section-title"><a href="#range">Min/Max Date Range</a></h2>
        <p className="calendar-page__section-desc">
          Restrict selectable dates to a range. Dates outside the range are visually muted and unclickable.
          Here: today through 60 days in the future.
        </p>
        <div className="calendar-page__preview">
          <CalendarComponent
            minDate={today}
            maxDate={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60)}
            highlightToday
            showOutsideDays
          />
        </div>
      </section>

      {/* ── 5. Two-Month View ────────────────────────────── */}
      <section className="calendar-page__section" id="multi">
        <h2 className="calendar-page__section-title"><a href="#multi">Two-Month View</a></h2>
        <p className="calendar-page__section-desc">
          Display two months side by side with numberOfMonths={'{2}'}. Useful for date range selection contexts.
        </p>
        <div className="calendar-page__preview">
          <CalendarComponent
            numberOfMonths={2}
            minDate={today}
            showOutsideDays
          />
        </div>
      </section>

      {/* ── 6. Playground ────────────────────────────────── */}
      <PlaygroundSection tier={tier} brandColor={brandColor} />

      {/* ── 7. Weight Tiers ──────────────────────────────── */}
      <section className="calendar-page__section" id="tiers">
        <h2 className="calendar-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="calendar-page__section-desc">
          Choose the right balance of features and bundle size. Lite omits motion; Premium adds spring hover and glow effects.
        </p>

        <div className="calendar-page__tiers">
          {/* Lite */}
          <div
            className={`calendar-page__tier-card${tier === 'lite' ? ' calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="calendar-page__tier-header">
              <span className="calendar-page__tier-name">Lite</span>
              <span className="calendar-page__tier-size">~0.4 KB</span>
            </div>
            <p className="calendar-page__tier-desc">
              Thin wrapper over Standard with motion forced to 0. Zero extra JavaScript.
            </p>
            <div className="calendar-page__tier-import">
              import {'{'} Calendar {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="calendar-page__tier-preview">
              <LiteCalendar size="sm" highlightToday />
            </div>
            <div className="calendar-page__size-breakdown">
              <div className="calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.4 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>4.2 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.6 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`calendar-page__tier-card${tier === 'standard' ? ' calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="calendar-page__tier-header">
              <span className="calendar-page__tier-name">Standard</span>
              <span className="calendar-page__tier-size">~4.5 KB</span>
            </div>
            <p className="calendar-page__tier-desc">
              Full-featured calendar with motion, keyboard navigation, locale support, and date range helpers.
            </p>
            <div className="calendar-page__tier-import">
              import {'{'} Calendar {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="calendar-page__tier-preview">
              <Calendar size="sm" highlightToday />
            </div>
            <div className="calendar-page__size-breakdown">
              <div className="calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.7 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`calendar-page__tier-card${tier === 'premium' ? ' calendar-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="calendar-page__tier-header">
              <span className="calendar-page__tier-name">Premium</span>
              <span className="calendar-page__tier-size">~5.2 KB</span>
            </div>
            <p className="calendar-page__tier-desc">
              Everything in Standard plus spring hover on day cells, glow on selected day, and shimmer effects.
            </p>
            <div className="calendar-page__tier-import">
              import {'{'} Calendar {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="calendar-page__tier-preview">
              <PremiumCalendar size="sm" highlightToday />
            </div>
            <div className="calendar-page__size-breakdown">
              <div className="calendar-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>5.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>6.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="calendar-page__section" id="brand-color">
        <h2 className="calendar-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="calendar-page__section-desc">
          The calendar inherits the <code>--brand</code> CSS custom property. Use the picker to preview different brand colors.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBlockEnd: '1rem' }}>
          <ColorInput value={brandColor} onChange={setBrandColor} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{brandColor}</span>
        </div>
        <div className="calendar-page__preview" style={{ '--brand': brandColor } as React.CSSProperties}>
          <CalendarComponent highlightToday size="md" />
        </div>
      </section>

      {/* ── 9. Props Table ───────────────────────────────── */}
      <section className="calendar-page__section" id="props">
        <h2 className="calendar-page__section-title"><a href="#props">Props</a></h2>
        <p className="calendar-page__section-desc">
          All props accepted by Calendar. Spreads native div attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={calendarProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ────────────────────────────── */}
      <section className="calendar-page__section" id="accessibility">
        <h2 className="calendar-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="calendar-page__section-desc">
          Built on a native ARIA grid pattern with comprehensive keyboard support.
        </p>
        <Card variant="default" padding="md">
          <ul className="calendar-page__a11y-list">
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Arrow keys move between days, <code className="calendar-page__a11y-key">Home</code>/<code className="calendar-page__a11y-key">End</code> jump to week start/end, <code className="calendar-page__a11y-key">Page Up</code>/<code className="calendar-page__a11y-key">Page Down</code> navigate months.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="calendar-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>ARIA Grid:</strong> Uses <code className="calendar-page__a11y-key">role="grid"</code> with proper <code className="calendar-page__a11y-key">aria-label</code> for month/year context.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Contrast:</strong> All states meet WCAG AA contrast ratio (4.5:1 text, 3:1 UI).
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled dates:</strong> Marked with <code className="calendar-page__a11y-key">aria-disabled="true"</code> and excluded from tab order.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Day cells enforce 44px minimum on coarse pointer devices via <code className="calendar-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="calendar-page__a11y-key">forced-colors: active</code> with visible borders on all interactive elements.
              </span>
            </li>
            <li className="calendar-page__a11y-item">
              <span className="calendar-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion:</strong> Respects <code className="calendar-page__a11y-key">prefers-reduced-motion</code> and cascading <code className="calendar-page__a11y-key">--motion</code> levels.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 11. Source ────────────────────────────────────── */}
      <section className="calendar-page__section" id="source">
        <h2 className="calendar-page__section-title"><a href="#source">Source</a></h2>
        <p className="calendar-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="calendar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/calendar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/calendar.tsx (Standard)
          </a>
          <a className="calendar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/calendar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/calendar.tsx (Lite)
          </a>
          <a className="calendar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/calendar.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/calendar.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
