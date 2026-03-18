'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Search, Globe, AlertTriangle, BarChart3, Settings, Server, Wifi,
  Download, Sun, Terminal, RefreshCw,
} from 'lucide-react'
import {
  StreamingText, TypingIndicator, ConfidenceBar, RealtimeValue,
  LiveFeed, CommandBar, Button, Toaster, toast,
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '../../../src/index'
import type { FeedItem, CommandItem } from '../../../src/index'

function rand(min: number, max: number) { return Math.random() * (max - min) + min }
function randInt(min: number, max: number) { return Math.floor(rand(min, max)) }

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

function SectionHeader() {
  return (
    <>
      <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">AI & Real-Time</h2>
      <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">Components purpose-built for AI interfaces, live data, and command-line workflows. No other library has these.</p>
    </>
  )
}

function StreamingTextDemo() {
  const fullText = `Analyzing network topology for **datacenter-west**...

Found **247 entities** across 12 racks. Detecting LLDP neighbors and building adjacency graph.

Identified 3 potential issues:
- Switch \`sw-rack07\` has asymmetric LLDP: sees \`fw-core01\` but not vice versa
- Host \`esxi-14\` reports 2 NICs down on \`vmnic3\` and \`vmnic4\`
- BGP session between \`core-rtr01\` and \`edge-rtr03\` is in **Idle** state

Recommendations:
1. Check cable between sw-rack07 port Gi0/24 and fw-core01 port eth1/3
2. Verify NIC firmware on esxi-14 (current: 20.5.13, available: 21.1.2)
3. Review BGP config for neighbor \`203.0.113.5\` on core-rtr01`

  const [displayed, setDisplayed] = useState('')
  const [isStreaming, setIsStreaming] = useState(true)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => {
      if (indexRef.current < fullText.length) {
        const chunkSize = randInt(2, 8)
        indexRef.current = Math.min(indexRef.current + chunkSize, fullText.length)
        setDisplayed(fullText.slice(0, indexRef.current))
      } else {
        setIsStreaming(false)
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [isStreaming, fullText])

  const handleRestart = useCallback(() => {
    indexRef.current = 0
    setDisplayed('')
    setIsStreaming(true)
  }, [])

  return (
    <DemoCard label="StreamingText" description="AI response streaming with markdown formatting, blinking cursor, and copy-on-complete">
      <div className="rounded-xl bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-subtle))] p-4 max-h-[300px] overflow-y-auto">
        <StreamingText text={displayed} isStreaming={isStreaming} />
      </div>
      {!isStreaming && (
        <Button size="sm" variant="outline" onClick={handleRestart} className="mt-3">
          <RefreshCw className="h-3.5 w-3.5" /> Restart
        </Button>
      )}
    </DemoCard>
  )
}

function RealtimeValueDemo() {
  const [val, setVal] = useState(1247)
  const [prev, setPrev] = useState(1230)

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(val)
      setVal((v) => Math.max(0, v + randInt(-50, 60)))
    }, 2000)
    return () => clearInterval(id)
  })

  return (
    <DemoCard label="RealtimeValue" description="Live metric with animated transitions, freshness tracking, and delta display">
      <div className="space-y-6">
        <RealtimeValue value={val} previousValue={prev} label="Requests/sec" lastUpdated={new Date().toISOString()} connectionState="connected" size="lg" />
        <RealtimeValue value={42.8} label="Avg Latency (ms)" connectionState="reconnecting" size="md" />
        <RealtimeValue value="N/A" label="Throughput" connectionState="disconnected" size="sm" />
      </div>
    </DemoCard>
  )
}

function LiveFeedDemo() {
  const [items, setItems] = useState<FeedItem[]>(() => {
    const now = Date.now()
    return [
      { id: '1', content: 'SNMP collector completed walk for switch-core01 (1,247 OIDs)', timestamp: new Date(now - 3000), type: 'info' },
      { id: '2', content: 'Alert fired: CPU > 90% on host web-07.prod', timestamp: new Date(now - 8000), type: 'error' },
      { id: '3', content: 'Discovery scan found 2 new candidates in 10.0.5.0/24', timestamp: new Date(now - 15000), type: 'success' },
      { id: '4', content: 'BGP session flap detected on edge-rtr-03 (peer: 203.0.113.5)', timestamp: new Date(now - 22000), type: 'warning' },
      { id: '5', content: 'Syslog: interface GigabitEthernet0/12 changed state to up', timestamp: new Date(now - 30000), type: 'info' },
      { id: '6', content: 'Certificate renewal completed for api-server.internal', timestamp: new Date(now - 45000), type: 'success' },
    ]
  })
  const counterRef = useRef(7)

  useEffect(() => {
    const id = setInterval(() => {
      const messages = [
        { content: `SNMP trap received from switch-rack${randInt(1, 20)}`, type: 'info' as const },
        { content: `Metric batch written: ${randInt(800, 1500)} observations`, type: 'success' as const },
        { content: `High memory usage on worker-${String(randInt(1, 12)).padStart(2, '0')} (${randInt(85, 98)}%)`, type: 'warning' as const },
        { content: `New entity approved: host ${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}.${randInt(1, 254)}`, type: 'info' as const },
      ]
      const msg = messages[randInt(0, messages.length)]!
      setItems((prev) => [{
        id: String(counterRef.current++),
        content: msg.content,
        timestamp: new Date(),
        type: msg.type,
      }, ...prev].slice(0, 30))
    }, 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <DemoCard label="LiveFeed" description="Real-time event feed with auto-scroll, pause/resume, and type-colored borders. New events arrive every 4 seconds.">
      <div className="h-[280px]">
        <LiveFeed items={items} maxVisible={20} />
      </div>
    </DemoCard>
  )
}

function CommandBarDemo() {
  const commands: CommandItem[] = useMemo(() => [
    { id: 'search-entities', label: 'Search Entities', description: 'Find devices, hosts, and services', icon: Search, group: 'Navigation', shortcut: 'Cmd+E', onSelect: () => toast.info('Navigate: Entities'), keywords: ['device', 'host', 'find'] },
    { id: 'topology', label: 'Open Topology Map', icon: Globe, group: 'Navigation', onSelect: () => toast.info('Navigate: Topology') },
    { id: 'alerts', label: 'View Active Alerts', icon: AlertTriangle, group: 'Navigation', shortcut: 'Cmd+A', onSelect: () => toast.info('Navigate: Alerts'), keywords: ['warning', 'critical'] },
    { id: 'dashboard', label: 'Go to Dashboard', icon: BarChart3, group: 'Navigation', onSelect: () => toast.info('Navigate: Dashboard') },
    { id: 'settings', label: 'Open Settings', icon: Settings, group: 'Navigation', shortcut: 'Cmd+,', onSelect: () => toast.info('Navigate: Settings') },
    { id: 'add-device', label: 'Add New Device', description: 'Register a device for monitoring', icon: Server, group: 'Actions', onSelect: () => toast.success('Add device wizard opened') },
    { id: 'run-discovery', label: 'Run Network Discovery', icon: Wifi, group: 'Actions', onSelect: () => toast.success('Discovery scan started') },
    { id: 'export-data', label: 'Export Dashboard Data', icon: Download, group: 'Actions', onSelect: () => toast.info('Exporting...') },
    { id: 'toggle-theme', label: 'Toggle Dark/Light Mode', icon: Sun, group: 'Preferences', onSelect: () => document.documentElement.classList.toggle('light'), keywords: ['dark', 'light', 'theme'] },
    { id: 'help', label: 'Keyboard Shortcuts', icon: Terminal, group: 'Help', shortcut: 'Cmd+/', onSelect: () => toast.info('Shortcuts panel opened') },
  ], [])

  return <CommandBar items={commands} />
}

export default function AIRealtimeSection() {
  return (
    <div className="section-enter">
      <SectionHeader />
      <div className="space-y-8">
        <CommandBarDemo />
        <StreamingTextDemo />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DemoCard label="TypingIndicator" description="Three animation variants">
            <div className="space-y-4">
              <div className="flex items-center gap-3"><TypingIndicator variant="dots" label="AI is thinking" /></div>
              <div className="flex items-center gap-3"><TypingIndicator variant="pulse" label="Processing query" /></div>
              <div className="flex items-center gap-3"><TypingIndicator variant="text" label="Generating response" /></div>
            </div>
          </DemoCard>
          <DemoCard label="ConfidenceBar" description="Probability display with threshold zones">
            <div className="space-y-5">
              <ConfidenceBar value={0.92} label="Entity match" />
              <ConfidenceBar value={0.65} label="Anomaly score" />
              <ConfidenceBar value={0.23} label="False positive" />
            </div>
          </DemoCard>
          <RealtimeValueDemo />
        </div>
        <LiveFeedDemo />
        <DemoCard label="CommandBar" description="Press Cmd+K (or Ctrl+K) to open the universal command palette. 10 sample commands registered.">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Try pressing <kbd className="rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-1.5 py-0.5 text-[10px] font-mono">Cmd+K</kbd> now.
            The command bar supports fuzzy search, keyboard navigation, grouped items, and recent selections.
          </p>
        </DemoCard>
      </div>
    </div>
  )
}
