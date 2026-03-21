'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Badge as LiteBadge } from '@ui/lite/badge'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.badge-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .badge-page__hero {
        margin-block-end: 2.5rem;
      }

      .badge-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .badge-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .badge-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .badge-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(100% 0 0 / 0.05);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      .badge-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .badge-page__section {
        margin-block-end: 3rem;
      }

      .badge-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .badge-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .badge-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .badge-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .badge-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }

      .badge-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .badge-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .badge-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .badge-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .badge-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .badge-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .badge-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .badge-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .badge-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .badge-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .badge-page__option-btn {
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
      .badge-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .badge-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .badge-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .badge-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .badge-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .badge-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      .badge-page__number-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 5rem;
      }
      .badge-page__number-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      /* ── Labeled row ────────────────────────────────── */

      .badge-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1.25rem;
      }

      .badge-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
      }

      .badge-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── States grid ────────────────────────────────── */

      .badge-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .badge-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .badge-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .badge-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Tier card ──────────────────────────────────── */

      .badge-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .badge-page__tier-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
      }

      .badge-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .badge-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .badge-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .badge-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .badge-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: oklch(100% 0 0 / 0.04);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: nowrap;
      }

      .badge-page__tier-preview {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .badge-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .badge-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .badge-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .badge-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .badge-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .badge-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const badgeProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Semantic color variant for different status contexts.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and overall scale.' },
  { name: 'dot', type: 'boolean', default: 'false', description: 'Shows a small dot indicator before the content.' },
  { name: 'pulse', type: 'boolean', default: 'false', description: 'Adds a pulsing animation to the dot. Requires dot=true. Active at motion level 2+.' },
  { name: 'count', type: 'number', description: 'Numeric counter value. Overrides children when set.' },
  { name: 'maxCount', type: 'number', default: '99', description: 'Maximum count before showing overflow (e.g. "99+").' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element rendered before content. Scales to match font-size.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls pulse animation on the dot indicator.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Badge label content. Overridden by count when count is set.' },
  { name: 'ref', type: 'Ref<HTMLSpanElement>', description: 'Forwarded ref to the underlying <span> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: Variant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const IMPORT_STR = "import { Badge } from '@annondeveloper/ui-kit'"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="badge-page__copy-btn"
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
    <div className="badge-page__control-group">
      <span className="badge-page__control-label">{label}</span>
      <div className="badge-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`badge-page__option-btn${opt === value ? ' badge-page__option-btn--active' : ''}`}
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
    <label className="badge-page__toggle-label">
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

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection() {
  const [variant, setVariant] = useState<Variant>('primary')
  const [size, setSize] = useState<Size>('md')
  const [dot, setDot] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [label, setLabel] = useState('Badge')
  const [useCounter, setUseCounter] = useState(false)
  const [count, setCount] = useState(5)
  const [maxCount, setMaxCount] = useState(99)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)

  const codeLines: string[] = ['<Badge']
  if (variant !== 'default') codeLines.push(`  variant="${variant}"`)
  if (size !== 'md') codeLines.push(`  size="${size}"`)
  if (dot) codeLines.push('  dot')
  if (pulse) codeLines.push('  pulse')
  if (showIcon) codeLines.push('  icon={<Icon name="zap" size="sm" />}')
  if (useCounter) {
    codeLines.push(`  count={${count}}`)
    if (maxCount !== 99) codeLines.push(`  maxCount={${maxCount}}`)
  }
  if (motion !== 3) codeLines.push(`  motion={${motion}}`)
  if (useCounter) {
    codeLines.push('/>')
  } else {
    codeLines.push(`>${label}</Badge>`)
  }
  const code = codeLines.length <= 2
    ? useCounter ? `<Badge count={${count}} />` : `<Badge>${label}</Badge>`
    : codeLines.join('\n')

  return (
    <section className="badge-page__section" id="playground">
      <h2 className="badge-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="badge-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="badge-page__playground">
          {/* Preview + Code */}
          <div className="badge-page__playground-preview">
            <div className="badge-page__playground-result">
              <Badge
                variant={variant}
                size={size}
                dot={dot}
                pulse={pulse}
                icon={showIcon ? <Icon name="zap" size="sm" /> : undefined}
                count={useCounter ? count : undefined}
                maxCount={maxCount}
                motion={motion}
              >
                {useCounter ? undefined : label}
              </Badge>
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="badge-page__playground-controls">
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />

            <div className="badge-page__control-group">
              <span className="badge-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Dot indicator" checked={dot} onChange={setDot} />
                <Toggle label="Pulse animation" checked={pulse} onChange={setPulse} />
                <Toggle label="Leading icon" checked={showIcon} onChange={setShowIcon} />
                <Toggle label="Use counter" checked={useCounter} onChange={setUseCounter} />
              </div>
            </div>

            {useCounter ? (
              <div className="badge-page__control-group">
                <span className="badge-page__control-label">Counter</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <label style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-secondary)' }}>
                    Count:
                    <input
                      type="number"
                      value={count}
                      onChange={e => setCount(Number(e.target.value))}
                      className="badge-page__number-input"
                      min={0}
                      style={{ marginInlineStart: '0.375rem' }}
                    />
                  </label>
                  <label style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-secondary)' }}>
                    Max:
                    <input
                      type="number"
                      value={maxCount}
                      onChange={e => setMaxCount(Number(e.target.value))}
                      className="badge-page__number-input"
                      min={1}
                      style={{ marginInlineStart: '0.375rem' }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="badge-page__control-group">
                <span className="badge-page__control-label">Label</span>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  className="badge-page__text-input"
                  placeholder="Badge label..."
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BadgePage() {
  useStyles('badge-page', pageStyles)

  return (
    <div className="badge-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="badge-page__hero">
        <h1 className="badge-page__title">Badge</h1>
        <p className="badge-page__desc">
          Compact status indicator with semantic color variants, dot and pulse indicators,
          counter overflow, and icon support. Ships in two weight tiers.
        </p>
        <div className="badge-page__import-row">
          <code className="badge-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Variant Gallery ─────────────────────────── */}
      <section className="badge-page__section" id="variants">
        <h2 className="badge-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="badge-page__section-desc">
          Six semantic variants for different status contexts. Each uses OKLCH color tokens for
          perceptually uniform appearance.
        </p>
        <div className="badge-page__preview">
          <div className="badge-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="badge-page__labeled-item">
                <Badge variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>
                <span className="badge-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. Size Scale ──────────────────────────────── */}
      <section className="badge-page__section" id="sizes">
        <h2 className="badge-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="badge-page__section-desc">
          Five sizes from compact inline indicators (xs) to large prominent badges (xl).
          Sizes control padding and font-size.
        </p>
        <div className="badge-page__preview">
          <div className="badge-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="badge-page__labeled-item">
                <Badge variant="primary" size={s}>Badge</Badge>
                <span className="badge-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="badge-page__section" id="states">
        <h2 className="badge-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="badge-page__section-desc">
          Badges support various display modes including dot indicators, pulse animation, counters, and icons.
        </p>
        <div className="badge-page__states-grid">
          <div className="badge-page__state-cell">
            <Badge variant="primary">Default</Badge>
            <span className="badge-page__state-label">Default</span>
          </div>
          <div className="badge-page__state-cell">
            <Badge variant="success" dot>Online</Badge>
            <span className="badge-page__state-label">With dot</span>
          </div>
          <div className="badge-page__state-cell">
            <Badge variant="danger" dot pulse>Live</Badge>
            <span className="badge-page__state-label">Pulsing dot</span>
          </div>
          <div className="badge-page__state-cell">
            <Badge variant="primary" count={5} />
            <span className="badge-page__state-label">Counter</span>
          </div>
          <div className="badge-page__state-cell">
            <Badge variant="danger" count={150} maxCount={99} />
            <span className="badge-page__state-label">Overflow 99+</span>
          </div>
          <div className="badge-page__state-cell">
            <Badge variant="info" icon={<Icon name="info" size="sm" />}>Info</Badge>
            <span className="badge-page__state-label">With icon</span>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 6. Dot & Pulse ─────────────────────────────── */}
      <section className="badge-page__section" id="dot-pulse">
        <h2 className="badge-page__section-title">
          <a href="#dot-pulse">Dot & Pulse Indicator</a>
        </h2>
        <p className="badge-page__section-desc">
          The dot indicator shows a small circle before the content. When pulse is enabled,
          it animates with a radiating ring at motion level 2+.
        </p>
        <div className="badge-page__preview badge-page__preview--col" style={{ gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div className="badge-page__labeled-item">
              <Badge variant="success" dot>Online</Badge>
              <span className="badge-page__item-label">dot</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="success" dot pulse>Live</Badge>
              <span className="badge-page__item-label">dot + pulse</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="danger" dot pulse>Recording</Badge>
              <span className="badge-page__item-label">danger pulse</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="warning" dot>Away</Badge>
              <span className="badge-page__item-label">warning dot</span>
            </div>
          </div>
          <CopyBlock
            code={`// Simple dot indicator
<Badge variant="success" dot>Online</Badge>

// Pulsing dot (active at motion level 2+)
<Badge variant="success" dot pulse>Live</Badge>

// Danger pulse
<Badge variant="danger" dot pulse>Recording</Badge>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. Counter & Overflow ──────────────────────── */}
      <section className="badge-page__section" id="counter">
        <h2 className="badge-page__section-title">
          <a href="#counter">Counter & Overflow</a>
        </h2>
        <p className="badge-page__section-desc">
          Use the count prop for numeric counters. When the value exceeds maxCount (default 99),
          it displays as "99+".
        </p>
        <div className="badge-page__preview badge-page__preview--col" style={{ gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div className="badge-page__labeled-item">
              <Badge variant="primary" count={3} />
              <span className="badge-page__item-label">count=3</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="primary" count={42} />
              <span className="badge-page__item-label">count=42</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="danger" count={150} maxCount={99} />
              <span className="badge-page__item-label">99+</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="danger" count={1000} maxCount={999} />
              <span className="badge-page__item-label">999+</span>
            </div>
            <div className="badge-page__labeled-item">
              <Badge variant="primary" count={0} />
              <span className="badge-page__item-label">count=0</span>
            </div>
          </div>
          <CopyBlock
            code={`// Simple counter
<Badge variant="primary" count={3} />

// Overflow (default maxCount=99)
<Badge variant="danger" count={150} />        // renders "99+"

// Custom maxCount
<Badge variant="danger" count={1000} maxCount={999} />  // renders "999+"`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Weight Tiers ────────────────────────────── */}
      <section className="badge-page__section" id="tiers">
        <h2 className="badge-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="badge-page__section-desc">
          Choose the right balance of features and bundle size. Lite is CSS-only with basic
          variant and size support. Standard adds dot, pulse, counter, icon, and motion.
        </p>
        <div className="badge-page__tiers">
          {/* Lite */}
          <div className="badge-page__tier-card">
            <div className="badge-page__tier-header">
              <span className="badge-page__tier-name">Lite</span>
              <span className="badge-page__tier-size">~0.2 KB</span>
            </div>
            <p className="badge-page__tier-desc">
              CSS-only variant. Six color variants, three sizes (xs/sm/md).
              No dot, no pulse, no counter, no icon.
            </p>
            <div className="badge-page__tier-import">
              import {'{'} Badge {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="badge-page__tier-preview">
              <LiteBadge variant="primary">Lite</LiteBadge>
              <LiteBadge variant="success">OK</LiteBadge>
              <LiteBadge variant="danger">Error</LiteBadge>
            </div>
          </div>

          {/* Standard */}
          <div className="badge-page__tier-card">
            <div className="badge-page__tier-header">
              <span className="badge-page__tier-name">Standard</span>
              <span className="badge-page__tier-size">~1.5 KB</span>
            </div>
            <p className="badge-page__tier-desc">
              Full-featured badge with all six variants, five sizes,
              dot/pulse indicators, counter overflow, icon slot, and motion levels.
            </p>
            <div className="badge-page__tier-import">
              import {'{'} Badge {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="badge-page__tier-preview">
              <Badge variant="primary" dot pulse>Live</Badge>
              <Badge variant="success" icon={<Icon name="check" size="sm" />}>Done</Badge>
              <Badge variant="danger" count={42} />
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. Motion Levels ───────────────────────────── */}
      <section className="badge-page__section" id="motion">
        <h2 className="badge-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="badge-page__section-desc">
          Motion levels control the pulse animation on the dot indicator.
          Level 0-1 disables pulse; level 2+ enables the radiating ring animation.
        </p>
        <div className="badge-page__preview">
          <div className="badge-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="badge-page__labeled-item">
                <Badge variant="success" dot pulse motion={m}>Motion {m}</Badge>
                <span className="badge-page__item-label">
                  {m === 0 ? 'No pulse' : m === 1 ? 'No pulse' : m === 2 ? 'Pulse' : 'Pulse'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`<Badge dot pulse motion={0}>No pulse</Badge>    // Animation disabled
<Badge dot pulse motion={1}>No pulse</Badge>    // CSS transitions only, no pulse
<Badge dot pulse motion={2}>Pulse</Badge>       // Radiating ring enabled
<Badge dot pulse motion={3}>Pulse</Badge>       // Full pulse animation`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. Props API Table ────────────────────────── */}
      <section className="badge-page__section" id="props">
        <h2 className="badge-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="badge-page__section-desc">
          All props accepted by Badge. It also spreads any native span HTML attributes
          onto the underlying {'<span>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={badgeProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Accessibility Notes ───────────────────── */}
      <section className="badge-page__section" id="accessibility">
        <h2 className="badge-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="badge-page__section-desc">
          Designed for assistive technology compatibility with proper semantics and visual fallbacks.
        </p>
        <Card variant="default" padding="md">
          <ul className="badge-page__a11y-list">
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Renders as inline <code className="badge-page__a11y-key">{'<span>'}</code> with appropriate text content for screen readers.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Counter overflow:</strong> Screen readers announce the actual count value, not the truncated display (e.g. "150" not "99+").
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 28px minimum on coarse pointer devices via <code className="badge-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="badge-page__a11y-key">forced-colors: active</code> with visible 1px borders.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Pulse animation respects motion level cascade — disabled at level 0-1.
              </span>
            </li>
            <li className="badge-page__a11y-item">
              <span className="badge-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Color independence:</strong> Variants use both color and border for identification, not color alone.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 12. Source Code ─────────────────────────────── */}
      <section className="badge-page__section" id="source">
        <h2 className="badge-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="badge-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/badge.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/badge.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/badge.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="badge-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/badge.tsx (Lite)
          </a>
        </div>
      </section>
    </div>
  )
}
