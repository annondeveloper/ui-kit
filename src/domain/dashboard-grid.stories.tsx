import type { Meta, StoryObj } from '@storybook/react'
import { DashboardGrid, type DashboardGroup } from './dashboard-grid'

const meta: Meta<typeof DashboardGrid> = {
  title: 'Domain/DashboardGrid',
  component: DashboardGrid,
  argTypes: {
    columns: { control: 'select', options: ['auto', 1, 2, 3, 4] },
    gap: { control: 'select', options: ['sm', 'md', 'lg'] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof DashboardGrid>

const Card = ({ label }: { label: string }) => (
  <div style={{ padding: '1.5rem', background: 'oklch(25% 0.02 270)', borderRadius: '0.75rem', border: '1px solid oklch(100% 0 0 / 0.08)', color: 'oklch(90% 0 0)' }}>
    {label}
  </div>
)

const sampleGroups: DashboardGroup[] = [
  { id: 'traffic', title: 'Traffic', summary: <span>12.4k total</span>, items: [<Card key="a" label="Page Views" />, <Card key="b" label="Sessions" />] },
  { id: 'revenue', title: 'Revenue', items: [<Card key="c" label="MRR" />, <Card key="d" label="ARR" />, <Card key="e" label="Churn" />] },
]

export const Default: Story = {
  args: {
    children: (
      <>
        <Card label="Metric A" /><Card label="Metric B" />
        <Card label="Metric C" /><Card label="Metric D" />
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <DashboardGrid columns="auto" gap="md">
        <Card label="Auto 1" /><Card label="Auto 2" /><Card label="Auto 3" />
      </DashboardGrid>
      <DashboardGrid columns={2} gap="lg">
        <Card label="Two Col 1" /><Card label="Two Col 2" />
      </DashboardGrid>
      <DashboardGrid groups={sampleGroups} gap="md" />
    </div>
  ),
}

export const Interactive: Story = {
  args: { groups: sampleGroups, columns: 'auto', gap: 'md', motion: 3 },
}
