import { useState, type ChangeEvent } from 'react'
import { Preview } from '../components/Preview.tsx'
import {
  FormInput, Select, Checkbox, ToggleSwitch,
  RadioGroup, Slider, FilterPill, ColorInput,
} from '@ui/index'

export function FormsPage() {
  const [text, setText] = useState('core-sw-01')
  const [password, setPassword] = useState('secret123')
  const [selectVal, setSelectVal] = useState('snmpv3')
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(false)
  const [toggle1, setToggle1] = useState(true)
  const [toggle2, setToggle2] = useState(false)
  const [radio, setRadio] = useState('sha256')
  const [radioH, setRadioH] = useState('compact')
  const [slider, setSlider] = useState(60)
  const [filters, setFilters] = useState<Record<string, boolean>>({ All: true, Active: false, Warning: false, Critical: false, Stale: false })
  const [color, setColor] = useState('#8b5cf6')

  const toggleFilter = (key: string) => {
    if (key === 'All') {
      setFilters({ All: true, Active: false, Warning: false, Critical: false, Stale: false })
    } else {
      setFilters(prev => {
        const next = { ...prev, [key]: !prev[key], All: false }
        if (!Object.entries(next).some(([k, v]) => k !== 'All' && v)) next.All = true
        return next
      })
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Forms</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">8 form components for data entry and configuration</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="FormInput" description="Text input with label, hint, validation" code={`<FormInput label="Hostname" value={val} onChange={setVal} required />\n<FormInput label="Password" type="password" />`}>
          <div className="space-y-3">
            <FormInput label="Hostname" value={text} onChange={setText} required hint="FQDN or short hostname" />
            <FormInput label="API Key" type="password" value={password} onChange={setPassword} />
            <FormInput label="Description" value="" onChange={() => {}} hint="Optional device description" />
            <FormInput label="Disabled" value="Cannot edit" onChange={() => {}} disabled />
          </div>
        </Preview>

        <Preview label="Select" description="Themed dropdown" code={`<Select\n  options={options}\n  value={val}\n  onValueChange={setVal}\n/>`}>
          <div className="space-y-3">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">SNMP Version</label>
            <Select
              options={[
                { value: 'snmpv1', label: 'SNMP v1' },
                { value: 'snmpv2c', label: 'SNMP v2c' },
                { value: 'snmpv3', label: 'SNMP v3 (USM)' },
              ]}
              value={selectVal}
              onValueChange={setSelectVal}
            />
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-secondary))]">Vendor</label>
            <Select
              options={[
                { value: 'cisco', label: 'Cisco' },
                { value: 'juniper', label: 'Juniper' },
                { value: 'arista', label: 'Arista' },
                { value: 'nokia', label: 'Nokia' },
                { value: 'fortinet', label: 'Fortinet' },
              ]}
              value=""
              onValueChange={() => {}}
              placeholder="Select vendor..."
            />
          </div>
        </Preview>

        <Preview label="Checkbox" description="Checkbox with label states" code={`<Checkbox checked={val} onChange={handler} />`}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={checked1} onChange={(e: ChangeEvent<HTMLInputElement>) => setChecked1(e.target.checked)} /><span className="text-sm text-[hsl(var(--text-primary))]">Enable SNMP polling</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={checked2} onChange={(e: ChangeEvent<HTMLInputElement>) => setChecked2(e.target.checked)} /><span className="text-sm text-[hsl(var(--text-primary))]">Enable syslog collection</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={checked3} onChange={(e: ChangeEvent<HTMLInputElement>) => setChecked3(e.target.checked)} /><span className="text-sm text-[hsl(var(--text-primary))]">Auto-approve discovered devices</span></label>
          </div>
        </Preview>

        <Preview label="ToggleSwitch" description="On/off toggle with label" code={`<ToggleSwitch label="Auto-refresh" enabled={val} onChange={setVal} />`}>
          <div className="space-y-4">
            <ToggleSwitch label="Auto-refresh dashboard" enabled={toggle1} onChange={setToggle1} />
            <ToggleSwitch label="Dark mode" enabled={toggle2} onChange={setToggle2} />
          </div>
        </Preview>

        <Preview label="RadioGroup" description="Vertical and horizontal layouts" code={`<RadioGroup\n  options={options}\n  value={val}\n  onChange={setVal}\n  orientation="vertical"\n/>`}>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2 block">Auth Protocol</span>
              <RadioGroup
                options={[
                  { value: 'md5', label: 'MD5', description: 'Legacy, not recommended' },
                  { value: 'sha1', label: 'SHA-1' },
                  { value: 'sha256', label: 'SHA-256', description: 'Recommended' },
                ]}
                value={radio}
                onChange={setRadio}
                orientation="vertical"
              />
            </div>
            <div>
              <span className="text-[10px] text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2 block">Table density</span>
              <RadioGroup
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'spacious', label: 'Spacious' },
                ]}
                value={radioH}
                onChange={setRadioH}
                orientation="horizontal"
              />
            </div>
          </div>
        </Preview>

        <Preview label="Slider" description="Range slider with value display" code={`<Slider\n  value={val}\n  onChange={setVal}\n  min={10} max={300}\n  label="Interval (sec)"\n  showValue\n/>`}>
          <div className="space-y-4 py-2">
            <Slider value={slider} onChange={setSlider} min={10} max={300} step={5} label="Collection Interval (sec)" showValue />
            <Slider value={75} onChange={() => {}} min={0} max={100} label="Alert Threshold (%)" showValue />
          </div>
        </Preview>

        <Preview label="FilterPill" description="Toggle filter pills" code={`<FilterPill label="Active" active={isActive} onClick={toggle} count={42} />`}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([label, active]) => (
              <FilterPill key={label} label={label} active={active} onClick={() => toggleFilter(label)} count={label === 'All' ? 156 : label === 'Active' ? 120 : label === 'Warning' ? 23 : label === 'Critical' ? 5 : 8} />
            ))}
          </div>
        </Preview>

        <Preview label="ColorInput" description="Color picker with presets" code={`<ColorInput value={color} onChange={setColor} label="Theme Color" />`}>
          <ColorInput
            value={color}
            onChange={setColor}
            label="Alert Color"
            presets={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']}
          />
        </Preview>
      </div>
    </div>
  )
}
