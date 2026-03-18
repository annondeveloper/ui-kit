import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormInput } from '../components/form-input'

describe('FormInput', () => {
  it('renders label and input', () => {
    render(<FormInput label="Email" value="" onChange={() => {}} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows hint text', () => {
    render(<FormInput label="Name" value="" onChange={() => {}} hint="Enter your full name" />)
    expect(screen.getByText('Enter your full name')).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    render(<FormInput label="Email" value="" onChange={() => {}} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FormInput label="Name" value="" onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })
})
