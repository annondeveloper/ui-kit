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
    }

    .icons-toolbar {
      display: flex;
      gap: 0.75rem;
      margin-block-end: 1.5rem;
      align-items: center;
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
  }
`

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
    </div>
  )
}
