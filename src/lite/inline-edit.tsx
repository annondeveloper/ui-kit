import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react'

export interface LiteInlineEditProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
}

export const InlineEdit = forwardRef<HTMLDivElement, LiteInlineEditProps>(
  ({ value, onChange, placeholder = 'Click to edit', className, ...rest }, ref) => {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)

    const commit = useCallback(() => {
      setEditing(false)
      if (draft !== value) onChange?.(draft)
    }, [draft, value, onChange])

    return (
      <div ref={ref} className={`ui-lite-inline-edit${className ? ` ${className}` : ''}`} {...rest}>
        {editing ? (
          <input
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
            autoFocus
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={() => { setDraft(value); setEditing(true) }}
            onKeyDown={e => { if (e.key === 'Enter') { setDraft(value); setEditing(true) } }}
          >
            {value || placeholder}
          </span>
        )}
      </div>
    )
  }
)
InlineEdit.displayName = 'InlineEdit'
