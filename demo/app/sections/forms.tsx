'use client'

import React, { useState } from 'react'
import {
  FormInput, Select, Checkbox, ToggleSwitch, RadioGroup, Slider, FilterPill,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '../../../src/index'

function DemoCard({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function FormInputDemo() {
  const [hostname, setHostname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [port, setPort] = useState('8080')
  const [ip, setIp] = useState('10.0.0')
  return (
    <DemoCard label="FormInput" description="Text inputs with hints and types">
      <div className="space-y-4">
        <FormInput label="Hostname" value={hostname} onChange={setHostname} placeholder="web-01.prod.internal" hint="FQDN of the target host" />
        <FormInput label="API Key" value={apiKey} onChange={setApiKey} type="password" placeholder="Enter API key" required />
        <FormInput label="Port" value={port} onChange={setPort} placeholder="8080" disabled hint="Disabled field" />
        <FormInput label="IP Address" value={ip} onChange={setIp} placeholder="10.0.0.1" />
      </div>
    </DemoCard>
  )
}

function SelectDemo() {
  const [val, setVal] = useState('snmpv3')
  return (
    <div>
      <label className="block text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5">Protocol</label>
      <Select
        value={val}
        onValueChange={setVal}
        options={[
          { value: 'snmpv2c', label: 'SNMP v2c' },
          { value: 'snmpv3', label: 'SNMP v3' },
          { value: 'rest', label: 'REST API' },
          { value: 'gnmi', label: 'gNMI' },
          { value: 'ssh', label: 'SSH CLI' },
        ]}
      />
    </div>
  )
}

function CheckboxDemo() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [c, setC] = useState(false)
  return (
    <>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={a} onChange={() => setA(!a)} /> Enable SNMP collection
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={b} onChange={() => setB(!b)} /> Send alert notifications
      </label>
      <label className="flex items-center gap-2 text-sm text-[hsl(var(--text-primary))] cursor-pointer">
        <Checkbox checked={c} indeterminate={!c && !a} onChange={() => setC(!c)} /> Select all interfaces
      </label>
    </>
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
      <RadioGroup
        value={val}
        onChange={setVal}
        options={[
          { value: '30', label: '30 seconds' },
          { value: '60', label: '1 minute' },
          { value: '300', label: '5 minutes' },
          { value: '900', label: '15 minutes' },
        ]}
      />
    </div>
  )
}

function SliderDemo() {
  const [val, setVal] = useState(75)
  return (
    <div className="space-y-4">
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
    <div className="section-enter">
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">Forms</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Themed form inputs, selects, checkboxes, toggles, radios, sliders, and filter pills.</p>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInputDemo />
          <DemoCard label="Select, Checkbox, Toggle" description="Selection controls">
            <div className="space-y-5">
              <SelectDemo />
              <div className="space-y-3">
                <CheckboxDemo />
              </div>
              <ToggleDemo />
            </div>
          </DemoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DemoCard label="RadioGroup" description="Horizontal and vertical layouts">
            <div className="space-y-6">
              <RadioGroupDemo />
            </div>
          </DemoCard>
          <DemoCard label="Slider" description="Range input with labels and value display">
            <SliderDemo />
          </DemoCard>
        </div>

        <DemoCard label="FilterPill" description="Toggleable filter tags">
          <FilterPillDemo />
        </DemoCard>
      </div>
    </div>
  )
}
