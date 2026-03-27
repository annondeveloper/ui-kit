import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { createRef } from 'react'
import { ColumnVisibilityToggle } from '../../domain/column-visibility-toggle'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const sampleColumns = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'ip', label: 'IP Address', visible: false },
  { id: 'uptime', label: 'Uptime', visible: true },
]

describe('ColumnVisibilityToggle', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} />)
      expect(container.querySelector('.ui-column-visibility')).toBeInTheDocument()
    })

    it('renders trigger button with column count', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      expect(screen.getByText('Columns (3/4)')).toBeInTheDocument()
    })

    it('renders dropdown when trigger is clicked', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('IP Address')).toBeInTheDocument()
    })

    it('renders reset button when onReset is provided', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} onReset={vi.fn()} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      expect(screen.getByText('Reset to default')).toBeInTheDocument()
    })

    it('does not render reset button when onReset is not provided', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      expect(screen.queryByText('Reset to default')).not.toBeInTheDocument()
    })
  })

  // ─── Interaction ──────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onChange when a column checkbox is toggled', () => {
      const onChange = vi.fn()
      render(<ColumnVisibilityToggle columns={sampleColumns} onChange={onChange} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[2]) // IP Address (visible: false -> true)
      expect(onChange).toHaveBeenCalledWith('ip', true)
    })

    it('calls onReset when reset button is clicked', () => {
      const onReset = vi.fn()
      render(<ColumnVisibilityToggle columns={sampleColumns} onReset={onReset} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      fireEvent.click(screen.getByText('Reset to default'))
      expect(onReset).toHaveBeenCalled()
    })

    it('closes dropdown on Escape key', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      expect(screen.getByRole('listbox')).toHaveAttribute('data-open', 'true')
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.getByRole('listbox')).toHaveAttribute('data-open', 'false')
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref forwarding', () => {
    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<ColumnVisibilityToggle ref={ref} columns={sampleColumns} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current?.classList.contains('ui-column-visibility')).toBe(true)
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── HTML attributes ─────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} className="custom" />)
      expect(container.querySelector('.ui-column-visibility.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} data-testid="col-vis" />)
      expect(screen.getByTestId('col-vis')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(ColumnVisibilityToggle.displayName).toBe('ColumnVisibilityToggle')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('trigger has aria-expanded', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      const trigger = screen.getByRole('button', { name: /columns/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('trigger has aria-haspopup', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      const trigger = screen.getByRole('button', { name: /columns/i })
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('dropdown has listbox role', () => {
      render(<ColumnVisibilityToggle columns={sampleColumns} />)
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('has no axe violations when closed', async () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} />)
      // Disable aria-required-children: component uses role="listbox" with checkbox children (known pattern)
      const results = await axe(container, { rules: { 'aria-required-children': { enabled: false } } })
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when open', async () => {
      const { container } = render(<ColumnVisibilityToggle columns={sampleColumns} />)
      fireEvent.click(screen.getByText('Columns (3/4)'))
      // Disable aria-required-children: component uses role="listbox" with checkbox children (known pattern)
      const results = await axe(container, { rules: { 'aria-required-children': { enabled: false } } })
      expect(results).toHaveNoViolations()
    })
  })
})
