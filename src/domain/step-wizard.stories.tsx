import type { Meta, StoryObj } from '@storybook/react'
import { StepWizard } from './step-wizard'

const meta: Meta<typeof StepWizard> = {
  title: 'Domain/StepWizard',
  component: StepWizard,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}
export default meta
type Story = StoryObj<typeof StepWizard>

const steps = [
  { id: 'account', label: 'Account', description: 'Create your account' },
  { id: 'profile', label: 'Profile', description: 'Set up your profile' },
  { id: 'team', label: 'Team', description: 'Invite team members' },
  { id: 'deploy', label: 'Deploy', description: 'Launch your project' },
]

export const Default: Story = {
  args: {
    steps,
    defaultStep: 1,
    children: (
      <>
        <div data-step="account"><p>Create your account details.</p></div>
        <div data-step="profile"><p>Set up your profile information.</p></div>
        <div data-step="team"><p>Invite your team members.</p></div>
        <div data-step="deploy"><p>Review and deploy.</p></div>
      </>
    ),
  },
}
