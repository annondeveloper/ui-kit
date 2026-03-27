'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Timeline } from '@ui/components/timeline'
import { Card } from '@ui/components/card'
import { Button } from '@ui/components/button'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.timeline-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: timeline-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .timeline-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .timeline-page__hero::before {
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
        animation: aurora-spin-tl 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-tl {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .timeline-page__hero::before { animation: none; }
      }

      .timeline-page__title {
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

      .timeline-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .timeline-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .timeline-page__import-code {
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

      .timeline-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-tl 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-tl {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .timeline-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .timeline-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .timeline-page__section-title a { color: inherit; text-decoration: none; }
      .timeline-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .timeline-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .timeline-page__preview {
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

      .timeline-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .timeline-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .timeline-page__preview--side-by-side {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
      }

      @container timeline-page (max-width: 600px) {
        .timeline-page__preview--side-by-side {
          grid-template-columns: 1fr;
        }
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Timeline } from '@ui/components/timeline'"

const DEPLOY_ITEMS = [
  { title: 'Code pushed', description: 'Pushed 3 commits to main', status: 'completed' as const, timestamp: '10:30 AM' },
  { title: 'Tests passed', description: 'All 247 tests passed', status: 'completed' as const, timestamp: '10:32 AM' },
  { title: 'Building', description: 'Docker image building...', status: 'active' as const, timestamp: '10:34 AM' },
  { title: 'Deploy to staging', description: 'Waiting for build', status: 'pending' as const },
  { title: 'Deploy to production', description: 'Requires manual approval', status: 'pending' as const },
]

const INCIDENT_ITEMS = [
  { title: 'Incident detected', description: 'CPU usage exceeded 95%', status: 'error' as const, timestamp: '14:02' },
  { title: 'Alert triggered', description: 'PagerDuty notification sent', status: 'warning' as const, timestamp: '14:03' },
  { title: 'Investigation started', description: 'On-call engineer assigned', status: 'completed' as const, timestamp: '14:05' },
  { title: 'Root cause identified', description: 'Memory leak in worker pool', status: 'completed' as const, timestamp: '14:22' },
  { title: 'Fix deployed', description: 'Hotfix merged and deployed', status: 'completed' as const, timestamp: '14:45' },
]

const propsData: PropDef[] = [
  { name: 'items', type: 'TimelineItem[]', required: true, description: 'Array of timeline items with title, description, status, and optional timestamp.' },
  { name: 'variant', type: "'default' | 'alternate' | 'compact'", default: "'default'", description: 'Layout variant. Alternate places items on alternating sides.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the size of icons and spacing.' },
  { name: 'lineStyle', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'Style of the connecting line between items.' },
  { name: 'animated', type: 'boolean', default: 'true', description: 'Whether items animate in on scroll.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function TimelinePage() {
  useStyles('timeline-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.timeline-page__section')
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
    <div className="timeline-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="timeline-page__hero">
        <h1 className="timeline-page__title">Timeline</h1>
        <p className="timeline-page__desc">
          Vertical timeline for displaying sequential events with status indicators,
          timestamps, and connecting lines. Supports alternate and compact layouts.
        </p>
        <div className="timeline-page__import-row">
          <code className="timeline-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Default Timeline ──────────────────────── */}
      <section className="timeline-page__section" id="default">
        <h2 className="timeline-page__section-title"><a href="#default">Deployment Pipeline</a></h2>
        <p className="timeline-page__section-desc">
          Default vertical timeline showing a deployment flow with completed, active, and pending steps.
        </p>
        <div className="timeline-page__preview timeline-page__preview--col">
          <Timeline items={DEPLOY_ITEMS} />
        </div>
      </section>

      {/* ── Variants ──────────────────────────────── */}
      <section className="timeline-page__section" id="variants">
        <h2 className="timeline-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="timeline-page__section-desc">
          Alternate layout places items on alternating sides. Compact reduces spacing for dense timelines.
        </p>
        <div className="timeline-page__preview timeline-page__preview--side-by-side">
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBlockEnd: '1rem', fontWeight: 600 }}>Alternate</p>
            <Timeline items={INCIDENT_ITEMS} variant="alternate" />
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBlockEnd: '1rem', fontWeight: 600 }}>Compact</p>
            <Timeline items={INCIDENT_ITEMS} variant="compact" size="sm" />
          </div>
        </div>
      </section>

      {/* ── Line Styles ───────────────────────────── */}
      <section className="timeline-page__section" id="line-styles">
        <h2 className="timeline-page__section-title"><a href="#line-styles">Line Styles</a></h2>
        <p className="timeline-page__section-desc">
          Choose between solid, dashed, or dotted connecting lines to suit different content types.
        </p>
        <div className="timeline-page__preview timeline-page__preview--col" style={{ gap: '2rem' }}>
          {(['solid', 'dashed', 'dotted'] as const).map(style => (
            <div key={style}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem', fontFamily: 'monospace' }}>{style}</p>
              <Timeline items={DEPLOY_ITEMS.slice(0, 3)} lineStyle={style} variant="compact" size="sm" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="timeline-page__section" id="props">
        <h2 className="timeline-page__section-title"><a href="#props">Props API</a></h2>
        <p className="timeline-page__section-desc">
          All props accepted by the Timeline component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
