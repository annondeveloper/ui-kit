import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  Skeleton, Progress, Avatar, InfiniteScroll,
  HeatmapCalendar, FileUpload, Button,
  type HeatmapData,
} from '@ui/index'
import { Inbox, Plus, Search } from 'lucide-react'

const heatmapData: HeatmapData[] = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 89 + i)
  return { date: d.toISOString().slice(0, 10), value: Math.floor(Math.random() * 100) }
})

export function LayoutPage() {
  const [progVal, setProgVal] = useState(65)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Layout & Feedback</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">6 components for loading states, feedback, and layout patterns</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="Skeleton" description="Loading shimmer placeholders" code={`<Skeleton width="100%" height={32} />\n<Skeleton lines={3} />`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton width="75%" height={16} />
                <Skeleton width="50%" height={12} />
              </div>
            </div>
            <Skeleton lines={3} />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton height={80} />
              <Skeleton height={80} />
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

        <Preview label="Avatar" description="Image, initials, status dot, sizes" code={`<Avatar alt="Alice" size="md" />`}>
          <div className="space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <Avatar alt="A" size="xs" />
              <Avatar alt="Bob Chen" size="sm" />
              <Avatar alt="Carol Davis" size="md" />
              <Avatar alt="Dave Evans" size="lg" />
              <Avatar alt="Eve Foster" size="xl" />
            </div>
          </div>
        </Preview>

        <Preview label="FileUpload" description="Drag and drop file upload" code={`<FileUpload\n  accept=".json,.csv"\n  maxSize={5 * 1024 * 1024}\n  onChange={handleFiles}\n/>`}>
          <FileUpload
            accept=".json,.csv,.txt"
            maxSize={5 * 1024 * 1024}
            onChange={() => {}}
          />
        </Preview>

        <Preview label="InfiniteScroll" description="Content that loads on scroll" code={`<InfiniteScroll onLoadMore={loadMore} hasMore={true}>\n  {items}\n</InfiniteScroll>`}>
          <div className="h-[180px] overflow-auto">
            <InfiniteScroll onLoadMore={async () => {}} hasMore={false}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="px-3 py-2 text-sm text-[hsl(var(--text-secondary))] border-b border-[hsl(var(--border-subtle))]">
                  Event {i + 1}: System health check passed
                </div>
              ))}
            </InfiniteScroll>
          </div>
        </Preview>

        <Preview label="HeatmapCalendar" description="Activity heatmap grid" code={`<HeatmapCalendar data={dayValues} />`}>
          <HeatmapCalendar data={heatmapData} />
        </Preview>
      </div>
    </div>
  )
}
export default LayoutPage
