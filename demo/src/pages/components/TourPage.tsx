'use client'

import { useState, useEffect, useRef } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Tour, type TourStep } from '@ui/domain/tour'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Props ───────────────────────────────────────────────────────────────────

const STEP_PROPS: PropDef[] = [
  { name: 'target', type: 'string', required: true, description: 'CSS selector for the element to spotlight.' },
  { name: 'title', type: 'string', required: true, description: 'Heading text displayed in the tooltip.' },
  { name: 'description', type: 'ReactNode', required: true, description: 'Body content of the tooltip card.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Preferred tooltip position relative to the target.' },
  { name: 'onShow', type: '() => void', description: 'Called when this step becomes active.' },
]

const TOUR_PROPS: PropDef[] = [
  { name: 'steps', type: 'TourStep[]', required: true, description: 'Array of step definitions (see TourStep table above).' },
  { name: 'open', type: 'boolean', default: 'false', description: 'Whether the tour is currently active.' },
  { name: 'onClose', type: '() => void', description: 'Called when the user dismisses the tour.' },
  { name: 'onFinish', type: '() => void', description: 'Called when the user completes all steps.' },
  { name: 'currentStep', type: 'number', description: 'Controlled step index (zero-based).' },
  { name: 'onStepChange', type: '(step: number) => void', description: 'Called when the active step changes.' },
  { name: 'closeOnOverlay', type: 'boolean', default: 'true', description: 'Allow closing the tour by clicking the overlay.' },
  { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Allow closing the tour with the Escape key.' },
  { name: 'showProgress', type: 'boolean', default: 'true', description: 'Show step counter (e.g. "2 of 4").' },
  { name: 'showSkip', type: 'boolean', default: 'true', description: 'Show a "Skip" button to exit early.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for spotlight and tooltip transitions.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tour-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .tour-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .tour-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .tour-page__hero::before { animation: none; } }

      .tour-page__title {
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

      .tour-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .tour-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .tour-page__import-code {
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

      .tour-page__section {
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
        .tour-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .tour-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .tour-page__section-title a { color: inherit; text-decoration: none; }
      .tour-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .tour-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .tour-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        z-index: 1;
      }

      .tour-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Mock UI targets for the tour ── */
      .tour-page__mock-ui {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .tour-page__mock-item {
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-surface);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        font-weight: 500;
      }
    }
  }
`

const IMPORT_STR = "import { Tour, type TourStep } from '@ui/domain/tour'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function TourPage() {
  useStyles('tour-page', pageStyles)

  const [tourOpen, setTourOpen] = useState(false)
  const [minimalTourOpen, setMinimalTourOpen] = useState(false)

  const STEPS: TourStep[] = [
    { target: '#tour-target-search', title: 'Search', description: 'Find components, docs, and examples instantly.', placement: 'bottom' },
    { target: '#tour-target-nav', title: 'Navigation', description: 'Browse all component categories from the sidebar.', placement: 'right' },
    { target: '#tour-target-theme', title: 'Theme Switcher', description: 'Toggle between light and dark mode, or set a custom brand color.', placement: 'left' },
    { target: '#tour-target-actions', title: 'Quick Actions', description: 'Copy import statements, open source code, or jump to Storybook.', placement: 'top' },
  ]

  const MINIMAL_STEPS: TourStep[] = [
    { target: '#tour-mini-a', title: 'Step 1', description: 'First item in the minimal tour.', placement: 'bottom' },
    { target: '#tour-mini-b', title: 'Step 2', description: 'Second item with no skip or progress.', placement: 'bottom' },
  ]

  useEffect(() => {
    const sections = document.querySelectorAll('.tour-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="tour-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="tour-page__hero">
        <h1 className="tour-page__title">Tour</h1>
        <p className="tour-page__desc">
          Step-by-step guided tour with spotlight cutouts, animated tooltips, and keyboard navigation.
          Perfect for onboarding flows and feature discovery.
        </p>
        <div className="tour-page__import-row">
          <code className="tour-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Full Tour Demo ─────────────────────────── */}
      <section className="tour-page__section" id="basic">
        <h2 className="tour-page__section-title"><a href="#basic">Interactive Tour</a></h2>
        <p className="tour-page__section-desc">
          Click the button to launch a 4-step tour. Each step highlights a target element with an
          SVG spotlight cutout and positions a tooltip card with navigation controls.
        </p>
        <div className="tour-page__preview">
          <div className="tour-page__mock-ui">
            <div className="tour-page__mock-item" id="tour-target-search">Search</div>
            <div className="tour-page__mock-item" id="tour-target-nav">Navigation</div>
            <div className="tour-page__mock-item" id="tour-target-theme">Theme</div>
            <div className="tour-page__mock-item" id="tour-target-actions">Actions</div>
          </div>
          <Button onClick={() => setTourOpen(true)}>Start Tour</Button>
        </div>
        <Tour steps={STEPS} open={tourOpen} onClose={() => setTourOpen(false)} onFinish={() => setTourOpen(false)} showProgress showSkip />
      </section>

      {/* ── 2. Minimal Tour ───────────────────────────── */}
      <section className="tour-page__section" id="minimal">
        <h2 className="tour-page__section-title"><a href="#minimal">Minimal Configuration</a></h2>
        <p className="tour-page__section-desc">
          Disable progress indicators and skip button for a streamlined experience.
          Useful for short, mandatory walkthroughs.
        </p>
        <div className="tour-page__preview">
          <div className="tour-page__mock-ui">
            <div className="tour-page__mock-item" id="tour-mini-a">Item A</div>
            <div className="tour-page__mock-item" id="tour-mini-b">Item B</div>
          </div>
          <Button variant="outline" onClick={() => setMinimalTourOpen(true)}>Start Minimal Tour</Button>
        </div>
        <Tour
          steps={MINIMAL_STEPS}
          open={minimalTourOpen}
          onClose={() => setMinimalTourOpen(false)}
          onFinish={() => setMinimalTourOpen(false)}
          showProgress={false}
          showSkip={false}
        />
      </section>

      {/* ── Props: TourStep ───────────────────────────── */}
      <section className="tour-page__section" id="step-props">
        <h2 className="tour-page__section-title"><a href="#step-props">TourStep Props</a></h2>
        <PropsTable props={STEP_PROPS} />
      </section>

      {/* ── Props: Tour ───────────────────────────────── */}
      <section className="tour-page__section" id="props">
        <h2 className="tour-page__section-title"><a href="#props">Tour Props</a></h2>
        <PropsTable props={TOUR_PROPS} />
      </section>
    </div>
  )
}
