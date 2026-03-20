import { createContext, useContext, type ReactNode } from 'react'
import type { ThemeTokens } from './tokens'

interface ThemeContextValue {
  tokens: ThemeTokens | null
  mode: 'dark' | 'light'
  setMode: (mode: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextValue>({
  tokens: null,
  mode: 'dark',
  setMode: () => {},
})

export function ThemeProvider({ tokens, mode = 'dark', onModeChange, children }: {
  tokens?: ThemeTokens
  mode?: 'dark' | 'light'
  onModeChange?: (mode: 'dark' | 'light') => void
  children: ReactNode
}) {
  return (
    <ThemeContext.Provider value={{
      tokens: tokens ?? null,
      mode,
      setMode: onModeChange ?? (() => {}),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
