import type { Meta, StoryObj } from '@storybook/react'
import { Toaster, toast } from './toast'
import { Button } from './button'

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Toaster>

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Entity saved successfully')}>
      Show Success Toast
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button variant="danger" onClick={() => toast.error('Failed to connect to device')}>
      Show Error Toast
    </Button>
  ),
}

export const Info: Story = {
  render: () => (
    <Button variant="secondary" onClick={() => toast.info('Discovery scan started')}>
      Show Info Toast
    </Button>
  ),
}

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning('Collector response time is slow')}>
      Show Warning Toast
    </Button>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Button onClick={() => toast.success('Credential saved', { description: 'SNMPv3 credential "datacenter-ro" is now available for discovery.' })}>
      Toast with Description
    </Button>
  ),
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button size="sm" onClick={() => toast.success('Success message')}>Success</Button>
      <Button size="sm" variant="danger" onClick={() => toast.error('Error message')}>Error</Button>
      <Button size="sm" variant="outline" onClick={() => toast.warning('Warning message')}>Warning</Button>
      <Button size="sm" variant="secondary" onClick={() => toast.info('Info message')}>Info</Button>
    </div>
  ),
}
