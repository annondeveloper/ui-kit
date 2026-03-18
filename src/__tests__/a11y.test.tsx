import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Search } from 'lucide-react'

import { Button } from '../components/button'
import { Badge } from '../components/badge'
import { Checkbox } from '../components/checkbox'
import { ToggleSwitch } from '../components/toggle-switch'
import { FormInput } from '../components/form-input'
import { EmptyState } from '../components/empty-state'

expect.extend(toHaveNoViolations)

// Mock framer-motion for components that use it
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: () => true,
  }
})

describe('Accessibility', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Submit</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge color="green">Online</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Checkbox has no a11y violations', async () => {
    const { container } = render(
      <Checkbox checked={false} onChange={() => {}} aria-label="Accept terms" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ToggleSwitch has no a11y violations', async () => {
    const { container } = render(
      <ToggleSwitch enabled={false} onChange={() => {}} label="Enable notifications" />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it.skip('FormInput has no a11y violations', async () => {
    const { container } = render(
      <FormInput label="Email" value="" onChange={() => {}} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('EmptyState has no a11y violations', async () => {
    const { container } = render(
      <EmptyState icon={Search} title="No results" description="Try something else." />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
