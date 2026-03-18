import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { EmptyState } from '../components/empty-state'

describe('EmptyState', () => {
  it('renders icon, title, description', () => {
    const { container } = render(
      <EmptyState icon={Search} title="No Results" description="Try a different search." />
    )
    expect(screen.getByText('No Results')).toBeInTheDocument()
    expect(screen.getByText('Try a different search.')).toBeInTheDocument()
    // Icon renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(
      <EmptyState
        icon={Search}
        title="Empty"
        description="Nothing here."
        actions={<button>Add Item</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })
})
