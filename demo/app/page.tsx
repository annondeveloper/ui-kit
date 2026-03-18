'use client'

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Sun, Moon, Github, Package } from 'lucide-react'
import { Toaster } from '../../src/index'

// Lazy imports — JS only loads when section enters viewport
const HeroSection = lazy(() => import('./sections/hero'))
const AIRealtimeSection = lazy(() => import('./sections/ai-realtime'))
const SmartDataSection = lazy(() => import('./sections/smart-data'))
const MonitoringSection = lazy(() => import('./sections/monitoring'))
const InteractiveSection = lazy(() => import('./sections/interactive'))
const CoreSection = lazy(() => import('./sections/core'))
const FormsSection = lazy(() => import('./sections/forms'))
const LayoutSection = lazy(() => import('./sections/layout'))

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'ai-realtime', label: 'AI & Real-Time' },
  { id: 'smart-data', label: 'Smart Data' },
  { id: 'monitoring', label: 'Monitoring Dashboard' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'core', label: 'Core Components' },
  { id: 'forms', label: 'Forms' },
  { id: 'layout-feedback', label: 'Layout & Feedback' },
]

// ---------------------------------------------------------------------------
// LazySection — mounts child only when scrolled into view
// ---------------------------------------------------------------------------

function LazySection({ id, children }: { id: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section id={id} ref={ref} className="scroll-mt-28 min-h-[200px]">
      {visible ? children : (
        <div className="h-96 animate-pulse rounded-2xl bg-[hsl(var(--bg-elevated))]" />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section skeleton fallback
// ---------------------------------------------------------------------------

function SectionSkeleton() {
  return <div className="h-96 animate-pulse rounded-2xl bg-[hsl(var(--bg-elevated))]" />
}

// ---------------------------------------------------------------------------
// Main Page — thin shell
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Toaster />

      {/* Sticky header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-[hsl(var(--bg-base)/0.85)] border-b border-[hsl(var(--border-subtle))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            @annondeveloper/ui-kit
          </span>
          <div className="flex items-center gap-3">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-2 py-1 text-[10px] text-[hsl(var(--text-tertiary))] font-mono">
              Cmd+K
            </kbd>
            <a
              href="https://github.com/annondeveloper/ui-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Section nav pills */}
        <div className="max-w-7xl mx-auto px-6 pb-2 overflow-x-auto">
          <div className="flex gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))]'
                    : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))]'
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        {/* Hero — always loaded (above the fold) */}
        <Suspense fallback={<SectionSkeleton />}>
          <HeroSection />
        </Suspense>

        <div className="space-y-24">
          <LazySection id="ai-realtime">
            <Suspense fallback={<SectionSkeleton />}>
              <AIRealtimeSection />
            </Suspense>
          </LazySection>

          <LazySection id="smart-data">
            <Suspense fallback={<SectionSkeleton />}>
              <SmartDataSection />
            </Suspense>
          </LazySection>

          <LazySection id="monitoring">
            <Suspense fallback={<SectionSkeleton />}>
              <MonitoringSection />
            </Suspense>
          </LazySection>

          <LazySection id="interactive">
            <Suspense fallback={<SectionSkeleton />}>
              <InteractiveSection />
            </Suspense>
          </LazySection>

          <LazySection id="core">
            <Suspense fallback={<SectionSkeleton />}>
              <CoreSection />
            </Suspense>
          </LazySection>

          <LazySection id="forms">
            <Suspense fallback={<SectionSkeleton />}>
              <FormsSection />
            </Suspense>
          </LazySection>

          <LazySection id="layout-feedback">
            <Suspense fallback={<SectionSkeleton />}>
              <LayoutSection />
            </Suspense>
          </LazySection>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[hsl(var(--border-subtle))] text-center">
          <p className="text-sm text-[hsl(var(--text-tertiary))]">
            53 components. Zero compromises. Built for monitoring dashboards, AI interfaces, and professional tools.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
              <Github className="h-3.5 w-3.5" /> GitHub
            </a>
            <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(var(--brand-primary))] hover:underline inline-flex items-center gap-1">
              <Package className="h-3.5 w-3.5" /> npm
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
