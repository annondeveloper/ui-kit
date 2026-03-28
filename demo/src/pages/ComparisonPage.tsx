'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { renderComponentPreview } from '../utils/component-previews'
import { getComponentDatabase } from '../utils/component-database'

// ─── Size estimates by tier ────────────────────────────────────────────────────

function tierSize(standardKB: number, tier: 'lite' | 'standard' | 'premium'): string {
  if (tier === 'lite') return `~${(standardKB * 0.15).toFixed(1)} KB`
  if (tier === 'premium') return `~${(standardKB * 1.6).toFixed(1)} KB`
  return `~${standardKB.toFixed(1)} KB`
}

function tierDescription(tier: 'lite' | 'standard' | 'premium'): string {
  if (tier === 'lite') return 'No motion, no style injection, minimal wrapper'
  if (tier === 'premium') return 'Aurora glow, spring physics, shimmer, particles'
  return 'Full features, CSS scoped styles, motion levels 0-3'
}

// Rough standard-tier sizes by component type
const SIZE_MAP: Record<string, number> = {
  // Small
  Badge: 0.9, Divider: 0.5, Kbd: 0.4, Typography: 0.8, StatusPulse: 0.7,
  Indicator: 0.7, CopyButton: 0.8, Chip: 1.0, BackToTop: 0.8, Skeleton: 0.6,
  // Medium
  Button: 1.6, Card: 1.1, Alert: 1.8, Avatar: 1.4, Progress: 1.0,
  Checkbox: 1.2, ToggleSwitch: 1.1, FormInput: 1.5, SearchInput: 1.8,
  Select: 2.3, Tabs: 2.2, Tooltip: 1.5, Breadcrumbs: 1.3, Pagination: 2.0,
  // Large
  DataTable: 5.5, MetricCard: 3.8, Dialog: 2.2, DatePicker: 4.5,
  CommandBar: 4.0, Calendar: 4.2, TimeSeriesChart: 4.8,
}

function getStandardSize(name: string): number {
  return SIZE_MAP[name] ?? 1.8
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .comp {
      max-width: 1400px;
      margin: 0 auto;
    }
    .comp__header {
      margin-block-end: 2rem;
    }
    .comp__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
    }
    .comp__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* Selector */
    .comp__selector {
      margin-block-end: 2rem;
    }
    .comp__select {
      width: 100%;
      max-width: 400px;
      padding: 0.625rem 1rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-family: inherit;
      cursor: pointer;
      outline: none;
      box-shadow: var(--shadow-sm);
    }
    .comp__select:focus {
      border-color: var(--brand);
    }

    /* Grid */
    .comp__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .comp__grid {
        grid-template-columns: 1fr;
      }
    }

    /* Column */
    .comp__col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
    }
    .comp__col-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-block-end: 0.75rem;
      border-block-end: 2px solid var(--border-default);
    }
    .comp__col-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .comp__col-dot--lite { background: var(--status-ok); }
    .comp__col-dot--standard { background: var(--brand); }
    .comp__col-dot--premium { background: oklch(65% 0.18 300); }
    .comp__col-label {
      font-size: var(--text-sm);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .comp__col-label--lite { color: var(--status-ok); }
    .comp__col-label--standard { color: var(--brand); }
    .comp__col-label--premium { color: oklch(65% 0.18 300); }

    /* Preview */
    .comp__preview {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.25rem;
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      box-shadow: var(--shadow-sm);
    }
    .comp__preview > * {
      max-width: 100%;
    }

    /* Tier description */
    .comp__tier-desc {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      line-height: 1.4;
      font-style: italic;
    }

    /* Import */
    .comp__import {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.5rem 0.75rem;
      font-family: 'SF Mono', 'Cascadia Code', monospace;
      font-size: 0.6875rem;
      color: var(--text-secondary);
      overflow-x: auto;
      white-space: nowrap;
    }

    /* Size */
    .comp__size {
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm);
      background: var(--bg-hover);
    }
    .comp__size--lite { color: var(--status-ok); }
    .comp__size--standard { color: var(--brand); }
    .comp__size--premium { color: oklch(65% 0.18 300); }

    /* Empty state */
    .comp__empty {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-tertiary);
      font-size: var(--text-sm);
    }

    /* Info */
    .comp__info {
      margin-block-start: 2rem;
      padding: 1.25rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
    }
    .comp__info-title {
      font-size: var(--text-sm);
      font-weight: 700;
      margin-block-end: 0.5rem;
    }
    .comp__info-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
`

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ComparisonPage() {
  useStyles('comparison-page', styles)
  const allComponents = useMemo(() => getComponentDatabase(), [])
  const [selected, setSelected] = useState('')

  const comp = allComponents.find(c => c.name === selected)

  return (
    <div className="comp">
      <header className="comp__header">
        <h1 className="comp__title">Tier Comparison</h1>
        <p className="comp__subtitle">
          Compare Lite, Standard, and Premium tiers side by side.
          Select any of the 147 components to see how they render in each tier.
        </p>
      </header>

      <div className="comp__selector">
        <select
          className="comp__select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Select a component to compare"
        >
          <option value="">Select a component...</option>
          {allComponents.map(c => (
            <option key={c.name} value={c.name}>{c.name} — {c.category}</option>
          ))}
        </select>
      </div>

      {!comp ? (
        <div className="comp__empty">
          Choose a component above to see the Lite / Standard / Premium comparison.
        </div>
      ) : (
        <div className="comp__grid">
          {(['lite', 'standard', 'premium'] as const).map(tier => {
            const stdSize = getStandardSize(comp.name)
            return (
              <div key={tier} className="comp__col">
                <div className="comp__col-header">
                  <span className={`comp__col-dot comp__col-dot--${tier}`} />
                  <span className={`comp__col-label comp__col-label--${tier}`}>{tier}</span>
                </div>

                <div className="comp__preview">
                  {renderComponentPreview(comp.name)}
                </div>

                <div className="comp__tier-desc">{tierDescription(tier)}</div>

                <div className="comp__import">
                  {tier === 'standard'
                    ? `import { ${comp.name} } from '@annondeveloper/ui-kit'`
                    : `import { ${comp.name} } from '@annondeveloper/ui-kit/${tier}'`
                  }
                </div>

                <div className={`comp__size comp__size--${tier}`}>
                  {tierSize(stdSize, tier)} gzip
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="comp__info">
        <div className="comp__info-title">About Weight Tiers</div>
        <p className="comp__info-text">
          <strong>Lite</strong> (~15% of Standard) — Minimal forwardRef wrappers, no animation, no style injection. 20-30 lines each.
          <br /><strong>Standard</strong> (default) — Full CSS scoped styles, motion levels 0-3, keyboard navigation, ARIA patterns.
          <br /><strong>Premium</strong> (~160% of Standard) — Aurora glow, spring physics, shimmer gradients, particle effects on top of Standard.
        </p>
      </div>
    </div>
  )
}
