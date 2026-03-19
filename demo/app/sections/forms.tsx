'use client'

import React, { useState } from 'react'
import {
  FormInput, Select, Checkbox, ToggleSwitch, RadioGroup, Slider, FilterPill,
} from '../../../src/index'

function Preview({ label, hint, children, wide }: {
  label: string; hint: string; children: React.ReactNode; wide?: boolean
}): React.JSX.Element {
  return (
    <figure className={`preview-card ${wide ? 'col-span-full' : ''}`}>
      <div className="preview-label">
        <span>{label}</span>
        <span className="text-[10px] font-normal normal-case tracking-normal text-[hsl(var(--text-disabled))]">Live</span>
      </div>
      <div className="preview-body">{children}</div>
      <div className="code-snippet font-mono"><code>{hint}</code></div>
    </figure>
  )
}

function FormInputDemo() {
  const [hostname, setHostname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [port, setPort] = useState('8080')
  const [ip, setIp] = useState('10.0.0')
  return (
    <div className="space-y-4">
      <FormInput label="Hostname" value={hostname} onChange={setHostname} placeholder="web-01.prod.internal" hint="FQDN of the target host" />
      <FormInput label="API Key" value={apiKey} onChange={setApiKey} type="password" placeholder="Enter API key" required />
      <FormInput label="Port" value={port} onChange={setPort} placeholder="8080" disabled hint="Disabled field" />
      <FormInput label="IP Address" value={ip} onChange={setIp} placeholder="10.0.0.1" />
    </div>
  )
}

function SelectDemo() {
  const [val, setVal] = useState('snmpv3')
  return (
    <div>
      <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Protocol</label>
      <Select value={val} onValueChange={setVal} options={[
        { value: 'snmpv2c', label: 'SNMP v2c' }, { value: 'snmpv3', label: 'SNMP v3' },
        { value: 'rest', label: 'REST API' }, { value: 'gnmi', label: 'gNMI' }, { value: 'ssh', label: 'SSH CLI' },
      ]} />
    </div>
  )
}

function CheckboxDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(false)
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={a} onChange={() => setA(!a)} /> Enable SNMP collection
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={b} onChange={() => setB(!b)} /> Send alert notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={c} indeterminate={!c && !a} onChange={() => setC(!c)} /> Select all interfaces
      </label>
    </div>
  )
}

function ToggleDemo() {
  const [on, setOn] = useState(true)
  return (
    <div className="flex items-center gap-6">
      <ToggleSwitch label="Auto-discovery" enabled={on} onChange={setOn} />
      <ToggleSwitch label="Disabled" enabled={false} onChange={() => {}} disabled />
    </div>
  )
}

function RadioGroupDemo() {
  const [val, setVal] = useState('60')
  return (
    <div>
      <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-2">Collection Interval</label>
      <RadioGroup value={val} onChange={setVal} options={[
        { value: '30', label: '30 seconds' }, { value: '60', label: '1 minute' },
        { value: '300', label: '5 minutes' }, { value: '900', label: '15 minutes' },
      ]} />
    </div>
  )
}

function SliderDemo() {
  const [val, setVal] = useState(75)
  return (
    <div className="space-y-3">
      <Slider label="Alert Threshold" value={val} onChange={setVal} min={0} max={100} step={1} />
      <p className="text-xs text-[hsl(var(--text-tertiary))] tabular-nums">Value: {val}%</p>
    </div>
  )
}

function FilterPillDemo() {
  const [filters, setFilters] = useState<Record<string, boolean>>({
    Critical: true, Warning: true, Info: false, Switches: false, Firewalls: true, Hosts: false,
  })
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(filters).map(([label, active]) => (
        <FilterPill key={label} label={label} active={active} onClick={() => setFilters((f) => ({ ...f, [label]: !f[label] }))} />
      ))}
    </div>
  )
}

export default function FormsSection() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">Forms</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Themed form inputs, selects, checkboxes, toggles, radios, sliders, and filter pills.</p>
      </div>

      <div className="demo-grid">
        <Preview label="FormInput" hint='<FormInput label="Hostname" value={v} onChange={set} />'>
          <FormInputDemo />
        </Preview>

        <Preview label="Select" hint='<Select value={v} onValueChange={set} options={[...]} />'>
          <SelectDemo />
        </Preview>

        <Preview label="Checkbox" hint='<Checkbox checked={on} onChange={toggle} />'>
          <CheckboxDemo />
        </Preview>

        <Preview label="ToggleSwitch" hint='<ToggleSwitch label="Auto" enabled={on} onChange={set} />'>
          <ToggleDemo />
        </Preview>

        <Preview label="RadioGroup" hint='<RadioGroup value={v} onChange={set} options={[...]} />'>
          <RadioGroupDemo />
        </Preview>

        <Preview label="Slider" hint='<Slider label="Threshold" value={v} onChange={set} />'>
          <SliderDemo />
        </Preview>

        <Preview label="FilterPill" hint='<FilterPill label="Critical" active={on} onClick={toggle} />' wide>
          <FilterPillDemo />
        </Preview>
      </div>
    </>
  )
}
