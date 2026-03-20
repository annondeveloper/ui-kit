import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    animate: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: { variant: 'text', width: 200, animate: true },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton variant="text" width={200} animate />
      <Skeleton variant="text" width={160} animate />
      <Skeleton variant="circular" width={48} height={48} animate />
      <Skeleton variant="rectangular" width={300} height={120} animate />
    </div>
  ),
}

export const MultipleLines: Story = {
  args: { variant: 'text', lines: 4, animate: true },
}
