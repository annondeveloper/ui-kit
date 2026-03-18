'use client'

import { cn } from '../utils'

/**
 * @description A shimmer skeleton loader block. Requires the `skeleton-shimmer` CSS class
 * from theme.css to animate.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md', className)}
      {...props}
    />
  )
}

export interface SkeletonTextProps {
  /** Number of text lines to render. */
  lines?: number
  className?: string
}

/**
 * @description A multi-line skeleton text placeholder. The last line renders shorter
 * for a natural paragraph appearance.
 */
export function SkeletonText({ lines = 1, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 && lines > 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

/**
 * @description A card-shaped skeleton placeholder with header area and content bars.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-2.5 flex-1" />
        <Skeleton className="h-2.5 flex-1" />
        <Skeleton className="h-2.5 flex-1" />
      </div>
    </div>
  )
}
