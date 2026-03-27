'use client'

import { DiskMountBar as BaseDiskMountBar, type DiskMountBarProps } from '../domain/disk-mount-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumDiskMountBarStyles = css`
  @layer premium {
    @scope (.ui-premium-disk-mount-bar) {
      :scope {
        position: relative;
      }

      /* Fill bar grow-in animation */
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__fill {
        animation: ui-premium-dmb-grow 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) both;
        transform-origin: left center;
      }

      @keyframes ui-premium-dmb-grow {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }

      /* Stagger entries */
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry {
        animation: ui-premium-dmb-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(1) { animation-delay: 0ms; }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(2) { animation-delay: 60ms; }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(3) { animation-delay: 120ms; }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(4) { animation-delay: 180ms; }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(5) { animation-delay: 240ms; }
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__entry:nth-child(6) { animation-delay: 300ms; }

      @keyframes ui-premium-dmb-enter {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Critical bar glow */
      :scope .ui-disk-mount-bar__fill[data-level="critical"] {
        box-shadow: 0 0 8px 1px oklch(62% 0.22 25 / 0.35);
      }

      /* Hover glow on bars */
      :scope:not([data-motion="0"]) .ui-disk-mount-bar__fill:hover {
        filter: brightness(1.15);
      }

      /* Shimmer sweep across track */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-disk-mount-bar__track {
        position: relative;
        overflow: hidden;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-disk-mount-bar__track::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, oklch(100% 0 0 / 0.08) 50%, transparent 100%);
        animation: ui-premium-dmb-shimmer 2.5s ease-in-out 0.6s 1 both;
        pointer-events: none;
      }

      @keyframes ui-premium-dmb-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      /* Motion 0 overrides */
      :scope[data-motion="0"] .ui-disk-mount-bar__fill { animation: none; }
      :scope[data-motion="0"] .ui-disk-mount-bar__entry { animation: none; }
      :scope[data-motion="0"] .ui-disk-mount-bar__track::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-disk-mount-bar__fill { animation: none; }
        :scope .ui-disk-mount-bar__entry { animation: none; }
        :scope .ui-disk-mount-bar__track::after { display: none; }
      }
    }
  }
`

export function DiskMountBar({ motion: motionProp, ...rest }: DiskMountBarProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-disk-mount-bar', premiumDiskMountBarStyles)

  return (
    <div className="ui-premium-disk-mount-bar" data-motion={motionLevel}>
      <BaseDiskMountBar motion={motionProp} {...rest} />
    </div>
  )
}

DiskMountBar.displayName = 'DiskMountBar'
