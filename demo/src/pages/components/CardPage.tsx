'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Card as LiteCard } from '@ui/lite/card'
import { Card as PremiumCard } from '@ui/premium/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.card-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .card-page__hero {
        margin-block-end: 2.5rem;
      }

      .card-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .card-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .card-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .card-page__import-code {
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

      .card-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .card-page__section {
        margin-block-end: 3rem;
      }

      .card-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .card-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .card-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .card-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .card-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 1rem;
      }

      .card-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .card-page__preview--center {
        justify-content: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .card-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .card-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .card-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .card-page__playground-result {
        min-block-size: 180px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .card-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .card-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .card-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .card-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .card-page__option-btn {
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
      .card-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .card-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .card-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .card-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .card-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 1.25rem;
      }

      .card-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
      }

      .card-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── States grid ────────────────────────────────── */

      .card-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .card-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .card-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .card-page__state-hint {
        font-size: 0.625rem;
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Tier card ──────────────────────────────────── */

      .card-page__tiers {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .card-page__tier-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1.25rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
      }

      .card-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .card-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .card-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .card-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.6875rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: oklch(100% 0 0 / 0.04);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        white-space: nowrap;
      }

      .card-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .card-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .card-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .card-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .card-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .card-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .card-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Sample card content ─────────────────────────── */

      .card-page__sample-header {
        font-size: var(--text-base, 1rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
      }

      .card-page__sample-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }

      .card-page__sample-image {
        inline-size: 100%;
        block-size: 120px;
        border-radius: var(--radius-md);
        background: linear-gradient(
          135deg,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.05)
        );
        display: grid;
        place-items: center;
        color: var(--text-tertiary);
        font-size: var(--text-sm, 0.875rem);
        margin-block-end: 0.75rem;
      }

      .card-page__sample-actions {
        display: flex;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const cardProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'elevated' | 'outlined' | 'ghost'", default: "'default'", description: 'Visual style variant. Default and elevated show Aurora glow overlay.' },
  { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Inner padding scale. Use "none" for custom layouts like full-bleed images.' },
  { name: 'interactive', type: 'boolean', default: 'false', description: 'Enables hover lift, shadow transitions, and cursor pointer.' },
  { name: 'as', type: 'ElementType', default: "'div'", description: 'Polymorphic root element — render as div, article, a, section, etc.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Affects entrance and interactive hover effects.' },
  { name: 'href', type: 'string', description: 'URL for anchor rendering. Pass as="a" together with href.' },
  { name: 'target', type: 'string', description: 'Link target attribute when rendered as anchor.' },
  { name: 'rel', type: 'string', description: 'Link rel attribute when rendered as anchor.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
  { name: 'children', type: 'ReactNode', description: 'Card content.' },
  { name: 'ref', type: 'Ref<HTMLElement>', description: 'Forwarded ref to the underlying root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Variant = 'default' | 'elevated' | 'outlined' | 'ghost'
type Padding = 'none' | 'sm' | 'md' | 'lg'
type AsOption = 'div' | 'article' | 'a' | 'section'

const VARIANTS: Variant[] = ['default', 'elevated', 'outlined', 'ghost']
const PADDINGS: Padding[] = ['none', 'sm', 'md', 'lg']
const AS_OPTIONS: AsOption[] = ['div', 'article', 'a', 'section']
const IMPORT_STR = "import { Card } from '@annondeveloper/ui-kit'"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="card-page__copy-btn"
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
    <div className="card-page__control-group">
      <span className="card-page__control-label">{label}</span>
      <div className="card-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`card-page__option-btn${opt === value ? ' card-page__option-btn--active' : ''}`}
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
    <label className="card-page__toggle-label">
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

// ─── Sample Card Contents ─────────────────────────────────────────────────────

function SamplePlain() {
  return (
    <>
      <h3 className="card-page__sample-header">Simple Card</h3>
      <p className="card-page__sample-text">
        A basic card with a heading and body text. Great for displaying brief information.
      </p>
    </>
  )
}

function SampleWithImage() {
  return (
    <>
      <div className="card-page__sample-image">Image placeholder</div>
      <h3 className="card-page__sample-header">Card with Image</h3>
      <p className="card-page__sample-text">
        Cards can contain media, headers, and body content for rich layouts.
      </p>
    </>
  )
}

function SampleWithActions() {
  return (
    <>
      <h3 className="card-page__sample-header">Actionable Card</h3>
      <p className="card-page__sample-text">
        Cards with action buttons let users take immediate steps.
      </p>
      <div className="card-page__sample-actions">
        <Button size="sm" variant="primary">Accept</Button>
        <Button size="sm" variant="secondary">Decline</Button>
      </div>
    </>
  )
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection() {
  const [variant, setVariant] = useState<Variant>('default')
  const [padding, setPadding] = useState<Padding>('md')
  const [interactive, setInteractive] = useState(false)
  const [asElement, setAsElement] = useState<AsOption>('div')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)

  const codeLines: string[] = ['<Card']
  if (variant !== 'default') codeLines.push(`  variant="${variant}"`)
  if (padding !== 'md') codeLines.push(`  padding="${padding}"`)
  if (interactive) codeLines.push('  interactive')
  if (asElement !== 'div') codeLines.push(`  as="${asElement}"`)
  if (motion !== 3) codeLines.push(`  motion={${motion}}`)
  codeLines.push('>')
  codeLines.push('  <h3>Card Title</h3>')
  codeLines.push('  <p>Card content goes here.</p>')
  codeLines.push('</Card>')
  const code = codeLines.join('\n')

  return (
    <section className="card-page__section" id="playground">
      <h2 className="card-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="card-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="card-page__playground">
          {/* Preview + Code */}
          <div className="card-page__playground-preview">
            <div className="card-page__playground-result">
              <Card
                variant={variant}
                padding={padding}
                interactive={interactive}
                as={asElement}
                motion={motion}
                style={{ inlineSize: '100%' }}
              >
                <h3 className="card-page__sample-header">Card Title</h3>
                <p className="card-page__sample-text">Card content goes here. Hover to see interactive effects.</p>
              </Card>
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="card-page__playground-controls">
            <OptionGroup label="Variant" options={VARIANTS} value={variant} onChange={setVariant} />
            <OptionGroup label="Padding" options={PADDINGS} value={padding} onChange={setPadding} />
            <OptionGroup label="As" options={AS_OPTIONS} value={asElement} onChange={setAsElement} />
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />

            <div className="card-page__control-group">
              <span className="card-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Interactive" checked={interactive} onChange={setInteractive} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CardPage() {
  useStyles('card-page', pageStyles)

  return (
    <div className="card-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="card-page__hero">
        <h1 className="card-page__title">Card</h1>
        <p className="card-page__desc">
          Versatile container with Aurora glow, polymorphic rendering, interactive hover effects,
          and container-query responsive sizing. Ships in three weight tiers.
        </p>
        <div className="card-page__import-row">
          <code className="card-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Variant Gallery ─────────────────────────── */}
      <section className="card-page__section" id="variants">
        <h2 className="card-page__section-title">
          <a href="#variants">Variants</a>
        </h2>
        <p className="card-page__section-desc">
          Four built-in variants for different visual contexts. Default and elevated include the Aurora glow overlay.
        </p>
        <div className="card-page__preview card-page__preview--col">
          <div className="card-page__labeled-row">
            {VARIANTS.map(v => (
              <div key={v} className="card-page__labeled-item" style={{ flex: '1 1 180px' }}>
                <Card variant={v} padding="md" style={{ inlineSize: '100%' }}>
                  <h3 className="card-page__sample-header">{v.charAt(0).toUpperCase() + v.slice(1)}</h3>
                  <p className="card-page__sample-text">Variant preview content.</p>
                </Card>
                <span className="card-page__item-label">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. Padding Scale ──────────────────────────── */}
      <section className="card-page__section" id="padding">
        <h2 className="card-page__section-title">
          <a href="#padding">Padding Scale</a>
        </h2>
        <p className="card-page__section-desc">
          Four padding levels from none (full-bleed layouts) to lg (spacious content areas).
        </p>
        <div className="card-page__preview card-page__preview--col">
          <div className="card-page__labeled-row">
            {PADDINGS.map(p => (
              <div key={p} className="card-page__labeled-item" style={{ flex: '1 1 160px' }}>
                <Card variant="outlined" padding={p} style={{ inlineSize: '100%' }}>
                  <p className="card-page__sample-text">padding="{p}"</p>
                </Card>
                <span className="card-page__item-label">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. States ──────────────────────────────────── */}
      <section className="card-page__section" id="states">
        <h2 className="card-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="card-page__section-desc">
          Cards respond to user interaction with lift, shadow, and glow effects when interactive mode is enabled.
        </p>
        <div className="card-page__states-grid">
          <div className="card-page__state-cell">
            <Card variant="default" padding="sm" style={{ inlineSize: '100%' }}>
              <p className="card-page__sample-text">Default</p>
            </Card>
            <span className="card-page__state-label">Static</span>
          </div>
          <div className="card-page__state-cell">
            <Card variant="default" padding="sm" interactive style={{ inlineSize: '100%' }}>
              <p className="card-page__sample-text">Hover me</p>
            </Card>
            <span className="card-page__state-label">Interactive</span>
            <span className="card-page__state-hint">hover to lift</span>
          </div>
          <div className="card-page__state-cell">
            <Card variant="elevated" padding="sm" interactive style={{ inlineSize: '100%' }}>
              <p className="card-page__sample-text">Elevated</p>
            </Card>
            <span className="card-page__state-label">Elevated + Interactive</span>
            <span className="card-page__state-hint">shadow deepens on hover</span>
          </div>
          <div className="card-page__state-cell">
            <Card variant="default" padding="sm" interactive tabIndex={0} style={{ inlineSize: '100%' }}>
              <p className="card-page__sample-text">Focus me</p>
            </Card>
            <span className="card-page__state-label">Focus</span>
            <span className="card-page__state-hint">press Tab key</span>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 6. Content Layouts ──────────────────────────── */}
      <section className="card-page__section" id="layouts">
        <h2 className="card-page__section-title">
          <a href="#layouts">Content Layouts</a>
        </h2>
        <p className="card-page__section-desc">
          Cards adapt to any content — plain text, media, or action-oriented layouts.
        </p>
        <div className="card-page__preview card-page__preview--col" style={{ gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <Card variant="default" padding="md">
              <SamplePlain />
            </Card>
            <Card variant="default" padding="md">
              <SampleWithImage />
            </Card>
            <Card variant="default" padding="md">
              <SampleWithActions />
            </Card>
          </div>
          <CopyBlock
            code={`// Plain text
<Card>
  <h3>Title</h3>
  <p>Body text content.</p>
</Card>

// With image
<Card padding="none">
  <img src="..." alt="..." />
  <div style={{ padding: '1rem' }}>
    <h3>Title</h3>
    <p>Description</p>
  </div>
</Card>

// With actions
<Card>
  <h3>Title</h3>
  <p>Body text</p>
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    <Button size="sm">Accept</Button>
    <Button size="sm" variant="secondary">Decline</Button>
  </div>
</Card>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="card-page__section" id="tiers">
        <h2 className="card-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="card-page__section-desc">
          Choose the right balance of features and bundle size. Lite is CSS-only, Standard adds motion
          and polymorphism, Premium adds cursor-tracking glow and 3D tilt.
        </p>
        <div className="card-page__tiers">
          {/* Lite */}
          <div className="card-page__tier-card">
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Lite</span>
              <span className="card-page__tier-size">~0.3 KB</span>
            </div>
            <p className="card-page__tier-desc">
              CSS-only variant. Default and elevated variants, padding scale.
              No interactive mode, no motion, no polymorphic rendering.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="card-page__tier-preview">
              <LiteCard variant="default" padding="md" style={{ inlineSize: '100%' }}>
                <p className="card-page__sample-text">Lite Card</p>
              </LiteCard>
            </div>
          </div>

          {/* Standard */}
          <div className="card-page__tier-card">
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Standard</span>
              <span className="card-page__tier-size">~2 KB</span>
            </div>
            <p className="card-page__tier-desc">
              Full-featured card with all four variants, interactive mode,
              polymorphic rendering, motion levels, and Aurora glow.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="card-page__tier-preview">
              <Card variant="default" padding="md" interactive style={{ inlineSize: '100%' }}>
                <p className="card-page__sample-text">Standard Card</p>
              </Card>
            </div>
          </div>

          {/* Premium */}
          <div className="card-page__tier-card">
            <div className="card-page__tier-header">
              <span className="card-page__tier-name">Premium</span>
              <span className="card-page__tier-size">~3.5 KB</span>
            </div>
            <p className="card-page__tier-desc">
              Everything in Standard plus cursor-tracking aurora glow,
              3D perspective tilt, and enhanced entrance animations.
            </p>
            <div className="card-page__tier-import">
              import {'{'} Card {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="card-page__tier-preview">
              <PremiumCard variant="default" padding="md" interactive style={{ inlineSize: '100%' }}>
                <p className="card-page__sample-text">Premium Card</p>
              </PremiumCard>
            </div>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Motion Levels ───────────────────────────── */}
      <section className="card-page__section" id="motion">
        <h2 className="card-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="card-page__section-desc">
          Control animation intensity. Level 0 disables all animation; level 3 enables full entrance
          effects and interactive hover physics.
        </p>
        <div className="card-page__preview">
          <div className="card-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="card-page__labeled-item" style={{ flex: '1 1 140px' }}>
                <Card variant="default" padding="sm" interactive motion={m} style={{ inlineSize: '100%' }}>
                  <p className="card-page__sample-text">Motion {m}</p>
                </Card>
                <span className="card-page__item-label">
                  {m === 0 ? 'Instant' : m === 1 ? 'Subtle' : m === 2 ? 'Spring' : 'Cinematic'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`<Card motion={0} interactive>Instant</Card>    // No animation
<Card motion={1} interactive>Subtle</Card>     // CSS transitions only
<Card motion={2} interactive>Spring</Card>     // Entrance + basic hover
<Card motion={3} interactive>Cinematic</Card>  // Full physics + Aurora glow`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. Props API Table ─────────────────────────── */}
      <section className="card-page__section" id="props">
        <h2 className="card-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="card-page__section-desc">
          All props accepted by Card. It also spreads any native HTML attributes
          onto the underlying root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={cardProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. Accessibility Notes ────────────────────── */}
      <section className="card-page__section" id="accessibility">
        <h2 className="card-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="card-page__section-desc">
          Semantic rendering with built-in support for assistive technologies.
        </p>
        <Card variant="default" padding="md">
          <ul className="card-page__a11y-list">
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic HTML:</strong> Renders as <code className="card-page__a11y-key">{'<article>'}</code>, <code className="card-page__a11y-key">{'<section>'}</code>, or <code className="card-page__a11y-key">{'<a>'}</code> via polymorphic <code className="card-page__a11y-key">as</code> prop.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored outline via <code className="card-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Interactive cards enforce 44px minimum on coarse pointer devices via <code className="card-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="card-page__a11y-key">forced-colors: active</code> with visible 2px borders, Aurora glow hidden.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Respects <code className="card-page__a11y-key">prefers-reduced-motion</code> via the motion level cascade.
              </span>
            </li>
            <li className="card-page__a11y-item">
              <span className="card-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Container queries:</strong> Content adapts to available space via <code className="card-page__a11y-key">container-type: inline-size</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Source Code ─────────────────────────────── */}
      <section className="card-page__section" id="source">
        <h2 className="card-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="card-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/card.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="card-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/card.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/lite/card.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="card-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/lite/card.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/premium/card.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="card-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/premium/card.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
