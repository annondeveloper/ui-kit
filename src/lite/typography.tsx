import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'

export interface LiteTypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'code' | 'overline'
  color?: 'primary' | 'secondary' | 'tertiary' | 'brand' | 'success' | 'warning' | 'danger'
  as?: React.ElementType
  align?: 'start' | 'center' | 'end' | 'justify'
  truncate?: boolean | number
  weight?: 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'black' | number
}

const variantElements: Record<string, string> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
  body: 'p', 'body-sm': 'p', caption: 'span', code: 'code', overline: 'span',
}

const weightValues: Record<string, number> = {
  thin: 100, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, black: 900,
}

export const Typography = forwardRef<HTMLElement, LiteTypographyProps>(
  ({ variant = 'body', color, as, align, truncate, weight, className, style, ...rest }, ref) => {
    const Component = (as || variantElements[variant] || 'span') as React.ElementType

    const computedStyle: CSSProperties = { ...style }
    if (weight != null) {
      computedStyle.fontWeight = typeof weight === 'number' ? weight : weightValues[weight]
    }

    // truncate: true = single-line ellipsis; number = multi-line clamp
    const truncateLines = typeof truncate === 'number' ? truncate : undefined
    if (truncate) {
      computedStyle.overflow = 'hidden'
      if (truncateLines && truncateLines > 1) {
        computedStyle.display = '-webkit-box'
        ;(computedStyle as Record<string, unknown>)['-webkit-line-clamp'] = truncateLines
        ;(computedStyle as Record<string, unknown>)['-webkit-box-orient'] = 'vertical'
      } else {
        computedStyle.textOverflow = 'ellipsis'
        computedStyle.whiteSpace = 'nowrap'
      }
    }

    return (
      <Component
        ref={ref}
        className={`ui-lite-typography${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-color={color}
        data-align={align}
        data-truncate={truncate ? (truncateLines ?? true) : undefined}
        style={computedStyle}
        {...rest}
      />
    )
  }
)
Typography.displayName = 'Typography'
