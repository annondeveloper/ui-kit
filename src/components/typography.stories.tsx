import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from './typography'

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    variant: { control: 'select', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'body-sm', 'caption', 'code', 'overline'] },
    color: { control: 'select', options: ['primary', 'secondary', 'tertiary', 'brand', 'success', 'warning', 'danger'] },
    weight: { control: 'select', options: [300, 400, 500, 600, 700, 800] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    truncate: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Typography>

export const Default: Story = {
  args: { variant: 'body', children: 'The quick brown fox jumps over the lazy dog.' },
}

export const AllHeadings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Typography variant="h1">Heading One</Typography>
      <Typography variant="h2">Heading Two</Typography>
      <Typography variant="h3">Heading Three</Typography>
      <Typography variant="h4">Heading Four</Typography>
      <Typography variant="h5">Heading Five</Typography>
      <Typography variant="h6">Heading Six</Typography>
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {(['primary', 'secondary', 'tertiary', 'brand', 'success', 'warning', 'danger'] as const).map((c) => (
        <Typography key={c} variant="body" color={c}>{c}</Typography>
      ))}
    </div>
  ),
}

export const BodyVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Typography variant="body">Body text at default size.</Typography>
      <Typography variant="body-sm">Smaller body text for secondary content.</Typography>
      <Typography variant="caption">Caption text for labels and metadata.</Typography>
      <Typography variant="code">const x = 42</Typography>
      <Typography variant="overline">Overline Label</Typography>
    </div>
  ),
}

export const Truncated: Story = {
  args: {
    variant: 'body',
    truncate: true,
    children: 'This is a very long string of text that should be truncated with an ellipsis when it overflows its container boundary.',
    style: { maxInlineSize: '300px' },
  },
}
