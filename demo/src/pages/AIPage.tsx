import { useState, useEffect, useCallback, useRef } from 'react'
import { Preview, useInViewTimer } from '../components/Preview.tsx'
import {
  StreamingText, TypingIndicator, ConfidenceBar,
  RealtimeValue, LiveFeed,
  type FeedItem,
} from '@ui/index'

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

export function AIPage() {
  const { text, streaming } = useStreamingDemo()
  const [rtValue, setRtValue] = useState(1247)
  const [rtPrev, setRtPrev] = useState(1200)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    { id: '1', content: 'Interface Gi0/0/1 on core-sw-01 flapped', timestamp: new Date(Date.now() - 30000), type: 'warning' },
    { id: '2', content: 'BGP session with 198.51.100.1 established', timestamp: new Date(Date.now() - 60000), type: 'success' },
    { id: '3', content: 'SNMP collection completed for 47 devices', timestamp: new Date(Date.now() - 120000), type: 'info' },
  ])
  const [confidenceValues, setConfidenceValues] = useState([0, 0, 0])
  const confidenceAnimated = useRef(false)

  const updateRt = useCallback(() => {
    setRtPrev(rtValue)
    setRtValue(p => p + Math.floor(Math.random() * 100 - 30))
  }, [rtValue])

  const rtRef = useInViewTimer(2500, updateRt)

  // Animate confidence bars on viewport enter
  const confRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = confRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !confidenceAnimated.current) {
        confidenceAnimated.current = true
        setTimeout(() => setConfidenceValues([0.92, 0.65, 0.23]), 200)
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-1">AI & Realtime</h1>
        <p className="text-sm text-[hsl(var(--text-secondary))]">5 components for streaming, live data, and AI interactions</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger">
        <Preview label="StreamingText" description="AI-style text streaming with cursor" glow="ai" code={`<StreamingText\n  text={response}\n  isStreaming={true}\n  showCursor\n/>`}>
          <div className="h-[160px] overflow-y-auto">
            <StreamingText text={text} isStreaming={streaming} showCursor />
          </div>
        </Preview>

        <Preview label="TypingIndicator" description="Three animation variants" glow="ai" code={`<TypingIndicator variant="dots" label="AI is thinking" />\n<TypingIndicator variant="pulse" />\n<TypingIndicator variant="text" label="Generating" />`}>
          <div className="flex flex-col gap-4">
            <div><TypingIndicator variant="dots" label="AI is thinking" /></div>
            <div><TypingIndicator variant="pulse" label="Processing query" /></div>
            <div><TypingIndicator variant="text" label="Generating response" /></div>
          </div>
        </Preview>

        <Preview label="ConfidenceBar" description="Animated fill on viewport enter" glow="ai" code={`<ConfidenceBar value={0.92} label="Entity Match" />\n<ConfidenceBar value={0.65} label="Vendor ID" />`}>
          <div ref={confRef} className="space-y-3">
            <ConfidenceBar value={confidenceValues[0]} label="Entity Match" />
            <ConfidenceBar value={confidenceValues[1]} label="Vendor Classification" />
            <ConfidenceBar value={confidenceValues[2]} label="Location Inference" />
          </div>
        </Preview>

        <Preview label="RealtimeValue" description="Live value with freshness tracking" glow="realtime" code={`<RealtimeValue\n  value={1247}\n  label="Events/sec"\n  previousValue={1200}\n  connectionState="connected"\n/>`}>
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

        <Preview label="LiveFeed" description="Real-time event stream (new events every 4s)" glow="realtime" wide code={`<LiveFeed\n  items={events}\n  showTimestamps\n  autoScroll\n/>`}>
          <div ref={feedRef} className="h-[220px]">
            <LiveFeed items={feedItems} showTimestamps autoScroll maxVisible={10} />
          </div>
        </Preview>
      </div>
    </div>
  )
}
export default AIPage
