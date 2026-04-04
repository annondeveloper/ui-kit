'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ContainerQuery } from '@ui/components/container-query'
import { ContainerQuery as LiteContainerQuery } from '@ui/lite/container-query'
import { ContainerQuery as PremiumContainerQuery } from '@ui/premium/container-query'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.container-query-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: container-query-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .container-query-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .container-query-page__hero::before {
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
        animation: container-query-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes container-query-page-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .container-query-page__hero::before { animation: none; }
      }

      .container-query-page__title {
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

      .container-query-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .container-query-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .container-query-page__import-code {
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

      .container-query-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .container-query-page__section {
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
        animation: container-query-page-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes container-query-page-section-reveal {
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
        .container-query-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .container-query-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .container-query-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .container-query-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .container-query-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .container-query-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .container-query-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .container-query-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container container-query-page (max-width: 680px) {
        .container-query-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .container-query-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .container-query-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .container-query-page__playground-result {
        overflow: hidden;
        min-block-size: 200px;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        padding: 0;
      }

      .container-query-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .container-query-page__playground-controls {
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

      .container-query-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .container-query-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── Resizable container ────────────────────────── */

      .container-query-page__resizable {
        resize: horizontal;
        overflow: auto;
        border: 2px dashed var(--border-default);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        min-inline-size: 160px;
        max-inline-size: 100%;
        position: relative;
        transition: border-color 0.2s;
      }

      .container-query-page__resizable:hover {
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .container-query-page__resize-hint {
        position: absolute;
        inset-block-end: 0.375rem;
        inset-inline-end: 0.5rem;
        font-size: 0.625rem;
        color: var(--text-tertiary);
        pointer-events: none;
        user-select: none;
      }

      /* ── Responsive demo card ───────────────────────── */

      .container-query-page__demo-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: all 0.3s ease;
      }

      .container-query-page__demo-card--horizontal {
        flex-direction: row;
        align-items: center;
      }

      .container-query-page__demo-avatar {
        inline-size: 48px;
        block-size: 48px;
        border-radius: var(--radius-full, 9999px);
        background: linear-gradient(135deg, var(--brand, oklch(65% 0.2 270)), var(--aurora-1, oklch(70% 0.15 270)));
        flex-shrink: 0;
      }

      .container-query-page__demo-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        min-inline-size: 0;
      }

      .container-query-page__demo-name {
        font-weight: 600;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
      }

      .container-query-page__demo-role {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
      }

      .container-query-page__demo-stats {
        display: none;
        gap: 1rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
      }

      .container-query-page__demo-stats--visible {
        display: flex;
      }

      /* ── Size indicator badge ───────────────────────── */

      .container-query-page__size-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        color: var(--brand, oklch(65% 0.2 270));
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
      }

      /* ── Breakpoints table ──────────────────────────── */

      .container-query-page__bp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;
      }

      .container-query-page__bp-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
        padding: 1rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
        text-align: center;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .container-query-page__bp-card:hover {
        border-color: var(--border-default);
        box-shadow: 0 2px 8px oklch(0% 0 0 / 0.05);
      }

      .container-query-page__bp-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 12px oklch(from var(--brand) l c h / 0.1);
      }

      .container-query-page__bp-name {
        font-weight: 700;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        text-transform: uppercase;
      }

      .container-query-page__bp-width {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      /* ── Width slider ───────────────────────────────── */

      .container-query-page__slider-row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .container-query-page__slider {
        flex: 1;
        accent-color: var(--brand, oklch(65% 0.2 270));
      }

      .container-query-page__slider-value {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary);
        min-inline-size: 4ch;
        text-align: end;
      }

      /* ── A11y list ──────────────────────────────────── */

      .container-query-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .container-query-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .container-query-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .container-query-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .container-query-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .container-query-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Tier cards ─────────────────────────────────── */

      .container-query-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .container-query-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
      }
      .container-query-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }
      .container-query-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .container-query-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .container-query-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }
      .container-query-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
      .container-query-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }
      .container-query-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .container-query-page__hero {
          padding: 2rem 1.25rem;
        }
        .container-query-page__title {
          font-size: 1.75rem;
        }
        .container-query-page__tiers {
          grid-template-columns: 1fr;
        }
        .container-query-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .container-query-page__hero {
          padding: 1.5rem 1rem;
        }
        .container-query-page__title {
          font-size: 1.5rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .container-query-page__import-code,
      .container-query-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const containerQueryProps: PropDef[] = [
  { name: 'children', type: '((size: ContainerSize) => ReactNode) | ReactNode', required: true, description: 'Render-prop receives container size; plain ReactNode uses CSS @container queries.' },
  { name: 'className', type: 'string', description: 'Additional CSS class names.' },
  { name: 'style', type: 'CSSProperties', description: 'Inline styles merged with container-type: inline-size.' },
]

const containerSizeProps: PropDef[] = [
  { name: 'width', type: 'number', description: 'Current container width in pixels.' },
  { name: 'height', type: 'number', description: 'Current container height in pixels.' },
  { name: 'breakpoint', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", description: 'Derived breakpoint name based on container width.' },
]

const breakpointDefs: PropDef[] = [
  { name: 'xs', type: '< 320px', default: '200', description: 'Extra small containers.' },
  { name: 'sm', type: '>= 320px', default: '320', description: 'Small containers like sidebars.' },
  { name: 'md', type: '>= 480px', default: '480', description: 'Medium containers.' },
  { name: 'lg', type: '>= 640px', default: '640', description: 'Large containers.' },
  { name: 'xl', type: '>= 960px', default: '960', description: 'Extra large containers.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { ContainerQuery } from '@annondeveloper/ui-kit/lite'",
  standard: "import { ContainerQuery } from '@annondeveloper/ui-kit'",
  premium: "import { ContainerQuery } from '@annondeveloper/ui-kit/premium'",
}

const BREAKPOINTS = [
  { name: 'xs', min: 0 },
  { name: 'sm', min: 320 },
  { name: 'md', min: 480 },
  { name: 'lg', min: 640 },
  { name: 'xl', min: 960 },
] as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="container-query-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

// ─── Responsive Demo Card ────────────────────────────────────────────────────

function ResponsiveDemoCard({ width, breakpoint }: { width: number; breakpoint: string }) {
  const isWide = width >= 480
  return (
    <div className={`container-query-page__demo-card${isWide ? ' container-query-page__demo-card--horizontal' : ''}`}>
      <div className="container-query-page__demo-avatar" />
      <div className="container-query-page__demo-content">
        <span className="container-query-page__demo-name">Jane Doe</span>
        <span className="container-query-page__demo-role">Senior Engineer</span>
        <div className={`container-query-page__demo-stats${isWide ? ' container-query-page__demo-stats--visible' : ''}`}>
          <span>142 commits</span>
          <span>38 PRs</span>
          <span>5 repos</span>
        </div>
      </div>
      <div className="container-query-page__size-indicator">
        {breakpoint} / {Math.round(width)}px
      </div>
    </div>
  )
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [containerWidth, setContainerWidth] = useState(600)

  const ContainerComponent = tier === 'lite' ? LiteContainerQuery : tier === 'premium' ? PremiumContainerQuery : ContainerQuery

  const reactCode = useMemo(() => {
    const importStr = IMPORT_STRINGS[tier]
    if (tier === 'lite') {
      return `${importStr}

// Lite uses CSS @container queries only (no JS render-prop)
<ContainerQuery>
  <div className="my-responsive-card">
    {/* CSS @container rules handle layout changes */}
  </div>
</ContainerQuery>

/* In your CSS: */
@container (min-width: 480px) {
  .my-responsive-card { flex-direction: row; }
}`
    }
    return `${importStr}

<ContainerQuery>
  {({ width, breakpoint }) => (
    <div style={{
      display: 'flex',
      flexDirection: width >= 480 ? 'row' : 'column',
      gap: '1rem',
    }}>
      <span>Breakpoint: {breakpoint}</span>
      <span>Width: {width}px</span>
    </div>
  )}
</ContainerQuery>`
  }, [tier])

  return (
    <section className="container-query-page__section" id="playground">
      <h2 className="container-query-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="container-query-page__section-desc">
        Drag the slider to change the container width and watch the content adapt responsively.
        {tier === 'lite'
          ? ' The Lite tier uses pure CSS @container queries -- no JavaScript measurement.'
          : ' The render-prop provides width, height, and breakpoint values.'}
      </p>

      <div className="container-query-page__playground">
        <div className="container-query-page__playground-preview">
          <div className="container-query-page__playground-result">
            <div style={{ width: `${containerWidth}px`, maxWidth: '100%', margin: '0 auto', padding: '1.5rem' }}>
              {tier === 'lite' ? (
                <ContainerComponent>
                  <ResponsiveDemoCard
                    width={containerWidth}
                    breakpoint={
                      containerWidth >= 960 ? 'xl'
                        : containerWidth >= 640 ? 'lg'
                        : containerWidth >= 480 ? 'md'
                        : containerWidth >= 320 ? 'sm'
                        : 'xs'
                    }
                  />
                </ContainerComponent>
              ) : (
                <ContainerComponent>
                  {((size: any) => (
                    <ResponsiveDemoCard width={size.width} breakpoint={size.breakpoint} />
                  )) as any}
                </ContainerComponent>
              )}
            </div>
          </div>

          <div className="container-query-page__code-tabs" style={{ marginBlockStart: '1rem' }}>
            <CopyBlock code={reactCode} language="typescript" showLineNumbers />
          </div>
        </div>

        <div className="container-query-page__playground-controls">
          <div className="container-query-page__control-group">
            <span className="container-query-page__control-label">Container Width</span>
            <div className="container-query-page__slider-row">
              <input
                type="range"
                className="container-query-page__slider"
                min={160}
                max={960}
                value={containerWidth}
                onChange={e => setContainerWidth(Number(e.target.value))}
              />
              <span className="container-query-page__slider-value">{containerWidth}px</span>
            </div>
          </div>

          <div className="container-query-page__control-group">
            <span className="container-query-page__control-label">Active Breakpoint</span>
            <div className="container-query-page__size-indicator">
              {containerWidth >= 960 ? 'xl' : containerWidth >= 640 ? 'lg' : containerWidth >= 480 ? 'md' : containerWidth >= 320 ? 'sm' : 'xs'}
            </div>
          </div>

          <div className="container-query-page__control-group">
            <span className="container-query-page__control-label">Quick Widths</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {[200, 320, 480, 640, 960].map(w => (
                <Button
                  key={w}
                  size="xs"
                  variant={containerWidth === w ? 'primary' : 'secondary'}
                  onClick={() => setContainerWidth(w)}
                >
                  {w}px
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ContainerQueryPage() {
  useStyles('container-query-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.container-query-page__section')
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
    <div className="container-query-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="container-query-page__hero">
        <h1 className="container-query-page__title">ContainerQuery</h1>
        <p className="container-query-page__desc">
          A responsive utility component that wraps children with a container query context.
          Use CSS <code>@container</code> queries or the JavaScript render-prop for adaptive layouts
          that respond to their container, not the viewport.
        </p>
        <div className="container-query-page__import-row">
          <code className="container-query-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Breakpoints ─────────────────────────────── */}
      <section className="container-query-page__section" id="breakpoints">
        <h2 className="container-query-page__section-title">
          <a href="#breakpoints">Breakpoints</a>
        </h2>
        <p className="container-query-page__section-desc">
          Five container-width breakpoints from 200px to 960px. The <code>useContainerSize</code> hook
          derives the active breakpoint from the container's measured width using a mobile-first cascade.
        </p>
        <div className="container-query-page__bp-grid">
          {BREAKPOINTS.map(bp => (
            <div key={bp.name} className="container-query-page__bp-card">
              <span className="container-query-page__bp-name">{bp.name}</span>
              <span className="container-query-page__bp-width">
                {bp.min === 0 ? '< 320px' : `>= ${bp.min}px`}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginBlockStart: '1.25rem' }}>
          <CopyBlock
            code={`const CONTAINER_BREAKPOINTS = {
  xs: 200,   // < 320px
  sm: 320,   // >= 320px
  md: 480,   // >= 480px
  lg: 640,   // >= 640px
  xl: 960,   // >= 960px
}`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 4. useContainerSize Hook ──────────────────── */}
      <section className="container-query-page__section" id="use-container-size">
        <h2 className="container-query-page__section-title">
          <a href="#use-container-size">useContainerSize Hook</a>
        </h2>
        <p className="container-query-page__section-desc">
          For advanced use cases, use the <code>useContainerSize</code> hook directly.
          It tracks element dimensions via <code>ResizeObserver</code> and returns
          <code>{' { width, height, breakpoint }'}</code>. SSR-safe with zero initial values.
          Debounced via <code>requestAnimationFrame</code> to avoid excessive re-renders.
        </p>
        <CopyBlock
          code={`import { useRef } from 'react'
import { useContainerSize } from '@annondeveloper/ui-kit'

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null)
  const { width, height, breakpoint } = useContainerSize(ref)

  return (
    <div ref={ref} style={{ containerType: 'inline-size' }}>
      <p>Container is {width}px wide (breakpoint: {breakpoint})</p>
      {breakpoint === 'lg' || breakpoint === 'xl'
        ? <WideLayout />
        : <NarrowLayout />
      }
    </div>
  )
}`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 5. resolveResponsive Utility ──────────────── */}
      <section className="container-query-page__section" id="resolve-responsive">
        <h2 className="container-query-page__section-title">
          <a href="#resolve-responsive">resolveResponsive Utility</a>
        </h2>
        <p className="container-query-page__section-desc">
          Map responsive values to breakpoints using the <code>resolveResponsive</code> helper.
          Pass a static value or a breakpoint map, and it cascades down to find the closest match.
        </p>
        <CopyBlock
          code={`import { resolveResponsive, type ResponsiveValue } from '@annondeveloper/ui-kit'

// Static value — returns directly
resolveResponsive('md', 'lg', 'sm') // => 'md'

// Breakpoint map — cascades down
const columns: ResponsiveValue<number> = { xs: 1, sm: 2, lg: 4 }

resolveResponsive(columns, 'xs', 1) // => 1
resolveResponsive(columns, 'sm', 1) // => 2
resolveResponsive(columns, 'md', 1) // => 2  (cascades from sm)
resolveResponsive(columns, 'lg', 1) // => 4
resolveResponsive(columns, 'xl', 1) // => 4  (cascades from lg)`}
          language="typescript"
          showLineNumbers
        />
      </section>

      {/* ── 6. CSS @container Queries ─────────────────── */}
      <section className="container-query-page__section" id="css-container">
        <h2 className="container-query-page__section-title">
          <a href="#css-container">CSS @container Queries</a>
        </h2>
        <p className="container-query-page__section-desc">
          The component sets <code>container-type: inline-size</code> automatically.
          You can use native CSS <code>@container</code> rules in children without any JavaScript.
          This works across all three tiers.
        </p>
        <CopyBlock
          code={`<ContainerQuery>
  <div className="profile-card">
    <img className="avatar" src="..." alt="" />
    <div className="info">...</div>
  </div>
</ContainerQuery>

/* CSS */
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@container (min-width: 480px) {
  .profile-card {
    flex-direction: row;
    align-items: center;
  }
}

@container (min-width: 640px) {
  .profile-card .stats { display: flex; }
}`}
          language="html"
          showLineNumbers
        />
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="container-query-page__section" id="tiers">
        <h2 className="container-query-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="container-query-page__section-desc">
          Choose the right balance of features and bundle size. All tiers set <code>container-type: inline-size</code>.
        </p>

        <div className="container-query-page__tiers">
          {/* Lite */}
          <div
            className={`container-query-page__tier-card${tier === 'lite' ? ' container-query-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="container-query-page__tier-header">
              <span className="container-query-page__tier-name">Lite</span>
              <span className="container-query-page__tier-size">~0.2 KB</span>
            </div>
            <p className="container-query-page__tier-desc">
              Pure CSS wrapper. Sets container-type only.
              No JS measurement, no render-prop. Use CSS @container queries in children.
            </p>
            <div className="container-query-page__tier-import">
              {IMPORT_STRINGS.lite}
            </div>
          </div>

          {/* Standard */}
          <div
            className={`container-query-page__tier-card${tier === 'standard' ? ' container-query-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="container-query-page__tier-header">
              <span className="container-query-page__tier-name">Standard</span>
              <span className="container-query-page__tier-size">~1.2 KB</span>
            </div>
            <p className="container-query-page__tier-desc">
              Full-featured with render-prop that provides width, height, and breakpoint.
              Uses ResizeObserver via useContainerSize hook. Also supports CSS @container.
            </p>
            <div className="container-query-page__tier-import">
              {IMPORT_STRINGS.standard}
            </div>
          </div>

          {/* Premium */}
          <div
            className={`container-query-page__tier-card${tier === 'premium' ? ' container-query-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="container-query-page__tier-header">
              <span className="container-query-page__tier-name">Premium</span>
              <span className="container-query-page__tier-size">~1.8 KB</span>
            </div>
            <p className="container-query-page__tier-desc">
              Everything in Standard plus entrance animation (fade-up), aurora glow border,
              and motion level support.
            </p>
            <div className="container-query-page__tier-import">
              {IMPORT_STRINGS.premium}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="container-query-page__section" id="props">
        <h2 className="container-query-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="container-query-page__section-desc">
          All props accepted by ContainerQuery. It also spreads any native div HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={containerQueryProps} />
        </Card>

        <h3 className="container-query-page__section-title" style={{ fontSize: 'var(--text-base)', marginBlockStart: '1.5rem' }}>
          ContainerSize (render-prop argument)
        </h3>
        <Card variant="default" padding="md">
          <PropsTable props={containerSizeProps} />
        </Card>

        <h3 className="container-query-page__section-title" style={{ fontSize: 'var(--text-base)', marginBlockStart: '1.5rem' }}>
          Container Breakpoints
        </h3>
        <Card variant="default" padding="md">
          <PropsTable props={breakpointDefs} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="container-query-page__section" id="accessibility">
        <h2 className="container-query-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="container-query-page__section-desc">
          ContainerQuery is a transparent layout utility with no semantic impact.
        </p>
        <Card variant="default" padding="md">
          <ul className="container-query-page__a11y-list">
            <li className="container-query-page__a11y-item">
              <span className="container-query-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Transparent wrapper:</strong> Renders a plain <code className="container-query-page__a11y-key">{'<div>'}</code> with no ARIA roles. Content semantics come from children.
              </span>
            </li>
            <li className="container-query-page__a11y-item">
              <span className="container-query-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>No layout shift:</strong> The container div has no intrinsic dimensions that could cause reflow.
              </span>
            </li>
            <li className="container-query-page__a11y-item">
              <span className="container-query-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Progressive enhancement:</strong> If <code className="container-query-page__a11y-key">ResizeObserver</code> is unavailable (SSR), returns zero dimensions gracefully.
              </span>
            </li>
            <li className="container-query-page__a11y-item">
              <span className="container-query-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Reduced motion:</strong> Premium tier respects <code className="container-query-page__a11y-key">prefers-reduced-motion</code> for entrance animations.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      {/* ── 10. Source ─────────────────────────────────── */}
      <section className="container-query-page__section" id="source">
        <h2 className="container-query-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="container-query-page__section-desc">
          View the source code on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/container-query.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="container-query-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/components/container-query.tsx (Standard)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/container-query.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="container-query-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/lite/container-query.tsx (Lite)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/container-query.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="container-query-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/premium/container-query.tsx (Premium)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/core/utils/use-container-size.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="container-query-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/core/utils/use-container-size.ts (Hook)
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/core/utils/responsive-props.ts"
            target="_blank"
            rel="noopener noreferrer"
            className="container-query-page__source-link"
          >
            <Icon name="external-link" size="sm" />
            src/core/utils/responsive-props.ts (resolveResponsive)
          </a>
        </div>
      </section>
    </div>
  )
}
