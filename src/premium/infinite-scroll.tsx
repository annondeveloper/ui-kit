'use client'

import { InfiniteScroll as BaseInfiniteScroll, type InfiniteScrollProps } from '../domain/infinite-scroll'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumInfiniteScrollStyles = css`
  @layer premium {
    @scope (.ui-premium-infinite-scroll) {
      :scope {
        position: relative;
      }

      /* Spring-entrance per item */
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item {
        animation: ui-premium-scroll-item-enter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-scroll-item-enter {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        65%  { transform: translateY(-3px) scale(1.01); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Stagger delay for items */
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item:nth-child(2) { animation-delay: 50ms; }
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item:nth-child(3) { animation-delay: 100ms; }
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item:nth-child(4) { animation-delay: 150ms; }
      :scope:not([data-motion="0"]) .ui-infinite-scroll__item:nth-child(5) { animation-delay: 200ms; }

      /* Aurora loading glow */
      :scope .ui-infinite-scroll__loader {
        position: relative;
      }
      :scope:not([data-motion="0"]) .ui-infinite-scroll__loader::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: var(--radius-md, 0.5rem);
        background: linear-gradient(
          90deg,
          oklch(65% 0.18 270 / 0.15),
          oklch(70% 0.15 200 / 0.2),
          oklch(65% 0.18 270 / 0.15)
        );
        background-size: 200% 100%;
        animation: ui-premium-scroll-loader-glow 1.5s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
      }
      @keyframes ui-premium-scroll-loader-glow {
        0%   { background-position: 100% 50%; }
        100% { background-position: -100% 50%; }
      }

      /* Fade edge at top/bottom for seamless feel */
      :scope::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        block-size: 32px;
        inset-block-end: 0;
        background: linear-gradient(to top, oklch(15% 0.02 270 / 0.3), transparent);
        pointer-events: none;
        border-radius: inherit;
      }

      :scope[data-motion="0"] .ui-infinite-scroll__item,
      :scope[data-motion="0"] .ui-infinite-scroll__loader::before {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-infinite-scroll__item { animation: none; }
        :scope .ui-infinite-scroll__loader::before { animation: none; }
      }
    }
  }
`

export function InfiniteScroll({ ...rest }: InfiniteScrollProps) {
  const motionLevel = useMotionLevel()
  useStyles('premium-infinite-scroll', premiumInfiniteScrollStyles)

  return (
    <div className="ui-premium-infinite-scroll" data-motion={motionLevel}>
      <BaseInfiniteScroll {...rest} />
    </div>
  )
}

InfiniteScroll.displayName = 'InfiniteScroll'
