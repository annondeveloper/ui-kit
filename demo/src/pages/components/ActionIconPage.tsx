'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ActionIcon } from '@ui/components/action-icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'action-icon-page'

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
        align-items: flex-start;
        gap: 1.5rem;
      }

      .${PAGE}__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }

      .${PAGE}__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
        min-inline-size: 5rem;
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'variant', type: "'filled' | 'light' | 'outline' | 'subtle' | 'transparent'", default: "'filled'", description: 'Visual style variant.' },
  { name: 'color', type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color scheme.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Icon button size. Controls dimensions and icon scale.' },
  { name: 'radius', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Border radius.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner and disables interaction.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
  { name: 'aria-label', type: 'string', required: true, description: 'Required accessible label since the button has no visible text.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Icon element to render inside the button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT = "import { ActionIcon } from '@ui/components/action-icon'"
const VARIANTS = ['filled', 'light', 'outline', 'subtle', 'transparent'] as const
const COLORS = ['default', 'primary', 'success', 'warning', 'danger'] as const
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActionIconPage() {
  useStyles('action-icon-page', pageStyles)

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
        <h1 className={`${PAGE}__title`}>ActionIcon</h1>
        <p className={`${PAGE}__desc`}>
          Icon-only button for toolbars, card actions, and compact controls.
          Requires an aria-label for accessibility since there is no visible text.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Variants & Colors ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="variants">
        <h2 className={`${PAGE}__section-title`}><a href="#variants">Variants & Colors</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five visual variants across five color schemes. Filled and light provide strong visual weight,
          while subtle and transparent blend into surrounding content.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          {VARIANTS.map(v => (
            <div key={v} className={`${PAGE}__row`}>
              <span className={`${PAGE}__label`}>{v}</span>
              {COLORS.map(c => (
                <ActionIcon key={`${v}-${c}`} variant={v} color={c} aria-label={`${v} ${c}`}>
                  <Icon name="settings" size="sm" />
                </ActionIcon>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Sizes & Radius ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="sizes">
        <h2 className={`${PAGE}__section-title`}><a href="#sizes">Sizes & Radius</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Five sizes from xs to xl paired with four border radius options. Use radius "full" for circular buttons.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__row`}>
            <span className={`${PAGE}__label`}>sizes</span>
            {SIZES.map(s => (
              <ActionIcon key={s} size={s} aria-label={`Size ${s}`}>
                <Icon name="heart" size="sm" />
              </ActionIcon>
            ))}
          </div>
          <div className={`${PAGE}__row`}>
            <span className={`${PAGE}__label`}>radius</span>
            {(['sm', 'md', 'lg', 'full'] as const).map(r => (
              <ActionIcon key={r} radius={r} variant="outline" aria-label={`Radius ${r}`}>
                <Icon name="star" size="sm" />
              </ActionIcon>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Loading & Disabled ────────────────────────── */}
      <section className={`${PAGE}__section`} id="states">
        <h2 className={`${PAGE}__section-title`}><a href="#states">Loading & Disabled</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Loading shows a spinner overlay, disabled reduces opacity and prevents interaction.
        </p>
        <div className={`${PAGE}__preview`}>
          <ActionIcon loading aria-label="Loading"><Icon name="refresh" size="sm" /></ActionIcon>
          <ActionIcon loading variant="outline" color="primary" aria-label="Loading primary"><Icon name="refresh" size="sm" /></ActionIcon>
          <ActionIcon loading variant="light" color="success" aria-label="Loading success"><Icon name="check" size="sm" /></ActionIcon>
          <ActionIcon disabled aria-label="Disabled"><Icon name="trash" size="sm" /></ActionIcon>
          <ActionIcon disabled variant="outline" aria-label="Disabled outline"><Icon name="edit" size="sm" /></ActionIcon>
        </div>
      </section>

      {/* ── 4. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for ActionIcon.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
