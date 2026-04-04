import type { Meta, StoryObj } from '@storybook/react'
import { Accordion } from './accordion'

const sampleItems = [
  { id: '1', trigger: 'What is Aurora Fluid?', content: 'A design system with deep atmospheric surfaces and ethereal color washes.' },
  { id: '2', trigger: 'How does the OKLCH color system work?', content: 'OKLCH provides perceptually uniform colors with relative color syntax for theme generation.' },
  { id: '3', trigger: 'What about accessibility?', content: 'All components follow WAI-ARIA APG patterns with keyboard navigation and screen reader support.' },
  { id: '4', trigger: 'Disabled item', content: 'You should not see this.', disabled: true },
]

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    variant: { control: 'select', options: ['default', 'bordered', 'separated'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  args: { items: sampleItems, type: 'multiple' },
}

export const Single: Story = {
  args: { items: sampleItems, type: 'single' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem', maxInlineSize: '480px' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Default</h3>
        <Accordion items={sampleItems} variant="default" />
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Bordered</h3>
        <Accordion items={sampleItems} variant="bordered" />
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Separated</h3>
        <Accordion items={sampleItems} variant="separated" />
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem', maxInlineSize: '480px' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Size: {size}</h3>
          <Accordion items={sampleItems.slice(0, 2)} size={size} defaultOpen={['1']} />
        </div>
      ))}
    </div>
  ),
}

export const DefaultOpen: Story = {
  args: { items: sampleItems, type: 'multiple', defaultOpen: ['1', '2'] },
}

export const NoMotion: Story = {
  args: { items: sampleItems.slice(0, 2), type: 'multiple', motion: 0 },
}

export const Interactive: Story = {
  args: { items: sampleItems, type: 'single', defaultOpen: ['1'] },
}
