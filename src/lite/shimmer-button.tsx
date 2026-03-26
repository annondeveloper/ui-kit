import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface LiteShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const ShimmerButton = forwardRef<HTMLButtonElement, LiteShimmerButtonProps>(
  ({ shimmerColor, size = 'md', children, className, style, ...rest }, ref) => (
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
)
ShimmerButton.displayName = 'ShimmerButton'
