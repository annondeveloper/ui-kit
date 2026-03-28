'use client'

import {
  useState,
  useCallback,
  type JSX,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import type { DataInsight } from './data-table-ai'

// ─── Types ────────────────────────────────────────────────────────────

export interface DataTableSuggestionsProps {
  insights: DataInsight[]
  onApply?: (insight: DataInsight) => void
  onDismiss?: (id: string) => void
}

// ─── Styles ───────────────────────────────────────────────────────────

const suggestionsStyles = css`
  @layer components {
    @scope (.ui-data-table-suggestions) {
      :scope {
        border: 1px solid var(--border-default, oklch(30% 0 0));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(18% 0.01 270));
        overflow: hidden;
      }

      .ui-data-table-suggestions__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-sm, 0.5rem) var(--space-md, 0.75rem);
        cursor: pointer;
        user-select: none;
        border-block-end: 1px solid var(--border-default, oklch(30% 0 0));
        background: var(--bg-elevated, oklch(18% 0.01 270));
        transition: background 0.15s ease;
      }

      .ui-data-table-suggestions__header:hover {
        background: var(--bg-hover, oklch(22% 0.01 270));
      }

      .ui-data-table-suggestions__title {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-data-table-suggestions__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25rem;
        block-size: 1.25rem;
        padding-inline: 0.25rem;
        border-radius: 9999px;
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--brand-contrast, oklch(100% 0 0));
        font-size: 0.6875rem;
        font-weight: 700;
      }

      .ui-data-table-suggestions__toggle {
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(65% 0 0));
        transition: transform 0.2s ease;
      }

      .ui-data-table-suggestions__toggle[data-open] {
        transform: rotate(180deg);
      }

      .ui-data-table-suggestions__list {
        display: flex;
        flex-direction: column;
        padding: var(--space-xs, 0.25rem);
        gap: var(--space-xs, 0.25rem);
      }

      .ui-data-table-suggestions__item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-sm, 0.5rem);
        border-radius: var(--radius-sm, 0.25rem);
        animation: ui-suggestions-fade-in 0.25s ease both;
      }

      .ui-data-table-suggestions__item:nth-child(1) { animation-delay: 0ms; }
      .ui-data-table-suggestions__item:nth-child(2) { animation-delay: 50ms; }
      .ui-data-table-suggestions__item:nth-child(3) { animation-delay: 100ms; }
      .ui-data-table-suggestions__item:nth-child(4) { animation-delay: 150ms; }
      .ui-data-table-suggestions__item:nth-child(5) { animation-delay: 200ms; }
      .ui-data-table-suggestions__item:nth-child(n+6) { animation-delay: 250ms; }

      .ui-data-table-suggestions__item:hover {
        background: var(--bg-hover, oklch(22% 0.01 270));
      }

      .ui-data-table-suggestions__item-icon {
        flex-shrink: 0;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--brand, oklch(65% 0.2 270) / 0.15);
        color: var(--brand, oklch(65% 0.2 270));
        font-size: 0.75rem;
      }

      .ui-data-table-suggestions__item-body {
        flex: 1;
        min-inline-size: 0;
      }

      .ui-data-table-suggestions__item-title {
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
      }

      .ui-data-table-suggestions__item-desc {
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(65% 0 0));
        line-height: 1.4;
        margin-block-start: 0.125rem;
      }

      .ui-data-table-suggestions__item-meta {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        margin-block-start: 0.375rem;
      }

      .ui-data-table-suggestions__confidence {
        display: inline-flex;
        align-items: center;
        padding-inline: 0.375rem;
        block-size: 1.25rem;
        border-radius: 9999px;
        font-size: 0.6875rem;
        font-weight: 600;
        background: var(--bg-subtle, oklch(25% 0.01 270));
        color: var(--text-secondary, oklch(65% 0 0));
      }

      .ui-data-table-suggestions__item-actions {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        flex-shrink: 0;
      }

      .ui-data-table-suggestions__apply-btn {
        appearance: none;
        border: none;
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--brand-contrast, oklch(100% 0 0));
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm, 0.25rem);
        cursor: pointer;
        transition: opacity 0.15s ease;
        white-space: nowrap;
      }

      .ui-data-table-suggestions__apply-btn:hover {
        opacity: 0.85;
      }

      .ui-data-table-suggestions__dismiss-btn {
        appearance: none;
        border: none;
        background: transparent;
        color: var(--text-tertiary, oklch(50% 0 0));
        font-size: 0.875rem;
        line-height: 1;
        padding: 0.125rem 0.25rem;
        border-radius: var(--radius-sm, 0.25rem);
        cursor: pointer;
        transition: color 0.15s ease;
      }

      .ui-data-table-suggestions__dismiss-btn:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      @keyframes ui-suggestions-fade-in {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }
`

// ─── Icon Map ─────────────────────────────────────────────────────────

const iconMap: Record<string, string> = {
  'calculator': '\u03A3',
  'chart-line': '\u2191',
  'layers': '\u2261',
  'search': '\u26B2',
  'alert-triangle': '\u26A0',
  'trending-up': '\u2197',
  'filter': '\u25BD',
  'badge-check': '\u25C9',
  'list': '\u2630',
  'scatter-chart': '\u2022',
}

function getIconChar(icon: string): string {
  return iconMap[icon] ?? '\u2726'
}

// ─── Component ────────────────────────────────────────────────────────

export function DataTableSuggestions({
  insights,
  onApply,
  onDismiss,
}: DataTableSuggestionsProps): JSX.Element {
  useStyles('data-table-suggestions', suggestionsStyles)

  const [open, setOpen] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissed((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
      onDismiss?.(id)
    },
    [onDismiss]
  )

  const visibleInsights = insights.filter((i) => !dismissed.has(i.id))

  if (visibleInsights.length === 0) return <></>

  return (
    <div className="ui-data-table-suggestions" role="region" aria-label="AI Suggestions">
      <button
        type="button"
        className="ui-data-table-suggestions__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ui-data-table-suggestions__title">
          <span aria-hidden="true">{'\u2728'}</span>
          AI Suggestions
          <span className="ui-data-table-suggestions__badge">{visibleInsights.length}</span>
        </span>
        <span
          className="ui-data-table-suggestions__toggle"
          {...(open ? { 'data-open': '' } : {})}
          aria-hidden="true"
        >
          {'\u25BC'}
        </span>
      </button>

      {open && (
        <div className="ui-data-table-suggestions__list" role="list">
          {visibleInsights.map((insight) => (
            <div
              key={insight.id}
              className="ui-data-table-suggestions__item"
              role="listitem"
            >
              <span className="ui-data-table-suggestions__item-icon" aria-hidden="true">
                {getIconChar(insight.icon)}
              </span>

              <div className="ui-data-table-suggestions__item-body">
                <div className="ui-data-table-suggestions__item-title">{insight.title}</div>
                <div className="ui-data-table-suggestions__item-desc">{insight.description}</div>
                <div className="ui-data-table-suggestions__item-meta">
                  <span className="ui-data-table-suggestions__confidence">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
              </div>

              <div className="ui-data-table-suggestions__item-actions">
                {insight.apply && onApply && (
                  <button
                    type="button"
                    className="ui-data-table-suggestions__apply-btn"
                    onClick={() => onApply(insight)}
                    aria-label={`Apply: ${insight.title}`}
                  >
                    Apply
                  </button>
                )}
                <button
                  type="button"
                  className="ui-data-table-suggestions__dismiss-btn"
                  onClick={() => handleDismiss(insight.id)}
                  aria-label={`Dismiss: ${insight.title}`}
                >
                  {'\u00D7'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

DataTableSuggestions.displayName = 'DataTableSuggestions'
