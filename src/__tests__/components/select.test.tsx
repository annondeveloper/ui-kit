import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Select, type SelectOption } from '../../components/select'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

// ─── Test data ──────────────────────────────────────────────────────────────

const options: SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Charlie' },
  { value: 'd', label: 'Delta', disabled: true },
]

const groupedOptions: SelectOption[] = [
  { value: 'a', label: 'Alpha', group: 'Greek' },
  { value: 'b', label: 'Beta', group: 'Greek' },
  { value: 'x', label: 'Xenon', group: 'Elements' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const selectFormDef = createForm({
  fields: {
    color: { initial: '', validate: v.required('Color is required') },
  },
  onSubmit: vi.fn(),
})

const prefilledFormDef = createForm({
  fields: {
    color: { initial: 'b' },
  },
  onSubmit: vi.fn(),
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Select', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render ─────────────────────────────────────────────────────────────

  describe('render', () => {
    it('renders trigger button with placeholder', () => {
      render(<Select name="test" options={options} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Select...')
    })

    it('renders custom placeholder', () => {
      render(<Select name="test" options={options} placeholder="Pick one" />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Pick one')
    })

    it('renders selected option label when value provided', () => {
      render(<Select name="test" options={options} value="b" />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Beta')
    })

    it('renders selected option label for defaultValue', () => {
      render(<Select name="test" options={options} defaultValue="c" />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Charlie')
    })

    it('renders label with association', () => {
      render(<Select name="test" options={options} label="Color" />)
      expect(screen.getByText('Color')).toBeInTheDocument()
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-labelledby')
    })

    it('renders all sizes', () => {
      const { rerender, container } = render(
        <Select name="test" options={options} size="sm" />
      )
      expect(container.querySelector('.ui-select')).toHaveAttribute('data-size', 'sm')

      rerender(<Select name="test" options={options} size="md" />)
      expect(container.querySelector('.ui-select')).toHaveAttribute('data-size', 'md')

      rerender(<Select name="test" options={options} size="lg" />)
      expect(container.querySelector('.ui-select')).toHaveAttribute('data-size', 'lg')
    })

    it('renders disabled state', () => {
      render(<Select name="test" options={options} disabled />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('renders chevron icon', () => {
      const { container } = render(<Select name="test" options={options} />)
      const chevron = container.querySelector('.ui-select__chevron')
      expect(chevron).toBeInTheDocument()
    })

    it('renders hidden input with name and value', () => {
      const { container } = render(
        <Select name="color" options={options} value="a" />
      )
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toBeInTheDocument()
      expect(hidden).toHaveAttribute('name', 'color')
      expect(hidden).toHaveValue('a')
    })

    it('forwards ref and className', () => {
      const ref = createRef<HTMLDivElement>()
      const { container } = render(
        <Select ref={ref} name="test" options={options} className="custom" />
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(container.querySelector('.ui-select')?.className).toContain('custom')
    })
  })

  // ─── Open / Close ──────────────────────────────────────────────────────

  describe('open/close', () => {
    it('opens dropdown on click', async () => {
      render(<Select name="test" options={options} />)
      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes dropdown on option select', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const listbox = screen.getByRole('listbox')
      const optionEls = within(listbox).getAllByRole('option')
      await userEvent.click(optionEls[0])
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes on Escape key', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes on click outside (light dismiss)', async () => {
      render(
        <div>
          <Select name="test" options={options} />
          <button>Outside</button>
        </div>
      )
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Outside'))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('returns focus to trigger on close', async () => {
      render(<Select name="test" options={options} />)
      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      await userEvent.keyboard('{Escape}')
      expect(document.activeElement).toBe(trigger)
    })
  })

  // ─── Selection ─────────────────────────────────────────────────────────

  describe('selection', () => {
    it('selects option on click', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[1]) // Beta
      expect(screen.getByRole('combobox')).toHaveTextContent('Beta')
    })

    it('calls onChange with selected value', async () => {
      const handleChange = vi.fn()
      render(<Select name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // Alpha
      expect(handleChange).toHaveBeenCalledWith('a')
    })

    it('displays selected option label in trigger', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getAllByRole('option')[2]) // Charlie
      expect(screen.getByRole('combobox')).toHaveTextContent('Charlie')
    })

    it('shows check icon on selected option', async () => {
      const { container } = render(
        <Select name="test" options={options} value="b" />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const selectedOption = screen.getAllByRole('option')[1]
      expect(selectedOption).toHaveAttribute('aria-selected', 'true')
      // Check icon should be rendered
      expect(selectedOption.querySelector('.ui-select__check')).toBeInTheDocument()
    })

    it('does not select disabled options', async () => {
      const handleChange = vi.fn()
      render(<Select name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[3]) // Delta (disabled)
      expect(handleChange).not.toHaveBeenCalled()
      // Dropdown should still be open
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('clearable: shows clear button and clears value', async () => {
      const handleChange = vi.fn()
      const { container } = render(
        <Select name="test" options={options} value="a" clearable onChange={handleChange} />
      )
      const clearBtn = container.querySelector('.ui-select__clear')
      expect(clearBtn).toBeInTheDocument()
      await userEvent.click(clearBtn!)
      expect(handleChange).toHaveBeenCalledWith('')
    })

    it('clearable: does not show clear button when no value', () => {
      const { container } = render(
        <Select name="test" options={options} clearable />
      )
      expect(container.querySelector('.ui-select__clear')).not.toBeInTheDocument()
    })
  })

  // ─── Keyboard Navigation ──────────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('opens on ArrowDown when closed', async () => {
      render(<Select name="test" options={options} />)
      screen.getByRole('combobox').focus()
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('opens on Enter when closed', async () => {
      render(<Select name="test" options={options} />)
      screen.getByRole('combobox').focus()
      await userEvent.keyboard('{Enter}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('opens on Space when closed', async () => {
      render(<Select name="test" options={options} />)
      screen.getByRole('combobox').focus()
      await userEvent.keyboard(' ')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('ArrowDown moves to next option', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}')
      // The active option should have data-active
      const optionEls = screen.getAllByRole('option')
      // First enabled option after opening, then ArrowDown moves to next
      expect(optionEls[1]).toHaveAttribute('data-active', '')
    })

    it('ArrowUp moves to previous option', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      // Move down first then up
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowUp}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('data-active', '')
    })

    it('Home moves to first option', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      await userEvent.keyboard('{Home}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('data-active', '')
    })

    it('End moves to last enabled option', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{End}')
      // Last enabled option is Charlie (index 2), Delta is disabled
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[2]).toHaveAttribute('data-active', '')
    })

    it('Enter selects active option', async () => {
      const handleChange = vi.fn()
      render(<Select name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}') // Beta
      await userEvent.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('b')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('skips disabled options during navigation', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      // Move to Charlie (index 2 in enabled list)
      await userEvent.keyboard('{ArrowDown}{ArrowDown}')
      // Try to move beyond Charlie — Delta is disabled, so should stay at Charlie
      await userEvent.keyboard('{ArrowDown}')
      const optionEls = screen.getAllByRole('option')
      // Should be at Charlie (last enabled)
      expect(optionEls[2]).toHaveAttribute('data-active', '')
    })

    it('typeahead: typing "c" jumps to "Charlie"', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('c')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[2]).toHaveAttribute('data-active', '')
    })
  })

  // ─── Searchable ────────────────────────────────────────────────────────

  describe('searchable', () => {
    it('shows search input when searchable=true', async () => {
      render(<Select name="test" options={options} searchable />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('filters options by search query', async () => {
      render(<Select name="test" options={options} searchable />)
      await userEvent.click(screen.getByRole('combobox'))
      const searchInput = screen.getByPlaceholderText('Search...')
      await userEvent.type(searchInput, 'al')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(1)
      expect(optionEls[0]).toHaveTextContent('Alpha')
    })

    it('shows "No options found" when no match', async () => {
      render(<Select name="test" options={options} searchable />)
      await userEvent.click(screen.getByRole('combobox'))
      const searchInput = screen.getByPlaceholderText('Search...')
      await userEvent.type(searchInput, 'zzz')
      expect(screen.getByText('No options found')).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })
  })

  // ─── Form integration ─────────────────────────────────────────────────

  describe('form integration', () => {
    it('auto-reads value from form context', () => {
      function TestForm() {
        const form = useForm(prefilledFormDef)
        return (
          <Form form={form}>
            <Select name="color" options={options} label="Color" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Beta')
    })

    it('auto-reads error from form context', () => {
      function TestForm() {
        const form = useForm(selectFormDef)
        return (
          <Form form={form}>
            <Select name="color" options={options} label="Color" />
            <button type="submit">Submit</button>
          </Form>
        )
      }
      render(<TestForm />)
      // Submit to trigger validation + touched
      fireEvent.submit(screen.getByRole('combobox').closest('form')!)
      expect(screen.getByText('Color is required')).toBeInTheDocument()
    })

    it('onChange updates form value', async () => {
      const onSubmit = vi.fn()
      const def = createForm({
        fields: { color: { initial: '' } },
        onSubmit,
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Select name="color" options={options} label="Color" />
          </Form>
        )
      }
      render(<TestForm />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getAllByRole('option')[0]) // Alpha
      expect(screen.getByRole('combobox')).toHaveTextContent('Alpha')
    })

    it('onClose marks field as touched', async () => {
      const def = createForm({
        fields: {
          color: { initial: '', validate: v.required('Required') },
        },
        onSubmit: vi.fn(),
        validateOn: 'blur',
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Select name="color" options={options} label="Color" />
            <button>Other</button>
          </Form>
        )
      }
      render(<TestForm />)
      // Open and close without selecting
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{Escape}')
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('works standalone without form context', () => {
      render(<Select name="color" options={options} value="a" />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Alpha')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('no axe violations (closed)', async () => {
      const { container } = render(
        <Select name="test" options={options} label="Color" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('no axe violations (open)', async () => {
      const { container } = render(
        <Select name="test" options={options} label="Color" />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('trigger has role="combobox"', () => {
      render(<Select name="test" options={options} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('trigger has aria-expanded', async () => {
      render(<Select name="test" options={options} />)
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('trigger has aria-haspopup="listbox"', () => {
      render(<Select name="test" options={options} />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      )
    })

    it('listbox has role="listbox"', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('options have role="option" with aria-selected', async () => {
      render(<Select name="test" options={options} value="a" />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('aria-selected', 'true')
      expect(optionEls[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('aria-invalid set when error', () => {
      render(<Select name="test" options={options} error="Bad" />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    it('aria-describedby points to error', () => {
      render(<Select name="test" options={options} error="Bad" />)
      const trigger = screen.getByRole('combobox')
      const describedBy = trigger.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const errorEl = document.getElementById(describedBy)
      expect(errorEl).toHaveTextContent('Bad')
    })

    it('disabled options have aria-disabled', async () => {
      render(<Select name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[3]).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Styles ───────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<Select name="test" options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-select)', () => {
      render(<Select name="test" options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@scope (.ui-select)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(
        <Select name="test" options={options} error="Error" />
      )
      expect(container.querySelector('.ui-select')).toHaveAttribute(
        'data-invalid',
        ''
      )
    })
  })

  // ─── Display name ─────────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Select"', () => {
      expect(Select.displayName).toBe('Select')
    })
  })
})
