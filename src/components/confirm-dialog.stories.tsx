import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ConfirmDialog } from './confirm-dialog'
import { Button } from './button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['danger', 'warning', 'default'] },
    loading: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="Delete Entity"
          description="Are you sure you want to delete this entity? This action cannot be undone."
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

export const DangerVariant: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Delete</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          variant="danger"
          title="Delete All Data"
          description="This will permanently delete all monitoring data for this device. This action cannot be undone."
          confirmLabel="Delete Everything"
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

export const WarningVariant: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>Restart</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          variant="warning"
          title="Restart Collector"
          description="Restarting the collector will cause a brief gap in monitoring data. Continue?"
          confirmLabel="Restart"
          onConfirm={() => setOpen(false)}
        />
      </>
    )
  },
}

export const WithLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          variant="danger"
          title="Decommission Device"
          description="This will decommission the device and stop all monitoring."
          confirmLabel="Decommission"
          loading={true}
          onConfirm={() => {}}
        />
      </>
    )
  },
}
