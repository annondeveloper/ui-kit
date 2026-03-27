import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { TimePicker } from '../../components/time-picker'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('TimePicker', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders with default props', () => {
    render(<TimePicker />)
    expect(screen.getByText('Select time')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<TimePicker ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('shows placeholder when no value', () => {
    render(<TimePicker placeholder="Pick a time" />)
    expect(screen.getByText('Pick a time')).toBeInTheDocument()
  })

  it('shows formatted time when value is provided (12h)', () => {
    render(<TimePicker value="2:30 PM" format="12h" />)
    expect(screen.getByText('2:30 PM')).toBeInTheDocument()
  })

  it('shows formatted time when value is provided (24h)', () => {
    render(<TimePicker value="14:30" format="24h" />)
    expect(screen.getByText('14:30')).toBeInTheDocument()
  })

  it('opens dropdown on trigger click', async () => {
    render(<TimePicker />)
    const trigger = screen.getByRole('button', { name: /select time/i })
    await userEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('closes dropdown on escape', async () => {
    render(<TimePicker />)
    await userEvent.click(screen.getByRole('button', { name: /select time/i }))
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders hour and minute columns in 12h format', async () => {
    render(<TimePicker format="12h" />)
    await userEvent.click(screen.getByRole('button', { name: /select time/i }))
    // Should have Hr, Min columns plus AM/PM
    expect(screen.getByText('Hr')).toBeInTheDocument()
    expect(screen.getByText('Min')).toBeInTheDocument()
    expect(screen.getByText('AM')).toBeInTheDocument()
    expect(screen.getByText('PM')).toBeInTheDocument()
  })

  it('renders hour and minute columns in 24h format without AM/PM', async () => {
    render(<TimePicker format="24h" />)
    await userEvent.click(screen.getByRole('button', { name: /select time/i }))
    expect(screen.getByText('Hr')).toBeInTheDocument()
    expect(screen.getByText('Min')).toBeInTheDocument()
    expect(screen.queryByText('AM')).not.toBeInTheDocument()
    expect(screen.queryByText('PM')).not.toBeInTheDocument()
  })

  it('calls onChange when hour is selected', async () => {
    const onChange = vi.fn()
    render(<TimePicker format="12h" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /select time/i }))
    // Click hour 3
    const options = screen.getAllByRole('option')
    const hour3 = options.find(o => o.textContent === '3')
    expect(hour3).toBeTruthy()
    await userEvent.click(hour3!)
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when minute is selected', async () => {
    const onChange = vi.fn()
    render(<TimePicker format="24h" value="14:00" onChange={onChange} />)
    const trigger = screen.getByRole('button', { name: /14:00/i })
    await userEvent.click(trigger)
    // Click minute 30
    const options = screen.getAllByRole('option')
    const min30 = options.find(o => o.textContent === '30')
    expect(min30).toBeTruthy()
    await userEvent.click(min30!)
    expect(onChange).toHaveBeenCalled()
    const result = onChange.mock.calls[0][0]
    expect(result).toBe('14:30')
  })

  it('supports minuteStep prop', async () => {
    render(<TimePicker format="24h" minuteStep={15} />)
    await userEvent.click(screen.getByRole('button', { name: /select time/i }))
    const options = screen.getAllByRole('option')
    // In 24h mode with step=15: 24 hours + 4 minutes (00, 15, 30, 45)
    // Verify we have 28 total options: 24 hours + 4 minutes
    expect(options.length).toBe(28)
    // With step=1 (default) we'd have 24+60=84 options, so 28 confirms step works
    // Verify specific minute values exist
    const texts = options.map(o => o.textContent)
    expect(texts).toContain('45')
  })

  it('shows clear button when clearable and has value', () => {
    render(<TimePicker value="14:30" clearable />)
    expect(screen.getByLabelText('Clear time')).toBeInTheDocument()
  })

  it('does not show clear button when clearable is false', () => {
    render(<TimePicker value="14:30" />)
    expect(screen.queryByLabelText('Clear time')).not.toBeInTheDocument()
  })

  it('clears value on clear button click', async () => {
    const onChange = vi.fn()
    render(<TimePicker value="14:30" clearable onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Clear time'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('shows label when provided', () => {
    render(<TimePicker label="Start time" />)
    expect(screen.getByText('Start time')).toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    render(<TimePicker error="Time is required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Time is required')
  })

  it('applies data-invalid when error is present', () => {
    const { container } = render(<TimePicker error="Error" />)
    expect(container.firstElementChild).toHaveAttribute('data-invalid')
  })

  it('disables trigger when disabled prop is set', () => {
    const { container } = render(<TimePicker disabled />)
    expect(container.firstElementChild).toHaveAttribute('data-disabled')
    const buttons = container.querySelectorAll('button')
    const trigger = Array.from(buttons).find(b => b.classList.contains('ui-time-picker__trigger'))
    expect(trigger).toBeDisabled()
  })

  it('applies data-size attribute', () => {
    const { container } = render(<TimePicker size="lg" />)
    expect(container.firstElementChild).toHaveAttribute('data-size', 'lg')
  })

  it('applies data-motion attribute', () => {
    const { container } = render(<TimePicker motion={0} />)
    expect(container.firstElementChild).toHaveAttribute('data-motion', '0')
  })

  it('passes through className and other HTML attributes', () => {
    const { container } = render(
      <TimePicker className="custom-class" data-testid="my-tp" />
    )
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('custom-class')
    expect(root).toHaveAttribute('data-testid', 'my-tp')
  })

  it('sets aria-expanded on trigger', async () => {
    render(<TimePicker />)
    const trigger = screen.getByRole('button', { name: /select time/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('has clock icon in trigger', () => {
    render(<TimePicker />)
    const buttons = screen.getAllByRole('button')
    // The trigger should contain an SVG (clock icon)
    const svg = buttons[0].querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('highlights selected hour/minute with data-selected', async () => {
    render(<TimePicker value="2:30 PM" format="12h" />)
    const trigger = screen.getByRole('button', { name: /2:30 PM/i })
    await userEvent.click(trigger)
    const selectedOptions = screen.getAllByRole('option').filter(
      o => o.hasAttribute('data-selected')
    )
    // Should have at least hour, minute, and period selected
    expect(selectedOptions.length).toBeGreaterThanOrEqual(3)
  })

  it('toggles AM/PM when period button is clicked', async () => {
    const onChange = vi.fn()
    render(<TimePicker value="2:30 PM" format="12h" onChange={onChange} />)
    const trigger = screen.getByRole('button', { name: /2:30 PM/i })
    await userEvent.click(trigger)
    const amBtn = screen.getAllByRole('option').find(o => o.textContent === 'AM')
    expect(amBtn).toBeTruthy()
    await userEvent.click(amBtn!)
    expect(onChange).toHaveBeenCalled()
    // Should now be "2:30 AM"
    expect(onChange.mock.calls[0][0]).toBe('2:30 AM')
  })
})
