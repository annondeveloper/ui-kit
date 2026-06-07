import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const fileUploadStyles = css`
  @layer components {
    @scope (.ui-lite-file-upload) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-family: inherit;
      }
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1rem 1.5rem;
        border: 2px dashed var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-lg, 14px);
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      label:hover {
        border-color: var(--brand, oklch(65% 0.2 270));
        background: oklch(100% 0 0 / 0.02);
      }
      label:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      input[type="file"] {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
      }
      .ui-lite-file-upload__description {
        margin: 0;
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-file-upload__hint {
        font-size: 0.75rem;
        color: var(--text-secondary, oklch(70% 0 0));
        opacity: 0.7;
      }
      .ui-lite-file-upload__previews {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-block-start: 0.25rem;
      }
      .ui-lite-file-upload__preview {
        inline-size: 56px;
        block-size: 56px;
        object-fit: cover;
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
      }
    }
  }
`

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
    useStyles('lite-file-upload', fileUploadStyles)
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
        // Revoke old URLs before creating new ones
        previews.forEach(url => URL.revokeObjectURL(url))
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
            {previews.map((url, i) => (
              <img key={url} src={url} className="ui-lite-file-upload__preview" alt={`Preview ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = 'FileUpload'
