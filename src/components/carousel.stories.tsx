import type { Meta, StoryObj } from '@storybook/react'
import { Carousel } from './carousel'

const meta: Meta<typeof Carousel> = {
  title: 'Components/Carousel',
  component: Carousel,
}
export default meta
type Story = StoryObj<typeof Carousel>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
