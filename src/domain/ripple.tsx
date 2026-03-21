'use client'

import {
  useRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RippleProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  duration?: number
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

interface RippleInstance {
  id: number
  x: number
  y: number
  size: number
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const rippleStyles = css`
  @layer components {
    @scope (.ui-ripple) {
      :scope {
        --ripple-color: var(--ripple-effect-color, oklch(100% 0 0 / 0.2));
        --ripple-duration: var(--ripple-effect-duration, 600ms);
        position: relative;
        overflow: hidden;
        cursor: pointer;
      }

      .ui-ripple--content {
        position: relative;
        z-index: 1;
      }

      .ui-ripple--circle {
        position: absolute;
        border-radius: 50%;
        background: var(--ripple-color);
        transform: scale(0);
        animation: ui-ripple-expand var(--ripple-duration) ease-out forwards;
        pointer-events: none;
        z-index: 0;
      }

      /* Motion 0: no ripple */
      :scope[data-motion="0"] .ui-ripple--circle {
        display: none;
      }

      @keyframes ui-ripple-expand {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-ripple--circle {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-ripple--circle {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

let rippleCounter = 0

export function Ripple({
  color,
  duration = 600,
  children,
  motion: motionProp,
  className,
  style,
  onClick: onClickProp,
  ...rest
}: RippleProps) {
  useStyles('ripple', rippleStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<RippleInstance[]>([])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onClickProp?.(e)
      if (motionLevel === 0) return

      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const size = Math.max(rect.width, rect.height)

      const newRipple: RippleInstance = {
        id: ++rippleCounter,
        x: x - size / 2,
        y: y - size / 2,
        size,
      }

      setRipples((prev) => [...prev, newRipple])

      // Clean up after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, duration)
    },
    [motionLevel, onClickProp, duration]
  )

  const combinedStyle: React.CSSProperties = {
    ...style,
    '--ripple-effect-duration': `${duration}ms`,
    ...(color ? { '--ripple-effect-color': color } : {}),
  } as any

  return (
    <div
      ref={ref}
      className={cn('ui-ripple', className)}
      data-motion={motionLevel}
      onClick={handleClick}
      style={combinedStyle}
      {...rest}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ui-ripple--circle"
          style={{
            insetInlineStart: ripple.x,
            insetBlockStart: ripple.y,
            inlineSize: ripple.size,
            blockSize: ripple.size,
          }}
        />
      ))}
      <div className="ui-ripple--content">
        {children}
      </div>
    </div>
  )
}

Ripple.displayName = 'Ripple'
