'use client'

import { StorageBar as BaseStorageBar, type StorageBarProps } from '../domain/storage-bar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStorageBarStyles = css`
  @layer premium {
    @scope (.ui-premium-storage-bar) {
      :scope {
        position: relative;
      }

      /* Segment grow-in animation */
      :scope:not([data-motion="0"]) .ui-storage-bar__segment {
        animation: ui-premium-storage-grow 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
      }
      @keyframes ui-premium-storage-grow {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }

      /* Hover glow on segments */
      :scope:not([data-motion="0"]) .ui-storage-bar__segment:hover {
        filter: brightness(1.2);
        box-shadow: 0 0 8px oklch(100% 0 0 / 0.15);
      }

      /* Shimmer sweep across bar */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-storage-bar__track::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          oklch(100% 0 0 / 0.08) 50%,
          transparent 100%
        );
        animation: ui-premium-storage-shimmer 2.5s ease-in-out 0.7s 1 both;
        pointer-events: none;
      }
      @keyframes ui-premium-storage-shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); opacity: 0; }
      }

      :scope[data-motion="0"] .ui-storage-bar__segment { animation: none; }
      :scope[data-motion="0"] .ui-storage-bar__track::after { display: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-storage-bar__segment { animation: none; }
        :scope .ui-storage-bar__track::after { display: none; }
      }
    }
  }
`

export function StorageBar({ motion: motionProp, ...rest }: StorageBarProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-storage-bar', premiumStorageBarStyles)

  return (
    <div className="ui-premium-storage-bar" data-motion={motionLevel}>
      <BaseStorageBar motion={motionProp} {...rest} />
    </div>
  )
}

StorageBar.displayName = 'StorageBar'
