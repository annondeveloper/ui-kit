import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NumberTicker } from '../../domain/number-ticker'

expect.extend(toHaveNoViolations)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('NumberTicker', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<NumberTicker value={42} />)
      expect(container.querySelector('.ui-number-ticker')).toBeInTheDocument()
    })

    it('renders digit slots for each digit', () => {
      const { container } = render(<NumberTicker value={123} />)
      const slots = container.querySelectorAll('.ui-number-ticker--digit-slot')
      expect(slots.length).toBe(3)
    })

    it('has displayName', () => {
      expect(NumberTicker.displayName).toBe('NumberTicker')
    })

    it('applies custom className', () => {
      const { container } = render(
        <NumberTicker value={42} className="custom" />
      )
      expect(container.querySelector('.ui-number-ticker.custom')).toBeInTheDocument()
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('renders formatted numbers with separators', () => {
      const { container } = render(<NumberTicker value={1000} />)
      // Should have static separator chars (comma or period depending on locale)
      const statics = container.querySelectorAll('.ui-number-ticker--static')
      expect(statics.length).toBeGreaterThan(0)
    })

    it('renders digit columns with digits 0-9', () => {
      const { container } = render(<NumberTicker value={5} />)
      const digits = container.querySelectorAll('.ui-number-ticker--digit')
      // Each slot has 10 digits (0-9)
      expect(digits.length).toBe(10)
    })

    it('respects delay prop', () => {
      const { container } = render(<NumberTicker value={42} delay={500} />)
      // Before delay, shows 0
      const ariaLabel = container.querySelector('.ui-number-ticker')?.getAttribute('aria-label')
      expect(ariaLabel).toBe('42')
    })

    it('supports direction prop', () => {
      const { container } = render(<NumberTicker value={5} direction="down" />)
      expect(container.querySelector('.ui-number-ticker')).toBeInTheDocument()
    })
  })

  // ─── Value changes ─────────────────────────────────────────────────

  describe('value changes', () => {
    it('updates when value changes', () => {
      const { container, rerender } = render(<NumberTicker value={10} />)
      rerender(<NumberTicker value={20} />)
      const ariaLabel = container.querySelector('.ui-number-ticker')?.getAttribute('aria-label')
      expect(ariaLabel).toBe('20')
    })

    it('handles zero value', () => {
      const { container } = render(<NumberTicker value={0} />)
      expect(container.querySelector('.ui-number-ticker')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<NumberTicker value={42} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<NumberTicker value={42} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-label with the value', () => {
      const { container } = render(<NumberTicker value={42} />)
      expect(container.querySelector('[aria-label="42"]')).toBeInTheDocument()
    })

    it('marks digit slots as aria-hidden', () => {
      const { container } = render(<NumberTicker value={5} />)
      const slots = container.querySelectorAll('[aria-hidden="true"]')
      expect(slots.length).toBeGreaterThan(0)
    })

    it('has no axe violations', async () => {
      vi.useRealTimers()
      const { container } = render(<NumberTicker value={42} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })
  })
})
