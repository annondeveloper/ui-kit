import { useState } from 'react'
import { ComponentShowcase, type ShowcaseExample } from '../components/ComponentShowcase'
import type { PropDef } from '../components/PropsTable'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Avatar, AvatarGroup } from '@ui/components/avatar'
import { Card } from '@ui/components/card'
import { Progress } from '@ui/components/progress'
import { Checkbox } from '@ui/components/checkbox'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Icon } from '@ui/core/icons/icon'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.75rem',
}

const col: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

// ─── Button Showcase ──────────────────────────────────────────────────────────

const buttonExamples: ShowcaseExample[] = [
  {
    title: 'Variants',
    description: 'Four built-in variants for different contexts.',
    code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`,
    render: () => (
      <div style={row}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    ),
  },
  {
    title: 'With Icons',
    description: 'Leading and trailing icon support.',
    code: `<Button icon={<Icon name="zap" size="sm" />}>Deploy</Button>
<Button iconEnd={<Icon name="arrow-right" size="sm" />}>Next</Button>`,
    render: () => (
      <div style={row}>
        <Button icon={<Icon name="zap" size="sm" />}>Deploy</Button>
        <Button iconEnd={<Icon name="arrow-right" size="sm" />}>Next</Button>
      </div>
    ),
  },
  {
    title: 'Loading State',
    description: 'Shows a spinner and prevents further interaction.',
    code: `<Button loading>Saving...</Button>
<Button loading variant="secondary">Processing</Button>`,
    render: () => (
      <div style={row}>
        <Button loading>Saving...</Button>
        <Button loading variant="secondary">Processing</Button>
      </div>
    ),
  },
  {
    title: 'Disabled',
    code: `<Button disabled>Disabled</Button>
<Button disabled variant="danger">Can't Delete</Button>`,
    render: () => (
      <div style={row}>
        <Button disabled>Disabled</Button>
        <Button disabled variant="danger">Can't Delete</Button>
      </div>
    ),
  },
]

const buttonProps: PropDef[] = [
  { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'", description: 'Visual style variant' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Button size' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows spinner and prevents interaction' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element' },
  { name: 'iconEnd', type: 'ReactNode', description: 'Trailing icon element' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── Badge Showcase ───────────────────────────────────────────────────────────

const badgeExamples: ShowcaseExample[] = [
  {
    title: 'Variants',
    description: 'Six semantic variants for status and categorization.',
    code: `<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>`,
    render: () => (
      <div style={row}>
        <Badge variant="default">Default</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
      </div>
    ),
  },
  {
    title: 'Dot & Pulse',
    description: 'Status dot indicator and pulsing animation for live data.',
    code: `<Badge dot variant="success">Online</Badge>
<Badge dot variant="danger">Offline</Badge>
<Badge pulse variant="danger">Live</Badge>`,
    render: () => (
      <div style={row}>
        <Badge dot variant="success">Online</Badge>
        <Badge dot variant="danger">Offline</Badge>
        <Badge pulse variant="danger">Live</Badge>
      </div>
    ),
  },
  {
    title: 'Counter',
    description: 'Numeric counter with optional max overflow.',
    code: `<Badge count={7} variant="primary" />
<Badge count={42} variant="danger" />
<Badge count={150} maxCount={99} variant="danger" />`,
    render: () => (
      <div style={row}>
        <Badge count={7} variant="primary" />
        <Badge count={42} variant="danger" />
        <Badge count={150} maxCount={99} variant="danger" />
      </div>
    ),
  },
]

const badgeProps: PropDef[] = [
  { name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Semantic color variant' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Badge size' },
  { name: 'dot', type: 'boolean', default: 'false', description: 'Shows a leading status dot' },
  { name: 'pulse', type: 'boolean', default: 'false', description: 'Adds pulsing animation to the dot' },
  { name: 'count', type: 'number', description: 'Displays a numeric count instead of children' },
  { name: 'maxCount', type: 'number', description: 'Maximum count before showing overflow (e.g. 99+)' },
  { name: 'icon', type: 'ReactNode', description: 'Leading icon element' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── Avatar Showcase ──────────────────────────────────────────────────────────

const avatarExamples: ShowcaseExample[] = [
  {
    title: 'Initials & Status',
    description: 'Avatars auto-generate initials from name and show online status.',
    code: `<Avatar name="Alice Johnson" size="md" status="online" />
<Avatar name="Bob" size="md" status="away" />
<Avatar name="Charlie Smith" size="md" status="busy" />
<Avatar name="Dana White" size="md" status="offline" />`,
    render: () => (
      <div style={row}>
        <Avatar name="Alice Johnson" size="md" status="online" />
        <Avatar name="Bob" size="md" status="away" />
        <Avatar name="Charlie Smith" size="md" status="busy" />
        <Avatar name="Dana White" size="md" status="offline" />
      </div>
    ),
  },
  {
    title: 'Avatar Group',
    description: 'Overlapping group with automatic overflow count.',
    code: `<AvatarGroup>
  <Avatar name="Alice" size="md" />
  <Avatar name="Bob K" size="md" />
  <Avatar name="Carol" size="md" />
  <Avatar name="Dave" size="md" />
  <Avatar name="Eve" size="md" />
</AvatarGroup>`,
    render: () => (
      <AvatarGroup>
        <Avatar name="Alice" size="md" />
        <Avatar name="Bob K" size="md" />
        <Avatar name="Carol" size="md" />
        <Avatar name="Dave" size="md" />
        <Avatar name="Eve" size="md" />
      </AvatarGroup>
    ),
  },
  {
    title: 'With Icon Fallback',
    description: 'Custom icon when no name or image is provided.',
    code: `<Avatar icon={<Icon name="user" size="sm" />} size="md" />`,
    render: () => (
      <Avatar icon={<Icon name="user" size="sm" />} size="md" />
    ),
  },
]

const avatarProps: PropDef[] = [
  { name: 'src', type: 'string', description: 'Image URL for the avatar' },
  { name: 'alt', type: 'string', description: 'Alt text for the avatar image' },
  { name: 'name', type: 'string', description: 'Full name — used to generate initials' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Avatar size' },
  { name: 'status', type: "'online' | 'offline' | 'away' | 'busy'", description: 'Status indicator dot' },
  { name: 'icon', type: 'ReactNode', description: 'Fallback icon when no name or image' },
]

// ─── Card Showcase ────────────────────────────────────────────────────────────

const cardExamples: ShowcaseExample[] = [
  {
    title: 'Variants',
    description: 'Four visual styles for different surface treatments.',
    code: `<Card variant="default" padding="md">Default surface</Card>
<Card variant="elevated" padding="md">Elevated with shadow</Card>
<Card variant="outlined" padding="md">Outlined border</Card>
<Card variant="ghost" padding="md">Ghost (transparent)</Card>`,
    render: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Card variant="default" padding="md">Default surface</Card>
        <Card variant="elevated" padding="md">Elevated with shadow</Card>
        <Card variant="outlined" padding="md">Outlined border</Card>
        <Card variant="ghost" padding="md">Ghost (transparent)</Card>
      </div>
    ),
  },
  {
    title: 'Interactive',
    description: 'Cards that respond to hover with a subtle lift effect.',
    code: `<Card variant="default" padding="md" interactive>
  <strong>Clickable Card</strong>
  <p>Hover for lift effect</p>
</Card>`,
    render: () => (
      <Card variant="default" padding="md" interactive>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Clickable Card</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Hover for lift effect</div>
      </Card>
    ),
  },
  {
    title: 'Polymorphic (as link)',
    description: 'Render as any HTML element using the `as` prop.',
    code: `<Card as="a" href="#" variant="outlined" padding="md" interactive>
  I'm an anchor tag
</Card>`,
    render: () => (
      <Card as="a" href="#" variant="outlined" padding="md" interactive>
        I'm an anchor tag
      </Card>
    ),
  },
]

const cardProps: PropDef[] = [
  { name: 'as', type: 'ElementType', default: "'div'", description: 'Polymorphic root element' },
  { name: 'variant', type: "'default' | 'elevated' | 'outlined' | 'ghost'", default: "'default'", description: 'Visual style variant' },
  { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Internal padding level' },
  { name: 'interactive', type: 'boolean', default: 'false', description: 'Enables hover lift effect' },
  { name: 'href', type: 'string', description: 'When using as="a", the link target' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── Progress Showcase ────────────────────────────────────────────────────────

function ProgressExamples() {
  const [value, setValue] = useState(65)
  return (
    <div style={col}>
      <Progress value={value} variant="default" />
      <Progress value={value} variant="success" />
      <Progress value={value} variant="warning" />
      <Progress value={value} variant="danger" />
      <Button size="sm" onClick={() => setValue(Math.floor(Math.random() * 100))}>
        Randomize ({value}%)
      </Button>
    </div>
  )
}

const progressExamples: ShowcaseExample[] = [
  {
    title: 'Variants',
    description: 'Semantic color variants with interactive value.',
    code: `<Progress value={65} variant="default" />
<Progress value={65} variant="success" />
<Progress value={65} variant="warning" />
<Progress value={65} variant="danger" />`,
    render: () => <ProgressExamples />,
  },
  {
    title: 'Indeterminate',
    description: 'Omit value for an animated indeterminate state.',
    code: `<Progress variant="default" />`,
    render: () => (
      <div style={{ ...col, inlineSize: '100%' }}>
        <Progress variant="default" />
      </div>
    ),
  },
  {
    title: 'With Value Label',
    description: 'Show the current percentage alongside the bar.',
    code: `<Progress value={72} showValue label="Upload" />`,
    render: () => (
      <div style={{ inlineSize: '100%' }}>
        <Progress value={72} showValue label="Upload" />
      </div>
    ),
  },
]

const progressProps: PropDef[] = [
  { name: 'value', type: 'number', description: 'Current progress (0-max). Omit for indeterminate.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Bar height' },
  { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Semantic color variant' },
  { name: 'label', type: 'string', description: 'Accessible label for the progress bar' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Displays percentage text beside the bar' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── Checkbox Showcase ────────────────────────────────────────────────────────

function CheckboxExamples() {
  const [checked, setChecked] = useState(true)
  const [unchecked, setUnchecked] = useState(false)

  return (
    <div style={col}>
      <Checkbox label="Checked" checked={checked} onChange={() => setChecked(c => !c)} />
      <Checkbox label="Unchecked" checked={unchecked} onChange={() => setUnchecked(c => !c)} />
    </div>
  )
}

function CheckboxIndeterminate() {
  const [ind, setInd] = useState(true)
  return (
    <Checkbox
      label="Select all (indeterminate)"
      checked={ind}
      indeterminate
      onChange={() => setInd(c => !c)}
    />
  )
}

const checkboxExamples: ShowcaseExample[] = [
  {
    title: 'Basic',
    description: 'Standard checked and unchecked states.',
    code: `<Checkbox label="Checked" checked={true} onChange={...} />
<Checkbox label="Unchecked" checked={false} onChange={...} />`,
    render: () => <CheckboxExamples />,
  },
  {
    title: 'Indeterminate',
    description: 'Third state for partial selection (e.g. "select all").',
    code: `<Checkbox label="Select all" checked indeterminate onChange={...} />`,
    render: () => <CheckboxIndeterminate />,
  },
  {
    title: 'With Error & Disabled',
    code: `<Checkbox label="Agree to terms" error="Required" />
<Checkbox label="Disabled" disabled checked />`,
    render: () => (
      <div style={col}>
        <Checkbox label="Agree to terms" error="Required" />
        <Checkbox label="Disabled" disabled checked />
      </div>
    ),
  },
]

const checkboxProps: PropDef[] = [
  { name: 'label', type: 'ReactNode', description: 'Text label rendered beside the checkbox' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Checkbox size' },
  { name: 'checked', type: 'boolean', description: 'Controlled checked state' },
  { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Shows a dash instead of a checkmark' },
  { name: 'error', type: 'string', description: 'Error message displayed below the checkbox' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox' },
  { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── ToggleSwitch Showcase ────────────────────────────────────────────────────

function ToggleExamples() {
  const [on, setOn] = useState(true)
  const [off, setOff] = useState(false)

  return (
    <div style={col}>
      <div style={row}>
        <ToggleSwitch checked={on} onChange={(e) => setOn(e.target.checked)} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Notifications {on ? 'On' : 'Off'}
        </span>
      </div>
      <div style={row}>
        <ToggleSwitch checked={off} onChange={(e) => setOff(e.target.checked)} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Dark mode {off ? 'On' : 'Off'}
        </span>
      </div>
    </div>
  )
}

const toggleExamples: ShowcaseExample[] = [
  {
    title: 'Basic Toggle',
    description: 'Interactive on/off switch with label.',
    code: `<ToggleSwitch checked={on} onChange={(e) => setOn(e.target.checked)} />`,
    render: () => <ToggleExamples />,
  },
  {
    title: 'With Label Prop',
    description: 'Built-in label renders beside the track.',
    code: `<ToggleSwitch label="Enable feature" checked />`,
    render: () => (
      <div style={col}>
        <ToggleSwitch label="Enable feature" defaultChecked />
        <ToggleSwitch label="Disabled" disabled />
      </div>
    ),
  },
  {
    title: 'With Error',
    code: `<ToggleSwitch label="Required setting" error="Must be enabled" />`,
    render: () => (
      <ToggleSwitch label="Required setting" error="Must be enabled" />
    ),
  },
]

const toggleProps: PropDef[] = [
  { name: 'label', type: 'ReactNode', description: 'Text label rendered beside the switch' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Switch size' },
  { name: 'checked', type: 'boolean', description: 'Controlled checked state' },
  { name: 'error', type: 'string', description: 'Error message displayed below the switch' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch' },
  { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CorePage() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
        Primitive Components
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: 'var(--text-sm)', maxWidth: 600 }}>
        Foundation components that every interface needs. All support 5 sizes (xs–xl),
        4 motion levels, and Aurora Fluid theming.
      </p>

      <ComponentShowcase
        name="Button"
        description="Primary action trigger with variant styles, sizes, loading state, and icon support."
        examples={buttonExamples}
        sizes={true}
        sizeComponent={(size) => <Button size={size as any}>Button</Button>}
        props={buttonProps}
        accessibility="Activates on Enter and Space. Focus visible ring. Loading state announced via aria-busy. type='button' by default to prevent accidental form submission."
      />

      <ComponentShowcase
        name="Badge"
        description="Compact label for status, counts, and categorization with semantic color variants."
        examples={badgeExamples}
        sizes={true}
        sizeComponent={(size) => <Badge size={size as any} variant="primary">Badge</Badge>}
        props={badgeProps}
        accessibility="Rendered as a span with no interactive role. When using count, the numeric value is visible text. Pulse animation respects prefers-reduced-motion."
      />

      <ComponentShowcase
        name="Avatar"
        description="User or entity representation with image, auto-generated initials, status indicators, and group layout."
        examples={avatarExamples}
        sizes={true}
        sizeComponent={(size) => <Avatar size={size as any} name="Ada Lovelace" />}
        props={avatarProps}
        accessibility="Uses role='img' with aria-label from name prop. Status dot has aria-label describing the status. Image fallback to initials is seamless for screen readers."
      />

      <ComponentShowcase
        name="Card"
        description="Versatile container surface with four visual variants, interactive hover effects, and polymorphic rendering."
        examples={cardExamples}
        props={cardProps}
        accessibility="When interactive, gains tabindex and keyboard activation. Polymorphic: renders as native element (div, a, button) preserving semantics. Focus ring visible on keyboard navigation."
      />

      <ComponentShowcase
        name="Progress"
        description="Determinate and indeterminate progress bar with semantic variants and accessible labeling."
        examples={progressExamples}
        sizes={true}
        sizeComponent={(size) => (
          <div style={{ inlineSize: 120 }}>
            <Progress size={size as any} value={65} />
          </div>
        )}
        props={progressProps}
        accessibility="Uses role='progressbar' with aria-valuenow, aria-valuemin, aria-valuemax. Indeterminate state omits aria-valuenow. Label prop sets aria-label."
      />

      <ComponentShowcase
        name="Checkbox"
        description="Standard checkbox with label, indeterminate state, error messaging, and animated check mark."
        examples={checkboxExamples}
        sizes={true}
        sizeComponent={(size) => <Checkbox size={size as any} label={size} defaultChecked />}
        props={checkboxProps}
        accessibility="Native input[type='checkbox'] with visible label. Indeterminate state set via ref. aria-invalid and aria-describedby for error state. Focus ring on keyboard navigation. 44px minimum touch target."
      />

      <ComponentShowcase
        name="ToggleSwitch"
        description="On/off switch for binary settings with animated thumb, label support, and error state."
        examples={toggleExamples}
        sizes={true}
        sizeComponent={(size) => <ToggleSwitch size={size as any} defaultChecked />}
        props={toggleProps}
        accessibility="Uses role='switch' with aria-checked. Label associated via htmlFor. Error announced with aria-describedby. 44px minimum touch target. Toggles on Space key."
      />
    </div>
  )
}
