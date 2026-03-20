import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RealtimeValue } from '../../domain/realtime-value'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('RealtimeValue', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<RealtimeValue value={42} />)
      expect(container.querySelector('.ui-realtime-value')).toBeInTheDocument()
    })

    it('renders value', () => {
      render(<RealtimeValue value={42} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(RealtimeValue.displayName).toBe('RealtimeValue')
    })

    it('passes className', () => {
      const { container } = render(<RealtimeValue value={42} className="custom" />)
      expect(container.querySelector('.ui-realtime-value.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<RealtimeValue value={42} data-testid="rv" />)
      expect(screen.getByTestId('rv')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      const { container } = render(<RealtimeValue value={42} />)
      expect(container.querySelector('span.ui-realtime-value')).toBeInTheDocument()
    })
  })

  // ─── Format ─────────────────────────────────────────────────────────

  describe('format', () => {
    it('uses default number formatting', () => {
      render(<RealtimeValue value={1234.5} />)
      // Default Intl.NumberFormat
      expect(screen.getByText(/1.*234/)).toBeInTheDocument()
    })

    it('uses custom format function', () => {
      const format = (v: number) => `$${v.toFixed(2)}`
      render(<RealtimeValue value={42.5} format={format} />)
      expect(screen.getByText('$42.50')).toBeInTheDocument()
    })

    it('formats zero correctly', () => {
      render(<RealtimeValue value={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('formats negative numbers', () => {
      render(<RealtimeValue value={-15} />)
      expect(screen.getByText(/15/)).toBeInTheDocument()
    })
  })

  // ─── Delta indicator ────────────────────────────────────────────────

  describe('delta', () => {
    it('shows positive delta', () => {
      const { container } = render(
        <RealtimeValue value={50} previousValue={40} showDelta />
      )
      const delta = container.querySelector('.ui-realtime-value__delta')
      expect(delta).toBeInTheDocument()
      expect(delta?.textContent).toMatch(/\+10/)
      expect(delta?.getAttribute('data-direction')).toBe('positive')
    })

    it('shows negative delta', () => {
      const { container } = render(
        <RealtimeValue value={30} previousValue={40} showDelta />
      )
      const delta = container.querySelector('.ui-realtime-value__delta')
      expect(delta).toBeInTheDocument()
      expect(delta?.textContent).toMatch(/-10/)
      expect(delta?.getAttribute('data-direction')).toBe('negative')
    })

    it('shows zero delta', () => {
      const { container } = render(
        <RealtimeValue value={40} previousValue={40} showDelta />
      )
      const delta = container.querySelector('.ui-realtime-value__delta')
      expect(delta).toBeInTheDocument()
      expect(delta?.getAttribute('data-direction')).toBe('zero')
    })

    it('does not show delta by default', () => {
      const { container } = render(
        <RealtimeValue value={50} previousValue={40} />
      )
      expect(container.querySelector('.ui-realtime-value__delta')).not.toBeInTheDocument()
    })

    it('does not show delta without previousValue', () => {
      const { container } = render(
        <RealtimeValue value={50} showDelta />
      )
      expect(container.querySelector('.ui-realtime-value__delta')).not.toBeInTheDocument()
    })
  })

  // ─── Flash on change ────────────────────────────────────────────────

  describe('flash', () => {
    it('applies flash data attribute on value change (increase)', () => {
      const { container, rerender } = render(<RealtimeValue value={10} />)
      rerender(<RealtimeValue value={20} />)
      const el = container.querySelector('.ui-realtime-value')
      // Should have data-flash attribute after change
      expect(el?.getAttribute('data-flash')).toBe('up')
    })

    it('applies flash data attribute on value change (decrease)', () => {
      const { container, rerender } = render(<RealtimeValue value={20} />)
      rerender(<RealtimeValue value={10} />)
      const el = container.querySelector('.ui-realtime-value')
      expect(el?.getAttribute('data-flash')).toBe('down')
    })

    it('does not flash when flashOnChange is false', () => {
      const { container, rerender } = render(
        <RealtimeValue value={10} flashOnChange={false} />
      )
      rerender(<RealtimeValue value={20} flashOnChange={false} />)
      const el = container.querySelector('.ui-realtime-value')
      expect(el?.getAttribute('data-flash')).toBeNull()
    })

    it('does not flash at motion 0', () => {
      const { container, rerender } = render(
        <RealtimeValue value={10} motion={0} />
      )
      rerender(<RealtimeValue value={20} motion={0} />)
      const el = container.querySelector('.ui-realtime-value')
      expect(el?.getAttribute('data-flash')).toBeNull()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<RealtimeValue value={42} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<RealtimeValue value={42} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      const { container } = render(<RealtimeValue value={42} />)
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(<RealtimeValue value={42} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with delta', async () => {
      const { container } = render(
        <RealtimeValue value={50} previousValue={40} showDelta />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with custom format', async () => {
      const { container } = render(
        <RealtimeValue value={42.5} format={(v) => `$${v.toFixed(2)}`} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
