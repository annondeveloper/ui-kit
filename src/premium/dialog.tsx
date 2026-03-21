'use client'

import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { Dialog as BaseDialog, type DialogProps } from '../components/dialog'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDialogStyles = css`
  @layer premium {
    @scope (.ui-premium-dialog) {
      :scope {
        display: contents;
      }
      /* Spring scale entrance overrides */
      :scope dialog[open] {
        animation: ui-premium-dialog-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-dialog-enter {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(12px);
        }
        60% {
          opacity: 1;
          transform: scale(1.02) translateY(-2px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      /* Backdrop particles container */
      .ui-premium-dialog__particles {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 999;
        overflow: hidden;
      }
      .ui-premium-dialog__particle {
        position: absolute;
        inline-size: 3px;
        block-size: 3px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(70% 0.12 270 / 0.4);
        animation: ui-premium-particle-float 4s ease-in-out infinite;
      }
      @keyframes ui-premium-particle-float {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
        50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
      }
      /* Motion 0: no animation */
      :scope[data-motion="0"] dialog[open] {
        animation: none;
      }
    }
  }
`

function BackdropParticles({ count = 12 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    left: `${(i / count) * 100 + Math.random() * 8}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    size: `${2 + Math.random() * 2}px`,
  }))

  return (
    <div className="ui-premium-dialog__particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="ui-premium-dialog__particle"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            inlineSize: p.size,
            blockSize: p.size,
          }}
        />
      ))}
    </div>
  )
}

export function Dialog({
  motion: motionProp,
  children,
  ...rest
}: DialogProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-dialog', premiumDialogStyles)

  return (
    <div className="ui-premium-dialog" data-motion={motionLevel}>
      {rest.open && motionLevel >= 3 && <BackdropParticles />}
      <BaseDialog motion={motionProp} {...rest}>
        {children}
      </BaseDialog>
    </div>
  )
}

Dialog.displayName = 'Dialog'
