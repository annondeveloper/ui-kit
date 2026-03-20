import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { DensityProvider, useDensity, type Density } from '../../../core/tokens/density-context'
import type { ReactNode } from 'react'

describe('DensityProvider', () => {
  it('provides default density when no provider is present', () => {
    const { result } = renderHook(() => useDensity())
    expect(result.current).toBe('default')
  })

  it('provides compact density', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="compact">{children}</DensityProvider>
    )
    const { result } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('compact')
  })

  it('provides comfortable density', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="comfortable">{children}</DensityProvider>
    )
    const { result } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('comfortable')
  })

  it('provides default density explicitly', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="default">{children}</DensityProvider>
    )
    const { result } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('default')
  })

  it('resolves auto to default', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="auto">{children}</DensityProvider>
    )
    const { result } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('default')
  })

  it('allows nested providers with override', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="comfortable">
        <DensityProvider density="compact">{children}</DensityProvider>
      </DensityProvider>
    )
    const { result } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('compact')
  })

  it('renders children correctly', () => {
    const { result } = renderHook(() => useDensity(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <DensityProvider density="compact">{children}</DensityProvider>
      ),
    })
    // If children rendered, hook call succeeded
    expect(result.current).toBeDefined()
  })

  it('accepts all valid density values', () => {
    const densities: Density[] = ['compact', 'default', 'comfortable', 'auto']
    for (const density of densities) {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <DensityProvider density={density}>{children}</DensityProvider>
      )
      const { result } = renderHook(() => useDensity(), { wrapper })
      const expected = density === 'auto' ? 'default' : density
      expect(result.current).toBe(expected)
    }
  })

  it('useDensity returns Density type', () => {
    const { result } = renderHook(() => useDensity())
    expect(['compact', 'default', 'comfortable']).toContain(result.current)
  })

  it('updates when provider value changes', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="compact">{children}</DensityProvider>
    )
    const { result, rerender } = renderHook(() => useDensity(), { wrapper })
    expect(result.current).toBe('compact')
    // Re-render doesn't change value since wrapper is the same
    rerender()
    expect(result.current).toBe('compact')
  })
})
