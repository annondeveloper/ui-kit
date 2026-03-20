import { useState } from 'react'
import { Preview } from '../components/Preview'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Avatar, AvatarGroup } from '@ui/components/avatar'
import { Card } from '@ui/components/card'
import { Skeleton } from '@ui/components/skeleton'
import { Progress } from '@ui/components/progress'
import { Checkbox } from '@ui/components/checkbox'
import { RadioGroup } from '@ui/components/radio-group'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Slider } from '@ui/components/slider'
import { StatusBadge } from '@ui/components/status-badge'
import { StatusPulse } from '@ui/components/status-pulse'
import { SuccessCheckmark } from '@ui/components/success-checkmark'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { Icon } from '@ui/core/icons/icon'

const sectionTitle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem',
}

const row: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.75rem',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1rem',
}

export default function CorePage() {
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(false)
  const [indeterminate, setIndeterminate] = useState(true)
  const [toggle1, setToggle1] = useState(true)
  const [toggle2, setToggle2] = useState(false)
  const [radio, setRadio] = useState('sha256')
  const [slider, setSlider] = useState(60)
  const [progVal, setProgVal] = useState(65)
  const [counter, setCounter] = useState(1000)
  const [checkKey, setCheckKey] = useState(0)
  const [loading, setLoading] = useState(false)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Core</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>14 foundational components for building interfaces</p>
      </div>

      <div style={grid}>
        {/* Button */}
        <Preview label="Button" description="4 variants, 3 sizes, loading, icons, disabled">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={row}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div style={row}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div style={row}>
              <Button loading onClick={() => {}} variant="primary">Loading</Button>
              <Button icon={<Icon name="zap" size="sm" />} variant="primary">With Icon</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Preview>

        {/* Badge */}
        <Preview label="Badge" description="6 variants, dot, pulse, counter overflow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={row}>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div style={row}>
              <Badge dot variant="success">Online</Badge>
              <Badge pulse variant="danger">Live</Badge>
              <Badge count={7} variant="primary" />
              <Badge count={150} maxCount={99} variant="danger" />
            </div>
          </div>
        </Preview>

        {/* Avatar */}
        <Preview label="Avatar" description="Images, initials, sizes, status, groups">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={row}>
              <Avatar name="Alice Johnson" size="sm" status="online" />
              <Avatar name="Bob" size="md" status="away" />
              <Avatar name="Charlie Smith" size="lg" status="busy" />
              <Avatar name="Dana White" size="xl" status="offline" />
            </div>
            <AvatarGroup>
              <Avatar name="Alice" size="md" />
              <Avatar name="Bob K" size="md" />
              <Avatar name="Carol" size="md" />
              <Avatar name="Dave" size="md" />
              <Avatar name="Eve" size="md" />
            </AvatarGroup>
          </div>
        </Preview>

        {/* Card */}
        <Preview label="Card" description="4 variants, interactive hover, padding levels">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Card variant="default" padding="sm">Default</Card>
              <Card variant="elevated" padding="sm">Elevated</Card>
              <Card variant="outlined" padding="sm">Outlined</Card>
              <Card variant="ghost" padding="sm">Ghost</Card>
            </div>
            <Card variant="default" padding="md" interactive>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Interactive Card</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Hover me for a lift effect</div>
            </Card>
          </div>
        </Preview>

        {/* Skeleton */}
        <Preview label="Skeleton" description="Text lines, circular, rectangular">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="45%" />
              </div>
            </div>
            <Skeleton variant="rectangular" width="100%" height={60} />
          </div>
        </Preview>

        {/* Progress */}
        <Preview label="Progress" description="Animated, indeterminate, all variants">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Progress value={progVal} variant="default" />
            <Progress value={progVal} variant="success" />
            <Progress value={progVal} variant="warning" />
            <Progress value={progVal} variant="danger" />
            <Progress indeterminate variant="default" />
            <Button size="sm" onClick={() => setProgVal(Math.floor(Math.random() * 100))}>
              Randomize ({progVal}%)
            </Button>
          </div>
        </Preview>

        {/* Checkbox */}
        <Preview label="Checkbox" description="Checked, unchecked, indeterminate, disabled">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Checkbox
              label="Checked"
              checked={checked1}
              onChange={() => setChecked1(c => !c)}
            />
            <Checkbox
              label="Unchecked"
              checked={checked2}
              onChange={() => setChecked2(c => !c)}
            />
            <Checkbox
              label="Indeterminate"
              checked={indeterminate}
              indeterminate
              onChange={() => setIndeterminate(c => !c)}
            />
            <Checkbox label="Disabled" disabled checked />
          </div>
        </Preview>

        {/* RadioGroup */}
        <Preview label="RadioGroup" description="Horizontal and vertical layouts">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <RadioGroup
              name="hash-algo"
              options={[
                { value: 'md5', label: 'MD5' },
                { value: 'sha256', label: 'SHA-256' },
                { value: 'sha512', label: 'SHA-512' },
              ]}
              value={radio}
              onChange={setRadio}
            />
          </div>
        </Preview>

        {/* ToggleSwitch */}
        <Preview label="ToggleSwitch" description="On/off with labels, different sizes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={row}>
              <ToggleSwitch checked={toggle1} onChange={() => setToggle1(t => !t)} size="sm" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Notifications {toggle1 ? 'On' : 'Off'}
              </span>
            </div>
            <div style={row}>
              <ToggleSwitch checked={toggle2} onChange={() => setToggle2(t => !t)} size="md" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Dark mode {toggle2 ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </Preview>

        {/* Slider */}
        <Preview label="Slider" description="Default, with value display, ticks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Slider
              min={0}
              max={100}
              value={slider}
              onChange={setSlider}
              showValue
              label="Volume"
            />
            <Slider
              min={0}
              max={100}
              step={25}
              value={50}
              showTicks
              label="Quality"
              size="sm"
            />
          </div>
        </Preview>

        {/* StatusBadge */}
        <Preview label="StatusBadge" description="All 6 statuses with labels">
          <div style={row}>
            <StatusBadge status="ok" label="Healthy" />
            <StatusBadge status="warning" label="Degraded" />
            <StatusBadge status="critical" label="Down" />
            <StatusBadge status="info" label="Info" />
            <StatusBadge status="unknown" label="Unknown" />
            <StatusBadge status="maintenance" label="Maintenance" />
          </div>
        </Preview>

        {/* StatusPulse */}
        <Preview label="StatusPulse" description="All 4 statuses with pulse animation">
          <div style={row}>
            <StatusPulse status="ok" label="Online" />
            <StatusPulse status="warning" label="Slow" />
            <StatusPulse status="critical" label="Offline" />
            <StatusPulse status="info" label="Syncing" />
          </div>
        </Preview>

        {/* SuccessCheckmark */}
        <Preview label="SuccessCheckmark" description="Animated on mount, replay button">
          <div style={{ ...row, gap: '1.5rem' }}>
            <SuccessCheckmark key={checkKey} size="sm" animated label="Done" />
            <SuccessCheckmark key={checkKey + 100} size="md" animated />
            <SuccessCheckmark key={checkKey + 200} size="lg" animated />
            <Button size="sm" variant="secondary" onClick={() => setCheckKey(k => k + 1)}>
              Replay
            </Button>
          </div>
        </Preview>

        {/* AnimatedCounter */}
        <Preview label="AnimatedCounter" description="Button to add random amount" wide>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <AnimatedCounter value={counter} style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }} />
            <Button size="sm" onClick={() => setCounter(c => c + Math.floor(Math.random() * 500) + 100)}>
              Add Random
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCounter(0)}>Reset</Button>
          </div>
        </Preview>
      </div>
    </div>
  )
}
