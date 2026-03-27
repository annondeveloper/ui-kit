'use client'

import { Spotlight as BaseSpotlight, type SpotlightProps } from '../components/spotlight'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-spotlight) {
      :scope {
        display: contents;
      }

      /* Spring entrance for overlay */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-spotlight__overlay {
        animation: ui-premium-spotlight-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-spotlight-enter {
        from { opacity: 0; transform: scale(0.95) translateY(-8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      /* Aurora glow on search input focus */
      :scope:not([data-motion="0"]) .ui-spotlight__input:focus {
        box-shadow: 0 0 18px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
      }

      /* Hover lift on action items */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-spotlight__action {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background-color 0.15s;
        }
        :scope:not([data-motion="0"]) .ui-spotlight__action:hover {
          transform: translateX(4px);
        }
      }

      :scope[data-motion="0"] .ui-spotlight__overlay { animation: none; }
      :scope[data-motion="0"] .ui-spotlight__action { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-spotlight__overlay { animation: none; }
        :scope .ui-spotlight__action { transition: none; }
      }
    }
  }
`

export function Spotlight({ motion: motionProp, ...rest }: SpotlightProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-spotlight', premiumStyles)

  return (
    <div className="ui-premium-spotlight" data-motion={motionLevel}>
      <BaseSpotlight motion={motionProp} {...rest} />
    </div>
  )
}

Spotlight.displayName = 'Spotlight'
