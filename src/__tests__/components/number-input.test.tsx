import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NumberInput } from '../../components/number-input'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

// ─── Helper: wrap NumberInput in a Form with context ─────────────────────────

function FormWrapper({
  children,
  definition,
}: {
  children: React.ReactNode
  definition: ReturnType<typeof createForm>
}) {
  const form = useForm(definition)
  return <Form form={form}>{children}</Form>
}

describe('NumberInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders an input element with spinbutton role', () => {
      render(<NumberInput name="qty" />)
      const input = screen.getByRole('spinbutton')
      expect(input).toBeInTheDocument()
    })

    it('renders label with htmlFor association', () => {
      render(<NumberInput name="qty" label="Quantity" />)
      const input = screen.getByRole('spinbutton')
      const label = screen.getByText('Quantity')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })

    it('renders description text', () => {
      render(<NumberInput name="qty" description="Enter quantity" />)
      expect(screen.getByText('Enter quantity')).toBeInTheDocument()
    })

    it('renders error message with role="alert"', () => {
      render(<NumberInput name="qty" error="Invalid" />)
      const err = screen.getByText('Invalid')
      expect(err).toBeInTheDocument()
      expect(err).toHaveAttribute('role', 'alert')
    })

    it('renders increment and decrement buttons by default', () => {
      render(<NumberInput name="qty" />)
      expect(screen.getByLabelText('Increment')).toBeInTheDocument()
      expect(screen.getByLabelText('Decrement')).toBeInTheDocument()
    })

    it('hides controls when hideControls is true', () => {
      render(<NumberInput name="qty" hideControls />)
      expect(screen.queryByLabelText('Increment')).toBeNull()
      expect(screen.queryByLabelText('Decrement')).toBeNull()
    })

    it('renders size data attribute', () => {
      const { container } = render(<NumberInput name="qty" size="lg" />)
      const wrapper = container.querySelector('.ui-number-input')!
      expect(wrapper).toHaveAttribute('data-size', 'lg')
    })

    it('renders default size md', () => {
      const { container } = render(<NumberInput name="qty" />)
      const wrapper = container.querySelector('.ui-number-input')!
      expect(wrapper).toHaveAttribute('data-size', 'md')
    })

    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<NumberInput ref={ref} name="qty" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<NumberInput name="qty" className="custom" />)
      const wrapper = container.querySelector('.ui-number-input')!
      expect(wrapper.className).toContain('custom')
    })

    it('renders placeholder text', () => {
      render(<NumberInput name="qty" placeholder="0" />)
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      const { container } = render(<NumberInput name="qty" label="Qty" required />)
      const indicator = container.querySelector('.ui-number-input__required')!
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveTextContent('*')
    })
  })

  // ─── Value handling ────────────────────────────────────────────────

  describe('value handling', () => {
    it('renders controlled value', () => {
      render(<NumberInput name="qty" value={42} />)
      // When not focused, displays formatted value
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '42')
    })

    it('renders defaultValue for uncontrolled', () => {
      render(<NumberInput name="qty" defaultValue={10} />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '10')
    })

    it('calls onChange with new value on increment', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Increment'))
      expect(onChange).toHaveBeenCalledWith(6)
    })

    it('calls onChange with new value on decrement', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Decrement'))
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('respects step prop', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={10} step={5} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Increment'))
      expect(onChange).toHaveBeenCalledWith(15)
    })

    it('clamps to max on increment', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={9} max={10} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Increment'))
      expect(onChange).toHaveBeenCalledWith(10)
    })

    it('clamps to min on decrement', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={1} min={0} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Decrement'))
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('disallows negative when allowNegative=false', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={0} allowNegative={false} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Decrement'))
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('applies precision', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={1.0} step={0.1} precision={2} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText('Increment'))
      expect(onChange).toHaveBeenCalledWith(1.1)
    })

    it('renders null value as empty', () => {
      render(<NumberInput name="qty" value={null} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveValue('')
    })
  })

  // ─── Keyboard interaction ──────────────────────────────────────────

  describe('keyboard interaction', () => {
    it('ArrowUp increments value', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} onChange={onChange} />)
      const input = screen.getByRole('spinbutton')
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(onChange).toHaveBeenCalledWith(6)
    })

    it('ArrowDown decrements value', async () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} onChange={onChange} />)
      const input = screen.getByRole('spinbutton')
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('Shift+ArrowUp increments by 10x step', () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} step={1} onChange={onChange} />)
      const input = screen.getByRole('spinbutton')
      fireEvent.keyDown(input, { key: 'ArrowUp', shiftKey: true })
      expect(onChange).toHaveBeenCalledWith(15)
    })

    it('does not increment when readOnly', () => {
      const onChange = vi.fn()
      render(<NumberInput name="qty" value={5} readOnly onChange={onChange} />)
      const input = screen.getByRole('spinbutton')
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Disabled state ────────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables the input', () => {
      render(<NumberInput name="qty" disabled />)
      expect(screen.getByRole('spinbutton')).toBeDisabled()
    })

    it('sets data-disabled on wrapper', () => {
      const { container } = render(<NumberInput name="qty" disabled />)
      expect(container.querySelector('.ui-number-input')).toHaveAttribute('data-disabled', '')
    })
  })

  // ─── Form context integration ──────────────────────────────────────

  describe('form context integration', () => {
    it('reads value from form context', () => {
      const def = createForm({
        fields: { qty: { initial: 42 } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <NumberInput name="qty" label="Quantity" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '42')
    })

    it('works standalone without form context', () => {
      render(<NumberInput name="qty" value={7} />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '7')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default state)', async () => {
      const { container } = render(<NumberInput name="qty" label="Quantity" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (error state)', async () => {
      const { container } = render(<NumberInput name="qty" label="Quantity" error="Invalid" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('aria-invalid set when error present', () => {
      render(<NumberInput name="qty" error="Bad" />)
      expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true')
    })

    it('aria-valuemin and aria-valuemax set', () => {
      render(<NumberInput name="qty" min={0} max={100} />)
      const input = screen.getByRole('spinbutton')
      expect(input).toHaveAttribute('aria-valuemin', '0')
      expect(input).toHaveAttribute('aria-valuemax', '100')
    })

    it('error is associated via aria-describedby', () => {
      render(<NumberInput name="qty" label="Qty" error="Bad value" />)
      const input = screen.getByRole('spinbutton')
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const errorEl = document.getElementById(describedBy)
      expect(errorEl).toHaveTextContent('Bad value')
    })
  })

  // ─── Styles ────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<NumberInput name="qty" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-number-input)', () => {
      render(<NumberInput name="qty" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-number-input)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(<NumberInput name="qty" error="Error" />)
      expect(container.querySelector('.ui-number-input')).toHaveAttribute('data-invalid', '')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "NumberInput"', () => {
      expect(NumberInput.displayName).toBe('NumberInput')
    })
  })
})
