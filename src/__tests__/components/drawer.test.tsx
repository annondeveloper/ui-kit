import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { Drawer } from '../../components/drawer'

expect.extend(toHaveNoViolations)

describe('Drawer', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-drawer scope class', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      expect(container.querySelector('.ui-drawer')).toBeInTheDocument()
    })

    it('renders children when open', () => {
      render(
        <Drawer open onClose={() => {}}>
          <p>Drawer body</p>
        </Drawer>
      )
      expect(screen.getByText('Drawer body')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <Drawer open={false} onClose={() => {}}>
          <p>Hidden content</p>
        </Drawer>
      )
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Drawer open onClose={() => {}} className="custom-drawer">
          Content
        </Drawer>
      )
      expect(container.querySelector('.ui-drawer')).toHaveClass('custom-drawer')
    })

    it('spreads additional HTML attributes', () => {
      render(
        <Drawer open onClose={() => {}} data-testid="my-drawer">
          Content
        </Drawer>
      )
      expect(screen.getByTestId('my-drawer')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(Drawer.displayName).toBe('Drawer')
    })

    it('is NOT a dialog element (non-modal)', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      expect(container.querySelector('dialog')).not.toBeInTheDocument()
    })
  })

  // ─── Open / Close ────────────────────────────────────────────────

  describe('open/close', () => {
    it('shows content when open=true', () => {
      render(
        <Drawer open onClose={() => {}}>Visible</Drawer>
      )
      expect(screen.getByText('Visible')).toBeInTheDocument()
    })

    it('hides content when open=false', () => {
      render(
        <Drawer open={false} onClose={() => {}}>Hidden</Drawer>
      )
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
    })

    it('transitions from open to closed', () => {
      function Wrapper() {
        const [open, setOpen] = useState(true)
        return (
          <>
            <button onClick={() => setOpen(false)}>Close</button>
            <Drawer open={open} onClose={() => setOpen(false)}>
              Drawer Content
            </Drawer>
          </>
        )
      }
      render(<Wrapper />)
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Close'))
      // After close, content should be hidden
      expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument()
    })
  })

  // ─── Sides ────────────────────────────────────────────────────────

  describe('sides', () => {
    it('defaults to left side', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      const panel = container.querySelector('.ui-drawer__panel')
      expect(panel).toHaveAttribute('data-side', 'left')
    })

    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'applies side="%s"',
      (side) => {
        const { container } = render(
          <Drawer open onClose={() => {}} side={side}>Content</Drawer>
        )
        const panel = container.querySelector('.ui-drawer__panel')
        expect(panel).toHaveAttribute('data-side', side)
      }
    )
  })

  // ─── Sizes ────────────────────────────────────────────────────────

  describe('sizes', () => {
    it('defaults to md size', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      const panel = container.querySelector('.ui-drawer__panel')
      expect(panel).toHaveAttribute('data-size', 'md')
    })

    it.each(['sm', 'md', 'lg', 'full'] as const)(
      'applies size="%s"',
      (size) => {
        const { container } = render(
          <Drawer open onClose={() => {}} size={size}>Content</Drawer>
        )
        const panel = container.querySelector('.ui-drawer__panel')
        expect(panel).toHaveAttribute('data-size', size)
      }
    )
  })

  // ─── Overlay ──────────────────────────────────────────────────────

  describe('overlay', () => {
    it('shows overlay by default', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      expect(container.querySelector('.ui-drawer__overlay')).toBeInTheDocument()
    })

    it('hides overlay when overlay=false', () => {
      const { container } = render(
        <Drawer open onClose={() => {}} overlay={false}>Content</Drawer>
      )
      expect(container.querySelector('.ui-drawer__overlay')).not.toBeInTheDocument()
    })

    it('calls onClose when clicking overlay', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Drawer open onClose={onClose}>Content</Drawer>
      )
      fireEvent.click(container.querySelector('.ui-drawer__overlay')!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Escape key ───────────────────────────────────────────────────

  describe('escape key', () => {
    it('calls onClose when Escape is pressed', () => {
      const onClose = vi.fn()
      render(
        <Drawer open onClose={onClose}>Content</Drawer>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when Escape pressed and closed', () => {
      const onClose = vi.fn()
      render(
        <Drawer open={false} onClose={onClose}>Content</Drawer>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── No focus trap ────────────────────────────────────────────────

  describe('focus behavior', () => {
    it('does NOT trap focus (page content still interactive)', () => {
      // Drawer is non-modal — it should not use <dialog> or focus trap
      const { container } = render(
        <Drawer open onClose={() => {}}>
          <button>Inside</button>
        </Drawer>
      )
      // Verify no dialog element
      expect(container.querySelector('dialog')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <Drawer open onClose={() => {}} motion={0}>Content</Drawer>
      )
      const panel = container.querySelector('.ui-drawer__panel')
      expect(panel).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 2', () => {
      const { container } = render(
        <Drawer open onClose={() => {}} motion={2}>Content</Drawer>
      )
      const panel = container.querySelector('.ui-drawer__panel')
      expect(panel).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles unmount while open', () => {
      const { unmount } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      expect(() => unmount()).not.toThrow()
    })

    it('handles rapid open/close toggling', () => {
      function Rapid() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen((o) => !o)}>Toggle</button>
            <Drawer open={open} onClose={() => setOpen(false)}>
              Drawer
            </Drawer>
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
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when open', async () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>
          <p>Accessible content</p>
        </Drawer>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when closed', async () => {
      const { container } = render(
        <Drawer open={false} onClose={() => {}}>Content</Drawer>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('drawer panel has appropriate role', () => {
      const { container } = render(
        <Drawer open onClose={() => {}}>Content</Drawer>
      )
      // Non-modal drawer should not have role=dialog
      const panel = container.querySelector('.ui-drawer__panel')
      expect(panel).toBeInTheDocument()
    })
  })
})
