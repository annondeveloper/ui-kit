'use client'

import { useRef, useEffect, useCallback, type ReactNode } from 'react'
import { Dialog as BaseDialog, type DialogProps } from '../components/dialog'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumDialogStyles = css`
  @layer premium {
    @scope (.ui-premium-dialog) {
      :scope {
        display: contents;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring scale entrance — dramatic overshoot */
      :scope dialog[open] {
        animation: ui-premium-dialog-enter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-dialog-enter {
        from {
          opacity: 0;
          transform: scale(0.85) translateY(20px);
          filter: blur(4px);
        }
        50% {
          opacity: 1;
          filter: blur(0);
        }
        70% {
          transform: scale(1.02) translateY(-3px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
          filter: blur(0);
        }
      }

      /* Aurora shimmer along top edge */
      :scope dialog[open]::before {
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 15%,
          oklch(70% 0.18 300 / 0.5) 35%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.25) c h / 0.9) 50%,
          oklch(70% 0.18 200 / 0.5) 65%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.2) c h / 0.7) 85%,
          transparent 100%
        );
        block-size: 2px;
        animation: ui-premium-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-shimmer {
        from { opacity: 0.6; }
        to { opacity: 1; }
      }

      /* Enhanced aurora glow */
      :scope dialog[open] {
        box-shadow:
          0 24px 80px oklch(0% 0 0 / 0.5),
          0 8px 32px oklch(0% 0 0 / 0.3),
          0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 80px -16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.18),
          0 0 120px -24px oklch(from var(--brand, oklch(65% 0.2 270)) calc(l - 0.1) c h / 0.1),
          inset 0 1px 0 oklch(100% 0 0 / 0.08);
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
        background: oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h / 0.5);
        animation: ui-premium-particle-float 5s ease-in-out infinite;
      }
      @keyframes ui-premium-particle-float {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
        50% { transform: translateY(-30px) scale(1.5); opacity: 0.7; }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] dialog[open] {
        animation: none;
      }
      :scope[data-motion="0"] dialog[open]::before {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope dialog[open] { animation: none; }
        :scope dialog[open]::before { animation: none; }
        .ui-premium-dialog__particle { animation: none; }
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
