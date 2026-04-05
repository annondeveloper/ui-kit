'use client'

import { useState, useEffect } from 'react'

/**
 * Adaptive tier detection based on client network conditions.
 *
 * Strategy:
 * 1. Start with 'standard' (safe default — renders instantly with full HTML structure)
 * 2. Detect bandwidth using navigator.connection + resource timing
 * 3. Set tier: premium (fast), standard (moderate), lite (slow/save-data)
 * 4. Detection runs per-page (on mount), completes in <50ms
 * 5. Premium effects fade in via CSS transition (150ms ease-in)
 *
 * Mapping:
 *   4G + downlink > 5Mbps + !saveData  → premium  (motion 3)
 *   4G + downlink > 1.5Mbps            → standard (motion 2)
 *   3G / slow / saveData               → lite     (motion 0)
 */

export type AdaptiveTier = 'lite' | 'standard' | 'premium'

interface NetworkInfo {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
  downlink?: number         // Mbps
  rtt?: number              // ms
  saveData?: boolean
  addEventListener?: (type: string, listener: () => void) => void
  removeEventListener?: (type: string, listener: () => void) => void
}

interface AdaptiveResult {
  tier: AdaptiveTier
  motion: 0 | 1 | 2 | 3
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

function getNavigatorConnection(): NetworkInfo | null {
  if (typeof navigator === 'undefined') return null
  return (navigator as unknown as { connection?: NetworkInfo }).connection ?? null
}

function detectTierFromConnection(conn: NetworkInfo): AdaptiveResult {
  // User explicitly requested reduced data
  if (conn.saveData) {
    return { tier: 'lite', motion: 0, confidence: 'high', reason: 'Save-Data enabled' }
  }

  const type = conn.effectiveType
  const downlink = conn.downlink ?? 10 // default to fast if unknown
  const rtt = conn.rtt ?? 50 // default to fast if unknown

  // Only truly slow connections get lite
  // slow-2g: ~50Kbps, 2g: ~70Kbps — these genuinely struggle with any JS
  if (type === 'slow-2g' || type === '2g') {
    return { tier: 'lite', motion: 0, confidence: 'high', reason: `Slow connection: ${type}` }
  }

  // 3G with very low bandwidth — standard with reduced motion
  if (type === '3g' && downlink < 0.5) {
    return { tier: 'standard', motion: 1, confidence: 'medium', reason: `Slow 3G: ${downlink}Mbps` }
  }

  // 3G with decent bandwidth — standard with full motion
  if (type === '3g') {
    return { tier: 'standard', motion: 2, confidence: 'medium', reason: `3G: ${downlink}Mbps` }
  }

  // 4G/WiFi — premium for anything reasonable
  // Reality: premium effects add ~3KB per component. At 1Mbps that's 24ms.
  // Even 0.5Mbps loads premium in <50ms. Only degrade if truly constrained.
  if (downlink >= 1 || rtt < 100) {
    return { tier: 'premium', motion: 3, confidence: 'high', reason: `Fast: ${downlink}Mbps, ${rtt}ms RTT` }
  }

  if (downlink >= 0.4) {
    return { tier: 'standard', motion: 2, confidence: 'medium', reason: `Moderate: ${downlink}Mbps` }
  }

  return { tier: 'standard', motion: 1, confidence: 'low', reason: `Slow 4G: ${downlink}Mbps` }
}

function detectTierFromTiming(): AdaptiveResult {
  // Fallback: measure how fast the page loaded
  if (typeof performance === 'undefined') {
    return { tier: 'standard', motion: 2, confidence: 'low', reason: 'No performance API' }
  }

  const nav = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined
  if (!nav) {
    return { tier: 'standard', motion: 2, confidence: 'low', reason: 'No navigation timing' }
  }

  // TTFB is a proxy for connection quality
  // Most CDN-served sites have TTFB < 500ms even on 3G
  // Only truly slow connections (satellite, congested networks) exceed 1s
  const ttfb = nav.responseStart - nav.requestStart
  if (ttfb < 800) {
    return { tier: 'premium', motion: 3, confidence: 'medium', reason: `Good TTFB: ${Math.round(ttfb)}ms` }
  }
  if (ttfb < 2000) {
    return { tier: 'standard', motion: 2, confidence: 'medium', reason: `Moderate TTFB: ${Math.round(ttfb)}ms` }
  }

  return { tier: 'lite', motion: 0, confidence: 'medium', reason: `Slow TTFB: ${Math.round(ttfb)}ms` }
}

/**
 * Detect the optimal tier for the current network conditions.
 * Runs synchronously — no async, no delays.
 */
export function detectAdaptiveTier(): AdaptiveResult {
  // SSR: default to standard
  if (typeof window === 'undefined') {
    return { tier: 'standard', motion: 2, confidence: 'low', reason: 'SSR' }
  }

  // Check prefers-reduced-motion (OS-level setting)
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return { tier: 'lite', motion: 0, confidence: 'high', reason: 'prefers-reduced-motion' }
  }

  // Primary: Navigator.connection API
  const conn = getNavigatorConnection()
  if (conn?.effectiveType) {
    return detectTierFromConnection(conn)
  }

  // Fallback: performance timing
  return detectTierFromTiming()
}

/**
 * React hook for adaptive tier detection.
 * Runs detection on mount (per-page), locks tier for the page lifecycle.
 * Returns { tier, motion, confidence, reason }
 */
export function useAdaptiveTier(override?: AdaptiveTier): AdaptiveResult {
  const [result, setResult] = useState<AdaptiveResult>(() => {
    if (override) {
      const motionMap = { lite: 0, standard: 2, premium: 3 } as const
      return { tier: override, motion: motionMap[override], confidence: 'high' as const, reason: 'Manual override' }
    }
    return detectAdaptiveTier()
  })

  // Re-detect on mount (handles client-side navigation / new page loads)
  useEffect(() => {
    if (override) return
    const detected = detectAdaptiveTier()
    setResult(detected)
  }, [override])

  // Log detection result in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[ui-kit adaptive] Tier: ${result.tier} | Motion: ${result.motion} | ` +
        `Confidence: ${result.confidence} | Reason: ${result.reason}`
      )
    }
  }, [result.tier, result.motion, result.confidence, result.reason])

  return result
}
