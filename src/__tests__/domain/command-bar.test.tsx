import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { CommandBar, type CommandItem } from '../../domain/command-bar'

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

const sampleItems: CommandItem[] = [
  { id: '1', label: 'New File', description: 'Create a new file', shortcut: ['Ctrl', 'N'], section: 'File', onSelect: vi.fn(), keywords: ['create'] },
  { id: '2', label: 'Open File', description: 'Open existing file', shortcut: ['Ctrl', 'O'], section: 'File', onSelect: vi.fn() },
  { id: '3', label: 'Save', shortcut: ['Ctrl', 'S'], section: 'File', onSelect: vi.fn() },
  { id: '4', label: 'Toggle Sidebar', section: 'View', onSelect: vi.fn() },
  { id: '5', label: 'Zoom In', shortcut: ['Ctrl', '+'], section: 'View', onSelect: vi.fn() },
  { id: '6', label: 'Zoom Out', shortcut: ['Ctrl', '-'], section: 'View', onSelect: vi.fn() },
  { id: '7', label: 'Settings', description: 'Open preferences', onSelect: vi.fn(), keywords: ['preferences', 'config'] },
  { id: 'dis', label: 'Disabled Action', onSelect: vi.fn(), disabled: true },
]

function Wrapper({
  items = sampleItems,
  shortcut,
  ...rest
}: Partial<React.ComponentProps<typeof CommandBar>> & { items?: CommandItem[] }) {
  const [open, setOpen] = useState(rest.open ?? false)
  return (
    <CommandBar
      items={items}
      open={open}
      onOpenChange={setOpen}
      shortcut={shortcut}
      {...rest}
    />
  )
}

describe('CommandBar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a dialog element', () => {
      const { container } = render(<Wrapper open />)
      expect(container.querySelector('dialog')).toBeInTheDocument()
    })

    it('has ui-command-bar scope class', () => {
      const { container } = render(<Wrapper open />)
      expect(container.querySelector('.ui-command-bar')).toBeInTheDocument()
    })

    it('renders search input with placeholder', () => {
      render(<Wrapper open />)
      expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
    })

    it('renders custom placeholder', () => {
      render(<Wrapper open placeholder="Search actions..." />)
      expect(screen.getByPlaceholderText('Search actions...')).toBeInTheDocument()
    })

    it('renders items when open', () => {
      render(<Wrapper open />)
      expect(screen.getByText('New File')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })

    it('does not show content when closed', () => {
      render(<Wrapper open={false} />)
      // Dialog exists but not open
      expect(screen.queryByPlaceholderText('Type a command...')).not.toBeInTheDocument()
    })
  })

  // ─── Open / Close ─────────────────────────────────────────────────

  describe('open/close', () => {
    it('opens dialog when open prop is true', () => {
      render(<Wrapper open />)
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('closes on Escape', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandBar items={sampleItems} open onOpenChange={onOpenChange} />
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // ─── Global keyboard shortcut ─────────────────────────────────────

  describe('keyboard shortcut', () => {
    it('opens on Ctrl+K / Meta+K', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandBar items={sampleItems} open={false} onOpenChange={onOpenChange} />
      )
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('opens on Ctrl+K', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandBar items={sampleItems} open={false} onOpenChange={onOpenChange} />
      )
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('respects custom shortcut', () => {
      const onOpenChange = vi.fn()
      render(
        <CommandBar
          items={sampleItems}
          open={false}
          onOpenChange={onOpenChange}
          shortcut={['Shift', 'P']}
        />
      )
      // Default Cmd+K should not open
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      expect(onOpenChange).not.toHaveBeenCalled()
      // Custom shortcut should
      fireEvent.keyDown(document, { key: 'P', shiftKey: true })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  // ─── Search / Fuzzy match ─────────────────────────────────────────

  describe('search', () => {
    it('filters items based on search query', async () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'zoom')
      expect(screen.getByText('Zoom In')).toBeInTheDocument()
      expect(screen.getByText('Zoom Out')).toBeInTheDocument()
      expect(screen.queryByText('New File')).not.toBeInTheDocument()
    })

    it('fuzzy matches characters in order', async () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'nf')
      // "nf" should match "New File" (n...f)
      expect(screen.getByText('New File')).toBeInTheDocument()
    })

    it('searches keywords too', async () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'config')
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('searches description', async () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'preferences')
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('shows empty state when no results', async () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'xyznonexistent')
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })

    it('shows custom empty message', async () => {
      render(<Wrapper open emptyMessage="Nothing here!" />)
      const input = screen.getByPlaceholderText('Type a command...')
      await userEvent.type(input, 'xyznonexistent')
      expect(screen.getByText('Nothing here!')).toBeInTheDocument()
    })
  })

  // ─── Sections ─────────────────────────────────────────────────────

  describe('sections', () => {
    it('renders section headers', () => {
      render(<Wrapper open />)
      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()
    })

    it('groups items under sections', () => {
      const { container } = render(<Wrapper open />)
      const sections = container.querySelectorAll('.ui-command-bar__section')
      expect(sections.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── Keyboard navigation ──────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('navigates with ArrowDown', () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      // First item should be active initially
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      // Check that data-active moves
      const options = screen.getAllByRole('option')
      // At least second enabled option should have data-active
      const activeOptions = options.filter(o => o.hasAttribute('data-active'))
      expect(activeOptions.length).toBe(1)
    })

    it('navigates with ArrowUp', () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      // Move down twice then up
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      const options = screen.getAllByRole('option')
      const activeOptions = options.filter(o => o.hasAttribute('data-active'))
      expect(activeOptions.length).toBe(1)
    })

    it('selects item with Enter', () => {
      render(<Wrapper open />)
      const input = screen.getByPlaceholderText('Type a command...')
      fireEvent.keyDown(input, { key: 'Enter' })
      // First non-disabled item should be selected
      const firstItem = sampleItems.find(i => !i.disabled)!
      expect(firstItem.onSelect).toHaveBeenCalled()
    })

    it('skips disabled items during navigation', () => {
      const items: CommandItem[] = [
        { id: 'a', label: 'First', onSelect: vi.fn() },
        { id: 'b', label: 'Disabled', onSelect: vi.fn(), disabled: true },
        { id: 'c', label: 'Third', onSelect: vi.fn() },
      ]
      render(<Wrapper items={items} open />)
      const input = screen.getByPlaceholderText('Type a command...')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      fireEvent.keyDown(input, { key: 'Enter' })
      // Should skip "Disabled" and select "Third"
      expect(items[2].onSelect).toHaveBeenCalled()
    })
  })

  // ─── Shortcut badges ──────────────────────────────────────────────

  describe('shortcut badges', () => {
    it('displays keyboard shortcuts', () => {
      render(<Wrapper open />)
      // Look for shortcut keys rendered as kbd elements
      expect(screen.getAllByText('Ctrl').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('N').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Recent items ─────────────────────────────────────────────────

  describe('recent items', () => {
    it('shows recently selected items in Recent section', () => {
      const onOpenChange = vi.fn()
      const { rerender } = render(
        <CommandBar items={sampleItems} open onOpenChange={onOpenChange} />
      )
      const input = screen.getByPlaceholderText('Type a command...')
      // Select the first item
      fireEvent.keyDown(input, { key: 'Enter' })
      // Reopen
      rerender(
        <CommandBar items={sampleItems} open onOpenChange={onOpenChange} />
      )
      expect(screen.getByText('Recent')).toBeInTheDocument()
    })
  })

  // ─── Disabled items ───────────────────────────────────────────────

  describe('disabled items', () => {
    it('renders disabled items with aria-disabled', () => {
      render(<Wrapper open />)
      const disabledItem = screen.getByText('Disabled Action').closest('[role="option"]')
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onSelect for disabled items', () => {
      render(<Wrapper open />)
      const disabledItem = screen.getByText('Disabled Action')
      fireEvent.click(disabledItem)
      const item = sampleItems.find(i => i.id === 'dis')!
      expect(item.onSelect).not.toHaveBeenCalled()
    })
  })

  // ─── Description ──────────────────────────────────────────────────

  describe('description', () => {
    it('renders item descriptions', () => {
      render(<Wrapper open />)
      expect(screen.getAllByText('Create a new file').length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('input has role="combobox"', () => {
      render(<Wrapper open />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('has aria-activedescendant on the input', () => {
      render(<Wrapper open />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-activedescendant')
    })

    it('listbox has role="listbox"', () => {
      render(<Wrapper open />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('items have role="option"', () => {
      render(<Wrapper open />)
      const options = screen.getAllByRole('option')
      expect(options.length).toBeGreaterThanOrEqual(sampleItems.length)
    })

    it('has no axe violations', async () => {
      const { container } = render(<Wrapper open />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion on the dialog', () => {
      const { container } = render(<Wrapper open motion={0} />)
      const dialog = container.querySelector('dialog')
      expect(dialog).toHaveAttribute('data-motion', '0')
    })
  })
})
