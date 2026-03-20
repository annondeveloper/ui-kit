import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollReveal, supportsScrollDrivenAnimations } from '../../../core/motion/scroll'
import { useRef } from 'react'

describe('useScrollReveal', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null)
      return useScrollReveal(ref)
    })
    expect(result.current).toBe(false)
  })
})

describe('supportsScrollDrivenAnimations', () => {
  it('returns a boolean', () => {
    const result = supportsScrollDrivenAnimations()
    expect(typeof result).toBe('boolean')
  })
})
