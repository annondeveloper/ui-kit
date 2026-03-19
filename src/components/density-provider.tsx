'use client'
import type React from 'react'
import { createContext, useContext } from 'react'
import { cn } from '../utils'

export type Density = 'compact' | 'comfortable' | 'spacious'

const DensityContext = createContext<Density>('comfortable')
export const useDensity = () => useContext(DensityContext)

export interface DensityProviderProps {
  mode: Density
  children: React.ReactNode
  className?: string
}

/** Global density control — wraps all components to adjust padding, font, and spacing. */
export function DensityProvider({ mode, children, className }: DensityProviderProps): React.JSX.Element {
  return (
    <DensityContext.Provider value={mode}>
      <div data-density={mode} className={cn('contents', className)}>
        {children}
      </div>
    </DensityContext.Provider>
  )
}
