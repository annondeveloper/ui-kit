import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteCoreChartCore { id: number; usage: number }

export interface LiteCoreChartProps extends HTMLAttributes<HTMLDivElement> {
  cores: LiteCoreChartCore[]
  columns?: number
  cellSize?: number
}

function usageColor(u: number): string {
  const hue = 155 - (Math.min(100, Math.max(0, u)) / 100) * 130
  return `oklch(65% 0.18 ${hue.toFixed(0)})`
}

/** Lite core chart — simple CSS grid of colored cells, no animation */
export const CoreChart = forwardRef<HTMLDivElement, LiteCoreChartProps>(
  ({ cores, columns, cellSize = 20, className, ...rest }, ref) => {
    const cols = columns ?? Math.ceil(Math.sqrt(cores.length))
    return (
      <div
        ref={ref}
        className={`ui-lite-core-chart${className ? ` ${className}` : ''}`}
        role="img"
        aria-label={`CPU cores: ${cores.length}`}
        style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 2 }}
        {...rest}
      >
        {cores.map((c) => (
          <div
            key={c.id}
            title={`Core ${c.id}: ${c.usage}%`}
            style={{ width: cellSize, height: cellSize, borderRadius: 3, background: usageColor(c.usage) }}
          />
        ))}
      </div>
    )
  }
)
CoreChart.displayName = 'CoreChart'
