import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const textRevealStyles = css`
  @layer components {
    @scope (.ui-lite-text-reveal) {
      :scope {
        display: block;
        color: var(--text-primary, oklch(97% 0 0));
        text-wrap: balance;
      }
    }
  }
`

export interface LiteTextRevealProps extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export const TextReveal = forwardRef<HTMLDivElement, LiteTextRevealProps>(
  ({ text, className, ...rest }, ref) => {
    useStyles('lite-text-reveal', textRevealStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-text-reveal${className ? ` ${className}` : ''}`}
        data-motion="0"
        aria-label={text}
        role="img"
        {...rest}
      >
        {text}
      </div>
    )
  }
)
TextReveal.displayName = 'TextReveal'
