import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from './app-shell'

const Placeholder = ({ label, bg }: { label: string; bg: string }) => (
  <div style={{ padding: '1rem', background: bg, color: 'oklch(90% 0 0)', fontSize: '0.875rem' }}>
    {label}
  </div>
)

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  argTypes: {
    sidebarPosition: { control: 'select', options: ['left', 'right'] },
    sidebarCollapsed: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  args: {
    navbar: <Placeholder label="Navbar" bg="oklch(25% 0.04 270)" />,
    sidebar: <Placeholder label="Sidebar" bg="oklch(20% 0.03 270)" />,
    footer: <Placeholder label="Footer" bg="oklch(25% 0.04 270)" />,
    children: <Placeholder label="Main Content" bg="oklch(18% 0.02 270)" />,
  },
  decorators: [(Story) => <div style={{ height: '400px' }}><Story /></div>],
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem' }}>Left Sidebar</h3>
        <div style={{ height: '200px' }}>
          <AppShell navbar={<Placeholder label="Nav" bg="oklch(25% 0.04 270)" />} sidebar={<Placeholder label="Side" bg="oklch(20% 0.03 270)" />} sidebarPosition="left">
            <Placeholder label="Content" bg="oklch(18% 0.02 270)" />
          </AppShell>
        </div>
      </div>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem' }}>Right Sidebar</h3>
        <div style={{ height: '200px' }}>
          <AppShell sidebar={<Placeholder label="Side" bg="oklch(20% 0.03 270)" />} sidebarPosition="right">
            <Placeholder label="Content" bg="oklch(18% 0.02 270)" />
          </AppShell>
        </div>
      </div>
      <div>
        <h3 style={{ color: 'oklch(70% 0 0)', marginBlockEnd: '0.5rem' }}>No Sidebar</h3>
        <div style={{ height: '200px' }}>
          <AppShell navbar={<Placeholder label="Nav" bg="oklch(25% 0.04 270)" />} footer={<Placeholder label="Footer" bg="oklch(25% 0.04 270)" />}>
            <Placeholder label="Content" bg="oklch(18% 0.02 270)" />
          </AppShell>
        </div>
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    navbar: <Placeholder label="Navbar" bg="oklch(25% 0.04 270)" />,
    sidebar: <Placeholder label="Sidebar" bg="oklch(20% 0.03 270)" />,
    footer: <Placeholder label="Footer" bg="oklch(25% 0.04 270)" />,
    sidebarPosition: 'left',
    sidebarCollapsed: false,
    children: <Placeholder label="Main Content Area" bg="oklch(18% 0.02 270)" />,
  },
  decorators: [(Story) => <div style={{ height: '400px' }}><Story /></div>],
}
