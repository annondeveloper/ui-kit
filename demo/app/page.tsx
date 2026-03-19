'use client'

import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react'
import { Sun, Moon, Github, Package, ExternalLink } from 'lucide-react'
import { Toaster } from '../../src/index'

const HeroSection = lazy(() => import('./sections/hero'))
const AIRealtimeSection = lazy(() => import('./sections/ai-realtime'))
const SmartDataSection = lazy(() => import('./sections/smart-data'))
const MonitoringSection = lazy(() => import('./sections/monitoring'))
const InteractiveSection = lazy(() => import('./sections/interactive'))
const CoreSection = lazy(() => import('./sections/core'))
const FormsSection = lazy(() => import('./sections/forms'))
const LayoutSection = lazy(() => import('./sections/layout'))

const SECTIONS = [
  { id: 'ai', label: 'AI & Real-Time', emoji: '🧠' },
  { id: 'data', label: 'Smart Data', emoji: '📊' },
  { id: 'monitor', label: 'Monitoring', emoji: '📡' },
  { id: 'interact', label: 'Interactive', emoji: '🎛' },
  { id: 'core', label: 'Core', emoji: '🧱' },
  { id: 'forms', label: 'Forms', emoji: '📝' },
  { id: 'layout', label: 'Layout', emoji: '📐' },
]

/* ── Lazy mount wrapper ─────────────────────────────────── */
function LazyMount({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect() } },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id={id} ref={ref} className="min-h-[120px]">
      {show ? (
        <div className="section-loaded">{children}</div>
      ) : (
        <div className="space-y-4">
          <div className="h-6 w-48 rounded bg-[hsl(var(--bg-elevated))] animate-pulse" />
          <div className="demo-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-[hsl(var(--bg-elevated))] animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Fallback() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 rounded bg-[hsl(var(--bg-elevated))] animate-pulse" />
      <div className="demo-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-xl bg-[hsl(var(--bg-elevated))] animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function DemoPage(): React.JSX.Element {
  const [dark, setDark] = useState(true)
  const [active, setActive] = useState('ai')

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  // Scroll-spy
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0) {
            setActive(e.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <>
      <Toaster theme={dark ? 'dark' : 'light'} />

      {/* ── Sticky nav ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[hsl(var(--bg-base)/0.8)] border-b border-[hsl(var(--border-subtle))]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-12">
          <span className="font-mono text-xs font-semibold text-[hsl(var(--text-primary))] tracking-tight">
            ui-kit
          </span>
          <div className="flex items-center gap-1.5">
            <a
              href="https://www.npmjs.com/package/@annondeveloper/ui-kit"
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))]"
              aria-label="npm"
            >
              <Package className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://github.com/annondeveloper/ui-kit"
              target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))]"
              aria-label="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] cursor-pointer"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Section pills — touch scroll */}
        <div className="nav-scroll max-w-6xl mx-auto px-4 sm:px-6 pb-2">
          <div className="flex gap-1 w-max">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  active === s.id
                    ? 'bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))]'
                    : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))]'
                }`}
              >
                <span className="hidden sm:inline">{s.emoji}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* Hero — always loaded */}
        <Suspense fallback={<Fallback />}>
          <HeroSection />
        </Suspense>

        <div className="space-y-20 sm:space-y-28">
          <LazyMount id="ai">
            <Suspense fallback={<Fallback />}>
              <AIRealtimeSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="data">
            <Suspense fallback={<Fallback />}>
              <SmartDataSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="monitor">
            <Suspense fallback={<Fallback />}>
              <MonitoringSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="interact">
            <Suspense fallback={<Fallback />}>
              <InteractiveSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="core">
            <Suspense fallback={<Fallback />}>
              <CoreSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="forms">
            <Suspense fallback={<Fallback />}>
              <FormsSection />
            </Suspense>
          </LazyMount>

          <LazyMount id="layout">
            <Suspense fallback={<Fallback />}>
              <LayoutSection />
            </Suspense>
          </LazyMount>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-[hsl(var(--border-subtle))]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[hsl(var(--text-tertiary))] text-center sm:text-left">
              53 components &middot; React 19 &middot; Tailwind v4 &middot; Framer Motion &middot; Radix UI
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
                npm <ExternalLink className="h-3 w-3" />
              </a>
              <a href="https://jsr.io/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer"
                className="text-xs text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
                JSR <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
