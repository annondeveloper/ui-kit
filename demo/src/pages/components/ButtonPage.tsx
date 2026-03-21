'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Button as LiteButton } from '@ui/lite/button'
import { Button as PremiumButton } from '@ui/premium/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.button-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .button-page__hero {
        margin-block-end: 2.5rem;
      }

      .button-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .button-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .button-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .button-page__import-code {
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

      .button-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .button-page__section {
        margin-block-end: 3rem;
      }

      .button-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .button-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .button-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .button-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .button-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }

      .button-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      .button-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .button-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .button-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .button-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .button-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .button-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .button-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .button-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .button-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .button-page__option-btn {
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
      .button-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .button-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .button-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .button-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .button-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .button-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      /* ── Labeled row ────────────────────────────────── */

      .button-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1.25rem;
      }

      .button-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
      }

      .button-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── States grid ────────────────────────────────── */

      .button-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
      }

      .button-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .button-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .button-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Tier card ──────────────────────────────────── */

      .button-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .button-page__tier-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
      }

      .button-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .button-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .button-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .button-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .button-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: oklch(100% 0 0 / 0.04);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: nowrap;
      }

      .button-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .button-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .button-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .button-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .button-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .button-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .button-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const buttonProps: PropDef[] = [
  { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'", description: 'Visual style variant controlling colors and emphasis.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font-size, and min-height.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner overlay and prevents interaction. Announces via aria-busy.' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element rendered before children.' },
  { name: 'iconEnd', type: 'ReactNode', description: 'Trailing icon element rendered after children.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button with reduced opacity and pointer-events: none.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'HTML button type. Defaults to "button" to prevent accidental form submission.' },
  { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler. Debounced internally at 150ms to prevent double-clicks.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Button label content.' },
  { name: 'ref', type: 'Ref<HTMLButtonElement>', description: 'Forwarded ref to the underlying <button> element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANTS: Variant[] = ['primary', 'secondary', 'ghost', 'danger']
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const IMPORT_STR = "import { Button } from '@annondeveloper/ui-kit'"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="button-page__copy-btn"
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
    <div className="button-page__control-group">
      <span className="button-page__control-label">{label}</span>
      <div className="button-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`button-page__option-btn${opt === value ? ' button-page__option-btn--active' : ''}`}
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
    <label className="button-page__toggle-label">
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
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [showIconEnd, setShowIconEnd] = useState(false)
  const [label, setLabel] = useState('Click me')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)

  const codeLines: string[] = ['<Button']
  if (variant !== 'primary') codeLines.push(`  variant="${variant}"`)
  if (size !== 'md') codeLines.push(`  size="${size}"`)
  if (loading) codeLines.push('  loading')
  if (disabled) codeLines.push('  disabled')
  if (showIcon) codeLines.push('  icon={<Icon name="zap" size="sm" />}')
  if (showIconEnd) codeLines.push('  iconEnd={<Icon name="arrow-right" size="sm" />}')
  if (motion !== 3) codeLines.push(`  motion={${motion}}`)
  codeLines.push(`>${label}</Button>`)
  const code = codeLines.length <= 2
    ? `<Button>${label}</Button>`
    : codeLines.join('\n')

  return (
    <section className="button-page__section" id="playground">
      <h2 className="button-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="button-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="button-page__playground">
          {/* Preview + Code */}
          <div className="button-page__playground-preview">
            <div className="button-page__playground-result">
              <Button
                variant={variant}
                size={size}
                loading={loading}
                disabled={disabled}
                icon={showIcon ? <Icon name="zap" size="sm" /> : undefined}
                iconEnd={showIconEnd ? <Icon name="arrow-right" size="sm" /> : undefined}
                motion={motion}
              >
                {label}
              </Button>
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="button-page__playground-controls">
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />

            <div className="button-page__control-group">
              <span className="button-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Loading" checked={loading} onChange={setLoading} />
                <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
                <Toggle label="Leading icon" checked={showIcon} onChange={setShowIcon} />
                <Toggle label="Trailing icon" checked={showIconEnd} onChange={setShowIconEnd} />
              </div>
            </div>

            <div className="button-page__control-group">
              <span className="button-page__control-label">Label</span>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="button-page__text-input"
                placeholder="Button label..."
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ButtonPage() {
  useStyles('button-page', pageStyles)

  return (
    <div className="button-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="button-page__hero">
        <h1 className="button-page__title">Button</h1>
        <p className="button-page__desc">
          Primary action trigger with variant styles, sizes, loading state, and icon support.
          Ships in three weight tiers from 0.3KB CSS-only to 3KB premium with ripple effects.
        </p>
        <div className="button-page__import-row">
          <code className="button-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Variant Gallery ─────────────────────────── */}
      <section className="button-page__section" id="variants">
        <h2 className="button-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="button-page__section-desc">
          Four built-in variants for different levels of emphasis and semantic meaning.
        </p>
        <div className="button-page__preview">
          <div className="button-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="button-page__labeled-item">
                <Button variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
                <span className="button-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. Size Scale ──────────────────────────────── */}
      <section className="button-page__section" id="sizes">
        <h2 className="button-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="button-page__section-desc">
          Five sizes from compact inline actions (xs) to large call-to-action buttons (xl).
          Sizes control padding, font-size, and minimum block-size.
        </p>
        <div className="button-page__preview">
          <div className="button-page__labeled-row" style={{ alignItems: 'flex-end' }}>
            {SIZES.map(s => (
              <div key={s} className="button-page__labeled-item">
                <Button size={s}>Button</Button>
                <span className="button-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="button-page__section" id="states">
        <h2 className="button-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="button-page__section-desc">
          Buttons handle all interaction states with clear visual feedback.
        </p>
        <div className="button-page__states-grid">
          <div className="button-page__state-cell">
            <Button>Default</Button>
            <span className="button-page__state-label">Default</span>
          </div>
          <div className="button-page__state-cell">
            <Button>Hover me</Button>
            <span className="button-page__state-label">Hover</span>
            <span className="button-page__state-hint">move cursor over</span>
          </div>
          <div className="button-page__state-cell">
            <Button>Focus me</Button>
            <span className="button-page__state-label">Focus</span>
            <span className="button-page__state-hint">press Tab key</span>
          </div>
          <div className="button-page__state-cell">
            <Button>Press me</Button>
            <span className="button-page__state-label">Active</span>
            <span className="button-page__state-hint">click and hold</span>
          </div>
          <div className="button-page__state-cell">
            <Button loading>Saving...</Button>
            <span className="button-page__state-label">Loading</span>
          </div>
          <div className="button-page__state-cell">
            <Button disabled>Disabled</Button>
            <span className="button-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 6. With Icons ──────────────────────────────── */}
      <section className="button-page__section" id="icons">
        <h2 className="button-page__section-title">
          <a href="#icons">With Icons</a>
        </h2>
        <p className="button-page__section-desc">
          Buttons accept leading and trailing icon elements. Icons automatically scale to match the button's font-size.
        </p>
        <div className="button-page__preview button-page__preview--col" style={{ gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <div className="button-page__labeled-item">
              <Button icon={<Icon name="zap" size="sm" />}>Deploy</Button>
              <span className="button-page__item-label">Leading</span>
            </div>
            <div className="button-page__labeled-item">
              <Button iconEnd={<Icon name="arrow-right" size="sm" />}>Next Step</Button>
              <span className="button-page__item-label">Trailing</span>
            </div>
            <div className="button-page__labeled-item">
              <Button
                icon={<Icon name="download" size="sm" />}
                iconEnd={<Icon name="arrow-right" size="sm" />}
              >
                Download
              </Button>
              <span className="button-page__item-label">Both</span>
            </div>
            <div className="button-page__labeled-item">
              <Button
                icon={<Icon name="plus" size="sm" />}
                aria-label="Add item"
                style={{ paddingInline: '0.5rem' }}
              />
              <span className="button-page__item-label">Icon only</span>
            </div>
          </div>
          <CopyBlock
            code={`// Leading icon
<Button icon={<Icon name="zap" size="sm" />}>Deploy</Button>

// Trailing icon
<Button iconEnd={<Icon name="arrow-right" size="sm" />}>Next Step</Button>

// Both icons
<Button icon={<Icon name="download" size="sm" />} iconEnd={<Icon name="arrow-right" size="sm" />}>
  Download
</Button>

// Icon-only (provide aria-label)
<Button icon={<Icon name="plus" size="sm" />} aria-label="Add item" />`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="button-page__section" id="tiers">
        <h2 className="button-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="button-page__section-desc">
          Choose the right balance of features and bundle size. All three tiers share the same API surface
          (Lite omits loading, icon, and motion props).
        </p>
        <div className="button-page__tiers">
          {/* Lite */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Lite</span>
              <span className="button-page__tier-size">~0.3 KB</span>
            </div>
            <p className="button-page__tier-desc">
              CSS-only variant. Zero JavaScript beyond the forwardRef wrapper.
              No loading spinner, no motion, no icon slots.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="button-page__tier-preview">
              <LiteButton variant="primary">Lite Button</LiteButton>
            </div>
          </div>

          {/* Standard */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Standard</span>
              <span className="button-page__tier-size">~2 KB</span>
            </div>
            <p className="button-page__tier-desc">
              Full-featured button with loading state, icon support,
              motion levels, click debouncing, and accessibility.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="button-page__tier-preview">
              <Button variant="primary" icon={<Icon name="zap" size="sm" />}>Standard</Button>
            </div>
          </div>

          {/* Premium */}
          <div className="button-page__tier-card">
            <div className="button-page__tier-header">
              <span className="button-page__tier-name">Premium</span>
              <span className="button-page__tier-size">~3 KB</span>
            </div>
            <p className="button-page__tier-desc">
              Everything in Standard plus cursor-tracking glow,
              click ripple, particle burst, and entrance animation.
            </p>
            <div className="button-page__tier-import">
              import {'{'} Button {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="button-page__tier-preview">
              <PremiumButton variant="primary" icon={<Icon name="zap" size="sm" />}>Premium</PremiumButton>
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Motion Levels ───────────────────────────── */}
      <section className="button-page__section" id="motion">
        <h2 className="button-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="button-page__section-desc">
          Each button can be pinned to a specific motion level via the motion prop.
          Level 0 disables all animation; level 3 enables cinematic spring physics.
        </p>
        <div className="button-page__preview">
          <div className="button-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="button-page__labeled-item">
                <Button motion={m}>Motion {m}</Button>
                <span className="button-page__item-label">
                  {m === 0 ? 'Instant' : m === 1 ? 'Subtle' : m === 2 ? 'Spring' : 'Cinematic'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`<Button motion={0}>Instant</Button>    // No animation
<Button motion={1}>Subtle</Button>     // CSS transitions only
<Button motion={2}>Spring</Button>     // Spring physics, no overshoot
<Button motion={3}>Cinematic</Button>  // Full physics + effects`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. Props API Table ─────────────────────────── */}
      <section className="button-page__section" id="props">
        <h2 className="button-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="button-page__section-desc">
          All props accepted by Button. It also spreads any native button HTML attributes
          onto the underlying {'<button>'} element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={buttonProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. Accessibility Notes ────────────────────── */}
      <section className="button-page__section" id="accessibility">
        <h2 className="button-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="button-page__section-desc">
          Built on the native {'<button>'} element with comprehensive ARIA support.
        </p>
        <Card variant="default" padding="md">
          <ul className="button-page__a11y-list">
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Activates on <code className="button-page__a11y-key">Enter</code> and <code className="button-page__a11y-key">Space</code> keys.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="button-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Loading:</strong> Announced to screen readers via <code className="button-page__a11y-key">aria-busy="true"</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Type:</strong> Defaults to <code className="button-page__a11y-key">type="button"</code> to prevent accidental form submission.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Disabled:</strong> Uses both <code className="button-page__a11y-key">disabled</code> attribute and <code className="button-page__a11y-key">aria-disabled</code> for maximum compatibility.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="button-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="button-page__a11y-item">
              <span className="button-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="button-page__a11y-key">forced-colors: active</code> with visible 2px borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Source Code ─────────────────────────────── */}
      <section className="button-page__section" id="source">
        <h2 className="button-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="button-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/button.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/button.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/button.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="button-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/button.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
