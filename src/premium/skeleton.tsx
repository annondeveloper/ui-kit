'use client'

import { forwardRef } from 'react'
import { Skeleton as BaseSkeleton, type SkeletonProps } from '../components/skeleton'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumSkeletonStyles = css`
  @layer premium {
    @scope (.ui-premium-skeleton) {
      :scope {
        display: contents;
      }

      /* ── Aurora brand-tinted shimmer gradient ── */
      :scope .ui-skeleton::after,
      :scope .ui-skeleton__line::after {
        background: linear-gradient(
          110deg,
          transparent 20%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 35%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.14) 45%,
          oklch(from var(--aurora-2, oklch(70% 0.15 330)) l c h / 0.18) 50%,
          oklch(from var(--aurora-1, oklch(70% 0.15 270)) l c h / 0.14) 55%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06) 65%,
          transparent 80%
        ) !important;
        background-size: 200% 100% !important;
      }

      /* ── Aurora ambient glow on skeleton blocks ── */
      :scope .ui-skeleton {
        box-shadow:
          0 0 20px -6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
          inset 0 1px 0 oklch(100% 0 0 / 0.04);
      }

      /* ── Spring-fade transition to content (applied via data-loaded) ── */
      :scope[data-loaded] .ui-skeleton,
      :scope[data-loaded] .ui-skeleton__line {
        animation: ui-premium-skeleton-spring-fade 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes ui-premium-skeleton-spring-fade {
        0% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(0.98);
        }
        100% {
          opacity: 0;
          transform: scale(0.96);
        }
      }

      /* ── Motion level 0: no effects ── */
      :scope[data-motion="0"] .ui-skeleton {
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-skeleton::after,
      :scope[data-motion="0"] .ui-skeleton__line::after {
        display: none;
      }
      :scope[data-motion="0"][data-loaded] .ui-skeleton,
      :scope[data-motion="0"][data-loaded] .ui-skeleton__line {
        animation: none;
        opacity: 0;
      }

      /* ── Motion level 1: glow only, no shimmer ── */
      :scope[data-motion="1"] .ui-skeleton::after,
      :scope[data-motion="1"] .ui-skeleton__line::after {
        display: none;
      }

      /* ── Motion level 2: slower shimmer ── */
      :scope[data-motion="2"] .ui-skeleton::after,
      :scope[data-motion="2"] .ui-skeleton__line::after {
        animation-duration: 3s;
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-skeleton::after,
        :scope .ui-skeleton__line::after {
          display: none !important;
        }
        :scope[data-loaded] .ui-skeleton,
        :scope[data-loaded] .ui-skeleton__line {
          animation: none !important;
          opacity: 0;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-skeleton {
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export interface PremiumSkeletonProps extends SkeletonProps {
  loaded?: boolean
}

export const Skeleton = forwardRef<HTMLDivElement, PremiumSkeletonProps>(
  ({ motion: motionProp, loaded = false, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-skeleton', premiumSkeletonStyles)

    return (
      <div
        className="ui-premium-skeleton"
        data-motion={motionLevel}
        {...(loaded ? { 'data-loaded': '' } : {})}
      >
        <BaseSkeleton ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Skeleton.displayName = 'Skeleton'
