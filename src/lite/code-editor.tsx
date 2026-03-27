import { forwardRef, useState, useCallback, type HTMLAttributes, type ChangeEvent } from 'react'

export interface LiteCodeEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  showLineNumbers?: boolean
  placeholder?: string
  minHeight?: string | number
}

/** Lite code editor — plain textarea with optional line numbers, no syntax highlighting */
export const CodeEditor = forwardRef<HTMLDivElement, LiteCodeEditorProps>(
  ({ value, defaultValue = '', onChange, language, readOnly, showLineNumbers, placeholder, minHeight, className, ...rest }, ref) => {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const code = isControlled ? value : internalValue

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        if (!isControlled) setInternalValue(newValue)
        onChange?.(newValue)
      },
      [isControlled, onChange]
    )

    const lines = code.split('\n')
    const minH = typeof minHeight === 'number' ? `${minHeight}px` : (minHeight ?? '120px')

    return (
      <div
        ref={ref}
        className={`ui-lite-code-editor${className ? ` ${className}` : ''}`}
        role="group"
        aria-label="Code editor"
        style={{ display: 'flex', border: '1px solid oklch(100% 0 0 / 0.08)', borderRadius: '0.75rem', overflow: 'hidden', fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem' }}
        {...rest}
      >
        {showLineNumbers && (
          <div aria-hidden="true" style={{ padding: '1rem 0.5rem', background: 'oklch(15% 0.01 270)', color: 'oklch(45% 0 0)', textAlign: 'right', userSelect: 'none', lineHeight: 1.6 }}>
            {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>
        )}
        <textarea
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          aria-label="Code input"
          aria-multiline="true"
          style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent', color: 'inherit', font: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none', minHeight: minH, tabSize: 2 }}
        />
      </div>
    )
  }
)
CodeEditor.displayName = 'CodeEditor'
