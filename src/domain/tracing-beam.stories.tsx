import type { Meta, StoryObj } from '@storybook/react'
import { TracingBeam } from './tracing-beam'

const meta: Meta<typeof TracingBeam> = {
  title: 'Domain/TracingBeam',
  component: TracingBeam,
  argTypes: {
    color: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof TracingBeam>

const paragraphs = Array.from({ length: 6 }, (_, i) => (
  <div key={i} style={{ paddingBlock: '2rem' }}>
    <h3 style={{ margin: 0 }}>Step {i + 1}</h3>
    <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>
      This is a content block that the tracing beam follows as you scroll
      through the page. Each section represents a milestone in the timeline.
    </p>
  </div>
))

export const Default: Story = {
  args: { children: <div>{paragraphs}</div> },
}

export const CustomColor: Story = {
  args: {
    color: 'oklch(72% 0.19 155)',
    children: <div>{paragraphs}</div>,
  },
}

export const StaticMotion: Story = {
  args: {
    motion: 0,
    children: <div>{paragraphs}</div>,
  },
}

export const ShortContent: Story = {
  render: () => (
    <TracingBeam color="oklch(65% 0.25 25)">
      <div style={{ paddingBlock: '1rem' }}>
        <h3 style={{ margin: 0 }}>Single Section</h3>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>
          A minimal example with only one content block.
        </p>
      </div>
    </TracingBeam>
  ),
}
