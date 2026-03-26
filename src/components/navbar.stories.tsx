import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from './navbar'
import { Button } from './button'

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  argTypes: {
    sticky: { control: 'boolean' },
    bordered: { control: 'boolean' },
    transparent: { control: 'boolean' },
    height: { control: { type: 'number', min: 40, max: 80 } },
  },
}
export default meta
type Story = StoryObj<typeof Navbar>

export const Default: Story = {
  args: {
    logo: <span style={{ fontWeight: 700 }}>Acme</span>,
    children: (
      <>
        <a href="#">Docs</a>
        <a href="#">Pricing</a>
        <a href="#">Blog</a>
      </>
    ),
    actions: <Button size="sm">Sign in</Button>,
    bordered: true,
  },
}

export const Sticky: Story = {
  args: {
    ...Default.args,
    sticky: true,
  },
}

export const Transparent: Story = {
  args: {
    ...Default.args,
    transparent: true,
  },
}

export const MinimalLogo: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Logo</span>,
    bordered: true,
  },
}
