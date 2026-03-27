'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { TransferList, type TransferListItem } from '@ui/components/transfer-list'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'transfer-list-page'

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
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
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

      .${PAGE}__state-display {
        margin-block-start: 1rem;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', monospace;
        white-space: pre-wrap;
        max-block-size: 120px;
        overflow-y: auto;
        padding: 0.75rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-sm);
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const FRAMEWORKS: TransferListItem[] = [
  { value: 'react', label: 'React', group: 'Frontend' },
  { value: 'vue', label: 'Vue', group: 'Frontend' },
  { value: 'angular', label: 'Angular', group: 'Frontend' },
  { value: 'svelte', label: 'Svelte', group: 'Frontend' },
  { value: 'express', label: 'Express', group: 'Backend' },
  { value: 'fastify', label: 'Fastify', group: 'Backend' },
  { value: 'nestjs', label: 'NestJS', group: 'Backend' },
  { value: 'django', label: 'Django', group: 'Backend' },
]

const TEAM_MEMBERS: TransferListItem[] = [
  { value: 'alice', label: 'Alice Chen' },
  { value: 'bob', label: 'Bob Martinez' },
  { value: 'carol', label: 'Carol Kim' },
  { value: 'dave', label: 'Dave Johnson' },
  { value: 'eve', label: 'Eve Williams' },
  { value: 'frank', label: 'Frank Lee' },
]

// ─── Props Data ──────────────────────────────────────────────────────────────

const ITEM_PROPS: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'Unique identifier for the item.' },
  { name: 'label', type: 'string', required: true, description: 'Display label for the item.' },
  { name: 'group', type: 'string', description: 'Group name for organizing items within a panel.' },
]

const PROPS: PropDef[] = [
  { name: 'value', type: '[TransferListItem[], TransferListItem[]]', required: true, description: 'Tuple of items in the left and right panels.' },
  { name: 'onChange', type: '(value: [TransferListItem[], TransferListItem[]]) => void', required: true, description: 'Called when items are transferred between panels.' },
  { name: 'titles', type: '[string, string]', default: "['Available', 'Selected']", description: 'Heading labels for the left and right panels.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Shows a search input in each panel for filtering items.' },
  { name: 'showTransferAll', type: 'boolean', default: 'false', description: 'Shows buttons to transfer all items at once.' },
  { name: 'listHeight', type: 'number | string', description: 'Fixed height for the item lists (enables scrolling).' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the transfer list controls.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT = "import { TransferList } from '@ui/components/transfer-list'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransferListPage() {
  useStyles('transfer-list-page', pageStyles)

  const [copied, setCopied] = useState(false)
  const [basic, setBasic] = useState<[TransferListItem[], TransferListItem[]]>([
    TEAM_MEMBERS.slice(0, 4),
    TEAM_MEMBERS.slice(4),
  ])
  const [grouped, setGrouped] = useState<[TransferListItem[], TransferListItem[]]>([
    FRAMEWORKS,
    [],
  ])

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>TransferList</h1>
        <p className={`${PAGE}__desc`}>
          Dual-panel list for moving items between two collections. Supports search filtering,
          grouped items, transfer-all buttons, and keyboard-driven selection.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Basic Transfer ────────────────────────────── */}
      <section className={`${PAGE}__section`} id="basic">
        <h2 className={`${PAGE}__section-title`}><a href="#basic">Basic Transfer</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Select items in either panel and use the transfer buttons to move them. The component
          manages checkbox selection internally and calls onChange with the updated tuple.
        </p>
        <div className={`${PAGE}__preview`}>
          <TransferList
            value={basic}
            onChange={setBasic}
            titles={['Team Pool', 'Project Team']}
            searchable
          />
          <div className={`${PAGE}__state-display`}>
            Left: [{basic[0].map(i => i.label).join(', ')}]{'\n'}
            Right: [{basic[1].map(i => i.label).join(', ')}]
          </div>
        </div>
      </section>

      {/* ── 2. Grouped & Transfer All ────────────────────── */}
      <section className={`${PAGE}__section`} id="grouped">
        <h2 className={`${PAGE}__section-title`}><a href="#grouped">Grouped Items & Transfer All</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Items with a group property are visually categorized within their panel.
          Enable showTransferAll for bulk-move buttons.
        </p>
        <div className={`${PAGE}__preview`}>
          <TransferList
            value={grouped}
            onChange={setGrouped}
            titles={['Available Frameworks', 'Selected Stack']}
            searchable
            showTransferAll
            listHeight={280}
          />
        </div>
      </section>

      {/* ── 3. TransferListItem Props ────────────────────── */}
      <section className={`${PAGE}__section`} id="item-props">
        <h2 className={`${PAGE}__section-title`}><a href="#item-props">TransferListItem Interface</a></h2>
        <p className={`${PAGE}__section-desc`}>Shape of each item in the transfer list arrays.</p>
        <Card variant="default" padding="md">
          <PropsTable props={ITEM_PROPS} />
        </Card>
      </section>

      {/* ── 4. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for TransferList.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
