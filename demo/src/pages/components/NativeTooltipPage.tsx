'use client'

import { useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NativeTooltip } from '@ui/components/native-tooltip'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'content', type: 'string', required: true, description: 'Text to display in the native browser tooltip (the HTML title attribute).' },
  { name: 'children', type: 'ReactElement', required: true, description: 'A single React element that will receive the title attribute.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.native-tooltip-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .native-tooltip-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .native-tooltip-page__hero::before {
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
      @media (prefers-reduced-motion: reduce) { .native-tooltip-page__hero::before { animation: none; } }

      .native-tooltip-page__title {
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

      .native-tooltip-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .native-tooltip-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .native-tooltip-page__import-code {
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

      .native-tooltip-page__section {
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
        .native-tooltip-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .native-tooltip-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .native-tooltip-page__section-title a { color: inherit; text-decoration: none; }
      .native-tooltip-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .native-tooltip-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .native-tooltip-page__preview {
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
      }

      .native-tooltip-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .native-tooltip-page__icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 40px;
        block-size: 40px;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-surface);
        color: var(--text-secondary);
        cursor: pointer;
        font-size: 1.125rem;
        transition: border-color 0.15s, background 0.15s;
      }
      .native-tooltip-page__icon-btn:hover {
        border-color: var(--border-strong);
        background: var(--bg-elevated);
      }

      .native-tooltip-page__text-link {
        color: var(--brand, oklch(65% 0.2 270));
        text-decoration: underline;
        text-underline-offset: 0.2em;
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
      }
    }
  }
`

const IMPORT_STR = "import { NativeTooltip } from '@ui/components/native-tooltip'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function NativeTooltipPage() {
  useStyles('native-tooltip-page', pageStyles)

  useEffect(() => {
    const sections = document.querySelectorAll('.native-tooltip-page__section')
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
    <div className="native-tooltip-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="native-tooltip-page__hero">
        <h1 className="native-tooltip-page__title">NativeTooltip</h1>
        <p className="native-tooltip-page__desc">
          Lightweight tooltip wrapper that uses the browser's native <code>title</code> attribute.
          Zero JavaScript overhead, no positioning logic, and fully accessible out of the box.
        </p>
        <div className="native-tooltip-page__import-row">
          <code className="native-tooltip-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Basic Usage ────────────────────────────── */}
      <section className="native-tooltip-page__section" id="basic">
        <h2 className="native-tooltip-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="native-tooltip-page__section-desc">
          Wrap any element to add a native browser tooltip. Hover over each button below and wait
          briefly for the tooltip to appear. Appearance and timing are controlled by the browser.
        </p>
        <div className="native-tooltip-page__preview">
          <NativeTooltip content="Save your changes">
            <Button>Save</Button>
          </NativeTooltip>
          <NativeTooltip content="Discard and go back">
            <Button variant="outline">Cancel</Button>
          </NativeTooltip>
          <NativeTooltip content="Remove this item permanently">
            <Button variant="ghost">Delete</Button>
          </NativeTooltip>
        </div>
      </section>

      {/* ── 2. Different Elements ─────────────────────── */}
      <section className="native-tooltip-page__section" id="elements">
        <h2 className="native-tooltip-page__section-title"><a href="#elements">Various Elements</a></h2>
        <p className="native-tooltip-page__section-desc">
          NativeTooltip works with any single React element -- buttons, links, icons, or custom components.
          The <code>title</code> attribute is cloned onto the child element.
        </p>
        <div className="native-tooltip-page__preview">
          <NativeTooltip content="Search the documentation">
            <button className="native-tooltip-page__icon-btn" aria-label="Search">&#x1F50D;</button>
          </NativeTooltip>
          <NativeTooltip content="Toggle dark mode">
            <button className="native-tooltip-page__icon-btn" aria-label="Theme">&#x1F319;</button>
          </NativeTooltip>
          <NativeTooltip content="View notification settings">
            <button className="native-tooltip-page__icon-btn" aria-label="Notifications">&#x1F514;</button>
          </NativeTooltip>
          <NativeTooltip content="Opens in a new tab">
            <a href="#elements" className="native-tooltip-page__text-link">Documentation link</a>
          </NativeTooltip>
        </div>
      </section>

      {/* ── 3. Long Content ───────────────────────────── */}
      <section className="native-tooltip-page__section" id="long">
        <h2 className="native-tooltip-page__section-title"><a href="#long">Long Tooltip Content</a></h2>
        <p className="native-tooltip-page__section-desc">
          Native tooltips handle multiline content automatically. The browser wraps long text and
          positions the tooltip near the cursor.
        </p>
        <div className="native-tooltip-page__preview">
          <NativeTooltip content="This action will permanently delete all selected items from your account. This cannot be undone. Please make sure you have backed up any important data before proceeding.">
            <Button variant="outline">Hover for details</Button>
          </NativeTooltip>
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="native-tooltip-page__section" id="props">
        <h2 className="native-tooltip-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
