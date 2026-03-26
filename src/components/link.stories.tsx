import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './link'

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  argTypes: {
    variant: { control: 'select', options: ['default', 'subtle', 'brand'] },
    underline: { control: 'select', options: ['always', 'hover', 'none'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    external: { control: 'boolean' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof Link>

export const Default: Story = {
  args: { children: 'Documentation', href: '#' },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Link variant="default" href="#">Default</Link>
      <Link variant="subtle" href="#">Subtle</Link>
      <Link variant="brand" href="#">Brand</Link>
    </div>
  ),
}

export const Underlines: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Link underline="always" href="#">Always</Link>
      <Link underline="hover" href="#">Hover</Link>
      <Link underline="none" href="#">None</Link>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Link key={s} size={s} href="#">{s}</Link>
      ))}
    </div>
  ),
}

export const External: Story = {
  args: { children: 'GitHub', href: 'https://github.com', external: true },
}

export const InParagraph: Story = {
  render: () => (
    <p style={{ color: 'oklch(75% 0 0)', maxInlineSize: '36rem', lineHeight: 1.7 }}>
      Read the <Link href="#">getting started guide</Link> or browse the{' '}
      <Link variant="brand" href="#">component library</Link>. For issues, visit our{' '}
      <Link href="https://github.com" external>GitHub repository</Link>.
    </p>
  ),
}
