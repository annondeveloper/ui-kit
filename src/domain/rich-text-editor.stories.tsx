import type { Meta, StoryObj } from '@storybook/react'
import { RichTextEditor } from './rich-text-editor'

const meta: Meta<typeof RichTextEditor> = {
  title: 'Domain/RichTextEditor',
  component: RichTextEditor,
}
export default meta
type Story = StoryObj<typeof RichTextEditor>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
