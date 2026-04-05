'use client'

import { useState, useMemo, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NativeTooltip } from '@ui/components/native-tooltip'
import { NativeTooltip as LiteNativeTooltip } from '@ui/lite/native-tooltip'
import { NativeTooltip as PremiumNativeTooltip } from '@ui/premium/native-tooltip'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { ColorInput } from '@ui/components/color-input'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ──────────────────────────────────────────────────────────────────

type Placement = 'default'

// ─── Props ──────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'content', type: 'string', required: true, description: 'Text to display in the native browser tooltip (the HTML title attribute).' },
  { name: 'children', type: 'ReactElement', required: true, description: 'A single React element that will receive the title attribute.' },
]

// ─── Page Styles ────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.native-tooltip-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: native-tooltip-page;
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

      /* ── Playground ─────────────────────────────────── */

      .native-tooltip-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        min-block-size: 260px;
      }

      @container native-tooltip-page (max-width: 640px) {
        .native-tooltip-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .native-tooltip-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .native-tooltip-page__playground-result {
        padding: 3rem 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        position: relative;
        min-block-size: 100px;
      }

      .native-tooltip-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .native-tooltip-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
      }

      .native-tooltip-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .native-tooltip-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .native-tooltip-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .native-tooltip-page__option-btn {
        padding: 0.25rem 0.625rem;
        font-size: var(--text-xs, 0.75rem);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        transition: all 0.12s;
      }
      .native-tooltip-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .native-tooltip-page__option-btn--active {
        background: var(--brand);
        border-color: var(--brand);
        color: oklch(100% 0 0);
      }

      .native-tooltip-page__text-input {
        padding: 0.375rem 0.625rem;
        font-size: var(--text-sm, 0.875rem);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: var(--bg-base);
        color: var(--text-primary);
        font-family: inherit;
        outline: none;
        inline-size: 100%;
      }
      .native-tooltip-page__text-input:focus {
        border-color: var(--brand);
        box-shadow: 0 0 0 2px oklch(from var(--brand) l c h / 0.15);
      }

      .native-tooltip-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .native-tooltip-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .native-tooltip-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-success, oklch(70% 0.17 145));
        font-weight: 500;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .native-tooltip-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      @container native-tooltip-page (max-width: 640px) {
        .native-tooltip-page__tiers {
          grid-template-columns: 1fr;
        }
      }

      .native-tooltip-page__tier-card {
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

      .native-tooltip-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .native-tooltip-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
      }

      .native-tooltip-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .native-tooltip-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .native-tooltip-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .native-tooltip-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .native-tooltip-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
      }

      /* ── Accessibility ─────────────────────────────── */

      .native-tooltip-page__a11y-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .native-tooltip-page__a11y-item {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 1rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .native-tooltip-page__a11y-icon {
        flex-shrink: 0;
        color: var(--status-success, oklch(70% 0.17 145));
        font-size: 1.125rem;
      }

      .native-tooltip-page__a11y-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .native-tooltip-page__a11y-text strong {
        color: var(--text-primary);
        display: block;
        margin-block-end: 0.125rem;
      }
    }
  }
`

// ─── Import strings ─────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { NativeTooltip } from '@annondeveloper/ui-kit'",
  lite: "import { NativeTooltip } from '@annondeveloper/ui-kit/lite'",
  premium: "import { NativeTooltip } from '@annondeveloper/ui-kit/premium'",
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="native-tooltip-page__control-group">
      <span className="native-tooltip-page__control-label">{label}</span>
      <div className="native-tooltip-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`native-tooltip-page__option-btn${opt === value ? ' native-tooltip-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generators ────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, content: string, childTag: string): string {
  const importStr = IMPORT_STRINGS[tier]
  return `${importStr}

<NativeTooltip content="${content}">
  <${childTag}>Hover me</${childTag}>
</NativeTooltip>`
}

function generateHtmlCode(content: string, childTag: string): string {
  return `<!-- NativeTooltip uses the native HTML title attribute -->
<!-- No JavaScript or CSS needed -->

<${childTag} title="${content}">
  Hover me
</${childTag}>`
}

function generateVueCode(tier: Tier, content: string, childTag: string): string {
  if (tier === 'lite') {
    return `<template>
  <!-- Lite: NativeTooltip is just a title attribute -->
  <${childTag} title="${content}">
    Hover me
  </${childTag}>
</template>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>
  <NativeTooltip content="${content}">
    <${childTag}>Hover me</${childTag}>
  </NativeTooltip>
</template>

<script setup>
import { NativeTooltip } from '${importPath}'
</script>`
}

function generateAngularCode(tier: Tier, content: string, childTag: string): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier (native title attribute) -->
<${childTag} title="${content}">
  Hover me
</${childTag}>`
  }
  return `<!-- Angular — ${tier === 'premium' ? 'Premium' : 'Standard'} tier -->
<!-- NativeTooltip maps to the native title attribute -->
<${childTag} [title]="'${content}'">
  Hover me
</${childTag}>

/* No CSS import needed — uses native browser tooltip */`
}

function generateSvelteCode(tier: Tier, content: string, childTag: string): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (native title attribute) -->
<${childTag} title="${content}">
  Hover me
</${childTag}>`
  }
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>
  import { NativeTooltip } from '${importPath}';
</script>

<NativeTooltip content="${content}">
  <${childTag}>Hover me</${childTag}>
</NativeTooltip>`
}

// ─── Playground Section ─────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const effectiveTier = tier

  const [content, setContent] = useState('Helpful tooltip text')
  const [childTag, setChildTag] = useState<'button' | 'span' | 'a' | 'div'>('button')
  const [copyStatus, setCopyStatus] = useState('')
  // Motion Level — NativeTooltip has no motion, but we expose the control
  // for consistency with the playground pattern across all component pages.
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const motionNote = 'NativeTooltip uses browser-native tooltips — motion has no effect.'

  const TooltipComponent = effectiveTier === 'lite' ? LiteNativeTooltip : effectiveTier === 'premium' ? PremiumNativeTooltip : NativeTooltip

  const reactCode = useMemo(
    () => generateReactCode(tier, content, childTag),
    [tier, content, childTag],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(content, childTag),
    [content, childTag],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, content, childTag),
    [tier, content, childTag],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, content, childTag),
    [tier, content, childTag],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, content, childTag),
    [tier, content, childTag],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

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

  return (
    <section className="native-tooltip-page__section" id="playground">
      <h2 className="native-tooltip-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="native-tooltip-page__section-desc">
        Configure the tooltip content and child element. Hover the preview to see the native
        browser tooltip. Generated code updates as you change settings.
      </p>

      <div className="native-tooltip-page__playground">
        <div className="native-tooltip-page__playground-preview">
          <div className="native-tooltip-page__playground-result">
            <TooltipComponent content={content}>
              {childTag === 'button' ? (
                <Button variant="secondary">Hover me</Button>
              ) : childTag === 'a' ? (
                <a href="#playground" className="native-tooltip-page__text-link">Hover me</a>
              ) : (
                <span style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'default' }}>
                  Hover me
                </span>
              )}
            </TooltipComponent>
          </div>

          <div className="native-tooltip-page__code-tabs">
            <div className="native-tooltip-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="native-tooltip-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="native-tooltip-page__playground-controls">
          <OptionGroup
            label="Child Element"
            options={['button', 'span', 'a', 'div'] as const}
            value={childTag}
            onChange={setChildTag}
          />

          <OptionGroup
            label="Motion Level"
            options={['0', '1', '2', '3'] as const}
            value={String(motion) as '0' | '1' | '2' | '3'}
            onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
          />
          <p style={{ fontSize: 'var(--text-xs, 0.75rem)', color: 'var(--text-tertiary)', margin: 0 }}>
            {motionNote}
          </p>

          <div className="native-tooltip-page__control-group">
            <span className="native-tooltip-page__control-label">Tooltip Content</span>
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="native-tooltip-page__text-input"
              placeholder="Tooltip text..."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NativeTooltipPage() {
  useStyles('native-tooltip-page', pageStyles)
  const { tier, setTier } = useTier()
  const effectiveTier = tier
  const [brandColor, setBrandColor] = useState('#6366f1')

  const TooltipComponent = effectiveTier === 'lite' ? LiteNativeTooltip : effectiveTier === 'premium' ? PremiumNativeTooltip : NativeTooltip

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
          <code className="native-tooltip-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyBlock code={IMPORT_STRINGS[tier]} language="typescript" />
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
          <TooltipComponent content="Save your changes">
            <Button>Save</Button>
          </TooltipComponent>
          <TooltipComponent content="Discard and go back">
            <Button variant="secondary">Cancel</Button>
          </TooltipComponent>
          <TooltipComponent content="Remove this item permanently">
            <Button variant="ghost">Delete</Button>
          </TooltipComponent>
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
          <TooltipComponent content="Search the documentation">
            <button className="native-tooltip-page__icon-btn" aria-label="Search">&#x1F50D;</button>
          </TooltipComponent>
          <TooltipComponent content="Toggle dark mode">
            <button className="native-tooltip-page__icon-btn" aria-label="Theme">&#x1F319;</button>
          </TooltipComponent>
          <TooltipComponent content="View notification settings">
            <button className="native-tooltip-page__icon-btn" aria-label="Notifications">&#x1F514;</button>
          </TooltipComponent>
          <TooltipComponent content="Opens in a new tab">
            <a href="#elements" className="native-tooltip-page__text-link">Documentation link</a>
          </TooltipComponent>
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
          <TooltipComponent content="This action will permanently delete all selected items from your account. This cannot be undone. Please make sure you have backed up any important data before proceeding.">
            <Button variant="secondary">Hover for details</Button>
          </TooltipComponent>
        </div>
      </section>

      {/* ── 4. Live Playground ────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 5. Weight Tiers ──────────────────────────── */}
      <section className="native-tooltip-page__section" id="tiers">
        <h2 className="native-tooltip-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="native-tooltip-page__section-desc">
          NativeTooltip is identical across all tiers since it uses zero CSS and zero JS at runtime
          -- it simply sets the HTML <code>title</code> attribute. Choose any tier for the same
          zero-overhead result.
        </p>
        <div className="native-tooltip-page__tiers">
          <div
            className={`native-tooltip-page__tier-card${tier === 'lite' ? ' native-tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
          >
            <div className="native-tooltip-page__tier-header">
              <span className="native-tooltip-page__tier-name">Lite</span>
              <span className="native-tooltip-page__tier-size">~0 KB gzip</span>
            </div>
            <p className="native-tooltip-page__tier-desc">
              Re-export of standard. No CSS, no JS overhead.
            </p>
            <code className="native-tooltip-page__tier-import">
              {IMPORT_STRINGS.lite}
            </code>
          </div>
          <div
            className={`native-tooltip-page__tier-card${tier === 'standard' ? ' native-tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
          >
            <div className="native-tooltip-page__tier-header">
              <span className="native-tooltip-page__tier-name">Standard</span>
              <span className="native-tooltip-page__tier-size">~0.1 KB gzip</span>
            </div>
            <p className="native-tooltip-page__tier-desc">
              Clones title onto child. Zero runtime CSS.
            </p>
            <code className="native-tooltip-page__tier-import">
              {IMPORT_STRINGS.standard}
            </code>
          </div>
          <div
            className={`native-tooltip-page__tier-card${tier === 'premium' ? ' native-tooltip-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
          >
            <div className="native-tooltip-page__tier-header">
              <span className="native-tooltip-page__tier-name">Premium</span>
              <span className="native-tooltip-page__tier-size">~0 KB gzip</span>
            </div>
            <p className="native-tooltip-page__tier-desc">
              Re-export of standard. Browser handles presentation.
            </p>
            <code className="native-tooltip-page__tier-import">
              {IMPORT_STRINGS.premium}
            </code>
          </div>
        </div>
      </section>

      {/* ── 6. Accessibility ─────────────────────────── */}
      <section className="native-tooltip-page__section" id="accessibility">
        <h2 className="native-tooltip-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="native-tooltip-page__section-desc">
          NativeTooltip leverages the browser's built-in tooltip mechanism, which provides
          inherent accessibility support.
        </p>
        <div className="native-tooltip-page__a11y-grid">
          <div className="native-tooltip-page__a11y-item">
            <span className="native-tooltip-page__a11y-icon">&#x2705;</span>
            <div className="native-tooltip-page__a11y-text">
              <strong>Screen reader support</strong>
              The title attribute is read by screen readers as supplementary information.
            </div>
          </div>
          <div className="native-tooltip-page__a11y-item">
            <span className="native-tooltip-page__a11y-icon">&#x2705;</span>
            <div className="native-tooltip-page__a11y-text">
              <strong>No focus trap</strong>
              Native tooltips do not interfere with keyboard navigation or focus management.
            </div>
          </div>
          <div className="native-tooltip-page__a11y-item">
            <span className="native-tooltip-page__a11y-icon">&#x2705;</span>
            <div className="native-tooltip-page__a11y-text">
              <strong>High contrast mode</strong>
              Browser-rendered tooltips respect forced-colors and high-contrast settings.
            </div>
          </div>
          <div className="native-tooltip-page__a11y-item">
            <span className="native-tooltip-page__a11y-icon">&#x2705;</span>
            <div className="native-tooltip-page__a11y-text">
              <strong>Zero motion</strong>
              No animations means no reduced-motion concerns. Always safe for all users.
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Brand Color Note ────────────────────── */}
      <section className="native-tooltip-page__section" id="branding">
        <h2 className="native-tooltip-page__section-title"><a href="#branding">Brand Color</a></h2>
        <p className="native-tooltip-page__section-desc">
          NativeTooltip renders a browser-native tooltip, so brand color customization does not apply.
          The tooltip appearance is entirely controlled by the operating system and browser. If you need
          styled tooltips with brand color theming, consider the full Tooltip component instead.
        </p>
      </section>

      {/* ── 8. Source & Links ────────────────────────── */}
      <section className="native-tooltip-page__section" id="source">
        <h2 className="native-tooltip-page__section-title"><a href="#source">Source</a></h2>
        <p className="native-tooltip-page__section-desc">
          View the component source on GitHub. NativeTooltip is one of the simplest
          components in the library -- just a single <code>cloneElement</code> call.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="github" size="sm" />}
            onClick={() => window.open('https://github.com/annondeveloper/ui-kit/blob/main/src/components/native-tooltip.tsx', '_blank')}
          >
            Source on GitHub
          </Button>
        </div>
      </section>

      {/* ── 8. Props ─────────────────────────────────── */}
      <section className="native-tooltip-page__section" id="props">
        <h2 className="native-tooltip-page__section-title"><a href="#props">Props</a></h2>
        <p className="native-tooltip-page__section-desc">
          NativeTooltip accepts just two props. It clones the <code>title</code> attribute
          onto its child element.
        </p>
        <PropsTable props={PROPS} />
      </section>

      {/* ── Brand Color ───────────────────────────────── */}
      <section className="native-tooltip-page__section" id="brand-color">
        <h2 className="native-tooltip-page__section-title"><a href="#brand-color">Brand Color</a></h2>
        <p className="native-tooltip-page__section-desc">Pick a brand color to preview the component with your brand identity.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ColorInput name="brand-color" value={brandColor} onChange={setBrandColor} size="sm"
            swatches={['#6366f1','#f97316','#f43f5e','#0ea5e9','#10b981','#8b5cf6','#d946ef','#f59e0b','#06b6d4','#64748b']} />
        </div>
      </section>
    </div>
  )
}
