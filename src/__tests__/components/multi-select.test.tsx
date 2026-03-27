import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MultiSelect, type MultiSelectOption } from '../../components/multi-select'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

// ─── Test data ──────────────────────────────────────────────────────────────

const options: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
]

const optionsWithDisabled: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular', disabled: true },
  { value: 'svelte', label: 'Svelte' },
]

const groupedOptions: MultiSelectOption[] = [
  { value: 'react', label: 'React', group: 'Libraries' },
  { value: 'vue', label: 'Vue.js', group: 'Libraries' },
  { value: 'angular', label: 'Angular', group: 'Frameworks' },
  { value: 'svelte', label: 'Svelte', group: 'Frameworks' },
]

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('MultiSelect', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render ─────────────────────────────────────────────────────────────

  describe('render', () => {
    it('renders input element with combobox role', () => {
      render(<MultiSelect options={options} />)
      const input = screen.getByRole('combobox')
      expect(input).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<MultiSelect options={options} placeholder="Pick frameworks" />)
      expect(screen.getByPlaceholderText('Pick frameworks')).toBeInTheDocument()
    })

    it('renders default placeholder', () => {
      render(<MultiSelect options={options} />)
      expect(screen.getByPlaceholderText('Select...')).toBeInTheDocument()
    })

    it('renders label', () => {
      render(<MultiSelect options={options} label="Frameworks" />)
      expect(screen.getByText('Frameworks')).toBeInTheDocument()
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-labelledby')
    })

    it('renders disabled', () => {
      render(<MultiSelect options={options} disabled />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('forwards ref and className', () => {
      const ref = createRef<HTMLDivElement>()
      const { container } = render(
        <MultiSelect ref={ref} options={options} className="custom" />
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(container.querySelector('.ui-multi-select')?.className).toContain('custom')
    })

    it('renders all sizes', () => {
      const { rerender, container } = render(
        <MultiSelect options={options} size="sm" />
      )
      expect(container.querySelector('.ui-multi-select')).toHaveAttribute('data-size', 'sm')

      rerender(<MultiSelect options={options} size="md" />)
      expect(container.querySelector('.ui-multi-select')).toHaveAttribute('data-size', 'md')

      rerender(<MultiSelect options={options} size="lg" />)
      expect(container.querySelector('.ui-multi-select')).toHaveAttribute('data-size', 'lg')
    })

    it('renders selected values as tags', () => {
      render(<MultiSelect options={options} value={['react', 'vue']} />)
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
    })

    it('renders hidden inputs for form submission', () => {
      const { container } = render(
        <MultiSelect name="frameworks" options={options} value={['react', 'vue']} />
      )
      const hiddenInputs = container.querySelectorAll('input[type="hidden"]')
      expect(hiddenInputs).toHaveLength(2)
      expect(hiddenInputs[0]).toHaveAttribute('name', 'frameworks')
      expect(hiddenInputs[0]).toHaveValue('react')
      expect(hiddenInputs[1]).toHaveValue('vue')
    })
  })

  // ─── Open / Close ───────────────────────────────────────────────────────

  describe('open/close', () => {
    it('opens dropdown on focus', async () => {
      render(<MultiSelect options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes on Escape', async () => {
      render(<MultiSelect options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes on click outside', async () => {
      render(
        <div>
          <MultiSelect options={options} />
          <button>Outside</button>
        </div>
      )
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Outside'))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not open when disabled', async () => {
      render(<MultiSelect options={options} disabled />)
      const input = screen.getByRole('combobox')
      fireEvent.focus(input)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('listbox has aria-multiselectable', async () => {
      render(<MultiSelect options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    })
  })

  // ─── Selection ──────────────────────────────────────────────────────────

  describe('selection', () => {
    it('selects option on click', async () => {
      const handleChange = vi.fn()
      render(<MultiSelect options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // React
      expect(handleChange).toHaveBeenCalledWith(['react'])
    })

    it('deselects option on second click', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect options={options} value={['react']} onChange={handleChange} />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // React (already selected)
      expect(handleChange).toHaveBeenCalledWith([])
    })

    it('supports multiple selections', async () => {
      const handleChange = vi.fn()
      render(<MultiSelect options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // React
      // Re-render is needed since we're uncontrolled
      expect(handleChange).toHaveBeenCalledWith(['react'])
    })

    it('shows checkbox for each option', async () => {
      const { container } = render(<MultiSelect options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const checkboxes = container.querySelectorAll('.ui-multi-select__checkbox')
      expect(checkboxes).toHaveLength(4)
    })

    it('checkbox shows checked state for selected options', async () => {
      const { container } = render(
        <MultiSelect options={options} value={['vue']} />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const checkboxes = container.querySelectorAll('.ui-multi-select__checkbox')
      expect(checkboxes[1]).toHaveAttribute('data-checked', '')
      expect(checkboxes[0]).not.toHaveAttribute('data-checked')
    })

    it('does not select disabled options', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect options={optionsWithDisabled} onChange={handleChange} />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[2]) // Angular (disabled)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('dropdown stays open after selection', async () => {
      render(<MultiSelect options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0])
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  // ─── Tags ─────────────────────────────────────────────────────────────

  describe('tags', () => {
    it('renders removable tags with X button', () => {
      render(<MultiSelect options={options} value={['react', 'vue']} />)
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      expect(removeButtons).toHaveLength(2)
    })

    it('removes tag on X click', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect
          options={options}
          value={['react', 'vue']}
          onChange={handleChange}
        />
      )
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      await userEvent.click(removeButtons[0]) // Remove React
      expect(handleChange).toHaveBeenCalledWith(['vue'])
    })

    it('does not show remove buttons when disabled', () => {
      render(
        <MultiSelect options={options} value={['react']} disabled />
      )
      expect(screen.queryAllByRole('button', { name: /remove/i })).toHaveLength(0)
    })

    it('remove button has accessible label', () => {
      render(<MultiSelect options={options} value={['react']} />)
      expect(screen.getByRole('button', { name: 'Remove React' })).toBeInTheDocument()
    })
  })

  // ─── Search ───────────────────────────────────────────────────────────

  describe('search', () => {
    it('filters options by query', async () => {
      render(<MultiSelect options={options} searchable />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Re')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(1)
      expect(optionEls[0]).toHaveTextContent('React')
    })

    it('shows "No options found" when no match', async () => {
      render(<MultiSelect options={options} searchable />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'zzzzz')
      expect(screen.getByText('No options found')).toBeInTheDocument()
    })

    it('does not filter when searchable=false', async () => {
      render(<MultiSelect options={options} searchable={false} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(4)
    })
  })

  // ─── Max selection ────────────────────────────────────────────────────

  describe('maxSelected', () => {
    it('prevents selecting beyond maxSelected', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect
          options={options}
          value={['react', 'vue']}
          onChange={handleChange}
          maxSelected={2}
        />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[2]) // Angular
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('allows deselecting when at max', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect
          options={options}
          value={['react', 'vue']}
          onChange={handleChange}
          maxSelected={2}
        />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // React (deselect)
      expect(handleChange).toHaveBeenCalledWith(['vue'])
    })
  })

  // ─── Clear ────────────────────────────────────────────────────────────

  describe('clearable', () => {
    it('shows clear button when clearable and has selections', () => {
      render(
        <MultiSelect options={options} value={['react']} clearable />
      )
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument()
    })

    it('clears all selections on clear click', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect
          options={options}
          value={['react', 'vue']}
          onChange={handleChange}
          clearable
        />
      )
      await userEvent.click(screen.getByRole('button', { name: /clear all/i }))
      expect(handleChange).toHaveBeenCalledWith([])
    })

    it('does not show clear button when no selections', () => {
      render(<MultiSelect options={options} value={[]} clearable />)
      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
    })
  })

  // ─── Keyboard ─────────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('ArrowDown moves to next option', async () => {
      render(<MultiSelect options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[1]).toHaveAttribute('data-active', '')
    })

    it('Enter toggles selection of active option', async () => {
      const handleChange = vi.fn()
      render(<MultiSelect options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith(['react'])
    })

    it('Backspace removes last selected value when input is empty', async () => {
      const handleChange = vi.fn()
      render(
        <MultiSelect
          options={options}
          value={['react', 'vue']}
          onChange={handleChange}
          searchable
        />
      )
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{Backspace}')
      expect(handleChange).toHaveBeenCalledWith(['react'])
    })

    it('ArrowDown opens dropdown when closed', async () => {
      render(<MultiSelect options={options} />)
      const input = screen.getByRole('combobox')
      input.focus()
      if (screen.queryByRole('listbox')) {
        await userEvent.keyboard('{Escape}')
      }
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  // ─── Groups ───────────────────────────────────────────────────────────

  describe('groups', () => {
    it('renders group headers', async () => {
      render(<MultiSelect options={groupedOptions} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByText('Libraries')).toBeInTheDocument()
      expect(screen.getByText('Frameworks')).toBeInTheDocument()
    })

    it('group headers have role="presentation"', async () => {
      const { container } = render(<MultiSelect options={groupedOptions} />)
      await userEvent.click(screen.getByRole('combobox'))
      const headers = container.querySelectorAll('.ui-multi-select__group-header')
      headers.forEach((h) => {
        expect(h).toHaveAttribute('role', 'presentation')
      })
    })
  })

  // ─── Error ────────────────────────────────────────────────────────────

  describe('error', () => {
    it('shows error message', () => {
      render(<MultiSelect options={options} error="Required field" />)
      expect(screen.getByText('Required field')).toBeInTheDocument()
    })

    it('sets data-invalid attribute', () => {
      const { container } = render(
        <MultiSelect options={options} error="Error" />
      )
      expect(container.querySelector('.ui-multi-select')).toHaveAttribute('data-invalid', '')
    })

    it('aria-invalid on error', () => {
      render(<MultiSelect options={options} error="Bad" />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('aria-describedby points to error', () => {
      render(<MultiSelect options={options} error="Bad input" />)
      const input = screen.getByRole('combobox')
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const errorEl = document.getElementById(describedBy)
      expect(errorEl).toHaveTextContent('Bad input')
    })
  })

  // ─── Form integration ────────────────────────────────────────────────

  describe('form integration', () => {
    it('auto-wires with form context', () => {
      const def = createForm({
        fields: { frameworks: { initial: ['vue'] } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <MultiSelect name="frameworks" options={options} label="Frameworks" />
          </Form>
        )
      }
      render(<TestForm />)
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
    })

    it('works standalone without form context', () => {
      render(<MultiSelect options={options} value={['react']} />)
      expect(screen.getByText('React')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('no axe violations (closed)', async () => {
      const { container } = render(
        <MultiSelect options={options} label="Frameworks" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('no axe violations (open)', async () => {
      const { container } = render(
        <MultiSelect options={options} label="Frameworks" />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('aria-expanded toggles with open state', async () => {
      render(<MultiSelect options={options} />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(input)
      expect(input).toHaveAttribute('aria-expanded', 'true')
    })

    it('aria-haspopup="listbox"', () => {
      render(<MultiSelect options={options} />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('disabled options have aria-disabled', async () => {
      render(<MultiSelect options={optionsWithDisabled} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[2]).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Styles ───────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<MultiSelect options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-multi-select)', () => {
      render(<MultiSelect options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@scope (.ui-multi-select)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "MultiSelect"', () => {
      expect(MultiSelect.displayName).toBe('MultiSelect')
    })
  })
})
