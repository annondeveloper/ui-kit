import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  lineHeight?: string | number
  lineGap?: string | number
  animate?: boolean
  animation?: 'shimmer' | 'pulse' | 'wave'
  radius?: string | number
  count?: number
  direction?: 'row' | 'column'
  speed?: 'slow' | 'normal' | 'fast'
}

function toCssValue(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

export const Skeleton = forwardRef<HTMLDivElement, LiteSkeletonProps>(
  (
    {
      variant = 'rectangular',
      width,
      height,
      lines,
      lineHeight,
      lineGap,
      animate = true,
      animation = 'shimmer',
      radius,
      count,
      direction = 'row',
      speed = 'normal',
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const inlineStyle = {
      ...style,
      ...(width != null ? { inlineSize: toCssValue(width) } : {}),
      ...(height != null ? { blockSize: toCssValue(height) } : {}),
      ...(radius != null ? { borderRadius: toCssValue(radius) } : {}),
      ...(lineHeight != null ? { '--skeleton-line-height': toCssValue(lineHeight) } : {}),
      ...(lineGap != null ? { '--skeleton-line-gap': toCssValue(lineGap) } : {}),
    } as React.CSSProperties

    const dataAttrs = {
      'data-variant': variant,
      'data-animate': animate,
      'data-animation': animation,
      'data-speed': speed,
    }

    // Count: render multiple skeletons in a wrapper
    if (count != null && count > 1) {
      return (
        <div
          className="ui-lite-skeleton__count-wrapper"
          data-direction={direction}
          aria-hidden="true"
        >
          {Array.from({ length: count }, (_, i) => (
            <Skeleton
              key={i}
              variant={variant}
              width={width}
              height={height}
              lines={lines}
              lineHeight={lineHeight}
              lineGap={lineGap}
              animate={animate}
              animation={animation}
              radius={radius}
              speed={speed}
              className={className}
              style={style}
            />
          ))}
        </div>
      )
    }

    // Multi-line text mode
    if (variant === 'text' && lines != null && lines > 0) {
      return (
        <div
          ref={ref}
          className={`ui-lite-skeleton${className ? ` ${className}` : ''}`}
          {...dataAttrs}
          data-lines=""
          aria-hidden="true"
          style={inlineStyle}
          {...rest}
        >
          {Array.from({ length: lines }, (_, i) => (
            <span key={i} className="ui-lite-skeleton__line" />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-skeleton${className ? ` ${className}` : ''}`}
        {...dataAttrs}
        aria-hidden="true"
        style={inlineStyle}
        {...rest}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'
