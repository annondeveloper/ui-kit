import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Checkbox } from '../../components/checkbox'

expect.extend(toHaveNoViolations)

describe('Checkbox', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a checkbox input', () => {
      render(<Checkbox label="Accept terms" />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders with default size="md"', () => {
      const { container } = render(<Checkbox label="Test" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<Checkbox label="Test" size="sm" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<Checkbox label="Test" size="lg" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-size', 'lg')
    })

    it('renders label text', () => {
      render(<Checkbox label="Accept terms" />)
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('renders without label', () => {
      const { container } = render(<Checkbox aria-label="hidden check" />)
      expect(container.querySelector('.ui-checkbox__label')).toBeNull()
    })

    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} label="Ref" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<Checkbox label="Test" className="custom" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper.className).toContain('custom')
    })

    it('forwards additional HTML attributes to the input', () => {
      render(<Checkbox label="Test" name="agree" value="yes" />)
      const input = screen.getByRole('checkbox')
      expect(input).toHaveAttribute('name', 'agree')
      expect(input).toHaveAttribute('value', 'yes')
    })
  })

  // ─── Checked/unchecked toggle tests ────────────────────────────────

  describe('checked/unchecked', () => {
    it('is unchecked by default', () => {
      render(<Checkbox label="Test" />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('can be controlled as checked', () => {
      render(<Checkbox label="Test" checked onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('can be controlled as unchecked', () => {
      render(<Checkbox label="Test" checked={false} onChange={() => {}} />)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('toggles when clicked', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Toggle me" onChange={handleChange} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Indeterminate tests ───────────────────────────────────────────

  describe('indeterminate', () => {
    it('sets indeterminate state on input', () => {
      render(<Checkbox label="Partial" indeterminate />)
      const input = screen.getByRole('checkbox') as HTMLInputElement
      expect(input.indeterminate).toBe(true)
    })

    it('applies data-indeterminate attribute on wrapper', () => {
      const { container } = render(<Checkbox label="Partial" indeterminate />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-indeterminate', '')
    })
  })

  // ─── Label click tests ─────────────────────────────────────────────

  describe('label interaction', () => {
    it('clicking label toggles the checkbox', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Click label" onChange={handleChange} />)
      await userEvent.click(screen.getByText('Click label'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Keyboard tests ───────────────────────────────────────────────

  describe('keyboard', () => {
    it('Space key toggles checkbox', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Space" onChange={handleChange} />)
      const input = screen.getByRole('checkbox')
      input.focus()
      await userEvent.keyboard(' ')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Disabled tests ───────────────────────────────────────────────

  describe('disabled', () => {
    it('is disabled when disabled prop is set', () => {
      render(<Checkbox label="Disabled" disabled />)
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('does not fire onChange when disabled', async () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Disabled" disabled onChange={handleChange} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('applies data-disabled attribute on wrapper', () => {
      const { container } = render(<Checkbox label="Disabled" disabled />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-disabled', '')
    })
  })

  // ─── Error tests ──────────────────────────────────────────────────

  describe('error', () => {
    it('renders error text', () => {
      render(<Checkbox label="Test" error="Required field" />)
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('applies data-error attribute on wrapper', () => {
      const { container } = render(<Checkbox label="Test" error="Error" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-error', '')
    })

    it('associates error with input via aria-describedby', () => {
      render(<Checkbox label="Test" error="Must accept" />)
      const input = screen.getByRole('checkbox')
      const errorId = input.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      const errorEl = document.getElementById(errorId!)
      expect(errorEl).toHaveTextContent('Must accept')
    })

    it('sets aria-invalid when error is present', () => {
      render(<Checkbox label="Test" error="Error" />)
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(<Checkbox label="Accessible" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (checked)', async () => {
      const { container } = render(<Checkbox label="Checked" checked onChange={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (disabled)', async () => {
      const { container } = render(<Checkbox label="Disabled" disabled />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with error)', async () => {
      const { container } = render(<Checkbox label="Error" error="Required" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('label is associated with input via htmlFor', () => {
      render(<Checkbox label="Associated" />)
      const input = screen.getByRole('checkbox')
      const id = input.getAttribute('id')
      const label = screen.getByText('Associated')
      expect(label.closest('label')).toHaveAttribute('for', id)
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<Checkbox label="Motion" motion={2} />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<Checkbox label="Default" />)
      const wrapper = container.querySelector('.ui-checkbox')!
      expect(wrapper).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Checkbox label="Styled" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-checkbox)', () => {
      render(<Checkbox label="Scoped" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-checkbox)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Checkbox"', () => {
      expect(Checkbox.displayName).toBe('Checkbox')
    })
  })
})
