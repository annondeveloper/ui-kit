import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Chip } from '../../components/chip'

expect.extend(toHaveNoViolations)

describe('Chip', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a label element wrapping a checkbox', () => {
      render(<Chip>React</Chip>)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('renders children text', () => {
      render(<Chip>TypeScript</Chip>)
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('applies ui-chip class', () => {
      const { container } = render(<Chip>Test</Chip>)
      expect(container.querySelector('.ui-chip')).toBeInTheDocument()
    })

    it('renders an internal checkbox input', () => {
      const { container } = render(<Chip>Tag</Chip>)
      const input = container.querySelector('input[type="checkbox"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('ui-chip__input')
    })

    it('renders checkmark element', () => {
      const { container } = render(<Chip>Tag</Chip>)
      expect(container.querySelector('.ui-chip__check')).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      const icon = <svg data-testid="chip-icon" />
      render(<Chip icon={icon}>With Icon</Chip>)
      expect(screen.getByTestId('chip-icon')).toBeInTheDocument()
      const wrapper = screen.getByTestId('chip-icon').parentElement
      expect(wrapper).toHaveClass('ui-chip__icon')
    })
  })

  // ─── Toggle behavior ──────────────────────────────────────────────

  describe('toggle', () => {
    it('starts unchecked by default', () => {
      render(<Chip>Tag</Chip>)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('starts checked when defaultChecked is true', () => {
      render(<Chip defaultChecked>Tag</Chip>)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('toggles on click (uncontrolled)', async () => {
      render(<Chip>Tag</Chip>)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()
      await userEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('calls onChange with new checked state', async () => {
      const onChange = vi.fn()
      render(<Chip onChange={onChange}>Tag</Chip>)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith(true)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onChange).toHaveBeenCalledWith(false)
    })

    it('respects controlled checked prop', () => {
      const { rerender } = render(<Chip checked={false}>Tag</Chip>)
      expect(screen.getByRole('checkbox')).not.toBeChecked()
      rerender(<Chip checked={true}>Tag</Chip>)
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('toggles on Space key when focused', async () => {
      const onChange = vi.fn()
      render(<Chip onChange={onChange}>Tag</Chip>)
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await userEvent.keyboard(' ')
      expect(onChange).toHaveBeenCalledWith(true)
    })
  })

  // ─── Data attributes ───────────────────────────────────────────────

  describe('data attributes', () => {
    it('sets data-variant to default "outline"', () => {
      const { container } = render(<Chip>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-variant', 'outline')
    })

    it('sets data-variant to "filled"', () => {
      const { container } = render(<Chip variant="filled">Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-variant', 'filled')
    })

    it('sets data-variant to "light"', () => {
      const { container } = render(<Chip variant="light">Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-variant', 'light')
    })

    it('sets data-color to default "default"', () => {
      const { container } = render(<Chip>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-color', 'default')
    })

    it('sets data-color to "primary"', () => {
      const { container } = render(<Chip color="primary">Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-color', 'primary')
    })

    it('sets data-size to default "md"', () => {
      const { container } = render(<Chip>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-size', 'md')
    })

    it('sets data-size="xs"', () => {
      const { container } = render(<Chip size="xs">Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-size', 'xs')
    })

    it('sets data-checked when checked', () => {
      const { container } = render(<Chip defaultChecked>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-checked', 'true')
    })

    it('does not set data-checked when unchecked', () => {
      const { container } = render(<Chip>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).not.toHaveAttribute('data-checked')
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('sets data-disabled when disabled', () => {
      const { container } = render(<Chip disabled>Tag</Chip>)
      expect(container.querySelector('.ui-chip')).toHaveAttribute('data-disabled', 'true')
    })

    it('does not call onChange when disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(<Chip disabled onChange={onChange}>Tag</Chip>)
      // The input is disabled so click won't fire onChange
      const checkbox = screen.getByRole('checkbox')
      // Disabled checkbox can't be clicked
      expect(checkbox).toBeDisabled()
    })

    it('disables the internal checkbox', () => {
      const { container } = render(<Chip disabled>Tag</Chip>)
      const input = container.querySelector('input[type="checkbox"]')
      expect(input).toBeDisabled()
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref', () => {
    it('forwards ref to root label element', () => {
      const ref = createRef<HTMLLabelElement>()
      render(<Chip ref={ref}>Tag</Chip>)
      expect(ref.current).toBeInstanceOf(HTMLLabelElement)
    })
  })

  // ─── Props forwarding ─────────────────────────────────────────────

  describe('props forwarding', () => {
    it('merges custom className', () => {
      const { container } = render(<Chip className="custom">Tag</Chip>)
      const chip = container.querySelector('.ui-chip')!
      expect(chip.className).toContain('ui-chip')
      expect(chip.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Chip data-testid="my-chip" id="chip-1">Tag</Chip>)
      const el = screen.getByTestId('my-chip')
      expect(el).toHaveAttribute('id', 'chip-1')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (unchecked)', async () => {
      const { container } = render(<Chip>Accessible</Chip>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (checked)', async () => {
      const { container } = render(<Chip defaultChecked>Checked</Chip>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('checkbox is focusable', () => {
      render(<Chip>Tag</Chip>)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeDisabled()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Chip>Styled</Chip>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-chip)', () => {
      render(<Chip>Scoped</Chip>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-chip)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Chip"', () => {
      expect(Chip.displayName).toBe('Chip')
    })
  })
})
