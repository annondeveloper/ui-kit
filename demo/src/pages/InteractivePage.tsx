import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  SortableList, DragHandle, StepWizard, ColorInput,
  InfiniteScroll, KanbanColumn, NotificationStack,
  FormInput, Button,
  type SortableItem, type WizardStep, type KanbanItem, type Notification,
} from '@ui/index'

interface TaskItem extends SortableItem {
  label: string
  priority: string
}

const initialTasks: TaskItem[] = [
  { id: '1', label: 'Deploy SNMP collector v2', priority: 'high' },
  { id: '2', label: 'Update firewall ACLs', priority: 'medium' },
  { id: '3', label: 'Rotate API credentials', priority: 'high' },
  { id: '4', label: 'Review alert thresholds', priority: 'low' },
  { id: '5', label: 'Patch core switches', priority: 'medium' },
]

const wizardSteps: WizardStep[] = [
  {
    id: 'target', title: 'Select Target', description: 'Choose the device to configure',
    content: <div className="space-y-3"><FormInput label="Device IP" value="10.0.1.1" onChange={() => {}} /><FormInput label="SNMP Community" value="public" onChange={() => {}} /></div>,
  },
  {
    id: 'profile', title: 'SNMP Profile', description: 'Configure collection settings',
    content: <div className="space-y-3"><FormInput label="Collection Interval" value="60" hint="Seconds between polls" onChange={() => {}} /><FormInput label="Timeout" value="30" hint="Request timeout in seconds" onChange={() => {}} /></div>,
  },
  {
    id: 'confirm', title: 'Confirm', description: 'Review and apply',
    content: <div className="rounded-xl bg-[hsl(var(--bg-base))] p-4 text-sm text-[hsl(var(--text-secondary))]"><p>Target: <strong className="text-[hsl(var(--text-primary))]">10.0.1.1</strong></p><p>Interval: <strong className="text-[hsl(var(--text-primary))]">60s</strong></p><p>Timeout: <strong className="text-[hsl(var(--text-primary))]">30s</strong></p></div>,
  },
]

const kanbanTodo: KanbanItem[] = [
  { id: 'k1', title: 'Migrate OSPF to segment routing', tags: [{ label: 'Network', color: 'blue' }] },
  { id: 'k2', title: 'Add gNMI telemetry', tags: [{ label: 'Feature', color: 'green' }] },
]
const kanbanProgress: KanbanItem[] = [
  { id: 'k3', title: 'SNMP v3 credential rotation', tags: [{ label: 'Security', color: 'red' }], assignee: { name: 'Alice' } },
]
const kanbanDone: KanbanItem[] = [
  { id: 'k4', title: 'Deploy syslog receiver', tags: [{ label: 'Infra', color: 'purple' }] },
  { id: 'k5', title: 'Update FortiGate plugin', tags: [{ label: 'Plugin', color: 'orange' }] },
]

export function InteractivePage() {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [color, setColor] = useState('#3b82f6')
  const [scrollItems, setScrollItems] = useState(
    Array.from({ length: 5 }, (_, i) => ({ id: `s${i}`, text: `Log entry ${i + 1}: SNMP walk completed for 10.0.${i}.1` }))
  )
  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadMore = useCallback(async () => {
    await new Promise(r => setTimeout(r, 500))
    setScrollItems(prev => {
      const next = Array.from({ length: 5 }, (_, i) => ({
        id: `s${prev.length + i}`,
        text: `Log entry ${prev.length + i + 1}: Interface status change on port ${prev.length + i}`,
      }))
      return [...prev, ...next]
    })
  }, [])

  const addNotification = useCallback(() => {
    const types: Notification['type'][] = ['info', 'success', 'warning', 'error']
    const titles = ['Collection Complete', 'Device Online', 'High CPU Alert', 'Connection Failed']
    const messages = ['47 devices polled successfully', 'core-sw-01 is now reachable', 'CPU on edge-fw-02 at 94%', 'Cannot reach 10.0.5.42']
    const i = Math.floor(Math.random() * 4)
    setNotifications(prev => [...prev, {
      id: crypto.randomUUID(),
      title: titles[i],
      message: messages[i],
      type: types[i],
      dismissible: true,
      duration: 5000,
    }])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const priorityColor: Record<string, string> = { high: 'text-[hsl(var(--status-critical))]', medium: 'text-[hsl(var(--status-warning))]', low: 'text-[hsl(var(--text-tertiary))]' }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Interactive</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">6 components for drag-and-drop, wizards, and rich interactions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="SortableList" description="Drag-and-drop reorderable list" glow="interactive" code={`<SortableList\n  items={tasks}\n  onReorder={setTasks}\n  renderItem={(item, i, handle) => <div {...handle}>...</div>}\n/>`}>
          <SortableList
            items={tasks}
            onReorder={setTasks}
            renderItem={(item, _i, handleProps) => (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-subtle))]">
                <DragHandle {...handleProps} />
                <span className="flex-1 text-sm text-[hsl(var(--text-primary))]">{item.label}</span>
                <span className={`text-[10px] font-medium uppercase ${priorityColor[item.priority]}`}>{item.priority}</span>
              </div>
            )}
          />
        </Preview>

        <Preview label="StepWizard" description="Multi-step wizard with validation" glow="interactive" code={`<StepWizard\n  steps={steps}\n  onComplete={handleDone}\n/>`}>
          <StepWizard steps={wizardSteps} onComplete={() => {}} />
        </Preview>

        <Preview label="ColorInput" description="Color picker with presets" glow="interactive" code={`<ColorInput value={color} onChange={setColor} label="Brand Color" />`}>
          <ColorInput
            value={color}
            onChange={setColor}
            label="Brand Color"
            presets={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']}
          />
        </Preview>

        <Preview label="InfiniteScroll" description="Virtual scrolling with load-more" glow="interactive" code={`<InfiniteScroll\n  items={items}\n  renderItem={item => <div>{item.text}</div>}\n  loadMore={loadMore}\n  hasMore={true}\n/>`}>
          <div className="h-[200px]">
            <InfiniteScroll
              items={scrollItems}
              renderItem={item => (
                <div className="px-3 py-2 text-sm text-[hsl(var(--text-secondary))] border-b border-[hsl(var(--border-subtle))]">
                  {item.text}
                </div>
              )}
              loadMore={loadMore}
              hasMore={scrollItems.length < 50}
            />
          </div>
        </Preview>

        <Preview label="KanbanColumn" description="Kanban board columns" glow="interactive" wide code={`<KanbanColumn title="To Do" items={items} color="hsl(var(--brand-primary))" />`}>
          <div className="grid grid-cols-3 gap-3">
            <KanbanColumn title="To Do" items={kanbanTodo} color="hsl(var(--brand-primary))" />
            <KanbanColumn title="In Progress" items={kanbanProgress} color="hsl(var(--status-warning))" />
            <KanbanColumn title="Done" items={kanbanDone} color="hsl(var(--status-ok))" />
          </div>
        </Preview>

        <Preview label="NotificationStack" description="Stacked notification cards" glow="interactive" code={`<NotificationStack\n  notifications={items}\n  onDismiss={handleDismiss}\n  position="bottom-right"\n/>`}>
          <div className="text-center py-4">
            <Button variant="primary" onClick={addNotification}>Trigger notification</Button>
            <NotificationStack
              notifications={notifications}
              onDismiss={dismissNotification}
              position="bottom-right"
              maxVisible={3}
            />
          </div>
        </Preview>
      </div>
    </div>
  )
}
