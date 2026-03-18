'use client'

import type React from 'react'
import { useState } from 'react'
import { cn } from '../utils'

export interface AvatarProps {
  /** Image source URL. */
  src?: string
  /** Alt text for the image; used for accessibility. */
  alt: string
  /** Initials fallback (e.g. "JD"). Derived from alt if not provided. */
  fallback?: string
  /** Size preset. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Optional status dot overlay. */
  status?: 'online' | 'offline' | 'busy' | 'away'
  /** Additional class name for the root element. */
  className?: string
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, { root: string; text: string; dot: string }> = {
  xs: { root: 'h-6 w-6', text: 'text-[10px]', dot: 'h-2 w-2 -bottom-0 -right-0 ring-1' },
  sm: { root: 'h-8 w-8', text: 'text-xs', dot: 'h-2.5 w-2.5 -bottom-0.5 -right-0.5 ring-[1.5px]' },
  md: { root: 'h-10 w-10', text: 'text-sm', dot: 'h-3 w-3 -bottom-0.5 -right-0.5 ring-2' },
  lg: { root: 'h-12 w-12', text: 'text-base', dot: 'h-3.5 w-3.5 -bottom-0.5 -right-0.5 ring-2' },
  xl: { root: 'h-16 w-16', text: 'text-lg', dot: 'h-4 w-4 -bottom-0.5 -right-0.5 ring-2' },
}

const statusColors: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'bg-[hsl(var(--status-ok))]',
  offline: 'bg-[hsl(var(--text-disabled))]',
  busy: 'bg-[hsl(var(--status-critical))]',
  away: 'bg-[hsl(var(--status-warning))]',
}

/**
 * Derive initials from a name string (max 2 characters).
 */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * @description User/entity avatar with image support and initials fallback.
 * Optional status dot overlay for presence indication.
 */
export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  status,
  className,
}: AvatarProps): React.JSX.Element {
  const [imgError, setImgError] = useState(false)
  const s = sizeClasses[size]
  const initials = fallback ?? deriveInitials(alt)
  const showImage = src && !imgError

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          s.root,
          'rounded-full overflow-hidden',
          'flex items-center justify-center',
          !showImage && 'bg-[hsl(var(--bg-overlay))]',
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              s.text,
              'font-semibold text-[hsl(var(--text-secondary))] select-none',
            )}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Status dot */}
      {status && (
        <span
          className={cn(
            'absolute rounded-full ring-[hsl(var(--bg-surface))]',
            s.dot,
            statusColors[status],
          )}
          aria-label={status}
        />
      )}
    </div>
  )
}
