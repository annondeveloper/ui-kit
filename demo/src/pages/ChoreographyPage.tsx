import { useState, useRef, useCallback, useEffect } from 'react'
import { Choreography, choreography } from '@ui/core/motion/choreography'
import { getChoreographyPreset, type ChoreographyPreset } from '@ui/core/motion/choreography-presets'
import type { ChoreographyStep } from '@ui/core/motion/choreography'
import { useScrollChoreography } from '@ui/core/motion/scroll-choreography'
import { Button } from '@ui/components/button'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

/* ─── Shared page styles ────────────────────────────────────────────────────── */

const pageStyles = css`
  @layer demo {
    .choreo-page {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .choreo-page-header {
      margin-block-end: 0;
    }

    .choreo-page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--text-primary);
      margin-block-end: 0.5rem;
      line-height: 1.2;
    }

    .choreo-page-desc {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      max-width: 60ch;
    }

    /* ─── Section ─── */
    .choreo-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .choreo-section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .choreo-section-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
      max-width: 60ch;
    }

    .choreo-demo-area {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      padding: 1.5rem;
      overflow: hidden;
    }

    .choreo-code {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.75rem;
      line-height: 1.6;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1rem;
      overflow-x: auto;
      color: var(--text-secondary);
      white-space: pre;
    }

    /* ─── Preset Gallery ─── */
    .choreo-preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .choreo-preset-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .choreo-preset-card:hover {
      border-color: var(--brand);
      box-shadow: 0 0 0 1px var(--brand);
    }

    .choreo-preset-card[data-active='true'] {
      border-color: var(--brand);
      box-shadow: 0 0 0 2px var(--brand);
    }

    .choreo-preset-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: capitalize;
    }

    .choreo-preset-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      line-height: 1.4;
    }

    .choreo-grid-preview {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 0.5rem 0;
    }

    .choreo-grid-square {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      opacity: 0;
      transform: scale(0.8);
    }

    .choreo-grid-square[data-ready='true'] {
      opacity: 0;
      transform: scale(0.8);
    }

    /* ─── Custom Builder ─── */
    .choreo-builder-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .choreo-builder-layout {
        grid-template-columns: 1fr;
      }
    }

    .choreo-builder-controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .choreo-control-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .choreo-control-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .choreo-control-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .choreo-control-value {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--brand);
      font-variant-numeric: tabular-nums;
    }

    .choreo-slider {
      width: 100%;
      accent-color: var(--brand);
      height: 4px;
    }

    .choreo-select {
      width: 100%;
      padding: 0.375rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.8125rem;
    }

    .choreo-builder-preview {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      min-height: 200px;
      align-content: start;
    }

    .choreo-builder-square {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }

    /* ─── Scroll Choreography ─── */
    .choreo-scroll-spacer {
      min-height: 40vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 0.875rem;
      font-style: italic;
    }

    .choreo-scroll-trigger {
      min-height: 300px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .choreo-scroll-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
    }

    .choreo-scroll-item {
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      opacity: 0;
      transform: translateY(20px);
    }

    .choreo-scroll-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: center;
    }

    /* ─── Code Output ─── */
    .choreo-code-output {
      position: relative;
    }

    .choreo-copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }

    /* ─── Color palette ─── */
    .choreo-color-0 { background: oklch(65% 0.2 270); }
    .choreo-color-1 { background: oklch(65% 0.2 300); }
    .choreo-color-2 { background: oklch(65% 0.2 330); }
    .choreo-color-3 { background: oklch(65% 0.2 0); }
    .choreo-color-4 { background: oklch(65% 0.15 200); }
    .choreo-color-5 { background: oklch(65% 0.15 150); }
    .choreo-color-6 { background: oklch(65% 0.2 60); }
    .choreo-color-7 { background: oklch(65% 0.15 120); }
    .choreo-color-8 { background: oklch(70% 0.18 240); }
    .choreo-color-9 { background: oklch(70% 0.18 180); }
    .choreo-color-10 { background: oklch(60% 0.2 290); }
    .choreo-color-11 { background: oklch(60% 0.15 30); }
  }
`

/* ─── Preset Metadata ─────────────────────────────────────────────────────── */

const PRESETS: { name: ChoreographyPreset; desc: string }[] = [
  { name: 'cascade', desc: 'Elements slide up sequentially from start to end' },
  { name: 'stagger-grid', desc: 'Grid items scale in from the center outward' },
  { name: 'wave', desc: 'Elements slide up in a wave pattern from center' },
  { name: 'spiral', desc: 'Items scale in with a spiral stagger from center' },
  { name: 'focus-in', desc: 'Two-step: scale in all, then fade in sequentially' },
]

const ANIMATIONS = ['fadeIn', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scaleIn'] as const

/* ─── Preset Gallery Section ──────────────────────────────────────────────── */

function PresetCard({
  preset,
  desc,
  isActive,
  onSelect,
}: {
  preset: ChoreographyPreset
  desc: string
  isActive: boolean
  onSelect: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(true)

  const handleClick = useCallback(() => {
    onSelect()

    // Reset squares to hidden state
    setReady(false)
    requestAnimationFrame(() => {
      setReady(true)

      // Small delay to allow DOM update, then run choreography
      requestAnimationFrame(() => {
        const container = containerRef.current
        if (!container) return

        const squares = Array.from(container.querySelectorAll('.choreo-grid-square'))
        if (squares.length === 0) return

        const config = getChoreographyPreset(preset, '.placeholder', {
          duration: 350,
          staggerEach: 40,
        })

        // Replace string target with actual elements
        const steps: ChoreographyStep[] = config.sequence.map((step) => ({
          ...step,
          target: squares,
        }))

        const ch = new Choreography({ sequence: steps })
        ch.play()
      })
    })
  }, [preset, onSelect])

  return (
    <div
      className="choreo-preset-card"
      data-active={isActive}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="choreo-preset-name">{preset}</div>
      <div className="choreo-preset-desc">{desc}</div>
      <div className="choreo-grid-preview" ref={containerRef}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={`choreo-grid-square choreo-color-${i}`}
            data-ready={ready}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Custom Builder Section ──────────────────────────────────────────────── */

function CustomBuilder({
  onConfigChange,
}: {
  onConfigChange: (code: string) => void
}) {
  const [animation, setAnimation] = useState<(typeof ANIMATIONS)[number]>('slideUp')
  const [duration, setDuration] = useState(400)
  const [staggerEach, setStaggerEach] = useState(50)
  const [staggerFrom, setStaggerFrom] = useState<'start' | 'center' | 'end'>('start')
  const [itemCount, setItemCount] = useState(20)
  const previewRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<Choreography | null>(null)

  const runAnimation = useCallback(() => {
    const container = previewRef.current
    if (!container) return

    activeRef.current?.cancel()

    // Reset elements
    const squares = Array.from(container.querySelectorAll('.choreo-builder-square'))
    for (const sq of squares) {
      ;(sq as HTMLElement).style.opacity = '0'
      ;(sq as HTMLElement).style.transform = 'scale(0.8) translateY(20px)'
    }

    requestAnimationFrame(() => {
      const step: ChoreographyStep = {
        target: squares as Element[],
        animation,
        duration,
        stagger: { each: staggerEach, from: staggerFrom },
      }

      const ch = choreography({ sequence: [step] })
      activeRef.current = ch
      ch.play()
    })
  }, [animation, duration, staggerEach, staggerFrom])

  // Generate code output
  useEffect(() => {
    const code = `import { choreography } from '@annondeveloper/ui-kit'

const ch = choreography({
  sequence: [{
    target: '.my-items',
    animation: '${animation}',
    duration: ${duration},
    stagger: { each: ${staggerEach}, from: '${staggerFrom}' },
  }],
})

ch.play()`
    onConfigChange(code)
  }, [animation, duration, staggerEach, staggerFrom, onConfigChange])

  return (
    <div className="choreo-builder-layout">
      <div className="choreo-builder-controls">
        {/* Animation Type */}
        <div className="choreo-control-row">
          <span className="choreo-control-label">Animation</span>
          <select
            className="choreo-select"
            value={animation}
            onChange={(e) => setAnimation(e.target.value as typeof animation)}
          >
            {ANIMATIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="choreo-control-row">
          <div className="choreo-control-header">
            <span className="choreo-control-label">Duration</span>
            <span className="choreo-control-value">{duration}ms</span>
          </div>
          <input
            className="choreo-slider"
            type="range"
            min={100}
            max={2000}
            step={50}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        {/* Stagger Each */}
        <div className="choreo-control-row">
          <div className="choreo-control-header">
            <span className="choreo-control-label">Stagger Each</span>
            <span className="choreo-control-value">{staggerEach}ms</span>
          </div>
          <input
            className="choreo-slider"
            type="range"
            min={10}
            max={200}
            step={10}
            value={staggerEach}
            onChange={(e) => setStaggerEach(Number(e.target.value))}
          />
        </div>

        {/* Stagger From */}
        <div className="choreo-control-row">
          <span className="choreo-control-label">Stagger From</span>
          <select
            className="choreo-select"
            value={staggerFrom}
            onChange={(e) => setStaggerFrom(e.target.value as typeof staggerFrom)}
          >
            <option value="start">start</option>
            <option value="center">center</option>
            <option value="end">end</option>
          </select>
        </div>

        {/* Item Count */}
        <div className="choreo-control-row">
          <div className="choreo-control-header">
            <span className="choreo-control-label">Items</span>
            <span className="choreo-control-value">{itemCount}</span>
          </div>
          <input
            className="choreo-slider"
            type="range"
            min={4}
            max={40}
            step={1}
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value))}
          />
        </div>

        <Button size="sm" onClick={runAnimation}>
          Play Animation
        </Button>
      </div>

      <div className="choreo-demo-area">
        <div className="choreo-builder-preview" ref={previewRef}>
          {Array.from({ length: itemCount }, (_, i) => (
            <div
              key={i}
              className={`choreo-builder-square choreo-color-${i % 12}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Scroll Choreography Demo ────────────────────────────────────────────── */

function ScrollDemo() {
  const triggerRef1 = useRef<HTMLDivElement>(null)
  const triggerRef2 = useRef<HTMLDivElement>(null)

  useScrollChoreography({
    trigger: triggerRef1,
    sequence: [
      {
        target: '.choreo-scroll-set-a .choreo-scroll-item',
        animation: 'slideUp',
        duration: 400,
        stagger: { each: 40, from: 'start' },
      },
    ],
    start: 'top bottom',
  })

  useScrollChoreography({
    trigger: triggerRef2,
    sequence: [
      {
        target: '.choreo-scroll-set-b .choreo-scroll-item',
        animation: 'scaleIn',
        duration: 500,
        stagger: { each: 30, from: 'center' },
      },
    ],
    start: 'top bottom',
  })

  return (
    <>
      <div className="choreo-scroll-spacer">Scroll down to trigger entrance animations</div>

      <div ref={triggerRef1} className="choreo-scroll-trigger">
        <div className="choreo-scroll-label">Cascade Entrance (slideUp + stagger from start)</div>
        <div className="choreo-scroll-grid choreo-scroll-set-a">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className={`choreo-scroll-item choreo-color-${i % 12}`} />
          ))}
        </div>
      </div>

      <div className="choreo-scroll-spacer">Keep scrolling...</div>

      <div ref={triggerRef2} className="choreo-scroll-trigger">
        <div className="choreo-scroll-label">Focus Entrance (scaleIn + stagger from center)</div>
        <div className="choreo-scroll-grid choreo-scroll-set-b">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className={`choreo-scroll-item choreo-color-${(i + 4) % 12}`} />
          ))}
        </div>
      </div>
    </>
  )
}

/* ─── Code Output Section ─────────────────────────────────────────────────── */

function CodeOutput({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div className="choreo-code-output">
      <pre className="choreo-code">{code}</pre>
      <div className="choreo-copy-btn">
        <Button size="xs" variant="ghost" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

/* ─── Scroll Choreography Code ────────────────────────────────────────────── */

const SCROLL_CODE = `import { useRef } from 'react'
import { useScrollChoreography } from '@annondeveloper/ui-kit'

function MyComponent() {
  const triggerRef = useRef<HTMLDivElement>(null)

  useScrollChoreography({
    trigger: triggerRef,
    sequence: [{
      target: '.my-grid .item',
      animation: 'slideUp',
      duration: 400,
      stagger: { each: 40, from: 'start' },
    }],
    start: 'top bottom',
    once: true,
  })

  return (
    <div ref={triggerRef}>
      <div className="my-grid">
        {items.map(item => (
          <div key={item.id} className="item">
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}`

/* ─── Main Page Component ─────────────────────────────────────────────────── */

export default function ChoreographyPage() {
  useStyles(pageStyles)
  const [activePreset, setActivePreset] = useState<ChoreographyPreset | null>(null)
  const [builderCode, setBuilderCode] = useState('')

  return (
    <div className="choreo-page">
      {/* ─── Hero ─── */}
      <header className="choreo-page-header">
        <h1 className="choreo-page-title">Choreography System</h1>
        <p className="choreo-page-desc">
          Orchestrate multi-step animation sequences with precise timing, stagger patterns,
          and scroll-triggered entrances. The choreography API composes steps sequentially,
          each with its own target elements, animation type, duration, and stagger configuration.
        </p>
      </header>

      {/* ─── Preset Gallery ─── */}
      <section className="choreo-section">
        <h2 className="choreo-section-title">Preset Gallery</h2>
        <p className="choreo-section-desc">
          Click a preset card to see it animate. Each preset is a pre-configured sequence
          with tuned stagger patterns and timing.
        </p>
        <div className="choreo-preset-grid">
          {PRESETS.map((p) => (
            <PresetCard
              key={p.name}
              preset={p.name}
              desc={p.desc}
              isActive={activePreset === p.name}
              onSelect={() => setActivePreset(p.name)}
            />
          ))}
        </div>
      </section>

      {/* ─── Custom Builder ─── */}
      <section className="choreo-section">
        <h2 className="choreo-section-title">Custom Builder</h2>
        <p className="choreo-section-desc">
          Tweak animation type, stagger settings, and duration. The preview updates live
          and the code output below reflects your configuration.
        </p>
        <CustomBuilder onConfigChange={setBuilderCode} />
      </section>

      {/* ─── Code Output ─── */}
      <section className="choreo-section">
        <h2 className="choreo-section-title">Code Output</h2>
        <p className="choreo-section-desc">
          Copy this code snippet to use the current builder configuration in your project.
        </p>
        <CodeOutput code={builderCode} />
      </section>

      {/* ─── Scroll Choreography ─── */}
      <section className="choreo-section">
        <h2 className="choreo-section-title">Scroll Choreography</h2>
        <p className="choreo-section-desc">
          Elements animate in as they scroll into view using <code>useScrollChoreography</code>.
          Powered by IntersectionObserver with configurable trigger positions.
        </p>
        <div className="choreo-demo-area">
          <ScrollDemo />
        </div>
      </section>

      {/* ─── Scroll Code ─── */}
      <section className="choreo-section">
        <h2 className="choreo-section-title">Scroll Choreography Code</h2>
        <CodeOutput code={SCROLL_CODE} />
      </section>
    </div>
  )
}
