'use client'

import { forwardRef } from 'react'
import { AvatarUpload as BaseAvatarUpload, type AvatarUploadProps } from '../components/avatar-upload'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumStyles = css`
  @layer premium {
    @scope (.ui-premium-avatar-upload) {
      :scope {
        display: inline-flex;
      }

      /* Aurora ring glow on hover */
      @media (hover: hover) {
        :scope:not([data-motion="0"]) .ui-avatar-upload__container {
          transition: box-shadow 0.3s var(--ease-out, ease-out),
                      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        :scope:not([data-motion="0"]) .ui-avatar-upload__container:hover {
          box-shadow: 0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
          transform: scale(1.04);
        }
      }

      /* Spring entrance */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-avatar-upload {
        animation: ui-premium-avatar-upload-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-avatar-upload-enter {
        from { opacity: 0; transform: scale(0.85); }
        to { opacity: 1; transform: scale(1); }
      }

      :scope[data-motion="0"] .ui-avatar-upload { animation: none; }
      :scope[data-motion="0"] .ui-avatar-upload__container { transition: none; }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-avatar-upload { animation: none; }
        :scope .ui-avatar-upload__container { transition: none; }
      }
    }
  }
`

export const AvatarUpload = forwardRef<HTMLDivElement, AvatarUploadProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-avatar-upload', premiumStyles)

    return (
      <div className="ui-premium-avatar-upload" data-motion={motionLevel}>
        <BaseAvatarUpload ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

AvatarUpload.displayName = 'AvatarUpload'
