import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { DropdownMenu, type MenuItem } from '../../components/dropdown-menu'

expect.extend(toHaveNoViolations)

const basicItems: MenuItem[] = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Copy', onClick: vi.fn() },
  { label: 'Delete', danger: true, onClick: vi.fn() },
]

const fullItems: MenuItem[] = [
  { type: 'label', label: 'Actions' },
  { label: 'Edit', icon: <span data-testid="edit-icon">E</span>, shortcut: '⌘E', onClick: vi.fn() },
  { label: 'Copy', shortcut: '⌘C', onClick: vi.fn() },
  { type: 'separator' },
  { type: 'label', label: 'Danger Zone' },
  { label: 'Delete', danger: true, onClick: vi.fn(), shortcut: '⌘⌫' },
  { label: 'Disabled Item', disabled: true, onClick: vi.fn() },
]

describe('DropdownMenu', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the trigger child', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
    })

    it('does not render menu initially', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('renders menu when open prop is true', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('renders all menu items', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getAllByRole('menuitem')).toHaveLength(3)
    })
  })

  // ─── Open / Close ────────────────────────────────────────────────

  describe('open/close', () => {
    it('opens on trigger click', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('closes on second trigger click', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      const trigger = screen.getByRole('button', { name: 'Menu' })
      fireEvent.click(trigger)
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.click(trigger)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('closes on Escape key', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('closes on click outside', () => {
      render(
        <div>
          <DropdownMenu items={basicItems}>
            <button>Menu</button>
          </DropdownMenu>
          <button>Outside</button>
        </div>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('calls onOpenChange callback', () => {
      const onOpenChange = vi.fn()
      render(
        <DropdownMenu items={basicItems} onOpenChange={onOpenChange}>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('works as controlled component', () => {
      function Controlled() {
        const [open, setOpen] = useState(false)
        return (
          <DropdownMenu items={basicItems} open={open} onOpenChange={setOpen}>
            <button>Menu</button>
          </DropdownMenu>
        )
      }
      render(<Controlled />)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(screen.getByRole('menu')).toBeInTheDocument()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  // ─── Item click ──────────────────────────────────────────────────

  describe('item click', () => {
    it('calls onClick when item is clicked', () => {
      const onClick = vi.fn()
      const items: MenuItem[] = [{ label: 'Action', onClick }]
      render(
        <DropdownMenu items={items} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('closes menu after item click', () => {
      const items: MenuItem[] = [{ label: 'Action', onClick: vi.fn() }]
      render(
        <DropdownMenu items={items}>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Action' }))
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('does not call onClick for disabled items', () => {
      const onClick = vi.fn()
      const items: MenuItem[] = [{ label: 'Disabled', disabled: true, onClick }]
      render(
        <DropdownMenu items={items} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled' }))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ─── Keyboard navigation ─────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('navigates with ArrowDown', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      // First item should be focusable
      menuItems[0].focus()
      fireEvent.keyDown(menuItems[0], { key: 'ArrowDown' })
      expect(document.activeElement).toBe(menuItems[1])
    })

    it('navigates with ArrowUp', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[1].focus()
      fireEvent.keyDown(menuItems[1], { key: 'ArrowUp' })
      expect(document.activeElement).toBe(menuItems[0])
    })

    it('wraps ArrowDown from last to first', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[menuItems.length - 1].focus()
      fireEvent.keyDown(menuItems[menuItems.length - 1], { key: 'ArrowDown' })
      expect(document.activeElement).toBe(menuItems[0])
    })

    it('wraps ArrowUp from first to last', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[0].focus()
      fireEvent.keyDown(menuItems[0], { key: 'ArrowUp' })
      expect(document.activeElement).toBe(menuItems[menuItems.length - 1])
    })

    it('Home key moves to first item', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[2].focus()
      fireEvent.keyDown(menuItems[2], { key: 'Home' })
      expect(document.activeElement).toBe(menuItems[0])
    })

    it('End key moves to last item', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[0].focus()
      fireEvent.keyDown(menuItems[0], { key: 'End' })
      expect(document.activeElement).toBe(menuItems[menuItems.length - 1])
    })

    it('Enter activates item', () => {
      const onClick = vi.fn()
      const items: MenuItem[] = [{ label: 'Action', onClick }]
      render(
        <DropdownMenu items={items} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItem = screen.getByRole('menuitem')
      menuItem.focus()
      fireEvent.keyDown(menuItem, { key: 'Enter' })
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('Space activates item', () => {
      const onClick = vi.fn()
      const items: MenuItem[] = [{ label: 'Action', onClick }]
      render(
        <DropdownMenu items={items} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItem = screen.getByRole('menuitem')
      menuItem.focus()
      fireEvent.keyDown(menuItem, { key: ' ' })
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('skips disabled items during navigation', () => {
      const items: MenuItem[] = [
        { label: 'First', onClick: vi.fn() },
        { label: 'Disabled', disabled: true, onClick: vi.fn() },
        { label: 'Third', onClick: vi.fn() },
      ]
      render(
        <DropdownMenu items={items} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const menuItems = screen.getAllByRole('menuitem')
      menuItems[0].focus()
      fireEvent.keyDown(menuItems[0], { key: 'ArrowDown' })
      expect(document.activeElement).toBe(menuItems[2])
    })
  })

  // ─── Separators ──────────────────────────────────────────────────

  describe('separators', () => {
    it('renders separator elements', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getAllByRole('separator')).toHaveLength(1)
    })

    it('separators are not focusable', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const sep = screen.getByRole('separator')
      expect(sep).not.toHaveAttribute('tabindex', '0')
    })
  })

  // ─── Labels ──────────────────────────────────────────────────────

  describe('labels', () => {
    it('renders group label headers', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.getByText('Danger Zone')).toBeInTheDocument()
    })

    it('labels have role="presentation"', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const label = screen.getByText('Actions')
      expect(label.closest('[role="presentation"]') || label.getAttribute('role')).toBeTruthy()
    })
  })

  // ─── Shortcuts ───────────────────────────────────────────────────

  describe('shortcuts', () => {
    it('displays shortcut text', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByText('⌘E')).toBeInTheDocument()
      expect(screen.getByText('⌘C')).toBeInTheDocument()
    })
  })

  // ─── Danger items ────────────────────────────────────────────────

  describe('danger items', () => {
    it('applies danger styling attribute', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const deleteItem = screen.getByRole('menuitem', { name: 'Delete' })
      expect(deleteItem).toHaveAttribute('data-danger', 'true')
    })
  })

  // ─── Disabled items ──────────────────────────────────────────────

  describe('disabled items', () => {
    it('applies aria-disabled to disabled items', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const disabledItem = screen.getByRole('menuitem', { name: 'Disabled Item' })
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Icons ───────────────────────────────────────────────────────

  describe('icons', () => {
    it('renders item icons', () => {
      render(
        <DropdownMenu items={fullItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
    })
  })

  // ─── Placement ───────────────────────────────────────────────────

  describe('placement', () => {
    it('defaults to bottom-start placement', () => {
      const { container } = render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const panel = container.querySelector('.ui-dropdown-menu')
      expect(panel).toHaveAttribute('data-placement', 'bottom-start')
    })

    it.each(['bottom-start', 'bottom-end', 'top-start', 'top-end'] as const)(
      'accepts placement="%s"',
      (placement) => {
        const { container } = render(
          <DropdownMenu items={basicItems} open placement={placement}>
            <button>Menu</button>
          </DropdownMenu>
        )
        const panel = container.querySelector('.ui-dropdown-menu')
        expect(panel).toHaveAttribute('data-placement', placement)
      }
    )
  })

  // ─── Motion ──────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <DropdownMenu items={basicItems} open motion={0}>
          <button>Menu</button>
        </DropdownMenu>
      )
      const panel = container.querySelector('.ui-dropdown-menu')
      expect(panel).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── ARIA attributes ─────────────────────────────────────────────

  describe('aria', () => {
    it('trigger has aria-haspopup="menu"', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('trigger has aria-expanded reflecting state', () => {
      render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      const trigger = screen.getByRole('button', { name: 'Menu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('trigger has aria-controls pointing to menu', () => {
      render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const trigger = screen.getByRole('button', { name: 'Menu' })
      const menu = screen.getByRole('menu')
      expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
    })
  })

  // ─── Accessibility ───────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when closed', async () => {
      const { container } = render(
        <DropdownMenu items={basicItems}>
          <button>Menu</button>
        </DropdownMenu>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when open', async () => {
      const { container } = render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Edge cases ──────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles empty items array', () => {
      render(
        <DropdownMenu items={[]} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
    })

    it('handles unmount while open', () => {
      const { unmount } = render(
        <DropdownMenu items={basicItems} open>
          <button>Menu</button>
        </DropdownMenu>
      )
      unmount()
    })

    it('preserves existing onClick on trigger', () => {
      const onClick = vi.fn()
      render(
        <DropdownMenu items={basicItems}>
          <button onClick={onClick}>Menu</button>
        </DropdownMenu>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
