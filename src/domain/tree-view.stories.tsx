import type { Meta, StoryObj } from '@storybook/react'
import { TreeView, type TreeNode } from './tree-view'

const meta: Meta<typeof TreeView> = {
  title: 'Domain/TreeView',
  component: TreeView,
  argTypes: {
    showGuides: { control: 'boolean' },
    multiSelect: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof TreeView>

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'button.tsx' },
          { id: 'card', label: 'card.tsx' },
          { id: 'dialog', label: 'dialog.tsx' },
        ],
      },
      {
        id: 'core',
        label: 'core',
        children: [
          { id: 'styles', label: 'styles' },
          { id: 'motion', label: 'motion' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'package', label: 'package.json' },
  { id: 'tsconfig', label: 'tsconfig.json' },
]

export const Default: Story = {
  args: { nodes, showGuides: true },
}

export const MultiSelect: Story = {
  args: { nodes, multiSelect: true, showGuides: true },
}
