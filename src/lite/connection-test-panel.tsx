import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteTestStep { id: string; label: string; status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'; message?: string; duration?: number }

export interface LiteConnectionTestPanelProps extends HTMLAttributes<HTMLDivElement> {
  steps: LiteTestStep[]
  title?: string
  onRetry?: () => void
}

const ICONS: Record<string, string> = { pending: '\u2022', running: '\u25E6', passed: '\u2713', failed: '\u2717', skipped: '\u2212' }
const COLORS: Record<string, string> = { pending: 'oklch(55% 0 0)', running: 'oklch(65% 0.2 270)', passed: 'oklch(72% 0.19 155)', failed: 'oklch(62% 0.22 25)', skipped: 'oklch(55% 0 0)' }

/** Lite connection test panel — simple step list, no animation */
export const ConnectionTestPanel = forwardRef<HTMLDivElement, LiteConnectionTestPanelProps>(
  ({ steps, title = 'Connection Test', onRetry, className, ...rest }, ref) => {
    const passed = steps.filter(s => s.status === 'passed').length
    const failed = steps.filter(s => s.status === 'failed').length
    return (
      <div ref={ref} className={`ui-lite-connection-test-panel${className ? ` ${className}` : ''}`} style={{ border: '1px solid oklch(100% 0 0 / 0.1)', borderRadius: 8 }} {...rest}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderBottom: '1px solid oklch(100% 0 0 / 0.1)' }}>
          <strong style={{ fontSize: '0.875rem' }}>{title}</strong>
          {onRetry && <button type="button" onClick={onRetry} style={{ fontSize: '0.75rem', cursor: 'pointer', background: 'none', border: 'none', color: 'oklch(65% 0.2 270)' }}>&#8635; Retry</button>}
        </div>
        <div style={{ padding: '0.25rem 0' }}>
          {steps.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
              <span style={{ color: COLORS[s.status], fontWeight: 700 }}>{ICONS[s.status]}</span>
              <span style={{ flex: 1 }}>{s.label}</span>
              <span style={{ fontSize: '0.7rem', color: COLORS[s.status], textTransform: 'uppercase' }}>{s.status}</span>
              {s.duration !== undefined && <span style={{ fontSize: '0.7rem', color: 'oklch(55% 0 0)', fontVariantNumeric: 'tabular-nums' }}>{s.duration}ms</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.75rem', borderTop: '1px solid oklch(100% 0 0 / 0.1)', fontSize: '0.7rem', color: 'oklch(55% 0 0)' }}>
          <span>{passed} passed{failed > 0 ? ` \u00b7 ${failed} failed` : ''}</span>
          <span>{steps.length} total</span>
        </div>
      </div>
    )
  }
)
ConnectionTestPanel.displayName = 'ConnectionTestPanel'
