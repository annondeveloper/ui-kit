import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  alt?: string
  fallback?: ReactNode
}

export const Avatar = forwardRef<HTMLDivElement, LiteAvatarProps>(
  ({ size = 'md', src, alt, fallback, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-avatar${className ? ` ${className}` : ''}`}
      data-size={size}
      {...rest}
    >
      {src ? <img src={src} alt={alt ?? ''} /> : (fallback ?? children)}
    </div>
  )
)
Avatar.displayName = 'Avatar'
