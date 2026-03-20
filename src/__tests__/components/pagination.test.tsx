import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Pagination } from '../../components/pagination'

expect.extend(toHaveNoViolations)

describe('Pagination', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-pagination scope class', () => {
      const { container } = render(
        <Pagination page={1} totalPages={10} onChange={() => {}} />
      )
      expect(container.querySelector('.ui-pagination')).toBeInTheDocument()
    })

    it('renders a <nav> element', () => {
      render(<Pagination page={1} totalPages={10} onChange={() => {}} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has aria-label="Pagination"', () => {
      render(<Pagination page={1} totalPages={10} onChange={() => {}} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination')
    })

    it('applies custom className', () => {
      const { container } = render(
        <Pagination page={1} totalPages={10} onChange={() => {}} className="custom-pg" />
      )
      expect(container.querySelector('.ui-pagination')).toHaveClass('custom-pg')
    })

    it('has displayName', () => {
      expect(Pagination.displayName).toBe('Pagination')
    })
  })

  // ─── Page buttons ─────────────────────────────────────────────────

  describe('page buttons', () => {
    it('renders page number buttons', () => {
      render(<Pagination page={1} totalPages={5} onChange={() => {}} />)
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('highlights current page', () => {
      render(<Pagination page={3} totalPages={5} onChange={() => {}} />)
      const current = screen.getByText('3')
      expect(current).toHaveAttribute('aria-current', 'page')
    })

    it('calls onChange when clicking a page', () => {
      const onChange = vi.fn()
      render(<Pagination page={1} totalPages={5} onChange={onChange} />)
      fireEvent.click(screen.getByText('3'))
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('does not call onChange when clicking current page', () => {
      const onChange = vi.fn()
      render(<Pagination page={3} totalPages={5} onChange={onChange} />)
      fireEvent.click(screen.getByText('3'))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Prev / Next ──────────────────────────────────────────────────

  describe('prev/next', () => {
    it('renders prev and next buttons by default', () => {
      render(<Pagination page={3} totalPages={10} onChange={() => {}} />)
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('Next page')).toBeInTheDocument()
    })

    it('calls onChange with page-1 when clicking prev', () => {
      const onChange = vi.fn()
      render(<Pagination page={3} totalPages={10} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Previous page'))
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('calls onChange with page+1 when clicking next', () => {
      const onChange = vi.fn()
      render(<Pagination page={3} totalPages={10} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Next page'))
      expect(onChange).toHaveBeenCalledWith(4)
    })

    it('disables prev on page 1', () => {
      render(<Pagination page={1} totalPages={10} onChange={() => {}} />)
      expect(screen.getByLabelText('Previous page')).toBeDisabled()
    })

    it('disables next on last page', () => {
      render(<Pagination page={10} totalPages={10} onChange={() => {}} />)
      expect(screen.getByLabelText('Next page')).toBeDisabled()
    })

    it('hides prev/next when showPrevNext=false', () => {
      render(
        <Pagination page={3} totalPages={10} onChange={() => {}} showPrevNext={false} />
      )
      expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument()
    })
  })

  // ─── First / Last ─────────────────────────────────────────────────

  describe('first/last', () => {
    it('does not show first/last by default', () => {
      render(<Pagination page={5} totalPages={10} onChange={() => {}} />)
      expect(screen.queryByLabelText('First page')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Last page')).not.toBeInTheDocument()
    })

    it('shows first/last when showFirst=true', () => {
      render(
        <Pagination page={5} totalPages={10} onChange={() => {}} showFirst />
      )
      expect(screen.getByLabelText('First page')).toBeInTheDocument()
      expect(screen.getByLabelText('Last page')).toBeInTheDocument()
    })

    it('calls onChange(1) when clicking first', () => {
      const onChange = vi.fn()
      render(
        <Pagination page={5} totalPages={10} onChange={onChange} showFirst />
      )
      fireEvent.click(screen.getByLabelText('First page'))
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('calls onChange(totalPages) when clicking last', () => {
      const onChange = vi.fn()
      render(
        <Pagination page={5} totalPages={10} onChange={onChange} showFirst />
      )
      fireEvent.click(screen.getByLabelText('Last page'))
      expect(onChange).toHaveBeenCalledWith(10)
    })

    it('disables first on page 1', () => {
      render(
        <Pagination page={1} totalPages={10} onChange={() => {}} showFirst />
      )
      expect(screen.getByLabelText('First page')).toBeDisabled()
    })

    it('disables last on last page', () => {
      render(
        <Pagination page={10} totalPages={10} onChange={() => {}} showFirst />
      )
      expect(screen.getByLabelText('Last page')).toBeDisabled()
    })
  })

  // ─── Ellipsis ─────────────────────────────────────────────────────

  describe('ellipsis', () => {
    it('shows ellipsis when pages are truncated', () => {
      const { container } = render(
        <Pagination page={5} totalPages={20} onChange={() => {}} />
      )
      const ellipses = container.querySelectorAll('.ui-pagination__ellipsis')
      expect(ellipses.length).toBeGreaterThan(0)
    })

    it('does not show ellipsis for small page counts', () => {
      const { container } = render(
        <Pagination page={2} totalPages={5} onChange={() => {}} />
      )
      const ellipses = container.querySelectorAll('.ui-pagination__ellipsis')
      expect(ellipses).toHaveLength(0)
    })

    it('shows left ellipsis when current page is far from start', () => {
      const { container } = render(
        <Pagination page={8} totalPages={10} onChange={() => {}} />
      )
      const ellipses = container.querySelectorAll('.ui-pagination__ellipsis')
      expect(ellipses.length).toBeGreaterThanOrEqual(1)
    })

    it('shows right ellipsis when current page is far from end', () => {
      const { container } = render(
        <Pagination page={3} totalPages={20} onChange={() => {}} />
      )
      const ellipses = container.querySelectorAll('.ui-pagination__ellipsis')
      expect(ellipses.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ─── Sibling count ────────────────────────────────────────────────

  describe('siblingCount', () => {
    it('defaults to 1 sibling on each side', () => {
      render(<Pagination page={5} totalPages={10} onChange={() => {}} />)
      // With page 5, siblings 1: should show 4, 5, 6
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
    })

    it('shows more siblings with siblingCount=2', () => {
      render(
        <Pagination page={5} totalPages={10} onChange={() => {}} siblingCount={2} />
      )
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })
  })

  // ─── Size ─────────────────────────────────────────────────────────

  describe('size', () => {
    it('defaults to md size', () => {
      const { container } = render(
        <Pagination page={1} totalPages={5} onChange={() => {}} />
      )
      expect(container.querySelector('.ui-pagination')).toHaveAttribute('data-size', 'md')
    })

    it('applies sm size', () => {
      const { container } = render(
        <Pagination page={1} totalPages={5} onChange={() => {}} size="sm" />
      )
      expect(container.querySelector('.ui-pagination')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(
        <Pagination page={1} totalPages={5} onChange={() => {}} motion={0} />
      )
      expect(container.querySelector('.ui-pagination')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles totalPages=1', () => {
      render(<Pagination page={1} totalPages={1} onChange={() => {}} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('handles totalPages=0', () => {
      const { container } = render(
        <Pagination page={1} totalPages={0} onChange={() => {}} />
      )
      expect(container.querySelector('.ui-pagination')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Pagination page={3} totalPages={10} onChange={() => {}} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with first/last buttons', async () => {
      const { container } = render(
        <Pagination page={5} totalPages={20} onChange={() => {}} showFirst />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('page buttons have accessible labels', () => {
      render(<Pagination page={1} totalPages={5} onChange={() => {}} />)
      // Each page button should be identifiable
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
