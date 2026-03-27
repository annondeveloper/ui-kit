'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TableOfContents } from '@ui/components/table-of-contents'
import { Card } from '@ui/components/card'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.toc-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: toc-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .toc-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .toc-page__hero::before {
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
        animation: aurora-spin-tc 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-tc {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .toc-page__hero::before { animation: none; }
      }

      .toc-page__title {
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

      .toc-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .toc-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .toc-page__import-code {
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

      .toc-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-tc 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-tc {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .toc-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .toc-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .toc-page__section-title a { color: inherit; text-decoration: none; }
      .toc-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .toc-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .toc-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .toc-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .toc-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .toc-page__variant-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        margin-block-end: 0.5rem;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { TableOfContents } from '@ui/components/table-of-contents'"

const TOC_ITEMS = [
  { id: 'introduction', label: 'Introduction', level: 1 },
  { id: 'getting-started', label: 'Getting Started', level: 1 },
  { id: 'installation', label: 'Installation', level: 2 },
  { id: 'configuration', label: 'Configuration', level: 2 },
  { id: 'components', label: 'Components', level: 1 },
  { id: 'button', label: 'Button', level: 2 },
  { id: 'card', label: 'Card', level: 2 },
  { id: 'dialog', label: 'Dialog', level: 2 },
  { id: 'theming', label: 'Theming', level: 1 },
  { id: 'api-reference', label: 'API Reference', level: 1 },
]

const propsData: PropDef[] = [
  { name: 'items', type: 'TocItem[]', required: true, description: 'Array of items with id, label, and heading level.' },
  { name: 'activeId', type: 'string', description: 'Currently active section id (for scroll spy highlighting).' },
  { name: 'variant', type: "'default' | 'filled' | 'dots'", default: "'default'", description: 'Visual style of the table of contents.' },
  { name: 'scrollSpy', type: 'boolean', default: 'false', description: 'Automatically track and highlight the visible section.' },
  { name: 'scrollOffset', type: 'number', default: '80', description: 'Offset in px for scroll spy threshold calculation.' },
  { name: 'onItemClick', type: '(id: string) => void', description: 'Callback when a TOC item is clicked.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function TableOfContentsPage() {
  useStyles('toc-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.toc-page__section')
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
    <div className="toc-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="toc-page__hero">
        <h1 className="toc-page__title">TableOfContents</h1>
        <p className="toc-page__desc">
          Navigable table of contents with nested heading levels, scroll spy highlighting,
          and multiple visual variants. Perfect for documentation pages.
        </p>
        <div className="toc-page__import-row">
          <code className="toc-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Default ───────────────────────────────── */}
      <section className="toc-page__section" id="default">
        <h2 className="toc-page__section-title"><a href="#default">Default</a></h2>
        <p className="toc-page__section-desc">
          Renders a nested list with indentation based on heading level. The active item is highlighted.
        </p>
        <div className="toc-page__preview">
          <TableOfContents items={TOC_ITEMS} activeId="components" />
        </div>
      </section>

      {/* ── Variants ──────────────────────────────── */}
      <section className="toc-page__section" id="variants">
        <h2 className="toc-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="toc-page__section-desc">
          Choose between default (line indicator), filled (background highlight), or dots (minimal) styles.
        </p>
        <div className="toc-page__preview" style={{ gap: '3rem' }}>
          {(['default', 'filled', 'dots'] as const).map(variant => (
            <div key={variant} style={{ flex: 1, minInlineSize: '180px' }}>
              <p className="toc-page__variant-label">{variant}</p>
              <TableOfContents items={TOC_ITEMS.slice(0, 6)} activeId="installation" variant={variant} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Scroll Spy ────────────────────────────── */}
      <section className="toc-page__section" id="scroll-spy">
        <h2 className="toc-page__section-title"><a href="#scroll-spy">Scroll Spy</a></h2>
        <p className="toc-page__section-desc">
          Enable scrollSpy to automatically highlight the currently visible section as the user scrolls.
          This page's own sections demonstrate the scroll tracking behavior.
        </p>
        <div className="toc-page__preview toc-page__preview--col">
          <TableOfContents
            items={[
              { id: 'default', label: 'Default', level: 1 },
              { id: 'variants', label: 'Variants', level: 1 },
              { id: 'scroll-spy', label: 'Scroll Spy', level: 1 },
              { id: 'props', label: 'Props API', level: 1 },
            ]}
            scrollSpy
            variant="filled"
          />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="toc-page__section" id="props">
        <h2 className="toc-page__section-title"><a href="#props">Props API</a></h2>
        <p className="toc-page__section-desc">
          All props accepted by the TableOfContents component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
