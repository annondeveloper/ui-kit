'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search, Globe, AlertTriangle, BarChart3, Settings,
  Terminal,
} from 'lucide-react'
import {
  StreamingText, TypingIndicator, ConfidenceBar, RealtimeValue,
  LiveFeed, CommandBar,
} from '../../../src/index'
import type { FeedItem, CommandItem } from '../../../src/index'

/* ── Preview card with static code hint ─────────────────── */
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
      <div className="code-snippet font-mono">
        <code>{hint}</code>
      </div>
    </figure>
  )
}

function rand(min: number, max: number) { return Math.random() * (max - min) + min }

export default function AIRealtimeSection(): React.JSX.Element {
  const fullText = `Analyzing **datacenter-west** topology...\n\nFound **247 entities** across 12 racks. Detecting LLDP neighbors.\n\nIssues found:\n- Switch \`sw-rack07\` has asymmetric LLDP\n- Host \`esxi-14\` has 2 NICs down\n- BGP session \`core-rtr01\` → \`edge-rtr03\` is **Idle**`
  const [streamText, setStreamText] = useState('')
  const [streaming, setStreaming] = useState(true)
  const streamIdx = useRef(0)

  useEffect(() => {
    if (!streaming) return
    const t = setInterval(() => {
      streamIdx.current += 3
      if (streamIdx.current >= fullText.length) {
        setStreamText(fullText)
        setStreaming(false)
        clearInterval(t)
      } else {
        setStreamText(fullText.slice(0, streamIdx.current))
      }
    }, 30)
    return () => clearInterval(t)
  }, [streaming, fullText])

  const [rtValue, setRtValue] = useState(1247.3)
  const [rtPrev, setRtPrev] = useState(1189.0)
  const [rtUpdated, setRtUpdated] = useState(new Date().toISOString())
  useEffect(() => {
    const t = setInterval(() => {
      setRtPrev(rtValue)
      setRtValue(v => +(v + rand(-80, 120)).toFixed(1))
      setRtUpdated(new Date().toISOString())
    }, 3000)
    return () => clearInterval(t)
  }, [rtValue])

  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    { id: '1', content: 'BGP session established with 198.51.100.1', timestamp: new Date(Date.now() - 60000), type: 'success' },
    { id: '2', content: 'Interface Gi0/24 flap detected on sw-rack07', timestamp: new Date(Date.now() - 30000), type: 'warning' },
    { id: '3', content: 'SNMP poll completed: 247 entities', timestamp: new Date(Date.now() - 10000), type: 'info' },
  ])
  useEffect(() => {
    const msgs = [
      { content: 'CPU threshold exceeded on esxi-14 (94.2%)', type: 'error' as const },
      { content: 'New entity discovered: 10.0.3.47 (Cisco Nexus)', type: 'info' as const },
      { content: 'Alert resolved: Memory normalized on db-01', type: 'success' as const },
    ]
    let idx = 0
    const t = setInterval(() => {
      const msg = msgs[idx % msgs.length]!
      setFeedItems(prev => [{ id: `f-${Date.now()}`, content: msg.content, timestamp: new Date(), type: msg.type }, ...prev].slice(0, 15))
      idx++
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const commandItems = useMemo<CommandItem[]>(() => [
    { id: '1', label: 'Go to Dashboard', icon: BarChart3, shortcut: 'G D', group: 'Navigation', onSelect: () => {} },
    { id: '2', label: 'View Topology', icon: Globe, shortcut: 'G T', group: 'Navigation', onSelect: () => {} },
    { id: '3', label: 'Search Entities', icon: Search, group: 'Actions', onSelect: () => {}, keywords: ['find'] },
    { id: '4', label: 'Open Settings', icon: Settings, shortcut: '⌘ ,', group: 'Actions', onSelect: () => {} },
    { id: '5', label: 'View Alerts', icon: AlertTriangle, group: 'Navigation', onSelect: () => {} },
    { id: '6', label: 'Deploy Agent', icon: Terminal, group: 'Actions', onSelect: () => {} },
  ], [])

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[hsl(var(--text-primary))] tracking-tight">AI & Real-Time</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Components no other library has — for LLM interfaces and live operational data.</p>
      </div>

      <div className="demo-grid">
        <Preview label="StreamingText" hint='<StreamingText text={response} isStreaming={true} />'>
          <div className="text-sm max-h-48 overflow-y-auto">
            <StreamingText text={streamText} isStreaming={streaming} />
          </div>
        </Preview>

        <Preview label="TypingIndicator" hint='<TypingIndicator variant="dots" label="AI thinking" />'>
          <div className="space-y-4">
            <TypingIndicator variant="dots" label="AI is thinking" />
            <TypingIndicator variant="pulse" label="Processing" />
            <TypingIndicator variant="text" label="Analyzing" />
          </div>
        </Preview>

        <Preview label="ConfidenceBar" hint='<ConfidenceBar value={0.87} label="Match" />'>
          <div className="space-y-3">
            <ConfidenceBar value={0.92} label="Entity match" />
            <ConfidenceBar value={0.64} label="Anomaly score" />
            <ConfidenceBar value={0.18} label="False positive" />
          </div>
        </Preview>

        <Preview label="RealtimeValue" hint='<RealtimeValue value={n} connectionState="connected" />'>
          <RealtimeValue
            value={rtValue} label="Throughput"
            format={(v) => `${v.toFixed(0)} req/s`}
            previousValue={rtPrev} lastUpdated={rtUpdated}
            connectionState="connected" size="lg"
          />
        </Preview>

        <Preview label="LiveFeed" hint='<LiveFeed items={events} autoScroll maxVisible={15} />' wide>
          <div className="max-h-52 overflow-hidden">
            <LiveFeed items={feedItems} maxVisible={10} showTimestamps autoScroll />
          </div>
        </Preview>

        <Preview label="CommandBar" hint='<CommandBar items={commands} hotkey="k" />' wide>
          <div className="text-center py-4">
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-2">
              Press <kbd className="px-2 py-0.5 rounded border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-elevated))] text-[11px] font-mono">⌘K</kbd> to open
            </p>
            <CommandBar items={commandItems} />
          </div>
        </Preview>
      </div>
    </>
  )
}
