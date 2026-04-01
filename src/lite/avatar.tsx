import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

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
