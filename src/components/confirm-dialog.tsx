'use client'

import type React from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '../utils'

export interface ConfirmDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Callback to control open state. */
  onOpenChange: (open: boolean) => void
  /** Dialog title. */
  title: string
  /** Dialog description text. */
  description: string
  /** Label for the confirm button. */
  confirmLabel?: string
  /** Label for the cancel button. */
  cancelLabel?: string
  /** Visual variant affecting the icon and confirm button color. */
  variant?: 'danger' | 'warning' | 'default'
  /** Show a loading spinner on the confirm button. */
  loading?: boolean
  /** Callback when confirmed. */
  onConfirm: () => void
}

const variantStyles = {
  danger: {
    icon: 'text-[hsl(var(--status-critical))] bg-[hsl(var(--status-critical))]/10',
    button: 'bg-[hsl(var(--status-critical))] hover:bg-[hsl(var(--status-critical))]/90 text-[hsl(var(--text-on-brand))]',
  },
  warning: {
    icon: 'text-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning))]/10',
    button: 'bg-[hsl(var(--status-warning))] hover:bg-[hsl(var(--status-warning))]/90 text-[hsl(var(--text-on-brand))]',
  },
  default: {
    icon: 'text-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))]/10',
    button: 'bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90 text-[hsl(var(--text-on-brand))]',
  },
}

/**
 * @description A confirmation dialog built on Radix AlertDialog with Framer Motion animations.
 * Supports danger, warning, and default variants with loading state.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
}: ConfirmDialogProps): React.JSX.Element {
  const styles = variantStyles[variant]

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <AlertDialog.Portal forceMount>
            <AlertDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 bg-[hsl(var(--bg-base)/0.7)] backdrop-blur-sm"
              />
            </AlertDialog.Overlay>
            <AlertDialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                  'w-full max-w-md p-6 rounded-2xl',
                  'border border-[hsl(var(--border-default))]',
                  'bg-[hsl(var(--bg-elevated))] shadow-2xl',
                  'focus:outline-none',
                )}
              >
                <div className="flex gap-4">
                  <div className={cn('flex-shrink-0 p-2.5 rounded-xl h-fit', styles.icon)}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AlertDialog.Title className="text-base font-semibold text-[hsl(var(--text-primary))]">
                      {title}
                    </AlertDialog.Title>
                    <AlertDialog.Description className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      {description}
                    </AlertDialog.Description>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <AlertDialog.Cancel
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg',
                      'border border-[hsl(var(--border-default))]',
                      'text-[hsl(var(--text-primary))]',
                      'hover:bg-[hsl(var(--bg-overlay))] transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))]',
                    )}
                  >
                    {cancelLabel}
                  </AlertDialog.Cancel>
                  <AlertDialog.Action
                    onClick={(e) => {
                      e.preventDefault()
                      onConfirm()
                    }}
                    disabled={loading}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--bg-elevated))]',
                      styles.button,
                      loading && 'opacity-70 cursor-not-allowed',
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {confirmLabel}
                      </span>
                    ) : (
                      confirmLabel
                    )}
                  </AlertDialog.Action>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  )
}
