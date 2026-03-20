import type { Meta, StoryObj } from '@storybook/react'
import { ViewTransitionLink } from './view-transition-link'

const meta: Meta<typeof ViewTransitionLink> = {
  title: 'Domain/ViewTransitionLink',
  component: ViewTransitionLink,
}
export default meta
type Story = StoryObj<typeof ViewTransitionLink>

export const Default: Story = {
  args: {
    href: '#',
    children: 'Navigate with transition',
    transitionName: 'page',
  },
}
