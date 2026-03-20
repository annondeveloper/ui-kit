'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InlineEditProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  multiline?: boolean
  editTrigger?: 'click' | 'dblclick'
  onSave?: (value: string) => void
  onCancel?: () => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const inlineEditStyles = css`
  @layer components {
    @scope (.ui-inline-edit) {
      :scope {
        display: inline-flex;
        position: relative;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: default;
      }

      /* Display mode */
      .ui-inline-edit__display {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        padding-block: 0.125rem;
        padding-inline: 0.25rem;
        margin-inline: -0.25rem;
        outline: none;
        transition: background 0.15s var(--ease-out, ease-out);
        border: 1px solid transparent;
        min-inline-size: 2rem;
      }

      .ui-inline-edit__display:hover {
        background: oklch(100% 0 0 / 0.04);
        border-color: var(--border-default, oklch(100% 0 0 / 0.08));
      }

      .ui-inline-edit__display:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      :scope[data-disabled] .ui-inline-edit__display {
        cursor: default;
        pointer-events: none;
      }

      :scope[data-disabled] .ui-inline-edit__display:hover {
        background: transparent;
        border-color: transparent;
      }

      .ui-inline-edit__text {
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-inline-edit__placeholder {
        line-height: 1.5;
        color: var(--text-tertiary, oklch(60% 0 0));
        font-style: italic;
      }

      .ui-inline-edit__icon {
        display: inline-flex;
        align-items: center;
        color: var(--text-tertiary, oklch(60% 0 0));
        opacity: 0;
        transition: opacity 0.15s var(--ease-out, ease-out);
        flex-shrink: 0;
      }

      .ui-inline-edit__display:hover .ui-inline-edit__icon,
      .ui-inline-edit__display:focus-visible .ui-inline-edit__icon {
        opacity: 1;
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-inline-edit__text,
      :scope[data-size="sm"] .ui-inline-edit__placeholder {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="sm"] .ui-inline-edit__field {
        font-size: var(--text-xs, 0.75rem);
        min-block-size: 24px;
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
      }

      :scope[data-size="md"] .ui-inline-edit__text,
      :scope[data-size="md"] .ui-inline-edit__placeholder {
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="md"] .ui-inline-edit__field {
        font-size: var(--text-sm, 0.875rem);
        min-block-size: 32px;
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
      }

      :scope[data-size="lg"] .ui-inline-edit__text,
      :scope[data-size="lg"] .ui-inline-edit__placeholder {
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="lg"] .ui-inline-edit__field {
        font-size: var(--text-base, 1rem);
        min-block-size: 40px;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
      }

      /* Edit mode — input/textarea */
      .ui-inline-edit__field {
        display: block;
        inline-size: 100%;
        border: 1px solid var(--brand, oklch(65% 0.2 270));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        line-height: 1.5;
        outline: none;
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
        resize: vertical;
      }

      /* Entry animation */
      :scope:not([data-motion="0"]) .ui-inline-edit__field {
        animation: ui-inline-edit-enter 0.15s var(--ease-out, ease-out);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-inline-edit__display {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-inline-edit__display:hover {
          border: 1px solid ButtonText;
        }
        .ui-inline-edit__field {
          border: 2px solid Highlight;
        }
        .ui-inline-edit__display:focus-visible {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-inline-edit__icon {
          display: none;
        }
        .ui-inline-edit__display:hover {
          background: transparent;
          border-color: transparent;
        }
      }
    }

    @keyframes ui-inline-edit-enter {
      from {
        opacity: 0.7;
        transform: scale(0.98);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>(
  (
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      size = 'md',
      multiline = false,
      editTrigger = 'click',
      onSave,
      onCancel,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('inline-edit', inlineEditStyles)
    const motionLevel = useMotionLevel(motionProp)

    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

    // Sync edit value when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    // ── Enter edit mode ───────────────────────────────────────────────

    const enterEditMode = useCallback(() => {
      if (disabled) return
      setEditValue(value)
      setIsEditing(true)
    }, [disabled, value])

    // ── Save ──────────────────────────────────────────────────────────

    const save = useCallback(() => {
      setIsEditing(false)
      onChange(editValue)
      onSave?.(editValue)
    }, [editValue, onChange, onSave])

    // ── Cancel ────────────────────────────────────────────────────────

    const cancel = useCallback(() => {
      setIsEditing(false)
      setEditValue(value)
      onCancel?.()
    }, [value, onCancel])

    // ── Event handlers ────────────────────────────────────────────────

    const handleDisplayClick = useCallback(() => {
      if (editTrigger === 'click') {
        enterEditMode()
      }
    }, [editTrigger, enterEditMode])

    const handleDisplayDblClick = useCallback(() => {
      if (editTrigger === 'dblclick') {
        enterEditMode()
      }
    }, [editTrigger, enterEditMode])

    const handleDisplayKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          enterEditMode()
        }
      },
      [enterEditMode]
    )

    const handleFieldKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          cancel()
          return
        }

        if (multiline) {
          // Ctrl+Enter saves in multiline
          if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            save()
          }
        } else {
          // Enter saves in single-line
          if (e.key === 'Enter') {
            e.preventDefault()
            save()
          }
        }
      },
      [multiline, save, cancel]
    )

    const handleBlur = useCallback(() => {
      save()
    }, [save])

    // ── Render ────────────────────────────────────────────────────────

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...rest}
      >
        {isEditing ? (
          multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="ui-inline-edit__field"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleFieldKeyDown}
              onBlur={handleBlur}
              aria-label="Edit value"
              rows={3}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className="ui-inline-edit__field"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleFieldKeyDown}
              onBlur={handleBlur}
              aria-label="Edit value"
            />
          )
        ) : (
          <div
            className="ui-inline-edit__display"
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={handleDisplayClick}
            onDoubleClick={handleDisplayDblClick}
            onKeyDown={handleDisplayKeyDown}
            aria-label={`Edit: ${value || placeholder || 'empty'}`}
          >
            {value ? (
              <span className="ui-inline-edit__text">{value}</span>
            ) : (
              <span className="ui-inline-edit__placeholder">{placeholder || ''}</span>
            )}
            {!disabled && (
              <span className="ui-inline-edit__icon" aria-hidden="true">
                <Icon name="edit" size="sm" />
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
InlineEdit.displayName = 'InlineEdit'
