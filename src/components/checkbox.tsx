'use client'

import type React from 'react'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Show an indeterminate (minus) indicator instead of a checkmark. */
  indeterminate?: boolean
  /** Size variant. */
  size?: 'sm' | 'md'
}

/**
 * @description A themed checkbox with indeterminate state support.
 * Uses CSS custom property tokens for dark/light mode compatibility.
 */
const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>> = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, checked, size = 'md', className, ...props }, ref): React.JSX.Element => {
    const isChecked = checked || indeterminate
    const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
    const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

    return (
      <label className={cn('relative inline-flex items-center cursor-pointer', className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            sizeClass,
            'rounded border transition-colors duration-150',
            'flex items-center justify-center shrink-0',
            isChecked
              ? 'bg-[hsl(var(--brand-primary))] border-[hsl(var(--brand-primary))]'
              : 'bg-transparent border-[hsl(var(--border-strong))] hover:border-[hsl(var(--brand-primary))]',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-[hsl(var(--brand-primary))] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[hsl(var(--bg-base))]',
            'peer-disabled:opacity-50 peer-disabled:pointer-events-none',
          )}
        >
          {indeterminate ? (
            <Minus className={cn(iconSize, 'text-[hsl(var(--text-on-brand))] stroke-[3]')} />
          ) : checked ? (
            <Check className={cn(iconSize, 'text-[hsl(var(--text-on-brand))] stroke-[3]')} />
          ) : null}
        </div>
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
