import { describe, it, expect, vi } from 'vitest'
import { haptic } from '../../../core/input/haptics'

describe('haptic', () => {
  it('calls navigator.vibrate with correct pattern for light', () => {
    const vibrateMock = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, configurable: true })

    haptic('light')
    expect(vibrateMock).toHaveBeenCalledWith([5])

    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
  })

  it('calls navigator.vibrate with correct pattern for error', () => {
    const vibrateMock = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, configurable: true })

    haptic('error')
    expect(vibrateMock).toHaveBeenCalledWith([20, 40, 20, 40, 20])

    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
  })

  it('calls navigator.vibrate with correct pattern for success', () => {
    const vibrateMock = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, configurable: true })

    haptic('success')
    expect(vibrateMock).toHaveBeenCalledWith([10, 50, 10])

    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
  })

  it('does not throw when navigator.vibrate is unavailable', () => {
    Object.defineProperty(navigator, 'vibrate', { value: undefined, configurable: true })
    expect(() => haptic('medium')).not.toThrow()
  })
})
