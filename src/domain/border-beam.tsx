'use client'

import {
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BorderBeamProps extends HTMLAttributes<HTMLDivElement> {
  duration?: number
  color?: string
  size?: number
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const borderBeamStyles = css`
  @layer components {
    @scope (.ui-border-beam) {
      :scope {
        --beam-color: var(--border-beam-color, oklch(75% 0.15 270));
        --beam-size: var(--border-beam-size, 80px);
        --beam-duration: var(--border-beam-duration, 5s);
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }

      /* Beam element */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: conic-gradient(
          from calc(var(--beam-angle, 0) * 1deg),
          transparent 0%,
          transparent 70%,
          var(--beam-color) 85%,
          transparent 95%
        );
        mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        animation: ui-border-beam-rotate var(--beam-duration) linear infinite;
        pointer-events: none;
        z-index: 1;
      }

      /* Content */
      :scope > .ui-border-beam--content {
        position: relative;
        z-index: 2;
      }

      /* Motion 0: static border highlight */
      :scope[data-motion="0"]::before {
        animation: none;
        background: var(--beam-color);
        opacity: 0.3;
      }

      @keyframes ui-border-beam-rotate {
        from { --beam-angle: 0; transform: rotate(0deg); }
        to { --beam-angle: 360; transform: rotate(360deg); }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope::before {
          animation: none;
          background: var(--beam-color);
          opacity: 0.2;
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

export function BorderBeam({
  duration = 5,
  color,
  size = 80,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: BorderBeamProps) {
  useStyles('border-beam', borderBeamStyles)
  const motionLevel = useMotionLevel(motionProp)

  const combinedStyle: React.CSSProperties = {
    ...style,
    '--border-beam-duration': `${duration}s`,
    '--border-beam-size': `${size}px`,
    ...(color ? { '--border-beam-color': color } : {}),
  } as any

  return (
    <div
      className={cn('ui-border-beam', className)}
      data-motion={motionLevel}
      style={combinedStyle}
      {...rest}
    >
      <div className="ui-border-beam--content">
        {children}
      </div>
    </div>
  )
}

BorderBeam.displayName = 'BorderBeam'
