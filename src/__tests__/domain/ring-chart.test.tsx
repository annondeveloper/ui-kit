import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RingChart } from '../../domain/ring-chart'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('RingChart', () => {
  // ─── Rendering (ours) ──────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('.ui-ring-chart')).toBeInTheDocument()
    })

    it('renders SVG with track and fill circles', () => {
      const { container } = render(<RingChart value={75} />)
      const circles = container.querySelectorAll('circle')
      expect(circles.length).toBe(2)
    })

    it('renders value display when showValue is true', () => {
      render(<RingChart value={75} showValue />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('does not show value by default', () => {
      const { container } = render(<RingChart value={75} />)
      expect(container.querySelector('.ui-ring-chart__center')).not.toBeInTheDocument()
    })

    it('renders custom label', () => {
      render(<RingChart value={75} label="CPU" />)
      expect(screen.getByText('CPU')).toBeInTheDocument()
    })

    it('renders label instead of percentage when both showValue and label are set', () => {
      render(<RingChart value={75} label="OK" showValue />)
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<RingChart value={50} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size (default)', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<RingChart value={50} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Value clamping ───────────────────────────────────────────────

  describe('value clamping', () => {
    it('clamps value to max', () => {
      render(<RingChart value={150} max={100} showValue />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('clamps negative value to 0', () => {
      render(<RingChart value={-10} max={100} showValue />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('handles custom max', () => {
      render(<RingChart value={50} max={200} showValue />)
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<RingChart value={50} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<RingChart value={50} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<RingChart value={50} className="custom" />)
      expect(container.querySelector('.ui-ring-chart.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<RingChart value={50} data-testid="ring" />)
      expect(screen.getByTestId('ring')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(RingChart.displayName).toBe('RingChart')
    })
  })

  // ─── Accessibility (ours) ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has meter role', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('[role="meter"]')).toBeInTheDocument()
    })

    it('has aria-valuenow', () => {
      const { container } = render(<RingChart value={75} />)
      expect(container.querySelector('[aria-valuenow="75"]')).toBeInTheDocument()
    })

    it('has aria-valuemin and aria-valuemax', () => {
      const { container } = render(<RingChart value={50} />)
      expect(container.querySelector('[aria-valuemin="0"]')).toBeInTheDocument()
      expect(container.querySelector('[aria-valuemax="100"]')).toBeInTheDocument()
    })

    it('SVG is aria-hidden', () => {
      const { container } = render(<RingChart value={50} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    })

    it('has no axe violations', async () => {
      const { container } = render(<RingChart value={50} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with all features', async () => {
      const { container } = render(<RingChart value={75} showValue label="CPU" size="lg" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
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

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<RingChart value={72} showValue />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "RingChart"', () => {
      expect(RingChart.displayName).toBe('RingChart')
    })
  })
})
