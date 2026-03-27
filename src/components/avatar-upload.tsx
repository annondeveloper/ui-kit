'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
  type DragEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AvatarUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (file: File, preview: string) => void
  onRemove?: () => void
  size?: number
  accept?: string
  maxSize?: number
  placeholder?: ReactNode
  disabled?: boolean
  shape?: 'circle' | 'square'
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const avatarUploadStyles = css`
  @layer components {
    @scope (.ui-avatar-upload) {
      :scope {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
      }

      :scope[data-disabled="true"] {
        opacity: 0.5;
        pointer-events: none;
      }

      /* ── Container ──────────────────────────────────── */

      .ui-avatar-upload__container {
        position: relative;
        cursor: pointer;
        overflow: hidden;
        border: 2px solid oklch(100% 0 0 / 0.08);
        background: oklch(25% 0.01 270);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        outline: none;
      }

      :scope[data-shape="circle"] .ui-avatar-upload__container {
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-shape="square"] .ui-avatar-upload__container {
        border-radius: var(--radius-lg, 0.75rem);
      }

      .ui-avatar-upload__container:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-avatar-upload__container:hover:not([data-disabled="true"]) {
        border-color: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
        box-shadow: 0 0 20px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      :scope:not([data-motion="0"]) .ui-avatar-upload__container:active:not([data-disabled="true"]) {
        transform: scale(0.97);
      }

      .ui-avatar-upload__container[data-drag-over="true"] {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
        border-style: dashed;
      }

      /* ── Image ──────────────────────────────────────── */

      .ui-avatar-upload__image {
        position: absolute;
        inset: 0;
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }

      :scope[data-shape="circle"] .ui-avatar-upload__image {
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-shape="square"] .ui-avatar-upload__image {
        border-radius: calc(var(--radius-lg, 0.75rem) - 2px);
      }

      /* ── Overlay ────────────────────────────────────── */

      .ui-avatar-upload__overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        background: oklch(0% 0 0 / 0.5);
        backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity 0.2s;
        color: oklch(95% 0 0);
        font-size: 0.75rem;
        font-weight: 500;
        font-family: inherit;
      }

      :scope[data-shape="circle"] .ui-avatar-upload__overlay {
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-shape="square"] .ui-avatar-upload__overlay {
        border-radius: calc(var(--radius-lg, 0.75rem) - 2px);
      }

      .ui-avatar-upload__container:hover .ui-avatar-upload__overlay,
      .ui-avatar-upload__container:focus-visible .ui-avatar-upload__overlay {
        opacity: 1;
      }

      :scope[data-motion="0"] .ui-avatar-upload__overlay {
        transition: none;
      }

      .ui-avatar-upload__overlay-icon svg {
        inline-size: 1.5rem;
        block-size: 1.5rem;
      }

      /* ── Placeholder ────────────────────────────────── */

      .ui-avatar-upload__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-size: 0.75rem;
        font-family: inherit;
      }

      .ui-avatar-upload__placeholder svg {
        inline-size: 2rem;
        block-size: 2rem;
        opacity: 0.5;
      }

      /* ── Hidden input ───────────────────────────────── */

      .ui-avatar-upload__input {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
        pointer-events: none;
      }

      /* ── Remove button ──────────────────────────────── */

      .ui-avatar-upload__remove {
        position: absolute;
        inset-block-start: -4px;
        inset-inline-end: -4px;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.5rem;
        block-size: 1.5rem;
        border-radius: var(--radius-full, 9999px);
        border: 2px solid oklch(20% 0 0);
        background: var(--status-critical, oklch(65% 0.25 25));
        color: oklch(100% 0 0);
        cursor: pointer;
        font-size: 0.625rem;
        padding: 0;
        z-index: 2;
        transition: transform 0.15s, box-shadow 0.15s;
      }

      .ui-avatar-upload__remove:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.4);
      }

      .ui-avatar-upload__remove:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      :scope[data-motion="0"] .ui-avatar-upload__remove {
        transition: none;
      }

      /* ── Error message ──────────────────────────────── */

      .ui-avatar-upload__error {
        color: var(--status-critical, oklch(65% 0.25 25));
        font-size: var(--text-xs, 0.75rem);
        font-family: inherit;
        text-align: center;
        max-inline-size: 200px;
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        .ui-avatar-upload__remove {
          inline-size: 2rem;
          block-size: 2rem;
        }
        .ui-avatar-upload__container {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        .ui-avatar-upload__container {
          border: 2px solid ButtonText;
        }
        .ui-avatar-upload__remove {
          background: ButtonText;
          color: ButtonFace;
          border-color: ButtonFace;
        }
        .ui-avatar-upload__overlay {
          background: Canvas;
          color: CanvasText;
          border: 1px solid Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        .ui-avatar-upload__overlay {
          display: none;
        }
        .ui-avatar-upload__remove {
          display: none;
        }
        .ui-avatar-upload__container {
          border: 2px solid;
          box-shadow: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const AvatarUpload = forwardRef<HTMLDivElement, AvatarUploadProps>(
  (
    {
      value,
      onChange,
      onRemove,
      size = 120,
      accept = 'image/*',
      maxSize,
      placeholder,
      disabled = false,
      shape = 'circle',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('avatar-upload', avatarUploadStyles)
    const motionLevel = useMotionLevel(motionProp)
    const inputRef = useRef<HTMLInputElement>(null)

    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    // Cleanup object URLs
    const previewUrlRef = useRef<string | null>(null)
    useEffect(() => {
      return () => {
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
        }
      }
    }, [])

    const displaySrc = value ?? preview

    const validateAndProcess = useCallback(
      (file: File) => {
        setError(null)

        if (maxSize && file.size > maxSize) {
          const maxMB = (maxSize / (1024 * 1024)).toFixed(1)
          setError(`File too large. Max size: ${maxMB}MB`)
          return
        }

        // Cleanup previous preview
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
        }

        const url = URL.createObjectURL(file)
        previewUrlRef.current = url
        setPreview(url)
        onChange?.(file, url)
      },
      [maxSize, onChange]
    )

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) validateAndProcess(file)
        // Reset input value so same file can be selected again
        e.target.value = ''
      },
      [validateAndProcess]
    )

    const handleRemove = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
          previewUrlRef.current = null
        }
        setPreview(null)
        setError(null)
        onRemove?.()
      },
      [onRemove]
    )

    const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
      (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        if (disabled) return
        const file = e.dataTransfer?.files?.[0]
        if (file) validateAndProcess(file)
      },
      [disabled, validateAndProcess]
    )

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-shape={shape}
        data-disabled={disabled || undefined}
        data-motion={motionLevel}
        {...rest}
      >
        <label
          className="ui-avatar-upload__container"
          aria-label="Upload avatar"
          aria-disabled={disabled || undefined}
          style={{
            inlineSize: `${size}px`,
            blockSize: `${size}px`,
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-drag-over={isDragOver || undefined}
        >
          <input
            ref={inputRef}
            type="file"
            className="ui-avatar-upload__input"
            accept={accept}
            disabled={disabled}
            onChange={handleFileChange}
            aria-label="Upload avatar file"
          />

          {displaySrc ? (
            <>
              <img
                src={displaySrc}
                alt="Avatar"
                className="ui-avatar-upload__image"
              />
              <div className="ui-avatar-upload__overlay" aria-hidden="true">
                <span className="ui-avatar-upload__overlay-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <span>Change</span>
              </div>
            </>
          ) : (
            <div className="ui-avatar-upload__placeholder">
              {placeholder ?? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span>Upload</span>
                </>
              )}
            </div>
          )}
        </label>

        {displaySrc && onRemove && (
          <button
            type="button"
            className="ui-avatar-upload__remove"
            onClick={handleRemove}
            aria-label="Remove avatar"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M1.5 1.5l5 5m0-5l-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {error && (
          <div className="ui-avatar-upload__error" role="alert">
            {error}
          </div>
        )}
      </div>
    )
  }
)

AvatarUpload.displayName = 'AvatarUpload'
