import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const typingIndicatorStyles = css`
  @layer components {
    @scope (.ui-lite-typing-indicator) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .ui-lite-typing-indicator__avatar {
        flex-shrink: 0;
      }
      .ui-lite-typing-indicator__dots {
        display: flex;
        gap: 0.25rem;
      }
      .ui-lite-typing-indicator__dots span {
        inline-size: 6px;
        block-size: 6px;
        border-radius: 50%;
        background: var(--text-secondary, oklch(70% 0 0));
      }
    }
  }
`

export interface LiteTypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: ReactNode
  label?: string
}

export const TypingIndicator = forwardRef<HTMLDivElement, LiteTypingIndicatorProps>(
  ({ avatar, label, className, ...rest }, ref) => {
    useStyles('lite-typing-indicator', typingIndicatorStyles)
    return (
      <div ref={ref} className={`ui-lite-typing-indicator${className ? ` ${className}` : ''}`} aria-label={label ?? 'Typing'} {...rest}>
        {avatar && <span className="ui-lite-typing-indicator__avatar">{avatar}</span>}
        <span className="ui-lite-typing-indicator__dots">
          <span /><span /><span />
        </span>
      </div>
    )
  }
)
TypingIndicator.displayName = 'TypingIndicator'
