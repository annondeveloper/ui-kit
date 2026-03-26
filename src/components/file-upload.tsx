'use client'

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
  type DragEvent,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'
import { Icon } from '../core/icons'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError'> {
  name: string
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxFiles?: number
  onChange?: (files: File[]) => void
  onError?: (error: string) => void
  label?: ReactNode
  description?: string
  error?: string
  disabled?: boolean
  showPreview?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function matchesAccept(file: File, accept: string): boolean {
  if (!accept) return true
  const parts = accept.split(',').map(s => s.trim())
  return parts.some(pattern => {
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase())
    }
    if (pattern.endsWith('/*')) {
      const baseType = pattern.slice(0, -2)
      return file.type.startsWith(baseType + '/')
    }
    return file.type === pattern
  })
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const fileUploadStyles = css`
  @layer components {
    @scope (.ui-file-upload) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
        position: relative;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-file-upload__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      /* Drop zone */
      .ui-file-upload__dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-xl, 1.5rem) var(--space-lg, 1rem);
        border: 2px dashed var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-lg, 0.5rem);
        background: transparent;
        cursor: pointer;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    background 0.15s var(--ease-out, ease-out);
        outline: none;
        min-block-size: 120px;
      }

      .ui-file-upload__dropzone:hover {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
        background: var(--bg-hover);
      }

      .ui-file-upload__dropzone:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Drag-over state */
      :scope[data-dragover] .ui-file-upload__dropzone {
        border-color: var(--brand, oklch(65% 0.2 270));
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.05);
        border-style: solid;
      }

      .ui-file-upload__dropzone-icon {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-file-upload__dropzone-text {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, oklch(70% 0 0));
        text-align: center;
      }

      .ui-file-upload__dropzone-browse {
        color: var(--brand, oklch(65% 0.2 270));
        font-weight: 500;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      /* Hidden file input */
      .ui-file-upload__input {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* File list */
      .ui-file-upload__files {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
      }

      .ui-file-upload__file {
        display: flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.375rem);
        background: var(--bg-hover);
      }

      /* Entry animation */
      :scope:not([data-motion="0"]) .ui-file-upload__file {
        animation: ui-file-upload-file-in 0.2s var(--ease-out, ease-out);
      }

      .ui-file-upload__thumbnail {
        inline-size: 36px;
        block-size: 36px;
        border-radius: var(--radius-sm, 0.25rem);
        object-fit: cover;
        flex-shrink: 0;
      }

      .ui-file-upload__file-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: 36px;
        block-size: 36px;
        flex-shrink: 0;
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-file-upload__file-info {
        flex: 1;
        min-inline-size: 0;
      }

      .ui-file-upload__file-name {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ui-file-upload__file-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        line-height: 1.3;
      }

      .ui-file-upload__remove {
        appearance: none;
        border: none;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-xs, 0.25rem);
        border-radius: var(--radius-sm, 0.25rem);
        color: var(--text-tertiary, oklch(60% 0 0));
        transition: color 0.1s, background 0.1s;
        flex-shrink: 0;
      }

      .ui-file-upload__remove:hover {
        color: var(--status-critical, oklch(65% 0.25 25));
        background: oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.1);
      }

      .ui-file-upload__remove:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }

      /* Error */
      .ui-file-upload__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      :scope:not([data-motion="0"]) .ui-file-upload__error {
        animation: ui-file-upload-error-in 0.2s var(--ease-out, ease-out);
      }

      :scope[data-invalid] .ui-file-upload__dropzone {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-file-upload__remove {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-file-upload__dropzone {
          border: 2px dashed ButtonText;
        }
        :scope[data-dragover] .ui-file-upload__dropzone {
          border: 2px solid Highlight;
        }
        .ui-file-upload__dropzone:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-file-upload__file {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        .ui-file-upload__dropzone {
          border: 2px dashed;
        }
      }
    }

    @keyframes ui-file-upload-file-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ui-file-upload-error-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      name,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      onChange,
      onError,
      label,
      description,
      error: errorProp,
      disabled = false,
      showPreview = true,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('file-upload', fileUploadStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('file-upload')
    const errorId = errorProp ? `${stableId}-error` : undefined

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [isDragOver, setIsDragOver] = useState(false)

    // ── Validation ────────────────────────────────────────────────────

    const validateFiles = useCallback(
      (incoming: File[]): File[] | null => {
        // Check max files
        if (maxFiles !== undefined && incoming.length > maxFiles) {
          onError?.(`Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`)
          return null
        }

        // Check each file
        for (const file of incoming) {
          // Type check
          if (accept && !matchesAccept(file, accept)) {
            onError?.(`File type not accepted: ${file.name}`)
            return null
          }
          // Size check
          if (maxSize !== undefined && file.size > maxSize) {
            onError?.(`File too large: ${file.name} (${formatFileSize(file.size)})`)
            return null
          }
        }

        return incoming
      },
      [accept, maxSize, maxFiles, onError]
    )

    const handleFiles = useCallback(
      (incoming: File[]) => {
        const validated = validateFiles(incoming)
        if (validated === null) return
        setFiles(validated)
        onChange?.(validated)
      },
      [validateFiles, onChange]
    )

    // ── Event handlers ────────────────────────────────────────────────

    const handleDropzoneClick = useCallback(() => {
      if (disabled) return
      fileInputRef.current?.click()
    }, [disabled])

    const handleDropzoneKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleDropzoneClick()
        }
      },
      [handleDropzoneClick]
    )

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files
        if (!fileList) return
        handleFiles(Array.from(fileList))
        // Reset input so same file can be selected again
        e.target.value = ''
      },
      [handleFiles]
    )

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }, [])

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const droppedFiles = e.dataTransfer?.files
        if (!droppedFiles) return
        handleFiles(Array.from(droppedFiles))
      },
      [handleFiles]
    )

    const handleRemove = useCallback(
      (index: number) => {
        const updated = files.filter((_, i) => i !== index)
        setFiles(updated)
        onChange?.(updated)
      },
      [files, onChange]
    )

    // ── Preview URL memoization ───────────────────────────────────────

    const filePreviews = useMemo(
      () =>
        files.map(file => ({
          file,
          isImage: file.type.startsWith('image/'),
          url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        })),
      [files]
    )

    // ── Render ────────────────────────────────────────────────────────

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-motion={motionLevel}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(isDragOver ? { 'data-dragover': '' } : {})}
        {...(errorProp ? { 'data-invalid': '' } : {})}
        {...rest}
      >
        {label && (
          <span className="ui-file-upload__label">{label}</span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="ui-file-upload__input"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        <div
          className="ui-file-upload__dropzone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Upload files${accept ? ` (${accept})` : ''}`}
          onClick={handleDropzoneClick}
          onKeyDown={handleDropzoneKeyDown}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span className="ui-file-upload__dropzone-icon" aria-hidden="true">
            <Icon name="upload" size="lg" />
          </span>
          <span className="ui-file-upload__dropzone-text">
            {description || (
              <>
                Drag files here or{' '}
                <span className="ui-file-upload__dropzone-browse">browse</span>
              </>
            )}
          </span>
        </div>

        {files.length > 0 && (
          <div className="ui-file-upload__files" role="list" aria-label="Selected files">
            {filePreviews.map(({ file, isImage, url }, index) => (
              <div key={`${file.name}-${index}`} className="ui-file-upload__file" role="listitem">
                {showPreview && isImage && url ? (
                  <img
                    className="ui-file-upload__thumbnail"
                    src={url}
                    alt={`Preview of ${file.name}`}
                  />
                ) : showPreview ? (
                  <span className="ui-file-upload__file-icon" aria-hidden="true">
                    <Icon name="file" size="md" />
                  </span>
                ) : null}
                <div className="ui-file-upload__file-info">
                  <div className="ui-file-upload__file-name">{file.name}</div>
                  <div className="ui-file-upload__file-size">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="ui-file-upload__remove"
                  onClick={() => handleRemove(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="x" size="sm" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errorProp && (
          <span id={errorId} className="ui-file-upload__error" role="alert">
            {errorProp}
          </span>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'
