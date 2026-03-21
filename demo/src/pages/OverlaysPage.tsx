import { useState, useCallback } from 'react'
import { Preview } from '../components/Preview'
import { ComponentShowcase, type ShowcaseExample } from '../components/ComponentShowcase'
import type { PropDef } from '../components/PropsTable'
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

// ─── Dialog Showcase ──────────────────────────────────────────────────────────

const dialogProps: PropDef[] = [
  { name: 'open', type: 'boolean', description: 'Controls dialog visibility' },
  { name: 'onClose', type: '() => void', description: 'Called when dialog should close (Escape, backdrop click)' },
  { name: 'title', type: 'string', description: 'Dialog heading text' },
  { name: 'description', type: 'string', description: 'Optional description below the title' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Dialog width preset' },
  { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: 'Close when clicking the backdrop' },
  { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Close when pressing Escape' },
  { name: 'children', type: 'ReactNode', description: 'Dialog body content' },
]

// ─── Toast Showcase ──────────────────────────────────────────────────────────

const toastProps: PropDef[] = [
  { name: 'title', type: 'string', description: 'Toast heading text' },
  { name: 'description', type: 'string', description: 'Optional description body' },
  { name: 'variant', type: "'success' | 'error' | 'warning' | 'info'", default: "'info'", description: 'Visual variant and icon' },
  { name: 'duration', type: 'number', default: '5000', description: 'Auto-dismiss time in milliseconds (0 = persistent)' },
  { name: 'action', type: 'ReactNode', description: 'Optional action button inside the toast' },
]

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem',
}

export default function OverlaysPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dialogSizeOpen, setDialogSizeOpen] = useState(false)
  const [dialogSize, setDialogSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')
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

  const dialogExamples: ShowcaseExample[] = [
    {
      title: 'Basic Dialog',
      description: 'Built on the native HTML <dialog> element with CSS-only entry/exit animations via @starting-style.',
      code: `<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Edit Profile"
  description="Make changes to your profile settings."
  size="md"
>
  <p>Dialog body content here.</p>
  <Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
</Dialog>`,
      render: () => (
        <>
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
                This dialog uses the native HTML &lt;dialog&gt; element with CSS-only entry/exit animations using @starting-style.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setDialogOpen(false)}>Save Changes</Button>
              </div>
            </div>
          </Dialog>
        </>
      ),
    },
    {
      title: 'Confirm Dialog',
      description: 'Pre-built confirm/cancel pattern with danger variant support.',
      code: `<ConfirmDialog
  open={open}
  onConfirm={() => handleDelete()}
  onCancel={() => setOpen(false)}
  title="Delete this item?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="danger"
/>`,
      render: () => (
        <>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete Item</Button>
          <ConfirmDialog
            open={confirmOpen}
            onConfirm={() => { setConfirmOpen(false); toast({ title: 'Item deleted', variant: 'success' }) }}
            onCancel={() => setConfirmOpen(false)}
            title="Delete this item?"
            description="This action cannot be undone. The item will be permanently removed."
            confirmLabel="Delete"
            variant="danger"
          />
        </>
      ),
    },
    {
      title: 'Dialog Sizes',
      description: 'Four size presets: sm, md, lg, xl.',
      code: `<Dialog size="sm" ...>Small</Dialog>
<Dialog size="md" ...>Medium (default)</Dialog>
<Dialog size="lg" ...>Large</Dialog>
<Dialog size="xl" ...>Extra Large</Dialog>`,
      render: () => {
        const sizes = ['sm', 'md', 'lg', 'xl'] as const
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {sizes.map(s => (
              <Button key={s} variant="secondary" size="sm" onClick={() => { setDialogSize(s); setDialogSizeOpen(true) }}>
                {s.toUpperCase()}
              </Button>
            ))}
            <Dialog
              open={dialogSizeOpen}
              onClose={() => setDialogSizeOpen(false)}
              title={`Dialog — ${dialogSize.toUpperCase()}`}
              description={`This is a ${dialogSize} size dialog.`}
              size={dialogSize}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={() => setDialogSizeOpen(false)}>Close</Button>
              </div>
            </Dialog>
          </div>
        )
      },
    },
  ]

  const toastExamples: ShowcaseExample[] = [
    {
      title: 'All Variants',
      description: 'Four semantic variants for different notification contexts.',
      code: `const { toast } = useToast()

toast({ title: 'Saved', description: 'Changes saved.', variant: 'success' })
toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' })
toast({ title: 'Warning', description: 'CPU usage high.', variant: 'warning' })
toast({ title: 'Info', description: 'New deploy live.', variant: 'info' })`,
      render: () => (
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
      ),
    },
    {
      title: 'With Action',
      description: 'Toasts can include an action button for undo or follow-up.',
      code: `toast({
  title: 'Message archived',
  description: 'The message has been moved to archive.',
  variant: 'info',
  action: <Button size="sm" variant="ghost">Undo</Button>,
})`,
      render: () => (
        <Button variant="secondary" size="sm" onClick={() => toast({ title: 'Message archived', description: 'The message has been moved to archive.', variant: 'info' })}>
          Archive with Undo
        </Button>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Overlays</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Tooltips, popovers, dialogs, sheets, menus, toasts, and more</p>
      </div>

      {/* ── Dialog Showcase ───────────────────────────────────────────── */}
      <ComponentShowcase
        name="Dialog"
        description="Modal dialogs built on the native HTML <dialog> element. Includes CSS-only entry/exit animations via @starting-style, backdrop click to close, and automatic focus management."
        examples={dialogExamples}
        props={dialogProps}
        accessibility={`Built on the native <dialog> element for maximum browser support.\nFocus is automatically trapped inside the dialog while open.\nEscape key closes the dialog (configurable via closeOnEscape).\nBackdrop click closes the dialog (configurable via closeOnBackdrop).\nFocus is restored to the trigger element when the dialog closes.\nUses role="dialog" with aria-labelledby and aria-describedby.`}
      />

      <div style={{ marginBlock: '2rem' }} />

      {/* ── Toast Showcase ────────────────────────────────────────────── */}
      <ComponentShowcase
        name="Toast"
        description="Non-blocking notification toasts with auto-dismiss, four semantic variants, and optional action buttons. Uses the useToast() hook for imperative control."
        examples={toastExamples}
        props={toastProps}
        accessibility={`Toasts are announced to screen readers via a live region (role="status", aria-live="polite").\nEach toast can be dismissed with keyboard (Escape or close button).\nAuto-dismiss timer pauses on hover/focus for users who need more reading time.`}
      />

      <div style={{ marginBlock: '2rem' }} />

      {/* ── Remaining components as Preview cards ─────────────────────── */}
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}>More Overlay Components</h2>
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
