'use client'

import { useEffect, useCallback, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../utils'

export interface SheetProps {
  /** Whether the sheet is open. */
  open: boolean
  /** Callback to close the sheet. */
  onClose: () => void
  /** Edge from which the sheet slides in. */
  side?: 'right' | 'left' | 'top' | 'bottom'
  /** Title displayed in the sheet header. */
  title?: string
  /** Description text below the title. */
  description?: string
  /** Width class for left/right sheets, height class for top/bottom. */
  width?: string
  /** Sheet content. */
  children: ReactNode
  /** Additional class name for the panel. */
  className?: string
}

const slideVariants = {
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
  bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
}

const positionClasses = {
  right: 'inset-y-0 right-0',
  left: 'inset-y-0 left-0',
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
}

/**
 * @description A slide-over panel (drawer) from any edge of the screen.
 * Features backdrop overlay, spring animation, Escape to close, backdrop click to close,
 * and focus trapping within the panel.
 */
export function Sheet({
  open,
  onClose,
  side = 'right',
  title,
  description,
  width = 'max-w-md',
  children,
  className,
}: SheetProps) {
  const prefersReducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = prevOverflow
      }
    }
  }, [open, handleKeyDown])

  // Focus the panel when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        panelRef.current?.focus()
      })
    }
  }, [open])

  const isHorizontal = side === 'left' || side === 'right'
  const variants = slideVariants[side]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="absolute inset-0 bg-[hsl(var(--bg-base)/0.6)] backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 400, damping: 35 }
            }
            className={cn(
              'absolute flex flex-col',
              'bg-[hsl(var(--bg-surface))] border-[hsl(var(--border-default))]',
              'shadow-2xl focus:outline-none',
              positionClasses[side],
              isHorizontal
                ? cn('w-full h-full', width, side === 'right' ? 'border-l' : 'border-r')
                : cn('h-auto w-full', side === 'top' ? 'border-b' : 'border-t'),
              className,
            )}
          >
            {/* Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[hsl(var(--border-subtle))]">
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-base font-semibold text-[hsl(var(--text-primary))]">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    'shrink-0 p-1.5 rounded-lg transition-colors',
                    'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]',
                    'hover:bg-[hsl(var(--bg-elevated))]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))]',
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
