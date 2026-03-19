'use client'

import type React from 'react'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { cn } from '../utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A sortable item must have a string id. */
export interface SortableItem {
  id: string
  [key: string]: unknown
}

/** Props passed to the drag handle in the render function. */
export interface DragHandleProps {
  /** Attach to the drag handle element. */
  onPointerDown: (e: React.PointerEvent) => void
  /** Whether this item is currently being dragged. */
  isDragging: boolean
  /** Keyboard handler for accessible reordering. */
  onKeyDown: (e: React.KeyboardEvent) => void
  /** The drag handle should be focusable. */
  tabIndex: number
  /** ARIA role for the drag handle. */
  role: string
  /** ARIA description for keyboard reordering. */
  'aria-roledescription': string
}

/** Props for the SortableList component. */
export interface SortableListProps<T extends SortableItem> {
  /** Array of items to display. Each must have a unique `id`. */
  items: T[]
  /** Callback when items are reordered. Receives the new array. */
  onReorder: (items: T[]) => void
  /** Render function for each item. Receives the item, its index, and drag handle props. */
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => React.JSX.Element
  /** Layout direction. Default "vertical". */
  direction?: 'vertical' | 'horizontal'
  /** Additional class name for the list container. */
  className?: string
}

// ---------------------------------------------------------------------------
// SortableList
// ---------------------------------------------------------------------------

/**
 * @description A drag-and-drop reorderable list with smooth Framer Motion layout animations.
 * Pure React implementation using pointer events (no external DnD library).
 * Supports keyboard reordering (Space to pick up, arrows to move, Enter/Space to drop).
 * Touch-friendly and accessible.
 */
export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  direction = 'vertical',
  className,
}: SortableListProps<T>): React.JSX.Element {
  const prefersReducedMotion = useReducedMotion()
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
  const [kbPickedIdx, setKbPickedIdx] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })
  const dragItemId = useRef<string | null>(null)
  const dragIdxRef = useRef<number | null>(null)
  const overIdxRef = useRef<number | null>(null)

  const handlePointerDown = useCallback(
    (index: number) => (e: React.PointerEvent) => {
      e.preventDefault()
      // Only respond to primary button / touch
      if (e.button !== 0) return

      setDragIdx(index)
      setOverIdx(index)
      dragIdxRef.current = index
      overIdxRef.current = index
      dragItemId.current = items[index]?.id ?? null
      startPos.current = { x: e.clientX, y: e.clientY }

      const handlePointerMove = (ev: PointerEvent) => {
        if (!containerRef.current) return
        const container = containerRef.current
        const children = Array.from(container.children) as HTMLElement[]

        // Find which item we're over
        for (let i = 0; i < children.length; i++) {
          const rect = children[i]!.getBoundingClientRect()
          const midX = rect.left + rect.width / 2
          const midY = rect.top + rect.height / 2
          const isOver = direction === 'vertical'
            ? ev.clientY < midY + rect.height / 2 && ev.clientY > midY - rect.height / 2
            : ev.clientX < midX + rect.width / 2 && ev.clientX > midX - rect.width / 2

          if (isOver) {
            overIdxRef.current = i
            setOverIdx(i)
            break
          }
        }
      }

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)

        const prev = dragIdxRef.current
        const over = overIdxRef.current
        if (prev !== null && over !== null && prev !== over) {
          const newItems = [...items]
          const [moved] = newItems.splice(prev, 1)
          if (moved) newItems.splice(over, 0, moved)
          onReorder(newItems)
        }
        dragIdxRef.current = null
        overIdxRef.current = null
        setDragIdx(null)
        setOverIdx(null)
      }

      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
    },
    [items, onReorder, direction],
  )

  // Keyboard reorder
  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (kbPickedIdx === null) {
          // Pick up
          setKbPickedIdx(index)
        } else {
          // Drop
          if (kbPickedIdx !== index) {
            const newItems = [...items]
            const [moved] = newItems.splice(kbPickedIdx, 1)
            if (moved) newItems.splice(index, 0, moved)
            onReorder(newItems)
          }
          setKbPickedIdx(null)
        }
      } else if (e.key === 'Escape') {
        setKbPickedIdx(null)
      } else if (kbPickedIdx !== null) {
        const isUp = direction === 'vertical' ? e.key === 'ArrowUp' : e.key === 'ArrowLeft'
        const isDown = direction === 'vertical' ? e.key === 'ArrowDown' : e.key === 'ArrowRight'

        if (isUp && kbPickedIdx > 0) {
          e.preventDefault()
          const newItems = [...items]
          const [moved] = newItems.splice(kbPickedIdx, 1)
          const newIdx = kbPickedIdx - 1
          if (moved) newItems.splice(newIdx, 0, moved)
          onReorder(newItems)
          setKbPickedIdx(newIdx)
        } else if (isDown && kbPickedIdx < items.length - 1) {
          e.preventDefault()
          const newItems = [...items]
          const [moved] = newItems.splice(kbPickedIdx, 1)
          const newIdx = kbPickedIdx + 1
          if (moved) newItems.splice(newIdx, 0, moved)
          onReorder(newItems)
          setKbPickedIdx(newIdx)
        }
      }
    },
    [items, onReorder, kbPickedIdx, direction],
  )

  // Compute visual order during drag
  const getVisualItems = useCallback(() => {
    if (dragIdx === null || overIdx === null || dragIdx === overIdx) return items
    const visual = [...items]
    const [moved] = visual.splice(dragIdx, 1)
    if (moved) visual.splice(overIdx, 0, moved)
    return visual
  }, [items, dragIdx, overIdx])

  const visualItems = dragIdx !== null ? getVisualItems() : items

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className,
      )}
      role="listbox"
      aria-label="Sortable list"
    >
      <AnimatePresence>
        {visualItems.map((item, index) => {
          const isDragging = dragIdx !== null && item.id === dragItemId.current
          const isKbPicked = kbPickedIdx !== null && items[kbPickedIdx]?.id === item.id

          const dragHandleProps: DragHandleProps = {
            onPointerDown: handlePointerDown(items.findIndex(i => i.id === item.id)),
            isDragging: isDragging || isKbPicked,
            onKeyDown: handleKeyDown(items.findIndex(i => i.id === item.id)),
            tabIndex: 0,
            role: 'option',
            'aria-roledescription': 'sortable item',
          }

          return (
            <motion.div
              key={item.id}
              layout={!prefersReducedMotion}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35, mass: 0.5 }}
              className={cn(
                'relative',
                isDragging && 'z-10 opacity-80',
                isKbPicked && 'ring-2 ring-[hsl(var(--brand-primary))] rounded-lg',
              )}
              role="option"
              aria-selected={isKbPicked}
            >
              {/* Drop indicator line */}
              {dragIdx !== null && overIdx === index && !isDragging && (
                <div
                  className={cn(
                    'absolute z-20 bg-[hsl(var(--brand-primary))] rounded-full',
                    direction === 'vertical'
                      ? 'left-0 right-0 -top-px h-0.5'
                      : 'top-0 bottom-0 -left-px w-0.5',
                  )}
                />
              )}
              {renderItem(item, index, dragHandleProps)}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/**
 * @description Default drag handle component. Renders a GripVertical icon
 * with proper pointer/keyboard event handlers from DragHandleProps.
 */
export function DragHandle(props: DragHandleProps): React.JSX.Element {
  return (
    <span
      onPointerDown={props.onPointerDown}
      onKeyDown={props.onKeyDown}
      tabIndex={props.tabIndex}
      role={props.role}
      aria-roledescription={props['aria-roledescription']}
      className={cn(
        'inline-flex items-center justify-center p-2.5 rounded cursor-grab touch-none select-none',
        'text-[hsl(var(--text-disabled))] hover:text-[hsl(var(--text-secondary))] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))]',
        props.isDragging && 'cursor-grabbing text-[hsl(var(--brand-primary))]',
      )}
    >
      <GripVertical className="h-4 w-4" />
    </span>
  )
}
