import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TimeSeriesChart, type ChartAnnotation } from '../../domain/time-series-chart'

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

  // ─── Brush selection ──────────────────────────────────────────────

  describe('brush selection', () => {
    it('renders brush overlay on drag', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} brushable />)
      const hitArea = container.querySelector('.ui-time-series-chart__hit-area')!
      fireEvent.mouseDown(hitArea, { clientX: 100, clientY: 50 })
      fireEvent.mouseMove(hitArea, { clientX: 200, clientY: 50 })
      const brush = container.querySelector('.ui-time-series-chart__brush')
      expect(brush).toBeInTheDocument()
    })

    it('calls onBrush with range', () => {
      const onBrush = vi.fn()
      const { container } = render(<TimeSeriesChart series={sampleSeries} brushable onBrush={onBrush} />)
      const hitArea = container.querySelector('.ui-time-series-chart__hit-area')!
      fireEvent.mouseDown(hitArea, { clientX: 100, clientY: 50 })
      fireEvent.mouseMove(hitArea, { clientX: 200, clientY: 50 })
      fireEvent.mouseUp(hitArea)
      expect(onBrush).toHaveBeenCalled()
      const range = onBrush.mock.calls[0][0]
      expect(range).toHaveLength(2)
      expect(range[0]).toBeLessThan(range[1])
    })

    it('does not brush when brushable is false', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const hitArea = container.querySelector('.ui-time-series-chart__hit-area')!
      fireEvent.mouseDown(hitArea, { clientX: 100, clientY: 50 })
      fireEvent.mouseMove(hitArea, { clientX: 200, clientY: 50 })
      const brush = container.querySelector('.ui-time-series-chart__brush')
      expect(brush).not.toBeInTheDocument()
    })
  })

  // ─── Zoom ─────────────────────────────────────────────────────────

  describe('zoom', () => {
    it('zooms on wheel event when zoomable', () => {
      const onZoom = vi.fn()
      const { container } = render(<TimeSeriesChart series={sampleSeries} zoomable onZoom={onZoom} />)
      const svg = container.querySelector('svg')!
      fireEvent.wheel(svg, { deltaY: -100, clientX: 200, clientY: 100 })
      expect(onZoom).toHaveBeenCalled()
    })

    it('shows reset button when zoomed', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} zoomable />)
      const svg = container.querySelector('svg')!
      fireEvent.wheel(svg, { deltaY: -100, clientX: 200, clientY: 100 })
      const resetBtn = container.querySelector('.ui-time-series-chart__zoom-reset')
      expect(resetBtn).toBeInTheDocument()
      expect(resetBtn!.textContent).toBe('Reset zoom')
    })

    it('does not zoom when zoomable is false', () => {
      const onZoom = vi.fn()
      const { container } = render(<TimeSeriesChart series={sampleSeries} onZoom={onZoom} />)
      const svg = container.querySelector('svg')!
      fireEvent.wheel(svg, { deltaY: -100, clientX: 200, clientY: 100 })
      expect(onZoom).not.toHaveBeenCalled()
    })
  })

  // ─── Toggleable series ────────────────────────────────────────────

  describe('toggleable series', () => {
    it('renders checkboxes in legend when toggleableSeries is true', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} toggleableSeries />)
      const checkboxes = container.querySelectorAll('.ui-time-series-chart__legend-checkbox')
      expect(checkboxes.length).toBe(2) // sampleSeries has 2 series
    })

    it('hides series on checkbox click', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} toggleableSeries />)
      const checkboxes = container.querySelectorAll('.ui-time-series-chart__legend-checkbox')
      const linesBefore = container.querySelectorAll('.ui-time-series-chart__series-line')
      expect(linesBefore.length).toBe(2)
      fireEvent.click(checkboxes[0])
      const linesAfter = container.querySelectorAll('.ui-time-series-chart__series-line')
      expect(linesAfter.length).toBe(1)
    })

    it('does not render checkboxes when toggleableSeries is false', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} />)
      const checkboxes = container.querySelectorAll('.ui-time-series-chart__legend-checkbox')
      expect(checkboxes.length).toBe(0)
    })
  })

  // ─── Annotations ──────────────────────────────────────────────────

  describe('annotations', () => {
    const horizontalAnnotation: ChartAnnotation = {
      type: 'horizontal',
      value: 50,
      label: 'Threshold',
      color: 'oklch(70% 0.2 30)',
    }

    const verticalAnnotation: ChartAnnotation = {
      type: 'vertical',
      value: now - 2000,
      label: 'Deploy',
      color: 'oklch(65% 0.15 270)',
    }

    it('renders horizontal annotation line', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} annotations={[horizontalAnnotation]} />)
      const annotations = container.querySelectorAll('.ui-time-series-chart__annotation')
      expect(annotations.length).toBe(1)
      const line = annotations[0].querySelector('line')
      expect(line).toBeInTheDocument()
    })

    it('renders vertical annotation line', () => {
      const { container } = render(<TimeSeriesChart series={sampleSeries} annotations={[verticalAnnotation]} />)
      const annotations = container.querySelectorAll('.ui-time-series-chart__annotation')
      expect(annotations.length).toBe(1)
    })

    it('renders annotation labels', () => {
      const { container } = render(
        <TimeSeriesChart series={sampleSeries} annotations={[horizontalAnnotation, verticalAnnotation]} />
      )
      const labels = container.querySelectorAll('.ui-time-series-chart__annotation-label')
      expect(labels.length).toBe(2)
      expect(labels[0].textContent).toBe('Threshold')
      expect(labels[1].textContent).toBe('Deploy')
    })

    it('applies dashed style', () => {
      const { container } = render(
        <TimeSeriesChart series={sampleSeries} annotations={[{ ...horizontalAnnotation, dashed: true }]} />
      )
      const line = container.querySelector('.ui-time-series-chart__annotation line')
      expect(line?.getAttribute('stroke-dasharray')).toBe('6 4')
    })

    it('applies solid style when dashed is false', () => {
      const { container } = render(
        <TimeSeriesChart series={sampleSeries} annotations={[{ ...horizontalAnnotation, dashed: false }]} />
      )
      const line = container.querySelector('.ui-time-series-chart__annotation line')
      expect(line?.getAttribute('stroke-dasharray')).toBeNull()
    })
  })
})
