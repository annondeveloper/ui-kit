'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { PageHeader } from '@ui/components/page-header'
import { PageHeader as LitePageHeader } from '@ui/lite/page-header'
import { PageHeader as PremiumPageHeader } from '@ui/premium/page-header'
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
    @scope (.page-header-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: page-header-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .page-header-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .page-header-page__hero::before {
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
        animation: aurora-spin-header 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-header {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .page-header-page__hero::before { animation: none; }
      }

      .page-header-page__title {
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

      .page-header-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .page-header-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .page-header-page__import-code {
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

      .page-header-page__section {
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
        animation: section-reveal-hdr 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-hdr {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .page-header-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .page-header-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .page-header-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .page-header-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        min-block-size: 80px;
      }

      .page-header-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .page-header-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container page-header-page (max-width: 680px) {
        .page-header-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .page-header-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .page-header-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header-page__playground-result {
        overflow: hidden;
        min-block-size: 120px;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
      }

      .page-header-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .page-header-page__playground-controls {
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

      .page-header-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .page-header-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .page-header-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .page-header-page__option-btn {
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
      .page-header-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .page-header-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .page-header-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .page-header-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
      }

      /* ── Tier cards ─────────────────────────────────── */

      .page-header-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .page-header-page__tier-card {
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

      .page-header-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .page-header-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand);
      }

      .page-header-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .page-header-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', monospace;
      }

      .page-header-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .page-header-page__tier-import {
        font-family: 'SF Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        word-break: break-all;
      }

      /* ── A11y list ──────────────────────────────────── */

      .page-header-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .page-header-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .page-header-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .page-header-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .page-header-page__source-link:hover {
        text-decoration: underline;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .page-header-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .page-header-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .page-header-page__hero { padding: 2rem 1.25rem; }
        .page-header-page__title { font-size: 1.75rem; }
        .page-header-page__section { padding: 1.25rem; }
        .page-header-page__tiers { grid-template-columns: 1fr; }
        .page-header-page__playground { grid-template-columns: 1fr; }
      }

      @media (max-width: 400px) {
        .page-header-page__hero { padding: 1.5rem 1rem; }
        .page-header-page__title { font-size: 1.5rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const pageHeaderProps: PropDef[] = [
  { name: 'title', type: 'string', required: true, description: 'Page title text displayed as an h1.' },
  { name: 'description', type: 'string', description: 'Optional description below the title.' },
  { name: 'actions', type: 'ReactNode', description: 'Action buttons rendered on the right side.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Title sizing scale.' },
  { name: 'breadcrumbs', type: 'ReactNode', description: 'Breadcrumb navigation rendered above the title.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

const SIZES: Size[] = ['sm', 'md', 'lg']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { PageHeader } from '@annondeveloper/ui-kit/lite'",
  standard: "import { PageHeader } from '@annondeveloper/ui-kit'",
  premium: "import { PageHeader } from '@annondeveloper/ui-kit/premium'",
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
    <div className="page-header-page__control-group">
      <span className="page-header-page__control-label">{label}</span>
      <div className="page-header-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`page-header-page__option-btn${opt === value ? ' page-header-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />
      {label}
    </label>
  )
}

// ─── Code Generators ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, titleText: string, descText: string, size: Size, showActions: boolean, showBreadcrumbs: boolean): string {
  const imp = IMPORT_STRINGS[tier]
  const props: string[] = [`  title="${titleText}"`]
  if (descText) props.push(`  description="${descText}"`)
  if (size !== 'md') props.push(`  size="${size}"`)
  if (showActions) props.push(`  actions={<><Button size="sm" variant="secondary">Edit</Button><Button size="sm">Save</Button></>}`)
  if (showBreadcrumbs) props.push(`  breadcrumbs={<nav>Home / Settings</nav>}`)

  return `${imp}\n${showActions ? "import { Button } from '@annondeveloper/ui-kit'\n" : ''}\n<PageHeader\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, titleText: string, descText: string, size: Size): string {
  const cls = tier === 'lite' ? 'ui-lite-page-header' : 'ui-page-header'
  return `<!-- PageHeader — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/page-header.css">

<header class="${cls}" data-size="${size}">
  <div class="${cls}__row">
    <div class="${cls}__content">
      <h1 class="${cls}__title">${titleText}</h1>
      ${descText ? `<p class="${cls}__description">${descText}</p>` : ''}
    </div>
  </div>
</header>`
}

function generateVueCode(tier: Tier, titleText: string, descText: string, size: Size): string {
  if (tier === 'lite') {
    return `<template>\n  <header class="ui-lite-page-header" data-size="${size}">\n    <h1>${titleText}</h1>\n    ${descText ? `<p>${descText}</p>` : ''}\n  </header>\n</template>\n\n<style>\n@import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  title="${titleText}"`]
  if (descText) attrs.push(`  description="${descText}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  return `<template>\n  <PageHeader\n  ${attrs.join('\n  ')}\n  />\n</template>\n\n<script setup>\nimport { PageHeader } from '${importPath}'\n</script>`
}

function generateAngularCode(tier: Tier, titleText: string, descText: string, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (CSS-only) -->\n<header class="ui-lite-page-header" data-size="${size}">\n  <h1>${titleText}</h1>\n  ${descText ? `<p>${descText}</p>` : ''}\n</header>\n\n/* In styles.css */\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->\n<header\n  class="ui-page-header"\n  data-size="${size}"\n>\n  <div class="ui-page-header__row">\n    <div class="ui-page-header__content">\n      <h1 class="ui-page-header__title">${titleText}</h1>\n      ${descText ? `<p class="ui-page-header__description">${descText}</p>` : ''}\n    </div>\n  </div>\n</header>\n\n/* Import component CSS */\n@import '${importPath}/css/components/page-header.css';`
}

function generateSvelteCode(tier: Tier, titleText: string, descText: string, size: Size): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->\n<header class="ui-lite-page-header" data-size="${size}">\n  <h1>${titleText}</h1>\n  ${descText ? `<p>${descText}</p>` : ''}\n</header>\n\n<style>\n  @import '@annondeveloper/ui-kit/lite/styles.css';\n</style>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [`  title="${titleText}"`]
  if (descText) attrs.push(`  description="${descText}"`)
  if (size !== 'md') attrs.push(`  size="${size}"`)
  return `<script>\n  import { PageHeader } from '${importPath}';\n</script>\n\n<PageHeader\n${attrs.join('\n')}\n/>`
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PageHeaderPage() {
  useStyles('page-header-page', pageStyles)

  const { tier, setTier } = useTier()
  const [brandColor, setBrandColor] = useState('#6366f1')
  const [size, setSize] = useState<Size>('md')
  const [titleText, setTitleText] = useState('Dashboard')
  const [descText, setDescText] = useState('Manage your account settings and preferences.')
  const [showActions, setShowActions] = useState(true)
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const { mode } = useTheme()

  const HeaderComponent = tier === 'lite' ? LitePageHeader : tier === 'premium' ? PremiumPageHeader : PageHeader

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
    const sections = document.querySelectorAll('.page-header-page__section')
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
    if (tier === 'lite') return { js: '0.5', css: '0', total: '0.5', note: 'Inline styles only — zero CSS injection.' }
    if (tier === 'premium') return { js: '1.4', css: '0.6', total: '2.0', note: 'Wraps Standard + entrance animation + gradient title.' }
    return { js: '1.0', css: '0.5', total: '1.5', note: 'Style engine shared — only loaded once.' }
  }, [tier])

  const reactCode = useMemo(() => generateReactCode(tier, titleText, descText, size, showActions, showBreadcrumbs), [tier, titleText, descText, size, showActions, showBreadcrumbs])
  const htmlCode = useMemo(() => generateHtmlCode(tier, titleText, descText, size), [tier, titleText, descText, size])
  const vueCode = useMemo(() => generateVueCode(tier, titleText, descText, size), [tier, titleText, descText, size])
  const angularCode = useMemo(() => generateAngularCode(tier, titleText, descText, size), [tier, titleText, descText, size])
  const svelteCode = useMemo(() => generateSvelteCode(tier, titleText, descText, size), [tier, titleText, descText, size])

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

  const breadcrumbsNode = showBreadcrumbs ? (
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
      Home <span style={{ margin: '0 0.25rem' }}>/</span> Settings <span style={{ margin: '0 0.25rem' }}>/</span> General
    </span>
  ) : undefined

  const actionsNode = showActions ? (
    <>
      <Button size="sm" variant="secondary" icon={<Icon name="edit" size="sm" />}>Edit</Button>
      <Button size="sm" variant="primary" icon={<Icon name="check" size="sm" />}>Save</Button>
    </>
  ) : undefined

  return (
    <div className="page-header-page" style={themeStyle}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="page-header-page__hero">
        <h1 className="page-header-page__title">PageHeader</h1>
        <p className="page-header-page__desc">
          A page-level header with title, description, breadcrumbs, and action buttons.
          Responsive — stacks vertically on narrow containers.
        </p>
        <div className="page-header-page__import-row">
          <code className="page-header-page__import-code">{IMPORT_STRINGS[tier]}</code>
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <section className="page-header-page__section" id="playground">
        <h2 className="page-header-page__section-title">Live Playground</h2>
        <p className="page-header-page__section-desc">
          Tweak title, description, size, and optional features in real-time. The playground generates code for all 5 frameworks.
        </p>

        <div className="page-header-page__playground">
          <div className="page-header-page__playground-preview">
            <div className="page-header-page__playground-result">
              <HeaderComponent
                title={titleText}
                description={descText || undefined}
                size={size}
                actions={actionsNode}
                breadcrumbs={breadcrumbsNode}
              />
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

          <div className="page-header-page__playground-controls">
            <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />

            {tier !== 'lite' && (
              <OptionGroup
                label="Motion Level"
                options={['0', '1', '2', '3'] as const}
                value={String(motion) as '0' | '1' | '2' | '3'}
                onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
              />
            )}

            <div className="page-header-page__control-group">
              <span className="page-header-page__control-label">Title</span>
              <input
                type="text"
                value={titleText}
                onChange={e => setTitleText(e.target.value)}
                className="page-header-page__text-input"
                placeholder="Page title..."
              />
            </div>

            <div className="page-header-page__control-group">
              <span className="page-header-page__control-label">Description</span>
              <input
                type="text"
                value={descText}
                onChange={e => setDescText(e.target.value)}
                className="page-header-page__text-input"
                placeholder="Optional description..."
              />
            </div>

            <div className="page-header-page__control-group">
              <span className="page-header-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Actions" checked={showActions} onChange={setShowActions} />
                <Toggle label="Breadcrumbs" checked={showBreadcrumbs} onChange={setShowBreadcrumbs} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Size Variants ───────────────────────────── */}
      <section className="page-header-page__section" id="sizes">
        <h2 className="page-header-page__section-title">Size Scale</h2>
        <p className="page-header-page__section-desc">
          Three title sizes using fluid clamp() values — sm for secondary pages, md for standard pages, lg for landing pages.
        </p>
        <div className="page-header-page__preview">
          {SIZES.map(s => (
            <div key={s} style={{ paddingBlockEnd: '1rem', borderBlockEnd: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem', fontFamily: 'SF Mono, monospace' }}>size="{s}"</div>
              <HeaderComponent title={`${s.toUpperCase()} Title`} description={`This is a ${s} size page header.`} size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. With Actions ────────────────────────────── */}
      <section className="page-header-page__section" id="actions">
        <h2 className="page-header-page__section-title">With Actions</h2>
        <p className="page-header-page__section-desc">
          Pass action buttons to the right side of the header. They stack below the title on narrow viewports.
        </p>
        <div className="page-header-page__preview">
          <HeaderComponent
            title="User Settings"
            description="Manage your account settings and preferences."
            actions={
              <>
                <Button size="sm" variant="ghost">Cancel</Button>
                <Button size="sm" variant="primary" icon={<Icon name="check" size="sm" />}>Save Changes</Button>
              </>
            }
          />
        </div>
        <CopyBlock
          code={`<PageHeader\n  title="User Settings"\n  description="Manage your account settings and preferences."\n  actions={\n    <>\n      <Button size="sm" variant="ghost">Cancel</Button>\n      <Button size="sm">Save Changes</Button>\n    </>\n  }\n/>`}
          language="typescript"
        />
      </section>

      {/* ── 5. With Breadcrumbs ────────────────────────── */}
      <section className="page-header-page__section" id="breadcrumbs">
        <h2 className="page-header-page__section-title">With Breadcrumbs</h2>
        <p className="page-header-page__section-desc">
          Add breadcrumb navigation above the title for deep page hierarchies.
        </p>
        <div className="page-header-page__preview">
          <HeaderComponent
            title="General Settings"
            description="Configure your application defaults."
            breadcrumbs={
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Home <span style={{ margin: '0 0.25rem' }}>/</span> Settings <span style={{ margin: '0 0.25rem' }}>/</span> General
              </span>
            }
            actions={<Button size="sm" variant="secondary">Reset</Button>}
          />
        </div>
      </section>

      {/* ── 6. Weight Tiers ────────────────────────────── */}
      <section className="page-header-page__section" id="tiers">
        <h2 className="page-header-page__section-title">Weight Tiers</h2>
        <p className="page-header-page__section-desc">
          Pick the right tier for your performance budget. All tiers share the same API.
        </p>
        <div className="page-header-page__tiers">
          {TIERS.map(t => (
            <div
              key={t.id}
              className={`page-header-page__tier-card${tier === t.id ? ' page-header-page__tier-card--active' : ''}`}
              onClick={() => setTier(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setTier(t.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="page-header-page__tier-name">{t.label}</span>
                <span className="page-header-page__tier-size">
                  {t.id === 'lite' ? '~0.5 KB gzip' : t.id === 'premium' ? '~2.0 KB gzip' : '~1.5 KB gzip'}
                </span>
              </div>
              <span className="page-header-page__tier-desc">
                {t.id === 'lite' && 'Inline styles, no CSS injection, no motion. Minimal footprint.'}
                {t.id === 'standard' && 'Scoped CSS with @scope, fluid typography, container queries, print styles.'}
                {t.id === 'premium' && 'Standard features + entrance animation, gradient title effect.'}
              </span>
              <code className="page-header-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. Props Table ─────────────────────────────── */}
      <section className="page-header-page__section" id="props">
        <h2 className="page-header-page__section-title">Props</h2>
        <PropsTable props={pageHeaderProps} />
      </section>

      {/* ── 8. Accessibility ───────────────────────────── */}
      <section className="page-header-page__section" id="accessibility">
        <h2 className="page-header-page__section-title">Accessibility</h2>
        <p className="page-header-page__section-desc">
          PageHeader uses semantic HTML elements with proper ARIA support.
        </p>
        <ul className="page-header-page__a11y-list">
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Renders as <code>&lt;header&gt;</code> landmark with <code>&lt;h1&gt;</code> for the title.
          </li>
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Breadcrumb region has <code>aria-label="Breadcrumb"</code> on its <code>&lt;nav&gt;</code>.
          </li>
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Uses <code>text-wrap: balance</code> for title and <code>text-wrap: pretty</code> for description.
          </li>
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Forced colors mode: title uses <code>CanvasText</code>, description uses <code>GrayText</code>.
          </li>
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Print styles hide action buttons — only content is printed.
          </li>
          <li className="page-header-page__a11y-item">
            <Icon name="check" size="sm" className="page-header-page__a11y-icon" />
            Container query (<code>@container</code>) stacks layout below 480px — no horizontal scroll.
          </li>
        </ul>
      </section>

      {/* ── 9. Performance ─────────────────────────────── */}
      <section className="page-header-page__section" id="performance">
        <h2 className="page-header-page__section-title">Bundle Size</h2>
        <p className="page-header-page__section-desc">
          PageHeader is a lightweight layout component with minimal JS overhead.
        </p>
        <div className="page-header-page__size-breakdown">
          <div className="page-header-page__size-row">
            <span>JS:</span> <strong>{sizeInfo.js} KB gzip</strong>
          </div>
          <div className="page-header-page__size-row">
            <span>CSS:</span> <strong>{sizeInfo.css} KB gzip</strong>
          </div>
          <div className="page-header-page__size-row">
            <span>Total:</span> <strong>{sizeInfo.total} KB gzip</strong>
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBlockStart: '0.25rem' }}>
            {sizeInfo.note}
          </p>
        </div>
      </section>

      {/* ── 10. Brand Color ─────────────────────────────── */}
      <section className="page-header-page__section" id="brand-color">
        <h2 className="page-header-page__section-title">Brand Color</h2>
        <p className="page-header-page__section-desc">
          PageHeader inherits the brand color for the title gradient (premium) and section accents.
          Use ColorInput to preview with a custom brand.
        </p>
        <div style={{ maxInlineSize: 300 }}>
          <ColorInput value={brandColor} onChange={setBrandColor} label="Brand Color" />
        </div>
      </section>

      {/* ── 11. Source Code ─────────────────────────────── */}
      <section className="page-header-page__section" id="source">
        <h2 className="page-header-page__section-title">Source</h2>
        <a
          className="page-header-page__source-link"
          href="https://github.com/annondeveloper/ui-kit/blob/main/src/components/page-header.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="code" size="sm" /> Source on GitHub
        </a>
      </section>
    </div>
  )
}
