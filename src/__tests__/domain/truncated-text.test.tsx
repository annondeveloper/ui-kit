import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TruncatedText } from '../../domain/truncated-text'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Mock scrollHeight/clientHeight for truncation detection
function mockTruncation(el: HTMLElement, isTruncated: boolean) {
  Object.defineProperty(el, 'scrollHeight', { value: isTruncated ? 100 : 20, configurable: true })
  Object.defineProperty(el, 'clientHeight', { value: 20, configurable: true })
}

describe('TruncatedText', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TruncatedText text="Hello world" />)
      expect(container.querySelector('.ui-truncated-text')).toBeInTheDocument()
    })

    it('renders the text', () => {
      render(<TruncatedText text="Hello world" />)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <TruncatedText text="Hello" className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(<TruncatedText text="Hello" data-testid="my-text" />)
      expect(screen.getByTestId('my-text')).toBeInTheDocument()
    })

    it('renders as a span element', () => {
      const { container } = render(<TruncatedText text="Hello" />)
      expect(container.querySelector('span.ui-truncated-text')).toBeInTheDocument()
    })
  })

  // ─── Single Line Truncation ───────────────────────────────────────

  describe('single line truncation', () => {
    it('defaults to 1 line', () => {
      const { container } = render(<TruncatedText text="Hello" />)
      expect(container.querySelector('[data-lines="1"]')).toBeInTheDocument()
    })

    it('applies single-line truncation styles', () => {
      const { container } = render(<TruncatedText text="Hello world" />)
      const el = container.querySelector('.ui-truncated-text__content')
      expect(el).toBeInTheDocument()
    })
  })

  // ─── Multi-line Clamp ─────────────────────────────────────────────

  describe('multi-line clamp', () => {
    it('sets lines data attribute', () => {
      const { container } = render(
        <TruncatedText text="Some long text" lines={3} />
      )
      expect(container.querySelector('[data-lines="3"]')).toBeInTheDocument()
    })

    it('sets line-clamp CSS var', () => {
      const { container } = render(
        <TruncatedText text="Some long text" lines={2} />
      )
      const el = container.querySelector('.ui-truncated-text__content') as HTMLElement
      expect(el?.style.getPropertyValue('--lines')).toBe('2')
    })

    it('supports various line counts', () => {
      const { container } = render(
        <TruncatedText text="Some long text" lines={5} />
      )
      expect(container.querySelector('[data-lines="5"]')).toBeInTheDocument()
    })
  })

  // ─── Expandable ───────────────────────────────────────────────────

  describe('expandable', () => {
    it('shows "Show more" button when expandable', () => {
      render(
        <TruncatedText text="Some long text" expandable />
      )
      expect(screen.getByRole('button', { name: /show more/i })).toBeInTheDocument()
    })

    it('toggles to "Show less" after clicking "Show more"', async () => {
      render(
        <TruncatedText text="Some long text" expandable />
      )
      await userEvent.click(screen.getByRole('button', { name: /show more/i }))
      expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument()
    })

    it('expands text when "Show more" is clicked', async () => {
      const { container } = render(
        <TruncatedText text="Some long text" expandable />
      )
      await userEvent.click(screen.getByRole('button', { name: /show more/i }))
      expect(container.querySelector('[data-expanded]')).toBeInTheDocument()
    })

    it('collapses text when "Show less" is clicked', async () => {
      const { container } = render(
        <TruncatedText text="Some long text" expandable />
      )
      await userEvent.click(screen.getByRole('button', { name: /show more/i }))
      expect(container.querySelector('[data-expanded]')).toBeInTheDocument()
      await userEvent.click(screen.getByRole('button', { name: /show less/i }))
      expect(container.querySelector('[data-expanded]')).not.toBeInTheDocument()
    })

    it('does not show expand button by default', () => {
      render(<TruncatedText text="Hello" />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  // ─── Tooltip ──────────────────────────────────────────────────────

  describe('tooltip', () => {
    it('defaults to showTooltip=true', () => {
      const { container } = render(
        <TruncatedText text="Hello world" />
      )
      // The element should have a title attribute for native tooltip
      const el = container.querySelector('.ui-truncated-text')
      expect(el).toHaveAttribute('title', 'Hello world')
    })

    it('does not show tooltip when showTooltip=false', () => {
      const { container } = render(
        <TruncatedText text="Hello world" showTooltip={false} />
      )
      const el = container.querySelector('.ui-truncated-text')
      expect(el).not.toHaveAttribute('title')
    })

    it('removes tooltip when expanded', async () => {
      const { container } = render(
        <TruncatedText text="Hello world" expandable />
      )
      expect(container.querySelector('.ui-truncated-text')).toHaveAttribute('title')
      await userEvent.click(screen.getByRole('button', { name: /show more/i }))
      expect(container.querySelector('.ui-truncated-text')).not.toHaveAttribute('title')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <TruncatedText text="Hello world" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when expandable', async () => {
      const { container } = render(
        <TruncatedText text="Hello world" expandable />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('full text is available to screen readers', () => {
      render(<TruncatedText text="Hello world" />)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('expand button is keyboard accessible', async () => {
      render(<TruncatedText text="Hello" expandable />)
      const btn = screen.getByRole('button', { name: /show more/i })
      btn.focus()
      await userEvent.keyboard('{Enter}')
      expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument()
    })
  })
})
