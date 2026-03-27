import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FormInput } from '../../components/form-input'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

// ─── Helper: wrap FormInput in a Form with context ─────────────────────────

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

/** A definition with an email field for context integration tests */
const emailFormDef = createForm({
  fields: {
    email: { initial: '', validate: v.required('Email is required') },
  },
  onSubmit: vi.fn(),
})

/** A definition with a pre-filled field */
const prefilledFormDef = createForm({
  fields: {
    username: { initial: 'John' },
  },
  onSubmit: vi.fn(),
})

describe('FormInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders an input element with name attribute', () => {
      render(<FormInput name="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('name', 'email')
    })

    it('renders label with htmlFor association', () => {
      render(<FormInput name="email" label="Email" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Email')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })

    it('renders description text', () => {
      render(<FormInput name="email" description="Enter your email" />)
      expect(screen.getByText('Enter your email')).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(<FormInput name="email" error="Invalid email" />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    it('renders leading icon', () => {
      render(<FormInput name="search" icon={<svg data-testid="lead-icon" />} />)
      expect(screen.getByTestId('lead-icon')).toBeInTheDocument()
    })

    it('renders trailing icon', () => {
      render(<FormInput name="search" iconEnd={<svg data-testid="trail-icon" />} />)
      expect(screen.getByTestId('trail-icon')).toBeInTheDocument()
    })

    it('renders size sm', () => {
      const { container } = render(<FormInput name="test" size="sm" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-size', 'sm')
    })

    it('renders size md (default)', () => {
      const { container } = render(<FormInput name="test" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-size', 'md')
    })

    it('renders size lg', () => {
      const { container } = render(<FormInput name="test" size="lg" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-size', 'lg')
    })

    it('renders filled variant', () => {
      const { container } = render(<FormInput name="test" variant="filled" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-variant', 'filled')
    })

    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<FormInput ref={ref} name="email" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.tagName).toBe('INPUT')
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<FormInput name="test" className="custom-cls" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper.className).toContain('custom-cls')
    })

    it('forwards additional input attributes (placeholder, type, etc.)', () => {
      render(<FormInput name="pw" type="password" placeholder="Enter password" autoComplete="off" />)
      const input = screen.getByPlaceholderText('Enter password')
      expect(input).toHaveAttribute('type', 'password')
      expect(input).toHaveAttribute('autocomplete', 'off')
    })
  })

  // ─── Form context integration ──────────────────────────────────────

  describe('form context integration', () => {
    it('auto-reads value from form context when inside <Form>', () => {
      function TestForm() {
        const form = useForm(prefilledFormDef)
        return (
          <Form form={form}>
            <FormInput name="username" label="Username" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByRole('textbox')).toHaveValue('John')
    })

    it('auto-reads error from form context', () => {
      function TestForm() {
        const form = useForm(emailFormDef)
        return (
          <Form form={form}>
            <FormInput name="email" label="Email" />
            <button type="submit">Submit</button>
          </Form>
        )
      }
      render(<TestForm />)
      // Submit to trigger validation
      fireEvent.submit(screen.getByRole('textbox').closest('form')!)
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('auto-reads touched from form context (shows error only when touched)', () => {
      function TestForm() {
        const form = useForm(emailFormDef)
        return (
          <Form form={form}>
            <FormInput name="email" label="Email" />
          </Form>
        )
      }
      render(<TestForm />)
      // Before touch, no error should show even though value is empty
      expect(screen.queryByText('Email is required')).toBeNull()
    })

    it('onChange updates form value via context', async () => {
      const onSubmit = vi.fn()
      const def = createForm({
        fields: { name: { initial: '' } },
        onSubmit,
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <FormInput name="name" label="Name" />
          </Form>
        )
      }
      render(<TestForm />)
      await userEvent.type(screen.getByRole('textbox'), 'Alice')
      expect(screen.getByRole('textbox')).toHaveValue('Alice')
    })

    it('onBlur marks field as touched via context', async () => {
      const def = createForm({
        fields: {
          email: { initial: '', validate: v.required('Required') },
        },
        onSubmit: vi.fn(),
        validateOn: 'blur',
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <FormInput name="email" label="Email" />
            <button>Other</button>
          </Form>
        )
      }
      render(<TestForm />)
      const input = screen.getByRole('textbox')
      await userEvent.click(input)
      await userEvent.tab() // blur
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('explicit value prop overrides context value', () => {
      function TestForm() {
        const form = useForm(prefilledFormDef)
        return (
          <Form form={form}>
            <FormInput name="username" label="Username" value="Override" onChange={() => {}} />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByRole('textbox')).toHaveValue('Override')
    })

    it('explicit error prop overrides context error', () => {
      function TestForm() {
        const form = useForm(emailFormDef)
        return (
          <Form form={form}>
            <FormInput name="email" label="Email" error="Custom error" />
            <button type="submit">Submit</button>
          </Form>
        )
      }
      render(<TestForm />)
      // Even before submit, the explicit error should show
      expect(screen.getByText('Custom error')).toBeInTheDocument()
    })

    it('works standalone without form context', () => {
      render(<FormInput name="standalone" label="Standalone" value="hello" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('hello')
    })
  })

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
    it('onChange fires when typing', async () => {
      const handleChange = vi.fn()
      render(<FormInput name="test" onChange={handleChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'a')
      expect(handleChange).toHaveBeenCalled()
    })

    it('onBlur fires when losing focus', async () => {
      const handleBlur = vi.fn()
      render(
        <>
          <FormInput name="test" onBlur={handleBlur} />
          <button>Other</button>
        </>
      )
      await userEvent.click(screen.getByRole('textbox'))
      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('disabled prevents input', async () => {
      render(<FormInput name="test" disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })
  })

  // ─── Accessibility tests ───────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default state)', async () => {
      const { container } = render(<FormInput name="email" label="Email" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (error state)', async () => {
      const { container } = render(
        <FormInput name="email" label="Email" error="Invalid email" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (disabled state)', async () => {
      const { container } = render(
        <FormInput name="email" label="Email" disabled />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('label is associated with input via id', () => {
      render(<FormInput name="email" label="Email Address" />)
      const input = screen.getByRole('textbox')
      const id = input.getAttribute('id')
      expect(id).toBeTruthy()
      const label = screen.getByText('Email Address')
      expect(label).toHaveAttribute('for', id)
    })

    it('error is associated via aria-describedby', () => {
      render(<FormInput name="email" label="Email" error="Bad email" />)
      const input = screen.getByRole('textbox')
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const errorEl = document.getElementById(describedBy.split(' ').find(id => document.getElementById(id)?.textContent === 'Bad email')!)
      expect(errorEl).toHaveTextContent('Bad email')
    })

    it('description is associated via aria-describedby', () => {
      render(<FormInput name="email" label="Email" description="We will not share it" />)
      const input = screen.getByRole('textbox')
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const descEl = document.getElementById(describedBy.split(' ').find(id => document.getElementById(id)?.textContent === 'We will not share it')!)
      expect(descEl).toHaveTextContent('We will not share it')
    })

    it('aria-invalid set when error present', () => {
      render(<FormInput name="email" error="Bad" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('aria-invalid not set when no error', () => {
      render(<FormInput name="email" />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    })

    it('required attribute forwarded correctly', () => {
      render(<FormInput name="email" label="Email" required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })

  // ─── Style tests ──────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<FormInput name="test" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-form-input)', () => {
      render(<FormInput name="test" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-form-input)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(<FormInput name="test" error="Error" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-invalid', '')
    })

    it('no data-invalid attribute when no error', () => {
      const { container } = render(<FormInput name="test" />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).not.toHaveAttribute('data-invalid')
    })
  })

  // ─── Max length counter ───────────────────────────────────────────

  describe('maxLength counter', () => {
    it('renders counter with maxLength', () => {
      const { container } = render(
        <FormInput name="test" label="Test" maxLength={100} value="hello" onChange={() => {}} />
      )
      expect(container.querySelector('.ui-form-input__counter')).toHaveTextContent('5/100')
    })

    it('shows at-limit styling when value reaches maxLength', () => {
      const { container } = render(
        <FormInput name="test" label="Test" maxLength={5} value="hello" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-form-input__counter')!
      expect(counter).toHaveAttribute('data-at-limit', '')
    })

    it('does not show at-limit when under maxLength', () => {
      const { container } = render(
        <FormInput name="test" label="Test" maxLength={10} value="hi" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-form-input__counter')!
      expect(counter).not.toHaveAttribute('data-at-limit')
    })

    it('renders counter with showCount without maxLength', () => {
      const { container } = render(
        <FormInput name="test" label="Test" showCount value="hello" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-form-input__counter')!
      expect(counter).toHaveTextContent('5')
      expect(counter.textContent).not.toContain('/')
    })

    it('does not render counter without maxLength or showCount', () => {
      const { container } = render(
        <FormInput name="test" label="Test" value="hello" onChange={() => {}} />
      )
      expect(container.querySelector('.ui-form-input__counter')).toBeNull()
    })

    it('passes maxLength to the native input', () => {
      render(<FormInput name="test" maxLength={50} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '50')
    })
  })

  // ─── Clearable ──────────────────────────────────────────────────────

  describe('clearable', () => {
    it('shows clear button when clearable and has value', () => {
      render(
        <FormInput name="test" clearable value="hello" onChange={() => {}} />
      )
      expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument()
    })

    it('does not show clear button when clearable but no value', () => {
      render(
        <FormInput name="test" clearable value="" onChange={() => {}} />
      )
      expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull()
    })

    it('calls onClear when clear button is clicked', async () => {
      const onClear = vi.fn()
      render(
        <FormInput name="test" clearable onClear={onClear} value="hello" onChange={() => {}} />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Clear input' }))
      expect(onClear).toHaveBeenCalledOnce()
    })

    it('sets data-has-icon-end when clearable', () => {
      const { container } = render(
        <FormInput name="test" clearable value="" onChange={() => {}} />
      )
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper).toHaveAttribute('data-has-icon-end', '')
    })
  })

  // ─── Required indicator ─────────────────────────────────────────────

  describe('required', () => {
    it('shows required indicator after label', () => {
      const { container } = render(
        <FormInput name="test" label="Email" required />
      )
      const indicator = container.querySelector('.ui-form-input__required')!
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveTextContent('*')
      expect(indicator).toHaveAttribute('aria-hidden', 'true')
    })

    it('does not show required indicator when not required', () => {
      const { container } = render(
        <FormInput name="test" label="Email" />
      )
      expect(container.querySelector('.ui-form-input__required')).toBeNull()
    })

    it('sets native required attribute on input', () => {
      render(<FormInput name="test" label="Email" required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })

  // ─── classNames prop ──────────────────────────────────────────────

  describe('classNames', () => {
    it('applies classNames.root to the wrapper element', () => {
      const { container } = render(<FormInput name="test" classNames={{ root: 'custom-root' }} />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper.className).toContain('custom-root')
      expect(wrapper.className).toContain('ui-form-input')
    })

    it('applies classNames.label to the label element', () => {
      const { container } = render(
        <FormInput name="test" label="Email" classNames={{ label: 'custom-label' }} />
      )
      const label = container.querySelector('.ui-form-input__label')!
      expect(label.className).toContain('custom-label')
      expect(label.className).toContain('ui-form-input__label')
    })

    it('applies classNames.field to the input element', () => {
      const { container } = render(
        <FormInput name="test" classNames={{ field: 'custom-field' }} />
      )
      const input = container.querySelector('.ui-form-input__field')!
      expect(input.className).toContain('custom-field')
      expect(input.className).toContain('ui-form-input__field')
    })

    it('applies classNames.icon to the leading icon element', () => {
      const { container } = render(
        <FormInput name="test" icon={<svg />} classNames={{ icon: 'custom-icon' }} />
      )
      const icon = container.querySelector('.ui-form-input__icon')!
      expect(icon.className).toContain('custom-icon')
      expect(icon.className).toContain('ui-form-input__icon')
    })

    it('applies classNames.iconEnd to the trailing icon element', () => {
      const { container } = render(
        <FormInput name="test" iconEnd={<svg />} classNames={{ iconEnd: 'custom-icon-end' }} />
      )
      const iconEnd = container.querySelector('.ui-form-input__icon-end')!
      expect(iconEnd.className).toContain('custom-icon-end')
      expect(iconEnd.className).toContain('ui-form-input__icon-end')
    })

    it('applies classNames.description to the description element', () => {
      const { container } = render(
        <FormInput name="test" description="Help text" classNames={{ description: 'custom-desc' }} />
      )
      const desc = container.querySelector('.ui-form-input__description')!
      expect(desc.className).toContain('custom-desc')
      expect(desc.className).toContain('ui-form-input__description')
    })

    it('applies classNames.error to the error element', () => {
      const { container } = render(
        <FormInput name="test" error="Invalid" classNames={{ error: 'custom-error' }} />
      )
      const error = container.querySelector('.ui-form-input__error')!
      expect(error.className).toContain('custom-error')
      expect(error.className).toContain('ui-form-input__error')
    })

    it('merges classNames.root with className prop', () => {
      const { container } = render(
        <FormInput name="test" classNames={{ root: 'cn-root' }} className="class-prop" />
      )
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper.className).toContain('cn-root')
      expect(wrapper.className).toContain('class-prop')
    })

    it('handles undefined classNames gracefully', () => {
      const { container } = render(<FormInput name="test" classNames={undefined} />)
      const wrapper = container.querySelector('.ui-form-input')!
      expect(wrapper.className).toContain('ui-form-input')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "FormInput"', () => {
      expect(FormInput.displayName).toBe('FormInput')
    })
  })
})
