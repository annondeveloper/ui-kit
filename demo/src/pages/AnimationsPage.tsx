import { useState, useRef, useCallback, useEffect } from 'react'
import { solveSpring, type SpringConfig } from '@ui/core/motion/spring'
import { animate, spring } from '@ui/core/motion/animate'
import { computeStaggerDelays, type StaggerFrom } from '@ui/core/motion/stagger'
import { Timeline, timeline } from '@ui/core/motion/timeline'
import { flip } from '@ui/core/motion/flip'
import { useScrollReveal } from '@ui/core/motion/scroll'
import { TextSplitter } from '@ui/core/motion/text-splitter'
import { Button } from '@ui/components/button'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

/* ─── Shared page styles ────────────────────────────────────────────────────── */

const pageStyles = css`
  @layer demo {
    .anim-page {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .anim-page-header {
      margin-block-end: 0;
    }

    .anim-page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--text-primary);
      margin-block-end: 0.5rem;
      line-height: 1.2;
    }

    .anim-page-desc {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      max-width: 60ch;
    }

    /* ─── Section ─── */
    .anim-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .anim-section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.3;
    }

    .anim-section-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
      max-width: 60ch;
    }

    .anim-demo-area {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      padding: 1.5rem;
      overflow: hidden;
    }

    .anim-code {
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

    /* ─── Spring section ─── */
    .anim-spring-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .anim-spring-layout {
        grid-template-columns: 1fr;
      }
    }

    .anim-spring-controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .anim-slider-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .anim-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .anim-slider-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .anim-slider-value {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--brand);
      font-variant-numeric: tabular-nums;
    }

    .anim-slider {
      width: 100%;
      accent-color: var(--brand);
      height: 4px;
    }

    .anim-spring-canvas {
      width: 100%;
      height: 200px;
      display: block;
    }

    .anim-spring-ball-track {
      position: relative;
      height: 60px;
      background: oklch(50% 0 0 / 0.05);
      border-radius: var(--radius-md);
      margin-block-start: 0.75rem;
      overflow: hidden;
    }

    .anim-spring-ball {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--brand);
      box-shadow: 0 2px 12px oklch(60% 0.2 270 / 0.3);
    }

    /* ─── Motion levels ─── */
    .anim-motion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .anim-motion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      text-align: center;
    }

    .anim-motion-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .anim-motion-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      line-height: 1.4;
    }

    /* ─── Stagger section ─── */
    .anim-stagger-toolbar {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      margin-block-end: 0.75rem;
    }

    .anim-select {
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.8125rem;
      cursor: pointer;
      outline: none;
    }
    .anim-select:focus {
      border-color: var(--brand);
    }

    .anim-stagger-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
      gap: 0.375rem;
    }

    .anim-stagger-cell {
      aspect-ratio: 1;
      border-radius: var(--radius-sm);
      opacity: 0;
      transform: scale(0.5);
    }

    .anim-stagger-cell--visible {
      opacity: 1;
      transform: scale(1);
    }

    /* ─── Scroll reveal ─── */
    .anim-scroll-container {
      max-height: 350px;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
    }

    .anim-scroll-card {
      padding: 1.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease-out, transform 0.4s ease-out;
    }

    .anim-scroll-card--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .anim-scroll-card-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 0.25rem;
    }

    .anim-scroll-card-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ─── Text splitter ─── */
    .anim-text-input {
      width: 100%;
      max-width: 400px;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.875rem;
      outline: none;
      margin-block-end: 1rem;
    }
    .anim-text-input:focus {
      border-color: var(--brand);
    }

    .anim-text-split-modes {
      display: flex;
      gap: 0.25rem;
      margin-block-end: 1rem;
    }

    .anim-text-output {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      min-height: 3rem;
      line-height: 1.4;
    }

    .anim-text-char {
      display: inline-block;
      opacity: 0;
      transform: translateY(10px);
      animation: anim-text-reveal 0.3s ease-out forwards;
    }

    @keyframes anim-text-reveal {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ─── Timeline ─── */
    .anim-timeline-stage {
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .anim-timeline-heading {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      opacity: 0;
      transform: translateX(-30px);
    }

    .anim-timeline-sub {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      opacity: 0;
      transform: translateX(-20px);
    }

    .anim-timeline-actions {
      display: flex;
      gap: 0.5rem;
      opacity: 0;
      transform: translateY(10px);
    }

    /* ─── FLIP ─── */
    .anim-flip-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .anim-flip-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .anim-flip-item {
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: oklch(100% 0 0);
      overflow: hidden;
    }

    .anim-flip-grid .anim-flip-item {
      aspect-ratio: 1;
      justify-content: center;
      padding: 0.75rem;
    }

    .anim-flip-list .anim-flip-item {
      padding: 0.75rem 1rem;
    }
  }
`

/* ─── 1. Spring Physics ─────────────────────────────────────────────────────── */

function SpringSection() {
  const [stiffness, setStiffness] = useState(170)
  const [damping, setDamping] = useState(12)
  const [mass, setMass] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)

  const config: SpringConfig = { stiffness, damping, mass }
  const values = solveSpring(config)

  // Draw spring curve
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padding = 16

    ctx.clearRect(0, 0, w, h)

    // Grid line at y=1
    ctx.strokeStyle = 'oklch(50% 0 0 / 0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    const restY = padding + (1 - 1) * (h - 2 * padding) / 1.5
    ctx.beginPath()
    ctx.moveTo(padding, h - restY)
    ctx.lineTo(w - padding, h - restY)
    ctx.stroke()
    ctx.setLineDash([])

    // Spring curve
    ctx.strokeStyle = 'oklch(65% 0.2 270)'
    ctx.lineWidth = 2
    ctx.beginPath()

    const maxVal = Math.max(...values.map(Math.abs), 1.5)
    for (let i = 0; i < values.length; i++) {
      const x = padding + (i / (values.length - 1)) * (w - 2 * padding)
      const y = h - padding - (values[i] / maxVal) * (h - 2 * padding)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }, [stiffness, damping, mass, values])

  const animateBall = useCallback(() => {
    if (!ballRef.current) return
    ballRef.current.style.left = '0px'
    spring(ballRef.current, { left: 'calc(100% - 32px)' }, config)
  }, [stiffness, damping, mass])

  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Spring Physics</h2>
      <p className="anim-section-desc">
        Real differential equation solver (RK4 integration). Adjust parameters and see the curve update in real time.
      </p>
      <div className="anim-demo-area">
        <div className="anim-spring-layout">
          <div className="anim-spring-controls">
            <div className="anim-slider-row">
              <div className="anim-slider-header">
                <span className="anim-slider-label">Stiffness</span>
                <span className="anim-slider-value">{stiffness}</span>
              </div>
              <input className="anim-slider" type="range" min={1} max={500} value={stiffness} onChange={e => setStiffness(+e.target.value)} />
            </div>
            <div className="anim-slider-row">
              <div className="anim-slider-header">
                <span className="anim-slider-label">Damping</span>
                <span className="anim-slider-value">{damping}</span>
              </div>
              <input className="anim-slider" type="range" min={1} max={50} value={damping} onChange={e => setDamping(+e.target.value)} />
            </div>
            <div className="anim-slider-row">
              <div className="anim-slider-header">
                <span className="anim-slider-label">Mass</span>
                <span className="anim-slider-value">{mass.toFixed(1)}</span>
              </div>
              <input className="anim-slider" type="range" min={1} max={50} value={mass * 10} onChange={e => setMass(+e.target.value / 10)} />
            </div>
            <Button variant="primary" size="sm" onClick={animateBall}>Animate</Button>
          </div>
          <div>
            <canvas ref={canvasRef} className="anim-spring-canvas" />
          </div>
        </div>
        <div className="anim-spring-ball-track">
          <div ref={ballRef} className="anim-spring-ball" style={{ left: 0 }} />
        </div>
      </div>
      <pre className="anim-code">{`import { spring } from '@ui/core/motion'

spring(element, { left: '200px' }, {
  stiffness: ${stiffness},
  damping: ${damping},
  mass: ${mass.toFixed(1)},
})`}</pre>
    </div>
  )
}

/* ─── 2. Motion Levels ──────────────────────────────────────────────────────── */

const motionDescriptions = [
  { level: 0, label: 'None', desc: 'Instant transitions. No animation.' },
  { level: 1, label: 'Subtle', desc: 'Gentle CSS transitions only.' },
  { level: 2, label: 'Expressive', desc: 'Conservative spring, no overshoot.' },
  { level: 3, label: 'Cinematic', desc: 'Full physics with spring overshoot.' },
]

function MotionLevelsSection() {
  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Motion Levels</h2>
      <p className="anim-section-desc">
        Components adapt animation intensity based on the motion level. Use the sidebar controls to switch globally, or set per-component.
      </p>
      <div className="anim-demo-area">
        <div className="anim-motion-grid">
          {motionDescriptions.map(m => (
            <div key={m.level} className="anim-motion-card">
              <span className="anim-motion-label">Level {m.level} &mdash; {m.label}</span>
              <Button variant="primary" size="sm" motion={m.level as 0|1|2|3}>
                Hover me
              </Button>
              <span className="anim-motion-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <pre className="anim-code">{`<Button motion={0}>No animation</Button>
<Button motion={3}>Full physics</Button>

// Or globally via UIProvider:
<UIProvider motion={2}>...</UIProvider>`}</pre>
    </div>
  )
}

/* ─── 3. Stagger Patterns ───────────────────────────────────────────────────── */

const staggerColors = [
  'oklch(65% 0.2 270)', 'oklch(65% 0.2 300)', 'oklch(65% 0.2 330)',
  'oklch(65% 0.2 0)',   'oklch(65% 0.2 30)',  'oklch(65% 0.2 60)',
  'oklch(65% 0.2 90)',  'oklch(65% 0.2 120)', 'oklch(65% 0.2 150)',
  'oklch(65% 0.2 180)', 'oklch(65% 0.2 210)', 'oklch(65% 0.2 240)',
]

function StaggerSection() {
  const [from, setFrom] = useState<StaggerFrom>('start')
  const [key, setKey] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  const count = 24

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cells = Array.from(grid.children) as HTMLElement[]
    const delays = computeStaggerDelays(count, { each: 50, from })

    // Reset
    cells.forEach(cell => {
      cell.classList.remove('anim-stagger-cell--visible')
      cell.style.transition = 'none'
    })

    // Force reflow
    void grid.offsetHeight

    // Animate in
    requestAnimationFrame(() => {
      cells.forEach((cell, i) => {
        cell.style.transition = `opacity 0.3s ease-out ${delays[i]}ms, transform 0.3s ease-out ${delays[i]}ms`
        cell.classList.add('anim-stagger-cell--visible')
      })
    })
  }, [from, key])

  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Stagger Patterns</h2>
      <p className="anim-section-desc">
        Compute stagger delays for sequenced animations. Choose a pattern and watch the grid animate.
      </p>
      <div className="anim-demo-area">
        <div className="anim-stagger-toolbar">
          <select className="anim-select" value={from as string} onChange={e => setFrom(e.target.value as StaggerFrom)}>
            <option value="start">From start</option>
            <option value="end">From end</option>
            <option value="center">From center</option>
            <option value="edges">From edges</option>
            <option value="random">Random</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => setKey(k => k + 1)}>Replay</Button>
        </div>
        <div ref={gridRef} className="anim-stagger-grid" key={key}>
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              className="anim-stagger-cell"
              style={{ background: staggerColors[i % staggerColors.length] }}
            />
          ))}
        </div>
      </div>
      <pre className="anim-code">{`import { computeStaggerDelays } from '@ui/core/motion'

const delays = computeStaggerDelays(24, {
  each: 50,
  from: '${from}',
})`}</pre>
    </div>
  )
}

/* ─── 4. Scroll Reveal ──────────────────────────────────────────────────────── */

function ScrollRevealCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useScrollReveal(ref, { threshold: 0.3, once: true })

  return (
    <div
      ref={ref}
      className={`anim-scroll-card${visible ? ' anim-scroll-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="anim-scroll-card-title">Card {index + 1}</div>
      <div className="anim-scroll-card-text">
        This card fades in when scrolled into view using IntersectionObserver with CSS scroll-driven animation fallback.
      </div>
    </div>
  )
}

function ScrollRevealSection() {
  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Scroll Reveal</h2>
      <p className="anim-section-desc">
        Cards animate in as they enter the scrollable viewport. Uses CSS scroll-driven animations with IntersectionObserver fallback.
      </p>
      <div className="anim-demo-area">
        <div className="anim-scroll-container">
          {Array.from({ length: 8 }, (_, i) => (
            <ScrollRevealCard key={i} index={i} />
          ))}
        </div>
      </div>
      <pre className="anim-code">{`import { useScrollReveal } from '@ui/core/motion'

const ref = useRef(null)
const visible = useScrollReveal(ref, { threshold: 0.3, once: true })

<div ref={ref} className={visible ? 'revealed' : ''}>
  Content
</div>`}</pre>
    </div>
  )
}

/* ─── 5. Text Splitter ──────────────────────────────────────────────────────── */

function TextSplitterSection() {
  const [text, setText] = useState('Aurora Fluid')
  const [splitBy, setSplitBy] = useState<'chars' | 'words' | 'lines'>('chars')
  const [key, setKey] = useState(0)

  const handleTextChange = (newText: string) => {
    setText(newText)
    setKey(k => k + 1)
  }

  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Text Splitter</h2>
      <p className="anim-section-desc">
        Split text into characters, words, or lines for staggered reveal animations. Type below to see live splitting.
      </p>
      <div className="anim-demo-area">
        <input
          className="anim-text-input"
          type="text"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          placeholder="Type something..."
        />
        <div className="anim-text-split-modes">
          {(['chars', 'words', 'lines'] as const).map(mode => (
            <button
              key={mode}
              className={`icons-size-btn${splitBy === mode ? ' icons-size-btn--active' : ''}`}
              onClick={() => { setSplitBy(mode); setKey(k => k + 1) }}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${splitBy === mode ? 'var(--brand)' : 'var(--border-default)'}`,
                background: splitBy === mode ? 'var(--brand-subtle)' : 'transparent',
                color: splitBy === mode ? 'var(--brand)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >{mode}</button>
          ))}
        </div>
        <div className="anim-text-output" key={key}>
          <TextSplitter
            text={text}
            splitBy={splitBy}
            charClassName="anim-text-char"
          />
        </div>
      </div>
      <pre className="anim-code">{`import { TextSplitter } from '@ui/core/motion'

<TextSplitter
  text="${text}"
  splitBy="${splitBy}"
  charClassName="my-reveal-class"
/>`}</pre>
    </div>
  )
}

/* ─── 6. Timeline ───────────────────────────────────────────────────────────── */

function TimelineSection() {
  const headingRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<Timeline | null>(null)

  const play = useCallback(() => {
    // Reset
    if (tlRef.current) tlRef.current.cancel()
    const h = headingRef.current
    const s = subRef.current
    const a = actionsRef.current
    if (!h || !s || !a) return

    h.style.opacity = '0'
    h.style.transform = 'translateX(-30px)'
    s.style.opacity = '0'
    s.style.transform = 'translateX(-20px)'
    a.style.opacity = '0'
    a.style.transform = 'translateY(10px)'

    const tl = timeline()
      .add(() => animate(h, [
        { opacity: 0, transform: 'translateX(-30px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 400, easing: 'ease-out' }))
      .add(() => animate(s, [
        { opacity: 0, transform: 'translateX(-20px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 350, easing: 'ease-out' }), '-100')
      .add(() => animate(a, [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 300, easing: 'ease-out' }), '-100')

    tlRef.current = tl
    tl.play()
  }, [])

  // Auto-play on mount
  useEffect(() => {
    const timer = setTimeout(play, 300)
    return () => clearTimeout(timer)
  }, [play])

  return (
    <div className="anim-section">
      <h2 className="anim-section-title">Timeline</h2>
      <p className="anim-section-desc">
        Choreograph sequences of animations with precise timing offsets. Heading slides in, then subtitle, then action buttons.
      </p>
      <div className="anim-demo-area">
        <div style={{ marginBlockEnd: '1rem' }}>
          <Button variant="primary" size="sm" onClick={play}>Play</Button>
        </div>
        <div className="anim-timeline-stage">
          <div ref={headingRef} className="anim-timeline-heading">Welcome to Aurora</div>
          <div ref={subRef} className="anim-timeline-sub">Physics-based animations that feel alive</div>
          <div ref={actionsRef} className="anim-timeline-actions">
            <Button variant="primary" size="sm">Get Started</Button>
            <Button variant="ghost" size="sm">Learn More</Button>
          </div>
        </div>
      </div>
      <pre className="anim-code">{`import { timeline, animate } from '@ui/core/motion'

const tl = timeline()
  .add(() => animate(heading, [
    { opacity: 0, transform: 'translateX(-30px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ], { duration: 400 }))
  .add(() => animate(subtitle, [...]), '-100')
  .add(() => animate(actions, [...]), '-100')

tl.play()`}</pre>
    </div>
  )
}

/* ─── 7. FLIP ───────────────────────────────────────────────────────────────── */

const flipItems = [
  { id: 'a', label: 'Alpha', color: 'oklch(65% 0.2 270)' },
  { id: 'b', label: 'Beta', color: 'oklch(65% 0.2 150)' },
  { id: 'c', label: 'Gamma', color: 'oklch(65% 0.2 30)' },
  { id: 'd', label: 'Delta', color: 'oklch(65% 0.2 330)' },
]

function FlipSection() {
  const [isGrid, setIsGrid] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = useCallback(() => {
    if (!containerRef.current) return
    const items = Array.from(containerRef.current.querySelectorAll('.anim-flip-item'))
    const state = flip.capture(items)
    setIsGrid(g => !g)
    requestAnimationFrame(() => {
      flip.play(state, { duration: 400, easing: 'ease-out' })
    })
  }, [])

  return (
    <div className="anim-section">
      <h2 className="anim-section-title">FLIP Animations</h2>
      <p className="anim-section-desc">
        First-Last-Invert-Play technique for layout transitions. Toggle between grid and list to see items smoothly reposition.
      </p>
      <div className="anim-demo-area">
        <div style={{ marginBlockEnd: '1rem' }}>
          <Button variant="primary" size="sm" onClick={toggle}>
            Switch to {isGrid ? 'List' : 'Grid'}
          </Button>
        </div>
        <div ref={containerRef} className={isGrid ? 'anim-flip-grid' : 'anim-flip-list'}>
          {flipItems.map(item => (
            <div key={item.id} className="anim-flip-item" style={{ background: item.color }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
      <pre className="anim-code">{`import { flip } from '@ui/core/motion'

// 1. Capture current positions
const state = flip.capture('.my-items')

// 2. Make DOM change (React setState, etc.)
setLayout('list')

// 3. Play the transition
requestAnimationFrame(() => {
  flip.play(state, { duration: 400 })
})`}</pre>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function AnimationsPage() {
  useStyles('anim-page', pageStyles)

  return (
    <div className="anim-page">
      <div className="anim-page-header">
        <h1 className="anim-page-title">Animations</h1>
        <p className="anim-page-desc">
          A complete physics-based animation engine. Spring solver, stagger patterns,
          scroll reveal, text splitting, timeline choreography, and FLIP layout transitions.
        </p>
      </div>

      <SpringSection />
      <MotionLevelsSection />
      <StaggerSection />
      <ScrollRevealSection />
      <TextSplitterSection />
      <TimelineSection />
      <FlipSection />
    </div>
  )
}
