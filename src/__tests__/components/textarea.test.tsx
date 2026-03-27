import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Textarea } from '../../components/textarea'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

describe('Textarea', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a textarea element', () => {
      render(<Textarea name="bio" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('renders label with htmlFor association', () => {
      render(<Textarea name="bio" label="Biography" />)
      const textarea = screen.getByRole('textbox')
      const label = screen.getByText('Biography')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', textarea.getAttribute('id'))
    })

    it('renders description text', () => {
      render(<Textarea name="bio" description="Tell us about yourself" />)
      expect(screen.getByText('Tell us about yourself')).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(<Textarea name="bio" error="Too short" />)
      const err = screen.getByText('Too short')
      expect(err).toBeInTheDocument()
      expect(err).toHaveAttribute('role', 'alert')
    })

    it('renders size data attribute', () => {
      const { container } = render(<Textarea name="bio" size="lg" />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-size', 'lg')
    })

    it('renders default size md', () => {
      const { container } = render(<Textarea name="bio" />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-size', 'md')
    })

    it('forwards ref to textarea element', () => {
      const ref = createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} name="bio" />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<Textarea name="bio" className="custom" />)
      expect(container.querySelector('.ui-textarea')!.className).toContain('custom')
    })

    it('renders placeholder', () => {
      render(<Textarea name="bio" placeholder="Write here..." />)
      expect(screen.getByPlaceholderText('Write here...')).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      const { container } = render(<Textarea name="bio" label="Bio" required />)
      const indicator = container.querySelector('.ui-textarea__required')!
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveTextContent('*')
    })

    it('sets rows attribute based on minRows', () => {
      render(<Textarea name="bio" minRows={5} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
    })

    it('defaults to 3 rows', () => {
      render(<Textarea name="bio" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3')
    })
  })

  // ─── Value handling ────────────────────────────────────────────────

  describe('value handling', () => {
    it('renders controlled value', () => {
      render(<Textarea name="bio" value="Hello world" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('Hello world')
    })

    it('renders defaultValue for uncontrolled', () => {
      render(<Textarea name="bio" defaultValue="Default text" />)
      expect(screen.getByRole('textbox')).toHaveValue('Default text')
    })

    it('calls onChange when typing', async () => {
      const onChange = vi.fn()
      render(<Textarea name="bio" onChange={onChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'a')
      expect(onChange).toHaveBeenCalled()
    })
  })

  // ─── Character counter ─────────────────────────────────────────────

  describe('character counter', () => {
    it('renders counter with maxLength', () => {
      const { container } = render(
        <Textarea name="bio" maxLength={200} value="hello" onChange={() => {}} />
      )
      expect(container.querySelector('.ui-textarea__counter')).toHaveTextContent('5/200')
    })

    it('shows at-limit styling when value reaches maxLength', () => {
      const { container } = render(
        <Textarea name="bio" maxLength={5} value="hello" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-textarea__counter')!
      expect(counter).toHaveAttribute('data-at-limit', '')
    })

    it('does not show at-limit when under maxLength', () => {
      const { container } = render(
        <Textarea name="bio" maxLength={100} value="hi" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-textarea__counter')!
      expect(counter).not.toHaveAttribute('data-at-limit')
    })

    it('renders counter with showCount without maxLength', () => {
      const { container } = render(
        <Textarea name="bio" showCount value="hello" onChange={() => {}} />
      )
      const counter = container.querySelector('.ui-textarea__counter')!
      expect(counter).toHaveTextContent('5')
      expect(counter.textContent).not.toContain('/')
    })

    it('does not render counter without maxLength or showCount', () => {
      const { container } = render(
        <Textarea name="bio" value="hello" onChange={() => {}} />
      )
      expect(container.querySelector('.ui-textarea__counter')).toBeNull()
    })

    it('passes maxLength to the native textarea', () => {
      render(<Textarea name="bio" maxLength={500} />)
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '500')
    })
  })

  // ─── Resize ────────────────────────────────────────────────────────

  describe('resize', () => {
    it('sets data-resize attribute to vertical by default', () => {
      const { container } = render(<Textarea name="bio" />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-resize', 'vertical')
    })

    it('sets data-resize attribute from prop', () => {
      const { container } = render(<Textarea name="bio" resize="none" />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-resize', 'none')
    })

    it('sets data-auto-resize on textarea when autoResize is true', () => {
      render(<Textarea name="bio" autoResize />)
      expect(screen.getByRole('textbox')).toHaveAttribute('data-auto-resize', '')
    })

    it('does not set data-auto-resize when autoResize is false', () => {
      render(<Textarea name="bio" />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('data-auto-resize')
    })
  })

  // ─── Disabled state ────────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables the textarea', () => {
      render(<Textarea name="bio" disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('sets data-disabled on wrapper', () => {
      const { container } = render(<Textarea name="bio" disabled />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-disabled', '')
    })
  })

  // ─── Form context integration ──────────────────────────────────────

  describe('form context integration', () => {
    it('reads value from form context', () => {
      const def = createForm({
        fields: { bio: { initial: 'Hello' } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Textarea name="bio" label="Bio" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByRole('textbox')).toHaveValue('Hello')
    })

    it('updates form value on change', async () => {
      const def = createForm({
        fields: { bio: { initial: '' } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Textarea name="bio" label="Bio" />
          </Form>
        )
      }
      render(<TestForm />)
      await userEvent.type(screen.getByRole('textbox'), 'World')
      expect(screen.getByRole('textbox')).toHaveValue('World')
    })

    it('shows error from form context after blur', async () => {
      const def = createForm({
        fields: { bio: { initial: '', validate: v.required('Bio is required') } },
        onSubmit: vi.fn(),
        validateOn: 'blur',
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Textarea name="bio" label="Bio" />
            <button>Other</button>
          </Form>
        )
      }
      render(<TestForm />)
      const textarea = screen.getByRole('textbox')
      await userEvent.click(textarea)
      await userEvent.tab()
      expect(screen.getByText('Bio is required')).toBeInTheDocument()
    })

    it('works standalone without form context', () => {
      render(<Textarea name="bio" value="standalone" onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toHaveValue('standalone')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default state)', async () => {
      const { container } = render(<Textarea name="bio" label="Bio" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (error state)', async () => {
      const { container } = render(<Textarea name="bio" label="Bio" error="Too short" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('aria-invalid set when error present', () => {
      render(<Textarea name="bio" error="Bad" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('error is associated via aria-describedby', () => {
      render(<Textarea name="bio" label="Bio" error="Bad bio" />)
      const textarea = screen.getByRole('textbox')
      const describedBy = textarea.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
    })

    it('required attribute forwarded correctly', () => {
      render(<Textarea name="bio" label="Bio" required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })

  // ─── Styles ────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<Textarea name="bio" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-textarea)', () => {
      render(<Textarea name="bio" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-textarea)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(<Textarea name="bio" error="Error" />)
      expect(container.querySelector('.ui-textarea')).toHaveAttribute('data-invalid', '')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Textarea"', () => {
      expect(Textarea.displayName).toBe('Textarea')
    })
  })
})
