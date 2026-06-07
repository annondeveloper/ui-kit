import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const skeletonStyles = css`
  @layer components {
    @scope (.ui-lite-skeleton) {
      :scope {
        display: block;
        inline-size: 100%;
        block-size: 1rem;
        background: var(--bg-surface, oklch(25% 0.02 270));
        border: 1px solid oklch(100% 0 0 / 0.03);
        border-radius: var(--radius-md, 0.5rem);
      }

      :scope[data-variant="text"] {
        block-size: 0.875rem;
        border-radius: var(--radius-sm, 0.25rem);
      }
      :scope[data-variant="circular"] {
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-variant="rectangular"] {
        border-radius: var(--radius-md, 0.5rem);
      }
      :scope[data-variant="rounded"] {
        border-radius: var(--radius-md, 0.5rem);
      }

      /* Multi-line text container holds individual lines */
      :scope[data-lines] {
        display: flex;
        flex-direction: column;
        gap: var(--skeleton-line-gap, 0.5rem);
        background: transparent;
        border: none;
        block-size: auto;
      }

      .ui-lite-skeleton__line {
        display: block;
        block-size: var(--skeleton-line-height, 0.875rem);
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(25% 0.02 270));
        border: 1px solid oklch(100% 0 0 / 0.03);
      }
      .ui-lite-skeleton__line:last-child {
        inline-size: 75%;
      }
    }

    @scope (.ui-lite-skeleton__count-wrapper) {
      :scope {
        display: flex;
        gap: 0.625rem;
      }
      :scope[data-direction="column"] {
        flex-direction: column;
      }
      :scope[data-direction="row"] {
        flex-direction: row;
      }
    }
  }
`

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
    useStyles('lite-skeleton', skeletonStyles)
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
