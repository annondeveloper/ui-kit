'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { ConfirmDialog } from '@ui/components/confirm-dialog'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.confirm-dialog-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: confirm-dialog-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .confirm-dialog-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .confirm-dialog-page__hero::before {
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
        animation: aurora-spin-cd 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-cd {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .confirm-dialog-page__hero::before { animation: none; }
      }

      .confirm-dialog-page__title {
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

      .confirm-dialog-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .confirm-dialog-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .confirm-dialog-page__import-code {
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
      }

      .confirm-dialog-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-cd 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-cd {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .confirm-dialog-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .confirm-dialog-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .confirm-dialog-page__section-title a { color: inherit; text-decoration: none; }
      .confirm-dialog-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .confirm-dialog-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .confirm-dialog-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .confirm-dialog-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .confirm-dialog-page__result {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        padding: 0.5rem 1rem;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        min-inline-size: 200px;
        text-align: center;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { ConfirmDialog } from '@ui/components/confirm-dialog'"

const propsData: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Whether the confirmation dialog is visible.' },
  { name: 'onConfirm', type: '() => void', required: true, description: 'Callback when the user confirms the action.' },
  { name: 'onCancel', type: '() => void', required: true, description: 'Callback when the user cancels or dismisses.' },
  { name: 'title', type: 'string', default: "'Are you sure?'", description: 'Dialog heading text.' },
  { name: 'description', type: 'string', description: 'Supporting text explaining the action and its consequences.' },
  { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Label for the confirm button.' },
  { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Label for the cancel button.' },
  { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Visual style. Danger uses red confirm button for destructive actions.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner on the confirm button.' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the dialog element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfirmDialogPage() {
  useStyles('confirm-dialog-page', pageStyles)

  const [defaultOpen, setDefaultOpen] = useState(false)
  const [dangerOpen, setDangerOpen] = useState(false)
  const [loadingOpen, setLoadingOpen] = useState(false)
  const [result, setResult] = useState<string>('No action taken yet')

  useEffect(() => {
    const sections = document.querySelectorAll('.confirm-dialog-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="confirm-dialog-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="confirm-dialog-page__hero">
        <h1 className="confirm-dialog-page__title">ConfirmDialog</h1>
        <p className="confirm-dialog-page__desc">
          Modal confirmation dialog with default and danger variants. Built on native
          &lt;dialog&gt; with focus trapping, backdrop, and keyboard dismissal.
        </p>
        <div className="confirm-dialog-page__import-row">
          <code className="confirm-dialog-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Default Confirmation ──────────────────── */}
      <section className="confirm-dialog-page__section" id="default">
        <h2 className="confirm-dialog-page__section-title"><a href="#default">Default Confirmation</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Standard confirmation with neutral styling. Useful for non-destructive actions that need user acknowledgment.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button onClick={() => setDefaultOpen(true)}>
            <Icon name="check" size="sm" /> Save Changes
          </Button>
          <div className="confirm-dialog-page__result">{result}</div>
        </div>
        <ConfirmDialog
          open={defaultOpen}
          title="Save changes?"
          description="Your changes will be saved to the server. You can always revert later from the history."
          confirmLabel="Save"
          onConfirm={() => { setDefaultOpen(false); setResult('Confirmed: Changes saved') }}
          onCancel={() => { setDefaultOpen(false); setResult('Cancelled: No changes saved') }}
        />
      </section>

      {/* ── Danger Variant ────────────────────────── */}
      <section className="confirm-dialog-page__section" id="danger">
        <h2 className="confirm-dialog-page__section-title"><a href="#danger">Danger Variant</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Red-tinted confirm button for destructive actions like deletion. Draws user attention to the severity.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button variant="outline" onClick={() => setDangerOpen(true)}>
            <Icon name="trash" size="sm" /> Delete Account
          </Button>
        </div>
        <ConfirmDialog
          open={dangerOpen}
          variant="danger"
          title="Delete account?"
          description="This action cannot be undone. All your data, projects, and settings will be permanently removed."
          confirmLabel="Delete permanently"
          onConfirm={() => setDangerOpen(false)}
          onCancel={() => setDangerOpen(false)}
        />
      </section>

      {/* ── Loading State ─────────────────────────── */}
      <section className="confirm-dialog-page__section" id="loading">
        <h2 className="confirm-dialog-page__section-title"><a href="#loading">Loading State</a></h2>
        <p className="confirm-dialog-page__section-desc">
          Show a loading spinner on the confirm button while an async action is in progress.
          The dialog remains open until the operation completes.
        </p>
        <div className="confirm-dialog-page__preview">
          <Button variant="outline" onClick={() => setLoadingOpen(true)}>
            <Icon name="upload" size="sm" /> Deploy
          </Button>
        </div>
        <ConfirmDialog
          open={loadingOpen}
          title="Deploy to production?"
          description="This will deploy the current build to production. The process takes about 30 seconds."
          confirmLabel="Deploy"
          loading
          onConfirm={() => setTimeout(() => setLoadingOpen(false), 2000)}
          onCancel={() => setLoadingOpen(false)}
        />
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="confirm-dialog-page__section" id="props">
        <h2 className="confirm-dialog-page__section-title"><a href="#props">Props API</a></h2>
        <p className="confirm-dialog-page__section-desc">
          All props accepted by the ConfirmDialog component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
