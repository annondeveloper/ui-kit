'use client'

import type React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Pencil, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '../utils'

export interface InlineEditProps {
  /** The current display value. */
  value: string
  /** Called with the new value when the user commits an edit. May return a Promise for async saves. */
  onSave: (value: string) => void | Promise<void>
  /** Called when the user cancels an edit. */
  onCancel?: () => void
  /** Input type for the editor. */
  type?: 'text' | 'number'
  /** Placeholder text shown when the value is empty. */
  placeholder?: string
  /** Disable editing. */
  disabled?: boolean
  /** Whether blur should trigger a save. */
  saveOnBlur?: boolean
  /** Custom render for the display state. */
  renderDisplay?: (value: string, onEdit: () => void) => React.ReactNode
  /** Custom render for the editor state. */
  renderEditor?: (value: string, onChange: (v: string) => void, onSave: () => void, onCancel: () => void) => React.ReactNode
  /** Accessible label for the editable field. */
  'aria-label'?: string
  className?: string
}

/**
 * @description An accessible inline editing component. Displays a value with a pencil
 * icon on hover; click or press Enter to edit. Supports async save with loading/error
 * states, custom renderers, and smooth Framer Motion transitions.
 */
export function InlineEdit({
  value,
  onSave,
  onCancel,
  type = 'text',
  placeholder = 'Click to edit',
  disabled = false,
  saveOnBlur = true,
  renderDisplay,
  renderEditor,
  'aria-label': ariaLabel = 'Editable value',
  className,
}: InlineEditProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const blurSaveRef = useRef(true)

  // Sync draft when value changes externally while not editing
  useEffect(() => {
    if (!editing) {
      setDraft(value)
    }
  }, [value, editing])

  const enterEdit = useCallback(() => {
    if (disabled || saving) return
    setDraft(value)
    setError(false)
    setEditing(true)
  }, [disabled, saving, value])

  const cancelEdit = useCallback(() => {
    blurSaveRef.current = false
    setDraft(value)
    setError(false)
    setEditing(false)
    onCancel?.()
    // Re-enable blur save after a tick
    requestAnimationFrame(() => {
      blurSaveRef.current = true
    })
  }, [value, onCancel])

  const commitSave = useCallback(async () => {
    if (saving) return
    if (draft === value) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(false)
    try {
      await onSave(draft)
      setEditing(false)
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }, [saving, draft, value, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commitSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        cancelEdit()
      }
    },
    [commitSave, cancelEdit],
  )

  const handleBlur = useCallback(() => {
    if (!blurSaveRef.current) return
    if (saveOnBlur) {
      commitSave()
    } else {
      cancelEdit()
    }
  }, [saveOnBlur, commitSave, cancelEdit])

  // Auto-focus and select on entering edit mode
  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [editing])

  const transition = reduced ? { duration: 0 } : { duration: 0.15 }

  return (
    <div
      className={cn('relative inline-flex items-center min-h-[44px]', className)}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={transition}
            className="flex items-center gap-2"
          >
            {renderEditor ? (
              renderEditor(draft, setDraft, commitSave, cancelEdit)
            ) : (
              <div className="relative">
                <input
                  ref={inputRef}
                  type={type}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  disabled={saving}
                  aria-label={ariaLabel}
                  aria-invalid={error}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg min-w-[120px]',
                    'bg-[hsl(var(--bg-base))] text-[hsl(var(--text-primary))]',
                    'border outline-none transition-colors',
                    'focus:ring-2 focus:ring-[hsl(var(--brand-primary))] focus:border-transparent',
                    error
                      ? 'border-[hsl(var(--status-critical))] ring-1 ring-[hsl(var(--status-critical))]'
                      : 'border-[hsl(var(--border-default))]',
                    saving && 'opacity-60 cursor-not-allowed',
                  )}
                />
                {saving && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--text-tertiary))]" />
                )}
                {error && !saving && (
                  <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--status-critical))]" />
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={transition}
          >
            {renderDisplay ? (
              renderDisplay(value, enterEdit)
            ) : (
              <button
                type="button"
                role="textbox"
                aria-label={`${ariaLabel}: ${value || placeholder}. Press Enter to edit.`}
                aria-readonly="true"
                disabled={disabled}
                onClick={enterEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    enterEdit()
                  }
                }}
                className={cn(
                  'group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'text-sm text-[hsl(var(--text-primary))]',
                  'min-h-[44px] cursor-text transition-colors',
                  disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[hsl(var(--bg-elevated))]',
                )}
              >
                <span className={cn(!value && 'text-[hsl(var(--text-tertiary))]')}>
                  {value || placeholder}
                </span>
                {!disabled && (
                  <Pencil className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
