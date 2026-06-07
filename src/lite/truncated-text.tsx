import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const truncatedTextStyles = css`
  @layer components {
    @scope (.ui-lite-truncated-text) {
      :scope {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: var(--truncate-lines, 1);
        line-clamp: var(--truncate-lines, 1);
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
`

export interface LiteTruncatedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  lines?: number
}

export const TruncatedText = forwardRef<HTMLSpanElement, LiteTruncatedTextProps>(
  ({ text, lines = 1, className, style, ...rest }, ref) => {
    useStyles('lite-truncated-text', truncatedTextStyles)
    return (
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
  }
)
TruncatedText.displayName = 'TruncatedText'
