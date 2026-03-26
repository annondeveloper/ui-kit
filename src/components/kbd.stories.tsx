import type { Meta, StoryObj } from '@storybook/react'
import { Kbd } from './kbd'

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
    variant: { control: 'select', options: ['default', 'ghost'] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Kbd>

export const Default: Story = {
  args: { children: 'K' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Kbd size="xs">Esc</Kbd>
      <Kbd size="sm">Shift</Kbd>
      <Kbd size="md">Enter</Kbd>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Kbd variant="default">Ctrl</Kbd>
      <Kbd variant="ghost">Ctrl</Kbd>
    </div>
  ),
}

export const ShortcutCombo: Story = {
  render: () => (
    <p style={{ color: 'oklch(80% 0 0)', fontSize: '0.875rem' }}>
      Press <Kbd size="xs">Ctrl</Kbd> + <Kbd size="xs">Shift</Kbd> + <Kbd size="xs">P</Kbd> to
      open the command palette
    </p>
  ),
}

export const GhostInline: Story = {
  render: () => (
    <p style={{ color: 'oklch(70% 0 0)', fontSize: '0.875rem' }}>
      Save your work with <Kbd variant="ghost" size="xs">Cmd</Kbd>
      <Kbd variant="ghost" size="xs">S</Kbd>
    </p>
  ),
}
