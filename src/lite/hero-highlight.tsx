import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteHeroHighlightProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface LiteHighlightProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  color?: string
}

export const HeroHighlight = forwardRef<HTMLDivElement, LiteHeroHighlightProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-hero-highlight${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
  )
)
HeroHighlight.displayName = 'HeroHighlight'

export const Highlight = forwardRef<HTMLSpanElement, LiteHighlightProps>(
  ({ color, children, className, style, ...rest }, ref) => (
    <span
      ref={ref}
      className={`ui-lite-highlight${className ? ` ${className}` : ''}`}
      style={{ ...style, ...(color ? { '--highlight-brand-color': color } as React.CSSProperties : {}) }}
      {...rest}
    >
      {children}
    </span>
  )
)
Highlight.displayName = 'Highlight'
