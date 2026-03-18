import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../components/checkbox'

describe('Checkbox', () => {
  it('renders unchecked', () => {
    render(<Checkbox checked={false} onChange={() => {}} />)
    const input = screen.getByRole('checkbox')
    expect(input).not.toBeChecked()
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox checked={false} onChange={onChange} />)
    await user.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
  })

  it('supports indeterminate', () => {
    const { container } = render(<Checkbox indeterminate />)
    // Indeterminate shows a Minus icon
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders disabled', () => {
    render(<Checkbox disabled checked={false} onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
