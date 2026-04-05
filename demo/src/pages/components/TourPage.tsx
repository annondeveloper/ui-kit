'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Tour, type TourStep } from '@ui/domain/tour'
import { Tour as LiteTour } from '@ui/lite/tour'
import { Tour as PremiumTour } from '@ui/premium/tour'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { Card } from '@ui/components/card'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Types ───────────────────────────────────────────────────────────────────

type Placement = 'top' | 'bottom' | 'left' | 'right'

// ─── Props ───────────────────────────────────────────────────────────────────

const STEP_PROPS: PropDef[] = [
  { name: 'target', type: 'string', required: true, description: 'CSS selector for the element to spotlight.' },
  { name: 'title', type: 'string', required: true, description: 'Heading text displayed in the tooltip.' },
  { name: 'description', type: 'ReactNode', required: true, description: 'Body content of the tooltip card.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", description: 'Preferred tooltip position relative to the target.' },
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

const PLACEMENTS: readonly Placement[] = ['top', 'bottom', 'left', 'right'] as const

// ─── Import strings per tier ─────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  standard: "import { Tour, type TourStep } from '@annondeveloper/ui-kit'",
  lite: "import { Tour } from '@annondeveloper/ui-kit/lite'",
  premium: "import { Tour } from '@annondeveloper/ui-kit/premium'",
}

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.tour-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: tour-page;
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

      /* ── Playground ─────────────────────────────────── */

      .tour-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
      }

      @container tour-page (max-width: 640px) {
        .tour-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .tour-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .tour-page__playground-result {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        border: 1px solid var(--border-default);
        min-block-size: 160px;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .tour-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .tour-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
      }

      .tour-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .tour-page__control-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary, var(--text-secondary));
      }

      .tour-page__control-options {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
      }

      .tour-page__option-btn {
        font-size: 0.75rem;
        padding: 0.25rem 0.625rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-base);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .tour-page__option-btn:hover {
        border-color: var(--brand);
        color: var(--text-primary);
      }

      .tour-page__option-btn--active {
        background: var(--brand, oklch(65% 0.2 270));
        color: white;
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .tour-page__toggle-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-secondary);
        cursor: pointer;
      }

      .tour-page__code-tabs {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tour-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .tour-page__export-status {
        font-size: 0.75rem;
        color: oklch(70% 0.15 150);
        font-weight: 500;
      }

      /* ── Accessibility section ── */
      .tour-page__a11y-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tour-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .tour-page__a11y-icon {
        color: oklch(70% 0.15 150);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      /* ── Size row ── */
      .tour-page__size-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-block-end: 1px solid var(--border-subtle);
        font-size: var(--text-sm, 0.875rem);
      }

      .tour-page__size-label { color: var(--text-secondary); }
      .tour-page__size-value { font-weight: 600; color: var(--text-primary); }
    }
  }
`

// ─── Helper components ───────────────────────────────────────────────────────

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
    <div className="tour-page__control-group">
      <span className="tour-page__control-label">{label}</span>
      <div className="tour-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`tour-page__option-btn${opt === value ? ' tour-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="tour-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generators ─────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  stepCount: number,
  showProgress: boolean,
  showSkip: boolean,
  closeOnOverlay: boolean,
  closeOnEscape: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]
  const typeImport = tier === 'standard' ? '' : "\nimport type { TourStep } from '@annondeveloper/ui-kit'"

  const steps = Array.from({ length: stepCount }, (_, i) => {
    const pl = PLACEMENTS[i % PLACEMENTS.length]
    return `  { target: '#step-${i + 1}', title: 'Step ${i + 1}', description: 'Description for step ${i + 1}.', placement: '${pl}' }`
  }).join(',\n')

  const props: string[] = ['  steps={steps}', '  open={open}', '  onClose={() => setOpen(false)}', '  onFinish={() => setOpen(false)}']
  if (!showProgress) props.push('  showProgress={false}')
  if (!showSkip) props.push('  showSkip={false}')
  if (!closeOnOverlay) props.push('  closeOnOverlay={false}')
  if (!closeOnEscape) props.push('  closeOnEscape={false}')
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}${typeImport}

const steps: TourStep[] = [
${steps}
]

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Start Tour</button>
      <Tour
${props.join('\n')}
      />
    </>
  )
}`
}

function generateHtmlCode(
  stepCount: number,
  showProgress: boolean,
  showSkip: boolean,
): string {
  const targets = Array.from({ length: stepCount }, (_, i) =>
    `  <div id="step-${i + 1}">Target ${i + 1}</div>`
  ).join('\n')

  const attrs: string[] = ['class="ui-tour"', 'data-open']
  if (!showProgress) attrs.push('data-no-progress')
  if (!showSkip) attrs.push('data-no-skip')

  return `<!-- HTML + CSS approach -->
<link rel="stylesheet" href="@annondeveloper/ui-kit/css/components/tour.css" />

${targets}

<div ${attrs.join(' ')}>
  <!-- Tour overlay + tooltip rendered by CSS/JS -->
</div>

<script>
  // Initialize tour with steps configuration
  const steps = [
${Array.from({ length: stepCount }, (_, i) =>
  `    { target: '#step-${i + 1}', title: 'Step ${i + 1}', description: 'Step ${i + 1} description' }`
).join(',\n')}
  ];
</script>`
}

function generateVueCode(
  tier: Tier,
  stepCount: number,
  showProgress: boolean,
  showSkip: boolean,
  motion: number,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'

  const steps = Array.from({ length: stepCount }, (_, i) => {
    const pl = PLACEMENTS[i % PLACEMENTS.length]
    return `  { target: '#step-${i + 1}', title: 'Step ${i + 1}', description: 'Step ${i + 1} description', placement: '${pl}' }`
  }).join(',\n')

  const attrs: string[] = [':steps="steps"', ':open="open"', '@close="open = false"', '@finish="open = false"']
  if (!showProgress) attrs.push(':show-progress="false"')
  if (!showSkip) attrs.push(':show-skip="false"')
  if (motion !== 3 && tier !== 'lite') attrs.push(`:motion="${motion}"`)

  return `<template>
  <button @click="open = true">Start Tour</button>
  <Tour
    ${attrs.join('\n    ')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { Tour } from '${importPath}'

const open = ref(false)
const steps = [
${steps}
]
</script>`
}

function generateAngularCode(
  tier: Tier,
  stepCount: number,
  showProgress: boolean,
  showSkip: boolean,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'

  const attrs: string[] = [
    '[steps]="steps"',
    '[open]="tourOpen"',
    '(close)="tourOpen = false"',
    '(finish)="tourOpen = false"',
  ]
  if (!showProgress) attrs.push('[showProgress]="false"')
  if (!showSkip) attrs.push('[showSkip]="false"')

  return `<!-- Angular -- ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier -->
<button (click)="tourOpen = true">Start Tour</button>
<ui-tour
  ${attrs.join('\n  ')}
/>

/* In component CSS */
@import '${importPath}/css/components/tour.css';

/* Component class */
export class AppComponent {
  tourOpen = false;
  steps = [
${Array.from({ length: stepCount }, (_, i) =>
  `    { target: '#step-${i + 1}', title: 'Step ${i + 1}', description: 'Step ${i + 1} description' }`
).join(',\n')}
  ];
}`
}

function generateSvelteCode(
  tier: Tier,
  stepCount: number,
  showProgress: boolean,
  showSkip: boolean,
  motion: number,
): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : tier === 'lite' ? '@annondeveloper/ui-kit/lite' : '@annondeveloper/ui-kit'

  const steps = Array.from({ length: stepCount }, (_, i) => {
    const pl = PLACEMENTS[i % PLACEMENTS.length]
    return `  { target: '#step-${i + 1}', title: 'Step ${i + 1}', description: 'Step ${i + 1} description', placement: '${pl}' }`
  }).join(',\n')

  const attrs: string[] = ['{steps}', 'open={tourOpen}', 'on:close={() => tourOpen = false}', 'on:finish={() => tourOpen = false}']
  if (!showProgress) attrs.push('showProgress={false}')
  if (!showSkip) attrs.push('showSkip={false}')
  if (motion !== 3 && tier !== 'lite') attrs.push(`motion={${motion}}`)

  return `<script>
  import { Tour } from '${importPath}';

  let tourOpen = false;
  const steps = [
${steps}
  ];
</script>

<button on:click={() => tourOpen = true}>Start Tour</button>
<Tour
  ${attrs.join('\n  ')}
/>`
}

// ─── Section: Interactive Playground ─────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [stepCount, setStepCount] = useState(4)
  const [showProgress, setShowProgress] = useState(true)
  const [showSkip, setShowSkip] = useState(true)
  const [closeOnOverlay, setCloseOnOverlay] = useState(true)
  const [closeOnEscape, setCloseOnEscape] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [placement, setPlacement] = useState<Placement>('bottom')
  const [tourOpen, setTourOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const TourComponent = tier === 'lite' ? LiteTour : tier === 'premium' ? PremiumTour : Tour

  const playgroundSteps: TourStep[] = useMemo(() =>
    Array.from({ length: stepCount }, (_, i) => ({
      target: `#playground-target-${i}`,
      title: `Step ${i + 1}`,
      description: `This is step ${i + 1} of your guided tour. Each tooltip highlights a specific element.`,
      placement,
    })),
    [stepCount, placement],
  )

  const reactCode = useMemo(
    () => generateReactCode(tier, stepCount, showProgress, showSkip, closeOnOverlay, closeOnEscape, motion),
    [tier, stepCount, showProgress, showSkip, closeOnOverlay, closeOnEscape, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(stepCount, showProgress, showSkip),
    [stepCount, showProgress, showSkip],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, stepCount, showProgress, showSkip, motion),
    [tier, stepCount, showProgress, showSkip, motion],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, stepCount, showProgress, showSkip),
    [tier, stepCount, showProgress, showSkip],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, stepCount, showProgress, showSkip, motion),
    [tier, stepCount, showProgress, showSkip, motion],
  )

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

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(activeCode).then(() => {
      setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
      setTimeout(() => setCopyStatus(''), 2000)
    })
  }, [activeCode, activeCodeTab])

  return (
    <section className="tour-page__section" id="playground">
      <h2 className="tour-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="tour-page__section-desc">
        Configure the Tour component and preview it in real-time. The generated code updates as you change settings.
      </p>

      <div className="tour-page__playground">
        {/* Preview area */}
        <div className="tour-page__playground-preview">
          <div className="tour-page__playground-result">
            <div className="tour-page__mock-ui">
              {Array.from({ length: stepCount }, (_, i) => (
                <div key={i} className="tour-page__mock-item" id={`playground-target-${i}`}>
                  Target {i + 1}
                </div>
              ))}
            </div>
            <Button onClick={() => setTourOpen(true)}>Start Tour</Button>
          </div>

          {/* Tabbed code output */}
          <div className="tour-page__code-tabs">
            <div className="tour-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                onClick={handleCopy}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="tour-page__export-status">{copyStatus}</span>}
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

        {/* Controls panel */}
        <div className="tour-page__playground-controls">
          <OptionGroup
            label="Steps"
            options={['2', '3', '4', '5'] as const}
            value={String(stepCount) as '2' | '3' | '4' | '5'}
            onChange={v => setStepCount(Number(v))}
          />

          <OptionGroup label="Placement" options={PLACEMENTS} value={placement} onChange={setPlacement} />

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion Level"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="tour-page__control-group">
            <span className="tour-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Show progress" checked={showProgress} onChange={setShowProgress} />
              <Toggle label="Show skip" checked={showSkip} onChange={setShowSkip} />
              <Toggle label="Close on overlay" checked={closeOnOverlay} onChange={setCloseOnOverlay} />
              <Toggle label="Close on escape" checked={closeOnEscape} onChange={setCloseOnEscape} />
            </div>
          </div>
        </div>
      </div>

      <TourComponent
        steps={playgroundSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onFinish={() => setTourOpen(false)}
        showProgress={showProgress}
        showSkip={showSkip}
        closeOnOverlay={closeOnOverlay}
        closeOnEscape={closeOnEscape}
        {...(tier !== 'lite' ? { motion } : {})}
      />
    </section>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function TourPage() {
  useStyles('tour-page', pageStyles)
  const { tier } = useTier()

  const [tourOpen, setTourOpen] = useState(false)
  const [minimalTourOpen, setMinimalTourOpen] = useState(false)

  const effectiveTier = tier
  const TourComponent = effectiveTier === 'lite' ? LiteTour : effectiveTier === 'premium' ? PremiumTour : Tour

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

  const importStr = IMPORT_STRINGS[effectiveTier]

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
          <code className="tour-page__import-code">{importStr}</code>
          <CopyBlock code={importStr} language="typescript" />
        </div>
      </div>

      {/* ── 1. Interactive Tour Demo ─────────────────── */}
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
        <TourComponent steps={STEPS} open={tourOpen} onClose={() => setTourOpen(false)} onFinish={() => setTourOpen(false)} showProgress showSkip />
      </section>

      {/* ── 2. Live Playground ────────────────────────── */}
      <PlaygroundSection tier={effectiveTier} />

      {/* ── 3. Minimal Tour ──────────────────────────── */}
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
          <Button variant="secondary" onClick={() => setMinimalTourOpen(true)}>Start Minimal Tour</Button>
        </div>
        <TourComponent
          steps={MINIMAL_STEPS}
          open={minimalTourOpen}
          onClose={() => setMinimalTourOpen(false)}
          onFinish={() => setMinimalTourOpen(false)}
          showProgress={false}
          showSkip={false}
        />
      </section>

      {/* ── 4. Props: TourStep ───────────────────────── */}
      <section className="tour-page__section" id="step-props">
        <h2 className="tour-page__section-title"><a href="#step-props">TourStep Props</a></h2>
        <PropsTable props={STEP_PROPS} />
      </section>

      {/* ── 5. Props: Tour ───────────────────────────── */}
      <section className="tour-page__section" id="props">
        <h2 className="tour-page__section-title"><a href="#props">Tour Props</a></h2>
        <PropsTable props={TOUR_PROPS} />
      </section>

      {/* ── 6. Weight Tiers ──────────────────────────── */}
      <section className="tour-page__section" id="tiers">
        <h2 className="tour-page__section-title"><a href="#tiers">Weight Tiers</a></h2>
        <p className="tour-page__section-desc">
          Tour ships in three weight tiers. Choose the right balance of features and bundle size for your project.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'standard' ? 'var(--brand)' : undefined }}>
            <strong>Standard</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Full-featured with motion, theming, and accessibility.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Tour {'}'} from '@annondeveloper/ui-kit'</code>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">JS</span>
              <span className="tour-page__size-value">~4.2 KB gzip</span>
            </div>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">CSS</span>
              <span className="tour-page__size-value">~1.1 KB gzip</span>
            </div>
          </Card>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'lite' ? 'var(--brand)' : undefined }}>
            <strong>Lite</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Minimal footprint, no motion or advanced theming.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Tour {'}'} from '@annondeveloper/ui-kit/lite'</code>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">JS</span>
              <span className="tour-page__size-value">~1.8 KB gzip</span>
            </div>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">CSS</span>
              <span className="tour-page__size-value">~0.5 KB gzip</span>
            </div>
          </Card>
          <Card padding="sm" style={{ borderColor: effectiveTier === 'premium' ? 'var(--brand)' : undefined }}>
            <strong>Premium</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
              Aurora glow, spring animations, and shimmer effects.
            </p>
            <code style={{ fontSize: '0.6875rem' }}>import {'{'} Tour {'}'} from '@annondeveloper/ui-kit/premium'</code>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">JS</span>
              <span className="tour-page__size-value">~5.8 KB gzip</span>
            </div>
            <div className="tour-page__size-row">
              <span className="tour-page__size-label">CSS</span>
              <span className="tour-page__size-value">~1.4 KB gzip</span>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 7. Accessibility ─────────────────────────── */}
      <section className="tour-page__section" id="accessibility">
        <h2 className="tour-page__section-title"><a href="#accessibility">Accessibility</a></h2>
        <p className="tour-page__section-desc">
          Tour follows WAI-ARIA best practices for guided experiences.
        </p>
        <ul className="tour-page__a11y-list">
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Focus is trapped within the tooltip card while the tour is active, cycling through navigation buttons.
          </li>
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Escape key closes the tour. Arrow keys navigate between steps when focused on navigation.
          </li>
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Tooltip uses <code>role="dialog"</code> with <code>aria-label</code> describing the current step.
          </li>
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Step counter announced via <code>aria-live="polite"</code> region for screen readers.
          </li>
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            All interactive elements meet 44px minimum touch target size.
          </li>
          <li className="tour-page__a11y-item">
            <span className="tour-page__a11y-icon" aria-hidden="true">&#10003;</span>
            Respects <code>prefers-reduced-motion</code> by disabling spotlight and tooltip animations.
          </li>
        </ul>
      </section>

      {/* ── 8. Source ─────────────────────────────────── */}
      <section className="tour-page__section" id="source">
        <h2 className="tour-page__section-title"><a href="#source">Source</a></h2>
        <p className="tour-page__section-desc">
          View the component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/domain/tour.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.875rem', color: 'var(--brand)' }}
          >
            Source: src/domain/tour.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/lite/tour.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.875rem', color: 'var(--brand)' }}
          >
            Source: src/lite/tour.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/main/src/premium/tour.tsx"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.875rem', color: 'var(--brand)' }}
          >
            Source: src/premium/tour.tsx
          </a>
        </div>
      </section>
    </div>
  )
}
