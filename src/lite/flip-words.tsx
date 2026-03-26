import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteFlipWordsProps extends HTMLAttributes<HTMLSpanElement> {
  words: string[]
  interval?: number
}

export const FlipWords = forwardRef<HTMLSpanElement, LiteFlipWordsProps>(
  ({ words, interval = 3000, className, ...rest }, ref) => (
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
)
FlipWords.displayName = 'FlipWords'
