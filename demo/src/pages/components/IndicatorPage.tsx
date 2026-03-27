'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Indicator } from '@ui/components/indicator'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

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

  const [copied, setCopied] = useState(false)

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

      {/* ── 4. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Indicator.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
