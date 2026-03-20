import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFocusMethod } from '../../../core/input/focus'

describe('useFocusMethod', () => {
  it('returns pointer by default', () => {
    const { result } = renderHook(() => useFocusMethod())
    expect(result.current).toBe('pointer')
  })

  it('switches to keyboard on keydown', () => {
    const { result } = renderHook(() => useFocusMethod())

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })
    expect(result.current).toBe('keyboard')
  })

  it('switches back to pointer on pointerdown', () => {
    const { result } = renderHook(() => useFocusMethod())

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })
    expect(result.current).toBe('keyboard')

    act(() => {
      document.dispatchEvent(new PointerEvent('pointerdown'))
    })
    expect(result.current).toBe('pointer')
  })
})
