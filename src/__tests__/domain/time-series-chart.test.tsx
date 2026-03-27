import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TimeSeriesChart } from '../../domain/time-series-chart'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const now = Date.now()
const sampleSeries = [
  {
    id: 'cpu',
    label: 'CPU',
    data: [
      { timestamp: now - 4000, value: 20 },
      { timestamp: now - 3000, value: 45 },
      { timestamp: now - 2000, value: 30 },
      { timestamp: now - 1000, value: 60 },
      { timestamp: now, value: 50 },
    ],
  },
  {
    id: 'mem',
    label: 'Memory',
    data: [
      { timestamp: now - 4000, value: 60 },
      { timestamp: now - 3000, value: 65 },
      { timestamp: now - 2000, value: 70 },
      { timestamp: now - 1000, value: 68 },
      { timestamp: now, value: 72 },
    ],
  },
]

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
  // ─── Rendering (ours) ──────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      expect(container.querySelector('.ui-time-series-chart')).toBeInTheDocument()
    })

    it('renders SVG element', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders path for each series', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const lines = container.querySelectorAll('.ui-time-series-chart__series-line')
      expect(lines.length).toBe(2)
    })

    it('renders grid lines by default', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const gridLines = container.querySelectorAll('.ui-time-series-chart__grid-line')
      expect(gridLines.length).toBeGreaterThan(0)
    })

    it('hides grid lines when showGrid is false', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} showGrid={false} />)
      const gridLines = container.querySelectorAll('.ui-time-series-chart__grid-line')
      expect(gridLines.length).toBe(0)
    })

    it('renders legend when multiple series', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      expect(container.querySelector('.ui-time-series-chart__legend')).toBeInTheDocument()
    })

    it('does not render legend for single series', () => {
      const { container } = render(<TimeSeriesChart series={[sampleSeries[0]]} />)
      expect(container.querySelector('.ui-time-series-chart__legend')).not.toBeInTheDocument()
    })

    it('hides legend when showLegend is false', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} showLegend={false} />)
      expect(container.querySelector('.ui-time-series-chart__legend')).not.toBeInTheDocument()
    })
  })

  // ─── Axes ─────────────────────────────────────────────────────────

  describe('axes', () => {
    it('renders Y axis labels by default', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const labels = container.querySelectorAll('text.ui-time-series-chart__axis-label')
      expect(labels.length).toBeGreaterThan(0)
    })

    it('hides Y axis when showYAxis is false', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} showYAxis={false} showXAxis={false} />)
      const labels = container.querySelectorAll('text.ui-time-series-chart__axis-label')
      expect(labels.length).toBe(0)
    })
  })

  // ─── Empty data ───────────────────────────────────────────────────

  describe('empty data', () => {
    it('renders with empty series', () => {
      const { container } = render(<TimeSeriesChart series={[]} />)
      expect(container.querySelector('.ui-time-series-chart')).toBeInTheDocument()
    })

    it('renders with single data point', () => {
      const { container } = render(
        <TimeSeriesChart series={[{ id: 'a', label: 'A', data: [{ timestamp: now, value: 50 }] }]} />
      )
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} className="custom" />)
      expect(container.querySelector('.ui-time-series-chart.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<TimeSeriesChart series={sampleSeries} data-testid="chart" />)
      expect(screen.getByTestId('chart')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(TimeSeriesChart.displayName).toBe('TimeSeriesChart')
    })
  })

  // ─── Accessibility (ours) ──────────────────────────────────────────

  describe('accessibility', () => {
    it('SVG has img role', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      expect(container.querySelector('svg[role="img"]')).toBeInTheDocument()
    })

    it('SVG has aria-label', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-label')).toContain('Time series chart')
    })

    it('has no axe violations', async () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with legend visible', async () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} showLegend />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Rendering (origin/main) ───────────────────────────────────────

  describe('rendering (origin/main)', () => {
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

  // ─── Accessibility (origin/main) ───────────────────────────────────

  describe('accessibility (origin/main)', () => {
    it('has no axe violations', async () => {
      const { container } = render(<TimeSeriesChart series={single} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name (origin/main) ────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "TimeSeriesChart"', () => {
      expect(TimeSeriesChart.displayName).toBe('TimeSeriesChart')
    })
  })
})
