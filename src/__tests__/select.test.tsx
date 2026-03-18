import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select } from '../components/select'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

describe('Select', () => {
  it('renders with placeholder', () => {
    render(<Select value="" onValueChange={() => {}} options={options} placeholder="Pick one" />)
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<Select value="a" onValueChange={() => {}} options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('renders selected value', () => {
    render(<Select value="a" onValueChange={() => {}} options={options} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })
})
