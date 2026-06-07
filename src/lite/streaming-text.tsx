import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const streamingTextStyles = css`
  @layer components {
    @scope (.ui-lite-streaming-text) {
      :scope {
        white-space: pre-wrap;
        line-height: 1.6;
        color: var(--text-primary, oklch(97% 0 0));
        text-wrap: pretty;
      }
    }
  }
`

export interface LiteStreamingTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export const StreamingText = forwardRef<HTMLDivElement, LiteStreamingTextProps>(
  ({ text, className, ...rest }, ref) => {
    useStyles('lite-streaming-text', streamingTextStyles)
    return (
      <div ref={ref} className={`ui-lite-streaming-text${className ? ` ${className}` : ''}`} {...rest}>
        {text}
      </div>
    )
  }
)
StreamingText.displayName = 'StreamingText'
