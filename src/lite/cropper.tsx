import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const cropperStyles = css`
  @layer components {
    @scope (.ui-lite-cropper) {
      :scope {
        position: relative;
        display: inline-block;
        overflow: hidden;
        border-radius: var(--radius-md, 0.375rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        background: var(--bg-surface, oklch(12% 0.015 270));
        line-height: 0;
      }
      img {
        display: block;
        max-inline-size: 100%;
        block-size: auto;
        user-select: none;
      }
    }
  }
`

export interface LiteCropperProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  aspectRatio?: number
  rounded?: boolean
}

/** Lite cropper — displays the image with optional aspect ratio, no interactive cropping */
export const Cropper = forwardRef<HTMLDivElement, LiteCropperProps>(
  ({ src, aspectRatio, rounded, className, style, ...rest }, ref) => {
    useStyles('lite-cropper', cropperStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-cropper${className ? ` ${className}` : ''}`}
        role="img"
        aria-label="Image cropper"
        style={{
          position: 'relative',
          display: 'inline-block',
          overflow: 'hidden',
          borderRadius: rounded ? '50%' : '0.375rem',
          border: '1px solid oklch(100% 0 0 / 0.12)',
          ...style,
        }}
        {...rest}
      >
        <img
          src={src}
          alt="Image to crop"
          style={{
            display: 'block',
            maxInlineSize: '100%',
            blockSize: 'auto',
            aspectRatio: aspectRatio ? String(aspectRatio) : undefined,
            objectFit: aspectRatio ? 'cover' : undefined,
          }}
          draggable={false}
        />
      </div>
    )
  }
)
Cropper.displayName = 'Cropper'
