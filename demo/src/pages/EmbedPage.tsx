'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Component list ────────────────────────────────────────────────────────────

const embeddableComponents = [
  'Button', 'Badge', 'Card', 'Alert', 'Progress', 'Skeleton',
  'Avatar', 'StatusBadge', 'Divider', 'Tooltip', 'Checkbox',
  'ToggleSwitch', 'Slider', 'Rating', 'Tabs', 'Accordion',
  'MetricCard', 'Sparkline', 'RingChart', 'ThresholdGauge',
  'UtilizationBar', 'ConfidenceBar', 'StatusPulse', 'Chip',
  'SegmentedControl', 'Breadcrumbs', 'Pagination',
]

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .embed-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    .embed-page__header {
      margin-block-end: 2rem;
    }

    .embed-page__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
      text-wrap: balance;
    }

    .embed-page__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* ── Section ───────────────────────────────────── */

    .embed-page__section {
      margin-block-end: 2.5rem;
    }

    .embed-page__section-title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 1rem;
    }

    /* ── Generator form ────────────────────────────── */

    .embed-page__form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-block-end: 1.5rem;
    }

    @media (max-width: 600px) {
      .embed-page__form {
        grid-template-columns: 1fr;
      }
    }

    .embed-page__field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .embed-page__label {
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .embed-page__select,
    .embed-page__input {
      padding: 0.5rem 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--text-primary);
      font-size: var(--text-sm, 0.875rem);
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
    }

    .embed-page__select:focus,
    .embed-page__input:focus {
      border-color: var(--brand);
    }

    .embed-page__select option {
      background: var(--bg-base);
    }

    /* ── Code output ───────────────────────────────── */

    .embed-page__code-wrap {
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
      overflow: hidden;
    }

    .embed-page__code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-block-end: 1px solid var(--border-subtle);
    }

    .embed-page__code-title {
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .embed-page__copy-btn {
      padding: 0.25rem 0.75rem;
      background: var(--bg-hover);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-sm, 0.375rem);
      color: var(--text-secondary);
      font-size: var(--text-xs, 0.75rem);
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, color 0.15s;
    }

    .embed-page__copy-btn:hover {
      background: var(--bg-active);
      color: var(--text-primary);
    }

    .embed-page__code {
      padding: 1rem;
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: auto;
      white-space: pre;
      margin: 0;
    }

    /* ── Preview iframe ────────────────────────────── */

    .embed-page__preview-wrap {
      margin-block-start: 1.5rem;
    }

    .embed-page__preview-label {
      font-size: var(--text-xs, 0.75rem);
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-block-end: 0.5rem;
    }

    .embed-page__preview-frame {
      width: 100%;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-base);
    }

    /* ── Info cards ─────────────────────────────────── */

    .embed-page__cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .embed-page__card {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.25rem;
    }

    .embed-page__card-title {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 0.5rem;
    }

    .embed-page__card-text {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .embed-page__card code {
      font-family: 'SF Mono', 'Cascadia Code', monospace;
      font-size: var(--text-xs, 0.75rem);
      background: var(--bg-surface);
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-sm, 0.375rem);
      color: var(--brand-light);
    }
  }
`

// ─── Page Component ────────────────────────────────────────────────────────────

export default function EmbedPage() {
  useStyles('embed-page', styles)

  const [component, setComponent] = useState('Button')
  const [width, setWidth] = useState('400')
  const [height, setHeight] = useState('200')
  const [theme, setTheme] = useState('dark')
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : ''

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      component,
      theme,
    })
    return `${baseUrl}embed/${component.toLowerCase()}?${params.toString()}`
  }, [component, theme, baseUrl])

  const iframeCode = useMemo(() => {
    return `<iframe
  src="${embedUrl}"
  width="${width}"
  height="${height}"
  style="border: none; border-radius: 8px;"
  title="${component} - ui-kit embed"
  loading="lazy"
></iframe>`
  }, [embedUrl, width, height, component])

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="embed-page">
      <header className="embed-page__header">
        <h1 className="embed-page__title">Embed Components</h1>
        <p className="embed-page__subtitle">
          Embed any ui-kit component into external sites, documentation, or blog posts using iframes.
          Select a component below to generate the embed code.
        </p>
      </header>

      {/* Generator section */}
      <section className="embed-page__section">
        <h2 className="embed-page__section-title">Embed Code Generator</h2>

        <div className="embed-page__form">
          <div className="embed-page__field">
            <label className="embed-page__label" htmlFor="embed-component">Component</label>
            <select
              id="embed-component"
              className="embed-page__select"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
            >
              {embeddableComponents.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="embed-page__field">
            <label className="embed-page__label" htmlFor="embed-theme">Theme</label>
            <select
              id="embed-theme"
              className="embed-page__select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          <div className="embed-page__field">
            <label className="embed-page__label" htmlFor="embed-width">Width (px)</label>
            <input
              id="embed-width"
              className="embed-page__input"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              min="100"
              max="1200"
            />
          </div>

          <div className="embed-page__field">
            <label className="embed-page__label" htmlFor="embed-height">Height (px)</label>
            <input
              id="embed-height"
              className="embed-page__input"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="50"
              max="800"
            />
          </div>
        </div>

        {/* Generated code */}
        <div className="embed-page__code-wrap">
          <div className="embed-page__code-header">
            <span className="embed-page__code-title">HTML Embed Code</span>
            <button className="embed-page__copy-btn" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="embed-page__code">{iframeCode}</pre>
        </div>

        {/* Live preview */}
        <div className="embed-page__preview-wrap">
          <div className="embed-page__preview-label">Live Preview</div>
          <iframe
            className="embed-page__preview-frame"
            src={embedUrl}
            width={width}
            height={height}
            title={`${component} embed preview`}
            loading="lazy"
          />
        </div>
      </section>

      {/* Documentation section */}
      <section className="embed-page__section">
        <h2 className="embed-page__section-title">How It Works</h2>

        <div className="embed-page__cards">
          <div className="embed-page__card">
            <div className="embed-page__card-title">Isolation</div>
            <p className="embed-page__card-text">
              Each embed route (<code>/embed/:component</code>) renders the component in complete isolation
              -- no sidebar, no header, just the component with its theme.
            </p>
          </div>

          <div className="embed-page__card">
            <div className="embed-page__card-title">Theming</div>
            <p className="embed-page__card-text">
              Pass <code>?theme=dark</code> or <code>?theme=light</code> to control the appearance.
              The embed inherits all Aurora Fluid design tokens.
            </p>
          </div>

          <div className="embed-page__card">
            <div className="embed-page__card-title">Responsive</div>
            <p className="embed-page__card-text">
              Components use container queries internally, so they automatically adapt to whatever
              iframe dimensions you specify.
            </p>
          </div>

          <div className="embed-page__card">
            <div className="embed-page__card-title">Performance</div>
            <p className="embed-page__card-text">
              Embeds are lazy-loaded and tree-shaken. Only the component code and theme CSS
              are included in the iframe bundle.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
