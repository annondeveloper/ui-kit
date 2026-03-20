import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ToggleSwitch } from '../../components/toggle-switch'

expect.extend(toHaveNoViolations)

describe('ToggleSwitch', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a switch role element', () => {
      render(<ToggleSwitch label="Dark mode" />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('renders with default size="md"', () => {
      const { container } = render(<ToggleSwitch label="Test" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<ToggleSwitch label="Test" size="sm" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<ToggleSwitch label="Test" size="lg" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-size', 'lg')
    })

    it('renders label text', () => {
      render(<ToggleSwitch label="Enable notifications" />)
      expect(screen.getByText('Enable notifications')).toBeInTheDocument()
    })

    it('renders without label', () => {
      const { container } = render(<ToggleSwitch aria-label="hidden switch" />)
      expect(container.querySelector('.ui-toggle-switch__label')).toBeNull()
    })

    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<ToggleSwitch ref={ref} label="Ref" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current?.type).toBe('checkbox')
    })

    it('forwards className to wrapper', () => {
      const { container } = render(<ToggleSwitch label="Test" className="custom" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper.className).toContain('custom')
    })

    it('forwards additional HTML attributes to the input', () => {
      render(<ToggleSwitch label="Test" name="darkMode" value="on" />)
      const input = screen.getByRole('switch')
      expect(input).toHaveAttribute('name', 'darkMode')
      expect(input).toHaveAttribute('value', 'on')
    })
  })

  // ─── Toggle on/off tests ─────────────────────────────────────────

  describe('toggle on/off', () => {
    it('is off by default', () => {
      render(<ToggleSwitch label="Test" />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('can be controlled as checked (on)', () => {
      render(<ToggleSwitch label="Test" checked onChange={() => {}} />)
      expect(screen.getByRole('switch')).toBeChecked()
    })

    it('can be controlled as unchecked (off)', () => {
      render(<ToggleSwitch label="Test" checked={false} onChange={() => {}} />)
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('toggles on when clicked', async () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch label="Toggle me" onChange={handleChange} />)
      await userEvent.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('toggles off when clicked again', async () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch label="Toggle me" defaultChecked onChange={handleChange} />)
      await userEvent.click(screen.getByRole('switch'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('has aria-checked="true" when checked', () => {
      render(<ToggleSwitch label="Test" checked onChange={() => {}} />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    })

    it('has aria-checked="false" when unchecked', () => {
      render(<ToggleSwitch label="Test" checked={false} onChange={() => {}} />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
    })
  })

  // ─── Keyboard tests ──────────────────────────────────────────────

  describe('keyboard', () => {
    it('Space key toggles the switch', async () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch label="Space" onChange={handleChange} />)
      const input = screen.getByRole('switch')
      input.focus()
      await userEvent.keyboard(' ')
      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Label interaction tests ──────────────────────────────────────

  describe('label interaction', () => {
    it('clicking label toggles the switch', async () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch label="Click label" onChange={handleChange} />)
      await userEvent.click(screen.getByText('Click label'))
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('label is associated with input via htmlFor', () => {
      render(<ToggleSwitch label="Associated" />)
      const input = screen.getByRole('switch')
      const id = input.getAttribute('id')
      const label = screen.getByText('Associated')
      expect(label.closest('label')).toHaveAttribute('for', id)
    })
  })

  // ─── Disabled tests ──────────────────────────────────────────────

  describe('disabled', () => {
    it('is disabled when disabled prop is set', () => {
      render(<ToggleSwitch label="Disabled" disabled />)
      expect(screen.getByRole('switch')).toBeDisabled()
    })

    it('does not fire onChange when disabled', async () => {
      const handleChange = vi.fn()
      render(<ToggleSwitch label="Disabled" disabled onChange={handleChange} />)
      await userEvent.click(screen.getByRole('switch'))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('applies data-disabled attribute on wrapper', () => {
      const { container } = render(<ToggleSwitch label="Disabled" disabled />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-disabled', '')
    })
  })

  // ─── Error tests ─────────────────────────────────────────────────

  describe('error', () => {
    it('renders error text', () => {
      render(<ToggleSwitch label="Test" error="Required field" />)
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('applies data-error attribute on wrapper', () => {
      const { container } = render(<ToggleSwitch label="Test" error="Error" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-error', '')
    })

    it('associates error with input via aria-describedby', () => {
      render(<ToggleSwitch label="Test" error="Must enable" />)
      const input = screen.getByRole('switch')
      const errorId = input.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      const errorEl = document.getElementById(errorId!)
      expect(errorEl).toHaveTextContent('Must enable')
    })

    it('sets aria-invalid when error is present', () => {
      render(<ToggleSwitch label="Test" error="Error" />)
      expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  // ─── Accessibility tests ─────────────────────────────────────────

  describe('accessibility', () => {
    it('has role="switch"', () => {
      render(<ToggleSwitch label="Switch" />)
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('has no axe violations (default)', async () => {
      const { container } = render(<ToggleSwitch label="Accessible" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (checked)', async () => {
      const { container } = render(<ToggleSwitch label="Checked" checked onChange={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (disabled)', async () => {
      const { container } = render(<ToggleSwitch label="Disabled" disabled />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with error)', async () => {
      const { container } = render(<ToggleSwitch label="Error" error="Required" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('is focusable via keyboard', () => {
      render(<ToggleSwitch label="Focus Me" />)
      const input = screen.getByRole('switch')
      input.focus()
      expect(document.activeElement).toBe(input)
    })
  })

  // ─── Motion tests ────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<ToggleSwitch label="Motion" motion={2} />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<ToggleSwitch label="Default" />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-motion', '3')
    })

    it('applies motion level 0', () => {
      const { container } = render(<ToggleSwitch label="No motion" motion={0} />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 1', () => {
      const { container } = render(<ToggleSwitch label="Subtle" motion={1} />)
      const wrapper = container.querySelector('.ui-toggle-switch')!
      expect(wrapper).toHaveAttribute('data-motion', '1')
    })
  })

  // ─── Style injection tests ───────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<ToggleSwitch label="Styled" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-toggle-switch)', () => {
      render(<ToggleSwitch label="Scoped" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-toggle-switch)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ToggleSwitch"', () => {
      expect(ToggleSwitch.displayName).toBe('ToggleSwitch')
    })
  })
})
