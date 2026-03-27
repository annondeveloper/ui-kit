import type { Meta, StoryObj } from '@storybook/react'
import { DiskMountBar } from './disk-mount-bar'

const meta: Meta<typeof DiskMountBar> = {
  title: 'Domain/DiskMountBar',
  component: DiskMountBar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showFree: { control: 'boolean' },
    maxVisible: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof DiskMountBar>

const GB = 1024 ** 3
const mounts = [
  { mount: '/', totalBytes: 100 * GB, usedBytes: 42 * GB, freeBytes: 58 * GB, utilPct: 42 },
  { mount: '/data', totalBytes: 500 * GB, usedBytes: 380 * GB, freeBytes: 120 * GB, utilPct: 76 },
  { mount: '/var/log', totalBytes: 50 * GB, usedBytes: 12 * GB, freeBytes: 38 * GB, utilPct: 24 },
]

export const Default: Story = {
  args: { mounts },
}

export const ManyMounts: Story = {
  args: {
    mounts: [
      ...mounts,
      { mount: '/tmp', totalBytes: 20 * GB, usedBytes: 3 * GB, freeBytes: 17 * GB, utilPct: 15 },
      { mount: '/backup', totalBytes: 2000 * GB, usedBytes: 1800 * GB, freeBytes: 200 * GB, utilPct: 90 },
      { mount: '/home', totalBytes: 200 * GB, usedBytes: 150 * GB, freeBytes: 50 * GB, utilPct: 75 },
    ],
    maxVisible: 4,
    showFree: true,
  },
}

export const Critical: Story = {
  args: {
    mounts: [
      { mount: '/', totalBytes: 100 * GB, usedBytes: 95 * GB, freeBytes: 5 * GB, utilPct: 95 },
      { mount: '/data', totalBytes: 500 * GB, usedBytes: 475 * GB, freeBytes: 25 * GB, utilPct: 95 },
    ],
    showFree: true,
  },
}
