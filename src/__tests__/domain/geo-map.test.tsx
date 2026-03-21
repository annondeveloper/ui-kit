import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { GeoMap, geoToSvg } from '../../domain/geo-map'
import type { GeoPoint, GeoConnection } from '../../domain/geo-map'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

describe('GeoMap', () => {
  const samplePoints: GeoPoint[] = [
    { id: 'ny', lat: 40.7, lng: -74.0, label: 'New York', status: 'ok', value: 100 },
    { id: 'lon', lat: 51.5, lng: -0.1, label: 'London', status: 'warning', value: 75 },
    { id: 'tok', lat: 35.7, lng: 139.7, label: 'Tokyo', status: 'critical', value: 50 },
  ]

  const sampleConnections: GeoConnection[] = [
    { from: 'ny', to: 'lon', value: 500, status: 'ok' },
    { from: 'lon', to: 'tok', status: 'warning' },
  ]

  // ─── Geo Projection ───────────────────────────────────────────────────

  describe('geoToSvg', () => {
    it('converts 0,0 to center of map', () => {
      const { x, y } = geoToSvg(0, 0)
      expect(x).toBe(180)
      expect(y).toBe(90)
    })

    it('converts north pole', () => {
      const { x, y } = geoToSvg(90, 0)
      expect(x).toBe(180)
      expect(y).toBe(0)
    })

    it('converts south pole', () => {
      const { x, y } = geoToSvg(-90, 0)
      expect(x).toBe(180)
      expect(y).toBe(180)
    })

    it('converts date line east', () => {
      const { x, y } = geoToSvg(0, 180)
      expect(x).toBe(360)
      expect(y).toBe(90)
    })

    it('converts date line west', () => {
      const { x, y } = geoToSvg(0, -180)
      expect(x).toBe(0)
      expect(y).toBe(90)
    })

    it('converts New York approximately', () => {
      const { x, y } = geoToSvg(40.7, -74.0)
      expect(x).toBeCloseTo(106, 0)
      expect(y).toBeCloseTo(49.3, 0)
    })
  })

  // ─── Rendering ─────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      expect(container.querySelector('.ui-geo-map')).toBeInTheDocument()
    })

    it('renders SVG element', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders world map path', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      expect(container.querySelector('.ui-geo-map__world')).toBeInTheDocument()
    })

    it('renders SVG with 360x180 viewBox', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('viewBox')).toBe('0 0 360 180')
    })
  })

  // ─── Points ───────────────────────────────────────────────────────────

  describe('points', () => {
    it('renders point circles', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      const points = container.querySelectorAll('.ui-geo-map__point')
      expect(points.length).toBe(3)
    })

    it('positions points correctly', () => {
      const { container } = render(
        <GeoMap points={[{ id: 'test', lat: 0, lng: 0 }]} />
      )
      const point = container.querySelector('.ui-geo-map__point')
      expect(point?.getAttribute('cx')).toBe('180')
      expect(point?.getAttribute('cy')).toBe('90')
    })

    it('applies ok status color class', () => {
      const { container } = render(
        <GeoMap points={[{ id: 'p', lat: 0, lng: 0, status: 'ok' }]} />
      )
      expect(container.querySelector('.ui-geo-map__point[data-status="ok"]')).toBeInTheDocument()
    })

    it('applies warning status color class', () => {
      const { container } = render(
        <GeoMap points={[{ id: 'p', lat: 0, lng: 0, status: 'warning' }]} />
      )
      expect(container.querySelector('.ui-geo-map__point[data-status="warning"]')).toBeInTheDocument()
    })

    it('applies critical status color class', () => {
      const { container } = render(
        <GeoMap points={[{ id: 'p', lat: 0, lng: 0, status: 'critical' }]} />
      )
      expect(container.querySelector('.ui-geo-map__point[data-status="critical"]')).toBeInTheDocument()
    })

    it('applies unknown status color class', () => {
      const { container } = render(
        <GeoMap points={[{ id: 'p', lat: 0, lng: 0, status: 'unknown' }]} />
      )
      expect(container.querySelector('.ui-geo-map__point[data-status="unknown"]')).toBeInTheDocument()
    })

    it('sizes points by value', () => {
      const { container } = render(
        <GeoMap points={[
          { id: 'small', lat: 0, lng: 0, value: 10 },
          { id: 'big', lat: 10, lng: 10, value: 100 },
        ]} />
      )
      const points = container.querySelectorAll('.ui-geo-map__point')
      const r1 = parseFloat(points[0].getAttribute('r') || '0')
      const r2 = parseFloat(points[1].getAttribute('r') || '0')
      expect(r2).toBeGreaterThan(r1)
    })
  })

  // ─── Labels ───────────────────────────────────────────────────────────

  describe('labels', () => {
    it('shows labels when showLabels is true', () => {
      render(<GeoMap points={samplePoints} showLabels />)
      expect(screen.getByText('New York')).toBeInTheDocument()
      expect(screen.getByText('London')).toBeInTheDocument()
    })

    it('hides labels by default', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      expect(container.querySelector('.ui-geo-map__label')).not.toBeInTheDocument()
    })
  })

  // ─── Connections ──────────────────────────────────────────────────────

  describe('connections', () => {
    it('renders connection lines', () => {
      const { container } = render(
        <GeoMap points={samplePoints} connections={sampleConnections} />
      )
      const connections = container.querySelectorAll('.ui-geo-map__connection')
      expect(connections.length).toBe(2)
    })

    it('applies connection status', () => {
      const { container } = render(
        <GeoMap points={samplePoints} connections={sampleConnections} />
      )
      expect(container.querySelector('.ui-geo-map__connection[data-status="ok"]')).toBeInTheDocument()
      expect(container.querySelector('.ui-geo-map__connection[data-status="warning"]')).toBeInTheDocument()
    })

    it('does not render connections when not provided', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      expect(container.querySelector('.ui-geo-map__connection')).not.toBeInTheDocument()
    })
  })

  // ─── Interaction ──────────────────────────────────────────────────────

  describe('interaction', () => {
    it('calls onPointClick when point is clicked', () => {
      const onClick = vi.fn()
      const { container } = render(
        <GeoMap points={samplePoints} interactive onPointClick={onClick} />
      )
      const point = container.querySelector('.ui-geo-map__point')
      fireEvent.click(point!)
      expect(onClick).toHaveBeenCalledWith(samplePoints[0])
    })

    it('calls onPointHover on mouse enter', () => {
      const onHover = vi.fn()
      const { container } = render(
        <GeoMap points={samplePoints} interactive onPointHover={onHover} />
      )
      const point = container.querySelector('.ui-geo-map__point')
      fireEvent.mouseEnter(point!)
      expect(onHover).toHaveBeenCalledWith(samplePoints[0])
    })

    it('calls onPointHover with null on mouse leave', () => {
      const onHover = vi.fn()
      const { container } = render(
        <GeoMap points={samplePoints} interactive onPointHover={onHover} />
      )
      const point = container.querySelector('.ui-geo-map__point')
      fireEvent.mouseLeave(point!)
      expect(onHover).toHaveBeenCalledWith(null)
    })

    it('does not fire click when not interactive', () => {
      const onClick = vi.fn()
      const { container } = render(
        <GeoMap points={samplePoints} onPointClick={onClick} />
      )
      const point = container.querySelector('.ui-geo-map__point')
      fireEvent.click(point!)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<GeoMap points={samplePoints} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0', () => {
      const { container } = render(<GeoMap points={samplePoints} motion={0} />)
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Height ───────────────────────────────────────────────────────────

  describe('height', () => {
    it('applies numeric height', () => {
      const { container } = render(<GeoMap points={samplePoints} height={400} />)
      const map = container.querySelector('.ui-geo-map') as HTMLElement
      expect(map.style.height).toBe('400px')
    })

    it('applies string height', () => {
      const { container } = render(<GeoMap points={samplePoints} height="50vh" />)
      const map = container.querySelector('.ui-geo-map') as HTMLElement
      expect(map.style.height).toBe('50vh')
    })
  })

  // ─── HTML Attributes ──────────────────────────────────────────────────

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(
        <GeoMap points={samplePoints} className="custom" />
      )
      expect(container.querySelector('.ui-geo-map.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<GeoMap points={samplePoints} data-testid="map" />)
      expect(screen.getByTestId('map')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(GeoMap.displayName).toBe('GeoMap')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations with connections', async () => {
      const { container } = render(
        <GeoMap points={samplePoints} connections={sampleConnections} showLabels />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('SVG has role img', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('role')).toBe('img')
    })

    it('SVG has aria-label', () => {
      const { container } = render(<GeoMap points={samplePoints} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-label')).toBeTruthy()
    })
  })
})
