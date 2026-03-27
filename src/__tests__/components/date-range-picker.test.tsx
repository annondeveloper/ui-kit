import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { DateRangePicker, type DateRangePreset } from '../../components/date-range-picker'

// ─── Helpers ────────────────────────────────────────────────────────────────

const presets: DateRangePreset[] = [
  {
    label: 'Last 7 days',
    range: [new Date(2025, 2, 8), new Date(2025, 2, 15)],
  },
  {
    label: 'Last 30 days',
    range: [new Date(2025, 1, 13), new Date(2025, 2, 15)],
  },
  {
    label: 'This month',
    range: [new Date(2025, 2, 1), new Date(2025, 2, 31)],
  },
]

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('DateRangePicker', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<DateRangePicker />)
    expect(screen.getByText('Select date range')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<DateRangePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('shows placeholder when no value', () => {
    render(<DateRangePicker placeholder="Pick dates" />)
    expect(screen.getByText('Pick dates')).toBeInTheDocument()
  })

  it('shows formatted range when value is provided', () => {
    render(
      <DateRangePicker
        value={[new Date(2025, 2, 15), new Date(2025, 2, 27)]}
      />
    )
    // Should show "Mar 15 – Mar 27" (locale dependent)
    const trigger = screen.getByRole('button', { name: /15/i })
    expect(trigger.textContent).toContain('15')
    expect(trigger.textContent).toContain('27')
  })

  it('opens popover on trigger click', async () => {
    render(<DateRangePicker />)
    const trigger = screen.getByRole('button')
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes popover on escape', async () => {
    render(<DateRangePicker />)
    const trigger = screen.getByRole('button')
    await userEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders presets sidebar when presets provided', async () => {
    render(<DateRangePicker presets={presets} />)
    const trigger = screen.getByRole('button')
    await userEvent.click(trigger)
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()
  })

  it('selects a preset and calls onChange', async () => {
    const onChange = vi.fn()
    render(<DateRangePicker presets={presets} onChange={onChange} />)
    const trigger = screen.getByRole('button')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByText('Last 7 days'))
    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0][0] as [Date, Date]
    expect(start.getDate()).toBe(8)
    expect(end.getDate()).toBe(15)
  })

  it('shows clear button when value is set', () => {
    render(
      <DateRangePicker
        value={[new Date(2025, 2, 15), new Date(2025, 2, 27)]}
      />
    )
    expect(screen.getByLabelText('Clear date range')).toBeInTheDocument()
  })

  it('clears value on clear button click', async () => {
    const onChange = vi.fn()
    render(
      <DateRangePicker
        value={[new Date(2025, 2, 15), new Date(2025, 2, 27)]}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByLabelText('Clear date range'))
    expect(onChange).toHaveBeenCalledWith([null, null])
  })

  it('shows label when provided', () => {
    render(<DateRangePicker label="Date range" />)
    expect(screen.getByText('Date range')).toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    render(<DateRangePicker error="Required field" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })

  it('applies data-invalid when error is present', () => {
    const { container } = render(<DateRangePicker error="Error" />)
    expect(container.firstElementChild).toHaveAttribute('data-invalid')
  })

  it('disables trigger when disabled prop is set', () => {
    const { container } = render(<DateRangePicker disabled />)
    expect(container.firstElementChild).toHaveAttribute('data-disabled')
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders 2-month calendar in popover', async () => {
    render(<DateRangePicker />)
    await userEvent.click(screen.getByRole('button'))
    // Should have 2 grids (2 months side-by-side)
    const grids = screen.getAllByRole('grid')
    expect(grids.length).toBe(2)
  })

  it('applies data-size attribute', () => {
    const { container } = render(<DateRangePicker size="lg" />)
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg')
  })

  it('applies data-motion attribute', () => {
    const { container } = render(<DateRangePicker motion={0} />)
    expect(container.firstElementChild).toHaveAttribute('data-motion', '0')
  })

  it('passes through className and other HTML attributes', () => {
    const { container } = render(
      <DateRangePicker className="custom-class" data-testid="my-drp" />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveAttribute('data-testid', 'my-drp')
  })

  it('sets aria-expanded on trigger', async () => {
    render(<DateRangePicker />)
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('has calendar icon in trigger', () => {
    render(<DateRangePicker />)
    const trigger = screen.getByRole('button')
    // The trigger should contain an SVG (calendar icon)
    const svg = trigger.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
