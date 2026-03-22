'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { UpstreamDashboard, type UpstreamLink } from '@ui/domain/upstream-dashboard'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Mock Data — Realistic ISP/NOC ─────────────────────────────────────────

const mockLinks: UpstreamLink[] = [
  { id: '1', vendor: 'Telia Carrier', location: 'Frankfurt', inbound: 12.5e9, outbound: 8.3e9, capacity: 100e9, status: 'ok', trend: [10, 11, 12, 11.5, 12.5, 13, 12] },
  { id: '2', vendor: 'Telia Carrier', location: 'Amsterdam', inbound: 8.7e9, outbound: 6.1e9, capacity: 100e9, status: 'ok', trend: [8, 7.5, 8, 8.5, 9, 8.7] },
  { id: '3', vendor: 'Lumen', location: 'London', inbound: 15.2e9, outbound: 11.8e9, capacity: 100e9, status: 'warning', trend: [12, 13, 14, 15, 15.2] },
  { id: '4', vendor: 'Lumen', location: 'New York', inbound: 22.1e9, outbound: 18.4e9, capacity: 100e9, status: 'ok', trend: [18, 19, 20, 21, 22] },
  { id: '5', vendor: 'Cogent', location: 'Paris', inbound: 5.6e9, outbound: 3.2e9, capacity: 40e9, status: 'ok', trend: [4, 5, 5.5, 5.6] },
  { id: '6', vendor: 'Cogent', location: 'Chicago', inbound: 9.8e9, outbound: 7.1e9, capacity: 40e9, status: 'critical', trend: [6, 7, 8, 9, 9.8] },
  { id: '7', vendor: 'GTT', location: 'Singapore', inbound: 3.4e9, outbound: 2.1e9, capacity: 40e9, status: 'ok', trend: [3, 3.2, 3.4] },
  { id: '8', vendor: 'GTT', location: 'Tokyo', inbound: 4.7e9, outbound: 3.9e9, capacity: 40e9, status: 'ok', trend: [4, 4.2, 4.5, 4.7] },
  { id: '9', vendor: 'Zayo', location: 'Los Angeles', inbound: 18.9e9, outbound: 14.2e9, capacity: 100e9, status: 'warning', trend: [15, 16, 17, 18, 18.9] },
  { id: '10', vendor: 'Zayo', location: 'Dallas', inbound: 7.3e9, outbound: 5.8e9, capacity: 100e9, status: 'ok', trend: [6, 6.5, 7, 7.3] },
]

// ─── Props Definition ──────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'links', type: 'UpstreamLink[]', required: true, description: 'Array of upstream link objects that drive the entire dashboard.' },
  { name: 'title', type: 'ReactNode', default: '—', description: 'Dashboard title rendered as an h2.' },
  { name: 'showSummary', type: 'boolean', default: 'false', description: 'Show aggregated summary card with total inbound/outbound traffic at the top.' },
  { name: 'groupBy', type: "'vendor' | 'location' | 'none'", default: "'none'", description: 'Group upstream links by vendor name or geographic location.' },
  { name: 'compact', type: 'boolean', default: 'false', description: 'Compact mode — smaller padding, reduced font sizes, hidden sparklines.' },
  { name: 'lastUpdated', type: 'number | Date', default: '—', description: 'Timestamp shown in the summary footer as relative time (e.g. "5s ago").' },
  { name: 'motion', type: '0 | 1 | 2 | 3', default: '3', description: 'Motion level override. 0 disables all animation.' },
]

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.ud-page) {
      :scope {
        max-inline-size: min(1100px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ud-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .ud-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      /* Animated aurora glow */
      .ud-page__hero::before {
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
        animation: ud-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes ud-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .ud-page__hero::before { animation: none; }
      }

      .ud-page__title {
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

      .ud-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .ud-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .ud-page__import-code {
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

      /* ── Sections ───────────────────────────────────── */

      .ud-page__section {
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
        animation: ud-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes ud-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .ud-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .ud-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .ud-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .ud-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .ud-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .ud-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
      }

      /* Subtle dot grid */
      .ud-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Controls Panel ─────────────────────────────── */

      .ud-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container ud-page (max-width: 720px) {
        .ud-page__playground {
          grid-template-columns: 1fr;
        }
        .ud-page__controls {
          position: static !important;
        }
      }

      .ud-page__controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .ud-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .ud-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .ud-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .ud-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .ud-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .ud-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .ud-page__toggle-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ud-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ud-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .ud-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Grouping compare ──────────────────────────── */

      .ud-page__grouping-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
        gap: 1.5rem;
      }

      .ud-page__grouping-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ud-page__grouping-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Responsive preview ─────────────────────────── */

      .ud-page__responsive-stack {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .ud-page__responsive-item {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .ud-page__responsive-label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-secondary);
      }

      .ud-page__responsive-frame {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        overflow: hidden;
        position: relative;
      }

      .ud-page__responsive-frame::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── A11y list ──────────────────────────────────── */

      .ud-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .ud-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .ud-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ────────────────────────────────── */

      .ud-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .ud-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .ud-page__hero {
          padding: 2rem 1.25rem;
        }
        .ud-page__title {
          font-size: 1.75rem;
        }
        .ud-page__playground {
          grid-template-columns: 1fr;
        }
        .ud-page__section {
          padding: 1.5rem;
        }
      }
    }
  }
`

// ─── Page Component ──────────────────────────────────────────────────────────

export default function UpstreamDashboardPage() {
  useStyles('ud-page', pageStyles)

  const [groupBy, setGroupBy] = useState<'none' | 'vendor' | 'location'>('vendor')
  const [showSummary, setShowSummary] = useState(true)
  const [compact, setCompact] = useState(false)
  const [title, setTitle] = useState('Network Operations Center')

  // Scroll reveal fallback for browsers without animation-timeline
  useEffect(() => {
    const sections = document.querySelectorAll('.ud-page__section')
    if (!sections.length) return

    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="ud-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="ud-page__hero">
        <h1 className="ud-page__title">UpstreamDashboard</h1>
        <p className="ud-page__desc">
          A JSON-driven Network Operations Center dashboard. Pass an array of upstream
          link objects and get a complete NOC view with summary cards, traffic metrics,
          sparkline trends, status indicators, and vendor/location grouping. Fully responsive
          from smartwatch to video wall via container queries.
        </p>
        <div className="ud-page__import-row">
          <code className="ud-page__import-code">
            {`import { UpstreamDashboard } from '@annondeveloper/ui-kit'`}
          </code>
        </div>
      </div>

      {/* ── 2. Live Demo with Controls ──────────────────── */}
      <section className="ud-page__section" id="live-demo">
        <h2 className="ud-page__section-title">
          <a href="#live-demo">Live Demo</a>
        </h2>
        <p className="ud-page__section-desc">
          A full working NOC dashboard with 10 upstream links across 5 transit vendors.
          Use the controls to toggle grouping, summary, and compact mode in real time.
        </p>

        <div className="ud-page__playground">
          <div className="ud-page__preview">
            <UpstreamDashboard
              links={mockLinks}
              title={title}
              showSummary={showSummary}
              groupBy={groupBy}
              compact={compact}
              lastUpdated={Date.now() - 5000}
            />
          </div>

          <div className="ud-page__controls">
            <div className="ud-page__control-group">
              <span className="ud-page__control-label">Group By</span>
              <div className="ud-page__control-options">
                {(['none', 'vendor', 'location'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`ud-page__option-btn${groupBy === v ? ' ud-page__option-btn--active' : ''}`}
                    onClick={() => setGroupBy(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="ud-page__control-group">
              <div className="ud-page__toggle-row">
                <label className="ud-page__toggle-label">
                  <input
                    type="checkbox"
                    checked={showSummary}
                    onChange={e => setShowSummary(e.target.checked)}
                  />
                  Show Summary
                </label>
              </div>
            </div>

            <div className="ud-page__control-group">
              <div className="ud-page__toggle-row">
                <label className="ud-page__toggle-label">
                  <input
                    type="checkbox"
                    checked={compact}
                    onChange={e => setCompact(e.target.checked)}
                  />
                  Compact
                </label>
              </div>
            </div>

            <div className="ud-page__control-group">
              <span className="ud-page__control-label">Title</span>
              <input
                type="text"
                className="ud-page__text-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. JSON Payload ────────────────────────────── */}
      <section className="ud-page__section" id="json-payload">
        <h2 className="ud-page__section-title">
          <a href="#json-payload">JSON Payload</a>
        </h2>
        <p className="ud-page__section-desc">
          The dashboard is entirely driven by JSON. Pass an array of UpstreamLink objects
          and the component handles layout, grouping, aggregation, and status visualization.
        </p>
        <CopyBlock
          code={`interface UpstreamLink {
  id: string
  vendor: string
  location: string
  inbound: number       // bytes per second
  outbound: number      // bytes per second
  capacity?: number     // max capacity bps
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  trend?: number[]      // sparkline data points
}

// Usage:
<UpstreamDashboard
  links={data}
  title="Network Operations"
  showSummary
  groupBy="vendor"
/>`}
          language="typescript"
        />
      </section>

      {/* ── 4. Grouping Modes ─────────────────────────── */}
      <section className="ud-page__section" id="grouping">
        <h2 className="ud-page__section-title">
          <a href="#grouping">Grouping Modes</a>
        </h2>
        <p className="ud-page__section-desc">
          Links can be displayed flat (none), grouped by transit vendor, or grouped by
          geographic location. Each group header shows aggregate traffic and is collapsible.
        </p>

        <div className="ud-page__grouping-grid">
          <div className="ud-page__grouping-item">
            <span className="ud-page__grouping-label">None (flat grid)</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={mockLinks.slice(0, 4)}
                groupBy="none"
                compact
              />
            </div>
          </div>

          <div className="ud-page__grouping-item">
            <span className="ud-page__grouping-label">Grouped by Vendor</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={mockLinks.slice(0, 4)}
                groupBy="vendor"
                compact
              />
            </div>
          </div>

          <div className="ud-page__grouping-item">
            <span className="ud-page__grouping-label">Grouped by Location</span>
            <div className="ud-page__preview">
              <UpstreamDashboard
                links={mockLinks.slice(0, 4)}
                groupBy="location"
                compact
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Responsive Preview ──────────────────────── */}
      <section className="ud-page__section" id="responsive">
        <h2 className="ud-page__section-title">
          <a href="#responsive">Responsive — Smartwatch to Video Wall</a>
        </h2>
        <p className="ud-page__section-desc">
          The dashboard uses container queries to adapt from a 200px smartwatch to multi-thousand-pixel
          video walls. Summary cards reflow, link grids adjust column count, and compact mode
          strips sparklines for tight spaces.
        </p>

        <div className="ud-page__responsive-stack">
          <div className="ud-page__responsive-item">
            <span className="ud-page__responsive-label">Desktop (full width)</span>
            <div className="ud-page__responsive-frame">
              <UpstreamDashboard links={mockLinks.slice(0, 4)} showSummary groupBy="vendor" />
            </div>
          </div>

          <div className="ud-page__responsive-item">
            <span className="ud-page__responsive-label">Phone (360px)</span>
            <div className="ud-page__responsive-frame" style={{ maxWidth: 360 }}>
              <UpstreamDashboard links={mockLinks.slice(0, 3)} showSummary compact />
            </div>
          </div>

          <div className="ud-page__responsive-item">
            <span className="ud-page__responsive-label">Smartwatch (200px)</span>
            <div className="ud-page__responsive-frame" style={{ maxWidth: 200 }}>
              <UpstreamDashboard links={mockLinks.slice(0, 2)} showSummary compact />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Props API ──────────────────────────────── */}
      <section className="ud-page__section" id="props">
        <h2 className="ud-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="ud-page__section-desc">
          All standard HTML div attributes are spread onto the root element.
        </p>
        <PropsTable props={PROPS} />
      </section>

      {/* ── 7. Accessibility ──────────────────────────── */}
      <section className="ud-page__section" id="accessibility">
        <h2 className="ud-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="ud-page__section-desc">
          Built for NOC operators who rely on screen readers and keyboard navigation during
          high-pressure incidents.
        </p>
        <ul className="ud-page__a11y-list">
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Dashboard root uses <code>role="region"</code> with <code>aria-label</code> from the title prop.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Summary card uses <code>role="region"</code> with <code>aria-label="Upstream Traffic Summary"</code>.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Each link card uses <code>role="group"</code> with a descriptive <code>aria-label</code> including vendor and location.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Status dots include <code>role="status"</code> and <code>aria-label</code> announcing the current status.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Group headers are focusable buttons with <code>aria-expanded</code> for collapse state.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Respects <code>prefers-reduced-motion</code> — disables pulse animations and hover transitions.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Full <code>forced-colors</code> (Windows High Contrast) support with system color tokens.
          </li>
          <li className="ud-page__a11y-item">
            <span className="ud-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Decorative SVG arrows and sparklines are <code>aria-hidden="true"</code>.
          </li>
        </ul>
      </section>

      {/* ── 8. Source ────────────────────────────────── */}
      <section className="ud-page__section" id="source">
        <h2 className="ud-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <a
          className="ud-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/v2/src/domain/upstream-dashboard.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub &rarr;
        </a>
      </section>
    </div>
  )
}
