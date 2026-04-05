'use client'

import { useState, useMemo, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Indicator } from '@ui/components/indicator'
import { Indicator as LiteIndicator } from '@ui/lite/indicator'
import { Indicator as PremiumIndicator } from '@ui/premium/indicator'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'indicator-page'

const pageStyles = css`
  @layer demo {
    @scope (.${PAGE}) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ${PAGE};
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .${PAGE}__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .${PAGE}__hero::before {
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
        .${PAGE}__hero::before { animation: none; }
      }

      .${PAGE}__title {
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

      .${PAGE}__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .${PAGE}__import-code {
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

      .${PAGE}__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .${PAGE}__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .${PAGE}__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .${PAGE}__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .${PAGE}__section-title a { color: inherit; text-decoration: none; }
      .${PAGE}__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .${PAGE}__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .${PAGE}__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 2.5rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .${PAGE}__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__avatar-placeholder {
        inline-size: 48px;
        block-size: 48px;
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-tertiary);
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Playground ─────────────────────────────────── */

      .${PAGE}__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      @container ${PAGE} (max-width: 640px) {
        .${PAGE}__playground {
          grid-template-columns: 1fr;
        }
      }

      .${PAGE}__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .${PAGE}__playground-result {
        position: relative;
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-block-size: 120px;
        overflow: hidden;
      }

      .${PAGE}__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .${PAGE}__control-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__control-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        font-weight: 600;
        min-inline-size: 5.5rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .${PAGE}__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .${PAGE}__control-chip {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
      }

      .${PAGE}__control-chip[data-active="true"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__control-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__code-tabs {
        margin-block-start: 0.5rem;
      }

      .${PAGE}__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-end: 0.5rem;
      }

      .${PAGE}__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-ok, oklch(72% 0.19 155));
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'The element to attach the indicator to.' },
  { name: 'label', type: 'ReactNode', description: 'Text or number to display inside the indicator dot (makes it a badge).' },
  { name: 'color', type: "'primary' | 'success' | 'warning' | 'danger' | 'info'", default: "'primary'", description: 'Color of the indicator dot.' },
  { name: 'position', type: "'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'", default: "'top-end'", description: 'Placement of the indicator relative to the child.' },
  { name: 'size', type: 'number', default: '10', description: 'Diameter of the indicator dot in pixels.' },
  { name: 'offset', type: 'number', default: '0', description: 'Offset from the corner in pixels.' },
  { name: 'processing', type: 'boolean', default: 'false', description: 'Shows a pulsing animation to indicate activity.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Hides the indicator when true.' },
  { name: 'inline', type: 'boolean', default: 'false', description: 'Renders the indicator inline rather than absolutely positioned.' },
  { name: 'withBorder', type: 'boolean', default: 'false', description: 'Adds a border ring around the indicator dot.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT = "import { Indicator } from '@ui/components/indicator'"
const COLORS = ['primary', 'success', 'warning', 'danger', 'info'] as const
const POSITIONS = ['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const

// ─── Component ───────────────────────────────────────────────────────────────

function AvatarBox() {
  return (
    <div className={`${PAGE}__avatar-placeholder`}>
      <Icon name="user" size="md" />
    </div>
  )
}

export default function IndicatorPage() {
  useStyles('indicator-page', pageStyles)
  const { tier } = useTier()

  const [copied, setCopied] = useState(false)
  const [brandColor, setBrandColor] = useState('#6366f1')

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Indicator</h1>
        <p className={`${PAGE}__desc`}>
          Status dot overlay for avatars, icons, and other elements. Supports notification
          counts, processing pulse animation, and four corner positions.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Positions & Colors ────────────────────────── */}
      <section className={`${PAGE}__section`} id="positions">
        <h2 className={`${PAGE}__section-title`}><a href="#positions">Positions & Colors</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Four corner positions combined with five semantic colors. The indicator
          dot is absolutely positioned relative to its child element.
        </p>
        <div className={`${PAGE}__preview`}>
          {POSITIONS.map(pos => (
            <div key={pos} className={`${PAGE}__labeled-item`}>
              <Indicator position={pos} color="primary">
                <AvatarBox />
              </Indicator>
              <span className={`${PAGE}__item-label`}>{pos}</span>
            </div>
          ))}
        </div>
        <div className={`${PAGE}__preview`} style={{ marginBlockStart: '1rem' }}>
          {COLORS.map(c => (
            <div key={c} className={`${PAGE}__labeled-item`}>
              <Indicator color={c}>
                <AvatarBox />
              </Indicator>
              <span className={`${PAGE}__item-label`}>{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Processing & Labels ───────────────────────── */}
      <section className={`${PAGE}__section`} id="processing">
        <h2 className={`${PAGE}__section-title`}><a href="#processing">Processing & Labels</a></h2>
        <p className={`${PAGE}__section-desc`}>
          The processing prop adds a pulsing ring animation. Labels turn the indicator
          into a notification badge that can display counts or short text.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator processing color="success">
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>processing</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator processing color="danger">
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>processing danger</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator label={3} color="danger" size={18}>
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>count label</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator label="new" color="primary" size={20}>
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>text label</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator label={99} color="danger" size={20} withBorder>
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>with border</span>
          </div>
        </div>
      </section>

      {/* ── 3. Disabled & Inline ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="states">
        <h2 className={`${PAGE}__section-title`}><a href="#states">Disabled & Inline</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Disabled hides the indicator without removing it from the DOM.
          Inline mode renders the dot in document flow rather than absolutely positioned.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator disabled>
              <AvatarBox />
            </Indicator>
            <span className={`${PAGE}__item-label`}>disabled (hidden)</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator color="success" inline>
              <span style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-primary)' }}>Online</span>
            </Indicator>
            <span className={`${PAGE}__item-label`}>inline</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <Indicator color="danger" inline processing>
              <span style={{ fontSize: 'var(--text-sm, 0.875rem)', color: 'var(--text-primary)' }}>Recording</span>
            </Indicator>
            <span className={`${PAGE}__item-label`}>inline + processing</span>
          </div>
        </div>
      </section>

      {/* ── Weight Tiers ──────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="tiers">
        <h2 className={`${PAGE}__section-title`}>Weight Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: tier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with motion, theming, and accessibility.
            </p>
            <div className={`${PAGE}__preview`} style={{ minBlockSize: 'auto', padding: '0.75rem', justifyContent: 'flex-start', gap: '0.75rem' }}>
              <Indicator color="primary" processing>
                <AvatarBox />
              </Indicator>
            </div>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>~1.8 KB gzip (JS) + ~0.4 KB gzip (CSS)</p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Indicator {'}'} from '@annondeveloper/ui-kit'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal footprint, no motion or advanced theming.
            </p>
            <div className={`${PAGE}__preview`} style={{ minBlockSize: 'auto', padding: '0.75rem', justifyContent: 'flex-start', gap: '0.75rem' }}>
              <LiteIndicator color="success">
                <AvatarBox />
              </LiteIndicator>
            </div>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>~0.5 KB gzip (JS) + ~0.3 KB gzip (CSS)</p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Indicator {'}'} from '@annondeveloper/ui-kit/lite'</code>
          </Card>
          <Card padding="sm" style={{ borderColor: tier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow, spring animations, and shimmer effects.
            </p>
            <div className={`${PAGE}__preview`} style={{ minBlockSize: 'auto', padding: '0.75rem', justifyContent: 'flex-start', gap: '0.75rem' }}>
              <PremiumIndicator color="danger" label={5} size={18} withBorder>
                <AvatarBox />
              </PremiumIndicator>
            </div>
            <p className="size-row" style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', margin: '0.25rem 0 0' }}>~2.1 KB gzip (JS) + ~0.5 KB gzip (CSS)</p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Indicator {'}'} from '@annondeveloper/ui-kit/premium'</code>
          </Card>
        </div>
      </section>

      {/* ── 4. Interactive Playground ─────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 5. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Indicator.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="brand-color">
        <h2 className={`${PAGE}__section-title`}><a href="#brand-color">Brand Color</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Pick a brand color to preview the component with your brand identity.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ColorInput
            name="brand-color"
            value={brandColor}
            onChange={setBrandColor}
            size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']}
          />
        </div>
      </section>

      {/* ── Source ──────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="source">
        <h2 className={`${PAGE}__section-title`}><a href="#source">Source</a></h2>
        <p className={`${PAGE}__section-desc`}>View the full component source code on GitHub.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/indicator.tsx" target="_blank" rel="noopener noreferrer">
            src/components/indicator.tsx (Standard)
          </a>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/indicator.tsx" target="_blank" rel="noopener noreferrer">
            src/lite/indicator.tsx (Lite)
          </a>
          <a style={{ color: 'var(--brand)', textDecoration: 'none' }} href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/indicator.tsx" target="_blank" rel="noopener noreferrer">
            src/premium/indicator.tsx (Premium)
          </a>
        </div>
      </section>
    </div>
  )
}

// ─── Code Generators ──────────────────────────────────────────────────────────

type Color = typeof COLORS[number]
type Position = typeof POSITIONS[number]

function generateReactCode(
  tier: Tier,
  color: Color,
  position: Position,
  size: number,
  processing: boolean,
  withBorder: boolean,
  disabled: boolean,
  label: string,
  motion: number,
): string {
  const importPath = tier === 'lite'
    ? "@annondeveloper/ui-kit/lite"
    : tier === 'premium'
      ? "@annondeveloper/ui-kit/premium"
      : "@annondeveloper/ui-kit"
  const importLine = `import { Indicator } from '${importPath}'`

  const props: string[] = []
  if (color !== 'primary') props.push(`  color="${color}"`)
  if (position !== 'top-end') props.push(`  position="${position}"`)
  if (size !== 10) props.push(`  size={${size}}`)
  if (processing) props.push('  processing')
  if (withBorder) props.push('  withBorder')
  if (disabled) props.push('  disabled')
  if (label) props.push(`  label="${label}"`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  const jsx = props.length === 0
    ? `<Indicator>\n  <Avatar />\n</Indicator>`
    : `<Indicator\n${props.join('\n')}\n>\n  <Avatar />\n</Indicator>`

  return `${importLine}\n\n${jsx}`
}

function generateHtmlExport(
  tier: Tier,
  color: Color,
  position: Position,
  processing: boolean,
  label: string,
): string {
  const cssImport = tier === 'lite'
    ? `@import '@annondeveloper/ui-kit/lite/styles.css';`
    : `@import '@annondeveloper/ui-kit/css/components/indicator.css';`

  return `<!-- Indicator — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/indicator.css">

<div class="ui-indicator" data-color="${color}" data-position="${position}"${processing ? ' data-processing="true"' : ''}>
  <span class="ui-indicator__dot"${label ? ` data-has-label="true"` : ''}>${label || ''}</span>
  <img class="avatar" src="avatar.jpg" alt="User" />
</div>

<!-- Or import in your CSS: -->
<!-- ${cssImport} -->`
}

function generateVueCode(
  tier: Tier,
  color: Color,
  position: Position,
  processing: boolean,
  label: string,
  disabled: boolean,
): string {
  if (tier === 'lite') {
    const attrs = [`class="ui-indicator"`, `data-color="${color}"`, `data-position="${position}"`]
    if (processing) attrs.push('data-processing="true"')
    if (disabled) attrs.push('data-disabled="true"')
    return `<template>\n  <div ${attrs.join(' ')}>\n    <span class="ui-indicator__dot"${label ? ` data-has-label="true"` : ''}>${label || ''}</span>\n    <slot />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (color !== 'primary') attrs.push(`  color="${color}"`)
  if (position !== 'top-end') attrs.push(`  position="${position}"`)
  if (processing) attrs.push('  processing')
  if (disabled) attrs.push('  disabled')
  if (label) attrs.push(`  label="${label}"`)

  const template = attrs.length === 0
    ? `  <Indicator>\n    <Avatar />\n  </Indicator>`
    : `  <Indicator\n  ${attrs.join('\n  ')}\n  >\n    <Avatar />\n  </Indicator>`

  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { Indicator } from '${importPath}'\n</script>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [color, setColor] = useState<Color>('primary')
  const [position, setPosition] = useState<Position>('top-end')
  const [size, setSize] = useState(10)
  const [processing, setProcessing] = useState(false)
  const [withBorder, setWithBorder] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [label, setLabel] = useState('')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const [copyStatus, setCopyStatus] = useState('')

  const IndicatorComponent = tier === 'lite' ? LiteIndicator : tier === 'premium' ? PremiumIndicator : Indicator

  const reactCode = useMemo(
    () => generateReactCode(tier, color, position, size, processing, withBorder, disabled, label, motion),
    [tier, color, position, size, processing, withBorder, disabled, label, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlExport(tier, color, position, processing, label),
    [tier, color, position, processing, label],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, color, position, processing, label, disabled),
    [tier, color, position, processing, label, disabled],
  )

  const angularCode = useMemo(() => {
    if (tier === 'lite') {
      const attrs = [`class="ui-indicator"`, `data-color="${color}"`, `data-position="${position}"`]
      if (processing) attrs.push('data-processing="true"')
      if (disabled) attrs.push('[attr.data-disabled]="\'true\'"')
      return `<!-- Angular — Lite tier (CSS-only) -->\n<div ${attrs.join(' ')}>\n  <span class="ui-indicator__dot"${label ? ` data-has-label="true"` : ''}>${label || ''}</span>\n  <ng-content />\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
    }
    const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
    return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<div\n  class="ui-indicator"\n  data-color="${color}"\n  data-position="${position}"\n  ${processing ? 'data-processing="true"' : ''}\n  ${disabled ? 'data-disabled="true"' : ''}\n>\n  <span class="ui-indicator__dot"${label ? ` data-has-label="true"` : ''}>${label || ''}</span>\n  <ng-content />\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/indicator.css';`
  }, [color, position, processing, disabled, label, tier])

  const svelteCode = useMemo(() => {
    if (tier === 'lite') {
      return `<!-- Svelte — Lite tier (CSS-only) -->\n<div\n  class="ui-indicator"\n  data-color="${color}"\n  data-position="${position}"\n  ${processing ? 'data-processing="true"' : ''}\n  ${disabled ? 'data-disabled="true"' : ''}\n>\n  <span class="ui-indicator__dot"${label ? ` data-has-label="true"` : ''}>${label || ''}</span>\n  <slot />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
    }
    const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
    return `<script>\n  import { Indicator } from '${importPath}';\n</script>\n\n<Indicator\n  color="${color}"\n  position="${position}"\n  ${processing ? 'processing' : ''}\n  ${disabled ? 'disabled' : ''}\n  ${label ? `label="${label}"` : ''}\n>\n  <slot />\n</Indicator>`
  }, [color, position, processing, disabled, label, tier])

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

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  const indicatorProps: Record<string, unknown> = {
    color,
    position,
    size: label ? size + 8 : size,
    processing,
    withBorder,
    disabled,
  }
  if (label) indicatorProps.label = label
  if (tier !== 'lite') indicatorProps.motion = motion

  return (
    <section className={`${PAGE}__section`} id="playground">
      <h2 className={`${PAGE}__section-title`}>
        <a href="#playground">Live Playground</a>
      </h2>
      <p className={`${PAGE}__section-desc`}>
        Tweak every prop and see the result in real-time. The generated code updates as you change settings.
      </p>

      <div className={`${PAGE}__playground`}>
        {/* Preview area */}
        <div className={`${PAGE}__playground-preview`}>
          <div className={`${PAGE}__playground-result`}>
            <IndicatorComponent {...indicatorProps}>
              <AvatarBox />
            </IndicatorComponent>
          </div>

          {/* Code output with tabs */}
          <div className={`${PAGE}__code-tabs`}>
            <div className={`${PAGE}__export-row`}>
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className={`${PAGE}__export-status`}>{copyStatus}</span>}
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

        {/* Controls */}
        <div className={`${PAGE}__playground-controls`}>
          {/* Color */}
          <div className={`${PAGE}__control-row`}>
            <span className={`${PAGE}__control-label`}>Color</span>
            <div className={`${PAGE}__control-options`}>
              {COLORS.map(c => (
                <button key={c} className={`${PAGE}__control-chip`} data-active={c === color} onClick={() => setColor(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div className={`${PAGE}__control-row`}>
            <span className={`${PAGE}__control-label`}>Position</span>
            <div className={`${PAGE}__control-options`}>
              {POSITIONS.map(p => (
                <button key={p} className={`${PAGE}__control-chip`} data-active={p === position} onClick={() => setPosition(p)}>{p}</button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className={`${PAGE}__control-row`}>
            <span className={`${PAGE}__control-label`}>Size</span>
            <div className={`${PAGE}__control-options`}>
              {[6, 8, 10, 14, 18].map(s => (
                <button key={s} className={`${PAGE}__control-chip`} data-active={s === size} onClick={() => setSize(s)}>{s}px</button>
              ))}
            </div>
          </div>

          {/* Motion Level */}
          {tier !== 'lite' && (
            <div className={`${PAGE}__control-row`}>
              <span className={`${PAGE}__control-label`}>Motion Level</span>
              <div className={`${PAGE}__control-options`}>
                {([0, 1, 2, 3] as const).map(m => (
                  <button key={m} className={`${PAGE}__control-chip`} data-active={m === motion} onClick={() => setMotion(m)}>{m}</button>
                ))}
              </div>
            </div>
          )}

          {/* Label */}
          <div className={`${PAGE}__control-row`}>
            <span className={`${PAGE}__control-label`}>Label</span>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. 3, new, 99+"
              style={{
                fontSize: 'var(--text-sm, 0.875rem)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-base)',
                color: 'var(--text-primary)',
                inlineSize: '8rem',
              }}
            />
          </div>

          {/* Toggles */}
          <div className={`${PAGE}__control-row`}>
            <span className={`${PAGE}__control-label`}>Toggles</span>
            <div className={`${PAGE}__control-options`}>
              <label className={`${PAGE}__control-toggle`}>
                <input type="checkbox" checked={processing} onChange={e => setProcessing(e.target.checked)} />
                <span style={{ fontSize: 'var(--text-xs, 0.75rem)' }}>Processing</span>
              </label>
              <label className={`${PAGE}__control-toggle`}>
                <input type="checkbox" checked={withBorder} onChange={e => setWithBorder(e.target.checked)} />
                <span style={{ fontSize: 'var(--text-xs, 0.75rem)' }}>Border</span>
              </label>
              <label className={`${PAGE}__control-toggle`}>
                <input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />
                <span style={{ fontSize: 'var(--text-xs, 0.75rem)' }}>Disabled</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
