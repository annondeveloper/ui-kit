import { createContext, useContext, type ReactNode } from 'react'
import { StyleCollector } from './ssr'

const StyleContext = createContext<StyleCollector | null>(null)

export function StyleProvider({ collector, children }: { collector: StyleCollector; children: ReactNode }) {
  return <StyleContext.Provider value={collector}>{children}</StyleContext.Provider>
}

export function useStyleCollector(): StyleCollector | null {
  return useContext(StyleContext)
}
