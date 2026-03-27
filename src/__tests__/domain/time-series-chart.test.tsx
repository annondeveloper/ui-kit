import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TimeSeriesChart } from '../../domain/time-series-chart'

expect.extend(toHaveNoViolations)

const now = Date.now()
const makeSeries = (id: string, label: string, base: number) => ({
  id,
  label,
  data: Array.from({ length: 10 }, (_, i) => ({
    timestamp: now - (9 - i) * 60_000,
    value: base + i * 3,
  })),
})

const single = [makeSeries('cpu', 'CPU %', 40)]
const multi = [
  makeSeries('cpu', 'CPU %', 40),
  makeSeries('mem', 'Memory %', 60),
]

describe('TimeSeriesChart', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders SVG with role="img"', () => {
      render(<TimeSeriesChart series={single} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders series path elements', () => {
      const { container } = render(<TimeSeriesChart series={single} />)
      const paths = container.querySelectorAll('.ui-time-series-chart__series-line')
      expect(paths).toHaveLength(1)
    })

    it('renders multiple series paths', () => {
      const { container } = render(<TimeSeriesChart series={multi} />)
      const paths = container.querySelectorAll('.ui-time-series-chart__series-line')
      expect(paths).toHaveLength(2)
    })

    it('renders grid lines when showGrid is true', () => {
      const { container } = render(<TimeSeriesChart series={single} showGrid />)
      const gridLines = container.querySelectorAll('.ui-time-series-chart__grid-line')
      expect(gridLines.length).toBeGreaterThan(0)
    })

    it('renders Y axis labels when showYAxis is true', () => {
      const { container } = render(<TimeSeriesChart series={single} showYAxis />)
      const labels = container.querySelectorAll('.ui-time-series-chart__axis-label')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('renders legend for multi-series', () => {
      const { container } = render(<TimeSeriesChart series={multi} showLegend />)
      const legend = container.querySelector('.ui-time-series-chart__legend')
      expect(legend).toBeInTheDocument()
      expect(screen.getByText('CPU %')).toBeInTheDocument()
      expect(screen.getByText('Memory %')).toBeInTheDocument()
    })

    it('does not render legend for single series', () => {
      const { container } = render(<TimeSeriesChart series={single} showLegend />)
      const legend = container.querySelector('.ui-time-series-chart__legend')
      expect(legend).not.toBeInTheDocument()
    })

    it('renders hit area rect for tooltip interaction', () => {
      const { container } = render(<TimeSeriesChart series={single} />)
      const hitArea = container.querySelector('.ui-time-series-chart__hit-area')
      expect(hitArea).toBeInTheDocument()
    })

    it('respects custom height', () => {
      const { container } = render(<TimeSeriesChart series={single} height={300} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('height', '300')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<TimeSeriesChart series={single} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "TimeSeriesChart"', () => {
      expect(TimeSeriesChart.displayName).toBe('TimeSeriesChart')
    })
  })
})
