'use client'

import { forwardRef } from 'react'
import { Avatar as BaseAvatar, type AvatarProps } from '../components/avatar'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

interface PremiumAvatarProps extends AvatarProps {
  motion?: 0 | 1 | 2 | 3
}

const premiumAvatarStyles = css`
  @layer premium {
    @scope (.ui-premium-avatar) {
      :scope {
        display: inline-flex;
        position: relative;
      }

      /* Ambient glow ring */
      :scope .ui-avatar {
        box-shadow: 0 0 12px -2px oklch(65% 0.18 270 / 0.35),
                    0 0 0 1px oklch(65% 0.18 270 / 0.1);
      }

      /* Spring-scale hover */
      :scope:not([data-motion="0"]) .ui-avatar {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    box-shadow 0.3s ease-out;
      }
      :scope:not([data-motion="0"]) .ui-avatar:hover {
        transform: scale(1.08);
        box-shadow: 0 0 18px -2px oklch(65% 0.22 270 / 0.5),
                    0 0 0 2px oklch(65% 0.22 270 / 0.15);
      }

      /* Shimmer on loading state (when image not yet loaded) */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-avatar__initials,
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-avatar__icon {
        position: relative;
        overflow: hidden;
      }
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-avatar__initials::after,
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-avatar__icon::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          110deg,
          oklch(100% 0 0 / 0) 35%,
          oklch(100% 0.05 270 / 0.15) 50%,
          oklch(100% 0 0 / 0) 65%
        );
        background-size: 200% 100%;
        animation: ui-premium-avatar-shimmer 2s ease-in-out infinite;
        border-radius: inherit;
        pointer-events: none;
      }
      @keyframes ui-premium-avatar-shimmer {
        0%, 100% { background-position: 200% center; }
        50% { background-position: -200% center; }
      }

      /* Status dot glow matching status color */
      :scope .ui-avatar__status[data-status="online"] {
        box-shadow: 0 0 8px oklch(72% 0.19 155 / 0.5);
      }
      :scope .ui-avatar__status[data-status="busy"] {
        box-shadow: 0 0 8px oklch(65% 0.25 25 / 0.5);
      }

      /* Motion 0: disable all */
      :scope[data-motion="0"] .ui-avatar {
        transition: none;
        box-shadow: none;
      }
      :scope[data-motion="0"] .ui-avatar__initials::after,
      :scope[data-motion="0"] .ui-avatar__icon::after {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-avatar { transition: none !important; }
        :scope .ui-avatar__initials::after,
        :scope .ui-avatar__icon::after {
          animation: none !important;
        }
      }
    }
  }
`

export const Avatar = forwardRef<HTMLDivElement, PremiumAvatarProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-avatar', premiumAvatarStyles)

    return (
      <span className="ui-premium-avatar" data-motion={motionLevel}>
        <BaseAvatar ref={ref} {...rest} />
      </span>
    )
  }
)

Avatar.displayName = 'Avatar'
