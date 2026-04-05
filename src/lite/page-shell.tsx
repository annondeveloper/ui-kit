import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LitePageShellProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

const MAX_WIDTHS: Record<string, string> = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  full: '100%',
}

const PADDINGS: Record<string, string> = {
  none: '0',
  sm: '0.5rem 1rem',
  md: '1rem 2rem',
  lg: '1.5rem 3rem',
}

export const PageShell = forwardRef<HTMLDivElement, LitePageShellProps>(
  ({ maxWidth = 'lg', padding = 'md', children, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-page-shell${className ? ` ${className}` : ''}`}
      data-max-width={maxWidth}
      data-padding={padding}
      style={{
        width: '100%',
        maxInlineSize: MAX_WIDTHS[maxWidth] ?? '64rem',
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: PADDINGS[padding] ?? '1rem 2rem',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
)
PageShell.displayName = 'PageShell'
