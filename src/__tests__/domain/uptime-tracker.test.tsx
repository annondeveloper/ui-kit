import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { UptimeTracker } from '../../domain/uptime-tracker'
import type { UptimeDay } from '../../domain/uptime-tracker'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

function makeDays(count: number, status: UptimeDay['status'] = 'up'): UptimeDay[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(2026, 2, 20)
    d.setDate(d.getDate() - (count - 1 - i))
    return {
      date: d.toISOString().split('T')[0],
      status,
      uptime: status === 'up' ? 1 : status === 'degraded' ? 0.95 : status === 'down' ? 0 : undefined,
    }
  })
}

describe('UptimeTracker', () => {
  const days = makeDays(90)

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<UptimeTracker days={days} />)
      expect(container.querySelector('.ui-uptime-tracker')).toBeInTheDocument()
    })

    it('renders day bars', () => {
      const { container } = render(<UptimeTracker days={days} />)
      const bars = container.querySelectorAll('.ui-uptime-tracker__day')
      expect(bars.length).toBe(90)
    })

    it('renders empty days', () => {
      const { container } = render(<UptimeTracker days={[]} />)
      expect(container.querySelector('.ui-uptime-tracker')).toBeInTheDocument()
    })

    it('renders fewer than 90 days', () => {
      const { container } = render(<UptimeTracker days={makeDays(30)} />)
      const bars = container.querySelectorAll('.ui-uptime-tracker__day')
      expect(bars.length).toBe(30)
    })
  })

  describe('status colors', () => {
    it('applies status data attributes', () => {
      const mixed: UptimeDay[] = [
        { date: '2026-03-18', status: 'up', uptime: 1 },
        { date: '2026-03-19', status: 'degraded', uptime: 0.95 },
        { date: '2026-03-20', status: 'down', uptime: 0 },
        { date: '2026-03-21', status: 'unknown' },
      ]
      const { container } = render(<UptimeTracker days={mixed} />)
      expect(container.querySelector('[data-day-status="up"]')).toBeInTheDocument()
      expect(container.querySelector('[data-day-status="degraded"]')).toBeInTheDocument()
      expect(container.querySelector('[data-day-status="down"]')).toBeInTheDocument()
      expect(container.querySelector('[data-day-status="unknown"]')).toBeInTheDocument()
    })
  })

  describe('SLA', () => {
    it('shows SLA when enabled', () => {
      render(<UptimeTracker days={days} showSla slaTarget={0.999} />)
      expect(screen.getByText(/99\.9%/)).toBeInTheDocument()
    })

    it('calculates current uptime', () => {
      render(<UptimeTracker days={days} showSla />)
      // All days are 'up' (uptime=1), so should show 100%
      expect(screen.getByText(/100/)).toBeInTheDocument()
    })

    it('hides SLA by default', () => {
      const { container } = render(<UptimeTracker days={days} />)
      expect(container.querySelector('.ui-uptime-tracker__sla')).not.toBeInTheDocument()
    })
  })

  describe('tooltip', () => {
    it('shows tooltip on day hover', () => {
      const { container } = render(<UptimeTracker days={days} />)
      const day = container.querySelector('.ui-uptime-tracker__day')!
      fireEvent.mouseEnter(day)
      expect(container.querySelector('.ui-uptime-tracker__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<UptimeTracker days={days} />)
      const day = container.querySelector('.ui-uptime-tracker__day')!
      fireEvent.mouseEnter(day)
      fireEvent.mouseLeave(day)
      expect(container.querySelector('.ui-uptime-tracker__tooltip')).not.toBeInTheDocument()
    })
  })

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<UptimeTracker days={days} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<UptimeTracker days={days} className="custom" />)
      expect(container.querySelector('.ui-uptime-tracker.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<UptimeTracker days={days} data-testid="uptime" />)
      expect(screen.getByTestId('uptime')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(UptimeTracker.displayName).toBe('UptimeTracker')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<UptimeTracker days={days} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with SLA', async () => {
      const { container } = render(<UptimeTracker days={days} showSla slaTarget={0.999} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has group role', () => {
      const { container } = render(<UptimeTracker days={days} />)
      expect(container.querySelector('[role="group"]')).toBeInTheDocument()
    })
  })
})
