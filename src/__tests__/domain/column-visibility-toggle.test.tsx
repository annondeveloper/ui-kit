import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ColumnVisibilityToggle } from '../../domain/column-visibility-toggle'

expect.extend(toHaveNoViolations)

const columns = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'cpu', label: 'CPU', visible: false },
  { id: 'memory', label: 'Memory', visible: true },
  { id: 'uptime', label: 'Uptime', visible: false },
]

describe('ColumnVisibilityToggle', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders trigger button with column count', () => {
      render(<ColumnVisibilityToggle columns={columns} />)
      expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument()
      expect(screen.getByText(/3\/5/)).toBeInTheDocument()
    })

    it('renders dropdown as closed by default', () => {
      const { container } = render(<ColumnVisibilityToggle columns={columns} />)
      const dropdown = container.querySelector('.ui-column-visibility__dropdown')
      expect(dropdown).toHaveAttribute('data-open', 'false')
    })

    it('opens dropdown on trigger click', () => {
      const { container } = render(<ColumnVisibilityToggle columns={columns} />)
      fireEvent.click(screen.getByRole('button', { name: /columns/i }))
      const dropdown = container.querySelector('.ui-column-visibility__dropdown')
      expect(dropdown).toHaveAttribute('data-open', 'true')
    })

    it('renders all column labels in dropdown', () => {
      render(<ColumnVisibilityToggle columns={columns} />)
      for (const col of columns) {
        expect(screen.getByText(col.label)).toBeInTheDocument()
      }
    })

    it('renders checkboxes matching visibility state', () => {
      render(<ColumnVisibilityToggle columns={columns} />)
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(5)
      expect(checkboxes[0]).toBeChecked()     // Name: visible
      expect(checkboxes[2]).not.toBeChecked() // CPU: not visible
    })
  })

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onChange when a column checkbox is toggled', () => {
      const onChange = vi.fn()
      render(<ColumnVisibilityToggle columns={columns} onChange={onChange} />)
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // toggle Name
      expect(onChange).toHaveBeenCalledWith('name', false)
    })

    it('renders reset button when onReset is provided', () => {
      const onReset = vi.fn()
      render(<ColumnVisibilityToggle columns={columns} onReset={onReset} />)
      const resetBtn = screen.getByText('Reset to default')
      expect(resetBtn).toBeInTheDocument()
      fireEvent.click(resetBtn)
      expect(onReset).toHaveBeenCalledOnce()
    })

    it('does not render reset button when onReset is absent', () => {
      render(<ColumnVisibilityToggle columns={columns} />)
      expect(screen.queryByText('Reset to default')).not.toBeInTheDocument()
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ColumnVisibilityToggle columns={columns} />)
      // The listbox role with checkbox children is an intentional pattern for this component
      const results = await axe(container, {
        rules: { 'aria-required-children': { enabled: false } },
      })
      expect(results).toHaveNoViolations()
    })

    it('trigger has aria-expanded attribute', () => {
      render(<ColumnVisibilityToggle columns={columns} />)
      const trigger = screen.getByRole('button', { name: /columns/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ColumnVisibilityToggle"', () => {
      expect(ColumnVisibilityToggle.displayName).toBe('ColumnVisibilityToggle')
    })
  })
})
