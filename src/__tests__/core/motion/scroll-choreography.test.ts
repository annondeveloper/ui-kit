import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollChoreography } from '../../../core/motion/scroll-choreography'
import { createRef } from 'react'

// Mock motion level
vi.mock('../../../core/motion/use-motion-level', () => ({
  useMotionLevel: vi.fn(() => 3),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useScrollChoreography', () => {
  it('accepts a config object without error', () => {
    const ref = createRef<HTMLDivElement>()
    expect(() => {
      renderHook(() =>
        useScrollChoreography({
          trigger: ref,
          sequence: [{ target: '.item', animation: 'fadeIn' as const }],
        }),
      )
    }).not.toThrow()
  })

  it('accepts a preset config', () => {
    const ref = createRef<HTMLDivElement>()
    expect(() => {
      renderHook(() =>
        useScrollChoreography({
          trigger: ref,
          preset: 'cascade' as const,
          sequence: [{ target: '.item', animation: 'slideUp' as const }],
        }),
      )
    }).not.toThrow()
  })

  it('handles null trigger ref gracefully', () => {
    const ref = createRef<HTMLDivElement>()
    expect(() => {
      renderHook(() =>
        useScrollChoreography({
          trigger: ref,
          sequence: [],
        }),
      )
    }).not.toThrow()
  })
})
