import { forwardRef, useState, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const columnVisibilityStyles = css`
  @layer components {
    @scope (.ui-lite-column-visibility) {
      :scope {
        position: relative;
        display: inline-block;
        font-family: inherit;
      }
      .ui-lite-column-visibility__trigger {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        white-space: nowrap;
      }
      .ui-lite-column-visibility__trigger:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.14));
      }
      .ui-lite-column-visibility__trigger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      .ui-lite-column-visibility__dropdown {
        position: absolute;
        inset-block-start: calc(100% + 4px);
        inset-inline-end: 0;
        min-inline-size: 200px;
        max-block-size: 320px;
        overflow-y: auto;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 0.75rem);
        box-shadow: var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
        padding-block: var(--space-xs, 0.25rem);
        z-index: 50;
      }
      .ui-lite-column-visibility__item {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding-block: 0.375rem;
        padding-inline: var(--space-md, 0.75rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(97% 0 0));
        user-select: none;
      }
      .ui-lite-column-visibility__item:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }
      .ui-lite-column-visibility__item input[type="checkbox"] {
        inline-size: 16px;
        block-size: 16px;
        accent-color: var(--brand, oklch(65% 0.2 270));
        cursor: pointer;
        flex-shrink: 0;
      }
      .ui-lite-column-visibility__reset {
        display: block;
        inline-size: 100%;
        margin-block-start: var(--space-xs, 0.25rem);
        padding-block: 0.375rem;
        padding-inline: var(--space-md, 0.75rem);
        border: none;
        border-block-start: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        background: transparent;
        color: var(--brand, oklch(65% 0.2 270));
        font-size: var(--text-sm, 0.875rem);
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        text-align: start;
      }
      .ui-lite-column-visibility__reset:hover {
        background: var(--bg-hover, oklch(100% 0 0 / 0.06));
      }
      .ui-lite-column-visibility__reset:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
      }
      @media (pointer: coarse) {
        .ui-lite-column-visibility__item { min-block-size: 44px; }
        .ui-lite-column-visibility__trigger { min-block-size: 44px; }
      }
      @media (forced-colors: active) {
        .ui-lite-column-visibility__dropdown,
        .ui-lite-column-visibility__trigger { border: 1px solid ButtonText; }
      }
    }
  }
`

export interface LiteColumnVisibilityToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  columns: { id: string; label: string; visible: boolean }[]
  onChange?: (columnId: string, visible: boolean) => void
  onReset?: () => void
}

export const ColumnVisibilityToggle = forwardRef<HTMLDivElement, LiteColumnVisibilityToggleProps>(
  ({ columns, onChange, onReset, className, ...rest }, ref) => {
    useStyles('lite-column-visibility', columnVisibilityStyles)
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
