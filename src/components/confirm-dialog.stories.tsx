import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ConfirmDialog } from './confirm-dialog'
import { Button } from './button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  argTypes: {
    variant: { control: 'select', options: ['default', 'danger'] },
    loading: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Confirm Action</Button>
        <ConfirmDialog
          open={open}
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          title="Confirm deployment"
          description="This will deploy to production. Are you sure?"
        />
      </>
    )
  },
}

export const Danger: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete Resource</Button>
        <ConfirmDialog
          open={open}
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          title="Delete resource?"
          description="This action cannot be undone."
          variant="danger"
          confirmLabel="Delete"
        />
      </>
    )
  },
}
