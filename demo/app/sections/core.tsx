'use client'

import React, { useState } from 'react'
import {
  Settings, Zap, Eye, Edit3, Download, Trash2, MoreHorizontal, Bell, RefreshCw,
} from 'lucide-react'
import {
  Button, Badge, Tabs, Sheet, ConfirmDialog, SuccessCheckmark,
  FormInput, toast,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from '../../../src/index'

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

function TabsDemo() {
  const [tab1, setTab1] = useState('overview')
  const [tab2, setTab2] = useState('day')
  return (
    <DemoCard label="Tabs" description="Three variants: underline, pills, enclosed">
      <div className="space-y-6">
        <div>
          <Tabs variant="underline" value={tab1} onChange={setTab1} tabs={[
            { value: 'overview', label: 'Overview' },
            { value: 'metrics', label: 'Metrics' },
            { value: 'alerts', label: 'Alerts' },
          ]} />
          <p className="text-sm text-[hsl(var(--text-secondary))] pt-4">
            {tab1 === 'overview' && 'Overview content with underline tabs'}
            {tab1 === 'metrics' && 'Metrics content'}
            {tab1 === 'alerts' && 'Alerts content with badge count'}
          </p>
        </div>
        <div>
          <Tabs variant="pills" value={tab2} onChange={setTab2} tabs={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]} />
          <p className="text-sm text-[hsl(var(--text-secondary))] pt-4">
            {tab2 === 'day' && 'Daily view'}
            {tab2 === 'week' && 'Weekly view'}
            {tab2 === 'month' && 'Monthly view'}
          </p>
        </div>
      </div>
    </DemoCard>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  return (
    <DemoCard label="Sheet" description="Slide-over panel">
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Device Details" description="View and edit device configuration">
        <div className="p-6 space-y-4">
          <FormInput label="Hostname" value="switch-core01.prod" onChange={() => {}} disabled />
          <FormInput label="IP Address" value="10.0.1.1" onChange={() => {}} disabled />
          <div className="flex gap-3">
            <Badge color="green">Online</Badge>
            <Badge color="blue">SNMP v3</Badge>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Sheet>
    </DemoCard>
  )
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <DemoCard label="ConfirmDialog" description="Confirmation modal">
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>Delete Entity</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Entity"
        description="Are you sure you want to delete switch-core01? This action cannot be undone and will remove all associated metrics and alerts."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => toast.success('Entity deleted')}
      />
    </DemoCard>
  )
}

export default function CoreSection() {
  return (
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Core Components</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Foundation building blocks: buttons, badges, cards, tabs, dialogs, and more.</p>
      <div className="space-y-8">
        <DemoCard label="Button" description="All variants, sizes, and loading state">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {(['primary', 'secondary', 'danger', 'outline', 'ghost'] as const).map((v) => (
                <Button key={v} variant={v}>{v}</Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Settings className="h-4 w-4" /></Button>
              <Button loading>Loading</Button>
            </div>
          </div>
        </DemoCard>

        <DemoCard label="Badge" description="All 10 color presets and createBadgeVariant">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'] as const).map((c) => (
                <Badge key={c} color={c}>{c}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color="brand" icon={Zap}>With Icon</Badge>
              <Badge color="green" size="xs">xs</Badge>
              <Badge color="blue" size="sm">sm</Badge>
              <Badge color="purple" size="md">md</Badge>
            </div>
          </div>
        </DemoCard>

        <DemoCard label="Card" description="All 4 variants with header, content, and footer">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['default', 'elevated', 'outlined', 'interactive'] as const).map((v) => (
              <Card key={v} variant={v}>
                <CardHeader>
                  <CardTitle className="text-sm">{v}</CardTitle>
                  <CardDescription>Card variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">Content here</p>
                </CardContent>
                <CardFooter>
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">Footer</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </DemoCard>

        <TabsDemo />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SheetDemo />
          <ConfirmDialogDemo />
          <DemoCard label="Toaster" description="Toast notifications via sonner">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success('Deployment completed successfully')}>Success</Button>
              <Button size="sm" variant="outline" onClick={() => toast.error('Connection to NATS failed')}>Error</Button>
              <Button size="sm" variant="outline" onClick={() => toast.warning('Certificate expires in 7 days')}>Warning</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('3 new devices discovered')}>Info</Button>
            </div>
          </DemoCard>
        </div>

        <DemoCard label="SuccessCheckmark" description="Animated SVG checkmark with spring physics">
          <div className="flex items-center gap-6">
            <SuccessCheckmark size={24} />
            <SuccessCheckmark size={36} />
            <SuccessCheckmark size={48} />
            <span className="text-sm text-[hsl(var(--text-secondary))]">Animated on mount</span>
          </div>
        </DemoCard>
      </div>
    </div>
  )
}
