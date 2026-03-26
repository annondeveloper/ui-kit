import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 1, max: 100 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    showFirst: { control: 'boolean' },
    showPrevNext: { control: 'boolean' },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  args: { page: 1, totalPages: 10, onChange: () => {} },
}

export const MiddlePage: Story = {
  args: { page: 5, totalPages: 20, onChange: () => {} },
}

export const WithFirstAndPrevNext: Story = {
  args: { page: 8, totalPages: 15, showFirst: true, showPrevNext: true, onChange: () => {} },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Pagination key={s} page={3} totalPages={10} size={s} onChange={() => {}} />
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Pagination page={page} totalPages={20} showPrevNext onChange={setPage} />
        <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>Page {page} of 20</span>
      </div>
    )
  },
}
