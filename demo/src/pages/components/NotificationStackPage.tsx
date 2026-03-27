'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { NotificationStack, type Notification } from '@ui/domain/notification-stack'
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
    @scope (.notification-stack-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: notif-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .notification-stack-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .notification-stack-page__hero::before {
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
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .notification-stack-page__hero::before { animation: none; }
      }

      .notification-stack-page__title {
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

      .notification-stack-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .notification-stack-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .notification-stack-page__import-code {
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

      .notification-stack-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .notification-stack-page__section {
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
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
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
        .notification-stack-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .notification-stack-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .notification-stack-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .notification-stack-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .notification-stack-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .notification-stack-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
        min-block-size: 80px;
      }

      .notification-stack-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .notification-stack-page__preview--col {
        flex-direction: column;
        align-items: center;
      }

      /* ── Playground ─────────────────────────────────── */

      .notification-stack-page__playground {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 1.5rem;
        align-items: start;
      }

      @container notif-page (max-width: 680px) {
        .notification-stack-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .notification-stack-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .notification-stack-page__playground-result {
        min-block-size: 200px;
        padding: 1.5rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
      }

      .notification-stack-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .notification-stack-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .notification-stack-page__playground-controls {
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

      .notification-stack-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .notification-stack-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .notification-stack-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .notification-stack-page__option-btn {
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
      .notification-stack-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .notification-stack-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .notification-stack-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Add notification buttons ──────────────────── */

      .notification-stack-page__add-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .notification-stack-page__code-tabs {
        margin-block-start: 1rem;
      }

      .notification-stack-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .notification-stack-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .notification-stack-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .notification-stack-page__tier-card {
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

      .notification-stack-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .notification-stack-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .notification-stack-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .notification-stack-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .notification-stack-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .notification-stack-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .notification-stack-page__tier-import {
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

      .notification-stack-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .notification-stack-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .notification-stack-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── A11y list ──────────────────────────────────── */

      .notification-stack-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .notification-stack-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .notification-stack-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .notification-stack-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .notification-stack-page__hero { padding: 2rem 1.25rem; }
        .notification-stack-page__title { font-size: 1.75rem; }
        .notification-stack-page__preview { padding: 1.25rem; }
        .notification-stack-page__playground { grid-template-columns: 1fr; }
        .notification-stack-page__tiers { grid-template-columns: 1fr; }
        .notification-stack-page__section { padding: 1.25rem; }
      }

      @media (max-width: 400px) {
        .notification-stack-page__hero { padding: 1.5rem 1rem; }
        .notification-stack-page__title { font-size: 1.5rem; }
        .notification-stack-page__preview { padding: 1rem; }
      }

      /* ── Scrollbar ──────────────────────────────── */

      .notification-stack-page__import-code,
      .notification-stack-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar { width: 4px; height: 4px; }
      :scope ::-webkit-scrollbar-track { background: transparent; }
      :scope ::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 2px; }
      :scope ::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }
    }
  }
`

// ─── Sample Data ──────────────────────────────────────────────────────────────

const now = Date.now()

function makeSampleNotifications(): Notification[] {
  return [
    {
      id: '1',
      title: 'Deployment succeeded',
      description: 'Production build v2.4.1 deployed to us-east-1.',
      timestamp: now - 120000,
      variant: 'success',
      read: false,
      group: 'Deployments',
    },
    {
      id: '2',
      title: 'CPU usage warning',
      description: 'Server db-primary-01 exceeded 85% CPU for 5 minutes.',
      timestamp: now - 600000,
      variant: 'warning',
      read: false,
      group: 'Alerts',
      action: { label: 'View metrics', onClick: () => {} },
    },
    {
      id: '3',
      title: 'Failed health check',
      description: 'Service api-gateway returned 503 on health endpoint.',
      timestamp: now - 1800000,
      variant: 'error',
      read: false,
      group: 'Alerts',
    },
    {
      id: '4',
      title: 'New team member',
      description: 'Sarah Chen joined the platform-team workspace.',
      timestamp: now - 3600000,
      variant: 'info',
      read: true,
      group: 'Team',
    },
    {
      id: '5',
      title: 'Scheduled maintenance',
      description: 'Database maintenance window: March 26, 02:00-04:00 UTC.',
      timestamp: now - 7200000,
      variant: 'default',
      read: true,
      group: 'System',
    },
  ]
}

// ─── Props Data ───────────────────────────────────────────────────────────────

const notificationStackProps: PropDef[] = [
  { name: 'notifications', type: 'Notification[]', required: true, description: 'Array of notification objects to display.' },
  { name: 'onDismiss', type: '(id: string) => void', description: 'Callback when a notification dismiss button is clicked.' },
  { name: 'onDismissAll', type: '() => void', description: 'Callback for the "Clear all" header action.' },
  { name: 'onMarkAllRead', type: '() => void', description: 'Callback for the "Mark all read" header action.' },
  { name: 'onMarkRead', type: '(id: string) => void', description: 'Callback when a notification is clicked (marks as read).' },
  { name: 'maxVisible', type: 'number', default: '10', description: 'Maximum number of notifications to display.' },
  { name: 'emptyMessage', type: 'string', default: "'No notifications'", description: 'Message shown when the notification list is empty.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Controls staggered entry animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the root element.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { NotificationStack } from '@annondeveloper/ui-kit/lite'",
  standard: "import { NotificationStack } from '@annondeveloper/ui-kit'",
  premium: "import { NotificationStack } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="notification-stack-page__copy-btn"
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
    <label className="notification-stack-page__toggle-label">
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
    <div className="notification-stack-page__control-group">
      <span className="notification-stack-page__control-label">{label}</span>
      <div className="notification-stack-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`notification-stack-page__option-btn${opt === value ? ' notification-stack-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(tier: Tier, motion: number, maxVisible: number): string {
  const importStr = IMPORT_STRINGS[tier]
  const props: string[] = [
    '  notifications={notifications}',
    '  onDismiss={handleDismiss}',
    '  onDismissAll={handleClearAll}',
    '  onMarkAllRead={handleMarkAllRead}',
    '  onMarkRead={handleMarkRead}',
  ]
  if (maxVisible !== 10) props.push(`  maxVisible={${maxVisible}}`)
  if (motion !== 3 && tier !== 'lite') props.push(`  motion={${motion}}`)

  return `${importStr}
import { useState } from 'react'

function App() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Deployment succeeded',
      description: 'Production build deployed.',
      timestamp: Date.now() - 120000,
      variant: 'success',
      read: false,
    },
  ])

  const handleDismiss = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id))

  const handleClearAll = () => setNotifications([])

  const handleMarkAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const handleMarkRead = (id) =>
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )

  return (
    <NotificationStack
${props.join('\n')}
    />
  )
}`
}

function generateHtmlCode(tier: Tier): string {
  return `<!-- NotificationStack — @annondeveloper/ui-kit ${tier} tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/notification-stack.css">

<div class="ui-notification-stack">
  <div class="ui-notification-stack__header">
    <h3 class="ui-notification-stack__title">Notifications</h3>
    <div class="ui-notification-stack__actions">
      <button class="ui-notification-stack__action-btn">Mark all read</button>
      <button class="ui-notification-stack__action-btn">Clear all</button>
    </div>
  </div>
  <div class="ui-notification-stack__list">
    <article class="ui-notification" data-variant="success" data-unread>
      <div class="ui-notification__unread-dot"></div>
      <div class="ui-notification__content">
        <div class="ui-notification__header-row">
          <p class="ui-notification__title">Deployment succeeded</p>
          <span class="ui-notification__time">2m ago</span>
        </div>
        <p class="ui-notification__description">Production build deployed.</p>
      </div>
      <button class="ui-notification__dismiss" aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 16 16"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </article>
  </div>
</div>

<!-- @import '@annondeveloper/ui-kit/css/components/notification-stack.css'; -->`
}

function generateVueCode(tier: Tier, motion: number): string {
  if (tier === 'lite') {
    return `<template>
  <div class="ui-notification-stack">
    <div class="ui-notification-stack__header">
      <h3 class="ui-notification-stack__title">Notifications</h3>
      <div class="ui-notification-stack__actions">
        <button class="ui-notification-stack__action-btn" @click="markAllRead">Mark all read</button>
        <button class="ui-notification-stack__action-btn" @click="clearAll">Clear all</button>
      </div>
    </div>
    <div class="ui-notification-stack__list">
      <article
        v-for="n in notifications"
        :key="n.id"
        class="ui-notification"
        :data-variant="n.variant"
        :data-unread="!n.read ? '' : undefined"
      >
        <div class="ui-notification__content">
          <p class="ui-notification__title">{{ n.title }}</p>
          <p class="ui-notification__description">{{ n.description }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    '  :notifications="notifications"',
    '  @dismiss="handleDismiss"',
    '  @dismiss-all="handleClearAll"',
    '  @mark-all-read="handleMarkAllRead"',
    '  @mark-read="handleMarkRead"',
  ]
  if (motion !== 3) attrs.push(`  :motion="${motion}"`)

  return `<template>
  <NotificationStack
${attrs.join('\n')}
  />
</template>

<script setup>
import { ref } from 'vue'
import { NotificationStack } from '${importPath}'

const notifications = ref([/* ... */])
</script>`
}

function generateAngularCode(tier: Tier): string {
  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  return `<!-- Angular — ${tier} tier -->
<div class="ui-notification-stack">
  <div class="ui-notification-stack__header">
    <h3 class="ui-notification-stack__title">Notifications</h3>
    <div class="ui-notification-stack__actions">
      <button class="ui-notification-stack__action-btn" (click)="markAllRead()">Mark all read</button>
      <button class="ui-notification-stack__action-btn" (click)="clearAll()">Clear all</button>
    </div>
  </div>
  <div class="ui-notification-stack__list">
    <article
      *ngFor="let n of notifications"
      class="ui-notification"
      [attr.data-variant]="n.variant"
      [attr.data-unread]="!n.read ? '' : null"
      (click)="markRead(n.id)"
    >
      <div class="ui-notification__content">
        <p class="ui-notification__title">{{ n.title }}</p>
        <p class="ui-notification__description">{{ n.description }}</p>
      </div>
      <button class="ui-notification__dismiss" (click)="dismiss(n.id, $event)">
        &times;
      </button>
    </article>
  </div>
</div>

/* Import component CSS */
@import '${importPath}/css/components/notification-stack.css';`
}

function generateSvelteCode(tier: Tier, motion: number): string {
  if (tier === 'lite') {
    return `<!-- Svelte — Lite tier (CSS-only) -->
<div class="ui-notification-stack">
  <div class="ui-notification-stack__header">
    <h3 class="ui-notification-stack__title">Notifications</h3>
    <div class="ui-notification-stack__actions">
      <button class="ui-notification-stack__action-btn" on:click={markAllRead}>Mark all read</button>
      <button class="ui-notification-stack__action-btn" on:click={clearAll}>Clear all</button>
    </div>
  </div>
  <div class="ui-notification-stack__list">
    {#each notifications as n (n.id)}
      <article
        class="ui-notification"
        data-variant={n.variant}
        data-unread={!n.read ? '' : undefined}
      >
        <div class="ui-notification__content">
          <p class="ui-notification__title">{n.title}</p>
          <p class="ui-notification__description">{n.description}</p>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  @import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  const importPath = tier === 'premium' ? '@annondeveloper/ui-kit/premium' : '@annondeveloper/ui-kit'
  const attrs: string[] = [
    '  notifications={notifications}',
    '  onDismiss={handleDismiss}',
    '  onDismissAll={handleClearAll}',
    '  onMarkAllRead={handleMarkAllRead}',
    '  onMarkRead={handleMarkRead}',
  ]
  if (motion !== 3) attrs.push(`  motion={${motion}}`)

  return `<script>
  import { NotificationStack } from '${importPath}';
  let notifications = [/* ... */];
</script>

<NotificationStack
${attrs.join('\n')}
/>`
}

// ─── Playground Section ───────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [notifications, setNotifications] = useState<Notification[]>(makeSampleNotifications)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [maxVisible, setMaxVisible] = useState(10)
  const [copyStatus, setCopyStatus] = useState('')
  const [activeCodeTab, setActiveCodeTab] = useState('react')
  const nextIdRef = useRef(10)

  const handleDismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const handleDismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const addNotification = useCallback((variant: Notification['variant']) => {
    const id = String(nextIdRef.current++)
    const titles: Record<string, string> = {
      success: 'Build completed',
      warning: 'High memory usage',
      error: 'Service unavailable',
      info: 'New feature available',
      default: 'System update',
    }
    const descriptions: Record<string, string> = {
      success: 'All tests passed. Artifact published to registry.',
      warning: 'Memory usage exceeded 80% threshold on worker-03.',
      error: 'Unable to reach auth-service on port 8443.',
      info: 'Dark mode support has been added to the dashboard.',
      default: 'Routine system maintenance completed.',
    }
    const v = variant ?? 'default'
    setNotifications(prev => [{
      id,
      title: titles[v],
      description: descriptions[v],
      timestamp: Date.now(),
      variant: v,
      read: false,
    }, ...prev])
  }, [])

  const reactCode = useMemo(() => generateReactCode(tier, motion, maxVisible), [tier, motion, maxVisible])
  const htmlCode = useMemo(() => generateHtmlCode(tier), [tier])
  const vueCode = useMemo(() => generateVueCode(tier, motion), [tier, motion])
  const angularCode = useMemo(() => generateAngularCode(tier), [tier])
  const svelteCode = useMemo(() => generateSvelteCode(tier, motion), [tier, motion])

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

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

  return (
    <section className="notification-stack-page__section" id="playground">
      <h2 className="notification-stack-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="notification-stack-page__section-desc">
        Add, dismiss, and manage notifications in real-time. Toggle features and see the generated code update.
      </p>

      <div className="notification-stack-page__playground">
        <div className="notification-stack-page__playground-preview">
          <div className="notification-stack-page__playground-result">
            <NotificationStack
              notifications={notifications}
              onDismiss={handleDismiss}
              onDismissAll={handleDismissAll}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
              maxVisible={maxVisible}
              motion={tier !== 'lite' ? motion : undefined}
            />
          </div>

          <div className="notification-stack-page__add-row">
            <Button size="xs" variant="primary" onClick={() => addNotification('success')}>+ Success</Button>
            <Button size="xs" variant="secondary" onClick={() => addNotification('warning')}>+ Warning</Button>
            <Button size="xs" variant="danger" onClick={() => addNotification('error')}>+ Error</Button>
            <Button size="xs" variant="secondary" onClick={() => addNotification('info')}>+ Info</Button>
            <Button size="xs" variant="ghost" onClick={() => setNotifications(makeSampleNotifications())}>Reset</Button>
          </div>

          <div className="notification-stack-page__code-tabs">
            <div className="notification-stack-page__export-row">
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
              {copyStatus && <span className="notification-stack-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react"><CopyBlock code={reactCode} language="typescript" showLineNumbers /></TabPanel>
              <TabPanel tabId="html"><CopyBlock code={htmlCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="vue"><CopyBlock code={vueCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="angular"><CopyBlock code={angularCode} language="html" showLineNumbers /></TabPanel>
              <TabPanel tabId="svelte"><CopyBlock code={svelteCode} language="html" showLineNumbers /></TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="notification-stack-page__playground-controls">
          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <OptionGroup
            label="Max Visible"
            options={['3', '5', '10'] as const}
            value={String(maxVisible) as '3' | '5' | '10'}
            onChange={v => setMaxVisible(Number(v))}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NotificationStackPage() {
  useStyles('notification-stack-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.notification-stack-page__section')
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
    <div className="notification-stack-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="notification-stack-page__hero">
        <h1 className="notification-stack-page__title">NotificationStack</h1>
        <p className="notification-stack-page__desc">
          Stacked notification feed with variant borders, unread indicators, dismiss actions,
          grouping, and staggered entry animations. Perfect for notification panels and activity feeds.
        </p>
        <div className="notification-stack-page__import-row">
          <code className="notification-stack-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Variants ────────────────────────────────── */}
      <section className="notification-stack-page__section" id="variants">
        <h2 className="notification-stack-page__section-title">
          <a href="#variants">Notification Variants</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          Five variants with distinct left-border colors for quick visual scanning:
          default, success, warning, error, and info.
        </p>
        <div className="notification-stack-page__preview">
          <NotificationStack
            notifications={[
              { id: 'v1', title: 'Default notification', description: 'No variant border — neutral style.', timestamp: now - 60000, variant: 'default', read: true },
              { id: 'v2', title: 'Success notification', description: 'Green left border for positive events.', timestamp: now - 120000, variant: 'success', read: true },
              { id: 'v3', title: 'Warning notification', description: 'Amber left border for caution events.', timestamp: now - 180000, variant: 'warning', read: true },
              { id: 'v4', title: 'Error notification', description: 'Red left border for critical events.', timestamp: now - 240000, variant: 'error', read: true },
              { id: 'v5', title: 'Info notification', description: 'Brand-colored left border for informational events.', timestamp: now - 300000, variant: 'info', read: true },
            ]}
          />
        </div>
      </section>

      {/* ── 4. Unread State ────────────────────────────── */}
      <section className="notification-stack-page__section" id="unread">
        <h2 className="notification-stack-page__section-title">
          <a href="#unread">Unread State</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          Unread notifications get a subtle brand-tinted background and a dot indicator.
          The title weight increases to 600 for visual emphasis. Click to mark as read.
        </p>
        <div className="notification-stack-page__preview">
          <NotificationStack
            notifications={[
              { id: 'u1', title: 'Unread notification', description: 'This has a brand-tinted background and bold title.', timestamp: now - 60000, variant: 'info', read: false },
              { id: 'u2', title: 'Read notification', description: 'This has the default neutral background.', timestamp: now - 120000, variant: 'info', read: true },
            ]}
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<NotificationStack
  notifications={[
    { id: '1', title: 'Unread', read: false, ... },
    { id: '2', title: 'Read', read: true, ... },
  ]}
  onMarkRead={(id) => markAsRead(id)}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. With Actions ────────────────────────────── */}
      <section className="notification-stack-page__section" id="actions">
        <h2 className="notification-stack-page__section-title">
          <a href="#actions">Notification Actions</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          Each notification can include an action button. Actions stop propagation to avoid
          triggering the mark-as-read click handler.
        </p>
        <div className="notification-stack-page__preview">
          <NotificationStack
            notifications={[
              {
                id: 'a1',
                title: 'Pull request ready for review',
                description: 'PR #142: Add notification stack component',
                timestamp: now - 300000,
                variant: 'info',
                read: false,
                action: { label: 'Review PR', onClick: () => {} },
              },
              {
                id: 'a2',
                title: 'Disk space low',
                description: 'Server logs-01 has 5% free disk space remaining.',
                timestamp: now - 600000,
                variant: 'warning',
                read: false,
                action: { label: 'Clean up', onClick: () => {} },
              },
            ]}
          />
        </div>
      </section>

      {/* ── 6. Empty State ─────────────────────────────── */}
      <section className="notification-stack-page__section" id="empty">
        <h2 className="notification-stack-page__section-title">
          <a href="#empty">Empty State</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          When there are no notifications, a centered message is displayed. Customize it with
          the <code>emptyMessage</code> prop.
        </p>
        <div className="notification-stack-page__preview">
          <NotificationStack
            notifications={[]}
            emptyMessage="All caught up! No new notifications."
          />
        </div>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<NotificationStack
  notifications={[]}
  emptyMessage="All caught up! No new notifications."
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 7. Weight Tiers ────────────────────────────── */}
      <section className="notification-stack-page__section" id="tiers">
        <h2 className="notification-stack-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          Choose the right balance of features and bundle size for your notification panel.
        </p>

        <div className="notification-stack-page__tiers">
          {/* Lite */}
          <div
            className={`notification-stack-page__tier-card${tier === 'lite' ? ' notification-stack-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="notification-stack-page__tier-header">
              <span className="notification-stack-page__tier-name">Lite</span>
              <span className="notification-stack-page__tier-size">~1.5 KB</span>
            </div>
            <p className="notification-stack-page__tier-desc">
              CSS-only notification list. No staggered animations, no grouping, no relative timestamps. Static markup with data attributes.
            </p>
            <div className="notification-stack-page__tier-import">
              import {'{'} NotificationStack {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="notification-stack-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Static list rendering</span>
            </div>
            <div className="notification-stack-page__size-breakdown">
              <div className="notification-stack-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>1.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>5.2 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`notification-stack-page__tier-card${tier === 'standard' ? ' notification-stack-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="notification-stack-page__tier-header">
              <span className="notification-stack-page__tier-name">Standard</span>
              <span className="notification-stack-page__tier-size">~3.5 KB</span>
            </div>
            <p className="notification-stack-page__tier-desc">
              Full-featured with staggered entry animation, grouping, relative timestamps, dismiss actions,
              unread tracking, and touch-optimized targets.
            </p>
            <div className="notification-stack-page__tier-import">
              import {'{'} NotificationStack {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="notification-stack-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Groups + Animations</span>
            </div>
            <div className="notification-stack-page__size-breakdown">
              <div className="notification-stack-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`notification-stack-page__tier-card${tier === 'premium' ? ' notification-stack-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="notification-stack-page__tier-header">
              <span className="notification-stack-page__tier-name">Premium</span>
              <span className="notification-stack-page__tier-size">~5.5 KB</span>
            </div>
            <p className="notification-stack-page__tier-desc">
              Everything in Standard plus swipe-to-dismiss gestures, spring exit animations,
              sound effects, badge counters, and real-time push via WebSocket integration.
            </p>
            <div className="notification-stack-page__tier-import">
              import {'{'} NotificationStack {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="notification-stack-page__tier-preview">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Swipe + Sound + Push</span>
            </div>
            <div className="notification-stack-page__size-breakdown">
              <div className="notification-stack-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>5.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.3 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>8.8 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Props API ───────────────────────────────── */}
      <section className="notification-stack-page__section" id="props">
        <h2 className="notification-stack-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          All props accepted by NotificationStack. It also spreads native div HTML attributes
          onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={notificationStackProps} />
        </Card>
      </section>

      {/* ── 9. Accessibility ──────────────────────────── */}
      <section className="notification-stack-page__section" id="accessibility">
        <h2 className="notification-stack-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="notification-stack-page__section-desc">
          Designed for keyboard navigation and screen reader compatibility with proper semantic markup.
        </p>
        <Card variant="default" padding="md">
          <ul className="notification-stack-page__a11y-list">
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Semantic markup:</strong> Each notification uses <code className="notification-stack-page__a11y-key">{'<article>'}</code> for proper content semantics.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Dismiss labels:</strong> Close buttons use <code className="notification-stack-page__a11y-key">aria-label="Dismiss notification"</code>.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus management:</strong> All interactive elements are keyboard accessible with visible focus rings.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Enforces 44px minimum on coarse pointer devices via <code className="notification-stack-page__a11y-key">@media (pointer: coarse)</code>.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Motion respect:</strong> Staggered entry animations disabled at <code className="notification-stack-page__a11y-key">motion=0</code>.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="notification-stack-page__a11y-key">forced-colors: active</code> with visible borders and Highlight for unread.
              </span>
            </li>
            <li className="notification-stack-page__a11y-item">
              <span className="notification-stack-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Print:</strong> Dismiss buttons and action buttons are hidden in <code className="notification-stack-page__a11y-key">@media print</code>.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
