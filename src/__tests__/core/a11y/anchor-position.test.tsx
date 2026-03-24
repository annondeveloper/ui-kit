import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useAnchorPosition, supportsAnchorPositioning } from '../../../core/a11y/anchor-position'

describe('useAnchorPosition', () => {
  it('returns default position when refs are null', () => {
    const { result } = renderHook(() => {
      const triggerRef = useRef<Element>(null)
      const floatingRef = useRef<Element>(null)
      return useAnchorPosition(triggerRef, floatingRef)
    })

    expect(result.current).toEqual({ x: 0, y: 0, width: 0, placement: 'bottom' })
  })

  it('returns position with configured placement', () => {
    const { result } = renderHook(() => {
      const triggerRef = useRef<Element>(null)
      const floatingRef = useRef<Element>(null)
      return useAnchorPosition(triggerRef, floatingRef, { placement: 'top' })
    })

    expect(result.current.placement).toBe('top')
  })

  it('returns default position when disabled', () => {
    const { result } = renderHook(() => {
      const triggerRef = useRef<Element>(null)
      const floatingRef = useRef<Element>(null)
      return useAnchorPosition(triggerRef, floatingRef, { enabled: false })
    })

    expect(result.current).toEqual({ x: 0, y: 0, width: 0, placement: 'bottom' })
  })
})

describe('supportsAnchorPositioning', () => {
  it('returns a boolean', () => {
    expect(typeof supportsAnchorPositioning()).toBe('boolean')
  })
})
