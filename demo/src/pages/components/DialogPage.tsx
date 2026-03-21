'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Dialog } from '@ui/components/dialog'
import { ConfirmDialog } from '@ui/components/confirm-dialog'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Divider } from '@ui/components/divider'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.dialog-page) {
      :scope {
        max-inline-size: 860px;
        margin-inline: auto;
      }

      /* ── Hero header ────────────────────────────────── */

      .dialog-page__hero {
        margin-block-end: 2.5rem;
      }

      .dialog-page__title {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-primary);
        margin: 0 0 0.5rem;
        line-height: 1.15;
      }

      .dialog-page__desc {
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .dialog-page__import-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dialog-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(100% 0 0 / 0.05);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      .dialog-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .dialog-page__section {
        margin-block-end: 3rem;
      }

      .dialog-page__section-title {
        font-size: var(--text-lg, 1.125rem);
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.25rem;
        scroll-margin-block-start: 2rem;
      }

      .dialog-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .dialog-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .dialog-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .dialog-page__preview {
        padding: 2rem;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1rem;
      }

      .dialog-page__preview--col {
        flex-direction: column;
        align-items: flex-start;
      }

      /* ── Playground ─────────────────────────────────── */

      .dialog-page__playground {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
      @container (max-width: 600px) {
        .dialog-page__playground {
          grid-template-columns: 1fr;
        }
      }

      .dialog-page__playground-preview {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dialog-page__playground-result {
        min-block-size: 120px;
        display: grid;
        place-items: center;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        background: var(--bg-base);
        padding: 2rem;
      }

      .dialog-page__playground-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .dialog-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .dialog-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .dialog-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .dialog-page__option-btn {
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
      .dialog-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .dialog-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
      }

      .dialog-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      /* ── Labeled row ────────────────────────────────── */

      .dialog-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 1.25rem;
      }

      .dialog-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
      }

      .dialog-page__item-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* ── A11y list ──────────────────────────────────── */

      .dialog-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .dialog-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .dialog-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .dialog-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Source link ─────────────────────────────────── */

      .dialog-page__source-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--brand);
        text-decoration: none;
        font-weight: 500;
      }
      .dialog-page__source-link:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      /* ── Sizes grid ─────────────────────────────────── */

      .dialog-page__sizes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.75rem;
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const dialogProps: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Controls dialog visibility. Uses the native <dialog> showModal/close API.' },
  { name: 'onClose', type: '() => void', required: true, description: 'Called when the dialog should close (escape, overlay click, close button).' },
  { name: 'title', type: 'ReactNode', description: 'Dialog title rendered in the header.' },
  { name: 'description', type: 'string', description: 'Description text below the title, linked via aria-describedby.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Controls max-width. sm=400px, md=560px, lg=720px, full=viewport.' },
  { name: 'closeOnOverlay', type: 'boolean', default: 'true', description: 'Whether clicking the backdrop closes the dialog.' },
  { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Whether pressing Escape closes the dialog.' },
  { name: 'showClose', type: 'boolean', default: 'true', description: 'Whether to show the close button in the header.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Level 0 disables entry animation.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'Dialog body content.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name.' },
]

const confirmDialogProps: PropDef[] = [
  { name: 'open', type: 'boolean', required: true, description: 'Controls visibility.' },
  { name: 'onConfirm', type: '() => void', required: true, description: 'Called when the confirm button is clicked.' },
  { name: 'onCancel', type: '() => void', required: true, description: 'Called when cancel is clicked or dialog is dismissed.' },
  { name: 'title', type: 'ReactNode', required: true, description: 'Confirmation prompt title.' },
  { name: 'description', type: 'ReactNode', description: 'Additional explanation text.' },
  { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Label for the confirm action button.' },
  { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Label for the cancel button.' },
  { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Visual variant. Danger uses red confirm button.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows loading state on the confirm button.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DialogSize = 'sm' | 'md' | 'lg' | 'full'
const DIALOG_SIZES: DialogSize[] = ['sm', 'md', 'lg', 'full']
const IMPORT_STR = "import { Dialog } from '@annondeveloper/ui-kit'"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="dialog-page__copy-btn"
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
    <div className="dialog-page__control-group">
      <span className="dialog-page__control-label">{label}</span>
      <div className="dialog-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`dialog-page__option-btn${opt === value ? ' dialog-page__option-btn--active' : ''}`}
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
    <label className="dialog-page__toggle-label">
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

// ─── Section: Interactive Playground ──────────────────────────────────────────

function PlaygroundSection() {
  const [size, setSize] = useState<DialogSize>('md')
  const [closeOnOverlay, setCloseOnOverlay] = useState(true)
  const [closeOnEscape, setCloseOnEscape] = useState(true)
  const [showClose, setShowClose] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [isOpen, setIsOpen] = useState(false)

  const codeLines: string[] = ['<Dialog']
  codeLines.push('  open={isOpen}')
  codeLines.push('  onClose={() => setIsOpen(false)}')
  codeLines.push('  title="Dialog Title"')
  codeLines.push('  description="A description of this dialog."')
  if (size !== 'md') codeLines.push(`  size="${size}"`)
  if (!closeOnOverlay) codeLines.push('  closeOnOverlay={false}')
  if (!closeOnEscape) codeLines.push('  closeOnEscape={false}')
  if (!showClose) codeLines.push('  showClose={false}')
  if (motion !== 3) codeLines.push(`  motion={${motion}}`)
  codeLines.push('>')
  codeLines.push('  <p>Dialog content here.</p>')
  codeLines.push('</Dialog>')
  const code = codeLines.join('\n')

  return (
    <section className="dialog-page__section" id="playground">
      <h2 className="dialog-page__section-title">
        <a href="#playground">Interactive Playground</a>
      </h2>
      <p className="dialog-page__section-desc">
        Tweak every prop, then open the dialog to see it in action.
        The generated code updates as you change settings.
      </p>

      <Card variant="default" padding="md" style={{ containerType: 'inline-size' }}>
        <div className="dialog-page__playground">
          {/* Preview + Code */}
          <div className="dialog-page__playground-preview">
            <div className="dialog-page__playground-result">
              <Button onClick={() => setIsOpen(true)} icon={<Icon name="maximize" size="sm" />}>
                Open Dialog
              </Button>
            </div>
            <CopyBlock code={code} language="typescript" showLineNumbers />
          </div>

          {/* Controls */}
          <div className="dialog-page__playground-controls">
            <OptionGroup label="Size" options={DIALOG_SIZES} value={size} onChange={setSize} />
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />

            <div className="dialog-page__control-group">
              <span className="dialog-page__control-label">Toggles</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <Toggle label="Close on overlay" checked={closeOnOverlay} onChange={setCloseOnOverlay} />
                <Toggle label="Close on escape" checked={closeOnEscape} onChange={setCloseOnEscape} />
                <Toggle label="Show close button" checked={showClose} onChange={setShowClose} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Dialog Title"
        description="A description of this dialog."
        size={size}
        closeOnOverlay={closeOnOverlay}
        closeOnEscape={closeOnEscape}
        showClose={showClose}
        motion={motion}
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This is the dialog body content. You can put any React elements here, including
          forms, lists, images, or other components. The dialog uses the native
          {'<dialog>'} element with showModal() for proper accessibility.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBlockStart: '1.25rem' }}>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setIsOpen(false)}>Confirm</Button>
        </div>
      </Dialog>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DialogPage() {
  useStyles('dialog-page', pageStyles)

  // Dialog states
  const [basicOpen, setBasicOpen] = useState(false)
  const [scrollOpen, setScrollOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [nestedOuter, setNestedOuter] = useState(false)
  const [nestedInner, setNestedInner] = useState(false)
  const [sizeDialogs, setSizeDialogs] = useState<Record<DialogSize, boolean>>({
    sm: false, md: false, lg: false, full: false,
  })

  const openSizeDialog = (s: DialogSize) => setSizeDialogs(prev => ({ ...prev, [s]: true }))
  const closeSizeDialog = (s: DialogSize) => setSizeDialogs(prev => ({ ...prev, [s]: false }))

  return (
    <div className="dialog-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="dialog-page__hero">
        <h1 className="dialog-page__title">Dialog</h1>
        <p className="dialog-page__desc">
          Modal dialog built on the native {'<dialog>'} element with showModal API,
          @starting-style entry animations, backdrop blur, escape key and overlay click
          dismiss, and a ConfirmDialog preset for common confirmation flows.
        </p>
        <div className="dialog-page__import-row">
          <code className="dialog-page__import-code">{IMPORT_STR}</code>
          <CopyButton text={IMPORT_STR} />
        </div>
      </div>

      <Divider spacing="sm" />

      {/* ── 2. Interactive Playground ───────────────────── */}
      <PlaygroundSection />

      <Divider spacing="sm" />

      {/* ── 3. Basic Dialog ─────────────────────────────── */}
      <section className="dialog-page__section" id="basic">
        <h2 className="dialog-page__section-title">
          <a href="#basic">Basic Dialog</a>
        </h2>
        <p className="dialog-page__section-desc">
          The simplest dialog with a title, description, and body content.
        </p>
        <div className="dialog-page__preview dialog-page__preview--col">
          <Button onClick={() => setBasicOpen(true)}>Open Basic Dialog</Button>
          <CopyBlock
            code={`const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Open</Button>

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Welcome"
  description="This is a basic dialog example."
>
  <p>Your dialog content goes here.</p>
</Dialog>`}
            language="typescript"
            showLineNumbers
          />
        </div>
        <Dialog
          open={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Welcome"
          description="This is a basic dialog example."
        >
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your dialog content goes here. Dialog uses the native {'<dialog>'} element
            and calls showModal() for proper modal behavior including backdrop and
            focus trapping.
          </p>
        </Dialog>
      </section>

      <Divider spacing="sm" />

      {/* ── 4. Scrolling Content ────────────────────────── */}
      <section className="dialog-page__section" id="scrolling">
        <h2 className="dialog-page__section-title">
          <a href="#scrolling">With Scrolling Content</a>
        </h2>
        <p className="dialog-page__section-desc">
          When content exceeds the dialog height, the body area scrolls independently.
          The dialog max-height is constrained to 100dvh minus 4rem.
        </p>
        <div className="dialog-page__preview dialog-page__preview--col">
          <Button onClick={() => setScrollOpen(true)}>Open Scrolling Dialog</Button>
          <CopyBlock
            code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Terms of Service"
  size="md"
>
  <div style={{ maxBlockSize: '300px', overflowY: 'auto' }}>
    {/* Long content here */}
  </div>
</Dialog>`}
            language="typescript"
            showLineNumbers
          />
        </div>
        <Dialog
          open={scrollOpen}
          onClose={() => setScrollOpen(false)}
          title="Terms of Service"
          description="Please review the following terms before continuing."
        >
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--text-sm, 0.875rem)' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i} style={{ margin: '0 0 1rem' }}>
                {i === 0
                  ? 'These terms govern your use of our services. By accessing or using the service, you agree to be bound by these terms. If you do not agree, please do not use the service.'
                  : i === 1
                  ? 'We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.'
                  : i === 2
                  ? 'You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.'
                  : i === 3
                  ? 'The service is provided "as is" without warranties of any kind, either express or implied.'
                  : i === 4
                  ? 'We may terminate or suspend your access to the service at our sole discretion, without notice, for conduct that we believe violates these terms.'
                  : `Section ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
                }
              </p>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBlockStart: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setScrollOpen(false)}>Decline</Button>
            <Button variant="primary" onClick={() => setScrollOpen(false)}>Accept</Button>
          </div>
        </Dialog>
      </section>

      <Divider spacing="sm" />

      {/* ── 5. Confirm Dialog ──────────────────────────── */}
      <section className="dialog-page__section" id="confirm">
        <h2 className="dialog-page__section-title">
          <a href="#confirm">Confirm Dialog (Danger)</a>
        </h2>
        <p className="dialog-page__section-desc">
          ConfirmDialog is a preset that wraps Dialog with confirm/cancel actions.
          The danger variant uses a red confirm button for destructive actions.
        </p>
        <div className="dialog-page__preview dialog-page__preview--col">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Delete Project</Button>
          <CopyBlock
            code={`import { ConfirmDialog } from '@annondeveloper/ui-kit'

<ConfirmDialog
  open={open}
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
  title="Delete Project?"
  description="This action cannot be undone. All data will be permanently removed."
  confirmLabel="Delete"
  cancelLabel="Keep"
  variant="danger"
/>`}
            language="typescript"
            showLineNumbers
          />
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
          title="Delete Project?"
          description="This action cannot be undone. All project data, including deployments, environment variables, and logs will be permanently removed."
          confirmLabel="Delete"
          cancelLabel="Keep"
          variant="danger"
        />
      </section>

      <Divider spacing="sm" />

      {/* ── 6. Nested Dialogs ──────────────────────────── */}
      <section className="dialog-page__section" id="nested">
        <h2 className="dialog-page__section-title">
          <a href="#nested">Nested Dialogs</a>
        </h2>
        <p className="dialog-page__section-desc">
          Dialogs can be nested. The inner dialog opens on top of the outer one,
          and closing the inner returns focus to the outer dialog.
        </p>
        <div className="dialog-page__preview dialog-page__preview--col">
          <Button onClick={() => setNestedOuter(true)}>Open Nested Demo</Button>
          <CopyBlock
            code={`<Dialog open={outerOpen} onClose={() => setOuterOpen(false)} title="Outer Dialog">
  <p>This is the outer dialog.</p>
  <Button onClick={() => setInnerOpen(true)}>Open Inner</Button>

  <Dialog open={innerOpen} onClose={() => setInnerOpen(false)} title="Inner Dialog" size="sm">
    <p>This is the nested inner dialog.</p>
  </Dialog>
</Dialog>`}
            language="typescript"
            showLineNumbers
          />
        </div>
        <Dialog
          open={nestedOuter}
          onClose={() => setNestedOuter(false)}
          title="Outer Dialog"
          description="This is the outer dialog. Click the button to open a nested dialog on top."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This is the outer dialog. You can open another dialog on top of this one.
              The backdrop will stack and closing the inner dialog returns focus here.
            </p>
            <div>
              <Button onClick={() => setNestedInner(true)} icon={<Icon name="layers" size="sm" />}>
                Open Inner Dialog
              </Button>
            </div>
          </div>
          <Dialog
            open={nestedInner}
            onClose={() => setNestedInner(false)}
            title="Inner Dialog"
            description="This is a nested dialog."
            size="sm"
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This inner dialog sits on top of the outer one. Closing it will return
              focus to the outer dialog.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBlockStart: '1rem' }}>
              <Button variant="primary" onClick={() => setNestedInner(false)}>Close Inner</Button>
            </div>
          </Dialog>
        </Dialog>
      </section>

      <Divider spacing="sm" />

      {/* ── 7. All Sizes ───────────────────────────────── */}
      <section className="dialog-page__section" id="sizes">
        <h2 className="dialog-page__section-title">
          <a href="#sizes">All Sizes</a>
        </h2>
        <p className="dialog-page__section-desc">
          Four sizes to fit different content needs. On mobile with coarse pointer,
          sm and md sizes become full-width bottom sheets.
        </p>
        <div className="dialog-page__preview">
          <div className="dialog-page__labeled-row">
            {DIALOG_SIZES.map(s => (
              <div key={s} className="dialog-page__labeled-item">
                <Button size="sm" variant="secondary" onClick={() => openSizeDialog(s)}>
                  {s.toUpperCase()}
                </Button>
                <span className="dialog-page__item-label">
                  {s === 'sm' ? '400px' : s === 'md' ? '560px' : s === 'lg' ? '720px' : 'viewport'}
                </span>
              </div>
            ))}
          </div>
        </div>
        {DIALOG_SIZES.map(s => (
          <Dialog
            key={s}
            open={sizeDialogs[s]}
            onClose={() => closeSizeDialog(s)}
            title={`${s.toUpperCase()} Dialog`}
            description={`This dialog uses size="${s}" (max-width: ${s === 'sm' ? '400px' : s === 'md' ? '560px' : s === 'lg' ? '720px' : '100vw'}).`}
            size={s}
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Content inside a {s} dialog. The width is constrained to{' '}
              {s === 'sm' ? '400px' : s === 'md' ? '560px' : s === 'lg' ? '720px' : 'the full viewport'}.
              {s === 'full' && ' The full size dialog has no border-radius and spans the entire screen.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBlockStart: '1rem' }}>
              <Button variant="primary" onClick={() => closeSizeDialog(s)}>Close</Button>
            </div>
          </Dialog>
        ))}
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`<Dialog size="sm">Small — max 400px</Dialog>
<Dialog size="md">Medium — max 560px (default)</Dialog>
<Dialog size="lg">Large — max 720px</Dialog>
<Dialog size="full">Full — 100vw / 100dvh</Dialog>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 8. Motion Levels ───────────────────────────── */}
      <section className="dialog-page__section" id="motion">
        <h2 className="dialog-page__section-title">
          <a href="#motion">Motion Levels</a>
        </h2>
        <p className="dialog-page__section-desc">
          Dialog entry animation uses @starting-style for a smooth translateY + scale + opacity entrance.
          Level 0 disables all animation for instant show/hide.
        </p>
        <div className="dialog-page__preview">
          <div className="dialog-page__labeled-row">
            {([0, 1, 2, 3] as const).map(m => (
              <div key={m} className="dialog-page__labeled-item">
                <span className="dialog-page__item-label">
                  {m === 0 ? 'Instant' : m === 1 ? 'Subtle' : m === 2 ? 'Spring' : 'Cinematic'}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBlockStart: '0.75rem' }}>
          <CopyBlock
            code={`<Dialog motion={0}>Instant — no animation</Dialog>
<Dialog motion={1}>Subtle — CSS transition</Dialog>
<Dialog motion={2}>Spring — conservative spring</Dialog>
<Dialog motion={3}>Cinematic — full physics (default)</Dialog>`}
            language="typescript"
            showLineNumbers
          />
        </div>
      </section>

      <Divider spacing="sm" />

      {/* ── 9. Props API Table ─────────────────────────── */}
      <section className="dialog-page__section" id="props">
        <h2 className="dialog-page__section-title">
          <a href="#props">Dialog Props API</a>
        </h2>
        <p className="dialog-page__section-desc">
          All props accepted by Dialog. It also spreads any native {'<dialog>'} HTML attributes.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={dialogProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 10. ConfirmDialog Props ────────────────────── */}
      <section className="dialog-page__section" id="confirm-props">
        <h2 className="dialog-page__section-title">
          <a href="#confirm-props">ConfirmDialog Props API</a>
        </h2>
        <p className="dialog-page__section-desc">
          Props for the ConfirmDialog preset, which wraps Dialog with confirm/cancel actions.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={confirmDialogProps} />
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 11. Accessibility Notes ────────────────────── */}
      <section className="dialog-page__section" id="accessibility">
        <h2 className="dialog-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="dialog-page__section-desc">
          Built on the native {'<dialog>'} element with showModal() for proper modal semantics.
        </p>
        <Card variant="default" padding="md">
          <ul className="dialog-page__a11y-list">
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Native modal:</strong> Uses <code className="dialog-page__a11y-key">{'<dialog>'}</code> with <code className="dialog-page__a11y-key">showModal()</code> for built-in focus trapping and inert background.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> <code className="dialog-page__a11y-key">Escape</code> closes the dialog (configurable). Focus is trapped within the dialog while open.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Labels:</strong> Title linked via <code className="dialog-page__a11y-key">aria-labelledby</code>, description via <code className="dialog-page__a11y-key">aria-describedby</code>.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Close button:</strong> Has <code className="dialog-page__a11y-key">aria-label="Close"</code> for screen readers.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on close button via <code className="dialog-page__a11y-key">:focus-visible</code>.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Close button enforces 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="dialog-page__a11y-item">
              <span className="dialog-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="dialog-page__a11y-key">forced-colors: active</code> with visible borders on Canvas background.
              </span>
            </li>
          </ul>
        </Card>
      </section>

      <Divider spacing="sm" />

      {/* ── 12. Source Code ─────────────────────────────── */}
      <section className="dialog-page__section" id="source">
        <h2 className="dialog-page__section-title">
          <a href="#source">Source</a>
        </h2>
        <p className="dialog-page__section-desc">
          View the full component source on GitHub.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/dialog.tsx
          </a>
          <a
            href="https://github.com/annondeveloper/ui-kit/blob/v2/src/components/confirm-dialog.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="dialog-page__source-link"
          >
            <Icon name="code" size="sm" />
            src/components/confirm-dialog.tsx (ConfirmDialog)
          </a>
        </div>
      </section>
    </div>
  )
}
