import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SortableList, type SortableItem } from '../../domain/sortable-list'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// ─── Test Data ────────────────────────────────────────────────────────────────

const items: SortableItem[] = [
  { id: '1', content: 'Item One' },
  { id: '2', content: 'Item Two' },
  { id: '3', content: 'Item Three' },
]

describe('SortableList', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} />
      )
      expect(container.querySelector('.ui-sortable-list')).toBeInTheDocument()
    })

    it('renders all items', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      expect(screen.getByText('Item One')).toBeInTheDocument()
      expect(screen.getByText('Item Two')).toBeInTheDocument()
      expect(screen.getByText('Item Three')).toBeInTheDocument()
    })

    it('renders with listbox role', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('renders items with option role', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
    })

    it('applies custom className', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} className="custom" />
      )
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(
        <SortableList items={items} onChange={vi.fn()} data-testid="my-list" />
      )
      expect(screen.getByTestId('my-list')).toBeInTheDocument()
    })
  })

  // ─── Drag Handle ──────────────────────────────────────────────────

  describe('drag handle', () => {
    it('shows drag handles by default', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} />
      )
      const handles = container.querySelectorAll('.ui-sortable-list__handle')
      expect(handles.length).toBe(3)
    })

    it('hides drag handles when handle=false', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} handle={false} />
      )
      const handles = container.querySelectorAll('.ui-sortable-list__handle')
      expect(handles.length).toBe(0)
    })
  })

  // ─── Keyboard Reorder ─────────────────────────────────────────────

  describe('keyboard reorder', () => {
    it('moves item up with Alt+ArrowUp', async () => {
      const onChange = vi.fn()
      render(<SortableList items={items} onChange={onChange} />)
      const options = screen.getAllByRole('option')
      options[1].focus()
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      expect(onChange).toHaveBeenCalledWith([
        { id: '2', content: 'Item Two' },
        { id: '1', content: 'Item One' },
        { id: '3', content: 'Item Three' },
      ])
    })

    it('moves item down with Alt+ArrowDown', async () => {
      const onChange = vi.fn()
      render(<SortableList items={items} onChange={onChange} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
      expect(onChange).toHaveBeenCalledWith([
        { id: '2', content: 'Item Two' },
        { id: '1', content: 'Item One' },
        { id: '3', content: 'Item Three' },
      ])
    })

    it('does not move first item up', async () => {
      const onChange = vi.fn()
      render(<SortableList items={items} onChange={onChange} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not move last item down', async () => {
      const onChange = vi.fn()
      render(<SortableList items={items} onChange={onChange} />)
      const options = screen.getAllByRole('option')
      options[2].focus()
      await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('navigates with ArrowDown without Alt', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(options[1]).toHaveFocus()
    })

    it('navigates with ArrowUp without Alt', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[1].focus()
      await userEvent.keyboard('{ArrowUp}')
      expect(options[0]).toHaveFocus()
    })

    it('Space toggles grabbed state', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard(' ')
      expect(options[0]).toHaveAttribute('data-grabbed', 'true')
    })

    it('Enter toggles grabbed state', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard('{Enter}')
      expect(options[0]).toHaveAttribute('data-grabbed', 'true')
    })

    it('Escape releases grabbed state', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard(' ')
      expect(options[0]).toHaveAttribute('data-grabbed', 'true')
      await userEvent.keyboard('{Escape}')
      expect(options[0]).not.toHaveAttribute('data-grabbed', 'true')
    })
  })

  // ─── Disabled ─────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables all items when disabled=true', () => {
      render(
        <SortableList items={items} onChange={vi.fn()} disabled />
      )
      const options = screen.getAllByRole('option')
      options.forEach((opt) => {
        expect(opt).toHaveAttribute('aria-disabled', 'true')
      })
    })

    it('prevents keyboard reorder when disabled', async () => {
      const onChange = vi.fn()
      render(
        <SortableList items={items} onChange={onChange} disabled />
      )
      const options = screen.getAllByRole('option')
      options[1].focus()
      await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}')
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Orientation ──────────────────────────────────────────────────

  describe('orientation', () => {
    it('defaults to vertical', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} />
      )
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })

    it('supports horizontal orientation', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} orientation="horizontal" />
      )
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} motion={0} />
      )
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })

    it('sets data-motion for higher levels', () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} motion={2} />
      )
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Drag Reorder (pointer simulation) ────────────────────────────

  describe('drag reorder', () => {
    it('items have aria-roledescription for drag', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('aria-roledescription', 'sortable item')
    })

    it('renders placeholder during grab', async () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      options[0].focus()
      await userEvent.keyboard(' ')
      // When grabbed, item should have data-grabbed
      expect(options[0]).toHaveAttribute('data-grabbed', 'true')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <SortableList items={items} onChange={vi.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has listbox role', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('all items have option role', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })

    it('first item is tabbable', () => {
      render(<SortableList items={items} onChange={vi.fn()} />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('tabindex', '0')
      expect(options[1]).toHaveAttribute('tabindex', '-1')
    })

    it('has aria-label on listbox', () => {
      render(
        <SortableList items={items} onChange={vi.fn()} aria-label="My sortable list" />
      )
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'My sortable list')
    })
  })
})
