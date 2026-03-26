'use client'

import { ShimmerButton as BaseShimmerButton, type ShimmerButtonProps } from '../domain/shimmer-button'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumShimmerButtonStyles = css`
  @layer premium {
    @scope (.ui-premium-shimmer-button) {
      :scope {
        display: inline-flex;
      }

      /* Enhanced shimmer — faster, multi-layer */
      :scope:not([data-motion="0"]) .ui-shimmer-button::before {
        animation: ui-shimmer-rotate 2s linear infinite;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          transparent 40%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6) 55%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.4) 70%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.3) 80%,
          transparent 90%,
          transparent 100%
        );
      }

      /* Aurora border glow */
      :scope .ui-shimmer-button {
        box-shadow:
          0 0 12px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3),
          0 0 28px -6px oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.12);
        transition: box-shadow 0.3s var(--ease-out, ease-out),
                    transform 0.15s var(--ease-out, ease-out);
      }

      /* Enhanced hover glow */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-shimmer-button:hover:not(:disabled) {
          box-shadow:
            0 0 20px -3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.45),
            0 0 40px -6px oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.2);
        }
      }

      /* Spring-press on active */
      :scope:not([data-motion="0"]) .ui-shimmer-button:active:not(:disabled) {
        transform: scale(0.96);
        transition: transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Spring-scale entrance */
      :scope:not([data-motion="0"]) .ui-shimmer-button {
        animation: ui-premium-shimmer-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-shimmer-enter {
        0% { opacity: 0; transform: scale(0.88); }
        60% { transform: scale(1.04); }
        100% { opacity: 1; transform: scale(1); }
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-shimmer-button {
        box-shadow: none;
        animation: none;
        transition: none;
      }

      /* Motion 1: glow only, no spring */
      :scope[data-motion="1"] .ui-shimmer-button {
        animation: none;
      }
      :scope[data-motion="1"] .ui-shimmer-button:active:not(:disabled) {
        transform: translateY(0);
        transition: transform 0.1s ease-out;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-shimmer-button {
          animation: none !important;
          box-shadow: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-shimmer-button { box-shadow: none; }
      }
    }
  }
`

export function ShimmerButton({ motion: motionProp, ...rest }: ShimmerButtonProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-shimmer-button', premiumShimmerButtonStyles)

  return (
    <span className="ui-premium-shimmer-button" data-motion={motionLevel}>
      <BaseShimmerButton motion={motionProp} {...rest} />
    </span>
  )
}

ShimmerButton.displayName = 'ShimmerButton'
