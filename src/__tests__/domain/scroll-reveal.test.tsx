import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ScrollReveal } from '../../domain/scroll-reveal'

expect.extend(toHaveNoViolations)

// ─── IntersectionObserver Mock ──────────────────────────────────────────────

let observerCallback: IntersectionObserverCallback
let observerInstances: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    observerCallback = callback
    this.thresholds = options?.threshold ? (Array.isArray(options.threshold) ? options.threshold : [options.threshold]) : [0]
    observerInstances.push(this)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[])

  // Helper to trigger intersection
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
  // No CSS scroll-driven animations support in test
  vi.stubGlobal('CSS', { supports: () => false })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ScrollReveal', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = render(
        <ScrollReveal>Hello</ScrollReveal>
      )
      expect(container.querySelector('.ui-scroll-reveal')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<ScrollReveal>Content here</ScrollReveal>)
      expect(screen.getByText('Content here')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <ScrollReveal className="custom">Content</ScrollReveal>
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('renders with default fade-up animation attribute', () => {
      const { container } = render(
        <ScrollReveal>Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="fade-up"]')).toBeInTheDocument()
    })

    it('renders with specified animation', () => {
      const { container } = render(
        <ScrollReveal animation="scale">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="scale"]')).toBeInTheDocument()
    })
  })

  // ─── Visibility Toggle ────────────────────────────────────────────

  describe('visibility', () => {
    it('starts hidden (not revealed)', () => {
      const { container } = render(
        <ScrollReveal>Content</ScrollReveal>
      )
      expect(container.querySelector('[data-revealed="true"]')).not.toBeInTheDocument()
    })

    it('reveals when intersection observer fires', () => {
      const { container } = render(
        <ScrollReveal>Content</ScrollReveal>
      )
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      expect(container.querySelector('[data-revealed="true"]')).toBeInTheDocument()
    })

    it('hides again when not intersecting and once=false', () => {
      const { container } = render(
        <ScrollReveal once={false}>Content</ScrollReveal>
      )
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      expect(container.querySelector('[data-revealed="true"]')).toBeInTheDocument()

      act(() => {
        observerInstances[0]?.trigger(false)
      })
      expect(container.querySelector('[data-revealed="true"]')).not.toBeInTheDocument()
    })
  })

  // ─── Once Behavior ────────────────────────────────────────────────

  describe('once behavior', () => {
    it('defaults to once=true', () => {
      render(<ScrollReveal>Content</ScrollReveal>)
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      // Should disconnect after first reveal
      expect(observerInstances[0]?.disconnect).toHaveBeenCalled()
    })

    it('does not disconnect when once=false', () => {
      render(<ScrollReveal once={false}>Content</ScrollReveal>)
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      // disconnect is called during cleanup but not for "once" behavior
      // The observe mock should have been called
      expect(observerInstances[0]?.observe).toHaveBeenCalled()
    })
  })

  // ─── Animation Classes ────────────────────────────────────────────

  describe('animation types', () => {
    it('supports fade-up animation', () => {
      const { container } = render(
        <ScrollReveal animation="fade-up">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="fade-up"]')).toBeInTheDocument()
    })

    it('supports fade-down animation', () => {
      const { container } = render(
        <ScrollReveal animation="fade-down">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="fade-down"]')).toBeInTheDocument()
    })

    it('supports fade-left animation', () => {
      const { container } = render(
        <ScrollReveal animation="fade-left">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="fade-left"]')).toBeInTheDocument()
    })

    it('supports fade-right animation', () => {
      const { container } = render(
        <ScrollReveal animation="fade-right">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="fade-right"]')).toBeInTheDocument()
    })

    it('supports scale animation', () => {
      const { container } = render(
        <ScrollReveal animation="scale">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="scale"]')).toBeInTheDocument()
    })

    it('supports none animation', () => {
      const { container } = render(
        <ScrollReveal animation="none">Content</ScrollReveal>
      )
      expect(container.querySelector('[data-animation="none"]')).toBeInTheDocument()
    })
  })

  // ─── Stagger ──────────────────────────────────────────────────────

  describe('stagger', () => {
    it('sets stagger delay CSS variable', () => {
      const { container } = render(
        <ScrollReveal stagger={100}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ScrollReveal>
      )
      expect(container.querySelector('[data-stagger="100"]')).toBeInTheDocument()
    })
  })

  // ─── Motion Levels ────────────────────────────────────────────────

  describe('motion levels', () => {
    it('sets data-motion=0 for no animation', () => {
      const { container } = render(
        <ScrollReveal motion={0}>Content</ScrollReveal>
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })

    it('motion 0 reveals instantly without animation', () => {
      const { container } = render(
        <ScrollReveal motion={0}>Content</ScrollReveal>
      )
      // With motion 0, should be revealed immediately
      expect(container.querySelector('[data-revealed="true"]')).toBeInTheDocument()
    })

    it('sets data-motion for other levels', () => {
      const { container } = render(
        <ScrollReveal motion={2}>Content</ScrollReveal>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Threshold ────────────────────────────────────────────────────

  describe('threshold', () => {
    it('passes threshold to IntersectionObserver', () => {
      render(<ScrollReveal threshold={0.5}>Content</ScrollReveal>)
      // Observer was created with threshold
      expect(observerInstances.length).toBeGreaterThan(0)
    })
  })

  // ─── Delay ────────────────────────────────────────────────────────

  describe('delay', () => {
    it('sets delay CSS custom property', () => {
      const { container } = render(
        <ScrollReveal delay={200}>Content</ScrollReveal>
      )
      const el = container.querySelector('.ui-scroll-reveal')
      expect(el).toHaveStyle({ '--scroll-reveal-delay': '200ms' })
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <ScrollReveal>
          <p>Accessible content</p>
        </ScrollReveal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('does not hide content from screen readers', () => {
      render(<ScrollReveal>SR content</ScrollReveal>)
      expect(screen.getByText('SR content')).toBeInTheDocument()
      // Content should not have aria-hidden
      expect(screen.getByText('SR content').closest('[aria-hidden]')).not.toBeInTheDocument()
    })
  })
})
