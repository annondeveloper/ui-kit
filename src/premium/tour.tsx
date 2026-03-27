'use client'

import { Tour as BaseTour, type TourProps } from '../domain/tour'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTourStyles = css`
  @layer premium {
    @scope (.ui-premium-tour) {
      :scope {
        position: relative;
      }

      /* Aurora glow on tooltip card */
      :scope:not([data-motion="0"]) .ui-tour__tooltip {
        box-shadow:
          0 4px 24px oklch(0% 0 0 / 0.4),
          0 0 60px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12),
          0 0 0 1px oklch(75% 0.1 270 / 0.1);
      }

      /* Spring entrance for tooltip */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tour__tooltip {
        transition: top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                    opacity 0.2s ease;
      }

      /* Spotlight pulse */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tour__spotlight {
        filter: drop-shadow(0 0 12px oklch(65% 0.2 270 / 0.3));
      }

      /* Step dot glow for active */
      :scope:not([data-motion="0"]) .ui-tour__dot[data-active] {
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5);
        transition: background 0.2s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
      }

      /* Button hover aurora */
      :scope:not([data-motion="0"]) .ui-tour__btn[data-primary]:hover {
        box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        transition: background 0.15s ease, box-shadow 0.25s ease;
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-tour__tooltip { transition: none; }
      :scope[data-motion="0"] .ui-tour__dot { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-tour__tooltip { transition: none; }
        :scope .ui-tour__dot { transition: none; }
      }
    }
  }
`

export function Tour({ motion: motionProp, ...rest }: TourProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-tour', premiumTourStyles)

  return (
    <div className="ui-premium-tour" data-motion={motionLevel}>
      <BaseTour motion={motionProp} {...rest} />
    </div>
  )
}

Tour.displayName = 'Tour'
