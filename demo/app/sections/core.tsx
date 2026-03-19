'use client'

import React, { useState } from 'react'
import { Settings, Zap } from 'lucide-react'
import {
  Button, Badge, Tabs, Sheet, ConfirmDialog, SuccessCheckmark,
  FormInput, toast,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
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

function TabsDemo() {
  const [tab1, setTab1] = useState('overview')
  const [tab2, setTab2] = useState('day')
  return (
    <div className="space-y-6">
      <div>
        <Tabs variant="underline" value={tab1} onChange={setTab1} tabs={[
          { value: 'overview', label: 'Overview' }, { value: 'metrics', label: 'Metrics' }, { value: 'alerts', label: 'Alerts' },
        ]} />
        <p className="text-sm text-[hsl(var(--text-secondary))] pt-3">
          {tab1 === 'overview' && 'Overview content'}{tab1 === 'metrics' && 'Metrics content'}{tab1 === 'alerts' && 'Alerts content'}
        </p>
      </div>
      <div>
        <Tabs variant="pills" value={tab2} onChange={setTab2} tabs={[
          { value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' },
        ]} />
      </div>
    </div>
  )
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Device Details" description="View and edit configuration">
        <div className="p-6 space-y-4">
          <FormInput label="Hostname" value="switch-core01.prod" onChange={() => {}} disabled />
          <FormInput label="IP Address" value="10.0.1.1" onChange={() => {}} disabled />
          <div className="flex gap-3"><Badge color="green">Online</Badge><Badge color="blue">SNMP v3</Badge></div>
          <Button variant="primary" className="w-full" onClick={() => setOpen(false)}>Save Changes</Button>
        </div>
      </Sheet>
    </>
  )
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>Delete Entity</Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} title="Delete Entity"
        description="Are you sure? This removes all associated metrics and alerts."
        confirmLabel="Delete" variant="danger" onConfirm={() => toast.success('Entity deleted')} />
    </>
  )
}

export default function CoreSection() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Core Components</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Buttons, badges, cards, tabs, dialogs, and more.</p>
      </div>

      <div className="demo-grid">
        <Preview label="Button" hint='<Button variant="primary">Click</Button>' wide>
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
        </Preview>

        <Preview label="Badge" hint='<Badge color="green">Online</Badge>' wide>
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
        </Preview>

        <Preview label="Card" hint='<Card variant="elevated">...</Card>' wide>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['default', 'elevated', 'outlined', 'interactive'] as const).map((v) => (
              <Card key={v} variant={v}>
                <CardHeader><CardTitle className="text-sm">{v}</CardTitle><CardDescription>Variant</CardDescription></CardHeader>
                <CardContent><p className="text-sm text-[hsl(var(--text-secondary))]">Content</p></CardContent>
                <CardFooter><span className="text-xs text-[hsl(var(--text-tertiary))]">Footer</span></CardFooter>
              </Card>
            ))}
          </div>
        </Preview>

        <Preview label="Tabs" hint='<Tabs variant="underline" value={tab} onChange={set} tabs={[...]} />' wide>
          <TabsDemo />
        </Preview>

        <Preview label="Sheet" hint='<Sheet open={open} onClose={close} title="Details">...</Sheet>'>
          <SheetDemo />
        </Preview>

        <Preview label="ConfirmDialog" hint='<ConfirmDialog open={open} onConfirm={fn} variant="danger" />'>
          <ConfirmDialogDemo />
        </Preview>

        <Preview label="SuccessCheckmark" hint='<SuccessCheckmark size={36} />'>
          <div className="flex items-center gap-6">
            <SuccessCheckmark size={24} />
            <SuccessCheckmark size={36} />
            <SuccessCheckmark size={48} />
            <span className="text-sm text-[hsl(var(--text-secondary))]">Animated on mount</span>
          </div>
        </Preview>

        <Preview label="Toast" hint='toast.success("Deployed successfully")'>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success('Deployed successfully')}>Success</Button>
            <Button size="sm" variant="outline" onClick={() => toast.error('Connection failed')}>Error</Button>
            <Button size="sm" variant="outline" onClick={() => toast.warning('Cert expiring')}>Warning</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info('3 devices discovered')}>Info</Button>
          </div>
        </Preview>
      </div>
    </>
  )
}
