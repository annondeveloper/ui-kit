import { forwardRef, useState, useCallback, type HTMLAttributes, type KeyboardEvent } from 'react'

export interface LiteTagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  error?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Allow duplicate tag values (default false) */
  allowDuplicates?: boolean
  /** Custom validation; return error string or null/undefined to allow */
  validate?: (tag: string) => string | null | undefined
}

export const TagInput = forwardRef<HTMLDivElement, LiteTagInputProps>(
  ({ tags, onChange, placeholder = 'Add tag...', maxTags, error, disabled, size, allowDuplicates = false, validate, className, ...rest }, ref) => {
    const [input, setInput] = useState('')

    const addTag = useCallback(() => {
      const tag = input.trim()
      if (!tag) return
      if (!allowDuplicates && tags.includes(tag)) return
      if (maxTags && tags.length >= maxTags) return
      if (validate) {
        const err = validate(tag)
        if (err) return
      }
      onChange([...tags, tag])
      setInput('')
    }, [input, tags, onChange, maxTags, allowDuplicates, validate])

    const removeTag = useCallback((index: number) => {
      if (disabled) return
      onChange(tags.filter((_, i) => i !== index))
    }, [tags, onChange, disabled])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); addTag() }
      if (e.key === 'Backspace' && !input && tags.length) removeTag(tags.length - 1)
    }, [addTag, removeTag, input, tags.length])

    return (
      <div
        ref={ref}
        className={`ui-lite-tag-input${className ? ` ${className}` : ''}`}
        aria-invalid={!!error}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        <div className="ui-lite-tag-input__tags">
          {tags.map((tag, i) => (
            <span key={tag} className="ui-lite-tag-input__tag">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} disabled={disabled} onClick={() => removeTag(i)}>&times;</button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            disabled={disabled}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
          />
        </div>
        {error && <span className="ui-lite-tag-input__error">{error}</span>}
      </div>
    )
  }
)
TagInput.displayName = 'TagInput'
