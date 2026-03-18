'use client'

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utils'

/* ── Variant & padding maps ───────────────────────────────────────────────── */

const variantClasses = {
  default:
    'bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] shadow-sm',
  elevated:
    'bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-default))] shadow-lg',
  outlined:
    'bg-transparent border border-[hsl(var(--border-default))]',
  interactive:
    'bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] shadow-sm hover:bg-[hsl(var(--bg-elevated))] hover:border-[hsl(var(--border-default))] hover:shadow-md transition-all duration-150 cursor-pointer',
} as const

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
} as const

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant. */
  variant?: keyof typeof variantClasses
  /** Padding preset. */
  padding?: keyof typeof paddingClasses
  /** Card content. */
  children: ReactNode
}

/**
 * @description A styled card container with variant and padding presets.
 * Use with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter
 * subcomponents for semantic structure.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-2xl', variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  ),
)
Card.displayName = 'Card'

/* ── Subcomponents ────────────────────────────────────────────────────────── */

export interface CardSubProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Header section of a Card (flex row for title + actions). */
const CardHeader = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    >
      {children}
    </div>
  ),
)
CardHeader.displayName = 'CardHeader'

/** Title within a CardHeader. */
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base font-semibold text-[hsl(var(--text-primary))]', className)}
      {...props}
    >
      {children}
    </h3>
  ),
)
CardTitle.displayName = 'CardTitle'

/** Description text within a CardHeader. */
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[hsl(var(--text-secondary))]', className)}
      {...props}
    >
      {children}
    </p>
  ),
)
CardDescription.displayName = 'CardDescription'

/** Main content area of a Card. */
const CardContent = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  ),
)
CardContent.displayName = 'CardContent'

/** Footer section of a Card (typically for actions). */
const CardFooter = forwardRef<HTMLDivElement, CardSubProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mt-4 pt-4 flex items-center gap-3 border-t border-[hsl(var(--border-subtle))]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
