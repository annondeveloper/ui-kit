import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload } from './file-upload'

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = {
  args: { name: 'file', accept: 'image/*' },
}

export const MultipleFiles: Story = {
  args: { name: 'files', multiple: true, maxFiles: 5, maxSize: 10 * 1024 * 1024 },
}

export const Restricted: Story = {
  args: { name: 'doc', accept: '.pdf,.doc,.docx', maxSize: 5 * 1024 * 1024 },
}
