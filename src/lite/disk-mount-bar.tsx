import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteMountInfo { mount: string; totalBytes: number; usedBytes: number; freeBytes: number; utilPct: number }

export interface LiteDiskMountBarProps extends HTMLAttributes<HTMLDivElement> {
  mounts: LiteMountInfo[]
  maxVisible?: number
  showFree?: boolean
}

function fmtB(b: number): string {
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`
  if (b < 1024 ** 4) return `${(b / 1024 ** 3).toFixed(1)} GB`
  return `${(b / 1024 ** 4).toFixed(1)} TB`
}

function barColor(pct: number): string {
  if (pct >= 90) return 'oklch(62% 0.22 25)'
  if (pct >= 70) return 'oklch(78% 0.17 85)'
  return 'oklch(72% 0.19 155)'
}

/** Lite disk mount bar — simple HTML bars, no animation */
export const DiskMountBar = forwardRef<HTMLDivElement, LiteDiskMountBarProps>(
  ({ mounts, maxVisible = 3, showFree, className, ...rest }, ref) => {
    const visible = mounts.slice(0, maxVisible)
    return (
      <div ref={ref} className={`ui-lite-disk-mount-bar${className ? ` ${className}` : ''}`} {...rest}>
        {visible.map((m) => (
          <div key={m.mount} style={{ marginBlockEnd: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBlockEnd: 2 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.mount}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{m.utilPct.toFixed(1)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: 'oklch(100% 0 0 / 0.06)' }}>
              <div style={{ height: '100%', width: `${m.utilPct}%`, background: barColor(m.utilPct), borderRadius: 3 }} />
            </div>
            {showFree && <span style={{ fontSize: '0.7rem', color: 'oklch(55% 0 0)' }}>{fmtB(m.freeBytes)} free</span>}
          </div>
        ))}
        {mounts.length > maxVisible && (
          <span style={{ fontSize: '0.75rem', color: 'oklch(55% 0 0)' }}>+{mounts.length - maxVisible} more</span>
        )}
      </div>
    )
  }
)
DiskMountBar.displayName = 'DiskMountBar'
