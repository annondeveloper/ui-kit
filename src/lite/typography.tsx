import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteTypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'code' | 'overline'
  color?: 'primary' | 'secondary' | 'tertiary' | 'brand' | 'success' | 'warning' | 'danger'
  as?: React.ElementType
}

const variantElements: Record<string, string> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
}

export const Typography = forwardRef<HTMLElement, LiteTypographyProps>(
  ({ variant = 'body', color, as, className, ...rest }, ref) => {
    const Component = (as || variantElements[variant] || 'span') as React.ElementType
    return (
      <Component
        ref={ref}
        className={`ui-lite-typography${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-color={color}
        {...rest}
      />
    )
  }
)
Typography.displayName = 'Typography'
