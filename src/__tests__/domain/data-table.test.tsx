import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
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

describe('DataTable', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Basic Rendering ────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = renderTable()
      expect(container.querySelector('.ui-data-table')).toBeInTheDocument()
    })

    it('renders a table element', () => {
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
  })

  // ─── Sorting ────────────────────────────────────────────────────────

  describe('sorting', () => {
    it('renders sort indicators for sortable columns', () => {
      renderTable()
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
    })

    it('does not show sort indicator for non-sortable columns', () => {
      renderTable()
      const emailHeader = screen.getByText('Email').closest('th')!
      expect(emailHeader).not.toHaveAttribute('aria-sort')
    })

    it('calls onSort when clicking sortable column header', async () => {
      const onSort = vi.fn()
      renderTable({ onSort })
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      expect(onSort).toHaveBeenCalledWith('name', 'asc')
    })

    it('toggles sort direction on repeated click', async () => {
      const onSort = vi.fn()
      renderTable({ onSort, sortBy: 'name', sortDirection: 'asc' })
      const nameHeader = screen.getByText('Name').closest('th')!
      await userEvent.click(nameHeader)
      expect(onSort).toHaveBeenCalledWith('name', 'desc')
    })

    it('applies aria-sort ascending', () => {
      renderTable({ sortBy: 'name', sortDirection: 'asc' })
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })

    it('applies aria-sort descending', () => {
      renderTable({ sortBy: 'name', sortDirection: 'desc' })
      const nameHeader = screen.getByText('Name').closest('th')!
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('does not call onSort for non-sortable columns', async () => {
      const onSort = vi.fn()
      renderTable({ onSort })
      const emailHeader = screen.getByText('Email').closest('th')!
      await userEvent.click(emailHeader)
      expect(onSort).not.toHaveBeenCalled()
    })
  })

  // ─── Column Resize ─────────────────────────────────────────────────

  describe('column resize', () => {
    it('renders resize handles for resizable columns', () => {
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

      // Simulate drag
      fireEvent.pointerDown(handle, { clientX: 200 })
      fireEvent.pointerMove(handle, { clientX: 250 })
      fireEvent.pointerUp(handle)

      // Column should be wider
      const th = container.querySelector('th')!
      expect(th.style.inlineSize).toBe('250px')
    })
  })

  // ─── Row Selection ──────────────────────────────────────────────────

  describe('row selection', () => {
    it('renders checkboxes when selectable', () => {
      renderTable({ selectable: true })
      const checkboxes = screen.getAllByRole('checkbox')
      // 1 select-all + 5 row checkboxes
      expect(checkboxes).toHaveLength(6)
    })

    it('does not render checkboxes when not selectable', () => {
      renderTable()
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    })

    it('calls onSelectionChange when row checkbox clicked', async () => {
      const onSelectionChange = vi.fn()
      renderTable({
        selectable: true,
        selectedRows: new Set<number>(),
        onSelectionChange,
      })
      const checkboxes = screen.getAllByRole('checkbox')
      await userEvent.click(checkboxes[1]) // first row
      expect(onSelectionChange).toHaveBeenCalledWith(new Set([0]))
    })

    it('checks selected rows', () => {
      renderTable({
        selectable: true,
        selectedRows: new Set([0, 2]),
      })
      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
      expect(checkboxes[1].checked).toBe(true) // row 0
      expect(checkboxes[2].checked).toBe(false) // row 1
      expect(checkboxes[3].checked).toBe(true) // row 2
    })

    it('select all selects all rows', async () => {
      const onSelectionChange = vi.fn()
      renderTable({
        selectable: true,
        selectedRows: new Set<number>(),
        onSelectionChange,
      })
      const selectAll = screen.getAllByRole('checkbox')[0]
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
      const selectAll = screen.getAllByRole('checkbox')[0]
      await userEvent.click(selectAll)
      expect(onSelectionChange).toHaveBeenCalledWith(new Set())
    })

    it('select-all shows indeterminate when partial selection', () => {
      renderTable({
        selectable: true,
        selectedRows: new Set([0, 2]),
      })
      const selectAll = screen.getAllByRole('checkbox')[0] as HTMLInputElement
      expect(selectAll.indeterminate).toBe(true)
    })
  })

  // ─── Sticky Header ─────────────────────────────────────────────────

  describe('sticky header', () => {
    it('applies sticky header data attribute', () => {
      const { container } = renderTable({ stickyHeader: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-sticky-header')
    })

    it('does not apply sticky when not set', () => {
      const { container } = renderTable()
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).not.toHaveAttribute('data-sticky-header')
    })
  })

  // ─── Loading State ──────────────────────────────────────────────────

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

    it('renders correct number of skeleton rows', () => {
      const { container } = renderTable({ loading: true })
      const skeletonRows = container.querySelectorAll('.ui-data-table__skeleton-row')
      // Default skeleton row count
      expect(skeletonRows.length).toBeGreaterThanOrEqual(5)
    })
  })

  // ─── Empty State ────────────────────────────────────────────────────

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

  // ─── Error State ────────────────────────────────────────────────────

  describe('error state', () => {
    it('renders error message', () => {
      renderTable({ error: 'Failed to load data' })
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('renders error with role alert', () => {
      renderTable({ error: 'Error occurred' })
      expect(screen.getByRole('alert')).toHaveTextContent('Error occurred')
    })

    it('does not render data rows when error', () => {
      renderTable({ error: 'Error' })
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
    })
  })

  // ─── Responsive Card Mode ──────────────────────────────────────────

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
  })

  // ─── Striped Rows ──────────────────────────────────────────────────

  describe('striped rows', () => {
    it('applies striped data attribute', () => {
      const { container } = renderTable({ striped: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-striped')
    })
  })

  // ─── Compact Mode ──────────────────────────────────────────────────

  describe('compact mode', () => {
    it('applies compact data attribute', () => {
      const { container } = renderTable({ compact: true })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-compact')
    })
  })

  // ─── Keyboard Navigation ───────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('moves focus down with ArrowDown', async () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const cells = container.querySelectorAll('[role="gridcell"], [role="columnheader"]')

      // Focus the first cell
      ;(cells[0] as HTMLElement).focus()
      expect(document.activeElement).toBe(cells[0])

      fireEvent.keyDown(grid, { key: 'ArrowDown' })
      // Should move to same column in next row
      const firstDataCell = container.querySelector('tbody [role="gridcell"]')
      expect(document.activeElement).toBe(firstDataCell)
    })

    it('moves focus right with ArrowRight', async () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const headers = container.querySelectorAll('[role="columnheader"]')

      ;(headers[0] as HTMLElement).focus()
      fireEvent.keyDown(grid, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(headers[1])
    })

    it('moves focus left with ArrowLeft', async () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const headers = container.querySelectorAll('[role="columnheader"]')

      ;(headers[1] as HTMLElement).focus()
      fireEvent.keyDown(grid, { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(headers[0])
    })

    it('moves focus up with ArrowUp', async () => {
      const { container } = renderTable()
      const grid = screen.getByRole('grid')
      const firstDataCell = container.querySelector('tbody tr [role="gridcell"]') as HTMLElement
      const firstHeader = container.querySelector('thead [role="columnheader"]') as HTMLElement

      firstDataCell.focus()
      fireEvent.keyDown(grid, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(firstHeader)
    })

    it('activates sort on Enter key on sortable header', async () => {
      const onSort = vi.fn()
      const { container } = renderTable({ onSort })
      const grid = screen.getByRole('grid')
      const nameHeader = screen.getByText('Name').closest('[role="columnheader"]') as HTMLElement

      nameHeader.focus()
      fireEvent.keyDown(grid, { key: 'Enter' })
      expect(onSort).toHaveBeenCalledWith('name', 'asc')
    })
  })

  // ─── Pinned Columns ────────────────────────────────────────────────

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

  // ─── Export ─────────────────────────────────────────────────────────

  describe('export', () => {
    it('renders export buttons when onExport provided', () => {
      const onExport = vi.fn()
      renderTable({ onExport })
      expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /json/i })).toBeInTheDocument()
    })

    it('calls onExport with csv', async () => {
      const onExport = vi.fn()
      renderTable({ onExport })
      await userEvent.click(screen.getByRole('button', { name: /csv/i }))
      expect(onExport).toHaveBeenCalledWith('csv')
    })

    it('calls onExport with json', async () => {
      const onExport = vi.fn()
      renderTable({ onExport })
      await userEvent.click(screen.getByRole('button', { name: /json/i }))
      expect(onExport).toHaveBeenCalledWith('json')
    })

    it('does not render export buttons when no onExport', () => {
      renderTable()
      expect(screen.queryByRole('button', { name: /csv/i })).not.toBeInTheDocument()
    })
  })

  // ─── Pagination ─────────────────────────────────────────────────────

  describe('pagination', () => {
    it('paginates data when pageSize is set', () => {
      renderTable({ pageSize: 2 })
      const rows = screen.getAllByRole('row')
      // 1 header + 2 data rows
      expect(rows).toHaveLength(3)
    })

    it('shows page info', () => {
      renderTable({ pageSize: 2 })
      expect(screen.getByText(/1.*of.*3/i)).toBeInTheDocument()
    })

    it('navigates to next page', async () => {
      renderTable({ pageSize: 2 })
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn)
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('navigates to previous page', async () => {
      renderTable({ pageSize: 2 })
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn)
      const prevBtn = screen.getByRole('button', { name: /prev/i })
      await userEvent.click(prevBtn)
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('disables prev on first page', () => {
      renderTable({ pageSize: 2 })
      const prevBtn = screen.getByRole('button', { name: /prev/i })
      expect(prevBtn).toBeDisabled()
    })

    it('disables next on last page', async () => {
      renderTable({ pageSize: 2 })
      const nextBtn = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextBtn) // page 2
      await userEvent.click(nextBtn) // page 3
      expect(nextBtn).toBeDisabled()
    })
  })

  // ─── Column Alignment ──────────────────────────────────────────────

  describe('column alignment', () => {
    it('applies text-align to cells', () => {
      const { container } = renderTable()
      const ageCells = container.querySelectorAll('[data-align="right"]')
      // 1 header + 5 data cells
      expect(ageCells.length).toBe(6)
    })
  })

  // ─── Ref and ClassName ──────────────────────────────────────────────

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

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies motion level data attribute', () => {
      const { container } = renderTable({ motion: 2 })
      const wrapper = container.querySelector('.ui-data-table')!
      expect(wrapper).toHaveAttribute('data-motion', '2')
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

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

    it('passes axe accessibility audit', async () => {
      const { container } = renderTable()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes axe with selectable mode', async () => {
      const { container } = renderTable({ selectable: true, selectedRows: new Set([0]) })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
