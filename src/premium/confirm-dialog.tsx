'use client'

import { ConfirmDialog as BaseConfirmDialog, type ConfirmDialogProps } from '../components/confirm-dialog'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumConfirmDialogStyles = css`
  @layer premium {
    @scope (.ui-premium-confirm-dialog) {
      :scope {
        display: contents;
      }

      /* Spring scale entrance on the dialog panel */
      :scope:not([data-motion="0"]) .ui-confirm-dialog {
        animation: ui-premium-confirm-scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-confirm-scale {
        from {
          opacity: 0;
          transform: scale(0.92);
        }
        70% {
          transform: scale(1.02);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Aurora backdrop glow */
      :scope:not([data-motion="0"]) ::backdrop {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
        box-shadow: inset 0 0 120px 40px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      }

      /* Shimmer on action buttons */
      :scope .ui-confirm-dialog__actions button {
        background-size: 200% 100%;
        background-image: linear-gradient(
          110deg,
          transparent 0%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1) 45%,
          transparent 55%,
          transparent 100%
        );
        animation: ui-premium-confirm-btn-shimmer 3s ease-in-out infinite alternate;
      }
      @keyframes ui-premium-confirm-btn-shimmer {
        from { background-position: 100% 0; }
        to { background-position: 0% 0; }
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-confirm-dialog,
      :scope[data-motion="0"] .ui-confirm-dialog__actions button {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-confirm-dialog { animation: none; }
        :scope .ui-confirm-dialog__actions button { animation: none; }
      }
    }
  }
`

export function ConfirmDialog({ motion: motionProp, ...rest }: ConfirmDialogProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-confirm-dialog', premiumConfirmDialogStyles)

  return (
    <span className="ui-premium-confirm-dialog" data-motion={motionLevel}>
      <BaseConfirmDialog motion={motionProp} {...rest} />
    </span>
  )
}
