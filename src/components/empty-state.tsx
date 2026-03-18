'use client'

import { cn } from '../utils'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  /** Icon component displayed in the center. */
  icon: LucideIcon
  /** Title text. */
  title: string
  /** Description text. */
  description: string
  /** Optional action buttons rendered below the description. */
  actions?: React.ReactNode
  className?: string
}

/**
 * @description A decorative empty state placeholder with icon, title, description, and optional actions.
 * Features a subtle gradient background and glass-morphism styling.
 */
export function EmptyState({ icon: Icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border-default))]',
        'bg-[hsl(var(--bg-surface)/0.6)] backdrop-blur-xl px-6 py-12 text-center',
        className,
      )}
    >
      {/* Decorative gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[hsl(var(--brand-primary)/0.04)] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--brand-primary)/0.06),transparent_70%)]" />

      <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-subtle)/0.6)] shadow-[0_1px_3px_hsl(0_0%_0%/0.12)]">
        <Icon className="size-6 text-[hsl(var(--text-disabled))]" />
      </div>
      <h3 className="relative text-heading-3 text-[hsl(var(--text-primary))] mb-1">{title}</h3>
      <p className="relative text-body text-[hsl(var(--text-secondary))] max-w-sm">{description}</p>
      {actions && <div className="relative mt-6 flex gap-3">{actions}</div>}
    </div>
  )
}
