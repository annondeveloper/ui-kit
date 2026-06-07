import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const flipWordsStyles = css`
  @layer components {
    @scope (.ui-lite-flip-words) {
      :scope {
        display: inline-block;
        vertical-align: baseline;
        color: inherit;
        font: inherit;
      }
    }
  }
`

export interface LiteFlipWordsProps extends HTMLAttributes<HTMLSpanElement> {
  words: string[]
  interval?: number
}

export const FlipWords = forwardRef<HTMLSpanElement, LiteFlipWordsProps>(
  ({ words, interval = 3000, className, ...rest }, ref) => {
    useStyles('lite-flip-words', flipWordsStyles)
    return (
    <span
      ref={ref}
      className={`ui-lite-flip-words${className ? ` ${className}` : ''}`}
      data-interval={interval}
      aria-live="polite"
      aria-atomic="true"
      {...rest}
    >
      {words[0] ?? ''}
    </span>
    )
  }
)
FlipWords.displayName = 'FlipWords'
