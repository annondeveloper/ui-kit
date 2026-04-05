'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { MultiSelect } from '@ui/components/multi-select'
import { MultiSelect as LiteMultiSelect } from '@ui/lite/multi-select'
import { MultiSelect as PremiumMultiSelect } from '@ui/premium/multi-select'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

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

      /* ── Playground ─────────────────────────────────── */

      .ms-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .ms-page__playground {
          grid-template-columns: 1fr;
        }
        .ms-page__playground-controls {
          position: static !important;
        }
      }

      @container ms-page (max-width: 680px) {
        .ms-page__playground {
          grid-template-columns: 1fr;
        }
        .ms-page__playground-controls {
          position: static !important;
        }
      }

      .ms-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .ms-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 3rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .ms-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .ms-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .ms-page__playground-controls {
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

      .ms-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ms-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ms-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ms-page__option-btn {
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
      .ms-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ms-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ms-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ms-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ms-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      .ms-page__number-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 5rem;
      }
      .ms-page__number-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
      }

      .ms-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .ms-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ms-page__color-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .ms-page__color-preset {
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .ms-page__color-preset:hover {
        transform: scale(1.15);
      }
      .ms-page__color-preset--active {
        border-color: var(--text-primary);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ms-page__size-breakdown {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        margin-block-start: 0.5rem;
      }

      .ms-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .ms-page__code-tabs {
        margin-block-start: 1rem;
      }

      .ms-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .ms-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Responsive ────────────────────────────────── */

      @media (max-width: 768px) {
        .ms-page__hero { padding: 2rem 1.25rem; }
        .ms-page__title { font-size: 1.75rem; }
        .ms-page__preview { padding: 1.75rem; }
        .ms-page__playground { grid-template-columns: 1fr; }
        .ms-page__playground-result { padding: 2rem; min-block-size: 120px; }
        .ms-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .ms-page__hero { padding: 1.5rem 1rem; }
        .ms-page__title { font-size: 1.5rem; }
        .ms-page__preview { padding: 1rem; }
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

const COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'cyan', label: 'Cyan', disabled: true },
]

// ─── Props ──────────────────────────────────────────────────────────────────

const msProps: PropDef[] = [
  { name: 'options', type: 'MultiSelectOption[]', required: true, description: 'Options to render in the dropdown.' },
  { name: 'value', type: 'string[]', description: 'Controlled value.' },
  { name: 'defaultValue', type: 'string[]', description: 'Initial uncontrolled value.' },
  { name: 'onChange', type: '(values: string[]) => void', description: 'Callback on value change.' },
  { name: 'placeholder', type: 'string', default: "'Select...'", description: 'Placeholder text when empty.' },
  { name: 'searchable', type: 'boolean', default: 'true', description: 'Enables search/filter.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Shows clear button when has value.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'maxSelected', type: 'number', description: 'Maximum number of items that can be selected.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Component size.' },
  { name: 'error', type: 'string', description: 'Error message below input.' },
  { name: 'label', type: 'string', description: 'Label text above input.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

const msOptionProps: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'Controlled value.' },
  { name: 'label', type: 'string', required: true, description: 'Label text for the option.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'group', type: 'string', description: 'Group name for categorizing options.' },
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
    <div className="ms-page__control-group">
      <span className="ms-page__control-label">{label}</span>
      <div className="ms-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`ms-page__option-btn${opt === value ? ' ms-page__option-btn--active' : ''}`}
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
    <label className="ms-page__toggle-label">
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

// ─── Code Generation ─────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

function generateReactCode(
  tier: Tier,
  size: Size,
  searchable: boolean,
  clearable: boolean,
  disabled: boolean,
  maxSelected: number | undefined,
  placeholder: string,
  errorText: string,
  labelText: string,
  motion: 0 | 1 | 2 | 3,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const props: string[] = []
  props.push(`label="${labelText}"`)
  props.push(`options={options}`)
  props.push(`value={selected}`)
  props.push(`onChange={setSelected}`)
  if (placeholder !== 'Select...') props.push(`placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`size="${size}"`)
  if (searchable) props.push('searchable')
  if (clearable) props.push('clearable')
  if (disabled) props.push('disabled')
  if (maxSelected !== undefined) props.push(`maxSelected={${maxSelected}}`)
  if (errorText) props.push(`error="${errorText}"`)
  if (tier !== 'lite' && motion !== 3) props.push(`motion={${motion}}`)

  return `import { MultiSelect } from '${importPath}'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

function Example() {
  const [selected, setSelected] = useState<string[]>([])

  return (
    <MultiSelect
      ${props.join('\n      ')}
    />
  )
}`
}

function generateHtmlCode(
  size: Size,
  labelText: string,
  placeholder: string,
): string {
  return `<!-- MultiSelect — HTML+CSS standalone -->
<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/multi-select.css" />

<div class="ui-multi-select" data-size="${size}">
  <label class="ui-multi-select__label">${labelText}</label>
  <div class="ui-multi-select__trigger">
    <input
      class="ui-multi-select__input"
      type="text"
      role="combobox"
      aria-expanded="false"
      aria-haspopup="listbox"
      placeholder="${placeholder}"
    />
    <span class="ui-multi-select__actions">
      <svg class="ui-multi-select__chevron" width="16" height="16" viewBox="0 0 16 16">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </span>
  </div>
</div>

<!-- JS needed for full interactivity -->`
}

function generateVueCode(
  tier: Tier,
  size: Size,
  searchable: boolean,
  clearable: boolean,
  disabled: boolean,
  labelText: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = []
  attrs.push(`label="${labelText}"`)
  attrs.push(':options="options"')
  attrs.push('v-model="selected"')
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (searchable) attrs.push('searchable')
  if (clearable) attrs.push('clearable')
  if (disabled) attrs.push('disabled')

  return `<template>
  <MultiSelect
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { MultiSelect } from '${importPath}'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const selected = ref([])
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: Size,
  disabled: boolean,
  labelText: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the React wrapper or CSS-only approach -->
<div
  class="ui-multi-select"
  data-size="${size}"
  ${disabled ? '[attr.data-disabled]="true"' : ''}
>
  <label class="ui-multi-select__label">${labelText}</label>
  <div class="ui-multi-select__trigger">
    <input
      class="ui-multi-select__input"
      type="text"
      role="combobox"
      [placeholder]="'Select...'"
    />
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/multi-select.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: Size,
  searchable: boolean,
  clearable: boolean,
  disabled: boolean,
  labelText: string,
): string {
  const importPath = tier === 'lite'
    ? '@annondeveloper/ui-kit/lite'
    : tier === 'premium'
      ? '@annondeveloper/ui-kit/premium'
      : '@annondeveloper/ui-kit'

  const attrs: string[] = []
  attrs.push(`label="${labelText}"`)
  attrs.push('{options}')
  attrs.push('bind:value={selected}')
  if (size !== 'md') attrs.push(`size="${size}"`)
  if (searchable) attrs.push('searchable')
  if (clearable) attrs.push('clearable')
  if (disabled) attrs.push('disabled')

  return `<script>
  import { MultiSelect } from '${importPath}';

  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  let selected = [];
</script>

<MultiSelect
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<Size>('md')
  const [searchable, setSearchable] = useState(true)
  const [clearable, setClearable] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [maxSelectedEnabled, setMaxSelectedEnabled] = useState(false)
  const [maxSelectedValue, setMaxSelectedValue] = useState(3)
  const [placeholder, setPlaceholder] = useState('Select...')
  const [labelText, setLabelText] = useState('Fruits')
  const [errorText, setErrorText] = useState('')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [selected, setSelected] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const maxSelected = maxSelectedEnabled ? maxSelectedValue : undefined

  const MSComponent = tier === 'lite' ? LiteMultiSelect : tier === 'premium' ? PremiumMultiSelect : MultiSelect

  const reactCode = useMemo(
    () => generateReactCode(tier, size, searchable, clearable, disabled, maxSelected, placeholder, errorText, labelText, motion),
    [tier, size, searchable, clearable, disabled, maxSelected, placeholder, errorText, labelText, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(size, labelText, placeholder),
    [size, labelText, placeholder],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, searchable, clearable, disabled, labelText),
    [tier, size, searchable, clearable, disabled, labelText],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, disabled, labelText),
    [tier, size, disabled, labelText],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, searchable, clearable, disabled, labelText),
    [tier, size, searchable, clearable, disabled, labelText],
  )

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  const previewProps: Record<string, unknown> = {
    label: labelText,
    options: FRUIT_OPTIONS,
    value: selected,
    onChange: setSelected,
    size,
    placeholder,
    searchable,
    clearable,
    disabled,
  }
  if (maxSelected !== undefined) previewProps.maxSelected = maxSelected
  if (errorText) previewProps.error = errorText
  if (tier !== 'lite') previewProps.motion = motion

  return (
    <section className="ms-page__section" id="playground">
      <h2 className="ms-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="ms-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="ms-page__playground">
        {/* Preview area */}
        <div className="ms-page__playground-preview">
          <div className="ms-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '360px', position: 'relative', zIndex: 1 }}>
              <MSComponent {...previewProps as any} />
            </div>
          </div>

          {/* Tabbed code output */}
          <div className="ms-page__code-tabs">
            <div className="ms-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="ms-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
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
        <div className="ms-page__playground-controls">
          <OptionGroup label="Size" options={['sm', 'md', 'lg'] as const} value={size} onChange={setSize} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="ms-page__control-group">
            <span className="ms-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Searchable" checked={searchable} onChange={setSearchable} />
              <Toggle label="Clearable" checked={clearable} onChange={setClearable} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              <Toggle label="Max selection limit" checked={maxSelectedEnabled} onChange={setMaxSelectedEnabled} />
            </div>
          </div>

          {maxSelectedEnabled && (
            <div className="ms-page__control-group">
              <span className="ms-page__control-label">Max Selected</span>
              <input
                type="number"
                min={1}
                max={8}
                value={maxSelectedValue}
                onChange={e => setMaxSelectedValue(Number(e.target.value))}
                className="ms-page__number-input"
              />
            </div>
          )}

          <div className="ms-page__control-group">
            <span className="ms-page__control-label">Label</span>
            <input
              type="text"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              className="ms-page__text-input"
              placeholder="Label text..."
            />
          </div>

          <div className="ms-page__control-group">
            <span className="ms-page__control-label">Placeholder</span>
            <input
              type="text"
              value={placeholder}
              onChange={e => setPlaceholder(e.target.value)}
              className="ms-page__text-input"
              placeholder="Placeholder text..."
            />
          </div>

          <div className="ms-page__control-group">
            <span className="ms-page__control-label">Error</span>
            <input
              type="text"
              value={errorText}
              onChange={e => setErrorText(e.target.value)}
              className="ms-page__text-input"
              placeholder="Error message (empty = none)"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Import String ──────────────────────────────────────────────────────────

function getImportStr(tier: Tier): string {
  if (tier === 'lite') return "import { MultiSelect } from '@annondeveloper/ui-kit/lite'"
  if (tier === 'premium') return "import { MultiSelect } from '@annondeveloper/ui-kit/premium'"
  return "import { MultiSelect } from '@annondeveloper/ui-kit'"
}

// ─── Page ───────────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#0ea5e9', name: 'Sky' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#8b5cf6', name: 'Violet' },
  { hex: '#d946ef', name: 'Fuchsia' },
  { hex: '#f59e0b', name: 'Amber' },
]

export default function MultiSelectPage() {
  useStyles('ms-page', pageStyles)
  const { tier } = useTier()

  const [selected, setSelected] = useState<string[]>(['apple', 'cherry'])
  const [brandColor, setBrandColor] = useState('#6366f1')

  const importStr = getImportStr(tier)

  const MSComponent = tier === 'lite' ? LiteMultiSelect : tier === 'premium' ? PremiumMultiSelect : MultiSelect

  return (
    <div className="ms-page">
      <div className="ms-page__hero">
        <h1 className="ms-page__title">MultiSelect</h1>
        <p className="ms-page__desc">
          Multi-value select with tag chips, searchable dropdown, grouped options, and
          configurable selection limits. Keyboard-navigable with ARIA listbox pattern.
        </p>
        <div className="ms-page__import-row">
          <code className="ms-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* ── 1. Tags & Search ─────────────────────────────── */}
      <section className="ms-page__section" id="basic">
        <h2 className="ms-page__section-title"><a href="#basic">Tags & Searchable</a></h2>
        <p className="ms-page__section-desc">
          Selected items appear as removable tags. Enable searchable to filter options by typing.
          Selected: {selected.join(', ') || 'none'}.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MSComponent
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

      {/* ── 2. Live Playground ────────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Grouped & maxSelected ─────────────────────── */}
      <section className="ms-page__section" id="grouped">
        <h2 className="ms-page__section-title"><a href="#grouped">Grouped Options & Max Selected</a></h2>
        <p className="ms-page__section-desc">
          Options with a group property are visually grouped with headers. Use maxSelected to cap the selection count.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MSComponent
            label="Tech stack (max 3)"
            options={GROUPED_OPTIONS}
            maxSelected={3}
            searchable
            placeholder="Choose up to 3..."
          />
        </div>
      </section>

      {/* ── 4. Sizes ─────────────────────────────────────── */}
      <section className="ms-page__section" id="sizes">
        <h2 className="ms-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="ms-page__section-desc">
          Three sizes: sm, md (default), and lg. Touch targets automatically scale to 44px on coarse pointers.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MSComponent label="Small" options={FRUIT_OPTIONS} size="sm" placeholder="Small..." />
          <MSComponent label="Medium (default)" options={FRUIT_OPTIONS} size="md" placeholder="Medium..." />
          <MSComponent label="Large" options={FRUIT_OPTIONS} size="lg" placeholder="Large..." />
        </div>
      </section>

      {/* ── 5. States ─────────────────────────────────────── */}
      <section className="ms-page__section" id="states">
        <h2 className="ms-page__section-title"><a href="#states">States</a></h2>
        <p className="ms-page__section-desc">
          Error, disabled, and options with disabled items.
        </p>
        <div className="ms-page__preview ms-page__preview--col">
          <MSComponent label="With error" options={FRUIT_OPTIONS} error="At least one required" placeholder="Select..." />
          <MSComponent label="Disabled" options={FRUIT_OPTIONS} disabled defaultValue={['apple']} />
          <MSComponent label="Disabled options" options={COLOR_OPTIONS} placeholder="Some options disabled..." />
        </div>
      </section>

      {/* ── 6. Weight Tiers ──────────────────────────────────── */}
      <section className="ms-page__section" id="tiers">
        <h2 className="ms-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="ms-page__section-desc">
          Compare all three tiers side-by-side. Lite strips motion for minimal footprint,
          Premium adds aurora glow, spring animations, and shimmer effects.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Card padding="md" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.75rem' }}>
              Full-featured with motion, theming, and accessibility.
            </p>
            <MultiSelect
              label="Standard tier"
              options={FRUIT_OPTIONS.slice(0, 4)}
              defaultValue={['apple']}
              placeholder="Pick..."
              size="sm"
            />
            <code style={{ fontSize: '0.625rem', display: 'block', marginBlockStart: '0.5rem' }}>
              import {'{'} MultiSelect {'}'} from &apos;@annondeveloper/ui-kit&apos;
            </code>
            <div className="ms-page__size-breakdown">
              <div className="ms-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.8 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.7 KB</strong> gzip</span>
              </div>
            </div>
          </Card>
          <Card padding="md" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.75rem' }}>
              Minimal footprint, no motion or advanced theming.
            </p>
            <LiteMultiSelect
              label="Lite tier"
              options={FRUIT_OPTIONS.slice(0, 4)}
              defaultValue={['banana']}
              placeholder="Pick..."
              size="sm"
            />
            <code style={{ fontSize: '0.625rem', display: 'block', marginBlockStart: '0.5rem' }}>
              import {'{'} MultiSelect {'}'} from &apos;@annondeveloper/ui-kit/lite&apos;
            </code>
            <div className="ms-page__size-breakdown">
              <div className="ms-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.0 KB</strong> gzip</span>
              </div>
            </div>
          </Card>
          <Card padding="md" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.75rem' }}>
              Aurora glow, spring animations, and shimmer effects.
            </p>
            <PremiumMultiSelect
              label="Premium tier"
              options={FRUIT_OPTIONS.slice(0, 4)}
              defaultValue={['cherry']}
              placeholder="Pick..."
              size="sm"
            />
            <code style={{ fontSize: '0.625rem', display: 'block', marginBlockStart: '0.5rem' }}>
              import {'{'} MultiSelect {'}'} from &apos;@annondeveloper/ui-kit/premium&apos;
            </code>
            <div className="ms-page__size-breakdown">
              <div className="ms-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>4.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.1 KB</strong> gzip</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. Accessibility ─────────────────────────────── */}
      <section className="ms-page__section" id="a11y">
        <h2 className="ms-page__section-title"><a href="#a11y">Accessibility</a></h2>
        <p className="ms-page__section-desc">
          Built on the WAI-ARIA Listbox pattern with full keyboard navigation.
        </p>
        <Card variant="default" padding="md">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              ['Arrow Down / Arrow Up', 'Navigate through options'],
              ['Enter / Space', 'Toggle selection of focused option'],
              ['Escape', 'Close dropdown and return focus to trigger'],
              ['Home / End', 'Jump to first or last option'],
              ['Backspace', 'Remove last tag when search is empty'],
              ['Type to search', 'Filter options in real-time'],
            ].map(([key, desc]) => (
              <li key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <Icon name="check" size="sm" style={{ color: 'var(--brand)', flexShrink: 0, marginBlockStart: '0.125rem' }} />
                <span>
                  <code style={{
                    fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
                    fontSize: 'var(--text-xs, 0.75rem)',
                    background: 'var(--border-subtle)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 'var(--radius-sm)',
                    marginInlineEnd: '0.375rem',
                  }}>{key}</code>
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ── 8. Brand Color ───────────────────────────────── */}
      <section className="ms-page__section" id="brand-color">
        <h2 className="ms-page__section-title">
          <a href="#brand-color">Brand Color</a>
        </h2>
        <p className="ms-page__section-desc">
          Pick a brand color to see the MultiSelect update in real-time. The theme generates
          derived colors (light, dark, subtle, glow) automatically from your choice.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
          <div className="ms-page__color-presets">
            {COLOR_PRESETS.map(p => (
              <button
                key={p.hex}
                type="button"
                className={`ms-page__color-preset${brandColor === p.hex ? ' ms-page__color-preset--active' : ''}`}
                style={{ background: p.hex }}
                onClick={() => setBrandColor(p.hex)}
                title={p.name}
                aria-label={`Set brand color to ${p.name}`}
              />
            ))}
          </div>
          {brandColor !== '#6366f1' && (
            <Button size="xs" variant="ghost" onClick={() => setBrandColor('#6366f1')}>
              <Icon name="refresh" size="sm" /> Reset to default
            </Button>
          )}
        </div>
      </section>

      {/* ── 9. Props ──────────────────────────────────────── */}
      <section className="ms-page__section" id="props">
        <h2 className="ms-page__section-title"><a href="#props">Props</a></h2>
        <p className="ms-page__section-desc">
          All props accepted by MultiSelect. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={msProps} />
        </Card>

        <h3 className="ms-page__section-title" style={{ marginBlockStart: '1.5rem' }}>
          MultiSelectOption Interface
        </h3>
        <p className="ms-page__section-desc">
          Shape of each option object passed to the <code>options</code> prop.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={msOptionProps} />
        </Card>
      </section>

      {/* ── 10. Source ─────────────────────────────────────── */}
      <section className="ms-page__section" id="source">
        <h2 className="ms-page__section-title"><a href="#source">Source</a></h2>
        <p className="ms-page__section-desc">View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a className="ms-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/multi-select.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/components/multi-select.tsx (Standard)
          </a>
          <a className="ms-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/multi-select.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/lite/multi-select.tsx (Lite)
          </a>
          <a className="ms-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/multi-select.tsx" target="_blank" rel="noopener noreferrer">
            <Icon name="code" size="sm" /> src/premium/multi-select.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}
