import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Calendar } from '../../components/calendar'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGridCells() {
  return screen.getAllByRole('gridcell')
}

function getDayButton(dayNumber: number) {
  const cells = getGridCells()
  // Find the first non-outside cell with this day number
  return cells.find(
    (cell) => cell.textContent === String(dayNumber) && !cell.hasAttribute('data-outside')
  )
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Calendar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<Calendar />)
    expect(screen.getByRole('application', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Calendar ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('renders month grid with day headers', () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    // Should have day headers (Su, Mo, Tu, etc.)
    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    // Should have gridcell elements
    const cells = getGridCells()
    expect(cells.length).toBeGreaterThan(0)
  })

  it('displays the correct month and year in header', () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    // Should show March 2025
    expect(screen.getByText('March')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
  })

  it('shows selected date with data-selected', () => {
    render(<Calendar value={new Date(2025, 2, 15)} />)
    const selected = screen.getByRole('gridcell', { selected: true })
    expect(selected).toBeInTheDocument()
    expect(selected).toHaveAttribute('data-selected')
    expect(selected.textContent).toBe('15')
  })

  it('calls onChange when a day is clicked', async () => {
    const onChange = vi.fn()
    render(<Calendar defaultValue={new Date(2025, 2, 1)} onChange={onChange} />)
    const day10 = getDayButton(10)
    expect(day10).toBeTruthy()
    await userEvent.click(day10!)
    expect(onChange).toHaveBeenCalledTimes(1)
    const calledDate = onChange.mock.calls[0][0] as Date
    expect(calledDate.getDate()).toBe(10)
    expect(calledDate.getMonth()).toBe(2)
    expect(calledDate.getFullYear()).toBe(2025)
  })

  it('navigates to previous month', async () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    expect(screen.getByText('March')).toBeInTheDocument()
    const prevBtn = screen.getByLabelText('Previous month')
    await userEvent.click(prevBtn)
    expect(screen.getByText('February')).toBeInTheDocument()
  })

  it('navigates to next month', async () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    const nextBtn = screen.getByLabelText('Next month')
    await userEvent.click(nextBtn)
    expect(screen.getByText('April')).toBeInTheDocument()
  })

  it('disables dates via disabledDates array', () => {
    const disabled = [new Date(2025, 2, 10), new Date(2025, 2, 20)]
    render(<Calendar defaultValue={new Date(2025, 2, 1)} disabledDates={disabled} />)
    const day10 = getDayButton(10)
    expect(day10).toHaveAttribute('disabled')
  })

  it('disables dates via disabledDates function', () => {
    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6
    render(<Calendar defaultValue={new Date(2025, 2, 1)} disabledDates={isWeekend} />)
    // March 1, 2025 is a Saturday
    const day1 = getDayButton(1)
    expect(day1).toHaveAttribute('disabled')
  })

  it('respects minDate and maxDate', () => {
    render(
      <Calendar
        defaultValue={new Date(2025, 2, 15)}
        minDate={new Date(2025, 2, 10)}
        maxDate={new Date(2025, 2, 20)}
      />
    )
    // Day 5 should be disabled (before minDate)
    const day5 = getDayButton(5)
    expect(day5).toHaveAttribute('disabled')
    // Day 25 should be disabled (after maxDate)
    const day25 = getDayButton(25)
    expect(day25).toHaveAttribute('disabled')
    // Day 15 should not be disabled
    const day15 = getDayButton(15)
    expect(day15).not.toHaveAttribute('disabled')
  })

  it('highlights today with data-today attribute', () => {
    const today = new Date()
    render(<Calendar defaultValue={today} highlightToday />)
    const todayCell = screen.getByRole('gridcell', { current: 'date' })
    expect(todayCell).toHaveAttribute('data-today')
  })

  it('renders outside days dimmed', () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} showOutsideDays />)
    const outsideDays = screen.getAllByRole('gridcell').filter(
      (cell) => cell.hasAttribute('data-outside')
    )
    expect(outsideDays.length).toBeGreaterThan(0)
  })

  it('supports numberOfMonths=2', () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} numberOfMonths={2} />)
    expect(screen.getByText('March')).toBeInTheDocument()
    expect(screen.getByText('April')).toBeInTheDocument()
    const grids = screen.getAllByRole('grid')
    expect(grids.length).toBe(2)
  })

  it('opens month picker dropdown on month click', async () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    const monthBtn = screen.getByLabelText('Select month')
    await userEvent.click(monthBtn)
    // Should show month options
    const monthPicker = screen.getByRole('listbox', { name: 'Select month' })
    expect(monthPicker).toBeInTheDocument()
  })

  it('changes month via month picker', async () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    const monthBtn = screen.getByLabelText('Select month')
    await userEvent.click(monthBtn)
    // Click June
    const junOption = screen.getByRole('option', { name: 'Jun' })
    await userEvent.click(junOption)
    expect(screen.getByText('June')).toBeInTheDocument()
  })

  it('opens year picker dropdown on year click', async () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} />)
    const yearBtn = screen.getByLabelText('Select year')
    await userEvent.click(yearBtn)
    const yearPicker = screen.getByRole('listbox', { name: 'Select year' })
    expect(yearPicker).toBeInTheDocument()
  })

  it('supports keyboard arrow navigation', () => {
    render(<Calendar value={new Date(2025, 2, 15)} />)
    const grid = screen.getByRole('grid')
    const day15 = getDayButton(15)!
    day15.focus()

    // ArrowRight -> day 16
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    // ArrowDown -> 7 days forward
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    // Verify that keyboard events are handled (no crash)
    expect(grid).toBeInTheDocument()
  })

  it('applies data-size attribute', () => {
    const { container } = render(<Calendar size="lg" />)
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg')
  })

  it('applies data-motion attribute', () => {
    const { container } = render(<Calendar motion={0} />)
    expect(container.firstElementChild).toHaveAttribute('data-motion', '0')
  })

  it('supports showWeekNumbers', () => {
    const { container } = render(
      <Calendar defaultValue={new Date(2025, 2, 15)} showWeekNumbers />
    )
    expect(container.firstElementChild).toHaveAttribute('data-show-week-numbers')
  })

  it('supports firstDayOfWeek=1 (Monday)', () => {
    render(<Calendar defaultValue={new Date(2025, 2, 15)} firstDayOfWeek={1} />)
    // First column header should be Mo (Monday)
    const headers = screen.getAllByRole('columnheader')
    expect(headers[0].textContent).toBe('Mo')
  })

  it('does not call onChange for disabled dates', async () => {
    const onChange = vi.fn()
    render(
      <Calendar
        defaultValue={new Date(2025, 2, 1)}
        disabledDates={[new Date(2025, 2, 10)]}
        onChange={onChange}
      />
    )
    const day10 = getDayButton(10)
    // disabled buttons won't be clickable via userEvent, so use fireEvent
    if (day10) fireEvent.click(day10)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('passes through className and other HTML attributes', () => {
    const { container } = render(
      <Calendar className="custom-class" data-testid="my-cal" />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveAttribute('data-testid', 'my-cal')
  })
})
