import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteStorageBarSegment { label: string; value: number; color?: string }

export interface LiteStorageBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: LiteStorageBarSegment[]
  total: number
  showLegend?: boolean
}

const COLORS = ['oklch(65% 0.2 270)', 'oklch(72% 0.19 155)', 'oklch(78% 0.17 85)', 'oklch(62% 0.22 25)', 'oklch(70% 0.16 200)']

/** Lite storage bar — simple HTML bar, no animation */
export const StorageBar = forwardRef<HTMLDivElement, LiteStorageBarProps>(
  ({ segments, total, showLegend, className, ...rest }, ref) => {
    return (
      <div ref={ref} className={`ui-lite-storage-bar${className ? ` ${className}` : ''}`} {...rest}>
        <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', background: 'oklch(100% 0 0 / 0.06)' }}>
          {segments.map((seg, i) => (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.value}`}
              style={{ width: `${(seg.value / total) * 100}%`, background: seg.color ?? COLORS[i % COLORS.length] }}
            />
          ))}
        </div>
        {showLegend && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.75rem', marginTop: 4 }}>
            {segments.map((seg, i) => (
              <span key={seg.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color ?? COLORS[i % COLORS.length], display: 'inline-block' }} />
                {seg.label}: {seg.value}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }
)
StorageBar.displayName = 'StorageBar'
