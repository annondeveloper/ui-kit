import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TextReveal } from '../../domain/text-reveal'

expect.extend(toHaveNoViolations)

let observerInstances: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
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
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('TextReveal', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TextReveal text="Hello" />)
      expect(container.querySelector('.ui-text-reveal')).toBeInTheDocument()
    })

    it('renders individual characters', () => {
      const { container } = render(<TextReveal text="Hi" />)
      const chars = container.querySelectorAll('.ui-text-reveal--char')
      expect(chars.length).toBe(2)
    })

    it('has displayName', () => {
      expect(TextReveal.displayName).toBe('TextReveal')
    })

    it('applies custom className', () => {
      const { container } = render(
        <TextReveal text="Hello" className="custom" />
      )
      expect(container.querySelector('.ui-text-reveal.custom')).toBeInTheDocument()
    })
  })

  // ─── Animation ─────────────────────────────────────────────────────

  describe('animation', () => {
    it('reveals characters progressively on mount trigger', () => {
      const { container } = render(<TextReveal text="AB" speed={10} />)
      // First character should reveal after 100ms (1000/10)
      act(() => { vi.advanceTimersByTime(100) })
      const chars = container.querySelectorAll('.ui-text-reveal--char')
      expect(chars[0]?.getAttribute('data-revealed')).toBe('true')
    })

    it('marks spaces with data-space', () => {
      const { container } = render(<TextReveal text="A B" />)
      const chars = container.querySelectorAll('.ui-text-reveal--char')
      expect(chars[1]?.getAttribute('data-space')).toBe('true')
    })

    it('reveals all characters with motion 0 instantly', () => {
      const { container } = render(<TextReveal text="ABC" motion={0} />)
      const revealed = container.querySelectorAll('[data-revealed="true"]')
      expect(revealed.length).toBe(3)
    })
  })

  // ─── InView trigger ────────────────────────────────────────────────

  describe('inView trigger', () => {
    it('does not start revealing until in view', () => {
      const { container } = render(
        <TextReveal text="AB" trigger="inView" speed={10} />
      )
      act(() => { vi.advanceTimersByTime(500) })
      const revealed = container.querySelectorAll('[data-revealed="true"]')
      expect(revealed.length).toBe(0)
    })

    it('starts revealing when element enters viewport', () => {
      const { container } = render(
        <TextReveal text="AB" trigger="inView" speed={10} />
      )
      act(() => {
        observerInstances[0]?.trigger(true)
      })
      act(() => { vi.advanceTimersByTime(100) })
      const revealed = container.querySelectorAll('[data-revealed="true"]')
      expect(revealed.length).toBeGreaterThan(0)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(
        <TextReveal text="Hello" motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-label with full text', () => {
      const { container } = render(<TextReveal text="Hello world" />)
      const el = container.querySelector('.ui-text-reveal')
      expect(el?.getAttribute('aria-label')).toBe('Hello world')
    })

    it('marks characters as aria-hidden', () => {
      const { container } = render(<TextReveal text="Hi" />)
      const chars = container.querySelectorAll('[aria-hidden="true"]')
      expect(chars.length).toBe(2)
    })

    it('has no axe violations', async () => {
      vi.useRealTimers()
      const { container } = render(<TextReveal text="Accessible" motion={0} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })
  })
})
