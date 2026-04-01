import { forwardRef, useState, useCallback, type HTMLAttributes, type KeyboardEvent } from 'react'

export interface LiteTagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  error?: string
}

export const TagInput = forwardRef<HTMLDivElement, LiteTagInputProps>(
  ({ tags, onChange, placeholder = 'Add tag...', maxTags, error, className, ...rest }, ref) => {
    const [input, setInput] = useState('')

    const addTag = useCallback(() => {
      const tag = input.trim()
      if (!tag || tags.includes(tag)) return
      if (maxTags && tags.length >= maxTags) return
      onChange([...tags, tag])
      setInput('')
    }, [input, tags, onChange, maxTags])

    const removeTag = useCallback((index: number) => {
      onChange(tags.filter((_, i) => i !== index))
    }, [tags, onChange])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); addTag() }
      if (e.key === 'Backspace' && !input && tags.length) removeTag(tags.length - 1)
    }, [addTag, removeTag, input, tags.length])

    return (
      <div ref={ref} className={`ui-lite-tag-input${className ? ` ${className}` : ''}`} aria-invalid={!!error} {...rest}>
        <div className="ui-lite-tag-input__tags">
          {tags.map((tag, i) => (
            <span key={tag} className="ui-lite-tag-input__tag">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(i)}>&times;</button>
            </span>
          ))}
          <input
            type="text"
            value={input}
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
