'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Carousel } from '@ui/components/carousel'
import { Card } from '@ui/components/card'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.carousel-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: carousel-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .carousel-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .carousel-page__hero::before {
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
        animation: aurora-spin-cr 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-cr {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .carousel-page__hero::before { animation: none; }
      }

      .carousel-page__title {
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

      .carousel-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .carousel-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .carousel-page__import-code {
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

      .carousel-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-cr 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-cr {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .carousel-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .carousel-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .carousel-page__section-title a { color: inherit; text-decoration: none; }
      .carousel-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .carousel-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .carousel-page__preview {
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

      .carousel-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .carousel-page__preview--full {
        flex-direction: column;
        align-items: stretch;
      }

      .carousel-page__slide {
        display: grid;
        place-items: center;
        min-block-size: 200px;
        border-radius: var(--radius-md);
        font-size: 1.5rem;
        font-weight: 700;
        color: oklch(100% 0 0);
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Carousel } from '@ui/components/carousel'"

const SLIDE_COLORS = [
  'oklch(55% 0.2 250)', 'oklch(55% 0.2 300)', 'oklch(55% 0.2 150)',
  'oklch(55% 0.2 30)', 'oklch(55% 0.2 200)',
]

const propsData: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Slide elements rendered inside the carousel viewport.' },
  { name: 'showArrows', type: 'boolean', default: 'true', description: 'Show previous/next navigation arrows.' },
  { name: 'showDots', type: 'boolean', default: 'true', description: 'Show dot indicators below the slides.' },
  { name: 'autoplay', type: 'boolean', default: 'false', description: 'Automatically advance slides at a set interval.' },
  { name: 'autoplayInterval', type: 'number', default: '5000', description: 'Time in ms between auto-advance (when autoplay is true).' },
  { name: 'loop', type: 'boolean', default: 'true', description: 'Whether the carousel wraps around at the ends.' },
  { name: 'slidesToShow', type: 'number', default: '1', description: 'Number of slides visible at once.' },
  { name: 'gap', type: 'string', default: "'1rem'", description: 'Gap between slides when showing multiple.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function CarouselPage() {
  useStyles('carousel-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.carousel-page__section')
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
    <div className="carousel-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="carousel-page__hero">
        <h1 className="carousel-page__title">Carousel</h1>
        <p className="carousel-page__desc">
          Slide-based content viewer with arrow navigation, dot indicators,
          autoplay, loop, and multi-slide display. Keyboard and touch accessible.
        </p>
        <div className="carousel-page__import-row">
          <code className="carousel-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Basic Carousel ────────────────────────── */}
      <section className="carousel-page__section" id="basic">
        <h2 className="carousel-page__section-title"><a href="#basic">Basic Carousel</a></h2>
        <p className="carousel-page__section-desc">
          Navigate slides with arrows and dots. Supports keyboard navigation via Arrow Left/Right.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <Carousel>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ── Autoplay ──────────────────────────────── */}
      <section className="carousel-page__section" id="autoplay">
        <h2 className="carousel-page__section-title"><a href="#autoplay">Autoplay</a></h2>
        <p className="carousel-page__section-desc">
          Slides advance automatically every 3 seconds. Autoplay pauses on hover and focus.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <Carousel autoplay autoplayInterval={3000}>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color }}>
                Slide {i + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ── Multi-slide ───────────────────────────── */}
      <section className="carousel-page__section" id="multi-slide">
        <h2 className="carousel-page__section-title"><a href="#multi-slide">Multi-Slide</a></h2>
        <p className="carousel-page__section-desc">
          Show multiple slides at once with a gap between them. Useful for card-based content.
        </p>
        <div className="carousel-page__preview carousel-page__preview--full">
          <Carousel slidesToShow={3} gap="1rem" showDots={false}>
            {SLIDE_COLORS.map((color, i) => (
              <div key={i} className="carousel-page__slide" style={{ background: color, minBlockSize: '140px', fontSize: '1.125rem' }}>
                Card {i + 1}
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="carousel-page__section" id="props">
        <h2 className="carousel-page__section-title"><a href="#props">Props API</a></h2>
        <p className="carousel-page__section-desc">
          All props accepted by the Carousel component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
