'use client'

import {
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const shimmerButtonStyles = css`
  @layer components {
    @scope (.ui-shimmer-button) {
      :scope {
        --shimmer-color: var(--shimmer-button-color, oklch(75% 0.15 270));
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.5rem);
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.4;
        color: var(--text-primary, oklch(95% 0 0));
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        cursor: pointer;
        overflow: hidden;
        isolation: isolate;
        transition: transform 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
        min-block-size: 2.75rem;
        min-inline-size: 2.75rem;
      }

      :scope:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px oklch(0% 0 0 / 0.3);
      }

      :scope:active {
        transform: translateY(0);
      }

      :scope:focus-visible {
        outline: 2px solid var(--focus-ring, oklch(75% 0.15 270));
        outline-offset: 2px;
      }

      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      /* Shimmer pseudo-element */
      :scope::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          transparent 55%,
          var(--shimmer-color) 75%,
          transparent 95%,
          transparent 100%
        );
        animation: ui-shimmer-rotate 3s linear infinite;
        z-index: -2;
      }

      /* Inner mask to show only border shimmer */
      :scope::after {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: inherit;
        background: var(--bg-surface, oklch(22% 0.02 270));
        z-index: -1;
      }

      /* Size variants */
      :scope[data-size="sm"] {
        padding: var(--space-2xs, 0.25rem) var(--space-sm, 0.5rem);
        font-size: 0.8125rem;
        min-block-size: 2rem;
      }

      :scope[data-size="lg"] {
        padding: var(--space-md, 0.75rem) var(--space-lg, 1.5rem);
        font-size: 1rem;
        min-block-size: 3rem;
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"]::before {
        animation: none;
        background: var(--shimmer-color);
        opacity: 0.4;
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      @keyframes ui-shimmer-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope::before {
          animation: none;
          background: var(--shimmer-color);
          opacity: 0.3;
        }
        :scope {
          transition: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        :scope::before,
        :scope::after {
          display: none;
        }
      }

      /* Print */
      @media print {
        :scope::before,
        :scope::after {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function ShimmerButton({
  shimmerColor,
  children,
  size = 'md',
  motion: motionProp,
  className,
  style,
  disabled,
  ...rest
}: ShimmerButtonProps) {
  useStyles('shimmer-button', shimmerButtonStyles)
  const motionLevel = useMotionLevel(motionProp)

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(shimmerColor ? { '--shimmer-button-color': shimmerColor } as any : {}),
  }

  return (
    <button
      className={cn('ui-shimmer-button', className)}
      data-size={size}
      data-motion={motionLevel}
      disabled={disabled}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      {children}
    </button>
  )
}

ShimmerButton.displayName = 'ShimmerButton'
