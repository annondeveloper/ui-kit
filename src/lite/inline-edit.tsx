import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react'

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

export const InlineEdit = forwardRef<HTMLDivElement, LiteInlineEditProps>(
  ({ value, onChange, placeholder = 'Click to edit', disabled, size, multiline, editTrigger = 'click', onSave, onCancel, className, ...rest }, ref) => {
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
