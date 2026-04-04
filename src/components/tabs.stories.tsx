import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabPanel } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pills', 'enclosed'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    motion: { control: 'select', options: [0, 1, 2, 3] },
    lazy: { control: 'boolean' },
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
        <TabPanel tabId="overview">Overview content</TabPanel>
        <TabPanel tabId="analytics">Analytics content</TabPanel>
        <TabPanel tabId="settings">Settings content</TabPanel>
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Tabs tabs={tabs} variant="underline" defaultTab="overview">
        <TabPanel tabId="overview">Underline variant</TabPanel>
      </Tabs>
      <Tabs tabs={tabs} variant="pills" defaultTab="overview">
        <TabPanel tabId="overview">Pills variant</TabPanel>
      </Tabs>
      <Tabs tabs={tabs} variant="enclosed" defaultTab="overview">
        <TabPanel tabId="overview">Enclosed variant</TabPanel>
      </Tabs>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Tabs key={size} tabs={tabs} size={size} defaultTab="overview">
          <TabPanel tabId="overview">Size: {size}</TabPanel>
        </Tabs>
      ))}
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    tabs,
    defaultTab: 'overview',
    orientation: 'vertical',
    children: (
      <>
        <TabPanel tabId="overview">Vertical overview</TabPanel>
        <TabPanel tabId="analytics">Vertical analytics</TabPanel>
        <TabPanel tabId="settings">Vertical settings</TabPanel>
      </>
    ),
  },
}

export const WithDisabled: Story = {
  args: {
    tabs: [
      { id: 'active', label: 'Active' },
      { id: 'pending', label: 'Pending' },
      { id: 'archived', label: 'Archived', disabled: true },
    ],
    defaultTab: 'active',
    children: (
      <>
        <TabPanel tabId="active">Active content</TabPanel>
        <TabPanel tabId="pending">Pending content</TabPanel>
      </>
    ),
  },
}

export const WithCloseable: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'Tab 1', closeable: true },
      { id: 'tab2', label: 'Tab 2', closeable: true },
      { id: 'tab3', label: 'Tab 3' },
    ],
    defaultTab: 'tab1',
    children: (
      <>
        <TabPanel tabId="tab1">Content 1</TabPanel>
        <TabPanel tabId="tab2">Content 2</TabPanel>
        <TabPanel tabId="tab3">Content 3</TabPanel>
      </>
    ),
  },
}

export const NoMotion: Story = {
  args: {
    tabs,
    defaultTab: 'overview',
    motion: 0,
    children: <TabPanel tabId="overview">No animation</TabPanel>,
  },
}
