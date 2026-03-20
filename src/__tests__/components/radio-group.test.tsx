import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { RadioGroup } from '../../components/radio-group'

expect.extend(toHaveNoViolations)

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('RadioGroup', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a fieldset element', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick one" />
      )
      expect(container.querySelector('fieldset')).toBeInTheDocument()
    })

    it('renders a legend with the label', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick one" />)
      expect(screen.getByText('Pick one')).toBeInTheDocument()
      expect(screen.getByText('Pick one').tagName).toBe('LEGEND')
    })

    it('renders all radio options', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      const radios = screen.getAllByRole('radio')
      expect(radios).toHaveLength(3)
    })

    it('renders option labels', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      expect(screen.getByText('Option A')).toBeInTheDocument()
      expect(screen.getByText('Option B')).toBeInTheDocument()
      expect(screen.getByText('Option C')).toBeInTheDocument()
    })

    it('all radios share the same name', () => {
      render(<RadioGroup name="flavor" options={defaultOptions} label="Pick" />)
      const radios = screen.getAllByRole('radio')
      radios.forEach(r => expect(r).toHaveAttribute('name', 'flavor'))
    })

    it('renders with default size="md"', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" />
      )
      const fieldset = container.querySelector('.ui-radio-group')!
      expect(fieldset).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" size="sm" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" size="lg" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-size', 'lg')
    })

    it('renders vertical orientation by default', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-orientation', 'vertical')
    })

    it('renders horizontal orientation', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" orientation="horizontal" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('forwards ref to fieldset element', () => {
      const ref = createRef<HTMLFieldSetElement>()
      render(<RadioGroup ref={ref} name="test" options={defaultOptions} label="Pick" />)
      expect(ref.current).toBeInstanceOf(HTMLFieldSetElement)
    })

    it('forwards className', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" className="custom" />
      )
      const fieldset = container.querySelector('.ui-radio-group')!
      expect(fieldset.className).toContain('custom')
    })
  })

  // ─── Selection tests ──────────────────────────────────────────────

  describe('selection', () => {
    it('no option selected by default (uncontrolled, no defaultValue)', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      const radios = screen.getAllByRole('radio')
      radios.forEach(r => expect(r).not.toBeChecked())
    })

    it('selects defaultValue option', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" defaultValue="b" />)
      expect(screen.getByLabelText('Option B')).toBeChecked()
    })

    it('selects controlled value', () => {
      render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" value="c" onChange={() => {}} />
      )
      expect(screen.getByLabelText('Option C')).toBeChecked()
    })

    it('calls onChange when an option is clicked', async () => {
      const handleChange = vi.fn()
      render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" onChange={handleChange} />
      )
      await userEvent.click(screen.getByLabelText('Option B'))
      expect(handleChange).toHaveBeenCalledWith('b')
    })

    it('selects option on click (uncontrolled)', async () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      await userEvent.click(screen.getByLabelText('Option A'))
      expect(screen.getByLabelText('Option A')).toBeChecked()
    })
  })

  // ─── Keyboard navigation tests ────────────────────────────────────

  describe('keyboard navigation', () => {
    it('arrow down moves focus to next option (vertical)', async () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" defaultValue="a" />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(radios[1])
    })

    it('arrow up moves focus to previous option (vertical)', async () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" defaultValue="b" />)
      const radios = screen.getAllByRole('radio')
      radios[1].focus()
      await userEvent.keyboard('{ArrowUp}')
      expect(document.activeElement).toBe(radios[0])
    })

    it('arrow right moves focus to next option (horizontal)', async () => {
      render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" orientation="horizontal" defaultValue="a" />
      )
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      await userEvent.keyboard('{ArrowRight}')
      expect(document.activeElement).toBe(radios[1])
    })

    it('arrow left moves focus to previous option (horizontal)', async () => {
      render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" orientation="horizontal" defaultValue="b" />
      )
      const radios = screen.getAllByRole('radio')
      radios[1].focus()
      await userEvent.keyboard('{ArrowLeft}')
      expect(document.activeElement).toBe(radios[0])
    })

    it('wraps from last to first', async () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" defaultValue="c" />)
      const radios = screen.getAllByRole('radio')
      radios[2].focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(radios[0])
    })

    it('wraps from first to last', async () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" defaultValue="a" />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      await userEvent.keyboard('{ArrowUp}')
      expect(document.activeElement).toBe(radios[2])
    })
  })

  // ─── Disabled options tests ────────────────────────────────────────

  describe('disabled options', () => {
    const optionsWithDisabled = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ]

    it('renders disabled option as disabled input', () => {
      render(<RadioGroup name="test" options={optionsWithDisabled} label="Pick" />)
      expect(screen.getByLabelText('Option B')).toBeDisabled()
    })

    it('does not select disabled option on click', async () => {
      render(<RadioGroup name="test" options={optionsWithDisabled} label="Pick" />)
      await userEvent.click(screen.getByLabelText('Option B'))
      expect(screen.getByLabelText('Option B')).not.toBeChecked()
    })
  })

  // ─── Error tests ──────────────────────────────────────────────────

  describe('error', () => {
    it('renders error text', () => {
      render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" error="Required" />
      )
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('applies data-error attribute', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" error="Required" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-error', '')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default)', async () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick one" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with selection)', async () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick one" value="b" onChange={() => {}} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with error)', async () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick one" error="Required" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('uses fieldset/legend structure', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick one" />
      )
      const fieldset = container.querySelector('fieldset')!
      const legend = fieldset.querySelector('legend')!
      expect(legend).toHaveTextContent('Pick one')
    })

    it('each radio has role="radio"', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      expect(screen.getAllByRole('radio')).toHaveLength(3)
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" motion={2} />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(
        <RadioGroup name="test" options={defaultOptions} label="Pick" />
      )
      expect(container.querySelector('.ui-radio-group')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-radio-group)', () => {
      render(<RadioGroup name="test" options={defaultOptions} label="Pick" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-radio-group)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "RadioGroup"', () => {
      expect(RadioGroup.displayName).toBe('RadioGroup')
    })
  })
})
