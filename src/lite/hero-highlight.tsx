import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

export interface LiteHeroHighlightProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface LiteHighlightProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  color?: string
}

const heroHighlightStyles = css`
  @layer components {
    @scope (.ui-lite-hero-highlight) {
      :scope {
        display: block;
      }
    }
  }
`

const highlightStyles = css`
  @layer components {
    @scope (.ui-lite-highlight) {
      :scope {
        --highlight-color: var(--highlight-brand-color, oklch(75% 0.15 270 / 0.25));
        position: relative;
        display: inline;
        padding-inline: 0.15em;
      }

      :scope::before {
        content: '';
        position: absolute;
        inset-block-end: 0;
        inset-inline-start: 0;
        block-size: 40%;
        inline-size: 100%;
        background: linear-gradient(
          90deg,
          var(--highlight-color),
          oklch(from var(--highlight-color) l c calc(h + 30))
        );
        border-radius: 2px;
        z-index: -1;
      }

      @media (forced-colors: active) {
        :scope::before {
          background: Highlight;
        }
      }
    }
  }
`

export const HeroHighlight = forwardRef<HTMLDivElement, LiteHeroHighlightProps>(
  ({ className, children, ...rest }, ref) => {
    useStyles('lite-hero-highlight', heroHighlightStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-hero-highlight${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
  )
  }
)
HeroHighlight.displayName = 'HeroHighlight'

export const Highlight = forwardRef<HTMLSpanElement, LiteHighlightProps>(
  ({ color, children, className, style, ...rest }, ref) => {
    useStyles('lite-highlight', highlightStyles)
    return (
    <span
      ref={ref}
      className={`ui-lite-highlight${className ? ` ${className}` : ''}`}
      style={{ ...style, ...(color ? { '--highlight-brand-color': color } as React.CSSProperties : {}) }}
      {...rest}
    >
      {children}
    </span>
  )
  }
)
Highlight.displayName = 'Highlight'
