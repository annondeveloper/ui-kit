import { forwardRef, useState, type HTMLAttributes } from 'react'

export interface LiteColumnVisibilityToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: { id: string; label: string; visible: boolean }[]
  onChange?: (columnId: string, visible: boolean) => void
  onReset?: () => void
}

export const ColumnVisibilityToggle = forwardRef<HTMLDivElement, LiteColumnVisibilityToggleProps>(
  ({ columns, onChange, onReset, className, ...rest }, ref) => {
    const [open, setOpen] = useState(false)
    const visible = columns.filter((c) => c.visible).length
    return (
      <div ref={ref} className={`ui-lite-column-visibility${className ? ` ${className}` : ''}`} {...rest}>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
          className="ui-lite-column-visibility__trigger">
          Columns ({visible}/{columns.length})
        </button>
        {open && (
          <div className="ui-lite-column-visibility__dropdown" role="listbox">
            {columns.map((col) => (
              <label key={col.id} className="ui-lite-column-visibility__item">
                <input type="checkbox" checked={col.visible}
                  onChange={() => onChange?.(col.id, !col.visible)} />
                {col.label}
              </label>
            ))}
            {onReset && <button type="button" onClick={onReset}
              className="ui-lite-column-visibility__reset">Reset</button>}
          </div>
        )}
      </div>
    )
  }
)
ColumnVisibilityToggle.displayName = 'ColumnVisibilityToggle'
