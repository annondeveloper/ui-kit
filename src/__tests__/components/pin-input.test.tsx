import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PinInput } from '../../components/pin-input'

expect.extend(toHaveNoViolations)

describe('PinInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a group with role="group"', () => {
      render(<PinInput />)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('applies ui-pin-input class', () => {
      const { container } = render(<PinInput />)
      expect(container.firstElementChild?.className).toContain('ui-pin-input')
    })

    it('renders 4 digit inputs by default', () => {
      render(<PinInput />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(4)
    })

    it('renders custom length inputs', () => {
      render(<PinInput length={6} />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(6)
    })

    it('has aria-label on each digit', () => {
      render(<PinInput length={4} />)
      expect(screen.getByLabelText('PIN digit 1 of 4')).toBeInTheDocument()
      expect(screen.getByLabelText('PIN digit 4 of 4')).toBeInTheDocument()
    })

    it('applies default size="md"', () => {
      const { container } = render(<PinInput />)
      expect(container.firstElementChild).toHaveAttribute('data-size', 'md')
    })

    it('applies placeholder on empty inputs', () => {
      render(<PinInput placeholder="*" />)
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('placeholder', '*')
      })
    })
  })

  // ─── Masking ───────────────────────────────────────────────────────

  describe('masking', () => {
    it('sets data-masked on filled digit inputs when mask is true (default)', () => {
      render(<PinInput value="12" />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('data-masked', 'true')
      expect(inputs[1]).toHaveAttribute('data-masked', 'true')
      expect(inputs[2]).not.toHaveAttribute('data-masked')
    })

    it('does not set data-masked when mask is false', () => {
      render(<PinInput value="12" mask={false} />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).not.toHaveAttribute('data-masked')
      expect(inputs[1]).not.toHaveAttribute('data-masked')
    })
  })

  // ─── Value / onChange ──────────────────────────────────────────────

  describe('value and onChange', () => {
    it('displays controlled value across inputs', () => {
      render(<PinInput value="1234" />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
      expect(inputs[3]).toHaveValue('4')
    })

    it('calls onChange when a digit is entered', async () => {
      const onChange = vi.fn()
      render(<PinInput onChange={onChange} />)
      const inputs = screen.getAllByRole('textbox')
      await userEvent.type(inputs[0], '5')
      expect(onChange).toHaveBeenCalledWith('5')
    })

    it('calls onComplete when all digits filled', async () => {
      const onComplete = vi.fn()
      const onChange = vi.fn()
      render(<PinInput length={2} onChange={onChange} onComplete={onComplete} />)
      const inputs = screen.getAllByRole('textbox')
      await userEvent.type(inputs[0], '1')
      await userEvent.type(inputs[1], '2')
      expect(onComplete).toHaveBeenCalledWith('12')
    })
  })

  // ─── Type filtering ───────────────────────────────────────────────

  describe('type filtering', () => {
    it('only accepts digits when type="number"', async () => {
      const onChange = vi.fn()
      render(<PinInput type="number" onChange={onChange} />)
      const inputs = screen.getAllByRole('textbox')
      await userEvent.type(inputs[0], 'a')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('sets inputMode="numeric" when type="number"', () => {
      render(<PinInput type="number" />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('inputmode', 'numeric')
    })

    it('sets inputMode="text" when type="alphanumeric"', () => {
      render(<PinInput type="alphanumeric" />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('inputmode', 'text')
    })
  })

  // ─── Error state ──────────────────────────────────────────────────

  describe('error', () => {
    it('sets data-error when error is true', () => {
      const { container } = render(<PinInput error />)
      expect(container.firstElementChild).toHaveAttribute('data-error', '')
    })

    it('sets aria-invalid on inputs when error is true', () => {
      render(<PinInput error />)
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('does not set data-error when error is false', () => {
      const { container } = render(<PinInput />)
      expect(container.firstElementChild).not.toHaveAttribute('data-error')
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('disables all inputs when disabled is true', () => {
      render(<PinInput disabled />)
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })
  })

  // ─── oneTimeCode ──────────────────────────────────────────────────

  describe('oneTimeCode', () => {
    it('sets autoComplete="one-time-code" when oneTimeCode is true', () => {
      render(<PinInput oneTimeCode />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code')
    })

    it('sets autoComplete="off" by default', () => {
      render(<PinInput />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveAttribute('autocomplete', 'off')
    })
  })

  // ─── Paste support ────────────────────────────────────────────────

  describe('paste', () => {
    it('handles paste of full PIN', () => {
      const onChange = vi.fn()
      render(<PinInput length={4} onChange={onChange} />)
      const inputs = screen.getAllByRole('textbox')
      fireEvent.paste(inputs[0], {
        clipboardData: { getData: () => '1234' }
      })
      expect(onChange).toHaveBeenCalledWith('1234')
    })

    it('rejects non-numeric paste when type="number"', () => {
      const onChange = vi.fn()
      render(<PinInput length={4} type="number" onChange={onChange} />)
      const inputs = screen.getAllByRole('textbox')
      fireEvent.paste(inputs[0], {
        clipboardData: { getData: () => 'abcd' }
      })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Ref & className ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<PinInput ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('merges custom className', () => {
      const { container } = render(<PinInput className="custom" />)
      expect(container.firstElementChild?.className).toContain('ui-pin-input')
      expect(container.firstElementChild?.className).toContain('custom')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<PinInput />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<PinInput />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-pin-input)', () => {
      render(<PinInput />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-pin-input)')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "PinInput"', () => {
      expect(PinInput.displayName).toBe('PinInput')
    })
  })
})
