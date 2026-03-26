'use client'

import { forwardRef } from 'react'
import { Rating as BaseRating, type RatingProps } from '../components/rating'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'


// ─── Premium styles ──────────────────────────────────────────────────────────

const premiumRatingStyles = css`
  @layer premium {
    @scope (.ui-premium-rating) {
      :scope {
        display: contents;
      }

      /* ── Spring-scale on star hover ── */
      :scope .ui-rating__star[data-hover="true"] {
        animation: ui-premium-star-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: scale(1.18);
      }
      @keyframes ui-premium-star-bounce {
        0%   { transform: scale(1); }
        50%  { transform: scale(1.25); }
        100% { transform: scale(1.18); }
      }

      /* ── Aurora glow trail on filled stars ── */
      :scope .ui-rating__star[data-state="full"] {
        filter: drop-shadow(0 0 6px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.4))
                drop-shadow(0 0 12px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.2));
        transition: filter 0.3s var(--ease-out, ease-out), transform 0.2s var(--ease-out, ease-out);
      }
      :scope .ui-rating__star[data-state="half"] {
        filter: drop-shadow(0 0 4px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.25));
      }
      :scope .ui-rating__star[data-state="empty"] {
        filter: none;
        transition: filter 0.2s var(--ease-out, ease-out), transform 0.2s var(--ease-out, ease-out);
      }

      /* ── Particle burst on max rating ── */
      :scope .ui-rating[data-value="max"]::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: var(--radius-md, 0.375rem);
        pointer-events: none;
        animation: ui-premium-rating-burst 0.6s ease-out forwards;
        background: radial-gradient(
          circle,
          oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.3) 0%,
          oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0) 70%
        );
      }
      @keyframes ui-premium-rating-burst {
        0%   { opacity: 0; transform: scale(0.5); }
        40%  { opacity: 1; }
        100% { opacity: 0; transform: scale(1.8); }
      }

      /* ── Staggered glow cascade for filled stars ── */
      :scope .ui-rating__star[data-state="full"]:nth-child(1) { transition-delay: 0ms; }
      :scope .ui-rating__star[data-state="full"]:nth-child(2) { transition-delay: 30ms; }
      :scope .ui-rating__star[data-state="full"]:nth-child(3) { transition-delay: 60ms; }
      :scope .ui-rating__star[data-state="full"]:nth-child(4) { transition-delay: 90ms; }
      :scope .ui-rating__star[data-state="full"]:nth-child(5) { transition-delay: 120ms; }

      /* ── Motion level 0: no animation ── */
      :scope[data-motion="0"] .ui-rating__star {
        animation: none !important;
        filter: none !important;
        transition: none !important;
      }

      /* ── Motion level 1: subtle glow, no spring ── */
      :scope[data-motion="1"] .ui-rating__star[data-hover="true"] {
        animation: none;
        transform: scale(1.05);
      }
      :scope[data-motion="1"] .ui-rating__star[data-state="full"] {
        filter: drop-shadow(0 0 4px oklch(from var(--status-warning, oklch(75% 0.15 80)) l c h / 0.2));
      }

      /* ── Motion level 2: conservative spring ── */
      :scope[data-motion="2"] .ui-rating__star[data-hover="true"] {
        animation: ui-premium-star-bounce-soft 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
        transform: scale(1.1);
      }
      @keyframes ui-premium-star-bounce-soft {
        0%   { transform: scale(1); }
        60%  { transform: scale(1.14); }
        100% { transform: scale(1.1); }
      }

      /* ── prefers-reduced-motion ── */
      @media (prefers-reduced-motion: reduce) {
        :scope .ui-rating__star {
          animation: none !important;
          filter: none !important;
          transition: none !important;
        }
      }

      /* ── Forced colors ── */
      @media (forced-colors: active) {
        :scope .ui-rating__star {
          filter: none !important;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-rating', premiumRatingStyles)

    return (
      <div className="ui-premium-rating" data-motion={motionLevel}>
        <BaseRating ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

Rating.displayName = 'Rating'
