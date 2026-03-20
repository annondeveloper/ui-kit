import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { Popover } from '../../components/popover'

expect.extend(toHaveNoViolations)

describe('Popover', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the trigger child', () => {
      render(
        <Popover content={<div>Popover content</div>}>
          <button>Open</button>
        </Popover>
      )
      expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    })

    it('does not render popover content initially', () => {
      render(
        <Popover content={<div>Popover content</div>}>
          <button>Open</button>
        </Popover>
      )
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    })

    it('renders popover content when defaultOpen is true', () => {
      render(
        <Popover content={<div>Popover content</div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      expect(screen.getByText('Popover content')).toBeInTheDocument()
    })
  })

  // ─── Click behavior ────────────────────────────────────────────────

  describe('click', () => {
    it('opens popover on trigger click', () => {
      render(
        <Popover content={<div>Popover content</div>}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Popover content')).toBeInTheDocument()
    })

    it('closes popover on second trigger click', () => {
      render(
        <Popover content={<div>Popover content</div>}>
          <button>Open</button>
        </Popover>
      )
      const trigger = screen.getByRole('button', { name: 'Open' })
      fireEvent.click(trigger)
      expect(screen.getByText('Popover content')).toBeInTheDocument()

      fireEvent.click(trigger)
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    })

    it('preserves existing onClick on trigger', () => {
      const onClick = vi.fn()
      render(
        <Popover content={<div>Popover content</div>}>
          <button onClick={onClick}>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Controlled mode ───────────────────────────────────────────────

  describe('controlled', () => {
    it('opens when open prop is true', () => {
      render(
        <Popover content={<div>Popover content</div>} open>
          <button>Open</button>
        </Popover>
      )
      expect(screen.getByText('Popover content')).toBeInTheDocument()
    })

    it('stays closed when open prop is false', () => {
      render(
        <Popover content={<div>Popover content</div>} open={false}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    })

    it('calls onOpenChange when toggled', () => {
      const onOpenChange = vi.fn()
      render(
        <Popover content={<div>Content</div>} open={false} onOpenChange={onOpenChange}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('calls onOpenChange(false) when Escape is pressed', () => {
      const onOpenChange = vi.fn()
      render(
        <Popover content={<div>Content</div>} open onOpenChange={onOpenChange}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('works as controlled component with state', () => {
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <Popover content={<div>Content</div>} open={open} onOpenChange={setOpen}>
            <button>Toggle</button>
          </Popover>
        )
      }
      render(<Controlled />)
      expect(screen.queryByText('Content')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Content')).toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  // ─── Light dismiss ─────────────────────────────────────────────────

  describe('light dismiss', () => {
    it('closes on click outside', () => {
      render(
        <div>
          <Popover content={<div>Popover content</div>}>
            <button>Open</button>
          </Popover>
          <button>Outside</button>
        </div>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByText('Popover content')).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    })

    it('does not close when clicking inside the popover', () => {
      render(
        <Popover content={<button>Inner button</button>}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Open' }))
      expect(screen.getByRole('button', { name: 'Inner button' })).toBeInTheDocument()

      fireEvent.mouseDown(screen.getByRole('button', { name: 'Inner button' }))
      expect(screen.getByRole('button', { name: 'Inner button' })).toBeInTheDocument()
    })
  })

  // ─── Escape key ────────────────────────────────────────────────────

  describe('escape key', () => {
    it('closes popover when Escape is pressed', () => {
      render(
        <Popover content={<div>Popover content</div>}>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Popover content')).toBeInTheDocument()

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
    })
  })

  // ─── Arrow ─────────────────────────────────────────────────────────

  describe('arrow', () => {
    it('shows arrow by default', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      expect(container.querySelector('.ui-popover__arrow')).toBeInTheDocument()
    })

    it('hides arrow when arrow=false', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen arrow={false}>
          <button>Open</button>
        </Popover>
      )
      expect(container.querySelector('.ui-popover__arrow')).not.toBeInTheDocument()
    })
  })

  // ─── Focus trap (modal) ────────────────────────────────────────────

  describe('modal focus trap', () => {
    it('does not trap focus by default', () => {
      render(
        <Popover content={<div><button>Inner</button></div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      // The popover should be open but no focus trap
      expect(screen.getByText('Inner')).toBeInTheDocument()
    })

    it('applies focus trap when modal=true', () => {
      render(
        <Popover content={<div><button>Inner A</button><button>Inner B</button></div>} defaultOpen modal>
          <button>Open</button>
        </Popover>
      )
      // Focus should move into the popover content
      // The focus trap moves focus to the first focusable element
      expect(screen.getByRole('button', { name: 'Inner A' })).toBeInTheDocument()
    })
  })

  // ─── Placement ─────────────────────────────────────────────────────

  describe('placement', () => {
    it('defaults to bottom placement', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      const panel = container.querySelector('.ui-popover')
      expect(panel).toHaveAttribute('data-placement', 'bottom')
    })

    it.each(['top', 'bottom', 'left', 'right'] as const)(
      'accepts placement="%s"',
      (placement) => {
        const { container } = render(
          <Popover content={<div>Content</div>} defaultOpen placement={placement}>
            <button>Open</button>
          </Popover>
        )
        const panel = container.querySelector('.ui-popover')
        expect(panel).toHaveAttribute('data-placement')
      }
    )
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen motion={0}>
          <button>Open</button>
        </Popover>
      )
      const panel = container.querySelector('.ui-popover')
      expect(panel).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 2', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen motion={2}>
          <button>Open</button>
        </Popover>
      )
      const panel = container.querySelector('.ui-popover')
      expect(panel).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── className ─────────────────────────────────────────────────────

  describe('className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen className="custom-popover">
          <button>Open</button>
        </Popover>
      )
      const panel = container.querySelector('.ui-popover')
      expect(panel).toHaveClass('custom-popover')
    })
  })

  // ─── Interactive content ───────────────────────────────────────────

  describe('interactive content', () => {
    it('renders interactive content (buttons, links)', () => {
      render(
        <Popover
          content={
            <div>
              <button>Action 1</button>
              <a href="#test">Link</a>
            </div>
          }
          defaultOpen
        >
          <button>Open</button>
        </Popover>
      )
      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument()
    })

    it('keeps popover open when interacting with content', () => {
      render(
        <Popover content={<button>Inner action</button>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Inner action' }))
      // Popover should still be open
      expect(screen.getByRole('button', { name: 'Inner action' })).toBeInTheDocument()
    })
  })

  // ─── Nested popovers ──────────────────────────────────────────────

  describe('nested popovers', () => {
    it('supports nested popover rendering', () => {
      render(
        <Popover
          content={
            <div>
              <span>Outer content</span>
              <Popover content={<span>Inner content</span>}>
                <button>Open inner</button>
              </Popover>
            </div>
          }
          defaultOpen
        >
          <button>Open outer</button>
        </Popover>
      )
      expect(screen.getByText('Outer content')).toBeInTheDocument()

      // Open inner popover
      fireEvent.click(screen.getByRole('button', { name: 'Open inner' }))
      expect(screen.getByText('Inner content')).toBeInTheDocument()
    })
  })

  // ─── Keyboard ──────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('trigger has aria-expanded reflecting open state', () => {
      render(
        <Popover content={<div>Content</div>}>
          <button>Open</button>
        </Popover>
      )
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('trigger has aria-haspopup attribute', () => {
      render(
        <Popover content={<div>Content</div>}>
          <button>Open</button>
        </Popover>
      )
      expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when closed', async () => {
      const { container } = render(
        <Popover content={<div>Content</div>}>
          <button>Open</button>
        </Popover>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when open', async () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles unmount while open', () => {
      const { unmount } = render(
        <Popover content={<div>Content</div>} defaultOpen>
          <button>Open</button>
        </Popover>
      )
      // Should not throw
      unmount()
    })

    it('renders with offset prop', () => {
      const { container } = render(
        <Popover content={<div>Content</div>} defaultOpen offset={16}>
          <button>Open</button>
        </Popover>
      )
      expect(container.querySelector('.ui-popover')).toBeInTheDocument()
    })
  })
})
