'use client'

import React, { useState, useCallback, useRef, useMemo } from 'react'
import {
  Network, Server, Shield, Globe, Lock, Check,
} from 'lucide-react'
import {
  SortableList, DragHandle, StepWizard, ColorInput, InfiniteScroll,
  KanbanColumn, NotificationStack, Button, Badge, toast,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '../../../src/index'
import type { SortableItem, WizardStep, Notification } from '../../../src/index'

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

function SortableListDemo() {
  type TaskItem = SortableItem & { label: string; priority: string }
  const [items, setItems] = useState<TaskItem[]>([
    { id: '1', label: 'Configure SNMP v3 credentials', priority: 'High' },
    { id: '2', label: 'Deploy host agent to rack-14', priority: 'Medium' },
    { id: '3', label: 'Review discovery candidates', priority: 'Low' },
    { id: '4', label: 'Update firewall rules for monitoring VLAN', priority: 'High' },
    { id: '5', label: 'Schedule certificate renewal', priority: 'Medium' },
  ])

  return (
    <DemoCard label="SortableList" description="Drag-and-drop reorderable list. Grab the handle to reorder. Also supports keyboard reordering.">
      <SortableList
        items={items}
        onReorder={setItems}
        renderItem={(item, _idx, dragHandleProps) => (
          <div className="flex items-center gap-3 py-2 px-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] mb-2">
            <DragHandle {...dragHandleProps} />
            <span className="flex-1 text-sm text-[hsl(var(--text-primary))]">{item.label}</span>
            <Badge color={item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'yellow' : 'gray'} size="xs">
              {item.priority}
            </Badge>
          </div>
        )}
      />
    </DemoCard>
  )
}

function StepWizardDemo() {
  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'target', title: 'Select Target', description: 'Choose what to monitor', icon: Server,
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">Choose the type of target to add for monitoring.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Network Device', icon: Network },
              { label: 'Server/Host', icon: Server },
              { label: 'Firewall', icon: Shield },
              { label: 'API Endpoint', icon: Globe },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.05)] transition-colors text-left">
                <Icon className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'credentials', title: 'Credentials', description: 'Configure access', icon: Lock,
      content: (
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">IP Address</label>
            <input className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]" placeholder="10.0.1.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">SNMP Community</label>
            <input type="password" className="w-full rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))]" placeholder="Enter community string" />
          </div>
        </div>
      ),
    },
    {
      id: 'confirm', title: 'Confirm', description: 'Review and create', icon: Check,
      content: (
        <div className="py-4">
          <p className="text-sm text-[hsl(var(--text-secondary))]">Review your configuration and click Complete to begin monitoring.</p>
          <div className="mt-4 p-4 rounded-xl bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))]">
            <div className="text-xs space-y-2 text-[hsl(var(--text-secondary))]">
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Type:</span> Network Device</div>
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Target:</span> 10.0.1.1</div>
              <div><span className="font-medium text-[hsl(var(--text-primary))]">Protocol:</span> SNMP v3</div>
            </div>
          </div>
        </div>
      ),
    },
  ], [])

  return <StepWizard steps={steps} onComplete={() => toast.success('Monitoring target created!')} showSummary />
}

function ColorInputDemo() {
  const [color, setColor] = useState('#6366f1')
  return (
    <ColorInput
      value={color}
      onChange={setColor}
      label="Brand Color"
      presets={['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4']}
    />
  )
}

function InfiniteScrollDemo() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Event #${i + 1}`,
      time: `${randInt(1, 59)} min ago`,
    })),
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setItems((prev) => {
      const next = Array.from({ length: 5 }, (_, i) => ({
        id: prev.length + i,
        name: `Event #${prev.length + i + 1}`,
        time: `${randInt(1, 120)} min ago`,
      }))
      const combined = [...prev, ...next]
      if (combined.length >= 30) setHasMore(false)
      return combined
    })
    setLoading(false)
  }, [])

  return (
    <div className="h-[250px]">
      <InfiniteScroll
        items={items}
        renderItem={(item) => (
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border-subtle))] text-sm">
            <span className="text-[hsl(var(--text-primary))]">{item.name}</span>
            <span className="text-xs text-[hsl(var(--text-tertiary))] tabular-nums">{item.time}</span>
          </div>
        )}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={loading}
        getItemKey={(item) => item.id}
        className="h-full"
      />
    </div>
  )
}

function NotificationStackDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const counterRef = useRef(0)

  const addNotification = useCallback((type: Notification['type']) => {
    const messages: Record<Notification['type'], { title: string; message: string }> = {
      info: { title: 'Discovery Complete', message: 'Found 3 new devices in 10.0.5.0/24' },
      success: { title: 'Deployment Successful', message: 'Host agent deployed to 12 servers' },
      warning: { title: 'Certificate Expiring', message: 'TLS cert for api.internal expires in 7 days' },
      error: { title: 'Connection Lost', message: 'NATS server at 10.0.0.5:4222 is unreachable' },
    }
    const msg = messages[type]
    setNotifications((prev) => [...prev, {
      id: String(counterRef.current++),
      title: msg.title,
      message: msg.message,
      type,
      dismissible: true,
      duration: 5000,
    }])
  }, [])

  const handleDismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <DemoCard label="NotificationStack" description="Fixed-position notification cards with auto-dismiss progress bars and slide animations">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => addNotification('info')}>Info</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('success')}>Success</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('warning')}>Warning</Button>
        <Button size="sm" variant="outline" onClick={() => addNotification('error')}>Error</Button>
      </div>
      <NotificationStack notifications={notifications} onDismiss={handleDismiss} position="bottom-right" />
    </DemoCard>
  )
}

export default function InteractiveSection() {
  return (
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Interactive Components</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Rich interactive patterns for drag-and-drop, wizards, infinite lists, kanban boards, and notifications.</p>
      <div className="space-y-8">
        <SortableListDemo />

        <DemoCard label="StepWizard" description="Multi-step form wizard with validation, keyboard nav, and session persistence">
          <StepWizardDemo />
        </DemoCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoCard label="ColorInput" description="Full-featured color picker with hue/saturation area, format switching, presets, and recents">
            <ColorInputDemo />
          </DemoCard>
          <DemoCard label="InfiniteScroll" description="Virtualized infinite list with intersection observer">
            <InfiniteScrollDemo />
          </DemoCard>
        </div>

        <DemoCard label="KanbanColumn" description="Board columns with cards, tags, assignees, and staggered animations">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <KanbanColumn
              title="To Do"
              color="hsl(var(--brand-secondary))"
              items={[
                { id: 'k1', title: 'Implement gNMI streaming collector', description: 'Add support for gRPC telemetry ingestion', tags: [{ label: 'Backend', color: 'blue' }, { label: 'P1', color: 'red' }], assignee: { name: 'Alice Chen' } },
                { id: 'k2', title: 'Design RBAC permission matrix', tags: [{ label: 'Security', color: 'purple' }], assignee: { name: 'Bob Kim' } },
                { id: 'k3', title: 'Add NetFlow v9 template support', tags: [{ label: 'Backend', color: 'blue' }] },
              ]}
            />
            <KanbanColumn
              title="In Progress"
              color="hsl(var(--status-warning))"
              items={[
                { id: 'k4', title: 'Build topology auto-layout engine', description: 'Force-directed graph with LLDP/CDP edge weights', tags: [{ label: 'Frontend', color: 'green' }, { label: 'Complex', color: 'orange' }], assignee: { name: 'Carol Wu' } },
                { id: 'k5', title: 'SNMP v3 credential rotation', tags: [{ label: 'Security', color: 'purple' }, { label: 'Backend', color: 'blue' }], assignee: { name: 'David Park' } },
              ]}
            />
            <KanbanColumn
              title="Done"
              color="hsl(var(--status-ok))"
              items={[
                { id: 'k6', title: 'Entity fingerprint scoring', tags: [{ label: 'Core', color: 'brand' }], assignee: { name: 'Eve Lin' } },
                { id: 'k7', title: 'Dark/light theme system', tags: [{ label: 'Frontend', color: 'green' }], assignee: { name: 'Frank Yu' } },
                { id: 'k8', title: 'TimescaleDB continuous aggregates', tags: [{ label: 'Database', color: 'teal' }] },
              ]}
            />
          </div>
        </DemoCard>

        <NotificationStackDemo />
      </div>
    </div>
  )
}
