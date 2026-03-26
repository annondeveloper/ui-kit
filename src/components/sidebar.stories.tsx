import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem } from './sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  argTypes: {
    collapsed: { control: 'boolean' },
    position: { control: 'select', options: ['left', 'right'] },
    width: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

const container = { display: 'flex', blockSize: '400px', background: 'oklch(15% 0.01 270)' }
const icon = <span style={{ fontSize: '1.2em' }}>&#9679;</span>

export const Default: Story = {
  render: () => (
    <div style={container}>
      <Sidebar>
        <SidebarHeader><strong>App</strong></SidebarHeader>
        <SidebarContent>
          <SidebarItem icon={icon} label="Dashboard" active />
          <SidebarItem icon={icon} label="Settings" />
          <SidebarItem icon={icon} label="Users" />
        </SidebarContent>
        <SidebarFooter><small>v2.0.0</small></SidebarFooter>
      </Sidebar>
      <div style={{ flex: 1, padding: '1rem', color: 'oklch(80% 0 0)' }}>Main content</div>
    </div>
  ),
}

export const Collapsible: Story = {
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false)
    return (
      <div style={container}>
        <Sidebar collapsed={collapsed} onCollapse={setCollapsed}>
          <SidebarHeader><strong>{collapsed ? '=' : 'Menu'}</strong></SidebarHeader>
          <SidebarContent>
            <SidebarItem icon={icon} label="Home" collapsed={collapsed} active />
            <SidebarItem icon={icon} label="Explore" collapsed={collapsed} />
          </SidebarContent>
        </Sidebar>
        <div style={{ flex: 1, padding: '1rem', color: 'oklch(80% 0 0)' }}>
          <button onClick={() => setCollapsed(!collapsed)}>Toggle sidebar</button>
        </div>
      </div>
    )
  },
}

export const RightPosition: Story = {
  render: () => (
    <div style={container}>
      <div style={{ flex: 1, padding: '1rem', color: 'oklch(80% 0 0)' }}>Main content</div>
      <Sidebar position="right">
        <SidebarContent>
          <SidebarItem icon={icon} label="Info" />
          <SidebarItem icon={icon} label="Help" />
        </SidebarContent>
      </Sidebar>
    </div>
  ),
}
