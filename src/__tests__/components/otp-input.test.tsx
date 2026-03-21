import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { OtpInput } from '../../components/otp-input'

expect.extend(toHaveNoViolations)

describe('OtpInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a group of input boxes', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      expect(container.querySelector('.ui-otp-input')).toBeInTheDocument()
    })

    it('applies ui-otp-input class', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      expect(container.querySelector('.ui-otp-input')).toBeInTheDocument()
    })

    it('renders 6 input boxes by default', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      const inputs = container.querySelectorAll('.ui-otp-input__digit')
      expect(inputs.length).toBe(6)
    })

    it('renders custom number of input boxes', () => {
      const { container } = render(<OtpInput aria-label="OTP code" length={4} />)
      const inputs = container.querySelectorAll('.ui-otp-input__digit')
      expect(inputs.length).toBe(4)
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      expect(container.querySelector('.ui-otp-input')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<OtpInput aria-label="OTP code" size="sm" />)
      expect(container.querySelector('.ui-otp-input')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<OtpInput aria-label="OTP code" size="lg" />)
      expect(container.querySelector('.ui-otp-input')).toHaveAttribute('data-size', 'lg')
    })

    it('sets inputmode="numeric" for number type', () => {
      const { container } = render(<OtpInput aria-label="OTP code" type="number" />)
      const inputs = container.querySelectorAll('.ui-otp-input__digit')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('inputmode', 'numeric')
      })
    })

    it('sets inputmode="text" for text type', () => {
      const { container } = render(<OtpInput aria-label="OTP code" type="text" />)
      const inputs = container.querySelectorAll('.ui-otp-input__digit')
      inputs.forEach(input => {
        expect(input).toHaveAttribute('inputmode', 'text')
      })
    })
  })

  // ─── Auto-advance tests ──────────────────────────────────────────

  describe('auto-advance', () => {
    it('advances focus to next box after typing a digit', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      fireEvent.change(inputs[0], { target: { value: '1' } })
      expect(document.activeElement).toBe(inputs[1])
    })

    it('does not advance past the last box', () => {
      const { container } = render(<OtpInput aria-label="OTP code" length={4} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      // Fill all boxes
      inputs.forEach((input, i) => {
        fireEvent.change(input, { target: { value: String(i + 1) } })
      })
      // Last input should remain focused (or stay at last)
      expect(document.activeElement).toBe(inputs[3])
    })
  })

  // ─── Backspace tests ──────────────────────────────────────────────

  describe('backspace', () => {
    it('clears current digit and moves back on backspace when empty', () => {
      const { container } = render(<OtpInput aria-label="OTP code" value="12" onChange={vi.fn()} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      inputs[2].focus()
      fireEvent.keyDown(inputs[2], { key: 'Backspace' })
      expect(document.activeElement).toBe(inputs[1])
    })

    it('clears current digit on backspace when it has a value', () => {
      const onChange = vi.fn()
      const { container } = render(<OtpInput aria-label="OTP code" value="123" onChange={onChange} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      inputs[2].focus()
      fireEvent.keyDown(inputs[2], { key: 'Backspace' })
      // Should clear the third digit
      expect(onChange).toHaveBeenCalled()
    })
  })

  // ─── Paste tests ──────────────────────────────────────────────────

  describe('paste', () => {
    it('fills all boxes on paste', () => {
      const onChange = vi.fn()
      const { container } = render(<OtpInput aria-label="OTP code" length={6} onChange={onChange} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      const clipboardData = { getData: () => '123456' }
      fireEvent.paste(inputs[0], { clipboardData })
      expect(onChange).toHaveBeenCalledWith('123456')
    })

    it('handles partial paste', () => {
      const onChange = vi.fn()
      const { container } = render(<OtpInput aria-label="OTP code" length={6} onChange={onChange} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      const clipboardData = { getData: () => '123' }
      fireEvent.paste(inputs[0], { clipboardData })
      expect(onChange).toHaveBeenCalledWith('123')
    })

    it('trims pasted content to max length', () => {
      const onChange = vi.fn()
      const { container } = render(<OtpInput aria-label="OTP code" length={4} onChange={onChange} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      const clipboardData = { getData: () => '123456' }
      fireEvent.paste(inputs[0], { clipboardData })
      expect(onChange).toHaveBeenCalledWith('1234')
    })
  })

  // ─── onComplete tests ─────────────────────────────────────────────

  describe('onComplete', () => {
    it('fires onComplete when all digits are filled', () => {
      const onComplete = vi.fn()
      const onChange = vi.fn()
      const { container } = render(
        <OtpInput aria-label="OTP code" length={4} onComplete={onComplete} onChange={onChange} />
      )
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      const clipboardData = { getData: () => '1234' }
      fireEvent.paste(inputs[0], { clipboardData })
      expect(onComplete).toHaveBeenCalledWith('1234')
    })

    it('does not fire onComplete when not all digits are filled', () => {
      const onComplete = vi.fn()
      const onChange = vi.fn()
      const { container } = render(
        <OtpInput aria-label="OTP code" length={6} onComplete={onComplete} onChange={onChange} />
      )
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')

      const clipboardData = { getData: () => '123' }
      fireEvent.paste(inputs[0], { clipboardData })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })

  // ─── Error state ──────────────────────────────────────────────────

  describe('error state', () => {
    it('sets data-invalid when error is provided', () => {
      const { container } = render(<OtpInput aria-label="OTP code" error="Invalid code" />)
      expect(container.querySelector('.ui-otp-input')).toHaveAttribute('data-invalid', '')
    })

    it('renders error message', () => {
      render(<OtpInput aria-label="OTP code" error="Invalid code" />)
      expect(screen.getByText('Invalid code')).toBeInTheDocument()
    })

    it('does not show error when not provided', () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      expect(container.querySelector('.ui-otp-input__error')).not.toBeInTheDocument()
    })
  })

  // ─── Disabled state ───────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables all input boxes when disabled', () => {
      const { container } = render(<OtpInput aria-label="OTP code" disabled />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')
      inputs.forEach(input => {
        expect(input).toBeDisabled()
      })
    })
  })

  // ─── Controlled mode ─────────────────────────────────────────────

  describe('controlled mode', () => {
    it('displays value in individual boxes', () => {
      const { container } = render(
        <OtpInput aria-label="OTP code" value="123" onChange={vi.fn()} length={6} />
      )
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
      expect(inputs[3]).toHaveValue('')
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<OtpInput ref={ref} aria-label="OTP code" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<OtpInput aria-label="OTP code" className="custom" />)
      expect(container.querySelector('.ui-otp-input')!.className).toContain('custom')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<OtpInput aria-label="OTP code" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with error', async () => {
      const { container } = render(<OtpInput aria-label="OTP code" error="Invalid" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('each input has appropriate label', () => {
      const { container } = render(<OtpInput aria-label="OTP code" length={4} />)
      const inputs = container.querySelectorAll<HTMLInputElement>('.ui-otp-input__digit')
      inputs.forEach((input, i) => {
        expect(input).toHaveAttribute('aria-label', `Digit ${i + 1} of 4`)
      })
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<OtpInput aria-label="OTP code" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-otp-input)', () => {
      render(<OtpInput aria-label="OTP code" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-otp-input)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "OtpInput"', () => {
      expect(OtpInput.displayName).toBe('OtpInput')
    })
  })
})
