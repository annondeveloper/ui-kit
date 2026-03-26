import type { Meta, StoryObj } from '@storybook/react'
import { WavyBackground } from './wavy-background'

const meta: Meta<typeof WavyBackground> = {
  title: 'Domain/WavyBackground',
  component: WavyBackground,
  argTypes: {
    waveCount: { control: { type: 'range', min: 1, max: 10, step: 1 } },
    speed: { control: { type: 'range', min: 2, max: 30, step: 1 } },
    color: { control: 'color' },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof WavyBackground>

const contentBlock = (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' as const, color: 'white' }}>
    <h2 style={{ margin: 0, fontSize: '2rem' }}>Wavy Background</h2>
    <p style={{ margin: '0.5rem 0 0', opacity: 0.8 }}>Content floats above the animated waves.</p>
  </div>
)

export const Default: Story = {
  args: {
    children: contentBlock,
    style: { background: 'oklch(20% 0.02 270)', minBlockSize: '300px' },
  },
}

export const CustomColor: Story = {
  args: {
    color: 'oklch(72% 0.19 155)',
    waveCount: 4,
    children: contentBlock,
    style: { background: 'oklch(15% 0.03 155)', minBlockSize: '300px' },
  },
}

export const ManyWaves: Story = {
  args: {
    waveCount: 10,
    speed: 15,
    children: contentBlock,
    style: { background: 'oklch(18% 0.02 270)', minBlockSize: '300px' },
  },
}

export const StaticMotion: Story = {
  args: {
    motion: 0,
    waveCount: 5,
    children: contentBlock,
    style: { background: 'oklch(20% 0.02 270)', minBlockSize: '300px' },
  },
}

export const BackdropOnly: Story = {
  args: {
    waveCount: 6,
    speed: 8,
    color: 'oklch(65% 0.25 25)',
    style: { background: 'oklch(12% 0.01 25)', minBlockSize: '200px' },
  },
}
