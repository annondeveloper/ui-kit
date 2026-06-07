import { forwardRef, useState, useMemo, useEffect, useRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const commandBarStyles = css`
  @layer components {
    @scope (.ui-lite-command-bar) {
      :scope {
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-primary, oklch(97% 0 0));
        padding: 0;
        inline-size: 32rem;
        max-inline-size: 90vw;
      }
      :scope:not([open]) { display: none; }
      :scope[open] { position: fixed; inset: 0; margin: auto; block-size: fit-content; }
      :scope::backdrop {
        background: var(--bg-overlay, oklch(0% 0 0 / 0.6));
      }
      input[type="search"] {
        display: block;
        inline-size: 100%;
        padding: 0.75rem 1rem;
        background: transparent;
        border: none;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
        color: inherit;
        font-family: inherit;
        font-size: 0.9375rem;
        outline: none;
        box-sizing: border-box;
      }
      ul {
        list-style: none;
        padding: 0.25rem;
        margin: 0;
        max-block-size: 20rem;
        overflow-y: auto;
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm, 0.25rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
      }
      li:hover { background: var(--bg-hover, oklch(100% 0 0 / 0.06)); }
      li kbd {
        font-size: 0.6875rem;
        padding: 0.125rem 0.375rem;
        background: oklch(100% 0 0 / 0.06);
        border-radius: var(--radius-sm, 0.25rem);
      }
      .ui-lite-command-bar__empty {
        color: var(--text-secondary, oklch(70% 0 0));
        text-align: center;
        cursor: default;
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
      }
    }
  }
`

export interface LiteCommandItem {
  id: string
  label: string
  description?: string
  shortcut?: string[]
  onSelect?: () => void
}

export interface LiteCommandBarProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title'> {
  open: boolean
  onClose: () => void
  items: LiteCommandItem[]
  placeholder?: string
}

export const CommandBar = forwardRef<HTMLDialogElement, LiteCommandBarProps>(
  ({ open, onClose, items, placeholder = 'Search commands...', className, ...rest }, ref) => {
    useStyles('lite-command-bar', commandBarStyles)
    const [query, setQuery] = useState('')
    const internalRef = useRef<HTMLDialogElement>(null)
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? internalRef

    useEffect(() => {
      const el = dialogRef.current
      if (!el) return
      if (open && !el.open) el.showModal()
      if (!open && el.open) el.close()
    }, [open, dialogRef])

    useEffect(() => { if (!open) setQuery('') }, [open])

    const filtered = useMemo(() =>
      query ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())) : items
    , [items, query])

    return (
      <dialog ref={dialogRef} className={`ui-lite-command-bar${className ? ` ${className}` : ''}`} onClose={onClose} {...rest}>
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} autoFocus />
        <ul role="listbox">
          {filtered.map(item => (
            <li key={item.id} role="option" onClick={() => { item.onSelect?.(); onClose() }}>
              <span>{item.label}</span>
              {item.shortcut && <kbd>{item.shortcut.join('+')}</kbd>}
            </li>
          ))}
          {filtered.length === 0 && <li className="ui-lite-command-bar__empty">No results</li>}
        </ul>
      </dialog>
    )
  }
)
CommandBar.displayName = 'CommandBar'
