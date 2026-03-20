import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { Sheet } from '../../components/sheet'

expect.extend(toHaveNoViolations)

// jsdom doesn't implement showModal/close natively
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

describe('Sheet', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a dialog element', () => {
      const { container } = render(
        <Sheet open={false} onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(container.querySelector('dialog')).toBeInTheDocument()
    })

    it('renders children content when open', () => {
      render(
        <Sheet open onClose={() => {}}>
          <p>Sheet body</p>
        </Sheet>
      )
      expect(screen.getByText('Sheet body')).toBeInTheDocument()
    })

    it('has ui-sheet scope class', () => {
      const { container } = render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(container.querySelector('.ui-sheet')).toBeInTheDocument()
    })

    it('renders with role="dialog"', () => {
      render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  // ─── Open / Close ──────────────────────────────────────────────────

  describe('open/close', () => {
    it('calls showModal() when open=true', () => {
      render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('calls close() when open transitions to false', () => {
      function Wrapper() {
        const [open, setOpen] = useState(true)
        return (
          <>
            <button onClick={() => setOpen(false)}>Close it</button>
            <Sheet open={open} onClose={() => setOpen(false)}>
              Content
            </Sheet>
          </>
        )
      }
      render(<Wrapper />)
      fireEvent.click(screen.getByRole('button', { name: 'Close it' }))
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })
  })

  // ─── Sides ──────────────────────────────────────────────────────────

  describe('sides', () => {
    it('defaults to right side', () => {
      render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'right')
    })

    it.each(['left', 'right', 'bottom'] as const)('applies side="%s"', (side) => {
      render(
        <Sheet open onClose={() => {}} side={side}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side)
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to md size', () => {
      render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'md')
    })

    it.each(['sm', 'md', 'lg'] as const)('applies size="%s"', (size) => {
      render(
        <Sheet open onClose={() => {}} size={size}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-size', size)
    })
  })

  // ─── Title & Description ────────────────────────────────────────────

  describe('title and description', () => {
    it('renders title as h2', () => {
      render(
        <Sheet open onClose={() => {}} title="Sheet Title">
          Content
        </Sheet>
      )
      expect(screen.getByRole('heading', { level: 2, name: 'Sheet Title' })).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(
        <Sheet open onClose={() => {}} title="Title" description="Some desc">
          Content
        </Sheet>
      )
      expect(screen.getByText('Some desc')).toBeInTheDocument()
    })

    it('sets aria-labelledby pointing to title', () => {
      render(
        <Sheet open onClose={() => {}} title="Sheet Title">
          Content
        </Sheet>
      )
      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      expect(screen.getByRole('heading', { level: 2 }).id).toBe(titleId)
    })

    it('sets aria-describedby pointing to description', () => {
      render(
        <Sheet open onClose={() => {}} title="Title" description="Desc">
          Content
        </Sheet>
      )
      const dialog = screen.getByRole('dialog')
      const descId = dialog.getAttribute('aria-describedby')
      expect(descId).toBeTruthy()
      expect(screen.getByText('Desc').id).toBe(descId)
    })
  })

  // ─── Close button ──────────────────────────────────────────────────

  describe('close button', () => {
    it('shows close button by default', () => {
      render(
        <Sheet open onClose={() => {}} title="Title">
          Content
        </Sheet>
      )
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('clicking close button calls onClose', () => {
      const onClose = vi.fn()
      render(
        <Sheet open onClose={onClose} title="Title">
          Content
        </Sheet>
      )
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('hides close button when showClose=false', () => {
      render(
        <Sheet open onClose={() => {}} title="Title" showClose={false}>
          Content
        </Sheet>
      )
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })
  })

  // ─── Escape key ──────────────────────────────────────────────────────

  describe('escape key', () => {
    it('calls onClose when Escape is pressed', () => {
      const onClose = vi.fn()
      render(
        <Sheet open onClose={onClose}>
          Content
        </Sheet>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Backdrop click ──────────────────────────────────────────────────

  describe('backdrop click', () => {
    it('calls onClose when clicking the backdrop (dialog element)', () => {
      const onClose = vi.fn()
      render(
        <Sheet open onClose={onClose}>
          Content
        </Sheet>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog, { target: dialog })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when clicking content', () => {
      const onClose = vi.fn()
      render(
        <Sheet open onClose={onClose}>
          <button>Inner</button>
        </Sheet>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Inner' }))
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── Motion ──────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(
        <Sheet open onClose={() => {}} motion={0}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 2', () => {
      render(
        <Sheet open onClose={() => {}} motion={2}>
          Content
        </Sheet>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Swipe dismiss ──────────────────────────────────────────────────

  describe('swipe dismiss', () => {
    it('has swipe area element for gesture detection', () => {
      const { container } = render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(container.querySelector('.ui-sheet__swipe')).toBeInTheDocument()
    })

    it('calls onClose on right swipe for right-side sheet', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Sheet open onClose={onClose} side="right">
          Content
        </Sheet>
      )
      const swipeArea = container.querySelector('.ui-sheet__swipe')!
      // Simulate a fast right swipe (> 30px, < 300ms)
      fireEvent.pointerDown(swipeArea, { clientX: 100, clientY: 200 })
      fireEvent.pointerUp(swipeArea, { clientX: 200, clientY: 200 })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on left swipe for left-side sheet', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Sheet open onClose={onClose} side="left">
          Content
        </Sheet>
      )
      const swipeArea = container.querySelector('.ui-sheet__swipe')!
      // Simulate a fast left swipe
      fireEvent.pointerDown(swipeArea, { clientX: 200, clientY: 200 })
      fireEvent.pointerUp(swipeArea, { clientX: 100, clientY: 200 })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose on down swipe for bottom sheet', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Sheet open onClose={onClose} side="bottom">
          Content
        </Sheet>
      )
      const swipeArea = container.querySelector('.ui-sheet__swipe')!
      // Simulate a fast downward swipe
      fireEvent.pointerDown(swipeArea, { clientX: 200, clientY: 100 })
      fireEvent.pointerUp(swipeArea, { clientX: 200, clientY: 200 })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on wrong direction swipe', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Sheet open onClose={onClose} side="right">
          Content
        </Sheet>
      )
      const swipeArea = container.querySelector('.ui-sheet__swipe')!
      // Simulate a left swipe on a right-side sheet (wrong direction)
      fireEvent.pointerDown(swipeArea, { clientX: 200, clientY: 200 })
      fireEvent.pointerUp(swipeArea, { clientX: 100, clientY: 200 })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── className ──────────────────────────────────────────────────────

  describe('className', () => {
    it('applies custom className', () => {
      render(
        <Sheet open onClose={() => {}} className="custom-sheet">
          Content
        </Sheet>
      )
      const wrapper = screen.getByRole('dialog').closest('.ui-sheet')
      expect(wrapper).toHaveClass('custom-sheet')
    })
  })

  // ─── Scroll ──────────────────────────────────────────────────────────

  describe('scroll', () => {
    it('has scrollable body area', () => {
      const { container } = render(
        <Sheet open onClose={() => {}} title="Title">
          <div style={{ height: '2000px' }}>Tall</div>
        </Sheet>
      )
      expect(container.querySelector('.ui-sheet__body')).toBeInTheDocument()
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles unmount while open', () => {
      const { unmount } = render(
        <Sheet open onClose={() => {}}>
          Content
        </Sheet>
      )
      expect(() => unmount()).not.toThrow()
    })

    it('renders without title or description', () => {
      render(
        <Sheet open onClose={() => {}}>
          Content only
        </Sheet>
      )
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })

    it('spreads additional HTML attributes', () => {
      render(
        <Sheet open onClose={() => {}} data-testid="my-sheet">
          Content
        </Sheet>
      )
      expect(screen.getByTestId('my-sheet')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when closed', async () => {
      const { container } = render(
        <Sheet open={false} onClose={() => {}}>
          Content
        </Sheet>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when open with title', async () => {
      const { container } = render(
        <Sheet open onClose={() => {}} title="Accessible Sheet" description="Description">
          <button>Action</button>
        </Sheet>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('dialog has proper structure for screen readers', () => {
      render(
        <Sheet open onClose={() => {}} title="SR Title" description="SR Desc">
          Content
        </Sheet>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })
})
