'use client'

import { useState } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Highlight } from '@ui/components/highlight'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const PAGE = 'highlight-page'

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
        flex-direction: column;
        gap: 1.5rem;
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

      .${PAGE}__search-input {
        position: relative;
        padding: 0.625rem 1rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-default);
        background: var(--bg-elevated);
        color: var(--text-primary);
        font-size: var(--text-sm, 0.875rem);
        inline-size: 100%;
        max-inline-size: 320px;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .${PAGE}__search-input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      .${PAGE}__sample-text {
        position: relative;
        font-size: var(--text-base, 1rem);
        line-height: 1.7;
        color: var(--text-primary);
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .${PAGE}__labeled-item {
        display: flex;
        flex-direction: column;
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
  { name: 'children', type: 'string', required: true, description: 'The text content to search within and render.' },
  { name: 'highlight', type: 'string | string[]', required: true, description: 'Search term(s) to highlight. Matching substrings are wrapped in <mark> elements.' },
  { name: 'color', type: 'string', description: 'Background color for highlighted segments.' },
  { name: 'caseSensitive', type: 'boolean', default: 'false', description: 'Whether matching is case-sensitive.' },
  { name: 'highlightClassName', type: 'string', description: 'CSS class applied to each highlighted <mark> element.' },
]

const IMPORT = "import { Highlight } from '@ui/components/highlight'"

const SAMPLE_TEXT =
  'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small, isolated pieces of code called components. React makes it painless to create interactive UIs.'

// ─── Component ───────────────────────────────────────────────────────────────

export default function HighlightPage() {
  useStyles(pageStyles)

  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('React')

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
        <h1 className={`${PAGE}__title`}>Highlight</h1>
        <p className={`${PAGE}__desc`}>
          Text highlighting component that wraps matching substrings in mark elements.
          Useful for search result previews and keyword emphasis.
        </p>
        <div className={`${PAGE}__import-row`}>
          <code className={`${PAGE}__import-code`}>{IMPORT}</code>
          <Button size="sm" variant="secondary" className={`${PAGE}__copy-btn`} onClick={copyImport}
            icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* ── 1. Live Search ───────────────────────────────── */}
      <section className={`${PAGE}__section`} id="live-search">
        <h2 className={`${PAGE}__section-title`}><a href="#live-search">Live Search Highlighting</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Type in the search box to see matching text highlighted in real time.
          The component splits the text and wraps matches in styled mark elements.
        </p>
        <div className={`${PAGE}__preview`}>
          <input
            type="text"
            className={`${PAGE}__search-input`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to highlight..."
            aria-label="Search text to highlight"
          />
          <div className={`${PAGE}__sample-text`}>
            <Highlight highlight={search}>{SAMPLE_TEXT}</Highlight>
          </div>
        </div>
      </section>

      {/* ── 2. Multiple Terms & Options ──────────────────── */}
      <section className={`${PAGE}__section`} id="multiple">
        <h2 className={`${PAGE}__section-title`}><a href="#multiple">Multiple Terms & Options</a></h2>
        <p className={`${PAGE}__section-desc`}>
          Pass an array of strings to highlight multiple terms simultaneously.
          Use custom colors and case-sensitive matching for precise control.
        </p>
        <div className={`${PAGE}__preview`}>
          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>multiple terms: ["React", "components", "UIs"]</span>
            <div className={`${PAGE}__sample-text`}>
              <Highlight highlight={['React', 'components', 'UIs']}>{SAMPLE_TEXT}</Highlight>
            </div>
          </div>

          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>custom color (oklch green)</span>
            <div className={`${PAGE}__sample-text`}>
              <Highlight highlight="JavaScript" color="oklch(75% 0.15 145 / 0.3)">{SAMPLE_TEXT}</Highlight>
            </div>
          </div>

          <div className={`${PAGE}__labeled-item`}>
            <span className={`${PAGE}__item-label`}>case-sensitive: "react" (no match) vs "React" (match)</span>
            <div className={`${PAGE}__sample-text`}>
              <Highlight highlight="react" caseSensitive>{SAMPLE_TEXT}</Highlight>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Props API ─────────────────────────────────── */}
      <section className={`${PAGE}__section`} id="props">
        <h2 className={`${PAGE}__section-title`}><a href="#props">Props API</a></h2>
        <p className={`${PAGE}__section-desc`}>All available props for Highlight.</p>
        <Card variant="default" padding="md">
          <PropsTable props={PROPS} />
        </Card>
      </section>
    </div>
  )
}
