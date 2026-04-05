'use client'

/**
 * MVP Proof-of-Concept: Adaptive Tier Rendering
 *
 * This page demonstrates bandwidth-adaptive tier selection.
 * UIProvider with `adaptive` prop auto-detects network conditions
 * and adjusts motion level (and eventually component weight tier).
 *
 * Test by:
 * 1. Open Chrome DevTools → Network → throttle to "Slow 3G"
 * 2. Reload page → should detect lite tier (motion 0)
 * 3. Remove throttle → reload → should detect premium (motion 3)
 */

import { useState } from 'react'
import { UIProvider } from '@ui/components/ui-provider'
import { useAdaptiveContext } from '@ui/core/adaptive/adaptive-context'
// detectAdaptiveTier available for manual testing
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { MetricCard } from '@ui/domain/metric-card'
import { PageShell } from '@ui/components/page-shell'
import { PageHeader } from '@ui/components/page-header'
import { StatsGrid } from '@ui/components/stats-grid'
import { SectionHeader } from '@ui/components/section-header'
import { CardGrid } from '@ui/components/card-grid'
import { Accordion } from '@ui/components/accordion'
import { Progress } from '@ui/components/progress'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

const styles = css`
  @layer demo {
    .adaptive-demo__info {
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8125rem;
      line-height: 1.6;
    }

    .adaptive-demo__info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }

    .adaptive-demo__info-label {
      color: var(--text-secondary);
    }

    .adaptive-demo__info-value {
      color: var(--text-primary);
      font-weight: 600;
    }

    .adaptive-demo__tier-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full, 9999px);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .adaptive-demo__tier-badge[data-tier="lite"] {
      background: oklch(40% 0.1 150 / 0.2);
      color: oklch(70% 0.15 150);
    }

    .adaptive-demo__tier-badge[data-tier="standard"] {
      background: oklch(40% 0.1 220 / 0.2);
      color: oklch(70% 0.15 220);
    }

    .adaptive-demo__tier-badge[data-tier="premium"] {
      background: oklch(40% 0.15 280 / 0.2);
      color: oklch(70% 0.2 280);
    }

    .adaptive-demo__controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
  }
`

function AdaptiveInfoPanel() {
  const adaptive = useAdaptiveContext()

  return (
    <div className="adaptive-demo__info">
      <div className="adaptive-demo__info-row">
        <span className="adaptive-demo__info-label">Detected Tier</span>
        <span className="adaptive-demo__tier-badge" data-tier={adaptive.tier}>
          {adaptive.tier === 'premium' ? '✨' : adaptive.tier === 'standard' ? '⚡' : '🪶'}
          {adaptive.tier}
        </span>
      </div>
      <div className="adaptive-demo__info-row">
        <span className="adaptive-demo__info-label">Motion Level</span>
        <span className="adaptive-demo__info-value">{adaptive.motion}</span>
      </div>
      <div className="adaptive-demo__info-row">
        <span className="adaptive-demo__info-label">Confidence</span>
        <span className="adaptive-demo__info-value">{adaptive.confidence}</span>
      </div>
      <div className="adaptive-demo__info-row">
        <span className="adaptive-demo__info-label">Reason</span>
        <span className="adaptive-demo__info-value">{adaptive.reason}</span>
      </div>
      <div className="adaptive-demo__info-row">
        <span className="adaptive-demo__info-label">Adaptive Active</span>
        <span className="adaptive-demo__info-value">{adaptive.isAdaptive ? 'Yes' : 'No'}</span>
      </div>
    </div>
  )
}

function DemoContent() {
  const adaptive = useAdaptiveContext()

  return (
    <PageShell padding="lg" maxWidth="xl">
      <PageHeader
        title="Adaptive Tier Demo"
        description={`Currently rendering at "${adaptive.tier}" tier with motion level ${adaptive.motion}. Throttle your network in DevTools and reload to see the tier change.`}
        actions={
          <Badge color={adaptive.tier === 'premium' ? 'brand' : adaptive.tier === 'standard' ? 'info' : 'neutral'} size="lg">
            {adaptive.tier.toUpperCase()} TIER
          </Badge>
        }
      />

      <SectionHeader title="Detection Result" />
      <AdaptiveInfoPanel />

      <SectionHeader title="Components at Current Tier" />
      <StatsGrid columns={4}>
        <MetricCard title="Users" value="1,284" trend="up" status="ok" />
        <MetricCard title="Active" value="42" status="ok" />
        <MetricCard title="Errors" value="3" status="critical" />
        <MetricCard title="Uptime" value="99.9%" status="ok" />
      </StatsGrid>

      <SectionHeader title="Interactive Elements" />
      <CardGrid columns={2}>
        <Card padding="md">
          <h3 style={{ margin: '0 0 1rem' }}>Buttons</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Card>
        <Card padding="md">
          <h3 style={{ margin: '0 0 1rem' }}>Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Progress value={75} size="sm" />
            <Progress value={45} size="md" color="warning" />
            <Progress value={90} size="lg" color="success" />
          </div>
        </Card>
      </CardGrid>

      <SectionHeader title="Accordion" />
      <Card padding="md">
        <Accordion items={[
          { id: 'what', trigger: 'What is adaptive tier?', content: 'Adaptive tier automatically adjusts the visual richness of components based on your network bandwidth. Fast connections get premium animations and effects. Slow connections get lightweight, instant-loading components.' },
          { id: 'how', trigger: 'How does detection work?', content: 'The system uses the Navigator.connection API (Network Information API) to check effectiveType and downlink speed. It falls back to Performance API timing measurements. Detection happens in <50ms on page load.' },
          { id: 'layout', trigger: 'Does it affect layout?', content: 'No. All tiers share the same HTML structure and box model. Only visual enhancements (animations, glows, shadows) change. The layout is identical across tiers — zero layout shift.' },
        ]} />
      </Card>

      <SectionHeader title="Tabbed Content" />
      <Tabs defaultValue="react">
        <TabPanel tabId="react">React component code would go here</TabPanel>
        <TabPanel tabId="vue">Vue component code would go here</TabPanel>
        <TabPanel tabId="angular">Angular component code would go here</TabPanel>
      </Tabs>

      <SectionHeader title="How to Test" />
      <Card padding="md">
        <ol style={{ margin: 0, paddingInlineStart: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Open Chrome DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Click the throttle dropdown (usually says "No throttling")</li>
          <li>Select <strong>"Slow 3G"</strong></li>
          <li>Reload this page — tier should switch to <strong>lite</strong> (motion 0)</li>
          <li>Remove throttle, reload — should be <strong>premium</strong> (motion 3)</li>
          <li>Select <strong>"Fast 3G"</strong> — should be <strong>standard</strong> (motion 1-2)</li>
        </ol>
      </Card>
    </PageShell>
  )
}

export default function AdaptiveTierDemoPage() {
  useStyles('adaptive-demo', styles)
  const [key, setKey] = useState(0)

  // Allow manual re-detection
  const redetect = () => setKey(k => k + 1)

  return (
    <div>
      <UIProvider adaptive key={key}>
        <DemoContent />
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <Button variant="secondary" onClick={redetect}>
            Re-detect Bandwidth
          </Button>
        </div>
      </UIProvider>
    </div>
  )
}
