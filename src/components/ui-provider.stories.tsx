import type { Meta, StoryObj } from '@storybook/react'
import { UIProvider } from './ui-provider'
import { Button } from './button'
import { Badge } from './badge'
import { Card } from './card'

const meta: Meta<typeof UIProvider> = {
  title: 'Components/UIProvider',
  component: UIProvider,
  argTypes: {
    mode: { control: 'select', options: ['dark', 'light'] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
    density: { control: 'select', options: ['compact', 'default', 'spacious'] },
  },
}
export default meta
type Story = StoryObj<typeof UIProvider>

export const Default: Story = {
  render: (args) => (
    <UIProvider {...args}>
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>UIProvider Demo</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Badge variant="success">Online</Badge>
            <Badge variant="warning">Degraded</Badge>
          </div>
        </div>
      </Card>
    </UIProvider>
  ),
}
