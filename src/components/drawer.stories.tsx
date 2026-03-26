import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from './drawer'

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    side: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    overlay: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Drawer>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)} style={{ color: 'oklch(90% 0 0)' }}>Open Drawer</button>
        <Drawer open={open} onClose={() => setOpen(false)} side="right">
          <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Drawer Content</h3>
            <p>This is a right-side drawer.</p>
          </div>
        </Drawer>
      </>
    )
  },
}

export const AllVariants: Story = {
  render: () => {
    const [active, setActive] = useState<string | null>(null)
    const sides = ['left', 'right', 'top', 'bottom'] as const
    return (
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {sides.map(side => (
          <div key={side}>
            <button onClick={() => setActive(side)} style={{ color: 'oklch(90% 0 0)' }}>{side}</button>
            <Drawer open={active === side} onClose={() => setActive(null)} side={side}>
              <div style={{ padding: '1.5rem', color: 'oklch(90% 0 0)' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{side} drawer</h3>
                <button onClick={() => setActive(null)}>Close</button>
              </div>
            </Drawer>
          </div>
        ))}
      </div>
    )
  },
}

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)} style={{ color: 'oklch(90% 0 0)' }}>Open Large Drawer</button>
        <Drawer open={open} onClose={() => setOpen(false)} side="left" size="lg" overlay motion={3}>
          <div style={{ padding: '2rem', color: 'oklch(90% 0 0)' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Settings</h3>
            <p>Large left drawer with overlay and cinematic motion.</p>
            <button onClick={() => setOpen(false)} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        </Drawer>
      </>
    )
  },
}
