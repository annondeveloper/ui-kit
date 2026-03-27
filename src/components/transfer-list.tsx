'use client'

import { forwardRef, useState, useMemo, useCallback, useEffect, useRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TransferListItem {
  value: string
  label: string
  group?: string
}

export interface TransferListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: [TransferListItem[], TransferListItem[]]
  onChange: (value: [TransferListItem[], TransferListItem[]]) => void
  titles?: [string, string]
  searchable?: boolean
  showTransferAll?: boolean
  listHeight?: number | string
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const transferListStyles = css`
  @layer components {
    @scope (.ui-transfer-list) {
      :scope {
        display: flex;
        align-items: stretch;
        gap: var(--space-sm, 0.5rem);
      }

      /* Panel */
      .ui-transfer-list__panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-surface, oklch(15% 0.01 270));
        overflow: hidden;
        min-inline-size: 0;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.06), 0 1px 3px oklch(0% 0 0 / 0.2);
      }

      /* Panel header */
      .ui-transfer-list__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-sm, 0.5rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        backdrop-filter: blur(8px);
        background: oklch(from var(--bg-elevated, oklch(20% 0.01 270)) l c h / 0.8);
      }

      .ui-transfer-list__title {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        user-select: none;
      }

      .ui-transfer-list__count {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        user-select: none;
      }

      /* Search */
      .ui-transfer-list__search {
        padding: var(--space-xs, 0.25rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-transfer-list__search-input {
        inline-size: 100%;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(15% 0.01 270));
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        padding-block: 0.25rem;
        padding-inline: var(--space-sm, 0.5rem);
        outline: none;
        min-block-size: 2rem;
      }

      .ui-transfer-list__search-input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-transfer-list__search-input:focus {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 1px var(--brand, oklch(65% 0.2 270));
      }

      /* List */
      .ui-transfer-list__items {
        flex: 1;
        overflow-y: auto;
        padding-block: 0.25rem;
      }

      /* Group header */
      .ui-transfer-list__group-header {
        padding-block: 0.25rem;
        padding-inline: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
      }

      /* Item */
      .ui-transfer-list__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: 0.25rem;
        padding-inline: var(--space-sm, 0.5rem);
        cursor: pointer;
        user-select: none;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        transition: background 0.1s;
        min-block-size: 2rem;
      }

      .ui-transfer-list__item:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }

      .ui-transfer-list__item[data-checked="true"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      .ui-transfer-list__checkbox {
        flex-shrink: 0;
        inline-size: 1rem;
        block-size: 1rem;
        border: 1.5px solid var(--border-strong, oklch(100% 0 0 / 0.2));
        border-radius: var(--radius-xs, 0.125rem);
        background: transparent;
        transition: background 0.1s, border-color 0.1s;
      }

      .ui-transfer-list__checkbox[data-checked] {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
        animation: ui-transfer-check-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ui-transfer-list__item-label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Controls (arrows) */
      .ui-transfer-list__controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-transfer-list__control-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-elevated, oklch(100% 0 0 / 0.06));
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        outline: none;
        font-family: inherit;
        min-block-size: 32px;
        min-inline-size: 32px;
        padding: 0.25rem;
        -webkit-tap-highlight-color: transparent;
        transition:
          background 0.15s,
          border-color 0.15s,
          color 0.15s,
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .ui-transfer-list__control-btn:hover:not(:disabled) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.15));
        color: var(--text-primary, oklch(90% 0 0));
        transform: translateY(-2px);
        box-shadow: 0 4px 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      .ui-transfer-list__control-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-transfer-list__control-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-transfer-list__control-btn:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.92);
        transition: transform 0.06s ease-out;
      }

      .ui-transfer-list__control-btn svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Sizes */
      :scope[data-size="sm"] {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-transfer-list__item {
        min-block-size: 1.5rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-transfer-list__checkbox {
        inline-size: 0.875rem;
        block-size: 0.875rem;
      }

      :scope[data-size="lg"] .ui-transfer-list__item {
        min-block-size: 2.5rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-transfer-list__checkbox {
        inline-size: 1.125rem;
        block-size: 1.125rem;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-transfer-list__item {
          min-block-size: 44px;
        }
        .ui-transfer-list__control-btn {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-transfer-list__panel {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-transfer-list__control-btn {
          border: 2px solid ButtonText;
        }
        .ui-transfer-list__control-btn:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-transfer-list__item[data-checked="true"] {
          outline: 1px solid Highlight;
        }
        .ui-transfer-list__search-input {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-transfer-list__controls {
          display: none;
        }
        .ui-transfer-list__search {
          display: none;
        }
        .ui-transfer-list__panel {
          border: 1px solid;
        }
      }
    }

    @keyframes ui-transfer-check-pop {
      0% { transform: scale(0.8); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  }
`

// ─── Icons ──────────────────────────────────────────────────────────────────

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronsRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 3L9 8L4 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3L13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronsLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 3L7 8L12 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3L3 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Panel component ────────────────────────────────────────────────────────

interface PanelProps {
  items: TransferListItem[]
  title?: string
  searchable?: boolean
  selected: Set<string>
  onToggle: (value: string) => void
  listHeight?: number | string
  panelId: string
  onFilteredValuesChange?: (values: Set<string>) => void
}

function Panel({ items, title, searchable, selected, onToggle, listHeight, panelId, onFilteredValuesChange }: PanelProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, search])

  // Report filtered values to parent
  useEffect(() => {
    if (onFilteredValuesChange) {
      onFilteredValuesChange(new Set(filtered.map(i => i.value)))
    }
  }, [filtered, onFilteredValuesChange])

  // Group items
  const hasGroups = filtered.some((i) => i.group)
  const groups = useMemo(() => {
    if (!hasGroups) return [{ name: '', items: filtered }]
    const map = new Map<string, TransferListItem[]>()
    for (const item of filtered) {
      const g = item.group ?? ''
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }))
  }, [filtered, hasGroups])

  const selectedCount = items.filter((i) => selected.has(i.value)).length

  return (
    <div className="ui-transfer-list__panel" role="group" aria-label={title}>
      <div className="ui-transfer-list__header">
        <span className="ui-transfer-list__title">{title}</span>
        <span className="ui-transfer-list__count">
          {selectedCount > 0 ? `${selectedCount} / ` : ''}{items.length}
        </span>
      </div>
      {searchable && (
        <div className="ui-transfer-list__search">
          <input
            type="text"
            className="ui-transfer-list__search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={`Search ${title}`}
          />
        </div>
      )}
      <div
        className="ui-transfer-list__items"
        role="listbox"
        aria-label={`${title} items`}
        aria-multiselectable="true"
        id={panelId}
        style={{ maxBlockSize: listHeight !== undefined ? (typeof listHeight === 'number' ? `${listHeight}px` : listHeight) : '16rem' }}
      >
        {groups.map((group) => (
          <div key={group.name || '__default'}>
            {group.name && (
              <div className="ui-transfer-list__group-header" role="presentation">
                {group.name}
              </div>
            )}
            {group.items.map((item) => {
              const checked = selected.has(item.value)
              return (
                <div
                  key={item.value}
                  className="ui-transfer-list__item"
                  role="option"
                  aria-selected={checked}
                  data-checked={checked || undefined}
                  onClick={() => onToggle(item.value)}
                >
                  <span
                    className="ui-transfer-list__checkbox"
                    data-checked={checked || undefined}
                    aria-hidden="true"
                  />
                  <span className="ui-transfer-list__item-label">{item.label}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(
  (
    {
      value,
      onChange,
      titles = ['Source', 'Target'],
      searchable = false,
      showTransferAll = true,
      listHeight,
      size = 'md',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    useStyles('transfer-list', transferListStyles)
    const motionLevel = useMotionLevel(motionProp)
    const id = useStableId('transfer-list')
    const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set())
    const [rightSelected, setRightSelected] = useState<Set<string>>(new Set())
    const leftFilteredRef = useRef<Set<string>>(new Set())
    const rightFilteredRef = useRef<Set<string>>(new Set())

    const onLeftFilteredChange = useCallback((values: Set<string>) => {
      leftFilteredRef.current = values
    }, [])

    const onRightFilteredChange = useCallback((values: Set<string>) => {
      rightFilteredRef.current = values
    }, [])

    const [left, right] = value

    const toggleLeft = useCallback((val: string) => {
      setLeftSelected((prev) => {
        const next = new Set(prev)
        if (next.has(val)) next.delete(val)
        else next.add(val)
        return next
      })
    }, [])

    const toggleRight = useCallback((val: string) => {
      setRightSelected((prev) => {
        const next = new Set(prev)
        if (next.has(val)) next.delete(val)
        else next.add(val)
        return next
      })
    }, [])

    // Transfer selected left items to right (only those visible in filtered view)
    const transferRight = useCallback(() => {
      const filteredValues = leftFilteredRef.current
      const toMove = left.filter((i) => leftSelected.has(i.value) && filteredValues.has(i.value))
      if (toMove.length === 0) return
      const toMoveValues = new Set(toMove.map(i => i.value))
      const remaining = left.filter((i) => !toMoveValues.has(i.value))
      onChange([remaining, [...right, ...toMove]])
      setLeftSelected((prev) => {
        const next = new Set(prev)
        for (const v of toMoveValues) next.delete(v)
        return next
      })
    }, [left, right, leftSelected, onChange])

    // Transfer selected right items to left (only those visible in filtered view)
    const transferLeft = useCallback(() => {
      const filteredValues = rightFilteredRef.current
      const toMove = right.filter((i) => rightSelected.has(i.value) && filteredValues.has(i.value))
      if (toMove.length === 0) return
      const toMoveValues = new Set(toMove.map(i => i.value))
      const remaining = right.filter((i) => !toMoveValues.has(i.value))
      onChange([[...left, ...toMove], remaining])
      setRightSelected((prev) => {
        const next = new Set(prev)
        for (const v of toMoveValues) next.delete(v)
        return next
      })
    }, [left, right, rightSelected, onChange])

    // Transfer all left to right
    const transferAllRight = useCallback(() => {
      if (left.length === 0) return
      onChange([[], [...right, ...left]])
      setLeftSelected(new Set())
    }, [left, right, onChange])

    // Transfer all right to left
    const transferAllLeft = useCallback(() => {
      if (right.length === 0) return
      onChange([[...left, ...right], []])
      setRightSelected(new Set())
    }, [left, right, onChange])

    return (
      <div
        ref={ref}
        className={cn('ui-transfer-list', className)}
        data-size={size}
        data-motion={motionLevel}
        role="group"
        aria-label="Transfer list"
        {...rest}
      >
        <Panel
          items={left}
          title={titles[0]}
          searchable={searchable}
          selected={leftSelected}
          onToggle={toggleLeft}
          listHeight={listHeight}
          panelId={`${id}-left`}
          onFilteredValuesChange={onLeftFilteredChange}
        />

        <div className="ui-transfer-list__controls">
          {showTransferAll && (
            <button
              type="button"
              className="ui-transfer-list__control-btn"
              onClick={transferAllRight}
              disabled={left.length === 0}
              aria-label="Transfer all to right"
              data-motion={motionLevel}
            >
              <ChevronsRightIcon />
            </button>
          )}
          <button
            type="button"
            className="ui-transfer-list__control-btn"
            onClick={transferRight}
            disabled={leftSelected.size === 0}
            aria-label="Transfer selected to right"
            data-motion={motionLevel}
          >
            <ChevronRightIcon />
          </button>
          <button
            type="button"
            className="ui-transfer-list__control-btn"
            onClick={transferLeft}
            disabled={rightSelected.size === 0}
            aria-label="Transfer selected to left"
            data-motion={motionLevel}
          >
            <ChevronLeftIcon />
          </button>
          {showTransferAll && (
            <button
              type="button"
              className="ui-transfer-list__control-btn"
              onClick={transferAllLeft}
              disabled={right.length === 0}
              aria-label="Transfer all to left"
              data-motion={motionLevel}
            >
              <ChevronsLeftIcon />
            </button>
          )}
        </div>

        <Panel
          items={right}
          title={titles[1]}
          searchable={searchable}
          selected={rightSelected}
          onToggle={toggleRight}
          listHeight={listHeight}
          panelId={`${id}-right`}
          onFilteredValuesChange={onRightFilteredChange}
        />
      </div>
    )
  }
)
TransferList.displayName = 'TransferList'
