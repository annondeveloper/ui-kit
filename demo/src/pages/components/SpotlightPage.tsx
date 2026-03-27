'use client'

import { useState, useCallback } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Spotlight, type SpotlightAction } from '@ui/components/spotlight'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'spotlight-page'

const pageStyles = css`
  @layer demo {
    @scope (.${PAGE}) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: ${PAGE};
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .${PAGE}__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .${PAGE}__hero::before {
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
        .${PAGE}__hero::before { animation: none; }
      }

      .${PAGE}__title {
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

      .${PAGE}__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .${PAGE}__import-code {
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

      .${PAGE}__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      .${PAGE}__section {
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
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .${PAGE}__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .${PAGE}__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .${PAGE}__section-title a { color: inherit; text-decoration: none; }
      .${PAGE}__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .${PAGE}__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .${PAGE}__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 120px;
        z-index: 1;
      }

      .${PAGE}__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .${PAGE}__preview--col {
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .${PAGE}__kbd {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.2em 0.5em;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(0% 0 0 / 0.15);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
      }

      .${PAGE}__last-action {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        min-block-size: 1.5em;
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const ACTION_PROPS: PropDef[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier for the action.' },
  { name: 'title', type: 'string', required: true, description: 'Display title for the action.' },
  { name: 'description', type: 'string', description: 'Optional subtitle shown below the title.' },
  { name: 'icon', type: 'ReactNode', description: 'Icon element shown before the title.' },
  { name: 'group', type: 'string', description: 'Group name for categorizing actions.' },
  { name: 'keywords', type: 'string[]', description: 'Additional keywords for search matching.' },
  { name: 'onClick', type: '() => void', required: true, description: 'Callback when the action is selected.' },
]

const SPOTLIGHT_PROPS: PropDef[] = [
  { name: 'actions', type: 'SpotlightAction[]', required: true, description: 'Array of searchable actions to display.' },
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when open state changes.' },
  { name: 'shortcut', type: 'string', default: "'meta+k'", description: 'Keyboard shortcut to toggle the spotlight.' },
  { name: 'placeholder', type: 'string', default: "'Search...'", description: 'Placeholder text for the search input.' },
  { name: 'nothingFoundMessage', type: 'string', default: "'Nothing found'", description: 'Message shown when no actions match the query.' },
  { name: 'limit', type: 'number', description: 'Maximum number of results to show.' },
  { name: 'filter', type: '(query: string, actions: SpotlightAction[]) => SpotlightAction[]', description: 'Custom filter function to override built-in fuzzy search.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT = "import { Spotlight } from '@ui/components/spotlight'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function SpotlightPage() {
  useStyles(pageStyles)

  const [copied, setCopied] = useState(false)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [lastAction, setLastAction] = useState('')

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const makeAction = useCallback((id: string, title: string, desc: string, icon: string, group?: string, keywords?: string[]): SpotlightAction => ({
    id,
    title,
    description: desc,
    icon: <Icon name={icon} size="sm" />,
    group,
    keywords,
    onClick: () => setLastAction(title),
  }), [])

  const actions: SpotlightAction[] = [
    makeAction('home', 'Home', 'Go to the home page', 'home', 'Navigation'),
    makeAction('docs', 'Documentation', 'Browse component docs', 'book', 'Navigation'),
    makeAction('settings', 'Settings', 'Open application settings', 'settings', 'Navigation', ['preferences', 'config']),
    makeAction('new-project', 'New Project', 'Create a new project', 'plus', 'Actions'),
    makeAction('deploy', 'Deploy', 'Deploy to production', 'zap', 'Actions', ['publish', 'release']),
    makeAction('invite', 'Invite Team Member', 'Send an invitation link', 'user', 'Actions'),
    makeAction('theme', 'Toggle Theme', 'Switch between light and dark mode', 'moon', 'Preferences', ['dark', 'light']),
    makeAction('notifications', 'Notifications', 'Manage notification settings', 'bell', 'Preferences'),
  ]

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>Spotlight</h1>
        <p className={`${PAGE}__desc`}>
          Command palette search overlay for quick navigation and actions. Triggered by a keyboard
          shortcut, it provides fuzzy search with grouped results and keyboard navigation.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Interactive Demo ──────────────────────────── */}
      <section className={`${PAGE}__section`} id="demo">
        <h2 className={`${PAGE}__section-title`}><a href="#demo">Interactive Demo</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Click the button or press <kbd className={`${PAGE}__kbd`}>Cmd + K</kbd> to open the spotlight.
          Type to search, use arrow keys to navigate, and Enter to select.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <Button onClick={() => setSpotlightOpen(true)}
            icon={<Icon name="search" size="sm" />}>
            Open Spotlight
          </Button>
          <p className={`${PAGE}__last-action`}>
            {lastAction ? `Selected: ${lastAction}` : 'Select an action from the spotlight...'}
          </p>
          <Spotlight
            actions={actions}
            open={spotlightOpen}
            onOpenChange={setSpotlightOpen}
            placeholder="Search actions..."
            nothingFoundMessage="No matching actions found"
          />
        </div>
      </section>

      {/* ── 2. Keyboard Shortcut ─────────────────────────── */}
      <section className={`${PAGE}__section`} id="shortcut">
        <h2 className={`${PAGE}__section-title`}><a href="#shortcut">Keyboard Shortcut</a></h2>
        <p className={`${PAGE}__section-desc`}>
          The default shortcut is <kbd className={`${PAGE}__kbd`}>Cmd + K</kbd> (or Ctrl + K on Windows/Linux).
          This is configurable via the shortcut prop. The overlay supports full keyboard navigation:
          Arrow Up/Down to move between items, Enter to select, and Escape to close.
        </p>
        <div className={`${PAGE}__preview`}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <kbd className={`${PAGE}__kbd`}>Cmd + K</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>open / close</span>
            <kbd className={`${PAGE}__kbd`}>Arrow Up/Down</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>navigate</span>
            <kbd className={`${PAGE}__kbd`}>Enter</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>select</span>
            <kbd className={`${PAGE}__kbd`}>Escape</kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm, 0.875rem)' }}>close</span>
          </div>
        </div>
      </section>

      {/* ── 3. SpotlightAction Props ─────────────────────── */}
      <section className={`${PAGE}__section`} id="action-props">
        <h2 className={`${PAGE}__section-title`}><a href="#action-props">SpotlightAction Interface</a></h2>
        <p className={`${PAGE}__section-desc`}>Shape of each action object in the actions array.</p>
        <Card variant="default" padding="md">
          <PropsTable props={ACTION_PROPS} />
        </Card>
      </section>

      {/* ── 4. Spotlight Props ───────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Spotlight.</p>
        <Card variant="default" padding="md">
          <PropsTable props={SPOTLIGHT_PROPS} />
        </Card>
      </section>
    </div>
  )
}
