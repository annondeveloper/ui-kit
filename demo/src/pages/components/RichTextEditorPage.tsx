'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { RichTextEditor } from '@ui/domain/rich-text-editor'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled HTML content string.' },
  { name: 'defaultValue', type: 'string', description: 'Initial HTML content for uncontrolled mode.' },
  { name: 'onChange', type: '(html: string) => void', description: 'Called on every content change with sanitized HTML.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text shown when the editor is empty.' },
  { name: 'label', type: 'string', description: 'Accessible label rendered above the editor.' },
  { name: 'error', type: 'string', description: 'Error message displayed below the editor.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all editing and toolbar interactions.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Allow reading and selection but prevent edits.' },
  { name: 'minHeight', type: 'string | number', description: 'Minimum block size of the editable area.' },
  { name: 'maxHeight', type: 'string | number', description: 'Maximum block size before the content scrolls.' },
  { name: 'toolbar', type: 'ToolbarAction[]', default: 'all actions', description: 'Array of toolbar actions to display. Options: bold, italic, underline, strikethrough, heading, bulletList, orderedList, blockquote, code, link, clearFormatting.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls font-size and padding of the editor.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for toolbar hover and focus effects.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.rte-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .rte-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .rte-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .rte-page__hero::before { animation: none; } }

      .rte-page__title {
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

      .rte-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .rte-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .rte-page__import-code {
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

      .rte-page__section {
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
        .rte-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .rte-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .rte-page__section-title a { color: inherit; text-decoration: none; }
      .rte-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .rte-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .rte-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .rte-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .rte-page__output {
        margin-block-start: 1rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        background: oklch(0% 0 0 / 0.15);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        white-space: pre-wrap;
        word-break: break-all;
        max-block-size: 120px;
        overflow-y: auto;
      }

      .rte-page__output-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-block-start: 1rem;
        margin-block-end: 0.25rem;
      }
    }
  }
`

const IMPORT_STR = "import { RichTextEditor } from '@ui/domain/rich-text-editor'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function RichTextEditorPage() {
  useStyles('rte-page', pageStyles)

  const [html, setHtml] = useState('<p>Try <strong>bold</strong>, <em>italic</em>, and <a href="#">links</a>.</p>')

  useEffect(() => {
    const sections = document.querySelectorAll('.rte-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="rte-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="rte-page__hero">
        <h1 className="rte-page__title">RichTextEditor</h1>
        <p className="rte-page__desc">
          WYSIWYG rich text editor with a configurable toolbar, keyboard shortcuts, HTML sanitization,
          and accessible labeling. Zero dependencies -- uses contentEditable under the hood.
        </p>
        <div className="rte-page__import-row">
          <code className="rte-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Full Toolbar ───────────────────────────── */}
      <section className="rte-page__section" id="full">
        <h2 className="rte-page__section-title"><a href="#full">Full Toolbar</a></h2>
        <p className="rte-page__section-desc">
          All formatting actions enabled. Use keyboard shortcuts like <code>Ctrl+B</code> for bold,
          <code>Ctrl+I</code> for italic, and <code>Ctrl+K</code> for links.
        </p>
        <div className="rte-page__preview">
          <RichTextEditor
            value={html}
            onChange={setHtml}
            label="Post content"
            placeholder="Write something..."
            minHeight="160px"
          />
          <div className="rte-page__output-label">HTML Output</div>
          <div className="rte-page__output">{html}</div>
        </div>
      </section>

      {/* ── 2. Minimal Toolbar ────────────────────────── */}
      <section className="rte-page__section" id="minimal">
        <h2 className="rte-page__section-title"><a href="#minimal">Minimal Toolbar</a></h2>
        <p className="rte-page__section-desc">
          Restrict the toolbar to only the actions you need. Here we show just bold, italic,
          and link -- perfect for comment fields or inline editing.
        </p>
        <div className="rte-page__preview">
          <RichTextEditor
            defaultValue="<p>A simpler editing experience.</p>"
            toolbar={['bold', 'italic', 'link']}
            size="sm"
            placeholder="Add a comment..."
            minHeight="100px"
          />
        </div>
      </section>

      {/* ── 3. States ─────────────────────────────────── */}
      <section className="rte-page__section" id="states">
        <h2 className="rte-page__section-title"><a href="#states">States</a></h2>
        <p className="rte-page__section-desc">
          The editor supports error, disabled, and read-only states with appropriate
          visual feedback and ARIA attributes.
        </p>
        <div className="rte-page__preview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RichTextEditor
            defaultValue="<p>This field has a validation error.</p>"
            label="With error"
            error="Content must be at least 50 characters."
            minHeight="80px"
          />
          <RichTextEditor
            defaultValue="<p>This editor is disabled.</p>"
            label="Disabled"
            disabled
            minHeight="80px"
          />
          <RichTextEditor
            defaultValue="<p>This content is <strong>read-only</strong>. You can select and copy but not edit.</p>"
            label="Read-only"
            readOnly
            minHeight="80px"
          />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="rte-page__section" id="props">
        <h2 className="rte-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
