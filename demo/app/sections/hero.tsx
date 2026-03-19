'use client'

import React, { useState, useCallback } from 'react'
import { Copy, Check, ArrowDown } from 'lucide-react'

export default function HeroSection(): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="hero-gradient relative rounded-2xl sm:rounded-3xl px-6 py-12 sm:px-12 sm:py-20 mt-6 mb-12 sm:mb-16 overflow-hidden scanlines">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(hsl(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--text-primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-base)/0.5)] backdrop-blur mb-6">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-ok))] animate-pulse" />
          <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))]">v0.2 — 53 components</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] mb-4 leading-[1.1]">
          Build dashboards
          <br />
          <span className="text-[hsl(var(--brand-primary))]">that operate.</span>
        </h1>

        <p className="text-sm sm:text-base text-[hsl(var(--text-secondary))] max-w-xl mb-8 leading-relaxed">
          53 React components for monitoring, AI interfaces, and infrastructure tools.
          Dark/light theme. Accessible. Real-time primitives. Zero configuration.
        </p>

        {/* Install */}
        <button
          onClick={handleCopy}
          className="group inline-flex items-center gap-3 rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-default))] px-4 py-2.5 font-mono text-xs sm:text-sm text-[hsl(var(--text-primary))] hover:border-[hsl(var(--brand-primary)/0.5)] transition-colors cursor-pointer"
        >
          <span className="text-[hsl(var(--status-ok))]">$</span>
          <span>npm install @annondeveloper/ui-kit</span>
          {copied
            ? <Check className="h-3.5 w-3.5 text-[hsl(var(--status-ok))]" />
            : <Copy className="h-3.5 w-3.5 text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))]" />
          }
        </button>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['AI-Ready', 'Real-Time', 'CLI', 'Dark/Light', 'Accessible', 'Tree-Shakeable'].map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-tertiary))] border border-[hsl(var(--border-subtle))]">
              {tag}
            </span>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex justify-center sm:justify-start">
          <ArrowDown className="h-4 w-4 text-[hsl(var(--text-tertiary))] animate-bounce" />
        </div>
      </div>
    </div>
  )
}
