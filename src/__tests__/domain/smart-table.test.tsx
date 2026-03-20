import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { createRef } from 'react'
import { SmartTable, type SmartTableProps } from '../../domain/smart-table'
import type { ColumnDef } from '../../domain/data-table'

expect.extend(toHaveNoViolations)

// ─── Test Data ────────────────────────────────────────────────────────────

interface Person {
  id: number
  name: string
  age: number
  email: string
  role: string
}

const sampleData: Person[] = [
  { id: 1, name: 'Alice', age: 30, email: 'alice@test.com', role: 'Engineer' },
  { id: 2, name: 'Bob', age: 25, email: 'bob@test.com', role: 'Designer' },
  { id: 3, name: 'Charlie', age: 35, email: 'charlie@test.com', role: 'Manager' },
  { id: 4, name: 'Diana', age: 28, email: 'diana@test.com', role: 'Engineer' },
  { id: 5, name: 'Eve', age: 32, email: 'eve@test.com', role: 'Director' },
  { id: 6, name: 'Frank', age: 27, email: 'frank@test.com', role: 'Engineer' },
  { id: 7, name: 'Grace', age: 40, email: 'grace@test.com', role: 'VP' },
  { id: 8, name: 'Hank', age: 33, email: 'hank@test.com', role: 'Designer' },
  { id: 9, name: 'Ivy', age: 29, email: 'ivy@test.com', role: 'Manager' },
  { id: 10, name: 'Jack', age: 31, email: 'jack@test.com', role: 'Engineer' },
  { id: 11, name: 'Karen', age: 36, email: 'karen@test.com', role: 'Director' },
  { id: 12, name: 'Leo', age: 26, email: 'leo@test.com', role: 'Designer' },
]

const columns: ColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
]

function renderSmart(props: Partial<SmartTableProps<Person>> = {}) {
  return render(
    <SmartTable<Person>
      data={sampleData}
      columns={columns}
      {...props}
    />
  )
}

describe('SmartTable', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Basic Rendering ────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = renderSmart()
      expect(container.querySelector('.ui-smart-table')).toBeInTheDocument()
    })

    it('renders the underlying DataTable grid', () => {
      renderSmart()
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('renders all data when no pagination', () => {
      renderSmart()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Leo')).toBeInTheDocument()
    })

    it('passes through DataTable props', () => {
      const { container } = renderSmart({ striped: true, compact: true })
      const dataTable = container.querySelector('.ui-data-table')!
      expect(dataTable).toHaveAttribute('data-striped')
      expect(dataTable).toHaveAttribute('data-compact')
    })
  })

  // ─── Search ─────────────────────────────────────────────────────────

  describe('search', () => {
    it('renders search input when searchable', () => {
      renderSmart({ searchable: true })
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('does not render search when not searchable', () => {
      renderSmart()
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('filters rows by search query', async () => {
      renderSmart({ searchable: true })
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'Alice')
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })

    it('filters across all columns', async () => {
      renderSmart({ searchable: true })
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'Engineer')
      // Should show Alice, Diana, Frank, Jack (all engineers)
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })

    it('search is case insensitive', async () => {
      renderSmart({ searchable: true })
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'alice')
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('shows empty state when no results match', async () => {
      renderSmart({ searchable: true })
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'zzzzzzz')
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('applies custom search placeholder', () => {
      renderSmart({ searchable: true, searchPlaceholder: 'Find...' })
      expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument()
    })
  })

  // ─── Pagination ─────────────────────────────────────────────────────

  describe('pagination', () => {
    it('renders pagination controls when paginated', () => {
      renderSmart({ paginated: true, pageSize: 5 })
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument()
    })

    it('shows correct page count', () => {
      renderSmart({ paginated: true, pageSize: 5 })
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument()
    })

    it('navigates pages', async () => {
      renderSmart({ paginated: true, pageSize: 5 })
      expect(screen.getByText('Alice')).toBeInTheDocument()
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn)
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
      expect(screen.getByText('Frank')).toBeInTheDocument()
    })

    it('defaults to pageSize 10', () => {
      renderSmart({ paginated: true })
      // With 12 items and pageSize 10, first page shows 10
      const rows = screen.getAllByRole('row')
      // 1 header + 10 data
      expect(rows).toHaveLength(11)
    })

    it('respects custom pageSize', () => {
      renderSmart({ paginated: true, pageSize: 3 })
      const rows = screen.getAllByRole('row')
      // 1 header + 3 data
      expect(rows).toHaveLength(4)
    })

    it('resets to page 1 when search changes', async () => {
      renderSmart({ searchable: true, paginated: true, pageSize: 5 })
      // Go to page 2
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn)
      expect(screen.getByText(/page 2/i)).toBeInTheDocument()
      // Search resets to page 1
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'a')
      expect(screen.getByText(/page 1/i)).toBeInTheDocument()
    })
  })

  // ─── Column Toggle ─────────────────────────────────────────────────

  describe('column toggle', () => {
    it('renders column toggle button when enabled', () => {
      renderSmart({ columnToggle: true })
      expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument()
    })

    it('does not render toggle when disabled', () => {
      renderSmart()
      expect(screen.queryByRole('button', { name: /columns/i })).not.toBeInTheDocument()
    })

    it('shows column names in dropdown', async () => {
      renderSmart({ columnToggle: true })
      await userEvent.click(screen.getByRole('button', { name: /columns/i }))
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Age')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Role')).toBeInTheDocument()
    })

    it('hides column when unchecked', async () => {
      renderSmart({ columnToggle: true })
      await userEvent.click(screen.getByRole('button', { name: /columns/i }))
      // Uncheck Email column
      await userEvent.click(screen.getByLabelText('Email'))
      // Email column header in the grid should be gone
      const grid = screen.getByRole('grid')
      const headers = within(grid).getAllByRole('columnheader')
      const headerTexts = headers.map(h => h.textContent)
      expect(headerTexts).not.toContain(expect.stringContaining('Email'))
    })

    it('shows column when re-checked', async () => {
      renderSmart({ columnToggle: true })
      await userEvent.click(screen.getByRole('button', { name: /columns/i }))
      // Uncheck then recheck
      await userEvent.click(screen.getByLabelText('Email'))
      await userEvent.click(screen.getByLabelText('Email'))
      expect(screen.getAllByText('Email').length).toBeGreaterThan(0)
    })
  })

  // ─── Internal Sort ──────────────────────────────────────────────────

  describe('sorting', () => {
    it('sorts by column on header click', async () => {
      renderSmart()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)

      // Should be sorted ascending by name
      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      expect(firstDataRow).toHaveTextContent('Alice')
    })

    it('toggles sort direction', async () => {
      renderSmart()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader) // asc
      await userEvent.click(nameHeader) // desc

      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      expect(firstDataRow).toHaveTextContent('Leo')
    })

    it('sorts numeric columns correctly', async () => {
      renderSmart()
      const ageHeader = screen.getByText('Age').closest('th')!
      await userEvent.click(ageHeader) // asc

      const rows = screen.getAllByRole('row')
      const firstDataRow = rows[1]
      // Youngest is Bob (25)
      expect(firstDataRow).toHaveTextContent('Bob')
    })
  })

  // ─── Selection (internal) ──────────────────────────────────────────

  describe('selection', () => {
    it('manages selection internally when selectable', async () => {
      renderSmart({ selectable: true })
      const checkboxes = screen.getAllByRole('checkbox')
      // Click first row checkbox
      await userEvent.click(checkboxes[1])
      expect((checkboxes[1] as HTMLInputElement).checked).toBe(true)
    })
  })

  // ─── Integration ───────────────────────────────────────────────────

  describe('integration', () => {
    it('renders with all features enabled', () => {
      renderSmart({
        searchable: true,
        paginated: true,
        pageSize: 5,
        columnToggle: true,
        selectable: true,
        striped: true,
      })
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument()
    })

    it('search + pagination work together', async () => {
      renderSmart({ searchable: true, paginated: true, pageSize: 2 })
      const search = screen.getByRole('searchbox')
      await userEvent.type(search, 'Engineer')
      // Engineers: Alice, Diana, Frank, Jack (4 results, 2 per page)
      expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
    })
  })

  // ─── Ref and ClassName ──────────────────────────────────────────────

  describe('ref and className', () => {
    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<SmartTable ref={ref} data={sampleData} columns={columns} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('applies additional className', () => {
      const { container } = renderSmart({ className: 'my-smart' })
      expect(container.querySelector('.ui-smart-table.my-smart')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('passes axe audit', async () => {
      const { container } = renderSmart({
        searchable: true,
        paginated: true,
        pageSize: 5,
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('search input has accessible label', () => {
      renderSmart({ searchable: true })
      expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label')
    })
  })
})
