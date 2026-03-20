import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview'
import { Button } from '@ui/components/button'
import { Tooltip } from '@ui/components/tooltip'
import { Popover } from '@ui/components/popover'
import { Dialog } from '@ui/components/dialog'
import { ConfirmDialog } from '@ui/components/confirm-dialog'
import { Sheet } from '@ui/components/sheet'
import { DropdownMenu } from '@ui/components/dropdown-menu'
import { CommandBar } from '@ui/domain/command-bar'
import { NotificationStack } from '@ui/domain/notification-stack'
import { useToast } from '@ui/domain/toast'
import { Icon } from '@ui/core/icons/icon'
import { Card } from '@ui/components/card'
import type { CommandItem } from '@ui/domain/command-bar'
import type { Notification } from '@ui/domain/notification-stack'

const commands: CommandItem[] = [
  { id: '1', label: 'Search devices', description: 'Find by IP or hostname', section: 'Navigation', icon: <Icon name="search" size="sm" />, onSelect: () => {} },
  { id: '2', label: 'Quick actions', description: 'Frequently used actions', section: 'Navigation', icon: <Icon name="zap" size="sm" />, onSelect: () => {} },
  { id: '3', label: 'Settings', description: 'System preferences', section: 'Config', icon: <Icon name="settings" size="sm" />, onSelect: () => {} },
  { id: '4', label: 'Help & Support', description: 'Documentation and FAQs', section: 'Config', icon: <Icon name="info" size="sm" />, onSelect: () => {} },
  { id: '5', label: 'View logs', description: 'System log viewer', section: 'Tools', icon: <Icon name="terminal" size="sm" />, onSelect: () => {} },
]

const menuItems = [
  { type: 'label' as const, label: 'Actions' },
  { label: 'Edit', icon: <Icon name="edit" size="sm" />, shortcut: 'Ctrl+E', onClick: () => {} },
  { label: 'Duplicate', icon: <Icon name="copy" size="sm" />, shortcut: 'Ctrl+D', onClick: () => {} },
  { type: 'separator' as const },
  { label: 'Delete', icon: <Icon name="trash" size="sm" />, danger: true, onClick: () => {} },
]

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem',
}

export default function OverlaysPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const addNotification = useCallback(() => {
    const variants = ['info', 'success', 'warning', 'error'] as const
    const titles = ['Deploy Complete', 'Service Online', 'High Latency Alert', 'Connection Failed']
    const descs = ['Production v2.4.1 deployed', 'API gateway reachable', 'p99 > 500ms on /api/v2', 'Cannot reach database']
    const i = Math.floor(Math.random() * 4)
    setNotifications(prev => [...prev, {
      id: crypto.randomUUID(),
      title: titles[i],
      description: descs[i],
      variant: variants[i],
      timestamp: Date.now(),
    }])
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Overlays</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Tooltips, popovers, dialogs, sheets, menus, toasts, and more</p>
      </div>

      <div style={grid}>
        {/* Tooltip */}
        <Preview label="Tooltip" description="Hover to reveal">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Tooltip content="Top tooltip" placement="top">
              <Button variant="secondary" size="sm">Top</Button>
            </Tooltip>
            <Tooltip content="Bottom tooltip" placement="bottom">
              <Button variant="secondary" size="sm">Bottom</Button>
            </Tooltip>
            <Tooltip content="Left tooltip" placement="left">
              <Button variant="secondary" size="sm">Left</Button>
            </Tooltip>
            <Tooltip content="Right tooltip" placement="right">
              <Button variant="secondary" size="sm">Right</Button>
            </Tooltip>
          </div>
        </Preview>

        {/* Popover */}
        <Preview label="Popover" description="Click to open, with arrow and focus management">
          <Popover
            arrow
            content={
              <div style={{ padding: '0.75rem', minWidth: 200 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Quick Settings</div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Configure your workspace preferences here.
                </p>
                <Button size="sm" variant="primary">Apply</Button>
              </div>
            }
          >
            <Button variant="secondary">Open Popover</Button>
          </Popover>
        </Preview>

        {/* Dialog */}
        <Preview label="Dialog" description="Native dialog with @starting-style animation">
          <Button variant="primary" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Edit Profile"
            description="Make changes to your profile settings."
            size="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                This dialog is built on the native HTML &lt;dialog&gt; element with CSS-only entry/exit animations using @starting-style.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setDialogOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Dialog>
        </Preview>

        {/* ConfirmDialog */}
        <Preview label="ConfirmDialog" description="Preset confirm/cancel with danger variant">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete Item</Button>
          </div>
          <ConfirmDialog
            open={confirmOpen}
            onConfirm={() => { setConfirmOpen(false); toast({ title: 'Item deleted', variant: 'success' }) }}
            onCancel={() => setConfirmOpen(false)}
            title="Delete this item?"
            description="This action cannot be undone. The item will be permanently removed."
            confirmLabel="Delete"
            variant="danger"
          />
        </Preview>

        {/* Sheet */}
        <Preview label="Sheet" description="Side panel with swipe physics">
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setSheetOpen(true)}>Open Sheet</Button>
          </div>
          <Sheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Details Panel"
            description="View and edit item details"
            side="right"
            size="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
              <Card variant="outlined" padding="md">
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Server Info</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  hostname: prod-api-01<br />
                  ip: 10.0.1.42<br />
                  uptime: 47 days
                </div>
              </Card>
              <Button variant="primary" onClick={() => setSheetOpen(false)}>Close</Button>
            </div>
          </Sheet>
        </Preview>

        {/* DropdownMenu */}
        <Preview label="DropdownMenu" description="Context menu with shortcuts, danger items">
          <DropdownMenu items={menuItems}>
            <Button variant="secondary" icon={<Icon name="more-horizontal" size="sm" />}>Actions</Button>
          </DropdownMenu>
        </Preview>

        {/* Toast */}
        <Preview label="Toast" description="Show toasts in all 4 variants" wide>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Button variant="primary" size="sm" onClick={() => toast({ title: 'Saved successfully', description: 'Your changes have been saved.', variant: 'success' })}>
              Success
            </Button>
            <Button variant="danger" size="sm" onClick={() => toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'error' })}>
              Error
            </Button>
            <Button variant="secondary" size="sm" onClick={() => toast({ title: 'CPU usage high', description: 'Server load exceeds 90%.', variant: 'warning' })}>
              Warning
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast({ title: 'New deployment', description: 'v2.4.1 is now live.', variant: 'info' })}>
              Info
            </Button>
          </div>
        </Preview>

        {/* CommandBar */}
        <Preview label="CommandBar" description="Press the button or Cmd+K">
          <Button variant="secondary" onClick={() => setCmdOpen(true)} icon={<Icon name="search" size="sm" />}>
            Open Command Bar
          </Button>
          <CommandBar
            items={commands}
            open={cmdOpen}
            onOpenChange={setCmdOpen}
            placeholder="Type a command..."
          />
        </Preview>

        {/* NotificationStack */}
        <Preview label="NotificationStack" description="Stackable notification cards" wide>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={addNotification}>Add Notification</Button>
            <Button variant="ghost" size="sm" onClick={() => setNotifications([])}>Clear All</Button>
          </div>
          <NotificationStack
            notifications={notifications}
            onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            onDismissAll={() => setNotifications([])}
            maxVisible={5}
          />
        </Preview>
      </div>
    </div>
  )
}
