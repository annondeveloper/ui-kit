'use client'

import type React from 'react'
import { useCallback, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { cn, fmtBytes } from '../utils'

export interface FileUploadProps {
  /** Accepted file types (e.g. `'image/*'`, `'.pdf,.doc'`). */
  accept?: string
  /** Maximum file size in bytes. Default 10 MB. */
  maxSize?: number
  /** Maximum number of files allowed. Default `1`. */
  maxFiles?: number
  /** Allow multiple file selection. */
  multiple?: boolean
  /** Disable the upload zone. */
  disabled?: boolean
  /** Callback when valid files are selected or dropped. */
  onFilesSelected: (files: File[]) => void
  /** Callback when a validation error occurs. */
  onError?: (error: string) => void
  /** Custom content inside the drop zone. Overrides default prompt. */
  children?: React.ReactNode
  /** Additional class names on the root element. */
  className?: string
}

type DragState = 'idle' | 'dragover' | 'dropped'

const TEN_MB = 10 * 1024 * 1024

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * @description An accessible drag-and-drop file upload zone with click-to-browse,
 * file type/size validation, image preview thumbnails, animated drag feedback,
 * and full keyboard support. Styled with theme tokens for dark/light mode.
 */
export function FileUpload({
  accept,
  maxSize = TEN_MB,
  maxFiles = 1,
  multiple = false,
  disabled = false,
  onFilesSelected,
  onError,
  children,
  className,
}: FileUploadProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragState, setDragState] = useState<DragState>('idle')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<Map<string, string>>(new Map())
  const [error, setError] = useState<string | null>(null)

  const effectiveMaxFiles = multiple ? maxFiles : 1

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const valid: File[] = []
      for (const file of files) {
        if (file.size > maxSize) {
          const msg = `"${file.name}" exceeds max size of ${fmtBytes(maxSize)}`
          setError(msg)
          onError?.(msg)
          continue
        }
        if (accept) {
          const accepted = accept.split(',').map((a) => a.trim())
          const matchesType = accepted.some((a) => {
            if (a.startsWith('.')) {
              return file.name.toLowerCase().endsWith(a.toLowerCase())
            }
            if (a.endsWith('/*')) {
              return file.type.startsWith(a.replace('/*', '/'))
            }
            return file.type === a
          })
          if (!matchesType) {
            const msg = `"${file.name}" is not an accepted file type`
            setError(msg)
            onError?.(msg)
            continue
          }
        }
        valid.push(file)
      }
      return valid.slice(0, effectiveMaxFiles)
    },
    [accept, maxSize, effectiveMaxFiles, onError],
  )

  const processFiles = useCallback(
    (files: File[]) => {
      setError(null)
      const valid = validateFiles(files)
      if (valid.length === 0) return

      // Revoke old preview URLs
      for (const url of previews.values()) {
        URL.revokeObjectURL(url)
      }

      const newPreviews = new Map<string, string>()
      for (const f of valid) {
        if (isImageFile(f)) {
          newPreviews.set(f.name + f.size, URL.createObjectURL(f))
        }
      }

      setSelectedFiles(valid)
      setPreviews(newPreviews)
      setDragState('dropped')
      onFilesSelected(valid)

      // Reset dropped state after brief flash
      setTimeout(() => setDragState('idle'), 600)
    },
    [validateFiles, onFilesSelected, previews],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setDragState('dragover')
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragState('idle')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return
      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    },
    [disabled, processFiles],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      processFiles(files)
      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    [processFiles],
  )

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        inputRef.current?.click()
      }
    },
    [disabled],
  )

  const removeFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => {
        const next = prev.filter((_, i) => i !== index)
        // Clean up preview
        const removed = prev[index]
        if (removed) {
          const key = removed.name + removed.size
          const url = previews.get(key)
          if (url) {
            URL.revokeObjectURL(url)
            setPreviews((p) => {
              const m = new Map(p)
              m.delete(key)
              return m
            })
          }
        }
        return next
      })
    },
    [previews],
  )

  return (
    <div className={cn('space-y-3', className)}>
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files by dropping them here or clicking to browse"
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={
          dragState === 'dragover'
            ? { scale: reduced ? 1 : 1.01 }
            : dragState === 'dropped'
              ? { scale: reduced ? 1 : 1 }
              : { scale: 1 }
        }
        transition={{ duration: 0.15 }}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer outline-none',
          'focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--bg-base))]',
          dragState === 'idle' &&
            'border-[hsl(var(--border-default))] bg-[hsl(var(--bg-base))] hover:border-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--bg-surface))]',
          dragState === 'dragover' &&
            'border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary)/0.08)] shadow-[0_0_16px_hsl(var(--brand-primary)/0.2)]',
          dragState === 'dropped' &&
            'border-[hsl(var(--status-ok))] bg-[hsl(var(--status-ok)/0.06)]',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {children ?? (
          <>
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-xl transition-colors',
                dragState === 'dragover'
                  ? 'bg-[hsl(var(--brand-primary)/0.15)] text-[hsl(var(--brand-primary))]'
                  : 'bg-[hsl(var(--bg-elevated))] text-[hsl(var(--text-tertiary))]',
              )}
            >
              <Upload className="size-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                Drop files here or{' '}
                <span className="text-[hsl(var(--brand-primary))] underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--text-tertiary))]">
                {accept ? `Accepted: ${accept}` : 'Any file type'} &middot; Max{' '}
                {fmtBytes(maxSize)}
                {multiple ? ` \u00b7 Up to ${effectiveMaxFiles} files` : ''}
              </p>
            </div>
          </>
        )}
      </motion.div>

      {/* Error display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-lg bg-[hsl(var(--status-critical)/0.1)] px-3 py-2 text-xs text-[hsl(var(--status-critical))]"
          >
            <AlertCircle className="size-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File list with previews */}
      <AnimatePresence mode="popLayout">
        {selectedFiles.map((file, i) => {
          const key = file.name + file.size
          const previewUrl = previews.get(key)
          return (
            <motion.div
              key={key}
              layout
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] px-3 py-2"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Preview of ${file.name}`}
                  className="size-10 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--bg-elevated))]">
                  {isImageFile(file) ? (
                    <ImageIcon className="size-5 text-[hsl(var(--text-tertiary))]" />
                  ) : (
                    <FileText className="size-5 text-[hsl(var(--text-tertiary))]" />
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[hsl(var(--text-primary))]">
                  {file.name}
                </p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">
                  {fmtBytes(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-[hsl(var(--text-tertiary))] transition-colors hover:bg-[hsl(var(--bg-elevated))] hover:text-[hsl(var(--text-primary))]"
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
