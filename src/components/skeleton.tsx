'use client'

import { forwardRef, type HTMLAttributes, type CSSProperties } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
  animate?: boolean
  motion?: 0 | 1 | 2 | 3
}

const skeletonStyles = css`
  @layer components {
    @scope (.ui-skeleton) {
      :scope {
        display: block;
        overflow: hidden;
        background: var(--bg-surface, oklch(25% 0.02 270));
      }

      /* Shimmer animation */
      :scope[data-animate="true"]:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.08) 40%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.12) 50%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.08) 60%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-skeleton-shimmer 1.8s var(--ease-in-out, ease-in-out) infinite;
      }

      :scope[data-animate="true"] {
        position: relative;
      }

      /* Variants */
      :scope[data-variant="text"] {
        border-radius: var(--radius-sm, 0.25rem);
        block-size: 0.75em;
      }

      :scope[data-variant="circular"] {
        border-radius: var(--radius-full, 9999px);
      }

      :scope[data-variant="rectangular"] {
        border-radius: var(--radius-md, 0.5rem);
      }

      /* Multi-line container */
      :scope[data-lines] {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        background: transparent;
        block-size: auto;
        border-radius: 0;
      }

      :scope[data-lines]::after {
        display: none;
      }

      /* Individual lines */
      .ui-skeleton__line {
        display: block;
        block-size: 0.75em;
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(25% 0.02 270));
        position: relative;
        overflow: hidden;
      }

      :scope[data-animate="true"]:not([data-motion="0"]) .ui-skeleton__line::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.08) 40%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.12) 50%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.08) 60%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-skeleton-shimmer 1.8s var(--ease-in-out, ease-in-out) infinite;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-skeleton__line {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
        }
        :scope::after,
        .ui-skeleton__line::after {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope::after,
        .ui-skeleton__line::after {
          display: none;
        }
      }
    }

    @keyframes ui-skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  }
`

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines,
      animate = true,
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('skeleton', skeletonStyles)
    const motionLevel = useMotionLevel(motionProp)

    const inlineStyle: CSSProperties = {
      ...style,
      ...(width != null ? { inlineSize: typeof width === 'number' ? `${width}px` : width } : {}),
      ...(height != null ? { blockSize: typeof height === 'number' ? `${height}px` : height } : {}),
    }

    // Multi-line text mode
    if (variant === 'text' && lines != null && lines > 0) {
      return (
        <div
          ref={ref}
          className={cn(cls('root'), className)}
          data-variant={variant}
          data-animate={animate}
          data-motion={motionLevel}
          data-lines=""
          aria-hidden="true"
          style={inlineStyle}
          {...rest}
        >
          {Array.from({ length: lines }, (_, i) => {
            const isLast = i === lines - 1 && lines > 1
            return (
              <span
                key={i}
                className="ui-skeleton__line"
                style={isLast ? { inlineSize: '60%' } : undefined}
              />
            )
          })}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-variant={variant}
        data-animate={animate}
        data-motion={motionLevel}
        aria-hidden="true"
        style={inlineStyle}
        {...rest}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'
