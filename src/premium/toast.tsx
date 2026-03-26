'use client'

import { ToastProvider as BaseToastProvider, useToast, type ToastProviderProps, type ToastApi, type ToastOptions } from '../domain/toast'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumToastStyles = css`
  @layer premium {
    @scope (.ui-premium-toast-provider) {
      :scope {
        display: contents;
      }

      /* Spring-slide entrance with overshoot */
      :scope:not([data-motion="0"]) .ui-toast {
        animation: ui-premium-toast-spring 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-toast-spring {
        from { opacity: 0; transform: translateX(110%); }
        65% { transform: translateX(-4%); }
        to { opacity: 1; transform: translateX(0); }
      }

      /* Aurora glow per variant */
      :scope:not([data-motion="0"]) .ui-toast[data-variant="success"] {
        box-shadow: 0 0 16px -3px oklch(72% 0.19 155 / 0.3), var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
      }
      :scope:not([data-motion="0"]) .ui-toast[data-variant="warning"] {
        box-shadow: 0 0 16px -3px oklch(80% 0.18 85 / 0.3), var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
      }
      :scope:not([data-motion="0"]) .ui-toast[data-variant="error"] {
        box-shadow: 0 0 16px -3px oklch(65% 0.25 25 / 0.35), var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
      }
      :scope:not([data-motion="0"]) .ui-toast[data-variant="info"] {
        box-shadow: 0 0 16px -3px oklch(65% 0.2 270 / 0.3), var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
      }

      /* Shimmer dismiss sweep on close hover */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-toast__close:hover ~ .ui-toast__content::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 30%,
          oklch(100% 0 0 / 0.04) 50%,
          transparent 70%
        );
        animation: ui-premium-toast-shimmer 0.6s ease-out forwards;
        pointer-events: none;
      }
      @keyframes ui-premium-toast-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }

      /* Aurora ambient glow on default variant */
      :scope:not([data-motion="0"]) .ui-toast[data-variant="default"] {
        box-shadow: 0 0 12px -3px oklch(65% 0.15 270 / 0.2), var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3));
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-toast { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-toast { animation: none; }
        :scope .ui-toast__close:hover ~ .ui-toast__content::after { display: none; }
      }
    }
  }
`

export function ToastProvider({
  motion: motionProp,
  children,
  ...rest
}: ToastProviderProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-toast', premiumToastStyles)

  return (
    <div className="ui-premium-toast-provider" data-motion={motionLevel}>
      <BaseToastProvider motion={motionProp} {...rest}>
        {children}
      </BaseToastProvider>
    </div>
  )
}

ToastProvider.displayName = 'ToastProvider'

export { useToast, type ToastApi, type ToastOptions }
