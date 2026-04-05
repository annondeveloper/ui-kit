import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Toolbar content: search inputs, filter buttons, action buttons, etc. */
  children: ReactNode
  /** Gap between items (default: 'md') */
  gap?: 'sm' | 'md' | 'lg'
  /** Horizontal alignment (default: 'start') */
  justify?: 'start' | 'end' | 'between' | 'center'
  /** Allow items to wrap on narrow containers (default: false) */
  wrap?: boolean
  /** Stick to top of scroll container (default: false) */
  sticky?: boolean
}

export const Toolbar = forwardRef<HTMLDivElement, LiteToolbarProps>(
  (
    {
      children,
      gap = 'md',
      justify = 'start',
      wrap = false,
      sticky = false,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="toolbar"
        className={`ui-lite-toolbar${className ? ` ${className}` : ''}`}
        data-gap={gap}
        data-justify={justify}
        data-wrap={wrap || undefined}
        data-sticky={sticky || undefined}
        {...rest}
      >
        {children}
      </div>
    )
  }
)
Toolbar.displayName = 'Toolbar'
