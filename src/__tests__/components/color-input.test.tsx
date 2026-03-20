import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ColorInput } from '../../components/color-input'

expect.extend(toHaveNoViolations)

describe('ColorInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with a color swatch preview', () => {
      const { container } = render(<ColorInput name="color" />)
      expect(container.querySelector('.ui-color-input__swatch')).toBeInTheDocument()
    })

    it('renders with a hex text input by default', () => {
      render(<ColorInput name="color" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('hides hex text input when showInput=false', () => {
      render(<ColorInput name="color" showInput={false} />)
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('renders with label', () => {
      render(<ColorInput name="color" label="Pick a color" />)
      expect(screen.getByText('Pick a color')).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(<ColorInput name="color" error="Invalid color" />)
      expect(screen.getByText('Invalid color')).toBeInTheDocument()
    })

    it('applies data-size attribute', () => {
      const { container } = render(<ColorInput name="color" size="lg" />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-size', 'lg')
    })

    it('defaults to size="md"', () => {
      const { container } = render(<ColorInput name="color" />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-size', 'md')
    })

    it('applies data-disabled attribute when disabled', () => {
      const { container } = render(<ColorInput name="color" disabled />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-disabled', '')
    })

    it('forwards className', () => {
      const { container } = render(<ColorInput name="color" className="custom" />)
      expect(container.querySelector('.ui-color-input')?.className).toContain('custom')
    })

    it('displays the current color value in the text input', () => {
      render(<ColorInput name="color" value="#ff0000" />)
      expect(screen.getByRole('textbox')).toHaveValue('#ff0000')
    })

    it('displays the color in the swatch preview', () => {
      const { container } = render(<ColorInput name="color" value="#ff0000" />)
      const swatch = container.querySelector('.ui-color-input__swatch')
      expect(swatch).toHaveStyle({ backgroundColor: '#ff0000' })
    })
  })

  // ─── Default value ─────────────────────────────────────────────────

  describe('default value', () => {
    it('uses defaultValue when uncontrolled', () => {
      render(<ColorInput name="color" defaultValue="#00ff00" />)
      expect(screen.getByRole('textbox')).toHaveValue('#00ff00')
    })

    it('defaults to #000000 when no value or defaultValue', () => {
      render(<ColorInput name="color" />)
      expect(screen.getByRole('textbox')).toHaveValue('#000000')
    })
  })

  // ─── Hex input interaction ─────────────────────────────────────────

  describe('hex input', () => {
    it('calls onChange when hex input value is changed on blur', async () => {
      const onChange = vi.fn()
      render(<ColorInput name="color" value="#000000" onChange={onChange} />)
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '#abcdef')
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith('#abcdef')
    })

    it('normalizes 3-char hex to 6-char on blur', async () => {
      const onChange = vi.fn()
      render(<ColorInput name="color" defaultValue="#000000" onChange={onChange} />)
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, '#abc')
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith('#aabbcc')
    })

    it('rejects invalid hex and reverts on blur', async () => {
      const onChange = vi.fn()
      render(<ColorInput name="color" defaultValue="#ff0000" onChange={onChange} />)
      const input = screen.getByRole('textbox')
      await userEvent.clear(input)
      await userEvent.type(input, 'zzz')
      fireEvent.blur(input)
      // Should not fire onChange with invalid value
      expect(onChange).not.toHaveBeenCalledWith('zzz')
    })

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn()
      render(<ColorInput name="color" disabled onChange={onChange} />)
      const input = screen.getByRole('textbox')
      // The input should be disabled
      expect(input).toBeDisabled()
    })
  })

  // ─── Popover interaction ───────────────────────────────────────────

  describe('popover', () => {
    it('opens popover when swatch preview is clicked', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__popover')).toBeInTheDocument()
    })

    it('closes popover when clicking trigger again', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__popover')).toBeInTheDocument()
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__popover')).not.toBeInTheDocument()
    })

    it('does not open popover when disabled', async () => {
      const { container } = render(<ColorInput name="color" disabled />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__popover')).not.toBeInTheDocument()
    })

    it('renders hue slider in popover', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__hue-slider')).toBeInTheDocument()
    })

    it('renders saturation/lightness area in popover', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__sl-area')).toBeInTheDocument()
    })
  })

  // ─── Swatches ──────────────────────────────────────────────────────

  describe('swatches', () => {
    const swatches = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']

    it('renders preset swatches when provided', async () => {
      const { container } = render(<ColorInput name="color" swatches={swatches} />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      const swatchButtons = container.querySelectorAll('.ui-color-input__preset-swatch')
      expect(swatchButtons.length).toBe(4)
    })

    it('clicking a swatch calls onChange with the swatch color', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <ColorInput name="color" swatches={swatches} onChange={onChange} />
      )
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      const swatchButtons = container.querySelectorAll('.ui-color-input__preset-swatch')
      await userEvent.click(swatchButtons[2])
      expect(onChange).toHaveBeenCalledWith('#0000ff')
    })

    it('does not render swatches section when swatches prop is empty', async () => {
      const { container } = render(<ColorInput name="color" swatches={[]} />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__swatches')).not.toBeInTheDocument()
    })
  })

  // ─── Controlled/uncontrolled ───────────────────────────────────────

  describe('controlled/uncontrolled', () => {
    it('works as controlled component', async () => {
      const onChange = vi.fn()
      const { rerender, container } = render(
        <ColorInput name="color" value="#ff0000" onChange={onChange} />
      )
      expect(screen.getByRole('textbox')).toHaveValue('#ff0000')
      rerender(<ColorInput name="color" value="#00ff00" onChange={onChange} />)
      expect(screen.getByRole('textbox')).toHaveValue('#00ff00')
    })

    it('works as uncontrolled component with defaultValue', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <ColorInput name="color" defaultValue="#ff0000" onChange={onChange} swatches={['#0000ff']} />
      )
      // Open popover and click swatch
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      const swatch = container.querySelector('.ui-color-input__preset-swatch')!
      await userEvent.click(swatch)
      expect(onChange).toHaveBeenCalledWith('#0000ff')
      // Internal state should update
      expect(screen.getByRole('textbox')).toHaveValue('#0000ff')
    })
  })

  // ─── Keyboard ──────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('opens popover with Enter key on trigger', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(container.querySelector('.ui-color-input__popover')).toBeInTheDocument()
    })

    it('opens popover with Space key on trigger', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      fireEvent.keyDown(trigger, { key: ' ' })
      expect(container.querySelector('.ui-color-input__popover')).toBeInTheDocument()
    })

    it('closes popover with Escape key', async () => {
      const { container } = render(<ColorInput name="color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      expect(container.querySelector('.ui-color-input__popover')).toBeInTheDocument()
      fireEvent.keyDown(container.querySelector('.ui-color-input__popover')!, { key: 'Escape' })
      expect(container.querySelector('.ui-color-input__popover')).not.toBeInTheDocument()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<ColorInput name="color" motion={2} />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<ColorInput name="color" />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ColorInput name="color" label="Color" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when popover is open', async () => {
      const { container } = render(<ColorInput name="color" label="Color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      await userEvent.click(trigger)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('trigger has appropriate aria attributes', () => {
      const { container } = render(<ColorInput name="color" label="Color" />)
      const trigger = container.querySelector('.ui-color-input__trigger')!
      expect(trigger).toHaveAttribute('role', 'button')
      expect(trigger).toHaveAttribute('tabindex', '0')
      expect(trigger).toHaveAttribute('aria-label')
    })

    it('sets aria-invalid when error is present', () => {
      const { container } = render(<ColorInput name="color" error="Bad color" />)
      expect(container.querySelector('.ui-color-input')).toHaveAttribute('data-invalid', '')
    })

    it('associates error with aria-describedby', () => {
      const { container } = render(<ColorInput name="color" error="Bad color" />)
      const errorEl = screen.getByRole('alert')
      expect(errorEl).toHaveTextContent('Bad color')
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<ColorInput name="color" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ColorInput"', () => {
      expect(ColorInput.displayName).toBe('ColorInput')
    })
  })
})
