'use client'

import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { UIProvider } from '@ui/components/ui-provider'
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Card } from '@ui/components/card'
import { Alert } from '@ui/components/alert'
import { Progress } from '@ui/components/progress'
import { Skeleton } from '@ui/components/skeleton'
import { Avatar } from '@ui/components/avatar'
import { StatusBadge } from '@ui/components/status-badge'
import { Divider } from '@ui/components/divider'
import { Checkbox } from '@ui/components/checkbox'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Rating } from '@ui/components/rating'
import { Chip } from '@ui/components/chip'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

const embedStyles = css`
  @layer demo {
    .embed-root {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
      background: var(--bg-base);
    }
  }
`

const componentMap: Record<string, React.ReactNode> = {
  button: <Button variant="primary">Click Me</Button>,
  badge: (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Error</Badge>
    </div>
  ),
  card: (
    <Card padding="md" style={{ maxWidth: '300px' }}>
      <strong>Aurora Fluid Card</strong>
      <p style={{ color: 'var(--text-secondary)', marginBlockStart: '0.5rem', fontSize: 'var(--text-sm)' }}>
        Deep atmospheric surfaces with ambient glows.
      </p>
    </Card>
  ),
  alert: <Alert variant="info" title="Embedded Alert">This component is rendered in isolation.</Alert>,
  progress: <Progress value={72} max={100} label="72% complete" />,
  skeleton: (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="60%" height="1rem" />
    </div>
  ),
  avatar: <Avatar name="Aurora User" size="lg" />,
  statusbadge: (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <StatusBadge status="ok" label="Healthy" pulse />
      <StatusBadge status="warning" label="Degraded" />
      <StatusBadge status="critical" label="Down" />
    </div>
  ),
  divider: <div style={{ width: '200px' }}><Divider /></div>,
  checkbox: <Checkbox label="Accept terms" defaultChecked />,
  toggleswitch: <ToggleSwitch label="Enable feature" defaultChecked />,
  rating: <Rating defaultValue={4} max={5} />,
  chip: (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Chip>React</Chip>
      <Chip>TypeScript</Chip>
      <Chip>OKLCH</Chip>
    </div>
  ),
}

export default function EmbedComponentPage() {
  useStyles('embed-component', embedStyles)
  const { component } = useParams<{ component: string }>()
  const [searchParams] = useSearchParams()
  const theme = searchParams.get('theme') || 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', theme)
  }, [theme])

  const key = component?.toLowerCase() || ''
  const preview = componentMap[key]

  return (
    <UIProvider>
      <div className="embed-root">
        {preview || (
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Component "{component}" not found for embedding.
          </div>
        )}
      </div>
    </UIProvider>
  )
}
