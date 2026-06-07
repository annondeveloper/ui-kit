import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const typographyStyles = css`
  @layer components {
    @scope (.ui-lite-typography) {
      :scope {
        margin: 0;
        padding: 0;
        font-family: inherit;
        color: var(--text-primary, oklch(97% 0 0));
      }
      :scope[data-variant="h1"] { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.04em; text-wrap: balance; }
      :scope[data-variant="h2"] { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; text-wrap: balance; }
      :scope[data-variant="h3"] { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 700; line-height: 1.25; letter-spacing: -0.01em; text-wrap: balance; }
      :scope[data-variant="h4"] { font-size: clamp(1.125rem, 2vw, 1.5rem); font-weight: 600; line-height: 1.3; text-wrap: balance; }
      :scope[data-variant="h5"] { font-size: clamp(1rem, 1.5vw, 1.25rem); font-weight: 600; line-height: 1.35; text-wrap: balance; }
      :scope[data-variant="h6"] { font-size: 1rem; font-weight: 600; line-height: 1.4; text-wrap: balance; }
      :scope[data-variant="body"] { font-size: 1rem; font-weight: 400; line-height: 1.6; text-wrap: pretty; }
      :scope[data-variant="body-sm"] { font-size: 0.875rem; font-weight: 400; line-height: 1.5; text-wrap: pretty; }
      :scope[data-variant="caption"] { font-size: 0.75rem; font-weight: 400; line-height: 1.4; color: var(--text-tertiary, oklch(60% 0 0)); }
      :scope[data-variant="code"] {
        font-family: var(--font-mono, ui-monospace, 'Cascadia Code', 'Fira Code', monospace);
        font-size: 0.875em;
        line-height: 1.5;
        background: var(--surface-elevated, oklch(25% 0.01 270 / 0.5));
        padding-block: 0.125em;
        padding-inline: 0.375em;
        border-radius: var(--radius-sm, 4px);
      }
      :scope[data-variant="overline"] { font-size: 0.6875rem; font-weight: 700; line-height: 1.4; letter-spacing: 0.08em; text-transform: uppercase; }
      :scope[data-color="primary"]   { color: var(--text-primary, oklch(97% 0 0)); }
      :scope[data-color="secondary"] { color: var(--text-secondary, oklch(70% 0 0)); }
      :scope[data-color="tertiary"]  { color: var(--text-tertiary, oklch(60% 0 0)); }
      :scope[data-color="brand"]     { color: var(--brand, oklch(65% 0.2 270)); }
      :scope[data-color="success"]   { color: var(--status-ok, oklch(72% 0.19 155)); }
      :scope[data-color="warning"]   { color: var(--status-warning, oklch(80% 0.18 85)); }
      :scope[data-color="danger"]    { color: var(--status-critical, oklch(65% 0.25 25)); }
      :scope[data-align="start"]  { text-align: start; }
      :scope[data-align="center"] { text-align: center; }
      :scope[data-align="end"]    { text-align: end; }
      :scope[data-align="justify"] { text-align: justify; }
      :scope[data-truncate="true"] {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      @media (forced-colors: active) {
        :scope { color: CanvasText; }
        :scope[data-variant="code"] { border: 1px solid ButtonText; }
      }
      @media print {
        :scope { color: black; }
      }
    }
  }
`

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
    useStyles('lite-typography', typographyStyles)
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
