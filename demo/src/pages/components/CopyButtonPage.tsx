'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CopyButton } from '@ui/components/copy-button'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'copy-button-page'

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
        gap: 2rem;
      }

      .${PAGE}__code-block {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.3);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1rem 1.25rem;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        inline-size: 100%;
        max-inline-size: 480px;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .${PAGE}__item-label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-weight: 500;
      }
    }
  }
`

// ─── Props Data ──────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', required: true, description: 'The text value to copy to the clipboard.' },
  { name: 'timeout', type: 'number', default: '1000', description: 'Duration in ms to show the "copied" state before resetting.' },
  { name: 'children', type: '(payload: { copied: boolean; copy: () => void }) => ReactNode', required: true, description: 'Render function receiving copied state and copy action.' },
  { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'sm'", description: 'Size of the button wrapper.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Motion intensity level.' },
]

const IMPORT = "import { CopyButton } from '@ui/components/copy-button'"
const SAMPLE_CODE = 'npm install @annondeveloper/ui-kit'
const SAMPLE_TOKEN = 'sk-proj-abc123def456ghi789'

// ─── Component ───────────────────────────────────────────────────────────────

export default function CopyButtonPage() {
  useStyles('copy-button-page', pageStyles)

  const [headerCopied, setHeaderCopied] = useState(false)

  const copyImport = () => {
    navigator.clipboard.writeText(IMPORT).then(() => {
      setHeaderCopied(true)
      setTimeout(() => setHeaderCopied(false), 1500)
    })
  }

  return (
    <div className={PAGE}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className={`${PAGE}__hero`}>
        <h1 className={`${PAGE}__title`}>CopyButton</h1>
        <p className={`${PAGE}__desc`}>
          Clipboard copy button with a render-prop pattern for full control over appearance.
          Handles the clipboard API call and provides feedback state automatically.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={headerCopied ? 'check' : 'copy'} size="sm" />}>
            {headerCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="basic">
        <h2 className={`${PAGE}__section-title`}><a href="#basic">Basic Copy Feedback</a></h2>
        <p className={`${PAGE}__section-desc`}>
          CopyButton uses a render function that receives the copied state and a copy action.
          Click the copy button to see the icon and label swap for visual feedback.
        </p>
        <div className={`${PAGE}__preview ${PAGE}__preview--col`}>
          <div className={`${PAGE}__code-block`}>
            <span>{SAMPLE_CODE}</span>
            <CopyButton value={SAMPLE_CODE}>
              {({ copied, copy }) => (
                <Button size="xs" variant={copied ? 'filled' : 'secondary'} onClick={copy}
                  icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          </div>
          <div className={`${PAGE}__code-block`}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{SAMPLE_TOKEN}</span>
            <CopyButton value={SAMPLE_TOKEN} timeout={2000}>
              {({ copied, copy }) => (
                <Button size="xs" variant={copied ? 'filled' : 'outline'} onClick={copy}
                  icon={<Icon name={copied ? 'check-circle' : 'clipboard'} size="sm" />}>
                  {copied ? 'Done' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          </div>
        </div>
      </section>

      {/* ── 2. Custom Render ─────────────────────────────── */}
      <section className={`${PAGE}__section`} id="custom">
        <h2 className={`${PAGE}__section-title`}><a href="#custom">Custom Render</a></h2>
        <p className={`${PAGE}__section-desc`}>
          The render-prop pattern lets you use any element as the trigger. Here are examples
          with icon-only buttons and styled text links.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <CopyButton value="https://ui-kit.dev">
              {({ copied, copy }) => (
                <button onClick={copy} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: copied ? 'var(--success)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm, 0.875rem)', display: 'flex',
                  alignItems: 'center', gap: '0.375rem', padding: '0.5rem',
                  transition: 'color 0.15s ease',
                }}>
                  <Icon name={copied ? 'check' : 'link'} size="sm" />
                  {copied ? 'Link copied!' : 'Copy link'}
                </button>
              )}
            </CopyButton>
            <span className={`${PAGE}__item-label`}>text link style</span>
          </div>
          <div className={`${PAGE}__labeled-item`}>
            <CopyButton value="console.log('hello')">
              {({ copied, copy }) => (
                <span onClick={copy} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') copy() }}
                  style={{
                    cursor: 'pointer', padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: copied ? 'oklch(55% 0.15 145 / 0.15)' : 'oklch(0% 0 0 / 0.15)',
                    color: copied ? 'var(--success)' : 'var(--text-primary)',
                    fontFamily: 'monospace', fontSize: 'var(--text-sm, 0.875rem)',
                    transition: 'background 0.15s ease, color 0.15s ease',
                  }}>
                  {copied ? 'Copied!' : "console.log('hello')"}
                </span>
              )}
            </CopyButton>
            <span className={`${PAGE}__item-label`}>inline code click-to-copy</span>
          </div>
        </div>
      </section>

      {/* ── 3. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for CopyButton.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
