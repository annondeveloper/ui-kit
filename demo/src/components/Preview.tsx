import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'

interface PreviewProps {
  label: string
  description?: string
  code: string
  glow?: 'ai' | 'monitor' | 'realtime' | 'interactive'
  wide?: boolean
  children: ReactNode
}

const glowClass: Record<string, string> = {
  ai: 'glow-ai',
  monitor: 'glow-monitor',
  realtime: 'glow-realtime',
  interactive: 'glow-interactive',
}

function highlightCode(code: string): ReactNode[] {
  const keywords = /\b(import|from|const|let|function|return|export|type|interface|true|false|null|undefined|new|await|async)\b/g
  const strings = /(["'`])(?:(?!\1).)*\1/g
  const comments = /\/\/.*/g

  const parts: { start: number; end: number; cls: string }[] = []

  for (const m of code.matchAll(strings)) {
    parts.push({ start: m.index!, end: m.index! + m[0].length, cls: 'text-[hsl(var(--status-ok))]' })
  }
  for (const m of code.matchAll(keywords)) {
    if (!parts.some(p => m.index! >= p.start && m.index! < p.end)) {
      parts.push({ start: m.index!, end: m.index! + m[0].length, cls: 'text-[hsl(var(--brand-primary))]' })
    }
  }
  for (const m of code.matchAll(comments)) {
    parts.push({ start: m.index!, end: m.index! + m[0].length, cls: 'text-[hsl(var(--text-tertiary))]' })
  }

  parts.sort((a, b) => a.start - b.start)

  const result: ReactNode[] = []
  let lastIdx = 0
  for (const p of parts) {
    if (p.start > lastIdx) result.push(code.slice(lastIdx, p.start))
    result.push(<span key={p.start} className={p.cls}>{code.slice(p.start, p.end)}</span>)
    lastIdx = p.end
  }
  if (lastIdx < code.length) result.push(code.slice(lastIdx))
  return result
}

export function Preview({ label, description, code, glow, wide, children }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          setInView(true)
        } else {
          setInView(false)
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Subtle glow pulse when entering viewport
  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    el.classList.add('viewport-highlight')
    const t = setTimeout(() => el.classList.remove('viewport-highlight'), 1200)
    return () => clearTimeout(t)
  }, [inView])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div
      ref={ref}
      className={`preview-card ${glow ? glowClass[glow] : ''} ${wide ? 'col-span-full' : ''}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-[hsl(var(--border-subtle))]">
        <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))]">{label}</h3>
        {description && (
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{description}</p>
        )}
      </div>

      {/* Live demo */}
      <div className="p-4 sm:p-5 min-h-[80px]">
        {children}
      </div>

      {/* Code */}
      <div className="relative border-t border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-base))]">
        <pre className="p-3 sm:p-4 text-xs leading-relaxed overflow-x-auto font-mono text-[hsl(var(--text-secondary))]">
          <code>{highlightCode(code.trim())}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  )
}

export function useInViewTimer(intervalMs: number, callback: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!intervalRef.current) {
            intervalRef.current = setInterval(callback, intervalMs)
          }
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [intervalMs, callback])

  return ref
}

/** Hook: returns [ref, isInView] based on IntersectionObserver */
export function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, inView]
}
