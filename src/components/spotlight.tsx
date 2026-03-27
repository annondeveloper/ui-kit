'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useFocusTrap } from '../core/a11y/focus-trap'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SpotlightAction {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  group?: string
  keywords?: string[]
  onClick: () => void
}

export interface SpotlightProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  actions: SpotlightAction[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  shortcut?: string // default "meta+k"
  placeholder?: string
  nothingFoundMessage?: string
  limit?: number
  filter?: (query: string, actions: SpotlightAction[]) => SpotlightAction[]
  motion?: 0 | 1 | 2 | 3
}

// ─── Fuzzy search ───────────────────────────────────────────────────────────

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

function defaultFilter(query: string, actions: SpotlightAction[]): SpotlightAction[] {
  if (!query) return actions
  return actions.filter((action) => {
    if (fuzzyMatch(query, action.title)) return true
    if (action.description && fuzzyMatch(query, action.description)) return true
    if (action.keywords?.some((kw) => fuzzyMatch(query, kw))) return true
    return false
  })
}

// ─── Recent actions storage ─────────────────────────────────────────────────

const recentActionIds: string[] = []
const MAX_RECENT = 5

function addRecentAction(id: string) {
  const idx = recentActionIds.indexOf(id)
  if (idx >= 0) recentActionIds.splice(idx, 1)
  recentActionIds.unshift(id)
  if (recentActionIds.length > MAX_RECENT) recentActionIds.pop()
}

// ─── Parse shortcut ─────────────────────────────────────────────────────────

function parseShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split('+').map((p) => p.trim())
  const key = parts[parts.length - 1]
  return {
    key,
    meta: parts.includes('meta') || parts.includes('cmd'),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  }
}

function shortcutDisplay(shortcut: string): string[] {
  const parts = shortcut.toLowerCase().split('+').map((p) => p.trim())
  return parts.map((p) => {
    if (p === 'meta' || p === 'cmd') return '\u2318'
    if (p === 'ctrl' || p === 'control') return 'Ctrl'
    if (p === 'shift') return '\u21E7'
    if (p === 'alt') return '\u2325'
    return p.toUpperCase()
  })
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const spotlightStyles = css`
  @layer components {
    @scope (.ui-spotlight) {
      :scope {
        display: contents;
      }

      /* Overlay */
      .ui-spotlight__overlay {
        position: fixed;
        inset: 0;
        background: oklch(0% 0 0 / 0.6);
        backdrop-filter: blur(8px);
        z-index: 9998;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-block-start: 15vh;
        padding-inline: var(--space-md, 0.75rem);
      }

      /* Entry animation */
      .ui-spotlight__overlay:not([data-motion="0"]) {
        animation: ui-spotlight-overlay-in 0.2s ease-out both;
      }

      @keyframes ui-spotlight-overlay-in {
        from {
          opacity: 0;
        }
      }

      /* Dialog container */
      .ui-spotlight__dialog {
        inline-size: 100%;
        max-inline-size: 600px;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        box-shadow:
          var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3)),
          0 0 0 1px oklch(65% 0.15 270 / 0.1);
        overflow: hidden;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-spotlight__dialog:not([data-motion="0"]) {
        animation: ui-spotlight-dialog-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes ui-spotlight-dialog-in {
        from {
          opacity: 0;
          transform: translateY(-12px) scale(0.97);
        }
      }

      .ui-spotlight__dialog[data-motion="0"] {
        animation: none;
      }

      /* Search input area */
      .ui-spotlight__search {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-spotlight__search-icon {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-spotlight__input {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-base, 1rem);
        line-height: 1.5;
        outline: none;
        font-family: inherit;
        min-block-size: 2.5rem;
      }

      .ui-spotlight__input:focus {
        border-block-end: 1px solid oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      .ui-spotlight__input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-spotlight__shortcut-badge {
        display: flex;
        gap: 0.125rem;
        flex-shrink: 0;
      }

      .ui-spotlight__kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25rem;
        padding-inline: 0.25rem;
        block-size: 1.25rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        font-size: var(--text-2xs, 0.625rem);
        font-family: inherit;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1;
      }

      /* Results list */
      .ui-spotlight__list {
        max-block-size: 24rem;
        overflow-y: auto;
        padding-block: 0.25rem;
      }

      /* Section */
      .ui-spotlight__section-header {
        padding-block: 0.25rem;
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
      }

      /* Action item */
      .ui-spotlight__action {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        min-block-size: 2.5rem;
        user-select: none;
        transition: background 0.1s;
      }

      .ui-spotlight__action[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-spotlight__action:not([data-active]):hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        transform: translateX(2px);
      }

      .ui-spotlight__action:hover .ui-spotlight__action-icon {
        color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-spotlight__action-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-spotlight__action-icon svg {
        inline-size: 1.25em;
        block-size: 1.25em;
      }

      .ui-spotlight__action-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-inline-size: 0;
      }

      .ui-spotlight__action-title {
        display: inline;
      }

      .ui-spotlight__action-description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        line-height: 1.4;
      }

      /* Empty state */
      .ui-spotlight__empty {
        padding-block: var(--space-lg, 1.25rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
      }

      /* Footer hint */
      .ui-spotlight__footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-md, 0.75rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        user-select: none;
      }

      .ui-spotlight__footer kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.125rem;
        padding-inline: 0.2rem;
        block-size: 1.125rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-xs, 0.125rem);
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        font-size: var(--text-2xs, 0.625rem);
        font-family: inherit;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-spotlight__action {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-spotlight__overlay {
          background: Canvas;
          opacity: 0.9;
        }
        .ui-spotlight__dialog {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        .ui-spotlight__action[data-active] {
          outline: 2px solid Highlight;
        }
        .ui-spotlight__kbd,
        .ui-spotlight__footer kbd {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-spotlight__overlay {
          display: none;
        }
      }
    }
  }
`

// ─── Search Icon ────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Spotlight({
  actions,
  open = false,
  onOpenChange,
  shortcut = 'meta+k',
  placeholder = 'Search...',
  nothingFoundMessage = 'No results found',
  limit,
  filter,
  motion: motionProp,
  className,
  ...rest
}: SpotlightProps) {
  useStyles('spotlight', spotlightStyles)
  const motionLevel = useMotionLevel(motionProp)
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const id = useStableId('spotlight')
  const listboxId = `${id}-listbox`

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  // Focus trap
  useFocusTrap(overlayRef, {
    active: open,
    returnFocus: true,
    initialFocus: 'first',
  })

  // ── Filtered actions ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const filterFn = filter ?? defaultFilter
    let result = filterFn(query, actions)
    if (limit && limit > 0) {
      result = result.slice(0, limit)
    }
    return result
  }, [actions, query, filter, limit])

  // ── Build entries (with groups + recent) ──────────────────────────
  type Entry =
    | { type: 'section'; name: string }
    | { type: 'action'; action: SpotlightAction }

  const entries = useMemo(() => {
    const result: Entry[] = []

    // Recent section (only when no query)
    if (!query && recentActionIds.length > 0) {
      const recentActions = recentActionIds
        .map((rid) => actions.find((a) => a.id === rid))
        .filter(Boolean) as SpotlightAction[]
      if (recentActions.length > 0) {
        result.push({ type: 'section', name: 'Recent' })
        for (const action of recentActions) {
          result.push({ type: 'action', action })
        }
      }
    }

    // Group by group
    const hasGroups = filtered.some((a) => a.group)
    if (hasGroups) {
      const seenGroups = new Set<string>()
      for (const action of filtered) {
        const group = action.group ?? ''
        if (group && !seenGroups.has(group)) {
          seenGroups.add(group)
          result.push({ type: 'section', name: group })
        }
        result.push({ type: 'action', action })
      }
    } else {
      for (const action of filtered) {
        result.push({ type: 'action', action })
      }
    }

    return result
  }, [actions, filtered, query])

  const navigableActions = useMemo(
    () => entries.filter((e): e is { type: 'action'; action: SpotlightAction } => e.type === 'action').map((e) => e.action),
    [entries]
  )

  // ── Focus input on open ───────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // ── Global keyboard shortcut ──────────────────────────────────────
  useEffect(() => {
    const parsed = parseShortcut(shortcut)

    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== parsed.key) return
      if (parsed.meta && !e.metaKey) return
      if (parsed.ctrl && !e.ctrlKey) return
      if (parsed.shift && !e.shiftKey) return
      if (parsed.alt && !e.altKey) return

      e.preventDefault()
      onOpenChange?.(!open)
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onOpenChange, shortcut])

  // ── Select an action ──────────────────────────────────────────────
  const selectAction = useCallback(
    (action: SpotlightAction) => {
      addRecentAction(action.id)
      action.onClick()
      onOpenChange?.(false)
    },
    [onOpenChange]
  )

  // ── Keyboard navigation ───────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, navigableActions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          setActiveIndex(0)
          break
        case 'End':
          e.preventDefault()
          setActiveIndex(navigableActions.length - 1)
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < navigableActions.length) {
            selectAction(navigableActions[activeIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange?.(false)
          break
      }
    },
    [activeIndex, navigableActions, selectAction, onOpenChange]
  )

  // ── Scroll active into view ───────────────────────────────────────
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const list = listRef.current
    if (!list) return
    const items = list.querySelectorAll('[role="option"]')
    const item = items[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, open])

  // ── Overlay click ─────────────────────────────────────────────────
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onOpenChange?.(false)
      }
    },
    [onOpenChange]
  )

  // ── Active descendant ─────────────────────────────────────────────
  const getActionId = (actionId: string) => `${id}-action-${actionId}`
  const activeDescendantId =
    activeIndex >= 0 && activeIndex < navigableActions.length
      ? getActionId(navigableActions[activeIndex].id)
      : undefined

  const shortcutKeys = shortcutDisplay(shortcut)

  if (!open) return null

  return (
    <div className={cn('ui-spotlight', className)} {...rest}>
      <div
        ref={overlayRef}
        className="ui-spotlight__overlay"
        data-motion={motionLevel}
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight search"
      >
        <div className="ui-spotlight__dialog" data-motion={motionLevel}>
          {/* Search */}
          <div className="ui-spotlight__search">
            <span className="ui-spotlight__search-icon">
              <SearchIcon />
            </span>
            <input
              ref={inputRef}
              className="ui-spotlight__input"
              type="text"
              role="combobox"
              aria-expanded={true}
              aria-haspopup="listbox"
              aria-controls={listboxId}
              aria-activedescendant={activeDescendantId}
              aria-autocomplete="list"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
            />
            <span className="ui-spotlight__shortcut-badge">
              {shortcutKeys.map((key, i) => (
                <kbd key={i} className="ui-spotlight__kbd">
                  {key}
                </kbd>
              ))}
            </span>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="ui-spotlight__list"
            role="listbox"
            id={listboxId}
          >
            {navigableActions.length === 0 && query ? (
              <div className="ui-spotlight__empty">{nothingFoundMessage}</div>
            ) : (
              entries.map((entry, i) => {
                if (entry.type === 'section') {
                  return (
                    <div
                      key={`section-${entry.name}-${i}`}
                      className="ui-spotlight__section-header"
                      role="presentation"
                    >
                      {entry.name}
                    </div>
                  )
                }

                const action = entry.action
                const navIdx = navigableActions.indexOf(action)
                const isActive = navIdx === activeIndex

                return (
                  <div
                    key={`${action.id}-${i}`}
                    role="option"
                    id={getActionId(action.id)}
                    aria-selected={isActive}
                    className="ui-spotlight__action"
                    {...(isActive ? { 'data-active': '' } : {})}
                    onClick={() => selectAction(action)}
                    onMouseEnter={() => {
                      if (navIdx >= 0) setActiveIndex(navIdx)
                    }}
                  >
                    {action.icon && (
                      <span className="ui-spotlight__action-icon">{action.icon}</span>
                    )}
                    <span className="ui-spotlight__action-content">
                      <span className="ui-spotlight__action-title">{action.title}</span>
                      {action.description && (
                        <span className="ui-spotlight__action-description">
                          {action.description}
                        </span>
                      )}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="ui-spotlight__footer">
            <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>
            <span><kbd>&crarr;</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

Spotlight.displayName = 'Spotlight'
