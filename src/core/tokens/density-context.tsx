import { createContext, useContext, type ReactNode } from 'react'

export type Density = 'compact' | 'default' | 'comfortable' | 'auto'

const DensityContext = createContext<Density>('default')

export function DensityProvider({ density, children }: { density: Density; children: ReactNode }) {
  // If 'auto', could detect viewport width and set accordingly
  // For now, 'auto' defaults to 'default' — real viewport detection can be added later
  const resolved = density === 'auto' ? 'default' : density
  return <DensityContext.Provider value={resolved}>{children}</DensityContext.Provider>
}

export function useDensity(): Density {
  return useContext(DensityContext)
}
