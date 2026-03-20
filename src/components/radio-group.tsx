'use client'

import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface RadioOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
  motion?: 0 | 1 | 2 | 3
}

const radioGroupStyles = css`
  @layer components {
    @scope (.ui-radio-group) {
      :scope {
        display: flex;
        flex-direction: column;
        border: none;
        padding: 0;
        margin: 0;
        font-family: inherit;
      }

      /* Legend */
      .ui-radio-group__legend {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        margin-block-end: var(--space-sm, 0.5rem);
        padding: 0;
      }

      /* Options container */
      .ui-radio-group__options {
        display: flex;
        gap: var(--space-sm, 0.5rem);
      }

      :scope[data-orientation="vertical"] .ui-radio-group__options {
        flex-direction: column;
      }
      :scope[data-orientation="horizontal"] .ui-radio-group__options {
        flex-direction: row;
        flex-wrap: wrap;
      }

      /* Individual option */
      .ui-radio-group__option {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        cursor: pointer;
        position: relative;
      }

      .ui-radio-group__option[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Hidden native radio */
      .ui-radio-group__input {
        position: absolute;
        opacity: 0;
        inline-size: 0;
        block-size: 0;
        margin: 0;
        padding: 0;
      }

      /* Custom radio circle */
      .ui-radio-group__circle {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-full, 9999px);
        background: transparent;
        transition: border-color 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-radio-group__circle {
        inline-size: 16px;
        block-size: 16px;
      }
      :scope[data-size="md"] .ui-radio-group__circle {
        inline-size: 20px;
        block-size: 20px;
      }
      :scope[data-size="lg"] .ui-radio-group__circle {
        inline-size: 24px;
        block-size: 24px;
      }

      /* Inner dot */
      .ui-radio-group__dot {
        inline-size: 45%;
        block-size: 45%;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        transform: scale(0);
        transition: transform 0.15s var(--ease-out, ease-out);
      }

      /* Checked state */
      .ui-radio-group__input:checked ~ .ui-radio-group__circle {
        border-color: var(--brand, oklch(65% 0.2 270));
        background: var(--brand, oklch(65% 0.2 270));
      }

      .ui-radio-group__input:checked ~ .ui-radio-group__circle .ui-radio-group__dot {
        transform: scale(1);
      }

      /* Animated dot — motion level 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-radio-group__dot {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Focus visible */
      .ui-radio-group__input:focus-visible ~ .ui-radio-group__circle {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Label */
      .ui-radio-group__label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      /* Error */
      :scope[data-error] .ui-radio-group__circle {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      .ui-radio-group__error {
        display: block;
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        margin-block-start: var(--space-xs, 0.25rem);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-radio-group__circle {
          min-inline-size: 44px;
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-radio-group__circle {
          border: 2px solid ButtonText;
        }
        .ui-radio-group__input:checked ~ .ui-radio-group__circle {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-radio-group__input:focus-visible ~ .ui-radio-group__circle {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-radio-group__circle {
          border: 2px solid;
        }
        .ui-radio-group__input:checked ~ .ui-radio-group__circle {
          background: currentColor;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-radio-group__circle {
          box-shadow: none;
        }
      }
    }
  }
`

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      orientation = 'vertical',
      size = 'md',
      label,
      error,
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('radio-group', radioGroupStyles)
    const motionLevel = useMotionLevel(motionProp)
    const groupId = useStableId('radio')
    const optionsRef = useRef<HTMLDivElement>(null)

    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const currentValue = isControlled ? controlledValue : internalValue

    // Custom roving tabindex for radio group
    useEffect(() => {
      const container = optionsRef.current
      if (!container) return

      const getItems = () =>
        Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]:not(:disabled)'))

      const onKeyDown = (e: KeyboardEvent) => {
        const items = getItems()
        if (items.length === 0) return

        const isHorizontal = orientation === 'horizontal'
        const nextKeys = isHorizontal ? ['ArrowRight'] : ['ArrowDown']
        const prevKeys = isHorizontal ? ['ArrowLeft'] : ['ArrowUp']

        const currentIdx = items.indexOf(document.activeElement as HTMLInputElement)
        if (currentIdx === -1) return

        let newIndex = currentIdx

        if (nextKeys.includes(e.key)) {
          e.preventDefault()
          newIndex = currentIdx + 1
          if (newIndex >= items.length) newIndex = 0
        } else if (prevKeys.includes(e.key)) {
          e.preventDefault()
          newIndex = currentIdx - 1
          if (newIndex < 0) newIndex = items.length - 1
        } else if (e.key === 'Home') {
          e.preventDefault()
          newIndex = 0
        } else if (e.key === 'End') {
          e.preventDefault()
          newIndex = items.length - 1
        } else {
          return
        }

        items[currentIdx].setAttribute('tabindex', '-1')
        items[newIndex].setAttribute('tabindex', '0')
        items[newIndex].focus()
      }

      container.addEventListener('keydown', onKeyDown)
      return () => container.removeEventListener('keydown', onKeyDown)
    }, [optionsRef, orientation])

    const handleChange = useCallback(
      (optionValue: string) => {
        if (!isControlled) {
          setInternalValue(optionValue)
        }
        onChange?.(optionValue)
      },
      [isControlled, onChange]
    )

    return (
      <fieldset
        ref={ref}
        className={cn(cls('root'), className)}
        data-size={size}
        data-orientation={orientation}
        data-motion={motionLevel}
        {...(error ? { 'data-error': '' } : {})}
        {...rest}
      >
        {label && <legend className="ui-radio-group__legend">{label}</legend>}
        <div className="ui-radio-group__options" ref={optionsRef} role="radiogroup">
          {options.map((option) => {
            const optionId = `${groupId}-${option.value}`
            const isChecked = currentValue === option.value

            return (
              <label
                key={option.value}
                className="ui-radio-group__option"
                htmlFor={optionId}
                {...(option.disabled ? { 'data-disabled': '' } : {})}
              >
                <input
                  type="radio"
                  role="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={option.disabled}
                  className="ui-radio-group__input"
                  onChange={() => handleChange(option.value)}
                  tabIndex={isChecked ? 0 : -1}
                />
                <span className="ui-radio-group__circle">
                  <span className="ui-radio-group__dot" />
                </span>
                <span className="ui-radio-group__label">{option.label}</span>
              </label>
            )
          })}
        </div>
        {error && (
          <span className="ui-radio-group__error" role="alert">
            {error}
          </span>
        )}
      </fieldset>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'
