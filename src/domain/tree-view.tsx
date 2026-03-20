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
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string
  label: ReactNode
  icon?: ReactNode
  children?: TreeNode[]
  disabled?: boolean
  data?: unknown
}

export interface TreeViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  nodes: TreeNode[]
  selected?: string | string[]
  onSelect?: (nodeId: string) => void
  expanded?: string[]
  onExpand?: (nodeId: string, expanded: boolean) => void
  multiSelect?: boolean
  lazy?: (nodeId: string) => Promise<TreeNode[]>
  showGuides?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const treeViewStyles = css`
  @layer components {
    @scope (.ui-tree-view) {
      :scope {
        display: flex;
        flex-direction: column;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* ── Tree item row ───────────────────────────────── */

      .ui-tree-view__row {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: 0.125rem;
        padding-inline-start: calc(var(--depth, 0) * 1.25rem);
        padding-inline-end: var(--space-sm, 0.5rem);
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        min-block-size: 1.75rem;
        user-select: none;
        position: relative;
        transition: background 0.1s;
      }

      .ui-tree-view__row:hover {
        background: oklch(100% 0 0 / 0.04);
      }

      .ui-tree-view__row[data-selected] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      }

      .ui-tree-view__row[data-selected]:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.16);
      }

      .ui-tree-view__row[aria-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── Toggle button ───────────────────────────────── */

      .ui-tree-view__toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25rem;
        block-size: 1.25rem;
        border: none;
        background: transparent;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        flex-shrink: 0;
        padding: 0;
        border-radius: var(--radius-sm, 0.25rem);
      }

      .ui-tree-view__toggle:hover {
        color: var(--text-primary, oklch(90% 0 0));
        background: oklch(100% 0 0 / 0.06);
      }

      .ui-tree-view__toggle svg {
        transition: transform 0.15s var(--ease-out, ease-out);
      }

      .ui-tree-view__toggle[data-expanded] svg {
        transform: rotate(90deg);
      }

      .ui-tree-view__spacer {
        inline-size: 1.25rem;
        flex-shrink: 0;
      }

      /* ── Node icon ───────────────────────────────────── */

      .ui-tree-view__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-tree-view__icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      /* ── Node label ──────────────────────────────────── */

      .ui-tree-view__label {
        flex: 1;
        min-inline-size: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* ── Group (children container) ──────────────────── */

      .ui-tree-view__group {
        overflow: hidden;
      }

      .ui-tree-view__group:not([data-motion="0"]) {
        transition: grid-template-rows 0.2s var(--ease-out, ease-out);
        display: grid;
        grid-template-rows: 0fr;
      }

      .ui-tree-view__group[data-expanded]:not([data-motion="0"]) {
        grid-template-rows: 1fr;
      }

      .ui-tree-view__group[data-motion="0"] {
        display: none;
      }

      .ui-tree-view__group[data-expanded][data-motion="0"] {
        display: block;
      }

      .ui-tree-view__group-inner {
        overflow: hidden;
      }

      /* ── Indent guides ───────────────────────────────── */

      :scope[data-guides="true"] .ui-tree-view__row::before {
        content: '';
        position: absolute;
        inset-inline-start: calc(var(--depth, 0) * 1.25rem - 0.625rem);
        inset-block: 0;
        inline-size: 1px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.08));
        pointer-events: none;
      }

      :scope[data-guides="true"] .ui-tree-view__row[style*="--depth: 0"]::before,
      :scope[data-guides="true"] .ui-tree-view__row[style*="--depth:0"]::before {
        display: none;
      }

      /* ── Loading spinner ─────────────────────────────── */

      .ui-tree-view__loading {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: 0.25rem;
        padding-inline-start: calc((var(--depth, 0) + 1) * 1.25rem + 1.5rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        font-size: var(--text-xs, 0.75rem);
      }

      .ui-tree-view__spinner {
        inline-size: 0.875rem;
        block-size: 0.875rem;
        border: 2px solid oklch(100% 0 0 / 0.1);
        border-block-start-color: var(--brand, oklch(65% 0.2 270));
        border-radius: 50%;
        animation: ui-tree-spin 0.6s linear infinite;
      }

      /* ── Reduced motion ──────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .ui-tree-view__toggle svg {
          transition: none;
        }
        .ui-tree-view__group {
          transition: none;
        }
        .ui-tree-view__spinner {
          animation: none;
        }
      }

      /* ── Touch targets ───────────────────────────────── */

      @media (pointer: coarse) {
        .ui-tree-view__row {
          min-block-size: 44px;
        }
        .ui-tree-view__toggle {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* ── Forced colors ───────────────────────────────── */

      @media (forced-colors: active) {
        .ui-tree-view__row[data-selected] {
          outline: 2px solid Highlight;
        }
        .ui-tree-view__row:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* ── Print ───────────────────────────────────────── */

      @media print {
        .ui-tree-view__group {
          display: block !important;
          grid-template-rows: unset !important;
        }
      }
    }

    @keyframes ui-tree-spin {
      to { transform: rotate(360deg); }
    }
  }
`

// ─── Chevron Icon ──────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function collectVisibleIds(
  nodes: TreeNode[],
  expandedSet: Set<string>,
  lazyChildren: Map<string, TreeNode[]>,
): string[] {
  const result: string[] = []
  for (const node of nodes) {
    result.push(node.id)
    if (expandedSet.has(node.id)) {
      const children = lazyChildren.get(node.id) ?? node.children
      if (children && children.length > 0) {
        result.push(...collectVisibleIds(children, expandedSet, lazyChildren))
      }
    }
  }
  return result
}

function findParentId(
  nodeId: string,
  nodes: TreeNode[],
  parentId: string | null = null,
  lazyChildren: Map<string, TreeNode[]> = new Map(),
): string | null {
  for (const node of nodes) {
    if (node.id === nodeId) return parentId
    const children = lazyChildren.get(node.id) ?? node.children
    if (children) {
      const found = findParentId(nodeId, children, node.id, lazyChildren)
      if (found !== null) return found
    }
  }
  return null
}

function hasExpandableChildren(node: TreeNode): boolean {
  return Array.isArray(node.children)
}

// ─── TreeItem Component ────────────────────────────────────────────────────

interface TreeItemProps {
  node: TreeNode
  depth: number
  expandedSet: Set<string>
  selectedSet: Set<string>
  loadingSet: Set<string>
  lazyChildren: Map<string, TreeNode[]>
  onToggle: (nodeId: string) => void
  onSelect: (nodeId: string) => void
  motionLevel: number
  lazy?: (nodeId: string) => Promise<TreeNode[]>
}

function TreeItem({
  node,
  depth,
  expandedSet,
  selectedSet,
  loadingSet,
  lazyChildren,
  onToggle,
  onSelect,
  motionLevel,
  lazy,
}: TreeItemProps) {
  const isExpandable = hasExpandableChildren(node)
  const isExpanded = expandedSet.has(node.id)
  const isSelected = selectedSet.has(node.id)
  const isLoading = loadingSet.has(node.id)
  const isDisabled = !!node.disabled

  const children = lazyChildren.get(node.id) ?? node.children
  const hasLoadedChildren = children && children.length > 0

  const handleRowClick = () => {
    if (isDisabled) return
    if (isExpandable) {
      onToggle(node.id)
    }
    onSelect(node.id)
  }

  return (
    <li
      role="treeitem"
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      tabIndex={-1}
      data-node-id={node.id}
    >
      <div
        className="ui-tree-view__row"
        style={{ '--depth': depth } as React.CSSProperties}
        onClick={handleRowClick}
        {...(isSelected ? { 'data-selected': '' } : {})}
        {...(isDisabled ? { 'aria-disabled': 'true' } : {})}
      >
        {isExpandable ? (
          <button
            className="ui-tree-view__toggle"
            data-toggle=""
            {...(isExpanded ? { 'data-expanded': '' } : {})}
            onClick={(e) => {
              e.stopPropagation()
              if (!isDisabled) onToggle(node.id)
            }}
            tabIndex={-1}
            aria-hidden="true"
          >
            <ChevronIcon />
          </button>
        ) : (
          <span className="ui-tree-view__spacer" />
        )}
        {node.icon && <span className="ui-tree-view__icon">{node.icon}</span>}
        <span className="ui-tree-view__label">{node.label}</span>
      </div>

      {isExpandable && (
        <div
          className="ui-tree-view__group"
          role="group"
          data-motion={motionLevel}
          {...(isExpanded ? { 'data-expanded': '' } : {})}
        >
          <div className="ui-tree-view__group-inner">
            {isLoading && (
              <div className="ui-tree-view__loading" data-loading="true" style={{ '--depth': depth } as React.CSSProperties}>
                <span className="ui-tree-view__spinner" />
                Loading...
              </div>
            )}
            {hasLoadedChildren && isExpanded && children.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedSet={expandedSet}
                selectedSet={selectedSet}
                loadingSet={loadingSet}
                lazyChildren={lazyChildren}
                onToggle={onToggle}
                onSelect={onSelect}
                motionLevel={motionLevel}
                lazy={lazy}
              />
            ))}
          </div>
        </div>
      )}
    </li>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TreeView({
  nodes,
  selected,
  onSelect,
  expanded = [],
  onExpand,
  multiSelect = false,
  lazy,
  showGuides = true,
  motion: motionProp,
  className,
  ...rest
}: TreeViewProps) {
  const cls = useStyles('tree-view', treeViewStyles)
  const motionLevel = useMotionLevel(motionProp)
  const treeRef = useRef<HTMLUListElement>(null)
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set())
  const [lazyChildren, setLazyChildren] = useState<Map<string, TreeNode[]>>(new Map())

  const expandedSet = new Set(expanded)
  const selectedSet = new Set(
    Array.isArray(selected) ? selected : selected ? [selected] : []
  )

  // Initialize tabindex on first visible item
  useEffect(() => {
    const tree = treeRef.current
    if (!tree) return
    const items = tree.querySelectorAll<HTMLElement>('[role="treeitem"]')
    items.forEach((item, i) => {
      item.setAttribute('tabindex', i === 0 ? '0' : '-1')
    })
  }, [nodes, expanded])

  // Auto-trigger lazy loading for expanded nodes with empty children
  useEffect(() => {
    if (!lazy) return
    for (const nodeId of expanded) {
      if (lazyChildren.has(nodeId) || loadingSet.has(nodeId)) continue
      const node = findNodeById(nodeId, nodes, lazyChildren)
      if (node && Array.isArray(node.children) && node.children.length === 0) {
        setLoadingSet((prev) => new Set(prev).add(nodeId))
        lazy(nodeId).then((children) => {
          setLazyChildren((prev) => new Map(prev).set(nodeId, children))
          setLoadingSet((prev) => {
            const next = new Set(prev)
            next.delete(nodeId)
            return next
          })
        }).catch(() => {
          setLoadingSet((prev) => {
            const next = new Set(prev)
            next.delete(nodeId)
            return next
          })
        })
      }
    }
  }, [expanded, lazy, nodes])

  const handleToggle = useCallback(
    async (nodeId: string) => {
      const isCurrentlyExpanded = expandedSet.has(nodeId)

      if (!isCurrentlyExpanded && lazy) {
        // Check if node has empty children (needs lazy loading)
        const findNode = (ns: TreeNode[]): TreeNode | undefined => {
          for (const n of ns) {
            if (n.id === nodeId) return n
            if (n.children) {
              const found = findNode(n.children)
              if (found) return found
            }
          }
          return undefined
        }
        const node = findNode(nodes)
        const existingChildren = lazyChildren.get(nodeId) ?? node?.children
        if (existingChildren && existingChildren.length === 0 && !lazyChildren.has(nodeId)) {
          setLoadingSet((prev) => new Set(prev).add(nodeId))
          try {
            const children = await lazy(nodeId)
            setLazyChildren((prev) => new Map(prev).set(nodeId, children))
          } finally {
            setLoadingSet((prev) => {
              const next = new Set(prev)
              next.delete(nodeId)
              return next
            })
          }
        }
      }

      onExpand?.(nodeId, !isCurrentlyExpanded)
    },
    [expandedSet, lazy, lazyChildren, nodes, onExpand]
  )

  const handleSelect = useCallback(
    (nodeId: string) => {
      onSelect?.(nodeId)
    },
    [onSelect]
  )

  // ── Keyboard Navigation ─────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tree = treeRef.current
      if (!tree) return

      const allItems = tree.querySelectorAll<HTMLElement>('[role="treeitem"]')
      const focusedEl = document.activeElement as HTMLElement
      const focusedIndex = Array.from(allItems).indexOf(focusedEl)
      if (focusedIndex < 0) return

      const focusedNodeId = focusedEl.getAttribute('data-node-id') || ''

      // Collect visible node IDs for navigation
      const visibleIds = collectVisibleIds(nodes, expandedSet, lazyChildren)

      const focusItem = (index: number) => {
        if (index >= 0 && index < allItems.length) {
          focusedEl.setAttribute('tabindex', '-1')
          allItems[index].setAttribute('tabindex', '0')
          allItems[index].focus()
        }
      }

      // Find next non-disabled index
      const findNextEnabled = (start: number, direction: 1 | -1): number => {
        let idx = start + direction
        while (idx >= 0 && idx < allItems.length) {
          if (allItems[idx].getAttribute('aria-disabled') !== 'true') return idx
          idx += direction
        }
        return -1
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const next = findNextEnabled(focusedIndex, 1)
          if (next >= 0) focusItem(next)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prev = findNextEnabled(focusedIndex, -1)
          if (prev >= 0) focusItem(prev)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          const node = findNodeById(focusedNodeId, nodes, lazyChildren)
          if (node && hasExpandableChildren(node)) {
            if (expandedSet.has(focusedNodeId)) {
              // Already expanded: move to first child
              const next = findNextEnabled(focusedIndex, 1)
              if (next >= 0) focusItem(next)
            } else {
              handleToggle(focusedNodeId)
            }
          }
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          const node = findNodeById(focusedNodeId, nodes, lazyChildren)
          if (node && hasExpandableChildren(node) && expandedSet.has(focusedNodeId)) {
            // Collapse
            onExpand?.(focusedNodeId, false)
          } else {
            // Move to parent
            const parentId = findParentId(focusedNodeId, nodes, null, lazyChildren)
            if (parentId) {
              const parentEl = tree.querySelector<HTMLElement>(`[data-node-id="${parentId}"]`)
              if (parentEl) {
                focusedEl.setAttribute('tabindex', '-1')
                parentEl.setAttribute('tabindex', '0')
                parentEl.focus()
              }
            }
          }
          break
        }
        case 'Home': {
          e.preventDefault()
          focusItem(0)
          break
        }
        case 'End': {
          e.preventDefault()
          focusItem(allItems.length - 1)
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          const node = findNodeById(focusedNodeId, nodes, lazyChildren)
          if (node && !node.disabled) {
            handleSelect(focusedNodeId)
          }
          break
        }
        case '*': {
          e.preventDefault()
          // Expand all siblings at this level
          const parentId = findParentId(focusedNodeId, nodes, null, lazyChildren)
          const siblings = parentId
            ? (lazyChildren.get(parentId) ?? findNodeById(parentId, nodes, lazyChildren)?.children ?? [])
            : nodes
          for (const sibling of siblings) {
            if (hasExpandableChildren(sibling) && !expandedSet.has(sibling.id)) {
              onExpand?.(sibling.id, true)
            }
          }
          break
        }
      }
    },
    [nodes, expandedSet, lazyChildren, handleToggle, handleSelect, onExpand]
  )

  return (
    <div
      className={cn(cls('root'), className)}
      data-motion={motionLevel}
      data-guides={showGuides || undefined}
      {...rest}
    >
      <ul
        ref={treeRef}
        role="tree"
        aria-multiselectable={multiSelect || undefined}
        onKeyDown={handleKeyDown}
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {nodes.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            expandedSet={expandedSet}
            selectedSet={selectedSet}
            loadingSet={loadingSet}
            lazyChildren={lazyChildren}
            onToggle={handleToggle}
            onSelect={handleSelect}
            motionLevel={motionLevel}
            lazy={lazy}
          />
        ))}
      </ul>
    </div>
  )
}

// ─── Utility ────────────────────────────────────────────────────────────────

function findNodeById(
  id: string,
  nodes: TreeNode[],
  lazyChildren: Map<string, TreeNode[]> = new Map()
): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const children = lazyChildren.get(node.id) ?? node.children
    if (children) {
      const found = findNodeById(id, children, lazyChildren)
      if (found) return found
    }
  }
  return undefined
}

TreeView.displayName = 'TreeView'
