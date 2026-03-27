'use client'

import { forwardRef, useState, useCallback, useRef, useEffect, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface CopyButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'children'> {
  value: string
  timeout?: number
  children: (payload: { copied: boolean; copy: () => void }) => ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

const copyButtonStyles = css`
  @layer components {
    @scope (.ui-copy-button) {
      :scope {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        border-radius: var(--radius-md, 0.5rem);
        background: var(--bg-elevated, oklch(100% 0 0 / 0.06));
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        outline: none;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
        transition:
          background 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          border-color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.15s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Sizes */
      :scope[data-size="xs"] {
        padding: 0.125rem;
        min-block-size: 24px;
        min-inline-size: 24px;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] {
        padding: 0.25rem;
        min-block-size: 32px;
        min-inline-size: 32px;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] {
        padding: 0.375rem;
        min-block-size: 36px;
        min-inline-size: 36px;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] {
        padding: 0.5rem;
        min-block-size: 44px;
        min-inline-size: 44px;
        font-size: var(--text-base, 1rem);
      }

      /* Hover */
      :scope:hover:not(:disabled) {
        background: var(--bg-hover, oklch(100% 0 0 / 0.1));
        border-color: var(--border-strong, oklch(100% 0 0 / 0.15));
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Focus visible */
      :scope:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      /* Copied state */
      :scope[data-copied="true"] {
        color: var(--status-success, oklch(72% 0.19 155));
        border-color: oklch(from var(--status-success, oklch(72% 0.19 155)) l c h / 0.3);
      }

      /* Active press */
      :scope:active:not(:disabled):not([data-motion="0"]) {
        transform: scale(0.93);
        transition: transform 0.06s ease-out;
      }

      /* Icon sizing */
      :scope svg {
        inline-size: 1.125em;
        block-size: 1.125em;
        flex-shrink: 0;
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
        :scope:focus-visible {
          outline: 2px solid Highlight;
        }
        :scope[data-copied="true"] {
          border-color: Highlight;
        }
      }

      /* Print */
      @media print {
        :scope {
          display: none;
        }
      }
    }
  }
`

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      timeout = 2000,
      children,
      size = 'md',
      motion: motionProp,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    useStyles('copy-button', copyButtonStyles)
    const motionLevel = useMotionLevel(motionProp)
    const [copied, setCopied] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
    }, [])

    const copy = useCallback(() => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          timeoutRef.current = setTimeout(() => setCopied(false), timeout)
        })
      }
    }, [value, timeout])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        copy()
        onClick?.(e)
      },
      [copy, onClick]
    )

    return (
      <button
        ref={ref}
        type="button"
        className={cn('ui-copy-button', className)}
        data-size={size}
        data-copied={copied || undefined}
        data-motion={motionLevel}
        onClick={handleClick}
        aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        {...rest}
      >
        {children({ copied, copy })}
      </button>
    )
  }
)
CopyButton.displayName = 'CopyButton'
