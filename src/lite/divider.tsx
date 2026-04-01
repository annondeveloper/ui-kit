import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  label?: ReactNode
  spacing?: 'sm' | 'md' | 'lg'
}

export const Divider = forwardRef<HTMLHRElement, LiteDividerProps>(
  ({ orientation = 'horizontal', variant = 'solid', label, spacing = 'md', className, ...rest }, ref) => {
    const hasLabel = label != null
    const isVertical = orientation === 'vertical'

    if (hasLabel) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="separator"
          className={`ui-lite-divider${className ? ` ${className}` : ''}`}
          data-orientation={orientation}
          data-variant={variant}
          data-spacing={spacing}
          data-has-label="true"
          aria-orientation={isVertical ? 'vertical' : undefined}
          {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
          <span className="ui-lite-divider__label">{label}</span>
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        role="separator"
        className={`ui-lite-divider${className ? ` ${className}` : ''}`}
        data-orientation={orientation}
        data-variant={variant}
        data-spacing={spacing}
        aria-orientation={isVertical ? 'vertical' : undefined}
        {...rest}
      />
    )
  }
)
Divider.displayName = 'Divider'
