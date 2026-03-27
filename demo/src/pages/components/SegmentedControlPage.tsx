'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { SegmentedControl } from '@ui/components/segmented-control'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'segmented-control-page'

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
        gap: 1.25rem;
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

      .${PAGE}__preview--col {
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
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
  { name: 'data', type: 'string[] | SegmentedControlOption[]', required: true, description: 'Array of segment options (strings or objects with value, label, icon, disabled).' },
  { name: 'value', type: 'string', description: 'Controlled selected value.' },
  { name: 'defaultValue', type: 'string', description: 'Initial value for uncontrolled usage.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when the selection changes.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Size of the control and its segments.' },
  { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Whether the control stretches to fill its container.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the segments.' },
  { name: 'color', type: 'string', description: 'Brand color override for the sliding indicator.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all segments.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the control non-interactive but visually active.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity for the sliding indicator animation.' },
]

const IMPORT = "import { SegmentedControl } from '@ui/components/segmented-control'"

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

// ─── Component ───────────────────────────────────────────────────────────────

export default function SegmentedControlPage() {
  useStyles('segmented-control-page', pageStyles)

  const [copied, setCopied] = useState(false)
  const [view, setView] = useState('list')
  const [framework, setFramework] = useState('react')
  const [orientation, setOrientation] = useState('horizontal')

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
        <h1 className={`${PAGE}__title`}>Segmented Control</h1>
        <p className={`${PAGE}__desc`}>
          Inline toggle for switching between a small number of options. Features a smooth sliding
          indicator, horizontal and vertical layouts, and keyboard navigation.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Orientation ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="orientation">
        <h2 className={`${PAGE}__section-title`}><a href="#orientation">Orientation</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Segmented controls can be laid out horizontally (default) or vertically.
          The sliding indicator animates along the appropriate axis.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl data={['List', 'Grid', 'Board']} value={view} onChange={setView} />
            <span className={`${PAGE}__item-label`}>horizontal (default)</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl
              data={['Overview', 'Analytics', 'Reports']}
              orientation="vertical"
              value={orientation}
              onChange={setOrientation}
            />
            <span className={`${PAGE}__item-label`}>vertical</span>
          </div>
        </div>
      </section>

      {/* ── 2. Sizes & Full Width ────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes & Full Width</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five sizes from xs to xl. Enable fullWidth to stretch the control to fill its container.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          {SIZES.map(s => (
            <div key={s} className={`${PAGE}__labeled-item`}>
              <SegmentedControl data={['React', 'Vue', 'Svelte']} defaultValue="React" size={s} />
              <span className={`${PAGE}__item-label`}>{s}</span>
            </div>
          ))}
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl
              data={['Day', 'Week', 'Month', 'Year']}
              defaultValue="Week"
              fullWidth
            />
            <span className={`${PAGE}__item-label`}>fullWidth</span>
          </div>
        </div>
      </section>

      {/* ── 3. States ────────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="states">
        <h2 className={`${PAGE}__section-title`}><a href="#states">States</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Disabled and read-only states prevent interaction. Individual segments can also be disabled.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl data={['Active', 'Paused', 'Stopped']} defaultValue="Active" disabled />
            <span className={`${PAGE}__item-label`}>disabled</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl data={['Active', 'Paused', 'Stopped']} defaultValue="Active" readOnly />
            <span className={`${PAGE}__item-label`}>readOnly</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <SegmentedControl
              data={[
                { value: 'on', label: 'On' },
                { value: 'standby', label: 'Standby', disabled: true },
                { value: 'off', label: 'Off' },
              ]}
              defaultValue="on"
            />
            <span className={`${PAGE}__item-label`}>individual segment disabled</span>
          </div>
        </div>
      </section>

      {/* ── 4. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>
          All available props for SegmentedControl.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
