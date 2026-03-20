import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TimeRangeSelector } from '../../domain/time-range-selector'
import type { TimeRangePreset } from '../../domain/time-range-selector'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
})

const now = Date.now()
const presets: TimeRangePreset[] = [
  { label: '1h', value: '1h', range: [now - 3600000, now] },
  { label: '24h', value: '24h', range: [now - 86400000, now] },
  { label: '7d', value: '7d', range: [now - 604800000, now] },
  { label: '30d', value: '30d', range: [now - 2592000000, now] },
]

describe('TimeRangeSelector', () => {
  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<TimeRangeSelector presets={presets} />)
      expect(container.querySelector('.ui-time-range-selector')).toBeInTheDocument()
    })

    it('renders preset buttons', () => {
      render(<TimeRangeSelector presets={presets} />)
      expect(screen.getByText('1h')).toBeInTheDocument()
      expect(screen.getByText('24h')).toBeInTheDocument()
      expect(screen.getByText('7d')).toBeInTheDocument()
      expect(screen.getByText('30d')).toBeInTheDocument()
    })

    it('renders default presets when none provided', () => {
      render(<TimeRangeSelector />)
      expect(screen.getByText('1h')).toBeInTheDocument()
      expect(screen.getByText('24h')).toBeInTheDocument()
    })
  })

  describe('selection', () => {
    it('highlights active preset based on value', () => {
      const { container } = render(
        <TimeRangeSelector presets={presets} value={presets[1].range} />
      )
      const activeBtn = container.querySelector('[data-active="true"]')
      expect(activeBtn?.textContent).toBe('24h')
    })

    it('calls onChange when preset is clicked', () => {
      const onChange = vi.fn()
      render(<TimeRangeSelector presets={presets} onChange={onChange} />)
      fireEvent.click(screen.getByText('7d'))
      expect(onChange).toHaveBeenCalledWith(presets[2].range)
    })

    it('can select different presets', () => {
      const onChange = vi.fn()
      render(<TimeRangeSelector presets={presets} onChange={onChange} />)
      fireEvent.click(screen.getByText('1h'))
      expect(onChange).toHaveBeenCalledWith(presets[0].range)
      fireEvent.click(screen.getByText('30d'))
      expect(onChange).toHaveBeenCalledWith(presets[3].range)
    })
  })

  describe('custom range', () => {
    it('shows custom inputs when enabled', () => {
      const { container } = render(<TimeRangeSelector presets={presets} showCustom />)
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThanOrEqual(2)
    })

    it('hides custom inputs by default', () => {
      const { container } = render(<TimeRangeSelector presets={presets} />)
      const inputs = container.querySelectorAll('input[type="datetime-local"]')
      expect(inputs.length).toBe(0)
    })

    it('fires onChange on custom input change', () => {
      const onChange = vi.fn()
      const { container } = render(
        <TimeRangeSelector presets={presets} showCustom onChange={onChange} />
      )
      const inputs = container.querySelectorAll('input[type="datetime-local"]')
      fireEvent.change(inputs[0], { target: { value: '2026-03-20T00:00' } })
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('motion', () => {
    it('sets motion data attribute', () => {
      const { container } = render(<TimeRangeSelector presets={presets} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  describe('html attributes', () => {
    it('passes className', () => {
      const { container } = render(<TimeRangeSelector presets={presets} className="custom" />)
      expect(container.querySelector('.ui-time-range-selector.custom')).toBeInTheDocument()
    })

    it('passes data attributes', () => {
      render(<TimeRangeSelector presets={presets} data-testid="range" />)
      expect(screen.getByTestId('range')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(TimeRangeSelector.displayName).toBe('TimeRangeSelector')
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<TimeRangeSelector presets={presets} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no violations with custom inputs', async () => {
      const { container } = render(<TimeRangeSelector presets={presets} showCustom />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('preset buttons are accessible', () => {
      render(<TimeRangeSelector presets={presets} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(presets.length)
    })

    it('uses radio group semantics', () => {
      const { container } = render(<TimeRangeSelector presets={presets} />)
      expect(container.querySelector('[role="radiogroup"], [role="group"]')).toBeInTheDocument()
    })
  })
})
