import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteTruncatedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  lines?: number
}

export const TruncatedText = forwardRef<HTMLSpanElement, LiteTruncatedTextProps>(
  ({ text, lines = 1, className, style, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-truncated-text${className ? ` ${className}` : ''}`}
      title={text}
      style={{ ...style, '--truncate-lines': lines } as React.CSSProperties}
      {...rest}
    >
      {text}
    </span>
  )
)
TruncatedText.displayName = 'TruncatedText'
