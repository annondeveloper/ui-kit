import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    dismissible: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  args: { variant: 'info', title: 'Information', children: 'This is an informational alert message.' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: '480px' }}>
      <Alert variant="info" title="Info">Informational message with helpful context.</Alert>
      <Alert variant="success" title="Success">Operation completed successfully.</Alert>
      <Alert variant="warning" title="Warning">Please review before proceeding.</Alert>
      <Alert variant="error" title="Error">Something went wrong. Please try again.</Alert>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: '480px' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Alert key={size} variant="info" size={size} title={`Size: ${size}`}>
          Alert at {size} size.
        </Alert>
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    variant: 'warning',
    title: 'Caution',
    children: 'This action cannot be undone.',
    dismissible: true,
    size: 'md',
    action: { label: 'Undo', onClick: () => alert('Undo clicked') },
  },
}
