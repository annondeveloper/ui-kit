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

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'none'
  delay?: number
  stagger?: number
  threshold?: number
  once?: boolean
  motion?: 0 | 1 | 2 | 3
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const scrollRevealStyles = css`
  @layer components {
    @scope (.ui-scroll-reveal) {
      :scope {
        /* Content always accessible to SR; only visual transform */
      }

      /* ── Hidden state (before reveal) ──────────────────── */

      :scope:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-up"] {
        opacity: 0;
        transform: translateY(1.5rem);
      }
      :scope:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-down"] {
        opacity: 0;
        transform: translateY(-1.5rem);
      }
      :scope:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-left"] {
        opacity: 0;
        transform: translateX(1.5rem);
      }
      :scope:not([data-revealed="true"]):not([data-motion="0"])[data-animation="fade-right"] {
        opacity: 0;
        transform: translateX(-1.5rem);
      }
      :scope:not([data-revealed="true"]):not([data-motion="0"])[data-animation="scale"] {
        opacity: 0;
        transform: scale(0.9);
      }

      /* ── Revealed state ────────────────────────────────── */

      :scope[data-revealed="true"]:not([data-motion="0"]) {
        opacity: 1;
        transform: none;
        transition:
          opacity 0.5s var(--ease-out, ease-out) var(--scroll-reveal-delay, 0ms),
          transform 0.5s var(--ease-out, ease-out) var(--scroll-reveal-delay, 0ms);
      }

      /* ── Motion 0: instant, no animation ───────────────── */

      :scope[data-motion="0"] {
        opacity: 1;
        transform: none;
        transition: none;
      }

      /* ── Stagger: children get incremental delay ───────── */

      :scope[data-stagger] > * {
        transition:
          opacity 0.5s var(--ease-out, ease-out) calc(var(--scroll-reveal-delay, 0ms) + var(--stagger-index, 0) * var(--stagger-delay, 0ms)),
          transform 0.5s var(--ease-out, ease-out) calc(var(--scroll-reveal-delay, 0ms) + var(--stagger-index, 0) * var(--stagger-delay, 0ms));
      }

      /* ── CSS scroll-driven animations (progressive enhancement) ── */

      @supports (animation-timeline: view()) {
        :scope[data-animation="fade-up"]:not([data-motion="0"]) {
          animation: ui-scroll-reveal-fade-up both;
          animation-timeline: view();
          animation-range: entry 0% entry 100%;
        }
        :scope[data-animation="fade-down"]:not([data-motion="0"]) {
          animation: ui-scroll-reveal-fade-down both;
          animation-timeline: view();
          animation-range: entry 0% entry 100%;
        }
        :scope[data-animation="scale"]:not([data-motion="0"]) {
          animation: ui-scroll-reveal-scale both;
          animation-timeline: view();
          animation-range: entry 0% entry 100%;
        }
      }

      /* ── Reduced motion ────────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        :scope {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
          animation: none !important;
        }
      }

      /* ── Print ─────────────────────────────────────────── */

      @media print {
        :scope {
          opacity: 1 !important;
          transform: none !important;
        }
      }
    }

    @keyframes ui-scroll-reveal-fade-up {
      from { opacity: 0; transform: translateY(1.5rem); }
      to { opacity: 1; transform: none; }
    }
    @keyframes ui-scroll-reveal-fade-down {
      from { opacity: 0; transform: translateY(-1.5rem); }
      to { opacity: 1; transform: none; }
    }
    @keyframes ui-scroll-reveal-scale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: none; }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function ScrollReveal({
  animation = 'fade-up',
  delay = 0,
  stagger,
  threshold = 0.1,
  once = true,
  motion: motionProp,
  children,
  className,
  style,
  ...rest
}: ScrollRevealProps) {
  const cls = useStyles('scroll-reveal', scrollRevealStyles)
  const motionLevel = useMotionLevel(motionProp)
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const hasTriggeredRef = useRef(false)

  // Motion 0 = instant reveal
  const isInstant = motionLevel === 0

  useEffect(() => {
    if (isInstant) {
      setRevealed(true)
      return
    }

    const el = ref.current
    if (!el) return
    if (once && hasTriggeredRef.current) return

    // Check CSS scroll-driven animations support
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' && CSS?.supports?.('animation-timeline', 'view()')
    if (supportsScrollTimeline) {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          hasTriggeredRef.current = true
          if (once) observer.disconnect()
        } else if (!once) {
          setRevealed(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [isInstant, threshold, once])

  const combinedStyle: React.CSSProperties = {
    ...style,
    ...(delay > 0 ? { '--scroll-reveal-delay': `${delay}ms` } as any : {}),
    ...(stagger ? { '--stagger-delay': `${stagger}ms` } as any : {}),
  }

  return (
    <div
      ref={ref}
      className={cn(cls('root'), className)}
      data-animation={animation}
      data-revealed={revealed || undefined}
      data-motion={motionLevel}
      data-stagger={stagger || undefined}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

ScrollReveal.displayName = 'ScrollReveal'
