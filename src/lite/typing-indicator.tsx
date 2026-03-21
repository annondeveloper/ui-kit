import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteTypingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  avatar?: ReactNode
  label?: string
}

export const TypingIndicator = forwardRef<HTMLDivElement, LiteTypingIndicatorProps>(
  ({ avatar, label, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-typing-indicator${className ? ` ${className}` : ''}`} aria-label={label ?? 'Typing'} {...rest}>
      {avatar && <span className="ui-lite-typing-indicator__avatar">{avatar}</span>}
      <span className="ui-lite-typing-indicator__dots">
        <span /><span /><span />
      </span>
    </div>
  )
)
TypingIndicator.displayName = 'TypingIndicator'
