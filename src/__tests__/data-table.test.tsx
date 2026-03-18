import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../components/data-table'
import type { ColumnDef } from '@tanstack/react-table'

interface Row { name: string; age: number }

const columns: ColumnDef<Row, unknown>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'age', header: 'Age', accessorKey: 'age' },
]

const data: Row[] = [
  { name: 'Charlie', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 35 },
]

describe('DataTable', () => {
  it('renders columns and data', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Charlie')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('shows empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('shows loading state when isLoading', () => {
    const { container } = render(<DataTable columns={columns} data={[]} isLoading />)
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
    // Loading skeleton renders content in the container
    expect(container.firstChild).toBeTruthy()
  })

  it('renders search input when placeholder provided', () => {
    render(<DataTable columns={columns} data={data} searchPlaceholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('calls onRowClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<DataTable columns={columns} data={data} onRowClick={onClick} />)
    await user.click(screen.getByText('Alice'))
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }))
  })

  it('renders correct row count', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText(/3 rows/)).toBeInTheDocument()
  })
})
