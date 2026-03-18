import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToggleSwitch } from '../components/toggle-switch'

describe('ToggleSwitch', () => {
  it('renders off state', () => {
    render(<ToggleSwitch enabled={false} onChange={() => {}} label="Toggle" />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ToggleSwitch enabled={false} onChange={onChange} label="Toggle" />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with new value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ToggleSwitch enabled={true} onChange={onChange} label="Toggle" />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})
