import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { InlineEdit } from './inline-edit'

const meta: Meta<typeof InlineEdit> = {
  title: 'Components/InlineEdit',
  component: InlineEdit,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    editTrigger: { control: 'select', options: ['click', 'dblclick'] },
    disabled: { control: 'boolean' },
    multiline: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof InlineEdit>

export const Default: Story = {
  args: { value: 'Click to edit', onChange: () => {} },
}

export const DoubleClick: Story = {
  args: { value: 'Double-click to edit', onChange: () => {}, editTrigger: 'dblclick' },
}

export const Multiline: Story = {
  args: { value: 'This is a longer piece of text that supports multiline editing.', onChange: () => {}, multiline: true },
}
