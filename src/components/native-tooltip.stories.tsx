import type { Meta, StoryObj } from '@storybook/react'
import { NativeTooltip } from './native-tooltip'
import { Button } from './button'

const meta: Meta<typeof NativeTooltip> = {
  title: 'Components/NativeTooltip',
  component: NativeTooltip,
}
export default meta
type Story = StoryObj<typeof NativeTooltip>

export const Default: Story = {
  render: () => (
    <NativeTooltip content="This is a native title tooltip">
      <Button variant="secondary">Hover for native tooltip</Button>
    </NativeTooltip>
  ),
}
