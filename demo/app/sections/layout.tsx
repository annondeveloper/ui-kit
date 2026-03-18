'use client'

import React, { useState } from 'react'
import {
  Bell, Inbox, Eye, Edit3, Download, Trash2, MoreHorizontal, RefreshCw,
} from 'lucide-react'
import {
  EmptyState, Skeleton, SkeletonText, SkeletonCard, Progress,
  Avatar, Tooltip, Popover, DropdownMenu, TruncatedText,
  AnimatedCounter, Button, Badge, toast,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
  fmtCompact,
} from '../../../src/index'

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }

function DemoCard({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function AnimatedCounterDemo() {
  const [count, setCount] = useState(42847)
  return (
    <DemoCard label="AnimatedCounter" description="Smooth number transitions with spring physics">
      <div className="flex items-center gap-6">
        <AnimatedCounter value={count} className="text-3xl font-bold text-[hsl(var(--text-primary))] tabular-nums" format={fmtCompact} />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setCount((c) => c + randInt(100, 1000))}>+</Button>
          <Button size="sm" variant="outline" onClick={() => setCount((c) => Math.max(0, c - randInt(100, 1000)))}>-</Button>
          <Button size="sm" variant="outline" onClick={() => setCount(randInt(10000, 99999))}>Random</Button>
        </div>
      </div>
    </DemoCard>
  )
}

export default function LayoutSection() {
  return (
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Layout & Feedback</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Empty states, skeletons, progress indicators, avatars, tooltips, popovers, and text utilities.</p>
      <div className="space-y-8">
        <DemoCard label="EmptyState" description="Purposeful empty states with icon and actions">
          <EmptyState
            icon={Inbox}
            title="No alerts configured"
            description="Create alert rules to get notified when thresholds are breached."
            actions={<Button size="sm"><Bell className="h-3.5 w-3.5" /> Create Alert Rule</Button>}
          />
        </DemoCard>

        <DemoCard label="Skeleton / SkeletonText / SkeletonCard" description="Content loading placeholders">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div><SkeletonText lines={4} /></div>
            <div><SkeletonCard /></div>
          </div>
        </DemoCard>

        <DemoCard label="Progress" description="Progress bars with color variants and indeterminate state">
          <div className="space-y-4">
            <Progress value={25} label="Deploying" showValue />
            <Progress value={65} variant="success" label="Healthy nodes" showValue />
            <Progress value={82} variant="warning" label="Memory usage" showValue />
            <Progress value={96} variant="danger" label="Disk usage" showValue />
            <Progress value={0} indeterminate label="Scanning network" />
          </div>
        </DemoCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DemoCard label="Avatar" description="Image, initials, and status dots">
            <div className="flex flex-wrap items-end gap-3">
              <Avatar alt="Alice Chen" size="xs" status="online" />
              <Avatar alt="Bob Kim" size="sm" status="busy" />
              <Avatar alt="Carol Wu" size="md" status="away" />
              <Avatar alt="David Park" size="lg" status="offline" />
              <Avatar alt="Eve Lin" size="xl" />
            </div>
          </DemoCard>

          <DemoCard label="Tooltip" description="Hover for additional context">
            <div className="flex gap-4 items-center">
              <Tooltip content="CPU: 72%"><Badge color="yellow">web-01</Badge></Tooltip>
              <Tooltip content="Last seen: 3 min ago" side="bottom"><Badge color="green">api-02</Badge></Tooltip>
              <Tooltip content="No data received" side="right"><Badge color="red">db-03</Badge></Tooltip>
            </div>
          </DemoCard>

          <DemoCard label="Popover" description="Click-triggered overlay">
            <Popover trigger={<Button size="sm" variant="outline">Open Popover</Button>}>
              <div className="p-3 space-y-2 w-48">
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Quick Actions</p>
                <Button size="sm" variant="ghost" className="w-full justify-start"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                <Button size="sm" variant="ghost" className="w-full justify-start"><Download className="h-3.5 w-3.5" /> Export</Button>
              </div>
            </Popover>
          </DemoCard>

          <DemoCard label="DropdownMenu" description="Action menus">
            <DropdownMenu
              trigger={<Button size="sm" variant="outline"><MoreHorizontal className="h-4 w-4" /></Button>}
              items={[
                { label: 'View Details', icon: Eye, onClick: () => toast.info('View details') },
                { label: 'Edit', icon: Edit3, onClick: () => toast.info('Edit item') },
                { label: 'Download', icon: Download, onClick: () => toast.info('Downloading') },
                { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => toast.error('Deleted') },
              ]}
            />
          </DemoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoCard label="TruncatedText" description="Auto-truncate with tooltip and copy">
            <div className="space-y-3">
              <TruncatedText text="This is a short text that fits just fine." maxWidth={300} />
              <TruncatedText text="This is a very long hostname: super-long-web-server-name-01.us-east-1.production.internal.corp.example.com that definitely will not fit in the container" maxWidth={300} />
            </div>
          </DemoCard>
          <AnimatedCounterDemo />
        </div>
      </div>
    </div>
  )
}
