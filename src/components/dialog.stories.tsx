import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog } from './dialog'
import { Button } from './button'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    showClose: { control: 'boolean' },
    closeOnOverlay: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    preventClose: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Dialog Title" description="A description of the dialog content.">
          <p>Dialog body content goes here.</p>
        </Dialog>
      </>
    )
  },
}

export const AllSizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'full' | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => setSize('sm')} variant="secondary">Small</Button>
          <Button onClick={() => setSize('md')} variant="secondary">Medium</Button>
          <Button onClick={() => setSize('lg')} variant="secondary">Large</Button>
          <Button onClick={() => setSize('full')} variant="secondary">Full</Button>
        </div>
        {size && (
          <Dialog open onClose={() => setSize(null)} title={`${size} dialog`} size={size}>
            <p>Content for {size} dialog.</p>
          </Dialog>
        )}
      </>
    )
  },
}

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open with Footer</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
          description="This dialog has a footer with action buttons."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p>Are you sure you want to proceed with this action?</p>
        </Dialog>
      </>
    )
  },
}

export const PreventClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Non-dismissible Dialog</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Important Action"
          preventClose
          footer={<Button onClick={() => setOpen(false)}>I understand</Button>}
        >
          <p>This dialog cannot be closed by clicking the overlay or pressing Escape.</p>
        </Dialog>
      </>
    )
  },
}

export const NoCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>No Close Button</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="No X Button" showClose={false}>
          <p>This dialog has no close button. Click the overlay or press Escape to close.</p>
        </Dialog>
      </>
    )
  },
}

export const MotionLevels: Story = {
  render: () => {
    const [motion, setMotion] = useState<0 | 1 | 2 | 3 | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => setMotion(0)} variant="secondary">Motion 0</Button>
          <Button onClick={() => setMotion(1)} variant="secondary">Motion 1</Button>
          <Button onClick={() => setMotion(2)} variant="secondary">Motion 2</Button>
          <Button onClick={() => setMotion(3)} variant="secondary">Motion 3</Button>
        </div>
        {motion !== null && (
          <Dialog open onClose={() => setMotion(null)} title={`Motion level ${motion}`} motion={motion}>
            <p>This dialog uses motion level {motion}.</p>
          </Dialog>
        )}
      </>
    )
  },
}

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Long Scrollable Content</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Scrollable Dialog">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          ))}
        </Dialog>
      </>
    )
  },
}
