import type { Meta, StoryObj } from '@storybook/react'
import { CodeEditor } from './code-editor'

const meta: Meta<typeof CodeEditor> = {
  title: 'Domain/CodeEditor',
  component: CodeEditor,
}
export default meta
type Story = StoryObj<typeof CodeEditor>

export const Default: Story = {
  args: {},
}

export const Interactive: Story = {
  args: {},
}
