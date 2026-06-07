import { forwardRef, useState, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

type DensityValue = 'compact' | 'comfortable' | 'spacious'

const densitySelectorStyles = css`
  @layer components {
    @scope (.ui-lite-density-selector) {
      :scope {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-elevated, oklch(50% 0 0 / 0.08));
        border: 1px solid var(--border-default, oklch(100% 0 0 / 0.1));
        font-family: inherit;
      }
      :scope[data-size="sm"] {
        padding: 2px;
      }
      .ui-lite-density-selector__option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding-block: 0.375rem;
        padding-inline: 0.75rem;
        min-block-size: 34px;
        border: none;
        border-radius: var(--radius-full, 9999px);
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        font-family: inherit;
        font-size: var(--text-sm, 0.875rem);
        font-weight: 500;
        white-space: nowrap;
        text-transform: capitalize;
        cursor: pointer;
        user-select: none;
      }
      :scope[data-size="sm"] .ui-lite-density-selector__option {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        min-block-size: 28px;
        font-size: var(--text-xs, 0.75rem);
      }
      .ui-lite-density-selector__option:hover:not([data-active]) {
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-lite-density-selector__option[data-active] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand, oklch(100% 0 0));
      }
      .ui-lite-density-selector__option:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }
      @media (forced-colors: active) {
        .ui-lite-density-selector__option[data-active] {
          outline: 2px solid ButtonText;
        }
      }
    }
  }
`

export interface LiteDensitySelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: DensityValue
  defaultValue?: DensityValue
  onChange?: (value: DensityValue) => void
  size?: 'sm' | 'md'
}

const OPTIONS: DensityValue[] = ['compact', 'comfortable', 'spacious']

export const DensitySelector = forwardRef<HTMLDivElement, LiteDensitySelectorProps>(
  ({ value, defaultValue = 'comfortable', onChange, size = 'md', className, ...rest }, ref) => {
    useStyles('lite-density-selector', densitySelectorStyles)
    const [internal, setInternal] = useState<DensityValue>(defaultValue)
    const current = value ?? internal
    return (
      <div ref={ref} role="radiogroup" aria-label="UI density"
        className={`ui-lite-density-selector${className ? ` ${className}` : ''}`} data-size={size} {...rest}>
        {OPTIONS.map((opt) => (
          <button key={opt} type="button" role="radio" aria-checked={opt === current}
            data-active={opt === current || undefined}
            className="ui-lite-density-selector__option"
            onClick={() => { if (value === undefined) setInternal(opt); onChange?.(opt) }}>
            {opt}
          </button>
        ))}
      </div>
    )
  }
)
DensitySelector.displayName = 'DensitySelector'
