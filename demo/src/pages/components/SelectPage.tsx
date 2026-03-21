'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Select, type SelectOption } from '@ui/components/select'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { Form } from '@ui/core/forms/form-component'
import { createForm } from '@ui/core/forms/create-form'
import { useForm } from '@ui/core/forms/use-form'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.select-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .select-page__hero {
        margin-block-end: 2.5rem;
      }

      .select-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .select-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .select-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .select-page__import-code {
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

      .select-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .select-page__section {
        margin-block-end: 3rem;
      }

      .select-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .select-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .select-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .select-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .select-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 1rem;
      }

      .select-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .select-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .select-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .select-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .select-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .select-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .select-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .select-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .select-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .select-page__option-btn {
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
      .select-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .select-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .select-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .select-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .select-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .select-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      /* ── Labeled row ────────────────────────────────── */

      .select-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1.25rem;
      }

      .select-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
      }

      .select-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── States grid ────────────────────────────────── */

      .select-page__states-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .select-page__state-cell {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .select-page__state-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        text-align: center;
      }

      /* ── Example row ─────────────────────────────────── */

      .select-page__example-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        align-items: start;
      }
      @container (max-width: 540px) {
        .select-page__example-row {
          grid-template-columns: 1fr;
        }
      }

      /* ── A11y list ──────────────────────────────────── */

      .select-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .select-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .select-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .select-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .select-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .select-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Form demo ──────────────────────────────────── */

      .select-page__form-result {
        margin-block-start: 1rem;
        padding: 0.75rem;
        border-radius: var(--radius-md);
        background: oklch(100% 0 0 / 0.04);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        white-space: pre-wrap;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const selectProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'Field name used for form submission and form engine integration.' },
  { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of option objects with value, label, optional icon, group, and disabled fields.' },
  { name: 'value', type: 'string | string[]', description: 'Controlled value. Use string for single, string[] for multiple mode.' },
  { name: 'defaultValue', type: 'string | string[]', description: 'Uncontrolled initial value.' },
  { name: 'onChange', type: '(value: string | string[]) => void', description: 'Called when the selection changes.' },
  { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Placeholder text shown when no value is selected.' },
  { name: 'label', type: 'ReactNode', description: 'Visible label rendered above the trigger.' },
  { name: 'error', type: 'string', description: 'Error message shown below the trigger. Adds aria-invalid state.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select with reduced opacity.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls trigger height, padding, and font-size.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Enables a typeahead search input inside the dropdown.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Shows a clear button when a value is selected.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Enables multi-selection with tag display.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
  { name: 'ref', type: 'Ref<HTMLDivElement>', description: 'Forwarded ref to the root container element.' },
]

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_OPTIONS: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'preact', label: 'Preact' },
]

const ICON_OPTIONS: SelectOption[] = [
  { value: 'info', label: 'Information', icon: <Icon name="info" size="sm" /> },
  { value: 'warning', label: 'Warning', icon: <Icon name="alert-triangle" size="sm" /> },
  { value: 'success', label: 'Success', icon: <Icon name="check-circle" size="sm" /> },
  { value: 'error', label: 'Error', icon: <Icon name="x-circle" size="sm" /> },
]

const GROUPED_OPTIONS: SelectOption[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'deno', label: 'Deno', group: 'Backend' },
  { value: 'bun', label: 'Bun', group: 'Backend' },
]

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl']
const IMPORT_STR = "import { Select } from '@annondeveloper/ui-kit'"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="select-page__copy-btn"
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
    <div className="select-page__control-group">
      <span className="select-page__control-label">{label}</span>
      <div className="select-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`select-page__option-btn${opt === value ? ' select-page__option-btn--active' : ''}`}
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
    <label className="select-page__toggle-label">
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

// ─── Form Demo Schema ─────────────────────────────────────────────────────────

const contactForm = createForm({
  framework: {
    label: 'Preferred Framework',
    required: true,
    validate: (v: string) => (!v ? 'Please select a framework' : undefined),
  },
  features: {
    label: 'Required Features',
    required: true,
    validate: (v: string[]) => (!v || v.length === 0 ? 'Select at least one feature' : undefined),
  },
})

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection() {
  const [size, setSize] = useState<Size>('md')
  const [searchable, setSearchable] = useState(false)
  const [clearable, setClearable] = useState(false)
  const [multiple, setMultiple] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [error, setError] = useState('')
  const [value, setValue] = useState<string | string[]>('')

  // Reset value when toggling multiple
  const handleMultipleToggle = (v: boolean) => {
    setMultiple(v)
    setValue(v ? [] : '')
  }

  const codeLines: string[] = ['<Select']
  codeLines.push('  name="framework"')
  codeLines.push('  options={options}')
  if (size !== 'md') codeLines.push(`  size="${size}"`)
  if (searchable) codeLines.push('  searchable')
  if (clearable) codeLines.push('  clearable')
  if (multiple) codeLines.push('  multiple')
  if (disabled) codeLines.push('  disabled')
  if (error) codeLines.push(`  error="${error}"`)
  codeLines.push('  label="Framework"')
  codeLines.push('/>')
  const code = codeLines.join('\n')

  return (
    <section className="select-page__section" id="playground">
      <h2 className="select-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="select-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="select-page__playground">
          {/* Preview + Code */}
          <div className="select-page__playground-preview">
            <div className="select-page__playground-result">
              <div style={{ inlineSize: '100%', maxInlineSize: '280px' }}>
                <Select
                  name="playground-select"
                  options={SAMPLE_OPTIONS}
                  value={value}
                  onChange={setValue}
                  size={size}
                  searchable={searchable}
                  clearable={clearable}
                  multiple={multiple}
                  disabled={disabled}
                  error={error || undefined}
                  label="Framework"
                  placeholder="Pick a framework..."
                />
              </div>
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="select-page__playground-controls">
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

            <div className="select-page__control-group">
              <span className="select-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />
                <Toggle label="Clearable" checked={clearable} onChange={setClearable} />
                <Toggle label="Multiple" checked={multiple} onChange={handleMultipleToggle} />
                <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              </div>
            </div>

            <div className="select-page__control-group">
              <span className="select-page__control-label">Error Text</span>
              <input
                type="text"
                value={error}
                onChange={e => setError(e.target.value)}
                className="select-page__text-input"
                placeholder="Leave empty for no error..."
              />
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}

// ─── Section: Form Integration ────────────────────────────────────────────────

function FormIntegrationSection() {
  const form = useForm(contactForm)
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)

  return (
    <section className="select-page__section" id="form-integration">
      <h2 className="select-page__section-title">
        <a href="#form-integration">Form Integration</a>
      </h2>
      <p className="select-page__section-desc">
        Select integrates with the built-in form engine via createForm and useForm.
        Validation, touched state, and error display are automatic.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <Form
          form={form}
          onSubmit={(values) => {
            setSubmitted(values)
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxInlineSize: '320px' }}>
            <Select
              name="framework"
              options={SAMPLE_OPTIONS}
              label="Preferred Framework"
              placeholder="Choose one..."
              clearable
            />
            <Select
              name="features"
              options={[
                { value: 'ssr', label: 'SSR' },
                { value: 'ssg', label: 'SSG' },
                { value: 'api-routes', label: 'API Routes' },
                { value: 'edge', label: 'Edge Runtime' },
                { value: 'streaming', label: 'Streaming' },
              ]}
              label="Required Features"
              placeholder="Select features..."
              multiple
              searchable
            />
            <Button type="submit" variant="primary">Submit</Button>
          </div>
        </Form>
        {submitted && (
          <div className="select-page__form-result">
            {JSON.stringify(submitted, null, 2)}
          </div>
        )}
      </Card>

      <div style={{ marginBlockStart: '0.75rem' }}>
        <CopyBlock
          code={`const schema = createForm({
  framework: {
    label: 'Preferred Framework',
    required: true,
    validate: (v) => (!v ? 'Please select a framework' : undefined),
  },
})

const form = useForm(schema)

<Form form={form} onSubmit={handleSubmit}>
  <Select
    name="framework"
    options={options}
    label="Preferred Framework"
    clearable
  />
  <Button type="submit">Submit</Button>
</Form>`}
          language="typescript"
          showLineNumbers
        />
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SelectPage() {
  useStyles('select-page', pageStyles)

  return (
    <div className="select-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="select-page__hero">
        <h1 className="select-page__title">Select</h1>
        <p className="select-page__desc">
          Custom dropdown with keyboard navigation, search typeahead, multi-select with tags,
          clearable values, and built-in form engine integration. Full ARIA combobox pattern.
        </p>
        <div className="select-page__import-row">
          <code className="select-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Basic Select ─────────────────────────────── */}
      <section className="select-page__section" id="basic">
        <h2 className="select-page__section-title">
          <a href="#basic">Basic Select</a>
        </h2>
        <p className="select-page__section-desc">
          The simplest usage with a label and a list of options.
        </p>
        <div className="select-page__preview select-page__preview--col">
          <div style={{ maxInlineSize: '280px' }}>
            <Select
              name="basic-demo"
              options={SAMPLE_OPTIONS}
              label="Framework"
              placeholder="Choose a framework..."
            />
          </div>
          <CopyBlock
            code={`<Select
  name="framework"
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ]}
  label="Framework"
  placeholder="Choose a framework..."
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. With Search ──────────────────────────────── */}
      <section className="select-page__section" id="searchable">
        <h2 className="select-page__section-title">
          <a href="#searchable">With Search</a>
        </h2>
        <p className="select-page__section-desc">
          Enable typeahead filtering with the searchable prop. The search input appears inside the dropdown
          and filters options as you type.
        </p>
        <div className="select-page__preview select-page__preview--col">
          <div style={{ maxInlineSize: '280px' }}>
            <Select
              name="search-demo"
              options={SAMPLE_OPTIONS}
              label="Search Frameworks"
              placeholder="Type to search..."
              searchable
            />
          </div>
          <CopyBlock
            code={`<Select
  name="framework"
  options={options}
  label="Search Frameworks"
  placeholder="Type to search..."
  searchable
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. Multi-Select with Tags ──────────────────── */}
      <section className="select-page__section" id="multiple">
        <h2 className="select-page__section-title">
          <a href="#multiple">Multi-Select with Tags</a>
        </h2>
        <p className="select-page__section-desc">
          Enable multiple selection with the multiple prop. Selected values display as tags inside the trigger.
          When more than 3 are selected, a count badge appears.
        </p>
        <div className="select-page__preview select-page__preview--col">
          <div style={{ maxInlineSize: '320px' }}>
            <Select
              name="multi-demo"
              options={SAMPLE_OPTIONS}
              label="Select Frameworks"
              placeholder="Pick multiple..."
              multiple
              searchable
              clearable
            />
          </div>
          <CopyBlock
            code={`<Select
  name="frameworks"
  options={options}
  label="Select Frameworks"
  placeholder="Pick multiple..."
  multiple
  searchable
  clearable
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 6. With Groups ─────────────────────────────── */}
      <section className="select-page__section" id="groups">
        <h2 className="select-page__section-title">
          <a href="#groups">With Groups</a>
        </h2>
        <p className="select-page__section-desc">
          Options can have a group property for logical categorization. Groups display as
          distinct sections in the dropdown.
        </p>
        <div className="select-page__preview select-page__preview--col">
          <div style={{ maxInlineSize: '280px' }}>
            <Select
              name="grouped-demo"
              options={GROUPED_OPTIONS}
              label="Technology"
              placeholder="Choose a technology..."
              searchable
            />
          </div>
          <CopyBlock
            code={`const options = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'node', label: 'Node.js', group: 'Backend' },
  { value: 'deno', label: 'Deno', group: 'Backend' },
]

<Select
  name="tech"
  options={options}
  label="Technology"
  searchable
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. With Icons ──────────────────────────────── */}
      <section className="select-page__section" id="icons">
        <h2 className="select-page__section-title">
          <a href="#icons">With Icons in Options</a>
        </h2>
        <p className="select-page__section-desc">
          Options can include an icon property that renders alongside the label in both
          the dropdown and the selected value display.
        </p>
        <div className="select-page__preview select-page__preview--col">
          <div style={{ maxInlineSize: '280px' }}>
            <Select
              name="icon-demo"
              options={ICON_OPTIONS}
              label="Status"
              placeholder="Choose a status..."
              clearable
            />
          </div>
          <CopyBlock
            code={`const options = [
  { value: 'info', label: 'Information', icon: <Icon name="info" size="sm" /> },
  { value: 'warning', label: 'Warning', icon: <Icon name="alert-triangle" size="sm" /> },
  { value: 'success', label: 'Success', icon: <Icon name="check-circle" size="sm" /> },
]

<Select
  name="status"
  options={options}
  label="Status"
  clearable
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Size Scale ──────────────────────────────── */}
      <section className="select-page__section" id="sizes">
        <h2 className="select-page__section-title">
          <a href="#sizes">Size Scale</a>
        </h2>
        <p className="select-page__section-desc">
          Five sizes from compact inline usage (xs) to prominent form fields (xl).
          Sizes control trigger height, padding, and font-size.
        </p>
        <div className="select-page__preview select-page__preview--col" style={{ gap: '1.25rem' }}>
          <div className="select-page__labeled-row" style={{ alignItems: 'flex-start' }}>
            {SIZES.map(s => (
              <div key={s} className="select-page__labeled-item" style={{ minInlineSize: '140px' }}>
                <Select
                  name={`size-${s}`}
                  options={SAMPLE_OPTIONS.slice(0, 3)}
                  size={s}
                  placeholder={`Size ${s}`}
                />
                <span className="select-page__item-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. States ──────────────────────────────────── */}
      <section className="select-page__section" id="states">
        <h2 className="select-page__section-title">
          <a href="#states">States</a>
        </h2>
        <p className="select-page__section-desc">
          Select handles all interaction states with clear visual feedback.
        </p>
        <div className="select-page__states-grid">
          <div className="select-page__state-cell">
            <Select
              name="state-default"
              options={SAMPLE_OPTIONS}
              placeholder="Default"
            />
            <span className="select-page__state-label">Default</span>
          </div>
          <div className="select-page__state-cell">
            <Select
              name="state-value"
              options={SAMPLE_OPTIONS}
              value="react"
            />
            <span className="select-page__state-label">With Value</span>
          </div>
          <div className="select-page__state-cell">
            <Select
              name="state-error"
              options={SAMPLE_OPTIONS}
              placeholder="Select..."
              error="This field is required"
            />
            <span className="select-page__state-label">Error</span>
          </div>
          <div className="select-page__state-cell">
            <Select
              name="state-disabled"
              options={SAMPLE_OPTIONS}
              placeholder="Disabled"
              disabled
            />
            <span className="select-page__state-label">Disabled</span>
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. Motion Levels ──────────────────────────── */}
      <section className="select-page__section" id="motion">
        <h2 className="select-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="select-page__section-desc">
          The dropdown entry animation and chevron rotation respect the motion level.
          Level 0 disables all animation; higher levels add spring physics.
        </p>
        <div className="select-page__preview">
          <div className="select-page__labeled-row" style={{ alignItems: 'flex-start' }}>
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="select-page__labeled-item" style={{ minInlineSize: '150px' }}>
                <Select
                  name={`motion-${m}`}
                  options={SAMPLE_OPTIONS.slice(0, 3)}
                  motion={m}
                  placeholder={`Motion ${m}`}
                />
                <span className="select-page__item-label">
                  {m === 0 ? 'Instant' : m === 1 ? 'Subtle' : m === 2 ? 'Spring' : 'Cinematic'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Form Integration ───────────────────────── */}
      <FormIntegrationSection />

      <Divider spacing="sm" />

      {/* ── 12. Props API Table ─────────────────────────── */}
      <section className="select-page__section" id="props">
        <h2 className="select-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="select-page__section-desc">
          All props accepted by Select. It also spreads any native div HTML attributes
          onto the root container element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={selectProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 13. Accessibility Notes ────────────────────── */}
      <section className="select-page__section" id="accessibility">
        <h2 className="select-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="select-page__section-desc">
          Implements the WAI-ARIA combobox pattern with full keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul className="select-page__a11y-list">
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Role:</strong> Uses <code className="select-page__a11y-key">role="combobox"</code> on trigger and <code className="select-page__a11y-key">role="listbox"</code> on dropdown with <code className="select-page__a11y-key">aria-expanded</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="select-page__a11y-key">Arrow Up/Down</code> to navigate, <code className="select-page__a11y-key">Enter</code>/<code className="select-page__a11y-key">Space</code> to select, <code className="select-page__a11y-key">Escape</code> to close, <code className="select-page__a11y-key">Home</code>/<code className="select-page__a11y-key">End</code> to jump.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Typeahead:</strong> In non-searchable mode, pressing a letter jumps to the first matching option.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring with brand-colored glow via <code className="select-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error:</strong> Linked via <code className="select-page__a11y-key">aria-invalid</code> and <code className="select-page__a11y-key">aria-describedby</code> to error message with <code className="select-page__a11y-key">role="alert"</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="select-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="select-page__a11y-item">
              <span className="select-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="select-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 14. Source Code ─────────────────────────────── */}
      <section className="select-page__section" id="source">
        <h2 className="select-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="select-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/select.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="select-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/select.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
