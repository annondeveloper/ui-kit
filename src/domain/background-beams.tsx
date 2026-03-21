'use client'

import {
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BackgroundBeamsProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  color?: string
  children?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const backgroundBeamsStyles = css`
  @layer components {
    @scope (.ui-background-beams) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .ui-background-beams--beam {
        position: absolute;
        inset: 0;
        inline-size: 2px;
        block-size: 200%;
        background: linear-gradient(
          to bottom,
          transparent,
          var(--beam-color, oklch(75% 0.15 270 / 0.3)),
          transparent
        );
        transform-origin: center center;
        transform: rotate(var(--beam-angle, 30deg))
          translate(var(--beam-start-x, 0px), var(--beam-start-y, -100%));
        animation: ui-beam-sweep var(--beam-duration, 8s) linear infinite;
        animation-delay: var(--beam-delay, 0s);
        opacity: 0;
        pointer-events: none;
        z-index: 0;
      }

      .ui-background-beams--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: no beams */
      :scope[data-motion="0"] .ui-background-beams--beam {
        display: none;
      }

      @keyframes ui-beam-sweep {
        0% {
          opacity: 0;
          transform: rotate(var(--beam-angle, 30deg))
            translate(var(--beam-start-x, -200px), -120%);
        }
        10% {
          opacity: 0.8;
        }
        80% {
          opacity: 0.8;
        }
        100% {
          opacity: 0;
          transform: rotate(var(--beam-angle, 30deg))
            translate(var(--beam-end-x, 200px), 120%);
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-background-beams--beam {
          display: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-background-beams--beam {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-background-beams--beam {
          display: none;
        }
      }
    }
  }
`

// ─── Deterministic pseudo-random ────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BackgroundBeams({
  count = 6,
  color,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: BackgroundBeamsProps) {
  useStyles('background-beams', backgroundBeamsStyles)
  const motionLevel = useMotionLevel(motionProp)

  const beams = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = -60 + seededRandom(i + 1) * 120 // -60 to 60 degrees
      const delay = seededRandom(i + 50) * 6
      const duration = 6 + seededRandom(i + 100) * 6
      const startX = -300 + seededRandom(i + 150) * 600
      const endX = -300 + seededRandom(i + 200) * 600
      return { id: i, angle, delay, duration, startX, endX }
    })
  }, [count])

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(color ? { '--beam-color': color } as any : {}),
  }

  return (
    <div
      className={cn('ui-background-beams', className)}
      data-motion={motionLevel}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      {beams.map((b) => (
        <div
          key={b.id}
          className="ui-background-beams--beam"
          aria-hidden="true"
          style={{
            '--beam-angle': `${b.angle}deg`,
            '--beam-delay': `${b.delay}s`,
            '--beam-duration': `${b.duration}s`,
            '--beam-start-x': `${b.startX}px`,
            '--beam-end-x': `${b.endX}px`,
          } as React.CSSProperties}
        />
      ))}
      {children && (
        <div className="ui-background-beams--content">
          {children}
        </div>
      )}
    </div>
  )
}

BackgroundBeams.displayName = 'BackgroundBeams'
