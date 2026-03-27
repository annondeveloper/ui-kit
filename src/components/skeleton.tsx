'use client'

import { forwardRef, type HTMLAttributes, type CSSProperties } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
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
  motion?: 0 | 1 | 2 | 3
}

const skeletonStyles = css`
  @layer components {
    @scope (.ui-skeleton) {
      :scope {
        display: block;
        overflow: hidden;
        background: var(--bg-surface, oklch(25% 0.02 270));
        border: 1px solid oklch(100% 0 0 / 0.03);
      }

      /* Shimmer animation */
      :scope[data-animate="true"][data-animation="shimmer"]:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 0%,
          transparent 35%,
          oklch(100% 0 0 / 0.06) 45%,
          oklch(100% 0 0 / 0.12) 50%,
          oklch(100% 0 0 / 0.06) 55%,
          transparent 65%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-skeleton-shimmer var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      /* Wave animation */
      :scope[data-animate="true"][data-animation="wave"]:not([data-motion="0"])::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 0%,
          transparent 35%,
          oklch(100% 0 0 / 0.06) 45%,
          oklch(100% 0 0 / 0.12) 50%,
          oklch(100% 0 0 / 0.06) 55%,
          transparent 65%,
          transparent 100%
        );
        animation: ui-skeleton-wave var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      /* Pulse animation */
      :scope[data-animate="true"][data-animation="pulse"]:not([data-motion="0"]) {
        animation: ui-skeleton-pulse var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      :scope[data-animate="true"] {
        position: relative;
      }

      /* Speed variants */
      :scope[data-speed="slow"] {
        --skeleton-speed: 2.4s;
      }
      :scope[data-speed="normal"] {
        --skeleton-speed: 1.6s;
      }
      :scope[data-speed="fast"] {
        --skeleton-speed: 1s;
      }

      /* Variants */
      :scope[data-variant="text"] {
        border-radius: var(--radius-sm, 0.25rem);
        block-size: 0.875rem;
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

      /* Multi-line container */
      :scope[data-lines] {
        display: flex;
        flex-direction: column;
        gap: var(--skeleton-line-gap, 0.625rem);
        background: transparent;
        block-size: auto;
        border-radius: 0;
        border: none;
      }

      :scope[data-lines]::after {
        display: none;
      }

      /* Pulse on multi-line container should not apply */
      :scope[data-lines][data-animation="pulse"] {
        animation: none;
      }

      /* Individual lines */
      .ui-skeleton__line {
        display: block;
        block-size: var(--skeleton-line-height, 0.875rem);
        border-radius: var(--radius-sm, 0.25rem);
        background: var(--bg-surface, oklch(25% 0.02 270));
        border: 1px solid oklch(100% 0 0 / 0.03);
        position: relative;
        overflow: hidden;
      }

      /* Shimmer on lines */
      :scope[data-animate="true"][data-animation="shimmer"]:not([data-motion="0"]) .ui-skeleton__line::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 0%,
          transparent 35%,
          oklch(100% 0 0 / 0.06) 45%,
          oklch(100% 0 0 / 0.12) 50%,
          oklch(100% 0 0 / 0.06) 55%,
          transparent 65%,
          transparent 100%
        );
        background-size: 200% 100%;
        animation: ui-skeleton-shimmer var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      /* Wave on lines */
      :scope[data-animate="true"][data-animation="wave"]:not([data-motion="0"]) .ui-skeleton__line::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          105deg,
          transparent 0%,
          transparent 35%,
          oklch(100% 0 0 / 0.06) 45%,
          oklch(100% 0 0 / 0.12) 50%,
          oklch(100% 0 0 / 0.06) 55%,
          transparent 65%,
          transparent 100%
        );
        animation: ui-skeleton-wave var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      /* Pulse on lines */
      :scope[data-animate="true"][data-animation="pulse"]:not([data-motion="0"]) .ui-skeleton__line {
        animation: ui-skeleton-pulse var(--skeleton-speed, 1.6s) var(--ease-in-out, ease-in-out) infinite;
      }

      /* Count container */
      .ui-skeleton__count-wrapper {
        display: flex;
        gap: 0.625rem;
      }

      .ui-skeleton__count-wrapper[data-direction="column"] {
        flex-direction: column;
      }

      .ui-skeleton__count-wrapper[data-direction="row"] {
        flex-direction: row;
      }

      /* Forced colors */
      @media (forced-colors: active) {
        :scope {
          border: 2px solid ButtonText;
        }
        .ui-skeleton__line {
          border: 1px solid ButtonText;
        }
      }

      /* Print */
      @media print {
        :scope {
          border: 1px solid;
        }
        :scope::after,
        .ui-skeleton__line::after {
          display: none;
        }
      }

      /* Reduced data */
      @media (prefers-reduced-data: reduce) {
        :scope::after,
        .ui-skeleton__line::after {
          display: none;
        }
        :scope[data-animation="pulse"] {
          animation: none;
        }
        .ui-skeleton__line {
          animation: none;
        }
      }
    }

    @keyframes ui-skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes ui-skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @keyframes ui-skeleton-wave {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(100%); }
    }
  }
`

// Deterministic "random" widths for natural-looking multi-line text
function getLineWidth(lineIndex: number, totalLines: number): string | undefined {
  if (totalLines <= 1) return undefined
  if (lineIndex === totalLines - 1) {
    // Last line: 45-70% range, deterministic based on totalLines
    const widths = [55, 48, 62, 45, 58, 67, 52, 70, 47, 63]
    return `${widths[totalLines % widths.length]}%`
  }
  if (lineIndex === totalLines - 2 && totalLines > 2) {
    // Second-to-last: 70-90% range
    const widths = [82, 75, 88, 78, 85, 72, 90, 77, 83, 70]
    return `${widths[totalLines % widths.length]}%`
  }
  return undefined
}

function toCssValue(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
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
      motion: motionProp,
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('skeleton', skeletonStyles)
    const motionLevel = useMotionLevel(motionProp)

    const inlineStyle: CSSProperties = {
      ...style,
      ...(width != null ? { inlineSize: toCssValue(width) } : {}),
      ...(height != null ? { blockSize: toCssValue(height) } : {}),
      ...(radius != null ? { borderRadius: toCssValue(radius) } : {}),
      ...(lineHeight != null ? { '--skeleton-line-height': toCssValue(lineHeight) } as CSSProperties : {}),
      ...(lineGap != null ? { '--skeleton-line-gap': toCssValue(lineGap) } as CSSProperties : {}),
    }

    const dataAttrs = {
      'data-variant': variant,
      'data-animate': animate,
      'data-animation': animation,
      'data-motion': motionLevel,
      'data-speed': speed,
    }

    const renderSingle = () => {
      // Multi-line text mode
      if (variant === 'text' && lines != null && lines > 0) {
        return (
          <div
            ref={ref}
            className={cn(cls('root'), className)}
            {...dataAttrs}
            data-lines=""
            aria-hidden="true"
            style={inlineStyle}
            {...rest}
          >
            {Array.from({ length: lines }, (_, i) => {
              const lineWidth = getLineWidth(i, lines)
              return (
                <span
                  key={i}
                  className="ui-skeleton__line"
                  style={lineWidth ? { inlineSize: lineWidth } : undefined}
                />
              )
            })}
          </div>
        )
      }

      return (
        <div
          ref={ref}
          className={cn(cls('root'), className)}
          {...dataAttrs}
          aria-hidden="true"
          style={inlineStyle}
          {...rest}
        />
      )
    }

    // Count support: render multiple skeletons in a flex container
    if (count != null && count > 1) {
      return (
        <div
          className="ui-skeleton__count-wrapper"
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
              motion={motionProp}
              className={className}
              style={style}
            />
          ))}
        </div>
      )
    }

    return renderSingle()
  }
)
Skeleton.displayName = 'Skeleton'
