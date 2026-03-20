import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from './combobox'

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    allowCreate: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Combobox>

const options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
]

export const Default: Story = {
  args: { name: 'framework', options, label: 'Framework', placeholder: 'Search frameworks...' },
}

export const AllowCreate: Story = {
  args: { name: 'tag', options, label: 'Tags', allowCreate: true, placeholder: 'Type to search or create...' },
}

export const Loading: Story = {
  args: { name: 'async', options: [], label: 'Async search', loading: true, placeholder: 'Loading...' },
}
