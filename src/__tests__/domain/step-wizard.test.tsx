import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { StepWizard, type Step } from '../../domain/step-wizard'

expect.extend(toHaveNoViolations)

const baseSteps: Step[] = [
  { id: 'info', label: 'Information' },
  { id: 'details', label: 'Details', description: 'Enter your details' },
  { id: 'confirm', label: 'Confirm' },
]

function renderWizard(props: Partial<React.ComponentProps<typeof StepWizard>> = {}) {
  return render(
    <StepWizard steps={baseSteps} {...props}>
      <div>Step 1 Content</div>
      <div>Step 2 Content</div>
      <div>Step 3 Content</div>
    </StepWizard>
  )
}

describe('StepWizard', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the component with scope class', () => {
      const { container } = renderWizard()
      expect(container.querySelector('.ui-step-wizard')).toBeInTheDocument()
    })

    it('renders step labels', () => {
      renderWizard()
      expect(screen.getByText('Information')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('renders step descriptions when provided', () => {
      renderWizard()
      expect(screen.getByText('Enter your details')).toBeInTheDocument()
    })

    it('renders step numbers', () => {
      renderWizard()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders first step content by default', () => {
      renderWizard()
      expect(screen.getByText('Step 1 Content')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
      const { container } = renderWizard({ className: 'custom-wizard' })
      expect(container.querySelector('.custom-wizard')).toBeInTheDocument()
    })

    it('renders icons when provided', () => {
      const stepsWithIcon: Step[] = [
        { id: 'a', label: 'A', icon: <span data-testid="step-icon">★</span> },
        { id: 'b', label: 'B' },
      ]
      render(
        <StepWizard steps={stepsWithIcon}>
          <div>Content A</div>
          <div>Content B</div>
        </StepWizard>
      )
      expect(screen.getByTestId('step-icon')).toBeInTheDocument()
    })
  })

  // ─── Step States ──────────────────────────────────────────────────

  describe('step states', () => {
    it('marks first step as active by default', () => {
      const { container } = renderWizard()
      const indicators = container.querySelectorAll('.ui-step-wizard__indicator')
      expect(indicators[0]).toHaveAttribute('data-state', 'active')
    })

    it('marks steps after active as upcoming', () => {
      const { container } = renderWizard()
      const indicators = container.querySelectorAll('.ui-step-wizard__indicator')
      expect(indicators[1]).toHaveAttribute('data-state', 'upcoming')
      expect(indicators[2]).toHaveAttribute('data-state', 'upcoming')
    })

    it('marks steps before active as completed', () => {
      const { container } = renderWizard({ defaultStep: 2 })
      const indicators = container.querySelectorAll('.ui-step-wizard__indicator')
      expect(indicators[0]).toHaveAttribute('data-state', 'completed')
      expect(indicators[1]).toHaveAttribute('data-state', 'completed')
      expect(indicators[2]).toHaveAttribute('data-state', 'active')
    })

    it('shows check mark for completed steps', () => {
      const { container } = renderWizard({ defaultStep: 1 })
      const completedIndicator = container.querySelector('[data-state="completed"]')
      expect(completedIndicator?.querySelector('svg')).toBeInTheDocument()
    })

    it('sets aria-current="step" on active step', () => {
      const { container } = renderWizard()
      const steps = container.querySelectorAll('.ui-step-wizard__step')
      expect(steps[0]).toHaveAttribute('aria-current', 'step')
      expect(steps[1]).not.toHaveAttribute('aria-current')
    })
  })

  // ─── Navigation ───────────────────────────────────────────────────

  describe('navigation', () => {
    it('renders defaultStep content', () => {
      renderWizard({ defaultStep: 1 })
      expect(screen.getByText('Step 2 Content')).toBeInTheDocument()
    })

    it('renders controlled activeStep content', () => {
      renderWizard({ activeStep: 2 })
      expect(screen.getByText('Step 3 Content')).toBeInTheDocument()
    })

    it('calls onChange when step changes via click on completed step', async () => {
      const onChange = vi.fn()
      renderWizard({ defaultStep: 2, onChange, allowSkip: true })
      // Click on first step (completed)
      const stepLabels = screen.getAllByText(/Information|Details|Confirm/)
      await userEvent.click(stepLabels[0])
      expect(onChange).toHaveBeenCalledWith(0)
    })

    it('prevents clicking ahead when allowSkip=false', async () => {
      const onChange = vi.fn()
      renderWizard({ defaultStep: 0, onChange })
      // Click on third step should not work
      await userEvent.click(screen.getByText('Confirm'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('allows clicking ahead when allowSkip=true', async () => {
      const onChange = vi.fn()
      renderWizard({ defaultStep: 0, onChange, allowSkip: true })
      await userEvent.click(screen.getByText('Confirm'))
      expect(onChange).toHaveBeenCalledWith(2)
    })
  })

  // ─── Validation Gates ─────────────────────────────────────────────

  describe('validation gates', () => {
    it('blocks advancing when validate returns false', async () => {
      const stepsWithValidation: Step[] = [
        { id: 'a', label: 'A', validate: () => false },
        { id: 'b', label: 'B' },
      ]
      function TestWizard() {
        const [step, setStep] = useState(0)
        return (
          <StepWizard steps={stepsWithValidation} activeStep={step} onChange={setStep}>
            <div>
              Content A
              <button onClick={() => setStep(1)}>Next</button>
            </div>
            <div>Content B</div>
          </StepWizard>
        )
      }
      render(<TestWizard />)
      expect(screen.getByText('Content A')).toBeInTheDocument()
    })

    it('allows advancing when validate returns true', async () => {
      const stepsWithValidation: Step[] = [
        { id: 'a', label: 'A', validate: () => true },
        { id: 'b', label: 'B' },
      ]
      function TestWizard() {
        const [step, setStep] = useState(0)
        return (
          <StepWizard steps={stepsWithValidation} activeStep={step} onChange={setStep} allowSkip>
            <div>Content A</div>
            <div>Content B</div>
          </StepWizard>
        )
      }
      render(<TestWizard />)
      await userEvent.click(screen.getByText('B'))
      expect(screen.getByText('Content B')).toBeInTheDocument()
    })

    it('supports async validation', async () => {
      const stepsWithAsyncValidation: Step[] = [
        { id: 'a', label: 'A', validate: async () => true },
        { id: 'b', label: 'B' },
      ]
      function TestWizard() {
        const [step, setStep] = useState(0)
        return (
          <StepWizard steps={stepsWithAsyncValidation} activeStep={step} onChange={setStep} allowSkip>
            <div>Content A</div>
            <div>Content B</div>
          </StepWizard>
        )
      }
      render(<TestWizard />)
      await userEvent.click(screen.getByText('B'))
      await waitFor(() => {
        expect(screen.getByText('Content B')).toBeInTheDocument()
      })
    })
  })

  // ─── Orientation ──────────────────────────────────────────────────

  describe('orientation', () => {
    it('renders horizontal by default', () => {
      const { container } = renderWizard()
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument()
    })

    it('renders vertical orientation', () => {
      const { container } = renderWizard({ orientation: 'vertical' })
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = renderWizard({ motion: 2 })
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })

    it('sets motion 0 for no animation', () => {
      const { container } = renderWizard({ motion: 0 })
      expect(container.querySelector('[data-motion="0"]')).toBeInTheDocument()
    })
  })

  // ─── Connecting Lines ─────────────────────────────────────────────

  describe('connecting lines', () => {
    it('renders connector lines between steps', () => {
      const { container } = renderWizard()
      const connectors = container.querySelectorAll('.ui-step-wizard__connector')
      // 3 steps = 2 connectors
      expect(connectors.length).toBe(2)
    })

    it('fills connector when step is completed', () => {
      const { container } = renderWizard({ defaultStep: 2 })
      const connectors = container.querySelectorAll('.ui-step-wizard__connector')
      expect(connectors[0]).toHaveAttribute('data-filled', 'true')
      expect(connectors[1]).toHaveAttribute('data-filled', 'true')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = renderWizard()
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('renders with role="list" for steps', () => {
      const { container } = renderWizard()
      expect(container.querySelector('[role="list"]')).toBeInTheDocument()
    })

    it('renders steps as role="listitem"', () => {
      const { container } = renderWizard()
      const items = container.querySelectorAll('[role="listitem"]')
      expect(items.length).toBe(3)
    })
  })
})
