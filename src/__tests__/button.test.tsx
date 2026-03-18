import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Button } from '../components/button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders all 5 variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'outline', 'ghost'] as const
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>Btn</Button>)
      expect(screen.getByRole('button', { name: 'Btn' })).toBeInTheDocument()
      unmount()
    }
  })

  it('shows loading spinner when loading=true', () => {
    render(<Button loading>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    // Loader2 renders an svg with animate-spin class
    const svg = button.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.classList.toString()).toContain('animate-spin')
  })

  it('disables when disabled prop is set', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disables when loading prop is set', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('calls onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
