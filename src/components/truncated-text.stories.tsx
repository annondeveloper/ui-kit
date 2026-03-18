import type { Meta, StoryObj } from '@storybook/react'
import { TruncatedText } from './truncated-text'

const meta: Meta<typeof TruncatedText> = {
  title: 'Components/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof TruncatedText>

export const ShortText: Story = {
  args: {
    text: 'core-sw-01',
    maxWidth: 200,
  },
}

export const LongText: Story = {
  args: {
    text: 'very-long-hostname-that-definitely-will-not-fit-in-a-small-column-width.example.datacenter.internal',
    maxWidth: 200,
  },
}

export const IPAddress: Story = {
  args: {
    text: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    maxWidth: 150,
  },
}

export const InTableContext: Story = {
  render: () => (
    <div style={{ width: '400px', border: '1px solid hsl(222 25% 25%)', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid hsl(222 30% 20%)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'hsl(210 15% 50%)' }}>Hostname</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'hsl(210 15% 50%)' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '0.5rem 1rem' }}><TruncatedText text="sw-core-01" maxWidth={120} /></td>
            <td style={{ padding: '0.5rem 1rem' }}><TruncatedText text="Primary core switch in building A, floor 3, MDF closet" maxWidth={180} /></td>
          </tr>
          <tr>
            <td style={{ padding: '0.5rem 1rem' }}><TruncatedText text="fw-edge-datacenter-primary-01" maxWidth={120} /></td>
            <td style={{ padding: '0.5rem 1rem' }}><TruncatedText text="Edge firewall" maxWidth={180} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
}
