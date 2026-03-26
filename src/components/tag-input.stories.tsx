import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TagInput } from './tag-input'

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    maxTags: { control: 'number' },
    allowDuplicates: { control: 'boolean' },
    error: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof TagInput>

export const Default: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['React', 'TypeScript'])
    return <TagInput tags={tags} onChange={setTags} placeholder="Add tag..." />
  },
}

export const AllSizes: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['tag'])
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxInlineSize: '24rem' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <TagInput key={s} tags={tags} onChange={setTags} size={s} placeholder={`Size: ${s}`} />
        ))}
      </div>
    )
  },
}

export const MaxTags: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['one', 'two', 'three'])
    return <TagInput tags={tags} onChange={setTags} maxTags={5} placeholder="Max 5 tags" />
  },
}

export const WithError: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['invalid'])
    return <TagInput tags={tags} onChange={setTags} error="Please add at least 2 tags" />
  },
}

export const Disabled: Story = {
  render: () => (
    <TagInput tags={['locked', 'tags']} onChange={() => {}} disabled placeholder="Disabled" />
  ),
}
