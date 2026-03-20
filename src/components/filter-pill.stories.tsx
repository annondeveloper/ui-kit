import type { Meta, StoryObj } from '@storybook/react'
import { FilterPill, FilterPillGroup } from './filter-pill'

const meta: Meta<typeof FilterPill> = {
  title: 'Components/FilterPill',
  component: FilterPill,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    active: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof FilterPill>

export const Default: Story = {
  args: { label: 'Status: Active', active: true },
}

export const WithCount: Story = {
  args: { label: 'Type: Error', count: 12, active: true },
}

export const Group: Story = {
  render: () => (
    <FilterPillGroup onClearAll={() => {}}>
      <FilterPill label="Status: Active" active onRemove={() => {}} />
      <FilterPill label="Region: US" active onRemove={() => {}} />
      <FilterPill label="Type: Warning" active count={3} onRemove={() => {}} />
    </FilterPillGroup>
  ),
}
