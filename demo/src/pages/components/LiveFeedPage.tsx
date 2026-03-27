'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { LiveFeed, type FeedItem } from '@ui/domain/live-feed'
import { LiveFeed as LiteLiveFeed } from '@ui/lite/live-feed'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.live-feed-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: live-feed-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .live-feed-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .live-feed-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: live-feed-page-aurora 20s linear infinite;
        pointer-events: none;
      }

      @keyframes live-feed-page-aurora {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .live-feed-page__hero::before { animation: none; }
      }

      .live-feed-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .live-feed-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .live-feed-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .live-feed-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .live-feed-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .live-feed-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: live-feed-page-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes live-feed-page-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .live-feed-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .live-feed-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .live-feed-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .live-feed-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .live-feed-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .live-feed-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        min-block-size: 80px;
      }

      .live-feed-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      /* ── Playground ─────────────────────────────────── */

      .live-feed-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .live-feed-page__playground {
          grid-template-columns: 1fr;
        }
        .live-feed-page__playground-controls {
          position: static !important;
        }
      }

      @container live-feed-page (max-width: 680px) {
        .live-feed-page__playground {
          grid-template-columns: 1fr;
        }
        .live-feed-page__playground-controls {
          position: static !important;
        }
      }

      .live-feed-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .live-feed-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        padding: 1rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .live-feed-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .live-feed-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .live-feed-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .live-feed-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .live-feed-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .live-feed-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .live-feed-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .live-feed-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .live-feed-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .live-feed-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .live-feed-page__code-tabs {
        margin-block-start: 1rem;
      }

      .live-feed-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .live-feed-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .live-feed-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .live-feed-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .live-feed-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .live-feed-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .live-feed-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .live-feed-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .live-feed-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .live-feed-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .live-feed-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      /* ── Status indicators ──────────────────────────── */

      .live-feed-page__status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
      }

      .live-feed-page__status-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.25rem 0.75rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-base);
      }

      .live-feed-page__status-dot {
        display: block;
        inline-size: 10px;
        block-size: 10px;
        border-radius: 50%;
      }

      .live-feed-page__status-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }

      /* ── Size breakdown ─────────────────────────────── */

      .live-feed-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .live-feed-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .live-feed-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .live-feed-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .live-feed-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .live-feed-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      .live-feed-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .live-feed-page__hero {
          padding: 2rem 1.25rem;
        }
        .live-feed-page__title {
          font-size: 1.75rem;
        }
        .live-feed-page__playground {
          grid-template-columns: 1fr;
        }
        .live-feed-page__tiers {
          grid-template-columns: 1fr;
        }
        .live-feed-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .live-feed-page__hero {
          padding: 1.5rem 1rem;
        }
        .live-feed-page__title {
          font-size: 1.5rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }
        .live-feed-page__title {
          font-size: 4rem;
        }
      }

      /* ── Scrollbar ──────────────────────────────────── */

      .live-feed-page__import-code,
      .live-feed-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const liveFeedProps: PropDef[] = [
  { name: 'items', type: 'FeedItem[]', required: true, description: 'Array of feed items to display. New items animate in.' },
  { name: 'maxItems', type: 'number', default: '50', description: 'Maximum items to display. Oldest items are truncated.' },
  { name: 'autoScroll', type: 'boolean', default: 'true', description: 'Automatically scroll to bottom when new items arrive.' },
  { name: 'paused', type: 'boolean', description: 'Pause auto-scrolling. Shows a paused badge in the header.' },
  { name: 'onPause', type: '() => void', description: 'Callback when the feed is paused.' },
  { name: 'onResume', type: '() => void', description: 'Callback when the feed is resumed.' },
  { name: 'connectionStatus', type: "'connected' | 'reconnecting' | 'offline'", description: 'Connection indicator shown in the header with colored status dot.' },
  { name: 'height', type: 'string', description: 'Fixed height for the scrollable area (e.g., "400px").' },
  { name: 'emptyMessage', type: 'ReactNode', default: "'No events'", description: 'Content shown when items array is empty.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls flash animation and scroll behavior.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name merged with the component class.' },
]

const feedItemProps: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the feed item.' },
  { name: 'content', type: 'ReactNode', required: true, description: 'Content to display for this item.' },
  { name: 'timestamp', type: 'number | Date', required: true, description: 'Timestamp shown as formatted time.' },
  { name: 'type', type: 'string', description: 'Optional type identifier for custom styling via data-type attribute.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'reconnecting' | 'offline'

const CONNECTION_STATUSES: ConnectionStatus[] = ['connected', 'reconnecting', 'offline']

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { LiveFeed } from '@annondeveloper/ui-kit/lite'",
  standard: "import { LiveFeed } from '@annondeveloper/ui-kit'",
  premium: "import { LiveFeed } from '@annondeveloper/ui-kit/premium'",
}

const EVENT_MESSAGES = [
  'User john@example.com signed in',
  'Deployment #847 completed successfully',
  'Database backup finished (12.4 GB)',
  'Alert: CPU usage exceeded 90% on web-03',
  'New order #1234 placed ($299.99)',
  'SSL certificate renewed for api.example.com',
  'Cache cleared for /api/v2/products',
  'User admin@company.io updated settings',
  'Webhook delivered to https://hooks.slack.com',
  'Payment processed: $149.00 via Stripe',
  'Container web-frontend scaled to 4 replicas',
  'Error: Connection timeout to redis-primary',
  'Cron job cleanup-old-sessions completed',
  'New team member alice@company.io invited',
  'Rate limit triggered for IP 192.168.1.42',
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="live-feed-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="live-feed-page__control-group">
      <span className="live-feed-page__control-label">{label}</span>
      <div className="live-feed-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`live-feed-page__option-btn${opt === value ? ' live-feed-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="live-feed-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  connectionStatus: ConnectionStatus | '',
  paused: boolean,
  autoScroll: boolean,
  maxItems: number,
  motion: number,
  height: string,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    return `${importStr}\n\nconst items = [\n  { id: '1', content: 'User signed in', timestamp: Date.now() },\n  { id: '2', content: 'Order placed', timestamp: Date.now() },\n]\n\n<LiveFeed\n  items={items}\n  maxHeight="${height}"\n/>`
  }

  const props: string[] = ['  items={items}']
  if (maxItems !== 50) props.push(`  maxItems={${maxItems}}`)
  if (!autoScroll) props.push('  autoScroll={false}')
  if (paused) props.push('  paused')
  if (connectionStatus) props.push(`  connectionStatus="${connectionStatus}"`)
  if (height !== '300px') props.push(`  height="${height}"`)
  if (motion !== 3) props.push(`  motion={${motion}}`)

  return `${importStr}\nimport type { FeedItem } from '@annondeveloper/ui-kit'\n\nconst [items, setItems] = useState<FeedItem[]>([])\n\n// Add new items from your data source\nuseEffect(() => {\n  const ws = new WebSocket('wss://api.example.com/events')\n  ws.onmessage = (e) => {\n    const event = JSON.parse(e.data)\n    setItems(prev => [...prev, {\n      id: event.id,\n      content: event.message,\n      timestamp: event.timestamp,\n      type: event.level,\n    }])\n  }\n  return () => ws.close()\n}, [])\n\n<LiveFeed\n${props.join('\n')}\n/>`
}

function generateHtmlCode(tier: Tier, connectionStatus: ConnectionStatus | '', height: string): string {
  if (tier === 'lite') {
    return `<!-- LiveFeed — Lite tier -->\n<div class="ui-lite-live-feed" style="max-height: ${height}" aria-live="polite">\n  <div class="ui-lite-live-feed__item">\n    <span class="ui-lite-live-feed__time">12:34:56</span>\n    <div class="ui-lite-live-feed__content">User signed in</div>\n  </div>\n</div>`
  }
  const connAttr = connectionStatus ? ` data-connection="${connectionStatus}"` : ''
  return `<!-- LiveFeed — Standard tier -->\n<div class="ui-live-feed"${connAttr} aria-live="polite">\n  ${connectionStatus ? `<div class="ui-live-feed__header">\n    <div class="ui-live-feed__status">\n      <span class="ui-live-feed__status-dot"></span>\n      <span>${connectionStatus}</span>\n    </div>\n  </div>\n  ` : ''}<div class="ui-live-feed__scroll" style="block-size: ${height}">\n    <div class="ui-live-feed__list">\n      <div class="ui-live-feed__item">\n        <div class="ui-live-feed__item-content">Event message here</div>\n        <span class="ui-live-feed__timestamp">12:34:56</span>\n      </div>\n    </div>\n  </div>\n</div>`
}

function generateVueCode(tier: Tier, connectionStatus: ConnectionStatus | ''): string {
  if (tier === 'lite') {
    return `<template>\n  <LiveFeed :items="items" max-height="300px" />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { LiveFeed } from '@annondeveloper/ui-kit/lite'\n\nconst items = ref([\n  { id: '1', content: 'User signed in', timestamp: Date.now() },\n])\n</script>`
  }
  const connProp = connectionStatus ? `\n    connection-status="${connectionStatus}"` : ''
  return `<template>\n  <LiveFeed\n    :items="items"${connProp}\n    height="300px"\n  />\n</template>\n\n<script setup>\nimport { ref } from 'vue'\nimport { LiveFeed } from '@annondeveloper/ui-kit'\n\nconst items = ref([])\n</script>`
}

function generateAngularCode(tier: Tier, connectionStatus: ConnectionStatus | ''): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->\n<div class="ui-lite-live-feed" style="max-height: 300px" aria-live="polite">\n  <div *ngFor="let item of items" class="ui-lite-live-feed__item">\n    <span class="ui-lite-live-feed__time">{{ formatTime(item.timestamp) }}</span>\n    <div class="ui-lite-live-feed__content">{{ item.content }}</div>\n  </div>\n</div>\n\n@import '@annondeveloper/ui-kit/lite/styles.css';`
  }
  const connAttr = connectionStatus ? ` data-connection="${connectionStatus}"` : ''
  return `<!-- Angular — CSS class approach -->\n<div class="ui-live-feed"${connAttr} aria-live="polite">\n  <div class="ui-live-feed__scroll" style="block-size: 300px">\n    <div class="ui-live-feed__list">\n      <div *ngFor="let item of items" class="ui-live-feed__item">\n        <div class="ui-live-feed__item-content">{{ item.content }}</div>\n        <span class="ui-live-feed__timestamp">{{ formatTime(item.timestamp) }}</span>\n      </div>\n    </div>\n  </div>\n</div>\n\n@import '@annondeveloper/ui-kit/css/components/live-feed.css';`
}

function generateSvelteCode(tier: Tier, connectionStatus: ConnectionStatus | ''): string {
  if (tier === 'lite') {
    return `<script>\n  import { LiveFeed } from '@annondeveloper/ui-kit/lite';\n  let items = [];\n</script>\n\n<LiveFeed {items} maxHeight="300px" />`
  }
  const connProp = connectionStatus ? `\n  connectionStatus="${connectionStatus}"` : ''
  return `<script>\n  import { LiveFeed } from '@annondeveloper/ui-kit';\n  let items = [];\n</script>\n\n<LiveFeed\n  {items}${connProp}\n  height="300px"\n/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier

  const [items, setItems] = useState<FeedItem[]>(() => {
    const now = Date.now()
    return Array.from({ length: 5 }, (_, i) => ({
      id: `initial-${i}`,
      content: EVENT_MESSAGES[i % EVENT_MESSAGES.length],
      timestamp: now - (5 - i) * 3000,
      type: i === 3 ? 'error' : 'info',
    }))
  })

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected')
  const [paused, setPaused] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [maxItems, setMaxItems] = useState(50)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [height, setHeight] = useState('300px')
  const [streaming, setStreaming] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const nextIdRef = useRef(100)

  // Simulate streaming events
  useEffect(() => {
    if (!streaming) return
    const interval = setInterval(() => {
      const id = `stream-${nextIdRef.current++}`
      const msg = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)]
      setItems(prev => [...prev, {
        id,
        content: msg,
        timestamp: Date.now(),
        type: msg.includes('Error') || msg.includes('Alert') ? 'error' : 'info',
      }])
    }, 1500)
    return () => clearInterval(interval)
  }, [streaming])

  const addEvent = useCallback(() => {
    const id = `manual-${nextIdRef.current++}`
    const msg = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)]
    setItems(prev => [...prev, { id, content: msg, timestamp: Date.now() }])
  }, [])

  const clearEvents = useCallback(() => setItems([]), [])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const reactCode = useMemo(() => generateReactCode(tier, connectionStatus, paused, autoScroll, maxItems, motion, height), [tier, connectionStatus, paused, autoScroll, maxItems, motion, height])
  const htmlCode = useMemo(() => generateHtmlCode(tier, connectionStatus, height), [tier, connectionStatus, height])
  const vueCode = useMemo(() => generateVueCode(tier, connectionStatus), [tier, connectionStatus])
  const angularCode = useMemo(() => generateAngularCode(tier, connectionStatus), [tier, connectionStatus])
  const svelteCode = useMemo(() => generateSvelteCode(tier, connectionStatus), [tier, connectionStatus])

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  const liteItems = useMemo(() => items.map(i => ({
    id: i.id,
    content: i.content,
    timestamp: i.timestamp,
  })), [items])

  return (
    <section className="live-feed-page__section" id="playground">
      <h2 className="live-feed-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="live-feed-page__section-desc">
        Add events manually or start streaming to see the live feed in action. Toggle connection status and pause state.
      </p>

      <div className="live-feed-page__playground">
        <div className="live-feed-page__playground-preview">
          <div className="live-feed-page__playground-result">
            <div style={{ position: 'relative', zIndex: 1, inlineSize: '100%' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBlockEnd: '0.75rem', flexWrap: 'wrap' }}>
                <Button size="xs" variant="primary" onClick={addEvent} icon={<Icon name="plus" size="sm" />}>
                  Add Event
                </Button>
                <Button size="xs" variant={streaming ? 'danger' : 'secondary'} onClick={() => setStreaming(s => !s)}>
                  {streaming ? 'Stop Stream' : 'Start Stream'}
                </Button>
                <Button size="xs" variant="ghost" onClick={clearEvents}>
                  Clear
                </Button>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', alignSelf: 'center', marginInlineStart: 'auto' }}>
                  {items.length} events
                </span>
              </div>

              {tier === 'lite' ? (
                <LiteLiveFeed
                  items={liteItems}
                  maxHeight={height}
                />
              ) : (
                <LiveFeed
                  items={items}
                  maxItems={maxItems}
                  autoScroll={autoScroll}
                  paused={paused}
                  connectionStatus={connectionStatus}
                  height={height}
                  motion={motion}
                />
              )}
            </div>
          </div>

          <div className="live-feed-page__code-tabs">
            <div className="live-feed-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="live-feed-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="live-feed-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Connection"
              options={CONNECTION_STATUSES}
              value={connectionStatus}
              onChange={setConnectionStatus}
            />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="live-feed-page__control-group">
            <span className="live-feed-page__control-label">Options</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {tier !== 'lite' && <Toggle label="Auto-scroll" checked={autoScroll} onChange={setAutoScroll} />}
              {tier !== 'lite' && <Toggle label="Paused" checked={paused} onChange={setPaused} />}
            </div>
          </div>

          {tier !== 'lite' && (
            <OptionGroup
              label="Max Items"
              options={['10', '25', '50', '100'] as const}
              value={String(maxItems)}
              onChange={v => setMaxItems(Number(v))}
            />
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LiveFeedPage() {
  useStyles('live-feed-page', pageStyles)

  const { tier, setTier } = useTier()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = document.querySelectorAll('.live-feed-page__section')
    if (!sections.length) return

    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="live-feed-page" ref={pageRef}>
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="live-feed-page__hero">
        <h1 className="live-feed-page__title">LiveFeed</h1>
        <p className="live-feed-page__desc">
          Real-time event feed with auto-scrolling, connection status indicators, pause control,
          and new-item flash animations. Perfect for activity logs, notifications, and monitoring dashboards.
        </p>
        <div className="live-feed-page__import-row">
          <code className="live-feed-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Connection Status ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="live-feed-page__section" id="connection-status">
          <h2 className="live-feed-page__section-title">
            <a href="#connection-status">Connection Status</a>
          </h2>
          <p className="live-feed-page__section-desc">
            The header displays a colored status dot with label. The reconnecting state pulses
            to indicate an ongoing connection attempt.
          </p>
          <div className="live-feed-page__status-grid">
            <div className="live-feed-page__status-cell">
              <span className="live-feed-page__status-dot" style={{ background: 'oklch(72% 0.19 155)' }} />
              <span className="live-feed-page__status-label">Connected</span>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>Green, static</span>
            </div>
            <div className="live-feed-page__status-cell">
              <span className="live-feed-page__status-dot" style={{ background: 'oklch(80% 0.18 85)', animation: 'live-feed-page-pulse 1.5s ease-in-out infinite' }} />
              <span className="live-feed-page__status-label">Reconnecting</span>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>Amber, pulsing</span>
            </div>
            <div className="live-feed-page__status-cell">
              <span className="live-feed-page__status-dot" style={{ background: 'oklch(62% 0.22 25)' }} />
              <span className="live-feed-page__status-label">Offline</span>
              <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)' }}>Red, static</span>
            </div>
          </div>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<LiveFeed\n  items={items}\n  connectionStatus="connected"  // | 'reconnecting' | 'offline'\n/>`}
              language="typescript"
              showLineNumbers
            />
          </div>
        </section>
      )}

      {/* ── 4. Auto-scroll & Pause ──────────────────────── */}
      {tier !== 'lite' && (
        <section className="live-feed-page__section" id="auto-scroll">
          <h2 className="live-feed-page__section-title">
            <a href="#auto-scroll">Auto-scroll & Pause</a>
          </h2>
          <p className="live-feed-page__section-desc">
            When <code className="live-feed-page__a11y-key">autoScroll</code> is enabled, the feed scrolls to the
            bottom on new items. Set <code className="live-feed-page__a11y-key">paused</code> to freeze scrolling
            while still accumulating items.
          </p>
          <CopyBlock
            code={`const [paused, setPaused] = useState(false)\n\n<LiveFeed\n  items={events}\n  autoScroll={true}\n  paused={paused}\n  onPause={() => setPaused(true)}\n  onResume={() => setPaused(false)}\n/>`}
            language="typescript"
            showLineNumbers
          />
        </section>
      )}

      {/* ── 5. Max Items ───────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="live-feed-page__section" id="max-items">
          <h2 className="live-feed-page__section-title">
            <a href="#max-items">Max Items Truncation</a>
          </h2>
          <p className="live-feed-page__section-desc">
            The <code className="live-feed-page__a11y-key">maxItems</code> prop limits visible items.
            The feed keeps the newest items and discards older ones to prevent unbounded memory growth.
          </p>
          <CopyBlock
            code={`// Only show the latest 100 events\n<LiveFeed items={allEvents} maxItems={100} />\n\n// Show fewer for constrained layouts\n<LiveFeed items={allEvents} maxItems={10} height="200px" />`}
            language="typescript"
            showLineNumbers
          />
        </section>
      )}

      {/* ── 6. Item Types ──────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="live-feed-page__section" id="item-types">
          <h2 className="live-feed-page__section-title">
            <a href="#item-types">Item Types</a>
          </h2>
          <p className="live-feed-page__section-desc">
            Each item can have an optional <code className="live-feed-page__a11y-key">type</code> field
            that gets set as a <code className="live-feed-page__a11y-key">data-type</code> attribute
            on the item element for custom CSS targeting.
          </p>
          <CopyBlock
            code={`const items: FeedItem[] = [\n  { id: '1', content: 'Deploy succeeded', timestamp: Date.now(), type: 'success' },\n  { id: '2', content: 'CPU alert triggered', timestamp: Date.now(), type: 'error' },\n  { id: '3', content: 'User signed in', timestamp: Date.now(), type: 'info' },\n]\n\n/* Custom styles per type */\n.ui-live-feed__item[data-type="error"] {\n  border-inline-start: 3px solid oklch(62% 0.22 25);\n}\n.ui-live-feed__item[data-type="success"] {\n  border-inline-start: 3px solid oklch(72% 0.19 155);\n}`}
            language="typescript"
            showLineNumbers
          />
        </section>
      )}

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="live-feed-page__section" id="tiers">
        <h2 className="live-feed-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="live-feed-page__section-desc">
          LiveFeed ships in three tiers. Premium adds aurora glow effects and spring animations.
        </p>

        <div className="live-feed-page__tiers">
          {/* Lite */}
          <div
            className={`live-feed-page__tier-card${tier === 'lite' ? ' live-feed-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="live-feed-page__tier-header">
              <span className="live-feed-page__tier-name">Lite</span>
              <span className="live-feed-page__tier-size">~0.3 KB</span>
            </div>
            <p className="live-feed-page__tier-desc">
              Static list rendering with timestamps. No auto-scroll, no connection status,
              no pause, no flash animation.
            </p>
            <div className="live-feed-page__tier-import">
              import {'{'} LiveFeed {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="live-feed-page__size-breakdown">
              <div className="live-feed-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.3 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`live-feed-page__tier-card${tier === 'standard' ? ' live-feed-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="live-feed-page__tier-header">
              <span className="live-feed-page__tier-name">Standard</span>
              <span className="live-feed-page__tier-size">~2.2 KB</span>
            </div>
            <p className="live-feed-page__tier-desc">
              Full-featured live feed with auto-scroll, connection status, pause control,
              flash animations, max items truncation, and error boundary.
            </p>
            <div className="live-feed-page__tier-import">
              import {'{'} LiveFeed {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="live-feed-page__size-breakdown">
              <div className="live-feed-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>2.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`live-feed-page__tier-card${tier === 'premium' ? ' live-feed-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="live-feed-page__tier-header">
              <span className="live-feed-page__tier-name">Premium</span>
              <span className="live-feed-page__tier-size">~3-5 KB</span>
            </div>
            <p className="live-feed-page__tier-desc">
              Spring-slide entrance for new items, aurora glow on the newest entry, and shimmer loading state.
            </p>
            <div className="live-feed-page__tier-import">
              import {'{'} LiveFeed {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="live-feed-page__size-breakdown">
              <div className="live-feed-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FeedItem Interface ──────────────────────── */}
      <section className="live-feed-page__section" id="feed-item">
        <h2 className="live-feed-page__section-title">
          <a href="#feed-item">FeedItem Interface</a>
        </h2>
        <p className="live-feed-page__section-desc">
          Each item in the items array follows this interface. Content can be any ReactNode for rich rendering.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={feedItemProps} />
        </Card>
      </section>

      {/* ── 9. Props API ───────────────────────────────── */}
      <section className="live-feed-page__section" id="props">
        <h2 className="live-feed-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="live-feed-page__section-desc">
          All props accepted by LiveFeed. It also spreads native div attributes onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={liveFeedProps} />
        </Card>
      </section>

      {/* ── 10. Accessibility ──────────────────────────── */}
      <section className="live-feed-page__section" id="accessibility">
        <h2 className="live-feed-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="live-feed-page__section-desc">
          LiveFeed uses a polite live region to announce new events to screen readers without interrupting.
        </p>
        <Card variant="default" padding="md">
          <ul className="live-feed-page__a11y-list">
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Live region:</strong> Root element has <code className="live-feed-page__a11y-key">aria-live="polite"</code> to
                announce new items without interrupting the user.
              </span>
            </li>
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Status dot:</strong> Connection status indicator is marked <code className="live-feed-page__a11y-key">aria-hidden="true"</code> with
                a text label alongside for screen readers.
              </span>
            </li>
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion respect:</strong> Flash animations and smooth scrolling are disabled at
                <code className="live-feed-page__a11y-key">motion="0"</code> and when prefers-reduced-motion is set.
              </span>
            </li>
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Forced colors:</strong> Status dots and borders adapt to system colors in high-contrast mode.
              </span>
            </li>
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Timestamps:</strong> Displayed with <code className="live-feed-page__a11y-key">font-variant-numeric: tabular-nums</code> for
                consistent column alignment.
              </span>
            </li>
            <li className="live-feed-page__a11y-item">
              <span className="live-feed-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Error boundary:</strong> Wrapped in ComponentErrorBoundary to gracefully handle render errors.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
