import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Timeline, type TimelineItem } from '../../components/timeline'

expect.extend(toHaveNoViolations)

const baseItems: TimelineItem[] = [
  { id: '1', title: 'Step one', status: 'completed' },
  { id: '2', title: 'Step two', status: 'active' },
  { id: '3', title: 'Step three', status: 'pending' },
]

const fullItems: TimelineItem[] = [
  {
    id: 'a',
    title: 'Deployed',
    description: 'Production deploy completed',
    timestamp: '2026-03-27 10:00',
    status: 'completed',
  },
  {
    id: 'b',
    title: 'Review',
    description: 'Code review in progress',
    timestamp: '2026-03-27 09:30',
    status: 'active',
  },
  {
    id: 'c',
    title: 'Testing',
    description: 'Awaiting CI',
    timestamp: '2026-03-27 09:00',
    status: 'pending',
  },
  {
    id: 'd',
    title: 'Build failed',
    description: 'Lint errors',
    timestamp: '2026-03-27 08:30',
    status: 'error',
  },
]

describe('Timeline', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-timeline scope class', () => {
      const { container } = render(<Timeline items={baseItems} />)
      expect(container.querySelector('.ui-timeline')).toBeInTheDocument()
    })

    it('renders all items', () => {
      render(<Timeline items={baseItems} />)
      expect(screen.getByText('Step one')).toBeInTheDocument()
      expect(screen.getByText('Step two')).toBeInTheDocument()
      expect(screen.getByText('Step three')).toBeInTheDocument()
    })

    it('renders role="list" on the container', () => {
      render(<Timeline items={baseItems} />)
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('renders role="listitem" on each item', () => {
      render(<Timeline items={baseItems} />)
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    it('applies custom className', () => {
      const { container } = render(<Timeline items={baseItems} className="custom-tl" />)
      expect(container.querySelector('.ui-timeline')).toHaveClass('custom-tl')
    })

    it('spreads additional HTML attributes', () => {
      render(<Timeline items={baseItems} data-testid="my-timeline" />)
      expect(screen.getByTestId('my-timeline')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Timeline.displayName).toBe('Timeline')
    })

    it('renders an empty timeline without errors', () => {
      const { container } = render(<Timeline items={[]} />)
      expect(container.querySelector('.ui-timeline')).toBeInTheDocument()
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
  })

  // ─── Content ─────────────────────────────────────────────────────

  describe('content', () => {
    it('renders description when provided', () => {
      render(<Timeline items={fullItems} />)
      expect(screen.getByText('Production deploy completed')).toBeInTheDocument()
    })

    it('renders timestamp when provided', () => {
      render(<Timeline items={fullItems} />)
      expect(screen.getByText('2026-03-27 10:00')).toBeInTheDocument()
    })

    it('renders timestamp inside a <time> element', () => {
      const { container } = render(<Timeline items={fullItems} />)
      const timeElements = container.querySelectorAll('time.ui-timeline__timestamp')
      expect(timeElements.length).toBe(4)
    })

    it('renders icon inside the status dot', () => {
      const items: TimelineItem[] = [
        { id: '1', title: 'With icon', icon: <svg data-testid="custom-icon" /> },
      ]
      render(<Timeline items={items} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders ReactNode as title', () => {
      const items: TimelineItem[] = [
        { id: '1', title: <strong>Bold title</strong> },
      ]
      render(<Timeline items={items} />)
      expect(screen.getByText('Bold title')).toBeInTheDocument()
    })
  })

  // ─── Status ─────────────────────────────────────────────────────

  describe('status', () => {
    it('sets data-status on the dot element', () => {
      const { container } = render(<Timeline items={baseItems} />)
      const dots = container.querySelectorAll('.ui-timeline__dot')
      expect(dots[0]).toHaveAttribute('data-status', 'completed')
      expect(dots[1]).toHaveAttribute('data-status', 'active')
      expect(dots[2]).toHaveAttribute('data-status', 'pending')
    })

    it('defaults status to pending when not provided', () => {
      const items: TimelineItem[] = [{ id: '1', title: 'No status' }]
      const { container } = render(<Timeline items={items} />)
      const dot = container.querySelector('.ui-timeline__dot')
      expect(dot).toHaveAttribute('data-status', 'pending')
    })

    it('renders error status', () => {
      const items: TimelineItem[] = [{ id: '1', title: 'Error', status: 'error' }]
      const { container } = render(<Timeline items={items} />)
      expect(container.querySelector('.ui-timeline__dot')).toHaveAttribute('data-status', 'error')
    })

    it('marks dot as aria-hidden', () => {
      const { container } = render(<Timeline items={baseItems} />)
      const dot = container.querySelector('.ui-timeline__dot')
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    })
  })

  // ─── Variants ───────────────────────────────────────────────────

  describe('variants', () => {
    it('defaults to default variant', () => {
      const { container } = render(<Timeline items={baseItems} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-variant', 'default')
    })

    it.each(['default', 'alternate', 'compact'] as const)('applies variant="%s"', (variant) => {
      const { container } = render(<Timeline items={baseItems} variant={variant} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-variant', variant)
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to md size', () => {
      const { container } = render(<Timeline items={baseItems} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-size', 'md')
    })

    it.each(['sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
      const { container } = render(<Timeline items={baseItems} size={size} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-size', size)
    })
  })

  // ─── Connector Style ───────────────────────────────────────────

  describe('connectorStyle', () => {
    it('defaults to solid connector', () => {
      const { container } = render(<Timeline items={baseItems} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-connector', 'solid')
    })

    it.each(['solid', 'dashed', 'dotted'] as const)('applies connectorStyle="%s"', (style) => {
      const { container } = render(<Timeline items={baseItems} connectorStyle={style} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-connector', style)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(<Timeline items={baseItems} motion={0} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-motion', '0')
    })

    it('accepts motion level 2', () => {
      const { container } = render(<Timeline items={baseItems} motion={2} />)
      expect(container.querySelector('.ui-timeline')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Timeline items={baseItems} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (alternate variant)', async () => {
      const { container } = render(<Timeline items={fullItems} variant="alternate" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (compact variant)', async () => {
      const { container } = render(<Timeline items={fullItems} variant="compact" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
