'use client'

import { useState, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { JsonViewer } from '@ui/domain/json-viewer'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SIMPLE_DATA = {
  name: 'Aurora UI Kit',
  version: '2.3.0',
  description: 'Zero-dependency React component library',
  tags: ['react', 'typescript', 'oklch'],
  author: { name: 'anon', email: 'dev@example.com' },
  published: true,
  downloads: 128_450,
}

const NESTED_DATA = {
  server: {
    host: 'api.example.com',
    port: 443,
    tls: true,
    routes: [
      { path: '/users', method: 'GET', auth: true },
      { path: '/health', method: 'GET', auth: false },
      { path: '/data', method: 'POST', auth: true, rateLimit: { max: 100, window: '1m' } },
    ],
    middleware: ['cors', 'helmet', 'compress'],
  },
  database: {
    host: 'db.internal',
    port: 5432,
    pool: { min: 2, max: 10, idle: 30000 },
  },
}

function makeCircularData() {
  const obj: Record<string, unknown> = { id: 1, label: 'root' }
  const child: Record<string, unknown> = { id: 2, label: 'child' }
  child.parent = obj
  obj.child = child
  return obj
}

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'data', type: 'unknown', required: true, description: 'The JSON data to display. Supports objects, arrays, primitives, null, and handles circular references.' },
  { name: 'initialExpandDepth', type: 'number', default: '1', description: 'Number of levels to expand by default on initial render.' },
  { name: 'collapsed', type: 'boolean', default: 'false', description: 'When true, all nodes start collapsed regardless of initialExpandDepth.' },
  { name: 'rootName', type: 'string', default: '"root"', description: 'Label shown for the root node.' },
  { name: 'enableClipboard', type: 'boolean', default: 'true', description: 'Show copy-to-clipboard button on hover for each value.' },
  { name: 'displayDataTypes', type: 'boolean', default: 'true', description: 'Show type annotations next to values (string, number, etc.).' },
  { name: 'displayObjectSize', type: 'boolean', default: 'true', description: 'Show item count badge next to objects and arrays.' },
  { name: 'theme', type: "'dark' | 'light' | 'auto'", default: '"auto"', description: 'Color scheme for syntax highlighting.' },
  { name: 'indentWidth', type: 'number', default: '2', description: 'Number of spaces per indentation level.' },
  { name: 'sortKeys', type: 'boolean', default: 'false', description: 'Alphabetically sort object keys.' },
  { name: 'maxStringLength', type: 'number', description: 'Truncate long strings to this character count with an ellipsis.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for expand/collapse transitions.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.json-viewer-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .json-viewer-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .json-viewer-page__hero::before {
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

      @keyframes aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .json-viewer-page__hero::before { animation: none; }
      }

      .json-viewer-page__title {
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

      .json-viewer-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .json-viewer-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .json-viewer-page__import-code {
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

      /* ── Sections ───────────────────────────────────── */

      .json-viewer-page__section {
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
        .json-viewer-page__section {
          opacity: 1; transform: none; filter: none; animation: none;
        }
      }

      .json-viewer-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .json-viewer-page__section-title a { color: inherit; text-decoration: none; }
      .json-viewer-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .json-viewer-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .json-viewer-page__preview {
        padding: 2rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .json-viewer-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .json-viewer-page__controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-block-end: 1rem;
      }
    }
  }
`

const IMPORT_STR = "import { JsonViewer } from '@ui/domain/json-viewer'"

// ─── Component ───────────────────────────────────────────────────────────────

export default function JsonViewerPage() {
  useStyles('json-viewer-page', pageStyles)

  const [expandDepth, setExpandDepth] = useState(1)
  const [sorted, setSorted] = useState(false)

  // Scroll reveal fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.json-viewer-page__section')
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
    <div className="json-viewer-page">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="json-viewer-page__hero">
        <h1 className="json-viewer-page__title">JsonViewer</h1>
        <p className="json-viewer-page__desc">
          Interactive JSON tree explorer with expand/collapse, syntax coloring, copy-to-clipboard,
          and safe circular reference handling. Ideal for API responses and debug panels.
        </p>
        <div className="json-viewer-page__import-row">
          <code className="json-viewer-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Basic Usage ───────────────────────────── */}
      <section className="json-viewer-page__section" id="basic">
        <h2 className="json-viewer-page__section-title"><a href="#basic">Basic Usage</a></h2>
        <p className="json-viewer-page__section-desc">
          Pass any serializable value to <code>data</code>. The viewer renders a collapsible tree
          with syntax highlighting and type annotations.
        </p>
        <div className="json-viewer-page__preview">
          <JsonViewer data={SIMPLE_DATA} rootName="package" initialExpandDepth={2} />
        </div>
      </section>

      {/* ── 2. Deep Nesting & Controls ───────────────── */}
      <section className="json-viewer-page__section" id="nested">
        <h2 className="json-viewer-page__section-title"><a href="#nested">Deep Nesting &amp; Controls</a></h2>
        <p className="json-viewer-page__section-desc">
          Control expand depth and key sorting. Click any node to toggle its children. Hover a value
          to reveal the copy button.
        </p>
        <div className="json-viewer-page__controls">
          <Button size="sm" variant={expandDepth === 0 ? 'primary' : 'outline'} onClick={() => setExpandDepth(0)}>Collapsed</Button>
          <Button size="sm" variant={expandDepth === 1 ? 'primary' : 'outline'} onClick={() => setExpandDepth(1)}>Depth 1</Button>
          <Button size="sm" variant={expandDepth === 3 ? 'primary' : 'outline'} onClick={() => setExpandDepth(3)}>Depth 3</Button>
          <Button size="sm" variant={sorted ? 'primary' : 'outline'} onClick={() => setSorted(!sorted)}>
            {sorted ? 'Sorted' : 'Unsorted'}
          </Button>
        </div>
        <div className="json-viewer-page__preview">
          <JsonViewer
            data={NESTED_DATA}
            rootName="config"
            initialExpandDepth={expandDepth}
            sortKeys={sorted}
            displayObjectSize
            displayDataTypes
          />
        </div>
      </section>

      {/* ── 3. Circular References ───────────────────── */}
      <section className="json-viewer-page__section" id="circular">
        <h2 className="json-viewer-page__section-title"><a href="#circular">Circular References</a></h2>
        <p className="json-viewer-page__section-desc">
          JsonViewer safely detects and renders circular references with a visual indicator
          instead of throwing a stack overflow.
        </p>
        <div className="json-viewer-page__preview">
          <JsonViewer data={makeCircularData()} rootName="circular" initialExpandDepth={3} />
        </div>
      </section>

      {/* ── Props ────────────────────────────────────── */}
      <section className="json-viewer-page__section" id="props">
        <h2 className="json-viewer-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
