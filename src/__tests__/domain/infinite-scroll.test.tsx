import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, waitFor } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { InfiniteScroll } from '../../domain/infinite-scroll'

expect.extend(toHaveNoViolations)

// ─── IntersectionObserver Mock ──────────────────────────────────────────────

let observerInstances: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.rootMargin = options?.rootMargin ?? '0px'
    observerInstances.push(this)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[])

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry],
      this
    )
  }
}

beforeEach(() => {
  observerInstances = []
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('InfiniteScroll', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item 1</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item 1</div>
          <div>Item 2</div>
        </InfiniteScroll>
      )
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore className="custom">
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('renders sentinel element when hasMore=true', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll__sentinel')).toBeInTheDocument()
    })
  })

  // ─── Sentinel Triggers ────────────────────────────────────────────

  describe('sentinel triggers', () => {
    it('calls onLoadMore when sentinel intersects', () => {
      const onLoadMore = vi.fn()
      render(
        <InfiniteScroll onLoadMore={onLoadMore} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    it('does not call onLoadMore when not intersecting', () => {
      const onLoadMore = vi.fn()
      render(
        <InfiniteScroll onLoadMore={onLoadMore} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      act(() => {
        observerInstances[0]?.trigger(false)
      })
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not call onLoadMore when hasMore=false', () => {
      const onLoadMore = vi.fn()
      render(
        <InfiniteScroll onLoadMore={onLoadMore} hasMore={false}>
          <div>Item</div>
        </InfiniteScroll>
      )
      // Sentinel should not exist when hasMore=false
      expect(observerInstances.length).toBe(0)
    })

    it('observes the sentinel element', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(observerInstances[0]?.observe).toHaveBeenCalled()
    })
  })

  // ─── Loading State ────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows default loader when loading=true', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore loading>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll__loader')).toBeInTheDocument()
    })

    it('shows custom loader when provided', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore loading loader={<div>Custom Loading...</div>}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument()
    })

    it('hides loader when loading=false', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore loading={false}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll__loader')).not.toBeInTheDocument()
    })
  })

  // ─── End Message ──────────────────────────────────────────────────

  describe('end message', () => {
    it('shows endMessage when hasMore=false', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore={false} endMessage={<div>No more items</div>}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(screen.getByText('No more items')).toBeInTheDocument()
    })

    it('hides endMessage when hasMore=true', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore endMessage={<div>No more items</div>}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(screen.queryByText('No more items')).not.toBeInTheDocument()
    })
  })

  // ─── Direction ────────────────────────────────────────────────────

  describe('direction', () => {
    it('renders with default direction="down"', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('[data-direction="down"]')).toBeInTheDocument()
    })

    it('renders with direction="up"', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore direction="up">
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('[data-direction="up"]')).toBeInTheDocument()
    })

    it('places sentinel at top for direction="up"', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore direction="up">
          <div>Item</div>
        </InfiniteScroll>
      )
      const scrollContainer = container.querySelector('.ui-infinite-scroll')!
      const sentinel = scrollContainer.querySelector('.ui-infinite-scroll__sentinel')!
      const content = scrollContainer.querySelector('.ui-infinite-scroll__content')!
      // Sentinel should come before content in DOM for direction="up"
      const children = Array.from(scrollContainer.children)
      expect(children.indexOf(sentinel)).toBeLessThan(children.indexOf(content))
    })
  })

  // ─── Duplicate Prevention ─────────────────────────────────────────

  describe('duplicate prevention', () => {
    it('does not call onLoadMore while loading', () => {
      const onLoadMore = vi.fn()
      render(
        <InfiniteScroll onLoadMore={onLoadMore} hasMore loading>
          <div>Item</div>
        </InfiniteScroll>
      )
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('does not call onLoadMore multiple times for same intersection', () => {
      const onLoadMore = vi.fn()
      render(
        <InfiniteScroll onLoadMore={onLoadMore} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      act(() => {
        observerInstances[0]?.trigger(true)
        observerInstances[0]?.trigger(true)
      })
      // Should debounce/prevent duplicate calls
      expect(onLoadMore).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Threshold ────────────────────────────────────────────────────

  describe('threshold', () => {
    it('uses default threshold of 200px', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(observerInstances[0]?.rootMargin).toContain('200px')
    })

    it('accepts custom threshold', () => {
      render(
        <InfiniteScroll onLoadMore={() => {}} hasMore threshold={500}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(observerInstances[0]?.rootMargin).toContain('500px')
    })
  })

  // ─── Pull to Refresh ──────────────────────────────────────────────

  describe('pull to refresh', () => {
    it('renders pull-to-refresh indicator when enabled', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore pullToRefresh onRefresh={() => {}}>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll__pull-indicator')).toBeInTheDocument()
    })

    it('does not render pull-to-refresh when disabled', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('.ui-infinite-scroll__pull-indicator')).not.toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item 1</div>
          <div>Item 2</div>
        </InfiniteScroll>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('announces loading state via aria-live', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore loading>
          <div>Item</div>
        </InfiniteScroll>
      )
      expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
    })

    it('sentinel is hidden from screen readers', () => {
      const { container } = render(
        <InfiniteScroll onLoadMore={() => {}} hasMore>
          <div>Item</div>
        </InfiniteScroll>
      )
      const sentinel = container.querySelector('.ui-infinite-scroll__sentinel')
      expect(sentinel).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
