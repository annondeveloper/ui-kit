'use client'

import { forwardRef } from 'react'
import { MultiSelect as BaseMultiSelect, type MultiSelectProps, type MultiSelectOption } from '../components/multi-select'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumMultiSelectStyles = css`
  @layer premium {
    @scope (.ui-premium-multi-select) {
      :scope {
        display: contents;
      }

      /* Aurora glow on focus */
      :scope .ui-multi-select__trigger:focus-within {
        box-shadow:
          0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15),
          0 0 16px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
      }

      /* Tag spring entrance */
      :scope:not([data-motion="0"]) .ui-multi-select__tag {
        animation: ui-premium-multi-select-tag-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }

      @keyframes ui-premium-multi-select-tag-enter {
        from {
          opacity: 0;
          transform: scale(0.5);
        }
        70% {
          transform: scale(1.06);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Tag glow */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-multi-select__tag {
        box-shadow: 0 0 8px -2px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
      }

      /* Dropdown enhanced shadow */
      :scope .ui-multi-select__dropdown {
        box-shadow:
          var(--shadow-lg, 0 8px 24px oklch(0% 0 0 / 0.3)),
          0 0 20px -4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      }

      /* Option hover glow at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-multi-select__option:not([data-disabled]):hover {
        box-shadow: inset 0 0 0 1px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      }

      /* Checkbox spring animation at motion 3 */
      :scope[data-motion="3"] .ui-multi-select__checkbox {
        transition: background 0.1s, border-color 0.1s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      :scope[data-motion="3"] .ui-multi-select__checkbox[data-checked] {
        transform: scale(1.1);
      }

      /* Chevron spring rotation */
      :scope:not([data-motion="0"]) .ui-multi-select__chevron {
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      /* Dropdown entrance with spring at motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-multi-select__dropdown {
        animation: ui-premium-multi-select-dropdown-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes ui-premium-multi-select-dropdown-enter {
        from {
          opacity: 0;
          transform: translateY(-6px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      /* Motion 0: disable everything */
      :scope[data-motion="0"] .ui-multi-select__tag {
        animation: none;
      }
      :scope[data-motion="0"] .ui-multi-select__checkbox {
        transition: background 0.1s, border-color 0.1s;
      }

      @media (prefers-reduced-motion: reduce) {
        :scope .ui-multi-select__tag { animation: none !important; }
        :scope .ui-multi-select__dropdown { animation: none !important; }
        :scope .ui-multi-select__checkbox { transition: background 0.1s, border-color 0.1s !important; }
      }

      @media (forced-colors: active) {
        :scope .ui-multi-select__trigger:focus-within {
          box-shadow: none;
        }
        :scope .ui-multi-select__tag {
          box-shadow: none;
        }
        :scope .ui-multi-select__dropdown {
          box-shadow: none;
        }
      }
    }
  }
`

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ motion: motionProp, ...rest }, ref) => {
    const motionLevel = useMotionLevel(motionProp)
    useStyles('premium-multi-select', premiumMultiSelectStyles)

    return (
      <div className="ui-premium-multi-select" data-motion={motionLevel}>
        <BaseMultiSelect ref={ref} motion={motionProp} {...rest} />
      </div>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'

export type { MultiSelectProps, MultiSelectOption } from '../components/multi-select'
