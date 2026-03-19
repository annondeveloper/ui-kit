'use client'

import type React from 'react'
import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '../utils'

export interface TreeNode {
  /** Unique identifier for the node. */
  id: string
  /** Display label. */
  label: string
  /** Optional icon component rendered before the label. */
  icon?: React.ComponentType<{ className?: string }>
  /** Child nodes. */
  children?: TreeNode[]
  /** Disable selection and interaction for this node. */
  disabled?: boolean
}

export interface TreeViewProps {
  /** The tree data structure to render. */
  data: TreeNode[]
  /** Currently selected node ID(s). */
  selected?: string | string[]
  /** Called when a node is selected. */
  onSelect?: (id: string) => void
  /** Called when a node is expanded or collapsed. */
  onExpand?: (id: string, expanded: boolean) => void
  /** IDs of initially expanded nodes. */
  defaultExpanded?: string[]
  /** Enable multi-select with Ctrl+Click and Shift+Click. */
  multiSelect?: boolean
  /** Show connecting lines between parent and child nodes. */
  showLines?: boolean
  className?: string
}

/** Flatten all visible node IDs in tree order for keyboard navigation. */
function flattenVisible(nodes: TreeNode[], expanded: Set<string>): string[] {
  const result: string[] = []
  function walk(items: TreeNode[]) {
    for (const node of items) {
      result.push(node.id)
      if (node.children?.length && expanded.has(node.id)) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return result
}

/** Find a node and its parent in the tree. */
function findNode(
  nodes: TreeNode[],
  id: string,
  parent?: TreeNode,
): { node: TreeNode; parent?: TreeNode } | undefined {
  for (const node of nodes) {
    if (node.id === id) return { node, parent }
    if (node.children?.length) {
      const found = findNode(node.children, id, node)
      if (found) return found
    }
  }
  return undefined
}

interface TreeItemProps {
  node: TreeNode
  level: number
  expanded: Set<string>
  selectedSet: Set<string>
  focusedId: string | null
  showLines: boolean
  reduced: boolean | null
  onToggle: (id: string) => void
  onSelect: (id: string, e: React.MouseEvent | React.KeyboardEvent) => void
  onFocus: (id: string) => void
  itemRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
}

function TreeItem({
  node,
  level,
  expanded,
  selectedSet,
  focusedId,
  showLines,
  reduced,
  onToggle,
  onSelect,
  onFocus,
  itemRefs,
}: TreeItemProps): React.JSX.Element {
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = expanded.has(node.id)
  const isSelected = selectedSet.has(node.id)
  const isFocused = focusedId === node.id
  const Icon = node.icon

  const transition = reduced ? { duration: 0 } : { duration: 0.15 }

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-level={level + 1} aria-selected={isSelected} aria-disabled={node.disabled || undefined}>
      <div
        ref={(el) => {
          if (el) itemRefs.current.set(node.id, el)
          else itemRefs.current.delete(node.id)
        }}
        tabIndex={isFocused ? 0 : -1}
        data-tree-id={node.id}
        onClick={(e) => {
          if (node.disabled) return
          if (hasChildren) onToggle(node.id)
          onSelect(node.id, e)
        }}
        onFocus={() => onFocus(node.id)}
        className={cn(
          'flex items-center gap-1.5 min-h-[40px] px-2 py-1 rounded-lg cursor-pointer select-none',
          'text-sm transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))]',
          isSelected
            ? 'bg-[hsl(var(--brand-primary))]/15 text-[hsl(var(--text-primary))]'
            : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))] hover:text-[hsl(var(--text-primary))]',
          node.disabled && 'opacity-40 cursor-not-allowed',
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
      >
        {/* Chevron or spacer */}
        {hasChildren ? (
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={transition}
            className="flex-shrink-0 flex items-center justify-center w-4 h-4"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
        ) : (
          <span className="w-4 h-4 flex-shrink-0" />
        )}

        {/* Icon */}
        {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-[hsl(var(--text-tertiary))]" />}

        {/* Label */}
        <span className="truncate">{node.label}</span>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key={`children-${node.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'overflow-hidden',
                showLines && 'relative',
              )}
              role="group"
            >
              {/* Connecting line */}
              {showLines && (
                <div
                  className="absolute top-0 bottom-2 border-l border-dotted border-[hsl(var(--border-subtle))]"
                  style={{ left: `${(level + 1) * 1.25 + 0.5 + 0.45}rem` }}
                />
              )}
              {node.children!.map((child) => (
                <TreeItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  expanded={expanded}
                  selectedSet={selectedSet}
                  focusedId={focusedId}
                  showLines={showLines}
                  reduced={reduced}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  onFocus={onFocus}
                  itemRefs={itemRefs}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}

/**
 * @description An accessible tree view with keyboard navigation, expand/collapse animations,
 * optional connecting lines, and multi-select support. Built with Framer Motion for smooth
 * height transitions and chevron rotation. Respects prefers-reduced-motion.
 */
export function TreeView({
  data,
  selected,
  onSelect,
  onExpand,
  defaultExpanded = [],
  multiSelect = false,
  showLines = false,
  className,
}: TreeViewProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded))
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [selectedSet, setSelectedSet] = useState<Set<string>>(() => {
    if (!selected) return new Set()
    return new Set(Array.isArray(selected) ? selected : [selected])
  })
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const rootRef = useRef<HTMLDivElement>(null)

  // Sync controlled selected prop
  useEffect(() => {
    if (selected !== undefined) {
      setSelectedSet(new Set(Array.isArray(selected) ? selected : [selected]))
    }
  }, [selected])

  const visibleIds = useMemo(() => flattenVisible(data, expanded), [data, expanded])

  const handleToggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev)
        const nowExpanded = !next.has(id)
        if (nowExpanded) next.add(id)
        else next.delete(id)
        onExpand?.(id, nowExpanded)
        return next
      })
    },
    [onExpand],
  )

  const handleSelect = useCallback(
    (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
      const node = findNode(data, id)
      if (!node || node.node.disabled) return

      if (multiSelect && 'ctrlKey' in e && e.ctrlKey) {
        setSelectedSet((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      } else {
        setSelectedSet(new Set([id]))
      }
      onSelect?.(id)
    },
    [data, multiSelect, onSelect],
  )

  const focusNode = useCallback((id: string) => {
    setFocusedId(id)
    const el = itemRefs.current.get(id)
    el?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!focusedId) return

      const idx = visibleIds.indexOf(focusedId)
      if (idx === -1) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const nextId = visibleIds[idx + 1]
          if (nextId) focusNode(nextId)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prevId = visibleIds[idx - 1]
          if (prevId) focusNode(prevId)
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          const found = findNode(data, focusedId)
          if (found?.node.children?.length) {
            if (!expanded.has(focusedId)) {
              handleToggle(focusedId)
            } else {
              // Move to first child
              focusNode(found.node.children[0].id)
            }
          }
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          if (expanded.has(focusedId)) {
            handleToggle(focusedId)
          } else {
            // Move to parent
            const found = findNode(data, focusedId)
            if (found?.parent) focusNode(found.parent.id)
          }
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          handleSelect(focusedId, e)
          break
        }
        case 'Home': {
          e.preventDefault()
          if (visibleIds.length) focusNode(visibleIds[0])
          break
        }
        case 'End': {
          e.preventDefault()
          if (visibleIds.length) focusNode(visibleIds[visibleIds.length - 1])
          break
        }
      }
    },
    [focusedId, visibleIds, data, expanded, handleToggle, handleSelect, focusNode],
  )

  return (
    <div
      ref={rootRef}
      role="tree"
      aria-label="Tree view"
      aria-multiselectable={multiSelect || undefined}
      onKeyDown={handleKeyDown}
      className={cn('py-1', className)}
    >
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          selectedSet={selectedSet}
          focusedId={focusedId}
          showLines={showLines}
          reduced={reduced}
          onToggle={handleToggle}
          onSelect={handleSelect}
          onFocus={setFocusedId}
          itemRefs={itemRefs}
        />
      ))}
    </div>
  )
}
