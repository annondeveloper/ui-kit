'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { CodeEditor } from '@ui/domain/code-editor'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Sample Code ─────────────────────────────────────────────────────────────

const TS_SAMPLE = `import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  active: boolean
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  return { users, loading }
}`

const JSON_SAMPLE = `{
  "name": "@ui-kit/core",
  "version": "2.3.0",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./css/*": "./dist/css/*"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`

const PYTHON_SAMPLE = `def fibonacci(n: int) -> list[int]:
    """Generate the first n Fibonacci numbers."""
    if n <= 0:
        return []
    sequence = [0, 1]
    for _ in range(2, n):
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

# Print first 10 numbers
for num in fibonacci(10):
    print(num)`

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'value', type: 'string', description: 'Controlled editor content.' },
  { name: 'defaultValue', type: 'string', description: 'Initial content for uncontrolled mode.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Called on every content change.' },
  { name: 'language', type: "'javascript' | 'typescript' | 'json' | 'html' | 'css' | 'python' | 'bash' | 'sql' | 'plain'", default: "'plain'", description: 'Language for syntax highlighting.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Prevent editing when true.' },
  { name: 'showLineNumbers', type: 'boolean', default: 'true', description: 'Show line number gutter.' },
  { name: 'lineNumberStart', type: 'number', default: '1', description: 'First line number to display.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text when the editor is empty.' },
  { name: 'minHeight', type: 'string | number', description: 'Minimum block size of the editor area.' },
  { name: 'maxHeight', type: 'string | number', description: 'Maximum block size before scrolling.' },
  { name: 'wordWrap', type: 'boolean', default: 'false', description: 'Wrap long lines instead of horizontal scroll.' },
  { name: 'tabSize', type: 'number', default: '2', description: 'Number of spaces per tab indent.' },
  { name: 'highlightActiveLine', type: 'boolean', default: 'true', description: 'Highlight the line containing the cursor.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for cursor and scroll transitions.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.code-editor-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .code-editor-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .code-editor-page__hero::before {
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
      @media (prefers-reduced-motion: reduce) { .code-editor-page__hero::before { animation: none; } }

      .code-editor-page__title {
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

      .code-editor-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .code-editor-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .code-editor-page__import-code {
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

      .code-editor-page__section {
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
        .code-editor-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .code-editor-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .code-editor-page__section-title a { color: inherit; text-decoration: none; }
      .code-editor-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .code-editor-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .code-editor-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .code-editor-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .code-editor-page__lang-tabs {
        display: flex;
        gap: 0.5rem;
        margin-block-end: 1rem;
        flex-wrap: wrap;
      }

      .code-editor-page__char-count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        margin-block-start: 0.75rem;
        text-align: end;
      }
    }
  }
`

const IMPORT_STR = "import { CodeEditor } from '@ui/domain/code-editor'"

type Lang = 'typescript' | 'json' | 'python'

// ─── Component ───────────────────────────────────────────────────────────────

export default function CodeEditorPage() {
  useStyles('code-editor-page', pageStyles)

  const [lang, setLang] = useState<Lang>('typescript')
  const [code, setCode] = useState(TS_SAMPLE)

  const SAMPLES: Record<Lang, string> = { typescript: TS_SAMPLE, json: JSON_SAMPLE, python: PYTHON_SAMPLE }

  useEffect(() => {
    const sections = document.querySelectorAll('.code-editor-page__section')
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
    <div className="code-editor-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="code-editor-page__hero">
        <h1 className="code-editor-page__title">CodeEditor</h1>
        <p className="code-editor-page__desc">
          Lightweight code editor with built-in syntax highlighting for 8 languages, line numbers,
          active line highlight, and keyboard shortcuts. Zero external dependencies.
        </p>
        <div className="code-editor-page__import-row">
          <code className="code-editor-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Multi-Language ─────────────────────────── */}
      <section className="code-editor-page__section" id="languages">
        <h2 className="code-editor-page__section-title"><a href="#languages">Multi-Language Highlighting</a></h2>
        <p className="code-editor-page__section-desc">
          Switch between languages to see syntax highlighting adapt. The editor tokenizes
          keywords, strings, comments, numbers, and operators per language grammar.
        </p>
        <div className="code-editor-page__lang-tabs">
          {(['typescript', 'json', 'python'] as Lang[]).map(l => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? 'primary' : 'outline'}
              onClick={() => { setLang(l); setCode(SAMPLES[l]) }}
            >
              {l}
            </Button>
          ))}
        </div>
        <div className="code-editor-page__preview">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={lang}
            showLineNumbers
            highlightActiveLine
            maxHeight="400px"
          />
          <div className="code-editor-page__char-count">{code.length} characters</div>
        </div>
      </section>

      {/* ── 2. Read-Only ──────────────────────────────── */}
      <section className="code-editor-page__section" id="readonly">
        <h2 className="code-editor-page__section-title"><a href="#readonly">Read-Only Mode</a></h2>
        <p className="code-editor-page__section-desc">
          Use <code>readOnly</code> for documentation snippets or config display. The cursor changes
          to default and input is disabled while keeping selection and copy functionality.
        </p>
        <div className="code-editor-page__preview">
          <CodeEditor
            value={JSON_SAMPLE}
            language="json"
            readOnly
            showLineNumbers
          />
        </div>
      </section>

      {/* ── 3. Customization ──────────────────────────── */}
      <section className="code-editor-page__section" id="options">
        <h2 className="code-editor-page__section-title"><a href="#options">Customization Options</a></h2>
        <p className="code-editor-page__section-desc">
          Hide line numbers, enable word wrap for narrow containers, adjust tab size, or
          set a placeholder for empty editors.
        </p>
        <div className="code-editor-page__preview">
          <CodeEditor
            defaultValue=""
            language="typescript"
            placeholder="Start typing your code here..."
            showLineNumbers={false}
            wordWrap
            minHeight="120px"
          />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="code-editor-page__section" id="props">
        <h2 className="code-editor-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
