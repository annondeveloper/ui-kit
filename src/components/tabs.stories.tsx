import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills', 'enclosed'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}
export default meta
type Story = StoryObj<typeof Tabs>

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
]

export const Default: Story = {
  args: {
    tabs,
    defaultTab: 'overview',
    children: (
      <>
        <div data-tab="overview">Overview content</div>
        <div data-tab="analytics">Analytics content</div>
        <div data-tab="settings">Settings content</div>
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Tabs tabs={tabs} variant="underline" defaultTab="overview">
        <div data-tab="overview">Underline variant</div>
        <div data-tab="analytics">Analytics</div>
        <div data-tab="settings">Settings</div>
      </Tabs>
      <Tabs tabs={tabs} variant="pills" defaultTab="overview">
        <div data-tab="overview">Pills variant</div>
        <div data-tab="analytics">Analytics</div>
        <div data-tab="settings">Settings</div>
      </Tabs>
      <Tabs tabs={tabs} variant="enclosed" defaultTab="overview">
        <div data-tab="overview">Enclosed variant</div>
        <div data-tab="analytics">Analytics</div>
        <div data-tab="settings">Settings</div>
      </Tabs>
    </div>
  ),
}
