'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ButtonGroup } from '@ui/components/button-group'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.button-group-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: button-group-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .button-group-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .button-group-page__hero::before {
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
        animation: aurora-spin-bg 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-bg {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .button-group-page__hero::before { animation: none; }
      }

      .button-group-page__title {
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

      .button-group-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .button-group-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .button-group-page__import-code {
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
      }

      .button-group-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-bg 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-bg {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .button-group-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .button-group-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .button-group-page__section-title a { color: inherit; text-decoration: none; }
      .button-group-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .button-group-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .button-group-page__preview {
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

      .button-group-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .button-group-page__preview--col {
        flex-direction: column;
        align-items: center;
      }

      .button-group-page__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { ButtonGroup } from '@ui/components/button-group'"

const propsData: PropDef[] = [
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the button group layout.' },
  { name: 'attached', type: 'boolean', default: 'false', description: 'Merge borders between buttons for a seamless look.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Size applied to all child buttons.' },
  { name: 'variant', type: "'solid' | 'outline' | 'ghost'", default: "'outline'", description: 'Variant applied to all child buttons.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all buttons in the group.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ButtonGroupPage() {
  useStyles('button-group-page', pageStyles)

  const [selected, setSelected] = useState('week')

  useEffect(() => {
    const sections = document.querySelectorAll('.button-group-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="button-group-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="button-group-page__hero">
        <h1 className="button-group-page__title">ButtonGroup</h1>
        <p className="button-group-page__desc">
          Group related buttons together with shared sizing, attached borders,
          and horizontal or vertical orientation.
        </p>
        <div className="button-group-page__import-row">
          <code className="button-group-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Orientation & Attached ─────────────────── */}
      <section className="button-group-page__section" id="orientation">
        <h2 className="button-group-page__section-title"><a href="#orientation">Orientation &amp; Attached</a></h2>
        <p className="button-group-page__section-desc">
          Horizontal and vertical layouts, with attached mode merging borders between buttons.
        </p>
        <div className="button-group-page__preview button-group-page__preview--col" style={{ gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">horizontal</span>
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Center</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">horizontal attached</span>
            <ButtonGroup attached>
              <Button variant="outline"><Icon name="align-left" size="sm" /></Button>
              <Button variant="outline"><Icon name="align-center" size="sm" /></Button>
              <Button variant="outline"><Icon name="align-right" size="sm" /></Button>
            </ButtonGroup>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span className="button-group-page__label">vertical attached</span>
            <ButtonGroup orientation="vertical" attached>
              <Button variant="outline"><Icon name="chevron-up" size="sm" /></Button>
              <Button variant="outline"><Icon name="minus" size="sm" /></Button>
              <Button variant="outline"><Icon name="chevron-down" size="sm" /></Button>
            </ButtonGroup>
          </div>
        </div>
      </section>

      {/* ── Sizes ─────────────────────────────────── */}
      <section className="button-group-page__section" id="sizes">
        <h2 className="button-group-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="button-group-page__section-desc">
          All button group sizes from xs to lg, applied uniformly to child buttons.
        </p>
        <div className="button-group-page__preview button-group-page__preview--col" style={{ gap: '1.5rem' }}>
          {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <span className="button-group-page__label">{size}</span>
              <ButtonGroup size={size} attached>
                <Button variant="outline">Day</Button>
                <Button variant="outline">Week</Button>
                <Button variant="outline">Month</Button>
              </ButtonGroup>
            </div>
          ))}
        </div>
      </section>

      {/* ── Toggle Example ────────────────────────── */}
      <section className="button-group-page__section" id="toggle">
        <h2 className="button-group-page__section-title"><a href="#toggle">Toggle Pattern</a></h2>
        <p className="button-group-page__section-desc">
          Use ButtonGroup to build segmented controls by managing active state on child buttons.
        </p>
        <div className="button-group-page__preview">
          <ButtonGroup attached>
            {['day', 'week', 'month', 'year'].map(period => (
              <Button key={period} variant={selected === period ? 'solid' : 'outline'} onClick={() => setSelected(period)}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="button-group-page__section" id="props">
        <h2 className="button-group-page__section-title"><a href="#props">Props API</a></h2>
        <p className="button-group-page__section-desc">
          All props accepted by the ButtonGroup component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
