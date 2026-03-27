import { forwardRef, useRef, useCallback, useEffect, type HTMLAttributes } from 'react'

export interface LiteRichTextEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (html: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  readOnly?: boolean
  minHeight?: string | number
}

/** Lite rich text editor — basic contentEditable with bold/italic/underline buttons, no animation */
export const RichTextEditor = forwardRef<HTMLDivElement, LiteRichTextEditorProps>(
  ({ value, defaultValue, onChange, placeholder = 'Start typing...', label, disabled, readOnly, minHeight = 120, className, ...rest }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const isControlled = value !== undefined

    useEffect(() => {
      if (isControlled && editorRef.current) {
        if (value !== editorRef.current.innerHTML) {
          editorRef.current.innerHTML = value ?? ''
        }
      }
    }, [value, isControlled])

    useEffect(() => {
      if (!isControlled && defaultValue && editorRef.current) {
        editorRef.current.innerHTML = defaultValue
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleInput = useCallback(() => {
      if (!editorRef.current) return
      const html = editorRef.current.innerHTML
      const isEmpty = html === '<br>' || html === '<p><br></p>' || html === ''
      onChange?.(isEmpty ? '' : html)
    }, [onChange])

    const exec = useCallback((cmd: string) => {
      editorRef.current?.focus()
      document.execCommand(cmd, false)
      handleInput()
    }, [handleInput])

    const minH = typeof minHeight === 'number' ? `${minHeight}px` : minHeight

    return (
      <div ref={ref} className={`ui-lite-rich-text-editor${className ? ` ${className}` : ''}`} {...rest}>
        {label && <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBlockEnd: '0.25rem' }}>{label}</label>}
        <div style={{ border: '1px solid oklch(100% 0 0 / 0.12)', borderRadius: '0.375rem', overflow: 'hidden' }}>
          <div role="toolbar" aria-label="Formatting options" style={{ display: 'flex', gap: 2, padding: '0.25rem 0.375rem', borderBlockEnd: '1px solid oklch(100% 0 0 / 0.12)', background: 'oklch(20% 0.01 270)' }}>
            <button type="button" onClick={() => exec('bold')} aria-label="Bold" disabled={disabled || readOnly} style={{ border: 'none', background: 'transparent', color: 'oklch(70% 0 0)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700 }}>B</button>
            <button type="button" onClick={() => exec('italic')} aria-label="Italic" disabled={disabled || readOnly} style={{ border: 'none', background: 'transparent', color: 'oklch(70% 0 0)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontStyle: 'italic' }}>I</button>
            <button type="button" onClick={() => exec('underline')} aria-label="Underline" disabled={disabled || readOnly} style={{ border: 'none', background: 'transparent', color: 'oklch(70% 0 0)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textDecoration: 'underline' }}>U</button>
          </div>
          <div
            ref={editorRef}
            contentEditable={!disabled && !readOnly}
            role="textbox"
            aria-multiline="true"
            aria-label={label ?? 'Rich text editor'}
            data-placeholder={placeholder}
            onInput={handleInput}
            suppressContentEditableWarning
            style={{ padding: '0.75rem', minBlockSize: minH, outline: 'none', lineHeight: 1.6 }}
          />
        </div>
      </div>
    )
  }
)
RichTextEditor.displayName = 'RichTextEditor'
