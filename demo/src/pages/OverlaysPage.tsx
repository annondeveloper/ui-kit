import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  Button, Tooltip, Popover, Dialog, ConfirmDialog,
  Sheet, DropdownMenu, CommandBar, NotificationStack,
  useToast,
  type CommandItem, type Notification,
} from '@ui/index'

const commands: CommandItem[] = [
  { id: '1', label: 'Search devices', group: 'Navigation', onSelect: () => {} },
  { id: '2', label: 'Quick actions', group: 'Navigation', onSelect: () => {} },
  { id: '3', label: 'Settings', group: 'Config', onSelect: () => {} },
  { id: '4', label: 'Help & Support', group: 'Config', onSelect: () => {} },
]

export function OverlaysPage() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(() => {
    const variants = ['info', 'success', 'warning', 'error'] as const
    const titles = ['Collection Complete', 'Device Online', 'High CPU Alert', 'Connection Failed']
    const messages = ['47 devices polled', 'core-sw-01 reachable', 'CPU on edge-fw-02 at 94%', 'Cannot reach 10.0.5.42']
    const i = Math.floor(Math.random() * 4)
    setNotifications(prev => [...prev, {
      id: crypto.randomUUID(),
      title: titles[i],
      description: messages[i],
      variant: variants[i],
      timestamp: Date.now(),
    }])
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Overlays</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">9 components for tooltips, dialogs, menus, toasts, and overlays</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="Tooltip" description="Contextual hints on hover" code={`<Tooltip content="More info"><Button>Hover me</Button></Tooltip>`}>
          <div className="flex flex-wrap gap-3 justify-center py-4">
            <Tooltip content="View device details"><Button variant="outline" size="sm">Top (default)</Button></Tooltip>
            <Tooltip content="Configure alerts" side="bottom"><Button variant="outline" size="sm">Bottom</Button></Tooltip>
            <Tooltip content="Open settings" side="right"><Button variant="outline" size="sm">Right</Button></Tooltip>
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

        <Preview label="Dialog" description="Native dialog element" code={`<Dialog open={open} onOpenChange={setOpen} title="Edit Device">\n  <p>Dialog content</p>\n</Dialog>`}>
          <div className="text-center py-4">
            <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen} title="Edit Device" description="Update device configuration">
              <div className="p-4 space-y-3 text-sm text-[hsl(var(--text-secondary))]">
                <p>This is a native dialog element with <code>@starting-style</code> animations.</p>
                <p>Click outside or press Escape to close.</p>
              </div>
            </Dialog>
          </div>
        </Preview>

        <Preview label="ConfirmDialog" description="Confirmation modal with variants" code={`<ConfirmDialog\n  open={open}\n  onOpenChange={setOpen}\n  title="Delete device?"\n  variant="danger"\n  onConfirm={handleDelete}\n/>`}>
          <div className="text-center py-4">
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete Device</Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Delete device?"
              description="This will remove core-sw-01 and all associated metrics. This action cannot be undone."
              variant="danger"
              confirmLabel="Delete"
              onConfirm={() => {
                setConfirmOpen(false)
                toast({ title: 'Device deleted', variant: 'success' })
              }}
            />
          </div>
        </Preview>

        <Preview label="Sheet" description="Slide-over panel from edge" code={`<Sheet open={open} onClose={close} title="Details" side="right">\n  Content\n</Sheet>`}>
          <div className="text-center py-4">
            <Button onClick={() => setSheetOpen(true)}>Open Sheet</Button>
            <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Device Details" description="Configuration and status" side="right">
              <div className="p-4 space-y-3 text-sm text-[hsl(var(--text-secondary))]">
                <p><strong className="text-[hsl(var(--text-primary))]">Hostname:</strong> core-sw-01</p>
                <p><strong className="text-[hsl(var(--text-primary))]">IP:</strong> 10.0.0.1</p>
                <p><strong className="text-[hsl(var(--text-primary))]">Vendor:</strong> Cisco IOS-XE</p>
                <p><strong className="text-[hsl(var(--text-primary))]">Uptime:</strong> 142 days</p>
              </div>
            </Sheet>
          </div>
        </Preview>

        <Preview label="DropdownMenu" description="Context menu with actions" code={`<DropdownMenu\n  trigger={<Button>Menu</Button>}\n  items={menuItems}\n/>`}>
          <div className="text-center py-4">
            <DropdownMenu
              trigger={<Button variant="secondary">Actions</Button>}
              items={[
                { label: 'Edit', onClick: () => toast({ title: 'Edit clicked', variant: 'info' }) },
                { label: 'Copy', onClick: () => toast({ title: 'Copied', variant: 'success' }) },
                { label: 'Export', onClick: () => toast({ title: 'Exporting...', variant: 'info' }) },
                { label: 'Delete', onClick: () => toast({ title: 'Deleted', variant: 'error' }), variant: 'danger' },
              ]}
            />
          </div>
        </Preview>

        <Preview label="Toast" description="Context-based toast notifications" code={`const { toast } = useToast()\ntoast({ title: 'Saved', variant: 'success' })`}>
          <div className="flex flex-wrap gap-2 justify-center py-4">
            <Button variant="secondary" size="sm" onClick={() => toast({ title: 'Configuration saved', variant: 'success' })}>Success</Button>
            <Button variant="secondary" size="sm" onClick={() => toast({ title: 'Connection failed', variant: 'error' })}>Error</Button>
            <Button variant="secondary" size="sm" onClick={() => toast({ title: 'CPU above 90%', variant: 'warning' })}>Warning</Button>
            <Button variant="secondary" size="sm" onClick={() => toast({ title: 'Collection started', variant: 'info' })}>Info</Button>
          </div>
        </Preview>

        <Preview label="CommandBar" description="Cmd+K command palette" code={`<CommandBar items={commands} placeholder="Search..." />`}>
          <div className="text-center py-4">
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">Press <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-base))] text-xs font-mono">Cmd+K</kbd> to open</p>
            <CommandBar items={commands} placeholder="Search commands..." />
          </div>
        </Preview>

        <Preview label="NotificationStack" description="Stacked notification cards" code={`<NotificationStack\n  notifications={items}\n  onDismiss={handleDismiss}\n/>`}>
          <div className="text-center py-4">
            <Button variant="primary" onClick={addNotification}>Trigger notification</Button>
            <NotificationStack
              notifications={notifications}
              onDismiss={dismissNotification}
              maxVisible={3}
            />
          </div>
        </Preview>
      </div>
    </div>
  )
}
export default OverlaysPage
