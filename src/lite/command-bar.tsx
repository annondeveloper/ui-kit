import { forwardRef, useState, useMemo, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

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
