'use client'

import { GeoMap as BaseGeoMap, type GeoMapProps } from '../domain/geo-map'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumGeoMapStyles = css`
  @layer premium {
    @scope (.ui-premium-geo-map) {
      :scope {
        position: relative;
      }

      /* Aurora glow on data points */
      :scope .ui-geo-map__point {
        filter: drop-shadow(0 0 6px oklch(70% 0.2 270 / 0.5));
        transition: filter 0.3s ease-out;
      }
      :scope .ui-geo-map__point:hover {
        filter: drop-shadow(0 0 14px oklch(75% 0.25 270 / 0.7));
      }
      :scope .ui-geo-map__point[data-status="ok"] {
        filter: drop-shadow(0 0 8px oklch(72% 0.19 155 / 0.5));
      }
      :scope .ui-geo-map__point[data-status="critical"] {
        filter: drop-shadow(0 0 8px oklch(65% 0.25 25 / 0.6));
      }

      /* Spring-pulse on connections */
      :scope:not([data-motion="0"]) .ui-geo-map__connection {
        animation: ui-premium-geo-pulse 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
      }
      @keyframes ui-premium-geo-pulse {
        0%   { stroke-opacity: 0.25; stroke-width: 1.5px; }
        40%  { stroke-opacity: 0.6;  stroke-width: 2.5px; }
        70%  { stroke-opacity: 0.35; stroke-width: 1.8px; }
        100% { stroke-opacity: 0.25; stroke-width: 1.5px; }
      }

      /* Point entrance stagger */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-geo-map__point {
        animation: ui-premium-geo-point-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-geo-point-enter {
        from { opacity: 0; transform: scale(0); }
        70%  { transform: scale(1.15); }
        to   { opacity: 1; transform: scale(1); }
      }

      /* Aurora ambient overlay */
      :scope::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 30% 40%, oklch(65% 0.15 270 / 0.06), transparent 60%),
                    radial-gradient(ellipse at 70% 60%, oklch(70% 0.12 200 / 0.05), transparent 60%);
        pointer-events: none;
        border-radius: inherit;
      }

      :scope[data-motion="0"] .ui-geo-map__connection,
      :scope[data-motion="0"] .ui-geo-map__point {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-geo-map__connection,
        :scope .ui-geo-map__point { animation: none; }
      }
    }
  }
`

export function GeoMap({ motion: motionProp, ...rest }: GeoMapProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-geo-map', premiumGeoMapStyles)

  return (
    <div className="ui-premium-geo-map" data-motion={motionLevel}>
      <BaseGeoMap motion={motionProp} {...rest} />
    </div>
  )
}

GeoMap.displayName = 'GeoMap'
