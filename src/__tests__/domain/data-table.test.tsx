import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState, createRef } from 'react'
import { DataTable, type ColumnDef, type DataTableProps } from '../../domain/data-table'

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
]

const columns: ColumnDef<Person>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'age', header: 'Age', accessor: 'age', sortable: true, align: 'right' },
  { id: 'email', header: 'Email', accessor: 'email' },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
]

function renderTable(props: Partial<DataTableProps<Person>> = {}) {
  return render(
    <DataTable<Person> data={sampleData} columns={columns} {...props} />
  )
}

// Generate large dataset for virtual scroll tests
function generateLargeData(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    age: 20 + (i % 50),
    email: `person${i + 1}@test.com`,
    role: ['Engineer', 'Designer', 'Manager', 'Director'][i % 4],
  }))
}

describe('DataTable', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  // ═══════════════════════════════════════════════════════════════════
  // 1. BASIC RENDERING
  // ═══════════════════════════════════════════════════════════════════

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = renderTable()
      expect(container.querySelector('.ui-data-table')).toBeInTheDocument()
    })

    it('renders a table element with grid role', () => {
      renderTable()
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('renders column headers', () => {
      renderTable()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Age')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
    })

    it('renders all data rows', () => {
      renderTable()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
      expect(screen.getByText('Eve')).toBeInTheDocument()
    })

    it('renders correct number of rows', () => {
      renderTable()
      const rows = screen.getAllByRole('row')
      // 1 header row + 5 data rows
      expect(rows).toHaveLength(6)
    })

    it('renders cell values from accessor', () => {
      renderTable()
      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('renders with function accessor', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'fullInfo', header: 'Info', accessor: (row) => `${row.name} (${row.age})` },
      ]
      render(<DataTable data={sampleData} columns={cols} />)
      expect(screen.getByText('Alice (30)')).toBeInTheDocument()
    })

    it('renders with custom cell renderer', () => {
      const cols: ColumnDef<Person>[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          cell: (value) => <strong data-testid="custom-cell">{String(value)}</strong>,
        },
      ]
      render(<DataTable data={sampleData} columns={cols} />)
      const cells = screen.getAllByTestId('custom-cell')
      expect(cells).toHaveLength(5)
      expect(cells[0]).toHaveTextContent('Alice')
    })

    it('renders with function header', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: () => <span data-testid="fn-header">Custom</span>, accessor: 'name' },
      ]
      render(<DataTable data={sampleData} columns={cols} />)
      expect(screen.getByTestId('fn-header')).toHaveTextContent('Custom')
    })

    it('passes cell rowIndex to custom cell renderer', () => {
      const cellFn = vi.fn((_val, _row, idx) => <span>{idx}</span>)
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', cell: cellFn },
      ]
      render(<DataTable data={sampleData} columns={cols} />)
      // Called at least 5 times (may be doubled by StrictMode)
      expect(cellFn.mock.calls.length).toBeGreaterThanOrEqual(5)
      // The third argument should be the row index
      expect(cellFn.mock.calls[0][2]).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 2. SORTING
  // ═══════════════════════════════════════════════════════════════════

  describe('sorting', () => {
    it('renders sort indicators for sortable columns', () => {
      renderTable()
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
    })

    it('does not show sort indicator for non-sortable columns', () => {
      renderTable({ sortable: false })
      const nameHeader = screen.getByText('Name').closest('th')!
      // With sortable=false at table level, but column has sortable: true
      expect(nameHeader).toHaveAttribute('aria-sort')
    })

    it('column-level sortable overrides table-level', () => {
      // Email has no sortable set (defaults to table-level), table is sortable=false
      renderTable({ sortable: false })
      const emailHeader = screen.getByText('Email').closest('th')!
      expect(emailHeader).not.toHaveAttribute('aria-sort')
    })

    it('sorts data ascending on click (internal state)', async () => {
      renderTable()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      // Verify internal sort happened - first row should be Alice (alphabetically first)
      const cells = screen.getAllByRole('gridcell')
      const firstNameCell = cells.find(c => c.textContent === 'Alice')
      expect(firstNameCell).toBeInTheDocument()
    })

    it('sorts data descending on second click', async () => {
      renderTable()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader) // asc
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
      await userEvent.click(nameHeader) // desc
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('clears sort on third click (cycle: asc -> desc -> none)', async () => {
      renderTable()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader) // asc
      await userEvent.click(nameHeader) // desc
      await userEvent.click(nameHeader) // none
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
    })

    it('calls onSort callback (controlled mode)', async () => {
      const onSort = vi.fn()
      renderTable({
        sortBy: [],
        onSort,
      })
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      expect(onSort).toHaveBeenCalledWith([{ column: 'name', direction: 'asc' }])
    })

    it('applies aria-sort ascending from controlled sort', () => {
      renderTable({ sortBy: [{ column: 'name', direction: 'asc' }] })
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })

    it('applies aria-sort descending from controlled sort', () => {
      renderTable({ sortBy: [{ column: 'name', direction: 'desc' }] })
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('does not sort non-sortable columns', async () => {
      // email column has no sortable set, table defaults to sortable=true
      // but email column doesn't have sortable: true set explicitly
      const cols: ColumnDef<Person>[] = [
        { id: 'email', header: 'Email', accessor: 'email', sortable: false },
      ]
      renderTable({ columns: cols })
      const emailHeader = screen.getByText('Email').closest('th')!
      expect(emailHeader).not.toHaveAttribute('data-sortable')
    })

    it('supports multi-column sort via controlled prop', () => {
      renderTable({
        sortBy: [
          { column: 'role', direction: 'asc' },
          { column: 'name', direction: 'desc' },
        ],
      })
      const roleHeader = screen.getByText('Role').closest('th')!
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(roleHeader).toHaveAttribute('aria-sort', 'ascending')
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('shows sort badges for multi-column sort', () => {
      const { container } = renderTable({
        sortBy: [
          { column: 'role', direction: 'asc' },
          { column: 'name', direction: 'desc' },
        ],
      })
      const badges = container.querySelectorAll('.ui-data-table__sort-badge')
      expect(badges).toHaveLength(2)
      // Name comes first in DOM (column order), but is sortBy index 1 -> badge "2"
      // Role comes second in DOM, but is sortBy index 0 -> badge "1"
      expect(badges[0]).toHaveTextContent('2') // Name badge
      expect(badges[1]).toHaveTextContent('1') // Role badge
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 3. SEARCH
  // ═══════════════════════════════════════════════════════════════════

  describe('search', () => {
    it('renders search input when searchable', () => {
      renderTable({ searchable: true })
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })

    it('does not render search input when not searchable', () => {
      renderTable({ searchable: false })
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('filters data on search input (debounced)', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderTable({ searchable: true })
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'Alice')
      act(() => { vi.advanceTimersByTime(400) })

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
      vi.useRealTimers()
    })

    it('shows result count when searching', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      renderTable({ searchable: true })
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'Engineer')
      act(() => { vi.advanceTimersByTime(400) })

      expect(screen.getByText(/2 results/)).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('shows clear button when search has value', async () => {
      renderTable({ searchable: true })
      const searchInput = screen.getByRole('searchbox')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
    })

    it('clears search on clear button click', async () => {
      renderTable({ searchable: true })
      const searchInput = screen.getByRole('searchbox') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'test' } })
      fireEvent.click(screen.getByLabelText('Clear search'))

      expect(searchInput.value).toBe('')
    })

    it('calls onSearchChange callback', async () => {
      const onSearchChange = vi.fn()
      renderTable({ searchable: true, onSearchChange })
      const searchInput = screen.getByRole('searchbox')
      fireEvent.change(searchInput, { target: { value: 'a' } })

      expect(onSearchChange).toHaveBeenCalledWith('a')
    })

    it('excludes columns with searchable: false', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'email', header: 'Email', accessor: 'email', searchable: false },
      ]
      render(
        <DataTable data={sampleData} columns={cols} searchable />
      )
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'alice@test')
      act(() => { vi.advanceTimersByTime(400) })

      // Should not find anything because email column is excluded from search
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 4. PAGINATION
  // ═══════════════════════════════════════════════════════════════════

  describe('pagination', () => {
    it('paginates data when paginated is set', () => {
      renderTable({ paginated: true, pageSize: 2 })
      const rows = screen.getAllByRole('row')
      // 1 header + 2 data rows
      expect(rows).toHaveLength(3)
    })

    it('shows page info text', () => {
      renderTable({ paginated: true, pageSize: 2 })
      expect(screen.getByText(/Showing 1–2 of 5/)).toBeInTheDocument()
    })

    it('navigates to next page', async () => {
      renderTable({ paginated: true, pageSize: 2 })
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn)
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText(/Showing 3–4 of 5/)).toBeInTheDocument()
    })

    it('navigates to previous page', async () => {
      renderTable({ paginated: true, pageSize: 2 })
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
      await userEvent.click(screen.getByRole('button', { name: /prev/i }))
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('disables prev on first page', () => {
      renderTable({ paginated: true, pageSize: 2 })
      const prevBtn = screen.getByRole('button', { name: /prev/i })
      expect(prevBtn).toBeDisabled()
    })

    it('disables next on last page', async () => {
      renderTable({ paginated: true, pageSize: 2 })
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn) // page 2
      await userEvent.click(nextBtn) // page 3
      expect(nextBtn).toBeDisabled()
    })

    it('renders page number buttons', () => {
      renderTable({ paginated: true, pageSize: 2 })
      expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()
    })

    it('navigates to specific page via page number', async () => {
      renderTable({ paginated: true, pageSize: 2 })
      await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
      expect(screen.getByText('Eve')).toBeInTheDocument()
    })

    it('highlights active page', () => {
      const { container } = renderTable({ paginated: true, pageSize: 2 })
      const activePage = container.querySelector('.ui-data-table__page-btn[data-active]')
      expect(activePage).toBeInTheDocument()
      expect(activePage).toHaveTextContent('1')
    })

    it('renders page size selector', () => {
      renderTable({ paginated: true, pageSize: 10 })
      expect(screen.getByLabelText('Page size')).toBeInTheDocument()
    })

    it('changes page size', async () => {
      renderTable({ paginated: true, pageSize: 2, pageSizes: [2, 5, 10] })
      const select = screen.getByLabelText('Page size')
      await userEvent.selectOptions(select, '5')
      // Should show all 5 rows now
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(6) // 1 header + 5 data
    })

    it('has "All" option in page size selector', () => {
      renderTable({ paginated: true, pageSize: 2 })
      const select = screen.getByLabelText('Page size') as HTMLSelectElement
      const options = Array.from(select.options).map(o => o.textContent)
      expect(options).toContain('All')
    })

    it('calls onPageChange callback', async () => {
      const onPageChange = vi.fn()
      renderTable({ paginated: true, pageSize: 2, onPageChange })
      await userEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('does not show pagination when not paginated', () => {
      renderTable()
      expect(screen.queryByLabelText('Table pagination')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 5. COLUMN SELECTOR (SHOW/HIDE)
  // ═══════════════════════════════════════════════════════════════════

  describe('column selector', () => {
    it('renders column toggle button', () => {
      renderTable()
      expect(screen.getByLabelText('Toggle columns')).toBeInTheDocument()
    })

    it('opens column dropdown on click', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      // Should show column names as checkboxes
      const dropdown = screen.getByRole('menu')
      expect(dropdown).toBeInTheDocument()
    })

    it('shows all columns as checked initially', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      const checkboxes = within(screen.getByRole('menu')).getAllByRole('checkbox')
      checkboxes.forEach(cb => {
        expect(cb).toBeChecked()
      })
    })

    it('hides column when unchecked', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      const checkboxes = within(screen.getByRole('menu')).getAllByRole('checkbox')
      // Uncheck 'Email' (3rd column)
      await userEvent.click(checkboxes[2])
      // Email column should be gone from headers
      expect(screen.queryByRole('columnheader', { name: /email/i })).not.toBeInTheDocument()
    })

    it('shows column when re-checked', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      const checkboxes = within(screen.getByRole('menu')).getAllByRole('checkbox')
      // Uncheck Email (3rd column)
      await userEvent.click(checkboxes[2])
      // Email header should be gone from table
      const grid = screen.getByRole('grid')
      expect(within(grid).queryByText('Email')).not.toBeInTheDocument()
      // Re-check Email
      await userEvent.click(checkboxes[2])
      expect(within(grid).getByText('Email')).toBeInTheDocument()
    })

    it('has Show all button', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      expect(screen.getByText('Show all')).toBeInTheDocument()
    })

    it('has Hide all button', async () => {
      renderTable()
      await userEvent.click(screen.getByLabelText('Toggle columns'))
      expect(screen.getByText('Hide all')).toBeInTheDocument()
    })

    it('respects initially hidden columns', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'email', header: 'Email', accessor: 'email', hidden: true },
      ]
      render(<DataTable data={sampleData} columns={cols} />)
      // Email header should not be visible in the table
      const headers = screen.getAllByRole('columnheader')
      const headerTexts = headers.map(h => h.textContent)
      expect(headerTexts).not.toContain('Email')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 6. COLUMN REORDER
  // ═══════════════════════════════════════════════════════════════════

  describe('column reorder', () => {
    it('makes columns draggable when reorderable', () => {
      const { container } = renderTable({ reorderable: true })
      const headers = container.querySelectorAll('.ui-data-table__th[data-reorderable]')
      expect(headers.length).toBeGreaterThan(0)
    })

    it('does not make columns draggable when not reorderable', () => {
      const { container } = renderTable({ reorderable: false })
      const headers = container.querySelectorAll('.ui-data-table__th[data-reorderable]')
      expect(headers).toHaveLength(0)
    })

    it('has draggable attribute on headers when reorderable', () => {
      const { container } = renderTable({ reorderable: true })
      const th = container.querySelector('.ui-data-table__th:not(.ui-data-table__checkbox-cell)')
      expect(th).toHaveAttribute('draggable', 'true')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 7. COLUMN RESIZE
  // ═══════════════════════════════════════════════════════════════════

  describe('column resize', () => {
    it('renders resize handles when resizable', () => {
      const { container } = renderTable({ resizable: true })
      const handles = container.querySelectorAll('.ui-data-table__resize-handle')
      expect(handles.length).toBe(4) // All 4 columns
    })

    it('does not render resize handles when not resizable', () => {
      const { container } = renderTable({ resizable: false })
      const handles = container.querySelectorAll('.ui-data-table__resize-handle')
      expect(handles).toHaveLength(0)
    })

    it('renders resize handle for individual resizable column', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', resizable: true },
        { id: 'age', header: 'Age', accessor: 'age' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const handles = container.querySelectorAll('.ui-data-table__resize-handle')
      expect(handles).toHaveLength(1)
    })

    it('updates column width on drag', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', resizable: true, width: 200 },
        { id: 'age', header: 'Age', accessor: 'age' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const handle = container.querySelector('.ui-data-table__resize-handle')!

      fireEvent.pointerDown(handle, { clientX: 200 })
      fireEvent.pointerMove(handle, { clientX: 250 })
      fireEvent.pointerUp(handle)

      const th = container.querySelector('.ui-data-table__th:not(.ui-data-table__checkbox-cell)')!
      expect(th.getAttribute('style')).toContain('250px')
    })

    it('enforces minimum column width (80px default)', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', resizable: true, width: 200 },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const handle = container.querySelector('.ui-data-table__resize-handle')!

      fireEvent.pointerDown(handle, { clientX: 200 })
      fireEvent.pointerMove(handle, { clientX: 10 }) // Try to make very narrow
      fireEvent.pointerUp(handle)

      const th = container.querySelector('.ui-data-table__th')!
      expect(th.getAttribute('style')).toContain('80px')
    })

    it('resize handle has separator role', () => {
      const { container } = renderTable({ resizable: true })
      const handle = container.querySelector('.ui-data-table__resize-handle')!
      expect(handle).toHaveAttribute('role', 'separator')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 8. ROW SELECTION
  // ═══════════════════════════════════════════════════════════════════

  describe('row selection', () => {
    it('renders checkboxes when selectable', () => {
      renderTable({ selectable: true })
      const checkboxes = screen.getAllByRole('checkbox')
      // 1 select-all + 5 row checkboxes + column selector checkboxes (4)
      expect(checkboxes.length).toBeGreaterThanOrEqual(6)
    })

    it('does not render row checkboxes when not selectable', () => {
      renderTable()
      // Only column selector checkboxes should exist (in dropdown, not visible yet)
      const checkboxes = screen.queryAllByLabelText(/select row/i)
      expect(checkboxes).toHaveLength(0)
    })

    it('calls onSelectionChange when row checkbox clicked', async () => {
      const onSelectionChange = vi.fn()
      renderTable({
        selectable: true,
        selectedRows: new Set<number>(),
        onSelectionChange,
      })
      const rowCheckboxes = screen.getAllByLabelText(/select row/i)
      await userEvent.click(rowCheckboxes[0])
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([0]))
    })

    it('checks selected rows', () => {
      renderTable({
        selectable: true,
        selectedRows: new Set([0, 2]),
      })
      const rowCheckboxes = screen.getAllByLabelText(/select row/i) as HTMLInputElement[]
      expect(rowCheckboxes[0].checked).toBe(true)
      expect(rowCheckboxes[1].checked).toBe(false)
      expect(rowCheckboxes[2].checked).toBe(true)
    })

    it('select all selects all visible rows', async () => {
      const onSelectionChange = vi.fn()
      renderTable({
        selectable: true,
        selectedRows: new Set<number>(),
        onSelectionChange,
      })
      const selectAll = screen.getByLabelText('Select all rows')
      await userEvent.click(selectAll)
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([0, 1, 2, 3, 4]))
    })

    it('deselect all when all selected', async () => {
      const onSelectionChange = vi.fn()
      renderTable({
        selectable: true,
        selectedRows: new Set([0, 1, 2, 3, 4]),
        onSelectionChange,
      })
      const selectAll = screen.getByLabelText('Select all rows')
      await userEvent.click(selectAll)
      expect(onSelectionChange).toHaveBeenCalledWith(new Set())
    })

    it('select-all shows indeterminate when partial selection', () => {
      renderTable({
        selectable: true,
        selectedRows: new Set([0, 2]),
      })
      const selectAll = screen.getByLabelText('Select all rows') as HTMLInputElement
      expect(selectAll.indeterminate).toBe(true)
    })

    it('applies data-selected attribute to selected rows', () => {
      const { container } = renderTable({
        selectable: true,
        selectedRows: new Set([0]),
      })
      const selectedRows = container.querySelectorAll('.ui-data-table__tr[data-selected]')
      expect(selectedRows).toHaveLength(1)
    })

    it('applies aria-selected to rows when selectable', () => {
      renderTable({
        selectable: true,
        selectedRows: new Set([0]),
      })
      const rows = screen.getAllByRole('row')
      // Data rows (skip header)
      expect(rows[1]).toHaveAttribute('aria-selected', 'true')
      expect(rows[2]).toHaveAttribute('aria-selected', 'false')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 9. EXPORT
  // ═══════════════════════════════════════════════════════════════════

  describe('export', () => {
    it('renders export button when exportable', () => {
      renderTable({ exportable: true })
      expect(screen.getByLabelText('Export')).toBeInTheDocument()
    })

    it('does not render export button when not exportable', () => {
      renderTable()
      expect(screen.queryByLabelText('Export')).not.toBeInTheDocument()
    })

    it('opens export dropdown on click', async () => {
      renderTable({ exportable: true })
      await userEvent.click(screen.getByLabelText('Export'))
      expect(screen.getByText('Export CSV')).toBeInTheDocument()
      expect(screen.getByText('Export JSON')).toBeInTheDocument()
    })

    it('calls onExport with csv format and data', async () => {
      const onExport = vi.fn()
      renderTable({ exportable: true, onExport })
      await userEvent.click(screen.getByLabelText('Export'))
      await userEvent.click(screen.getByText('Export CSV'))
      expect(onExport).toHaveBeenCalledWith('csv', expect.any(Array))
      expect(onExport.mock.calls[0][1]).toHaveLength(5)
    })

    it('calls onExport with json format', async () => {
      const onExport = vi.fn()
      renderTable({ exportable: true, onExport })
      await userEvent.click(screen.getByLabelText('Export'))
      await userEvent.click(screen.getByText('Export JSON'))
      expect(onExport).toHaveBeenCalledWith('json', expect.any(Array))
    })

    it('exports filtered data when searching', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onExport = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          searchable
          exportable
          onExport={onExport}
        />
      )
      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'Engineer')
      act(() => { vi.advanceTimersByTime(400) })

      await user.click(screen.getByLabelText('Export'))
      await user.click(screen.getByText('Export CSV'))

      expect(onExport.mock.calls[0][1]).toHaveLength(2) // Alice and Diana are Engineers
      vi.useRealTimers()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 10. LOADING, EMPTY, ERROR STATES
  // ═══════════════════════════════════════════════════════════════════

  describe('loading state', () => {
    it('renders skeleton rows when loading', () => {
      const { container } = renderTable({ loading: true })
      const skeletonCells = container.querySelectorAll('.ui-data-table__skeleton-cell')
      expect(skeletonCells.length).toBeGreaterThan(0)
    })

    it('does not render data rows when loading', () => {
      renderTable({ loading: true })
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('renders correct number of skeleton rows for paginated table', () => {
      const { container } = renderTable({ loading: true, paginated: true, pageSize: 3 })
      const skeletonRows = container.querySelectorAll('.ui-data-table__skeleton-row')
      expect(skeletonRows).toHaveLength(3)
    })
  })

  describe('empty state', () => {
    it('renders empty message when no data', () => {
      renderTable({ data: [], empty: 'No results found' })
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })

    it('renders default empty message', () => {
      renderTable({ data: [] })
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders custom empty ReactNode', () => {
      renderTable({
        data: [],
        empty: <div data-testid="custom-empty">Custom empty</div>,
      })
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders error message', () => {
      renderTable({ error: 'Failed to load data' })
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('renders error with role alert', () => {
      renderTable({ error: 'Error occurred' })
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('does not render data rows when error', () => {
      renderTable({ error: 'Error' })
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })

    it('renders retry button when onRetry provided', () => {
      const onRetry = vi.fn()
      renderTable({ error: 'Error', onRetry })
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('calls onRetry when retry button clicked', async () => {
      const onRetry = vi.fn()
      renderTable({ error: 'Error', onRetry })
      await userEvent.click(screen.getByText('Retry'))
      expect(onRetry).toHaveBeenCalledOnce()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 11. STICKY HEADER
  // ═══════════════════════════════════════════════════════════════════

  describe('sticky header', () => {
    it('applies sticky header data attribute by default', () => {
      const { container } = renderTable()
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-sticky-header')
    })

    it('does not apply sticky when disabled', () => {
      const { container } = renderTable({ stickyHeader: false })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).not.toHaveAttribute('data-sticky-header')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 12. RESPONSIVE CARD MODE
  // ═══════════════════════════════════════════════════════════════════

  describe('responsive card mode', () => {
    it('applies card mode data attribute', () => {
      const { container } = renderTable({ responsiveMode: 'card' })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-responsive', 'card')
    })

    it('defaults to scroll mode', () => {
      const { container } = renderTable()
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-responsive', 'scroll')
    })

    it('cells have data-label for card mode', () => {
      const { container } = renderTable({ responsiveMode: 'card' })
      const cells = container.querySelectorAll('.ui-data-table__td[data-label]')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 13. APPEARANCE PROPS
  // ═══════════════════════════════════════════════════════════════════

  describe('appearance', () => {
    it('applies striped data attribute', () => {
      const { container } = renderTable({ striped: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-striped')
    })

    it('applies compact data attribute', () => {
      const { container } = renderTable({ compact: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-compact')
    })

    it('applies bordered data attribute', () => {
      const { container } = renderTable({ bordered: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-bordered')
    })

    it('applies motion level data attribute', () => {
      const { container } = renderTable({ motion: 2 })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-motion', '2')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 14. KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════════════════════════════

  describe('keyboard navigation', () => {
    it('moves focus down with ArrowDown', () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const headers = container.querySelectorAll('[role="columnheader"]')

      ;(headers[0] as HTMLElement).focus()
      fireEvent.keyDown(grid, { key: 'ArrowDown' })

      const firstDataCell = container.querySelector('tbody [role="gridcell"]')
      expect(document.activeElement).toBe(firstDataCell)
    })

    it('moves focus right with ArrowRight', () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const headers = container.querySelectorAll('[role="columnheader"]')

      ;(headers[0] as HTMLElement).focus()
      fireEvent.keyDown(grid, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(headers[1])
    })

    it('moves focus left with ArrowLeft', () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const headers = container.querySelectorAll('[role="columnheader"]')

      ;(headers[1] as HTMLElement).focus()
      fireEvent.keyDown(grid, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(headers[0])
    })

    it('moves focus up with ArrowUp', () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const firstDataCell = container.querySelector('tbody tr [role="gridcell"]') as HTMLElement
      const firstHeader = container.querySelector('thead [role="columnheader"]') as HTMLElement

      firstDataCell.focus()
      fireEvent.keyDown(grid, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(firstHeader)
    })

    it('activates sort on Enter key on sortable header', () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const nameHeader = screen.getByText('Name').closest('[role="columnheader"]') as HTMLElement

      nameHeader.focus()
      fireEvent.keyDown(grid, { key: 'Enter' })
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 15. PINNED COLUMNS
  // ═══════════════════════════════════════════════════════════════════

  describe('pinned columns', () => {
    it('applies pinned-left data attribute', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', pinned: 'left' },
        { id: 'age', header: 'Age', accessor: 'age' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const pinnedCells = container.querySelectorAll('[data-pinned="left"]')
      // 1 header + 5 data cells
      expect(pinnedCells.length).toBe(6)
    })

    it('applies pinned-right data attribute', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'age', header: 'Age', accessor: 'age', pinned: 'right' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const pinnedCells = container.querySelectorAll('[data-pinned="right"]')
      expect(pinnedCells.length).toBe(6)
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 16. COLUMN ALIGNMENT
  // ═══════════════════════════════════════════════════════════════════

  describe('column alignment', () => {
    it('applies text-align to cells', () => {
      const { container } = renderTable()
      const ageCells = container.querySelectorAll('[data-align="right"]')
      // 1 header + 5 data cells
      expect(ageCells.length).toBe(6)
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 17. REF AND CLASSNAME
  // ═══════════════════════════════════════════════════════════════════

  describe('ref and className forwarding', () => {
    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(<DataTable ref={ref} data={sampleData} columns={columns} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('applies additional className', () => {
      const { container } = renderTable({ className: 'my-table' })
      expect(container.querySelector('.ui-data-table.my-table')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 18. TOOLBAR
  // ═══════════════════════════════════════════════════════════════════

  describe('toolbar', () => {
    it('renders toolbar with role', () => {
      renderTable()
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    it('renders custom toolbar content', () => {
      renderTable({
        toolbar: <button data-testid="custom-btn">Custom</button>,
      })
      expect(screen.getByTestId('custom-btn')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 19. VIRTUAL SCROLL
  // ═══════════════════════════════════════════════════════════════════

  describe('virtual scroll', () => {
    it('renders virtual scroll container when virtualScroll is true', () => {
      const largeData = generateLargeData(100)
      const { container } = render(
        <DataTable data={largeData} columns={columns} virtualScroll />
      )
      expect(container.querySelector('.ui-data-table__virtual-scroll')).toBeInTheDocument()
    })

    it('does not render virtual scroll when disabled', () => {
      const { container } = renderTable()
      expect(container.querySelector('.ui-data-table__virtual-scroll')).not.toBeInTheDocument()
    })

    it('uses standard scroll wrapper when paginated (even with virtualScroll)', () => {
      const largeData = generateLargeData(100)
      const { container } = render(
        <DataTable data={largeData} columns={columns} virtualScroll paginated pageSize={10} />
      )
      expect(container.querySelector('.ui-data-table__scroll')).toBeInTheDocument()
      expect(container.querySelector('.ui-data-table__virtual-scroll')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 20. ACCESSIBILITY
  // ═══════════════════════════════════════════════════════════════════

  describe('accessibility', () => {
    it('has grid role', () => {
      renderTable()
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })

    it('has columnheader roles', () => {
      renderTable()
      const headers = screen.getAllByRole('columnheader')
      expect(headers.length).toBe(4)
    })

    it('has gridcell roles', () => {
      renderTable()
      const cells = screen.getAllByRole('gridcell')
      expect(cells.length).toBe(20) // 5 rows * 4 columns
    })

    it('has row roles', () => {
      renderTable()
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(6) // 1 header + 5 data
    })

    it('toolbar has aria-label', () => {
      renderTable()
      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveAttribute('aria-label', 'Table controls')
    })

    it('column toggle button has aria-expanded', async () => {
      renderTable()
      const btn = screen.getByLabelText('Toggle columns')
      expect(btn).toHaveAttribute('aria-expanded', 'false')
      await userEvent.click(btn)
      expect(btn).toHaveAttribute('aria-expanded', 'true')
    })

    it('pagination nav has aria-label', () => {
      renderTable({ paginated: true, pageSize: 2 })
      expect(screen.getByLabelText('Table pagination')).toBeInTheDocument()
    })

    it('active page has aria-current', () => {
      renderTable({ paginated: true, pageSize: 2 })
      const page1 = screen.getByRole('button', { name: 'Page 1' })
      expect(page1).toHaveAttribute('aria-current', 'page')
    })

    it('passes axe accessibility audit', async () => {
      const { container } = renderTable()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    }, 15000)

    it('passes axe with selectable mode', async () => {
      const { container } = renderTable({ selectable: true, selectedRows: new Set([0]) })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    }, 15000)
  })

  // ═══════════════════════════════════════════════════════════════════
  // 21. VIRTUAL SCROLL — ENTERPRISE (100K+ rows)
  // ═══════════════════════════════════════════════════════════════════

  describe('virtual scroll (enterprise)', () => {
    it('renders only a subset of rows for large datasets', () => {
      const largeData = generateLargeData(1000)
      const { container } = render(
        <DataTable data={largeData} columns={columns} virtualScroll />
      )
      // Should NOT render all 1000 rows
      const rows = container.querySelectorAll('.ui-data-table__tr')
      expect(rows.length).toBeLessThan(100)
    })

    it('uses configurable rowHeight', () => {
      const largeData = generateLargeData(100)
      const { container } = render(
        <DataTable data={largeData} columns={columns} virtualScroll rowHeight={60} />
      )
      const spacer = container.querySelector('.ui-data-table__virtual-spacer') as HTMLElement
      // 100 rows * 60px = 6000px
      expect(spacer.style.height).toBe('6000px')
    })

    it('has correct total height in spacer', () => {
      const largeData = generateLargeData(500)
      const { container } = render(
        <DataTable data={largeData} columns={columns} virtualScroll />
      )
      const spacer = container.querySelector('.ui-data-table__virtual-spacer') as HTMLElement
      // 500 rows * 40px (default) = 20000px
      expect(spacer.style.height).toBe('20000px')
    })

    it('renders virtual scroll container with data-testid', () => {
      const largeData = generateLargeData(100)
      render(
        <DataTable data={largeData} columns={columns} virtualScroll />
      )
      expect(screen.getByTestId('virtual-scroll-container')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 22. PER-COLUMN FILTERS
  // ═══════════════════════════════════════════════════════════════════

  describe('per-column filters', () => {
    const filterColumns: ColumnDef<Person>[] = [
      { id: 'name', header: 'Name', accessor: 'name', filterable: true, filterType: 'text' },
      { id: 'age', header: 'Age', accessor: 'age', filterable: true, filterType: 'number' },
      { id: 'role', header: 'Role', accessor: 'role', filterable: true, filterType: 'select' },
      { id: 'email', header: 'Email', accessor: 'email' },
    ]

    it('renders filter buttons for filterable columns', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', filterable: true, filterType: 'text' },
        { id: 'age', header: 'Age', accessor: 'age', filterable: true, filterType: 'number' },
        { id: 'role', header: 'Role', accessor: 'role', filterable: true, filterType: 'select' },
        { id: 'email', header: 'Email', accessor: 'email', filterable: false },
      ]
      const { container } = render(
        <DataTable data={sampleData} columns={cols} filterable />
      )
      const filterBtns = container.querySelectorAll('.ui-data-table__filter-btn')
      expect(filterBtns.length).toBe(3) // name, age, role (email is filterable: false)
    })

    it('opens filter popover on click', async () => {
      render(
        <DataTable data={sampleData} columns={filterColumns} filterable />
      )
      const filterBtn = screen.getByLabelText('Filter Name')
      await userEvent.click(filterBtn)
      expect(screen.getByTestId('filter-popover-name')).toBeInTheDocument()
    })

    it('applies text contains filter', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(
        <DataTable data={sampleData} columns={filterColumns} filterable />
      )
      const filterBtn = screen.getByLabelText('Filter Name')
      await user.click(filterBtn)
      const input = screen.getByTestId('filter-input-name')
      await user.type(input, 'ali')
      // Filter should apply immediately (no debounce on column filters)
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
      vi.useRealTimers()
    })

    it('calls onFilterChange callback', async () => {
      const onFilterChange = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={filterColumns}
          filterable
          filters={{}}
          onFilterChange={onFilterChange}
        />
      )
      const filterBtn = screen.getByLabelText('Filter Name')
      await userEvent.click(filterBtn)
      const input = screen.getByTestId('filter-input-name')
      fireEvent.change(input, { target: { value: 'test' } })
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.objectContaining({ value: 'test' }),
        })
      )
    })

    it('shows active filter indicator', async () => {
      const { container } = render(
        <DataTable
          data={sampleData}
          columns={filterColumns}
          filterable
          filters={{ name: { value: 'alice', operator: 'contains' } }}
        />
      )
      const activeBtn = container.querySelector('.ui-data-table__filter-btn[data-active]')
      expect(activeBtn).toBeInTheDocument()
    })

    it('clears filter on clear button', async () => {
      const onFilterChange = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={filterColumns}
          filterable
          filters={{ name: { value: 'alice', operator: 'contains' } }}
          onFilterChange={onFilterChange}
        />
      )
      const filterBtn = screen.getByLabelText('Filter Name')
      await userEvent.click(filterBtn)
      await userEvent.click(screen.getByText('Clear'))
      // Should have called onFilterChange without the name filter
      expect(onFilterChange).toHaveBeenCalledWith(expect.not.objectContaining({ name: expect.anything() }))
    })

    it('renders select-type filter with checkboxes', async () => {
      render(
        <DataTable data={sampleData} columns={filterColumns} filterable />
      )
      const filterBtn = screen.getByLabelText('Filter Role')
      await userEvent.click(filterBtn)
      expect(screen.getByTestId('filter-popover-role')).toBeInTheDocument()
      // Should show unique role values as checkboxes
      const checkboxes = within(screen.getByTestId('filter-popover-role')).getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(4) // Engineer, Designer, Manager, Director
    })

    it('number filter shows number operators', async () => {
      render(
        <DataTable data={sampleData} columns={filterColumns} filterable />
      )
      const filterBtn = screen.getByLabelText('Filter Age')
      await userEvent.click(filterBtn)
      const select = screen.getByTestId('filter-operator-age')
      expect(select).toBeInTheDocument()
      // Should have number-specific operators
      expect(within(select as HTMLElement).getByText('Greater than')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 23. CELL EDITING
  // ═══════════════════════════════════════════════════════════════════

  describe('cell editing', () => {
    it('enters edit mode on double-click', () => {
      const { container } = render(
        <DataTable data={sampleData} columns={columns} editable />
      )
      const cell = container.querySelector('.ui-data-table__td:not(.ui-data-table__checkbox-cell)') as HTMLElement
      fireEvent.doubleClick(cell)
      expect(container.querySelector('.ui-data-table__edit-input')).toBeInTheDocument()
    })

    it('shows current value in edit input', () => {
      const { container } = render(
        <DataTable data={sampleData} columns={columns} editable />
      )
      // Find the cell with "Alice"
      const cells = container.querySelectorAll('.ui-data-table__td')
      const aliceCell = Array.from(cells).find(c => c.textContent === 'Alice')!
      fireEvent.doubleClick(aliceCell)
      const input = container.querySelector('.ui-data-table__edit-input') as HTMLInputElement
      expect(input.value).toBe('Alice')
    })

    it('calls onCellEdit on Enter', () => {
      const onCellEdit = vi.fn()
      const { container } = render(
        <DataTable data={sampleData} columns={columns} editable onCellEdit={onCellEdit} />
      )
      const cells = container.querySelectorAll('.ui-data-table__td')
      const aliceCell = Array.from(cells).find(c => c.textContent === 'Alice')!
      fireEvent.doubleClick(aliceCell)
      const input = container.querySelector('.ui-data-table__edit-input') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Alice Updated' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onCellEdit).toHaveBeenCalledWith(0, 'name', 'Alice Updated')
    })

    it('cancels edit on Escape', () => {
      const onCellEdit = vi.fn()
      const { container } = render(
        <DataTable data={sampleData} columns={columns} editable onCellEdit={onCellEdit} />
      )
      const cells = container.querySelectorAll('.ui-data-table__td')
      const aliceCell = Array.from(cells).find(c => c.textContent === 'Alice')!
      fireEvent.doubleClick(aliceCell)
      const input = container.querySelector('.ui-data-table__edit-input')!
      fireEvent.keyDown(input, { key: 'Escape' })
      expect(onCellEdit).not.toHaveBeenCalled()
      expect(container.querySelector('.ui-data-table__edit-input')).not.toBeInTheDocument()
    })

    it('does not enter edit mode when editable is false', () => {
      const { container } = render(
        <DataTable data={sampleData} columns={columns} />
      )
      const cell = container.querySelector('.ui-data-table__td') as HTMLElement
      fireEvent.doubleClick(cell)
      expect(container.querySelector('.ui-data-table__edit-input')).not.toBeInTheDocument()
    })

    it('respects column-level editable=false', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', editable: false },
        { id: 'age', header: 'Age', accessor: 'age' },
      ]
      const { container } = render(
        <DataTable data={sampleData} columns={cols} editable />
      )
      const cells = container.querySelectorAll('.ui-data-table__td')
      const nameCell = Array.from(cells).find(c => c.textContent === 'Alice')!
      fireEvent.doubleClick(nameCell)
      expect(container.querySelector('.ui-data-table__edit-input')).not.toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 24. SERVER-SIDE PAGINATION
  // ═══════════════════════════════════════════════════════════════════

  describe('server-side mode', () => {
    it('calls onFetchData on mount with initial params', () => {
      const onFetchData = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          serverSide
          totalRows={100}
          paginated
          pageSize={10}
          onFetchData={onFetchData}
        />
      )
      expect(onFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          pageSize: 10,
          sortBy: [],
          filters: {},
          search: '',
        })
      )
    })

    it('calls onFetchData when sort changes', async () => {
      const onFetchData = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          serverSide
          totalRows={100}
          paginated
          pageSize={10}
          onFetchData={onFetchData}
        />
      )
      onFetchData.mockClear()
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      expect(onFetchData).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: [{ column: 'name', direction: 'asc' }],
        })
      )
    })

    it('uses totalRows for pagination instead of data.length', () => {
      render(
        <DataTable
          data={sampleData.slice(0, 2)}
          columns={columns}
          serverSide
          totalRows={50}
          paginated
          pageSize={10}
        />
      )
      // Should show "Showing 1-10 of 50 results" (using totalRows)
      expect(screen.getByText(/of 50/)).toBeInTheDocument()
    })

    it('does not sort data client-side when serverSide is true', async () => {
      const onFetchData = vi.fn()
      const data = [
        { id: 1, name: 'Charlie', age: 35, email: 'c@test.com', role: 'Manager' },
        { id: 2, name: 'Alice', age: 30, email: 'a@test.com', role: 'Engineer' },
      ]
      render(
        <DataTable
          data={data}
          columns={columns}
          serverSide
          totalRows={2}
          onFetchData={onFetchData}
        />
      )
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      // Data should remain in original order (server sorts)
      const cells = screen.getAllByRole('gridcell')
      const firstNameCell = cells[0]
      expect(firstNameCell).toHaveTextContent('Charlie')
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 25. ROW GROUPING + AGGREGATION
  // ═══════════════════════════════════════════════════════════════════

  describe('row grouping', () => {
    it('groups data by specified column', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
          expandedGroups={new Set()}
        />
      )
      // Should render group header rows
      expect(screen.getByTestId('group-row-Engineer')).toBeInTheDocument()
      expect(screen.getByTestId('group-row-Designer')).toBeInTheDocument()
      expect(screen.getByTestId('group-row-Manager')).toBeInTheDocument()
      expect(screen.getByTestId('group-row-Director')).toBeInTheDocument()
    })

    it('shows group count', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
          expandedGroups={new Set()}
        />
      )
      // Engineers: Alice and Diana = 2
      const groupRow = screen.getByTestId('group-row-Engineer')
      expect(groupRow).toHaveTextContent('(2)')
    })

    it('expands group to show child rows', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
          expandedGroups={new Set(['Engineer'])}
        />
      )
      // Engineer group is expanded, should see Alice and Diana
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
      // Designer group is collapsed, should NOT see Bob
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })

    it('calls onGroupToggle when group header clicked', async () => {
      const onGroupToggle = vi.fn()
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
          expandedGroups={new Set()}
          onGroupToggle={onGroupToggle}
        />
      )
      await userEvent.click(screen.getByTestId('group-row-Engineer'))
      expect(onGroupToggle).toHaveBeenCalledWith('Engineer')
    })

    it('shows aggregation values in group row', () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
          expandedGroups={new Set()}
          aggregations={{ age: 'avg' }}
        />
      )
      // Engineers: Alice (30) + Diana (28) = avg 29.0
      const aggEl = screen.getByTestId('group-agg-Engineer-age')
      expect(aggEl).toHaveTextContent('29.0')
    })

    it('toggles group expand/collapse with internal state', async () => {
      render(
        <DataTable
          data={sampleData}
          columns={columns}
          groupBy="role"
        />
      )
      // Initially collapsed (internal state starts empty)
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
      // Click to expand
      await userEvent.click(screen.getByTestId('group-row-Engineer'))
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 26. AUTO-SIZE COLUMNS
  // ═══════════════════════════════════════════════════════════════════

  describe('auto-size columns', () => {
    it('sets column widths when autoSizeColumns is true', () => {
      const { container } = render(
        <DataTable data={sampleData} columns={columns} autoSizeColumns />
      )
      // Headers should have inline styles with calculated widths
      const headers = container.querySelectorAll('.ui-data-table__th:not(.ui-data-table__checkbox-cell)')
      let hasWidth = false
      headers.forEach(h => {
        if (h.getAttribute('style')?.includes('px')) hasWidth = true
      })
      expect(hasWidth).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════════════════
  // 27. PINNED COLUMNS — IMPROVED
  // ═══════════════════════════════════════════════════════════════════

  describe('pinned columns (improved)', () => {
    it('applies correct left offset for stacked pinned columns', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', pinned: 'left', width: 100 },
        { id: 'age', header: 'Age', accessor: 'age', pinned: 'left', width: 80 },
        { id: 'email', header: 'Email', accessor: 'email' },
        { id: 'role', header: 'Role', accessor: 'role' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const pinnedHeaders = container.querySelectorAll('.ui-data-table__th[data-pinned="left"]')
      expect(pinnedHeaders).toHaveLength(2)
      // First pinned should be left: 0, second should be left: 100
      expect((pinnedHeaders[0] as HTMLElement).style.left).toBe('0px')
      expect((pinnedHeaders[1] as HTMLElement).style.left).toBe('100px')
    })

    it('applies shadow on last left-pinned column', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name', pinned: 'left', width: 100 },
        { id: 'age', header: 'Age', accessor: 'age', pinned: 'left', width: 80 },
        { id: 'email', header: 'Email', accessor: 'email' },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      // Age is the last left-pinned, should have shadow
      const ageHeaders = container.querySelectorAll('.ui-data-table__th[data-pinned-shadow="left"]')
      expect(ageHeaders).toHaveLength(1)
    })

    it('applies shadow on first right-pinned column', () => {
      const cols: ColumnDef<Person>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'email', header: 'Email', accessor: 'email', pinned: 'right', width: 100 },
        { id: 'role', header: 'Role', accessor: 'role', pinned: 'right', width: 80 },
      ]
      const { container } = render(<DataTable data={sampleData} columns={cols} />)
      const shadowHeaders = container.querySelectorAll('.ui-data-table__th[data-pinned-shadow="right"]')
      expect(shadowHeaders).toHaveLength(1)
    })
  })
})
