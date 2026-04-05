'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PageShell } from '@ui/components/page-shell'
import { PageShell as LitePageShell } from '@ui/lite/page-shell'
import { PageShell as PremiumPageShell } from '@ui/premium/page-shell'
import { Card } from '@ui/components/card'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { generateTheme } from '@ui/core/tokens/generator'
import { TOKEN_TO_CSS, type ThemeTokens } from '@ui/core/tokens/tokens'
import { useTheme } from '@ui/core/tokens/theme-context'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.page-shell-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: page-shell-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .page-shell-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .page-shell-page__hero::before {
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
        animation: aurora-spin-shell 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-shell {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .page-shell-page__hero::before { animation: none; }
      }

      .page-shell-page__title {
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

      .page-shell-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .page-shell-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .page-shell-page__import-code {
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

      /* ── Sections ───────────────────────────────────── */

      .page-shell-page__section {
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
        animation: section-reveal-shell 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-shell {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .page-shell-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .page-shell-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .page-shell-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .page-shell-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .page-shell-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .page-shell-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container page-shell-page (max-width: 680px) {
        .page-shell-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .page-shell-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .page-shell-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-shell-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: grid;
        place-items: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .page-shell-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .page-shell-page__playground-controls {
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

      .page-shell-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .page-shell-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .page-shell-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .page-shell-page__option-btn {
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
      .page-shell-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .page-shell-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      /* ── Tier cards ─────────────────────────────────── */

      .page-shell-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .page-shell-page__tier-card {
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

      .page-shell-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .page-shell-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand);
      }

      .page-shell-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .page-shell-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', monospace;
      }

      .page-shell-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .page-shell-page__tier-import {
        font-family: 'SF Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
      }

      /* ── A11y list ──────────────────────────────────── */

      .page-shell-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .page-shell-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .page-shell-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .page-shell-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .page-shell-page__source-link:hover {
        text-decoration: underline;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .page-shell-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .page-shell-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .page-shell-page__hero { padding: 2rem 1.25rem; }
        .page-shell-page__title { font-size: 1.75rem; }
        .page-shell-page__section { padding: 1.25rem; }
        .page-shell-page__tiers { grid-template-columns: 1fr; }
        .page-shell-page__playground { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .page-shell-page__hero { padding: 1.5rem 1rem; }
        .page-shell-page__title { font-size: 1.5rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const pageShellProps: PropDef[] = [
  { name: 'maxWidth', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'lg'", description: 'Maximum inline size of the content area.' },
  { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Internal padding scale using fluid clamp() values.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Page content to be wrapped.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full'
type Padding = 'none' | 'sm' | 'md' | 'lg'

const MAX_WIDTHS: MaxWidth[] = ['sm', 'md', 'lg', 'xl', 'full']
const PADDINGS: Padding[] = ['none', 'sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PageShell } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PageShell } from '@annondeveloper/ui-kit'",
  premium: "import { PageShell } from '@annondeveloper/ui-kit/premium'",
}

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

function OptionGroup<T extends string>({
  label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="page-shell-page__control-group">
      <span className="page-shell-page__control-label">{label}</span>
      <div className="page-shell-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`page-shell-page__option-btn${opt === value ? ' page-shell-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generators ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, maxWidth: MaxWidth, padding: Padding): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (maxWidth !== 'lg') props.push(`  maxWidth="${maxWidth}"`)
  if (padding !== 'md') props.push(`  padding="${padding}"`)

  const jsx = props.length === 0
    ? `<PageShell>\n  <h1>My Page</h1>\n  <p>Content goes here</p>\n</PageShell>`
    : `<PageShell\n${props.join('\n')}\n>\n  <h1>My Page</h1>\n  <p>Content goes here</p>\n</PageShell>`

  return `${imp}\n\n${jsx}`
}

function generateHtmlCode(tier: Tier, maxWidth: MaxWidth, padding: Padding): string {
  const cls = tier === 'lite' ? 'ui-lite-page-shell' : 'ui-page-shell'
  return `<!-- PageShell — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/page-shell.css">

<div class="${cls}" data-max-width="${maxWidth}" data-padding="${padding}">
  <h1>My Page</h1>
  <p>Content goes here</p>
</div>`
}

function generateVueCode(tier: Tier, maxWidth: MaxWidth, padding: Padding): string {
  if (tier === 'lite') {
    return `<template>\n  <div class="ui-lite-page-shell" data-max-width="${maxWidth}" data-padding="${padding}">\n    <slot />\n  </div>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = []
  if (maxWidth !== 'lg') attrs.push(`  maxWidth="${maxWidth}"`)
  if (padding !== 'md') attrs.push(`  padding="${padding}"`)
  const template = attrs.length === 0
    ? `  <PageShell>\n    <slot />\n  </PageShell>`
    : `  <PageShell\n  ${attrs.join('\n  ')}\n  >\n    <slot />\n  </PageShell>`
  return `<template>\n${template}\n</template>\n\n<script setup>\nimport { PageShell } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, maxWidth: MaxWidth, padding: Padding): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<div class="ui-lite-page-shell" data-max-width="${maxWidth}" data-padding="${padding}">\n  <ng-content></ng-content>\n</div>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<div\n  class="ui-page-shell"\n  data-max-width="${maxWidth}"\n  data-padding="${padding}"\n>\n  <ng-content></ng-content>\n</div>\n\n/* Import component CSS */\n@import '${importPath}/css/components/page-shell.css';`
}

function generateSvelteCode(tier: Tier, maxWidth: MaxWidth, padding: Padding): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<div\n  class="ui-lite-page-shell"\n  data-max-width="${maxWidth}"\n  data-padding="${padding}"\n>\n  <slot />\n</div>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { PageShell } from '${importPath}';\n</script>\n\n<PageShell\n  maxWidth="${maxWidth}"\n  padding="${padding}"\n>\n  <slot />\n</PageShell>`
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PageShellPage() {
  useStyles('page-shell-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [maxWidth, setMaxWidth] = useState<MaxWidth>('lg')
  const [padding, setPadding] = useState<Padding>('md')
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const { mode } = useTheme()

  const ShellComponent = tier === 'lite' ? LitePageShell : tier === 'premium' ? PremiumPageShell : PageShell

  const BRAND_ONLY_KEYS: (keyof ThemeTokens)[] = [
    'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow', 'borderGlow', 'aurora1', 'aurora2',
  ]

  const themeTokens = useMemo(() => {
    try { return generateTheme(brandColor, mode) } catch { return null }
  }, [brandColor, mode])

  const themeStyle = useMemo(() => {
    if (!themeTokens || brandColor === '#6366f1') return undefined
    const style: Record<string, string> = {}
    for (const key of BRAND_ONLY_KEYS) {
      const cssVar = TOKEN_TO_CSS[key]
      const value = themeTokens[key]
      if (cssVar && value) style[cssVar] = value
    }
    return style as React.CSSProperties
  }, [themeTokens, brandColor])

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.page-shell-page__section')
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
      { threshold: 0.1 }
    )
    sections.forEach(s => {
      ;(s as HTMLElement).style.opacity = '0'
      ;(s as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(s as HTMLElement).style.filter = 'blur(4px)'
      ;(s as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(s)
    })
    return () => observer.disconnect()
  }, [])

  const sizeInfo = useMemo(() => {
    if (tier === 'lite') return { js: '0.4', css: '0', total: '0.4', note: 'Inline styles only — zero CSS injection.' }
    if (tier === 'premium') return { js: '1.2', css: '0.5', total: '1.7', note: 'Wraps Standard + entrance animation + aurora wash.' }
    return { js: '0.8', css: '0.4', total: '1.2', note: 'Style engine shared — only loaded once.' }
  }, [tier])

  const reactCode = useMemo(() => generateReactCode(tier, maxWidth, padding), [tier, maxWidth, padding])
  const htmlCode = useMemo(() => generateHtmlCode(tier, maxWidth, padding), [tier, maxWidth, padding])
  const vueCode = useMemo(() => generateVueCode(tier, maxWidth, padding), [tier, maxWidth, padding])
  const angularCode = useMemo(() => generateAngularCode(tier, maxWidth, padding), [tier, maxWidth, padding])
  const svelteCode = useMemo(() => generateSvelteCode(tier, maxWidth, padding), [tier, maxWidth, padding])

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  return (
    <div className="page-shell-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="page-shell-page__hero">
        <h1 className="page-shell-page__title">PageShell</h1>
        <p className="page-shell-page__desc">
          A layout container that wraps page content with consistent max-width, padding,
          and vertical spacing between children. The foundation for every page layout.
        </p>
        <div className="page-shell-page__import-row">
          <code className="page-shell-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <section className="page-shell-page__section" id="playground">
        <h2 className="page-shell-page__section-title">Live Playground</h2>
        <p className="page-shell-page__section-desc">
          Tweak maxWidth and padding to see the shell adapt in real-time. The playground generates code for 5 frameworks.
        </p>

        <div className="page-shell-page__playground">
          <div className="page-shell-page__playground-preview">
            <div className="page-shell-page__playground-result" style={{ padding: 0 }}>
              <ShellComponent maxWidth={maxWidth} padding={padding}>
                <Card padding="md">
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>Sample Content</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      This content sits inside the PageShell. Change maxWidth and padding to see how the container adapts.
                    </p>
                  </div>
                </Card>
                <Card padding="sm">
                  <div style={{ padding: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    Another child — the gap between children is automatic.
                  </div>
                </Card>
              </ShellComponent>
            </div>

            <div>
              <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
                <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
                <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
                <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
                <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
                <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
              </Tabs>
            </div>
          </div>

          <div className="page-shell-page__playground-controls">
            <OptionGroup label="Max Width" options={MAX_WIDTHS} value={maxWidth} onChange={setMaxWidth} />
            <OptionGroup label="Padding" options={PADDINGS} value={padding} onChange={setPadding} />
            {tier !== 'lite' && (
              <OptionGroup
                label="Motion Level"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Max Width Variants ──────────────────────── */}
      <section className="page-shell-page__section" id="max-widths">
        <h2 className="page-shell-page__section-title">Max Width Variants</h2>
        <p className="page-shell-page__section-desc">
          Five max-width presets — sm (40rem), md (48rem), lg (64rem), xl (80rem), and full (100%).
        </p>
        <div className="page-shell-page__preview">
          {MAX_WIDTHS.map(mw => (
            <div key={mw} style={{ marginBlockEnd: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.25rem' }}>{mw}</div>
              <ShellComponent maxWidth={mw} padding="sm">
                <div style={{ background: 'var(--brand-subtle, oklch(60% 0.1 270 / 0.1))', borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                  maxWidth="{mw}"
                </div>
              </ShellComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Padding Scale ───────────────────────────── */}
      <section className="page-shell-page__section" id="padding">
        <h2 className="page-shell-page__section-title">Padding Scale</h2>
        <p className="page-shell-page__section-desc">
          Fluid padding using clamp() — automatically adjusts between viewport sizes.
        </p>
        <div className="page-shell-page__preview">
          {PADDINGS.map(p => (
            <div key={p} style={{ marginBlockEnd: '1rem', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <ShellComponent maxWidth="full" padding={p}>
                <div style={{ background: 'var(--brand-subtle, oklch(60% 0.1 270 / 0.1))', borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                  padding="{p}"
                </div>
              </ShellComponent>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Weight Tiers ────────────────────────────── */}
      <section className="page-shell-page__section" id="tiers">
        <h2 className="page-shell-page__section-title">Weight Tiers</h2>
        <p className="page-shell-page__section-desc">
          Pick the right tier for your performance budget. All tiers share the same API.
        </p>
        <div className="page-shell-page__tiers">
          {TIERS.map(t => (
            <div
              key={t.id}
              className={`page-shell-page__tier-card${tier === t.id ? ' page-shell-page__tier-card--active' : ''}`}
              onClick={() => setTier(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setTier(t.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="page-shell-page__tier-name">{t.label}</span>
                <span className="page-shell-page__tier-size">
                  {t.id === 'lite' ? '~0.4 KB gzip' : t.id === 'premium' ? '~1.7 KB gzip' : '~1.2 KB gzip'}
                </span>
              </div>
              <span className="page-shell-page__tier-desc">
                {t.id === 'lite' && 'Inline styles, no CSS injection, no motion. Minimal footprint.'}
                {t.id === 'standard' && 'Scoped CSS with @scope, fluid clamp() values, print styles.'}
                {t.id === 'premium' && 'Standard features + entrance animation, aurora background wash.'}
              </span>
              <code className="page-shell-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Props Table ─────────────────────────────── */}
      <section className="page-shell-page__section" id="props">
        <h2 className="page-shell-page__section-title">Props</h2>
        <PropsTable props={pageShellProps} />
      </section>

      {/* ── 7. Accessibility ───────────────────────────── */}
      <section className="page-shell-page__section" id="accessibility">
        <h2 className="page-shell-page__section-title">Accessibility</h2>
        <p className="page-shell-page__section-desc">
          PageShell is a semantic layout wrapper. It does not add ARIA roles — your page content
          should use proper heading hierarchy and landmarks.
        </p>
        <ul className="page-shell-page__a11y-list">
          <li className="page-shell-page__a11y-item">
            <Icon name="check" size="sm" className="page-shell-page__a11y-icon" />
            Renders a plain <code>&lt;div&gt;</code> — no implicit ARIA role.
          </li>
          <li className="page-shell-page__a11y-item">
            <Icon name="check" size="sm" className="page-shell-page__a11y-icon" />
            Logical properties (<code>inline-size</code>, <code>margin-inline</code>) for RTL support.
          </li>
          <li className="page-shell-page__a11y-item">
            <Icon name="check" size="sm" className="page-shell-page__a11y-icon" />
            Print styles remove max-width and padding for full-page print.
          </li>
          <li className="page-shell-page__a11y-item">
            <Icon name="check" size="sm" className="page-shell-page__a11y-icon" />
            All children can be focused and navigated with keyboard.
          </li>
          <li className="page-shell-page__a11y-item">
            <Icon name="check" size="sm" className="page-shell-page__a11y-icon" />
            Fluid padding scales with viewport — respects user zoom preferences.
          </li>
        </ul>
      </section>

      {/* ── 8. Performance ─────────────────────────────── */}
      <section className="page-shell-page__section" id="performance">
        <h2 className="page-shell-page__section-title">Bundle Size</h2>
        <p className="page-shell-page__section-desc">
          PageShell is one of the lightest components in the library.
        </p>
        <div className="page-shell-page__size-breakdown">
          <div className="page-shell-page__size-row">
            <span>JS:</span> <strong>{sizeInfo.js} KB gzip</strong>
          </div>
          <div className="page-shell-page__size-row">
            <span>CSS:</span> <strong>{sizeInfo.css} KB gzip</strong>
          </div>
          <div className="page-shell-page__size-row">
            <span>Total:</span> <strong>{sizeInfo.total} KB gzip</strong>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBlockStart: '0.25rem' }}>
            {sizeInfo.note}
          </p>
        </div>
      </section>

      {/* ── 9. Brand Color ─────────────────────────────── */}
      <section className="page-shell-page__section" id="brand-color">
        <h2 className="page-shell-page__section-title">Brand Color</h2>
        <p className="page-shell-page__section-desc">
          PageShell inherits the brand color from the theme. Use ColorInput to preview with a custom brand.
        </p>
        <div style={{ maxInlineSize: 300 }}>
          <ColorInput value={brandColor} onChange={setBrandColor} label="Brand Color" />
        </div>
      </section>

      {/* ── 10. Source Code ─────────────────────────────── */}
      <section className="page-shell-page__section" id="source">
        <h2 className="page-shell-page__section-title">Source</h2>
        <a
          className="page-shell-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/page-shell.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="code" size="sm" /> Source on GitHub
        </a>
      </section>
    </div>
  )
}
