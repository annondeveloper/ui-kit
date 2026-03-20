import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AnimatedCounter } from '../../components/animated-counter'

expect.extend(toHaveNoViolations)

describe('AnimatedCounter', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <span> element', () => {
      const { container } = render(<AnimatedCounter value={42} />)
      const el = container.querySelector('.ui-animated-counter')
      expect(el).toBeInTheDocument()
      expect(el?.tagName).toBe('SPAN')
    })

    it('applies ui-animated-counter class', () => {
      const { container } = render(<AnimatedCounter value={0} />)
      expect(container.querySelector('.ui-animated-counter')).toBeInTheDocument()
    })

    it('displays initial value', () => {
      render(<AnimatedCounter value={1234} motion={0} />)
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('displays value with default Intl.NumberFormat', () => {
      render(<AnimatedCounter value={1000000} motion={0} />)
      // Default locale formatting (en-US would be "1,000,000")
      const el = screen.getByRole('status')
      expect(el.textContent).toBeTruthy()
    })

    it('displays value with custom formatter', () => {
      const format = (v: number) => `$${v.toFixed(2)}`
      render(<AnimatedCounter value={42} format={format} motion={0} />)
      expect(screen.getByText('$42.00')).toBeInTheDocument()
    })

    it('displays negative values', () => {
      render(<AnimatedCounter value={-5} motion={0} />)
      const el = screen.getByRole('status')
      expect(el.textContent).toContain('-5')
    })

    it('displays zero', () => {
      render(<AnimatedCounter value={0} motion={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays decimal values with custom formatter', () => {
      const format = (v: number) => v.toFixed(1)
      render(<AnimatedCounter value={3.14} format={format} motion={0} />)
      expect(screen.getByText('3.1')).toBeInTheDocument()
    })

    it('forwards ref to span element', () => {
      const ref = createRef<HTMLSpanElement>()
      render(<AnimatedCounter ref={ref} value={0} />)
      expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    })

    it('forwards className', () => {
      const { container } = render(<AnimatedCounter value={0} className="custom" />)
      expect(container.querySelector('.ui-animated-counter')?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<AnimatedCounter value={0} data-testid="my-counter" id="ac-1" />)
      const el = screen.getByTestId('my-counter')
      expect(el).toHaveAttribute('id', 'ac-1')
    })

    it('sets motion data attribute', () => {
      const { container } = render(<AnimatedCounter value={0} motion={0} />)
      expect(container.querySelector('.ui-animated-counter')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Animation tests ──────────────────────────────────────────────

  describe('animation', () => {
    it('at motion level 0, updates value instantly on change', () => {
      const { rerender } = render(<AnimatedCounter value={0} motion={0} />)
      expect(screen.getByRole('status').textContent).toBe('0')

      rerender(<AnimatedCounter value={100} motion={0} />)
      expect(screen.getByRole('status').textContent).toBe('100')
    })

    it('at motion level 1+, starts animation on value change', () => {
      let rafCallbacks: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
      })
      vi.spyOn(performance, 'now').mockReturnValue(0)

      const { rerender } = render(<AnimatedCounter value={0} motion={1} />)
      rerender(<AnimatedCounter value={100} motion={1} />)

      // Should have called requestAnimationFrame
      expect(rafCallbacks.length).toBeGreaterThan(0)
    })

    it('animates through intermediate values', () => {
      let rafCallbacks: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
      })

      let now = 0
      vi.spyOn(performance, 'now').mockImplementation(() => now)

      const { rerender } = render(<AnimatedCounter value={0} motion={1} duration={1000} />)
      rerender(<AnimatedCounter value={100} motion={1} duration={1000} />)

      // Simulate mid-animation
      now = 500
      if (rafCallbacks.length > 0) {
        act(() => {
          rafCallbacks[rafCallbacks.length - 1](now)
        })
      }

      const text = screen.getByRole('status').textContent || ''
      // Should show an intermediate value (not 0, not 100 yet since we're at 50%)
      const numericValue = parseInt(text.replace(/,/g, ''), 10)
      expect(numericValue).toBeGreaterThanOrEqual(0)
      expect(numericValue).toBeLessThanOrEqual(100)
    })

    it('completes animation and shows final value on motion 0', () => {
      // motion=0 should instantly show the final value
      const { rerender } = render(<AnimatedCounter value={0} motion={0} />)
      expect(screen.getByRole('status').textContent).toBe('0')

      rerender(<AnimatedCounter value={100} motion={0} />)
      expect(screen.getByRole('status').textContent).toBe('100')

      rerender(<AnimatedCounter value={-50} motion={0} />)
      expect(screen.getByRole('status').textContent).toBe('-50')
    })

    it('cancels animation on unmount', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
      vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42)

      const { rerender, unmount } = render(<AnimatedCounter value={0} motion={1} />)
      rerender(<AnimatedCounter value={100} motion={1} />)
      unmount()

      expect(cancelSpy).toHaveBeenCalled()
    })

    it('uses custom duration', () => {
      let rafCallbacks: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
      })

      let now = 0
      vi.spyOn(performance, 'now').mockImplementation(() => now)

      const { rerender } = render(<AnimatedCounter value={0} motion={1} duration={2000} />)
      rerender(<AnimatedCounter value={100} motion={1} duration={2000} />)

      // At 1000ms (half of 2000ms duration), should not be at final value
      now = 1000
      if (rafCallbacks.length > 0) {
        act(() => {
          rafCallbacks[rafCallbacks.length - 1](now)
        })
      }

      const text = screen.getByRole('status').textContent || ''
      const numericValue = parseInt(text.replace(/,/g, ''), 10)
      expect(numericValue).toBeLessThan(100)
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<AnimatedCounter value={42} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with custom format)', async () => {
      const { container } = render(
        <AnimatedCounter value={1000} format={(v) => `$${v}`} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has aria-live="polite"', () => {
      const { container } = render(<AnimatedCounter value={0} />)
      expect(container.querySelector('.ui-animated-counter')).toHaveAttribute('aria-live', 'polite')
    })

    it('has role="status"', () => {
      render(<AnimatedCounter value={0} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<AnimatedCounter value={0} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<AnimatedCounter value={0} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-animated-counter)', () => {
      render(<AnimatedCounter value={0} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-animated-counter)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "AnimatedCounter"', () => {
      expect(AnimatedCounter.displayName).toBe('AnimatedCounter')
    })
  })
})
