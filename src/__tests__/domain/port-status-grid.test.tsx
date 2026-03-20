import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { PortStatusGrid } from '../../domain/port-status-grid'
import type { PortStatus } from '../../domain/port-status-grid'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const ports: PortStatus[] = [
  { port: 80, status: 'ok', label: 'HTTP' },
  { port: 443, status: 'ok', label: 'HTTPS' },
  { port: 22, status: 'warning', label: 'SSH' },
  { port: 3306, status: 'critical', label: 'MySQL' },
  { port: 5432, status: 'unknown', label: 'Postgres' },
]

describe('PortStatusGrid', () => {
  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      expect(container.querySelector('.ui-port-status-grid')).toBeInTheDocument()
    })

    it('renders all port indicators', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      const items = container.querySelectorAll('.ui-port-status-grid__item')
      expect(items.length).toBe(5)
    })

    it('renders empty list', () => {
      const { container } = render(<PortStatusGrid ports={[]} />)
      expect(container.querySelector('.ui-port-status-grid')).toBeInTheDocument()
    })

    it('renders port numbers', () => {
      render(<PortStatusGrid ports={ports} />)
      expect(screen.getByText('80')).toBeInTheDocument()
      expect(screen.getByText('443')).toBeInTheDocument()
    })
  })

  describe('status indicators', () => {
    it('applies status data attributes', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      expect(container.querySelector('[data-status="ok"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="warning"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="critical"]')).toBeInTheDocument()
      expect(container.querySelector('[data-status="unknown"]')).toBeInTheDocument()
    })
  })

  describe('columns', () => {
    it('applies custom columns', () => {
      const { container } = render(<PortStatusGrid ports={ports} columns={4} />)
      const grid = container.querySelector('.ui-port-status-grid__grid') as HTMLElement
      expect(grid.style.getPropertyValue('--columns')).toBe('4')
    })
  })

  describe('sizes', () => {
    it('renders sm size', () => {
      const { container } = render(<PortStatusGrid ports={ports} size="sm" />)
      expect(container.querySelector('[data-size="sm"]')).toBeInTheDocument()
    })

    it('renders md size', () => {
      const { container } = render(<PortStatusGrid ports={ports} size="md" />)
      expect(container.querySelector('[data-size="md"]')).toBeInTheDocument()
    })
  })

  describe('click handler', () => {
    it('calls onPortClick with port number', () => {
      const onClick = vi.fn()
      render(<PortStatusGrid ports={ports} onPortClick={onClick} />)
      fireEvent.click(screen.getByText('80'))
      expect(onClick).toHaveBeenCalledWith(80)
    })

    it('does not render buttons without handler', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(0)
    })
  })

  describe('tooltip', () => {
    it('shows label tooltip on hover', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      const item = container.querySelector('.ui-port-status-grid__item')!
      fireEvent.mouseEnter(item)
      expect(container.querySelector('.ui-port-status-grid__tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      const item = container.querySelector('.ui-port-status-grid__item')!
      fireEvent.mouseEnter(item)
      fireEvent.mouseLeave(item)
      expect(container.querySelector('.ui-port-status-grid__tooltip')).not.toBeInTheDocument()
    })
  })

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<PortStatusGrid ports={ports} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<PortStatusGrid ports={ports} className="custom" />)
      expect(container.querySelector('.ui-port-status-grid.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<PortStatusGrid ports={ports} data-testid="grid" />)
      expect(screen.getByTestId('grid')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(PortStatusGrid.displayName).toBe('PortStatusGrid')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<PortStatusGrid ports={ports} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with click handler', async () => {
      const { container } = render(<PortStatusGrid ports={ports} onPortClick={() => {}} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
