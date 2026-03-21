'use client'

import {
  useState,
  useEffect,
  useRef,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FlipWordsProps extends HTMLAttributes<HTMLSpanElement> {
  words: string[]
  interval?: number
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const flipWordsStyles = css`
  @layer components {
    @scope (.ui-flip-words) {
      :scope {
        display: inline-block;
        position: relative;
        vertical-align: baseline;
        perspective: 600px;
      }

      .ui-flip-words--word {
        display: inline-block;
        backface-visibility: hidden;
        transition:
          transform 0.4s var(--ease-out, ease-out),
          opacity 0.4s var(--ease-out, ease-out);
      }

      .ui-flip-words--word[data-state="entering"] {
        transform: rotateX(90deg);
        opacity: 0;
      }

      .ui-flip-words--word[data-state="visible"] {
        transform: rotateX(0deg);
        opacity: 1;
      }

      .ui-flip-words--word[data-state="exiting"] {
        transform: rotateX(-90deg);
        opacity: 0;
      }

      /* Motion 0: no animation, just show current word */
      :scope[data-motion="0"] .ui-flip-words--word {
        transform: none;
        opacity: 1;
        transition: none;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .ui-flip-words--word {
          transform: none !important;
          opacity: 1 !important;
          transition: none;
        }
      }

      /* Print */
      @media print {
        .ui-flip-words--word {
          transform: none !important;
          opacity: 1 !important;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function FlipWords({
  words,
  interval = 3000,
  motion: motionProp,
  className,
  ...rest
}: FlipWordsProps) {
  useStyles('flip-words', flipWordsStyles)
  const motionLevel = useMotionLevel(motionProp)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [state, setState] = useState<'entering' | 'visible' | 'exiting'>('visible')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const safeWords = words.length > 0 ? words : ['']

  useEffect(() => {
    if (motionLevel === 0 || safeWords.length <= 1) return

    const cycle = () => {
      // Start exit
      setState('exiting')

      timerRef.current = setTimeout(() => {
        // Move to next word, start entering
        setCurrentIndex((prev) => (prev + 1) % safeWords.length)
        setState('entering')

        timerRef.current = setTimeout(() => {
          // Finish entering
          setState('visible')
        }, 50) // small delay to trigger CSS transition
      }, 400) // match CSS transition duration
    }

    const mainTimer = setInterval(cycle, interval)

    return () => {
      clearInterval(mainTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [motionLevel, safeWords.length, interval])

  return (
    <span
      className={cn('ui-flip-words', className)}
      data-motion={motionLevel}
      aria-live="polite"
      aria-atomic="true"
      {...rest}
    >
      <span
        className="ui-flip-words--word"
        data-state={motionLevel === 0 ? 'visible' : state}
      >
        {safeWords[currentIndex]}
      </span>
    </span>
  )
}

FlipWords.displayName = 'FlipWords'
