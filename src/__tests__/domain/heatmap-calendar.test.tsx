import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { HeatmapCalendar } from '../../domain/heatmap-calendar'
import type { HeatmapData } from '../../domain/heatmap-calendar'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

function makeData(days: number): HeatmapData[] {
  const data: HeatmapData[] = []
  const start = new Date(2026, 0, 1) // Jan 1, 2026
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10),
    })
  }
  return data
}

describe('HeatmapCalendar', () => {
  const data = makeData(90)

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      expect(container.querySelector('.ui-heatmap-calendar')).toBeInTheDocument()
    })

    it('renders day cells', () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      const cells = container.querySelectorAll('.ui-heatmap-calendar__cell')
      expect(cells.length).toBeGreaterThan(0)
    })

    it('renders with empty data', () => {
      const { container } = render(<HeatmapCalendar data={[]} />)
      expect(container.querySelector('.ui-heatmap-calendar')).toBeInTheDocument()
    })

    it('renders month labels', () => {
      const yearData = makeData(365)
      const { container } = render(<HeatmapCalendar data={yearData} />)
      const months = container.querySelectorAll('.ui-heatmap-calendar__month-label')
      expect(months.length).toBeGreaterThan(0)
    })

    it('renders day-of-week labels', () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      const dayLabels = container.querySelectorAll('.ui-heatmap-calendar__day-label')
      expect(dayLabels.length).toBeGreaterThan(0)
    })
  })

  describe('date range', () => {
    it('uses custom startDate', () => {
      const { container } = render(
        <HeatmapCalendar data={data} startDate="2026-01-01" />
      )
      expect(container.querySelector('.ui-heatmap-calendar')).toBeInTheDocument()
    })

    it('uses custom endDate', () => {
      const { container } = render(
        <HeatmapCalendar data={data} endDate="2026-03-31" />
      )
      expect(container.querySelector('.ui-heatmap-calendar')).toBeInTheDocument()
    })
  })

  describe('color scale', () => {
    it('applies custom color scale', () => {
      const { container } = render(
        <HeatmapCalendar data={data} colorScale={['oklch(30% 0.05 270)', 'oklch(80% 0.2 270)']} />
      )
      const cells = container.querySelectorAll('.ui-heatmap-calendar__cell')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  describe('tooltip', () => {
    it('shows tooltip on hover when enabled', () => {
      const { container } = render(<HeatmapCalendar data={data} showTooltip />)
      const cell = container.querySelector('.ui-heatmap-calendar__cell:not(.ui-heatmap-calendar__cell--empty)')!
      fireEvent.mouseEnter(cell)
      expect(container.querySelector('.ui-heatmap-calendar__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<HeatmapCalendar data={data} showTooltip />)
      const cell = container.querySelector('.ui-heatmap-calendar__cell:not(.ui-heatmap-calendar__cell--empty)')!
      fireEvent.mouseEnter(cell)
      fireEvent.mouseLeave(cell)
      expect(container.querySelector('.ui-heatmap-calendar__tooltip')).not.toBeInTheDocument()
    })

    it('does not show tooltip by default', () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      const cell = container.querySelector('.ui-heatmap-calendar__cell:not(.ui-heatmap-calendar__cell--empty)')!
      fireEvent.mouseEnter(cell)
      expect(container.querySelector('.ui-heatmap-calendar__tooltip')).not.toBeInTheDocument()
    })
  })

  describe('click handler', () => {
    it('calls onDateClick with date string', () => {
      const onClick = vi.fn()
      const { container } = render(<HeatmapCalendar data={data} onDateClick={onClick} />)
      const cell = container.querySelector('.ui-heatmap-calendar__cell:not(.ui-heatmap-calendar__cell--empty)')!
      fireEvent.click(cell)
      expect(onClick).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
    })
  })

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<HeatmapCalendar data={data} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<HeatmapCalendar data={data} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<HeatmapCalendar data={data} className="custom" />)
      expect(container.querySelector('.ui-heatmap-calendar.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<HeatmapCalendar data={data} data-testid="heatmap" />)
      expect(screen.getByTestId('heatmap')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(HeatmapCalendar.displayName).toBe('HeatmapCalendar')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with tooltip enabled', async () => {
      const { container } = render(<HeatmapCalendar data={data} showTooltip />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with click handler', async () => {
      const { container } = render(<HeatmapCalendar data={data} onDateClick={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has group role', () => {
      const { container } = render(<HeatmapCalendar data={data} />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })
  })
})
