import { useState, useEffect, useCallback, useRef } from 'react'
import { Preview, useInViewTimer } from '../components/Preview.tsx'
import {
  StreamingText, TypingIndicator, ConfidenceBar,
  RealtimeValue, LiveFeed, CommandBar,
  type FeedItem, type CommandItem,
} from '@ui/index'
import { Search, Zap, Settings, HelpCircle } from 'lucide-react'

const AI_TEXT = `Analyzing **network topology** for anomalies...

Found \`3 degraded links\` across the backbone. The primary issue appears to be on the **core-sw-01 -> dist-sw-03** segment where packet loss exceeds 2.1%.

Recommendation: Check the fiber patch panel in **Rack A-14** and run \`show interfaces counters errors\` on both endpoints.`

function useStreamingDemo() {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(true)
  const idx = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      if (idx.current < AI_TEXT.length) {
        const chunk = Math.min(3, AI_TEXT.length - idx.current)
        setText(AI_TEXT.slice(0, idx.current + chunk))
        idx.current += chunk
      } else {
        setStreaming(false)
        clearInterval(id)
        setTimeout(() => { idx.current = 0; setText(''); setStreaming(true) }, 5000)
      }
    }, 30)
    return () => clearInterval(id)
  }, [streaming])

  return { text, streaming }
}

const commands: CommandItem[] = [
  { id: '1', label: 'Search devices', icon: Search, group: 'Navigation', onSelect: () => {} },
  { id: '2', label: 'Quick actions', icon: Zap, group: 'Navigation', onSelect: () => {} },
  { id: '3', label: 'Settings', icon: Settings, group: 'Config', onSelect: () => {} },
  { id: '4', label: 'Help & Support', icon: HelpCircle, group: 'Config', onSelect: () => {} },
]

export function AIPage() {
  const { text, streaming } = useStreamingDemo()
  const [rtValue, setRtValue] = useState(1247)
  const [rtPrev, setRtPrev] = useState(1200)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    { id: '1', content: 'Interface Gi0/0/1 on core-sw-01 flapped', timestamp: new Date(Date.now() - 30000), type: 'warning' },
    { id: '2', content: 'BGP session with 198.51.100.1 established', timestamp: new Date(Date.now() - 60000), type: 'success' },
    { id: '3', content: 'SNMP collection completed for 47 devices', timestamp: new Date(Date.now() - 120000), type: 'info' },
  ])

  const updateRt = useCallback(() => {
    setRtPrev(rtValue)
    setRtValue(p => p + Math.floor(Math.random() * 100 - 30))
  }, [rtValue])

  const rtRef = useInViewTimer(2000, updateRt)

  const feedEvents = [
    { content: 'CPU threshold exceeded on edge-fw-02 (92%)', type: 'error' as const },
    { content: 'New device discovered: 10.0.5.42 (Cisco IOS-XE)', type: 'info' as const },
    { content: 'Alert resolved: Memory utilization on db-srv-01', type: 'success' as const },
    { content: 'OSPF neighbor 10.0.0.3 changed state to DOWN', type: 'warning' as const },
    { content: 'Backup completed for running-config on 12 devices', type: 'success' as const },
  ]
  const feedIdx = useRef(0)

  const addFeedItem = useCallback(() => {
    const ev = feedEvents[feedIdx.current % feedEvents.length]
    feedIdx.current++
    setFeedItems(prev => [{
      id: crypto.randomUUID(),
      content: ev.content,
      timestamp: new Date(),
      type: ev.type,
    }, ...prev].slice(0, 20))
  }, [])

  const feedRef = useInViewTimer(4000, addFeedItem)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">AI & Realtime</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">6 components for streaming, live data, and AI-powered interfaces</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="StreamingText" description="AI-style text streaming with cursor" glow="ai" code={`<StreamingText\n  text={response}\n  isStreaming={true}\n  showCursor\n/>`}>
          <div className="h-[160px] overflow-y-auto">
            <StreamingText text={text} isStreaming={streaming} showCursor />
          </div>
        </Preview>

        <Preview label="TypingIndicator" description="Three animation variants" glow="ai" code={`<TypingIndicator variant="dots" label="AI is thinking" />\n<TypingIndicator variant="pulse" />\n<TypingIndicator variant="text" label="Generating" />`}>
          <div className="space-y-4">
            <TypingIndicator variant="dots" label="AI is thinking" />
            <TypingIndicator variant="pulse" label="Processing query" />
            <TypingIndicator variant="text" label="Generating response" />
          </div>
        </Preview>

        <Preview label="ConfidenceBar" description="Threshold-colored probability bars" glow="ai" code={`<ConfidenceBar value={0.92} label="Entity Match" />\n<ConfidenceBar value={0.65} label="Vendor ID" />\n<ConfidenceBar value={0.23} label="Location" />`}>
          <div className="space-y-3">
            <ConfidenceBar value={0.92} label="Entity Match" />
            <ConfidenceBar value={0.65} label="Vendor Classification" />
            <ConfidenceBar value={0.23} label="Location Inference" />
          </div>
        </Preview>

        <Preview label="RealtimeValue" description="Live value with freshness tracking" glow="realtime" code={`<RealtimeValue\n  value={1247}\n  label="Events/sec"\n  previousValue={1200}\n  connectionState="connected"\n  lastUpdated={new Date()}\n/>`}>
          <div ref={rtRef}>
            <RealtimeValue
              value={rtValue}
              label="Events/sec"
              previousValue={rtPrev}
              connectionState="connected"
              lastUpdated={new Date()}
              size="lg"
            />
          </div>
        </Preview>

        <Preview label="LiveFeed" description="Real-time event stream" glow="realtime" wide code={`<LiveFeed\n  items={events}\n  showTimestamps\n  autoScroll\n/>`}>
          <div ref={feedRef} className="h-[220px]">
            <LiveFeed items={feedItems} showTimestamps autoScroll maxVisible={10} />
          </div>
        </Preview>

        <Preview label="CommandBar" description="Cmd+K command palette" glow="ai" code={`<CommandBar\n  items={commands}\n  placeholder="Search commands..."\n  hotkey="k"\n/>`}>
          <div className="text-center py-4">
            <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">Press <kbd className="px-1.5 py-0.5 rounded border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-base))] text-xs font-mono">Cmd+K</kbd> to open</p>
            <CommandBar items={commands} placeholder="Search commands..." />
          </div>
        </Preview>
      </div>
    </div>
  )
}
