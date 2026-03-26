'use client'

import { forwardRef } from 'react'
import { FileUpload as BaseFileUpload, type FileUploadProps } from '../components/file-upload'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumFileUploadStyles = css`
  @layer premium {
    @scope (.ui-premium-file-upload) {
      :scope {
        display: flex;
        flex-direction: column;
      }

      /* Aurora glow on drag-over — targets base component's data attr */
      :scope .ui-file-upload[data-dragover] .ui-file-upload__dropzone {
        box-shadow:
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
          0 0 40px -8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
          inset 0 0 16px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.6);
      }

      /* Spring-bounce on file add */
      :scope:not([data-motion="0"]) .ui-file-upload__file {
        animation: ui-premium-file-bounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      @keyframes ui-premium-file-bounce {
        from {
          opacity: 0;
          transform: scale(0.6) translateY(-8px);
        }
        65% {
          transform: scale(1.06) translateY(0);
        }
        80% {
          transform: scale(0.97);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Particle burst on upload complete — shimmer sweep across dropzone */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-file-upload__dropzone::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12) 45%,
          oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h / 0.18) 50%,
          oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12) 55%,
          transparent 70%
        );
        background-size: 250% 100%;
        pointer-events: none;
        opacity: 0;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-file-upload[data-dragover] .ui-file-upload__dropzone::after {
        opacity: 1;
        animation: ui-premium-file-particle 1.8s ease-in-out infinite;
      }
      @keyframes ui-premium-file-particle {
        0% { background-position: 200% center; }
        100% { background-position: -50% center; }
      }

      /* Motion 0: no animation */
      :scope[data-motion="0"] .ui-file-upload__file {
        animation: none;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-file-upload__file { animation: none; }
        :scope .ui-file-upload__dropzone::after { animation: none; opacity: 0; }
      }
    }
  }
`

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-file-upload', premiumFileUploadStyles)

    return (
      <div className="ui-premium-file-upload" data-motion={motionLevel}>
        <BaseFileUpload ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'
