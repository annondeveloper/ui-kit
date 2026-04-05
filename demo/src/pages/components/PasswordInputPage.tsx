'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PasswordInput } from '@ui/components/password-input'
import { PasswordInput as LitePasswordInput } from '@ui/lite/password-input'
import { PasswordInput as PremiumPasswordInput } from '@ui/premium/password-input'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

// ─── Types ─────────────────────────────────────────────────────────────────

type Tier = 'lite' | 'standard' | 'premium'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.pw-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: pw-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .pw-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .pw-page__hero::before {
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
        .pw-page__hero::before { animation: none; }
      }

      .pw-page__title {
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

      .pw-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .pw-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pw-page__import-code {
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

      .pw-page__copy-btn { font-size: var(--text-xs, 0.75rem); flex-shrink: 0; }

      .pw-page__section {
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
        animation: pw-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes pw-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .pw-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .pw-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .pw-page__section-title a { color: inherit; text-decoration: none; }
      .pw-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .pw-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .pw-page__preview {
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

      .pw-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .pw-page__preview--col {
        flex-direction: column;
        align-items: stretch;
        max-inline-size: 360px;
        margin-inline: auto;
      }

      .pw-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-block-start: 1rem;
      }

      @container pw-page (max-inline-size: 640px) {
        .pw-page__playground { grid-template-columns: 1fr; }
      }

      .pw-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .pw-page__playground-result {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        min-block-size: 120px;
        border: 1px solid var(--border-subtle);
      }

      .pw-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .pw-page__control-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .pw-page__control-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-secondary);
        min-inline-size: 6rem;
      }

      .pw-page__control-select {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-primary);
      }

      .pw-page__control-checkbox {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .pw-page__code-tabs {
        display: flex;
        gap: 0;
        border-block-end: 1px solid var(--border-default);
        margin-block-end: 0;
      }

      .pw-page__code-tab {
        padding: 0.375rem 0.75rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-secondary);
        background: transparent;
        border: none;
        cursor: pointer;
        border-block-end: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }
      .pw-page__code-tab:hover { color: var(--text-primary); }
      .pw-page__code-tab[data-active="true"] {
        color: var(--brand, oklch(65% 0.2 270));
        border-block-end-color: var(--brand, oklch(65% 0.2 270));
      }

      .pw-page__code-block {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8125rem;
        line-height: 1.6;
        background: oklch(0% 0 0 / 0.3);
        border-radius: 0 0 var(--radius-md) var(--radius-md);
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        color: var(--text-primary);
        border: 1px solid var(--border-subtle);
        border-block-start: none;
        max-block-size: 240px;
      }
    }
  }
`

// ─── Props ──────────────────────────────────────────────────────────────────

const pwProps: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled value.' },
  { name: 'onChange', type: '(e: React.ChangeEvent<HTMLInputElement>) => void', description: 'Callback on value change.' },
  { name: 'label', type: 'string', description: 'Label text above input.' },
  { name: 'description', type: 'string', description: 'Helper text below input.' },
  { name: 'error', type: 'string', description: 'Error message below input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when empty.' },
  { name: 'name', type: 'string', description: 'Form field name.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Component size.' },
  { name: 'disabled', type: 'boolean', description: 'Disables interaction.' },
  { name: 'required', type: 'boolean', description: 'Marks as required.' },
  { name: 'showStrengthMeter', type: 'boolean', description: 'Show strength meter toggle.' },
  { name: 'strengthLabels', type: 'string[]', default: 'DEFAULT_STRENGTH_LABELS', description: 'Labels for each strength level.' },
  { name: 'visibilityToggle', type: 'boolean', default: 'true', description: 'Visibility toggle — shows eye icon to reveal/hide password.' },
  { name: 'onStrengthChange', type: '(strength: number) => void', description: 'Called when calculated strength changes.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity (0=none, 1=subtle, 2=expressive, 3=cinematic).' },
]

// ─── Import Strings ────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { PasswordInput } from '@annondeveloper/ui-kit'",
  lite: "import { PasswordInput } from '@annondeveloper/ui-kit/lite'",
  premium: "import { PasswordInput } from '@annondeveloper/ui-kit/premium'",
}

// ─── Code Generators ───────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  size: Size,
  placeholder: string,
  disabled: boolean,
  showStrength: boolean,
  visibilityToggle: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  props.push('  label="Password"')
  if (placeholder !== 'Enter password') props.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (disabled) props.push('  disabled')
  if (showStrength) props.push('  showStrengthMeter')
  if (!visibilityToggle) props.push('  visibilityToggle={false}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? '<PasswordInput label="Password" />'
    : `<PasswordInput\n${props.join('\n')}\n/>`

  return `${importStr}\n\n${jsx}`
}

function generateHtmlCode(
  size: Size,
  placeholder: string,
  disabled: boolean,
  showStrength: boolean,
): string {
  const attrs = [`class="ui-password-input"`, `data-size="${size}"`]
  if (disabled) attrs.push('disabled')
  const strengthHtml = showStrength
    ? `\n  <div class="ui-password-input__strength">\n    <div class="ui-password-input__strength-bar" data-level="0"></div>\n  </div>`
    : ''
  return `<!-- HTML + CSS approach -->
<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/password-input.css" />

<div ${attrs.join(' ')}>
  <label class="ui-password-input__label">Password</label>
  <div class="ui-password-input__field-wrapper">
    <input
      type="password"
      class="ui-password-input__field"
      placeholder="${placeholder}"
      ${disabled ? 'disabled' : ''}
    />
    <button class="ui-password-input__toggle" type="button" aria-label="Toggle visibility">
      <!-- eye icon -->
    </button>
  </div>${strengthHtml}
</div>`
}

function generateVueCode(
  tier: Tier,
  size: Size,
  placeholder: string,
  disabled: boolean,
  showStrength: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-password-input"`, `data-size="${size}"`]
    if (disabled) attrs.push(':disabled="true"')
    return `<template>
  <div ${attrs.join(' ')}>
    <label class="ui-password-input__label">Password</label>
    <div class="ui-password-input__field-wrapper">
      <input type="password" class="ui-password-input__field" placeholder="${placeholder}" />
      <button class="ui-password-input__toggle" type="button">Toggle</button>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  label="Password"']
  if (placeholder !== 'Enter password') attrs.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')
  if (showStrength) attrs.push('  show-strength-meter')
  return `<template>
  <PasswordInput
${attrs.join('\n')}
  />
</template>

<script setup>
import { PasswordInput } from '${importPath}'
</script>`
}

function generateAngularCode(
  tier: Tier,
  size: Size,
  placeholder: string,
  disabled: boolean,
  showStrength: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-password-input"`, `data-size="${size}"`]
    if (disabled) attrs.push('[disabled]="true"')
    return `<!-- Angular — Lite tier (CSS-only) -->
<div ${attrs.join(' ')}>
  <label class="ui-password-input__label">Password</label>
  <div class="ui-password-input__field-wrapper">
    <input type="password" class="ui-password-input__field" placeholder="${placeholder}" />
    <button class="ui-password-input__toggle" type="button">Toggle</button>
  </div>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<div
  class="ui-password-input"
  data-size="${size}"
  ${disabled ? '[attr.disabled]="true"' : ''}
>
  <label class="ui-password-input__label">Password</label>
  <div class="ui-password-input__field-wrapper">
    <input
      type="password"
      class="ui-password-input__field"
      placeholder="${placeholder}"
      ${showStrength ? '[attr.data-strength]="strength"' : ''}
    />
    <button class="ui-password-input__toggle" type="button">Toggle</button>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/password-input.css';`
}

function generateSvelteCode(
  tier: Tier,
  size: Size,
  placeholder: string,
  disabled: boolean,
  showStrength: boolean,
): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-password-input" data-size="${size}">
  <label class="ui-password-input__label">Password</label>
  <div class="ui-password-input__field-wrapper">
    <input
      type="password"
      class="ui-password-input__field"
      placeholder="${placeholder}"
      ${disabled ? 'disabled' : ''}
    />
    <button class="ui-password-input__toggle" type="button">Toggle</button>
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = ['  label="Password"']
  if (placeholder !== 'Enter password') attrs.push(`  placeholder="${placeholder}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  if (disabled) attrs.push('  disabled')
  if (showStrength) attrs.push('  showStrengthMeter')
  return `<script>
  import { PasswordInput } from '${importPath}';
</script>

<PasswordInput
${attrs.join('\n')}
/>`
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm" variant="secondary" className="pw-page__copy-btn"
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [size, setSize] = useState<Size>('md')
  const [placeholder, setPlaceholder] = useState('Enter password')
  const [disabled, setDisabled] = useState(false)
  const [showStrength, setShowStrength] = useState(false)
  const [visibilityToggle, setVisibilityToggle] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')

  const PasswordComponent = tier === 'lite' ? LitePasswordInput : tier === 'premium' ? PremiumPasswordInput : PasswordInput

  const reactCode = useMemo(
    () => generateReactCode(tier, size, placeholder, disabled, showStrength, visibilityToggle, motion),
    [tier, size, placeholder, disabled, showStrength, visibilityToggle, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(size, placeholder, disabled, showStrength),
    [size, placeholder, disabled, showStrength],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, size, placeholder, disabled, showStrength),
    [tier, size, placeholder, disabled, showStrength],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, size, placeholder, disabled, showStrength),
    [tier, size, placeholder, disabled, showStrength],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, size, placeholder, disabled, showStrength),
    [tier, size, placeholder, disabled, showStrength],
  )

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
    navigator.clipboard.writeText(activeCode).then(() => {
      setCopyStatus('Copied!')
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const previewProps: Record<string, unknown> = {
    label: 'Password',
    placeholder,
    size,
    disabled,
    visibilityToggle,
  }
  if (showStrength) previewProps.showStrengthMeter = true
  if (tier !== 'lite' && motion !== 3) previewProps.motion = motion

  return (
    <section className="pw-page__section" id="playground">
      <h2 className="pw-page__section-title">
        <a href="#playground">Playground</a>
      </h2>
      <p className="pw-page__section-desc">
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className="pw-page__playground">
        {/* Preview area */}
        <div className="pw-page__playground-preview">
          <div className="pw-page__playground-result">
            <div style={{ inlineSize: '100%', maxInlineSize: '320px' }}>
              <PasswordComponent {...previewProps} />
            </div>
          </div>

          {/* Tabbed code output */}
          <div>
            <div className="pw-page__code-tabs">
              {codeTabs.map((tab) => (
                <button
                  key={tab.id}
                  className="pw-page__code-tab"
                  data-active={activeCodeTab === tab.id}
                  onClick={() => setActiveCodeTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                className="pw-page__code-tab"
                style={{ marginInlineStart: 'auto' }}
                onClick={handleCopy}
              >
                {copyStatus || 'Copy'}
              </button>
            </div>
            <pre className="pw-page__code-block">{activeCode}</pre>
          </div>
        </div>

        {/* Controls */}
        <div className="pw-page__playground-controls">
          <div className="pw-page__control-row">
            <span className="pw-page__control-label">Size</span>
            <select
              className="pw-page__control-select"
              value={size}
              onChange={(e) => setSize(e.target.value as Size)}
            >
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="pw-page__control-row">
            <span className="pw-page__control-label">Placeholder</span>
            <input
              className="pw-page__control-select"
              style={{ flex: 1 }}
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
            />
          </div>

          {tier !== 'lite' && (
            <div className="pw-page__control-row">
              <span className="pw-page__control-label">Motion Level</span>
              <select
                className="pw-page__control-select"
                value={motion}
                onChange={(e) => setMotion(Number(e.target.value) as 0 | 1 | 2 | 3)}
              >
                <option value={0}>0 - None</option>
                <option value={1}>1 - Subtle</option>
                <option value={2}>2 - Expressive</option>
                <option value={3}>3 - Cinematic</option>
              </select>
            </div>
          )}

          <div className="pw-page__control-row" style={{ gap: '1rem' }}>
            <label className="pw-page__control-checkbox">
              <input type="checkbox" checked={disabled} onChange={() => setDisabled(!disabled)} />
              Disabled
            </label>
            <label className="pw-page__control-checkbox">
              <input type="checkbox" checked={showStrength} onChange={() => setShowStrength(!showStrength)} />
              Strength Meter
            </label>
            <label className="pw-page__control-checkbox">
              <input type="checkbox" checked={visibilityToggle} onChange={() => setVisibilityToggle(!visibilityToggle)} />
              Visibility Toggle
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PasswordInputPage() {
  useStyles('pw-page', pageStyles)
  const { tier } = useTier()

  const effectiveTier = tier as Tier
  const [strength, setStrength] = useState(0)

  const PasswordComponent = effectiveTier === 'lite'
    ? LitePasswordInput
    : effectiveTier === 'premium'
      ? PremiumPasswordInput
      : PasswordInput

  const importStr = IMPORT_STRINGS[effectiveTier]

  return (
    <div className="pw-page">
      <div className="pw-page__hero">
        <h1 className="pw-page__title">PasswordInput</h1>
        <p className="pw-page__desc">
          Secure password field with visibility toggle and optional strength meter.
          Calculates strength from length, character variety, and symbol usage.
          Ships in three weight tiers from 1.2KB lite to 3.8KB premium with aurora glow effects.
        </p>
        <div className="pw-page__import-row">
          <code className="pw-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* ── Visibility Toggle ─────────────────────────── */}
      <section className="pw-page__section" id="toggle">
        <h2 className="pw-page__section-title"><a href="#toggle">Visibility Toggle</a></h2>
        <p className="pw-page__section-desc">
          Click the eye icon to reveal or hide the password. The toggle is enabled by default
          and can be disabled with visibilityToggle={'{false}'}.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordComponent label="With toggle (default)" placeholder="Enter password" />
          <PasswordComponent label="Without toggle" placeholder="Enter password" visibilityToggle={false} />
        </div>
      </section>

      {/* ── Strength Meter ─────────────────────────────── */}
      <section className="pw-page__section" id="strength">
        <h2 className="pw-page__section-title"><a href="#strength">Strength Meter</a></h2>
        <p className="pw-page__section-desc">
          Enable showStrengthMeter to display a colored progress bar below the input.
          Try typing to see strength update in real time. Current strength: {strength}/4.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordComponent
            label="Create password"
            placeholder="Type to see strength"
            showStrengthMeter
            onStrengthChange={setStrength}
            description="Use 8+ characters with uppercase, numbers, and symbols"
          />
          <PasswordComponent
            label="With custom labels"
            placeholder="Custom strength labels"
            showStrengthMeter
            strengthLabels={['', 'Too short', 'Needs work', 'Almost there', 'Excellent']}
          />
        </div>
      </section>

      {/* ── States & Sizes ─────────────────────────────── */}
      <section className="pw-page__section" id="states">
        <h2 className="pw-page__section-title"><a href="#states">States & Sizes</a></h2>
        <p className="pw-page__section-desc">
          Error, disabled, required, and size variations rendered with the current tier.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <PasswordComponent label="Extra Small" size="xs" placeholder="xs" />
          <PasswordComponent label="Small" size="sm" placeholder="sm" />
          <PasswordComponent label="Medium (default)" size="md" placeholder="md" />
          <PasswordComponent label="Large" size="lg" placeholder="lg" />
          <PasswordComponent label="Extra Large" size="xl" placeholder="xl" />
        </div>
        <div className="pw-page__preview pw-page__preview--col" style={{ marginBlockStart: '1rem' }}>
          <PasswordComponent label="With error" error="Password is too weak" placeholder="Weak password" />
          <PasswordComponent label="Disabled" disabled placeholder="Disabled" />
          <PasswordComponent label="Required" required placeholder="Required field" />
        </div>
      </section>

      {/* ── Playground ─────────────────────────────────── */}
      <PlaygroundSection tier={effectiveTier} />

      {/* ── Accessibility ──────────────────────────────── */}
      <section className="pw-page__section" id="accessibility">
        <h2 className="pw-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="pw-page__section-desc">
          PasswordInput follows WAI-ARIA best practices for form fields.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <ul style={{ listStyleType: 'disc', paddingInlineStart: '1.5rem', color: 'var(--text-secondary)', fontSize: 'var(--text-sm, 0.875rem)', lineHeight: 1.8 }}>
            <li>Label is auto-associated via <code>htmlFor</code> and <code>id</code></li>
            <li>Toggle button has <code>aria-label="Toggle password visibility"</code></li>
            <li>Error messages linked via <code>aria-describedby</code> and <code>aria-invalid</code></li>
            <li>Strength meter uses <code>role="meter"</code> with <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code></li>
            <li>Respects <code>prefers-reduced-motion</code> at all tiers</li>
            <li>Focus ring visible in forced-colors mode</li>
            <li>Minimum 44px touch target on the toggle button</li>
          </ul>
        </div>
      </section>

      {/* ── Weight Tiers ──────────────────────────────────── */}
      <section className="pw-page__section" id="tiers">
        <h2 className="pw-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="pw-page__section-desc">
          Three weight tiers, each with the same API but different motion and visual fidelity.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with motion, theming, and accessibility. ~2.4KB JS gzip, ~0.8KB CSS gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} PasswordInput {'}'} from '@annondeveloper/ui-kit'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal footprint, no motion or advanced theming. ~1.2KB JS gzip, ~0.5KB CSS gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} PasswordInput {'}'} from '@annondeveloper/ui-kit/lite'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow, spring animations, and shimmer effects. ~3.8KB JS gzip, ~1.2KB CSS gzip.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} PasswordInput {'}'} from '@annondeveloper/ui-kit/premium'</code>
          </Card>
        </div>

        <div className="pw-page__preview pw-page__preview--col" style={{ marginBlockStart: '1rem' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
            Currently rendering: <strong>{effectiveTier}</strong> tier
          </p>
          <PasswordComponent label={`${effectiveTier} tier preview`} placeholder="Type here" showStrengthMeter />
        </div>
      </section>

      {/* ── Brand Color ──────────────────────────────────── */}
      <section className="pw-page__section" id="brand-color">
        <h2 className="pw-page__section-title"><a href="#brand-color">Brand Color Theming</a></h2>
        <p className="pw-page__section-desc">
          PasswordInput inherits the <code>--brand</code> CSS custom property for focus rings,
          strength meter colors, and premium aurora glow. Set it on a parent element or via the UIProvider.
        </p>
        <div className="pw-page__preview pw-page__preview--col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Brand Color:
            </label>
            <input
              type="color"
              defaultValue="#6366f1"
              style={{ blockSize: '2rem', inlineSize: '3rem', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              onChange={(e) => {
                const section = document.getElementById('brand-color')
                if (section) section.style.setProperty('--brand', e.target.value)
              }}
            />
          </div>
          <PasswordComponent label="Themed password" placeholder="Focus to see brand color" showStrengthMeter />
        </div>
      </section>

      {/* ── Source Code ──────────────────────────────────── */}
      <section className="pw-page__section" id="source">
        <h2 className="pw-page__section-title"><a href="#source">Source Code</a></h2>
        <p className="pw-page__section-desc">
          View the implementation source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/password-input.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--brand, oklch(65% 0.2 270))' }}
          >
            Source: components/password-input.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/password-input.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--brand, oklch(65% 0.2 270))' }}
          >
            Source: lite/password-input.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/password-input.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--brand, oklch(65% 0.2 270))' }}
          >
            Source: premium/password-input.tsx
          </a>
        </div>
      </section>

      {/* ── Props ──────────────────────────────────────── */}
      <section className="pw-page__section" id="props">
        <h2 className="pw-page__section-title"><a href="#props">Props</a></h2>
        <p className="pw-page__section-desc">
          All props accepted by PasswordInput. Also accepts native div attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={pwProps} />
        </Card>
      </section>
    </div>
  )
}
