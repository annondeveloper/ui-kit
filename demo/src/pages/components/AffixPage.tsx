'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Affix } from '@ui/components/affix'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

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
      }

      .affix-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
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
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Affix } from '@ui/components/affix'"

const propsData: PropDef[] = [
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to render in the fixed position.' },
  { name: 'position', type: "{ top?: number; right?: number; bottom?: number; left?: number }", default: '{ bottom: 20, right: 20 }', description: 'Fixed position offsets in pixels.' },
  { name: 'zIndex', type: 'number', default: '100', description: 'CSS z-index for the fixed container.' },
  { name: 'withinPortal', type: 'boolean', default: 'true', description: 'Render inside a portal to escape parent stacking contexts.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the wrapper element.' },
]

const POSITIONS = [
  { label: 'top-left', pos: { top: 20, left: 20 } },
  { label: 'top-right', pos: { top: 20, right: 20 } },
  { label: 'bottom-left', pos: { bottom: 20, left: 20 } },
  { label: 'bottom-right', pos: { bottom: 20, right: 20 } },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function AffixPage() {
  useStyles('affix-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.affix-page__section')
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
    <div className="affix-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="affix-page__hero">
        <h1 className="affix-page__title">Affix</h1>
        <p className="affix-page__desc">
          Fix any content to a specific position in the viewport. Uses a portal
          by default to escape parent stacking contexts.
        </p>
        <div className="affix-page__import-row">
          <code className="affix-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Position Grid ─────────────────────────── */}
      <section className="affix-page__section" id="positions">
        <h2 className="affix-page__section-title"><a href="#positions">Position Options</a></h2>
        <p className="affix-page__section-desc">
          Affix supports any combination of top, right, bottom, and left offsets. Below shows the four corner positions.
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

      {/* ── Live Demo ─────────────────────────────── */}
      <section className="affix-page__section" id="live">
        <h2 className="affix-page__section-title"><a href="#live">Live Demo</a></h2>
        <p className="affix-page__section-desc">
          A help button is affixed to the bottom-right of the viewport. Scroll the page to verify it stays fixed.
        </p>
        <div className="affix-page__preview">
          <p className="affix-page__hint">
            Look for the help button in the bottom-left corner of your viewport.
          </p>
        </div>
        <Affix position={{ bottom: 80, left: 20 }}>
          <Button size="sm" variant="outline">
            <Icon name="help-circle" size="sm" /> Help
          </Button>
        </Affix>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="affix-page__section" id="props">
        <h2 className="affix-page__section-title"><a href="#props">Props API</a></h2>
        <p className="affix-page__section-desc">
          All props accepted by the Affix component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
