import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteGeoPoint {
  id: string
  lat: number
  lng: number
  label?: string
  value?: number
  status?: 'ok' | 'warning' | 'critical' | 'unknown'
  tooltip?: ReactNode
}

export interface LiteGeoConnection {
  from: string
  to: string
  value?: number
  status?: 'ok' | 'warning' | 'critical'
}

export interface LiteGeoMapProps extends HTMLAttributes<HTMLDivElement> {
  points: LiteGeoPoint[]
  connections?: LiteGeoConnection[]
  projection?: 'mercator' | 'equirectangular'
  showLabels?: boolean
  interactive?: boolean
  onPointClick?: (point: LiteGeoPoint) => void
  onPointHover?: (point: LiteGeoPoint | null) => void
  height?: number | string
}

export const GeoMap = forwardRef<HTMLDivElement, LiteGeoMapProps>(
  ({ points, connections, projection = 'equirectangular', showLabels, interactive, height, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-geo-map${className ? ` ${className}` : ''}`}
      data-projection={projection}
      data-point-count={points.length}
      {...(showLabels && { 'data-show-labels': '' })}
      {...(interactive && { 'data-interactive': '' })}
      style={{ ...style, ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }) }}
      {...rest}
    />
  )
)
GeoMap.displayName = 'GeoMap'
