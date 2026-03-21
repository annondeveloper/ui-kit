import { forwardRef, useMemo, type HTMLAttributes } from 'react'

export interface LiteSparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  data: number[]
  width?: number | string
  height?: number
  color?: string
}

/** Lite sparkline — simple SVG polyline, no animation */
export const Sparkline = forwardRef<HTMLDivElement, LiteSparklineProps>(
  ({ data, width = '100%', height = 32, color = 'var(--brand, oklch(65% 0.2 270))', className, ...rest }, ref) => {
    const points = useMemo(() => {
      if (!data.length) return ''
      const max = Math.max(...data)
      const min = Math.min(...data)
      const range = max - min || 1
      return data
        .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
        .join(' ')
    }, [data])

    return (
      <div ref={ref} className={`ui-lite-sparkline${className ? ` ${className}` : ''}`} {...rest}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={width} height={height}>
          <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    )
  }
)
Sparkline.displayName = 'Sparkline'
