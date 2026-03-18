'use client'

import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  /** Currently selected value. */
  value: string
  /** Callback when selection changes. */
  onValueChange: (v: string) => void
  /** Available options. */
  options: SelectOption[]
  /** Placeholder text when no value is selected. */
  placeholder?: string
  className?: string
  /** Disable the select. */
  disabled?: boolean
}

/**
 * @description A themed select dropdown built on Radix UI Select.
 * Supports dark/light mode via CSS custom property tokens.
 */
export function Select({
  value, onValueChange, options, placeholder, className, disabled,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        suppressHydrationWarning
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg',
          'border border-[hsl(var(--border-default))] bg-[hsl(var(--bg-base))]',
          'px-3 py-2 text-sm text-[hsl(var(--text-primary))]',
          'hover:border-[hsl(var(--border-strong))] focus:outline-none',
          'focus:ring-2 focus:ring-[hsl(var(--brand-primary))]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'data-[placeholder]:text-[hsl(var(--text-tertiary))]',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-[hsl(var(--text-tertiary))] shrink-0" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden',
            'rounded-xl border border-[hsl(var(--border-default))]',
            'bg-[hsl(var(--bg-elevated))] shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          )}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center',
                  'rounded-lg py-2 pl-8 pr-3 text-sm',
                  'text-[hsl(var(--text-primary))]',
                  'outline-none',
                  'hover:bg-[hsl(var(--bg-overlay))]',
                  'focus:bg-[hsl(var(--brand-primary))]/10 focus:text-[hsl(var(--brand-primary))]',
                  'data-[state=checked]:text-[hsl(var(--brand-primary))]',
                )}
              >
                <RadixSelect.ItemIndicator className="absolute left-2 flex items-center">
                  <Check className="size-4" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
