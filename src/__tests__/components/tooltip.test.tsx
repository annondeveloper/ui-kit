import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { createRef } from 'react'
import { Tooltip } from '../../components/tooltip'

expect.extend(toHaveNoViolations)

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the trigger child', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
    })

    it('does not render tooltip content initially', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('renders tooltip content as ReactNode', async () => {
      render(
        <Tooltip content={<span data-testid="custom">Custom content</span>}>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByTestId('custom')).toBeInTheDocument()
    })

    it('renders string content', async () => {
      render(
        <Tooltip content="Simple text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toHaveTextContent('Simple text')
    })
  })

  // ─── Hover behavior ────────────────────────────────────────────────

  describe('hover', () => {
    it('shows tooltip after default delay (300ms) on hover', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)

      // Not yet visible at 200ms
      act(() => { vi.advanceTimersByTime(200) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      // Visible at 300ms
      act(() => { vi.advanceTimersByTime(100) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('shows tooltip after custom delay', () => {
      render(
        <Tooltip content="Help text" delay={500}>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)

      act(() => { vi.advanceTimersByTime(400) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(100) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.mouseLeave(trigger)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('cancels show if mouse leaves before delay completes', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(150) })
      fireEvent.mouseLeave(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('shows with zero delay', () => {
      render(
        <Tooltip content="Help text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(0) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  // ─── Focus behavior ────────────────────────────────────────────────

  describe('focus', () => {
    it('shows tooltip on focus', () => {
      render(
        <Tooltip content="Help text">
          <button>Focus me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.focus(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on blur', () => {
      render(
        <Tooltip content="Help text">
          <button>Focus me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.focus(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.blur(trigger)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('does not show tooltip when disabled', () => {
      render(
        <Tooltip content="Help text" disabled>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('does not show tooltip on focus when disabled', () => {
      render(
        <Tooltip content="Help text" disabled>
          <button>Focus me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.focus(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Placement ─────────────────────────────────────────────────────

  describe('placement', () => {
    it('defaults to top placement (may flip in constrained viewport)', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      const tooltip = screen.getByRole('tooltip')
      const container = tooltip.closest('[data-placement]')
      // In JSDOM, getBoundingClientRect returns zeroes, so top may flip to bottom
      expect(container).toHaveAttribute('data-placement')
      expect(['top', 'bottom']).toContain(container?.getAttribute('data-placement'))
    })

    it.each(['bottom', 'left', 'right'] as const)(
      'renders with placement="%s"',
      (placement) => {
        render(
          <Tooltip content="Help text" placement={placement}>
            <button>Hover me</button>
          </Tooltip>
        )
        const trigger = screen.getByRole('button')
        fireEvent.mouseEnter(trigger)
        act(() => { vi.advanceTimersByTime(300) })
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip.closest('[data-placement]')).toHaveAttribute('data-placement', placement)
      }
    )

    it('renders with data-placement attribute for top', () => {
      render(
        <Tooltip content="Help text" placement="top">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      const tooltip = screen.getByRole('tooltip')
      const container = tooltip.closest('[data-placement]')
      expect(container).toHaveAttribute('data-placement')
      // Flip detection may change top to bottom in JSDOM
      expect(['top', 'bottom']).toContain(container?.getAttribute('data-placement'))
    })
  })

  // ─── ARIA ──────────────────────────────────────────────────────────

  describe('aria', () => {
    it('connects trigger and tooltip via aria-describedby', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })

      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveAttribute('id')
      expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
    })

    it('removes aria-describedby when tooltip is hidden', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')

      // No aria-describedby when hidden
      expect(trigger).not.toHaveAttribute('aria-describedby')

      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(trigger).toHaveAttribute('aria-describedby')

      fireEvent.mouseLeave(trigger)
      expect(trigger).not.toHaveAttribute('aria-describedby')
    })

    it('tooltip has role="tooltip"', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  // ─── Escape key ────────────────────────────────────────────────────

  describe('escape key', () => {
    it('hides tooltip when Escape is pressed', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Touch behavior ────────────────────────────────────────────────

  describe('touch', () => {
    it('shows tooltip on long press (500ms)', () => {
      render(
        <Tooltip content="Help text">
          <button>Touch me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')

      fireEvent.touchStart(trigger)
      act(() => { vi.advanceTimersByTime(400) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(100) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    it('cancels long press if touch ends early', () => {
      render(
        <Tooltip content="Help text">
          <button>Touch me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')

      fireEvent.touchStart(trigger)
      act(() => { vi.advanceTimersByTime(200) })
      fireEvent.touchEnd(trigger)
      act(() => { vi.advanceTimersByTime(500) })
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('hides tooltip on touch elsewhere after long press', () => {
      render(
        <div>
          <Tooltip content="Help text">
            <button>Touch me</button>
          </Tooltip>
          <button>Other</button>
        </div>
      )
      const trigger = screen.getByRole('button', { name: 'Touch me' })

      fireEvent.touchStart(trigger)
      act(() => { vi.advanceTimersByTime(500) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()

      // Touch outside
      fireEvent.touchStart(document.body)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(
        <Tooltip content="Help text" motion={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      const container = screen.getByRole('tooltip').closest('[data-motion]')
      expect(container).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Offset ────────────────────────────────────────────────────────

  describe('offset', () => {
    it('accepts custom offset prop', () => {
      // This mainly tests that the prop is accepted without error
      render(
        <Tooltip content="Help text" offset={16}>
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when tooltip is hidden', async () => {
      const { container } = render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when tooltip is visible', async () => {
      const { container } = render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      act(() => { vi.advanceTimersByTime(300) })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('preserves existing event handlers on trigger child', () => {
      const onClick = vi.fn()
      render(
        <Tooltip content="Help text">
          <button onClick={onClick}>Click me</button>
        </Tooltip>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('preserves existing onMouseEnter/onMouseLeave on trigger', () => {
      const onMouseEnter = vi.fn()
      const onMouseLeave = vi.fn()
      render(
        <Tooltip content="Help text">
          <button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            Hover me
          </button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      expect(onMouseEnter).toHaveBeenCalledTimes(1)
      fireEvent.mouseLeave(trigger)
      expect(onMouseLeave).toHaveBeenCalledTimes(1)
    })

    it('cleans up timers on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      )
      const trigger = screen.getByRole('button')
      fireEvent.mouseEnter(trigger)
      // Unmount before timer fires — should not throw
      unmount()
      act(() => { vi.advanceTimersByTime(500) })
    })
  })
})
