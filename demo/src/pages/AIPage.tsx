import { useState, useEffect, useCallback, useRef } from 'react'
import { Preview } from '../components/Preview'
import { StreamingText } from '@ui/domain/streaming-text'
import { TypingIndicator } from '@ui/domain/typing-indicator'
import { ConfidenceBar } from '@ui/domain/confidence-bar'
import { LiveFeed } from '@ui/domain/live-feed'
import { RealtimeValue } from '@ui/domain/realtime-value'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Avatar } from '@ui/components/avatar'
import type { FeedItem } from '@ui/domain/live-feed'

const streamingParagraph = `The Aurora Fluid design system represents a new paradigm in component library design. By combining perceptually uniform OKLCH colors with physics-based spring animations, we achieve a level of visual fidelity that was previously only possible with hand-crafted animations. Every transition is governed by real differential equations, not bezier approximations. The result is interfaces that feel alive — responsive, natural, and deeply satisfying to interact with.`

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '1rem',
}

export default function AIPage() {
  const [streamKey, setStreamKey] = useState(0)
  const [streamText, setStreamText] = useState('')
  const [streaming, setStreaming] = useState(true)
  const charIndex = useRef(0)

  // Simulate streaming text character by character
  useEffect(() => {
    charIndex.current = 0
    setStreamText('')
    setStreaming(true)
    const interval = setInterval(() => {
      if (charIndex.current < streamingParagraph.length) {
        setStreamText(streamingParagraph.slice(0, charIndex.current + 1))
        charIndex.current++
      } else {
        setStreaming(false)
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [streamKey])

  // LiveFeed items
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => [
    { id: '1', content: 'User authenticated: alice@example.com', timestamp: Date.now() - 5000, type: 'info' },
    { id: '2', content: 'API request: GET /api/v2/metrics', timestamp: Date.now() - 3000, type: 'info' },
    { id: '3', content: 'Cache miss: key=user:1234:profile', timestamp: Date.now() - 1000, type: 'warning' },
  ])
  const feedCounter = useRef(4)

  const addFeedItem = useCallback(() => {
    const messages = [
      'WebSocket connection established',
      'Model inference completed: 142ms',
      'Rate limit warning: 450/500 requests',
      'New deployment detected: v2.4.2',
      'Database query: 12ms (3 rows)',
      'Background job completed: email-digest',
      'Error: upstream timeout after 5000ms',
      'Token refresh: session extended 30min',
    ]
    const types = ['info', 'info', 'warning', 'info', 'info', 'info', 'error', 'info']
    const i = Math.floor(Math.random() * messages.length)
    const id = String(feedCounter.current++)
    setFeedItems(prev => [...prev, {
      id,
      content: messages[i],
      timestamp: Date.now(),
      type: types[i],
    }])
  }, [])

  // RealtimeValue
  const [rtValue, setRtValue] = useState(1247)
  const [rtPrev, setRtPrev] = useState(1200)

  const changeRtValue = useCallback(() => {
    setRtPrev(rtValue)
    setRtValue(prev => prev + Math.floor(Math.random() * 200) - 50)
  }, [rtValue])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>AI & Realtime</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Components designed for AI interfaces and real-time data streams</p>
      </div>

      <div style={grid}>
        {/* StreamingText */}
        <Preview label="StreamingText" description="Simulated character-by-character streaming" wide>
          <div style={{ marginBottom: '0.75rem' }}>
            <StreamingText
              text={streamText}
              streaming={streaming}
              showCursor={streaming}
            />
          </div>
          <Button size="sm" variant="secondary" onClick={() => setStreamKey(k => k + 1)}>
            Restart Stream
          </Button>
        </Preview>

        {/* TypingIndicator */}
        <Preview label="TypingIndicator" description="Chat-style typing animation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TypingIndicator label="Claude is thinking..." />
            <TypingIndicator
              avatar={<Avatar name="Claude" size="sm" />}
              label="Generating response..."
              size="md"
            />
          </div>
        </Preview>

        {/* ConfidenceBar */}
        <Preview label="ConfidenceBar" description="Model confidence visualization">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ConfidenceBar value={0.95} label="Intent: book_flight" showValue size="md" />
            <ConfidenceBar value={0.72} label="Intent: check_status" showValue size="md" />
            <ConfidenceBar value={0.31} label="Intent: cancel_order" showValue size="md" />
          </div>
        </Preview>

        {/* LiveFeed */}
        <Preview label="LiveFeed" description="Real-time event stream" wide>
          <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.75rem' }}>
            <Button size="sm" variant="primary" onClick={addFeedItem}>Add Event</Button>
            <Button size="sm" variant="ghost" onClick={() => setFeedItems([])}>Clear</Button>
          </div>
          <LiveFeed
            items={feedItems}
            maxItems={10}
            autoScroll
            connectionStatus="connected"
          />
        </Preview>

        {/* RealtimeValue */}
        <Preview label="RealtimeValue" description="Animated value with delta indicator">
          <Card variant="outlined" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Requests/s</div>
                <RealtimeValue
                  value={rtValue}
                  previousValue={rtPrev}
                  showDelta
                  flashOnChange
                  style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}
                />
              </div>
              <Button size="sm" variant="secondary" onClick={changeRtValue}>
                Update Value
              </Button>
            </div>
          </Card>
        </Preview>
      </div>
    </div>
  )
}
