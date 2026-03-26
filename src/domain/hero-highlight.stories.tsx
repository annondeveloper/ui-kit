import type { Meta, StoryObj } from '@storybook/react'
import { HeroHighlight, Highlight } from './hero-highlight'

const meta: Meta<typeof HeroHighlight> = {
  title: 'Domain/HeroHighlight',
  component: HeroHighlight,
  argTypes: {
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof HeroHighlight>

export const Default: Story = {
  render: () => (
    <HeroHighlight>
      <h1 style={{ fontSize: '2.5rem', color: 'oklch(95% 0 0)', margin: 0 }}>
        Ship features with <Highlight>incredible speed</Highlight>
      </h1>
    </HeroHighlight>
  ),
}

export const CustomColor: Story = {
  render: () => (
    <HeroHighlight>
      <h2 style={{ fontSize: '2rem', color: 'oklch(90% 0 0)', margin: 0 }}>
        Designed for <Highlight color="oklch(70% 0.2 150 / 0.35)">developer experience</Highlight>
      </h2>
    </HeroHighlight>
  ),
}

export const MultipleHighlights: Story = {
  render: () => (
    <HeroHighlight>
      <p style={{ fontSize: '1.25rem', color: 'oklch(85% 0 0)', lineHeight: 1.8, maxInlineSize: '40rem' }}>
        Our platform combines <Highlight>real-time analytics</Highlight> with{' '}
        <Highlight color="oklch(70% 0.18 150 / 0.3)">machine learning</Highlight> to deliver{' '}
        <Highlight color="oklch(75% 0.18 50 / 0.3)">actionable insights</Highlight> in seconds.
      </p>
    </HeroHighlight>
  ),
}

export const NoMotion: Story = {
  render: () => (
    <HeroHighlight motion={0}>
      <h2 style={{ fontSize: '2rem', color: 'oklch(90% 0 0)', margin: 0 }}>
        Instant <Highlight motion={0}>highlight</Highlight> with no animation
      </h2>
    </HeroHighlight>
  ),
}
