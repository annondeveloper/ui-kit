import { useState } from 'react'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { iconPaths } from '@ui/core/icons/paths'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

const allIcons = Object.keys(iconPaths) as IconName[]

const styles = css`
  @layer demo {
    .icons-page-header {
      margin-block-end: 1.5rem;
    }

    .icons-page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--text-primary);
      margin-block-end: 0.5rem;
      line-height: 1.2;
    }

    .icons-page-desc {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      text-wrap: balance;
    }

    .icons-toolbar {
      display: flex;
      gap: 0.75rem;
      margin-block-end: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
      flex-wrap: wrap;
    }

    .icons-search {
      flex: 1;
      min-width: 180px;
      max-width: 280px;
      padding: 0.5rem 0.75rem 0.5rem 2rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: var(--bg-surface);
      color: var(--text-primary);
      font-size: 0.8125rem;
      outline: none;
      transition: border-color 0.15s;
    }
    .icons-search:focus {
      border-color: var(--brand);
    }

    .icons-search-wrap {
      position: relative;
      flex: 1;
      min-width: 180px;
      max-width: 280px;
    }

    .icons-search-icon {
      position: absolute;
      left: 0.625rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      pointer-events: none;
    }

    .icons-size-group {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .icons-size-btn {
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.1s;
    }
    .icons-size-btn--active {
      border-color: var(--brand);
      background: var(--brand-subtle);
      color: var(--brand);
    }

    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 0.5rem;
    }

    @media (max-width: 500px) {
      .icons-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .icons-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      cursor: pointer;
      transition: all 0.15s;
      color: var(--text-primary);
    }
    .icons-card:hover {
      border-color: var(--border-strong);
      background: var(--bg-elevated);
    }
    .icons-card--copied {
      border-color: var(--brand);
      background: var(--brand-subtle);
    }

    .icons-card-label {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      text-align: center;
      word-break: break-all;
      line-height: 1.2;
    }
    .icons-card--copied .icons-card-label {
      color: var(--brand);
    }

    .icons-empty {
      text-align: center;
      color: var(--text-tertiary);
      padding: 2rem;
      font-size: 0.875rem;
    }

    .icons-count {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-inline-start: auto;
    }

    /* ── Usage Section ──────────────────────────────────── */

    .icons-section {
      margin-block-start: 2.5rem;
      padding-block-start: 2rem;
      border-block-start: 1px solid var(--border-subtle);
    }

    .icons-section-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 1rem;
      line-height: 1.3;
    }

    .icons-code-block {
      padding: 1rem 1.25rem;
      border-radius: var(--radius-md);
      background: var(--bg-inset);
      border: 1px solid var(--border-subtle);
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.8125rem;
      line-height: 1.6;
      color: var(--text-primary);
      overflow-x: auto;
      white-space: pre;
      margin-block-end: 1.5rem;
    }

    .icons-a11y-tip {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md);
      background: var(--brand-subtle);
      border: 1px solid var(--brand);
      margin-block-end: 1.5rem;
    }

    .icons-a11y-icon {
      flex-shrink: 0;
      color: var(--brand);
      margin-block-start: 0.125rem;
    }

    .icons-a11y-text {
      font-size: 0.8125rem;
      color: var(--text-primary);
      line-height: 1.5;
    }

    .icons-a11y-text strong {
      font-weight: 700;
    }

    /* ── Sizes Reference ────────────────────────────────── */

    .icons-sizes-row {
      display: flex;
      align-items: flex-end;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .icons-sizes-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .icons-sizes-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--text-primary);
    }

    .icons-sizes-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-tertiary);
      text-align: center;
    }

    .icons-sizes-px {
      font-size: 0.625rem;
      color: var(--text-tertiary);
    }
  }
`

const sizeMap: { label: string; size: 'sm' | 'md' | 'lg' | number; px: string }[] = [
  { label: 'sm', size: 'sm', px: '16px' },
  { label: 'md', size: 'md', px: '20px' },
  { label: 'lg', size: 'lg', px: '24px' },
  { label: 'xl', size: 32, px: '32px' },
]

export default function IconsPage() {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [copied, setCopied] = useState('')

  useStyles('icons-page', styles)

  const filtered = allIcons.filter(n => n.includes(search.toLowerCase()))

  const copyName = (name: string) => {
    navigator.clipboard?.writeText(`<Icon name="${name}" />`)
    setCopied(name)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div>
      <div className="icons-page-header">
        <h1 className="icons-page-title">Icons</h1>
        <p className="icons-page-desc">
          {allIcons.length} built-in SVG icons. Click any icon to copy its usage code.
        </p>
      </div>

      <div className="icons-toolbar">
        <div className="icons-search-wrap">
          <span className="icons-search-icon">
            <Icon name="search" size={14} />
          </span>
          <input
            className="icons-search"
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div className="icons-size-group">
          {(['sm', 'md', 'lg'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`icons-size-btn${size === s ? ' icons-size-btn--active' : ''}`}
            >{s}</button>
          ))}
        </div>
        <span className="icons-count">{filtered.length} icons</span>
      </div>

      <div className="icons-grid">
        {filtered.map(name => (
          <button
            key={name}
            onClick={() => copyName(name)}
            className={`icons-card${copied === name ? ' icons-card--copied' : ''}`}
          >
            <Icon name={name} size={size} />
            <span className="icons-card-label">
              {copied === name ? 'Copied!' : name}
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="icons-empty">
          No icons matching &ldquo;{search}&rdquo;
        </p>
      )}

      {/* ── Usage Section ──────────────────────────────────── */}
      <div className="icons-section">
        <h2 className="icons-section-title">Usage</h2>
        <div className="icons-code-block">{`import { Icon } from '@annondeveloper/ui-kit'

<Icon name="check" size="md" />
<Icon name="search" size={24} />
<Icon name="settings" size="lg" className="my-icon" />`}</div>

        {/* Accessibility */}
        <div className="icons-a11y-tip">
          <span className="icons-a11y-icon">
            <Icon name="info" size={16} />
          </span>
          <span className="icons-a11y-text">
            <strong>Accessibility:</strong> Always pair icons with{' '}
            <code>aria-label</code> or visible text for screen readers.
            Decorative icons should use <code>aria-hidden=&quot;true&quot;</code>{' '}
            (applied by default when no label is provided).
          </span>
        </div>

        {/* Sizes Reference */}
        <h2 className="icons-section-title">Sizes</h2>
        <div className="icons-sizes-row">
          {sizeMap.map(s => (
            <div key={s.label} className="icons-sizes-item">
              <div className="icons-sizes-icon">
                <Icon name="check-circle" size={s.size} />
              </div>
              <span className="icons-sizes-label">{s.label}</span>
              <span className="icons-sizes-px">{s.px}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
