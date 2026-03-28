import type { Meta, StoryObj } from '@storybook/react'
import { TransferList } from './transfer-list'

const meta: Meta<typeof TransferList> = {
  title: 'Components/TransferList',
  component: TransferList,
}
export default meta
type Story = StoryObj<typeof TransferList>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
