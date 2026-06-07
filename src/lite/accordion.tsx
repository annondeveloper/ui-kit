import { forwardRef, useCallback, useState, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const accordionStyles = css`
  @layer components {
    @scope (.ui-lite-accordion) {
      :scope {
        display: flex;
        flex-direction: column;
        font-family: inherit;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-accordion__item {
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.04));
      }
      .ui-lite-accordion__trigger {
        padding-block: var(--space-sm, 0.75rem);
        cursor: pointer;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        list-style: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-accordion__trigger::after {
        content: '\\25B6';
        font-size: 0.625rem;
      }
      .ui-lite-accordion__trigger::-webkit-details-marker {
        display: none;
      }
      details[open] > .ui-lite-accordion__trigger::after {
        transform: rotate(90deg);
      }
      .ui-lite-accordion__trigger:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: var(--radius-sm, 6px);
      }
      .ui-lite-accordion__content {
        padding-block: 0 var(--space-sm, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }
    }
  }
`

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
    useStyles('lite-accordion', accordionStyles)
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
