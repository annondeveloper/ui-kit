import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Icon } from '../../../core/icons/icon'
import { iconPaths } from '../../../core/icons/paths'

describe('Icon', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.tagName).toBe('svg')
  })

  it('renders with default size md (20px)', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('20')
    expect(svg.getAttribute('height')).toBe('20')
  })

  it('renders with size sm (16px)', () => {
    const { container } = render(<Icon name="check" size="sm" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('renders with size lg (24px)', () => {
    const { container } = render(<Icon name="check" size="lg" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('24')
    expect(svg.getAttribute('height')).toBe('24')
  })

  it('renders with numeric size', () => {
    const { container } = render(<Icon name="check" size={32} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
  })

  it('has aria-hidden when no label', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
    expect(svg.getAttribute('role')).toBeNull()
    expect(svg.getAttribute('aria-label')).toBeNull()
  })

  it('has role="img" and aria-label when label provided', () => {
    const { container } = render(<Icon name="check" label="Success" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Success')
    expect(svg.getAttribute('aria-hidden')).toBeNull()
  })

  it('forwards ref to SVG element', () => {
    const ref = createRef<SVGSVGElement>()
    render(<Icon name="check" ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGSVGElement)
  })

  it('forwards className', () => {
    const { container } = render(<Icon name="check" className="my-icon" />)
    const svg = container.querySelector('svg')!
    expect(svg.classList.contains('my-icon')).toBe(true)
  })

  it('forwards additional SVG attributes', () => {
    const { container } = render(
      <Icon name="check" data-testid="icon" strokeWidth={3} />,
    )
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-testid')).toBe('icon')
    expect(svg.getAttribute('stroke-width')).toBe('3')
  })

  it('returns null for unknown icon name', () => {
    // @ts-expect-error — intentionally testing unknown name
    const { container } = render(<Icon name="nonexistent-icon" />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders correct path data for each icon', () => {
    const { container } = render(<Icon name="x" />)
    const paths = container.querySelectorAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].getAttribute('d')).toBe('M18 6L6 18')
    expect(paths[1].getAttribute('d')).toBe('M6 6l12 12')
  })

  it('sets correct SVG defaults', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(svg.getAttribute('fill')).toBe('none')
    expect(svg.getAttribute('stroke')).toBe('currentColor')
    expect(svg.getAttribute('stroke-width')).toBe('2')
    expect(svg.getAttribute('stroke-linecap')).toBe('round')
    expect(svg.getAttribute('stroke-linejoin')).toBe('round')
  })

  it('has path data for all 50 required icons', () => {
    const requiredIcons = [
      'chevron-down',
      'chevron-up',
      'chevron-left',
      'chevron-right',
      'check',
      'x',
      'plus',
      'minus',
      'search',
      'filter',
      'sort-asc',
      'sort-desc',
      'arrow-up',
      'arrow-down',
      'arrow-left',
      'arrow-right',
      'external-link',
      'copy',
      'clipboard-check',
      'eye',
      'eye-off',
      'calendar',
      'clock',
      'refresh',
      'loader',
      'alert-triangle',
      'alert-circle',
      'info',
      'check-circle',
      'x-circle',
      'trash',
      'edit',
      'settings',
      'menu',
      'more-horizontal',
      'more-vertical',
      'grip-vertical',
      'upload',
      'download',
      'file',
      'folder',
      'image',
      'link',
      'code',
      'terminal',
      'git-branch',
      'git-commit',
      'activity',
      'bar-chart',
      'zap',
    ]

    expect(requiredIcons).toHaveLength(50)

    for (const name of requiredIcons) {
      expect(iconPaths[name], `missing icon: ${name}`).toBeDefined()
      expect(
        iconPaths[name].length,
        `icon "${name}" has no paths`,
      ).toBeGreaterThan(0)
    }
  })

  it('renders each required icon without crashing', () => {
    const names = Object.keys(iconPaths)
    for (const name of names) {
      const { container } = render(<Icon name={name} />)
      const svg = container.querySelector('svg')
      expect(svg, `icon "${name}" did not render`).toBeInTheDocument()
      const paths = container.querySelectorAll('path')
      expect(
        paths.length,
        `icon "${name}" rendered no paths`,
      ).toBeGreaterThan(0)
    }
  })
})
