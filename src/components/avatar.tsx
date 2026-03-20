'use client'

import {
  forwardRef,
  useState,
  Children,
  isValidElement,
  cloneElement,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { cn } from '../core/utils/cn'

// ─── Avatar ──────────────────────────────────────────────────────────

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  icon?: ReactNode
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const avatarStyles = css`
  @layer components {
    @scope (.ui-avatar) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-surface, oklch(25% 0.02 270));
        overflow: hidden;
        flex-shrink: 0;
        user-select: none;
        vertical-align: middle;
        font-family: inherit;
        font-weight: 600;
        color: var(--text-secondary, oklch(70% 0 0));
      }

      /* Sizes */
      :scope[data-size="sm"] {
        inline-size: 28px;
        block-size: 28px;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] {
        inline-size: 36px;
        block-size: 36px;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] {
        inline-size: 44px;
        block-size: 44px;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] {
        inline-size: 56px;
        block-size: 56px;
        font-size: var(--text-lg, 1.125rem);
      }

      /* Image */
      .ui-avatar__image {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      /* Initials */
      .ui-avatar__initials {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 100%;
        block-size: 100%;
        text-transform: uppercase;
        line-height: 1;
      }

      /* Icon fallback */
      .ui-avatar__icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ui-avatar__icon svg {
        inline-size: 1.2em;
        block-size: 1.2em;
      }

      /* Status dot */
      .ui-avatar__status {
        position: absolute;
        inset-block-end: 0;
        inset-inline-end: 0;
        inline-size: 25%;
        block-size: 25%;
        min-inline-size: 8px;
        min-block-size: 8px;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid var(--bg-surface, oklch(25% 0.02 270));
        box-sizing: content-box;
      }
      .ui-avatar__status[data-status="online"] {
        background: var(--status-ok, oklch(72% 0.19 155));
      }
      .ui-avatar__status[data-status="offline"] {
        background: var(--text-disabled, oklch(50% 0 0));
      }
      .ui-avatar__status[data-status="away"] {
        background: var(--status-warning, oklch(80% 0.18 85));
      }
      .ui-avatar__status[data-status="busy"] {
        background: var(--status-critical, oklch(65% 0.25 25));
      }

      /* Touch targets */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-avatar__status {
          border-color: Canvas;
          forced-color-adjust: none;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
        }
      }

      /* Reduced data — hide avatar images */
      @media (prefers-reduced-data: reduce) {
        .ui-avatar__image {
          display: none;
        }
      }
    }
  }
`

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      status,
      icon,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('avatar', avatarStyles)
    const [imgError, setImgError] = useState(false)

    const showImage = src && !imgError

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        role={alt && !showImage ? 'img' : undefined}
        aria-label={alt && !showImage ? alt : undefined}
        {...rest}
      >
        {showImage ? (
          <img
            className="ui-avatar__image"
            src={src}
            alt={alt || ''}
            onError={() => setImgError(true)}
          />
        ) : icon ? (
          <span className="ui-avatar__icon">{icon}</span>
        ) : name ? (
          <span className="ui-avatar__initials">{getInitials(name)}</span>
        ) : null}

        {status && (
          <span
            className="ui-avatar__status"
            data-status={status}
            aria-hidden="true"
          />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

// ─── AvatarGroup ─────────────────────────────────────────────────────

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: AvatarProps['size']
  children: ReactNode
}

const avatarGroupStyles = css`
  @layer components {
    @scope (.ui-avatar-group) {
      :scope {
        display: inline-flex;
        align-items: center;
        flex-direction: row-reverse;
      }

      :scope > * {
        margin-inline-start: -0.5rem;
        border: 2px solid var(--bg-surface, oklch(25% 0.02 270));
        border-radius: var(--radius-full, 9999px);
      }
      :scope > *:last-child {
        margin-inline-start: 0;
      }

      .ui-avatar-group__overflow {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-elevated, oklch(30% 0.02 270));
        color: var(--text-secondary, oklch(70% 0 0));
        font-weight: 600;
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        inline-size: 36px;
        block-size: 36px;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope > * {
          border-color: Canvas;
        }
      }

      /* Print */
      @media print {
        :scope > * {
          border: 1px solid;
        }
      }
    }
  }
`

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      max,
      size,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('avatar-group', avatarGroupStyles)

    const childArray = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[]
    const visibleCount = max !== undefined ? Math.min(max, childArray.length) : childArray.length
    const overflowCount = childArray.length - visibleCount

    const visibleChildren = childArray.slice(0, visibleCount)

    // Clone children to pass size prop, reverse for stacking order
    const clonedChildren = visibleChildren.map((child, i) =>
      cloneElement(child, {
        key: i,
        ...(size ? { size } : {}),
      })
    )

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        role="group"
        {...rest}
      >
        {overflowCount > 0 && (
          <span className="ui-avatar-group__overflow" aria-label={`${overflowCount} more`}>
            +{overflowCount}
          </span>
        )}
        {[...clonedChildren].reverse()}
      </div>
    )
  }
)
AvatarGroup.displayName = 'AvatarGroup'
