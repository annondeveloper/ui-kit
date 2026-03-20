import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ThresholdGauge } from '../../domain/threshold-gauge'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('ThresholdGauge', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<ThresholdGauge value={50} />)
      expect(container.querySelector('.ui-threshold-gauge')).toBeInTheDocument()
    })

    it('renders SVG arc', () => {
      const { container } = render(<ThresholdGauge value={50} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders arc paths', () => {
      const { container } = render(<ThresholdGauge value={50} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBeGreaterThanOrEqual(1)
    })

    it('renders label when provided', () => {
      render(<ThresholdGauge value={75} label="CPU" />)
      expect(screen.getByText('CPU')).toBeInTheDocument()
    })

    it('renders value display when showValue is true', () => {
      render(<ThresholdGauge value={75} showValue />)
      expect(screen.getByText('75')).toBeInTheDocument()
    })

    it('does not show value by default', () => {
      const { container } = render(<ThresholdGauge value={75} />)
      // Value text should not be in the DOM unless showValue
      const valueEl = container.querySelector('.ui-threshold-gauge__value-text')
      expect(valueEl).not.toBeInTheDocument()
    })
  })

  // ─── Thresholds ─────────────────────────────────────────────────────

  describe('thresholds', () => {
    it('applies ok status for value below warning', () => {
      const { container } = render(
        <ThresholdGauge value={30} thresholds={{ warning: 60, critical: 85 }} />
      )
      expect(container.querySelector('[data-status="ok"]')).toBeInTheDocument()
    })

    it('applies warning status for value at warning threshold', () => {
      const { container } = render(
        <ThresholdGauge value={60} thresholds={{ warning: 60, critical: 85 }} />
      )
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies warning status for value between warning and critical', () => {
      const { container } = render(
        <ThresholdGauge value={70} thresholds={{ warning: 60, critical: 85 }} />
      )
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies critical status at critical threshold', () => {
      const { container } = render(
        <ThresholdGauge value={85} thresholds={{ warning: 60, critical: 85 }} />
      )
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
    })

    it('applies critical status above critical threshold', () => {
      const { container } = render(
        <ThresholdGauge value={95} thresholds={{ warning: 60, critical: 85 }} />
      )
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<ThresholdGauge value={50} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size', () => {
      const { container } = render(<ThresholdGauge value={50} size="md" />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })

    it('renders lg size', () => {
      const { container } = render(<ThresholdGauge value={50} size="lg" />)
      expect(container.querySelector('[data-size="lg"]')).toBeInTheDocument()
    })
  })

  // ─── Edge values ────────────────────────────────────────────────────

  describe('edge values', () => {
    it('handles value of 0', () => {
      const { container } = render(<ThresholdGauge value={0} showValue />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles value of 100', () => {
      render(<ThresholdGauge value={100} showValue />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('clamps negative values to 0', () => {
      render(<ThresholdGauge value={-10} showValue />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('clamps values over 100', () => {
      render(<ThresholdGauge value={150} showValue />)
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<ThresholdGauge value={50} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<ThresholdGauge value={50} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<ThresholdGauge value={50} className="custom" />)
      expect(container.querySelector('.ui-threshold-gauge.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<ThresholdGauge value={50} data-testid="gauge" />)
      expect(screen.getByTestId('gauge')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(ThresholdGauge.displayName).toBe('ThresholdGauge')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ThresholdGauge value={50} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has progressbar role', () => {
      const { container } = render(<ThresholdGauge value={50} />)
      expect(container.querySelector('[role="meter"], [role="progressbar"]')).toBeInTheDocument()
    })

    it('has aria-valuenow', () => {
      const { container } = render(<ThresholdGauge value={75} />)
      const el = container.querySelector('[aria-valuenow="75"]')
      expect(el).toBeInTheDocument()
    })

    it('has aria-valuemin and aria-valuemax', () => {
      const { container } = render(<ThresholdGauge value={50} />)
      const el = container.querySelector('[aria-valuemin="0"][aria-valuemax="100"]')
      expect(el).toBeInTheDocument()
    })

    it('has no violations with all features', async () => {
      const { container } = render(
        <ThresholdGauge
          value={75}
          label="CPU Usage"
          showValue
          thresholds={{ warning: 60, critical: 85 }}
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
