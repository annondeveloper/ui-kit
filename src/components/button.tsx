'use client'

import type React from 'react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[hsl(var(--brand-primary))] text-[hsl(var(--text-on-brand))] hover:bg-[hsl(var(--brand-primary)/0.85)] active:bg-[hsl(var(--brand-primary)/0.75)]',
  secondary:
    'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border-default))] hover:bg-[hsl(var(--bg-overlay))] active:bg-[hsl(var(--border-subtle))]',
  danger:
    'bg-[hsl(var(--status-critical))] text-[hsl(var(--text-on-brand))] hover:bg-[hsl(var(--status-critical)/0.85)] active:bg-[hsl(var(--status-critical)/0.75)]',
  outline:
    'bg-transparent text-[hsl(var(--text-primary))] border border-[hsl(var(--border-default))] hover:bg-[hsl(var(--bg-elevated))] active:bg-[hsl(var(--bg-overlay))]',
  ghost:
    'bg-transparent text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))] hover:text-[hsl(var(--text-primary))] active:bg-[hsl(var(--bg-overlay))]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-lg',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button. */
  variant?: ButtonVariant
  /** Size preset. */
  size?: ButtonSize
  /** Show a loading spinner and disable interaction. */
  loading?: boolean
}

/**
 * @description A themed button with variant, size, and loading support.
 * Uses CSS custom property tokens for dark/light mode compatibility.
 */
const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref): React.JSX.Element => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-base))]',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer select-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'

export { Button }
