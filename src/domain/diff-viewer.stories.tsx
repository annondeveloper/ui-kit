import type { Meta, StoryObj } from '@storybook/react'
import { DiffViewer } from './diff-viewer'

const meta: Meta<typeof DiffViewer> = {
  title: 'Domain/DiffViewer',
  component: DiffViewer,
  argTypes: {
    mode: { control: 'select', options: ['side-by-side', 'unified'] },
    showLineNumbers: { control: 'boolean' },
    foldUnchanged: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof DiffViewer>

const oldValue = `function greet(name) {
  console.log("Hello " + name);
  return true;
}`

const newValue = `function greet(name: string) {
  console.log(\`Hello \${name}\`);
  console.log("Greeting sent");
  return true;
}`

export const Default: Story = {
  args: { oldValue, newValue, oldTitle: 'Before', newTitle: 'After', showLineNumbers: true },
}

export const Unified: Story = {
  args: { oldValue, newValue, mode: 'unified', showLineNumbers: true },
}
