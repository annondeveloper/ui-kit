import type { Meta, StoryObj } from '@storybook/react'
import { TableOfContents } from './table-of-contents'

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
}
export default meta
type Story = StoryObj<typeof TableOfContents>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
