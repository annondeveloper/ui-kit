export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error'

const patterns: Record<HapticType, number[]> = {
  light: [5],
  medium: [15],
  heavy: [30],
  selection: [3],
  success: [10, 50, 10],
  error: [20, 40, 20, 40, 20],
}

export function haptic(type: HapticType): boolean {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    return navigator.vibrate(patterns[type])
  }
  return false
}
