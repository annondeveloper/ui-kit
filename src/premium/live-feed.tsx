'use client'

import { LiveFeed as BaseLiveFeed, type LiveFeedProps } from '../domain/live-feed'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { sharedPremiumCSS } from './shared-effects'

const premiumLiveFeedStyles = css`
  @layer premium {
    @scope (.ui-premium-live-feed) {
      :scope {
        position: relative;
      }

      /* Shared premium effects */
      ${sharedPremiumCSS}


      /* Spring-slide entrance for new items */
      :scope:not([data-motion="0"]) .ui-live-feed__item {
        animation: ui-premium-feed-slide 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-feed-slide {
        from { opacity: 0; transform: translateX(-16px) scale(0.97); }
        65%  { transform: translateX(3px) scale(1.01); }
        to   { opacity: 1; transform: translateX(0) scale(1); }
      }

      /* Aurora glow on newest entry */
      :scope .ui-live-feed__item:first-child {
        box-shadow: 0 0 12px oklch(65% 0.18 270 / 0.2);
        transition: box-shadow 0.4s ease-out;
      }
      :scope .ui-live-feed__item:first-child::before {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        inset-block: 4px;
        inline-size: 3px;
        border-radius: 2px;
        background: oklch(65% 0.2 270 / 0.6);
      }

      /* Shimmer loading state */
      :scope:not([data-motion="0"]) .ui-live-feed__loader {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]) .ui-live-feed__loader::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 25%,
          oklch(70% 0.15 270 / 0.12) 50%,
          transparent 75%
        );
        background-size: 200% 100%;
        animation: ui-premium-feed-shimmer 1.5s ease-in-out infinite;
      }
      @keyframes ui-premium-feed-shimmer {
        0%   { background-position: 100% 50%; }
        100% { background-position: -100% 50%; }
      }

      /* Pause indicator glow */
      :scope[data-paused="true"]::after {
        content: '';
        position: absolute;
        inset-block-start: 0;
        inset-inline: 0;
        block-size: 2px;
        background: oklch(80% 0.18 85 / 0.5);
        border-radius: 1px;
      }

      /* Fade old items at the bottom */
      :scope .ui-live-feed__item:nth-last-child(-n+2) {
        opacity: 0.7;
      }

      :scope[data-motion="0"] .ui-live-feed__item,
      :scope[data-motion="0"] .ui-live-feed__loader::after {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-live-feed__item { animation: none; }
        :scope .ui-live-feed__loader::after { animation: none; }
      }
    }
  }
`

export function LiveFeed({ motion: motionProp, ...rest }: LiveFeedProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-live-feed', premiumLiveFeedStyles)

  return (
    <div className="ui-premium-live-feed" data-motion={motionLevel}>
      <BaseLiveFeed motion={motionProp} {...rest} />
    </div>
  )
}

LiveFeed.displayName = 'LiveFeed'
