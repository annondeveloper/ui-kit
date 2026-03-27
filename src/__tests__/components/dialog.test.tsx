import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { Dialog } from '../../components/dialog'

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

describe('Dialog', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <dialog> element', () => {
      const { container } = render(
        <Dialog open={false} onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(container.querySelector('dialog')).toBeInTheDocument()
    })

    it('renders children content when open', () => {
      render(
        <Dialog open onClose={() => {}}>
          <p>Dialog body</p>
        </Dialog>
      )
      expect(screen.getByText('Dialog body')).toBeInTheDocument()
    })

    it('has ui-dialog scope class', () => {
      const { container } = render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(container.querySelector('.ui-dialog')).toBeInTheDocument()
    })

    it('renders with role="dialog"', () => {
      render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  // ─── Open / Close ──────────────────────────────────────────────────

  describe('open/close', () => {
    it('calls showModal() when open=true', () => {
      render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('calls close() when open transitions from true to false', () => {
      function Wrapper() {
        const [open, setOpen] = useState(true)
        return (
          <>
            <button onClick={() => setOpen(false)}>Close it</button>
            <Dialog open={open} onClose={() => setOpen(false)}>
              Content
            </Dialog>
          </>
        )
      }
      render(<Wrapper />)
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Close it' }))
      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })

    it('does not call showModal when open=false', () => {
      render(
        <Dialog open={false} onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled()
    })
  })

  // ─── Title & Description ────────────────────────────────────────────

  describe('title and description', () => {
    it('renders title as h2', () => {
      render(
        <Dialog open onClose={() => {}} title="My Dialog">
          Content
        </Dialog>
      )
      const heading = screen.getByRole('heading', { level: 2, name: 'My Dialog' })
      expect(heading).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(
        <Dialog open onClose={() => {}} title="Title" description="Some description">
          Content
        </Dialog>
      )
      expect(screen.getByText('Some description')).toBeInTheDocument()
    })

    it('sets aria-labelledby pointing to title', () => {
      render(
        <Dialog open onClose={() => {}} title="Dialog Title">
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.id).toBe(titleId)
    })

    it('sets aria-describedby pointing to description', () => {
      render(
        <Dialog open onClose={() => {}} title="Title" description="Desc text">
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      const descId = dialog.getAttribute('aria-describedby')
      expect(descId).toBeTruthy()
      expect(screen.getByText('Desc text').id).toBe(descId)
    })

    it('omits aria-labelledby when no title', () => {
      render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).not.toHaveAttribute('aria-labelledby')
    })

    it('omits aria-describedby when no description', () => {
      render(
        <Dialog open onClose={() => {}} title="Title">
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).not.toHaveAttribute('aria-describedby')
    })

    it('supports ReactNode as title', () => {
      render(
        <Dialog open onClose={() => {}} title={<span>Rich title</span>}>
          Content
        </Dialog>
      )
      expect(screen.getByText('Rich title')).toBeInTheDocument()
    })
  })

  // ─── Close button ──────────────────────────────────────────────────

  describe('close button', () => {
    it('shows close button by default', () => {
      render(
        <Dialog open onClose={() => {}} title="Title">
          Content
        </Dialog>
      )
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    })

    it('clicking close button calls onClose', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose} title="Title">
          Content
        </Dialog>
      )
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('hides close button when showClose=false', () => {
      render(
        <Dialog open onClose={() => {}} title="Title" showClose={false}>
          Content
        </Dialog>
      )
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
    })
  })

  // ─── Escape key ──────────────────────────────────────────────────────

  describe('escape key', () => {
    it('calls onClose when Escape is pressed (default)', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when closeOnEscape=false', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose} closeOnEscape={false}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── Backdrop click ──────────────────────────────────────────────────

  describe('backdrop click', () => {
    it('calls onClose when clicking the dialog element itself (backdrop)', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      // Simulate clicking the dialog element itself (the backdrop area)
      fireEvent.click(dialog, { target: dialog })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when clicking dialog content', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose}>
          <button>Inner</button>
        </Dialog>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Inner' }))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('does not close backdrop when closeOnOverlay=false', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose} closeOnOverlay={false}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog, { target: dialog })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── Sizes ──────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to md size', () => {
      render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('data-size', 'md')
    })

    it.each(['sm', 'md', 'lg', 'full'] as const)('applies size="%s"', (size) => {
      render(
        <Dialog open onClose={() => {}} size={size}>
          Content
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-size', size)
    })
  })

  // ─── Motion ──────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(
        <Dialog open onClose={() => {}} motion={0}>
          Content
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 2', () => {
      render(
        <Dialog open onClose={() => {}} motion={2}>
          Content
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── className / props ──────────────────────────────────────────────

  describe('className and custom props', () => {
    it('applies custom className', () => {
      render(
        <Dialog open onClose={() => {}} className="custom-dialog">
          Content
        </Dialog>
      )
      const wrapper = screen.getByRole('dialog').closest('.ui-dialog')
      expect(wrapper).toHaveClass('custom-dialog')
    })

    it('spreads additional HTML attributes', () => {
      render(
        <Dialog open onClose={() => {}} data-testid="my-dialog">
          Content
        </Dialog>
      )
      expect(screen.getByTestId('my-dialog')).toBeInTheDocument()
    })
  })

  // ─── Focus management ──────────────────────────────────────────────

  describe('focus management', () => {
    it('dialog is rendered with role=dialog for native focus trap', () => {
      render(
        <Dialog open onClose={() => {}}>
          <button>Focusable</button>
        </Dialog>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  // ─── Controlled component ──────────────────────────────────────────

  describe('controlled', () => {
    it('works as controlled component with state', () => {
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(true)}>Open</button>
            <Dialog open={open} onClose={() => setOpen(false)} title="Test">
              <p>Dialog content</p>
            </Dialog>
          </>
        )
      }
      render(<Controlled />)
      expect(screen.queryByText('Dialog content')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Open' }))
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })
  })

  // ─── Scroll ──────────────────────────────────────────────────────────

  describe('scroll', () => {
    it('content area is scrollable (has body wrapper)', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Title">
          <div style={{ height: '2000px' }}>Tall content</div>
        </Dialog>
      )
      expect(container.querySelector('.ui-dialog__body')).toBeInTheDocument()
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles unmount while open', () => {
      const { unmount } = render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid open/close toggling', () => {
      function Rapid() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(o => !o)}>Toggle</button>
            <Dialog open={open} onClose={() => setOpen(false)}>Content</Dialog>
          </>
        )
      }
      render(<Rapid />)
      const btn = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.click(btn)
      fireEvent.click(btn)
      fireEvent.click(btn)
      // Should not throw
    })

    it('renders without title or description', () => {
      render(
        <Dialog open onClose={() => {}}>
          Content only
        </Dialog>
      )
      expect(screen.getByText('Content only')).toBeInTheDocument()
    })
  })

  // ─── Footer ────────────────────────────────────────────────────────

  describe('footer', () => {
    it('renders footer content when footer prop is provided', () => {
      render(
        <Dialog open onClose={() => {}} footer={<button>Save</button>}>
          Content
        </Dialog>
      )
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders footer in a ui-dialog__footer element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} footer={<span>Footer</span>}>
          Content
        </Dialog>
      )
      const footer = container.querySelector('.ui-dialog__footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer')
    })

    it('does not render footer element when footer prop is not provided', () => {
      const { container } = render(
        <Dialog open onClose={() => {}}>
          Content
        </Dialog>
      )
      expect(container.querySelector('.ui-dialog__footer')).not.toBeInTheDocument()
    })
  })

  // ─── preventClose ─────────────────────────────────────────────────

  describe('preventClose', () => {
    it('prevents closing via Escape when preventClose is true', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose} preventClose>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('prevents closing via overlay click when preventClose is true', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose} preventClose>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog, { target: dialog })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('allows closing via Escape when preventClose is false', () => {
      const onClose = vi.fn()
      render(
        <Dialog open onClose={onClose}>
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ─── classNames prop ──────────────────────────────────────────────

  describe('classNames', () => {
    it('applies classNames.root to the wrapper element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} classNames={{ root: 'custom-root' }}>
          Content
        </Dialog>
      )
      const wrapper = container.querySelector('.ui-dialog')!
      expect(wrapper.className).toContain('custom-root')
      expect(wrapper.className).toContain('ui-dialog')
    })

    it('applies classNames.header to the header element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Title" classNames={{ header: 'custom-header' }}>
          Content
        </Dialog>
      )
      const header = container.querySelector('.ui-dialog__header')!
      expect(header.className).toContain('custom-header')
      expect(header.className).toContain('ui-dialog__header')
    })

    it('applies classNames.title to the title element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Title" classNames={{ title: 'custom-title' }}>
          Content
        </Dialog>
      )
      const title = container.querySelector('.ui-dialog__title')!
      expect(title.className).toContain('custom-title')
      expect(title.className).toContain('ui-dialog__title')
    })

    it('applies classNames.description to the description element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Title" description="Desc" classNames={{ description: 'custom-desc' }}>
          Content
        </Dialog>
      )
      const desc = container.querySelector('.ui-dialog__description')!
      expect(desc.className).toContain('custom-desc')
      expect(desc.className).toContain('ui-dialog__description')
    })

    it('applies classNames.body to the body element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} classNames={{ body: 'custom-body' }}>
          Content
        </Dialog>
      )
      const body = container.querySelector('.ui-dialog__body')!
      expect(body.className).toContain('custom-body')
      expect(body.className).toContain('ui-dialog__body')
    })

    it('applies classNames.close to the close button', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Title" classNames={{ close: 'custom-close' }}>
          Content
        </Dialog>
      )
      const close = container.querySelector('.ui-dialog__close')!
      expect(close.className).toContain('custom-close')
      expect(close.className).toContain('ui-dialog__close')
    })

    it('applies classNames.footer to the footer element', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} footer={<button>Save</button>} classNames={{ footer: 'custom-footer' }}>
          Content
        </Dialog>
      )
      const footer = container.querySelector('.ui-dialog__footer')!
      expect(footer.className).toContain('custom-footer')
      expect(footer.className).toContain('ui-dialog__footer')
    })

    it('merges classNames.root with className prop', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} classNames={{ root: 'cn-root' }} className="class-prop">
          Content
        </Dialog>
      )
      const wrapper = container.querySelector('.ui-dialog')!
      expect(wrapper.className).toContain('cn-root')
      expect(wrapper.className).toContain('class-prop')
    })

    it('handles undefined classNames gracefully', () => {
      const { container } = render(
        <Dialog open onClose={() => {}} classNames={undefined}>
          Content
        </Dialog>
      )
      expect(container.querySelector('.ui-dialog')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when closed', async () => {
      const { container } = render(
        <Dialog open={false} onClose={() => {}}>
          Content
        </Dialog>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when open with title', async () => {
      const { container } = render(
        <Dialog open onClose={() => {}} title="Accessible Dialog" description="Description">
          <button>Action</button>
        </Dialog>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('dialog has proper structure for screen readers', () => {
      render(
        <Dialog open onClose={() => {}} title="SR Title" description="SR Desc">
          Content
        </Dialog>
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })
})
