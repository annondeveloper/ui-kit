import type { Meta, StoryObj } from '@storybook/react'
import { OrbitingCircles } from './orbiting-circles'

const meta: Meta<typeof OrbitingCircles> = {
  title: 'Domain/OrbitingCircles',
  component: OrbitingCircles,
  argTypes: {
    radius: { control: { type: 'range', min: 40, max: 200 } },
    duration: { control: { type: 'range', min: 5, max: 60 } },
    reverse: { control: 'boolean' },
    motion: { control: { type: 'range', min: 0, max: 3 } },
  },
}
export default meta
type Story = StoryObj<typeof OrbitingCircles>

const Dot = ({ label }: { label: string }) => (
  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'oklch(65% 0.2 270)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff' }}>
    {label}
  </div>
)

export const Default: Story = {
  args: {
    radius: 100,
    duration: 15,
    children: [<Dot key="a" label="A" />, <Dot key="b" label="B" />, <Dot key="c" label="C" />],
  },
}

export const Reverse: Story = {
  args: {
    ...Default.args,
    reverse: true,
  },
}

export const SmallRadius: Story = {
  args: {
    radius: 50,
    duration: 10,
    children: [<Dot key="1" label="1" />, <Dot key="2" label="2" />],
  },
}

export const FiveItems: Story = {
  args: {
    radius: 120,
    duration: 20,
    children: [
      <Dot key="a" label="A" />, <Dot key="b" label="B" />, <Dot key="c" label="C" />,
      <Dot key="d" label="D" />, <Dot key="e" label="E" />,
    ],
  },
}

export const Static: Story = {
  args: {
    ...Default.args,
    motion: 0,
  },
}
