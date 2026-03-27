import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RingChart } from '../../domain/ring-chart'

expect.extend(toHaveNoViolations)

describe('RingChart', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with role="meter"', () => {
      render(<RingChart value={72} />)
      expect(screen.getByRole('meter')).toBeInTheDocument()
    })

    it('renders SVG element', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('displays value percentage when showValue is true', () => {
      render(<RingChart value={72} showValue />)
      expect(screen.getByText('72%')).toBeInTheDocument()
    })

    it('displays custom label', () => {
      render(<RingChart value={42} label="42 GB" />)
      expect(screen.getByText('42 GB')).toBeInTheDocument()
    })

    it('does not display value by default', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('.ui-ring-chart__center')).not.toBeInTheDocument()
    })

    it('sets correct aria attributes', () => {
      render(<RingChart value={72} max={100} />)
      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '72')
      expect(meter).toHaveAttribute('aria-valuemin', '0')
      expect(meter).toHaveAttribute('aria-valuemax', '100')
    })

    it('clamps value to 0-max range', () => {
      render(<RingChart value={150} max={100} showValue />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('renders all sizes', () => {
      for (const size of ['sm', 'md', 'lg'] as const) {
        const { container, unmount } = render(<RingChart value={50} size={size} />)
        expect(container.querySelector('.ui-ring-chart')).toHaveAttribute('data-size', size)
        unmount()
      }
    })

    it('shows 0% for value 0', () => {
      render(<RingChart value={0} showValue />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('shows 100% for full value', () => {
      render(<RingChart value={100} showValue />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<RingChart value={72} showValue />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "RingChart"', () => {
      expect(RingChart.displayName).toBe('RingChart')
    })
  })
})
