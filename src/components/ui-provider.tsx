import { useEffect, type ReactNode, type ReactElement } from 'react'
import type { ThemeTokens } from '../core/tokens/tokens'
import { applyTheme } from '../core/tokens/generator'
import { ThemeProvider } from '../core/tokens/theme-context'
import { MotionProvider } from '../core/motion/motion-context'
import { DensityProvider, type Density } from '../core/tokens/density-context'
import { oklchFallbackStyles } from '../core/styles/fallbacks'
import { injectCSS } from '../core/styles/dom-injector'
import { useAdaptiveTier, type AdaptiveTier } from '../core/adaptive/use-adaptive-tier'
import { AdaptiveProvider } from '../core/adaptive/adaptive-context'
import { adaptiveStyles, ADAPTIVE_CSS_ID } from '../core/adaptive/adaptive-css'
import { AdaptiveDevOverlay } from '../core/adaptive/dev-overlay'

export interface UIProviderProps {
  children: ReactNode
  theme?: ThemeTokens
  mode?: 'dark' | 'light'
  motion?: 0 | 1 | 2 | 3
  density?: Density
  onModeChange?: (mode: 'dark' | 'light') => void
  /**
   * Enable adaptive tier rendering based on network bandwidth.
   * - `true`: auto-detect tier per page (lite/standard/premium)
   * - `false` (default in v2.x): use fixed `motion` prop
   * - `'lite' | 'standard' | 'premium'`: force a specific tier
   *
   * When adaptive is enabled, the `motion` prop is ignored and
   * motion level is set automatically based on detected bandwidth.
   */
  adaptive?: boolean | AdaptiveTier
}

export function UIProvider({
  children,
  theme,
  mode = 'dark',
  motion = 3,
  density = 'default',
  onModeChange,
  adaptive = true,
}: UIProviderProps): ReactElement {
  // Adaptive tier detection — runs per-page, non-blocking
  const adaptiveOverride = typeof adaptive === 'string' ? adaptive : undefined
  const adaptiveResult = useAdaptiveTier(adaptive ? adaptiveOverride : undefined)
  const isAdaptive = adaptive !== false

  // When adaptive is enabled, override motion with detected level
  const effectiveMotion = isAdaptive ? adaptiveResult.motion : motion
  // Inject OKLCH fallbacks for older browsers (no-op if already injected)
  useEffect(() => {
    injectCSS(oklchFallbackStyles.id, oklchFallbackStyles.css)
  }, [])

  // Inject adaptive CSS layer when adaptive mode is active
  useEffect(() => {
    if (isAdaptive) {
      injectCSS(ADAPTIVE_CSS_ID, adaptiveStyles.css)
    }
  }, [isAdaptive])

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
      <MotionProvider level={effectiveMotion}>
        <DensityProvider density={density}>
          <AdaptiveProvider value={{ ...adaptiveResult, isAdaptive }}>
            <div
              data-motion={effectiveMotion}
              data-density={density}
              data-ui-provider
              data-adaptive-tier={isAdaptive ? adaptiveResult.tier : undefined}
            >
              {children}
              {isAdaptive && process.env.NODE_ENV === 'development' && <AdaptiveDevOverlay />}
            </div>
          </AdaptiveProvider>
        </DensityProvider>
      </MotionProvider>
    </ThemeProvider>
  )
}
