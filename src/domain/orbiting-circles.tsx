'use client'

import {
  type HTMLAttributes,
  type ReactNode,
  Children,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OrbitingCirclesProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number
  duration?: number
  reverse?: boolean
  children: ReactNode[]
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const orbitingCirclesStyles = css`
  @layer components {
    @scope (.ui-orbiting-circles) {
      :scope {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: calc(var(--orbit-radius, 100px) * 2 + 4rem);
        block-size: calc(var(--orbit-radius, 100px) * 2 + 4rem);
      }

      /* Orbit track (visual guide) */
      :scope::before {
        content: '';
        position: absolute;
        inset: 50%;
        inline-size: calc(var(--orbit-radius, 100px) * 2);
        block-size: calc(var(--orbit-radius, 100px) * 2);
        transform: translate(-50%, -50%);
        border: 1px solid var(--border-subtle);
        border-radius: 50%;
        pointer-events: none;
      }

      .ui-orbiting-circles--item {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: -1rem;
        inline-size: 2rem;
        block-size: 2rem;
        animation: ui-orbit var(--orbit-duration, 15s) linear infinite;
        animation-direction: var(--orbit-direction, normal);
        animation-delay: var(--orbit-delay, 0s);
      }

      /* Counter-rotate children so they stay upright */
      .ui-orbiting-circles--item > * {
        animation: ui-orbit-counter var(--orbit-duration, 15s) linear infinite;
        animation-direction: var(--orbit-direction, normal);
        animation-delay: var(--orbit-delay, 0s);
      }

      /* Motion 0: static placement */
      :scope[data-motion="0"] .ui-orbiting-circles--item {
        animation: none;
        transform: rotate(var(--orbit-start-angle, 0deg)) translateX(var(--orbit-radius, 100px));
      }

      :scope[data-motion="0"] .ui-orbiting-circles--item > * {
        animation: none;
      }

      @keyframes ui-orbit {
        from {
          transform: rotate(var(--orbit-start-angle, 0deg)) translateX(var(--orbit-radius, 100px)) rotate(calc(-1 * var(--orbit-start-angle, 0deg)));
        }
        to {
          transform: rotate(calc(var(--orbit-start-angle, 0deg) + 360deg)) translateX(var(--orbit-radius, 100px)) rotate(calc(-1 * var(--orbit-start-angle, 0deg) - 360deg));
        }
      }

      @keyframes ui-orbit-counter {
        /* Children stay upright via parent counter-rotation in the orbit keyframes */
        from { transform: rotate(0deg); }
        to { transform: rotate(0deg); }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-orbiting-circles--item {
          animation: none;
          transform: rotate(var(--orbit-start-angle, 0deg)) translateX(var(--orbit-radius, 100px));
        }
        .ui-orbiting-circles--item > * {
          animation: none;
        }
      }

      /* Print */
      @media print {
        .ui-orbiting-circles--item {
          animation: none;
          transform: rotate(var(--orbit-start-angle, 0deg)) translateX(var(--orbit-radius, 100px));
        }
        .ui-orbiting-circles--item > * {
          animation: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function OrbitingCircles({
  radius = 100,
  duration = 15,
  reverse = false,
  children,
  motion: motionProp,
  className,
  style,
  ...rest
}: OrbitingCirclesProps) {
  useStyles('orbiting-circles', orbitingCirclesStyles)
  const motionLevel = useMotionLevel(motionProp)
  const items = Children.toArray(children)
  const angleStep = 360 / items.length

  const combinedStyle: React.CSSProperties = {
    ...style,
    '--orbit-radius': `${radius}px`,
    '--orbit-duration': `${duration}s`,
    '--orbit-direction': reverse ? 'reverse' : 'normal',
  } as any

  return (
    <div
      className={cn('ui-orbiting-circles', className)}
      data-motion={motionLevel}
      style={combinedStyle}
      role="presentation"
      {...rest}
    >
      {items.map((child, i) => (
        <div
          key={i}
          className="ui-orbiting-circles--item"
          style={{
            '--orbit-start-angle': `${i * angleStep}deg`,
            '--orbit-delay': `${-(i * (duration / items.length))}s`,
          } as React.CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

OrbitingCircles.displayName = 'OrbitingCircles'
