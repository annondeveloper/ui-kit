import { forwardRef, type SVGAttributes } from 'react'
import { iconPaths } from './paths'

/** Union of all built-in icon names. */
export type IconName = keyof typeof iconPaths

/** Preset icon sizes or a numeric pixel value. */
export type IconSize = 'sm' | 'md' | 'lg' | number

export interface IconProps extends SVGAttributes<SVGElement> {
  /** Name of the icon to render. */
  name: IconName
  /**
   * Icon size — `'sm'` (16 px), `'md'` (20 px), `'lg'` (24 px), or a number.
   * @default 'md'
   */
  size?: IconSize
  /**
   * Accessible label. When provided the icon gets `role="img"` and
   * `aria-label`; otherwise it is marked `aria-hidden`.
   */
  label?: string
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
} as const

/**
 * Renders one of the ~50 built-in SVG icons.
 *
 * ```tsx
 * <Icon name="check" size="lg" label="Success" />
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', label, className, ...rest }, ref) => {
    const paths = iconPaths[name]
    if (!paths) return null

    const pxSize = typeof size === 'number' ? size : sizeMap[size]

    const accessibilityProps = label
      ? { role: 'img' as const, 'aria-label': label }
      : { 'aria-hidden': true as const }

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={pxSize}
        height={pxSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...accessibilityProps}
        {...rest}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    )
  },
)
Icon.displayName = 'Icon'
