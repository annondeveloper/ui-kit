'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, Package } from 'lucide-react'
import { Badge } from '../../../src/index'

export default function HeroSection() {
  const [installCopied, setInstallCopied] = useState(false)
  const handleCopyInstall = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setInstallCopied(true)
      setTimeout(() => setInstallCopied(false), 2000)
    })
  }, [])

  return (
    <div className="hero-gradient rounded-3xl p-10 sm:p-16 mt-8 mb-16 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-[hsl(var(--text-primary))] mb-4 tracking-tight">
        @annondeveloper/ui-kit
      </h1>
      <p className="text-lg text-[hsl(var(--text-secondary))] mb-6 max-w-2xl mx-auto">
        The React component library for monitoring dashboards, AI interfaces, and professional tools.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs font-medium text-[hsl(var(--text-secondary))]">
        <Badge color="brand" size="md">53 Components</Badge>
        <Badge color="purple" size="md">AI-Ready</Badge>
        <Badge color="green" size="md">Real-Time</Badge>
        <Badge color="blue" size="md">Dark/Light</Badge>
        <Badge color="teal" size="md">Accessible</Badge>
      </div>
      <button
        onClick={handleCopyInstall}
        className="inline-flex items-center gap-3 rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-default))] px-5 py-3 font-mono text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-surface))] transition-colors cursor-pointer"
      >
        <span className="text-[hsl(var(--text-tertiary))]">$</span>
        npm install @annondeveloper/ui-kit
        {installCopied ? <Check className="h-4 w-4 text-[hsl(var(--status-ok))]" /> : <Copy className="h-4 w-4 text-[hsl(var(--text-tertiary))]" />}
      </button>
    </div>
  )
}
