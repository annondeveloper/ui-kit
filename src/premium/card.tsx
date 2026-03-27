'use client'

import { forwardRef, useRef, useCallback, type MouseEvent } from 'react'
import { Card as BaseCard, type CardProps } from '../components/card'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumCardStyles = css`
  @layer premium {
    @scope (.ui-premium-card) {
      :scope {
        position: relative;
        perspective: 800px;
        width: 100%;
        min-width: 0;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}

      /* Cursor-tracking aurora glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: var(--radius-lg, 0.75rem);
        background: radial-gradient(
          600px circle at var(--glow-x, 50%) var(--glow-y, 50%),
          oklch(65% 0.15 270 / 0.08),
          transparent 40%
        );
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 2;
      }
      :scope:hover::before {
        opacity: 1;
      }
      /* 3D tilt container */
      :scope > .ui-card {
        transition: transform 0.15s ease-out;
        transform-style: preserve-3d;
      }
    }
  }
`

export const Card = forwardRef<HTMLElement, CardProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(props.motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 280 })
  useStyles('premium-card', premiumCardStyles)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (motionLevel < 3) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const rect = wrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Aurora glow position
    const glowX = ((x / rect.width) * 100).toFixed(1)
    const glowY = ((y / rect.height) * 100).toFixed(1)
    wrapper.style.setProperty('--glow-x', `${glowX}%`)
    wrapper.style.setProperty('--glow-y', `${glowY}%`)

    // 3D tilt (max 6deg)
    const rotateX = ((y - centerY) / centerY * -6).toFixed(2)
    const rotateY = ((x - centerX) / centerX * 6).toFixed(2)
    const card = wrapper.querySelector('.ui-card') as HTMLElement | null
    if (card) {
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }
  }, [motionLevel])

  const handleMouseLeave = useCallback(() => {
    if (motionLevel < 3) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const card = wrapper.querySelector('.ui-card') as HTMLElement | null
    if (card) {
      card.style.transform = ''
    }
  }, [motionLevel])

  return (
    <div
      ref={wrapperRef}
      className="ui-premium-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <BaseCard ref={ref} {...props} />
    </div>
  )
})
Card.displayName = 'Card'
