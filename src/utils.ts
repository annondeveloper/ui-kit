import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind CSS class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Format bits/sec into human-readable string (clamps negative to 0). */
export function fmtBps(bps: number): string {
  const v = Math.max(0, bps)
  if (v >= 1e12) return `${(v / 1e12).toFixed(1)} Tbps`
  if (v >= 1e9)  return `${(v / 1e9).toFixed(1)} Gbps`
  if (v >= 1e6)  return `${(v / 1e6).toFixed(1)} Mbps`
  if (v >= 1e3)  return `${(v / 1e3).toFixed(1)} Kbps`
  return `${v.toFixed(0)} bps`
}

/** Format link speed for interface display (e.g. 1000000000 -> "1G"). */
export function fmtSpeed(bps: number): string {
  if (bps >= 1e12) return `${(bps / 1e12).toFixed(0)}T`
  if (bps >= 1e9)  return `${(bps / 1e9).toFixed(0)}G`
  if (bps >= 1e6)  return `${(bps / 1e6).toFixed(0)}M`
  if (bps >= 1e3)  return `${(bps / 1e3).toFixed(0)}K`
  return `${bps.toFixed(0)}`
}

/** Format utilization as percentage of link speed. */
export function fmtUtil(bps: number, speedBps: number): string {
  if (speedBps <= 0) return '\u2014'
  const pct = (Math.max(0, bps) / speedBps) * 100
  if (pct < 0.01) return '0%'
  if (pct < 1) return `${pct.toFixed(2)}%`
  if (pct < 10) return `${pct.toFixed(1)}%`
  return `${pct.toFixed(0)}%`
}

/** Format bytes into human-readable string. */
export function fmtBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`
  if (bytes >= 1e9)  return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6)  return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3)  return `${(bytes / 1e3).toFixed(1)} KB`
  return `${bytes.toFixed(0)} B`
}

/** Format percent. */
export function fmtPct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`
}

/** Format duration in seconds to human-readable uptime string. */
export function fmtUptime(secs: number): string {
  if (secs < 60)    return `${secs}s`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`
  return `${Math.floor(secs / 86400)}d ${Math.floor((secs % 86400) / 3600)}h`
}

/** Format ISO timestamp to relative time ("3m ago"). */
export function fmtRelative(isoStr: string): string {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** Format large numbers compactly (e.g. 480933305 -> "480.9M", 1234 -> "1.2K"). */
export function fmtCompact(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`
  if (abs >= 1e9)  return `${sign}${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6)  return `${sign}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3)  return `${sign}${(abs / 1e3).toFixed(1)}K`
  if (abs >= 1)    return `${sign}${abs.toFixed(0)}`
  if (abs >= 0.01) return `${sign}${abs.toFixed(2)}`
  return `${sign}${abs.toFixed(0)}`
}

/** Format seconds duration compactly (e.g. for replication lag display). */
export function fmtDuration(secs: number): string {
  if (secs < 0.001) return '0s'
  if (secs < 1)     return `${(secs * 1000).toFixed(0)}ms`
  if (secs < 60)    return `${secs.toFixed(1)}s`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ${Math.floor(secs % 60)}s`
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`
}

/** Strip CIDR suffix from IP address (e.g. "10.0.0.1/32" -> "10.0.0.1"). */
export function stripCidr(ip: string): string {
  return ip.replace(/\/\d+$/, '')
}

/** Clamp a number between min and max. */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

/** Color thresholds for utilization percentage mapping. */
export interface UtilColorMap {
  high: { threshold: number; className: string }
  medium: { threshold: number; className: string }
  low: { className: string }
}

/** Default utilization color map using CSS custom property token classes. */
export const defaultUtilColorMap: UtilColorMap = {
  high:   { threshold: 80, className: 'text-[hsl(var(--status-critical))]' },
  medium: { threshold: 60, className: 'text-[hsl(var(--status-warning))]' },
  low:    { className: 'text-[hsl(var(--status-ok))]' },
}

/**
 * Get utilization color class from value 0-100.
 * Accepts an optional color map to override the default thresholds and classes.
 */
export function utilColor(pct: number, colorMap: UtilColorMap = defaultUtilColorMap): string {
  if (pct >= colorMap.high.threshold) return colorMap.high.className
  if (pct >= colorMap.medium.threshold) return colorMap.medium.className
  return colorMap.low.className
}
