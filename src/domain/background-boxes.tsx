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

export interface BackgroundBoxesProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number
  cols?: number
  children?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const backgroundBoxesStyles = css`
  @layer components {
    @scope (.ui-background-boxes) {
      :scope {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .ui-background-boxes--grid {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-rows: var(--boxes-rows);
        grid-template-columns: var(--boxes-cols);
        gap: 1px;
        pointer-events: none;
        z-index: 0;
      }

      .ui-background-boxes--box {
        background: oklch(75% 0.15 270 / 0);
        animation: ui-box-pulse var(--box-duration, 4s) ease-in-out infinite;
        animation-delay: var(--box-delay, 0s);
        border-radius: 1px;
      }

      .ui-background-boxes--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-background-boxes--box {
        animation: none;
        background: oklch(75% 0.15 270 / 0.03);
      }

      @keyframes ui-box-pulse {
        0%, 100% {
          background: oklch(75% 0.15 270 / 0);
        }
        50% {
          background: oklch(75% 0.15 270 / var(--box-intensity, 0.12));
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-background-boxes--box {
          animation: none;
          background: oklch(75% 0.15 270 / 0.03);
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-background-boxes--grid {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-background-boxes--grid {
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

export function BackgroundBoxes({
  rows = 15,
  cols = 15,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: BackgroundBoxesProps) {
  useStyles('background-boxes', backgroundBoxesStyles)
  const motionLevel = useMotionLevel(motionProp)

  const boxes = useMemo(() => {
    const total = rows * cols
    return Array.from({ length: total }, (_, i) => ({
      id: i,
      delay: seededRandom(i + 1) * 8,
      duration: 3 + seededRandom(i + 100) * 5,
      intensity: 0.05 + seededRandom(i + 200) * 0.15,
    }))
  }, [rows, cols])

  const combinedStyle: React.CSSProperties = {
    ...style,
    '--boxes-rows': `repeat(${rows}, 1fr)`,
    '--boxes-cols': `repeat(${cols}, 1fr)`,
  } as any

  return (
    <div
      className={cn('ui-background-boxes', className)}
      data-motion={motionLevel}
      style={combinedStyle}
      {...rest}
    >
      <div className="ui-background-boxes--grid" aria-hidden="true">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="ui-background-boxes--box"
            style={{
              '--box-delay': `${box.delay}s`,
              '--box-duration': `${box.duration}s`,
              '--box-intensity': box.intensity,
            } as React.CSSProperties}
          />
        ))}
      </div>
      {children && (
        <div className="ui-background-boxes--content">
          {children}
        </div>
      )}
    </div>
  )
}

BackgroundBoxes.displayName = 'BackgroundBoxes'
