import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLiveRegion } from '../../../core/a11y/live-region'

describe('useLiveRegion', () => {
  afterEach(() => {
    // Clean up any created live regions
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
  })

  it('creates a live region element in the DOM on announce', () => {
    const { result } = renderHook(() => useLiveRegion())

    result.current.announce('Test message')

    const regions = document.querySelectorAll('[aria-live="polite"]')
    expect(regions.length).toBeGreaterThan(0)
  })

  it('uses assertive politeness when configured', () => {
    const { result } = renderHook(() => useLiveRegion({ politeness: 'assertive' }))

    result.current.announce('Urgent message')

    const regions = document.querySelectorAll('[aria-live="assertive"]')
    expect(regions.length).toBeGreaterThan(0)
  })

  it('creates a visually hidden region', () => {
    const { result } = renderHook(() => useLiveRegion())

    result.current.announce('Hidden message')

    const region = document.querySelector('[aria-live="polite"]') as HTMLElement
    expect(region).not.toBeNull()
    expect(region.style.position).toBe('absolute')
    expect(region.style.width).toBe('1px')
    expect(region.style.height).toBe('1px')
  })

  it('sets role=status on the region', () => {
    const { result } = renderHook(() => useLiveRegion())

    result.current.announce('Status message')

    const region = document.querySelector('[aria-live="polite"]')
    expect(region?.getAttribute('role')).toBe('status')
  })

  it('reuses the same region element', () => {
    const { result } = renderHook(() => useLiveRegion())

    result.current.announce('First')
    const count1 = document.querySelectorAll('[aria-live="polite"]').length

    result.current.announce('Second')
    const count2 = document.querySelectorAll('[aria-live="polite"]').length

    expect(count1).toBe(count2)
  })
})
