'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EncryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  trigger?: 'mount' | 'hover' | 'inView'
  speed?: number
  scrambleChars?: string
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const encryptedTextStyles = css`
  @layer components {
    @scope (.ui-encrypted-text) {
      :scope {
        display: inline;
        font-variant-numeric: tabular-nums;
      }

      .ui-encrypted-text--char {
        display: inline-block;
        min-inline-size: 0.6em;
        text-align: center;
        transition: color 0.1s var(--ease-out, ease-out);
      }

      .ui-encrypted-text--char[data-resolved="true"] {
        color: inherit;
      }

      .ui-encrypted-text--char[data-scrambled="true"] {
        color: oklch(75% 0.15 270 / 0.7);
      }

      /* Motion 0: instant */
      :scope[data-motion="0"] .ui-encrypted-text--char {
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-encrypted-text--char {
          transition: none;
        }
      }

      /* Print */
      @media print {
        .ui-encrypted-text--char[data-scrambled="true"] {
          color: inherit;
        }
      }
    }
  }
`

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'

// ─── Component ──────────────────────────────────────────────────────────────

export function EncryptedText({
  text,
  trigger = 'mount',
  speed = 2,
  scrambleChars = DEFAULT_SCRAMBLE,
  motion: motionProp,
  className,
  onMouseEnter: onMouseEnterProp,
  ...rest
}: EncryptedTextProps) {
  useStyles('encrypted-text', encryptedTextStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLSpanElement>(null)
  const [resolvedCount, setResolvedCount] = useState(0)
  const [started, setStarted] = useState(false)
  const [displayChars, setDisplayChars] = useState<string[]>([])
  const rafRef = useRef<number>(0)
  const frameRef = useRef(0)

  const chars = Array.from(text)
  const isInstant = motionLevel === 0

  // Initialize display with scrambled characters
  useEffect(() => {
    if (isInstant) {
      setDisplayChars(chars)
      setResolvedCount(chars.length)
      setStarted(true)
    } else {
      setDisplayChars(
        chars.map((c) =>
          c === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        )
      )
    }
  }, [text, isInstant]) // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger detection
  useEffect(() => {
    if (isInstant || started) return

    if (trigger === 'mount') {
      setStarted(true)
      return
    }

    if (trigger === 'inView') {
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
    }
    // hover trigger is handled via onMouseEnter
  }, [isInstant, started, trigger])

  // Resolve animation using requestAnimationFrame
  useEffect(() => {
    if (!started || isInstant || resolvedCount >= chars.length) return

    frameRef.current = 0

    const animate = () => {
      frameRef.current++

      // Every N frames, resolve a character
      if (frameRef.current % Math.max(1, Math.round(4 / speed)) === 0) {
        setResolvedCount((prev) => {
          const next = Math.min(prev + 1, chars.length)
          return next
        })
      }

      // Scramble unresolved characters
      setDisplayChars((prev) =>
        prev.map((c, i) => {
          if (i < resolvedCount + 1) return chars[i]
          if (chars[i] === ' ') return ' '
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        })
      )

      if (resolvedCount < chars.length) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, isInstant, resolvedCount, chars.length, speed, scrambleChars]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      onMouseEnterProp?.(e)
      if (trigger === 'hover' && !started) {
        setStarted(true)
      }
    },
    [trigger, started, onMouseEnterProp]
  )

  return (
    <span
      ref={ref}
      className={cn('ui-encrypted-text', className)}
      data-motion={motionLevel}
      aria-label={text}
      role="img"
      onMouseEnter={handleMouseEnter}
      {...rest}
    >
      {displayChars.map((char, i) => (
        <span
          key={i}
          className="ui-encrypted-text--char"
          data-resolved={i < resolvedCount || undefined}
          data-scrambled={i >= resolvedCount || undefined}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

EncryptedText.displayName = 'EncryptedText'
