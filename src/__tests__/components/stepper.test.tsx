import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Stepper } from '../../components/stepper'

expect.extend(toHaveNoViolations)

const sampleSteps = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'review', label: 'Review' },
]

describe('Stepper', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a navigation element', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders all step labels', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
    })

    it('renders with default orientation="horizontal"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('renders with orientation="vertical"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} orientation="vertical" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-orientation', 'vertical')
    })

    it('renders with default size="md"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} size="sm" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} size="lg" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Variant tests ─────────────────────────────────────────────────

  describe('variants', () => {
    it('renders with default variant="default"', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'default')
    })

    it('renders with variant="dots"', () => {
      render(<Stepper steps={sampleSteps} activeStep={1} variant="dots" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'dots')
    })

    it('renders with variant="progress"', () => {
      render(<Stepper steps={sampleSteps} activeStep={1} variant="progress" />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-variant', 'progress')
    })
  })

  // ─── Step status tests ────────────────────────────────────────────

  describe('step status', () => {
    it('marks steps before activeStep as completed', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={2} />)
      const steps = container.querySelectorAll('.ui-stepper__step')
      expect(steps[0]).toHaveAttribute('data-status', 'completed')
      expect(steps[1]).toHaveAttribute('data-status', 'completed')
    })

    it('marks activeStep as active', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />)
      const steps = container.querySelectorAll('.ui-stepper__step')
      expect(steps[1]).toHaveAttribute('data-status', 'active')
    })

    it('marks steps after activeStep as pending', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />)
      const steps = container.querySelectorAll('.ui-stepper__step')
      expect(steps[1]).toHaveAttribute('data-status', 'pending')
      expect(steps[2]).toHaveAttribute('data-status', 'pending')
    })

    it('sets aria-current="step" on active step', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />)
      const steps = container.querySelectorAll('.ui-stepper__step')
      expect(steps[1]).toHaveAttribute('aria-current', 'step')
      expect(steps[0]).not.toHaveAttribute('aria-current')
      expect(steps[2]).not.toHaveAttribute('aria-current')
    })

    it('renders checkmark icon for completed steps', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={2} />)
      const completedIndicators = container.querySelectorAll(
        '.ui-stepper__step[data-status="completed"] svg'
      )
      expect(completedIndicators.length).toBe(2)
    })

    it('renders step number for pending/active steps', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />)
      const activeIndicator = container.querySelector(
        '.ui-stepper__step[data-status="active"] .ui-stepper__indicator-content'
      )
      expect(activeIndicator?.textContent).toBe('1')
    })
  })

  // ─── Step features tests ──────────────────────────────────────────

  describe('step features', () => {
    it('renders description when provided', () => {
      const steps = [
        { id: 'a', label: 'Account', description: 'Enter your email' },
        { id: 'b', label: 'Done' },
      ]
      render(<Stepper steps={steps} activeStep={0} />)
      expect(screen.getByText('Enter your email')).toBeInTheDocument()
    })

    it('renders optional label when step is optional', () => {
      const steps = [
        { id: 'a', label: 'Account' },
        { id: 'b', label: 'Profile', optional: true },
        { id: 'c', label: 'Done' },
      ]
      render(<Stepper steps={steps} activeStep={0} />)
      expect(screen.getByText('Optional')).toBeInTheDocument()
    })

    it('renders custom icon instead of number', () => {
      const steps = [
        { id: 'a', label: 'Account', icon: <span data-testid="custom-icon">★</span> },
        { id: 'b', label: 'Done' },
      ]
      render(<Stepper steps={steps} activeStep={0} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders custom icon even when step is completed', () => {
      const steps = [
        { id: 'a', label: 'Account', icon: <span data-testid="custom-icon">★</span> },
        { id: 'b', label: 'Done' },
      ]
      render(<Stepper steps={steps} activeStep={1} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  // ─── Connector tests ──────────────────────────────────────────────

  describe('connectors', () => {
    it('renders connectors between steps but not after last', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />)
      const connectors = container.querySelectorAll('.ui-stepper__connector')
      expect(connectors.length).toBe(2) // 3 steps, 2 connectors
    })

    it('marks connectors as completed for completed steps', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={2} />)
      const connectors = container.querySelectorAll('.ui-stepper__connector')
      expect(connectors[0]).toHaveAttribute('data-completed', 'true')
      expect(connectors[1]).toHaveAttribute('data-completed', 'true')
    })

    it('does not mark connector as completed for active step', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />)
      const connectors = container.querySelectorAll('.ui-stepper__connector')
      expect(connectors[0]).toHaveAttribute('data-completed', 'true')
      expect(connectors[1]).not.toHaveAttribute('data-completed')
    })

    it('connectors are aria-hidden', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />)
      const connectors = container.querySelectorAll('.ui-stepper__connector')
      connectors.forEach(c => {
        expect(c).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  // ─── Click handling tests ─────────────────────────────────────────

  describe('click handling', () => {
    it('calls onStepClick when a step is clicked', () => {
      const onClick = vi.fn()
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={0} onStepClick={onClick} />
      )
      const steps = container.querySelectorAll('.ui-stepper__step')
      fireEvent.click(steps[1])
      expect(onClick).toHaveBeenCalledWith(1)
    })

    it('calls onStepClick on Enter key', () => {
      const onClick = vi.fn()
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={0} onStepClick={onClick} />
      )
      const steps = container.querySelectorAll('.ui-stepper__step')
      fireEvent.keyDown(steps[2], { key: 'Enter' })
      expect(onClick).toHaveBeenCalledWith(2)
    })

    it('calls onStepClick on Space key', () => {
      const onClick = vi.fn()
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={0} onStepClick={onClick} />
      )
      const steps = container.querySelectorAll('.ui-stepper__step')
      fireEvent.keyDown(steps[0], { key: ' ' })
      expect(onClick).toHaveBeenCalledWith(0)
    })

    it('makes steps clickable with tabIndex when onStepClick provided', () => {
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={0} onStepClick={() => {}} />
      )
      const steps = container.querySelectorAll('.ui-stepper__step')
      steps.forEach(step => {
        expect(step).toHaveAttribute('tabindex', '0')
        expect(step).toHaveAttribute('data-clickable', 'true')
        expect(step).toHaveAttribute('role', 'button')
      })
    })

    it('steps are not clickable when onStepClick is not provided', () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />)
      const steps = container.querySelectorAll('.ui-stepper__step')
      steps.forEach(step => {
        expect(step).not.toHaveAttribute('tabindex')
        expect(step).not.toHaveAttribute('data-clickable')
        expect(step).not.toHaveAttribute('role')
      })
    })
  })

  // ─── Ref & className forwarding ───────────────────────────────────

  describe('forwarding', () => {
    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Stepper ref={ref} steps={sampleSteps} activeStep={0} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} className="custom" />)
      const el = screen.getByRole('navigation')
      expect(el.className).toContain('ui-stepper')
      expect(el.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} data-testid="stp" id="s1" />)
      expect(screen.getByTestId('stp')).toHaveAttribute('id', 's1')
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} motion={2} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has aria-label on the navigation', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Progress steps')
    })

    it('has no axe violations (default)', async () => {
      const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (dots variant)', async () => {
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={1} variant="dots" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (vertical)', async () => {
      const { container } = render(
        <Stepper steps={sampleSteps} activeStep={0} orientation="vertical" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-stepper)', () => {
      render(<Stepper steps={sampleSteps} activeStep={0} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-stepper)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Stepper"', () => {
      expect(Stepper.displayName).toBe('Stepper')
    })
  })
})
