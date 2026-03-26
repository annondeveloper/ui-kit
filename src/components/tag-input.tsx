'use client'

import {
  forwardRef,
  useState,
  useCallback,
  type HTMLAttributes,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface TagInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  validate?: (tag: string) => boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: string
  disabled?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Close icon ─────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ─── Styles ─────────────────────────────────────────────────────────────────

const tagInputStyles = css`
  @layer components {
    @scope (.ui-tag-input) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        font-family: inherit;
      }

      .ui-tag-input__wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-md, 0.375rem);
        background: transparent;
        transition: border-color 0.15s var(--ease-out, ease-out),
                    box-shadow 0.15s var(--ease-out, ease-out);
        cursor: text;
      }

      :scope[data-size="xs"] .ui-tag-input__wrapper {
        min-block-size: 28px;
        padding: 0.0625rem 0.25rem;
      }
      :scope[data-size="sm"] .ui-tag-input__wrapper {
        min-block-size: 32px;
        padding: 0.125rem 0.375rem;
      }
      :scope[data-size="md"] .ui-tag-input__wrapper {
        min-block-size: 36px;
      }
      :scope[data-size="lg"] .ui-tag-input__wrapper {
        min-block-size: 44px;
        padding: var(--space-xs, 0.375rem) var(--space-md, 0.75rem);
      }
      :scope[data-size="xl"] .ui-tag-input__wrapper {
        min-block-size: 48px;
        padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
      }

      /* Focus within */
      .ui-tag-input__wrapper:focus-within {
        border-color: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Hover */
      .ui-tag-input__wrapper:hover:not(:focus-within) {
        border-color: var(--border-strong, oklch(100% 0 0 / 0.2));
      }

      /* Error state */
      :scope[data-invalid] .ui-tag-input__wrapper {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }
      :scope[data-invalid] .ui-tag-input__wrapper:focus-within {
        box-shadow: 0 0 0 3px oklch(from var(--status-critical, oklch(65% 0.25 25)) l c h / 0.25);
      }

      /* Tag pill */
      .ui-tag-input__tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding-block: 0.125rem;
        padding-inline: 0.5rem;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-active);
        color: var(--text-primary, oklch(90% 0 0));
        font-size: var(--text-xs, 0.75rem);
        font-weight: 500;
        line-height: 1.5;
        white-space: nowrap;
      }

      :scope[data-size="xs"] .ui-tag-input__tag {
        font-size: var(--text-xs, 0.6875rem);
        padding-block: 0.0625rem;
        padding-inline: 0.375rem;
      }
      :scope[data-size="lg"] .ui-tag-input__tag {
        font-size: var(--text-sm, 0.875rem);
        padding-block: 0.25rem;
        padding-inline: 0.625rem;
      }
      :scope[data-size="xl"] .ui-tag-input__tag {
        font-size: var(--text-base, 1rem);
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
      }

      /* Tag entry animation — motion 1+ */
      :scope:not([data-motion="0"]) .ui-tag-input__tag {
        animation: ui-tag-in 0.15s var(--ease-out, ease-out);
      }

      /* Tag remove button */
      .ui-tag-input__tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: none;
        color: var(--text-tertiary, oklch(60% 0 0));
        cursor: pointer;
        border-radius: var(--radius-full, 9999px);
        transition: color 0.1s;
      }
      .ui-tag-input__tag-remove:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-tag-input__tag-remove:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 1px;
      }
      .ui-tag-input__tag-remove svg {
        inline-size: 0.75rem;
        block-size: 0.75rem;
      }

      /* Input */
      .ui-tag-input__field {
        flex: 1;
        min-inline-size: 4rem;
        border: none;
        background: none;
        outline: none;
        color: var(--text-primary, oklch(90% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        padding: 0.125rem 0;
      }

      :scope[data-size="xs"] .ui-tag-input__field {
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-tag-input__field {
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="lg"] .ui-tag-input__field {
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-tag-input__field {
        font-size: var(--text-lg, 1.125rem);
      }

      .ui-tag-input__field::placeholder {
        color: var(--text-tertiary, oklch(60% 0 0));
      }

      .ui-tag-input__field:disabled {
        cursor: not-allowed;
      }

      /* Error message */
      .ui-tag-input__error {
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        line-height: 1.4;
      }

      /* Disabled */
      :scope[data-disabled] {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-tag-input__wrapper {
          border: 2px solid ButtonText;
        }
        .ui-tag-input__wrapper:focus-within {
          outline: 2px solid Highlight;
        }
        .ui-tag-input__tag {
          border: 1px solid CanvasText;
        }
        :scope[data-invalid] .ui-tag-input__wrapper {
          border-color: LinkText;
        }
      }

      /* Print */
      @media print {
        .ui-tag-input__wrapper {
          box-shadow: none;
          border: 1px solid;
        }
      }
    }

    @keyframes ui-tag-in {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  (
    {
      tags,
      onChange,
      placeholder,
      maxTags,
      allowDuplicates = false,
      validate,
      size = 'md',
      error,
      disabled = false,
      motion: motionProp,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('tag-input', tagInputStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('tag-input')
    const [inputValue, setInputValue] = useState('')

    const addTag = useCallback(
      (rawTag: string) => {
        const tag = rawTag.trim().replace(/,$/g, '')
        if (!tag) return false
        if (!allowDuplicates && tags.includes(tag)) return false
        if (maxTags !== undefined && tags.length >= maxTags) return false
        if (validate && !validate(tag)) return false

        onChange([...tags, tag])
        return true
      },
      [tags, onChange, allowDuplicates, maxTags, validate]
    )

    const removeTag = useCallback(
      (index: number) => {
        onChange(tags.filter((_, i) => i !== index))
      },
      [tags, onChange]
    )

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
          const val = inputValue.trim().replace(/,$/g, '')
          if (val) {
            e.preventDefault()
            if (addTag(val)) {
              setInputValue('')
            }
          }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
          removeTag(tags.length - 1)
        }
      },
      [inputValue, addTag, tags, removeTag]
    )

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
      },
      []
    )

    const errorId = error ? `${stableId}-error` : undefined

    return (
      <div
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(error ? { 'data-invalid': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(errorId ? { 'aria-describedby': errorId } : {})}
        {...rest}
      >
        <div className="ui-tag-input__wrapper">
          {tags.map((tag, i) => (
            <span key={`${tag}-${i}`} className="ui-tag-input__tag">
              <span>{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className="ui-tag-input__tag-remove"
                  onClick={() => removeTag(i)}
                  aria-label={`Remove ${tag}`}
                  tabIndex={-1}
                >
                  <CloseIcon />
                </button>
              )}
            </span>
          ))}

          <input
            type="text"
            className="ui-tag-input__field"
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={ariaLabel}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        {error && (
          <span id={errorId} className="ui-tag-input__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
TagInput.displayName = 'TagInput'
