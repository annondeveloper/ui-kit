'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Spoiler } from '@ui/components/spoiler'
import { Card } from '@ui/components/card'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.spoiler-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: spoiler-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .spoiler-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .spoiler-page__hero::before {
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
        animation: aurora-spin-sl 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-sl {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .spoiler-page__hero::before { animation: none; }
      }

      .spoiler-page__title {
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

      .spoiler-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .spoiler-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .spoiler-page__import-code {
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

      .spoiler-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-sl 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-sl {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .spoiler-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .spoiler-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .spoiler-page__section-title a { color: inherit; text-decoration: none; }
      .spoiler-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .spoiler-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .spoiler-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .spoiler-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .spoiler-page__sample-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.7;
        text-wrap: pretty;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Spoiler } from '@ui/components/spoiler'"

const LONG_TEXT = `Aurora Fluid is a design language that draws inspiration from the natural phenomenon of the aurora borealis. It uses deep atmospheric surfaces, ambient glows, and ethereal color washes to create interfaces that feel alive and immersive. The OKLCH color system ensures perceptually uniform color distribution, while physics-based animations powered by a real spring solver provide motion that feels natural and responsive. Every component in the library is designed with progressive enhancement in mind, using modern CSS features like @scope, @layer, container queries, and scroll-driven animations, with graceful fallbacks for older browsers. The zero-dependency architecture means the entire library ships with only React as a peer dependency, keeping bundle sizes minimal while delivering a premium experience.`

const SHORT_TEXT = `This section contains a brief overview of the component architecture. Click "Show more" to reveal additional details about implementation patterns and best practices.`

const propsData: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to display, which may be clipped at maxHeight.' },
  { name: 'maxHeight', type: 'number', default: '120', description: 'Maximum height in pixels before content is clipped.' },
  { name: 'showLabel', type: 'string', default: "'Show more'", description: 'Label for the expand button.' },
  { name: 'hideLabel', type: 'string', default: "'Show less'", description: 'Label for the collapse button.' },
  { name: 'animated', type: 'boolean', default: 'true', description: 'Whether the expand/collapse transition is animated.' },
  { name: 'gradient', type: 'boolean', default: 'true', description: 'Show a fade gradient at the bottom when content is clipped.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpoilerPage() {
  useStyles('spoiler-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.spoiler-page__section')
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
    <div className="spoiler-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="spoiler-page__hero">
        <h1 className="spoiler-page__title">Spoiler</h1>
        <p className="spoiler-page__desc">
          Expandable content container with a max height, fade gradient,
          and show more/less toggle. Smooth animated expand and collapse.
        </p>
        <div className="spoiler-page__import-row">
          <code className="spoiler-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Basic Usage ───────────────────────────── */}
      <section className="spoiler-page__section" id="basic">
        <h2 className="spoiler-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="spoiler-page__section-desc">
          Content exceeding the maxHeight is clipped with a gradient fade. Click the toggle to expand.
        </p>
        <div className="spoiler-page__preview">
          <Spoiler maxHeight={80}>
            <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
          </Spoiler>
        </div>
      </section>

      {/* ── Custom Labels & Heights ────────────────── */}
      <section className="spoiler-page__section" id="custom">
        <h2 className="spoiler-page__section-title"><a href="#custom">Custom Labels &amp; Heights</a></h2>
        <p className="spoiler-page__section-desc">
          Customize the expand/collapse labels and the max height threshold.
        </p>
        <div className="spoiler-page__preview" style={{ gap: '2rem' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>maxHeight=60, custom labels</p>
            <Spoiler maxHeight={60} showLabel="Read more..." hideLabel="Collapse">
              <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
            </Spoiler>
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'monospace' }}>maxHeight=200 (no clip needed)</p>
            <Spoiler maxHeight={200}>
              <p className="spoiler-page__sample-text">{SHORT_TEXT}</p>
            </Spoiler>
          </div>
        </div>
      </section>

      {/* ── No Gradient ───────────────────────────── */}
      <section className="spoiler-page__section" id="no-gradient">
        <h2 className="spoiler-page__section-title"><a href="#no-gradient">Without Gradient</a></h2>
        <p className="spoiler-page__section-desc">
          Disable the fade gradient for a hard clip at the max height boundary.
        </p>
        <div className="spoiler-page__preview">
          <Spoiler maxHeight={80} gradient={false}>
            <p className="spoiler-page__sample-text">{LONG_TEXT}</p>
          </Spoiler>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="spoiler-page__section" id="props">
        <h2 className="spoiler-page__section-title"><a href="#props">Props API</a></h2>
        <p className="spoiler-page__section-desc">
          All props accepted by the Spoiler component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
