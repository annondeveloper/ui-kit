import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteTextRevealProps extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export const TextReveal = forwardRef<HTMLDivElement, LiteTextRevealProps>(
  ({ text, className, ...rest }, ref) => (
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
)
TextReveal.displayName = 'TextReveal'
