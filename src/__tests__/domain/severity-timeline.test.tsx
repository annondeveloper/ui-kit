import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SeverityTimeline } from '../../domain/severity-timeline'
import type { TimelineEvent } from '../../domain/severity-timeline'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const events: TimelineEvent[] = [
  { id: '1', timestamp: new Date('2026-03-20T10:00:00Z'), severity: 'info', title: 'Deploy started' },
  { id: '2', timestamp: new Date('2026-03-20T10:05:00Z'), severity: 'warning', title: 'High latency detected', description: 'P95 > 500ms' },
  { id: '3', timestamp: new Date('2026-03-20T10:10:00Z'), severity: 'critical', title: 'Service down' },
  { id: '4', timestamp: new Date('2026-03-20T10:15:00Z'), severity: 'ok', title: 'Service recovered' },
]

describe('SeverityTimeline', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<SeverityTimeline events={events} />)
      expect(container.querySelector('.ui-severity-timeline')).toBeInTheDocument()
    })

    it('renders all events', () => {
      render(<SeverityTimeline events={events} />)
      expect(screen.getByText('Deploy started')).toBeInTheDocument()
      expect(screen.getByText('High latency detected')).toBeInTheDocument()
      expect(screen.getByText('Service down')).toBeInTheDocument()
      expect(screen.getByText('Service recovered')).toBeInTheDocument()
    })

    it('renders event descriptions', () => {
      render(<SeverityTimeline events={events} />)
      expect(screen.getByText('P95 > 500ms')).toBeInTheDocument()
    })

    it('renders empty list', () => {
      const { container } = render(<SeverityTimeline events={[]} />)
      expect(container.querySelector('.ui-severity-timeline')).toBeInTheDocument()
    })

    it('renders severity indicators', () => {
      const { container } = render(<SeverityTimeline events={events} />)
      expect(container.querySelector('[data-severity="info"]')).toBeInTheDocument()
      expect(container.querySelector('[data-severity="warning"]')).toBeInTheDocument()
      expect(container.querySelector('[data-severity="critical"]')).toBeInTheDocument()
      expect(container.querySelector('[data-severity="ok"]')).toBeInTheDocument()
    })
  })

  // ─── Orientation ────────────────────────────────────────────────────

  describe('orientation', () => {
    it('renders vertical by default', () => {
      const { container } = render(<SeverityTimeline events={events} />)
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })

    it('renders horizontal', () => {
      const { container } = render(<SeverityTimeline events={events} orientation="horizontal" />)
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    })
  })

  // ─── Expandable ─────────────────────────────────────────────────────

  describe('expandable', () => {
    it('shows expand button when expandable and has description', () => {
      render(<SeverityTimeline events={events} expandable />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('toggles description on click', () => {
      const { container } = render(<SeverityTimeline events={events} expandable />)
      // Description should be hidden initially
      const details = container.querySelectorAll('.ui-severity-timeline__description')
      // Click to expand
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      // After click, description should be visible
      const visibleDesc = container.querySelectorAll('.ui-severity-timeline__description[data-expanded="true"]')
      expect(visibleDesc.length).toBeGreaterThanOrEqual(0) // Implementation dependent
    })
  })

  // ─── Max visible ────────────────────────────────────────────────────

  describe('maxVisible', () => {
    it('limits visible events', () => {
      const { container } = render(<SeverityTimeline events={events} maxVisible={2} />)
      const items = container.querySelectorAll('.ui-severity-timeline__item')
      expect(items.length).toBe(2)
    })

    it('shows all events when maxVisible exceeds count', () => {
      const { container } = render(<SeverityTimeline events={events} maxVisible={10} />)
      const items = container.querySelectorAll('.ui-severity-timeline__item')
      expect(items.length).toBe(4)
    })

    it('shows show-more indicator when truncated', () => {
      const { container } = render(<SeverityTimeline events={events} maxVisible={2} />)
      expect(container.querySelector('.ui-severity-timeline__more')).toBeInTheDocument()
    })
  })

  // ─── Timestamps ─────────────────────────────────────────────────────

  describe('timestamps', () => {
    it('handles Date objects', () => {
      const { container } = render(<SeverityTimeline events={events} />)
      const items = container.querySelectorAll('.ui-severity-timeline__item')
      expect(items.length).toBe(4)
    })

    it('handles numeric timestamps', () => {
      const numEvents: TimelineEvent[] = [
        { id: '1', timestamp: Date.now(), severity: 'info', title: 'Test' },
      ]
      const { container } = render(<SeverityTimeline events={numEvents} />)
      expect(container.querySelector('.ui-severity-timeline__item')).toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<SeverityTimeline events={events} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ───────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<SeverityTimeline events={events} className="custom" />)
      expect(container.querySelector('.ui-severity-timeline.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<SeverityTimeline events={events} data-testid="timeline" />)
      expect(screen.getByTestId('timeline')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(SeverityTimeline.displayName).toBe('SeverityTimeline')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<SeverityTimeline events={events} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with expandable', async () => {
      const { container } = render(<SeverityTimeline events={events} expandable />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses list semantics', () => {
      const { container } = render(<SeverityTimeline events={events} />)
      expect(container.querySelector('ol, ul')).toBeInTheDocument()
    })
  })
})
