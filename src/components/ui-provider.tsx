import { useEffect, type ReactNode, type ReactElement } from 'react'
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
}: UIProviderProps): ReactElement {
  // Inject OKLCH fallbacks for older browsers (no-op if already injected)
  useEffect(() => {
    injectCSS(oklchFallbackStyles.id, oklchFallbackStyles.css)
  }, [])

  // Warn if component CSS is not loaded (catches missing CSS import)
  useEffect(() => {
    if (typeof document === 'undefined') return
    // Check for a sentinel property set by theme.css or all.css
    const root = document.documentElement
    const styles = getComputedStyle(root)
    const hasBrand = styles.getPropertyValue('--brand').trim()
    const hasBg = styles.getPropertyValue('--bg-base').trim()
    if (!hasBrand && !hasBg) {
      console.warn(
        '[ui-kit] Component styles not detected. Did you import the CSS?\n\n' +
        '  Add to your root layout:\n' +
        "    import '@annondeveloper/ui-kit/css/theme.css'\n" +
        "    import '@annondeveloper/ui-kit/css/all.css'\n\n" +
        '  Or use the CLI: npx @annondeveloper/ui-kit init\n' +
        '  Docs: https://github.com/annondeveloper/ui-kit#setup'
      )
    }
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
