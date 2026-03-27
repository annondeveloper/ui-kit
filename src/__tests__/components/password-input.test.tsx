import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PasswordInput } from '../../components/password-input'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

describe('PasswordInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a password input by default', () => {
      render(<PasswordInput name="pw" />)
      const input = document.querySelector('input[type="password"]')!
      expect(input).toBeInTheDocument()
    })

    it('renders label with htmlFor association', () => {
      render(<PasswordInput name="pw" label="Password" />)
      const input = document.querySelector('input')!
      const label = screen.getByText('Password')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })

    it('renders description text', () => {
      render(<PasswordInput name="pw" description="8+ characters" />)
      expect(screen.getByText('8+ characters')).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(<PasswordInput name="pw" error="Too short" />)
      expect(screen.getByText('Too short')).toBeInTheDocument()
    })

    it('renders size data attribute', () => {
      const { container } = render(<PasswordInput name="pw" size="lg" />)
      expect(container.querySelector('.ui-password-input')).toHaveAttribute('data-size', 'lg')
    })

    it('renders default size md', () => {
      const { container } = render(<PasswordInput name="pw" />)
      expect(container.querySelector('.ui-password-input')).toHaveAttribute('data-size', 'md')
    })

    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<PasswordInput ref={ref} name="pw" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<PasswordInput name="pw" className="custom" />)
      expect(container.querySelector('.ui-password-input')!.className).toContain('custom')
    })

    it('renders placeholder', () => {
      render(<PasswordInput name="pw" placeholder="Enter password" />)
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      const { container } = render(<PasswordInput name="pw" label="Password" required />)
      const indicator = container.querySelector('.ui-password-input__required')!
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveTextContent('*')
    })
  })

  // ─── Visibility toggle ────────────────────────────────────────────

  describe('visibility toggle', () => {
    it('renders visibility toggle button by default', () => {
      render(<PasswordInput name="pw" />)
      expect(screen.getByLabelText('Show password')).toBeInTheDocument()
    })

    it('toggles input type on click', async () => {
      render(<PasswordInput name="pw" />)
      const input = document.querySelector('input')!
      expect(input).toHaveAttribute('type', 'password')

      await userEvent.click(screen.getByLabelText('Show password'))
      expect(input).toHaveAttribute('type', 'text')

      await userEvent.click(screen.getByLabelText('Hide password'))
      expect(input).toHaveAttribute('type', 'password')
    })

    it('hides toggle when visibilityToggle=false', () => {
      render(<PasswordInput name="pw" visibilityToggle={false} />)
      expect(screen.queryByLabelText('Show password')).toBeNull()
      expect(screen.queryByLabelText('Hide password')).toBeNull()
    })

    it('toggle button label changes when toggled', async () => {
      render(<PasswordInput name="pw" />)
      expect(screen.getByLabelText('Show password')).toBeInTheDocument()
      await userEvent.click(screen.getByLabelText('Show password'))
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument()
    })
  })

  // ─── Strength meter ───────────────────────────────────────────────

  describe('strength meter', () => {
    it('does not render strength meter by default', () => {
      const { container } = render(<PasswordInput name="pw" />)
      expect(container.querySelector('.ui-password-input__strength')).toBeNull()
    })

    it('renders strength meter when showStrengthMeter is true', () => {
      const { container } = render(<PasswordInput name="pw" showStrengthMeter value="" onChange={() => {}} />)
      expect(container.querySelector('.ui-password-input__strength')).toBeInTheDocument()
    })

    it('shows 4 strength segments', () => {
      const { container } = render(<PasswordInput name="pw" showStrengthMeter value="" onChange={() => {}} />)
      const segments = container.querySelectorAll('.ui-password-input__strength-segment')
      expect(segments).toHaveLength(4)
    })

    it('shows no active segments for empty password', () => {
      const { container } = render(<PasswordInput name="pw" showStrengthMeter value="" onChange={() => {}} />)
      const active = container.querySelectorAll('.ui-password-input__strength-segment[data-active]')
      expect(active).toHaveLength(0)
    })

    it('shows active segments for strong password', () => {
      const { container } = render(
        <PasswordInput name="pw" showStrengthMeter value="MyP@ss123!" onChange={() => {}} />
      )
      const active = container.querySelectorAll('.ui-password-input__strength-segment[data-active]')
      expect(active.length).toBeGreaterThanOrEqual(3)
    })

    it('displays strength label', () => {
      render(
        <PasswordInput name="pw" showStrengthMeter value="MyP@ss123!" onChange={() => {}} />
      )
      // Strong password should show "Strong" label
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    it('uses custom strength labels', () => {
      render(
        <PasswordInput
          name="pw"
          showStrengthMeter
          strengthLabels={['', 'Bad', 'OK', 'Nice', 'Great']}
          value="MyP@ss123!"
          onChange={() => {}}
        />
      )
      expect(screen.getByText('Great')).toBeInTheDocument()
    })

    it('calls onStrengthChange with strength value', () => {
      const onStrengthChange = vi.fn()
      render(
        <PasswordInput
          name="pw"
          showStrengthMeter
          onStrengthChange={onStrengthChange}
          value="MyP@ss123!"
          onChange={() => {}}
        />
      )
      expect(onStrengthChange).toHaveBeenCalledWith(expect.any(Number))
      // Should be strong (4)
      expect(onStrengthChange).toHaveBeenCalledWith(4)
    })

    it('shows "Weak" for a simple password', () => {
      render(
        <PasswordInput name="pw" showStrengthMeter value="aa" onChange={() => {}} />
      )
      expect(screen.getByText('Weak')).toBeInTheDocument()
    })
  })

  // ─── Disabled state ────────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables the input', () => {
      render(<PasswordInput name="pw" disabled />)
      expect(document.querySelector('input')).toBeDisabled()
    })

    it('sets data-disabled on wrapper', () => {
      const { container } = render(<PasswordInput name="pw" disabled />)
      expect(container.querySelector('.ui-password-input')).toHaveAttribute('data-disabled', '')
    })
  })

  // ─── Form context integration ──────────────────────────────────────

  describe('form context integration', () => {
    it('reads value from form context', () => {
      const def = createForm({
        fields: { password: { initial: 'secret' } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <PasswordInput name="password" label="Password" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(document.querySelector('input')).toHaveValue('secret')
    })

    it('updates form value on change', async () => {
      const onSubmit = vi.fn()
      const def = createForm({
        fields: { password: { initial: '' } },
        onSubmit,
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <PasswordInput name="password" label="Password" />
          </Form>
        )
      }
      render(<TestForm />)
      await userEvent.type(document.querySelector('input')!, 'hello')
      expect(document.querySelector('input')).toHaveValue('hello')
    })

    it('works standalone without form context', () => {
      render(<PasswordInput name="pw" value="test" onChange={() => {}} />)
      expect(document.querySelector('input')).toHaveValue('test')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default state)', async () => {
      const { container } = render(<PasswordInput name="pw" label="Password" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (error state)', async () => {
      const { container } = render(<PasswordInput name="pw" label="Password" error="Too short" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('aria-invalid set when error present', () => {
      render(<PasswordInput name="pw" error="Bad" />)
      expect(document.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('error is associated via aria-describedby', () => {
      render(<PasswordInput name="pw" label="PW" error="Bad password" />)
      const input = document.querySelector('input')!
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
    })

    it('strength meter is associated via aria-describedby', () => {
      render(<PasswordInput name="pw" label="PW" showStrengthMeter value="" onChange={() => {}} />)
      const input = document.querySelector('input')!
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      expect(describedBy).toContain('strength')
    })
  })

  // ─── Styles ────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<PasswordInput name="pw" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-password-input)', () => {
      render(<PasswordInput name="pw" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-password-input)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(<PasswordInput name="pw" error="Error" />)
      expect(container.querySelector('.ui-password-input')).toHaveAttribute('data-invalid', '')
    })
  })

  // ─── Display name ──────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "PasswordInput"', () => {
      expect(PasswordInput.displayName).toBe('PasswordInput')
    })
  })
})
