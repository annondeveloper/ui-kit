'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ScrollReveal } from '@ui/domain/scroll-reveal'
import { ScrollReveal as LiteScrollReveal } from '@ui/lite/scroll-reveal'
import { ScrollReveal as PremiumScrollReveal } from '@ui/premium/scroll-reveal'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier } from '../../App'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'animation', type: "'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'none'", default: "'fade-up'", description: 'The reveal animation direction or style.' },
  { name: 'delay', type: 'number', default: '0', description: 'Delay in milliseconds before the reveal animation starts.' },
  { name: 'stagger', type: 'number', description: 'Delay increment per child element in milliseconds, creating a cascading effect.' },
  { name: 'threshold', type: 'number', default: '0.1', description: 'Intersection ratio (0-1) required to trigger the reveal.' },
  { name: 'once', type: 'boolean', default: 'true', description: 'If true, the element stays visible after its first reveal. Set to false for re-entry animations.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity. Level 0 disables all motion and shows content immediately.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Content to reveal when scrolled into view.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.scroll-reveal-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .scroll-reveal-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .scroll-reveal-page__hero::before {
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
      @media (prefers-reduced-motion: reduce) { .scroll-reveal-page__hero::before { animation: none; } }

      .scroll-reveal-page__title {
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

      .scroll-reveal-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .scroll-reveal-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .scroll-reveal-page__import-code {
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

      .scroll-reveal-page__section {
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
        .scroll-reveal-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .scroll-reveal-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .scroll-reveal-page__section-title a { color: inherit; text-decoration: none; }
      .scroll-reveal-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .scroll-reveal-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .scroll-reveal-page__preview {
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

      .scroll-reveal-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .scroll-reveal-page__hint {
        text-align: center;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary);
        font-style: italic;
        padding: 1rem;
      }

      .scroll-reveal-page__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .scroll-reveal-page__card {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-surface);
        text-align: center;
      }

      .scroll-reveal-page__card-title {
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        margin: 0 0 0.25rem;
      }

      .scroll-reveal-page__card-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        margin: 0;
      }

      .scroll-reveal-page__spacer {
        min-block-size: 100px;
        display: grid;
        place-items: center;
        color: var(--text-tertiary);
        font-size: var(--text-sm, 0.875rem);
        font-style: italic;
      }

      /* ── Tiers ───────────────────────────────── */

      .scroll-reveal-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .scroll-reveal-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-width: 0;
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .scroll-reveal-page__tier-card:hover { border-color: var(--border-default); }
      .scroll-reveal-page__tier-card--active { border-color: var(--brand); box-shadow: 0 0 0 1px var(--brand), var(--shadow-glow, 0 0 12px oklch(65% 0.2 270 / 0.15)); }

      .scroll-reveal-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .scroll-reveal-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .scroll-reveal-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .scroll-reveal-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .scroll-reveal-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        line-height: 1.4;
      }

      .scroll-reveal-page__tier-preview {
        padding-block-start: 0.5rem;
        overflow: hidden;
      }

      @container (max-width: 640px) {
        .scroll-reveal-page__tiers { grid-template-columns: 1fr; }
      }
    }
  }
`

const IMPORT_STR = "import { ScrollReveal } from '@ui/domain/scroll-reveal'"

const ANIMATIONS = ['fade-up', 'fade-down', 'fade-left', 'fade-right', 'scale'] as const

// ─── Component ───────────────────────────────────────────────────────────────

export default function ScrollRevealPage() {
  useStyles('scroll-reveal-page', pageStyles)

  const { tier, setTier } = useTier()
  const ActiveScrollReveal = tier === 'lite' ? LiteScrollReveal : tier === 'premium' ? PremiumScrollReveal : ScrollReveal

  useEffect(() => {
    const sections = document.querySelectorAll('.scroll-reveal-page__section')
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
    <div className="scroll-reveal-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="scroll-reveal-page__hero">
        <h1 className="scroll-reveal-page__title">ScrollReveal</h1>
        <p className="scroll-reveal-page__desc">
          Scroll-triggered reveal animations using IntersectionObserver. Supports fade, slide,
          and scale directions with configurable delay, stagger, and threshold.
        </p>
        <div className="scroll-reveal-page__import-row">
          <code className="scroll-reveal-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. All Animations ─────────────────────────── */}
      <section className="scroll-reveal-page__section" id="animations">
        <h2 className="scroll-reveal-page__section-title"><a href="#animations">Animation Directions</a></h2>
        <p className="scroll-reveal-page__section-desc">
          Five built-in animation styles. Scroll down to see each one trigger as it enters
          the viewport.
        </p>
        <div className="scroll-reveal-page__preview">
          <div className="scroll-reveal-page__hint">Scroll within the page to trigger reveals below</div>
          {ANIMATIONS.map((anim, i) => (
            <ActiveScrollReveal key={anim} animation={anim} delay={i * 100} once>
              <div className="scroll-reveal-page__card">
                <p className="scroll-reveal-page__card-title">{anim}</p>
                <p className="scroll-reveal-page__card-desc">
                  {anim === 'fade-up' && 'Fades in while sliding upward.'}
                  {anim === 'fade-down' && 'Fades in while sliding downward.'}
                  {anim === 'fade-left' && 'Fades in from the right side.'}
                  {anim === 'fade-right' && 'Fades in from the left side.'}
                  {anim === 'scale' && 'Fades in while scaling from 90% to 100%.'}
                </p>
              </div>
            </ActiveScrollReveal>
          ))}
        </div>
      </section>

      {/* ── 2. Staggered Grid ─────────────────────────── */}
      <section className="scroll-reveal-page__section" id="stagger">
        <h2 className="scroll-reveal-page__section-title"><a href="#stagger">Staggered Children</a></h2>
        <p className="scroll-reveal-page__section-desc">
          Use the <code>stagger</code> prop to create a cascading reveal effect across child elements.
          Each child receives an incremental delay.
        </p>
        <div className="scroll-reveal-page__preview">
          <ActiveScrollReveal animation="fade-up" stagger={80} once>
            <div className="scroll-reveal-page__grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="scroll-reveal-page__card">
                  <p className="scroll-reveal-page__card-title">Card {i + 1}</p>
                  <p className="scroll-reveal-page__card-desc">Staggered with 80ms increment</p>
                </div>
              ))}
            </div>
          </ActiveScrollReveal>
        </div>
      </section>

      {/* ── 3. Delayed Reveal ─────────────────────────── */}
      <section className="scroll-reveal-page__section" id="delay">
        <h2 className="scroll-reveal-page__section-title"><a href="#delay">Custom Delay &amp; Threshold</a></h2>
        <p className="scroll-reveal-page__section-desc">
          Combine <code>delay</code> with a higher <code>threshold</code> to reveal content only when
          most of it is visible. Useful for important above-the-fold content.
        </p>
        <div className="scroll-reveal-page__preview">
          <ActiveScrollReveal animation="scale" delay={300} threshold={0.5} once>
            <div className="scroll-reveal-page__card" style={{ padding: '2.5rem' }}>
              <p className="scroll-reveal-page__card-title">Delayed Scale Reveal</p>
              <p className="scroll-reveal-page__card-desc">
                300ms delay, 50% visibility threshold. The element must be half-visible before
                the animation triggers, then waits an additional 300ms.
              </p>
            </div>
          </ActiveScrollReveal>
        </div>
      </section>

      {/* ── Tiers ─────────────────────────────────────── */}
      <section className="scroll-reveal-page__section" id="tiers">
        <h2 className="scroll-reveal-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="scroll-reveal-page__section-desc">
          Three tiers let you choose between static rendering, intersection-observer animations,
          and spring-physics reveals. Lite always shows content without animation — ideal for SSR
          and reduced-motion contexts; Standard adds IntersectionObserver-driven reveal animations
          with 5 directions, stagger, delay, and threshold control; Premium wraps Standard with
          spring overshoot on entry, aurora shimmer on revealed elements, and full motion-level support.
        </p>
        <div className="scroll-reveal-page__tiers">
          {/* Lite */}
          <div className={`scroll-reveal-page__tier-card${tier === 'lite' ? ' scroll-reveal-page__tier-card--active' : ''}`} onClick={() => setTier('lite')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}>
            <div className="scroll-reveal-page__tier-header">
              <span className="scroll-reveal-page__tier-name">Lite</span>
              <span className="scroll-reveal-page__tier-size">~0.1 KB</span>
            </div>
            <p className="scroll-reveal-page__tier-desc">
              Renders children immediately with no animation or IntersectionObserver. A simple div
              wrapper — perfect for SSR, prefers-reduced-motion contexts, or when animation is unwanted.
            </p>
            <div className="scroll-reveal-page__tier-import">
              import {'{'} ScrollReveal {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="scroll-reveal-page__tier-preview">
              <LiteScrollReveal>
                <div className="scroll-reveal-page__card">
                  <p className="scroll-reveal-page__card-title">Always visible</p>
                  <p className="scroll-reveal-page__card-desc">No animation — content shows immediately.</p>
                </div>
              </LiteScrollReveal>
            </div>
          </div>

          {/* Standard */}
          <div className={`scroll-reveal-page__tier-card${tier === 'standard' ? ' scroll-reveal-page__tier-card--active' : ''}`} onClick={() => setTier('standard')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}>
            <div className="scroll-reveal-page__tier-header">
              <span className="scroll-reveal-page__tier-name">Standard</span>
              <span className="scroll-reveal-page__tier-size">~1.8 KB</span>
            </div>
            <p className="scroll-reveal-page__tier-desc">
              IntersectionObserver-driven reveals with 5 animation directions (fade-up/down/left/right/scale),
              stagger for child elements, configurable delay, threshold, and once behaviour.
            </p>
            <div className="scroll-reveal-page__tier-import">
              import {'{'} ScrollReveal {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="scroll-reveal-page__tier-preview">
              <ScrollReveal animation="fade-up" once>
                <div className="scroll-reveal-page__card">
                  <p className="scroll-reveal-page__card-title">fade-up</p>
                  <p className="scroll-reveal-page__card-desc">IntersectionObserver reveal.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Premium */}
          <div className={`scroll-reveal-page__tier-card${tier === 'premium' ? ' scroll-reveal-page__tier-card--active' : ''}`} onClick={() => setTier('premium')} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}>
            <div className="scroll-reveal-page__tier-header">
              <span className="scroll-reveal-page__tier-name">Premium</span>
              <span className="scroll-reveal-page__tier-size">~2.3 KB</span>
            </div>
            <p className="scroll-reveal-page__tier-desc">
              Wraps Standard with spring overshoot on entry (motion level 3), aurora shimmer on
              revealed elements, enhanced stagger with spring easing, and motion-level-aware degradation.
            </p>
            <div className="scroll-reveal-page__tier-import">
              import {'{'} ScrollReveal {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="scroll-reveal-page__tier-preview">
              <PremiumScrollReveal animation="scale" once>
                <div className="scroll-reveal-page__card">
                  <p className="scroll-reveal-page__card-title">Spring scale</p>
                  <p className="scroll-reveal-page__card-desc">Spring overshoot on entry.</p>
                </div>
              </PremiumScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="scroll-reveal-page__section" id="props">
        <h2 className="scroll-reveal-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
