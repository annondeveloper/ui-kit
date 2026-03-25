'use client'

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  error?: string
  motion?: 0 | 1 | 2 | 3
}

const toggleSwitchStyles = css`
  @layer components {
    @scope (.ui-toggle-switch) {
      :scope {
        display: inline-flex;
        flex-direction: column;
        gap: var(--space-xs, 0.25rem);
        position: relative;
        font-family: inherit;
      }

      :scope[data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Layout row: track + label */
      .ui-toggle-switch__row {
        display: inline-flex;
        align-items: center;
        gap: var(--space-sm, 0.5rem);
        cursor: pointer;
      }

      :scope[data-disabled] .ui-toggle-switch__row {
        cursor: not-allowed;
      }

      /* Hidden native input */
      .ui-toggle-switch__input {
        position: absolute;
        opacity: 0;
        inline-size: 0;
        block-size: 0;
        margin: 0;
        padding: 0;
      }

      /* Track: pill-shaped */
      .ui-toggle-switch__track {
        position: relative;
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.12));
        border-radius: var(--radius-full, 9999px);
        background: oklch(50% 0 0 / 0.15);
        transition: background 0.15s var(--ease-out, ease-out), border-color 0.15s var(--ease-out, ease-out);
      }

      /* Sizes — track dimensions */
      :scope[data-size="xs"] .ui-toggle-switch__track {
        inline-size: 22px;
        block-size: 12px;
      }
      :scope[data-size="sm"] .ui-toggle-switch__track {
        inline-size: 28px;
        block-size: 16px;
      }
      :scope[data-size="md"] .ui-toggle-switch__track {
        inline-size: 36px;
        block-size: 20px;
      }
      :scope[data-size="lg"] .ui-toggle-switch__track {
        inline-size: 44px;
        block-size: 24px;
      }
      :scope[data-size="xl"] .ui-toggle-switch__track {
        inline-size: 52px;
        block-size: 28px;
      }

      /* Thumb: white circle — positioned inside the border */
      .ui-toggle-switch__thumb {
        position: absolute;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0);
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.1));
        inset-block: 0;
        margin-block: auto;
        inset-inline-start: 2px;
      }

      /* Thumb sizes */
      :scope[data-size="xs"] .ui-toggle-switch__thumb {
        inline-size: 8px;
        block-size: 8px;
      }
      :scope[data-size="sm"] .ui-toggle-switch__thumb {
        inline-size: 12px;
        block-size: 12px;
      }
      :scope[data-size="md"] .ui-toggle-switch__thumb {
        inline-size: 16px;
        block-size: 16px;
      }
      :scope[data-size="lg"] .ui-toggle-switch__thumb {
        inline-size: 20px;
        block-size: 20px;
      }
      :scope[data-size="xl"] .ui-toggle-switch__thumb {
        inline-size: 24px;
        block-size: 24px;
      }

      /* Motion level 0: instant */
      :scope[data-motion="0"] .ui-toggle-switch__thumb {
        transition: none;
      }

      /* Motion level 1: simple transition */
      :scope[data-motion="1"] .ui-toggle-switch__thumb {
        transition: inset-inline-start 0.15s var(--ease-out, ease-out);
      }

      /* Motion level 2: spring easing */
      :scope[data-motion="2"] .ui-toggle-switch__thumb {
        transition: inset-inline-start 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Motion level 3: full physics with stretch */
      :scope[data-motion="3"] .ui-toggle-switch__thumb {
        transition: inset-inline-start 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                    inline-size 0.2s var(--ease-out, ease-out);
      }

      /* Checked state — track color */
      .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
        background: var(--brand, oklch(65% 0.2 270));
        border-color: var(--brand, oklch(65% 0.2 270));
      }

      /* Checked state — thumb slides right: track - borders(4) - thumb - gap(2) */
      :scope[data-size="xs"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        inset-inline-start: calc(22px - 4px - 8px - 2px); /* 8px */
      }
      :scope[data-size="sm"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        inset-inline-start: calc(28px - 4px - 12px - 2px); /* 10px */
      }
      :scope[data-size="md"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        inset-inline-start: calc(36px - 4px - 16px - 2px); /* 14px */
      }
      :scope[data-size="lg"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        inset-inline-start: calc(44px - 4px - 20px - 2px); /* 18px */
      }
      /* Checked state — thumb slides right (xl) */
      :scope[data-size="xl"] .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
        inset-inline-start: calc(52px - 4px - 24px - 2px); /* 22px */
      }

      /* Stretch effect at motion level 3 — thumb widens during active press */
      :scope[data-motion="3"] .ui-toggle-switch__track:active .ui-toggle-switch__thumb {
        inline-size: calc(100% - 6px);
      }

      /* Focus visible — glow ring on track */
      .ui-toggle-switch__input:focus-visible ~ .ui-toggle-switch__track {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        box-shadow: var(--shadow-glow, 0 0 0 4px oklch(65% 0.2 270 / 0.15));
      }

      /* Error state */
      :scope[data-error] .ui-toggle-switch__track {
        border-color: var(--status-critical, oklch(65% 0.25 25));
      }

      .ui-toggle-switch__error {
        display: block;
        font-size: var(--text-xs, 0.75rem);
        color: var(--status-critical, oklch(65% 0.25 25));
      }

      /* Label */
      .ui-toggle-switch__label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.4;
        user-select: none;
      }

      /* Touch targets — expanded invisible hit area, NOT enlarged visual */
      @media (pointer: coarse) {
        .ui-toggle-switch__track::before {
          content: '';
          position: absolute;
          inset: -12px;
          /* Ensures minimum 44px tap area without changing visual size */
        }
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-toggle-switch__track {
          border: 2px solid ButtonText;
        }
        .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
          background: Highlight;
          border-color: Highlight;
        }
        .ui-toggle-switch__thumb {
          background: ButtonText;
        }
        .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track .ui-toggle-switch__thumb {
          background: HighlightText;
        }
        .ui-toggle-switch__input:focus-visible ~ .ui-toggle-switch__track {
          outline: 2px solid Highlight;
        }
      }

      /* Print */
      @media print {
        .ui-toggle-switch__track {
          border: 2px solid;
        }
        .ui-toggle-switch__input:checked ~ .ui-toggle-switch__track {
          background: currentColor;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        .ui-toggle-switch__track {
          box-shadow: none;
        }
      }
    }
  }
`

export const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      label,
      size = 'md',
      error,
      motion: motionProp,
      className,
      disabled,
      checked,
      defaultChecked,
      id: idProp,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('toggle-switch', toggleSwitchStyles)
    const motionLevel = useMotionLevel(motionProp)
    const stableId = useStableId('toggle-switch')
    const inputId = idProp || stableId
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div
        className={cn(cls('root'), className)}
        data-size={size}
        data-motion={motionLevel}
        {...(disabled ? { 'data-disabled': '' } : {})}
        {...(error ? { 'data-error': '' } : {})}
      >
        <label htmlFor={inputId} className="ui-toggle-switch__row">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={inputId}
            className="ui-toggle-switch__input"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            aria-checked={checked !== undefined ? checked : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            {...rest}
          />
          <span className="ui-toggle-switch__track" aria-hidden="true">
            <span className="ui-toggle-switch__thumb" />
          </span>
          {label && (
            <span className="ui-toggle-switch__label">
              {label}
            </span>
          )}
        </label>
        {error && (
          <span id={errorId} className="ui-toggle-switch__error" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
ToggleSwitch.displayName = 'ToggleSwitch'
