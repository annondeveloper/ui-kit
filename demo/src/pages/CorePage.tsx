import { useState, type ChangeEvent } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  Button, Badge, Card, Avatar, AvatarGroup,
  Skeleton, Progress, Checkbox, RadioGroup,
  ToggleSwitch, Slider, StatusBadge, StatusPulse,
  SuccessCheckmark, AnimatedCounter, Tabs,
} from '@ui/index'

export function CorePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [pillTab, setPillTab] = useState('all')
  const [encTab, setEncTab] = useState('config')
  const [checkKey, setCheckKey] = useState(0)
  const [counter, setCounter] = useState(1000)
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(false)
  const [toggle1, setToggle1] = useState(true)
  const [toggle2, setToggle2] = useState(false)
  const [radio, setRadio] = useState('sha256')
  const [slider, setSlider] = useState(60)
  const [progVal, setProgVal] = useState(65)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Core</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">14 foundational components for building interfaces</p>
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
              <Button size="icon"><span>+</span></Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Preview>

        <Preview label="Badge" description="10 colors with size variants" code={`<Badge color="green">Active</Badge>\n<Badge color="red">Alert</Badge>`}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['brand', 'blue', 'green', 'yellow', 'red', 'orange', 'purple', 'pink', 'teal', 'gray'] as const).map(c => (
                <Badge key={c} color={c}>{c}</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge color="green" size="xs">Tiny</Badge>
              <Badge color="purple" size="md">Medium</Badge>
            </div>
          </div>
        </Preview>

        <Preview label="Card" description="4 variants with interactive hover" code={`<Card variant="elevated">\n  <div>Content here</div>\n</Card>`}>
          <div className="grid grid-cols-2 gap-3">
            <Card variant="default" padding="sm">
              <div className="p-3">
                <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Default</h4>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Standard card with subtle border</p>
              </div>
            </Card>
            <Card variant="elevated" padding="sm">
              <div className="p-3">
                <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Elevated</h4>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Stronger shadow and border</p>
              </div>
            </Card>
            <Card variant="outlined" padding="sm">
              <div className="p-3">
                <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Outlined</h4>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Transparent with border</p>
              </div>
            </Card>
            <Card interactive padding="sm">
              <div className="p-3">
                <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Interactive</h4>
                <p className="text-xs text-[hsl(var(--text-secondary))]">Hover for effect</p>
              </div>
            </Card>
          </div>
        </Preview>

        <Preview label="Avatar" description="Image, initials, status dot" code={`<Avatar alt="Alice" size="md" />\n<AvatarGroup max={3}>...</AvatarGroup>`}>
          <div className="space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <Avatar alt="A" size="xs" />
              <Avatar alt="Bob Chen" size="sm" />
              <Avatar alt="Carol Davis" size="md" />
              <Avatar alt="Dave Evans" size="lg" />
              <Avatar alt="Eve Foster" size="xl" />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2 block">Group</span>
              <AvatarGroup max={3}>
                <Avatar alt="Alice" size="md" />
                <Avatar alt="Bob" size="md" />
                <Avatar alt="Carol" size="md" />
                <Avatar alt="Dave" size="md" />
                <Avatar alt="Eve" size="md" />
              </AvatarGroup>
            </div>
          </div>
        </Preview>

        <Preview label="Tabs" description="3 visual variants" code={`<Tabs tabs={tabs} value={active} onChange={setActive} variant="underline" />`}>
          <div className="space-y-4">
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Underline</span><Tabs tabs={[{ value: 'overview', label: 'Overview' }, { value: 'metrics', label: 'Metrics' }, { value: 'logs', label: 'Logs' }]} value={activeTab} onChange={setActiveTab} variant="underline" /></div>
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Pills</span><Tabs tabs={[{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={pillTab} onChange={setPillTab} variant="pills" /></div>
            <div><span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-1 block">Enclosed</span><Tabs tabs={[{ value: 'config', label: 'Config' }, { value: 'json', label: 'JSON' }, { value: 'yaml', label: 'YAML' }]} value={encTab} onChange={setEncTab} variant="enclosed" /></div>
          </div>
        </Preview>

        <Preview label="Skeleton" description="Loading shimmer placeholders" code={`<Skeleton width="100%" height={32} />`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton width="75%" height={16} />
                <Skeleton width="50%" height={12} />
              </div>
            </div>
            <Skeleton lines={3} />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
          </div>
        </Preview>

        <Preview label="Progress" description="All variants + indeterminate" code={`<Progress value={65} label="Upload" showValue variant="success" />\n<Progress indeterminate label="Processing..." />`}>
          <div className="space-y-4">
            <Progress value={progVal} label="Migration Progress" showValue variant="default" />
            <Progress value={85} label="Disk Usage" showValue variant="warning" size="md" />
            <Progress value={95} label="CPU Critical" showValue variant="danger" size="lg" />
            <Progress value={100} label="Complete" showValue variant="success" />
            <Progress value={0} indeterminate label="Discovering devices..." />
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setProgVal(p => Math.max(0, p - 10))}>-10</Button>
              <Button size="sm" variant="outline" onClick={() => setProgVal(p => Math.min(100, p + 10))}>+10</Button>
            </div>
          </div>
        </Preview>

        <Preview label="Checkbox" description="Checkbox with label states" code={`<Checkbox checked={val} onChange={handler} />`}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={checked1} onChange={(e: ChangeEvent<HTMLInputElement>) => setChecked1(e.target.checked)} /><span className="text-sm text-[hsl(var(--text-primary))]">Enable SNMP polling</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={checked2} onChange={(e: ChangeEvent<HTMLInputElement>) => setChecked2(e.target.checked)} /><span className="text-sm text-[hsl(var(--text-primary))]">Enable syslog collection</span></label>
          </div>
        </Preview>

        <Preview label="RadioGroup" description="Vertical and horizontal" code={`<RadioGroup options={opts} value={val} onChange={setVal} />`}>
          <RadioGroup
            options={[
              { value: 'md5', label: 'MD5', description: 'Legacy' },
              { value: 'sha1', label: 'SHA-1' },
              { value: 'sha256', label: 'SHA-256', description: 'Recommended' },
            ]}
            value={radio}
            onChange={setRadio}
            orientation="vertical"
          />
        </Preview>

        <Preview label="ToggleSwitch" description="On/off toggle with label" code={`<ToggleSwitch label="Auto-refresh" enabled={val} onChange={setVal} />`}>
          <div className="space-y-4">
            <ToggleSwitch label="Auto-refresh dashboard" enabled={toggle1} onChange={setToggle1} />
            <ToggleSwitch label="Dark mode" enabled={toggle2} onChange={setToggle2} />
          </div>
        </Preview>

        <Preview label="Slider" description="Range slider with value display" code={`<Slider value={val} onChange={setVal} min={10} max={300} label="Interval" showValue />`}>
          <div className="space-y-4 py-2">
            <Slider value={slider} onChange={setSlider} min={10} max={300} step={5} label="Collection Interval (sec)" showValue />
            <Slider value={75} onChange={() => {}} min={0} max={100} label="Alert Threshold (%)" showValue />
          </div>
        </Preview>

        <Preview label="StatusBadge" description="All status variants" code={`<StatusBadge status="active" />\n<StatusBadge status="critical" pulse />`}>
          <div className="flex flex-wrap gap-2">
            {['ok', 'active', 'warning', 'critical', 'unknown', 'maintenance', 'stale', 'inactive', 'decommissioned', 'pending'].map(s => (
              <StatusBadge key={s} status={s} pulse={s === 'critical'} />
            ))}
          </div>
        </Preview>

        <Preview label="StatusPulse" description="Animated status dots" code={`<StatusPulse status="ok" label="Healthy" />`}>
          <div className="flex flex-wrap gap-6">
            {(['ok', 'warning', 'critical', 'info'] as const).map(s => (
              <StatusPulse key={s} status={s} label={s} />
            ))}
          </div>
        </Preview>

        <Preview label="SuccessCheckmark" description="Animated check SVG" code={`<SuccessCheckmark size={48} />`}>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center justify-center gap-6">
              <SuccessCheckmark key={`c32-${checkKey}`} size={32} />
              <SuccessCheckmark key={`c48-${checkKey}`} size={48} />
              <SuccessCheckmark key={`c64-${checkKey}`} size={64} />
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCheckKey(k => k + 1)}>Replay</Button>
          </div>
        </Preview>

        <Preview label="AnimatedCounter" description="Spring-animated number transitions" code={`<AnimatedCounter value={count} />`}>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-[hsl(var(--text-primary))] tabular-nums mb-4">
              <AnimatedCounter value={counter} />
            </div>
            <Button variant="primary" onClick={() => setCounter(p => p + Math.floor(Math.random() * 500))}>Add random amount</Button>
          </div>
        </Preview>
      </div>
    </div>
  )
}
export default CorePage
