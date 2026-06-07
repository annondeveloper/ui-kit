import { forwardRef, useState, useCallback, type HTMLAttributes, type KeyboardEvent } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const tagInputStyles = css`
  @layer components {
    @scope (.ui-lite-tag-input) {
      :scope {
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 10px);
        padding: 0.375rem 0.5rem;
      }
      :scope[aria-invalid="true"] {
        border-color: oklch(62% 0.22 25);
      }
      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      :scope[data-size="sm"] { padding: 0.25rem 0.375rem; }
      :scope[data-size="lg"] { padding: 0.5rem 0.625rem; }

      .ui-lite-tag-input__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        align-items: center;
      }

      .ui-lite-tag-input__tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.125rem 0.375rem;
        background: oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-sm, 6px);
        font-size: 0.75rem;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-tag-input__tag button {
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        font-size: 0.875rem;
        padding: 0;
        line-height: 1;
        opacity: 0.6;
      }
      .ui-lite-tag-input__tag button:hover { opacity: 1; }
      .ui-lite-tag-input__tag button:disabled { cursor: not-allowed; }

      .ui-lite-tag-input__tags input {
        flex: 1;
        min-inline-size: 4rem;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary, oklch(97% 0 0));
        font-family: inherit;
        font-size: 0.8125rem;
        padding: 0.125rem 0;
      }

      .ui-lite-tag-input__error {
        display: block;
        font-size: 0.75rem;
        color: oklch(62% 0.22 25);
        margin-block-start: 0.25rem;
      }
    }
  }
`

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
    useStyles('lite-tag-input', tagInputStyles)
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
