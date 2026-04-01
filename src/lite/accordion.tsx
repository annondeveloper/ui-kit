import { forwardRef, useCallback, useState, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteAccordionItem {
  id: string
  trigger: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface LiteAccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: LiteAccordionItem[]
  defaultOpen?: string[]
  /** 'single' closes others when one opens; 'multiple' allows many open at once */
  type?: 'single' | 'multiple'
  variant?: string
  size?: 'sm' | 'md' | 'lg'
  onOpenChange?: (openIds: string[]) => void
}

export const Accordion = forwardRef<HTMLDivElement, LiteAccordionProps>(
  ({ items, defaultOpen = [], type = 'multiple', variant, size, onOpenChange, className, ...rest }, ref) => {
    const [openIds, setOpenIds] = useState<string[]>(defaultOpen)

    const handleToggle = useCallback((id: string, nowOpen: boolean) => {
      setOpenIds(prev => {
        let next: string[]
        if (nowOpen) {
          next = type === 'single' ? [id] : [...prev, id]
        } else {
          next = prev.filter(x => x !== id)
        }
        onOpenChange?.(next)
        return next
      })
    }, [type, onOpenChange])

    return (
      <div
        ref={ref}
        className={`ui-lite-accordion${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {items.map(item => (
          <details
            key={item.id}
            open={openIds.includes(item.id)}
            className="ui-lite-accordion__item"
            onToggle={e => handleToggle(item.id, (e.target as HTMLDetailsElement).open)}
          >
            <summary className="ui-lite-accordion__trigger">{item.trigger}</summary>
            <div className="ui-lite-accordion__content">{item.content}</div>
          </details>
        ))}
      </div>
    )
  }
)
Accordion.displayName = 'Accordion'
