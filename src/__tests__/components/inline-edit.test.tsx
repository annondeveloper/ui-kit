import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { InlineEdit } from '../../components/inline-edit'

expect.extend(toHaveNoViolations)

describe('InlineEdit', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Display mode ──────────────────────────────────────────────────

  describe('display mode', () => {
    it('renders text content in display mode', () => {
      render(<InlineEdit value="Hello World" onChange={() => {}} />)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders placeholder when value is empty', () => {
      render(<InlineEdit value="" onChange={() => {}} placeholder="Click to edit" />)
      expect(screen.getByText('Click to edit')).toBeInTheDocument()
    })

    it('does not show an input in display mode', () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('has a pencil icon indicator', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      expect(container.querySelector('.ui-inline-edit__icon')).toBeInTheDocument()
    })

    it('renders with default size="md"', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} size="sm" />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} size="lg" />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-size', 'lg')
    })

    it('forwards className', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} className="custom" />)
      expect(container.querySelector('.ui-inline-edit')?.className).toContain('custom')
    })
  })

  // ─── Click to enter edit mode ──────────────────────────────────────

  describe('entering edit mode', () => {
    it('enters edit mode on click (default trigger)', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('enters edit mode on double-click when editTrigger="dblclick"', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} editTrigger="dblclick" />)
      // Single click should NOT enter edit mode
      await userEvent.click(screen.getByText('Hello'))
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      // Double click should
      await userEvent.dblClick(screen.getByText('Hello'))
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('does not enter edit mode when disabled', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} disabled />)
      await userEvent.click(screen.getByText('Hello'))
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('focuses the input when entering edit mode', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('selects input text when entering edit mode', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(5)
    })

    it('populates input with current value', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      expect(screen.getByRole('textbox')).toHaveValue('Hello')
    })
  })

  // ─── Typing in edit mode ───────────────────────────────────────────

  describe('typing', () => {
    it('allows typing in edit mode', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'New Value')
      expect(input).toHaveValue('New Value')
    })
  })

  // ─── Enter saves ───────────────────────────────────────────────────

  describe('saving with Enter', () => {
    it('saves value on Enter key press', async () => {
      const onChange = vi.fn()
      const onSave = vi.fn()
      render(<InlineEdit value="Hello" onChange={onChange} onSave={onSave} />)
      await userEvent.click(screen.getByText('Hello'))
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'Updated')
      await userEvent.keyboard('{Enter}')
      expect(onChange).toHaveBeenCalledWith('Updated')
      expect(onSave).toHaveBeenCalledWith('Updated')
    })

    it('exits edit mode after save', async () => {
      const onChange = vi.fn()
      render(<InlineEdit value="Hello" onChange={onChange} />)
      await userEvent.click(screen.getByText('Hello'))
      await userEvent.keyboard('{Enter}')
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  // ─── Escape cancels ────────────────────────────────────────────────

  describe('canceling with Escape', () => {
    it('cancels edit on Escape key', async () => {
      const onChange = vi.fn()
      const onCancel = vi.fn()
      render(<InlineEdit value="Hello" onChange={onChange} onCancel={onCancel} />)
      await userEvent.click(screen.getByText('Hello'))
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'garbage')
      await userEvent.keyboard('{Escape}')
      // Should NOT call onChange with the garbage
      expect(onChange).not.toHaveBeenCalled()
      expect(onCancel).toHaveBeenCalled()
    })

    it('reverts to original value on cancel', async () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      await userEvent.click(screen.getByText('Hello'))
      await userEvent.keyboard('{Escape}')
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  // ─── Blur saves ────────────────────────────────────────────────────

  describe('blur behavior', () => {
    it('saves on blur', async () => {
      const onChange = vi.fn()
      render(<InlineEdit value="Hello" onChange={onChange} />)
      await userEvent.click(screen.getByText('Hello'))
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'Blurred')
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith('Blurred')
    })
  })

  // ─── Multiline ─────────────────────────────────────────────────────

  describe('multiline', () => {
    it('uses textarea when multiline is true', async () => {
      const { container } = render(<InlineEdit value="Line 1\nLine 2" onChange={() => {}} multiline />)
      const display = container.querySelector('.ui-inline-edit__display')!
      await userEvent.click(display)
      const textarea = container.querySelector('textarea')
      expect(textarea).toBeInTheDocument()
    })

    it('Ctrl+Enter saves in multiline mode', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <InlineEdit value="Hello" onChange={onChange} multiline />
      )
      const display = container.querySelector('.ui-inline-edit__display')!
      await userEvent.click(display)
      const textarea = container.querySelector('textarea')!
      await userEvent.clear(textarea)
      await userEvent.type(textarea, 'New text')
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
      expect(onChange).toHaveBeenCalledWith('New text')
    })

    it('Enter alone does NOT save in multiline mode (adds newline)', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <InlineEdit value="Hello" onChange={onChange} multiline />
      )
      const display = container.querySelector('.ui-inline-edit__display')!
      await userEvent.click(display)
      const textarea = container.querySelector('textarea')!
      // Just pressing Enter should not save
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('applies data-disabled attribute', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} disabled />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-disabled', '')
    })

    it('does not show pencil icon when disabled', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} disabled />)
      expect(container.querySelector('.ui-inline-edit__icon')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} motion={2} />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      expect(container.querySelector('.ui-inline-edit')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations in display mode', async () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations in edit mode', async () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      const display = container.querySelector('.ui-inline-edit__display')!
      await userEvent.click(display)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('display element is focusable via tabindex', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      const display = container.querySelector('.ui-inline-edit__display')!
      expect(display).toHaveAttribute('tabindex', '0')
    })

    it('display element has role="button"', () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      const display = container.querySelector('.ui-inline-edit__display')!
      expect(display).toHaveAttribute('role', 'button')
    })

    it('display enters edit mode on Enter key', async () => {
      const { container } = render(<InlineEdit value="Hello" onChange={() => {}} />)
      const display = container.querySelector('.ui-inline-edit__display')!
      fireEvent.keyDown(display, { key: 'Enter' })
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<InlineEdit value="Hello" onChange={() => {}} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "InlineEdit"', () => {
      expect(InlineEdit.displayName).toBe('InlineEdit')
    })
  })
})
