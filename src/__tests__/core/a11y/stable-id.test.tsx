import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStableId } from '../../../core/a11y/stable-id'

describe('useStableId', () => {
  it('returns a string with default prefix', () => {
    const { result } = renderHook(() => useStableId())
    expect(result.current).toMatch(/^ui-/)
  })

  it('uses custom prefix', () => {
    const { result } = renderHook(() => useStableId('dialog'))
    expect(result.current).toMatch(/^dialog-/)
  })

  it('returns stable id across rerenders', () => {
    const { result, rerender } = renderHook(() => useStableId('test'))
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('returns unique ids for different hook instances', () => {
    const { result: r1 } = renderHook(() => useStableId())
    const { result: r2 } = renderHook(() => useStableId())
    expect(r1.current).not.toBe(r2.current)
  })

  it('does not contain colons in the id', () => {
    const { result } = renderHook(() => useStableId())
    expect(result.current).not.toContain(':')
  })
})
