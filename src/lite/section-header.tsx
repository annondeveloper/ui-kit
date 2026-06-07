import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const sectionHeaderStyles = css`
  @layer components {
    @scope (.ui-lite-section-header) {
      :scope {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-md, 1rem);
        margin-block-start: var(--space-xl, 2rem);
        margin-block-end: var(--space-sm, 0.75rem);
        padding-block-end: var(--space-md, 1rem);
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
      }
      :scope:first-child { margin-block-start: 0; }
      .ui-lite-section-header__left {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        min-inline-size: 0;
      }
      .ui-lite-section-header__title {
        margin: 0;
        color: var(--text-primary, oklch(95% 0 0));
        font-weight: 600;
        text-wrap: balance;
        line-height: 1.3;
        font-size: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);
      }
      :scope[data-size="sm"] .ui-lite-section-header__title {
        font-size: clamp(0.875rem, 0.8rem + 0.25vw, 1rem);
      }
      :scope[data-size="lg"] .ui-lite-section-header__title {
        font-size: clamp(1.375rem, 1.2rem + 0.75vw, 1.75rem);
      }
      .ui-lite-section-header__description {
        margin: 0;
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.9375rem);
        text-wrap: pretty;
        line-height: 1.5;
      }
      .ui-lite-section-header__action {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
      @media (forced-colors: active) {
        :scope { border-block-end-color: ButtonText; }
        .ui-lite-section-header__title { color: ButtonText; }
      }
      @media print {
        .ui-lite-section-header__action { display: none; }
      }
    }
  }
`

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
    useStyles('lite-section-header', sectionHeaderStyles)
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
