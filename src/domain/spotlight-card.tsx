'use client'

import {
  useRef,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const spotlightCardStyles = css`
  @layer components {
    @scope (.ui-spotlight-card) {
      :scope {
        --spotlight-color: var(--spotlight-card-color, oklch(75% 0.15 270 / 0.15));
        --spotlight-x: 50%;
        --spotlight-y: 50%;
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding: var(--space-md, 1rem);
        isolation: isolate;
      }

      /* Spotlight gradient following cursor */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(
          circle 400px at var(--spotlight-x) var(--spotlight-y),
          var(--spotlight-color),
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s var(--ease-out, ease-out);
        pointer-events: none;
        z-index: 0;
      }

      :scope[data-hovering="true"]::before {
        opacity: 1;
      }

      /* Content */
      .ui-spotlight-card--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: no spotlight */
      :scope[data-motion="0"]::before {
        display: none;
      }

      :scope[data-motion="0"] {
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope::before {
          transition: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid CanvasText;
        }
        :scope::before {
          display: none;
        }
      }

      /* Print */
      @media print {
        :scope::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function SpotlightCard({
  spotlightColor,
  children,
  motion: motionProp,
  className,
  style,
  onMouseMove: onMouseMoveProp,
  onMouseEnter: onMouseEnterProp,
  onMouseLeave: onMouseLeaveProp,
  ...rest
}: SpotlightCardProps) {
  useStyles('spotlight-card', spotlightCardStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMoveProp?.(e)
      if (motionLevel === 0) return

      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--spotlight-x', `${x}px`)
      el.style.setProperty('--spotlight-y', `${y}px`)
    },
    [motionLevel, onMouseMoveProp]
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(e)
      ref.current?.setAttribute('data-hovering', 'true')
    },
    [onMouseEnterProp]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(e)
      ref.current?.removeAttribute('data-hovering')
    },
    [onMouseLeaveProp]
  )

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(spotlightColor ? { '--spotlight-card-color': spotlightColor } as any : {}),
  }

  return (
    <div
      ref={ref}
      className={cn('ui-spotlight-card', className)}
      data-motion={motionLevel}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      <div className="ui-spotlight-card--content">
        {children}
      </div>
    </div>
  )
}

SpotlightCard.displayName = 'SpotlightCard'
