import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteCropperProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  aspectRatio?: number
  rounded?: boolean
}

/** Lite cropper — displays the image with optional aspect ratio, no interactive cropping */
export const Cropper = forwardRef<HTMLDivElement, LiteCropperProps>(
  ({ src, aspectRatio, rounded, className, style, ...rest }, ref) => {
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
