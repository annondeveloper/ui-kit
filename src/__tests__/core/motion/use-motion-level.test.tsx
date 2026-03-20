import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMotionLevel } from '../../../core/motion/use-motion-level'
import { MotionProvider } from '../../../core/motion/motion-context'
import type { ReactNode } from 'react'

describe('useMotionLevel', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns default level 3', () => {
    const { result } = renderHook(() => useMotionLevel())
    expect(result.current).toBe(3)
  })

  it('returns context level when MotionProvider is used', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MotionProvider level={1}>{children}</MotionProvider>
    )
    const { result } = renderHook(() => useMotionLevel(), { wrapper })
    expect(result.current).toBe(1)
  })

  it('prop override returns prop value', () => {
    const { result } = renderHook(() => useMotionLevel(2))
    expect(result.current).toBe(2)
  })

  it('returns 0 when prefers-reduced-motion is set', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))

    const { result } = renderHook(() => useMotionLevel())
    expect(result.current).toBe(0)

    vi.unstubAllGlobals()
  })
})
