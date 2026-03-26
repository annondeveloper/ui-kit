import type { Meta, StoryObj } from '@storybook/react'
import { SearchInput } from './search-input'

const meta: Meta<typeof SearchInput> = {
  title: 'Components/SearchInput',
  component: SearchInput,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
    debounce: { control: { type: 'number', min: 0, max: 2000, step: 100 } },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof SearchInput>

export const Default: Story = {
  args: { placeholder: 'Search...' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxInlineSize: '24rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <SearchInput key={s} size={s} placeholder={`Size: ${s}`} />
      ))}
    </div>
  ),
}

export const Loading: Story = {
  args: { placeholder: 'Searching...', loading: true, defaultValue: 'query' },
}

export const Clearable: Story = {
  args: { placeholder: 'Type to search', clearable: true, defaultValue: 'Hello' },
}

export const Debounced: Story = {
  args: { placeholder: 'Debounced (500ms)', debounce: 500, clearable: true },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true },
}
