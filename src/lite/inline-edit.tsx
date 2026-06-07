import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteInlineEditProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Use <textarea> instead of <input> */
  multiline?: boolean
  /** Interaction that activates editing mode */
  editTrigger?: 'click' | 'dblclick'
  /** Called with the committed value; same as onChange but more explicit */
  onSave?: (value: string) => void
  /** Called when the user cancels (Escape key or blur without change) */
  onCancel?: () => void
}

const inlineEditStyles = css`
  @layer components {
    @scope (.ui-lite-inline-edit) {
      :scope {
        display: inline-block;
        font-family: inherit;
        color: var(--text-primary, oklch(97% 0 0));
      }

      :scope[data-size="sm"] { font-size: 0.8125rem; }
      :scope[data-size="md"] { font-size: 0.875rem; }
      :scope[data-size="lg"] { font-size: 1rem; }

      :scope[data-disabled] {
        opacity: 0.5;
        pointer-events: none;
      }

      .ui-lite-inline-edit span[role="button"] {
        cursor: pointer;
        padding: 0.25rem 0.375rem;
        border-radius: var(--radius-sm, 6px);
        border: 1px dashed transparent;
      }
      .ui-lite-inline-edit span[role="button"]:hover {
        background: oklch(100% 0 0 / 0.04);
        border-color: var(--border-default, oklch(100% 0 0 / 0.08));
      }
      .ui-lite-inline-edit span[role="button"]:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-lite-inline-edit input,
      .ui-lite-inline-edit textarea {
        padding: 0.25rem 0.375rem;
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--brand, oklch(65% 0.2 270));
        border-radius: var(--radius-sm, 6px);
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: inherit;
        inline-size: 100%;
      }
      .ui-lite-inline-edit textarea {
        resize: vertical;
        min-block-size: 4em;
      }
      .ui-lite-inline-edit input:focus-visible,
      .ui-lite-inline-edit textarea:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
    }
  }
`

export const InlineEdit = forwardRef<HTMLDivElement, LiteInlineEditProps>(
  ({ value, onChange, placeholder = 'Click to edit', disabled, size, multiline, editTrigger = 'click', onSave, onCancel, className, ...rest }, ref) => {
    useStyles('lite-inline-edit', inlineEditStyles)
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)

    const startEditing = useCallback(() => {
      if (disabled) return
      setDraft(value)
      setEditing(true)
    }, [disabled, value])

    const commit = useCallback(() => {
      setEditing(false)
      if (draft !== value) {
        onChange?.(draft)
        onSave?.(draft)
      }
    }, [draft, value, onChange, onSave])

    const cancel = useCallback(() => {
      setDraft(value)
      setEditing(false)
      onCancel?.()
    }, [value, onCancel])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!multiline && e.key === 'Enter') commit()
      if (e.key === 'Escape') cancel()
    }, [commit, cancel, multiline])

    const triggerProps = editTrigger === 'dblclick'
      ? { onDoubleClick: startEditing }
      : { onClick: startEditing }

    return (
      <div
        ref={ref}
        className={`ui-lite-inline-edit${className ? ` ${className}` : ''}`}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        data-editing={editing ? '' : undefined}
        {...rest}
      >
        {editing ? (
          multiline ? (
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          )
        ) : (
          <span
            role={disabled ? undefined : 'button'}
            tabIndex={disabled ? undefined : 0}
            {...triggerProps}
            onKeyDown={disabled ? undefined : e => { if (e.key === 'Enter') startEditing() }}
          >
            {value || placeholder}
          </span>
        )}
      </div>
    )
  }
)
InlineEdit.displayName = 'InlineEdit'
