export interface ThemeTokens {
  brand: string
  brandLight: string
  brandDark: string
  brandSubtle: string
  brandGlow: string
  bgBase: string
  bgSurface: string
  bgElevated: string
  bgOverlay: string
  borderSubtle: string
  borderDefault: string
  borderStrong: string
  borderGlow: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textDisabled: string
  statusOk: string
  statusWarning: string
  statusCritical: string
  statusInfo: string
  aurora1: string
  aurora2: string
}

export const TOKEN_KEYS: (keyof ThemeTokens)[] = [
  'brand', 'brandLight', 'brandDark', 'brandSubtle', 'brandGlow',
  'bgBase', 'bgSurface', 'bgElevated', 'bgOverlay',
  'borderSubtle', 'borderDefault', 'borderStrong', 'borderGlow',
  'textPrimary', 'textSecondary', 'textTertiary', 'textDisabled',
  'statusOk', 'statusWarning', 'statusCritical', 'statusInfo',
  'aurora1', 'aurora2',
]

// Maps camelCase token keys to CSS custom property names
export const TOKEN_TO_CSS: Record<keyof ThemeTokens, string> = {
  brand: '--brand',
  brandLight: '--brand-light',
  brandDark: '--brand-dark',
  brandSubtle: '--brand-subtle',
  brandGlow: '--brand-glow',
  bgBase: '--bg-base',
  bgSurface: '--bg-surface',
  bgElevated: '--bg-elevated',
  bgOverlay: '--bg-overlay',
  borderSubtle: '--border-subtle',
  borderDefault: '--border-default',
  borderStrong: '--border-strong',
  borderGlow: '--border-glow',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textTertiary: '--text-tertiary',
  textDisabled: '--text-disabled',
  statusOk: '--status-ok',
  statusWarning: '--status-warning',
  statusCritical: '--status-critical',
  statusInfo: '--status-info',
  aurora1: '--aurora-1',
  aurora2: '--aurora-2',
}
