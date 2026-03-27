'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { BackToTop } from '@ui/components/back-to-top'
import { Card } from '@ui/components/card'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.back-to-top-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: back-to-top-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .back-to-top-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .back-to-top-page__hero::before {
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
        animation: aurora-spin-btt 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-btt {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .back-to-top-page__hero::before { animation: none; }
      }

      .back-to-top-page__title {
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

      .back-to-top-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .back-to-top-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .back-to-top-page__import-code {
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

      .back-to-top-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-btt 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-btt {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .back-to-top-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .back-to-top-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .back-to-top-page__section-title a { color: inherit; text-decoration: none; }
      .back-to-top-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .back-to-top-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .back-to-top-page__preview {
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

      .back-to-top-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .back-to-top-page__scroll-box {
        inline-size: 100%;
        max-block-size: 300px;
        overflow-y: auto;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        position: relative;
        background: var(--bg-surface);
      }

      .back-to-top-page__scroll-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .back-to-top-page__scroll-content p {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .back-to-top-page__hint {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        text-align: center;
        font-style: italic;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { BackToTop } from '@ui/components/back-to-top'"

const propsData: PropDef[] = [
  { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance in px before the button appears.' },
  { name: 'smooth', type: 'boolean', default: 'true', description: 'Use smooth scrolling when clicking the button.' },
  { name: 'showProgress', type: 'boolean', default: 'false', description: 'Show a circular progress ring indicating scroll position.' },
  { name: 'target', type: 'HTMLElement | null', description: 'Scroll container to attach to (defaults to window).' },
  { name: 'position', type: "'bottom-right' | 'bottom-left'", default: "'bottom-right'", description: 'Corner placement of the button.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the floating button.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

const FILLER_PARAGRAPHS = Array.from({ length: 12 }, (_, i) =>
  `Section ${i + 1}: This is filler content to demonstrate the scroll behavior. The BackToTop button appears after scrolling past the configured threshold distance. It provides a convenient way to return to the top of the page or scroll container.`
)

// ─── Component ───────────────────────────────────────────────────────────────

export default function BackToTopPage() {
  useStyles('back-to-top-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.back-to-top-page__section')
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
    <div className="back-to-top-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="back-to-top-page__hero">
        <h1 className="back-to-top-page__title">BackToTop</h1>
        <p className="back-to-top-page__desc">
          Floating scroll-to-top button that appears after scrolling past a threshold.
          Optional progress ring shows current scroll position.
        </p>
        <div className="back-to-top-page__import-row">
          <code className="back-to-top-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Page-Level ────────────────────────────── */}
      <section className="back-to-top-page__section" id="page-level">
        <h2 className="back-to-top-page__section-title"><a href="#page-level">Page-Level Button</a></h2>
        <p className="back-to-top-page__section-desc">
          Scroll this page down to see the BackToTop button appear in the bottom-right corner.
          The progress ring fills as you scroll further.
        </p>
        <div className="back-to-top-page__preview">
          <p className="back-to-top-page__hint">
            Scroll the page to see the button appear. It is rendered at the page level with a progress ring.
          </p>
        </div>
        <BackToTop showProgress />
      </section>

      {/* ── Container-Scoped ──────────────────────── */}
      <section className="back-to-top-page__section" id="container">
        <h2 className="back-to-top-page__section-title"><a href="#container">Container-Scoped</a></h2>
        <p className="back-to-top-page__section-desc">
          Attach the button to a specific scroll container instead of the window.
          Scroll the box below to trigger it.
        </p>
        <div className="back-to-top-page__preview">
          <div className="back-to-top-page__scroll-box" id="scroll-demo-container">
            <div className="back-to-top-page__scroll-content">
              {FILLER_PARAGRAPHS.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="back-to-top-page__section" id="props">
        <h2 className="back-to-top-page__section-title"><a href="#props">Props API</a></h2>
        <p className="back-to-top-page__section-desc">
          All props accepted by the BackToTop component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
