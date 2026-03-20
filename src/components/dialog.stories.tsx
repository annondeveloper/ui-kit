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
