import { useState, useCallback, type ReactNode } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  SortableList, StepWizard, ColorInput,
  InfiniteScroll, KanbanColumn, FormInput, Button,
  DensityProvider, MetricCard, UtilizationBar,
  ScrollReveal, Badge, Combobox, InlineEdit,
  type SortableItem, type Step, type KanbanCard, type Density, type ComboboxOption,
} from '@ui/index'

const initialTasks: SortableItem[] = [
  { id: '1', content: 'Deploy SNMP collector v2' },
  { id: '2', content: 'Update firewall ACLs' },
  { id: '3', content: 'Rotate API credentials' },
  { id: '4', content: 'Review alert thresholds' },
  { id: '5', content: 'Patch core switches' },
]

const wizardSteps: Step[] = [
  { id: 'target', label: 'Select Target', description: 'Choose the device' },
  { id: 'profile', label: 'SNMP Profile', description: 'Collection settings' },
  { id: 'confirm', label: 'Confirm', description: 'Review and apply' },
]

const kanbanTodo: KanbanCard[] = [
  { id: 'k1', title: 'Migrate OSPF to segment routing', tags: ['Network'] },
  { id: 'k2', title: 'Add gNMI telemetry', tags: ['Feature'] },
]
const kanbanProgress: KanbanCard[] = [
  { id: 'k3', title: 'SNMP v3 credential rotation', tags: ['Security'] },
]
const kanbanDone: KanbanCard[] = [
  { id: 'k4', title: 'Deploy syslog receiver', tags: ['Infra'] },
  { id: 'k5', title: 'Update FortiGate plugin', tags: ['Plugin'] },
]

const deviceOptions: ComboboxOption[] = [
  { value: 'core-sw-01', label: 'core-sw-01', description: '10.0.0.1 - Cisco Catalyst 9300', group: 'Core' },
  { value: 'core-sw-02', label: 'core-sw-02', description: '10.0.0.2 - Cisco Catalyst 9500', group: 'Core' },
  { value: 'dist-sw-01', label: 'dist-sw-01', description: '10.0.1.1 - Juniper EX4300', group: 'Distribution' },
  { value: 'dist-sw-02', label: 'dist-sw-02', description: '10.0.1.2 - Juniper EX4400', group: 'Distribution' },
  { value: 'edge-fw-01', label: 'edge-fw-01', description: '10.0.2.1 - FortiGate 600E', group: 'Edge' },
]

export function InteractivePage() {
  const [tasks, setTasks] = useState<SortableItem[]>(initialTasks)
  const [color, setColor] = useState('#3b82f6')
  const [density, setDensity] = useState<Density>('comfortable')
  const [comboSingle, setComboSingle] = useState<string | string[]>('')
  const [comboMulti, setComboMulti] = useState<string | string[]>([])
  const [hostname, setHostname] = useState('core-sw-01')
  const [description, setDescription] = useState('Primary core switch - Building A')
  const [interval, setInterval_] = useState('60')

  const asyncSearch = useCallback(async (query: string): Promise<ComboboxOption[]> => {
    await new Promise(r => setTimeout(r, 600))
    return deviceOptions.filter(o =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      (o.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
    )
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Interactive</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">9 components for drag-and-drop, wizards, density control, and rich interactions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="SortableList" description="Drag-and-drop reorderable list" glow="interactive" code={`<SortableList\n  items={tasks}\n  onChange={setTasks}\n  handle\n/>`}>
          <SortableList
            items={tasks}
            onChange={setTasks}
            handle
          />
        </Preview>

        <Preview label="StepWizard" description="Multi-step wizard with navigation" glow="interactive" code={`<StepWizard steps={steps}>\n  <div>Step 1</div>\n  <div>Step 2</div>\n</StepWizard>`}>
          <StepWizard steps={wizardSteps}>
            <div className="space-y-3">
              <FormInput label="Device IP" value="10.0.1.1" onChange={() => {}} />
              <FormInput label="SNMP Community" value="public" onChange={() => {}} />
            </div>
            <div className="space-y-3">
              <FormInput label="Collection Interval" value="60" hint="Seconds between polls" onChange={() => {}} />
              <FormInput label="Timeout" value="30" hint="Request timeout in seconds" onChange={() => {}} />
            </div>
            <div className="rounded-xl bg-[hsl(var(--bg-base))] p-4 text-sm text-[hsl(var(--text-secondary))]">
              <p>Target: <strong className="text-[hsl(var(--text-primary))]">10.0.1.1</strong></p>
              <p>Interval: <strong className="text-[hsl(var(--text-primary))]">60s</strong></p>
              <p>Timeout: <strong className="text-[hsl(var(--text-primary))]">30s</strong></p>
            </div>
          </StepWizard>
        </Preview>

        <Preview label="DensityProvider" description="Toggle compact/comfortable/spacious" glow="interactive" wide code={`<DensityProvider density="compact">\n  <MetricCard ... />\n  <UtilizationBar ... />\n</DensityProvider>`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[hsl(var(--text-tertiary))]">Density:</span>
              {(['compact', 'comfortable', 'spacious'] as Density[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    density === d
                      ? 'bg-[hsl(var(--brand-primary))]/15 text-[hsl(var(--brand-primary))] font-medium'
                      : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))]'
                  }`}
                >
                  {d}
                </button>
              ))}
              <Badge color="purple" size="xs" className="ml-2">{density}</Badge>
            </div>
            <DensityProvider density={density}>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard title="CPU" value="72%" status="warning" />
                <MetricCard title="Memory" value="4.2 GB" status="ok" />
              </div>
              <div className="space-y-2 mt-3">
                <UtilizationBar value={72} label="CPU Usage" />
                <UtilizationBar value={45} label="Disk I/O" />
              </div>
            </DensityProvider>
          </div>
        </Preview>

        <Preview label="ScrollReveal" description="Elements animate in on scroll" glow="interactive" wide code={`<ScrollReveal animation="fade-up" delay={100}>\n  <Card>Content</Card>\n</ScrollReveal>`}>
          <div className="space-y-3 max-h-[300px] overflow-y-auto px-1 py-2">
            <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Scroll down to reveal items with different animations:</p>
            {[
              { anim: 'fade-up' as const, label: 'Fade Up', desc: 'Default entry animation for cards' },
              { anim: 'fade-down' as const, label: 'Fade Down', desc: 'Top to bottom entry' },
              { anim: 'fade-left' as const, label: 'Fade Left', desc: 'Enter from the left side' },
              { anim: 'fade-right' as const, label: 'Fade Right', desc: 'Enter from the right side' },
              { anim: 'scale' as const, label: 'Scale Up', desc: 'Grow from smaller to full size' },
            ].map((item, i) => (
              <ScrollReveal key={item.anim} animation={item.anim} stagger={i * 100} once={false}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-subtle))]">
                  <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{item.label}</span>
                  <span className="text-xs text-[hsl(var(--text-tertiary))]">{item.desc}</span>
                  <Badge color="blue" size="xs" className="ml-auto">{item.anim}</Badge>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Preview>

        <Preview label="Combobox" description="Async search with multi-select tags" glow="interactive" wide code={`<Combobox options={devices} onSearch={asyncFetch} multiple />`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Single select with async search</p>
              <Combobox
                options={deviceOptions}
                value={comboSingle}
                onChange={setComboSingle}
                onSearch={asyncSearch}
                placeholder="Search devices..."
              />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--text-tertiary))] mb-2">Multi-select with tags</p>
              <Combobox
                options={deviceOptions}
                value={comboMulti}
                onChange={setComboMulti}
                multiple
                placeholder="Select multiple..."
              />
            </div>
          </div>
        </Preview>

        <Preview label="InlineEdit" description="Click text to edit, save on Enter/blur" glow="interactive" code={`<InlineEdit value={hostname} onSave={async v => setHostname(v)} />`}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[hsl(var(--text-tertiary))] w-24 shrink-0">Hostname:</span>
              <InlineEdit value={hostname} onSave={async (v) => { await new Promise(r => setTimeout(r, 400)); setHostname(v) }} aria-label="Hostname" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[hsl(var(--text-tertiary))] w-24 shrink-0">Description:</span>
              <InlineEdit value={description} onSave={async (v) => setDescription(v)} aria-label="Description" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[hsl(var(--text-tertiary))] w-24 shrink-0">Interval (s):</span>
              <InlineEdit value={interval} type="number" onSave={async (v) => setInterval_(v)} aria-label="Interval" />
            </div>
          </div>
        </Preview>

        <Preview label="ColorInput" description="Color picker with presets" glow="interactive" code={`<ColorInput value={color} onChange={setColor} label="Brand Color" />`}>
          <ColorInput
            value={color}
            onChange={setColor}
            label="Brand Color"
            presets={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']}
          />
        </Preview>

        <Preview label="KanbanColumn" description="Kanban board columns" glow="interactive" wide code={`<KanbanColumn title="To Do" items={items} />`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KanbanColumn title="To Do" items={kanbanTodo} />
            <KanbanColumn title="In Progress" items={kanbanProgress} />
            <KanbanColumn title="Done" items={kanbanDone} />
          </div>
        </Preview>
      </div>
    </div>
  )
}
export default InteractivePage
