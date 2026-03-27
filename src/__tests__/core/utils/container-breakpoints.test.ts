import { describe, it, expect } from 'vitest'
import {
  CONTAINER_BREAKPOINTS,
  BREAKPOINT_ORDER,
  getBreakpoint,
} from '../../../core/utils/container-breakpoints'

describe('CONTAINER_BREAKPOINTS', () => {
  it('has five breakpoints in ascending order', () => {
    expect(CONTAINER_BREAKPOINTS.xs).toBe(200)
    expect(CONTAINER_BREAKPOINTS.sm).toBe(320)
    expect(CONTAINER_BREAKPOINTS.md).toBe(480)
    expect(CONTAINER_BREAKPOINTS.lg).toBe(640)
    expect(CONTAINER_BREAKPOINTS.xl).toBe(960)
  })
})

describe('BREAKPOINT_ORDER', () => {
  it('lists breakpoints smallest to largest', () => {
    expect(BREAKPOINT_ORDER).toEqual(['xs', 'sm', 'md', 'lg', 'xl'])
  })
})

describe('getBreakpoint', () => {
  it('returns xs for widths below 320', () => {
    expect(getBreakpoint(0)).toBe('xs')
    expect(getBreakpoint(100)).toBe('xs')
    expect(getBreakpoint(319)).toBe('xs')
  })

  it('returns sm for widths 320–479', () => {
    expect(getBreakpoint(320)).toBe('sm')
    expect(getBreakpoint(400)).toBe('sm')
    expect(getBreakpoint(479)).toBe('sm')
  })

  it('returns md for widths 480–639', () => {
    expect(getBreakpoint(480)).toBe('md')
    expect(getBreakpoint(639)).toBe('md')
  })

  it('returns lg for widths 640–959', () => {
    expect(getBreakpoint(640)).toBe('lg')
    expect(getBreakpoint(959)).toBe('lg')
  })

  it('returns xl for widths >= 960', () => {
    expect(getBreakpoint(960)).toBe('xl')
    expect(getBreakpoint(1920)).toBe('xl')
  })
})
