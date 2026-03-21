'use client'

import { forwardRef, useRef, useCallback, type MouseEvent } from 'react'
import { Button as BaseButton, type ButtonProps } from '../components/button'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useEntrance } from '../core/motion/use-entrance'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumButtonStyles = css`
  @layer premium {
    @scope (.ui-premium-button) {
      :scope {
        position: relative;
        display: inline-flex;
        overflow: hidden;
      }
      /* Cursor glow */
      :scope::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), oklch(100% 0 0 / 0.1), transparent 60%);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
        border-radius: inherit;
        z-index: 1;
      }
      :scope:hover::before {
        opacity: 1;
      }
      /* Ripple */
      .ui-premium-button__ripple {
        position: absolute;
        border-radius: 50%;
        background: oklch(100% 0 0 / 0.2);
        transform: scale(0);
        animation: ui-premium-ripple 0.6s ease-out forwards;
        pointer-events: none;
        z-index: 2;
      }
      @keyframes ui-premium-ripple {
        to { transform: scale(4); opacity: 0; }
      }
      /* Particle burst */
      .ui-premium-button__particle {
        position: absolute;
        inline-size: 4px;
        block-size: 4px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(80% 0.15 270);
        pointer-events: none;
        z-index: 3;
      }
    }
  }
`

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const motionLevel = useMotionLevel(props.motion)
  useEntrance(wrapperRef, motionLevel >= 2 ? 'fade-up' : 'none', { duration: 200 })
  useStyles('premium-button', premiumButtonStyles)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (motionLevel < 3) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
    ;(e.currentTarget as HTMLElement).style.setProperty('--glow-x', `${x}%`)
    ;(e.currentTarget as HTMLElement).style.setProperty('--glow-y', `${y}%`)
  }, [motionLevel])

  const spawnParticles = useCallback((x: number, y: number, container: HTMLElement) => {
    const count = 6
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span')
      particle.className = 'ui-premium-button__particle'
      const angle = (Math.PI * 2 / count) * i
      const distance = 30 + Math.random() * 20
      const dx = Math.cos(angle) * distance
      const dy = Math.sin(angle) * distance
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out'
      particle.style.opacity = '1'
      container.appendChild(particle)
      // Force reflow then animate
      particle.getBoundingClientRect()
      particle.style.transform = `translate(${dx}px, ${dy}px)`
      particle.style.opacity = '0'
      particle.addEventListener('transitionend', () => particle.remove(), { once: true })
    }
  }, [])

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Ripple at motion level 2+
    if (motionLevel >= 2) {
      const ripple = document.createElement('span')
      ripple.className = 'ui-premium-button__ripple'
      const size = Math.max(rect.width, rect.height)
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x - size / 2}px`
      ripple.style.top = `${y - size / 2}px`
      target.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    }

    // Particles at motion level 3
    if (motionLevel >= 3 && wrapperRef.current) {
      spawnParticles(x, y, wrapperRef.current)
    }

    props.onClick?.(e)
  }, [motionLevel, props.onClick, spawnParticles])

  return (
    <div ref={wrapperRef} className="ui-premium-button" onMouseMove={handleMouseMove}>
      <BaseButton ref={ref} {...props} onClick={handleClick} />
    </div>
  )
})
Button.displayName = 'Button'
