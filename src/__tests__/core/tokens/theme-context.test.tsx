import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../../core/tokens/theme-context'
import { generateTheme } from '../../../core/tokens/generator'
import type { ReactNode } from 'react'

describe('useTheme', () => {
  it('returns default values without provider', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.tokens).toBeNull()
    expect(result.current.mode).toBe('dark')
    expect(typeof result.current.setMode).toBe('function')
  })

  it('returns provided tokens and mode from ThemeProvider', () => {
    const theme = generateTheme('#6366f1', 'light')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider tokens={theme} mode="light">
        {children}
      </ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.tokens).toBe(theme)
    expect(result.current.mode).toBe('light')
  })

  it('calls onModeChange when setMode is invoked', () => {
    const onModeChange = vi.fn()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider mode="dark" onModeChange={onModeChange}>
        {children}
      </ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    result.current.setMode('light')
    expect(onModeChange).toHaveBeenCalledWith('light')
  })
})
