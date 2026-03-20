import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { Icon } from '@ui/core/icons/icon'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { MetricCard } from '@ui/domain/metric-card'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '4rem 0 3rem', maxWidth: 700, margin: '0 auto' }}>
        <Badge variant="primary" size="md" style={{ marginBottom: '1rem' }}>v2.0 -- Zero Dependencies</Badge>
        <h1 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: '1rem',
          textWrap: 'balance',
        }}>
          The component library<br />that needs nothing else
        </h1>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: 500,
          margin: '0 auto 2rem',
          textWrap: 'pretty',
        }}>
          62 components. Physics animations. OKLCH colors. Aurora Fluid design.
          Built from scratch with zero external dependencies.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" icon={<Icon name="zap" size="sm" />}>Get Started</Button>
          <Button variant="secondary" size="lg" icon={<Icon name="code" size="sm" />}>View Source</Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem',
      }}>
        <Card variant="default" padding="md">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Components</div>
          <AnimatedCounter value={62} style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }} />
        </Card>
        <Card variant="default" padding="md">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Tests Passing</div>
          <AnimatedCounter value={2418} style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }} />
        </Card>
        <Card variant="default" padding="md">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Bundle Size (gzip)</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>100 KB</div>
        </Card>
        <Card variant="default" padding="md">
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Dependencies</div>
          <AnimatedCounter value={0} style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }} />
        </Card>
      </div>

      {/* Live Dashboard Preview */}
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>Live Dashboard Preview</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem',
      }}>
        <MetricCard title="CPU Usage" value="87.4%" trend="up" status="warning" sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]} />
        <MetricCard title="Memory" value="62.1%" trend="flat" status="ok" sparkline={[58, 60, 59, 61, 62, 61, 63, 62, 62]} />
        <MetricCard title="Requests/s" value="1,247" trend="up" status="ok" sparkline={[800, 920, 1050, 1100, 1180, 1200, 1247]} />
        <MetricCard title="Error Rate" value="0.03%" trend="down" status="ok" sparkline={[0.12, 0.08, 0.06, 0.05, 0.04, 0.03]} />
      </div>

      {/* Feature grid */}
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>What Makes This Different</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
      }}>
        {[
          { icon: 'zap' as const, title: 'Zero Dependencies', desc: 'Only react and react-dom. Everything else built from scratch.' },
          { icon: 'activity' as const, title: 'Physics Animations', desc: 'Real spring solver (RK4). Not approximated curves.' },
          { icon: 'eye' as const, title: 'Aurora Fluid Design', desc: 'Deep atmospheric surfaces, ambient glows, OKLCH colors.' },
          { icon: 'terminal' as const, title: 'AI-Ready', desc: 'StreamingText, LiveFeed, RealtimeValue — built for AI interfaces.' },
          { icon: 'check-circle' as const, title: '2,418 Tests', desc: 'Every component tested: render, interaction, a11y, motion.' },
          { icon: 'settings' as const, title: 'Motion Control', desc: '4 levels: none, subtle, expressive, cinematic. User chooses.' },
        ].map(f => (
          <Card key={f.title} variant="default" padding="md" interactive>
            <Icon name={f.icon} size="lg" style={{ color: 'var(--brand)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{f.title}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
