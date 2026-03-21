import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface LiteFileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  hint?: string
}

export const FileUpload = forwardRef<HTMLInputElement, LiteFileUploadProps>(
  ({ label, hint, className, ...rest }, ref) => (
    <div className={`ui-lite-file-upload${className ? ` ${className}` : ''}`}>
      <label>
        {label ?? 'Choose file'}
        <input ref={ref} type="file" {...rest} />
      </label>
      {hint && <span className="ui-lite-file-upload__hint">{hint}</span>}
    </div>
  )
)
FileUpload.displayName = 'FileUpload'
