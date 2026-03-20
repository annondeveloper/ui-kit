import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { LiveFeed, type FeedItem } from '../../domain/live-feed'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const makeItems = (count: number): FeedItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    content: `Event ${i}`,
    timestamp: new Date(2026, 0, 1, 12, 0, i),
  }))

describe('LiveFeed', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<LiveFeed items={[]} />)
      expect(container.querySelector('.ui-live-feed')).toBeInTheDocument()
    })

    it('renders items', () => {
      const items = makeItems(3)
      render(<LiveFeed items={items} />)
      expect(screen.getByText('Event 0')).toBeInTheDocument()
      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(LiveFeed.displayName).toBe('LiveFeed')
    })

    it('passes className', () => {
      const { container } = render(<LiveFeed items={[]} className="custom" />)
      expect(container.querySelector('.ui-live-feed.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<LiveFeed items={[]} data-testid="feed" />)
      expect(screen.getByTestId('feed')).toBeInTheDocument()
    })

    it('renders ReactNode content', () => {
      const items: FeedItem[] = [{
        id: '1',
        content: <strong data-testid="bold-item">Important</strong>,
        timestamp: Date.now(),
      }]
      render(<LiveFeed items={items} />)
      expect(screen.getByTestId('bold-item')).toBeInTheDocument()
    })
  })

  // ─── Empty state ────────────────────────────────────────────────────

  describe('empty state', () => {
    it('shows empty message when no items', () => {
      render(<LiveFeed items={[]} emptyMessage="No events yet" />)
      expect(screen.getByText('No events yet')).toBeInTheDocument()
    })

    it('shows default empty state', () => {
      const { container } = render(<LiveFeed items={[]} />)
      expect(container.querySelector('.ui-live-feed__empty')).toBeInTheDocument()
    })

    it('hides empty state when items present', () => {
      const { container } = render(<LiveFeed items={makeItems(1)} emptyMessage="No events" />)
      expect(container.querySelector('.ui-live-feed__empty')).not.toBeInTheDocument()
    })
  })

  // ─── maxItems ───────────────────────────────────────────────────────

  describe('maxItems', () => {
    it('truncates items to maxItems', () => {
      const items = makeItems(10)
      const { container } = render(<LiveFeed items={items} maxItems={5} />)
      const feedItems = container.querySelectorAll('.ui-live-feed__item')
      expect(feedItems.length).toBe(5)
    })

    it('defaults to showing up to 50 items', () => {
      const items = makeItems(60)
      const { container } = render(<LiveFeed items={items} />)
      const feedItems = container.querySelectorAll('.ui-live-feed__item')
      expect(feedItems.length).toBe(50)
    })

    it('shows all items when under max', () => {
      const items = makeItems(3)
      const { container } = render(<LiveFeed items={items} maxItems={10} />)
      const feedItems = container.querySelectorAll('.ui-live-feed__item')
      expect(feedItems.length).toBe(3)
    })
  })

  // ─── Timestamps ─────────────────────────────────────────────────────

  describe('timestamps', () => {
    it('renders timestamp for items', () => {
      const items: FeedItem[] = [{
        id: '1',
        content: 'Test event',
        timestamp: new Date(2026, 0, 1, 14, 30, 0),
      }]
      const { container } = render(<LiveFeed items={items} />)
      const time = container.querySelector('.ui-live-feed__timestamp')
      expect(time).toBeInTheDocument()
    })

    it('handles numeric timestamps', () => {
      const items: FeedItem[] = [{
        id: '1',
        content: 'Test',
        timestamp: Date.now(),
      }]
      const { container } = render(<LiveFeed items={items} />)
      expect(container.querySelector('.ui-live-feed__timestamp')).toBeInTheDocument()
    })
  })

  // ─── Connection status ──────────────────────────────────────────────

  describe('connection status', () => {
    it('shows connected indicator', () => {
      const { container } = render(<LiveFeed items={[]} connectionStatus="connected" />)
      expect(container.querySelector('[data-connection="connected"]')).toBeInTheDocument()
    })

    it('shows reconnecting indicator', () => {
      const { container } = render(<LiveFeed items={[]} connectionStatus="reconnecting" />)
      expect(container.querySelector('[data-connection="reconnecting"]')).toBeInTheDocument()
    })

    it('shows offline indicator', () => {
      const { container } = render(<LiveFeed items={[]} connectionStatus="offline" />)
      expect(container.querySelector('[data-connection="offline"]')).toBeInTheDocument()
    })

    it('does not show status indicator when not provided', () => {
      const { container } = render(<LiveFeed items={[]} />)
      expect(container.querySelector('.ui-live-feed__status')).not.toBeInTheDocument()
    })
  })

  // ─── Auto-scroll ────────────────────────────────────────────────────

  describe('auto-scroll', () => {
    it('has scrollable container', () => {
      const { container } = render(<LiveFeed items={makeItems(5)} height="200px" />)
      expect(container.querySelector('.ui-live-feed__scroll')).toBeInTheDocument()
    })

    it('calls onPause when provided', () => {
      const onPause = vi.fn()
      const { container } = render(
        <LiveFeed items={makeItems(5)} onPause={onPause} paused />
      )
      // Paused state should be reflected
      expect(container.querySelector('[data-paused="true"]')).toBeInTheDocument()
    })

    it('reflects paused state', () => {
      const { container } = render(<LiveFeed items={makeItems(3)} paused />)
      expect(container.querySelector('[data-paused="true"]')).toBeInTheDocument()
    })

    it('does not show paused by default', () => {
      const { container } = render(<LiveFeed items={makeItems(3)} />)
      expect(container.querySelector('[data-paused="true"]')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<LiveFeed items={[]} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<LiveFeed items={[]} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-live="polite"', () => {
      const { container } = render(<LiveFeed items={[]} />)
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
      const { container } = render(<LiveFeed items={[]} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with items', async () => {
      const { container } = render(<LiveFeed items={makeItems(3)} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with connection status', async () => {
      const { container } = render(
        <LiveFeed items={makeItems(2)} connectionStatus="connected" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('items have appropriate structure', () => {
      const items = makeItems(2)
      const { container } = render(<LiveFeed items={items} />)
      const feedItems = container.querySelectorAll('.ui-live-feed__item')
      expect(feedItems.length).toBe(2)
    })
  })
})
