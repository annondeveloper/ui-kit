import type { Meta, StoryObj } from '@storybook/react'
import { ScrollReveal } from './scroll-reveal'
import { Card } from '../components/card'

const meta: Meta<typeof ScrollReveal> = {
  title: 'Domain/ScrollReveal',
  component: ScrollReveal,
  argTypes: {
    animation: { control: 'select', options: ['fade-up', 'fade-down', 'fade-left', 'fade-right', 'scale', 'none'] },
  },
}
export default meta
type Story = StoryObj<typeof ScrollReveal>

export const Default: Story = {
  render: () => (
    <div style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Scroll down to reveal content</p>
      </div>
      <ScrollReveal animation="fade-up">
        <Card padding="md">Revealed content appears here</Card>
      </ScrollReveal>
      <div style={{ height: '300px' }} />
    </div>
  ),
}

export const Staggered: Story = {
  render: () => (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: '300px' }} />
      <ScrollReveal animation="fade-up" stagger={100}>
        <Card padding="sm" style={{ marginBottom: '0.5rem' }}>Item 1</Card>
        <Card padding="sm" style={{ marginBottom: '0.5rem' }}>Item 2</Card>
        <Card padding="sm" style={{ marginBottom: '0.5rem' }}>Item 3</Card>
      </ScrollReveal>
      <div style={{ height: '300px' }} />
    </div>
  ),
}
