import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LitePluginMetricDef {
  key: string
  label: string
  format?: 'number' | 'bytes' | 'percent' | 'duration' | 'rate'
  unit?: string
}

export interface LitePluginPropertyDef {
  key: string
  label: string
}

export interface LitePluginDashboardConfig {
  name: string
  metrics: LitePluginMetricDef[]
  properties: LitePluginPropertyDef[]
}

export interface LitePluginDashboardProps extends HTMLAttributes<HTMLDivElement> {
  config: LitePluginDashboardConfig
  data: Record<string, unknown>
  loading?: boolean
  error?: ReactNode
}

function formatValue(value: unknown, format?: string, unit?: string): string {
  if (value == null) return '\u2014'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)

  switch (format) {
    case 'bytes': {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let v = num
      let i = 0
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
      return `${i === 0 ? v : v.toFixed(1)} ${units[i]}`
    }
    case 'percent':
      return `${num % 1 === 0 ? num : num.toFixed(1)}%`
    case 'duration': {
      if (num < 1000) return `${Math.round(num)}ms`
      if (num < 60_000) return `${(num / 1000).toFixed(1)}s`
      const mins = Math.floor(num / 60_000)
      const secs = Math.round((num % 60_000) / 1000)
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    }
    case 'rate': {
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M/s`
      if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K/s`
      return `${num.toFixed(0)}/s`
    }
    default:
      return unit ? `${num.toLocaleString()} ${unit}` : num.toLocaleString()
  }
}

/** Lite PluginDashboard — simple grid of metrics + properties list, no charts */
export const PluginDashboard = forwardRef<HTMLDivElement, LitePluginDashboardProps>(
  ({ config, data, loading, error, className, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`ui-lite-plugin-dashboard${className ? ` ${className}` : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          background: 'oklch(20% 0.01 270)',
          borderRadius: '0.5rem',
          border: '1px solid oklch(100% 0 0 / 0.08)',
          position: 'relative',
          ...style,
        }}
        {...rest}
      >
        {/* Title */}
        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'oklch(90% 0 0)' }}>
          {config.name}
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '0.75rem',
              borderRadius: '0.375rem',
              background: 'oklch(62% 0.22 25 / 0.1)',
              color: 'oklch(78% 0.16 25)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ fontSize: '0.875rem', color: 'oklch(55% 0 0)' }}>Loading...</div>
        )}

        {/* Metrics grid */}
        {!error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {config.metrics.map(m => (
              <div
                key={m.key}
                style={{
                  padding: '0.625rem',
                  background: 'oklch(100% 0 0 / 0.03)',
                  borderRadius: '0.375rem',
                  border: '1px solid oklch(100% 0 0 / 0.06)',
                }}
              >
                <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'oklch(55% 0 0)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'oklch(90% 0 0)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatValue(data[m.key], m.format, m.unit)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Properties */}
        {!error && config.properties.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {config.properties.map(p => (
              <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'oklch(55% 0 0)' }}>{p.label}</span>
                <span style={{ color: 'oklch(90% 0 0)' }}>{data[p.key] != null ? String(data[p.key]) : '\u2014'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

PluginDashboard.displayName = 'PluginDashboard'
