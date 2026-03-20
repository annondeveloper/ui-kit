import type { Meta, StoryObj } from '@storybook/react'
import { DropdownMenu } from './dropdown-menu'
import { Button } from './button'

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  argTypes: {
    placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
  },
}
export default meta
type Story = StoryObj<typeof DropdownMenu>

const sampleItems = [
  { label: 'Edit', shortcut: 'Ctrl+E', onClick: () => {} },
  { label: 'Duplicate', shortcut: 'Ctrl+D', onClick: () => {} },
  { type: 'separator' as const },
  { label: 'Delete', danger: true, onClick: () => {} },
]

export const Default: Story = {
  render: () => (
    <DropdownMenu items={sampleItems}>
      <Button variant="secondary">Actions</Button>
    </DropdownMenu>
  ),
}

export const WithSections: Story = {
  render: () => (
    <DropdownMenu
      items={[
        { type: 'label', label: 'Navigation' },
        { label: 'Dashboard', onClick: () => {} },
        { label: 'Settings', onClick: () => {} },
        { type: 'separator' },
        { type: 'label', label: 'Account' },
        { label: 'Profile', onClick: () => {} },
        { label: 'Sign out', danger: true, onClick: () => {} },
      ]}
    >
      <Button variant="secondary">Menu</Button>
    </DropdownMenu>
  ),
}
