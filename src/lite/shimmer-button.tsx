import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const shimmerButtonStyles = css`
  @layer components {
    @scope (.ui-lite-shimmer-button) {
      :scope {
        --shimmer-color: var(--shimmer-color, oklch(75% 0.15 270));
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: inherit;
        line-height: 1.4;
        color: var(--text-primary, oklch(95% 0 0));
        background: var(--bg-surface, oklch(12% 0.015 270));
        border: 1px solid var(--shimmer-color);
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        min-block-size: 2.75rem;
        min-inline-size: 2.75rem;
      }
      :scope:hover {
        background: oklch(100% 0 0 / 0.04);
      }
      :scope:focus-visible {
        outline: 2px solid var(--shimmer-color);
        outline-offset: 2px;
      }
      :scope:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      :scope[data-size="sm"] {
        padding: 0.25rem 0.5rem;
        font-size: 0.8125rem;
        min-block-size: 2rem;
      }
      :scope[data-size="lg"] {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        min-block-size: 3rem;
      }
      @media (forced-colors: active) {
        :scope { border: 2px solid ButtonText; }
      }
    }
  }
`

export interface LiteShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const ShimmerButton = forwardRef<HTMLButtonElement, LiteShimmerButtonProps>(
  ({ shimmerColor, size = 'md', children, className, style, ...rest }, ref) => {
    useStyles('lite-shimmer-button', shimmerButtonStyles)
    return (
      <button
        ref={ref}
        className={`ui-lite-shimmer-button${className ? ` ${className}` : ''}`}
        data-size={size}
        {...(shimmerColor ? { style: { ...style, '--shimmer-color': shimmerColor } as React.CSSProperties } : { style })}
        {...rest}
      >
        {children}
      </button>
    )
  }
)
ShimmerButton.displayName = 'ShimmerButton'
