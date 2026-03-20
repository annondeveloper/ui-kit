import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CommandBar } from './command-bar'
import { Button } from '../components/button'

const meta: Meta<typeof CommandBar> = {
  title: 'Domain/CommandBar',
  component: CommandBar,
}
export default meta
type Story = StoryObj<typeof CommandBar>

const sampleItems = [
  { id: '1', label: 'Go to Dashboard', section: 'Navigation', shortcut: ['Ctrl', 'D'], onSelect: () => {} },
  { id: '2', label: 'Go to Settings', section: 'Navigation', shortcut: ['Ctrl', ','], onSelect: () => {} },
  { id: '3', label: 'Create new project', section: 'Actions', onSelect: () => {} },
  { id: '4', label: 'Deploy to production', section: 'Actions', shortcut: ['Ctrl', 'Shift', 'D'], onSelect: () => {} },
  { id: '5', label: 'Toggle dark mode', section: 'Preferences', onSelect: () => {} },
]

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Command Bar (Ctrl+K)</Button>
        <CommandBar items={sampleItems} open={open} onOpenChange={setOpen} placeholder="Type a command..." />
      </>
    )
  },
}
