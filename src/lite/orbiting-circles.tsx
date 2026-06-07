import { forwardRef, Children, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const orbitingCirclesStyles = css`
  @layer components {
    @scope (.ui-lite-orbiting-circles) {
      :scope {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        inline-size: calc(var(--orbit-radius, 100px) * 2 + 4rem);
        block-size: calc(var(--orbit-radius, 100px) * 2 + 4rem);
      }

      :scope::before {
        content: '';
        position: absolute;
        inset: 50%;
        inline-size: calc(var(--orbit-radius, 100px) * 2);
        block-size: calc(var(--orbit-radius, 100px) * 2);
        transform: translate(-50%, -50%);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: 50%;
        pointer-events: none;
      }

      .ui-lite-orbiting-circles__item {
        position: absolute;
        inset-block-start: 50%;
        inset-inline-start: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: -1rem;
        inline-size: 2rem;
        block-size: 2rem;
        transform: rotate(var(--orbit-angle, 0deg)) translateX(var(--orbit-radius, 100px)) rotate(calc(-1 * var(--orbit-angle, 0deg)));
      }
    }
  }
`

export interface LiteOrbitingCirclesProps extends HTMLAttributes<HTMLDivElement> {
  radius?: number
  children: ReactNode[]
}

export const OrbitingCircles = forwardRef<HTMLDivElement, LiteOrbitingCirclesProps>(
  ({ radius = 100, children, className, style, ...rest }, ref) => {
    useStyles('lite-orbiting-circles', orbitingCirclesStyles)
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
