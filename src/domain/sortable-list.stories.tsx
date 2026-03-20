import type { Meta, StoryObj } from '@storybook/react'
import { SortableList } from './sortable-list'

const meta: Meta<typeof SortableList> = {
  title: 'Domain/SortableList',
  component: SortableList,
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    handle: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SortableList>

const items = [
  { id: '1', content: 'Configure CI/CD pipeline' },
  { id: '2', content: 'Write unit tests' },
  { id: '3', content: 'Update documentation' },
  { id: '4', content: 'Deploy to staging' },
  { id: '5', content: 'Code review' },
]

export const Default: Story = {
  args: { items, onChange: () => {} },
}

export const WithHandle: Story = {
  args: { items, onChange: () => {}, handle: true },
}
