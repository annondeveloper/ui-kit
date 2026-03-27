'use client'

import {
  useState,
  useCallback,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AccordionItem {
  id: string
  trigger: ReactNode
  content: ReactNode
  disabled?: boolean
  icon?: ReactNode
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[]
  type?: 'single' | 'multiple'
  defaultOpen?: string[]
  onOpenChange?: (openIds: string[]) => void
  motion?: 0 | 1 | 2 | 3
  variant?: 'default' | 'bordered' | 'separated'
  size?: 'sm' | 'md' | 'lg'
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const accordionStyles = css`
  @layer components {
    @scope (.ui-accordion) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0;
        border-radius: var(--radius-md, 0.5rem);
        overflow: hidden;
      }

      details {
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      details:last-child {
        border-block-end: none;
      }

      summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm, 0.5rem);
        padding-block: var(--space-md, 0.75rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        line-height: 1.5;
        color: var(--text-primary, oklch(90% 0 0));
        cursor: pointer;
        list-style: none;
        user-select: none;
        background: transparent;
        border: none;
        transition: background 0.15s;
      }
      summary::-webkit-details-marker {
        display: none;
      }
      summary::marker {
        display: none;
        content: '';
      }
      summary:hover {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.04);
      }
      summary:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* Disabled */
      summary[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Chevron */
      .ui-accordion__chevron {
        flex-shrink: 0;
        inline-size: 1rem;
        block-size: 1rem;
        color: var(--text-secondary, oklch(70% 0 0));
        transition: transform 0.2s var(--ease-out, ease-out);
      }
      details[open] > summary .ui-accordion__chevron {
        transform: rotate(180deg);
      }

      /* Content wrapper for smooth height animation */
      .ui-accordion__content-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        overflow: hidden;
      }

      /* Motion 1+: smooth height transition */
      :scope:not([data-motion="0"]) .ui-accordion__content-wrapper {
        transition: grid-template-rows 0.25s var(--ease-out, ease-out);
      }

      details[open] > .ui-accordion__content-wrapper {
        grid-template-rows: 1fr;
      }

      .ui-accordion__content {
        min-block-size: 0;
        overflow: hidden;
      }

      .ui-accordion__content-inner {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        padding-block-end: var(--space-md, 0.75rem);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
        box-shadow: inset 0 2px 4px oklch(0% 0 0 / 0.04);
      }

      /* Bordered variant */
      :scope[data-variant="bordered"] {
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
      }
      :scope[data-variant="bordered"] details:last-child {
        border-block-end: none;
      }

      /* Separated variant */
      :scope[data-variant="separated"] {
        gap: var(--space-xs, 0.5rem);
      }
      :scope[data-variant="separated"] details {
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      /* Sizes */
      :scope[data-size="sm"] summary {
        padding-block: var(--space-xs);
        padding-inline: var(--space-sm);
        font-size: var(--text-xs);
      }
      :scope[data-size="lg"] summary {
        padding-block: var(--space-lg);
        padding-inline: var(--space-lg);
        font-size: var(--text-base);
      }

      /* Item icon */
      .ui-accordion__item-icon {
        display: inline-flex;
        align-items: center;
        margin-inline-end: var(--space-xs);
        color: var(--text-secondary);
      }

      /* Motion 0: instant */
      :scope[data-motion="0"] .ui-accordion__content-wrapper {
        transition: none;
      }
      :scope[data-motion="0"] .ui-accordion__chevron {
        transition: none;
      }

      /* Touch targets */
      @media (pointer: coarse) {
        summary {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        details {
          border-color: ButtonText;
        }
        summary {
          color: ButtonText;
        }
        summary:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-accordion__chevron {
          color: ButtonText;
        }
      }

      /* Print */
      @media print {
        details {
          break-inside: avoid;
        }
        .ui-accordion__content-wrapper {
          grid-template-rows: 1fr !important;
          transition: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        summary {
          transition: none;
        }
      }
    }
  }
`

// ─── Chevron Icon ───────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg
      className="ui-accordion__chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      type = 'multiple',
      defaultOpen = [],
      onOpenChange,
      motion: motionProp,
      variant = 'default',
      size = 'md',
      className,
      ...rest
    },
    ref
  ) {
    useStyles('accordion', accordionStyles)
    const motionLevel = useMotionLevel(motionProp)
    const [openIds, setOpenIds] = useState<string[]>(defaultOpen)

    const handleToggle = useCallback(
      (id: string, isOpen: boolean) => {
        setOpenIds((prev) => {
          let next: string[]
          if (isOpen) {
            if (type === 'single') {
              next = [id]
            } else {
              next = [...prev, id]
            }
          } else {
            next = prev.filter((i) => i !== id)
          }
          onOpenChange?.(next)
          return next
        })
      },
      [type, onOpenChange]
    )

    const handleSummaryClick = useCallback(
      (e: React.MouseEvent, item: AccordionItem) => {
        if (item.disabled) {
          e.preventDefault()
          return
        }
        // Prevent default so we can control open state
        e.preventDefault()
        const isCurrentlyOpen = openIds.includes(item.id)
        handleToggle(item.id, !isCurrentlyOpen)
      },
      [openIds, handleToggle]
    )

    return (
      <div
        ref={ref}
        className={cn('ui-accordion', className)}
        data-motion={motionLevel}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {items.map((item) => (
          <details
            key={item.id}
            open={openIds.includes(item.id)}
          >
            <summary
              onClick={(e) => handleSummaryClick(e, item)}
              aria-disabled={item.disabled ? 'true' : undefined}
            >
              <span>
                {item.icon && (
                  <span className="ui-accordion__item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.trigger}
              </span>
              <ChevronIcon />
            </summary>
            <div className="ui-accordion__content-wrapper">
              <div className="ui-accordion__content">
                <div className="ui-accordion__content-inner">
                  {item.content}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'
