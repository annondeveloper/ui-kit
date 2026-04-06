'use client'

/**
 * Adaptive Tier Debug Overlay
 *
 * Floating badge (bottom-right) showing current adaptive tier info.
 * Only renders in development mode — tree-shaken in production.
 * Toggle with Ctrl+Shift+A.
 */

import { useState, useEffect, useCallback, type ReactElement } from 'react'
import { useAdaptiveContext } from './adaptive-context'

const STORAGE_KEY = 'ui-kit-adaptive-overlay'

export function AdaptiveDevOverlay(): ReactElement | null {
  const adaptive = useAdaptiveContext()
  const [expanded, setExpanded] = useState(false)
  const [visible, setVisible] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true
    return sessionStorage.getItem(STORAGE_KEY) !== 'hidden'
  })

  // Keyboard toggle: Ctrl+Shift+A
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault()
      setVisible(v => {
        const next = !v
        try { sessionStorage.setItem(STORAGE_KEY, next ? 'visible' : 'hidden') } catch {}
        return next
      })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!visible || !adaptive.isAdaptive) return null

  const tierColor = adaptive.tier === 'premium' ? '#8b5cf6'
    : adaptive.tier === 'standard' ? '#3b82f6' : '#10b981'
  const tierIcon = adaptive.tier === 'premium' ? '✨' : adaptive.tier === 'standard' ? '⚡' : '🪶'

  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    fontSize: '0.75rem',
    lineHeight: 1.4,
    pointerEvents: 'auto',
  }

  const badgeStyle: React.CSSProperties = {
    ...baseStyle,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '999px',
    background: `${tierColor}22`,
    color: tierColor,
    border: `1px solid ${tierColor}44`,
    cursor: 'pointer',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    userSelect: 'none' as const,
  }

  const panelStyle: React.CSSProperties = {
    ...baseStyle,
    bottom: '1rem',
    right: '1rem',
    width: '280px',
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(15,15,20,0.95)',
    border: `1px solid ${tierColor}33`,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    color: '#e8e8f0',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.25rem 0',
  }

  const labelStyle: React.CSSProperties = { color: '#8888a0' }
  const valueStyle: React.CSSProperties = { fontWeight: 600, fontFamily: '"SF Mono", monospace' }

  if (!expanded) {
    return (
      <div style={badgeStyle} onClick={() => setExpanded(true)} title="Adaptive Tier (Ctrl+Shift+A)">
        {tierIcon} {adaptive.tier} m{adaptive.motion}
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontWeight: 700, color: tierColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {tierIcon} {adaptive.tier}
        </span>
        <span
          style={{ cursor: 'pointer', color: '#8888a0', fontSize: '1rem', lineHeight: 1 }}
          onClick={() => setExpanded(false)}
        >
          ×
        </span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Motion</span>
        <span style={valueStyle}>{adaptive.motion}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Confidence</span>
        <span style={valueStyle}>{adaptive.confidence}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Reason</span>
        <span style={{ ...valueStyle, fontSize: '0.6875rem', maxWidth: '160px', textAlign: 'right' as const }}>{adaptive.reason}</span>
      </div>
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ ...labelStyle, marginBottom: '0.375rem' }}>Override:</div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['lite', 'standard', 'premium'] as const).map(t => (
            <span
              key={t}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: adaptive.tier === t ? `${tierColor}33` : 'rgba(255,255,255,0.04)',
                color: adaptive.tier === t ? tierColor : '#8888a0',
                border: `1px solid ${adaptive.tier === t ? tierColor + '44' : 'transparent'}`,
              }}
              title={`Override to ${t} tier`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.625rem', color: '#555' }}>
        Ctrl+Shift+A to toggle • dev-only
      </div>
    </div>
  )
}
