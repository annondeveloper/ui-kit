import { useState } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  Button, Badge, Card, CardHeader, CardTitle, CardContent,
  Tabs, Sheet, ConfirmDialog, Tooltip, Popover, DropdownMenu,
  SuccessCheckmark, toast,
} from '@ui/index'
import { Star, Trash2, Edit, MoreVertical, Bell, Settings, Info, Zap, Copy, Download, Share2 } from 'lucide-react'

export function CorePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [pillTab, setPillTab] = useState('all')
  const [encTab, setEncTab] = useState('config')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Core</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">11 foundational components for building interfaces</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="Button" description="5 variants, 4 sizes, loading state" code={`<Button variant="primary">Save</Button>\n<Button variant="danger" loading>Deleting</Button>`}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Star className="size-4" /></Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Preview>

        <Preview label="Badge" description="10 colors + factory variant" code={`<Badge color="green">Active</Badge>\n<Badge color="red" icon={Zap}>Alert</Badge>`}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'] as const).map(c => (
                <Badge key={c} color={c}>{c}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color="green" icon={Zap} size="md">With icon</Badge>
              <Badge color="red" size="xs">Tiny</Badge>
              <Badge color="purple" size="md">Medium</Badge>
            </div>
          </div>
        </Preview>

        <Preview label="Card" description="4 variants with header/content/footer" code={`<Card variant="elevated">\n  <CardHeader><CardTitle>Title</CardTitle></CardHeader>\n  <CardContent>Content</CardContent>\n</Card>`}>
          <div className="grid grid-cols-2 gap-3">
            <Card variant="default" padding="sm"><CardHeader><CardTitle>Default</CardTitle></CardHeader><CardContent><p className="text-xs text-[hsl(var(--text-secondary))]">Standard card with subtle border</p></CardContent></Card>
            <Card variant="elevated" padding="sm"><CardHeader><CardTitle>Elevated</CardTitle></CardHeader><CardContent><p className="text-xs text-[hsl(var(--text-secondary))]">Stronger shadow and border</p></CardContent></Card>
            <Card variant="outlined" padding="sm"><CardHeader><CardTitle>Outlined</CardTitle></CardHeader><CardContent><p className="text-xs text-[hsl(var(--text-secondary))]">Transparent with border</p></CardContent></Card>
            <Card variant="interactive" padding="sm"><CardHeader><CardTitle>Interactive</CardTitle></CardHeader><CardContent><p className="text-xs text-[hsl(var(--text-secondary))]">Hover for effect</p></CardContent></Card>
          </div>
        </Preview>

        <Preview label="Tabs" description="3 visual variants" code={`<Tabs tabs={tabs} value={active} onChange={setActive} variant="underline" />`}>
          <div className="space-y-4">
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Underline</span><Tabs tabs={[{ value: 'overview', label: 'Overview' }, { value: 'metrics', label: 'Metrics' }, { value: 'logs', label: 'Logs' }]} value={activeTab} onChange={setActiveTab} variant="underline" /></div>
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Pills</span><Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={pillTab} onChange={setPillTab} variant="pills" /></div>
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Enclosed</span><Tabs tabs={[{ value: 'config', label: 'Config' }, { value: 'json', label: 'JSON' }, { value: 'yaml', label: 'YAML' }]} value={encTab} onChange={setEncTab} variant="enclosed" /></div>
          </div>
        </Preview>

        <Preview label="Sheet" description="Slide-over panel from edge" code={`<Sheet open={open} onClose={close} title="Details" side="right">\n  Content\n</Sheet>`}>
          <div className="text-center py-4">
            <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
            <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Device Details" description="Configuration and status" side="right" width="w-96">
              <div className="p-4 space-y-3 text-sm text-[hsl(var(--text-secondary))]">
                <p><strong className="text-[hsl(var(--text-primary))]">Hostname:</strong> core-sw-01</p>
                <p><strong className="text-[hsl(var(--text-primary))]">IP:</strong> 10.0.0.1</p>
                <p><strong className="text-[hsl(var(--text-primary))]">Vendor:</strong> Cisco IOS-XE</p>
                <p><strong className="text-[hsl(var(--text-primary))]">Uptime:</strong> 142 days</p>
              </div>
            </Sheet>
          </div>
        </Preview>

        <Preview label="ConfirmDialog" description="Confirmation modal with variants" code={`<ConfirmDialog\n  open={open}\n  onOpenChange={setOpen}\n  title="Delete device?"\n  description="This cannot be undone."\n  variant="danger"\n  onConfirm={handleDelete}\n/>`}>
          <div className="text-center py-4">
            <Button variant="danger" onClick={() => setDialogOpen(true)}>Delete Device</Button>
            <ConfirmDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Delete device?"
              description="This will remove core-sw-01 and all associated metrics. This action cannot be undone."
              variant="danger"
              confirmLabel="Delete"
              onConfirm={() => { setDialogOpen(false); toast.success('Device deleted') }}
            />
          </div>
        </Preview>

        <Preview label="Tooltip" description="Contextual hints on hover" code={`<Tooltip content="More info"><Button>Hover me</Button></Tooltip>`}>
          <div className="flex gap-3 justify-center py-4">
            <Tooltip content="View device details"><Button variant="outline" size="icon"><Info className="size-4" /></Button></Tooltip>
            <Tooltip content="Configure alerts" side="bottom"><Button variant="outline" size="icon"><Bell className="size-4" /></Button></Tooltip>
            <Tooltip content="Open settings" side="right"><Button variant="outline" size="icon"><Settings className="size-4" /></Button></Tooltip>
          </div>
        </Preview>

        <Preview label="Popover" description="Click-triggered floating content" code={`<Popover trigger={<Button>Open</Button>}>\n  Popover content\n</Popover>`}>
          <div className="text-center py-4">
            <Popover trigger={<Button variant="secondary">Show details</Button>}>
              <div className="p-3 space-y-2 text-sm">
                <p className="font-medium text-[hsl(var(--text-primary))]">Quick Stats</p>
                <p className="text-[hsl(var(--text-secondary))]">CPU: 67% | Mem: 4.2 GB</p>
                <p className="text-[hsl(var(--text-secondary))]">Uptime: 142 days</p>
              </div>
            </Popover>
          </div>
        </Preview>

        <Preview label="DropdownMenu" description="Context menu with actions" code={`<DropdownMenu\n  trigger={<Button size="icon"><MoreVertical /></Button>}\n  items={menuItems}\n/>`}>
          <div className="text-center py-4">
            <DropdownMenu
              trigger={<Button variant="secondary" size="icon"><MoreVertical className="size-4" /></Button>}
              items={[
                { label: 'Edit', icon: Edit, onClick: () => toast.info('Edit clicked') },
                { label: 'Copy', icon: Copy, onClick: () => toast.info('Copy clicked') },
                { label: 'Export', icon: Download, onClick: () => toast.info('Export clicked') },
                { label: 'Share', icon: Share2, onClick: () => toast.info('Share clicked') },
                { label: 'Delete', icon: Trash2, onClick: () => toast.error('Delete clicked'), variant: 'danger' },
              ]}
            />
          </div>
        </Preview>

        <Preview label="SuccessCheckmark" description="Animated check SVG" code={`<SuccessCheckmark size={48} />`}>
          <div className="flex items-center justify-center gap-6 py-4">
            <SuccessCheckmark size={32} />
            <SuccessCheckmark size={48} />
            <SuccessCheckmark size={64} />
          </div>
        </Preview>

        <Preview label="Toast" description="Sonner-powered notifications" code={`toast.success('Device saved')\ntoast.error('Connection failed')`}>
          <div className="flex flex-wrap gap-2 justify-center py-4">
            <Button variant="secondary" size="sm" onClick={() => toast.success('Configuration saved successfully')}>Success</Button>
            <Button variant="secondary" size="sm" onClick={() => toast.error('Failed to connect to 10.0.5.42')}>Error</Button>
            <Button variant="secondary" size="sm" onClick={() => toast.warning('CPU usage above 90% threshold')}>Warning</Button>
            <Button variant="secondary" size="sm" onClick={() => toast.info('SNMP collection cycle started')}>Info</Button>
          </div>
        </Preview>
      </div>
    </div>
  )
}
export default CorePage
