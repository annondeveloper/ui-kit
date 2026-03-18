import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimatedCounter } from '../components/animated-counter'

// Force reduced motion so animation completes instantly
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => true,
  }
})

describe('AnimatedCounter', () => {
  it('renders the target value', () => {
    render(<AnimatedCounter value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('formats value with custom formatter', () => {
    render(<AnimatedCounter value={1234} format={(n) => `$${Math.round(n).toLocaleString()}`} />)
    expect(screen.getByText('$1,234')).toBeInTheDocument()
  })
})
