'use client'

import { SeverityTimeline as BaseSeverityTimeline, type SeverityTimelineProps } from '../domain/severity-timeline'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumSeverityTimelineStyles = css`
  @layer premium {
    @scope (.ui-premium-severity-timeline) {
      :scope {
        display: contents;
      }

      /* Aurora glow per severity dot */
      :scope .ui-severity-timeline__dot[data-severity="info"] {
        box-shadow: 0 0 10px 1px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.45),
                    0 0 22px 2px oklch(from var(--status-info, oklch(65% 0.2 270)) l c h / 0.15);
      }
      :scope .ui-severity-timeline__dot[data-severity="warning"] {
        box-shadow: 0 0 10px 1px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.45),
                    0 0 22px 2px oklch(from var(--status-warning, oklch(80% 0.18 85)) l c h / 0.15);
      }
      :scope .ui-severity-timeline__dot[data-severity="critical"] {
        box-shadow: 0 0 10px 1px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.45),
                    0 0 22px 2px oklch(from var(--status-critical, oklch(62% 0.22 25)) l c h / 0.15);
      }
      :scope .ui-severity-timeline__dot[data-severity="ok"] {
        box-shadow: 0 0 10px 1px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.45),
                    0 0 22px 2px oklch(from var(--status-ok, oklch(72% 0.19 155)) l c h / 0.15);
      }

      /* Spring-expand for description reveal */
      :scope:not([data-motion="0"]) .ui-severity-timeline__description[data-expanded="true"] {
        animation: ui-premium-timeline-expand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: top;
      }
      @keyframes ui-premium-timeline-expand {
        0% { opacity: 0; transform: scaleY(0.6) translateY(-0.5rem); }
        60% { transform: scaleY(1.03); }
        100% { opacity: 1; transform: scaleY(1) translateY(0); }
      }

      /* Staggered entrance for timeline items */
      :scope:not([data-motion="0"]) .ui-severity-timeline__item {
        animation: ui-premium-timeline-item-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--item-index, 0) * 80ms);
      }
      :scope:not([data-motion="0"]) .ui-severity-timeline__item:nth-child(1) { --item-index: 0; }
      :scope:not([data-motion="0"]) .ui-severity-timeline__item:nth-child(2) { --item-index: 1; }
      :scope:not([data-motion="0"]) .ui-severity-timeline__item:nth-child(3) { --item-index: 2; }
      :scope:not([data-motion="0"]) .ui-severity-timeline__item:nth-child(4) { --item-index: 3; }
      :scope:not([data-motion="0"]) .ui-severity-timeline__item:nth-child(5) { --item-index: 4; }

      @keyframes ui-premium-timeline-item-enter {
        0% { opacity: 0; transform: translateX(-0.75rem); }
        100% { opacity: 1; transform: translateX(0); }
      }

      /* Critical dot pulsing glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-severity-timeline__dot[data-severity="critical"] {
        animation: ui-premium-timeline-critical-pulse 2s ease-in-out infinite;
      }
      @keyframes ui-premium-timeline-critical-pulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }

      /* Motion 0: no effects */
      :scope[data-motion="0"] .ui-severity-timeline__dot { box-shadow: none; }
      :scope[data-motion="0"] .ui-severity-timeline__item { animation: none; }
      :scope[data-motion="0"] .ui-severity-timeline__description { animation: none; }

      /* Motion 1: glow only */
      :scope[data-motion="1"] .ui-severity-timeline__item { animation: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-severity-timeline__item,
        :scope .ui-severity-timeline__description,
        :scope .ui-severity-timeline__dot {
          animation: none !important;
          filter: none !important;
        }
      }

      @media (forced-colors: active) {
        :scope .ui-severity-timeline__dot { box-shadow: none; }
      }
    }
  }
`

export function SeverityTimeline({ motion: motionProp, ...rest }: SeverityTimelineProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-severity-timeline', premiumSeverityTimelineStyles)

  return (
    <div className="ui-premium-severity-timeline" data-motion={motionLevel}>
      <BaseSeverityTimeline motion={motionProp} {...rest} />
    </div>
  )
}

SeverityTimeline.displayName = 'SeverityTimeline'
