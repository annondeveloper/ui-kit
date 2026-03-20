export function fmtBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function fmtCompact(value: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

export function fmtPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function fmtRelative(timestamp: number): string {
  const diff = (Date.now() - timestamp) / 1000
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (diff < 60) return rtf.format(-Math.round(diff), 'second')
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  return rtf.format(-Math.round(diff / 86400), 'day')
}

export function fmtUptime(ratio: number): string {
  return `${(ratio * 100).toFixed(ratio >= 0.9999 ? 3 : 2)}%`
}

export function fmtBps(bps: number): string {
  return fmtBytes(bps).replace(' ', ' ') + '/s'
}
