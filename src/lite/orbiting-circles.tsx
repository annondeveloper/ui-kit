import { forwardRef, Children, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteOrbitingCirclesProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number
  children: ReactNode[]
}

export const OrbitingCircles = forwardRef<HTMLDivElement, LiteOrbitingCirclesProps>(
  ({ radius = 100, children, className, style, ...rest }, ref) => {
    const items = Children.toArray(children)
    const angleStep = 360 / items.length

    return (
      <div
        ref={ref}
        className={`ui-lite-orbiting-circles${className ? ` ${className}` : ''}`}
        data-radius={radius}
        style={{ ...style, '--orbit-radius': `${radius}px` } as React.CSSProperties}
        role="presentation"
        {...rest}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="ui-lite-orbiting-circles__item"
            data-angle={i * angleStep}
            style={{ '--orbit-angle': `${i * angleStep}deg` } as React.CSSProperties}
          >
            {child}
          </div>
        ))}
      </div>
    )
  }
)
OrbitingCircles.displayName = 'OrbitingCircles'
