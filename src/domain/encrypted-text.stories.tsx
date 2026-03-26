import type { Meta, StoryObj } from '@storybook/react'
import { EncryptedText } from './encrypted-text'

const meta: Meta<typeof EncryptedText> = {
  title: 'Domain/EncryptedText',
  component: EncryptedText,
  argTypes: {
    trigger: { control: 'select', options: ['mount', 'hover', 'inView'] },
    speed: { control: { type: 'range', min: 20, max: 200, step: 10 } },
    motion: { control: 'select', options: [0, 1, 2, 3] },
  },
}
export default meta
type Story = StoryObj<typeof EncryptedText>

export const Default: Story = {
  args: { text: 'ENCRYPTED MESSAGE', trigger: 'mount', speed: 50 },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'oklch(90% 0 0)', fontSize: '1.25rem' }}>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Mount trigger</p>
        <EncryptedText text="DECRYPTING ON MOUNT" trigger="mount" speed={50} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Hover trigger</p>
        <EncryptedText text="HOVER TO REVEAL" trigger="hover" speed={40} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Custom characters</p>
        <EncryptedText text="CUSTOM CHARS" trigger="mount" scrambleChars="01" speed={60} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Fast speed</p>
        <EncryptedText text="SPEED DEMON" trigger="mount" speed={20} />
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: { text: 'AURORA FLUID DESIGN', trigger: 'hover', speed: 50, motion: 3 },
}
