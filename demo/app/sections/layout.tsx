'use client'

import React, { useState } from 'react'
import {
  Bell, Inbox, Eye, Edit3, Download, Trash2, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import {
  EmptyState, Skeleton, SkeletonText, SkeletonCard, Progress,
  Avatar, Tooltip, Popover, DropdownMenu, TruncatedText,
  AnimatedCounter, Button, Badge, toast, fmtCompact,
} from '../../../src/index'

function Preview({ label, hint, children, wide }: {
  label: string; hint: string; children: React.ReactNode; wide?: boolean
}): React.JSX.Element {
  return (
    <figure className={`preview-card ${wide ? 'col-span-full' : ''}`}>
      <div className="preview-label">
        <span>{label}</span>
        <span className="text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--text-disabled))]">Live</span>
      </div>
      <div className="preview-body">{children}</div>
      <div className="code-snippet font-mono"><code>{hint}</code></div>
    </figure>
  )
}

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min) + min) }

function AnimatedCounterDemo() {
  const [count, setCount] = useState(42847)
  return (
    <div className="flex items-center gap-6">
      <AnimatedCounter value={count} className="text-3xl font-bold text-[hsl(var(--text-primary))] tabular-nums" format={fmtCompact} />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setCount((c) => c + randInt(100, 1000))}>+</Button>
        <Button size="sm" variant="outline" onClick={() => setCount((c) => Math.max(0, c - randInt(100, 1000)))}>-</Button>
        <Button size="sm" variant="outline" onClick={() => setCount(randInt(10000, 99999))}>Random</Button>
      </div>
    </div>
  )
}

export default function LayoutSection() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Layout & Feedback</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Empty states, skeletons, progress, avatars, tooltips, popovers, and text utilities.</p>
      </div>

      <div className="demo-grid">
        <Preview label="EmptyState" hint='<EmptyState icon={Inbox} title="No alerts" />' wide>
          <EmptyState
            icon={Inbox}
            title="No alerts configured"
            description="Create alert rules to get notified when thresholds are breached."
            actions={<Button size="sm"><Bell className="h-3.5 w-3.5" /> Create Alert Rule</Button>}
          />
        </Preview>

        <Preview label="Skeleton" hint='<Skeleton className="h-4 w-3/4" />'>
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Preview>

        <Preview label="SkeletonText" hint='<SkeletonText lines={4} />'>
          <SkeletonText lines={4} />
        </Preview>

        <Preview label="SkeletonCard" hint='<SkeletonCard />'>
          <SkeletonCard />
        </Preview>

        <Preview label="Progress" hint='<Progress value={65} variant="success" showValue />' wide>
          <div className="space-y-4">
            <Progress value={25} label="Deploying" showValue />
            <Progress value={65} variant="success" label="Healthy nodes" showValue />
            <Progress value={82} variant="warning" label="Memory usage" showValue />
            <Progress value={96} variant="danger" label="Disk usage" showValue />
            <Progress value={0} indeterminate label="Scanning network" />
          </div>
        </Preview>

        <Preview label="Avatar" hint='<Avatar alt="Alice" size="md" status="online" />'>
          <div className="flex flex-wrap items-end gap-3">
            <Avatar alt="Alice Chen" size="xs" status="online" />
            <Avatar alt="Bob Kim" size="sm" status="busy" />
            <Avatar alt="Carol Wu" size="md" status="away" />
            <Avatar alt="David Park" size="lg" status="offline" />
            <Avatar alt="Eve Lin" size="xl" />
          </div>
        </Preview>

        <Preview label="Tooltip" hint='<Tooltip content="CPU: 72%"><Badge>web-01</Badge></Tooltip>'>
          <div className="flex gap-4 items-center">
            <Tooltip content="CPU: 72%"><Badge color="yellow">web-01</Badge></Tooltip>
            <Tooltip content="Last seen: 3 min ago" side="bottom"><Badge color="green">api-02</Badge></Tooltip>
            <Tooltip content="No data received" side="right"><Badge color="red">db-03</Badge></Tooltip>
          </div>
        </Preview>

        <Preview label="Popover" hint='<Popover trigger={<Button>Open</Button>}>...</Popover>'>
          <Popover trigger={<Button size="sm" variant="outline">Open Popover</Button>}>
            <div className="p-3 space-y-2 w-48">
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Quick Actions</p>
              <Button size="sm" variant="ghost" className="w-full justify-start"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
              <Button size="sm" variant="ghost" className="w-full justify-start"><Download className="h-3.5 w-3.5" /> Export</Button>
            </div>
          </Popover>
        </Preview>

        <Preview label="DropdownMenu" hint='<DropdownMenu trigger={btn} items={[...]} />'>
          <DropdownMenu
            trigger={<Button size="sm" variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>}
            items={[
              { label: 'View Details', icon: Eye, onClick: () => toast.info('View') },
              { label: 'Edit', icon: Edit3, onClick: () => toast.info('Edit') },
              { label: 'Download', icon: Download, onClick: () => toast.info('Download') },
              { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => toast.error('Deleted') },
            ]}
          />
        </Preview>

        <Preview label="TruncatedText" hint='<TruncatedText text={long} maxWidth={300} />'>
          <div className="space-y-3">
            <TruncatedText text="Short text that fits." maxWidth={300} />
            <TruncatedText text="super-long-web-server-name-01.us-east-1.production.internal.corp.example.com" maxWidth={300} />
          </div>
        </Preview>

        <Preview label="AnimatedCounter" hint='<AnimatedCounter value={n} format={fmtCompact} />'>
          <AnimatedCounterDemo />
        </Preview>
      </div>
    </>
  )
}
