'use client'

import { createContext, useContext, type ReactNode, type ReactElement } from 'react'
import { type AdaptiveTier } from './use-adaptive-tier'

interface AdaptiveContextValue {
  tier: AdaptiveTier
  motion: 0 | 1 | 2 | 3
  confidence: 'high' | 'medium' | 'low'
  reason: string
  isAdaptive: boolean
}

const defaultValue: AdaptiveContextValue = {
  tier: 'standard',
  motion: 3,
  confidence: 'low',
  reason: 'default',
  isAdaptive: false,
}

export const AdaptiveContext = createContext<AdaptiveContextValue>(defaultValue)

export function AdaptiveProvider({
  value,
  children,
}: {
  value: AdaptiveContextValue
  children: ReactNode
}): ReactElement {
  return (
    <AdaptiveContext.Provider value={value}>
      {children}
    </AdaptiveContext.Provider>
  )
}

/**
 * Hook to read the current adaptive tier.
 * Returns { tier, motion, confidence, reason, isAdaptive }
 */
export function useAdaptiveContext(): AdaptiveContextValue {
  return useContext(AdaptiveContext)
}
