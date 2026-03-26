import type { Meta, StoryObj } from '@storybook/react'
import { BackgroundBoxes } from './background-boxes'

const meta: Meta<typeof BackgroundBoxes> = {
  title: 'Domain/BackgroundBoxes',
  component: BackgroundBoxes,
  argTypes: {
    rows: { control: { type: 'range', min: 3, max: 30 } },
    cols: { control: { type: 'range', min: 3, max: 30 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof BackgroundBoxes>

const containerStyle: React.CSSProperties = {
  height: '300px',
  background: 'oklch(15% 0.01 270)',
  borderRadius: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'oklch(90% 0 0)',
  fontSize: '1.25rem',
  fontWeight: 600,
}

export const Default: Story = {
  args: { rows: 15, cols: 15, children: <div style={containerStyle}>Background Boxes</div> },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <BackgroundBoxes rows={8} cols={8} style={containerStyle}>
        <span>8x8 sparse grid</span>
      </BackgroundBoxes>
      <BackgroundBoxes rows={20} cols={20} style={containerStyle}>
        <span>20x20 dense grid</span>
      </BackgroundBoxes>
      <BackgroundBoxes rows={10} cols={10} motion={0} style={containerStyle}>
        <span>Motion disabled</span>
      </BackgroundBoxes>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    rows: 12,
    cols: 12,
    motion: 3,
    children: <div style={containerStyle}>Interactive Boxes</div>,
  },
}
