import { useEffect, type ReactNode } from 'react'
import type { ThemeTokens } from '../core/tokens/tokens'
import { applyTheme } from '../core/tokens/generator'
import { ThemeProvider } from '../core/tokens/theme-context'
import { MotionProvider } from '../core/motion/motion-context'
import { DensityProvider, type Density } from '../core/tokens/density-context'
import { oklchFallbackStyles } from '../core/styles/fallbacks'
import { injectCSS } from '../core/styles/dom-injector'

export interface UIProviderProps {
  children: ReactNode
  theme?: ThemeTokens
  mode?: 'dark' | 'light'
  motion?: 0 | 1 | 2 | 3
  density?: Density
  onModeChange?: (mode: 'dark' | 'light') => void
}

export function UIProvider({
  children,
  theme,
  mode = 'dark',
  motion = 3,
  density = 'default',
  onModeChange,
}: UIProviderProps) {
  // Inject OKLCH fallbacks for older browsers (no-op if already injected)
  useEffect(() => {
    injectCSS(oklchFallbackStyles.id, oklchFallbackStyles.css)
  }, [])

  // Apply theme tokens if provided
  useEffect(() => {
    if (theme) applyTheme(theme)
  }, [theme])

  // Toggle light/dark mode class on html
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('light', mode === 'light')
  }, [mode])

  return (
    <ThemeProvider tokens={theme} mode={mode} onModeChange={onModeChange}>
      <MotionProvider level={motion}>
        <DensityProvider density={density}>
          <div data-motion={motion} data-density={density} data-ui-provider>
            {children}
          </div>
        </DensityProvider>
      </MotionProvider>
    </ThemeProvider>
  )
}
