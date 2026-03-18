import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton, SkeletonText, SkeletonCard } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
}
export default meta

type SkeletonStory = StoryObj<typeof Skeleton>
type SkeletonTextStory = StoryObj<typeof SkeletonText>
type SkeletonCardStory = StoryObj<typeof SkeletonCard>

export const Default: SkeletonStory = {
  render: () => <Skeleton className="h-4 w-48" />,
}

export const VariousSizes: SkeletonStory = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '300px' }}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-12 w-12 rounded-full" />
    </div>
  ),
}

export const TextSingleLine: SkeletonTextStory = {
  render: () => (
    <div style={{ width: '300px' }}>
      <SkeletonText lines={1} />
    </div>
  ),
}

export const TextMultiLine: SkeletonTextStory = {
  render: () => (
    <div style={{ width: '300px' }}>
      <SkeletonText lines={4} />
    </div>
  ),
}

export const Card: SkeletonCardStory = {
  render: () => (
    <div style={{ width: '320px' }}>
      <SkeletonCard />
    </div>
  ),
}

export const CardGrid: SkeletonCardStory = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: '0.75rem' }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
}
