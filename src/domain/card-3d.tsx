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

export interface Card3DProps extends HTMLAttributes<HTMLDivElement> {
  perspective?: number
  maxTilt?: number
  glare?: boolean
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const card3DStyles = css`
  @layer components {
    @scope (.ui-card-3d) {
      :scope {
        perspective: var(--card-3d-perspective, 1000px);
        min-inline-size: 200px;
        display: inline-block;
      }

      .ui-card-3d--inner {
        position: relative;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding: var(--space-md, 1rem);
        transform-style: preserve-3d;
        transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
        transition: transform 0.15s var(--ease-out, ease-out);
        overflow: hidden;
      }

      /* Glare overlay */
      .ui-card-3d--glare {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          var(--glare-angle, 135deg),
          oklch(100% 0 0 / var(--glare-opacity, 0)) 0%,
          oklch(100% 0 0 / 0) 80%
        );
        pointer-events: none;
        z-index: 2;
      }

      .ui-card-3d--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: no tilt */
      :scope[data-motion="0"] .ui-card-3d--inner {
        transform: none;
        transition: none;
      }

      :scope[data-motion="0"] .ui-card-3d--glare {
        display: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-card-3d--inner {
          transform: none !important;
          transition: none;
        }
        .ui-card-3d--glare {
          display: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-card-3d--inner {
          border: 2px solid CanvasText;
          transform: none !important;
        }
        .ui-card-3d--glare {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-card-3d--inner {
          transform: none !important;
        }
        .ui-card-3d--glare {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function Card3D({
  perspective = 1000,
  maxTilt = 10,
  glare = true,
  children,
  motion: motionProp,
  className,
  style,
  onMouseMove: onMouseMoveProp,
  onMouseLeave: onMouseLeaveProp,
  ...rest
}: Card3DProps) {
  useStyles('card-3d', card3DStyles)
  const motionLevel = useMotionLevel(motionProp)
  const innerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMoveProp?.(e)
      if (motionLevel === 0) return

      const el = innerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const mouseX = e.clientX - centerX
      const mouseY = e.clientY - centerY

      // Normalize to -1..1
      const normalX = mouseX / (rect.width / 2)
      const normalY = mouseY / (rect.height / 2)

      const tiltX = -normalY * maxTilt // invert Y for natural feel
      const tiltY = normalX * maxTilt

      el.style.setProperty('--tilt-x', `${tiltX}deg`)
      el.style.setProperty('--tilt-y', `${tiltY}deg`)

      if (glare) {
        const glareOpacity = Math.sqrt(normalX * normalX + normalY * normalY) * 0.15
        const glareAngle = Math.atan2(mouseY, mouseX) * (180 / Math.PI) + 90
        el.style.setProperty('--glare-opacity', `${Math.min(glareOpacity, 0.2)}`)
        el.style.setProperty('--glare-angle', `${glareAngle}deg`)
      }
    },
    [motionLevel, maxTilt, glare, onMouseMoveProp]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(e)

      const el = innerRef.current
      if (!el) return

      el.style.setProperty('--tilt-x', '0deg')
      el.style.setProperty('--tilt-y', '0deg')
      el.style.setProperty('--glare-opacity', '0')
    },
    [onMouseLeaveProp]
  )

  const combinedStyle: React.CSSProperties = {
    ...style,
    '--card-3d-perspective': `${perspective}px`,
  } as any

  return (
    <div
      className={cn('ui-card-3d', className)}
      data-motion={motionLevel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle}
      {...rest}
    >
      <div ref={innerRef} className="ui-card-3d--inner">
        <div className="ui-card-3d--content">
          {children}
        </div>
        {glare && <div className="ui-card-3d--glare" aria-hidden="true" />}
      </div>
    </div>
  )
}

Card3D.displayName = 'Card3D'
