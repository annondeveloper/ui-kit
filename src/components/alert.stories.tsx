import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    dismissible: { control: 'boolean' },
    banner: { control: 'boolean' },
    compact: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
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

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissible',
    children: 'Click the X button to dismiss.',
    dismissible: true,
  },
}

export const WithAction: Story = {
  args: {
    variant: 'error',
    title: 'Action Required',
    children: 'Something went wrong with your request.',
    action: { label: 'Retry', onClick: () => alert('Retry clicked') },
  },
}

export const Banner: Story = {
  args: {
    variant: 'info',
    title: 'System Update',
    children: 'Scheduled maintenance window this Saturday at 2am UTC.',
    banner: true,
  },
}

export const Compact: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '0.5rem', maxInlineSize: '480px' }}>
      <Alert variant="info" compact>Compact info alert.</Alert>
      <Alert variant="success" compact>Compact success alert.</Alert>
      <Alert variant="warning" compact>Compact warning alert.</Alert>
      <Alert variant="error" compact>Compact error alert.</Alert>
    </div>
  ),
}

export const NoMotion: Story = {
  args: {
    variant: 'info',
    title: 'No Animation',
    children: 'This alert appears instantly.',
    motion: 0,
  },
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
