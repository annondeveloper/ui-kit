import type { Meta, StoryObj } from '@storybook/react'
import { JsonViewer } from './json-viewer'

const meta: Meta<typeof JsonViewer> = {
  title: 'Domain/JsonViewer',
  component: JsonViewer,
}
export default meta
type Story = StoryObj<typeof JsonViewer>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
