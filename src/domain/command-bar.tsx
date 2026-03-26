'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: ReactNode
  shortcut?: string[]
  section?: string
  onSelect: () => void
  disabled?: boolean
  keywords?: string[]
}

export interface CommandBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: CommandItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
  emptyMessage?: string
  shortcut?: string[]
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

function itemMatches(item: CommandItem, query: string): boolean {
  if (!query) return true
  if (fuzzyMatch(query, item.label)) return true
  if (item.description && fuzzyMatch(query, item.description)) return true
  if (item.keywords?.some((kw) => fuzzyMatch(query, kw))) return true
  return false
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const commandBarStyles = css`
  @layer components {
    @scope (.ui-command-bar) {
      :scope {
        display: contents;
      }

      dialog {
        position: fixed;
        inset-block-start: 20%;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(22% 0.01 270));
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding: 0;
        color: var(--text-primary, oklch(90% 0 0));
        overflow: hidden;
        outline: none;
        max-inline-size: 560px;
        inline-size: calc(100% - 2rem);
      }

      dialog::backdrop {
        background: oklch(0% 0 0 / 0.5);
        backdrop-filter: blur(4px);
      }

      /* Entry animation */
      dialog:not([data-motion="0"]) {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition:
          opacity 0.2s var(--ease-out, ease-out),
          transform 0.2s var(--ease-out, ease-out),
          display 0.2s allow-discrete,
          overlay 0.2s allow-discrete;
      }

      @starting-style {
        dialog[open]:not([data-motion="0"]) {
          opacity: 0;
          transform: translateY(-8px) scale(0.98);
        }
      }

      dialog[data-motion="0"] {
        transition: none;
      }

      /* Search input */
      .ui-command-bar__search {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      .ui-command-bar__search-icon {
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-command-bar__input {
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
      .ui-command-bar__input::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      /* Results */
      .ui-command-bar__list {
        max-block-size: 20rem;
        overflow-y: auto;
        padding-block: 0.25rem;
      }

      /* Section */
      .ui-command-bar__section {
        padding-block-start: var(--space-xs, 0.25rem);
      }

      .ui-command-bar__section-header {
        padding-block: 0.25rem;
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary, oklch(60% 0 0));
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
      }

      /* Item */
      .ui-command-bar__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-xs, 0.25rem);
        padding-inline: var(--space-md, 0.75rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        min-block-size: 2.25rem;
        user-select: none;
        transition: background 0.1s;
      }

      .ui-command-bar__item[data-active] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-command-bar__item[aria-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-command-bar__item:not([aria-disabled="true"]):hover {
        background: var(--bg-hover);
      }

      .ui-command-bar__item[data-active]:not([aria-disabled="true"]):hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      /* Item icon */
      .ui-command-bar__item-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-command-bar__item-icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* Item content */
      .ui-command-bar__item-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-inline-size: 0;
      }

      .ui-command-bar__item-label {
        display: inline;
      }

      .ui-command-bar__item-description {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        line-height: 1.4;
      }

      /* Shortcut badge */
      .ui-command-bar__shortcut {
        display: flex;
        gap: 0.125rem;
        margin-inline-start: auto;
        flex-shrink: 0;
      }

      .ui-command-bar__kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25rem;
        padding-inline: 0.25rem;
        block-size: 1.25rem;
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-hover);
        font-size: var(--text-2xs, 0.625rem);
        font-family: inherit;
        color: var(--text-secondary, oklch(70% 0 0));
        line-height: 1;
      }

      /* Empty state */
      .ui-command-bar__empty {
        padding-block: var(--space-lg, 1.25rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        text-align: center;
      }

      /* Aurora glow */
      dialog[open] {
        box-shadow:
          var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3)),
          0 0 0 1px oklch(65% 0.15 270 / 0.1);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-command-bar__item {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        dialog {
          border: 2px solid ButtonText;
          background: Canvas;
          color: CanvasText;
        }
        dialog::backdrop {
          background: Canvas;
          opacity: 0.8;
        }
        .ui-command-bar__item[data-active] {
          outline: 2px solid Highlight;
        }
        .ui-command-bar__kbd {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        dialog {
          display: none;
        }
      }
    }
  }
`

// ─── Search Icon ────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Recent items storage (module-level, persists across renders) ────────────

const recentIds: string[] = []
const MAX_RECENT = 5

function addRecent(id: string) {
  const idx = recentIds.indexOf(id)
  if (idx >= 0) recentIds.splice(idx, 1)
  recentIds.unshift(id)
  if (recentIds.length > MAX_RECENT) recentIds.pop()
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CommandBar({
  items,
  open,
  onOpenChange,
  placeholder = 'Type a command...',
  emptyMessage = 'No results found',
  shortcut: shortcutProp,
  motion: motionProp,
  className,
  ...rest
}: CommandBarProps) {
  useStyles('command-bar', commandBarStyles)
  const motionLevel = useMotionLevel(motionProp)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const id = useStableId('command-bar')
  const listboxId = `${id}-listbox`

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  // ── Filtered items ──────────────────────────────────────────────
  const filtered = items.filter((item) => itemMatches(item, query))
  const enabledFiltered = filtered.filter((i) => !i.disabled)

  // ── Build sections ──────────────────────────────────────────────
  type SectionEntry =
    | { type: 'section'; name: string }
    | { type: 'item'; item: CommandItem }

  const entries: SectionEntry[] = []

  // Recent section (only when no query)
  if (!query && recentIds.length > 0) {
    const recentItems = recentIds
      .map((rid) => items.find((i) => i.id === rid))
      .filter(Boolean) as CommandItem[]
    if (recentItems.length > 0) {
      entries.push({ type: 'section', name: 'Recent' })
      for (const item of recentItems) {
        entries.push({ type: 'item', item })
      }
    }
  }

  // Group by section
  const hasSections = filtered.some((i) => i.section)
  if (hasSections) {
    const seenSections = new Set<string>()
    for (const item of filtered) {
      const section = item.section ?? ''
      if (section && !seenSections.has(section)) {
        seenSections.add(section)
        entries.push({ type: 'section', name: section })
      }
      entries.push({ type: 'item', item })
    }
  } else {
    for (const item of filtered) {
      entries.push({ type: 'item', item })
    }
  }

  // All navigable items (enabled, not disabled)
  const allItems = entries
    .filter((e): e is { type: 'item'; item: CommandItem } => e.type === 'item')
    .map((e) => e.item)
  const navigableItems = allItems.filter((i) => !i.disabled)

  // ── Show/hide dialog ────────────────────────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.hasAttribute('open')) {
        dialog.showModal()
      }
      // Focus the input when opened
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      if (dialog.hasAttribute('open')) {
        dialog.close()
      }
      // Reset state on close
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  // ── Global keyboard shortcut ────────────────────────────────────
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (shortcutProp) {
        // Custom shortcut
        const match = shortcutProp.every((key) => {
          const k = key.toLowerCase()
          if (k === 'meta' || k === 'cmd') return e.metaKey
          if (k === 'ctrl' || k === 'control') return e.ctrlKey
          if (k === 'shift') return e.shiftKey
          if (k === 'alt') return e.altKey
          return e.key.toLowerCase() === k || e.key === key
        })
        if (match) {
          e.preventDefault()
          onOpenChange(!open)
        }
      } else {
        // Default: Meta+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          onOpenChange(!open)
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKey)
    return () => document.removeEventListener('keydown', handleGlobalKey)
  }, [open, onOpenChange, shortcutProp])

  // ── Select an item ──────────────────────────────────────────────
  const selectItem = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return
      addRecent(item.id)
      item.onSelect()
      onOpenChange(false)
    },
    [onOpenChange]
  )

  // ── Keyboard navigation ─────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, navigableItems.length - 1))
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
          setActiveIndex(navigableItems.length - 1)
          break
        case 'Enter':
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < navigableItems.length) {
            selectItem(navigableItems[activeIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [activeIndex, navigableItems, selectItem, onOpenChange]
  )

  // ── Scroll active into view ─────────────────────────────────────
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const list = listRef.current
    if (!list) return
    const items = list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
    const item = items[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex, open])

  // ── Backdrop click ──────────────────────────────────────────────
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  // ── Active descendant ───────────────────────────────────────────
  const getItemId = (itemId: string) => `${id}-item-${itemId}`
  const activeDescendantId =
    activeIndex >= 0 && activeIndex < navigableItems.length
      ? getItemId(navigableItems[activeIndex].id)
      : undefined

  if (!open) {
    // Still render the dialog element (hidden) so global shortcut works
    return (
      <div className={cn('ui-command-bar', className)} {...rest}>
        <dialog ref={dialogRef} data-motion={motionLevel} />
      </div>
    )
  }

  return (
    <div className={cn('ui-command-bar', className)} {...rest}>
      <dialog
        ref={dialogRef}
        data-motion={motionLevel}
        aria-label="Command palette"
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="ui-command-bar__search">
          <span className="ui-command-bar__search-icon">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className="ui-command-bar__input"
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
        </div>

        {/* List */}
        <div
          ref={listRef}
          className="ui-command-bar__list"
          role="listbox"
          id={listboxId}
        >
          {entries.length === 0 || (filtered.length === 0 && query) ? (
            <div className="ui-command-bar__empty">{emptyMessage}</div>
          ) : (
            entries.map((entry, i) => {
              if (entry.type === 'section') {
                return (
                  <div
                    key={`section-${entry.name}`}
                    className="ui-command-bar__section"
                  >
                    <div className="ui-command-bar__section-header" role="presentation">
                      {entry.name}
                    </div>
                  </div>
                )
              }

              const item = entry.item
              const navIdx = navigableItems.indexOf(item)
              const isActive = navIdx === activeIndex
              const isDisabled = !!item.disabled

              return (
                <div
                  key={`${item.id}-${i}`}
                  role="option"
                  id={getItemId(item.id)}
                  aria-selected={isActive}
                  aria-disabled={isDisabled || undefined}
                  className="ui-command-bar__item"
                  {...(isActive ? { 'data-active': '' } : {})}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => {
                    if (!isDisabled && navIdx >= 0) {
                      setActiveIndex(navIdx)
                    }
                  }}
                >
                  {item.icon && (
                    <span className="ui-command-bar__item-icon">{item.icon}</span>
                  )}
                  <span className="ui-command-bar__item-content">
                    <span className="ui-command-bar__item-label">{item.label}</span>
                    {item.description && (
                      <span className="ui-command-bar__item-description">
                        {item.description}
                      </span>
                    )}
                  </span>
                  {item.shortcut && (
                    <span className="ui-command-bar__shortcut">
                      {item.shortcut.map((key, ki) => (
                        <kbd key={ki} className="ui-command-bar__kbd">
                          {key}
                        </kbd>
                      ))}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </dialog>
    </div>
  )
}

CommandBar.displayName = 'CommandBar'
