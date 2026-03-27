'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { DiskMountBar, type MountInfo } from '@ui/domain/disk-mount-bar'
import { DiskMountBar as LiteDiskMountBar } from '@ui/lite/disk-mount-bar'
import { DiskMountBar as PremiumDiskMountBar } from '@ui/premium/disk-mount-bar'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.disk-mount-bar-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: disk-mount-bar-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .disk-mount-bar-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .disk-mount-bar-page__hero::before {
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
        animation: disk-mount-bar-page-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes disk-mount-bar-page-aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .disk-mount-bar-page__hero::before { animation: none; } }

      .disk-mount-bar-page__title {
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

      .disk-mount-bar-page__desc { position: relative; color: var(--text-secondary); font-size: var(--text-base, 1rem); line-height: 1.6; margin: 0 0 1.25rem; max-inline-size: 60ch; text-wrap: pretty; }
      .disk-mount-bar-page__import-row { position: relative; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .disk-mount-bar-page__import-code { font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace; font-size: var(--text-sm, 0.875rem); background: oklch(0% 0 0 / 0.2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.5rem 0.875rem; color: var(--text-primary); flex: 1; min-inline-size: 0; overflow-x: auto; white-space: nowrap; backdrop-filter: blur(8px); }

      .disk-mount-bar-page__section {
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
        animation: disk-mount-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes disk-mount-section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .disk-mount-bar-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .disk-mount-bar-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .disk-mount-bar-page__section-title a {
        color: inherit;
        text-decoration: none;
      }

      .disk-mount-bar-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .disk-mount-bar-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .disk-mount-bar-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .disk-mount-bar-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .disk-mount-bar-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .disk-mount-bar-page__playground {
          grid-template-columns: 1fr;
        }
      }

      @container disk-mount-bar-page (max-width: 680px) {
        .disk-mount-bar-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .disk-mount-bar-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .disk-mount-bar-page__playground-result {
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

      .disk-mount-bar-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .disk-mount-bar-page__playground-controls {
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

      .disk-mount-bar-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .disk-mount-bar-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .disk-mount-bar-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .disk-mount-bar-page__option-btn {
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

      .disk-mount-bar-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }

      .disk-mount-bar-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .disk-mount-bar-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .disk-mount-bar-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .disk-mount-bar-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .disk-mount-bar-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .disk-mount-bar-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .disk-mount-bar-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .disk-mount-bar-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .disk-mount-bar-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .disk-mount-bar-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .disk-mount-bar-page__tier-import {
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

      .disk-mount-bar-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .disk-mount-bar-page__code-tabs {
        margin-block-start: 1rem;
      }

      .disk-mount-bar-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .disk-mount-bar-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .disk-mount-bar-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .disk-mount-bar-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .disk-mount-bar-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Source link ─────────────────────────────────── */

      .disk-mount-bar-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }

      .disk-mount-bar-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      @media (max-width: 768px) {
        .disk-mount-bar-page__hero { padding: 2rem 1.25rem; }
        .disk-mount-bar-page__title { font-size: 1.75rem; }
        .disk-mount-bar-page__playground { grid-template-columns: 1fr; }
        .disk-mount-bar-page__tiers { grid-template-columns: 1fr; }
        .disk-mount-bar-page__section { padding: 1.25rem; }
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const propDefs: PropDef[] = [
  { name: 'mounts', type: 'MountInfo[]', description: 'Array of mount points with bytes and utilization.' },
  { name: 'maxVisible', type: 'number', description: 'Max mounts shown before collapse.' },
  { name: 'showFree', type: 'boolean', default: 'false', description: 'Show free space value alongside used.' },
  { name: 'formatBytes', type: '(bytes: number) => string', description: 'Custom byte formatting function.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls bar height and typography.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'
const SIZES: Size[] = ['sm', 'md', 'lg']
const MAX_VISIBLE_OPTIONS = ['2', '3', '4', 'all']

const TIERS: { id: Tier; label: string }[] = [
  { id: 'lite', label: 'Lite' },
  { id: 'standard', label: 'Standard' },
  { id: 'premium', label: 'Premium' },
]

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { DiskMountBar } from '@annondeveloper/ui-kit/lite'",
  standard: "import { DiskMountBar } from '@annondeveloper/ui-kit'",
  premium: "import { DiskMountBar } from '@annondeveloper/ui-kit/premium'",
}

const GB = 1024 ** 3
const sampleMounts: MountInfo[] = [
  { mount: '/', totalBytes: 100 * GB, usedBytes: 42 * GB, freeBytes: 58 * GB, utilPct: 42 },
  { mount: '/data', totalBytes: 500 * GB, usedBytes: 380 * GB, freeBytes: 120 * GB, utilPct: 76 },
  { mount: '/var/log', totalBytes: 50 * GB, usedBytes: 12 * GB, freeBytes: 38 * GB, utilPct: 24 },
  { mount: '/tmp', totalBytes: 20 * GB, usedBytes: 3 * GB, freeBytes: 17 * GB, utilPct: 15 },
  { mount: '/backup', totalBytes: 2000 * GB, usedBytes: 1800 * GB, freeBytes: 200 * GB, utilPct: 90 },
]

const criticalMounts: MountInfo[] = [
  { mount: '/', totalBytes: 100 * GB, usedBytes: 95 * GB, freeBytes: 5 * GB, utilPct: 95 },
  { mount: '/data', totalBytes: 500 * GB, usedBytes: 475 * GB, freeBytes: 25 * GB, utilPct: 95 },
  { mount: '/var/log', totalBytes: 50 * GB, usedBytes: 49 * GB, freeBytes: 1 * GB, utilPct: 98 },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }) }} icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="disk-mount-bar-page__control-group">
      <span className="disk-mount-bar-page__control-label">{label}</span>
      <div className="disk-mount-bar-page__control-options">
        {options.map(opt => (
          <button key={opt} type="button" className={`disk-mount-bar-page__option-btn${opt === value ? ' disk-mount-bar-page__option-btn--active' : ''}`} onClick={() => onChange(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="disk-mount-bar-page__toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: 'var(--brand)' }} />{label}</label>
}

// ─── Code Generation ─────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, size: Size, maxVisible: number | undefined, showFree: boolean): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = []
  if (size !== 'md') props.push(`  size="${size}"`)
  if (maxVisible) props.push(`  maxVisible={${maxVisible}}`)
  if (showFree) props.push('  showFree')

  return `${importStr}

const mounts = [
  { mount: '/', totalBytes: 107374182400, usedBytes: 45097156608, freeBytes: 62277025792, utilPct: 42 },
  { mount: '/data', totalBytes: 536870912000, usedBytes: 408021893120, freeBytes: 128849018880, utilPct: 76 },
]

<DiskMountBar
  mounts={mounts}
${props.join('\n')}
/>`
}

function generateVueCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<template>\n  <DiskMountBar :mounts="mounts" show-free />\n</template>\n\n<script setup>\nimport { DiskMountBar } from '${importPath}'\nconst mounts = [\n  { mount: '/', totalBytes: 107374182400, usedBytes: 45097156608, freeBytes: 62277025792, utilPct: 42 },\n]\n</script>`
}

function generateAngularCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular -- CSS-only approach -->\n<div class="ui-disk-mount-bar">\n  <div class="ui-disk-mount-bar__entry">\n    <div class="ui-disk-mount-bar__header">\n      <span class="ui-disk-mount-bar__mount">/</span>\n      <span>42%</span>\n    </div>\n    <div class="ui-disk-mount-bar__track">\n      <div class="ui-disk-mount-bar__fill" style="width: 42%"></div>\n    </div>\n  </div>\n</div>\n\n@import '${importPath}/css/components/disk-mount-bar.css';`
}

function generateSvelteCode(tier: Tier): string {
  const importPath = tier === 'lite' ? '@annondeveloper/ui-kit/lite' : tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<script>\n  import { DiskMountBar } from '${importPath}';\n  const mounts = [{ mount: '/', totalBytes: 107374182400, usedBytes: 45097156608, freeBytes: 62277025792, utilPct: 42 }];\n</script>\n\n<DiskMountBar {mounts} showFree />`
}

function generateHtmlCode(): string {
  return `<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/disk-mount-bar.css">\n\n<div class="ui-disk-mount-bar">\n  <div class="ui-disk-mount-bar__entry">\n    <div class="ui-disk-mount-bar__header">\n      <span class="ui-disk-mount-bar__mount">/</span>\n      <span class="ui-disk-mount-bar__pct">42%</span>\n    </div>\n    <div class="ui-disk-mount-bar__track">\n      <div class="ui-disk-mount-bar__fill" style="width: 42%"></div>\n    </div>\n  </div>\n</div>`
}

// ─── Playground ──────────────────────────────────────────────────────────────

function PlaygroundSection() {
  const { tier } = useTier()
  const [size, setSize] = useState<Size>('md')
  const [maxVisibleStr, setMaxVisibleStr] = useState('3')
  const [showFree, setShowFree] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const maxVisible = maxVisibleStr === 'all' ? undefined : Number(maxVisibleStr)
  const Component = tier === 'lite' ? LiteDiskMountBar : tier === 'premium' ? PremiumDiskMountBar : DiskMountBar

  const reactCode = useMemo(() => generateReactCode(tier, size, maxVisible, showFree), [tier, size, maxVisible, showFree])
  const vueCode = useMemo(() => generateVueCode(tier), [tier])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier), [tier])
  const htmlCode = useMemo(() => generateHtmlCode(), [])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
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
    <section className="disk-mount-bar-page__section" id="playground">
      <h2 className="disk-mount-bar-page__section-title"><a href="#playground">Live Playground</a></h2>
      <p className="disk-mount-bar-page__section-desc">Configure the DiskMountBar and copy generated code.</p>

      <div className="disk-mount-bar-page__playground">
        <div className="disk-mount-bar-page__playground-preview">
          <div className="disk-mount-bar-page__playground-result">
            <Component mounts={sampleMounts} size={size} maxVisible={maxVisible} showFree={showFree} />
          </div>
          <div className="disk-mount-bar-page__code-tabs">
            <div className="disk-mount-bar-page__export-row">
              <Button size="xs" variant="secondary" icon={<Icon name="copy" size="sm" />} onClick={() => { navigator.clipboard?.writeText(activeCode).then(() => { setCopyStatus('Copied!'); setTimeout(() => setCopyStatus(''), 2000) }) }}>Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}</Button>
              {copyStatus && <span className="disk-mount-bar-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="disk-mount-bar-page__playground-controls">
          <OptionGroup label="Size" options={SIZES} value={size} onChange={setSize} />
          <OptionGroup label="Max Visible" options={MAX_VISIBLE_OPTIONS as readonly string[]} value={maxVisibleStr} onChange={setMaxVisibleStr} />
          <Toggle label="Show Free Space" checked={showFree} onChange={setShowFree} />
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DiskMountBarPage() {
  useStyles('disk-mount-bar-page', pageStyles)
  const { tier, setTier } = useTier()

  const Component = tier === 'lite' ? LiteDiskMountBar : tier === 'premium' ? PremiumDiskMountBar : DiskMountBar
  const importStr = IMPORT_STRINGS[tier]

  return (
    <div className="disk-mount-bar-page">
      {/* Hero */}
      <div className="disk-mount-bar-page__hero">
        <h1 className="disk-mount-bar-page__title">DiskMountBar</h1>
        <p className="disk-mount-bar-page__desc">
          Disk mount utilization bars for monitoring filesystem usage. Color-coded thresholds
          indicate healthy, warning, and critical usage levels. Supports collapse for many mounts.
        </p>
        <div className="disk-mount-bar-page__import-row">
          <code className="disk-mount-bar-page__import-code">{importStr}</code>
          <CopyButton text={importStr} />
        </div>
      </div>

      {/* Weight Tiers */}
      <section className="disk-mount-bar-page__section" id="tiers">
        <h2 className="disk-mount-bar-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="disk-mount-bar-page__section-desc">Choose the tier that fits your bundle budget.</p>
        <div className="disk-mount-bar-page__tiers">
          {TIERS.map(t => (
            <div key={t.id} className={`disk-mount-bar-page__tier-card${tier === t.id ? ' disk-mount-bar-page__tier-card--active' : ''}`} onClick={() => setTier(t.id)}>
              <div className="disk-mount-bar-page__tier-header">
                <span className="disk-mount-bar-page__tier-name">{t.label}</span>
                <span className="disk-mount-bar-page__tier-size">{t.id === 'lite' ? '~0.7KB' : t.id === 'standard' ? '~2KB' : '~3.5KB'}</span>
              </div>
              <p className="disk-mount-bar-page__tier-desc">
                {t.id === 'lite' && 'CSS-only bars with threshold colors.'}
                {t.id === 'standard' && 'Animated fill, collapse/expand, byte formatting.'}
                {t.id === 'premium' && 'Gradient fills, spring animations, glow on critical.'}
              </p>
              <code className="disk-mount-bar-page__tier-import">{IMPORT_STRINGS[t.id]}</code>
              <div className="disk-mount-bar-page__tier-preview">
                {t.id === 'lite' && <LiteDiskMountBar mounts={sampleMounts.slice(0, 2)} size="sm" />}
                {t.id === 'standard' && <DiskMountBar mounts={sampleMounts.slice(0, 2)} size="sm" />}
                {t.id === 'premium' && <PremiumDiskMountBar mounts={sampleMounts.slice(0, 2)} size="sm" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playground */}
      <PlaygroundSection />

      {/* Sizes */}
      <section className="disk-mount-bar-page__section" id="sizes">
        <h2 className="disk-mount-bar-page__section-title"><a href="#sizes">Sizes</a></h2>
        <p className="disk-mount-bar-page__section-desc">Three size variants control bar height and label sizes.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SIZES.map(s => (
            <div key={s}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBlockEnd: '0.5rem' }}>{s}</p>
              <Component mounts={sampleMounts.slice(0, 3)} size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* Critical Usage */}
      <section className="disk-mount-bar-page__section" id="critical">
        <h2 className="disk-mount-bar-page__section-title"><a href="#critical">Critical Thresholds</a></h2>
        <p className="disk-mount-bar-page__section-desc">Mounts above 90% utilization display critical threshold coloring.</p>
        <div className="disk-mount-bar-page__preview">
          <Component mounts={criticalMounts} showFree />
        </div>
      </section>

      {/* Many Mounts */}
      <section className="disk-mount-bar-page__section" id="many-mounts">
        <h2 className="disk-mount-bar-page__section-title"><a href="#many-mounts">Many Mounts with Collapse</a></h2>
        <p className="disk-mount-bar-page__section-desc">Use maxVisible to collapse long lists with an expand control.</p>
        <div className="disk-mount-bar-page__preview">
          <Component mounts={sampleMounts} maxVisible={3} showFree />
        </div>
      </section>

      {/* Show Free Space */}
      <section className="disk-mount-bar-page__section" id="show-free">
        <h2 className="disk-mount-bar-page__section-title"><a href="#show-free">Free Space Display</a></h2>
        <p className="disk-mount-bar-page__section-desc">
          Enable showFree to display available space alongside the usage bar.
          Particularly useful for storage capacity planning and monitoring.
        </p>
        <div className="disk-mount-bar-page__preview">
          <Component mounts={sampleMounts.slice(0, 3)} showFree />
        </div>
      </section>

      {/* Real-World Example */}
      <section className="disk-mount-bar-page__section" id="real-world">
        <h2 className="disk-mount-bar-page__section-title"><a href="#real-world">Real-World Usage</a></h2>
        <p className="disk-mount-bar-page__section-desc">
          DiskMountBar is designed for server detail panels and monitoring dashboards.
          Here it is shown in a card context with different mount configurations.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>prod-web-01 Storage</p>
            <Component mounts={sampleMounts.slice(0, 3)} size="sm" showFree />
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>storage-node-04 (Critical)</p>
            <Component mounts={criticalMounts} size="sm" showFree />
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBlockEnd: '0.75rem' }}>dev-box-01 (Healthy)</p>
            <Component
              mounts={[
                { mount: '/', totalBytes: 256 * GB, usedBytes: 38 * GB, freeBytes: 218 * GB, utilPct: 15 },
                { mount: '/home', totalBytes: 512 * GB, usedBytes: 102 * GB, freeBytes: 410 * GB, utilPct: 20 },
              ]}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Custom Formatting */}
      <section className="disk-mount-bar-page__section" id="custom-format">
        <h2 className="disk-mount-bar-page__section-title"><a href="#custom-format">Custom Byte Formatting</a></h2>
        <p className="disk-mount-bar-page__section-desc">
          Pass a custom formatBytes function to control how byte values are displayed.
          The default formatter uses binary units (GiB, TiB).
        </p>
        <div className="disk-mount-bar-page__preview">
          <Component
            mounts={sampleMounts.slice(0, 3)}
            showFree
            formatBytes={(bytes: number) => `${(bytes / (1000 ** 3)).toFixed(1)} GB`}
          />
        </div>
      </section>

      {/* Props Table */}
      <section className="disk-mount-bar-page__section" id="props">
        <h2 className="disk-mount-bar-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={propDefs} />
      </section>

      {/* Threshold Colors */}
      <section className="disk-mount-bar-page__section" id="thresholds">
        <h2 className="disk-mount-bar-page__section-title"><a href="#thresholds">Threshold Color Scale</a></h2>
        <p className="disk-mount-bar-page__section-desc">
          The bar fill color transitions through a gradient scale based on utilization percentage.
          Below 50% is healthy (green/teal), 50-80% is moderate (amber), 80-90% is warning (orange),
          and above 90% is critical (red). These colors are derived from the OKLCH color system for
          perceptual uniformity across themes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[15, 42, 65, 82, 95].map(pct => (
            <Component
              key={pct}
              mounts={[{
                mount: `/${pct}pct`,
                totalBytes: 100 * GB,
                usedBytes: pct * GB,
                freeBytes: (100 - pct) * GB,
                utilPct: pct,
              }]}
              size="sm"
              showFree
            />
          ))}
        </div>
      </section>

      {/* Accessibility */}
      <section className="disk-mount-bar-page__section" id="accessibility">
        <h2 className="disk-mount-bar-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <ul className="disk-mount-bar-page__a11y-list">
          <li className="disk-mount-bar-page__a11y-item"><Icon name="check" size="sm" className="disk-mount-bar-page__a11y-icon" />Each bar has role="meter" with aria-valuenow, aria-valuemin, aria-valuemax</li>
          <li className="disk-mount-bar-page__a11y-item"><Icon name="check" size="sm" className="disk-mount-bar-page__a11y-icon" />Mount path and utilization communicated via aria-label</li>
          <li className="disk-mount-bar-page__a11y-item"><Icon name="check" size="sm" className="disk-mount-bar-page__a11y-icon" />Critical thresholds conveyed through text, not color alone</li>
          <li className="disk-mount-bar-page__a11y-item"><Icon name="check" size="sm" className="disk-mount-bar-page__a11y-icon" />Respects prefers-reduced-motion for bar fill animations</li>
        </ul>
      </section>

      {/* Source */}
      <section className="disk-mount-bar-page__section" id="source">
        <h2 className="disk-mount-bar-page__section-title"><a href="#source">Source</a></h2>
        <a className="disk-mount-bar-page__source-link" href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/disk-mount-bar.tsx" target="_blank" rel="noopener noreferrer">
          <Icon name="code" size="sm" />View source on GitHub
        </a>
      </section>
    </div>
  )
}
