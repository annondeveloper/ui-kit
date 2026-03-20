import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
import { Icon } from '@ui/core/icons/icon'

interface PreviewProps {
  label: string
  description?: string
  code?: string
  wide?: boolean
  children: ReactNode
}

export function Preview({ label, description, code, wide, children }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleCopy = useCallback(() => {
    if (!code) return
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        ...(wide ? { gridColumn: '1 / -1' } : {}),
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem 0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</h3>
        {description && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{description}</p>
        )}
      </div>

      {/* Live demo */}
      <div style={{ padding: '1.25rem', minHeight: 80 }}>
        {children}
      </div>

      {/* Code */}
      {code && (
        <div style={{
          position: 'relative',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-base)',
        }}>
          <pre style={{
            padding: '0.75rem 1rem',
            fontSize: 'var(--text-xs)',
            lineHeight: 1.7,
            overflowX: 'auto',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            <code>{code.trim()}</code>
          </pre>
          <button
            onClick={handleCopy}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              padding: '0.375rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: copied ? 'var(--status-ok)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
            aria-label="Copy code"
          >
            <Icon name={copied ? 'check' : 'copy'} size="sm" />
          </button>
        </div>
      )}
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
