import type { Meta, StoryObj } from '@storybook/react'
import { CopyBlock } from './copy-block'

const meta: Meta<typeof CopyBlock> = {
  title: 'Domain/CopyBlock',
  component: CopyBlock,
  argTypes: {
    language: { control: 'select', options: ['javascript', 'typescript', 'css', 'json', 'bash', 'html', 'text'] },
    showLineNumbers: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof CopyBlock>

export const Default: Story = {
  args: {
    code: `import { Button } from '@annondeveloper/ui-kit'\n\nexport function App() {\n  return <Button variant="primary">Click me</Button>\n}`,
    language: 'typescript',
    showLineNumbers: true,
    title: 'app.tsx',
  },
}

export const Bash: Story = {
  args: {
    code: 'npm install @annondeveloper/ui-kit\nnpx @annondeveloper/ui-kit init',
    language: 'bash',
    title: 'Terminal',
  },
}

export const JSON: Story = {
  args: {
    code: '{\n  "name": "my-app",\n  "dependencies": {\n    "@annondeveloper/ui-kit": "^2.0.0"\n  }\n}',
    language: 'json',
    title: 'package.json',
  },
}
