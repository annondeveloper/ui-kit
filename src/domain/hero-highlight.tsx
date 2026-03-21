'use client'

import {
  useRef,
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

export interface HeroHighlightProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  motion?: 0 | 1 | 2 | 3
}

export interface HighlightProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  color?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const heroHighlightStyles = css`
  @layer components {
    @scope (.ui-hero-highlight) {
      :scope {
        display: block;
      }
    }
  }
`

const highlightStyles = css`
  @layer components {
    @scope (.ui-highlight) {
      :scope {
        --highlight-color: var(--highlight-brand-color, oklch(75% 0.15 270 / 0.25));
        position: relative;
        display: inline;
        padding-inline: 0.15em;
      }

      /* Animated underline/background */
      :scope::before {
        content: '';
        position: absolute;
        inset-block-end: 0;
        inset-inline-start: 0;
        block-size: 40%;
        inline-size: 0%;
        background: linear-gradient(
          90deg,
          var(--highlight-color),
          oklch(from var(--highlight-color) l c calc(h + 30))
        );
        border-radius: 2px;
        z-index: -1;
        transition: inline-size 0.6s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1));
      }

      :scope[data-active="true"]::before {
        inline-size: 100%;
      }

      /* Motion 0: instant */
      :scope[data-motion="0"]::before {
        inline-size: 100%;
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        :scope::before {
          inline-size: 100% !important;
          transition: none;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope::before {
          background: Highlight;
        }
      }

      /* Print */
      @media print {
        :scope::before {
          inline-size: 100%;
        }
      }
    }
  }
`

// ─── HeroHighlight Component ────────────────────────────────────────────────

export function HeroHighlight({
  children,
  motion: motionProp,
  className,
  ...rest
}: HeroHighlightProps) {
  useStyles('hero-highlight', heroHighlightStyles)
  const motionLevel = useMotionLevel(motionProp)

  return (
    <div
      className={cn('ui-hero-highlight', className)}
      data-motion={motionLevel}
      {...rest}
    >
      {children}
    </div>
  )
}

HeroHighlight.displayName = 'HeroHighlight'

// ─── Highlight Component ────────────────────────────────────────────────────

export function Highlight({
  children,
  color,
  motion: motionProp,
  className,
  style,
  ...rest
}: HighlightProps) {
  useStyles('highlight', highlightStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(false)

  const isInstant = motionLevel === 0

  useEffect(() => {
    if (isInstant) {
      setActive(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isInstant])

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(color ? { '--highlight-brand-color': color } as any : {}),
  }

  return (
    <span
      ref={ref}
      className={cn('ui-highlight', className)}
      data-motion={motionLevel}
      data-active={active || undefined}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      {children}
    </span>
  )
}

Highlight.displayName = 'Highlight'
