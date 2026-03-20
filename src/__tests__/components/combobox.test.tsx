import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Combobox, type ComboboxOption } from '../../components/combobox'
import { Form } from '../../core/forms/form-component'
import { useForm } from '../../core/forms/use-form'
import { createForm } from '../../core/forms/create-form'
import { v } from '../../core/forms/validators'

expect.extend(toHaveNoViolations)

// ─── Test data ──────────────────────────────────────────────────────────────

const options: ComboboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
]

const optionsWithDisabled: ComboboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular', disabled: true },
  { value: 'svelte', label: 'Svelte' },
]

const groupedOptions: ComboboxOption[] = [
  { value: 'react', label: 'React', group: 'Libraries' },
  { value: 'vue', label: 'Vue.js', group: 'Libraries' },
  { value: 'angular', label: 'Angular', group: 'Frameworks' },
  { value: 'svelte', label: 'Svelte', group: 'Frameworks' },
]

const optionsWithDesc: ComboboxOption[] = [
  { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
  { value: 'vue', label: 'Vue.js', description: 'Progressive JavaScript framework' },
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

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Combobox', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render ─────────────────────────────────────────────────────────────

  describe('render', () => {
    it('renders input element', () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('renders with placeholder', () => {
      render(<Combobox name="test" options={options} placeholder="Pick a framework" />)
      expect(screen.getByPlaceholderText('Pick a framework')).toBeInTheDocument()
    })

    it('renders default placeholder', () => {
      render(<Combobox name="test" options={options} />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('renders label', () => {
      render(<Combobox name="test" options={options} label="Framework" />)
      expect(screen.getByText('Framework')).toBeInTheDocument()
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-labelledby')
    })

    it('renders disabled', () => {
      render(<Combobox name="test" options={options} disabled />)
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('forwards ref and className', () => {
      const ref = createRef<HTMLDivElement>()
      const { container } = render(
        <Combobox ref={ref} name="test" options={options} className="custom" />
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(container.querySelector('.ui-combobox')?.className).toContain('custom')
    })

    it('renders all sizes', () => {
      const { rerender, container } = render(
        <Combobox name="test" options={options} size="sm" />
      )
      expect(container.querySelector('.ui-combobox')).toHaveAttribute('data-size', 'sm')

      rerender(<Combobox name="test" options={options} size="md" />)
      expect(container.querySelector('.ui-combobox')).toHaveAttribute('data-size', 'md')

      rerender(<Combobox name="test" options={options} size="lg" />)
      expect(container.querySelector('.ui-combobox')).toHaveAttribute('data-size', 'lg')
    })

    it('renders selected value in input when value provided', () => {
      render(<Combobox name="test" options={options} value="vue" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('Vue.js')
    })

    it('renders selected value for defaultValue', () => {
      render(<Combobox name="test" options={options} defaultValue="angular" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('Angular')
    })

    it('renders hidden input with name and value', () => {
      const { container } = render(
        <Combobox name="framework" options={options} value="react" />
      )
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toBeInTheDocument()
      expect(hidden).toHaveAttribute('name', 'framework')
      expect(hidden).toHaveValue('react')
    })
  })

  // ─── Open / Close ───────────────────────────────────────────────────────

  describe('open/close', () => {
    it('opens dropdown on focus', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('opens on typing', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      // Focus first, then close, then type to reopen
      await userEvent.type(input, 'r')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('closes on Escape', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes on option select', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const listbox = screen.getByRole('listbox')
      const optionEls = within(listbox).getAllByRole('option')
      await userEvent.click(optionEls[0])
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('closes on click outside', async () => {
      render(
        <div>
          <Combobox name="test" options={options} />
          <button>Outside</button>
        </div>
      )
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Outside'))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('does not open when disabled', async () => {
      render(<Combobox name="test" options={options} disabled />)
      // Can't click a disabled input, so try focus
      const input = screen.getByRole('combobox')
      fireEvent.focus(input)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  // ─── Filtering ──────────────────────────────────────────────────────────

  describe('filtering', () => {
    it('filters options by typed query', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Re')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(1)
      expect(optionEls[0]).toHaveTextContent('React')
    })

    it('case-insensitive filtering', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'react')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(1)
      expect(optionEls[0]).toHaveTextContent('React')
    })

    it('shows all options when input is empty', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(4)
    })

    it('shows "No results found" when no match', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'zzzzz')
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(screen.queryAllByRole('option')).toHaveLength(0)
    })

    it('custom emptyMessage', async () => {
      render(<Combobox name="test" options={options} emptyMessage="Nothing here!" />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'zzzzz')
      expect(screen.getByText('Nothing here!')).toBeInTheDocument()
    })

    it('highlights matching text', async () => {
      const { container } = render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Re')
      const marks = container.querySelectorAll('mark.ui-combobox__match')
      expect(marks.length).toBeGreaterThanOrEqual(1)
      expect(marks[0]).toHaveTextContent('Re')
    })

    it('partial match filtering', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'ue')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(1)
      expect(optionEls[0]).toHaveTextContent('Vue.js')
    })
  })

  // ─── Selection ──────────────────────────────────────────────────────────

  describe('selection', () => {
    it('selects option on click', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[1]) // Vue.js
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('Vue.js')
    })

    it('calls onChange with value', async () => {
      const handleChange = vi.fn()
      render(<Combobox name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      await userEvent.click(optionEls[0]) // React
      expect(handleChange).toHaveBeenCalledWith('react')
    })

    it('displays selected label in input', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getAllByRole('option')[2]) // Angular
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('Angular')
    })

    it('Enter selects active option', async () => {
      const handleChange = vi.fn()
      render(<Combobox name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}') // Move to Vue.js (index 1)
      await userEvent.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('vue')
    })

    it('does not select disabled options', async () => {
      const handleChange = vi.fn()
      render(
        <Combobox name="test" options={optionsWithDisabled} onChange={handleChange} />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      // Angular is disabled (index 2 in the rendered list)
      await userEvent.click(optionEls[2])
      expect(handleChange).not.toHaveBeenCalled()
      // Dropdown should still be open
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('shows check icon on selected option', async () => {
      render(<Combobox name="test" options={options} value="vue" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      // Clear the input so all options show
      await userEvent.clear(input)
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[1]).toHaveAttribute('aria-selected', 'true')
      expect(optionEls[1].querySelector('.ui-combobox__check')).toBeInTheDocument()
    })
  })

  // ─── Keyboard ───────────────────────────────────────────────────────────

  describe('keyboard', () => {
    it('ArrowDown moves to next option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      // Active index starts at 0 (React)
      await userEvent.keyboard('{ArrowDown}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[1]).toHaveAttribute('data-active', '')
    })

    it('ArrowUp moves to previous option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}') // index 1
      await userEvent.keyboard('{ArrowUp}')   // index 0
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('data-active', '')
    })

    it('Home jumps to first option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{ArrowDown}{ArrowDown}') // index 2
      await userEvent.keyboard('{Home}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('data-active', '')
    })

    it('End jumps to last option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{End}')
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[3]).toHaveAttribute('data-active', '')
    })

    it('Enter selects', async () => {
      const handleChange = vi.fn()
      render(<Combobox name="test" options={options} onChange={handleChange} />)
      await userEvent.click(screen.getByRole('combobox'))
      // Active starts at 0 (React)
      await userEvent.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('react')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('Escape closes', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
      await userEvent.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('ArrowDown opens dropdown when closed', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      input.focus()
      // Close first if auto-opened
      if (screen.queryByRole('listbox')) {
        await userEvent.keyboard('{Escape}')
      }
      await userEvent.keyboard('{ArrowDown}')
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('does not go below last option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.keyboard('{End}') // Go to last
      await userEvent.keyboard('{ArrowDown}') // Try to go past
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[3]).toHaveAttribute('data-active', '')
    })

    it('does not go above first option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      // Active starts at 0
      await userEvent.keyboard('{ArrowUp}') // Try to go above
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[0]).toHaveAttribute('data-active', '')
    })
  })

  // ─── Create ─────────────────────────────────────────────────────────────

  describe('create', () => {
    it('shows "Create X" when allowCreate and no match', async () => {
      render(<Combobox name="test" options={options} allowCreate />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Ember')
      // Should show create option
      const createOption = screen.getByText(/Create/i)
      expect(createOption).toBeInTheDocument()
      expect(createOption.textContent).toContain('Ember')
    })

    it('calls onCreate when create option selected', async () => {
      const handleCreate = vi.fn()
      render(
        <Combobox name="test" options={options} allowCreate onCreate={handleCreate} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Ember')
      const createOption = screen.getByText(/Create/i)
      await userEvent.click(createOption)
      expect(handleCreate).toHaveBeenCalledWith('Ember')
    })

    it('does not show create when allowCreate=false', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Ember')
      expect(screen.queryByText(/Create/i)).not.toBeInTheDocument()
    })

    it('does not show create when query matches existing option', async () => {
      render(<Combobox name="test" options={options} allowCreate />)
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'React')
      expect(screen.queryByText(/Create/i)).not.toBeInTheDocument()
    })

    it('Enter selects create option when active', async () => {
      const handleCreate = vi.fn()
      render(
        <Combobox name="test" options={options} allowCreate onCreate={handleCreate} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Ember')
      // Navigate to the create option (it's after all filtered options = 0 matches)
      // Active starts at 0, which IS the create option since there are 0 filtered results
      await userEvent.keyboard('{Enter}')
      expect(handleCreate).toHaveBeenCalledWith('Ember')
    })
  })

  // ─── Async ──────────────────────────────────────────────────────────────

  describe('async', () => {
    it('calls onSearch when typing', async () => {
      const handleSearch = vi.fn()
      render(
        <Combobox name="test" options={options} onSearch={handleSearch} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Re')
      // onSearch called for each character
      expect(handleSearch).toHaveBeenCalledWith('R')
      expect(handleSearch).toHaveBeenCalledWith('Re')
    })

    it('shows loading spinner when loading=true', async () => {
      render(<Combobox name="test" options={[]} loading />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('does not apply local filtering when onSearch is provided', async () => {
      const handleSearch = vi.fn()
      // onSearch provided — consumer controls filtering, so all options should be shown
      render(
        <Combobox name="test" options={options} onSearch={handleSearch} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.click(input)
      await userEvent.type(input, 'Re')
      // All options should still render because onSearch means external filtering
      const optionEls = screen.getAllByRole('option')
      expect(optionEls).toHaveLength(4)
    })
  })

  // ─── Groups ─────────────────────────────────────────────────────────────

  describe('groups', () => {
    it('renders group headers', async () => {
      render(<Combobox name="test" options={groupedOptions} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByText('Libraries')).toBeInTheDocument()
      expect(screen.getByText('Frameworks')).toBeInTheDocument()
    })

    it('groups options under correct headers', async () => {
      const { container } = render(<Combobox name="test" options={groupedOptions} />)
      await userEvent.click(screen.getByRole('combobox'))
      const headers = container.querySelectorAll('.ui-combobox__group-header')
      expect(headers).toHaveLength(2)
      expect(headers[0]).toHaveTextContent('Libraries')
      expect(headers[1]).toHaveTextContent('Frameworks')
      // Options exist
      expect(screen.getAllByRole('option')).toHaveLength(4)
    })

    it('group headers have role="presentation"', async () => {
      const { container } = render(<Combobox name="test" options={groupedOptions} />)
      await userEvent.click(screen.getByRole('combobox'))
      const headers = container.querySelectorAll('.ui-combobox__group-header')
      headers.forEach((h) => {
        expect(h).toHaveAttribute('role', 'presentation')
      })
    })
  })

  // ─── Descriptions ──────────────────────────────────────────────────────

  describe('descriptions', () => {
    it('renders option descriptions', async () => {
      render(<Combobox name="test" options={optionsWithDesc} />)
      await userEvent.click(screen.getByRole('combobox'))
      expect(screen.getByText('A JavaScript library for building UIs')).toBeInTheDocument()
      expect(screen.getByText('Progressive JavaScript framework')).toBeInTheDocument()
    })
  })

  // ─── Form integration ──────────────────────────────────────────────────

  describe('form integration', () => {
    it('auto-wires with form context', () => {
      const def = createForm({
        fields: { framework: { initial: 'vue' } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Combobox name="framework" options={options} label="Framework" />
          </Form>
        )
      }
      render(<TestForm />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('Vue.js')
    })

    it('works standalone', () => {
      render(<Combobox name="framework" options={options} value="react" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('React')
    })

    it('auto-reads error from form context', () => {
      const def = createForm({
        fields: {
          framework: {
            initial: '',
            validate: v.required('Framework is required'),
          },
        },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Combobox name="framework" options={options} label="Framework" />
            <button type="submit">Submit</button>
          </Form>
        )
      }
      render(<TestForm />)
      fireEvent.submit(screen.getByRole('combobox').closest('form')!)
      expect(screen.getByText('Framework is required')).toBeInTheDocument()
    })

    it('onChange updates form value', async () => {
      const def = createForm({
        fields: { framework: { initial: '' } },
        onSubmit: vi.fn(),
      })
      function TestForm() {
        const form = useForm(def)
        return (
          <Form form={form}>
            <Combobox name="framework" options={options} label="Framework" />
          </Form>
        )
      }
      render(<TestForm />)
      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getAllByRole('option')[0]) // React
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBe('React')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('no axe violations (closed)', async () => {
      const { container } = render(
        <Combobox name="test" options={options} label="Framework" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('no axe violations (open)', async () => {
      const { container } = render(
        <Combobox name="test" options={options} label="Framework" />
      )
      await userEvent.click(screen.getByRole('combobox'))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('input has role="combobox"', () => {
      render(<Combobox name="test" options={options} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('input has aria-autocomplete="list"', () => {
      render(<Combobox name="test" options={options} />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-autocomplete',
        'list'
      )
    })

    it('input has aria-activedescendant pointing to active option', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const input = screen.getByRole('combobox')
      const activeId = input.getAttribute('aria-activedescendant')
      expect(activeId).toBeTruthy()
      const activeEl = document.getElementById(activeId!)
      expect(activeEl).toBeInTheDocument()
      expect(activeEl).toHaveAttribute('role', 'option')
    })

    it('options have unique IDs', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      const ids = optionEls.map((el) => el.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
      ids.forEach((id) => expect(id).toBeTruthy())
    })

    it('aria-invalid on error', () => {
      render(<Combobox name="test" options={options} error="Bad" />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    it('aria-describedby points to error', () => {
      render(<Combobox name="test" options={options} error="Bad input" />)
      const input = screen.getByRole('combobox')
      const describedBy = input.getAttribute('aria-describedby')!
      expect(describedBy).toBeTruthy()
      const errorEl = document.getElementById(describedBy)
      expect(errorEl).toHaveTextContent('Bad input')
    })

    it('aria-expanded toggles with open state', async () => {
      render(<Combobox name="test" options={options} />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(input)
      expect(input).toHaveAttribute('aria-expanded', 'true')
    })

    it('aria-haspopup="listbox"', () => {
      render(<Combobox name="test" options={options} />)
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      )
    })

    it('aria-controls points to listbox when open', async () => {
      render(<Combobox name="test" options={options} />)
      await userEvent.click(screen.getByRole('combobox'))
      const input = screen.getByRole('combobox')
      const controlsId = input.getAttribute('aria-controls')!
      expect(controlsId).toBeTruthy()
      const listbox = document.getElementById(controlsId)
      expect(listbox).toHaveAttribute('role', 'listbox')
    })

    it('disabled options have aria-disabled', async () => {
      render(<Combobox name="test" options={optionsWithDisabled} />)
      await userEvent.click(screen.getByRole('combobox'))
      const optionEls = screen.getAllByRole('option')
      expect(optionEls[2]).toHaveAttribute('aria-disabled', 'true')
    })
  })

  // ─── Styles ─────────────────────────────────────────────────────────────

  describe('styles', () => {
    it('CSS includes @layer components', () => {
      render(<Combobox name="test" options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-combobox)', () => {
      render(<Combobox name="test" options={options} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags)
        .map((s) => s.textContent)
        .join('')
      expect(allCSS).toContain('@scope (.ui-combobox)')
    })

    it('error state applies data-invalid attribute', () => {
      const { container } = render(
        <Combobox name="test" options={options} error="Error" />
      )
      expect(container.querySelector('.ui-combobox')).toHaveAttribute(
        'data-invalid',
        ''
      )
    })
  })

  // ─── Display name ──────────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Combobox"', () => {
      expect(Combobox.displayName).toBe('Combobox')
    })
  })
})
