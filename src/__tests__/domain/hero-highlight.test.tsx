import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { HeroHighlight, Highlight } from '../../domain/hero-highlight'

expect.extend(toHaveNoViolations)

// ─── IntersectionObserver mock ──────────────────────────────────────────

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[])
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('HeroHighlight', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<HeroHighlight>Content</HeroHighlight>)
      expect(container.querySelector('.ui-hero-highlight')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<HeroHighlight><p>Hello</p></HeroHighlight>)
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(HeroHighlight.displayName).toBe('HeroHighlight')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <HeroHighlight className="custom">Content</HeroHighlight>
      )
      expect(container.querySelector('.ui-hero-highlight.custom')).toBeInTheDocument()
    })

    it('sets motion data attribute', () => {
      const { container } = render(
        <HeroHighlight motion={2}>Content</HeroHighlight>
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<HeroHighlight data-testid="hh">Content</HeroHighlight>)
      expect(screen.getByTestId('hh')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <HeroHighlight><p>Accessible content</p></HeroHighlight>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

describe('Highlight', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<Highlight>word</Highlight>)
      expect(container.querySelector('.ui-highlight')).toBeInTheDocument()
    })

    it('renders children', () => {
      render(<Highlight>highlighted</Highlight>)
      expect(screen.getByText('highlighted')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Highlight.displayName).toBe('Highlight')
    })
  })

  // ─── Props ──────────────────────────────────────────────────────────

  describe('props', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Highlight className="custom">word</Highlight>
      )
      expect(container.querySelector('.ui-highlight.custom')).toBeInTheDocument()
    })

    it('applies color as CSS variable', () => {
      const { container } = render(
        <Highlight color="oklch(70% 0.2 120 / 0.3)">word</Highlight>
      )
      const el = container.querySelector('.ui-highlight') as HTMLElement
      expect(el.style.getPropertyValue('--highlight-brand-color')).toBe('oklch(70% 0.2 120 / 0.3)')
    })

    it('at motion 0, sets data-active immediately', () => {
      const { container } = render(
        <Highlight motion={0}>word</Highlight>
      )
      const el = container.querySelector('.ui-highlight')
      expect(el?.getAttribute('data-active')).toBe('true')
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<Highlight motion={2}>word</Highlight>)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <p>This is a <Highlight>highlighted</Highlight> word</p>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
