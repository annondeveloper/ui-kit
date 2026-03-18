import type { Meta, StoryObj } from '@storybook/react'
import { Inbox, Search, ServerCrash, Plus } from 'lucide-react'
import { EmptyState } from './empty-state'
import { Button } from './button'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    icon: Inbox,
    title: 'No entities found',
    description: 'There are no entities matching your filters. Try broadening your search.',
  },
}

export const WithActions: Story = {
  args: {
    icon: ServerCrash,
    title: 'No devices discovered',
    description: 'Run a network scan to discover devices on your network.',
    actions: (
      <>
        <Button variant="primary"><Plus className="h-4 w-4" /> Run Discovery</Button>
        <Button variant="outline">Import CSV</Button>
      </>
    ),
  },
}

export const SearchEmpty: Story = {
  args: {
    icon: Search,
    title: 'No results',
    description: 'No rows match your search or filter criteria.',
  },
}
