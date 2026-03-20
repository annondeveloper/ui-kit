import type { Meta, StoryObj } from '@storybook/react'
import { KanbanColumn } from './kanban-column'

const meta: Meta<typeof KanbanColumn> = {
  title: 'Domain/KanbanColumn',
  component: KanbanColumn,
}
export default meta
type Story = StoryObj<typeof KanbanColumn>

const cards = [
  { id: '1', title: 'Design login page', tags: ['design', 'frontend'], priority: 'high' as const },
  { id: '2', title: 'Fix API timeout', tags: ['backend', 'bug'], priority: 'critical' as const },
  { id: '3', title: 'Update docs', tags: ['docs'], priority: 'low' as const },
]

export const Default: Story = {
  args: { columnId: 'todo', title: 'To Do', cards },
}

export const WithWipLimit: Story = {
  args: { columnId: 'in-progress', title: 'In Progress', cards, wipLimit: 3 },
}

export const MultipleColumns: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <KanbanColumn columnId="todo" title="To Do" cards={cards.slice(0, 2)} />
      <KanbanColumn columnId="in-progress" title="In Progress" cards={cards.slice(2)} wipLimit={3} />
      <KanbanColumn columnId="done" title="Done" cards={[]} />
    </div>
  ),
}
