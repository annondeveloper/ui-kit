'use client'

import {
  useRef,
  useCallback,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EvervaultCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const evervaultCardStyles = css`
  @layer components {
    @scope (.ui-evervault-card) {
      :scope {
        --ev-x: 50%;
        --ev-y: 50%;
        position: relative;
        overflow: hidden;
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        isolation: isolate;
      }

      .ui-evervault-card--matrix {
        position: absolute;
        inset: 0;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        font-family: monospace;
        font-size: 0.625rem;
        line-height: 1;
        color: oklch(75% 0.15 270 / 0.4);
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 0.3s var(--ease-out, ease-out);
        mask-image: radial-gradient(
          circle 100px at var(--ev-x) var(--ev-y),
          transparent 60px,
          black 100px
        );
        -webkit-mask-image: radial-gradient(
          circle 100px at var(--ev-x) var(--ev-y),
          transparent 60px,
          black 100px
        );
      }

      :scope[data-hovering="true"] .ui-evervault-card--matrix {
        opacity: 1;
      }

      .ui-evervault-card--char {
        inline-size: 0.6em;
        text-align: center;
      }

      .ui-evervault-card--content {
        position: relative;
        z-index: 1;
        padding: var(--space-md, 1rem);
      }

      /* Motion 0: no effect */
      :scope[data-motion="0"] .ui-evervault-card--matrix {
        display: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-evervault-card--matrix {
          display: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid CanvasText;
        }
        .ui-evervault-card--matrix {
          display: none;
        }
      }

      /* Print */
      @media print {
        .ui-evervault-card--matrix {
          display: none;
        }
      }
    }
  }
`

// ─── Constants ──────────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EvervaultCard({
  children,
  motion: motionProp,
  className,
  onMouseMove: onMouseMoveProp,
  onMouseEnter: onMouseEnterProp,
  onMouseLeave: onMouseLeaveProp,
  ...rest
}: EvervaultCardProps) {
  useStyles('evervault-card', evervaultCardStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)
  const [chars, setChars] = useState<string[]>(() => {
    return Array.from({ length: 600 }, (_, i) =>
      SCRAMBLE_CHARS[Math.floor(seededRandom(i + 1) * SCRAMBLE_CHARS.length)]
    )
  })
  const rafRef = useRef<number>(0)

  // Scramble characters while hovering
  useEffect(() => {
    if (!hovering || motionLevel === 0) return

    let frameCount = 0
    const scramble = () => {
      frameCount++
      setChars(prev =>
        prev.map((_, i) =>
          SCRAMBLE_CHARS[Math.floor(seededRandom(i + frameCount * 7) * SCRAMBLE_CHARS.length)]
        )
      )
      rafRef.current = requestAnimationFrame(scramble)
    }

    rafRef.current = requestAnimationFrame(scramble)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovering, motionLevel])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMoveProp?.(e)
      if (motionLevel === 0) return

      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--ev-x', `${x}px`)
      el.style.setProperty('--ev-y', `${y}px`)
    },
    [motionLevel, onMouseMoveProp]
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(e)
      setHovering(true)
      ref.current?.setAttribute('data-hovering', 'true')
    },
    [onMouseEnterProp]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(e)
      setHovering(false)
      ref.current?.removeAttribute('data-hovering')
    },
    [onMouseLeaveProp]
  )

  return (
    <div
      ref={ref}
      className={cn('ui-evervault-card', className)}
      data-motion={motionLevel}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div className="ui-evervault-card--matrix" aria-hidden="true">
        {chars.map((char, i) => (
          <span key={i} className="ui-evervault-card--char">
            {char}
          </span>
        ))}
      </div>
      <div className="ui-evervault-card--content">
        {children}
      </div>
    </div>
  )
}

EvervaultCard.displayName = 'EvervaultCard'
