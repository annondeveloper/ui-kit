import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './empty-state'
import { Button } from '../components/button'

const meta: Meta<typeof EmptyState> = {
  title: 'Domain/EmptyState',
  component: EmptyState,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No projects found',
    description: 'Create your first project to get started.',
    action: <Button variant="primary">Create Project</Button>,
  },
}

export const WithSecondaryAction: Story = {
  args: {
    title: 'No results',
    description: 'Try adjusting your search or filters.',
    action: <Button variant="primary">Clear filters</Button>,
    secondaryAction: <Button variant="ghost">Learn more</Button>,
  },
}
