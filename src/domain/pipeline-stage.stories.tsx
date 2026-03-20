import type { Meta, StoryObj } from '@storybook/react'
import { PipelineStage } from './pipeline-stage'

const meta: Meta<typeof PipelineStage> = {
  title: 'Domain/PipelineStage',
  component: PipelineStage,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}
export default meta
type Story = StoryObj<typeof PipelineStage>

const stages = [
  { id: 'build', label: 'Build', status: 'success' as const, duration: 45 },
  { id: 'test', label: 'Test', status: 'success' as const, duration: 120 },
  { id: 'lint', label: 'Lint', status: 'success' as const, duration: 15 },
  { id: 'deploy', label: 'Deploy', status: 'running' as const },
  { id: 'verify', label: 'Verify', status: 'pending' as const },
]

export const Default: Story = {
  args: { stages },
}

export const Failed: Story = {
  args: {
    stages: [
      { id: 'build', label: 'Build', status: 'success' as const, duration: 45 },
      { id: 'test', label: 'Test', status: 'failed' as const, duration: 88 },
      { id: 'deploy', label: 'Deploy', status: 'skipped' as const },
    ],
  },
}

export const Vertical: Story = {
  args: { stages, orientation: 'vertical' },
}
