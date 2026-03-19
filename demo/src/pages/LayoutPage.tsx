import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  EmptyState, Skeleton, SkeletonText, SkeletonCard,
  Progress, Avatar, InfiniteScroll, HeatmapCalendar,
  Button, type DayValue,
} from '@ui/index'
import { Inbox, Plus, Search } from 'lucide-react'

const heatmapData: DayValue[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 89 + i)
  return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 100) }
})

export function LayoutPage() {
  const [scrollItems, setScrollItems] = useState(
    Array.from({ length: 5 }, (_, i) => ({ id: `l${i}`, text: `Event ${i + 1}: System health check passed` }))
  )
  const [progVal, setProgVal] = useState(65)

  const loadMore = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600))
    setScrollItems(prev => {
      const next = Array.from({ length: 5 }, (_, i) => ({
        id: `l${prev.length + i}`,
        text: `Event ${prev.length + i + 1}: Metric collection cycle completed`,
      }))
      return [...prev, ...next]
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Layout & Feedback</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">6 components for loading states, empty states, and layout patterns</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="EmptyState" description="Purposeful empty state with CTA" code={`<EmptyState\n  icon={Inbox}\n  title="No devices found"\n  description="Add your first device to start monitoring."\n  actions={<Button>Add Device</Button>}\n/>`}>
          <EmptyState
            icon={Inbox}
            title="No devices found"
            description="Add your first network device to start collecting metrics and monitoring health."
            actions={
              <div className="flex gap-2">
                <Button size="sm"><Plus className="size-3.5" /> Add Device</Button>
                <Button variant="outline" size="sm"><Search className="size-3.5" /> Run Discovery</Button>
              </div>
            }
          />
        </Preview>

        <Preview label="Skeleton" description="Loading shimmer placeholders" code={`<Skeleton className="h-8 w-full" />\n<SkeletonText lines={3} />\n<SkeletonCard />`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
            <SkeletonText lines={3} />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </Preview>

        <Preview label="Progress" description="All variants + indeterminate" code={`<Progress value={65} label="Upload" showValue variant="success" />\n<Progress indeterminate label="Processing..." />`}>
          <div className="space-y-4">
            <Progress value={progVal} label="Migration Progress" showValue variant="default" />
            <Progress value={85} label="Disk Usage" showValue variant="warning" size="md" />
            <Progress value={95} label="CPU Critical" showValue variant="danger" size="lg" />
            <Progress value={100} label="Complete" showValue variant="success" />
            <Progress value={0} indeterminate label="Discovering devices..." />
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setProgVal(p => Math.max(0, p - 10))}>-10</Button>
              <Button size="sm" variant="outline" onClick={() => setProgVal(p => Math.min(100, p + 10))}>+10</Button>
            </div>
          </div>
        </Preview>

        <Preview label="Avatar" description="Image, initials, status dot" code={`<Avatar alt="Alice" size="md" status="online" />\n<Avatar alt="Bob" size="lg" status="busy" />`}>
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <Avatar alt="A" size="xs" />
              <Avatar alt="Bob Chen" size="sm" status="online" />
              <Avatar alt="Carol Davis" size="md" status="online" />
              <Avatar alt="Dave Evans" size="lg" status="busy" />
              <Avatar alt="Eve Foster" size="xl" status="away" />
            </div>
            <div className="flex items-end gap-3">
              <Avatar alt="Offline" size="md" status="offline" />
              <Avatar alt="No status" size="md" />
            </div>
          </div>
        </Preview>

        <Preview label="InfiniteScroll" description="Load-more virtual list" code={`<InfiniteScroll\n  items={items}\n  renderItem={renderFn}\n  loadMore={loadMore}\n  hasMore={true}\n/>`}>
          <div className="h-[180px]">
            <InfiniteScroll
              items={scrollItems}
              renderItem={item => (
                <div className="px-3 py-2 text-sm text-[hsl(var(--text-secondary))] border-b border-[hsl(var(--border-subtle))]">
                  {item.text}
                </div>
              )}
              loadMore={loadMore}
              hasMore={scrollItems.length < 30}
            />
          </div>
        </Preview>

        <Preview label="HeatmapCalendar" description="Activity heatmap grid" code={`<HeatmapCalendar data={dayValues} showMonthLabels showDayLabels />`}>
          <HeatmapCalendar data={heatmapData} showMonthLabels showDayLabels />
        </Preview>
      </div>
    </div>
  )
}
