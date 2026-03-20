import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Sheet } from './sheet'
import { Button } from './button'

const meta: Meta<typeof Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  argTypes: {
    side: { control: 'select', options: ['left', 'right', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta
type Story = StoryObj<typeof Sheet>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <Sheet open={open} onClose={() => setOpen(false)} title="Sheet Title" side="right">
          <p>Sheet content goes here.</p>
        </Sheet>
      </>
    )
  },
}

export const AllSides: Story = {
  render: () => {
    const [side, setSide] = useState<'left' | 'right' | 'bottom' | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={() => setSide('left')} variant="secondary">Left</Button>
          <Button onClick={() => setSide('right')} variant="secondary">Right</Button>
          <Button onClick={() => setSide('bottom')} variant="secondary">Bottom</Button>
        </div>
        {side && (
          <Sheet open onClose={() => setSide(null)} title={`${side} sheet`} side={side}>
            <p>Content for {side} sheet.</p>
          </Sheet>
        )}
      </>
    )
  },
}
