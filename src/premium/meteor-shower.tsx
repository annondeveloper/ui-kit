'use client'

import { forwardRef } from 'react'
import { MeteorShower as BaseMeteorShower, type MeteorShowerProps } from '../domain/meteor-shower'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumMeteorStyles = css`
  @layer premium {
    @scope (.ui-premium-meteor-shower) {
      :scope {
        display: contents;
      }

      /* Enhanced glow trails */
      :scope .ui-meteor-shower--meteor {
        inline-size: 2px;
        background: linear-gradient(
          to bottom,
          oklch(90% 0.15 270 / 0.9),
          oklch(75% 0.2 300 / 0.5),
          oklch(65% 0.15 330 / 0.2),
          transparent
        );
        filter: blur(0.3px);
      }

      /* Enhanced head glow with aurora colors */
      :scope .ui-meteor-shower--meteor::after {
        inline-size: 5px;
        block-size: 10px;
        background: oklch(92% 0.1 270 / 0.9);
        box-shadow:
          0 0 8px 3px oklch(75% 0.2 270 / 0.5),
          0 0 16px 6px oklch(70% 0.15 300 / 0.25),
          0 0 24px 8px oklch(65% 0.12 330 / 0.1);
      }

      /* Aurora color cycling on trails at motion >= 2 */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-meteor-shower--meteor {
        animation: ui-meteor-fall var(--meteor-duration, 2s) linear infinite,
                   ui-premium-meteor-aurora 6s ease-in-out infinite;
        animation-delay: var(--meteor-delay, 0s);
      }

      @keyframes ui-premium-meteor-aurora {
        0%, 100% {
          background: linear-gradient(to bottom, oklch(90% 0.15 270 / 0.9), oklch(75% 0.2 300 / 0.5), transparent);
        }
        33% {
          background: linear-gradient(to bottom, oklch(88% 0.18 300 / 0.9), oklch(72% 0.2 330 / 0.5), transparent);
        }
        66% {
          background: linear-gradient(to bottom, oklch(85% 0.15 200 / 0.9), oklch(70% 0.18 250 / 0.5), transparent);
        }
      }

      /* Secondary trailing particle */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-meteor-shower--meteor::before {
        content: '';
        position: absolute;
        inset-block-end: -4px;
        inset-inline-start: 50%;
        transform: translateX(-50%);
        inline-size: 1px;
        block-size: 50%;
        background: linear-gradient(to bottom, oklch(80% 0.12 270 / 0.3), transparent);
        border-radius: 9999px;
      }

      /* Motion 0: inherit base no-meteor behavior */
      :scope[data-motion="0"] .ui-meteor-shower--meteor {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-meteor-shower--meteor { display: none; }
      }
    }
  }
`

export const MeteorShower = forwardRef<HTMLDivElement, MeteorShowerProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-meteor-shower', premiumMeteorStyles)

    return (
      <div className="ui-premium-meteor-shower" data-motion={motionLevel} ref={ref}>
        <BaseMeteorShower motion={motionProp} {...rest} />
      </div>
    )
  }
)

MeteorShower.displayName = 'MeteorShower'
