import type { Meta, StoryObj } from '@storybook/react'
import { ContainerQuery } from './container-query'

const meta: Meta<typeof ContainerQuery> = {
  title: 'Components/ContainerQuery',
  component: ContainerQuery,
}
export default meta
type Story = StoryObj<typeof ContainerQuery>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
