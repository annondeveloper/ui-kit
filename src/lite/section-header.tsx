import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteSectionHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Section title text */
  title: string
  /** Optional description below the title */
  description?: string
  /** Action slot rendered on the right side */
  action?: ReactNode
  /** Title size scale (default: 'md') */
  size?: 'sm' | 'md' | 'lg'
}

export const SectionHeader = forwardRef<HTMLElement, LiteSectionHeaderProps>(
  (
    {
      title,
      description,
      action,
      size = 'md',
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={`ui-lite-section-header${className ? ` ${className}` : ''}`}
        data-size={size}
        {...rest}
      >
        <div className="ui-lite-section-header__left">
          <h2 className="ui-lite-section-header__title">{title}</h2>
          {description && (
            <p className="ui-lite-section-header__description">{description}</p>
          )}
        </div>
        {action && (
          <div className="ui-lite-section-header__action">{action}</div>
        )}
      </header>
    )
  }
)
SectionHeader.displayName = 'SectionHeader'
