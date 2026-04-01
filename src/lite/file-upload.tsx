import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteFileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onError'> {
  label?: ReactNode
  hint?: string
  /** File type filter string, e.g. "image/*,.pdf" */
  accept?: string
  multiple?: boolean
  /** Max file size in bytes (used for display/description; wire onError for enforcement) */
  maxSize?: number
  /** Max number of files when multiple=true */
  maxFiles?: number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  /** Called with a human-readable error string when validation fails */
  onError?: (error: string) => void
  disabled?: boolean
  description?: ReactNode
  /** Show image preview for selected image files */
  showPreview?: boolean
}

export const FileUpload = forwardRef<HTMLInputElement, LiteFileUploadProps>(
  ({ label, hint, accept, multiple, maxSize, maxFiles, onChange, onError, disabled, description, showPreview, className, ...rest }, ref) => {
    const [previews, setPreviews] = useState<string[]>([])

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
      const files = Array.from(e.target.files ?? [])

      if (maxSize) {
        const oversized = files.filter(f => f.size > maxSize)
        if (oversized.length) {
          onError?.(`File "${oversized[0].name}" exceeds the maximum size.`)
          return
        }
      }

      if (maxFiles && files.length > maxFiles) {
        onError?.(`You can upload at most ${maxFiles} file(s).`)
        return
      }

      if (showPreview) {
        const urls = files
          .filter(f => f.type.startsWith('image/'))
          .map(f => URL.createObjectURL(f))
        setPreviews(urls)
      }

      onChange?.(e)
    }

    return (
      <div className={`ui-lite-file-upload${className ? ` ${className}` : ''}`} data-disabled={disabled ? '' : undefined}>
        <label>
          {label ?? 'Choose file'}
          <input
            ref={ref}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleChange}
            {...rest}
          />
        </label>
        {description && <p className="ui-lite-file-upload__description">{description}</p>}
        {hint && <span className="ui-lite-file-upload__hint">{hint}</span>}
        {showPreview && previews.length > 0 && (
          <div className="ui-lite-file-upload__previews">
            {previews.map(url => (
              <img key={url} src={url} className="ui-lite-file-upload__preview" alt="Preview" />
            ))}
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'
