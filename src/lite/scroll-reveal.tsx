import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const scrollRevealStyles = css`
  @layer components {
    @scope (.ui-lite-scroll-reveal) {
      :scope {
        display: block;
        opacity: 1;
      }
    }
  }
`

export interface LiteScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** In lite mode, content is always visible (no animation) */
}

export const ScrollReveal = forwardRef<HTMLDivElement, LiteScrollRevealProps>(
  ({ className, ...rest }, ref) => {
    useStyles('lite-scroll-reveal', scrollRevealStyles)
    return (
      <div ref={ref} className={`ui-lite-scroll-reveal${className ? ` ${className}` : ''}`} {...rest} />
    )
  }
)
ScrollReveal.displayName = 'ScrollReveal'
