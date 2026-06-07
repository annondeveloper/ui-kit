import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const avatarStyles = css`
  @layer components {
    @scope (.ui-lite-avatar) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--bg-elevated, oklch(16% 0.02 275));
        color: var(--text-secondary, oklch(70% 0 0));
        font-family: inherit;
        font-weight: 600;
        overflow: hidden;
        flex-shrink: 0;
        user-select: none;
        vertical-align: middle;
      }

      /* Sizes */
      :scope[data-size="xs"] { inline-size: 22px; block-size: 22px; font-size: 0.5rem; }
      :scope[data-size="sm"] { inline-size: 28px; block-size: 28px; font-size: 0.625rem; }
      :scope[data-size="md"] { inline-size: 36px; block-size: 36px; font-size: 0.75rem; }
      :scope[data-size="lg"] { inline-size: 44px; block-size: 44px; font-size: 0.875rem; }
      :scope[data-size="xl"] { inline-size: 64px; block-size: 64px; font-size: 1.25rem; }

      img {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      .ui-lite-avatar__initials {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        text-transform: uppercase;
        line-height: 1;
      }

      .ui-lite-avatar__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ui-lite-avatar__icon svg {
        inline-size: 1.2em;
        block-size: 1.2em;
      }

      /* Status dot */
      .ui-lite-avatar__status {
        position: absolute;
        inset-block-end: 0;
        inset-inline-end: 0;
        inline-size: 25%;
        block-size: 25%;
        min-inline-size: 8px;
        min-block-size: 8px;
        border-radius: 50%;
        border: 2px solid var(--bg-elevated, oklch(16% 0.02 275));
        box-sizing: content-box;
      }
      .ui-lite-avatar__status[data-status="online"] { background: oklch(72% 0.19 145); }
      .ui-lite-avatar__status[data-status="offline"] { background: oklch(50% 0 0); }
      .ui-lite-avatar__status[data-status="away"] { background: oklch(78% 0.17 85); }
      .ui-lite-avatar__status[data-status="busy"] { background: oklch(62% 0.22 25); }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
        .ui-lite-avatar__status { border-color: Canvas; forced-color-adjust: none; }
      }

      /* Print */
      @media print {
        :scope { border: 1px solid; }
      }
    }
  }
`

export interface LiteAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  alt?: string
  fallback?: ReactNode
  /** Full name; initials are derived (first + last word) when no src/fallback */
  name?: string
  /** Status indicator dot */
  status?: 'online' | 'offline' | 'away' | 'busy'
  /** Icon rendered when no src or name */
  icon?: ReactNode
}

/** Derive up to 2 initials from a full name string */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export const Avatar = forwardRef<HTMLDivElement, LiteAvatarProps>(
  ({ size = 'md', src, alt, fallback, name, status, icon, className, children, ...rest }, ref) => {
    useStyles('lite-avatar', avatarStyles)
    let content: ReactNode
    if (src) {
      content = <img src={src} alt={alt ?? name ?? ''} />
    } else if (fallback) {
      content = fallback
    } else if (name) {
      content = <span className="ui-lite-avatar__initials" aria-hidden="true">{getInitials(name)}</span>
    } else if (icon) {
      content = <span className="ui-lite-avatar__icon" aria-hidden="true">{icon}</span>
    } else {
      content = children
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-avatar${className ? ` ${className}` : ''}`}
        data-size={size}
        aria-label={alt ?? name}
        {...rest}
      >
        {content}
        {status && <span className="ui-lite-avatar__status" data-status={status} aria-label={status} />}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'
