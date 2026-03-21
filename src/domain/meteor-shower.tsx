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

export interface MeteorShowerProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  children?: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const meteorShowerStyles = css`
  @layer components {
    @scope (.ui-meteor-shower) {
      :scope {
        position: relative;
        overflow: hidden;
      }

      .ui-meteor-shower--meteor {
        position: absolute;
        inset-block-start: -5%;
        inline-size: 1px;
        block-size: clamp(2rem, 4vw, 4rem);
        background: linear-gradient(
          to bottom,
          oklch(100% 0 0 / 0.6),
          oklch(100% 0 0 / 0.2),
          transparent
        );
        border-radius: 9999px;
        transform: rotate(-45deg);
        animation: ui-meteor-fall var(--meteor-duration, 2s) linear infinite;
        animation-delay: var(--meteor-delay, 0s);
        inset-inline-start: var(--meteor-left, 50%);
        opacity: 0;
        pointer-events: none;
      }

      /* Meteor tail glow */
      .ui-meteor-shower--meteor::after {
        content: '';
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 50%;
        transform: translateX(-50%);
        inline-size: 3px;
        block-size: 8px;
        border-radius: 50%;
        background: oklch(95% 0.05 270 / 0.8);
        box-shadow: 0 0 6px 2px oklch(75% 0.15 270 / 0.3);
      }

      /* Content layer */
      .ui-meteor-shower--content {
        position: relative;
        z-index: 1;
      }

      /* Motion 0: no meteors */
      :scope[data-motion="0"] .ui-meteor-shower--meteor {
        display: none;
      }

      @keyframes ui-meteor-fall {
        0% {
          opacity: 0;
          transform: rotate(-45deg) translateY(-100%);
        }
        5% {
          opacity: 1;
        }
        70% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: rotate(-45deg) translateY(calc(100vh + 100%));
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-meteor-shower--meteor {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-meteor-shower--meteor {
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

export function MeteorShower({
  count = 20,
  children,
  motion: motionProp,
  className,
  ...rest
}: MeteorShowerProps) {
  useStyles('meteor-shower', meteorShowerStyles)
  const motionLevel = useMotionLevel(motionProp)

  const meteors = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${seededRandom(i + 1) * 100}%`,
      delay: `${seededRandom(i + 100) * 5}s`,
      duration: `${1.5 + seededRandom(i + 200) * 2}s`,
    }))
  }, [count])

  return (
    <div
      className={cn('ui-meteor-shower', className)}
      data-motion={motionLevel}
      aria-hidden="true"
      {...rest}
    >
      {meteors.map((m) => (
        <div
          key={m.id}
          className="ui-meteor-shower--meteor"
          style={{
            '--meteor-left': m.left,
            '--meteor-delay': m.delay,
            '--meteor-duration': m.duration,
          } as React.CSSProperties}
        />
      ))}
      {children && (
        <div className="ui-meteor-shower--content">
          {children}
        </div>
      )}
    </div>
  )
}

MeteorShower.displayName = 'MeteorShower'
