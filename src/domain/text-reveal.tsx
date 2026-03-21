'use client'

import {
  useRef,
  useEffect,
  useState,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TextRevealProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  trigger?: 'mount' | 'inView'
  speed?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const textRevealStyles = css`
  @layer components {
    @scope (.ui-text-reveal) {
      :scope {
        display: block;
      }

      .ui-text-reveal--char {
        display: inline-block;
        opacity: 0;
        transform: translateY(0.3em);
        transition:
          opacity 0.15s var(--ease-out, ease-out),
          transform 0.15s var(--ease-out, ease-out);
      }

      .ui-text-reveal--char[data-revealed="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      /* Whitespace chars need explicit width */
      .ui-text-reveal--char[data-space="true"] {
        inline-size: 0.3em;
        opacity: 1;
        transform: none;
      }

      /* Motion 0: instant reveal */
      :scope[data-motion="0"] .ui-text-reveal--char {
        opacity: 1;
        transform: none;
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-text-reveal--char {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      }

      /* Print */
      @media print {
        .ui-text-reveal--char {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function TextReveal({
  text,
  trigger = 'mount',
  speed = 30,
  motion: motionProp,
  className,
  ...rest
}: TextRevealProps) {
  useStyles('text-reveal', textRevealStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [started, setStarted] = useState(false)

  const isInstant = motionLevel === 0
  const chars = Array.from(text)

  // Trigger detection
  useEffect(() => {
    if (isInstant) {
      setRevealedCount(chars.length)
      setStarted(true)
      return
    }

    if (trigger === 'mount') {
      setStarted(true)
      return
    }

    // inView trigger
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isInstant, trigger, chars.length])

  // Character-by-character reveal
  useEffect(() => {
    if (!started || isInstant) return
    if (revealedCount >= chars.length) return

    const interval = 1000 / speed
    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1)
    }, interval)

    return () => clearTimeout(timer)
  }, [started, revealedCount, chars.length, speed, isInstant])

  return (
    <div
      ref={ref}
      className={cn('ui-text-reveal', className)}
      data-motion={motionLevel}
      aria-label={text}
      role="img"
      {...rest}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="ui-text-reveal--char"
          data-revealed={i < revealedCount || undefined}
          data-space={char === ' ' || undefined}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  )
}

TextReveal.displayName = 'TextReveal'
