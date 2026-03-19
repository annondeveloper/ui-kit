'use client'

import type React from 'react'
import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '../utils'

export interface ScrollRevealProps {
  /** Content to reveal on scroll. */
  children: React.ReactNode
  /** Animation style to apply when the element enters the viewport. */
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'none'
  /** Delay in milliseconds before the animation starts. */
  delay?: number
  /** Duration of the animation in milliseconds. */
  duration?: number
  /** Fraction of the element that must be visible before triggering (0-1). */
  threshold?: number
  /** If true, animate only on first appearance; if false, re-animate on every entry. */
  once?: boolean
  /** Stagger index for child elements (sets --stagger-index CSS variable). */
  staggerIndex?: number
  className?: string
}

const animationMap: Record<string, string> = {
  'fade-up': 'ui-fade-up',
  'fade-in': 'ui-fade-in',
  'slide-left': 'ui-slide-left',
  'slide-right': 'ui-slide-right',
  'scale': 'ui-scale',
}

/**
 * @description A scroll-driven animation wrapper that uses IntersectionObserver and
 * CSS animations (compositor-thread, zero jank). Supports fade, slide, and scale
 * animations with configurable delay, duration, threshold, and stagger support.
 * Respects prefers-reduced-motion by showing content immediately.
 */
export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  once = true,
  staggerIndex,
  className,
}: ScrollRevealProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once && observerRef.current && ref.current) {
            observerRef.current.unobserve(ref.current)
            observerRef.current = null
          }
        } else if (!once) {
          setVisible(false)
        }
      }
    },
    [once],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If reduced motion or no animation, show immediately
    if (reducedMotion || animation === 'none') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: Math.max(0, Math.min(1, threshold)),
    })
    observerRef.current = observer
    observer.observe(el)

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [animation, threshold, reducedMotion, handleIntersection])

  const noAnimation = reducedMotion || animation === 'none'
  const animName = animationMap[animation] ?? ''

  const totalDelay = staggerIndex !== undefined
    ? delay + staggerIndex * 60 // default stagger of 60ms per index
    : delay

  const style: React.CSSProperties = noAnimation
    ? {}
    : {
        opacity: visible ? 1 : 0,
        animationName: visible ? animName : 'none',
        animationDuration: `${duration}ms`,
        animationDelay: `${totalDelay}ms`,
        animationFillMode: 'both',
        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        ...(staggerIndex !== undefined ? { '--stagger-index': staggerIndex } as React.CSSProperties : {}),
      }

  return (
    <div ref={ref} className={cn(className)} style={style}>
      {children}
    </div>
  )
}
