import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from './breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    maxVisible: { control: { type: 'range', min: 2, max: 8 } },
  },
}
export default meta
type Story = StoryObj<typeof Breadcrumbs>

const shortItems = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumbs' },
]

const longItems = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/components' },
  { label: 'Navigation', href: '/components/navigation' },
  { label: 'Breadcrumbs', href: '/components/navigation/breadcrumbs' },
  { label: 'Examples' },
]

export const Default: Story = {
  args: { items: shortItems },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem', fontSize: '0.75rem' }}>Short path</h3>
        <Breadcrumbs items={shortItems} />
      </div>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem', fontSize: '0.75rem' }}>Long path</h3>
        <Breadcrumbs items={longItems} />
      </div>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem', fontSize: '0.75rem' }}>Collapsed (max 3)</h3>
        <Breadcrumbs items={longItems} maxVisible={3} />
      </div>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem', fontSize: '0.75rem' }}>Custom separator</h3>
        <Breadcrumbs items={shortItems} separator={<span style={{ color: 'oklch(50% 0 0)' }}>/</span>} />
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: { items: longItems, maxVisible: 4 },
}
