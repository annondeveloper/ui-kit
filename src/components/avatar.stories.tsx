import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarGroup } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    status: { control: 'select', options: ['online', 'offline', 'away', 'busy'] },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: { name: 'Jane Doe', size: 'md' },
}

export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/150?u=a', alt: 'User avatar', size: 'lg' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Avatar name="A B" size="sm" />
      <Avatar name="A B" size="md" />
      <Avatar name="A B" size="lg" />
      <Avatar name="A B" size="xl" />
    </div>
  ),
}

export const WithStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Avatar name="Online" status="online" />
      <Avatar name="Offline" status="offline" />
      <Avatar name="Away" status="away" />
      <Avatar name="Busy" status="busy" />
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="Alice" />
      <Avatar name="Bob" />
      <Avatar name="Carol" />
      <Avatar name="Dave" />
      <Avatar name="Eve" />
    </AvatarGroup>
  ),
}
