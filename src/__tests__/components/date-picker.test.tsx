import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DatePicker } from '../../components/date-picker'

expect.extend(toHaveNoViolations)

describe('DatePicker', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a container div', () => {
      const { container } = render(<DatePicker aria-label="Date" />)
      expect(container.querySelector('.ui-date-picker')).toBeInTheDocument()
    })

    it('applies ui-date-picker class', () => {
      const { container } = render(<DatePicker aria-label="Date" />)
      expect(container.querySelector('.ui-date-picker')).toBeInTheDocument()
    })

    it('renders a text input', () => {
      render(<DatePicker aria-label="Date" />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders calendar icon button', () => {
      render(<DatePicker aria-label="Date" />)
      expect(screen.getByRole('button', { name: /calendar/i })).toBeInTheDocument()
    })

    it('renders placeholder text', () => {
      render(<DatePicker aria-label="Date" placeholder="Pick a date" />)
      expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument()
    })

    it('renders label when provided', () => {
      render(<DatePicker label="Start date" />)
      expect(screen.getByText('Start date')).toBeInTheDocument()
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<DatePicker aria-label="Date" />)
      expect(container.querySelector('.ui-date-picker')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<DatePicker aria-label="Date" size="sm" />)
      expect(container.querySelector('.ui-date-picker')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<DatePicker aria-label="Date" size="lg" />)
      expect(container.querySelector('.ui-date-picker')).toHaveAttribute('data-size', 'lg')
    })

    it('displays formatted date when value is set', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      // Should display some formatted date (locale-aware)
      expect(input.value).toBeTruthy()
    })
  })

  // ─── Calendar open/close ──────────────────────────────────────────

  describe('calendar open/close', () => {
    it('opens calendar when calendar button is clicked', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('opens calendar on input focus/click', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closes calendar on Escape key', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders a grid inside the calendar dialog', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('does not open calendar when disabled', () => {
      render(<DatePicker aria-label="Date" disabled />)
      fireEvent.click(screen.getByRole('combobox'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // ─── Date selection ───────────────────────────────────────────────

  describe('date selection', () => {
    it('calls onChange when a date cell is clicked', () => {
      const onChange = vi.fn()
      render(<DatePicker aria-label="Date" value="2025-03-15" onChange={onChange} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      // Find day 20 button in the grid
      const grid = screen.getByRole('grid')
      const day20 = within(grid).getByText('20')
      fireEvent.click(day20)
      expect(onChange).toHaveBeenCalledWith('2025-03-20')
    })

    it('closes calendar after selecting a date', () => {
      const onChange = vi.fn()
      render(<DatePicker aria-label="Date" value="2025-03-15" onChange={onChange} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day10 = within(grid).getByText('10')
      fireEvent.click(day10)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('works in uncontrolled mode with defaultValue', () => {
      render(<DatePicker aria-label="Date" defaultValue="2025-06-01" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      expect(input.value).toBeTruthy()
    })
  })

  // ─── Month navigation ────────────────────────────────────────────

  describe('month navigation', () => {
    it('navigates to next month', () => {
      render(<DatePicker aria-label="Date" value="2025-01-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      // Should show January 2025
      expect(screen.getByText(/January/i)).toBeInTheDocument()

      // Click next month
      fireEvent.click(screen.getByRole('button', { name: /next month/i }))
      expect(screen.getByText(/February/i)).toBeInTheDocument()
    })

    it('navigates to previous month', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      expect(screen.getByText(/March/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /previous month/i }))
      expect(screen.getByText(/February/i)).toBeInTheDocument()
    })
  })

  // ─── Min/max enforcement ──────────────────────────────────────────

  describe('min/max enforcement', () => {
    it('disables dates before min', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" min="2025-03-10" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      // Use data-day attribute to find specific in-month day
      const day5 = grid.querySelector('button[data-day="5"]')!
      expect(day5).toBeDisabled()
    })

    it('disables dates after max', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" max="2025-03-20" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day25 = grid.querySelector('button[data-day="25"]')!
      expect(day25).toBeDisabled()
    })

    it('does not call onChange for disabled dates', () => {
      const onChange = vi.fn()
      render(<DatePicker aria-label="Date" value="2025-03-15" min="2025-03-10" onChange={onChange} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day5 = grid.querySelector('button[data-day="5"]')!
      fireEvent.click(day5)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Today highlight ──────────────────────────────────────────────

  describe('today highlight', () => {
    it('highlights today', () => {
      const today = new Date()
      const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      render(<DatePicker aria-label="Date" value={todayISO} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const todayCell = within(grid).getByText(String(today.getDate()))
      expect(todayCell.closest('button')).toHaveAttribute('data-today', 'true')
    })
  })

  // ─── Keyboard navigation ─────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('selects date on Enter key in calendar', () => {
      const onChange = vi.fn()
      render(<DatePicker aria-label="Date" value="2025-03-15" onChange={onChange} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day15 = grid.querySelector('button[data-day="15"]') as HTMLButtonElement
      day15.focus()
      fireEvent.keyDown(day15, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith('2025-03-15')
    })

    it('navigates with ArrowRight in grid', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day15 = within(grid).getByText('15').closest('button')!
      day15.focus()
      fireEvent.keyDown(day15, { key: 'ArrowRight' })
      // Focus should move to day 16
      const day16 = within(grid).getByText('16').closest('button')!
      expect(document.activeElement).toBe(day16)
    })

    it('navigates with ArrowLeft in grid', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day15 = within(grid).getByText('15').closest('button')!
      day15.focus()
      fireEvent.keyDown(day15, { key: 'ArrowLeft' })
      const day14 = within(grid).getByText('14').closest('button')!
      expect(document.activeElement).toBe(day14)
    })

    it('navigates with ArrowDown (next week) in grid', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const day15 = within(grid).getByText('15').closest('button')!
      day15.focus()
      fireEvent.keyDown(day15, { key: 'ArrowDown' })
      const day22 = within(grid).getByText('22').closest('button')!
      expect(document.activeElement).toBe(day22)
    })
  })

  // ─── Error state ──────────────────────────────────────────────────

  describe('error state', () => {
    it('shows error message', () => {
      render(<DatePicker aria-label="Date" error="Date is required" />)
      expect(screen.getByText('Date is required')).toBeInTheDocument()
    })

    it('sets data-invalid when error is provided', () => {
      const { container } = render(<DatePicker aria-label="Date" error="Error" />)
      expect(container.querySelector('.ui-date-picker')).toHaveAttribute('data-invalid', '')
    })
  })

  // ─── First day of week ───────────────────────────────────────────

  describe('first day of week', () => {
    it('starts week on Monday by default', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const headers = within(grid).getAllByRole('columnheader')
      expect(headers[0].textContent).toBe('Mo')
    })

    it('starts week on Sunday when firstDayOfWeek=0', () => {
      render(<DatePicker aria-label="Date" value="2025-03-15" firstDayOfWeek={0} />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))

      const grid = screen.getByRole('grid')
      const headers = within(grid).getAllByRole('columnheader')
      expect(headers[0].textContent).toBe('Su')
    })
  })

  // ─── Controlled vs uncontrolled ───────────────────────────────────

  describe('controlled vs uncontrolled', () => {
    it('controlled mode: updates display when value changes', () => {
      const { rerender } = render(<DatePicker aria-label="Date" value="2025-01-01" />)
      const input = screen.getByRole('combobox') as HTMLInputElement
      const val1 = input.value

      rerender(<DatePicker aria-label="Date" value="2025-12-31" />)
      expect(input.value).not.toBe(val1)
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<DatePicker ref={ref} aria-label="Date" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<DatePicker aria-label="Date" className="custom" />)
      expect(container.querySelector('.ui-date-picker')!.className).toContain('custom')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (closed)', async () => {
      const { container } = render(<DatePicker aria-label="Date" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (open)', async () => {
      const { container } = render(<DatePicker aria-label="Date" value="2025-03-15" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('calendar has role="dialog"', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('calendar contains role="grid"', () => {
      render(<DatePicker aria-label="Date" />)
      fireEvent.click(screen.getByRole('button', { name: /calendar/i }))
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<DatePicker aria-label="Date" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-date-picker)', () => {
      render(<DatePicker aria-label="Date" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-date-picker)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "DatePicker"', () => {
      expect(DatePicker.displayName).toBe('DatePicker')
    })
  })
})
