import type { Meta, StoryObj } from '@storybook/react'
import { InfiniteScroll } from './infinite-scroll'

const meta: Meta<typeof InfiniteScroll> = {
  title: 'Domain/InfiniteScroll',
  component: InfiniteScroll,
}
export default meta
type Story = StoryObj<typeof InfiniteScroll>

export const Default: Story = {
  render: () => (
    <InfiniteScroll
      onLoadMore={() => new Promise((r) => setTimeout(r, 1000))}
      hasMore={true}
      loader={<p>Loading more...</p>}
      style={{ height: 300, overflow: 'auto' }}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{ padding: '0.75rem', borderBottom: '1px solid oklch(100% 0 0 / 0.08)' }}>
          Item {i + 1}
        </div>
      ))}
    </InfiniteScroll>
  ),
}
