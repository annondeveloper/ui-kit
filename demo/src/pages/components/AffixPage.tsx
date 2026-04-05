'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Affix } from '@ui/components/affix'
import { Affix as LiteAffix } from '@ui/lite/affix'
import { Affix as PremiumAffix } from '@ui/premium/affix'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.affix-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: affix-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .affix-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .affix-page__hero::before {
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
        animation: aurora-spin-af 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-af {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .affix-page__hero::before { animation: none; }
      }

      .affix-page__title {
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

      .affix-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .affix-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .affix-page__import-code {
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

      .affix-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .affix-page__section {
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
        animation: section-reveal-af 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-af {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .affix-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .affix-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .affix-page__section-title a { color: inherit; text-decoration: none; }
      .affix-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .affix-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .affix-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .affix-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .affix-page__position-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        inline-size: 100%;
      }

      @container affix-page (max-width: 480px) {
        .affix-page__position-grid {
          grid-template-columns: 1fr;
        }
      }

      .affix-page__position-cell {
        padding: 1.5rem;
        border: 1px dashed var(--border-default);
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        background: var(--bg-surface);
      }

      .affix-page__position-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .affix-page__hint {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        text-align: center;
        font-style: italic;
      }

      /* ── Playground ─────────────────────────────────── */

      .affix-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container affix-page (max-width: 640px) {
        .affix-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .affix-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .affix-page__playground-result {
        min-block-size: 120px;
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        border: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .affix-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .affix-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.875rem;
        padding: 1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      .affix-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .affix-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .affix-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .affix-page__option-btn {
        appearance: none;
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-secondary);
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .affix-page__option-btn:hover {
        border-color: var(--brand);
        color: var(--text-primary);
      }

      .affix-page__option-btn--active {
        background: var(--brand);
        color: white;
        border-color: var(--brand);
      }

      .affix-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        cursor: pointer;
      }

      .affix-page__number-input {
        appearance: none;
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-primary);
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        inline-size: 80px;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      /* ── Tier cards ─────────────────────────────────── */

      .affix-page__tier-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;
      }

      .affix-page__size-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        margin-block-start: 0.5rem;
        padding-block-start: 0.5rem;
        border-block-start: 1px solid var(--border-subtle);
      }

      /* ── Accessibility ──────────────────────────────── */

      .affix-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .affix-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .affix-page__a11y-icon {
        color: oklch(72% 0.19 152);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .affix-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.8em;
        background: oklch(0% 0 0 / 0.1);
        padding: 0.1em 0.35em;
        border-radius: var(--radius-sm);
      }

      /* ── Source link ────────────────────────────────── */

      .affix-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: none;
      }

      .affix-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Affix } from '@annondeveloper/ui-kit'",
  lite: "import { Affix } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Affix } from '@annondeveloper/ui-kit/premium'",
}

const propsData: PropDef[] = [
  { name: 'position', type: '{ top?: number; bottom?: number; left?: number; right?: number }', default: '{ bottom: 20, right: 20 }', description: 'Fixed position offsets in pixels.' },
  { name: 'zIndex', type: 'number', default: '100', description: 'CSS z-index for the fixed container.' },
  { name: 'withinPortal', type: 'boolean', default: 'false', description: 'Render inside a portal to escape parent stacking contexts.' },
  { name: 'target', type: 'React.RefObject<HTMLElement>', description: 'Link target element.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to render in the fixed position.' },
  { name: 'className', type: 'string', description: 'Additional CSS class names.' },
  { name: 'style', type: 'React.CSSProperties', description: 'Inline styles merged with position styles.' },
]

const POSITIONS = [
  { label: 'top-left', pos: { top: 20, left: 20 } },
  { label: 'top-right', pos: { top: 20, right: 20 } },
  { label: 'bottom-left', pos: { bottom: 20, left: 20 } },
  { label: 'bottom-right', pos: { bottom: 20, right: 20 } },
] as const

type PositionKey = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="affix-page__copy-btn"
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
    <div className="affix-page__control-group">
      <span className="affix-page__control-label">{label}</span>
      <div className="affix-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`affix-page__option-btn${opt === value ? ' affix-page__option-btn--active' : ''}`}
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
    <label className="affix-page__toggle-label">
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
  positionKey: PositionKey,
  top: number,
  bottom: number,
  left: number,
  right: number,
  zIndex: number,
  withinPortal: boolean,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const pos = positionKey === 'custom'
    ? `{ top: ${top}, left: ${left} }`
    : positionKey === 'top-left'
      ? '{ top: 20, left: 20 }'
      : positionKey === 'top-right'
        ? '{ top: 20, right: 20 }'
        : positionKey === 'bottom-left'
          ? '{ bottom: 20, left: 20 }'
          : '{ bottom: 20, right: 20 }'

  const props: string[] = [`  position={${pos}}`]
  if (zIndex !== 100) props.push(`  zIndex={${zIndex}}`)
  if (withinPortal) props.push('  withinPortal')

  return `${importStr}

<Affix
${props.join('\n')}
>
  <button>Scroll to top</button>
</Affix>`
}

function generateHtmlCode(
  positionKey: PositionKey,
  top: number,
  bottom: number,
  left: number,
  right: number,
  zIndex: number,
): string {
  let posStyle: string
  if (positionKey === 'custom') {
    posStyle = `top: ${top}px; left: ${left}px;`
  } else if (positionKey === 'top-left') {
    posStyle = 'top: 20px; left: 20px;'
  } else if (positionKey === 'top-right') {
    posStyle = 'top: 20px; right: 20px;'
  } else if (positionKey === 'bottom-left') {
    posStyle = 'bottom: 20px; left: 20px;'
  } else {
    posStyle = 'bottom: 20px; right: 20px;'
  }

  return `<!-- Affix — pure HTML+CSS equivalent -->
<div class="ui-affix" style="
  position: fixed;
  ${posStyle}
  z-index: ${zIndex};
">
  <button>Scroll to top</button>
</div>

<style>
.ui-affix {
  position: fixed;
  z-index: var(--z-sticky, ${zIndex});
}

@media print {
  .ui-affix { display: none; }
}

@media (forced-colors: active) {
  .ui-affix { border: 1px solid ButtonText; }
}
</style>`
}

function generateVueCode(
  tier: Tier,
  positionKey: PositionKey,
  top: number,
  bottom: number,
  left: number,
  right: number,
  zIndex: number,
  withinPortal: boolean,
): string {
  if (tier === 'lite') {
    let posStyle: string
    if (positionKey === 'custom') {
      posStyle = `top: ${top}px; left: ${left}px;`
    } else if (positionKey === 'top-left') {
      posStyle = 'top: 20px; left: 20px;'
    } else if (positionKey === 'top-right') {
      posStyle = 'top: 20px; right: 20px;'
    } else if (positionKey === 'bottom-left') {
      posStyle = 'bottom: 20px; left: 20px;'
    } else {
      posStyle = 'bottom: 20px; right: 20px;'
    }
    return `<template>
  <div class="ui-affix" style="${posStyle} z-index: ${zIndex};">
    <button>Scroll to top</button>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/css/components/affix.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const posObj = positionKey === 'custom'
    ? `{ top: ${top}, left: ${left} }`
    : positionKey === 'top-left'
      ? '{ top: 20, left: 20 }'
      : positionKey === 'top-right'
        ? '{ top: 20, right: 20 }'
        : positionKey === 'bottom-left'
          ? '{ bottom: 20, left: 20 }'
          : '{ bottom: 20, right: 20 }'

  const attrs: string[] = [`:position="${posObj}"`]
  if (zIndex !== 100) attrs.push(`:z-index="${zIndex}"`)
  if (withinPortal) attrs.push('within-portal')

  return `<template>
  <Affix
    ${attrs.join('\n    ')}
  >
    <button>Scroll to top</button>
  </Affix>
</template>

<script setup>
import { Affix } from '${importPath}'
</script>`
}

function generateAngularCode(
  tier: Tier,
  positionKey: PositionKey,
  top: number,
  bottom: number,
  left: number,
  right: number,
  zIndex: number,
): string {
  let posStyle: string
  if (positionKey === 'custom') {
    posStyle = `top: ${top}px; left: ${left}px;`
  } else if (positionKey === 'top-left') {
    posStyle = 'top: 20px; left: 20px;'
  } else if (positionKey === 'top-right') {
    posStyle = 'top: 20px; right: 20px;'
  } else if (positionKey === 'bottom-left') {
    posStyle = 'bottom: 20px; left: 20px;'
  } else {
    posStyle = 'bottom: 20px; right: 20px;'
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'

  return `<!-- Angular — ${tier === 'lite' ? 'Lite' : tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- Use the CSS-only approach for framework compatibility -->
<div
  class="ui-affix"
  style="position: fixed; ${posStyle} z-index: ${zIndex};"
>
  <button>Scroll to top</button>
</div>

/* In styles.css */
@import '${importPath}/css/components/affix.css';`
}

function generateSvelteCode(
  tier: Tier,
  positionKey: PositionKey,
  top: number,
  bottom: number,
  left: number,
  right: number,
  zIndex: number,
): string {
  if (tier === 'lite') {
    let posStyle: string
    if (positionKey === 'custom') {
      posStyle = `top: ${top}px; left: ${left}px;`
    } else if (positionKey === 'top-left') {
      posStyle = 'top: 20px; left: 20px;'
    } else if (positionKey === 'top-right') {
      posStyle = 'top: 20px; right: 20px;'
    } else if (positionKey === 'bottom-left') {
      posStyle = 'bottom: 20px; left: 20px;'
    } else {
      posStyle = 'bottom: 20px; right: 20px;'
    }
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-affix" style="position: fixed; ${posStyle} z-index: ${zIndex};">
  <button>Scroll to top</button>
</div>

<style>
  @import '@annondeveloper/ui-kit/css/components/affix.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const posObj = positionKey === 'custom'
    ? `{{ top: ${top}, left: ${left} }}`
    : positionKey === 'top-left'
      ? '{{ top: 20, left: 20 }}'
      : positionKey === 'top-right'
        ? '{{ top: 20, right: 20 }}'
        : positionKey === 'bottom-left'
          ? '{{ bottom: 20, left: 20 }}'
          : '{{ bottom: 20, right: 20 }}'

  return `<script>
  import { Affix } from '${importPath}';
</script>

<Affix
  position={${posObj}}
  zIndex={${zIndex}}
>
  <button>Scroll to top</button>
</Affix>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier }: { tier: Tier }) {
  const [positionKey, setPositionKey] = useState<PositionKey>('bottom-right')
  const [top, setTop] = useState(20)
  const [bottom, setBottom] = useState(20)
  const [left, setLeft] = useState(20)
  const [right, setRight] = useState(20)
  const [zIndex, setZIndex] = useState(100)
  const [withinPortal, setWithinPortal] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const AffixComponent = tier === 'lite' ? LiteAffix : tier === 'premium' ? PremiumAffix : Affix

  const positionProp = useMemo(() => {
    if (positionKey === 'custom') return { top, left }
    const entry = POSITIONS.find(p => p.label === positionKey)
    return entry ? { ...entry.pos } : { bottom: 20, right: 20 }
  }, [positionKey, top, left, bottom, right])

  const reactCode = useMemo(
    () => generateReactCode(tier, positionKey, top, bottom, left, right, zIndex, withinPortal),
    [tier, positionKey, top, bottom, left, right, zIndex, withinPortal],
  )

  const htmlCssCode = useMemo(
    () => generateHtmlCode(positionKey, top, bottom, left, right, zIndex),
    [positionKey, top, bottom, left, right, zIndex],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, positionKey, top, bottom, left, right, zIndex, withinPortal),
    [tier, positionKey, top, bottom, left, right, zIndex, withinPortal],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, positionKey, top, bottom, left, right, zIndex),
    [tier, positionKey, top, bottom, left, right, zIndex],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, positionKey, top, bottom, left, right, zIndex),
    [tier, positionKey, top, bottom, left, right, zIndex],
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
    <section className="affix-page__section" id="playground">
      <h2 className="affix-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="affix-page__section-desc">
        Configure the Affix component and see generated code for all frameworks. The affixed element
        renders fixed to the viewport — look in the specified corner.
      </p>

      <div className="affix-page__playground">
        {/* Preview + code */}
        <div className="affix-page__playground-preview">
          <div className="affix-page__playground-result">
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                Affix is fixed to the viewport at <strong>{positionKey}</strong> position.
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', margin: '0.5rem 0 0' }}>
                z-index: {zIndex} | portal: {withinPortal ? 'yes' : 'no'}
              </p>
            </div>
          </div>

          {/* Tabbed code output */}
          <div>
            <Tabs
              tabs={codeTabs}
              activeTab={activeCodeTab}
              onTabChange={setActiveCodeTab}
              size="sm"
            >
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="tsx" showLineNumbers />
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
        <div className="affix-page__playground-controls">
          <OptionGroup
            label="Position"
            options={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'custom'] as const}
            value={positionKey}
            onChange={setPositionKey}
          />

          {positionKey === 'custom' && (
            <>
              <div className="affix-page__control-group">
                <span className="affix-page__control-label">Top (px)</span>
                <input
                  type="number"
                  value={top}
                  onChange={e => setTop(Number(e.target.value))}
                  className="affix-page__number-input"
                  min={0}
                />
              </div>
              <div className="affix-page__control-group">
                <span className="affix-page__control-label">Left (px)</span>
                <input
                  type="number"
                  value={left}
                  onChange={e => setLeft(Number(e.target.value))}
                  className="affix-page__number-input"
                  min={0}
                />
              </div>
            </>
          )}

          <div className="affix-page__control-group">
            <span className="affix-page__control-label">z-index</span>
            <input
              type="number"
              value={zIndex}
              onChange={e => setZIndex(Number(e.target.value))}
              className="affix-page__number-input"
              min={0}
            />
          </div>

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="affix-page__control-group">
            <span className="affix-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Within portal" checked={withinPortal} onChange={setWithinPortal} />
            </div>
          </div>
        </div>
      </div>

      {/* Live affix element */}
      <AffixComponent position={positionProp} zIndex={zIndex} withinPortal={withinPortal}>
        <Button size="sm" variant="secondary">
          <Icon name="arrow-up" size="sm" /> Top
        </Button>
      </AffixComponent>
    </section>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AffixPage() {
  useStyles('affix-page', pageStyles)
  const { tier } = useTier()

  const AffixComponent = tier === 'lite' ? LiteAffix : tier === 'premium' ? PremiumAffix : Affix

  // Scroll reveal — JS fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.affix-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="affix-page">
      {/* ── 1. Hero ──────────────────────────────────── */}
      <div className="affix-page__hero">
        <h1 className="affix-page__title">Affix</h1>
        <p className="affix-page__desc">
          Fix any content to a specific position in the viewport. Uses CSS <code>position: fixed</code> with
          optional portal rendering to escape parent stacking contexts. Ships in three weight tiers
          from 0.4KB lite to 0.5KB premium. Inherits the current brand color for child theming.
        </p>
        <div className="affix-page__import-row">
          <code className="affix-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Position Grid ─────────────────────────── */}
      <section className="affix-page__section" id="positions">
        <h2 className="affix-page__section-title"><a href="#positions">Position Options</a></h2>
        <p className="affix-page__section-desc">
          Affix supports any combination of top, right, bottom, and left offsets. Below shows the four
          corner positions — use these as quick presets or provide custom pixel values.
        </p>
        <div className="affix-page__preview">
          <div className="affix-page__position-grid">
            {POSITIONS.map(({ label, pos }) => (
              <div key={label} className="affix-page__position-cell">
                <span className="affix-page__position-label">{label}</span>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {JSON.stringify(pos)}
                </code>
              </div>
            ))}
          </div>
          <p className="affix-page__hint">
            The actual Affix component renders fixed to the viewport. These cells illustrate position values.
          </p>
        </div>
      </section>

      {/* ── 4. Portal Mode ───────────────────────────── */}
      <section className="affix-page__section" id="portal">
        <h2 className="affix-page__section-title"><a href="#portal">Portal Mode</a></h2>
        <p className="affix-page__section-desc">
          When <code>withinPortal</code> is enabled, the affix renders via a React portal into
          <code>document.body</code>, escaping parent overflow hidden, transforms, or stacking
          contexts that could clip or misposition the fixed element.
        </p>
        <div className="affix-page__preview">
          <Card padding="md" style={{ overflow: 'hidden', position: 'relative' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
              This card has <code>overflow: hidden</code>. Without <code>withinPortal</code>, a fixed child
              may still be clipped in certain stacking contexts. The portal approach guarantees correct
              rendering by appending directly to the document body.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 5. z-index Management ────────────────────── */}
      <section className="affix-page__section" id="zindex">
        <h2 className="affix-page__section-title"><a href="#zindex">z-index Management</a></h2>
        <p className="affix-page__section-desc">
          Control stacking order via the <code>zIndex</code> prop. Defaults to <code>100</code> which
          matches the library's <code>--z-sticky</code> token. Use higher values to render above
          overlays and dialogs, or lower values for subtle background affixes.
        </p>
        <div className="affix-page__preview">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[50, 100, 200, 999].map(z => (
              <Card key={z} padding="sm" style={{ textAlign: 'center', minInlineSize: '80px' }}>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{z}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {z === 50 ? 'Below nav' : z === 100 ? 'Default' : z === 200 ? 'Above nav' : 'Above dialogs'}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Weight Tiers ──────────────────────────── */}
      <section className="affix-page__section" id="tiers">
        <h2 className="affix-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="affix-page__section-desc">
          Affix is available in all three weight tiers. Because it is a structural utility with no
          visual effects, all tiers share the same core behavior.
        </p>
        <div className="affix-page__tier-grid">
          <Card padding="sm" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with portal support and ref forwarding.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Affix {'}'} from '@annondeveloper/ui-kit'</code>
            <div className="affix-page__size-row">
              <span>~0.5 KB gzip</span>
              <span>JS + CSS</span>
            </div>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Re-exports standard — identical API, minimal overhead.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Affix {'}'} from '@annondeveloper/ui-kit/lite'</code>
            <div className="affix-page__size-row">
              <span>~0.4 KB gzip</span>
              <span>JS + CSS</span>
            </div>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Re-exports standard — Affix has no motion props to enhance.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Affix {'}'} from '@annondeveloper/ui-kit/premium'</code>
            <div className="affix-page__size-row">
              <span>~0.5 KB gzip</span>
              <span>JS + CSS</span>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. Live Demo ─────────────────────────────── */}
      <section className="affix-page__section" id="live">
        <h2 className="affix-page__section-title"><a href="#live">Live Demo</a></h2>
        <p className="affix-page__section-desc">
          A help button is affixed to the bottom-left of the viewport using the current tier
          ({tier}). Scroll the page to verify it stays fixed.
        </p>
        <div className="affix-page__preview">
          <p className="affix-page__hint">
            Look for the help button in the bottom-left corner of your viewport.
          </p>
        </div>
        <AffixComponent position={{ bottom: 80, left: 20 }}>
          <Button size="sm" variant="secondary">
            <Icon name="help-circle" size="sm" /> Help
          </Button>
        </AffixComponent>
      </section>

      {/* ── 8. Patterns ──────────────────────────────── */}
      <section className="affix-page__section" id="patterns">
        <h2 className="affix-page__section-title"><a href="#patterns">Common Patterns</a></h2>
        <p className="affix-page__section-desc">
          Real-world usage patterns for the Affix component.
        </p>
        <div className="affix-page__preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', inlineSize: '100%' }}>
            <Card padding="sm">
              <strong style={{ fontSize: 'var(--text-sm)' }}>Scroll-to-top button</strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                Position at bottom-right with a scroll listener to show/hide.
              </p>
              <code style={{ fontSize: '0.6875rem', display: 'block', marginBlockStart: '0.5rem', color: 'var(--text-tertiary)' }}>
                {'<Affix position={{ bottom: 20, right: 20 }}>'}
              </code>
            </Card>
            <Card padding="sm">
              <strong style={{ fontSize: 'var(--text-sm)' }}>Floating action button (FAB)</strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                Mobile-style FAB for primary actions, often paired with an ActionIcon.
              </p>
              <code style={{ fontSize: '0.6875rem', display: 'block', marginBlockStart: '0.5rem', color: 'var(--text-tertiary)' }}>
                {'<Affix position={{ bottom: 24, right: 24 }} zIndex={200}>'}
              </code>
            </Card>
            <Card padding="sm">
              <strong style={{ fontSize: 'var(--text-sm)' }}>Cookie consent banner</strong>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                Full-width banner fixed to the bottom of the viewport.
              </p>
              <code style={{ fontSize: '0.6875rem', display: 'block', marginBlockStart: '0.5rem', color: 'var(--text-tertiary)' }}>
                {'<Affix position={{ bottom: 0, left: 0 }}>'}
              </code>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 9. Props API ─────────────────────────────── */}
      <section className="affix-page__section" id="props">
        <h2 className="affix-page__section-title"><a href="#props">Props API</a></h2>
        <p className="affix-page__section-desc">
          All props accepted by the Affix component. It also forwards all native
          <code>HTMLDivElement</code> attributes via rest props.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>

      {/* ── 10. Accessibility ────────────────────────── */}
      <section className="affix-page__section" id="accessibility">
        <h2 className="affix-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="affix-page__section-desc">
          Affix is a structural utility — accessibility depends on the content placed inside it.
          Follow these guidelines to ensure fixed content remains usable.
        </p>
        <ul className="affix-page__a11y-list">
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>Focus order:</strong> Portal-rendered content is appended to <code className="affix-page__a11y-key">document.body</code>, so
              ensure tab order remains logical. Use <code className="affix-page__a11y-key">tabIndex</code> or focus management if needed.
            </span>
          </li>
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>Semantic role:</strong> Add an appropriate <code className="affix-page__a11y-key">role</code> attribute to the child
              (e.g., <code className="affix-page__a11y-key">role="complementary"</code> for a floating sidebar).
            </span>
          </li>
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>Print hidden:</strong> Fixed elements are automatically hidden via <code className="affix-page__a11y-key">@media print</code> to
              avoid overlapping printed content.
            </span>
          </li>
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>High contrast:</strong> Supports <code className="affix-page__a11y-key">forced-colors: active</code> with a visible 1px border
              so the affixed area remains visible in Windows High Contrast mode.
            </span>
          </li>
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>Touch targets:</strong> Ensure interactive children meet the 44px minimum touch target size
              on coarse pointer devices.
            </span>
          </li>
          <li className="affix-page__a11y-item">
            <span className="affix-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
            <span>
              <strong>Reduced motion:</strong> Affix itself applies no animations. If you add transitions
              to children, respect <code className="affix-page__a11y-key">prefers-reduced-motion</code>.
            </span>
          </li>
        </ul>
      </section>

      {/* ── 11. Source ───────────────────────────────── */}
      <section className="affix-page__section" id="source">
        <h2 className="affix-page__section-title"><a href="#source">Source</a></h2>
        <p className="affix-page__section-desc">
          View the component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            className="affix-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/affix.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" /> Source — src/components/affix.tsx
          </a>
          <a
            className="affix-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/affix.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" /> Source — src/lite/affix.tsx
          </a>
          <a
            className="affix-page__source-link"
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/affix.tsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="external-link" size="sm" /> Source — src/premium/affix.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
