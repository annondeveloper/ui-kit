'use client'

import { motion, useReducedMotion } from 'framer-motion'

export interface SuccessCheckmarkProps {
  /** Size of the SVG in pixels. */
  size?: number
  className?: string
}

/**
 * @description An animated success checkmark SVG with circle and path draw animations.
 * Uses Framer Motion spring physics. Respects prefers-reduced-motion.
 */
export function SuccessCheckmark({ size = 20, className }: SuccessCheckmarkProps) {
  const reduced = useReducedMotion()

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      initial={reduced ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.circle
        cx="10"
        cy="10"
        r="9"
        stroke="hsl(var(--status-ok))"
        strokeWidth="1.5"
        fill="none"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
      <motion.path
        d="M6 10l2.5 2.5L14 7.5"
        stroke="hsl(var(--status-ok))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}
