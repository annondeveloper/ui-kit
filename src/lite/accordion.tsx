import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteAccordionItem {
  id: string
  trigger: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface LiteAccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: LiteAccordionItem[]
  defaultOpen?: string[]
}

export const Accordion = forwardRef<HTMLDivElement, LiteAccordionProps>(
  ({ items, defaultOpen = [], className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-accordion${className ? ` ${className}` : ''}`} {...rest}>
      {items.map(item => (
        <details key={item.id} open={defaultOpen.includes(item.id)} className="ui-lite-accordion__item">
          <summary className="ui-lite-accordion__trigger">{item.trigger}</summary>
          <div className="ui-lite-accordion__content">{item.content}</div>
        </details>
      ))}
    </div>
  )
)
Accordion.displayName = 'Accordion'
