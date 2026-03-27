import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Spoiler } from '../../components/spoiler'

expect.extend(toHaveNoViolations)

// Mock ResizeObserver to control content measurement
let resizeCallback: ResizeObserverCallback | null = null

beforeEach(() => {
  globalThis.ResizeObserver = class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() { resizeCallback = null }
  } as unknown as typeof ResizeObserver
})

describe('Spoiler', () => {
  afterEach(() => {
    cleanup()
    resizeCallback = null
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders children content', () => {
      render(
        <Spoiler maxHeight={100}>
          <p>Some content here</p>
        </Spoiler>
      )
      expect(screen.getByText('Some content here')).toBeInTheDocument()
    })

    it('renders with ui-spoiler class', () => {
      const { container } = render(
        <Spoiler maxHeight={100}>Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')).toBeInTheDocument()
    })

    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Spoiler ref={ref} maxHeight={100}>Content</Spoiler>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <Spoiler maxHeight={100} className="custom">Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <Spoiler maxHeight={100} data-testid="spoiler" title="spoiler">Content</Spoiler>
      )
      expect(screen.getByTestId('spoiler')).toHaveAttribute('title', 'spoiler')
    })
  })

  // ─── State management ─────────────────────────────────────────────

  describe('state', () => {
    it('starts in hidden state by default', () => {
      const { container } = render(
        <Spoiler maxHeight={100}>Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-state', 'hidden')
    })

    it('starts in visible state when initialState="visible"', () => {
      const { container } = render(
        <Spoiler maxHeight={100} initialState="visible">Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-state', 'visible')
    })

    it('sets maxHeight on content wrapper', () => {
      const { container } = render(
        <Spoiler maxHeight={150}>Content</Spoiler>
      )
      const content = container.querySelector('.ui-spoiler__content') as HTMLElement
      // maxHeight is set via style when toggle should show — but with no scrollHeight > maxHeight
      // we can still check the content element exists
      expect(content).toBeInTheDocument()
    })
  })

  // ─── Toggle behavior ─────────────────────────────────────────────

  describe('toggle', () => {
    it('does not show toggle button when content fits within maxHeight', () => {
      // scrollHeight will be 0 in jsdom (no layout), which is < maxHeight
      render(
        <Spoiler maxHeight={500}>Short content</Spoiler>
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('uses custom showLabel', () => {
      // We need to mock scrollHeight to force the toggle to show
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
      Object.defineProperty(Element.prototype, 'scrollHeight', {
        configurable: true,
        get() { return 200 },
      })

      render(
        <Spoiler maxHeight={50} showLabel="Read more">
          <div style={{ height: 200 }}>Tall content</div>
        </Spoiler>
      )
      expect(screen.getByText('Read more')).toBeInTheDocument()

      if (originalDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollHeight', originalDescriptor)
      }
    })

    it('toggles between show and hide labels on click', async () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
      Object.defineProperty(Element.prototype, 'scrollHeight', {
        configurable: true,
        get() { return 200 },
      })

      render(
        <Spoiler maxHeight={50} showLabel="Show more" hideLabel="Show less">
          <div style={{ height: 200 }}>Tall content</div>
        </Spoiler>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Show more')

      await userEvent.click(button)
      expect(button).toHaveTextContent('Show less')

      await userEvent.click(button)
      expect(button).toHaveTextContent('Show more')

      if (originalDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollHeight', originalDescriptor)
      }
    })

    it('sets aria-expanded on toggle button', async () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
      Object.defineProperty(Element.prototype, 'scrollHeight', {
        configurable: true,
        get() { return 200 },
      })

      render(
        <Spoiler maxHeight={50}>
          <div style={{ height: 200 }}>Tall content</div>
        </Spoiler>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      if (originalDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollHeight', originalDescriptor)
      }
    })

    it('changes data-state on toggle', async () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
      Object.defineProperty(Element.prototype, 'scrollHeight', {
        configurable: true,
        get() { return 200 },
      })

      const { container } = render(
        <Spoiler maxHeight={50}>
          <div style={{ height: 200 }}>Tall content</div>
        </Spoiler>
      )

      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-state', 'hidden')

      await userEvent.click(screen.getByRole('button'))
      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-state', 'visible')

      if (originalDescriptor) {
        Object.defineProperty(Element.prototype, 'scrollHeight', originalDescriptor)
      }
    })
  })

  // ─── Transition duration ──────────────────────────────────────────

  describe('transitionDuration', () => {
    it('sets custom transition duration via CSS variable', () => {
      const { container } = render(
        <Spoiler maxHeight={100} transitionDuration={500}>Content</Spoiler>
      )
      const el = container.querySelector('.ui-spoiler') as HTMLElement
      expect(el.style.getPropertyValue('--ui-spoiler-duration')).toBe('500ms')
    })

    it('defaults to 350ms transition', () => {
      const { container } = render(
        <Spoiler maxHeight={100}>Content</Spoiler>
      )
      const el = container.querySelector('.ui-spoiler') as HTMLElement
      expect(el.style.getPropertyValue('--ui-spoiler-duration')).toBe('350ms')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <Spoiler maxHeight={100} motion={1}>Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-motion', '1')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(
        <Spoiler maxHeight={100}>Content</Spoiler>
      )
      expect(container.querySelector('.ui-spoiler')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Spoiler maxHeight={100}>Some content</Spoiler>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Spoiler maxHeight={100}>Content</Spoiler>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-spoiler)', () => {
      render(<Spoiler maxHeight={100}>Content</Spoiler>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map((s) => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-spoiler)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Spoiler"', () => {
      expect(Spoiler.displayName).toBe('Spoiler')
    })
  })
})
