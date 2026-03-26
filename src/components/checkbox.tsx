'use client'

import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  indeterminate?: boolean
  error?: string
  motion?: 0 | 1 | 2 | 3
}

const checkboxStyles = css`
  @layer components {
    @scope (.ui-checkbox) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        position: relative;
        cursor: pointer;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Hidden native input */
      .ui-checkbox__input {
        position: absolute;
        opacity: 0;
        inline-size: 0;
        block-size: 0;
        margin: 0;
        padding: 0;
      }

      /* Custom checkbox visual */
      .ui-checkbox__box {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-sm, 0.25rem);
        background: transparent;
        transition: all 0.15s var(--ease-out, ease-out);
      }

      /* Sizes */
      :scope[data-size="xs"] .ui-checkbox__box {
        inline-size: 14px;
        block-size: 14px;
      }
      :scope[data-size="sm"] .ui-checkbox__box {
        inline-size: 16px;
        block-size: 16px;
      }
      :scope[data-size="md"] .ui-checkbox__box {
        inline-size: 20px;
        block-size: 20px;
      }
      :scope[data-size="lg"] .ui-checkbox__box {
        inline-size: 24px;
        block-size: 24px;
      }
      :scope[data-size="xl"] .ui-checkbox__box {
        inline-size: 28px;
        block-size: 28px;
      }

      /* Checked state */
      .ui-checkbox__input:checked ~ .ui-checkbox__box {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Indeterminate state */
      :scope[data-indeterminate] .ui-checkbox__box {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Checkmark SVG */
      .ui-checkbox__check {
        inline-size: 100%;
        block-size: 100%;
        color: var(--text-on-brand);
        opacity: 0;
        transform: scale(0.5);
        transition: opacity 0.1s, transform 0.15s var(--ease-out, ease-out);
      }

      .ui-checkbox__input:checked ~ .ui-checkbox__box .ui-checkbox__check {
        opacity: 1;
        transform: scale(1);
      }

      /* Animated check draw — motion level 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-checkbox__check path {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        transition: stroke-dashoffset 0.25s var(--ease-out, ease-out) 0.05s;
      }

      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-checkbox__input:checked ~ .ui-checkbox__box .ui-checkbox__check path {
        stroke-dashoffset: 0;
      }

      /* Indeterminate dash */
      .ui-checkbox__dash {
        inline-size: 60%;
        block-size: 2px;
        background: var(--text-on-brand);
        border-radius: 1px;
        opacity: 0;
        transition: opacity 0.1s;
      }

      :scope[data-indeterminate] .ui-checkbox__dash {
        opacity: 1;
      }

      :scope[data-indeterminate] .ui-checkbox__check {
        opacity: 0 !important;
        transform: scale(0.5) !important;
      }

      /* Focus visible */
      .ui-checkbox__input:focus-visible ~ .ui-checkbox__box {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Error state */
      :scope[data-error] .ui-checkbox__box {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      .ui-checkbox__error {
        display: block;
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
        margin-block-start: var(--space-xs, 0.25rem);
        padding-inline-start: calc(20px + var(--space-sm, 0.5rem));
      }

      /* Label */
      .ui-checkbox__label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
        padding-block-start: 1px;
      }

      /* Touch targets — parent scope is the tap target, not the box visual */
      @media (pointer: coarse) {
        :scope {
          min-block-size: 44px;
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-checkbox__box {
          border: 2px solid ButtonText;
        }
        .ui-checkbox__input:checked ~ .ui-checkbox__box {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-checkbox__input:focus-visible ~ .ui-checkbox__box {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-checkbox__box {
          border: 2px solid;
        }
        .ui-checkbox__input:checked ~ .ui-checkbox__box {
          background: currentColor;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-checkbox__box {
          box-shadow: none;
        }
      }
    }
  }
`

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = 'md',
      indeterminate = false,
      error,
      motion: motionProp,
      className,
      disabled,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('checkbox', checkboxStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('checkbox')
    const inputId = idProp || stableId
    const errorId = error ? `${inputId}-error` : undefined

    // Handle indeterminate state via ref
    const internalRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate
      }
    }, [indeterminate])

    const setRefs = (el: HTMLInputElement | null) => {
      internalRef.current = el
      if (typeof ref === 'function') {
        ref(el)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
      }
    }

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(indeterminate ? { 'data-indeterminate': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(error ? { 'data-error': '' } : {})}
      >
        <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 'inherit' }}>
          <input
            ref={setRefs}
            type="checkbox"
            id={inputId}
            className="ui-checkbox__input"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            {...rest}
          />
          <span className="ui-checkbox__box">
            <svg
              className="ui-checkbox__check"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8.5L6.5 12L13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ui-checkbox__dash" aria-hidden="true" />
          </span>
          {label && (
            <label htmlFor={inputId} className="ui-checkbox__label">
              {label}
            </label>
          )}
        </div>
        {error && (
          <span id={errorId} className="ui-checkbox__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'
