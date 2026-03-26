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
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  args: { items: sampleItems, type: 'multiple' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem', maxInlineSize: '480px' }}>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Single</h3>
        <Accordion items={sampleItems} type="single" />
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>Multiple</h3>
        <Accordion items={sampleItems} type="multiple" defaultOpen={['1', '2']} />
      </div>
      <div>
        <h3 style={{ marginBlockEnd: '0.5rem', color: 'oklch(70% 0 0)' }}>No Motion</h3>
        <Accordion items={sampleItems.slice(0, 2)} type="multiple" motion={0} />
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: { items: sampleItems, type: 'single', defaultOpen: ['1'] },
}
