'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Stepper } from '@ui/components/stepper'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.stepper-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: stepper-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .stepper-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .stepper-page__hero::before {
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
        animation: aurora-spin-sp 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-sp {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .stepper-page__hero::before { animation: none; }
      }

      .stepper-page__title {
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

      .stepper-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .stepper-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .stepper-page__import-code {
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

      .stepper-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-sp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-sp {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .stepper-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .stepper-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .stepper-page__section-title a { color: inherit; text-decoration: none; }
      .stepper-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .stepper-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .stepper-page__preview {
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

      .stepper-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .stepper-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      .stepper-page__nav-row {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        margin-block-start: 1rem;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { Stepper } from '@ui/components/stepper'"

const STEPS = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Set up your profile' },
  { label: 'Billing', description: 'Add payment method' },
  { label: 'Review', description: 'Confirm and finish' },
]

const propsData: PropDef[] = [
  { name: 'steps', type: 'StepItem[]', required: true, description: 'Array of steps with label and optional description.' },
  { name: 'activeStep', type: 'number', default: '0', description: 'Zero-based index of the current active step.' },
  { name: 'variant', type: "'numbered' | 'dots' | 'progress'", default: "'numbered'", description: 'Visual style of the step indicators.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the stepper.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls icon and text size.' },
  { name: 'onStepClick', type: '(index: number) => void', description: 'Callback when a step is clicked. Enables clickable steps.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function StepperPage() {
  useStyles('stepper-page', pageStyles)

  const [active, setActive] = useState(1)

  useEffect(() => {
    const sections = document.querySelectorAll('.stepper-page__section')
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
    <div className="stepper-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="stepper-page__hero">
        <h1 className="stepper-page__title">Stepper</h1>
        <p className="stepper-page__desc">
          Multi-step progress indicator with numbered, dot, and progress bar variants.
          Supports horizontal and vertical orientation with clickable navigation.
        </p>
        <div className="stepper-page__import-row">
          <code className="stepper-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Interactive Stepper ────────────────────── */}
      <section className="stepper-page__section" id="interactive">
        <h2 className="stepper-page__section-title"><a href="#interactive">Interactive Stepper</a></h2>
        <p className="stepper-page__section-desc">
          Click Next/Back to navigate between steps. Completed steps show a checkmark.
        </p>
        <div className="stepper-page__preview stepper-page__preview--col">
          <Stepper steps={STEPS} activeStep={active} onStepClick={setActive} />
          <div className="stepper-page__nav-row">
            <Button size="sm" variant="outline" disabled={active === 0} onClick={() => setActive(a => Math.max(0, a - 1))}>
              <Icon name="chevron-left" size="sm" /> Back
            </Button>
            <Button size="sm" disabled={active === STEPS.length - 1} onClick={() => setActive(a => Math.min(STEPS.length - 1, a + 1))}>
              Next <Icon name="chevron-right" size="sm" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Variants ──────────────────────────────── */}
      <section className="stepper-page__section" id="variants">
        <h2 className="stepper-page__section-title"><a href="#variants">Variants</a></h2>
        <p className="stepper-page__section-desc">
          Numbered shows step numbers, dots shows minimal indicators, and progress shows a connecting bar.
        </p>
        <div className="stepper-page__preview stepper-page__preview--col" style={{ gap: '2.5rem' }}>
          {(['numbered', 'dots', 'progress'] as const).map(variant => (
            <div key={variant}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBlockEnd: '0.75rem', fontFamily: 'monospace' }}>{variant}</p>
              <Stepper steps={STEPS} activeStep={2} variant={variant} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Vertical ──────────────────────────────── */}
      <section className="stepper-page__section" id="vertical">
        <h2 className="stepper-page__section-title"><a href="#vertical">Vertical Orientation</a></h2>
        <p className="stepper-page__section-desc">
          Use vertical orientation for sidebar layouts or when steps need more description space.
        </p>
        <div className="stepper-page__preview">
          <Stepper steps={STEPS} activeStep={2} orientation="vertical" />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="stepper-page__section" id="props">
        <h2 className="stepper-page__section-title"><a href="#props">Props API</a></h2>
        <p className="stepper-page__section-desc">
          All props accepted by the Stepper component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
