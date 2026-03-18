import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge, createBadgeVariant, type BadgeColor } from '../components/badge'

describe('Badge', () => {
  it('renders with text and color', () => {
    render(<Badge color="green">Online</Badge>)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('createBadgeVariant creates a working component', () => {
    const SeverityBadge = createBadgeVariant({
      colorMap: { critical: 'red', warning: 'yellow', info: 'blue' },
      labelMap: { critical: 'Critical', warning: 'Warning', info: 'Info' },
    })
    render(<SeverityBadge value="critical" />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('all 10 colors render without error', () => {
    const colors: BadgeColor[] = [
      'brand', 'blue', 'green', 'yellow', 'red',
      'orange', 'purple', 'pink', 'teal', 'gray',
    ]
    for (const color of colors) {
      const { unmount } = render(<Badge color={color}>{color}</Badge>)
      expect(screen.getByText(color)).toBeInTheDocument()
      unmount()
    }
  })
})
