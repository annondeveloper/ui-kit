'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
import {
  Network, Server, Shield, Globe, Lock, Check,
} from 'lucide-react'
import {
  SortableList, DragHandle, StepWizard, ColorInput, InfiniteScroll,
  KanbanColumn, NotificationStack, Button, Badge, toast,
} from '../../../src/index'
import type { SortableItem, WizardStep, Notification } from '../../../src/index'

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

function SortableListDemo() {
  type TaskItem = SortableItem & { label: string; priority: string }
  const [items, setItems] = useState<TaskItem[]>([
    { id: '1', label: 'Configure SNMP v3 credentials', priority: 'High' },
    { id: '2', label: 'Deploy host agent to rack-14', priority: 'Medium' },
    { id: '3', label: 'Review discovery candidates', priority: 'Low' },
    { id: '4', label: 'Update firewall rules', priority: 'High' },
    { id: '5', label: 'Schedule cert renewal', priority: 'Medium' },
  ])
  return (
    <SortableList items={items} onReorder={setItems} renderItem={(item, _idx, dragHandleProps) => (
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] mb-2">
        <DragHandle {...dragHandleProps} />
        <span className="flex-1 text-sm text-[hsl(var(--text-primary))]">{item.label}</span>
        <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'gray'} size="xs">{item.priority}</Badge>
      </div>
    )} />
  )
}

function StepWizardDemo() {
  const steps: WizardStep[] = useMemo(() => [
    { id: 'target', title: 'Select Target', description: 'Choose what to monitor', icon: Server, content: (
      <div className="space-y-3 py-3">
        <p className="text-sm text-[hsl(var(--text-secondary))]">Choose the type of target.</p>
        <div className="grid grid-cols-2 gap-3">
          {[{ l: 'Network Device', i: Network }, { l: 'Server', i: Server }, { l: 'Firewall', i: Shield }, { l: 'API', i: Globe }].map(({ l, i: Icon }) => (
            <button key={l} className="flex items-center gap-2 p-3 rounded-xl border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--brand-primary))] transition-colors text-left">
              <Icon className="h-4 w-4 text-[hsl(var(--brand-primary))]" /><span className="text-sm">{l}</span>
            </button>
          ))}
        </div>
      </div>
    )},
    { id: 'creds', title: 'Credentials', description: 'Configure access', icon: Lock, content: (
      <div className="space-y-3 py-3">
        <input className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm" placeholder="10.0.1.1" />
        <input type="password" className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm" placeholder="Community string" />
      </div>
    )},
    { id: 'confirm', title: 'Confirm', description: 'Review and create', icon: Check, content: (
      <div className="py-3">
        <p className="text-sm text-[hsl(var(--text-secondary))]">Review and click Complete.</p>
        <div className="mt-3 p-3 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] text-xs space-y-1">
          <div><span className="font-medium">Type:</span> Network Device</div>
          <div><span className="font-medium">Target:</span> 10.0.1.1</div>
        </div>
      </div>
    )},
  ], [])
  return <StepWizard steps={steps} onComplete={() => toast.success('Target created!')} showSummary />
}

function InfiniteScrollDemo() {
  const [items, setItems] = useState(() => Array.from({ length: 5 }, (_, i) => ({ id: i, name: `Event #${i + 1}`, time: `${randInt(1, 59)} min ago` })))
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loadMore = useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setItems((prev) => {
      const next = Array.from({ length: 5 }, (_, i) => ({ id: prev.length + i, name: `Event #${prev.length + i + 1}`, time: `${randInt(1, 120)} min ago` }))
      const combined = [...prev, ...next]
      if (combined.length >= 30) setHasMore(false)
      return combined
    })
    setLoading(false)
  }, [])
  return (
    <div className="h-[220px]">
      <InfiniteScroll items={items} renderItem={(item) => (
        <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border-subtle))] text-sm">
          <span className="text-[hsl(var(--text-primary))]">{item.name}</span>
          <span className="text-xs text-[hsl(var(--text-tertiary))] tabular-nums">{item.time}</span>
        </div>
      )} loadMore={loadMore} hasMore={hasMore} isLoading={loading} getItemKey={(item) => item.id} className="h-full" />
    </div>
  )
}

function NotificationStackDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const counterRef = useRef(0)
  const add = useCallback((type: Notification['type']) => {
    const msgs: Record<Notification['type'], { title: string; message: string }> = {
      info: { title: 'Discovery Complete', message: 'Found 3 new devices' },
      success: { title: 'Deployed', message: 'Agent deployed to 12 servers' },
      warning: { title: 'Cert Expiring', message: 'TLS cert expires in 7 days' },
      error: { title: 'Connection Lost', message: 'NATS unreachable' },
    }
    const m = msgs[type]
    setNotifications((p) => [...p, { id: String(counterRef.current++), title: m.title, message: m.message, type, dismissible: true, duration: 5000 }])
  }, [])
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => add('info')}>Info</Button>
        <Button size="sm" variant="outline" onClick={() => add('success')}>Success</Button>
        <Button size="sm" variant="outline" onClick={() => add('warning')}>Warning</Button>
        <Button size="sm" variant="outline" onClick={() => add('error')}>Error</Button>
      </div>
      <NotificationStack notifications={notifications} onDismiss={(id) => setNotifications((p) => p.filter((n) => n.id !== id))} position="bottom-right" />
    </>
  )
}

export default function InteractiveSection() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Interactive</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Drag-and-drop, wizards, infinite lists, kanban boards, and notifications.</p>
      </div>

      <div className="demo-grid">
        <Preview label="SortableList" hint='<SortableList items={items} onReorder={set} renderItem={fn} />'>
          <SortableListDemo />
        </Preview>

        <Preview label="StepWizard" hint='<StepWizard steps={steps} onComplete={fn} />' wide>
          <StepWizardDemo />
        </Preview>

        <Preview label="ColorInput" hint='<ColorInput value={color} onChange={set} presets={[...]} />'>
          <ColorInputDemo />
        </Preview>

        <Preview label="InfiniteScroll" hint='<InfiniteScroll items={items} loadMore={fn} hasMore />'>
          <InfiniteScrollDemo />
        </Preview>

        <Preview label="KanbanColumn" hint='<KanbanColumn title="To Do" items={cards} />' wide>
          <div className="flex gap-4 overflow-x-auto pb-2">
            <KanbanColumn title="To Do" color="hsl(var(--brand-secondary))" items={[
              { id: 'k1', title: 'Implement gNMI collector', tags: [{ label: 'Backend', color: 'blue' }, { label: 'P1', color: 'red' }], assignee: { name: 'Alice' } },
              { id: 'k2', title: 'Design RBAC matrix', tags: [{ label: 'Security', color: 'purple' }], assignee: { name: 'Bob' } },
            ]} />
            <KanbanColumn title="In Progress" color="hsl(var(--status-warning))" items={[
              { id: 'k4', title: 'Topology auto-layout', tags: [{ label: 'Frontend', color: 'green' }], assignee: { name: 'Carol' } },
            ]} />
            <KanbanColumn title="Done" color="hsl(var(--status-ok))" items={[
              { id: 'k6', title: 'Entity fingerprinting', tags: [{ label: 'Core', color: 'brand' }], assignee: { name: 'Eve' } },
              { id: 'k7', title: 'Theme system', tags: [{ label: 'Frontend', color: 'green' }], assignee: { name: 'Frank' } },
            ]} />
          </div>
        </Preview>

        <Preview label="NotificationStack" hint='<NotificationStack notifications={list} onDismiss={fn} />'>
          <NotificationStackDemo />
        </Preview>
      </div>
    </>
  )
}

function ColorInputDemo() {
  const [color, setColor] = useState('#6366f1')
  return <ColorInput value={color} onChange={setColor} label="Brand Color" presets={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4']} />
}
