'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { MultiSelect } from '@ui/components/multi-select'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ms-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ms-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ms-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .ms-page__hero::before {
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
        .ms-page__hero::before { animation: none; }
      }

      .ms-page__title {
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

      .ms-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ms-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ms-page__import-code {
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

      .ms-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .ms-page__section {
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
        animation: ms-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ms-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .ms-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .ms-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .ms-page__section-title a { color: inherit; text-decoration: none; }
      .ms-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .ms-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .ms-page__preview {
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

      .ms-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ms-page__preview--col {
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 400px;
        margin-inline: auto;
      }
    }
  }
`

// ─── Data ───────────────────────────────────────────────────────────────────

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'orange', label: 'Orange' },
  { value: 'peach', label: 'Peach' },
  { value: 'strawberry', label: 'Strawberry' },
]

const GROUPED_OPTIONS = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'deno', label: 'Deno', group: 'Backend' },
  { value: 'bun', label: 'Bun', group: 'Backend' },
  { value: 'postgres', label: 'PostgreSQL', group: 'Database' },
  { value: 'redis', label: 'Redis', group: 'Database' },
]

// ─── Props ──────────────────────────────────────────────────────────────────

const msProps: PropDef[] = [
  { name: 'options', type: 'MultiSelectOption[]', required: true, description: 'Array of options with value, label, optional group and disabled.' },
  { name: 'value', type: 'string[]', description: 'Controlled selected values.' },
  { name: 'defaultValue', type: 'string[]', description: 'Uncontrolled initial selection.' },
  { name: 'onChange', type: '(values: string[]) => void', description: 'Called when selection changes.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when no items selected.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Enable type-to-search filtering in the dropdown.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Show a clear-all button when items are selected.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire select.' },
  { name: 'maxSelected', type: 'number', description: 'Maximum number of items that can be selected.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Control size.' },
  { name: 'error', type: 'string', description: 'Error message below the select.' },
  { name: 'label', type: 'string', description: 'Label above the select.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="ms-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { MultiSelect } from '@anthropic/ui-kit'"

export default function MultiSelectPage() {
  useStyles('ms-page', pageStyles)

  const [selected, setSelected] = useState<string[]>(['apple', 'cherry'])

  return (
    <div className="ms-page">
      <div className="ms-page__hero">
        <h1 className="ms-page__title">MultiSelect</h1>
        <p className="ms-page__desc">
          Multi-value select with tag chips, searchable dropdown, grouped options, and
          configurable selection limits. Keyboard-navigable with ARIA listbox pattern.
        </p>
        <div className="ms-page__import-row">
          <code className="ms-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      {/* ── Tags & Search ─────────────────────────────── */}
      <section className="ms-page__section" id="basic">
        <h2 className="ms-page__section-title"><a href="#basic">Tags & Searchable</a></h2>
        <p className="ms-page__section-desc">
          Selected items appear as removable tags. Enable searchable to filter options by typing.
          Selected: {selected.join(', ') || 'none'}.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MultiSelect
            label="Fruits"
            options={FRUIT_OPTIONS}
            value={selected}
            onChange={setSelected}
            searchable
            clearable
            placeholder="Pick fruits..."
          />
        </div>
      </section>

      {/* ── Grouped & maxSelected ─────────────────────── */}
      <section className="ms-page__section" id="grouped">
        <h2 className="ms-page__section-title"><a href="#grouped">Grouped Options & Max Selected</a></h2>
        <p className="ms-page__section-desc">
          Options with a group property are visually grouped with headers. Use maxSelected to cap the selection count.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MultiSelect
            label="Tech stack (max 3)"
            options={GROUPED_OPTIONS}
            maxSelected={3}
            searchable
            placeholder="Choose up to 3..."
          />
        </div>
      </section>

      {/* ── States ─────────────────────────────────────── */}
      <section className="ms-page__section" id="states">
        <h2 className="ms-page__section-title"><a href="#states">States</a></h2>
        <p className="ms-page__section-desc">
          Error, disabled, and size variations.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MultiSelect label="With error" options={FRUIT_OPTIONS} error="At least one required" placeholder="Select..." />
          <MultiSelect label="Disabled" options={FRUIT_OPTIONS} disabled defaultValue={['apple']} />
          <MultiSelect label="Small" options={FRUIT_OPTIONS} size="sm" placeholder="Small select..." />
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="ms-page__section" id="props">
        <h2 className="ms-page__section-title"><a href="#props">Props</a></h2>
        <p className="ms-page__section-desc">
          All props accepted by MultiSelect. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={msProps} />
        </Card>
      </section>
    </div>
  )
}
